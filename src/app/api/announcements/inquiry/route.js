import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyModerators } from '@/lib/notifications';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { announcementId, action = 'INQUIRY', questionText } = body;

    if (!announcementId) {
      return NextResponse.json({ success: false, error: 'Eʼlon ID ko‘rsatilmadi' }, { status: 400 });
    }

    // Agar olim e'lonni ochib ko'rsa, viewsCount ni 1 taga oshiramiz
    if (action === 'VIEW') {
      await prisma.announcement.update({
        where: { id: announcementId },
        data: { viewsCount: { increment: 1 } },
      }).catch(() => {});
      return NextResponse.json({ success: true, message: 'Ko‘rish qayd etildi' });
    }

    // Izoh / savol yuborish
    if (!questionText || !questionText.trim()) {
      return NextResponse.json({ success: false, error: 'Savol matni kiritilmadi' }, { status: 400 });
    }

    const scholar = user
      ? await prisma.scholarProfile.findFirst({
          where: { userId: user.id },
        })
      : null;

    const authorName = scholar?.fullName || user?.name || user?.email || 'TIU Izlanuvchisi';

    const inquiry = await prisma.announcementInquiry.create({
      data: {
        announcementId,
        scholarId: scholar?.id || null,
        telegramChatId: scholar?.telegramChatId || null,
        authorName,
        questionText: questionText.trim(),
        status: 'PENDING',
      },
      include: {
        announcement: { select: { title: true } },
      },
    });

    // Moderatorlarga bildirishnoma
    await notifyModerators({
      type: 'ANNOUNCEMENT_INQUIRY',
      title: `E'longa yangi savol: ${inquiry.announcement?.title}`,
      message: `${authorName}: "${questionText.slice(0, 100)}${questionText.length > 100 ? '...' : ''}"`,
      link: '/admin/announcements',
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      inquiry,
      message: 'Savolingiz moderatorga yuborildi. Javob tez orada botingizga yoki bildirishnomalarga yetib boradi.',
    });
  } catch (error) {
    console.error('POST /api/announcements/inquiry error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
