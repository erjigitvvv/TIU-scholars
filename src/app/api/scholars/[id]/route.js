import { prisma } from '@/lib/prisma'

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

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const [scholar, scoringConfig] = await Promise.all([
      prisma.scholarProfile.findUnique({
        where: { id },
        include: {
          user: true,
          department: {
            include: { faculty: true },
          },
          publications: {
            include: {
              publication: {
                include: {
                  authors: {
                    include: {
                      scholar: {
                        include: { department: true },
                      },
                    },
                  },
                },
              },
            },
          },
          grantProjects: true,
          supervisions: true,
        },
      }),
      prisma.scoringConfig.findFirst(),
    ])

    if (!scholar || scholar.user.accountStatus !== 'ACTIVE') {
      return Response.json({ error: 'Scholar not found or inactive' }, { status: 404 })
    }

    const config = scoringConfig || {
      scopusWeight: 10,
      q1Q2Bonus: 5,
      wosWeight: 10,
      oakWeight: 5,
      monographWeight: 7,
      patentWeight: 6,
      conferenceWeight: 2,
      citationWeight: 0.2,
    }

    // Filter strictly APPROVED records
    const approvedPublications = scholar.publications
      .map((pa) => pa.publication)
      .filter((p) => p && p.status === 'APPROVED')
      .sort((a, b) => (b.year || 0) - (a.year || 0))

    const approvedGrants = scholar.grantProjects.filter((g) => g.status === 'APPROVED')
    const approvedSupervisions = scholar.supervisions.filter((s) => s.status === 'APPROVED')

    // Transparent Score Breakdown (Variant D)
    let scopusWosPoints = 0
    let scopusWosCount = 0
    let oakPoints = 0
    let oakCount = 0
    let otherPubPoints = 0
    let totalCitations = 0

    for (const pub of approvedPublications) {
      totalCitations += pub.citationsCount || 0
      const bonus = pub.quartile === 'Q1' || pub.quartile === 'Q2' ? config.q1Q2Bonus : 0

      if (pub.type === 'SCOPUS' || pub.type === 'WOS') {
        scopusWosCount += 1
        const w = pub.type === 'SCOPUS' ? config.scopusWeight : config.wosWeight
        scopusWosPoints += w + bonus
      } else if (pub.type === 'OAK') {
        oakCount += 1
        oakPoints += config.oakWeight + bonus
      } else {
        let w = TYPE_WEIGHTS[pub.type] || 3
        if (pub.type === 'MONOGRAPH') w = config.monographWeight
        if (pub.type === 'PATENT') w = config.patentWeight
        if (pub.type === 'CONFERENCE') w = config.conferenceWeight
        otherPubPoints += w + bonus
      }
    }

    const citationsPoints = parseFloat((totalCitations * config.citationWeight).toFixed(2))
    const grantsPoints = approvedGrants.length * 8
    const supervisionsPoints = approvedSupervisions.length * 6

    const scoreBreakdown = {
      scopusWos: { count: scopusWosCount, points: parseFloat(scopusWosPoints.toFixed(1)) },
      oak: { count: oakCount, points: parseFloat(oakPoints.toFixed(1)) },
      otherPubs: {
        count: approvedPublications.length - scopusWosCount - oakCount,
        points: parseFloat(otherPubPoints.toFixed(1)),
      },
      citations: { count: totalCitations, points: citationsPoints },
      grants: { count: approvedGrants.length, points: grantsPoints },
      supervisions: { count: approvedSupervisions.length, points: supervisionsPoints },
    }

    // Derive Co-Authors from shared approved publications
    const coAuthorMap = new Map()
    for (const pub of approvedPublications) {
      if (pub.authors) {
        for (const auth of pub.authors) {
          if (
            auth.scholar &&
            auth.scholarId !== scholar.id &&
            auth.scholar.user?.accountStatus === 'ACTIVE'
          ) {
            coAuthorMap.set(auth.scholar.id, auth.scholar)
          }
        }
      }
    }
    const coAuthors = Array.from(coAuthorMap.values())

    return Response.json({
      scholar: {
        ...scholar,
        publications: approvedPublications,
        grantProjects: approvedGrants,
        supervisions: approvedSupervisions,
        coAuthors,
        scopusWosCount,
        scoreBreakdown,
      },
    })
  } catch (error) {
    console.error('API GET /api/scholars/[id] error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
