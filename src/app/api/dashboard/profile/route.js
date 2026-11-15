import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { fetchOrcidWorks } from '@/lib/orcid'
import { getScholarSocialLinks, saveScholarSocialLinks } from '@/lib/scholarLinks'

async function getActiveScholar() {
  const user = await getCurrentUser()
  if (!user || !user.scholarProfile) return null
  return { ...user.scholarProfile, accountEmail: user.email || '' }
}

export async function GET(request) {
  try {
    const active = await getActiveScholar()
    if (!active) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const [scholar, faculties, higherRankedCount, totalActiveScholars] = await Promise.all([
      prisma.scholarProfile.findUnique({
        where: { id: active.id },
        include: {
          department: { include: { faculty: true } },
          publications: {
            include: {
              publication: {
                include: { authors: true }
              }
            }
          },
          grantProjects: true,
          supervisions: true,
        }
      }),
      prisma.faculty.findMany({
        include: { departments: { orderBy: { nameUz: 'asc' } } },
        orderBy: { nameUz: 'asc' }
      }),
      prisma.scholarProfile.count({
        where: {
          user: { accountStatus: 'ACTIVE' },
          tiuScore: { gt: active.tiuScore }
        }
      }),
      prisma.scholarProfile.count({
        where: { user: { accountStatus: 'ACTIVE' } }
      })
    ])

    const pubs = scholar.publications.map((pa) => pa.publication)
    const coAuthorIds = new Set()
    const yearMap = new Map()
    for (const pub of pubs) {
      for (const a of pub.authors || []) {
        if (a.scholarId !== scholar.id) coAuthorIds.add(a.scholarId)
      }
      if (pub.year) {
        yearMap.set(pub.year, (yearMap.get(pub.year) || 0) + 1)
      }
    }
    const yearlyDynamics = Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(-6)
      .map(([year, count]) => ({ year, count }))

    const ratingSummary = {
      rank: higherRankedCount + 1,
      totalScholars: totalActiveScholars,
      tiuScore: scholar.tiuScore,
      hIndex: scholar.hIndex,
      totalCitations: scholar.totalCitations,
      pubsCount: pubs.length,
      approvedPubs: pubs.filter((p) => p.status === 'APPROVED').length,
      grantsCount: scholar.grantProjects.length,
      supervisionsCount: scholar.supervisions.length,
      coAuthorsCount: coAuthorIds.size,
      yearlyDynamics,
    }

    const socialLinks = getScholarSocialLinks(scholar.id)
    return Response.json({
      profile: scholar,
      accountEmail: active.accountEmail || '',
      faculties,
      socialLinks,
      ratingSummary,
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      fullName,
      departmentId,
      academicDegree,
      academicTitle,
      bioUz,
      bioRu,
      bioEn,
      researchInterests,
      photoUrl,
      publicEmail,
      orcidId,
      scopusId,
      googleScholarUrl,
      socialLinks,
      syncOrcid,
    } = body

    if (socialLinks) {
      saveScholarSocialLinks(scholar.id, socialLinks)
    }

    let updated = await prisma.scholarProfile.update({
      where: { id: scholar.id },
      data: {
        fullName: fullName || scholar.fullName,
        ...(departmentId ? { departmentId } : {}),
        academicDegree: academicDegree || scholar.academicDegree,
        academicTitle: academicTitle || scholar.academicTitle,
        bioUz,
        bioRu,
        bioEn,
        researchInterests: typeof researchInterests === 'string' ? researchInterests : JSON.stringify(researchInterests || []),
        photoUrl,
        publicEmail,
        orcidId,
        scopusId,
        googleScholarUrl,
      }
    })

    // If Sync from ORCID requested
    if (syncOrcid && updated.orcidId) {
      const orcidWorks = await fetchOrcidWorks(updated.orcidId)
      for (const work of orcidWorks) {
        // Check if exists
        let existing = null
        if (work.doi) {
          existing = await prisma.publication.findUnique({ where: { doi: work.doi } })
        }
        if (!existing) {
          await prisma.publication.create({
            data: {
              title: work.title,
              type: work.type,
              journalOrPublisher: work.journalOrPublisher,
              year: work.year,
              doi: work.doi,
              url: work.url,
              status: 'PENDING',
              submittedById: scholar.userId,
              authors: {
                create: {
                  scholarId: scholar.id,
                  authorOrder: 1,
                }
              }
            }
          })
        }
      }
    }

    return Response.json({ success: true, profile: updated })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
