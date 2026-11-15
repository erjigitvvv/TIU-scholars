import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      pendingScholars,
      activeScholars,
      pendingPublications,
      pendingGrants,
      pendingSupervisions,
      approvedPublications,
      scopusWosCount,
      faculties,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'SCHOLAR', accountStatus: 'PENDING' } }),
      prisma.user.count({ where: { role: 'SCHOLAR', accountStatus: 'ACTIVE' } }),
      prisma.publication.count({ where: { status: 'PENDING' } }),
      prisma.grantProject.count({ where: { status: 'PENDING' } }),
      prisma.supervision.count({ where: { status: 'PENDING' } }),
      prisma.publication.count({ where: { status: 'APPROVED' } }),
      prisma.publication.count({
        where: { status: 'APPROVED', type: { in: ['SCOPUS', 'WOS'] } },
      }),
      prisma.faculty.findMany({
        include: {
          departments: {
            include: {
              scholars: {
                where: { user: { accountStatus: 'ACTIVE' } },
                include: {
                  publications: {
                    where: { publication: { status: 'APPROVED' } },
                    select: { publicationId: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { nameUz: 'asc' },
      }),
    ]);

    const facultyStats = faculties.map((f) => {
      const scholars = f.departments.flatMap((d) => d.scholars);
      const uniquePubIds = new Set(
        scholars.flatMap((s) => s.publications.map((p) => p.publicationId))
      );
      const totalScore = scholars.reduce((sum, s) => sum + (s.tiuScore || 0), 0);
      return {
        id: f.id,
        code: f.code,
        nameUz: f.nameUz,
        nameRu: f.nameRu,
        nameEn: f.nameEn,
        departmentsCount: f.departments.length,
        scholarsCount: scholars.length,
        publicationsCount: uniquePubIds.size,
        avgScore: scholars.length > 0 ? parseFloat((totalScore / scholars.length).toFixed(1)) : 0,
      };
    });

    return NextResponse.json({
      counts: {
        pendingScholars,
        activeScholars,
        pendingPublications,
        pendingGrants,
        pendingSupervisions,
        totalPendingQueue: pendingPublications + pendingGrants + pendingSupervisions,
        approvedPublications,
        scopusWosCount,
      },
      facultyStats,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
