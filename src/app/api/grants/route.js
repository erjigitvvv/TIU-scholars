import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';

    const where = {};
    if (status === 'ACTIVE' || status === 'ONGOING') {
      where.status = { in: ['APPROVED', 'WON', 'APPROVED_BY_MODERATOR', 'SUBMITTED_FUNDER', 'UNDER_EVALUATION', 'PENDING'] };
    } else if (status !== 'ALL') {
      where.status = status;
    }

    const grants = await prisma.grantProject.findMany({
      where,
      include: {
        scholar: {
          select: {
            id: true,
            fullName: true,
            photoUrl: true,
            academicDegree: true,
            academicTitle: true,
            department: {
              select: {
                id: true,
                nameUz: true,
                nameRu: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: [{ startYear: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, grants });
  } catch (error) {
    console.error('GET /api/grants error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Grant arizasi yuborish uchun tizimga kirishingiz lozim' },
        { status: 401 }
      );
    }

    if (!user.scholarProfile) {
      return NextResponse.json(
        { success: false, error: 'Faqat ilmiy xodim yoki olim profiliga ega foydalanuvchilar grant arizasi topshira oladi' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      comment,
      description,
      fundingSource = 'O‘zbekiston Respublikasi Innovatsion rivojlanish agentligi',
      grantProgram = 'Amaliy tadqiqotlar loyihalari',
      budgetRequested = 0,
      applicationFileUrl = null,
      applicationFileName = null,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Loyiha mavzusi / sarlavhasi kiritilishi shart' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const count = await prisma.grantProject.count();
    const grantCode = `TIU-GRT-${year}-${String(count + 1).padStart(4, '0')}`;

    const izoh = (comment || description || '').trim();

    const grant = await prisma.grantProject.create({
      data: {
        scholarId: user.scholarProfile.id,
        grantCode,
        title: title.trim(),
        role: 'Principal Investigator',
        fundingSource: (fundingSource || 'Innovatsion rivojlanish agentligi').trim(),
        grantProgram: grantProgram ? grantProgram.trim() : null,
        startYear: year,
        endYear: year + 2,
        budgetRequested: budgetRequested ? parseFloat(budgetRequested) : null,
        status: 'PENDING',
        proposalData: JSON.stringify({
          comment: izoh,
          urgency: izoh,
        }),
        applicationFileUrl: applicationFileUrl || null,
        applicationFileName: applicationFileName || null,
        deliverables: JSON.stringify([]),
      },
      include: {
        scholar: {
          select: {
            id: true,
            fullName: true,
            academicDegree: true,
            department: { select: { nameUz: true } },
          },
        },
      },
    });

    // Notify moderators about the new pending grant application
    const moderators = await prisma.user.findMany({
      where: { role: { in: ['MODERATOR', 'SUPER_ADMIN'] } },
      select: { id: true },
    });

    for (const mod of moderators) {
      await prisma.notification.create({
        data: {
          userId: mod.id,
          type: 'SYSTEM',
          title: 'Yangi Grant Arizasi Moderatsiyaga tushdi',
          message: `${user.scholarProfile.fullName} «${title.trim()}» mavzusida yangi grant arizasini taqdim etdi.`,
          link: '/admin/moderation?type=grants&status=PENDING',
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      grant,
      message: 'Grant arizangiz muvaffaqiyatli qabul qilindi va moderator ko‘rigiga yuborildi! Tasdiqlangach olimlar bo‘limida e’lon qilinadi.',
    });
  } catch (error) {
    console.error('POST /api/grants error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server xatosi' }, { status: 500 });
  }
}
