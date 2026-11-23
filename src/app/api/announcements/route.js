import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { broadcastAnnouncementToTelegram } from '@/lib/telegram';

export async function GET(request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const includeAll = searchParams.get('all') === 'true';

  try {
    const isModerator = user?.role === 'MODERATOR' || user?.role === 'SUPER_ADMIN';

    const where = {};
    if (!isModerator || !includeAll) {
      where.status = 'PUBLISHED';
    }
    if (!user && !isModerator) {
      where.visibility = 'PUBLIC';
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: { select: { email: true, role: true } },
        inquiries: {
          select: {
            id: true,
            authorName: true,
            questionText: true,
            answerText: true,
            status: true,
            createdAt: true,
            answeredAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const isModerator = user.role === 'MODERATOR' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    if (!isModerator) {
      return NextResponse.json({ success: false, error: 'Faqat moderatorlar eʼlon joylashi mumkin' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, category = 'NEWS', visibility = 'PUBLIC', status = 'PUBLISHED', isPinned = false, deadline = null } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Sarlavha va matn kiritilishi shart' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        visibility,
        status,
        isPinned: Boolean(isPinned),
        deadline: deadline ? new Date(deadline) : null,
        authorId: user.id,
      },
    });

    // If published, broadcast to Telegram bot and In-app notifications!
    let sentCount = 0;
    if (status === 'PUBLISHED') {
      sentCount = await broadcastAnnouncementToTelegram(announcement).catch(() => 0);
    }

    return NextResponse.json({
      success: true,
      announcement,
      telegramBroadcastCount: sentCount,
      message: `Eʼlon joylandi va ${sentCount} ta olimga Telegram orqali yetkazildi!`,
    });
  } catch (error) {
    console.error('POST /api/announcements error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server xatosi' }, { status: 500 });
  }
}
