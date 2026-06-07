'use client';

import { useCallback, useEffect, useState } from 'react';

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
  /** Fire a light selection/impact haptic (no-op outside Telegram). */
  haptic: (
    type?: 'selection' | HapticImpactStyle,
    notification?: HapticNotificationType,
  ) => void;
  /** Open a Telegram link natively when possible, else fall back to the browser. */
  openLink: (url: string) => void;
}

/**
 * Safely access the Telegram WebApp context.
 *
 * - Guards every lookup behind `typeof window !== 'undefined'` so it is SSR-safe.
 * - Calls `WebApp.ready()` and `WebApp.expand()` once on mount.
 * - Surfaces the most commonly needed values (user, username, userId, initData,
 *   themeParams) as flat, ready-to-use variables, plus `haptic` and `openLink`.
 */
export function useTelegram(): UseTelegramResult {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // One-time read from the Telegram SDK — an external system that only exists
    // in the browser after the WebApp script has loaded. Syncing it into state
    // on mount is the intended "subscribe to external system" pattern, so the
    // synchronous setState here is deliberate.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof window === 'undefined') return; // SSR guard

    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Tell Telegram the Mini App is initialised, then take the full viewport.
      tg.ready();
      tg.expand();
      setWebApp(tg);

      // Sync the document color scheme to the Telegram client so the page
      // matches the user's chosen light/dark theme inside the app.
      if (tg.colorScheme) {
        document.documentElement.style.colorScheme = tg.colorScheme;
      }
    }

    setIsReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const haptic = useCallback<UseTelegramResult['haptic']>(
    (type = 'selection', notification) => {
      const hf = webApp?.HapticFeedback;
      if (!hf) return;
      try {
        if (notification) hf.notificationOccurred(notification);
        else if (type === 'selection') hf.selectionChanged();
        else hf.impactOccurred(type);
      } catch {
        // Older clients may not implement every haptic method — ignore.
      }
    },
    [webApp],
  );

  const openLink = useCallback<UseTelegramResult['openLink']>(
    (url) => {
      if (typeof window === 'undefined') return;
      if (webApp?.openTelegramLink) webApp.openTelegramLink(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    },
    [webApp],
  );

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
    haptic,
    openLink,
  };
}

export default useTelegram;
