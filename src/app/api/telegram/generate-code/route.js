import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTelegramAuthCode } from '@/lib/telegram';

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

    const result = await generateTelegramAuthCode(scholar.id);

    return NextResponse.json({
      success: true,
      code: result.code,
      expiresAt: result.expiresAt,
      expiresInSeconds: result.expiresInSeconds,
      botUsername: result.botUsername,
      botLink: result.botLink,
    });
  } catch (error) {
    console.error('generate-code API error:', error);
    return NextResponse.json({ error: error.message || 'Kod yaratishda xatolik' }, { status: 500 });
  }
}
