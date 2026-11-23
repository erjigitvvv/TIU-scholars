import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function getCodePrefix(type) {
  switch (type) {
    case 'ARTICLE':
      return 'TIU-ART';
    case 'THESIS':
      return 'TIU-THS';
    case 'DISSERTATION':
      return 'TIU-DIS';
    case 'AUTOREFERAT':
      return 'TIU-AUT';
    case 'MONOGRAPH':
      return 'TIU-MNG';
    case 'GRANT':
      return 'TIU-GRT';
    default:
      return 'TIU-PRJ';
  }
}

export async function GET(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const projects = await prisma.academicProject.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          {
            collaborators: {
              some: {
                OR: [{ userId: user.id }, { scholarEmail: user.email }],
              },
            },
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            scholarProfile: {
              select: {
                fullName: true,
                photoUrl: true,
                academicDegree: true,
                academicTitle: true,
              },
            },
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                scholarProfile: {
                  select: {
                    fullName: true,
                    photoUrl: true,
                    telegramUsername: true,
                  },
                },
              },
            },
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (err) {
    console.error('GET /api/academic-projects error:', err);
    return NextResponse.json({ success: false, error: 'Loyihalarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      type = 'ARTICLE',
      abstract = '',
      keywords = '',
      targetJournal = '',
      targetConference = '',
      grantFunder = '',
      budgetTotal = null,
      doi = '',
      contentBlocks = null,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Loyiha mavzusi / sarlavhasi kiritilishi shart' }, { status: 400 });
    }

    // Generate code
    const year = new Date().getFullYear();
    const prefix = getCodePrefix(type);
    const count = await prisma.academicProject.count({ where: { type } });
    const code = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    // Default IMRAD template if type === 'ARTICLE'
    const defaultBlocks = contentBlocks || JSON.stringify({
      introduction: '',
      methodology: '',
      results: '',
      discussion: '',
      conclusion: '',
    });

    const project = await prisma.academicProject.create({
      data: {
        code,
        title: title.trim(),
        type,
        abstract: abstract?.trim() || null,
        keywords: keywords?.trim() || null,
        targetJournal: targetJournal?.trim() || null,
        targetConference: targetConference?.trim() || null,
        grantFunder: grantFunder?.trim() || null,
        budgetTotal: budgetTotal ? parseFloat(budgetTotal) : null,
        doi: doi?.trim() || null,
        contentBlocks: typeof defaultBlocks === 'string' ? defaultBlocks : JSON.stringify(defaultBlocks),
        referencesList: JSON.stringify([]),
        creatorId: user.id,
        collaborators: {
          create: {
            userId: user.id,
            scholarEmail: user.email,
            scholarName: user.scholarProfile?.fullName || user.email,
            role: 'CORRESPONDING',
            creditRoles: JSON.stringify(['Conceptualization', 'Writing - original draft']),
            sharePercent: 100.0,
            inviteStatus: 'ACCEPTED',
            consentSignedAt: new Date(),
          },
        },
        versions: {
          create: {
            versionTag: 'v1.0',
            changesSummary: 'Loyiha yaratildi va boshlang‘ich shablon shakllantirildi.',
            createdById: user.id,
          },
        },
      },
      include: {
        collaborators: true,
        versions: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error('POST /api/academic-projects error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Loyiha yaratishda xatolik' }, { status: 500 });
  }
}
