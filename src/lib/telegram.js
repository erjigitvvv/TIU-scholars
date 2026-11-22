import { prisma } from '@/lib/prisma';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'TIUScholarsBot';

/**
 * 1 daqiqalik harf-raqamli tasdiqlash kodini yaratish
 * Format: TIU-XXXX (masalan: TIU-7492)
 */
export async function generateTelegramAuthCode(scholarId) {
  if (!scholarId) throw new Error('scholarId talab qilinadi');

  // Eski eskirgan kodlarni tozalash
  await prisma.telegramAuthCode.deleteMany({
    where: { scholarId },
  }).catch(() => {});

  // 4 xonali noyob raqamli yoki harf-raqamli qism
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `TIU-${randomNum}`;
  const expiresAt = new Date(Date.now() + 60 * 1000); // Aynan 1 daqiqa

  const authCode = await prisma.telegramAuthCode.create({
    data: {
      scholarId,
      code,
      expiresAt,
    },
  });

  return {
    code: authCode.code,
    expiresAt: authCode.expiresAt,
    expiresInSeconds: 60,
    botUsername: BOT_USERNAME,
    botLink: `https://t.me/${BOT_USERNAME}`,
  };
}

/**
 * Telegram botdan kelgan kodni tekshirish va profilga ulash
 */
export async function verifyTelegramAuthCode({ code, chatId, username, firstName }) {
  if (!code || !chatId) {
    return { success: false, message: 'Kod va Chat ID talab qilinadi.' };
  }

  // Tozalash va formatlash (katta-kichik harfga sezgirlikni yo'qotish)
  const normalized = code.trim().toUpperCase();
  const searchCode = normalized.startsWith('TIU-') ? normalized : `TIU-${normalized}`;

  const authCodeRecord = await prisma.telegramAuthCode.findFirst({
    where: {
      code: searchCode,
      expiresAt: { gt: new Date() }, // 1 daqiqadan o'tmagan bo'lishi shart
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
      reason: 'INVALID_OR_EXPIRED',
      message: 'Kiritilgan kod xato yoki uning 1 daqiqalik amal qilish muddati tugagan.',
    };
  }

  const scholar = authCodeRecord.scholar;

  // Olim profilini Telegram Chat ID bilan yangilash
  await prisma.scholarProfile.update({
    where: { id: scholar.id },
    data: {
      telegramChatId: String(chatId),
      telegramUsername: username || null,
      isTelegramConnected: true,
      telegramConnectedAt: new Date(),
    },
  });

  // Bir martalik kodni o'chirish
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

  return {
    success: true,
    scholar: {
      id: scholar.id,
      fullName: scholar.fullName,
      degreePrefix,
      academicDegree: scholar.academicDegree,
      academicTitle: scholar.academicTitle,
      departmentName: scholar.department?.nameUz || 'TIU',
      facultyName: scholar.department?.faculty?.nameUz || 'TIU',
      tiuScore: scholar.tiuScore || 0,
    },
    welcomeMessage: `✅ Assalomu alaykum, ${degreePrefix} ${scholar.fullName}!\n\n🏛 Kafedra: ${scholar.department?.nameUz || 'TIU'}\n⭐ TIU Reyting Balli: ${Math.round(scholar.tiuScore || 0)}\n\nSizning TIU Scholars profilingiz muvaffaqiyatli ulandi! Endi barcha yangi ilmiy e’lonlar, grantlar va shogirdlaringiz harakatlari to‘g‘ridan-to‘g‘ri shu yerga yuboriladi.`,
  };
}

/**
 * Telegram Bot API orqali xabar yuborish
 */
export async function sendTelegramMessage({ chatId, text, parseMode = 'HTML', replyMarkup = null }) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN belgilanmagan. Xabar faqat konsolga chiqdi:', { chatId, text });
    return null;
  }

  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error('sendTelegramMessage error:', error);
    return null;
  }
}

/**
 * Yangi e'lonni Telegramga ulangan barcha olimlarga tarqatish (Broadcast)
 */
export async function broadcastAnnouncementToTelegram(announcement) {
  try {
    const connectedScholars = await prisma.scholarProfile.findMany({
      where: {
        isTelegramConnected: true,
        telegramChatId: { not: null },
      },
      select: { telegramChatId: true, fullName: true },
    });

    if (connectedScholars.length === 0) return 0;

    const categoryEmoji =
      announcement.category === 'GRANT'
        ? '💰 ILMIY GRANT'
        : announcement.category === 'CONFERENCE'
        ? '🎓 ILMIY ANJUMAN'
        : announcement.category === 'DEADLINE'
        ? '⏳ MUHIM MUDDAT'
        : '📢 YANGI E‘LON';

    const text = `<b>${categoryEmoji}</b>\n\n<b>${announcement.title}</b>\n\n${announcement.content ? announcement.content.slice(0, 300) + '...' : ''}\n\n🏛 <i>Tashkent International University</i>`;

    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "Batafsil saytda ko'rish 👉",
            url: `${siteUrl}/dashboard/announcements`,
          },
        ],
      ],
    };

    let sentCount = 0;
    for (const s of connectedScholars) {
      if (s.telegramChatId) {
        await sendTelegramMessage({
          chatId: s.telegramChatId,
          text,
          replyMarkup,
        });
        sentCount++;
      }
    }

    return sentCount;
  } catch (error) {
    console.error('broadcastAnnouncementToTelegram error:', error);
    return 0;
  }
}
