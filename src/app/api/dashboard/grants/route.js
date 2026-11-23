import { prisma } from '@/lib/prisma';
import { getActiveScholar } from '@/lib/auth';
import { OPEN_GRANT_CALLS } from '@/lib/grantsCatalogue';

export async function GET(request) {
  try {
    const scholar = await getActiveScholar();
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const grants = await prisma.grantProject.findMany({
      where: { scholarId: scholar.id },
      orderBy: { createdAt: 'desc' },
    });

    const tiuScholars = await prisma.scholarProfile.findMany({
      where: {
        id: { not: scholar.id },
        user: { accountStatus: 'ACTIVE' },
      },
      select: {
        id: true,
        fullName: true,
        academicDegree: true,
        academicTitle: true,
        photoUrl: true,
        isTelegramConnected: true,
        department: { select: { nameUz: true } },
        user: { select: { email: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    // Also get scholar's publications so they can link them to grants
    const publications = await prisma.publicationAuthor.findMany({
      where: { scholarId: scholar.id },
      include: {
        publication: {
          select: {
            id: true,
            title: true,
            type: true,
            year: true,
            journalOrPublisher: true,
            doi: true,
          },
        },
      },
      orderBy: { publication: { year: 'desc' } },
    });

    return Response.json({
      success: true,
      grants,
      openCalls: OPEN_GRANT_CALLS,
      tiuScholars,
      scholarPublications: publications.map((p) => p.publication),
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const scholar = await getActiveScholar();
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      title,
      role = 'Principal Investigator',
      fundingSource = 'Innovatsion rivojlanish agentligi',
      grantProgram = 'Amaliy tadqiqotlar',
      startYear = new Date().getFullYear(),
      endYear = new Date().getFullYear() + 2,
      budgetRequested = 0,
      deadlineDate = null,
      status = 'DRAFT',
      proposalData = null,
      budgetItems = null,
      teamMembers = null,
      documentsList = null,
    } = body;

    if (!title || !title.trim()) {
      return Response.json({ success: false, error: 'Loyiha sarlavhasi kiritilishi shart' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const count = await prisma.grantProject.count();
    const grantCode = `TIU-GRT-${year}-${String(count + 1).padStart(4, '0')}`;

    const grant = await prisma.grantProject.create({
      data: {
        scholarId: scholar.id,
        grantCode,
        title: title.trim(),
        role: role || 'Principal Investigator',
        fundingSource: fundingSource.trim(),
        grantProgram: grantProgram ? grantProgram.trim() : null,
        startYear: parseInt(startYear, 10) || year,
        endYear: endYear ? parseInt(endYear, 10) : year + 2,
        budgetRequested: budgetRequested ? parseFloat(budgetRequested) : null,
        deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
        status: status || 'DRAFT',
        proposalData: proposalData ? (typeof proposalData === 'string' ? proposalData : JSON.stringify(proposalData)) : null,
        budgetItems: budgetItems ? (typeof budgetItems === 'string' ? budgetItems : JSON.stringify(budgetItems)) : null,
        teamMembers: teamMembers ? (typeof teamMembers === 'string' ? teamMembers : JSON.stringify(teamMembers)) : null,
        documentsList: documentsList ? (typeof documentsList === 'string' ? documentsList : JSON.stringify(documentsList)) : null,
        deliverables: JSON.stringify([]),
      },
    });

    return Response.json({ success: true, grant });
  } catch (error) {
    console.error('POST /api/dashboard/grants error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
