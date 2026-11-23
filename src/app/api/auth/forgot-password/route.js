import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let targetEmail = body.email;

    // Agar tizimga kirgan bo'lsa, o'zining emailini olamiz
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

    // Parolni tiklash tokeni yaratish (yoki havola)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalized)}`;

    // Haqiqiy tizimda email yoki Telegram botga xabar yuboriladi
    console.log(`[Password Reset Link Generated] For: ${normalized} -> ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: `Parolni tiklash havolasi ${normalized} manziliga yuborildi! Pochtangizni tekshiring.`,
      resetLink, // UI da qulaylik uchun ham ko'rsatish mumkin
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Parolni tiklash so‘rovida xatolik yuz berdi' }, { status: 500 });
  }
}
