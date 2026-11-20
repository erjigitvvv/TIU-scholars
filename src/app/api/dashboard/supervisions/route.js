import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getActiveScholar } from '@/lib/auth';
import { SUPERVISION_STAGES } from '@/lib/supervision-state-machine';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterStage = searchParams.get('stage');

    let whereClause = {};

    // If regular scholar, only their own supervisions
    if (user.role === 'SCHOLAR') {
      if (!user.scholarProfile) {
        return NextResponse.json({ supervisions: [] });
      }
      whereClause.scholarId = user.scholarProfile.id;
    }

    if (filterStage && filterStage !== 'ALL') {
      whereClause.stage = filterStage;
    }

    const supervisions = await prisma.supervision.findMany({
      where: whereClause,
      include: {
        scholar: {
          select: {
            id: true,
            fullName: true,
            academicDegree: true,
            academicTitle: true,
            photoUrl: true,
            department: {
              select: { nameUz: true, nameRu: true, nameEn: true },
            },
          },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        meetings: {
          orderBy: { meetingDate: 'desc' },
          take: 1,
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
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();

    // Map and enrich with nearest milestone and overdue flag
    const enriched = supervisions.map((sup) => {
      const activeMilestones = sup.milestones.filter((m) => !m.isCompleted);
      const nearestMilestone = activeMilestones.length > 0 ? activeMilestones[0] : null;

      let isOverdue = false;
      if (nearestMilestone && new Date(nearestMilestone.dueDate) < now) {
        isOverdue = true;
      }
      if (sup.expectedDefenseDate && new Date(sup.expectedDefenseDate) < now && sup.stage !== SUPERVISION_STAGES.E_COMPLETED) {
        isOverdue = true;
      }

      // Check last meeting inactivity (> 45 days)
      const lastMeeting = sup.meetings[0];
      let needsMeetingNotice = false;
      if (sup.stage === SUPERVISION_STAGES.B_ACTIVE_RESEARCH) {
        if (!lastMeeting) {
          needsMeetingNotice = true;
        } else {
          const daysSinceMeeting = Math.floor((now - new Date(lastMeeting.meetingDate)) / (1000 * 60 * 60 * 24));
          if (daysSinceMeeting > 45) {
            needsMeetingNotice = true;
          }
        }
      }

      return {
        ...sup,
        nearestMilestone,
        isOverdue,
        needsMeetingNotice,
        publicationsCount: sup.publications.length,
        reportsCount: sup.reports.length,
      };
    });

    return NextResponse.json({ supervisions: enriched });
  } catch (error) {
    console.error('Supervisions GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const scholar = await getActiveScholar();
    if (!scholar) {
      return NextResponse.json({ error: 'Unauthorized or inactive scholar' }, { status: 401 });
    }

    const body = await request.json();
    const {
      studentName,
      studentEmail,
      studentPhone,
      degreeType = 'PHD',
      specialtyCode,
      specialtyName,
      dissertationTitle,
      expectedDefenseDate,
      immediateSubmit = false,
    } = body;

    if (!studentName || !dissertationTitle) {
      return NextResponse.json(
        { error: 'Talaba F.I.SH va dissertatsiya mavzusi majburiy.' },
        { status: 400 }
      );
    }

    const initialStage = immediateSubmit
      ? SUPERVISION_STAGES.A_SUBMITTED_DEPARTMENT
      : SUPERVISION_STAGES.A_DRAFT;

    const supervision = await prisma.supervision.create({
      data: {
        scholarId: scholar.id,
        studentName,
        studentEmail: studentEmail || null,
        studentPhone: studentPhone || null,
        degreeType,
        specialtyCode: specialtyCode || null,
        specialtyName: specialtyName || null,
        dissertationTitle,
        stage: initialStage,
        status: 'PENDING',
        year: new Date().getFullYear(),
        expectedDefenseDate: expectedDefenseDate ? new Date(expectedDefenseDate) : null,
      },
    });

    // Create empty checklist
    await prisma.supervisionChecklist.create({
      data: { supervisionId: supervision.id },
    });

    // If submitted immediately, log audit
    if (immediateSubmit) {
      await prisma.auditLog.create({
        data: {
          actorId: scholar.userId,
          action: 'SUPERVISION_SUBMITTED_DEPARTMENT',
          entityType: 'Supervision',
          entityId: supervision.id,
          details: JSON.stringify({ studentName, degreeType, dissertationTitle }),
        },
      });
    }

    return NextResponse.json({ success: true, supervision });
  } catch (error) {
    console.error('Supervision POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
