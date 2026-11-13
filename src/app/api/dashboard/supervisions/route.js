import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getActiveScholar() {
  return await prisma.scholarProfile.findFirst()
}

export async function GET(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const supervisions = await prisma.supervision.findMany({
      where: { scholarId: scholar.id },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ supervisions })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { studentName, degreeType, dissertationTitle, year } = body

    const supervision = await prisma.supervision.create({
      data: {
        scholarId: scholar.id,
        studentName,
        degreeType: degreeType || 'PHD',
        dissertationTitle,
        year: parseInt(year, 10) || new Date().getFullYear(),
        status: 'PENDING',
      }
    })

    return Response.json({ success: true, supervision })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
