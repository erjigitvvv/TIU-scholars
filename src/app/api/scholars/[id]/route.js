import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Security & Visibility Rule: strictly ACTIVE scholars only
    const scholar = await prisma.scholarProfile.findUnique({
      where: { id },
      include: {
        user: true,
        department: {
          include: { faculty: true }
        },
        publications: {
          include: {
            publication: {
              include: {
                authors: {
                  include: {
                    scholar: {
                      include: { department: true }
                    }
                  }
                }
              }
            }
          }
        },
        grantProjects: true,
        supervisions: true,
      }
    })

    if (!scholar || scholar.user.accountStatus !== 'ACTIVE') {
      return Response.json({ error: 'Scholar not found or inactive' }, { status: 404 })
    }

    // Filter strictly APPROVED records
    const approvedPublications = scholar.publications
      .map(pa => pa.publication)
      .filter(p => p && p.status === 'APPROVED')

    const approvedGrants = scholar.grantProjects.filter(g => g.status === 'APPROVED')
    const approvedSupervisions = scholar.supervisions.filter(s => s.status === 'APPROVED')

    // Derive Co-Authors from shared approved publications
    const coAuthorMap = new Map()
    for (const pub of approvedPublications) {
      if (pub.authors) {
        for (const auth of pub.authors) {
          if (auth.scholar && auth.scholarId !== scholar.id && auth.scholar.user?.accountStatus === 'ACTIVE') {
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
      }
    })
  } catch (error) {
    console.error('API GET /api/scholars/[id] error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
