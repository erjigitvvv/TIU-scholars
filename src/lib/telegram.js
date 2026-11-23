import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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
    welcomeMessage: `✅ <b>Assalomu alaykum, ${degreePrefix} ${scholar.fullName}!</b>\n🏛 ${scholar.department?.nameUz || 'TIU'} • ⭐ ${Math.round(scholar.tiuScore || 0)} ball\n\nProfilingiz muvaffaqiyatli bog‘landi! E’lonlar va bildirishnomalar shu yerga keladi.`,
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

    const compactContent = announcement.content
      ? announcement.content.replace(/<[^>]+>/g, '').slice(0, 150).trim() + (announcement.content.length > 150 ? '...' : '')
      : '';

    const text = `<b>${categoryEmoji}</b>\n<b>${announcement.title}</b>\n${compactContent ? `\n${compactContent}` : ''}`;

    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "👁 Platformada ko‘rish",
            url: `${siteUrl}/dashboard/announcements`,
          },
        ],
        [
          {
            text: "💬 Savol / Izoh yuborish",
            callback_data: `ann_ask:${announcement.id}`,
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

    // In-app Notifications to all active users
    const allUsers = await prisma.user.findMany({
      where: { accountStatus: 'ACTIVE' },
      select: { id: true },
    });

    for (const u of allUsers) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          title: `📢 Yangi eʼlon: ${announcement.title}`,
          message: compactContent || announcement.title,
          type: 'ANNOUNCEMENT',
          link: '/dashboard/announcements',
        },
      }).catch(() => {});
    }

    return sentCount;
  } catch (error) {
    console.error('broadcastAnnouncementToTelegram error:', error);
    return 0;
  }
}

/**
 * Hammualliflikka taklif xabarini Telegram bot orqali interaktiv tugmalar bilan yuborish
 */
export async function sendCollaborationInviteTelegram({
  recipientChatId,
  senderName,
  projectTitle,
  projectType,
  role,
  creditRoles,
  sharePercent,
  inviteToken,
}) {
  const typeLabels = {
    ARTICLE: 'Ilmiy maqola',
    THESIS: 'Konferensiya tezisi',
    DISSERTATION: 'Dissertatsiya',
    AUTOREFERAT: 'Avtoreferat',
    MONOGRAPH: 'Monografiya',
    GRANT: 'Grant arizasi',
  };

  const typeLabel = typeLabels[projectType] || 'Ilmiy loyiha';

  const text = `🤝 <b>Yangi Hammualliflik Taklifi!</b>\n\n` +
    `Hurmatli hamkasb, <b>${senderName}</b> sizni birgalikda ilmiy ish yozish uchun taklif qilmoqda:\n\n` +
    `📌 <b>Mavzu:</b> «${projectTitle}»\n` +
    `📂 <b>Yo‘nalish:</b> ${typeLabel}\n` +
    `🎖 <b>Rolingiz:</b> ${role}\n` +
    (creditRoles ? `🛠 <b>CRediT hissasi:</b> ${creditRoles}\n` : '') +
    (sharePercent > 0 ? `📊 <b>Ulush:</b> ${sharePercent}%\n` : '') +
    `\n<i>Ushbu taklifni tasdiqlaysizmi?</i>`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '✅ Qabul qilish',
          callback_data: `collab_acc:${inviteToken}`,
        },
        {
          text: '❌ Rad etish',
          callback_data: `collab_rej:${inviteToken}`,
        },
      ],
    ],
  };

  return await sendTelegramMessage({
    chatId: recipientChatId,
    text,
    replyMarkup,
  });
}

/**
 * Moderatorning e'longa berilgan savolga javobini Telegram bot orqali olimga yetkazish (toza matn)
 */
export async function sendModeratorAnswerTelegram({
  recipientChatId,
  announcementTitle,
  questionText,
  answerText,
}) {
  const text = `📢 «${announcementTitle}»\n❓ Savol: ${questionText}\n\n💬 Javob:\n${answerText.trim()}`;

  return await sendTelegramMessage({
    chatId: recipientChatId,
    text,
  });
}

/**
 * Moderator tomonidan bitta olimga shaxsiy Telegram xabar yuborish (toza matn, ortiqcha so'zlarsiz)
 */
export async function sendDirectMessageToScholar({
  recipientChatId,
  scholarId,
  title,
  messageText,
  buttonText,
  buttonUrl,
}) {
  const formattedText = messageText.trim();

  let replyMarkup = null;
  if (buttonText && buttonUrl) {
    const fullUrl = buttonUrl.startsWith('http') ? buttonUrl : `https://tiu.uz${buttonUrl.startsWith('/') ? '' : '/'}${buttonUrl}`;
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: buttonText,
            url: fullUrl,
          },
        ],
      ],
    };
  }

  let telegramRes = null;
  if (recipientChatId) {
    telegramRes = await sendTelegramMessage({
      chatId: recipientChatId,
      text: formattedText,
      replyMarkup,
    });
  }

  // Also create in-app notification if scholarId is provided
  if (scholarId) {
    const scholar = await prisma.scholarProfile.findUnique({
      where: { id: scholarId },
      select: { userId: true },
    });
    if (scholar?.userId) {
      await prisma.notification.create({
        data: {
          userId: scholar.userId,
          title: title || 'TIU Xabarnomasi',
          message: messageText.trim(),
          type: 'SYSTEM',
          link: buttonUrl || '/dashboard',
        },
      }).catch(() => {});
    }
  }

  return telegramRes;
}

/**
 * Moderator tomonidan barcha olimlarga xabar tarqatish (toza matn)
 */
export async function broadcastCustomTelegramMessage({
  title,
  messageText,
  buttonText,
  buttonUrl,
}) {
  const connectedScholars = await prisma.scholarProfile.findMany({
    where: {
      isTelegramConnected: true,
      telegramChatId: { not: null },
    },
    select: {
      id: true,
      telegramChatId: true,
      userId: true,
    },
  });

  const formattedText = messageText.trim();

  let replyMarkup = null;
  if (buttonText && buttonUrl) {
    const fullUrl = buttonUrl.startsWith('http') ? buttonUrl : `https://tiu.uz${buttonUrl.startsWith('/') ? '' : '/'}${buttonUrl}`;
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: buttonText,
            url: fullUrl,
          },
        ],
      ],
    };
  }

  let sentCount = 0;
  for (const s of connectedScholars) {
    if (s.telegramChatId) {
      await sendTelegramMessage({
        chatId: s.telegramChatId,
        text: formattedText,
        replyMarkup,
      }).catch(() => {});
      sentCount++;
    }
  }

  // In-app Notifications to all active users
  const allUsers = await prisma.user.findMany({
    where: { accountStatus: 'ACTIVE' },
    select: { id: true },
  });

  for (const u of allUsers) {
    await prisma.notification.create({
      data: {
        userId: u.id,
        title: title || 'TIU Xabarnomasi',
        message: messageText.trim(),
        type: 'SYSTEM',
        link: buttonUrl || '/dashboard/announcements',
      },
    }).catch(() => {});
  }

  return sentCount;
}

const POLLS_FILE = path.join(process.cwd(), 'data', 'telegram-polls.json');

export function getPollRecords() {
  try {
    if (!fs.existsSync(POLLS_FILE)) return [];
    const content = fs.readFileSync(POLLS_FILE, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.polls || [];
  } catch {
    return [];
  }
}

export function savePollRecord(poll) {
  try {
    const existing = getPollRecords();
    const idx = existing.findIndex((p) => p.id === String(poll.id));
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...poll, updatedAt: new Date().toISOString() };
    } else {
      existing.unshift({
        ...poll,
        id: String(poll.id),
        createdAt: poll.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    const dir = path.dirname(POLLS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POLLS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.error('savePollRecord error:', err);
  }
}

/**
 * Haqiqiy faylni (PDF, Word, Excel, ZIP yoki rasm) Telegram orqali bitta olimga yuborish
 */
export async function sendTelegramFile({
  chatId,
  filePath,
  fileName,
  caption = '',
}) {
  if (!BOT_TOKEN || !chatId) return null;

  try {
    let absolutePath = filePath;
    if (!path.isAbsolute(filePath)) {
      absolutePath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
    }

    if (!fs.existsSync(absolutePath)) {
      console.warn('sendTelegramFile: fayl diskda topilmadi:', absolutePath);
      return null;
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const resolvedName = fileName || path.basename(absolutePath);
    const blob = new Blob([fileBuffer]);
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', blob, resolvedName);
    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (err) {
    console.error('sendTelegramFile error:', err);
    return null;
  }
}

/**
 * Haqiqiy faylni barcha ulangan olimlarga tarqatish
 */
export async function broadcastTelegramFile({
  filePath,
  fileName,
  caption = '',
}) {
  const connectedScholars = await prisma.scholarProfile.findMany({
    where: {
      isTelegramConnected: true,
      telegramChatId: { not: null },
    },
    select: { telegramChatId: true },
  });

  let sentCount = 0;
  for (const s of connectedScholars) {
    if (s.telegramChatId) {
      await sendTelegramFile({
        chatId: s.telegramChatId,
        filePath,
        fileName,
        caption,
      });
      sentCount++;
    }
  }
  return sentCount;
}

/**
 * Haqiqiy Telegram Poll (Native So'rovnoma) yuborish va natijalarni saqlash
 */
export async function sendTelegramPoll({ chatId, question, options, isAnonymous = false }) {
  if (!BOT_TOKEN || !chatId) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPoll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        question: question.trim(),
        options: options.map((opt) => opt.trim()),
        is_anonymous: isAnonymous,
      }),
    });
    const data = await res.json();
    if (data.ok && data.result?.poll) {
      const poll = data.result.poll;
      savePollRecord({
        id: poll.id,
        question: poll.question,
        options: poll.options.map((opt) => ({
          text: opt.text,
          voter_count: opt.voter_count || 0,
        })),
        total_voter_count: poll.total_voter_count || 0,
        is_closed: poll.is_closed || false,
      });
    }
    return data;
  } catch (err) {
    console.error('sendTelegramPoll error:', err);
    return null;
  }
}

/**
 * Haqiqiy Telegram Pollni barcha ulangan olimlarga tarqatish
 */
export async function broadcastPollToScholars({ question, options }) {
  const connectedScholars = await prisma.scholarProfile.findMany({
    where: {
      isTelegramConnected: true,
      telegramChatId: { not: null },
    },
    select: { telegramChatId: true },
  });

  let sentCount = 0;
  for (const s of connectedScholars) {
    if (s.telegramChatId) {
      const res = await sendTelegramPoll({
        chatId: s.telegramChatId,
        question,
        options,
      });
      if (res && res.ok) sentCount++;
    }
  }
  return sentCount;
}


