import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const scholars = await p.scholarProfile.findMany({
    select: {
      id: true,
      fullName: true,
      publicEmail: true,
      department: { select: { id: true, nameUz: true } },
      user: { select: { id: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('Total scholars in DB:', scholars.length);
  scholars.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.department?.nameUz}] ${s.fullName} (User email: ${s.user?.email}, publicEmail: ${s.publicEmail}, role: ${s.user?.role})`);
  });

  const allUsers = await p.user.findMany({
    select: { id: true, email: true, role: true, scholarProfile: { select: { id: true, fullName: true } } },
  });
  console.log('\nAll users count:', allUsers.length);
  allUsers.forEach((u) => {
    if (!u.scholarProfile) {
      console.log(`- NON-SCHOLAR USER: ${u.email} (${u.role})`);
    }
  });
}

main().finally(() => p.$disconnect());
