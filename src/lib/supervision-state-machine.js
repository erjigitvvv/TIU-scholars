import { prisma } from './prisma.js';
import { recalculateScholarMetrics } from './scoring.js';

export const SUPERVISION_STAGES = {
  A_DRAFT: 'A_DRAFT',
  A_SUBMITTED_DEPARTMENT: 'A_SUBMITTED_DEPARTMENT',
  A_DEPARTMENT_APPROVED: 'A_DEPARTMENT_APPROVED',
  B_ACTIVE_RESEARCH: 'B_ACTIVE_RESEARCH',
  C_PUBLICATIONS_READY: 'C_PUBLICATIONS_READY',
  D_PRE_DEFENSE: 'D_PRE_DEFENSE',
  E_COMPLETED: 'E_COMPLETED',
  ON_HOLD: 'ON_HOLD',
  TERMINATED: 'TERMINATED',
};

export const STAGE_META = {
  A_DRAFT: {
    code: 'A_DRAFT',
    labelUz: 'Qoralama (A qism)',
    labelRu: 'Черновик (Часть A)',
    labelEn: 'Draft (Part A)',
    group: 'A',
    isShort: true,
    color: 'slate',
    nextActionTitleUz: 'Kafedraga yuborish',
  },
  A_SUBMITTED_DEPARTMENT: {
    code: 'A_SUBMITTED_DEPARTMENT',
    labelUz: 'Kafedra ko‘rib chiqmoqda (A qism)',
    labelRu: 'На рассмотрении кафедры (Часть A)',
    labelEn: 'Department Review (Part A)',
    group: 'A',
    isShort: true,
    color: 'amber',
    nextActionTitleUz: 'Kafedra qarorini kutish',
  },
  A_DEPARTMENT_APPROVED: {
    code: 'A_DEPARTMENT_APPROVED',
    labelUz: 'Buyruq kutilmoqda (A qism)',
    labelRu: 'Ожидает приказа (Часть A)',
    labelEn: 'Awaiting Order (Part A)',
    group: 'A',
    isShort: true,
    color: 'cyan',
    nextActionTitleUz: 'Rektorat buyrug‘ini kutish',
  },
  B_ACTIVE_RESEARCH: {
    code: 'B_ACTIVE_RESEARCH',
    labelUz: 'Faol tadqiqot & Reja (B qism)',
    labelRu: 'Активное исследование (Часть B)',
    labelEn: 'Active Research (Part B)',
    group: 'B',
    isShort: false,
    color: 'indigo',
    nextActionTitleUz: 'Oraliq hisobot yuborish',
  },
  C_PUBLICATIONS_READY: {
    code: 'C_PUBLICATIONS_READY',
    labelUz: 'Nashrlar talabi bajarilgan (C qism)',
    labelRu: 'Публикации готовы (Часть C)',
    labelEn: 'Publications Ready (Part C)',
    group: 'C',
    isShort: false,
    color: 'purple',
    nextActionTitleUz: 'Himoya oldi bosqichiga o‘tkazish',
  },
  D_PRE_DEFENSE: {
    code: 'D_PRE_DEFENSE',
    labelUz: 'Himoya oldi & Checklist (D qism)',
    labelRu: 'Предзащита (Часть D)',
    labelEn: 'Pre-Defense (Part D)',
    group: 'D',
    isShort: true,
    color: 'emerald',
    nextActionTitleUz: 'Himoyaga qabul qilish',
  },
  E_COMPLETED: {
    code: 'E_COMPLETED',
    labelUz: 'Muvaffaqiyatli himoya qilingan (E qism)',
    labelRu: 'Успешно защищено (Часть E)',
    labelEn: 'Completed & Defended (Part E)',
    group: 'E',
    isShort: true,
    color: 'green',
    nextActionTitleUz: 'Arxivlangan',
  },
  ON_HOLD: {
    code: 'ON_HOLD',
    labelUz: 'Muzlatilgan (On Hold)',
    labelRu: 'Приостановлено (On Hold)',
    labelEn: 'On Hold',
    group: 'EX',
    isShort: false,
    color: 'rose',
    nextActionTitleUz: 'Tadqiqotni qayta tiklash',
  },
  TERMINATED: {
    code: 'TERMINATED',
    labelUz: 'To‘xtatilgan / Bekor qilingan',
    labelRu: 'Прекращено',
    labelEn: 'Terminated',
    group: 'EX',
    isShort: true,
    color: 'red',
    nextActionTitleUz: 'Yopilgan',
  },
};

/**
 * Valid transitions lookup
 */
const ALLOWED_TRANSITIONS = {
  A_DRAFT: {
    allowedTargets: ['A_SUBMITTED_DEPARTMENT'],
    roles: ['SCHOLAR', 'SUPER_ADMIN'],
  },
  A_SUBMITTED_DEPARTMENT: {
    allowedTargets: ['A_DEPARTMENT_APPROVED', 'A_DRAFT'],
    roles: ['MODERATOR', 'SUPER_ADMIN'], // In TIU, Department Head has MODERATOR or Admin capability
  },
  A_DEPARTMENT_APPROVED: {
    allowedTargets: ['B_ACTIVE_RESEARCH', 'A_DRAFT'],
    roles: ['MODERATOR', 'SUPER_ADMIN'],
  },
  B_ACTIVE_RESEARCH: {
    allowedTargets: ['C_PUBLICATIONS_READY', 'ON_HOLD', 'TERMINATED'],
    roles: ['SCHOLAR', 'MODERATOR', 'SUPER_ADMIN'],
  },
  C_PUBLICATIONS_READY: {
    allowedTargets: ['D_PRE_DEFENSE', 'B_ACTIVE_RESEARCH', 'ON_HOLD', 'TERMINATED'],
    roles: ['SCHOLAR', 'MODERATOR', 'SUPER_ADMIN'],
  },
  D_PRE_DEFENSE: {
    allowedTargets: ['E_COMPLETED', 'C_PUBLICATIONS_READY', 'ON_HOLD', 'TERMINATED'],
    roles: ['MODERATOR', 'SUPER_ADMIN'],
  },
  ON_HOLD: {
    allowedTargets: ['B_ACTIVE_RESEARCH', 'C_PUBLICATIONS_READY', 'D_PRE_DEFENSE', 'TERMINATED'],
    roles: ['MODERATOR', 'SUPER_ADMIN'],
  },
  TERMINATED: {
    allowedTargets: [],
    roles: ['SUPER_ADMIN'],
  },
  E_COMPLETED: {
    allowedTargets: [],
    roles: ['SUPER_ADMIN'],
  },
};

/**
 * Generate default academic milestones when entering B_ACTIVE_RESEARCH
 */
async function generateInitialMilestones(tx, supervisionId, startDate, degreeType) {
  const baseDate = startDate ? new Date(startDate) : new Date();
  const isMaster = String(degreeType).toUpperCase() === 'MASTER';
  const durationYears = isMaster ? 2 : 3;

  // 1. Shaxsiy reja
  const planDue = new Date(baseDate);
  planDue.setDate(planDue.getDate() + 30);

  // 2. 1-attestatsiya
  const att1Due = new Date(baseDate);
  att1Due.setMonth(att1Due.getMonth() + 6);

  // 3. 2-attestatsiya (1-yil yakuni)
  const att2Due = new Date(baseDate);
  att2Due.setFullYear(att2Due.getFullYear() + 1);

  // 4. Pre-defense
  const preDefenseDue = new Date(baseDate);
  preDefenseDue.setFullYear(preDefenseDue.getFullYear() + durationYears);
  preDefenseDue.setMonth(preDefenseDue.getMonth() - 3);

  // 5. Final Defense
  const defenseDue = new Date(baseDate);
  defenseDue.setFullYear(defenseDue.getFullYear() + durationYears);

  const milestonesData = [
    {
      supervisionId,
      title: 'Shaxsiy ish rejasini kafedrada tasdiqlash',
      stage: 'B_ACTIVE_RESEARCH',
      dueDate: planDue,
      notes: 'Kafedra yig‘ilishi bayonnomasi bilan tasdiqlanishi shart.',
    },
    {
      supervisionId,
      title: '1-yarim yillik monitoring & attestatsiya',
      stage: 'B_ACTIVE_RESEARCH',
      dueDate: att1Due,
      notes: 'Adabiyotlar tahlili va 1-bob qoralamasi.',
    },
    {
      supervisionId,
      title: '1-yil yakuniy hisoboti va 1-OAK maqolasi',
      stage: 'B_ACTIVE_RESEARCH',
      dueDate: att2Due,
      notes: '1-yilgi attestatsiya xulosasi.',
    },
    {
      supervisionId,
      title: 'Kafedra dastlabki muhokamasi (Pre-defense)',
      stage: 'D_PRE_DEFENSE',
      dueDate: preDefenseDue,
      notes: 'Dissertatsiyaning to‘liq matni va antiplagiat tekshiruvi.',
    },
    {
      supervisionId,
      title: 'Rasmiy Ilmiy Kengash himoyasi',
      stage: 'E_COMPLETED',
      dueDate: defenseDue,
      notes: 'OAK diplomi va himoya qarori.',
    },
  ];

  await tx.supervisionMilestone.createMany({
    data: milestonesData,
  });

  // Also ensure checklist initialized
  const existingChecklist = await tx.supervisionChecklist.findUnique({
    where: { supervisionId },
  });
  if (!existingChecklist) {
    await tx.supervisionChecklist.create({
      data: { supervisionId },
    });
  }
}

/**
 * THE SINGLE CENTRAL STATE TRANSITION ENGINE
 * Executes 4 critical operations:
 * 1. Checks actor role (RBAC)
 * 2. Validates allowed stage transition
 * 3. Writes structured entry to AuditLog
 * 4. Dispatches internal Notification
 */
export async function transitionSupervisionStage({
  supervisionId,
  targetStage,
  actorUser,
  payload = {},
}) {
  if (!supervisionId || !targetStage || !actorUser) {
    throw new Error('supervisionId, targetStage va actorUser talab qilinadi.');
  }

  // 1. Fetch current supervision
  const current = await prisma.supervision.findUnique({
    where: { id: supervisionId },
    include: {
      scholar: {
        include: { user: true, department: true },
      },
      checklist: true,
      publications: true,
    },
  });

  if (!current) {
    throw new Error(`Ilmiy rahbarlik yozuvi topilmadi: ${supervisionId}`);
  }

  const fromStage = current.stage || SUPERVISION_STAGES.A_DRAFT;

  // If already at targetStage
  if (fromStage === targetStage) {
    return current;
  }

  // 2. Validate transition permission
  const transitionConfig = ALLOWED_TRANSITIONS[fromStage];
  if (!transitionConfig) {
    throw new Error(`Bosqichdan chiqish qoidalari topilmadi: ${fromStage}`);
  }

  // Check if targetStage is in allowed list
  if (!transitionConfig.allowedTargets.includes(targetStage)) {
    throw new Error(
      `Noto‘g‘ri bosqich o‘tishi: ${fromStage} dan ${targetStage} ga o‘tishga ruxsat yo‘q.`
    );
  }

  // Check role authorization
  const actorRole = actorUser.role || 'SCHOLAR';
  const hasRole =
    transitionConfig.roles.includes(actorRole) || actorRole === 'SUPER_ADMIN';

  // If actor is SCHOLAR, ensure they own this supervision record
  if (actorRole === 'SCHOLAR' && current.scholar.userId !== actorUser.id) {
    throw new Error('Siz faqat o‘z ilmiy rahbarligingizdagi shogirdlar bosqichini boshqara olasiz.');
  }

  if (!hasRole) {
    throw new Error(
      `Ushbu o‘tishni bajarish uchun sizda yetarli huquq yo‘q. Talab qilinadigan rol: ${transitionConfig.roles.join(', ')}`
    );
  }

  // 3. Domain validation per target stage
  if (targetStage === SUPERVISION_STAGES.B_ACTIVE_RESEARCH) {
    if (!payload.orderNumber && !current.orderNumber) {
      throw new Error('FAOL (B qism) ga o‘tish uchun Rektor buyrug‘i raqami (orderNumber) kiritilishi shart.');
    }
  }

  if (targetStage === SUPERVISION_STAGES.D_PRE_DEFENSE) {
    // Check if checklist has items uploaded or confirmed
    if (current.checklist && !current.checklist.isDissertationReady && !payload.force) {
      // Warning or soft check
    }
  }

  if (targetStage === SUPERVISION_STAGES.E_COMPLETED) {
    if (!payload.actualDefenseDate && !payload.defenseCouncilNo) {
      // Must have defense details
    }
  }

  // 4. Perform database transaction with side-effects
  const updatedSupervision = await prisma.$transaction(async (tx) => {
    const updateData = {
      stage: targetStage,
    };

    // Additional payload updates
    if (payload.orderNumber) updateData.orderNumber = payload.orderNumber;
    if (payload.orderDate) updateData.orderDate = new Date(payload.orderDate);
    if (payload.orderFileUrl) updateData.orderFileUrl = payload.orderFileUrl;
    if (payload.expectedDefenseDate) updateData.expectedDefenseDate = new Date(payload.expectedDefenseDate);

    // If starting active research
    if (targetStage === SUPERVISION_STAGES.B_ACTIVE_RESEARCH) {
      updateData.startDate = payload.orderDate ? new Date(payload.orderDate) : new Date();
      updateData.status = 'PENDING'; // Still pending final defense
    }

    // If rejecting back to draft
    if (targetStage === SUPERVISION_STAGES.A_DRAFT && payload.reason) {
      updateData.rejectionReason = payload.reason;
    }

    // If Terminated
    if (targetStage === SUPERVISION_STAGES.TERMINATED) {
      updateData.status = 'REJECTED';
      if (payload.reason) updateData.rejectionReason = payload.reason;
    }

    // If Completed Defense
    if (targetStage === SUPERVISION_STAGES.E_COMPLETED) {
      updateData.status = 'APPROVED'; // <--- Critical for scoring engine!
      updateData.actualDefenseDate = payload.actualDefenseDate ? new Date(payload.actualDefenseDate) : new Date();
      if (payload.defenseCouncilNo) updateData.defenseCouncilNo = payload.defenseCouncilNo;
      if (payload.diplomaNumber) updateData.diplomaNumber = payload.diplomaNumber;
      if (payload.diplomaFileUrl) updateData.diplomaFileUrl = payload.diplomaFileUrl;
    }

    // Execute update
    const supUpdated = await tx.supervision.update({
      where: { id: supervisionId },
      data: updateData,
    });

    // Auto-generate Milestones when transitioning to B_ACTIVE_RESEARCH
    if (targetStage === SUPERVISION_STAGES.B_ACTIVE_RESEARCH) {
      await generateInitialMilestones(tx, supervisionId, updateData.startDate, current.degreeType);
    }

    // 5. AuditLog entry
    await tx.auditLog.create({
      data: {
        actorId: actorUser.id,
        action: 'SUPERVISION_STAGE_TRANSITION',
        entityType: 'Supervision',
        entityId: supervisionId,
        details: JSON.stringify({
          fromStage,
          toStage: targetStage,
          studentName: current.studentName,
          scholarId: current.scholarId,
          reason: payload.reason || null,
          payload,
        }),
      },
    });

    // 6. Notification creation
    const scholarUserId = current.scholar.userId;
    const stageName = STAGE_META[targetStage]?.labelUz || targetStage;
    
    // Always notify the scholar if someone else moved the stage
    if (scholarUserId !== actorUser.id) {
      await tx.notification.create({
        data: {
          userId: scholarUserId,
          type: 'INFO',
          title: 'Ilmiy rahbarlik bosqichi yangilandi',
          message: `Sizning izlanuvchingiz "${current.studentName}" bo‘yicha yangi bosqich: ${stageName}`,
          link: `/dashboard/supervisions/${supervisionId}`,
        },
      });
    }

    // If scholar submitted to department, notify department head / moderator
    if (targetStage === SUPERVISION_STAGES.A_SUBMITTED_DEPARTMENT) {
      const moderators = await tx.user.findMany({
        where: { role: { in: ['MODERATOR', 'SUPER_ADMIN'] } },
        select: { id: true },
        take: 5,
      });

      for (const mod of moderators) {
        await tx.notification.create({
          data: {
            userId: mod.id,
            type: 'INFO',
            title: 'Yangi ilmiy rahbarlik arizasi',
            message: `${current.scholar.fullName} yangi izlanuvchi (${current.studentName}) uchun ariza yubordi.`,
            link: `/admin/supervisions`,
          },
        });
      }
    }

    return supUpdated;
  });

  // 7. If completed defense, trigger score recalculation outside transaction
  if (targetStage === SUPERVISION_STAGES.E_COMPLETED) {
    try {
      await recalculateScholarMetrics(current.scholarId);
    } catch (err) {
      console.error('Error recalculating metrics after defense:', err);
    }
  }

  return updatedSupervision;
}

