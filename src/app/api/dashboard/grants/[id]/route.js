import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.scholarProfile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const grant = await prisma.grantProject.findUnique({
      where: { id },
      include: {
        scholar: {
          select: {
            fullName: true,
            academicDegree: true,
            academicTitle: true,
            department: { select: { nameUz: true } },
          },
        },
      },
    });

    if (!grant) {
      return NextResponse.json({ success: false, error: 'Grant topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true, grant });
  } catch (error) {
    console.error('GET grant error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !user.scholarProfile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const grant = await prisma.grantProject.findUnique({ where: { id } });
    if (!grant || grant.scholarId !== user.scholarProfile.id) {
      return NextResponse.json({ success: false, error: 'Grant topilmadi yoki ruxsat yo‘q' }, { status: 404 });
    }

    const body = await request.json();
    const updateData = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.role !== undefined) updateData.role = body.role;
    if (body.fundingSource !== undefined) updateData.fundingSource = body.fundingSource;
    if (body.grantProgram !== undefined) updateData.grantProgram = body.grantProgram;
    if (body.startYear !== undefined) updateData.startYear = parseInt(body.startYear, 10);
    if (body.endYear !== undefined) updateData.endYear = body.endYear ? parseInt(body.endYear, 10) : null;
    if (body.budgetRequested !== undefined) updateData.budgetRequested = parseFloat(body.budgetRequested) || null;
    if (body.budgetApproved !== undefined) updateData.budgetApproved = parseFloat(body.budgetApproved) || null;
    if (body.deadlineDate !== undefined) updateData.deadlineDate = body.deadlineDate ? new Date(body.deadlineDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason;

    if (body.applicationFileUrl !== undefined) updateData.applicationFileUrl = body.applicationFileUrl;
    if (body.applicationFileName !== undefined) updateData.applicationFileName = body.applicationFileName;

    if (body.proposalData !== undefined) {
      updateData.proposalData = typeof body.proposalData === 'string' ? body.proposalData : JSON.stringify(body.proposalData);
    }
    if (body.budgetItems !== undefined) {
      updateData.budgetItems = typeof body.budgetItems === 'string' ? body.budgetItems : JSON.stringify(body.budgetItems);
    }
    if (body.teamMembers !== undefined) {
      updateData.teamMembers = typeof body.teamMembers === 'string' ? body.teamMembers : JSON.stringify(body.teamMembers);
    }
    if (body.documentsList !== undefined) {
      updateData.documentsList = typeof body.documentsList === 'string' ? body.documentsList : JSON.stringify(body.documentsList);
    }
    if (body.deliverables !== undefined) {
      updateData.deliverables = typeof body.deliverables === 'string' ? body.deliverables : JSON.stringify(body.deliverables);
    }

    const updated = await prisma.grantProject.update({
      where: { id },
      data: updateData,
    });

    if (body.status === 'SUBMITTED_INTERNAL') {
      const moderators = await prisma.user.findMany({
        where: { role: { in: ['MODERATOR', 'SUPER_ADMIN'] } },
        select: { id: true },
      });
      for (const m of moderators) {
        await prisma.notification
          .create({
            data: {
              userId: m.id,
              type: 'GRANT_SUBMITTED',
              title: '💼 Grant Arizasi Ekspertizaga Topshirildi!',
              message: `${user.scholarProfile.fullName} tomonidan [${updated.grantCode || 'GRANT'}] "${updated.title}" grant loyihasi Ilmiy Bo‘lim ko‘rigiga yuborildi.`,
              link: '/admin/moderation?type=grants',
            },
          })
          .catch(() => {});
      }
    }

    return NextResponse.json({ success: true, grant: updated });
  } catch (error) {
    console.error('Update grant error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server xatosi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !user.scholarProfile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const grant = await prisma.grantProject.findUnique({ where: { id } });
    if (!grant || grant.scholarId !== user.scholarProfile.id) {
      return NextResponse.json({ success: false, error: 'Grant topilmadi' }, { status: 404 });
    }

    await prisma.grantProject.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Grant loyihasi o‘chirildi' });
  } catch (error) {
    console.error('Delete grant error:', error);
    return NextResponse.json({ success: false, error: 'O‘chirishda xatolik' }, { status: 500 });
  }
}
