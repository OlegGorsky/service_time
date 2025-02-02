import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

export function useTelegramWebApp() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState<WebAppTheme | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 1000; // 1 second

    const initializeWebApp = () => {
      if (!window.Telegram?.WebApp) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeWebApp, retryInterval);
        } else {
          console.warn('Telegram WebApp is not available after retries');
          setIsInitialized(true); // Set initialized even if WebApp is not available
        }
        return;
      }

      try {
        const tgWebApp = window.Telegram.WebApp;
        setWebApp(tgWebApp);

        // Set header color to black
        tgWebApp.setHeaderColor('#000000');
        
        // Ensure WebApp is ready
        tgWebApp.ready();

        const { initDataUnsafe, themeParams } = tgWebApp;
        
        if (initDataUnsafe?.user) {
          const telegramUser = {
            ...initDataUnsafe.user,
            id: initDataUnsafe.user.id?.toString()
          };
          
          setUser(telegramUser);

          // Register or update user in Supabase
          if (telegramUser.id) {
            supabase
              .from('users')
              .upsert({
                telegram_id: telegramUser.id,
                username: telegramUser.username,
                first_name: telegramUser.first_name,
                photo_url: telegramUser.photo_url,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'telegram_id'
              })
              .then(({ error }) => {
                if (error) {
                  console.error('Error upserting user:', error);
                }
              });
          }
        }

        if (themeParams) {
          setTheme(themeParams);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setIsInitialized(true); // Set initialized even if there's an error
      }
    };

    initializeWebApp();

    return () => {
      retryCount = maxRetries; // Stop retrying on cleanup
    };
  }, []);

  return {
    user,
    theme,
    webApp,
    isInitialized,
    isAvailable: Boolean(window.Telegram?.WebApp)
  };
}