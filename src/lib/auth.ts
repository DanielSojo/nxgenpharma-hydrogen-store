import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginCustomer, getCustomer } from '@/lib/shopify';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function fetchCustomerMarkup(customerId: string): Promise<number> {
  try {
    const query = `
      query GetCustomerMarkup($id: ID!) {
        customer(id: $id) {
          metafield(namespace: "custom", key: "price_markup") {
            value
          }
        }
      }
    `;
    const hasAdminOAuth =
      process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

    let data: any;
    if (hasAdminOAuth) {
      const { shopifyAdminRequest } = await import('@/lib/shopify/admin');
      data = await shopifyAdminRequest<any>(query, { id: customerId });
    } else if (process.env.SHOPIFY_ADMIN_TOKEN) {
      const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2026-01';
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
          },
          body: JSON.stringify({ query, variables: { id: customerId } }),
        }
      );
      const json = await response.json();
      data = json.data;
    }
    const value = data?.customer?.metafield?.value;
    return value ? parseFloat(value) : 0;
  } catch {
    return 0;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Shopify',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const token = await loginCustomer(parsed.data.email, parsed.data.password);
          if (!token) return null;

          const customer = await getCustomer(token.accessToken);
          if (!customer) return null;

          // Fetch markup at login — stored in JWT, no repeated API calls while browsing
          const markup = await fetchCustomerMarkup(customer.id);
          console.log('[Auth] Login:', customer.email, '| markup:', markup, '| b2bStatus:', customer.b2bStatus);

          return {
            id: customer.id,
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            firstName: customer.firstName,
            lastName: customer.lastName,
            approved: customer.approved,
            b2bStatus: customer.b2bStatus,
            markup,
            accessToken: token.accessToken,
            expiresAt: token.expiresAt,
          };
        } catch (err) {
          console.error('[Auth] authorize error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.approved = (user as any).approved;
        token.b2bStatus = (user as any).b2bStatus;
        token.markup = (user as any).markup ?? 0;
        token.accessToken = (user as any).accessToken;
        token.expiresAt = (user as any).expiresAt;
        token.approvedCheckedAt = Date.now();
      }

      // Re-check approval + markup every 5 minutes
      const checkedAt = (token.approvedCheckedAt as number) ?? 0;
      if (token.accessToken && Date.now() - checkedAt > 5 * 60 * 1000) {
        try {
          const customer = await getCustomer(token.accessToken as string);
          if (customer) {
            token.approved = customer.approved;
            token.b2bStatus = customer.b2bStatus;
            token.approvedCheckedAt = Date.now();
          }
          if (token.id) {
            token.markup = await fetchCustomerMarkup(token.id as string);
          }
        } catch (err) {
          console.warn('[JWT] Could not refresh:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      (session.user as any).firstName = token.firstName;
      (session.user as any).lastName = token.lastName;
      (session.user as any).approved = token.approved;
      (session.user as any).markup = token.markup ?? 0;
      // accessToken for server-side API routes only
      (session.user as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
});