import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import {
  broadcastCustomTelegramMessage,
  sendDirectMessageToScholar,
  sendTelegramPoll,
  broadcastPollToScholars,
  sendTelegramFile,
  broadcastTelegramFile,
} from '@/lib/telegram';

export async function GET() {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalConnected, totalScholars, connectedScholars, allScholars, inquiries] = await Promise.all([
      prisma.scholarProfile.count({
        where: { isTelegramConnected: true, telegramChatId: { not: null } },
      }),
      prisma.scholarProfile.count(),
      prisma.scholarProfile.findMany({
        where: { isTelegramConnected: true, telegramChatId: { not: null } },
        select: {
          id: true,
          fullName: true,
          telegramChatId: true,
          telegramUsername: true,
          photoUrl: true,
          academicDegree: true,
          department: { select: { nameUz: true } },
          user: { select: { email: true } },
        },
        orderBy: { fullName: 'asc' },
      }),
      prisma.scholarProfile.findMany({
        select: {
          id: true,
          fullName: true,
          isTelegramConnected: true,
          telegramChatId: true,
          telegramUsername: true,
          academicDegree: true,
          department: { select: { nameUz: true } },
          user: { select: { email: true } },
        },
        orderBy: { fullName: 'asc' },
      }),
      prisma.announcementInquiry.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          announcement: { select: { id: true, title: true } },
          scholar: {
            select: {
              fullName: true,
              photoUrl: true,
              academicDegree: true,
              department: { select: { nameUz: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || 'tiuscholarbot',
      totalConnected,
      totalScholars,
      connectedScholars,
      allScholars,
      inquiries,
    });
  } catch (error) {
    console.error('GET /api/admin/telegram error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      mode = 'DIRECT', // 'BROADCAST' | 'DIRECT'
      scholarId = null,
      scholarIds = null,
      recipientChatId = null,
      telegramChatId = null,
      inquiryId = null,
      inquiryIds = null,
      title = '',
      messageText = '',
      buttonText = '',
      buttonUrl = '',
      category = 'NEWS',
      isPoll = false,
      pollQuestion = '',
      pollOptions = [],
      fileUrl = '',
      fileName = '',
    } = body;

    // Handle Poll Broadcast
    if (isPoll && pollQuestion && Array.isArray(pollOptions) && pollOptions.length >= 2) {
      if (mode === 'BROADCAST') {
        const sentPolls = await broadcastPollToScholars({
          question: pollQuestion,
          options: pollOptions,
        });
        return NextResponse.json({
          success: true,
          sentCount: sentPolls,
          message: `Rasmiy Telegram so‘rovnomasi ${sentPolls} ta olim botiga yuborildi! 📊`,
        });
      } else if (scholarId) {
        const scholar = await prisma.scholarProfile.findUnique({
          where: { id: scholarId },
          select: { telegramChatId: true, fullName: true },
        });
        if (scholar?.telegramChatId) {
          await sendTelegramPoll({
            chatId: scholar.telegramChatId,
            question: pollQuestion,
            options: pollOptions,
          });
          return NextResponse.json({
            success: true,
            message: `${scholar.fullName} ga Telegram so‘rovnomasi yuborildi! 📊`,
          });
        }
      }
    }

    if ((!messageText || !messageText.trim()) && !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Xabar matni yoki fayl kiritilishi shart' },
        { status: 400 }
      );
    }

    if (mode === 'DIRECT') {
      const destChatId = recipientChatId || telegramChatId;
      if (destChatId && (!scholarId || scholarId.startsWith?.('guest-'))) {
        if (fileUrl) {
          await sendTelegramFile({
            chatId: destChatId,
            filePath: fileUrl,
            fileName,
            caption: messageText?.trim() || '',
          });
        } else {
          await sendTelegramMessage({
            chatId: destChatId,
            text: messageText.trim(),
          });
        }
        if (inquiryId) {
          await prisma.announcementInquiry.update({
            where: { id: inquiryId },
            data: {
              status: 'ANSWERED',
              answerText: messageText ? messageText.trim() : 'Fayl yuborildi',
              answeredAt: new Date(),
              answeredById: user.id,
            },
          }).catch(() => {});
        }
        return NextResponse.json({
          success: true,
          message: 'Support murojaatiga Telegram orqali javob yuborildi! ✅',
        });
      }

      const targetIds = Array.isArray(scholarIds) && scholarIds.length > 0
        ? scholarIds
        : scholarId
        ? [scholarId]
        : [];

      if (targetIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Xabar yuboriladigan olim tanlanmadi' },
          { status: 400 }
        );
      }

      const scholars = await prisma.scholarProfile.findMany({
        where: { id: { in: targetIds } },
        select: {
          id: true,
          fullName: true,
          telegramChatId: true,
          isTelegramConnected: true,
          user: { select: { email: true } },
        },
      });

      if (!scholars.length) {
        return NextResponse.json({ success: false, error: 'Olimlar topilmadi' }, { status: 404 });
      }

      let telegramSentCount = 0;
      for (const scholar of scholars) {
        if (scholar.telegramChatId) {
          if (fileUrl) {
            const res = await sendTelegramFile({
              chatId: scholar.telegramChatId,
              filePath: fileUrl,
              fileName,
              caption: messageText ? messageText.trim() : '',
            });
            if (res && res.ok) telegramSentCount++;
          } else {
            const res = await sendDirectMessageToScholar({
              recipientChatId: scholar.telegramChatId,
              scholarId: scholar.id,
              title: title ? title.trim() : 'TIU Ilmiy Xabarnoma',
              messageText: messageText.trim(),
              buttonText: buttonText ? buttonText.trim() : null,
              buttonUrl: buttonUrl ? buttonUrl.trim() : null,
              senderName: user.email?.includes('admin') ? 'TIU Administratsiyasi' : 'TIU Ilmiy Bo‘limi (Moderator)',
            });
            if (res && res.ok) telegramSentCount++;
          }
        } else {
          await sendDirectMessageToScholar({
            recipientChatId: null,
            scholarId: scholar.id,
            title: title ? title.trim() : 'TIU Ilmiy Xabarnoma',
            messageText: messageText ? messageText.trim() : (fileName || 'Fayl biriktirildi'),
            buttonText: buttonText ? buttonText.trim() : null,
            buttonUrl: buttonUrl ? buttonUrl.trim() : null,
          });
        }
      }

      // If inquiryId or inquiryIds were provided, mark them as answered
      const targetInquiryIds = Array.isArray(inquiryIds) && inquiryIds.length > 0
        ? inquiryIds
        : inquiryId
        ? [inquiryId]
        : [];

      if (targetInquiryIds.length > 0) {
        await prisma.announcementInquiry.updateMany({
          where: { id: { in: targetInquiryIds } },
          data: {
            status: 'ANSWERED',
            answerText: messageText ? messageText.trim() : 'Fayl yuborildi',
            answeredAt: new Date(),
            answeredById: user.id,
          },
        });
      }

      const names = scholars.map((s) => s.fullName).join(', ');
      return NextResponse.json({
        success: true,
        sentCount: scholars.length,
        telegramSentCount,
        message: telegramSentCount > 0
          ? `${names} ga ${fileUrl ? 'haqiqiy fayl' : 'xabar'} yetkazildi (Telegram: ${telegramSentCount} ta)!`
          : `${names} ga portal bildirishnomasi yetkazildi.`,
      });
    }

    // BROADCAST MODE
    let sentCount = 0;
    if (fileUrl) {
      sentCount = await broadcastTelegramFile({
        filePath: fileUrl,
        fileName,
        caption: messageText ? messageText.trim() : '',
      });
    } else {
      sentCount = await broadcastCustomTelegramMessage({
        title: title.trim(),
        messageText: messageText.trim(),
        buttonText: buttonText ? buttonText.trim() : null,
        buttonUrl: buttonUrl ? buttonUrl.trim() : null,
        senderName: 'TIU Ilmiy Bo‘limi',
        category,
      });
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: fileUrl
        ? `Haqiqiy fayl ${sentCount} ta olimning Telegram botiga muvaffaqiyatli yetkazildi! 📎`
        : `Xabarnoma ${sentCount} ta olimning Telegram botiga va barcha platforma foydalanuvchilariga yetkazildi!`,
    });
  } catch (error) {
    console.error('POST /api/admin/telegram error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}
