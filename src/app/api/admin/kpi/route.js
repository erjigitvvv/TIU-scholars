import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function computeKpiProgress({
  actualPublications,
  targetPublications,
  actualScopus,
  targetScopus,
  actualScore,
  targetScore,
}) {
  const components = [
    { actual: actualPublications, target: targetPublications, weight: 0.3 },
    { actual: actualScopus, target: targetScopus, weight: 0.4 },
    { actual: actualScore, target: targetScore, weight: 0.3 },
  ].filter((c) => Number(c.target) > 0);

  if (components.length === 0) return 0;

  let weightedSum = 0;
  let activeWeight = 0;

  for (const c of components) {
    const ratio = Math.min(1, Math.max(0, Number(c.actual) / Number(c.target)));
    weightedSum += ratio * c.weight;
    activeWeight += c.weight;
  }

  return Math.min(100, Math.round((weightedSum / activeWeight) * 100));
}

function getRagStatus(percent) {
  if (percent >= 100) return 'COMPLETED';
  if (percent >= 60) return 'ON_TRACK';
  if (percent >= 25) return 'AT_RISK';
  return 'CRITICAL';
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);

    const [targets, departments, scholarsRaw] = await Promise.all([
      prisma.kpiTarget.findMany({
        where: { year },
        include: {
          department: { include: { faculty: true } },
          scholar: { include: { department: { include: { faculty: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.department.findMany({
        include: { faculty: true },
        orderBy: { nameUz: 'asc' },
      }),
      prisma.scholarProfile.findMany({
        where: { user: { accountStatus: 'ACTIVE' } },
        select: {
          id: true,
          fullName: true,
          photoUrl: true,
          positionUz: true,
          academicDegree: true,
          academicTitle: true,
          departmentId: true,
          tiuScore: true,
          publications: {
            where: {
              publication: {
                status: 'APPROVED',
                year,
              },
            },
            include: {
              publication: {
                select: { id: true, type: true },
              },
            },
          },
        },
        orderBy: { fullName: 'asc' },
      }),
    ]);

    const scholarStatsMap = new Map();
    const deptBucketMap = new Map();

    for (const s of scholarsRaw) {
      const pubs = s.publications.map((p) => p.publication).filter(Boolean);
      const pubsCount = pubs.length;
      const scopusCount = pubs.filter((p) => p.type === 'SCOPUS' || p.type === 'WOS').length;

      scholarStatsMap.set(s.id, {
        actualPublications: pubsCount,
        actualScopus: scopusCount,
        actualScore: parseFloat((s.tiuScore || 0).toFixed(1)),
      });

      if (s.departmentId) {
        if (!deptBucketMap.has(s.departmentId)) {
          deptBucketMap.set(s.departmentId, {
            uniquePubs: new Map(),
            scoreSum: 0,
            scholarsCount: 0,
          });
        }
        const bucket = deptBucketMap.get(s.departmentId);
        bucket.scholarsCount += 1;
        bucket.scoreSum += s.tiuScore || 0;
        for (const p of pubs) {
          bucket.uniquePubs.set(p.id, p);
        }
      }
    }

    const enrichedTargets = targets.map((row) => {
      let actualPublications = 0;
      let actualScopus = 0;
      let actualScore = 0;

      if (row.scholarId) {
        const st = scholarStatsMap.get(row.scholarId);
        if (st) {
          actualPublications = st.actualPublications;
          actualScopus = st.actualScopus;
          actualScore = st.actualScore;
        } else if (row.scholar) {
          actualScore = parseFloat((row.scholar.tiuScore || 0).toFixed(1));
        }
      } else if (row.departmentId) {
        const bucket = deptBucketMap.get(row.departmentId);
        if (bucket) {
          const uniqueArr = Array.from(bucket.uniquePubs.values());
          actualPublications = uniqueArr.length;
          actualScopus = uniqueArr.filter((p) => p.type === 'SCOPUS' || p.type === 'WOS').length;
          actualScore = parseFloat(bucket.scoreSum.toFixed(1));
        }
      }

      const targetScopus = row.targetScopus ?? row.targetScopusWos ?? 0;
      const completionPercent = computeKpiProgress({
        actualPublications,
        targetPublications: row.targetPublications,
        actualScopus,
        targetScopus,
        actualScore,
        targetScore: row.targetScore,
      });

      return {
        ...row,
        targetScopus,
        actualPublications,
        actualScopus,
        actualScore,
        completionPercent,
        ragStatus: getRagStatus(completionPercent),
      };
    });

    const totalTargets = enrichedTargets.length;
    const completedCount = enrichedTargets.filter((t) => t.completionPercent >= 100).length;
    const atRiskCount = enrichedTargets.filter((t) => t.completionPercent < 60).length;
    const avgCompletion =
      totalTargets > 0
        ? Math.round(
            enrichedTargets.reduce((sum, t) => sum + t.completionPercent, 0) / totalTargets
          )
        : 0;

    const scholars = scholarsRaw.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      photoUrl: s.photoUrl,
      positionUz: s.positionUz,
      academicDegree: s.academicDegree,
      academicTitle: s.academicTitle,
      departmentId: s.departmentId,
      tiuScore: parseFloat((s.tiuScore || 0).toFixed(1)),
    }));

    return NextResponse.json({
      year,
      targets: enrichedTargets,
      departments,
      scholars,
      summary: {
        totalTargets,
        completedCount,
        atRiskCount,
        avgCompletion,
      },
    });
  } catch (error) {
    console.error('Admin KPI GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      year,
      departmentId,
      scholarId,
      targetPublications,
      targetScopus,
      targetScopusWos,
      targetScore,
    } = await request.json();

    const parsedYear = parseInt(year, 10);
    const resolvedDeptId = departmentId || null;
    const resolvedScholarId = resolvedDeptId ? null : scholarId || null;

    if (!parsedYear || (!resolvedDeptId && !resolvedScholarId)) {
      return NextResponse.json(
        { error: 'Year and either departmentId or scholarId are required' },
        { status: 400 }
      );
    }

    const pubsVal = Math.max(0, parseInt(targetPublications || 0, 10) || 0);
    const scopusVal = Math.max(0, parseInt(targetScopus ?? targetScopusWos ?? 0, 10) || 0);
    const scoreVal = Math.max(0, parseFloat(targetScore || 0) || 0);

    const existing = await prisma.kpiTarget.findFirst({
      where: resolvedDeptId
        ? { year: parsedYear, departmentId: resolvedDeptId, scholarId: null }
        : { year: parsedYear, scholarId: resolvedScholarId, departmentId: null },
    });

    if (existing) {
      const updated = await prisma.kpiTarget.update({
        where: { id: existing.id },
        data: {
          targetPublications: pubsVal,
          targetScopus: scopusVal,
          targetScore: scoreVal,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'UPDATE_KPI_TARGET',
          entityType: 'kpiTarget',
          entityId: updated.id,
          details: JSON.stringify({
            year: parsedYear,
            departmentId: resolvedDeptId,
            scholarId: resolvedScholarId,
          }),
        },
      });

      return NextResponse.json({ success: true, updated: true, target: updated });
    }

    const created = await prisma.kpiTarget.create({
      data: {
        year: parsedYear,
        departmentId: resolvedDeptId,
        scholarId: resolvedScholarId,
        targetPublications: pubsVal,
        targetScopus: scopusVal,
        targetScore: scoreVal,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_KPI_TARGET',
        entityType: 'kpiTarget',
        entityId: created.id,
        details: JSON.stringify({
          year: parsedYear,
          departmentId: resolvedDeptId,
          scholarId: resolvedScholarId,
        }),
      },
    });

    return NextResponse.json({ success: true, updated: false, target: created });
  } catch (error) {
    console.error('Admin KPI POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.kpiTarget.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DELETE_KPI_TARGET',
        entityType: 'kpiTarget',
        entityId: id,
        details: JSON.stringify({ id }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
