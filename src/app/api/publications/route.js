import { prisma } from '@/lib/prisma';

const TYPE_GROUPS = {
  SCOPUS_WOS: ['SCOPUS', 'WOS'],
  LOCAL_OTHER: ['LOCAL_JOURNAL', 'INTERNATIONAL_JOURNAL', 'CONFERENCE'],
  BOOKS: ['MONOGRAPH', 'TEXTBOOK'],
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const type = searchParams.get('type') || '';
    const year = searchParams.get('year') || '';
    const facultyId = searchParams.get('facultyId') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const sort = searchParams.get('sort') || 'newest';

    const where = {
      status: 'APPROVED',
    };

    if (type && type !== 'ALL') {
      if (TYPE_GROUPS[type]) {
        where.type = { in: TYPE_GROUPS[type] };
      } else {
        where.type = type;
      }
    }

    if (year && year !== 'ALL') {
      const parsedYear = parseInt(year, 10);
      if (!Number.isNaN(parsedYear)) {
        where.year = parsedYear;
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { doi: { contains: q } },
        { journalOrPublisher: { contains: q } },
        {
          authors: {
            some: {
              scholar: {
                fullName: { contains: q },
              },
            },
          },
        },
      ];
    }

    if (departmentId) {
      where.authors = {
        ...where.authors,
        some: {
          ...(where.authors?.some || {}),
          scholar: {
            ...(where.authors?.some?.scholar || {}),
            departmentId,
          },
        },
      };
    } else if (facultyId) {
      where.authors = {
        ...where.authors,
        some: {
          ...(where.authors?.some || {}),
          scholar: {
            ...(where.authors?.some?.scholar || {}),
            department: { facultyId },
          },
        },
      };
    }

    const orderBy =
      sort === 'citations'
        ? [{ citationsCount: 'desc' }, { year: 'desc' }]
        : sort === 'year'
        ? [{ year: 'desc' }, { citationsCount: 'desc' }]
        : [{ createdAt: 'desc' }];

    const [publications, faculties, yearsRaw] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          authors: {
            include: {
              scholar: {
                include: {
                  department: { include: { faculty: true } },
                },
              },
            },
            orderBy: { authorOrder: 'asc' },
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
      prisma.publication.findMany({
        where: { status: 'APPROVED' },
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' },
      }),
    ]);

    const years = yearsRaw.map((y) => y.year).filter(Boolean);

    return Response.json({ publications, faculties, years });
  } catch (error) {
    console.error('API GET /api/publications error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
