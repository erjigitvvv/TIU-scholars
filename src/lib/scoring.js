import { prisma } from './prisma.js';

export const TYPE_WEIGHTS = {
  SCOPUS: 10,
  WOS: 10,
  OAK: 5,
  INTERNATIONAL_JOURNAL: 6,
  LOCAL_JOURNAL: 3,
  CONFERENCE: 2,
  MONOGRAPH: 7,
  TEXTBOOK: 6,
  PATENT: 6,
};

export const GRANT_WEIGHT = 8;
export const GRANT_PI_WEIGHT = 10;
export const GRANT_MEMBER_WEIGHT = 6;
export const SUPERVISION_WEIGHT = 6;
export const SUPERVISION_DSC_WEIGHT = 10;
export const SUPERVISION_PHD_WEIGHT = 6;

export function getGrantPoints(grant) {
  const role = String(grant?.role || '').toLowerCase();
  if (
    role.includes('pi') ||
    role.includes('rahbar') ||
    role.includes('lead') ||
    role.includes('руковод') ||
    role.includes('head')
  ) {
    return GRANT_PI_WEIGHT;
  }
  return GRANT_MEMBER_WEIGHT;
}

export function getSupervisionPoints(sup) {
  const deg = String(sup?.degreeType || '').toUpperCase();
  if (deg === 'DSC') return SUPERVISION_DSC_WEIGHT;
  return SUPERVISION_PHD_WEIGHT;
}

export const DEFAULT_SCORING_CONFIG = {
  scopusWeight: 10,
  q1Q2Bonus: 5,
  wosWeight: 10,
  oakWeight: 5,
  monographWeight: 7,
  patentWeight: 6,
  conferenceWeight: 2,
  citationWeight: 0.2,
};

function getPublicationWeight(type, config) {
  switch (type) {
    case 'SCOPUS':
      return config.scopusWeight;
    case 'WOS':
      return config.wosWeight;
    case 'OAK':
      return config.oakWeight;
    case 'MONOGRAPH':
      return config.monographWeight;
    case 'PATENT':
      return config.patentWeight;
    case 'CONFERENCE':
      return config.conferenceWeight;
    default:
      return TYPE_WEIGHTS[type] || 3;
  }
}

export function getPublicationPoints(pub, scoringConfig = null) {
  if (!pub) return 0;
  const config = scoringConfig || DEFAULT_SCORING_CONFIG;
  const weight = getPublicationWeight(pub.type, config);
  const bonus = pub.quartile === 'Q1' || pub.quartile === 'Q2' ? config.q1Q2Bonus : 0;
  return parseFloat((weight + bonus).toFixed(2));
}

export function computeHIndex(publications = []) {
  const citationCounts = publications
    .map((p) => p.citationsCount || 0)
    .sort((a, b) => b - a);

  let hIndex = 0;
  for (let i = 0; i < citationCounts.length; i++) {
    if (citationCounts[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }
  return hIndex;
}

export function computeScoreBreakdown(
  { approvedPublications = [], approvedGrants = [], approvedSupervisions = [] },
  scoringConfig = null
) {
  const config = scoringConfig || DEFAULT_SCORING_CONFIG;

  let scopusWosPoints = 0;
  let scopusWosCount = 0;
  let oakPoints = 0;
  let oakCount = 0;
  let otherPubPoints = 0;
  let totalCitations = 0;

  for (const pub of approvedPublications) {
    totalCitations += pub.citationsCount || 0;
    const bonus = pub.quartile === 'Q1' || pub.quartile === 'Q2' ? config.q1Q2Bonus : 0;
    const weight = getPublicationWeight(pub.type, config);

    if (pub.type === 'SCOPUS' || pub.type === 'WOS') {
      scopusWosCount += 1;
      scopusWosPoints += weight + bonus;
    } else if (pub.type === 'OAK') {
      oakCount += 1;
      oakPoints += weight + bonus;
    } else {
      otherPubPoints += weight + bonus;
    }
  }

  const citationsPoints = parseFloat((totalCitations * config.citationWeight).toFixed(2));
  const grantsPoints = approvedGrants.reduce((sum, g) => sum + getGrantPoints(g), 0);
  const supervisionsPoints = approvedSupervisions.reduce(
    (sum, s) => sum + getSupervisionPoints(s),
    0
  );

  const totalScore = parseFloat(
    (
      scopusWosPoints +
      oakPoints +
      otherPubPoints +
      citationsPoints +
      grantsPoints +
      supervisionsPoints
    ).toFixed(2)
  );

  return {
    hIndex: computeHIndex(approvedPublications),
    totalCitations,
    tiuScore: totalScore,
    scopusWosCount,
    scoreBreakdown: {
      scopusWos: { count: scopusWosCount, points: parseFloat(scopusWosPoints.toFixed(1)) },
      oak: { count: oakCount, points: parseFloat(oakPoints.toFixed(1)) },
      otherPubs: {
        count: approvedPublications.length - scopusWosCount - oakCount,
        points: parseFloat(otherPubPoints.toFixed(1)),
      },
      citations: { count: totalCitations, points: citationsPoints },
      grants: { count: approvedGrants.length, points: grantsPoints },
      supervisions: { count: approvedSupervisions.length, points: supervisionsPoints },
    },
  };
}

export async function recalculateScholarMetrics(scholarId) {
  try {
    const [config, pubAuthors, approvedGrants, approvedSupervisions] = await Promise.all([
      prisma.scoringConfig.findFirst(),
      prisma.publicationAuthor.findMany({
        where: { scholarId },
        include: { publication: true },
      }),
      prisma.grantProject.findMany({
        where: { scholarId, status: { in: ['APPROVED', 'WON', 'COMPLETED'] } },
      }),
      prisma.supervision.findMany({
        where: { scholarId, status: 'APPROVED' },
      }),
    ]);

    const approvedPublications = pubAuthors
      .map((pa) => pa.publication)
      .filter((p) => p && p.status === 'APPROVED');

    const { hIndex, totalCitations, tiuScore } = computeScoreBreakdown(
      { approvedPublications, approvedGrants, approvedSupervisions },
      config
    );

    const updated = await prisma.scholarProfile.update({
      where: { id: scholarId },
      data: {
        hIndex,
        totalCitations,
        tiuScore,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error in recalculateScholarMetrics:', error);
    throw error;
  }
}
