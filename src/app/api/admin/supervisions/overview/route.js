import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/auth';
import { SUPERVISION_STAGES } from '@/lib/supervision-state-machine';

export async function GET(request) {
  const adminUser = await requireModeratorOrAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: 'Ruxsat yo‘q (Faqat Moderator yoki Admin)' }, { status: 403 });
  }

  try {
    const now = new Date();

    // 1. Pending approvals
    const pendingApprovals = await prisma.supervision.findMany({
      where: {
        stage: {
          in: [
            SUPERVISION_STAGES.A_SUBMITTED_DEPARTMENT,
            SUPERVISION_STAGES.A_DEPARTMENT_APPROVED,
          ],
        },
      },
      include: {
        scholar: {
          include: {
            department: true,
            supervisions: {
              where: {
                stage: {
                  in: [
                    SUPERVISION_STAGES.A_SUBMITTED_DEPARTMENT,
                    SUPERVISION_STAGES.A_DEPARTMENT_APPROVED,
                    SUPERVISION_STAGES.B_ACTIVE_RESEARCH,
                    SUPERVISION_STAGES.C_PUBLICATIONS_READY,
                    SUPERVISION_STAGES.D_PRE_DEFENSE,
                  ],
                },
              },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Overdue research (Milestones overdue OR expectedDefenseDate passed while not completed)
    const activeSupervisions = await prisma.supervision.findMany({
      where: {
        stage: {
          in: [
            SUPERVISION_STAGES.B_ACTIVE_RESEARCH,
            SUPERVISION_STAGES.C_PUBLICATIONS_READY,
            SUPERVISION_STAGES.D_PRE_DEFENSE,
          ],
        },
      },
      include: {
        scholar: {
          include: { department: true },
        },
        milestones: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
        meetings: {
          orderBy: { meetingDate: 'desc' },
          take: 1,
        },
      },
    });

    const overdueList = [];
    for (const sup of activeSupervisions) {
      let isOverdue = false;
      let overdueReason = '';

      // Check nearest milestone
      if (sup.milestones.length > 0) {
        const first = sup.milestones[0];
        if (new Date(first.dueDate) < now) {
          isOverdue = true;
          overdueReason = `Muddati o‘tgan milestone: "${first.title}" (${new Date(first.dueDate).toLocaleDateString()})`;
        }
      }

      // Check defense date
      if (!isOverdue && sup.expectedDefenseDate && new Date(sup.expectedDefenseDate) < now) {
        isOverdue = true;
        overdueReason = `Rejalashtirilgan himoya sanasi o‘tib ketgan (${new Date(sup.expectedDefenseDate).toLocaleDateString()})`;
      }

      // Check meeting inactivity (> 45 days)
      let inactiveMeetingDays = null;
      if (sup.meetings.length > 0) {
        inactiveMeetingDays = Math.floor((now - new Date(sup.meetings[0].meetingDate)) / (1000 * 60 * 60 * 24));
      } else {
        inactiveMeetingDays = Math.floor((now - new Date(sup.createdAt)) / (1000 * 60 * 60 * 24));
      }

      if (isOverdue || (inactiveMeetingDays && inactiveMeetingDays > 45)) {
        overdueList.push({
          ...sup,
          overdueReason: overdueReason || `${inactiveMeetingDays} kundan buyon uchrashuv qayd etilmagan`,
          inactiveMeetingDays,
        });
      }
    }

    // 3. Pending reports
    const pendingReports = await prisma.supervisionReport.findMany({
      where: { status: 'PENDING' },
      include: {
        supervision: {
          include: {
            scholar: {
              include: { department: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // 4. Supervisor workload (Scholars and active supervisions count)
    const scholars = await prisma.scholarProfile.findMany({
      select: {
        id: true,
        fullName: true,
        academicDegree: true,
        academicTitle: true,
        department: {
          select: { nameUz: true, nameRu: true, nameEn: true },
        },
        supervisions: {
          where: {
            stage: {
              in: [
                SUPERVISION_STAGES.A_SUBMITTED_DEPARTMENT,
                SUPERVISION_STAGES.A_DEPARTMENT_APPROVED,
                SUPERVISION_STAGES.B_ACTIVE_RESEARCH,
                SUPERVISION_STAGES.C_PUBLICATIONS_READY,
                SUPERVISION_STAGES.D_PRE_DEFENSE,
              ],
            },
          },
          select: {
            id: true,
            studentName: true,
            degreeType: true,
            stage: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const workloadList = scholars
      .map((s) => ({
        scholarId: s.id,
        fullName: s.fullName,
        academicDegree: s.academicDegree,
        academicTitle: s.academicTitle,
        departmentName: s.department?.nameUz || '',
        activeCount: s.supervisions.length,
        supervisions: s.supervisions,
      }))
      .filter((s) => s.activeCount > 0)
      .sort((a, b) => b.activeCount - a.activeCount);

    return NextResponse.json({
      summary: {
        pendingApprovalsCount: pendingApprovals.length,
        overdueCount: overdueList.length,
        pendingReportsCount: pendingReports.length,
        activeSupervisorsCount: workloadList.length,
      },
      pendingApprovals,
      overdueList,
      pendingReports,
      workloadList,
    });
  } catch (error) {
    console.error('Admin supervisions overview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
