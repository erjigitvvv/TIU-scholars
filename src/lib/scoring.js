import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TYPE_WEIGHTS = {
  SCOPUS: 10,
  WOS: 10,
  OAK: 5,
  INTERNATIONAL_JOURNAL: 6,
  LOCAL_JOURNAL: 3,
  CONFERENCE: 2,
  MONOGRAPH: 7,
  TEXTBOOK: 6,
  PATENT: 6,
}

export async function recalculateScholarMetrics(scholarId) {
  try {
    // 1. Load ScoringConfig or defaults
    let config = await prisma.scoringConfig.findFirst()
    if (!config) {
      config = {
        scopusWeight: 10,
        q1Q2Bonus: 5,
        wosWeight: 10,
        oakWeight: 5,
        monographWeight: 7,
        patentWeight: 6,
        conferenceWeight: 2,
        citationWeight: 0.2,
      }
    }

    // 2. Query APPROVED publications via PublicationAuthor
    const pubAuthors = await prisma.publicationAuthor.findMany({
      where: { scholarId },
      include: {
        publication: true,
      },
    })

    const approvedPubs = pubAuthors
      .map(pa => pa.publication)
      .filter(p => p && p.status === 'APPROVED')

    // 3. Compute H-index, totalCitations, and tiuScore
    let totalCitations = 0
    const citationCounts = approvedPubs.map(p => p.citationsCount || 0).sort((a, b) => b - a)

    // H-index calculation: h publications with at least h citations
    let hIndex = 0
    for (let i = 0; i < citationCounts.length; i++) {
      if (citationCounts[i] >= i + 1) {
        hIndex = i + 1
      } else {
        break
      }
    }

    let rawScoreSum = 0
    for (const pub of approvedPubs) {
      totalCitations += (pub.citationsCount || 0)

      let baseWeight = TYPE_WEIGHTS[pub.type] || 3
      // Override with config if present
      if (pub.type === 'SCOPUS') baseWeight = config.scopusWeight
      if (pub.type === 'WOS') baseWeight = config.wosWeight
      if (pub.type === 'OAK') baseWeight = config.oakWeight
      if (pub.type === 'MONOGRAPH') baseWeight = config.monographWeight
      if (pub.type === 'PATENT') baseWeight = config.patentWeight
      if (pub.type === 'CONFERENCE') baseWeight = config.conferenceWeight

      let bonus = 0
      if (pub.quartile === 'Q1' || pub.quartile === 'Q2') {
        bonus = config.q1Q2Bonus
      }

      rawScoreSum += (baseWeight + bonus)
    }

    const tiuScore = rawScoreSum + (totalCitations * config.citationWeight)

    // 4. Update ScholarProfile
    const updated = await prisma.scholarProfile.update({
      where: { id: scholarId },
      data: {
        hIndex,
        totalCitations,
        tiuScore: parseFloat(tiuScore.toFixed(2)),
      },
    })

    return updated
  } catch (error) {
    console.error('Error in recalculateScholarMetrics:', error)
    throw error
  }
}
