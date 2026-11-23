import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateEmailOtp, verifyEmailOtp } from '@/lib/emailOtp';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let targetEmail = body.email;

    // Agar tizimga kirgan bo'lsa, o'zining joriy emailini olamiz
    if (!targetEmail) {
      const user = await getCurrentUser();
      if (user) targetEmail = user.email;
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email manzili talab qilinadi' }, { status: 400 });
    }

    const normalized = targetEmail.trim().toLowerCase();
    const dbUser = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Ushbu email bilan foydalanuvchi topilmadi' }, { status: 404 });
    }

    // 1-HOLAT: Kod yuborish (Send 1-minute 6-digit OTP)
    if (!body.code) {
      const result = await generateEmailOtp({
        email: normalized,
        userId: dbUser.id,
        purpose: 'RESET_PASSWORD',
      });

      return NextResponse.json({
        success: true,
        step: 'CODE_SENT',
        email: normalized,
        expiresInSeconds: 60,
        message: `1 daqiqalik tasdiqlash kodi ${normalized} pochtasiga yuborildi!`,
        devCode: process.env.NODE_ENV !== 'production' ? result.code : undefined,
      });
    }

    // 2-HOLAT: Kodni tekshirish va yangi parolni o'rnatish
    const { code, newPassword, confirmPassword } = body;

    if (!code) {
      return NextResponse.json({ error: '6 xonali tasdiqlash kodi kiritilmadi' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Yangi parollar bir-biriga mos kelmadi' }, { status: 400 });
    }

    const verification = await verifyEmailOtp({
      email: normalized,
      code,
      purpose: 'RESET_PASSWORD',
    });

    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    // Parolni yangilash
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Parolingiz muvaffaqiyatli yangilandi!',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: error.message || 'Parolni tiklashda xatolik yuz berdi' }, { status: 500 });
  }
}
