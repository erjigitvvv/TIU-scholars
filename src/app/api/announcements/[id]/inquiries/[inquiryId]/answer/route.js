import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendModeratorAnswerTelegram } from '@/lib/telegram';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'MODERATOR' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Faqat moderatorlar javob bera oladi' }, { status: 403 });
    }

    const { id: announcementId, inquiryId } = await params;
    const body = await request.json();
    const { answerText } = body;

    if (!answerText || !answerText.trim()) {
      return NextResponse.json({ success: false, error: 'Javob matni kiritilishi shart' }, { status: 400 });
    }

    const inquiry = await prisma.announcementInquiry.findUnique({
      where: { id: inquiryId },
      include: {
        announcement: true,
        scholar: {
          include: { user: true },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, error: 'Savol topilmadi' }, { status: 404 });
    }

    const updated = await prisma.announcementInquiry.update({
      where: { id: inquiryId },
      data: {
        answerText: answerText.trim(),
        answeredAt: new Date(),
        answeredById: user.id,
        status: 'ANSWERED',
      },
    });

    // 1. Send via Telegram Bot if scholar's Telegram is connected
    const recipientChatId = inquiry.telegramChatId || inquiry.scholar?.telegramChatId;
    let telegramSent = false;
    if (recipientChatId) {
      const res = await sendModeratorAnswerTelegram({
        recipientChatId,
        announcementTitle: inquiry.announcement.title,
        questionText: inquiry.questionText,
        answerText: answerText.trim(),
      });
      if (res && res.ok) telegramSent = true;
    }

    // 2. In-app Notification to the scholar
    if (inquiry.scholar?.userId) {
      await prisma.notification.create({
        data: {
          userId: inquiry.scholar.userId,
          title: '💬 Eʼlon bo‘yicha savolingizga javob keldi',
          message: `«${inquiry.announcement.title}» bo‘yicha savolingizga moderator javob berdi.`,
          type: 'ANNOUNCEMENT',
          link: '/dashboard/announcements',
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      inquiry: updated,
      telegramSent,
      message: telegramSent
        ? 'Javob saqlandi va olimga Telegram orqali yetkazildi! 🎉'
        : 'Javob muvaffaqiyatli saqlandi!',
    });
  } catch (error) {
    console.error('Answer inquiry error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
