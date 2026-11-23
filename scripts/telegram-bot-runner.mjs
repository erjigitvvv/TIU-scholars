import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env if not loaded
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'tiuscholarbot';

if (!BOT_TOKEN) {
  console.error('❌ Xatolik: TELEGRAM_BOT_TOKEN topilmadi.');
  process.exit(1);
}

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('sendMessage xatosi:', err.message);
  }
}

async function handleVerification(code, chatId, username, firstName) {
  const normalized = (code || '').trim().toUpperCase();
  const searchCode = normalized.startsWith('TIU-') ? normalized : `TIU-${normalized}`;

  const authCodeRecord = await prisma.telegramAuthCode.findFirst({
    where: {
      code: searchCode,
      expiresAt: { gt: new Date() },
    },
    include: {
      scholar: {
        include: {
          department: {
            include: { faculty: true },
          },
        },
      },
    },
  });

  if (!authCodeRecord || !authCodeRecord.scholar) {
    return {
      success: false,
      message: '❌ <b>Kiritilgan kod xato yoki uning 1 daqiqalik amal qilish muddati tugagan.</b>\n\n<i>Iltimos, saytdagi kabinetingizdan «Yangi kod olish» tugmasini bosing va yangi kodni yuboring.</i>',
    };
  }

  const scholar = authCodeRecord.scholar;

  // Profilni ulash
  await prisma.scholarProfile.update({
    where: { id: scholar.id },
    data: {
      telegramChatId: String(chatId),
      telegramUsername: username || null,
      isTelegramConnected: true,
      telegramConnectedAt: new Date(),
    },
  });

  // Kodni o'chirish
  await prisma.telegramAuthCode.delete({
    where: { id: authCodeRecord.id },
  }).catch(() => {});

  const degreePrefix =
    scholar.academicDegree === 'DSC'
      ? 'DSc, Prof.'
      : scholar.academicDegree === 'PHD'
      ? 'Dr. (PhD)'
      : scholar.academicTitle === 'DOCENT'
      ? 'Dotsent'
      : scholar.academicTitle === 'PROFESSOR'
      ? 'Professor'
      : 'Hurmatli';

  const welcomeText = `✅ <b>Assalomu alaykum, ${degreePrefix} ${scholar.fullName}!</b>\n🏛 ${scholar.department?.nameUz || 'TIU'} • ⭐ ${Math.round(scholar.tiuScore || 0)} ball\n\nProfilingiz muvaffaqiyatli bog‘landi! E’lonlar va bildirishnomalar shu yerga yuboriladi.`;

  return { success: true, message: welcomeText };
}

async function processUpdate(update) {
  if (!update || !update.message) return;
  const message = update.message;
  const chatId = message.chat?.id;
  const text = (message.text || '').trim();
  const from = message.from || {};
  const username = from.username || '';
  const firstName = from.first_name || 'Hurmatli foydalanuvchi';

  if (!chatId || !text) return;

  console.log(`[Bot Message] ChatID: ${chatId}, From: @${username || firstName}, Text: "${text}"`);

  // /start command
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    // Agar start parametri orqali kod yuborilgan bo'lsa: /start TIU-7492
    if (parts.length > 1 && parts[1]) {
      const codeParam = parts[1].trim();
      const res = await handleVerification(codeParam, chatId, username, firstName);
      await sendTelegramMessage(chatId, res.message);
      return;
    }

    const greeting = `Assalomu alaykum, <b>${firstName}</b>!\n🏛 <b>TIU Rasmiy Boti</b>\n\nProfilingizni bog‘lash uchun saytdagi 1 daqiqalik tasdiqlash kodini yuboring (masalan: <code>TIU-7492</code>).`;
    await sendTelegramMessage(chatId, greeting);
    return;
  }

  // Kod ko'rinishidagi xabar: TIU-XXXX yoki 4-6 xonali raqam/harf
  const codeMatch = text.match(/^(TIU-)?([A-Za-z0-9]{4,6})$/i);
  if (codeMatch) {
    const res = await handleVerification(text, chatId, username, firstName);
    await sendTelegramMessage(chatId, res.message);
    return;
  }

  // Boshqa har qanday xabar uchun yo'naltirish
  await sendTelegramMessage(
    chatId,
    `Hurmatli <b>${firstName}</b>! Profilingizni sayt bilan bog‘lash uchun 1 daqiqalik tasdiqlash kodini yuboring (masalan: <code>TIU-7492</code>).\n\nYordam uchun: /start`
  );
}

let offset = 0;
let isRunning = true;

async function pollUpdates() {
  console.log(`🤖 TIU Telegram Bot (@${BOT_USERNAME}) muvaffaqiyatli ishga tushdi!`);
  console.log('🔄 Telegram yangilanishlari (long-polling) kutilmoqda...');

  while (isRunning) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=20`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await processUpdate(update);
        }
      } else if (!data.ok) {
        console.warn('Telegram API ogohlantirish:', data.description);
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (err) {
      console.error('Polling xatosi:', err.message);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

process.on('SIGINT', async () => {
  isRunning = false;
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  isRunning = false;
  await prisma.$disconnect();
  process.exit(0);
});

pollUpdates();
