import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;

    const counts = {
      users: await prisma.user.count(),
      faculties: await prisma.faculty.count(),
      departments: await prisma.department.count(),
      scholars: await prisma.scholarProfile.count(),
      publications: await prisma.publication.count(),
      grants: await prisma.grantProject.count(),
      supervisions: await prisma.supervision.count(),
    };

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
      counts,
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      db: 'disconnected',
      error: error.message,
    }, { status: 500 });
  }
}
