import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const inquiries = await prisma.announcementInquiry.findMany({
      where: { announcementId: id },
      include: {
        scholar: {
          select: {
            fullName: true,
            photoUrl: true,
            academicDegree: true,
            department: { select: { nameUz: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('GET inquiries error:', error);
    return NextResponse.json({ success: false, error: 'Xatolik' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { questionText } = body;

    if (!questionText || !questionText.trim()) {
      return NextResponse.json({ success: false, error: 'Savol matni kiritilishi shart' }, { status: 400 });
    }

    const inquiry = await prisma.announcementInquiry.create({
      data: {
        announcementId: id,
        scholarId: user.scholarProfile?.id || null,
        telegramChatId: user.scholarProfile?.telegramChatId || null,
        authorName: user.scholarProfile?.fullName || user.email,
        questionText: questionText.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, inquiry, message: 'Savolingiz moderatorga yetkazildi!' });
  } catch (error) {
    console.error('POST inquiry error:', error);
    return NextResponse.json({ success: false, error: 'Yuborishda xatolik' }, { status: 500 });
  }
}
