/**
 * Typed API client for the SwiftyPay backend.
 *
 * Contracts mirror DOCUMENTATION.md §2 (API Contract & Payload Models).
 * Every transaction-creating call injects the verified raw Telegram context
 * via the `X-Telegram-Init-Data` header (DOCUMENTATION.md §4).
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/** Deep-link target for the host bot (DOCUMENTATION.md §4). */
export const BOT_USERNAME = 'Swiftyex_bot';

export type Coin = 'USDT' | 'BTC' | 'ETH';
export type LinkStatus = 'pending' | 'paid' | 'expired';

/** POST /api/links/create — request body. */
export interface CreateLinkRequest {
  amount: number;
  coin: Coin;
  note?: string;
  telegramUserId: string;
  telegramUsername: string;
}

/** POST /api/links/create — 201 response. */
export interface CreateLinkResponse {
  linkId: string;
  url: string;
  expiresAt: string;
}

/** GET /api/links/:id — 200 response. */
export interface LinkMetadata {
  amount: number;
  coin: Coin;
  note: string;
  requesterUsername: string;
  status: LinkStatus;
}

/** GET /api/suggest-coin — 200 response. */
export interface CoinSuggestion {
  suggestion: Coin;
  reason: string;
}

/** Build the Telegram deep link that routes a payer back into the bot. */
export function buildDeepLink(linkId: string): string {
  return `https://t.me/${BOT_USERNAME}?start=pay_${linkId}`;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}${body ? `: ${body}` : ''}`);
  }
  return (await res.json()) as T;
}

/**
 * POST /api/links/create — generate a shareable payment link.
 * Injects the signed Telegram initData header for backend verification.
 */
export async function createLink(
  payload: CreateLinkRequest,
  initData: string,
): Promise<CreateLinkResponse> {
  const res = await fetch(`${API_BASE_URL}/api/links/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
    },
    body: JSON.stringify(payload),
  });
  return handle<CreateLinkResponse>(res);
}

/** GET /api/links/:id — fetch link metadata for the gateway screen. */
export async function getLink(id: string): Promise<LinkMetadata> {
  const res = await fetch(`${API_BASE_URL}/api/links/${id}`, { cache: 'no-store' });
  return handle<LinkMetadata>(res);
}

/** POST /api/links/:id/pay — settle a payment's state. */
export async function payLink(
  id: string,
  initData: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/links/${id}/pay`, {
    method: 'POST',
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return handle<{ success: boolean }>(res);
}

/** GET /api/suggest-coin — AI smart asset recommendation. */
export async function suggestCoin(): Promise<CoinSuggestion> {
  const res = await fetch(`${API_BASE_URL}/api/suggest-coin`, { cache: 'no-store' });
  return handle<CoinSuggestion>(res);
}
