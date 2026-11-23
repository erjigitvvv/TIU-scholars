import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyEmailOtp } from '@/lib/emailOtp';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { newEmail, code } = await request.json();
    const normalized = String(newEmail || '').trim().toLowerCase();

    if (!normalized || !code) {
      return NextResponse.json({ error: 'Yangi email va 6 xonali tasdiqlash kodi kiritilishi shart.' }, { status: 400 });
    }

    const verification = await verifyEmailOtp({
      email: normalized,
      code,
      purpose: 'CHANGE_EMAIL',
    });

    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    // Emailni yangilash
    await prisma.user.update({
      where: { id: user.id },
      data: { email: normalized },
    });

    return NextResponse.json({
      success: true,
      email: normalized,
      message: 'Emailingiz muvaffaqiyatli yangilandi va tasdiqlandi!',
    });
  } catch (error) {
    console.error('Verify email code error:', error);
    return NextResponse.json({ error: error.message || 'Kodni tekshirishda xatolik yuz berdi' }, { status: 500 });
  }
}
