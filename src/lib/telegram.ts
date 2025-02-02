import { TELEGRAM_BOT_TOKEN, TELEGRAM_VERIFICATION_CHAT } from '../config/telegram';

interface SendVerificationRequestParams {
  userId: string;
  username?: string;
  firstName: string;
  photoUrl: string;
  verificationPhotoUrl: string;
}

// Helper function to encode userId to base64
function encodeStartappData(userId: string): string {
  try {
    const data = JSON.stringify({ action: 'verify', telegram_id: userId });
    return btoa(data);
  } catch (e) {
    return btoa(unescape(encodeURIComponent(JSON.stringify({ action: 'verify', telegram_id: userId }))));
  }
}

export async function sendVerificationRequest({
  userId,
  username,
  firstName,
  photoUrl,
  verificationPhotoUrl
}: SendVerificationRequestParams) {
  try {
    // Encode verification data
    const startappParam = encodeStartappData(userId);

    const message = `🆕 Новая заявка на верификацию\n\n` +
      `👤 Пользователь: ${firstName}\n` +
      `${username ? `📝 Username: @${username}\n` : ''}` +
      `🆔 ID: ${userId}\n\n` +
      `[Открыть страницу верификации](https://t.me/zayavka_st_bot/myapp?startapp=${startappParam})`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_VERIFICATION_CHAT,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending verification request:', error);
    throw error;
  }
}