import { prisma } from '@/lib/prisma';
import {
  parseRawInterests,
  normalizeStr,
  getSearchableInterestStrings,
} from '@/lib/interests';

function stripAcademicPrefix(name = '') {
  return name.replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '').trim();
}

function scoreSearchMatch(scholar, tags, tokens, fullQuery) {
  const normName = normalizeStr(scholar.fullName);
  const normInterests = getSearchableInterestStrings(tags).map(normalizeStr);
  const normExtra = [
    scholar.positionUz,
    scholar.positionRu,
    scholar.positionEn,
    scholar.educationUz,
    scholar.educationRu,
    scholar.educationEn,
    scholar.department?.nameUz,
    scholar.department?.nameRu,
    scholar.department?.nameEn,
    scholar.department?.faculty?.nameUz,
    scholar.department?.faculty?.nameRu,
    scholar.department?.faculty?.nameEn,
    scholar.academicDegree,
    scholar.academicTitle,
  ]
    .filter(Boolean)
    .map(normalizeStr);

  const combined = [normName, ...normExtra, ...normInterests].join(' | ');

  for (const token of tokens) {
    if (!combined.includes(token)) {
      return -1;
    }
  }

  let relevance = 0;
  if (normName.startsWith(fullQuery)) relevance += 100;
  else if (normName.includes(fullQuery)) relevance += 50;

  for (const token of tokens) {
    if (normName.includes(token)) relevance += 20;
    if (normInterests.some((tag) => tag.includes(token))) relevance += 10;
  }

  return relevance;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const facultyId = searchParams.get('faculty') || searchParams.get('facultyId') || '';
    const departmentId = searchParams.get('dept') || searchParams.get('departmentId') || '';
    const rawDegree = (
      searchParams.get('degree') ||
      searchParams.get('academicDegree') ||
      ''
    ).toUpperCase();
    const rawTitle = (
      searchParams.get('title') ||
      searchParams.get('academicTitle') ||
      ''
    ).toUpperCase();
    const sort = searchParams.get('sort') || searchParams.get('sortBy') || 'score';
    const pageParam = parseInt(searchParams.get('page') || '', 10);
    const limitParam = parseInt(searchParams.get('limit') || '', 10);

    const where = {
      user: { accountStatus: 'ACTIVE' },
    };

    if (departmentId) {
      where.departmentId = departmentId;
    } else if (facultyId) {
      where.department = { facultyId };
    }

    if (rawDegree && rawDegree !== 'ALL') {
      where.academicDegree = rawDegree;
    }

    if (rawTitle && rawTitle !== 'ALL') {
      where.academicTitle = rawTitle;
    }

    let orderBy = [{ tiuScore: 'desc' }, { hIndex: 'desc' }];
    if (sort === 'hIndex') {
      orderBy = [{ hIndex: 'desc' }, { tiuScore: 'desc' }];
    } else if (sort === 'name') {
      orderBy = [{ fullName: 'asc' }];
    }

    const [rawScholars, faculties, allRanked] = await Promise.all([
      prisma.scholarProfile.findMany({
        where,
        include: {
          department: {
            include: { faculty: true },
          },
          publications: {
            where: { publication: { status: 'APPROVED' } },
            select: {
              id: true,
              publicationId: true,
              publication: {
                select: {
                  id: true,
                  type: true,
                  quartile: true,
                  year: true,
                  citationsCount: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy,
      }),
      prisma.faculty.findMany({
        include: {
          departments: {
            orderBy: { nameUz: 'asc' },
          },
        },
        orderBy: { nameUz: 'asc' },
      }),
      prisma.scholarProfile.findMany({
        where: { user: { accountStatus: 'ACTIVE' } },
        select: { id: true },
        orderBy: [{ tiuScore: 'desc' }, { hIndex: 'desc' }],
      }),
    ]);

    const rankMap = new Map(allRanked.map((item, idx) => [item.id, idx + 1]));

    let scholars = rawScholars.map((s) => {
      const tags = parseRawInterests(s.researchInterests, s.department);
      const years = s.publications
        .map((pa) => pa.publication?.year)
        .filter(Boolean);
      const latestPubYear = years.length > 0 ? Math.max(...years) : null;
      return {
        ...s,
        universityRank: rankMap.get(s.id) || null,
        latestPubYear,
        _parsedTags: tags,
        researchInterests: JSON.stringify(tags),
      };
    });

    if (q) {
      const normQ = normalizeStr(q);
      const tokens = normQ.split(/\s+/).filter(Boolean);
      scholars = scholars
        .map((s) => ({
          ...s,
          _relevance: scoreSearchMatch(s, s._parsedTags, tokens, normQ),
        }))
        .filter((s) => s._relevance >= 0);

      if (sort === 'score') {
        scholars.sort((a, b) => {
          if (b._relevance !== a._relevance) return b._relevance - a._relevance;
          return (b.tiuScore || 0) - (a.tiuScore || 0);
        });
      }
    }

    if (sort === 'pubs' || sort === 'publications') {
      scholars.sort((a, b) => {
        const countA = a.publications.length;
        const countB = b.publications.length;
        if (countB !== countA) return countB - countA;
        return (b.tiuScore || 0) - (a.tiuScore || 0);
      });
    } else if (sort === 'name') {
      scholars.sort((a, b) =>
        stripAcademicPrefix(a.fullName).localeCompare(stripAcademicPrefix(b.fullName))
      );
    }

    const totalCount = scholars.length;

    let pagedScholars = scholars;
    let hasMore = false;
    if (!Number.isNaN(pageParam) && !Number.isNaN(limitParam) && pageParam > 0 && limitParam > 0) {
      const start = (pageParam - 1) * limitParam;
      pagedScholars = scholars.slice(start, start + limitParam);
      hasMore = start + limitParam < totalCount;
    }

    const cleanScholars = pagedScholars.map(({ _parsedTags, _relevance, ...rest }) => rest);

    return Response.json({
      scholars: cleanScholars,
      faculties,
      totalCount,
      hasMore,
    });
  } catch (error) {
    console.error('API GET /api/scholars error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
