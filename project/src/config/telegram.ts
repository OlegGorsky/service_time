// Use Vite's import.meta.env instead of process.env
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '7109098528:AAGw801Y_3XhfNaauQf3BfLqvO0r5axnoyo';
const TELEGRAM_VERIFICATION_CHAT = '@verificate_servicetime';

export { TELEGRAM_BOT_TOKEN, TELEGRAM_VERIFICATION_CHAT };