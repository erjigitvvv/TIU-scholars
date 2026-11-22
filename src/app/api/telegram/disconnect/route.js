import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const scholar = await prisma.scholarProfile.findFirst({
      where: { userId: user.id },
    });

    if (!scholar) {
      return NextResponse.json({ error: 'Olim profili topilmadi' }, { status: 404 });
    }

    await prisma.scholarProfile.update({
      where: { id: scholar.id },
      data: {
        telegramChatId: null,
        telegramUsername: null,
        isTelegramConnected: false,
        telegramConnectedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram bot ulanishi muvaffaqiyatli uzildi.',
    });
  } catch (error) {
    console.error('disconnect API error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
