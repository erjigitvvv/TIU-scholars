import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function csvEscape(val) {
  const s = String(val ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId') || '';
    const format = searchParams.get('format') || 'json';
    const reportType = searchParams.get('type') || 'scholars'; // scholars | publications

    if (reportType === 'publications') {
      const pubs = await prisma.publication.findMany({
        where: {
          status: 'APPROVED',
          ...(facultyId
            ? {
                authors: {
                  some: { scholar: { department: { facultyId } } },
                },
              }
            : {}),
        },
        include: {
          authors: {
            include: { scholar: { include: { department: { include: { faculty: true } } } } },
          },
        },
        orderBy: [{ year: 'desc' }, { citationsCount: 'desc' }],
      });

      if (format === 'csv') {
        const headers = ['Title', 'Type', 'Quartile', 'Year', 'Journal/Publisher', 'DOI', 'Citations', 'Authors'];
        const rows = pubs.map((p) => [
          p.title,
          p.type,
          p.quartile,
          p.year,
          p.journalOrPublisher,
          p.doi || '',
          p.citationsCount,
          p.authors.map((a) => a.scholar?.fullName).filter(Boolean).join('; '),
        ]);
        const csv =
          '\uFEFF' +
          [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="tiu-publications-report.csv"',
          },
        });
      }

      return NextResponse.json({ publications: pubs });
    }

    const scholars = await prisma.scholarProfile.findMany({
      where: {
        user: { accountStatus: 'ACTIVE' },
        ...(facultyId ? { department: { facultyId } } : {}),
      },
      include: {
        user: { select: { email: true } },
        department: { include: { faculty: true } },
        publications: {
          where: { publication: { status: 'APPROVED' } },
          include: { publication: { select: { type: true } } },
        },
        grantProjects: { where: { status: 'APPROVED' }, select: { id: true } },
        supervisions: { where: { status: 'APPROVED' }, select: { id: true } },
      },
      orderBy: [{ tiuScore: 'desc' }, { hIndex: 'desc' }],
    });

    const rowsData = scholars.map((s, idx) => {
      const scopusWos = s.publications.filter(
        (p) => p.publication?.type === 'SCOPUS' || p.publication?.type === 'WOS'
      ).length;
      const oak = s.publications.filter((p) => p.publication?.type === 'OAK').length;
      return {
        rank: idx + 1,
        fullName: s.fullName,
        email: s.user?.email || '',
        faculty: s.department?.faculty?.nameUz || '',
        department: s.department?.nameUz || '',
        degree: s.academicDegree,
        title: s.academicTitle,
        tiuScore: s.tiuScore,
        hIndex: s.hIndex,
        totalCitations: s.totalCitations,
        totalPubs: s.publications.length,
        scopusWos,
        oak,
        grants: s.grantProjects.length,
        supervisions: s.supervisions.length,
      };
    });

    if (format === 'csv') {
      const headers = [
        'Rank',
        'Full Name',
        'Email',
        'Faculty',
        'Department',
        'Degree',
        'Title',
        'TIU Score',
        'H-Index',
        'Citations',
        'Total Pubs',
        'Scopus/WoS',
        'OAK',
        'Grants',
        'Supervisions',
      ];
      const csvRows = rowsData.map((r) => [
        r.rank,
        r.fullName,
        r.email,
        r.faculty,
        r.department,
        r.degree,
        r.title,
        r.tiuScore,
        r.hIndex,
        r.totalCitations,
        r.totalPubs,
        r.scopusWos,
        r.oak,
        r.grants,
        r.supervisions,
      ]);
      const csv =
        '\uFEFF' +
        [headers, ...csvRows].map((row) => row.map(csvEscape).join(',')).join('\n');
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="tiu-scholars-report.csv"',
        },
      });
    }

    const faculties = await prisma.faculty.findMany({ orderBy: { nameUz: 'asc' } });
    return NextResponse.json({ scholars: rowsData, faculties });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
