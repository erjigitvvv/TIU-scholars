import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, departmentId, academicDegree, academicTitle } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    let resolvedDeptId = departmentId;
    if (!resolvedDeptId) {
      const firstDept = await prisma.department.findFirst({ select: { id: true } });
      if (!firstDept) {
        return NextResponse.json({ error: 'No departments configured yet' }, { status: 400 });
      }
      resolvedDeptId = firstDept.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: 'SCHOLAR',
          accountStatus: 'PENDING',
        },
      });

      const profile = await tx.scholarProfile.create({
        data: {
          userId: user.id,
          departmentId: resolvedDeptId,
          fullName: String(fullName).trim(),
          publicEmail: normalizedEmail,
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
          details: JSON.stringify({
            email: normalizedEmail,
            fullName: String(fullName).trim(),
            phone: phone ? String(phone).trim() : null,
          }),
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
