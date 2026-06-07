'use client';

import { useEffect, useState } from 'react';

/**
 * Shape returned by {@link useTelegram}. All fields are nullable because the
 * Telegram WebApp context only exists when the page is opened *inside*
 * Telegram. Opening the link in a normal browser leaves everything null,
 * which the UI handles gracefully (e.g. dev preview).
 */
export interface UseTelegramResult {
  /** The live WebApp instance, or null when not running inside Telegram. */
  webApp: TelegramWebApp | null;
  /** The authenticated Telegram user, if available. */
  user: TelegramWebAppUser | null;
  /** Convenience accessor for `user.username`. */
  username: string | null;
  /** Convenience accessor for `user.id` (Telegram user id). */
  userId: number | null;
  /** Raw, signed initData string — sent to the backend for verification. */
  initData: string;
  /** Telegram theme palette (used to tint the UI to match the client). */
  themeParams: TelegramWebApp['themeParams'] | null;
  /** True once we've confirmed we're running inside the Telegram client. */
  isTelegram: boolean;
  /** True once the SDK has been initialised on the client (post-mount). */
  isReady: boolean;
}

/**
 * Safely access the Telegram WebApp context.
 *
 * - Guards every lookup behind `typeof window !== 'undefined'` so it is SSR-safe.
 * - Calls `WebApp.ready()` and `WebApp.expand()` once on mount.
 * - Surfaces the most commonly needed values (user, username, userId, initData,
 *   themeParams) as flat, ready-to-use variables.
 */
export function useTelegram(): UseTelegramResult {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // SSR guard — `window` only exists in the browser.
    if (typeof window === 'undefined') return;

    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Tell Telegram the Mini App is initialised, then take the full viewport.
      tg.ready();
      tg.expand();
      setWebApp(tg);
    }

    setIsReady(true);
  }, []);

  const user = webApp?.initDataUnsafe?.user ?? null;

  return {
    webApp,
    user,
    username: user?.username ?? null,
    userId: user?.id ?? null,
    initData: webApp?.initData ?? '',
    themeParams: webApp?.themeParams ?? null,
    isTelegram: webApp !== null,
    isReady,
  };
}

export default useTelegram;
