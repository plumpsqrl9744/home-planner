import type { ReactNode } from 'react';

type Tone = 'primary' | 'success' | 'danger' | 'neutral';

const TONE: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-500/10 text-success-600',
  danger: 'bg-danger-500/10 text-danger-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]}`}>
      {children}
    </span>
  );
}
