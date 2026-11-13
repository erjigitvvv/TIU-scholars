import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const facultyId = searchParams.get('facultyId') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const academicDegree = searchParams.get('academicDegree') || ''
    const academicTitle = searchParams.get('academicTitle') || ''
    const sortBy = searchParams.get('sortBy') || 'tiuScore' // tiuScore, hIndex, publications, name

    // Security & Visibility Rule: strictly ACTIVE scholars only
    const where = {
      user: { accountStatus: 'ACTIVE' },
    }

    if (departmentId) {
      where.departmentId = departmentId
    } else if (facultyId) {
      where.department = { facultyId }
    }

    if (academicDegree && academicDegree !== 'ALL') {
      where.academicDegree = academicDegree
    }

    if (academicTitle && academicTitle !== 'ALL') {
      where.academicTitle = academicTitle
    }

    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { researchInterests: { contains: q } },
      ]
    }

    let orderBy = { tiuScore: 'desc' }
    if (sortBy === 'hIndex') orderBy = { hIndex: 'desc' }
    else if (sortBy === 'name') orderBy = { fullName: 'asc' }

    let scholars = await prisma.scholarProfile.findMany({
      where,
      include: {
        department: {
          include: { faculty: true }
        },
        publications: {
          include: { publication: true }
        }
      },
      orderBy,
    })

    // If sorting by publication count
    if (sortBy === 'publications') {
      scholars.sort((a, b) => {
        const countA = a.publications.filter(p => p.publication.status === 'APPROVED').length
        const countB = b.publications.filter(p => p.publication.status === 'APPROVED').length
        return countB - countA
      })
    }

    const faculties = await prisma.faculty.findMany({
      include: { departments: true }
    })

    return Response.json({ scholars, faculties })
  } catch (error) {
    console.error('API GET /api/scholars error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
