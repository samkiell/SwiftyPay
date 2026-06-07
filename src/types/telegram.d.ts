/**
 * Global type declarations for the Telegram Web App SDK.
 *
 * The SDK is injected at runtime via the script tag in the root layout
 * (https://telegram.org/js/telegram-web-app.js), which attaches the
 * `window.Telegram.WebApp` object. These declarations let us read it in a
 * fully type-safe way without `any`.
 *
 * @see https://core.telegram.org/bots/webapps
 */

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotificationType = 'error' | 'success' | 'warning';

interface TelegramHapticFeedback {
  impactOccurred: (style: HapticImpactStyle) => void;
  notificationOccurred: (type: HapticNotificationType) => void;
  selectionChanged: () => void;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramWebAppUser;
    auth_date?: string;
    hash?: string;
  };
  colorScheme?: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  HapticFeedback?: TelegramHapticFeedback;
  openTelegramLink?: (url: string) => void;
  sendData: (data: string) => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
