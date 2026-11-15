import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newEmail, currentPassword } = await request.json();
    const normalizedEmail = String(newEmail || '').trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@') || !currentPassword) {
      return NextResponse.json({ error: "Email va joriy parolni to'g'ri kiriting" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 400 });
    }

    if (normalizedEmail !== dbUser.email) {
      const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (exists) {
        return NextResponse.json({ error: 'Bu email allaqachon band qilingan' }, { status: 409 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { email: normalizedEmail },
      });
    }

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
