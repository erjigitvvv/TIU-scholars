import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

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
                    telegramChatId: true,
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
      user.role === 'MODERATOR' ||
      user.role === 'SUPER_ADMIN' ||
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
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                scholarProfile: { select: { telegramChatId: true } },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Loyiha topilmadi' }, { status: 404 });
    }

    const isMember =
      project.creatorId === user.id ||
      user.role === 'MODERATOR' ||
      user.role === 'SUPER_ADMIN' ||
      project.collaborators.some(
        (c) => (c.userId === user.id || c.scholarEmail === user.email) && c.inviteStatus === 'ACCEPTED'
      );

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

    // If submitted for moderation, alert moderators and co-authors
    if (status === 'IN_REVIEW' || status === 'SUBMITTED') {
      // 1. Notify moderators & super admins
      const moderators = await prisma.user.findMany({
        where: { role: { in: ['MODERATOR', 'SUPER_ADMIN'] } },
        select: { id: true, scholarProfile: { select: { telegramChatId: true } } },
      });

      for (const m of moderators) {
        await prisma.notification.create({
          data: {
            userId: m.id,
            title: `📚 Yangi Ilmiy Loyiha Ekspertizaga Topshirildi!`,
            message: `[${updated.code}] "${updated.title}" ilmiy ishi ko‘rib chiqish navbatiga kiritildi.`,
            type: 'PROJECT',
            link: `/admin/moderation?type=academic-projects`,
          },
        }).catch(() => {});

        if (m.scholarProfile?.telegramChatId) {
          await sendTelegramMessage({
            chatId: m.scholarProfile.telegramChatId,
            text: `🏛 <b>TIU Ilmiy Bo‘limi: Yangi Ilmiy Loyiha Ekspertizaga Keldi!</b>\n\n📌 <b>Loyiha kodi:</b> <code>${updated.code}</code>\n📝 <b>Mavzu:</b> ${updated.title}\n👤 <b>Topshiruvchi:</b> ${user.email}\n🎯 <b>Yo‘nalishi:</b> ${updated.type}\n\n🔍 <i>Ko‘rib chiqish uchun ilmiy bo‘lim paneliga kiring.</i>`,
          }).catch(() => {});
        }
      }

      // 2. Notify collaborators
      for (const c of project.collaborators) {
        if (c.user?.id && c.user.id !== user.id) {
          await prisma.notification.create({
            data: {
              userId: c.user.id,
              title: `🚀 Loyiha Ekspertizaga Topshirildi`,
              message: `Siz hammuallif bo‘lgan [${updated.code}] loyihasi TIU Ilmiy bo‘limiga topshirildi.`,
              type: 'PROJECT',
              link: `/dashboard/academic-projects`,
            },
          }).catch(() => {});

          if (c.user.scholarProfile?.telegramChatId) {
            await sendTelegramMessage({
              chatId: c.user.scholarProfile.telegramChatId,
              text: `🔔 <b>Hammualliflik Xabarnomasi:</b>\n\nSiz hammuallif bo‘lgan <b>"${updated.title}"</b> loyihasi TIU Ilmiy Bo‘limi moderatorlariga ekspertiza uchun topshirildi! ✅`,
            }).catch(() => {});
          }
        }
      }

      // 3. Log to AuditLog
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'PROJECT_SUBMIT_MODERATION',
          entityType: 'ACADEMIC_PROJECT',
          entityId: updated.id,
          details: JSON.stringify({
            code: updated.code,
            title: updated.title,
            submittedAt: new Date().toISOString(),
          }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        status === 'IN_REVIEW' || status === 'SUBMITTED'
          ? 'Loyiha TIU Ilmiy Bo‘limi (Moderator) ko‘rib chiqish navbatiga muvaffaqiyatli topshirildi! 🚀'
          : 'Loyiha muvaffaqiyatli saqlandi!',
    });
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
