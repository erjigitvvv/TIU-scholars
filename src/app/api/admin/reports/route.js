import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const APPROVED_GRANT_STATUSES = ['APPROVED', 'WON', 'COMPLETED'];

function csvEscape(val) {
  const s = String(val ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

function htmlEscape(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildXlsResponse(title, headers, rows, filename) {
  const generatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    .title { font-size: 15pt; font-weight: bold; color: #0F294A; margin-bottom: 4px; }
    .meta { font-size: 10pt; color: #475569; margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; }
    th { background-color: #0F294A; color: #FFFFFF; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 6px 8px; }
    tr:nth-child(even) td { background-color: #f8fafc; }
  </style>
</head>
<body>
  <div class="title">Tashkent International University — TIU Scholars</div>
  <div class="meta">${htmlEscape(title)} | ${htmlEscape(generatedAt)}</div>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${htmlEscape(h)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map((r) => `<tr>${r.map((cell) => `<td>${htmlEscape(cell)}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;

  return new Response('\uFEFF' + html, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function buildCsvResponse(headers, rows, filename) {
  const csv =
    '\uFEFF' +
    [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const yearParam = searchParams.get('year') || '';
    const year = yearParam ? parseInt(yearParam, 10) : null;
    const format = searchParams.get('format') || 'json'; // json | csv | xls
    const reportType = searchParams.get('type') || 'scholars'; // scholars | publications | grants | departments

    const [faculties, departments] = await Promise.all([
      prisma.faculty.findMany({ orderBy: { nameUz: 'asc' } }),
      prisma.department.findMany({
        where: facultyId ? { facultyId } : {},
        include: { faculty: true },
        orderBy: { nameUz: 'asc' },
      }),
    ]);

    const deptWhere = {
      ...(facultyId ? { department: { facultyId } } : {}),
      ...(departmentId ? { departmentId } : {}),
    };

    if (reportType === 'publications') {
      const pubs = await prisma.publication.findMany({
        where: {
          status: 'APPROVED',
          ...(year ? { year } : {}),
          ...(facultyId || departmentId
            ? {
                authors: {
                  some: { scholar: deptWhere },
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

      const rowsData = pubs.map((p, idx) => {
        const firstAuthorDept = p.authors[0]?.scholar?.department;
        return {
          id: p.id,
          rank: idx + 1,
          title: p.title,
          type: p.type,
          quartile: p.quartile || 'NONE',
          year: p.year,
          journalOrPublisher: p.journalOrPublisher,
          doi: p.doi || '',
          citationsCount: p.citationsCount || 0,
          authors: p.authors.map((a) => a.scholar?.fullName).filter(Boolean).join('; '),
          department: firstAuthorDept?.nameUz || '',
          faculty: firstAuthorDept?.faculty?.nameUz || '',
        };
      });

      const headers = ['Title', 'Type', 'Quartile', 'Year', 'Journal/Publisher', 'DOI', 'Citations', 'Authors', 'Department'];
      const exportRows = rowsData.map((r) => [
        r.title,
        r.type,
        r.quartile,
        r.year,
        r.journalOrPublisher,
        r.doi,
        r.citationsCount,
        r.authors,
        r.department,
      ]);

      if (format === 'csv') {
        return buildCsvResponse(headers, exportRows, 'tiu-publications-report.csv');
      }
      if (format === 'xls') {
        return buildXlsResponse('Approved Publications Registry', headers, exportRows, 'tiu-publications-report.xls');
      }

      const summary = {
        totalRecords: rowsData.length,
        scopusWos: rowsData.filter((r) => r.type === 'SCOPUS' || r.type === 'WOS').length,
        oak: rowsData.filter((r) => r.type === 'OAK').length,
        totalCitations: rowsData.reduce((acc, r) => acc + r.citationsCount, 0),
      };

      return NextResponse.json({
        type: 'publications',
        rows: rowsData,
        publications: pubs,
        faculties,
        departments,
        summary,
      });
    }

    if (reportType === 'grants') {
      const grants = await prisma.grantProject.findMany({
        where: {
          ...(facultyId || departmentId ? { scholar: deptWhere } : {}),
          ...(year ? { startYear: { lte: year }, OR: [{ endYear: null }, { endYear: { gte: year } }] } : {}),
        },
        include: {
          scholar: {
            include: { department: { include: { faculty: true } } },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
      });

      const rowsData = grants.map((g, idx) => ({
        id: g.id,
        rank: idx + 1,
        grantCode: g.grantCode || `TIU-GRT-${g.startYear}`,
        title: g.title,
        fundingSource: g.fundingSource,
        grantProgram: g.grantProgram || '',
        scholarName: g.scholar?.fullName || '',
        department: g.scholar?.department?.nameUz || '',
        faculty: g.scholar?.department?.faculty?.nameUz || '',
        role: g.role,
        startYear: g.startYear,
        endYear: g.endYear || g.startYear + 2,
        budgetRequested: g.budgetRequested || 0,
        status: g.status,
      }));

      const headers = [
        'Code',
        'Title',
        'Funding Source',
        'Program',
        'Principal Investigator',
        'Department',
        'Role',
        'Period',
        'Budget (UZS)',
        'Status',
      ];
      const exportRows = rowsData.map((r) => [
        r.grantCode,
        r.title,
        r.fundingSource,
        r.grantProgram,
        r.scholarName,
        r.department,
        r.role,
        `${r.startYear}-${r.endYear}`,
        r.budgetRequested,
        r.status,
      ]);

      if (format === 'csv') {
        return buildCsvResponse(headers, exportRows, 'tiu-grants-report.csv');
      }
      if (format === 'xls') {
        return buildXlsResponse('Research Grants & Proposals Report', headers, exportRows, 'tiu-grants-report.xls');
      }

      const summary = {
        totalRecords: rowsData.length,
        approvedGrants: rowsData.filter((r) => APPROVED_GRANT_STATUSES.includes(r.status)).length,
        pendingGrants: rowsData.filter((r) => r.status === 'PENDING' || r.status === 'SUBMITTED_INTERNAL').length,
        totalBudget: rowsData.reduce((acc, r) => acc + (Number(r.budgetRequested) || 0), 0),
      };

      return NextResponse.json({
        type: 'grants',
        rows: rowsData,
        faculties,
        departments,
        summary,
      });
    }

    if (reportType === 'departments') {
      const deptRecords = await prisma.department.findMany({
        where: {
          ...(facultyId ? { facultyId } : {}),
          ...(departmentId ? { id: departmentId } : {}),
        },
        include: {
          faculty: true,
          scholars: {
            where: { user: { accountStatus: 'ACTIVE' } },
            include: {
              publications: {
                where: {
                  publication: {
                    status: 'APPROVED',
                    ...(year ? { year } : {}),
                  },
                },
                include: { publication: { select: { id: true, type: true, citationsCount: true } } },
              },
              grantProjects: {
                where: {
                  status: { in: APPROVED_GRANT_STATUSES },
                  ...(year ? { startYear: { lte: year } } : {}),
                },
                select: { id: true },
              },
              supervisions: {
                where: { status: 'APPROVED' },
                select: { id: true },
              },
            },
          },
        },
      });

      const deptRows = deptRecords
        .map((d) => {
          const activeScholars = d.scholars.length;
          const dscCount = d.scholars.filter((s) => s.academicDegree === 'DSC').length;
          const phdCount = d.scholars.filter((s) => s.academicDegree === 'PHD').length;
          const potentialPercent =
            activeScholars > 0 ? Math.round(((dscCount + phdCount) / activeScholars) * 100) : 0;

          const uniquePubs = new Map();
          for (const s of d.scholars) {
            for (const p of s.publications) {
              if (p.publication) uniquePubs.set(p.publication.id, p.publication);
            }
          }
          const pubsArr = Array.from(uniquePubs.values());
          const scopusWos = pubsArr.filter((p) => p.type === 'SCOPUS' || p.type === 'WOS').length;
          const oak = pubsArr.filter((p) => p.type === 'OAK').length;
          const grants = d.scholars.reduce((sum, s) => sum + s.grantProjects.length, 0);
          const supervisions = d.scholars.reduce((sum, s) => sum + s.supervisions.length, 0);
          const totalScore = parseFloat(
            d.scholars.reduce((sum, s) => sum + (s.tiuScore || 0), 0).toFixed(1)
          );
          const avgScore = activeScholars > 0 ? parseFloat((totalScore / activeScholars).toFixed(1)) : 0;

          return {
            id: d.id,
            department: d.nameUz,
            departmentRu: d.nameRu,
            departmentEn: d.nameEn,
            faculty: d.faculty?.nameUz || '',
            activeScholars,
            dscCount,
            phdCount,
            potentialPercent,
            totalPubs: pubsArr.length,
            scopusWos,
            oak,
            grants,
            supervisions,
            totalScore,
            avgScore,
          };
        })
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((item, idx) => ({ rank: idx + 1, ...item }));

      const headers = [
        'Rank',
        'Department',
        'Faculty',
        'Active Scholars',
        'DSc',
        'PhD',
        'Scientific Potential (%)',
        'Total Pubs',
        'Scopus/WoS',
        'OAK',
        'Grants',
        'Total TIU Score',
        'Avg TIU Score',
      ];
      const exportRows = deptRows.map((r) => [
        r.rank,
        r.department,
        r.faculty,
        r.activeScholars,
        r.dscCount,
        r.phdCount,
        `${r.potentialPercent}%`,
        r.totalPubs,
        r.scopusWos,
        r.oak,
        r.grants,
        r.totalScore,
        r.avgScore,
      ]);

      if (format === 'csv') {
        return buildCsvResponse(headers, exportRows, 'tiu-departments-report.csv');
      }
      if (format === 'xls') {
        return buildXlsResponse('Department Scientific Performance Summary', headers, exportRows, 'tiu-departments-report.xls');
      }

      const summary = {
        totalRecords: deptRows.length,
        totalScholars: deptRows.reduce((acc, r) => acc + r.activeScholars, 0),
        totalPubs: deptRows.reduce((acc, r) => acc + r.totalPubs, 0),
        avgPotential:
          deptRows.length > 0
            ? Math.round(deptRows.reduce((acc, r) => acc + r.potentialPercent, 0) / deptRows.length)
            : 0,
      };

      return NextResponse.json({
        type: 'departments',
        rows: deptRows,
        faculties,
        departments,
        summary,
      });
    }

    // Default: 'scholars'
    const currentYear = year || new Date().getFullYear();
    const scholars = await prisma.scholarProfile.findMany({
      where: {
        user: { accountStatus: 'ACTIVE' },
        ...deptWhere,
      },
      include: {
        user: { select: { email: true } },
        department: {
          include: {
            faculty: true,
            kpiTargets: { where: { year: currentYear } },
          },
        },
        kpiTargets: { where: { year: currentYear } },
        publications: {
          where: {
            publication: {
              status: 'APPROVED',
              ...(year ? { year } : {}),
            },
          },
          include: { publication: { select: { type: true } } },
        },
        grantProjects: {
          where: { status: { in: APPROVED_GRANT_STATUSES } },
          select: { id: true },
        },
        supervisions: { where: { status: 'APPROVED' }, select: { id: true } },
      },
      orderBy: [{ tiuScore: 'desc' }, { hIndex: 'desc' }],
    });

    const rowsData = scholars.map((s, idx) => {
      const scopusWos = s.publications.filter(
        (p) => p.publication?.type === 'SCOPUS' || p.publication?.type === 'WOS'
      ).length;
      const oak = s.publications.filter((p) => p.publication?.type === 'OAK').length;
      const targetScore =
        s.kpiTargets[0]?.targetScore || s.department?.kpiTargets[0]?.targetScore || 25;
      const kpiPercent = Math.min(100, Math.round(((s.tiuScore || 0) / (targetScore || 1)) * 100));

      return {
        id: s.id,
        rank: idx + 1,
        fullName: s.fullName,
        photoUrl: s.photoUrl || null,
        position: s.positionUz || '',
        positionRu: s.positionRu || '',
        positionEn: s.positionEn || '',
        email: s.user?.email || '',
        faculty: s.department?.faculty?.nameUz || '',
        department: s.department?.nameUz || '',
        degree: s.academicDegree,
        title: s.academicTitle,
        tiuScore: parseFloat((s.tiuScore || 0).toFixed(1)),
        hIndex: s.hIndex,
        totalCitations: s.totalCitations,
        totalPubs: s.publications.length,
        scopusWos,
        oak,
        grants: s.grantProjects.length,
        supervisions: s.supervisions.length,
        kpiPercent,
      };
    });

    const headers = [
      'Rank',
      'Full Name',
      'Position',
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
      'KPI (%)',
    ];
    const exportRows = rowsData.map((r) => [
      r.rank,
      r.fullName,
      r.position || '—',
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
      `${r.kpiPercent}%`,
    ]);

    if (format === 'csv') {
      return buildCsvResponse(headers, exportRows, 'tiu-scholars-report.csv');
    }
    if (format === 'xls') {
      return buildXlsResponse('TIU Scholars Performance & KPI Report', headers, exportRows, 'tiu-scholars-report.xls');
    }

    const summary = {
      totalRecords: rowsData.length,
      totalPubs: rowsData.reduce((acc, r) => acc + r.totalPubs, 0),
      scopusWos: rowsData.reduce((acc, r) => acc + r.scopusWos, 0),
      avgScore:
        rowsData.length > 0
          ? parseFloat(
              (rowsData.reduce((acc, r) => acc + r.tiuScore, 0) / rowsData.length).toFixed(1)
            )
          : 0,
    };

    return NextResponse.json({
      type: 'scholars',
      rows: rowsData,
      scholars: rowsData,
      faculties,
      departments,
      summary,
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
