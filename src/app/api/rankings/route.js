import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    // Security & Visibility Rule: strictly ACTIVE scholars only
    const scholars = await prisma.scholarProfile.findMany({
      where: { user: { accountStatus: 'ACTIVE' } },
      include: {
        department: { include: { faculty: true } },
        publications: { include: { publication: true } }
      },
      orderBy: { tiuScore: 'desc' }
    })

    // Aggregate department rankings
    const departments = await prisma.department.findMany({
      include: {
        faculty: true,
        scholars: {
          where: { user: { accountStatus: 'ACTIVE' } },
          include: {
            publications: { include: { publication: true } }
          }
        }
      }
    })

    const departmentRankings = departments.map(dept => {
      const scholarsCount = dept.scholars.length
      const totalScore = dept.scholars.reduce((acc, s) => acc + (s.tiuScore || 0), 0)
      const avgScore = scholarsCount > 0 ? Math.round(totalScore / scholarsCount) : 0
      const totalPubs = dept.scholars.reduce((acc, s) => acc + s.publications.filter(p => p.publication.status === 'APPROVED').length, 0)
      const totalCitations = dept.scholars.reduce((acc, s) => acc + (s.totalCitations || 0), 0)

      return {
        id: dept.id,
        nameEn: dept.nameEn,
        nameUz: dept.nameUz,
        nameRu: dept.nameRu,
        faculty: dept.faculty,
        scholarsCount,
        avgScore,
        totalPubs,
        totalCitations
      }
    }).sort((a, b) => b.avgScore - a.avgScore)

    return Response.json({
      scholars,
      departments: departmentRankings
    })
  } catch (error) {
    console.error('API GET /api/rankings error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
