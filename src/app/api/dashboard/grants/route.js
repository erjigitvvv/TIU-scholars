import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function getActiveScholar() {
  const user = await getCurrentUser()
  if (!user || !user.scholarProfile) return null
  return user.scholarProfile
}

export async function GET(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const grants = await prisma.grantProject.findMany({
      where: { scholarId: scholar.id },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ grants })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const scholar = await getActiveScholar()
    if (!scholar) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, role, fundingSource, startYear, endYear } = body

    const grant = await prisma.grantProject.create({
      data: {
        scholarId: scholar.id,
        title,
        role: role || 'Principal Investigator',
        fundingSource: fundingSource || 'TIU Grant',
        startYear: parseInt(startYear, 10) || new Date().getFullYear(),
        endYear: endYear ? parseInt(endYear, 10) : null,
        status: 'PENDING',
      }
    })

    return Response.json({ success: true, grant })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
