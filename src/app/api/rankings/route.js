import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId') || '';

    const scholarWhere = {
      user: { accountStatus: 'ACTIVE' },
      ...(facultyId ? { department: { facultyId } } : {}),
    };

    const [scholarsRaw, departmentsRaw, faculties] = await Promise.all([
      prisma.scholarProfile.findMany({
        where: scholarWhere,
        include: {
          department: { include: { faculty: true } },
          publications: {
            where: { publication: { status: 'APPROVED' } },
            include: { publication: true },
          },
          grantProjects: { where: { status: 'APPROVED' }, select: { id: true } },
          supervisions: { where: { status: 'APPROVED' }, select: { id: true } },
        },
        orderBy: [
          { tiuScore: 'desc' },
          { hIndex: 'desc' },
          { totalCitations: 'desc' },
        ],
      }),
      prisma.department.findMany({
        where: facultyId ? { facultyId } : undefined,
        include: {
          faculty: true,
          scholars: {
            where: { user: { accountStatus: 'ACTIVE' } },
            include: {
              publications: {
                where: { publication: { status: 'APPROVED' } },
                include: { publication: true },
              },
            },
          },
        },
      }),
      prisma.faculty.findMany({
        orderBy: { nameUz: 'asc' },
      }),
    ]);

    const scholars = scholarsRaw.map((s) => {
      const approvedPubs = s.publications.map((p) => p.publication);
      const scopusWosCount = approvedPubs.filter(
        (p) => p.type === 'SCOPUS' || p.type === 'WOS'
      ).length;
      const q1Q2Count = approvedPubs.filter(
        (p) => p.quartile === 'Q1' || p.quartile === 'Q2'
      ).length;

      return {
        id: s.id,
        fullName: s.fullName,
        photoUrl: s.photoUrl,
        academicDegree: s.academicDegree,
        academicTitle: s.academicTitle,
        hIndex: s.hIndex,
        totalCitations: s.totalCitations,
        tiuScore: s.tiuScore,
        department: s.department,
        approvedPubsCount: approvedPubs.length,
        scopusWosCount,
        q1Q2Count,
        grantsCount: s.grantProjects.length,
        supervisionsCount: s.supervisions.length,
      };
    });

    const departments = departmentsRaw
      .map((dept) => {
        const scholarsCount = dept.scholars.length;
        const totalTiuScore = Number(
          dept.scholars.reduce((acc, s) => acc + (s.tiuScore || 0), 0).toFixed(2)
        );
        const avgTiuScore =
          scholarsCount > 0 ? Number((totalTiuScore / scholarsCount).toFixed(2)) : 0;

        // Deduplicate co-authored publications within the same department
        const uniquePubMap = new Map();
        for (const s of dept.scholars) {
          for (const pa of s.publications) {
            if (pa.publication) {
              uniquePubMap.set(pa.publication.id, pa.publication);
            }
          }
        }
        const uniquePubs = Array.from(uniquePubMap.values());
        const approvedPubsCount = uniquePubs.length;
        const scopusCount = uniquePubs.filter(
          (p) => p.type === 'SCOPUS' || p.type === 'WOS'
        ).length;
        const totalCitations = dept.scholars.reduce(
          (acc, s) => acc + (s.totalCitations || 0),
          0
        );

        return {
          id: dept.id,
          nameUz: dept.nameUz,
          nameRu: dept.nameRu,
          nameEn: dept.nameEn,
          faculty: dept.faculty,
          scholarsCount,
          totalTiuScore,
          avgTiuScore,
          approvedPubsCount,
          scopusCount,
          totalCitations,
        };
      })
      .sort((a, b) => b.totalTiuScore - a.totalTiuScore || b.avgTiuScore - a.avgTiuScore);

    return Response.json({ scholars, departments, faculties });
  } catch (error) {
    console.error('API GET /api/rankings error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
