# Implementación: Volume Pricing (precios por cantidad) — Shopify + Next.js headless

## Contexto

- Tengo una tienda Shopify y un frontend **Next.js** externo que usa la **Storefront API**.
- Al pagar, Next redirige al **checkout de Shopify** usando `cart.checkoutUrl`.
- Necesito precios por cantidad **por producto**, iguales para todos los clientes (sin B2B, sin company ID, sin buyer identity).

Ejemplo de niveles:

| Cantidad | Precio unitario |
|----------|-----------------|
| 1 – 10   | $100            |
| 11 – 20  | $90             |
| 21+      | $70             |

## Principio clave

**El precio final lo calcula Shopify, no Next.** El descuento se aplica con una **Shopify Function** (Discount Function API, target `cart.lines.discounts.generate.run`) activada como descuento automático. Next solo:

1. Muestra la tabla de niveles (leída de un metafield).
2. Muestra los totales que devuelve el carrito de la Storefront API.

Nunca calcular el total final en Next ni confiar en precios calculados en el cliente.

## Convenciones

- Todos los nombres de código, archivos, variables, tipos y metafields en **inglés**.
- Comentarios y documentación pueden estar en español.
- Metafield: `custom.volume_pricing` (tipo JSON).
- Nombre de la extensión: `volume-pricing`.
- Título del descuento: `Volume pricing`.

## Formato del metafield `custom.volume_pricing`

```json
[{"min":1,"price":100},{"min":11,"price":90},{"min":21,"price":70}]
```

- `min`: cantidad mínima para alcanzar el nivel.
- `price`: precio unitario en ese nivel.
- El precio normal de la variante en Shopify debe ser igual al del primer nivel.
- Si un producto no tiene el metafield, no se aplica ningún descuento.

---

## Pasos manuales (los hago yo en Shopify Admin)

1. **Verificar el plan:** las custom apps con Shopify Functions históricamente requieren **Shopify Plus**. Si la tienda no es Plus, se omite la parte de la Function y se usa una app pública de volume discount basada en Functions. La parte de Next se mantiene igual.
2. En **Configuración → Datos personalizados → Productos**, crear el metafield definition `custom.volume_pricing`, de tipo JSON, con **acceso Storefront API activado**.
3. Llenar el metafield en los productos que tengan precio por volumen.

---

## Tarea A — Shopify Function (app de Shopify)

> Si la app no existe aún, indícame los comandos para crearla; no los ejecutes sin confirmar.

```bash
npm init @shopify/app@latest
cd <app-folder>
shopify app generate extension --template discount   # JavaScript, nombre: volume-pricing
```

### A1. Input query

Archivo: `extensions/volume-pricing/src/cart_lines_discounts_generate_run.graphql`

```graphql
query CartInput {
  cart {
    lines {
      id
      quantity
      cost { amountPerQuantity { amount } }
      merchandise {
        __typename
        ... on ProductVariant {
          product {
            volumePricing: metafield(namespace: "custom", key: "volume_pricing") { jsonValue }
          }
        }
      }
    }
  }
  discount { discountClasses }
}
```

Después de editarlo: `shopify app function typegen`.

### A2. Lógica

Archivo: `extensions/volume-pricing/src/cart_lines_discounts_generate_run.js`

```js
import { DiscountClass, ProductDiscountSelectionStrategy } from "../generated/api";

export function cartLinesDiscountsGenerateRun(input) {
  if (!input.discount.discountClasses.includes(DiscountClass.Product)) {
    return { operations: [] };
  }

  const candidates = [];

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;

    const tiers = line.merchandise.product.volumePricing?.jsonValue;
    if (!Array.isArray(tiers)) continue;

    // nivel más alto que alcanza la cantidad
    const tier = [...tiers]
      .sort((a, b) => b.min - a.min)
      .find((t) => line.quantity >= t.min);
    if (!tier) continue;

    const basePrice = parseFloat(line.cost.amountPerQuantity.amount);
    const discountAmount = basePrice - tier.price;
    if (discountAmount <= 0) continue;

    candidates.push({
      message: `Volume price: $${tier.price} each`,
      targets: [{ cartLine: { id: line.id } }],
      value: {
        fixedAmount: { amount: discountAmount.toFixed(2), appliesToEachItem: true },
      },
    });
  }

  if (!candidates.length) return { operations: [] };

  return {
    operations: [{
      productDiscountsAdd: {
        candidates,
        selectionStrategy: ProductDiscountSelectionStrategy.All,
      },
    }],
  };
}
```

Requisitos:

- Validar el JSON del metafield de forma defensiva: ignorar niveles inválidos y no lanzar errores.
- La cantidad se cuenta **por línea (variante)**. Deja preparada, comentada o detrás de un flag, la opción de agrupar por producto (sumar todas las variantes del mismo producto).
- Agregar tests con los fixtures de la Function: cantidad 1, 10, 11, 20, 21, 50, producto sin metafield y metafield inválido.

### A3. Activar el descuento automático

Correr en el GraphiQL de `shopify app dev`. Primero obtén el ID de la Function:

```graphql
query { shopifyFunctions(first: 25) { nodes { id title apiType } } }
```

Luego crea el descuento:

```graphql
mutation {
  discountAutomaticAppCreate(automaticAppDiscount: {
    title: "Volume pricing"
    functionId: "YOUR_FUNCTION_ID"
    discountClasses: [PRODUCT]
    startsAt: "2026-10-23T00:00:00Z"
  }) {
    automaticAppDiscount { discountId }
    userErrors { field message }
  }
}
```

---

## Tarea B — Next.js (este repo)

Antes de escribir código, revisa cómo está organizado el proyecto: cliente de Storefront API, queries existentes, página de producto y lógica del carrito. Sigue esas convenciones; no crees un cliente nuevo si ya existe uno.

### B1. Leer el metafield en la query de producto

Agrega a la query de producto existente:

```graphql
volumePricing: metafield(namespace: "custom", key: "volume_pricing") { value }
```

### B2. Utilidades tipadas

Crear, por ejemplo, `lib/volume-pricing.ts`:

```ts
export type VolumeTier = { min: number; price: number };

export function parseVolumeTiers(value?: string | null): VolumeTier[] {
  if (!value) return [];
  try {
    const data = JSON.parse(value);
    if (!Array.isArray(data)) return [];
    return data
      .filter((t) => typeof t?.min === "number" && typeof t?.price === "number")
      .sort((a, b) => a.min - b.min);
  } catch {
    return [];
  }
}

export function getTierPrice(quantity: number, tiers: VolumeTier[]): number | undefined {
  return [...tiers].reverse().find((t) => quantity >= t.min)?.price;
}
```

### B3. UI en la página de producto

- Componente `VolumePricingTable`: muestra los rangos (`1–10`, `11–20`, `21+`) y su precio. Calcula el máximo de cada rango a partir del `min` del siguiente nivel.
- Resalta el nivel activo según la cantidad seleccionada.
- Muestra un precio unitario estimado y un subtotal estimado, etiquetados como **estimados**.
- Si no hay niveles, no se renderiza nada.

### B4. Carrito con totales reales

- Después de cada `cartLinesAdd`, `cartLinesUpdate` y `cartLinesRemove`, usa los costos que devuelve Shopify. Asegúrate de que la query o fragment del carrito incluya:

```graphql
lines(first: 50) {
  nodes {
    quantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    discountAllocations { discountedAmount { amount currencyCode } }
  }
}
cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
checkoutUrl
```

- En cada línea con descuento: `subtotalAmount` tachado y `totalAmount` como precio final.
- El total del carrito sale de `cart.cost.totalAmount`, **nunca** de un cálculo local.
- El botón de pagar sigue usando `checkoutUrl`.

---

## Criterios de aceptación

- [ ] Con 1–10 unidades, el checkout cobra $100 c/u.
- [ ] Con 11–20 unidades, el checkout cobra $90 c/u.
- [ ] Con 21 o más unidades, el checkout cobra $70 c/u.
- [ ] Un producto sin metafield no recibe descuento.
- [ ] Un metafield inválido no rompe la Function ni la página de producto.
- [ ] El total que muestra Next en el carrito coincide exactamente con el del checkout de Shopify.
- [ ] Todos los nombres de código están en inglés y el código está tipado (TypeScript en Next).

## Fuera de alcance

- Precios diferentes por cliente o empresa (B2B).
- Visibilidad de productos según el tipo de cliente; eso será una tarea aparte.