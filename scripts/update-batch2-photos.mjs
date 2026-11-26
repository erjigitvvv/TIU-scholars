import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPDATES = [
  { match: 'Xudoyberdiyev Azizjon', photoUrl: '/uploads/avatars/xudoyberdiyev-azizjon.png' },
  { match: 'Tojiboyeva Shaxzoda', photoUrl: '/uploads/avatars/tojiboyeva-shaxzoda.png' },
  { match: 'Boytillayev Bobomurod', photoUrl: '/uploads/avatars/boytillayev-bobomurod.png' },
  { match: 'Hakim', photoUrl: '/uploads/avatars/qoldoshev-hakim.png' },
  { match: 'Abduaxadov Alibek', photoUrl: '/uploads/avatars/abduaxadov-alibek.png' },
  { match: 'Olimov Nurali', photoUrl: '/uploads/avatars/olimov-nurali.png' },
  { match: 'Qobilov Hojiakbar', photoUrl: '/uploads/avatars/qobilov-hojiakbar.png' },
];

async function main() {
  for (const item of UPDATES) {
    const scholar = await prisma.scholarProfile.findFirst({
      where: { fullName: { contains: item.match } },
    });
    if (scholar) {
      const updated = await prisma.scholarProfile.update({
        where: { id: scholar.id },
        data: { photoUrl: item.photoUrl },
      });
      console.log(`Updated [${updated.fullName}] -> ${updated.photoUrl}`);
    } else {
      console.warn(`NOT FOUND: ${item.match}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
