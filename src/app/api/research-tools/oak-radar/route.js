import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetDegree = searchParams.get('degree') || 'PHD'; // 'PHD' | 'DSC'

    // 1. Fetch scholar's profile & approved publications
    const profile = await prisma.scholarProfile.findUnique({
      where: { userId: user.id },
      include: {
        department: { include: { faculty: true } },
        supervisions: {
          include: {
            milestones: true,
            reports: true,
          },
        },
      },
    });

    // 2. Fetch approved publications submitted or co-authored by this scholar
    const userPubs = await prisma.publication.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { submittedById: user.id },
          { authors: { some: { scholarId: profile?.id } } },
        ],
      },
    });

    // Count by category
    const oakCount = userPubs.filter((p) => p.type === 'OAK').length;
    const scopusCount = userPubs.filter((p) => p.type === 'SCOPUS' || p.type === 'WOS' || p.isScopusIndexed).length;
    const confCount = userPubs.filter((p) => p.type === 'CONFERENCE').length;
    const monographCount = userPubs.filter((p) => p.type === 'MONOGRAPH').length;
    const patentCount = userPubs.filter((p) => p.type === 'PATENT').length;

    // 3. OAK Official Norms
    const isPhd = targetDegree === 'PHD';
    const quotas = isPhd
      ? {
          title: 'Falsafa Doktori (PhD) OAK Mezonlari',
          oakRequired: 3,
          scopusRequired: 1,
          confRequired: 2,
          monographRequired: 0,
        }
      : {
          title: 'Fan Doktori (DSc) OAK Mezonlari',
          oakRequired: 10,
          scopusRequired: 3,
          confRequired: 3,
          monographRequired: 1,
        };

    const oakCompleted = oakCount >= quotas.oakRequired;
    const scopusCompleted = scopusCount >= quotas.scopusRequired;
    const confCompleted = confCount >= quotas.confRequired;
    const monographCompleted = monographCount >= quotas.monographRequired;

    // Calculate overall readiness score (0 - 100%)
    let points = 0;
    let maxPoints = 100;

    // Weights: OAK 35%, Scopus 35%, Conference 20%, Monograph/Patent 10%
    const oakScore = Math.min(1, oakCount / quotas.oakRequired) * (isPhd ? 40 : 35);
    const scopusScore = Math.min(1, scopusCount / quotas.scopusRequired) * (isPhd ? 40 : 35);
    const confScore = Math.min(1, confCount / quotas.confRequired) * 20;
    const extraScore = isPhd
      ? (patentCount > 0 ? 10 : 0)
      : Math.min(1, monographCount / quotas.monographRequired) * 10;

    const totalReadinessScore = Math.min(100, Math.round(oakScore + scopusScore + confScore + extraScore));

    // Diagnostics & Missing elements
    const deficits = [];
    if (!oakCompleted) {
      deficits.push(`Yana ${quotas.oakRequired - oakCount} ta OAK jurnali maqolasi chop etilishi zarur`);
    }
    if (!scopusCompleted) {
      deficits.push(`Yana ${quotas.scopusRequired - scopusCount} ta xalqaro Scopus / Web of Science maqolasi yetishmayapti`);
    }
    if (!confCompleted) {
      deficits.push(`Yana ${quotas.confRequired - confCount} ta xalqaro yoki respublika anjumani tezisi zarur`);
    }
    if (!isPhd && !monographCompleted) {
      deficits.push(`Kamida 1 ta ilmiy monografiya nashr qilinishi shart`);
    }

    const checklist = [
      {
        id: 'oak',
        label: 'OAK E’tirof Etgan Jurnallardagi Maqolalar',
        current: oakCount,
        required: quotas.oakRequired,
        unit: 'ta',
        completed: oakCompleted,
        weight: isPhd ? '40%' : '35%',
      },
      {
        id: 'scopus',
        label: 'Xalqaro Scopus / Web of Science Nashrlari',
        current: scopusCount,
        required: quotas.scopusRequired,
        unit: 'ta',
        completed: scopusCompleted,
        weight: isPhd ? '40%' : '35%',
      },
      {
        id: 'conference',
        label: 'Ilmiy-Amaliy Konferensiya Tezislari',
        current: confCount,
        required: quotas.confRequired,
        unit: 'ta',
        completed: confCompleted,
        weight: '20%',
      },
      {
        id: 'monograph',
        label: isPhd ? 'Patent / Mualliflik Guvohnomasi' : 'Ilmiy Monografiya',
        current: isPhd ? patentCount : monographCount,
        required: isPhd ? 0 : quotas.monographRequired,
        unit: 'ta',
        completed: isPhd ? true : monographCompleted,
        weight: '10%',
      },
    ];

    return NextResponse.json({
      success: true,
      targetDegree,
      title: quotas.title,
      readinessScore: totalReadinessScore,
      isFullyReady: deficits.length === 0,
      checklist,
      deficits,
      totalApprovedPublications: userPubs.length,
      supervisionsCount: profile?.supervisions?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/research-tools/oak-radar error:', error);
    return NextResponse.json({ success: false, error: 'Server xatosi' }, { status: 500 });
  }
}
