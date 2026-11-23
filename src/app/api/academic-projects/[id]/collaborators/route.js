import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendCollaborationInviteTelegram } from '@/lib/telegram';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            scholarProfile: {
              select: {
                fullName: true,
                photoUrl: true,
                academicDegree: true,
                academicTitle: true,
                telegramUsername: true,
                isTelegramConnected: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: collaborators });
  } catch (err) {
    console.error('GET collaborators error:', err);
    return NextResponse.json({ success: false, error: 'Hammualliflarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await prisma.academicProject.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          include: { scholarProfile: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Loyiha topilmadi' }, { status: 404 });
    }

    // Only project creator or corresponding author can invite
    if (project.creatorId !== user.id) {
      return NextResponse.json({ success: false, error: 'Faqat loyiha egasi hammuallif taklif qila oladi' }, { status: 403 });
    }

    const body = await req.json();
    const {
      scholarEmail,
      scholarName,
      role = 'CO_AUTHOR',
      creditRoles = [],
      sharePercent = 0.0,
      assignedSection = '',
    } = body;

    const email = (scholarEmail || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Hammuallif emaili kiritilishi shart' }, { status: 400 });
    }

    // Check if already invited
    const existing = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        scholarEmail: email,
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Ushbu foydalanuvchi allaqachon loyihaga qo‘shilgan' }, { status: 400 });
    }

    // Find existing user in TIU scholars
    const invitedUser = await prisma.user.findUnique({
      where: { email },
      include: { scholarProfile: true },
    });

    const inviteToken = crypto.randomBytes(24).toString('hex');
    const finalScholarName =
      scholarName || invitedUser?.scholarProfile?.fullName || email.split('@')[0];

    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: invitedUser?.id || null,
        scholarEmail: email,
        scholarName: finalScholarName,
        role,
        creditRoles: Array.isArray(creditRoles) ? JSON.stringify(creditRoles) : creditRoles,
        sharePercent: parseFloat(sharePercent) || 0.0,
        assignedSection: assignedSection || null,
        inviteStatus: 'PENDING',
        inviteToken,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            scholarProfile: true,
          },
        },
      },
    });

    // 1. In-app notification
    if (invitedUser) {
      await prisma.notification.create({
        data: {
          userId: invitedUser.id,
          title: '🤝 Yangi hammualliflik taklifi',
          message: `${project.creator?.scholarProfile?.fullName || 'Olim'} sizni «${project.title}» loyihasiga hammuallif sifatida taklif qildi.`,
          type: 'SYSTEM',
          link: '/dashboard/academic-projects',
        },
      }).catch(() => {});
    }

    // 2. Telegram Bot notification with interactive buttons
    const recipientChatId = invitedUser?.scholarProfile?.telegramChatId;
    let telegramSent = false;
    if (recipientChatId) {
      const senderName = project.creator?.scholarProfile?.fullName || 'TIU Tadqiqotchisi';
      const creditStr = Array.isArray(creditRoles) ? creditRoles.join(', ') : '';
      
      const res = await sendCollaborationInviteTelegram({
        recipientChatId,
        senderName,
        projectTitle: project.title,
        projectType: project.type,
        role,
        creditRoles: creditStr,
        sharePercent: parseFloat(sharePercent) || 0,
        inviteToken,
      });

      if (res && res.ok) {
        telegramSent = true;
      }
    }

    return NextResponse.json({
      success: true,
      data: collaborator,
      telegramSent,
      message: telegramSent
        ? 'Hammualliflik taklifi yuborildi va Telegram orqali tasdiqlash tugmalari yetkazildi!'
        : 'Hammualliflik taklifi muvaffaqiyatli yuborildi.',
    });
  } catch (err) {
    console.error('POST /collaborators error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Taklif yuborishda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const url = new URL(req.url);
    const collaboratorId = url.searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json({ success: false, error: 'collaboratorId berilmadi' }, { status: 400 });
    }

    const project = await prisma.academicProject.findUnique({ where: { id: projectId } });
    if (!project || project.creatorId !== user.id) {
      return NextResponse.json({ success: false, error: 'Faqat loyiha egasi aʼzolarni o‘chira oladi' }, { status: 403 });
    }

    await prisma.projectCollaborator.delete({
      where: { id: collaboratorId },
    });

    return NextResponse.json({ success: true, message: 'Hammuallif o‘chirildi' });
  } catch (err) {
    console.error('DELETE collaborator error:', err);
    return NextResponse.json({ success: false, error: 'O‘chirishda xatolik' }, { status: 500 });
  }
}
