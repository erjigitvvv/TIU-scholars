import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const type = searchParams.get('type') || '';
    const year = searchParams.get('year') || '';
    const facultyId = searchParams.get('facultyId') || '';
    const departmentId = searchParams.get('departmentId') || '';

    const where = {
      status: 'APPROVED',
    };

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (year && year !== 'ALL') {
      where.year = parseInt(year, 10);
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

    const [publications, faculties] = await Promise.all([
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.faculty.findMany({
        include: {
          departments: {
            orderBy: { nameUz: 'asc' },
          },
        },
        orderBy: { nameUz: 'asc' },
      }),
    ]);

    return Response.json({ publications, faculties });
  } catch (error) {
    console.error('API GET /api/publications error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
