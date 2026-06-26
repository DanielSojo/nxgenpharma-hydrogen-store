import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Optional chips row rendered under the description (e.g. email, role). */
  meta?: ReactNode;
  /** Optional right-aligned slot (e.g. a search input or actions). */
  actions?: ReactNode;
}

/**
 * Shared catalog-style page header used across the app so every page leads with
 * the same dashboard-style banner: deep navy spotlight, eyebrow, icon, title,
 * and an optional description / meta chips / actions slot.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  meta,
  actions,
}: PageHeaderProps) {
  return (
    <div className="bg-catalog-hero relative mb-8 overflow-hidden rounded-3xl p-8 text-white ring-1 ring-brand-line sm:p-10">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-aqua/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-brand-blue/20 blur-3xl" />
      <div className="catalog-vignette pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-aqua backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-aqua" />
            {eyebrow}
          </span>
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="bg-brand-gradient flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-md shadow-brand-blue/25">
                <Icon size={24} />
              </span>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          </div>
          {description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">{description}</p>
          )}
          {meta && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/70">{meta}</div>
          )}
        </div>
        {actions && <div className="relative w-full lg:w-auto lg:max-w-sm">{actions}</div>}
      </div>
    </div>
  );
}
