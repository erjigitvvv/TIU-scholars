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
const userStates = new Map();

const POLLS_FILE = path.join(rootDir, 'data', 'telegram-polls.json');

function getPollRecords() {
  try {
    if (!fs.existsSync(POLLS_FILE)) return [];
    const content = fs.readFileSync(POLLS_FILE, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.polls || [];
  } catch {
    return [];
  }
}

function savePollRecord(poll) {
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

async function answerCallbackQuery(callbackQueryId, text, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.error('answerCallbackQuery error:', err.message);
  }
}

async function editMessageText(chatId, messageId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('editMessageText error:', err.message);
  }
}

async function handleCollaborationCallback(cq) {
  const data = cq.data || '';
  const isAccept = data.startsWith('collab_acc:');
  const isReject = data.startsWith('collab_rej:');
  if (!isAccept && !isReject) return;

  const token = data.replace(/^collab_(acc|rej):/, '').trim();
  const collab = await prisma.projectCollaborator.findUnique({
    where: { inviteToken: token },
    include: {
      project: {
        include: {
          creator: {
            include: { scholarProfile: true },
          },
        },
      },
    },
  });

  if (!collab) {
    await answerCallbackQuery(cq.id, '❌ Ushbu taklif topilmadi yoki muddati o‘tgan.', true);
    return;
  }

  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;

  if (isAccept) {
    await prisma.projectCollaborator.update({
      where: { id: collab.id },
      data: {
        inviteStatus: 'ACCEPTED',
        consentSignedAt: new Date(),
      },
    });

    await answerCallbackQuery(cq.id, 'Hammualliflik qabul qilindi! 🎉', false);
    if (chatId && messageId) {
      await editMessageText(
        chatId,
        messageId,
        `✅ <b>Hammualliflik qabul qilindi!</b>\n\n📌 <b>Mavzu:</b> «${collab.project.title}»\nSiz ushbu ilmiy ishga muvaffaqiyatli hammuallif bo‘ldingiz. Endi loyiha kabinetingizda mavjud.`
      );
    }

    // Loyiha egasiga xushxabar
    const creatorChatId = collab.project?.creator?.scholarProfile?.telegramChatId;
    if (creatorChatId) {
      await sendTelegramMessage(
        creatorChatId,
        `🎉 <b>Xushxabar!</b>\n\nOlim <b>${collab.scholarName || collab.scholarEmail}</b> sizning «${collab.project.title}» nomli ilmiy ishingizga hammualliflik taklifini <b>QABUL QILDI</b>!`
      );
    }
  } else {
    await prisma.projectCollaborator.update({
      where: { id: collab.id },
      data: {
        inviteStatus: 'REJECTED',
        rejectReason: 'Telegram orqali rad etildi',
      },
    });

    await answerCallbackQuery(cq.id, 'Taklif rad etildi.', false);
    if (chatId && messageId) {
      await editMessageText(
        chatId,
        messageId,
        `❌ <b>Hammualliflik taklifi rad etildi.</b>\n\n📌 <b>Mavzu:</b> «${collab.project.title}»`
      );
    }

    // Loyiha egasiga xabarnoma
    const creatorChatId = collab.project?.creator?.scholarProfile?.telegramChatId;
    if (creatorChatId) {
      await sendTelegramMessage(
        creatorChatId,
        `ℹ️ <b>Hammualliflik taklifi rad etildi:</b>\n\nOlim <b>${collab.scholarName || collab.scholarEmail}</b> sizning «${collab.project.title}» ilmiy ishingizdagi taklifni rad etdi.`
      );
    }
  }
}

async function handlePublicationCallback(cq) {
  const data = cq.data || '';
  const isApprove = data.startsWith('pub_app:');
  const isReject = data.startsWith('pub_rej:');
  if (!isApprove && !isReject) return;

  const parts = data.replace(/^pub_(app|rej):/, '').split(':');
  const publicationId = parts[0];
  const scholarId = parts[1];

  const pubAuthor = await prisma.publicationAuthor.findUnique({
    where: {
      publicationId_scholarId: {
        publicationId,
        scholarId,
      },
    },
    include: {
      scholar: true,
      publication: {
        include: {
          submittedBy: {
            include: { scholarProfile: true },
          },
        },
      },
    },
  });

  if (!pubAuthor) {
    await answerCallbackQuery(cq.id, '❌ Nashr yozuvi topilmadi.', true);
    return;
  }

  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;

  if (isApprove) {
    await prisma.publicationAuthor.update({
      where: { id: pubAuthor.id },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    await answerCallbackQuery(cq.id, 'Nashr hammuallifligi tasdiqlandi! 🎉', false);
    if (chatId && messageId) {
      await editMessageText(
        chatId,
        messageId,
        `✅ <b>Nashr hammuallifligi muvaffaqiyatli tasdiqlandi!</b>\n\n📖 «${pubAuthor.publication.title}»\nSiz rasman hammuallif sifatida tasdiqlandingiz.`
      );
    }

    // Submitterni xabardor qilish
    const submitterChatId = pubAuthor.publication?.submittedBy?.scholarProfile?.telegramChatId;
    if (submitterChatId) {
      await sendTelegramMessage(
        submitterChatId,
        `🎉 <b>Xushxabar!</b>\n\nOlim <b>${pubAuthor.scholar.fullName}</b> siz topshirgan «${pubAuthor.publication.title}» nashridagi hammualliflikni <b>TASDIQLADI</b>!`
      );
    }
  } else {
    await prisma.publicationAuthor.update({
      where: { id: pubAuthor.id },
      data: {
        approvalStatus: 'REJECTED',
        rejectionNote: 'Telegram orqali rad etildi',
      },
    });

    await answerCallbackQuery(cq.id, 'Hammualliflik rad etildi.', false);
    if (chatId && messageId) {
      await editMessageText(
        chatId,
        messageId,
        `❌ <b>Nashr hammuallifligi rad etildi.</b>\n\n📖 «${pubAuthor.publication.title}»`
      );
    }

    const submitterChatId = pubAuthor.publication?.submittedBy?.scholarProfile?.telegramChatId;
    if (submitterChatId) {
      await sendTelegramMessage(
        submitterChatId,
        `ℹ️ <b>Hammualliflik rad etildi:</b>\n\nOlim <b>${pubAuthor.scholar.fullName}</b> siz topshirgan «${pubAuthor.publication.title}» nashridagi hammualliflikni rad etdi.`
      );
    }
  }
}

async function handleAnnouncementInquiryCallback(cq) {
  const data = cq.data || '';
  if (!data.startsWith('ann_ask:')) return;
  const annId = data.replace('ann_ask:', '').trim();

  const announcement = await prisma.announcement.findUnique({
    where: { id: annId },
    select: { id: true, title: true },
  });

  const chatId = cq.message?.chat?.id;
  if (!chatId || !announcement) {
    await answerCallbackQuery(cq.id, 'E‘lon topilmadi.');
    return;
  }

  userStates.set(String(chatId), {
    action: 'AWAIT_INQUIRY',
    announcementId: annId,
    announcementTitle: announcement.title,
  });

  await answerCallbackQuery(cq.id, 'Savolingizni yozing...');
  await sendTelegramMessage(
    chatId,
    `✍️ <b>«${announcement.title}» e‘loni bo‘yicha savol yoki izohingizni yozing:</b>\n\n<i>Siz yuborgan savol to‘g‘ridan-to‘g‘ri Ilmiy Bo‘lim Moderatoriga yetkaziladi.</i>`
  );
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
      message: '❌ <b>Kiritilgan kod xato yoki uning 1 daqiqalik amal qilish muddati tugagan.</b>\n\n<i>Iltimos, saytdagi kabinetingizdan «Yangi kod olish» tugmasini bosing va yangi kodni yuboring yoki yordam uchun quyidagi tugma orqali murojaat qiling:</i>',
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: '🆘 Qo‘llab-quvvatlashga yozish (Support)',
              callback_data: 'support_req',
            },
          ],
        ],
      },
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

  // Scholar uchun In-App bildirishnoma yaratish
  if (scholar.userId) {
    await prisma.notification.create({
      data: {
        userId: scholar.userId,
        title: '🎉 Telegram bot muvaffaqiyatli bog‘landi',
        message: 'Telegram hisobingiz TIU ilmiy tizimiga ulandi.',
        type: 'SYSTEM',
        link: '/dashboard',
      },
    }).catch(() => {});
  }

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

  // Check if user is in an active inquiry or support state
  if (userStates.has(String(chatId))) {
    const state = userStates.get(String(chatId));

    if (state.action === 'AWAIT_SUPPORT') {
      const scholar = await prisma.scholarProfile.findFirst({
        where: { telegramChatId: String(chatId) },
      });
      const generalAnn = await prisma.announcement.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      await prisma.announcementInquiry.create({
        data: {
          announcementId: generalAnn?.id || 'cmwiqnegz0001d6wowgy1nbot',
          scholarId: scholar?.id || null,
          telegramChatId: String(chatId),
          authorName: scholar?.fullName || `${firstName} (@${username || 'foydalanuvchi'})`,
          questionText: `🆘 [Support]: ${text}`,
          status: 'PENDING',
        },
      });

      // Send In-App notification to all Admins and Moderators
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MODERATOR'] } },
        select: { id: true },
      });
      for (const adm of admins) {
        await prisma.notification.create({
          data: {
            userId: adm.id,
            title: `💬 Telegram Yangi Xabar: ${scholar?.fullName || firstName}`,
            message: text.slice(0, 150),
            type: 'TELEGRAM_INQUIRY',
            link: '/admin',
          },
        }).catch(() => {});
      }

      userStates.delete(String(chatId));

      await sendTelegramMessage(
        chatId,
        `✅ <b>Murojaatingiz TIU Ilmiy Bo‘limiga yetkazildi!</b>\n\nModeratorimiz xabaringizni ko‘rib chiqib, tez orada sizga javob yozadi. Javob to‘g‘ridan-to‘g‘ri shu yerga bot orqali yetib keladi.`
      );
      return;
    }

    if (state.action === 'AWAIT_INQUIRY') {
      const scholar = await prisma.scholarProfile.findFirst({
        where: { telegramChatId: String(chatId) },
      });

      await prisma.announcementInquiry.create({
        data: {
          announcementId: state.announcementId,
          scholarId: scholar?.id || null,
          telegramChatId: String(chatId),
          authorName: scholar?.fullName || firstName || username || 'TIU Olimi',
          questionText: text,
          status: 'PENDING',
        },
      });

      // Send In-App notification to all Admins and Moderators
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MODERATOR'] } },
        select: { id: true },
      });
      for (const adm of admins) {
        await prisma.notification.create({
          data: {
            userId: adm.id,
            title: `💬 Yangi Savol: ${scholar?.fullName || firstName}`,
            message: text.slice(0, 150),
            type: 'TELEGRAM_INQUIRY',
            link: '/admin',
          },
        }).catch(() => {});
      }

      userStates.delete(String(chatId));

      await sendTelegramMessage(
        chatId,
        `✅ <b>Savolingiz muvaffaqiyatli qabul qilindi!</b>\n\n«${state.announcementTitle}» e‘loni bo‘yicha savolingiz Ilmiy bo‘lim moderatoriga yetkazildi. Moderator javob yozganda shu yerga bot orqali xabar boradi.`
      );
      return;
    }
  }

  // /start command
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    // Agar start parametri orqali kod yuborilgan bo'lsa: /start TIU-7492
    if (parts.length > 1 && parts[1]) {
      const codeParam = parts[1].trim();
      const res = await handleVerification(codeParam, chatId, username, firstName);
      await sendTelegramMessage(chatId, res.message, res.replyMarkup);
      return;
    }

    const greeting = `Assalomu alaykum, <b>${firstName}</b>!\n🏛 <b>TIU Ilmiy Salohiyat Portali Rasmiy Boti</b>\n\nProfilingizni portal bilan bog‘lash uchun saytdagi kabinetingizda ko‘rsatilgan <b>1 daqiqalik tasdiqlash kodini</b> yuboring (masalan: <code>TIU-7492</code> yoki <code>7492</code>):`;
    await sendTelegramMessage(chatId, greeting, {
      inline_keyboard: [
        [
          {
            text: '🆘 Qo‘llab-quvvatlashga yozish (Support)',
            callback_data: 'support_req',
          },
        ],
      ],
    });
    return;
  }

  // Kod ko'rinishidagi xabar: TIU-XXXX yoki 4-6 xonali raqam/harf
  const codeMatch = text.match(/^(TIU-)?([A-Za-z0-9]{4,6})$/i);
  if (codeMatch) {
    const res = await handleVerification(text, chatId, username, firstName);
    await sendTelegramMessage(chatId, res.message, res.replyMarkup);
    return;
  }

  // Boshqa har qanday xabar uchun yo'naltirish
  await sendTelegramMessage(
    chatId,
    `Hurmatli <b>${firstName}</b>! Profilingizni sayt bilan bog‘lash uchun 1 daqiqalik tasdiqlash kodini yuboring (masalan: <code>TIU-7492</code>).\n\nSavol yoki muammo bo‘lsa, quyidagi tugma orqali yozishingiz mumkin:`,
    {
      inline_keyboard: [
        [
          {
            text: '🆘 Qo‘llab-quvvatlashga yozish (Support)',
            callback_data: 'support_req',
          },
        ],
      ],
    }
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
          if (update.callback_query) {
            const data = update.callback_query.data || '';
            if (data.startsWith('collab_')) {
              await handleCollaborationCallback(update.callback_query);
            } else if (data.startsWith('pub_')) {
              await handlePublicationCallback(update.callback_query);
            } else if (data.startsWith('ann_ask:')) {
              await handleAnnouncementInquiryCallback(update.callback_query);
            } else if (data === 'support_req') {
              const cqChatId = update.callback_query.message?.chat?.id;
              if (cqChatId) {
                userStates.set(String(cqChatId), { action: 'AWAIT_SUPPORT' });
                await answerCallbackQuery(update.callback_query.id, 'Savolingizni yozing...');
                await sendTelegramMessage(
                  cqChatId,
                  `✍️ <b>Muammo yoki savolingizni yozib qoldiring:</b>\n\n<i>Siz yozgan xabar to‘g‘ridan-to‘g‘ri TIU Ilmiy Bo‘limi (TIUgram) moderatoriga yetkaziladi.</i>`
                );
              }
            }
          } else if (update.message) {
            await processUpdate(update);
          } else if (update.poll) {
            const p = update.poll;
            savePollRecord({
              id: p.id,
              question: p.question,
              options: p.options.map((opt) => ({
                text: opt.text,
                voter_count: opt.voter_count || 0,
              })),
              total_voter_count: p.total_voter_count || 0,
              is_closed: p.is_closed || false,
            });
          } else if (update.poll_answer) {
            const pa = update.poll_answer;
            const existingPolls = getPollRecords();
            const targetPoll = existingPolls.find((p) => p.id === String(pa.poll_id));
            if (targetPoll) {
              if (!targetPoll.voters) targetPoll.voters = [];
              const voterName = pa.user
                ? `${pa.user.first_name || ''} ${pa.user.last_name || ''} (@${pa.user.username || ''})`.trim()
                : 'Olim';
              const existingVoterIdx = targetPoll.voters.findIndex((v) => v.userId === pa.user?.id);
              if (existingVoterIdx >= 0) {
                targetPoll.voters[existingVoterIdx] = {
                  userId: pa.user?.id,
                  name: voterName,
                  option_ids: pa.option_ids,
                  time: new Date().toISOString(),
                };
              } else {
                targetPoll.voters.push({
                  userId: pa.user?.id,
                  name: voterName,
                  option_ids: pa.option_ids,
                  time: new Date().toISOString(),
                });
              }
              targetPoll.total_voter_count = targetPoll.voters.length;
              const counts = {};
              for (const v of targetPoll.voters) {
                for (const optId of v.option_ids || []) {
                  counts[optId] = (counts[optId] || 0) + 1;
                }
              }
              targetPoll.options = targetPoll.options.map((opt, idx) => ({
                ...opt,
                voter_count: counts[idx] || 0,
              }));
              savePollRecord(targetPoll);
            }
          }
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
