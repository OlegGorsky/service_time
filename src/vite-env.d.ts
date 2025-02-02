/// <reference types="vite/client" />

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      first_name: string;
      photo_url?: string;
    };
  };
  themeParams: {
    bg_color: string;
    secondary_bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  ready: () => void;
  setHeaderColor: (color: string) => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}