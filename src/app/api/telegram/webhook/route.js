import { NextResponse } from 'next/server';
import { verifyTelegramAuthCode, sendTelegramMessage } from '@/lib/telegram';

export async function POST(request) {
  try {
    const update = await request.json();

    if (!update || !update.message) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const chatId = message.chat?.id;
    const text = (message.text || '').trim();
    const from = message.from || {};
    const username = from.username || '';
    const firstName = from.first_name || '';

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    // Command: /start
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      // If started with deep link parameter: /start TIU-7492
      if (parts.length > 1 && parts[1]) {
        const directCode = parts[1].trim();
        const verifyRes = await verifyTelegramAuthCode({
          code: directCode,
          chatId,
          username,
          firstName,
        });

        if (verifyRes.success) {
          await sendTelegramMessage({
            chatId,
            text: verifyRes.welcomeMessage,
            parseMode: 'HTML',
          });
          return NextResponse.json({ ok: true });
        }
      }

      // Default start prompt asking for the code
      const greeting = `Assalomu alaykum, <b>${firstName || 'hurmatli olim'}</b>!\n🏛 <b>TIU Rasmiy Boti</b>\n\nProfilingizni bog‘lash uchun saytdagi 1 daqiqalik tasdiqlash kodini yuboring (masalan: <code>TIU-7492</code>).`;

      await sendTelegramMessage({
        chatId,
        text: greeting,
        parseMode: 'HTML',
      });

      return NextResponse.json({ ok: true });
    }

    // If message looks like a verification code (e.g., TIU-XXXX or XXXX)
    const codeMatch = text.match(/^(TIU-)?([A-Za-z0-9]{4,6})$/i);
    if (codeMatch) {
      const verifyRes = await verifyTelegramAuthCode({
        code: text,
        chatId,
        username,
        firstName,
      });

      if (verifyRes.success) {
        await sendTelegramMessage({
          chatId,
          text: verifyRes.welcomeMessage,
          parseMode: 'HTML',
        });
      } else {
        await sendTelegramMessage({
          chatId,
          text: `❌ <b>Kodni tekshirishda xatolik:</b>\n${verifyRes.message}\n\n<i>Iltimos, saytdagi kabinetingizdan yangi 1 daqiqalik kod oling va qayta yuboring.</i>`,
          parseMode: 'HTML',
        });
      }

      return NextResponse.json({ ok: true });
    }

    // Default response for other messages
    await sendTelegramMessage({
      chatId,
      text: `Salom, <b>${firstName}</b>! Saytdagi profilingizni ulash uchun 1 daqiqalik tasdiqlash kodini yuboring (masalan: <code>TIU-7492</code>).\n\nYordam uchun: /start`,
      parseMode: 'HTML',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
