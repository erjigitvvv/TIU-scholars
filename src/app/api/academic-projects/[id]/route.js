import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.academicProject.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            scholarProfile: {
              select: {
                fullName: true,
                photoUrl: true,
                academicDegree: true,
                academicTitle: true,
              },
            },
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                scholarProfile: {
                  select: {
                    fullName: true,
                    photoUrl: true,
                    telegramUsername: true,
                    isTelegramConnected: true,
                  },
                },
              },
            },
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Loyiha topilmadi' }, { status: 404 });
    }

    // Check permission
    const isMember =
      project.creatorId === user.id ||
      project.collaborators.some((c) => c.userId === user.id || c.scholarEmail === user.email);

    if (!isMember) {
      return NextResponse.json({ success: false, error: 'Ushbu loyihaga kirish huquqingiz yo‘q' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error('GET /api/academic-projects/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.academicProject.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Loyiha topilmadi' }, { status: 404 });
    }

    const isMember =
      project.creatorId === user.id ||
      project.collaborators.some((c) => (c.userId === user.id || c.scholarEmail === user.email) && c.inviteStatus === 'ACCEPTED');

    if (!isMember) {
      return NextResponse.json({ success: false, error: 'Tahrirlash huquqi mavjud emas' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      abstract,
      keywords,
      targetJournal,
      targetConference,
      grantFunder,
      budgetTotal,
      doi,
      contentBlocks,
      referencesList,
      status,
      createVersionTag,
      versionChangesSummary,
    } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (abstract !== undefined) updateData.abstract = abstract;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (targetJournal !== undefined) updateData.targetJournal = targetJournal;
    if (targetConference !== undefined) updateData.targetConference = targetConference;
    if (grantFunder !== undefined) updateData.grantFunder = grantFunder;
    if (budgetTotal !== undefined) updateData.budgetTotal = budgetTotal ? parseFloat(budgetTotal) : null;
    if (doi !== undefined) updateData.doi = doi;
    if (contentBlocks !== undefined) {
      updateData.contentBlocks = typeof contentBlocks === 'string' ? contentBlocks : JSON.stringify(contentBlocks);
    }
    if (referencesList !== undefined) {
      updateData.referencesList = typeof referencesList === 'string' ? referencesList : JSON.stringify(referencesList);
    }
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.academicProject.update({
      where: { id },
      data: updateData,
    });

    if (createVersionTag) {
      await prisma.projectVersion.create({
        data: {
          projectId: id,
          versionTag: createVersionTag,
          changesSummary: versionChangesSummary || 'Yangi oraliq versiya saqlandi.',
          createdById: user.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /api/academic-projects/[id] error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Saqlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.academicProject.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Loyiha topilmadi' }, { status: 404 });
    }

    if (project.creatorId !== user.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Faqat loyiha egasi uni o‘chira oladi' }, { status: 403 });
    }

    await prisma.academicProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Loyiha muvaffaqiyatli o‘chirildi' });
  } catch (err) {
    console.error('DELETE /api/academic-projects/[id] error:', err);
    return NextResponse.json({ success: false, error: 'O‘chirishda xatolik' }, { status: 500 });
  }
}
