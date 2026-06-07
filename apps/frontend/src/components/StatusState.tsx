'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'loading';

interface StatusStateProps {
  tone?: Tone;
  title: string;
  description?: string;
  children?: ReactNode;
}

const TONE_ICON = {
  neutral: Clock,
  success: CheckCircle2,
  warning: Clock,
  danger: AlertTriangle,
  loading: Loader2,
} as const;

const TONE_COLOR = {
  neutral: 'text-muted bg-surface-elevated',
  success: 'text-accent bg-accent/15',
  warning: 'text-amber-500 bg-amber-500/15',
  danger: 'text-danger bg-danger/10',
  loading: 'text-muted bg-surface-elevated',
} as const;

/**
 * Centered full-screen status layout used for loading, success, expired and
 * already-paid edge cases on the payment gateway.
 */
export function StatusState({
  tone = 'neutral',
  title,
  description,
  children,
}: StatusStateProps) {
  const Icon = TONE_ICON[tone];
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <span
        className={`mb-5 grid h-16 w-16 place-items-center rounded-full ${TONE_COLOR[tone]}`}
      >
        <Icon
          className={`h-8 w-8 ${tone === 'loading' ? 'animate-spin' : ''}`}
          aria-hidden
        />
      </span>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-muted">{description}</p>
      )}
      {children && <div className="mt-6 w-full max-w-xs">{children}</div>}
    </div>
  );
}

export default StatusState;
