'use client';

import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

/** Full-width primary CTA button, sized for thumb taps on mobile. */
export function Button({
  children,
  loading = false,
  variant = 'primary',
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-semibold select-none';
  const styles =
    variant === 'primary'
      ? 'sp-btn-primary'
      : 'bg-transparent text-foreground border border-border hover:bg-surface-elevated transition-colors';

  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export default Button;
