import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_SCORING_CONFIG, recalculateScholarMetrics } from '@/lib/scoring';

const WEIGHT_FIELDS = [
  'scopusWeight',
  'q1Q2Bonus',
  'wosWeight',
  'oakWeight',
  'monographWeight',
  'patentWeight',
  'conferenceWeight',
  'citationWeight',
];

async function getOrCreateScoringConfig() {
  let config = await prisma.scoringConfig.findFirst();
  if (!config) {
    config = await prisma.scoringConfig.create({
      data: DEFAULT_SCORING_CONFIG,
    });
  }
  return config;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getOrCreateScoringConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('GET /api/admin/scoring error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const current = await getOrCreateScoringConfig();

    const updateData = {};
    for (const key of WEIGHT_FIELDS) {
      const val = Number(body[key]);
      if (Number.isFinite(val) && val >= 0) {
        updateData[key] = val;
      }
    }

    const updated = await prisma.scoringConfig.update({
      where: { id: current.id },
      data: updateData,
    });

    const scholars = await prisma.scholarProfile.findMany({
      select: { id: true },
    });

    for (const s of scholars) {
      await recalculateScholarMetrics(s.id);
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'UPDATE_SCORING_CONFIG',
        entityType: 'ScoringConfig',
        entityId: updated.id,
        details: JSON.stringify({ ...updateData, recalculatedScholars: scholars.length }),
      },
    });

    return NextResponse.json({
      success: true,
      config: updated,
      recalculatedScholars: scholars.length,
    });
  } catch (error) {
    console.error('PUT /api/admin/scoring error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
