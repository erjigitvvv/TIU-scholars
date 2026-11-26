import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { notifyModerators } from '@/lib/notifications';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Try again in ${rl.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      email,
      password,
      fullName,
      phone,
      departmentId,
      academicDegree,
      academicTitle,
      orcidId,
    } = body;

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

    let resolvedDeptId = departmentId ? String(departmentId).trim() : '';
    if (resolvedDeptId) {
      const dept = await prisma.department.findUnique({
        where: { id: resolvedDeptId },
        select: { id: true },
      });
      if (!dept) {
        return NextResponse.json({ error: 'Selected department not found' }, { status: 400 });
      }
    } else {
      const firstDept = await prisma.department.findFirst({ select: { id: true } });
      if (!firstDept) {
        return NextResponse.json({ error: 'No departments configured yet' }, { status: 400 });
      }
      resolvedDeptId = firstDept.id;
    }

    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanOrcid = orcidId ? String(orcidId).trim() : null;
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
          phone: cleanPhone,
          orcidId: cleanOrcid,
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

    await notifyModerators({
      type: 'SCHOLAR_REGISTERED',
      title: 'Yangi olim ro‘yxatdan o‘tdi',
      message: `${result.profile.fullName} (${normalizedEmail}) tasdiqlash uchun ariza topshirdi.`,
      link: '/admin/scholars',
    });

    return NextResponse.json({ success: true, userId: result.user.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
