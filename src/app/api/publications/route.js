import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || ''
    const year = searchParams.get('year') || ''
    const facultyId = searchParams.get('facultyId') || ''

    // Security & Visibility Rule: strictly APPROVED publications by ACTIVE scholars
    const where = {
      status: 'APPROVED',
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (year && year !== 'ALL') {
      where.year = parseInt(year, 10)
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { doi: { contains: q } },
        { journalOrPublisher: { contains: q } },
      ]
    }

    if (facultyId) {
      where.submittedBy = {
        scholarProfile: {
          department: { facultyId }
        }
      }
    }

    const publications = await prisma.publication.findMany({
      where,
      include: {
        authors: {
          include: {
            scholar: {
              include: { department: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const faculties = await prisma.faculty.findMany()

    return Response.json({ publications, faculties })
  } catch (error) {
    console.error('API GET /api/publications error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
