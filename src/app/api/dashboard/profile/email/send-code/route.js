import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEmailOtp } from '@/lib/emailOtp';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { newEmail } = await request.json();
    const normalized = String(newEmail || '').trim().toLowerCase();

    if (!normalized || !normalized.includes('@') || normalized.length < 5) {
      return NextResponse.json({ error: 'To‘g‘ri email manzilini kiriting' }, { status: 400 });
    }

    // Email boshqa foydalanuvchida band emasligini tekshirish
    const existing = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'Ushbu email allaqachon boshqa foydalanuvchiga tegishli.' }, { status: 409 });
    }

    const result = await generateEmailOtp({
      email: normalized,
      userId: user.id,
      purpose: 'CHANGE_EMAIL',
    });

    return NextResponse.json({
      success: true,
      email: normalized,
      expiresInSeconds: result.expiresInSeconds,
      message: `1 daqiqalik tasdiqlash kodi ${normalized} manziliga yuborildi!`,
      devCode: process.env.NODE_ENV !== 'production' ? result.code : undefined,
    });
  } catch (error) {
    console.error('Send email code error:', error);
    return NextResponse.json({ error: error.message || 'Kod yuborishda xatolik yuz berdi' }, { status: 500 });
  }
}
