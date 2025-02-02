declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready: () => void;
  showConfirm: (message: string) => Promise<boolean>;
  showPopup: (params: PopupParams) => void;
  setHeaderColor: (color: string) => void;
  initDataUnsafe: {
    user?: TelegramUser;
  };
  themeParams: WebAppTheme;
}

interface TelegramUser {
  id?: string;
  first_name: string;
  username?: string;
  photo_url?: string;
}

interface WebAppTheme {
  bg_color: string;
  secondary_bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
}

interface PopupParams {
  title?: string;
  message: string;
  buttons: Array<{
    type: 'close' | 'ok' | 'cancel' | 'destructive';
    text?: string;
    id?: string;
  }>;
}

export {};
