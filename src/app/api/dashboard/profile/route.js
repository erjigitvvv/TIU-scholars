import { PrismaClient } from '@prisma/client'
import { fetchOrcidWorks } from '@/lib/orcid'

const prisma = new PrismaClient()

async function getActiveScholar() {
  return await prisma.scholarProfile.findFirst()
}

export async function GET(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    return Response.json({ profile: scholar })
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
      syncOrcid,
    } = body

    let updated = await prisma.scholarProfile.update({
      where: { id: scholar.id },
      data: {
        fullName: fullName || scholar.fullName,
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
