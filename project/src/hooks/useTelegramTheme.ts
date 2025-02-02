import { useEffect } from 'react';
import { logger } from '../lib/logger';

export function useTelegramTheme() {
  useEffect(() => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (webApp) {
        // Set header color to #0f0f0f
        webApp.setHeaderColor('#0f0f0f');
        logger.info('Telegram WebApp header color set to #0f0f0f');
      }
    } catch (error) {
      logger.error('Failed to set Telegram WebApp header color:', error);
    }
  }, []);
}
