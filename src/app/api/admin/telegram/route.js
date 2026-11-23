import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import {
  broadcastCustomTelegramMessage,
  sendDirectMessageToScholar,
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
      mode = 'BROADCAST', // 'BROADCAST' | 'DIRECT'
      scholarId = null,
      title = '',
      messageText = '',
      buttonText = '',
      buttonUrl = '',
      category = 'NEWS',
    } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Xabar matni kiritilishi shart' },
        { status: 400 }
      );
    }

    if (mode === 'DIRECT') {
      if (!scholarId) {
        return NextResponse.json(
          { success: false, error: 'Xabar yuboriladigan olim tanlanmadi' },
          { status: 400 }
        );
      }

      const scholar = await prisma.scholarProfile.findUnique({
        where: { id: scholarId },
        select: {
          id: true,
          fullName: true,
          telegramChatId: true,
          isTelegramConnected: true,
          user: { select: { email: true } },
        },
      });

      if (!scholar) {
        return NextResponse.json({ success: false, error: 'Olim topilmadi' }, { status: 404 });
      }

      let telegramSent = false;
      if (scholar.telegramChatId) {
        const res = await sendDirectMessageToScholar({
          recipientChatId: scholar.telegramChatId,
          scholarId: scholar.id,
          title: title.trim(),
          messageText: messageText.trim(),
          buttonText: buttonText ? buttonText.trim() : null,
          buttonUrl: buttonUrl ? buttonUrl.trim() : null,
          senderName: user.email?.includes('admin') ? 'TIU Administratsiyasi' : 'TIU Ilmiy Bo‘limi (Moderator)',
        });
        if (res && res.ok) telegramSent = true;
      } else {
        // If scholar's Telegram is not connected, still create an in-app notification
        await sendDirectMessageToScholar({
          recipientChatId: null,
          scholarId: scholar.id,
          title: title.trim(),
          messageText: messageText.trim(),
          buttonText: buttonText ? buttonText.trim() : null,
          buttonUrl: buttonUrl ? buttonUrl.trim() : null,
        });
      }

      return NextResponse.json({
        success: true,
        telegramSent,
        recipientName: scholar.fullName,
        message: telegramSent
          ? `${scholar.fullName} ning Telegram botiga xabar muvaffaqiyatli yetkazildi!`
          : `${scholar.fullName} ga portal bildirishnomasi yuborildi (Telegrami ulanmagan).`,
      });
    }

    // BROADCAST MODE
    const sentCount = await broadcastCustomTelegramMessage({
      title: title.trim(),
      messageText: messageText.trim(),
      buttonText: buttonText ? buttonText.trim() : null,
      buttonUrl: buttonUrl ? buttonUrl.trim() : null,
      senderName: 'TIU Ilmiy Bo‘limi',
      category,
    });

    return NextResponse.json({
      success: true,
      sentCount,
      message: `Xabarnoma ${sentCount} ta olimning Telegram botiga va barcha platforma foydalanuvchilariga yetkazildi!`,
    });
  } catch (error) {
    console.error('POST /api/admin/telegram error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}
