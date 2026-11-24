import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get or create moderator's scholar profile
    let profile = await prisma.scholarProfile.findUnique({
      where: { userId: user.id },
      include: {
        department: {
          include: { faculty: true },
        },
      },
    });

    if (!profile) {
      const defaultDept = await prisma.department.findFirst({
        include: { faculty: true },
      });
      if (defaultDept) {
        profile = await prisma.scholarProfile.create({
          data: {
            userId: user.id,
            fullName: user.name || (user.email?.includes('admin') ? 'TIU Administratsiyasi' : 'TIU Ilmiy Bo‘limi Moderatori'),
            positionUz: 'Ilmiy bo‘lim koordinatori va moderatori',
            departmentId: defaultDept.id,
            academicDegree: 'PHD',
            academicTitle: 'DOCENT',
            publicEmail: user.email,
            phone: '+998 95 131 55 55',
          },
          include: {
            department: {
              include: { faculty: true },
            },
          },
        });
      }
    }

    // 2. Fetch faculties & departments for selector
    const faculties = await prisma.faculty.findMany({
      include: { departments: { orderBy: { nameUz: 'asc' } } },
      orderBy: { nameUz: 'asc' },
    });

    // 3. Official Super Admin Contacts for Rectorate Escalation
    const adminContacts = {
      name: 'TIU Bosh Administratsiyasi',
      title: 'Bosh Administrator & Rektorat',
      phone: '+998 95 131 55 55',
      secondaryPhone: '+998 90 999 88 77',
      telegram: '@tiu_admin',
      telegramLink: 'https://t.me/tiu_admin',
      email: 'admin@tiu.uz',
      office: 'TIU Bosh binosi, 305-xona (Rektorat va Ilmiy boshqarma)',
      workingHours: 'Dushanba - Juma: 09:00 - 18:00',
    };

    // 4. Fetch recent inquiries sent by this moderator
    const recentInquiries = await prisma.auditLog.findMany({
      where: {
        actorId: user.id,
        action: 'ADMIN_INQUIRY',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const parsedInquiries = recentInquiries.map((inq) => {
      let details = {};
      try {
        details = JSON.parse(inq.details || '{}');
      } catch {}
      return {
        id: inq.id,
        createdAt: inq.createdAt,
        subject: details.subject || 'Murojaat',
        category: details.category || 'UMUMIY',
        messageText: details.messageText || '',
        priority: details.priority || 'NORMAL',
        status: 'YUBORILDI',
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
      faculties,
      adminContacts,
      recentInquiries: parsedInquiries,
    });
  } catch (error) {
    console.error('GET /api/admin/profile error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action || 'UPDATE_PROFILE';

    // ----------------------------------------------------
    // 1. UPDATE PASSWORD (Parolni Yangilash)
    // ----------------------------------------------------
    if (action === 'CHANGE_PASSWORD') {
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Hozirgi va yangi parolni kiritish shart' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Yangi parol kamida 8 ta belgidan iborat bo‘lishi lozim' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: 'Yangi parol va tasdiqlovchi parol mos kelmadi' },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser || !dbUser.passwordHash) {
        return NextResponse.json(
          { success: false, error: 'Foydalanuvchi hisobi topilmadi' },
          { status: 404 }
        );
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: 'Hozirgi parol noto‘g‘ri kiritildi!' },
          { status: 400 }
        );
      }

      if (currentPassword === newPassword) {
        return NextResponse.json(
          { success: false, error: 'Yangi parol avvalgi parol bilan bir xil bo‘lishi mumkin emas' },
          { status: 400 }
        );
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });

      // Audit Log for Security
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'PASSWORD_CHANGE',
          entityType: 'USER_SECURITY',
          entityId: user.id,
          details: JSON.stringify({
            changedAt: new Date().toISOString(),
            userEmail: user.email,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Akkaunt paroli muvaffaqiyatli yangilandi! 🔐',
      });
    }

    // ----------------------------------------------------
    // 2. UPDATE EMAIL (Kirish Emaili va Xizmat Emailini Yangilash)
    // ----------------------------------------------------
    if (action === 'CHANGE_EMAIL') {
      const { newEmail, currentPassword } = body;
      const cleanEmail = (newEmail || '').trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'To‘g‘ri email manzilini kiriting' },
          { status: 400 }
        );
      }

      if (cleanEmail === user.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Yangi email amaldagi email bilan bir xil' },
          { status: 400 }
        );
      }

      // Check if current password is provided for email change security
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const isPassValid = await bcrypt.compare(currentPassword || '', dbUser?.passwordHash || '');
      if (!isPassValid) {
        return NextResponse.json(
          { success: false, error: 'Emailni o‘zgartirish uchun amaldagi parolingizni to‘g‘ri kiriting' },
          { status: 400 }
        );
      }

      // Check if another user has this email
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Ushbu email manzili boshqa foydalanuvchi tomonidan band qilingan' },
          { status: 400 }
        );
      }

      // Update User email and ScholarProfile publicEmail
      await prisma.user.update({
        where: { id: user.id },
        data: { email: cleanEmail },
      });

      await prisma.scholarProfile.updateMany({
        where: { userId: user.id },
        data: { publicEmail: cleanEmail },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'EMAIL_CHANGE',
          entityType: 'USER_SECURITY',
          entityId: user.id,
          details: JSON.stringify({
            oldEmail: user.email,
            newEmail: cleanEmail,
            changedAt: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        newEmail: cleanEmail,
        message: 'Kirish emaili muvaffaqiyatli yangilandi! Yangi email bilan tizimga kirishingiz mumkin. ✉️',
      });
    }

    // ----------------------------------------------------
    // 3. UPDATE PROFILE & CONTACTS (F.I.SH, Telefon, Kafedra, Lavozim)
    // ----------------------------------------------------
    const {
      fullName,
      positionUz,
      departmentId,
      academicDegree,
      academicTitle,
      photoUrl,
      phone,
      publicEmail,
      telegramUsername,
      bioUz,
    } = body;

    let profile = await prisma.scholarProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      const defaultDept = await prisma.department.findFirst();
      profile = await prisma.scholarProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || 'TIU Moderatori',
          departmentId: departmentId || defaultDept?.id,
          phone: phone || null,
        },
      });
    }

    const updated = await prisma.scholarProfile.update({
      where: { id: profile.id },
      data: {
        fullName: fullName || profile.fullName,
        positionUz: positionUz !== undefined ? positionUz : profile.positionUz,
        departmentId: departmentId || profile.departmentId,
        academicDegree: academicDegree || profile.academicDegree,
        academicTitle: academicTitle || profile.academicTitle,
        photoUrl: photoUrl !== undefined ? photoUrl : profile.photoUrl,
        phone: phone !== undefined ? phone : profile.phone,
        publicEmail: publicEmail !== undefined ? publicEmail : profile.publicEmail,
        telegramUsername: telegramUsername !== undefined ? telegramUsername : profile.telegramUsername,
        bioUz: bioUz !== undefined ? bioUz : profile.bioUz,
      },
      include: {
        department: {
          include: { faculty: true },
        },
      },
    });

    // Audit Log for Profile Change
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_PROFILE',
        entityType: 'SCHOLAR_PROFILE',
        entityId: profile.id,
        details: JSON.stringify({
          fullName: updated.fullName,
          phone: updated.phone,
          positionUz: updated.positionUz,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: 'Moderator profil sozlamalari muvaffaqiyatli saqlandi! ✅',
    });
  } catch (error) {
    console.error('PUT /api/admin/profile error:', error);
    return NextResponse.json({ success: false, error: 'Saqlashda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireModeratorOrAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      subject = '',
      category = 'TEXNIK_MUAMMO',
      messageText = '',
      priority = 'NORMAL',
    } = body;

    if (!subject.trim() || !messageText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mavzu va xabar matni kiritilishi shart' },
        { status: 400 }
      );
    }

    // 1. Log to AuditLog as inquiry
    const auditRecord = await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'ADMIN_INQUIRY',
        entityType: 'INQUIRY',
        entityId: `inq-${Date.now()}`,
        details: JSON.stringify({
          subject: subject.trim(),
          category,
          messageText: messageText.trim(),
          priority,
          sentBy: user.email,
          sentAt: new Date().toISOString(),
        }),
      },
    });

    // 2. Notify all Super Admins in portal notifications
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, scholarProfile: { select: { telegramChatId: true } } },
    });

    const categoryNames = {
      TEXNIK_MUAMMO: '🛠 Texnik muammo',
      RUXSAT_SOROVI: '🔐 Tizim ruxsatlari so‘rovi',
      ILMIY_YONALISH: '📚 Yangi ilmiy yo‘nalish / Grant',
      SHOSHILINCH: '🚨 Favqulodda / Shoshilinch',
    };
    const catLabel = categoryNames[category] || 'Murojaat';

    for (const sa of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: sa.id,
          title: `📩 Moderator Murojaati: [${catLabel}] ${subject.trim()}`,
          message: `${user.email}: ${messageText.trim().slice(0, 150)}`,
          type: 'SYSTEM',
          link: '/admin/profile',
        },
      }).catch(() => {});

      // If Super Admin has Telegram linked, send direct message
      if (sa.scholarProfile?.telegramChatId) {
        await sendTelegramMessage({
          chatId: sa.scholarProfile.telegramChatId,
          text: `🏛 <b>Bosh Adminga Yangi Moderator Murojaati!</b>\n\n📌 <b>Mavzu:</b> [${catLabel}] ${subject.trim()}\n👤 <b>Yuboruvchi:</b> ${user.email}\n🚨 <b>Muhimlik:</b> ${priority}\n\n💬 <b>Matn:</b>\n${messageText.trim()}`,
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      inquiryId: auditRecord.id,
      message: 'Murojaatingiz Bosh Administratorga muvaffaqiyatli yetkazildi! Tez orada ko‘rib chiqiladi. ✅',
    });
  } catch (error) {
    console.error('POST /api/admin/profile inquiry error:', error);
    return NextResponse.json({ success: false, error: 'Xabar yuborishda xatolik' }, { status: 500 });
  }
}
