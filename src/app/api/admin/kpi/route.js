import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);

    const [targets, departments, scholars] = await Promise.all([
      prisma.kpiTarget.findMany({
        where: { year },
        include: {
          department: { include: { faculty: true } },
          scholar: { include: { department: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.department.findMany({
        include: { faculty: true },
        orderBy: { nameUz: 'asc' },
      }),
      prisma.scholarProfile.findMany({
        where: { user: { accountStatus: 'ACTIVE' } },
        select: { id: true, fullName: true, departmentId: true, tiuScore: true },
        orderBy: { fullName: 'asc' },
      }),
    ]);

    return NextResponse.json({ year, targets, departments, scholars });
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

    if (!year || (!departmentId && !scholarId)) {
      return NextResponse.json(
        { error: 'Year and either departmentId or scholarId are required' },
        { status: 400 }
      );
    }

    const created = await prisma.kpiTarget.create({
      data: {
        year: parseInt(year, 10),
        departmentId: departmentId || null,
        scholarId: scholarId || null,
        targetPublications: parseInt(targetPublications || 0, 10),
        targetScopus: parseInt(targetScopus ?? targetScopusWos ?? 0, 10),
        targetScore: parseFloat(targetScore || 0),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_KPI_TARGET',
        entityType: 'kpiTarget',
        entityId: created.id,
        details: JSON.stringify({ year, departmentId, scholarId }),
      },
    });

    return NextResponse.json({ success: true, target: created });
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
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
