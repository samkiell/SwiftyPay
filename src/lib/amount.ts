/**
 * Amount parsing, validation and formatting helpers for the request form.
 *
 * Crypto amounts are kept as strings in the form (to preserve what the user
 * typed) and only converted to a number at submit time.
 */

import type { Coin } from '@/lib/api';

/** Sensible per-asset decimal precision and an upper sanity bound. */
export const COIN_PRECISION: Record<Coin, number> = {
  USDT: 2,
  BTC: 8,
  ETH: 6,
};

/** Hard upper limit per request — a sandbox sanity guard, not a business rule. */
export const MAX_AMOUNT = 1_000_000;

export interface AmountValidation {
  /** Numeric value, or null when blank/invalid. */
  value: number | null;
  /** True when the amount is a valid, positive, in-range number. */
  valid: boolean;
  /** Human-readable reason when invalid (null when valid or empty). */
  error: string | null;
}

/**
 * Sanitise raw keyboard input into a clean decimal string:
 * - strips anything that isn't a digit or dot
 * - collapses multiple dots to one
 * - clamps the fractional part to the coin's precision
 */
export function sanitizeAmount(raw: string, coin: Coin): string {
  let cleaned = raw.replace(/[^\d.]/g, '');

  // Keep only the first dot.
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, '');
  }

  // Clamp decimals to the coin's precision.
  const [intPart, fracPart] = cleaned.split('.');
  if (fracPart !== undefined) {
    cleaned = `${intPart}.${fracPart.slice(0, COIN_PRECISION[coin])}`;
  }

  return cleaned;
}

/** Validate a (sanitised) amount string. */
export function validateAmount(raw: string): AmountValidation {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '.') {
    return { value: null, valid: false, error: null };
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { value: null, valid: false, error: 'Enter a valid number.' };
  }
  if (value <= 0) {
    return { value, valid: false, error: 'Amount must be greater than zero.' };
  }
  if (value > MAX_AMOUNT) {
    return {
      value,
      valid: false,
      error: `Amount can't exceed ${MAX_AMOUNT.toLocaleString()}.`,
    };
  }

  return { value, valid: true, error: null };
}
