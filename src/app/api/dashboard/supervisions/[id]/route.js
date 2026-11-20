import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { SUPERVISION_STAGES } from '@/lib/supervision-state-machine';

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const supId = resolvedParams.id;

  try {
    const supervision = await prisma.supervision.findUnique({
      where: { id: supId },
      include: {
        scholar: {
          select: {
            id: true,
            fullName: true,
            academicDegree: true,
            academicTitle: true,
            photoUrl: true,
            userId: true,
            tiuScore: true,
            hIndex: true,
            totalCitations: true,
            orcidId: true,
            scopusId: true,
            positionUz: true,
            department: {
              select: {
                id: true,
                nameUz: true,
                nameRu: true,
                nameEn: true,
                faculty: { select: { id: true, nameUz: true, code: true } },
              },
            },
            publications: { select: { id: true } },
          },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        meetings: {
          orderBy: { meetingDate: 'desc' },
        },
        reports: {
          orderBy: { submittedAt: 'desc' },
        },
        publications: {
          include: {
            publication: true,
          },
        },
        checklist: true,
      },
    });

    if (!supervision) {
      return NextResponse.json({ error: 'Supervision topilmadi' }, { status: 404 });
    }

    // Role check: scholar can only view their own unless moderator/admin
    if (user.role === 'SCHOLAR' && supervision.scholar.userId !== user.id) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    return NextResponse.json({ supervision });
  } catch (error) {
    console.error('Supervision GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const supId = resolvedParams.id;

  try {
    const supervision = await prisma.supervision.findUnique({ where: { id: supId } });
    if (!supervision) {
      return NextResponse.json({ error: 'Supervision topilmadi' }, { status: 404 });
    }

    if (user.role === 'SCHOLAR' && (!user.scholarProfile || supervision.scholarId !== user.scholarProfile.id)) {
      return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = {};

    if (body.studentName !== undefined) updateData.studentName = body.studentName;
    if (body.studentEmail !== undefined) updateData.studentEmail = body.studentEmail;
    if (body.studentPhone !== undefined) updateData.studentPhone = body.studentPhone;
    if (body.degreeType !== undefined) updateData.degreeType = body.degreeType;
    if (body.specialtyCode !== undefined) updateData.specialtyCode = body.specialtyCode;
    if (body.specialtyName !== undefined) updateData.specialtyName = body.specialtyName;
    if (body.dissertationTitle !== undefined) updateData.dissertationTitle = body.dissertationTitle;
    if (body.orderNumber !== undefined) updateData.orderNumber = body.orderNumber;
    if (body.orderDate !== undefined) updateData.orderDate = body.orderDate ? new Date(body.orderDate) : null;
    if (body.orderFileUrl !== undefined) updateData.orderFileUrl = body.orderFileUrl;
    if (body.expectedDefenseDate !== undefined) {
      updateData.expectedDefenseDate = body.expectedDefenseDate ? new Date(body.expectedDefenseDate) : null;
    }

    const updated = await prisma.supervision.update({
      where: { id: supId },
      data: updateData,
    });

    return NextResponse.json({ success: true, supervision: updated });
  } catch (error) {
    console.error('Update supervision error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const supId = resolvedParams.id;

  try {
    const supervision = await prisma.supervision.findUnique({ where: { id: supId } });
    if (!supervision) {
      return NextResponse.json({ error: 'Supervision topilmadi' }, { status: 404 });
    }

    if (user.role === 'SCHOLAR' && (!user.scholarProfile || supervision.scholarId !== user.scholarProfile.id)) {
      return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    // Only draft or rejected can be deleted by scholar; completed cannot be deleted
    if (user.role === 'SCHOLAR' && supervision.stage !== SUPERVISION_STAGES.A_DRAFT && supervision.stage !== SUPERVISION_STAGES.TERMINATED) {
      return NextResponse.json(
        { error: 'Faqat qoralama yoki to‘xtatilgan yozuvlarni o‘chirish mumkin.' },
        { status: 403 }
      );
    }

    if (supervision.stage === SUPERVISION_STAGES.E_COMPLETED) {
      return NextResponse.json(
        { error: 'Muvaffaqiyatli himoya qilingan yozuv arxivlangan, uni o‘chirib bo‘lmaydi.' },
        { status: 403 }
      );
    }

    await prisma.supervision.delete({ where: { id: supId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete supervision error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
