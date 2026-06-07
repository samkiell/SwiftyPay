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
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  sendData: (data: string) => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
