import { prisma } from '@/lib/prisma';
import { computeScoreBreakdown } from '@/lib/scoring';
import { parseRawInterests } from '@/lib/interests';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [scholar, scoringConfig, activeScores] = await Promise.all([
      prisma.scholarProfile.findUnique({
        where: { id },
        include: {
          user: true,
          department: {
            include: { faculty: true },
          },
          publications: {
            include: {
              publication: {
                include: {
                  authors: {
                    include: {
                      scholar: {
                        include: {
                          department: true,
                          user: { select: { accountStatus: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          grantProjects: true,
          supervisions: true,
        },
      }),
      prisma.scoringConfig.findFirst(),
      prisma.scholarProfile.findMany({
        where: { user: { accountStatus: 'ACTIVE' } },
        select: { id: true, tiuScore: true },
        orderBy: [{ tiuScore: 'desc' }, { hIndex: 'desc' }],
      }),
    ]);

    if (!scholar || scholar.user.accountStatus !== 'ACTIVE') {
      return Response.json({ error: 'Scholar not found or inactive' }, { status: 404 });
    }

    const approvedPublications = scholar.publications
      .map((pa) => pa.publication)
      .filter((p) => p && p.status === 'APPROVED')
      .sort((a, b) => (b.year || 0) - (a.year || 0));

    const approvedGrants = scholar.grantProjects.filter((g) => g.status === 'APPROVED');
    const approvedSupervisions = scholar.supervisions.filter((s) => s.status === 'APPROVED');

    const { hIndex, totalCitations, scopusWosCount, scoreBreakdown, tiuScore } =
      computeScoreBreakdown(
        { approvedPublications, approvedGrants, approvedSupervisions },
        scoringConfig
      );

    // University rank among active scholars
    const rankIndex = activeScores.findIndex((s) => s.id === scholar.id);
    const universityRank = rankIndex >= 0 ? rankIndex + 1 : null;
    const totalActiveScholars = activeScores.length;

    // Yearly publications & citations analytics + Publication Mix (typeStats)
    const yearMap = new Map();
    const quartileStats = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const typeStats = {};
    for (const pub of approvedPublications) {
      if (pub.year) {
        const cur = yearMap.get(pub.year) || { year: pub.year, count: 0, citations: 0 };
        cur.count += 1;
        cur.citations += pub.citationsCount || 0;
        yearMap.set(pub.year, cur);
      }
      if (pub.quartile && quartileStats[pub.quartile] !== undefined) {
        quartileStats[pub.quartile] += 1;
      }
      if (pub.type) {
        typeStats[pub.type] = (typeStats[pub.type] || 0) + 1;
      }
    }
    const yearlyStats = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

    // Derive Co-Authors from shared approved publications with shared publication count
    const coAuthorMap = new Map();
    for (const pub of approvedPublications) {
      if (pub.authors) {
        for (const auth of pub.authors) {
          if (
            auth.scholar &&
            auth.scholarId !== scholar.id &&
            auth.scholar.user?.accountStatus === 'ACTIVE'
          ) {
            const existing = coAuthorMap.get(auth.scholar.id);
            if (existing) {
              existing.sharedCount += 1;
            } else {
              coAuthorMap.set(auth.scholar.id, {
                ...auth.scholar,
                sharedCount: 1,
              });
            }
          }
        }
      }
    }
    const coAuthors = Array.from(coAuthorMap.values()).sort(
      (a, b) => b.sharedCount - a.sharedCount
    );

    const parsedInterests = parseRawInterests(scholar.researchInterests, scholar.department);

    return Response.json({
      scholar: {
        ...scholar,
        hIndex,
        totalCitations,
        tiuScore,
        universityRank,
        totalActiveScholars,
        researchInterests: JSON.stringify(parsedInterests),
        publications: approvedPublications,
        grantProjects: approvedGrants,
        supervisions: approvedSupervisions,
        coAuthors,
        scopusWosCount,
        scoreBreakdown,
        yearlyStats,
        quartileStats,
        typeStats,
      },
    });
  } catch (error) {
    console.error('API GET /api/scholars/[id] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
