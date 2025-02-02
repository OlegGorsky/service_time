interface TelegramWebApp {
  ready: () => void;
  showConfirm: (message: string) => Promise<boolean>;
  showPopup: (params: PopupParams) => void;
  showAlert: (message: string) => Promise<void>;
  setHeaderColor: (color: string) => void;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
  };
  themeParams: WebAppTheme;
  platform: string;
  version: string;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  MainButton: MainButton;
  BackButton: BackButton;
  colorScheme: 'light' | 'dark';
  backgroundColor: string;
  headerColor: string;
  isClosingConfirmationEnabled: boolean;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
  sendData: (data: any) => void;
  expand: () => void;
  close: () => void;
}

interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

interface WebAppTheme {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
}

interface PopupParams {
  title?: string;
  message: string;
  buttons: PopupButton[];
}

interface PopupButton {
  id?: string;
  type: 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
  onClick?: () => void;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
}

interface BackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
