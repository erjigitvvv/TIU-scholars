import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName, departmentId, academicDegree, academicTitle } = body;

    if (!email || !password || !fullName || !departmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'SCHOLAR',
          accountStatus: 'PENDING',
        },
      });

      const profile = await tx.scholarProfile.create({
        data: {
          userId: user.id,
          departmentId,
          fullName,
          academicDegree: academicDegree || 'NONE',
          academicTitle: academicTitle || 'NONE',
          researchInterests: JSON.stringify([]),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: user.id,
          details: JSON.stringify({ email, fullName }),
        },
      });

      return { user, profile };
    });

    return NextResponse.json({ success: true, userId: result.user.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
