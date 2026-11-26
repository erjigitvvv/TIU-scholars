import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPDATES = [
  { match: 'Mirziyodova Gulnozaxon', photoUrl: '/uploads/avatars/mirziyodova-gulnozaxon.png' },
  { match: 'Polvonov Sarvarbek', photoUrl: '/uploads/avatars/polvonov-sarvarbek.png' },
  { match: 'Shonazarov Soatmurot', photoUrl: '/uploads/avatars/shonazarov-soatmurot.png' },
  { match: 'Mamadjanov Shuxratjon', photoUrl: '/uploads/avatars/mamadjanov-shuxratjon.png' },
  { match: 'Turg‘unova Nafisaxon', photoUrl: '/uploads/avatars/turgunova-nafisaxon.png' },
  { match: 'Kuchkarov Azamat', photoUrl: '/uploads/avatars/kuchkarov-azamat.png' },
  { match: 'Sardor', photoUrl: '/uploads/avatars/orishov-sardor.png' },
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
