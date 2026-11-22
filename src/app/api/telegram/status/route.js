import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const scholar = await prisma.scholarProfile.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        isTelegramConnected: true,
        telegramUsername: true,
        telegramChatId: true,
        telegramConnectedAt: true,
      },
    });

    if (!scholar) {
      return NextResponse.json({ error: 'Olim profili topilmadi' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isConnected: Boolean(scholar.isTelegramConnected && scholar.telegramChatId),
      telegramUsername: scholar.telegramUsername,
      connectedAt: scholar.telegramConnectedAt,
    });
  } catch (error) {
    console.error('telegram status API error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
