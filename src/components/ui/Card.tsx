import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function Card({ title, children, className = '', actions }: CardProps) {
  return (
    <section className={`rounded-card bg-white shadow-card border border-neutral-100 ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
          {title && <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
