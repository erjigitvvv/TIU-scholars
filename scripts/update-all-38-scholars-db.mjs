import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const ALL_MAPPINGS = [
  { no: 1, match: 'Babayev Samandar', photoUrl: '/uploads/avatars/babayev-samandar.png' },
  { no: 2, match: 'Abdurashidov Bexruz', photoUrl: '/uploads/avatars/abdurashidov-bexruz.png' },
  { no: 3, match: 'Nuraliyev Farxod', photoUrl: '/uploads/avatars/nuraliyev-farxod.png' },
  { no: 4, match: 'Abdurazzoqov Javohir', photoUrl: '/uploads/avatars/abdurazzoqov-javohir.png' },
  { no: 5, match: 'Davronov Javlon', photoUrl: '/uploads/avatars/davronov-javlon.png' },
  { no: 6, match: 'Jumaniyozov Ibrohim', photoUrl: '/uploads/avatars/jumaniyozov-ibrohim.png' },
  { no: 7, match: 'Xudoyberdiyev Azizjon', photoUrl: '/uploads/avatars/xudoyberdiyev-azizjon.png' },
  { no: 8, match: 'Tojiboyeva Shaxzoda', photoUrl: '/uploads/avatars/tojiboyeva-shaxzoda.png' },
  { no: 9, match: 'Boytillayev Bobomurod', photoUrl: '/uploads/avatars/boytillayev-bobomurod.png' },
  { no: 10, match: 'Qo‘ldoshev Hakim', photoUrl: '/uploads/avatars/qoldoshev-hakim.png' },
  { no: 11, match: 'Abduaxadov Alibek', photoUrl: '/uploads/avatars/abduaxadov-alibek.png' },
  { no: 12, match: 'Olimov Nurali', photoUrl: '/uploads/avatars/olimov-nurali.png' },
  { no: 13, match: 'Qobilov Hojiakbar', photoUrl: '/uploads/avatars/qobilov-hojiakbar.png' },
  { no: 14, match: 'Mirziyodova Gulnozaxon', photoUrl: '/uploads/avatars/mirziyodova-gulnozaxon.png' },
  { no: 15, match: 'Polvonov Sarvarbek', photoUrl: '/uploads/avatars/polvonov-sarvarbek.png' },
  { no: 16, match: 'Shonazarov Soatmurot', photoUrl: '/uploads/avatars/shonazarov-soatmurot.png' },
  { no: 17, match: 'Mamadjanov Shuxratjon', photoUrl: '/uploads/avatars/mamadjanov-shuxratjon.png' },
  { no: 18, match: 'Turg‘unova Nafisaxon', photoUrl: '/uploads/avatars/turgunova-nafisaxon.png' },
  { no: 19, match: 'Kuchkarov Azamat', photoUrl: '/uploads/avatars/kuchkarov-azamat.png' },
  { no: 20, match: 'O‘rishov Sardor', photoUrl: '/uploads/avatars/orishov-sardor.png' },
  { no: 21, match: 'Abduraximov Dilshod', photoUrl: '/uploads/avatars/abduraximov-dilshod.png' },
  { no: 22, match: 'Ilxomzoda Azizbek', photoUrl: '/uploads/avatars/ilxomzoda-azizbek.png' },
  { no: 23, match: 'Sadikov Shoxrux', photoUrl: '/uploads/avatars/sadikov-shoxrux.png' },
  { no: 24, match: 'Rixsiboyev Nozimbek', photoUrl: '/uploads/avatars/rixsiboyev-nozimbek.png' },
  { no: 25, match: 'Xashimova Dilyora', photoUrl: '/uploads/avatars/xashimova-dilyora.png' },
  { no: 26, match: 'Axmedov Dilshod', photoUrl: '/uploads/avatars/axmedov-dilshod.png' },
  { no: 27, match: 'Mirzayeva Malika', photoUrl: '/uploads/avatars/mirzayeva-malika.png' },
  { no: 28, match: 'Arabov Ubaydullo', photoUrl: '/uploads/avatars/arabov-ubaydullo.png' },
  { no: 29, match: 'Ergashev Elyor', photoUrl: '/uploads/avatars/ergashev-elyor.png' },
  { no: 30, match: 'Djurayev Ma’mur', photoUrl: '/uploads/avatars/djurayev-mamur.png' },
  { no: 31, match: 'Qurbonov Xurshid', photoUrl: '/uploads/avatars/qurbonov-xurshid.png' },
  { no: 32, match: 'Hayotov Abdullo', photoUrl: '/uploads/avatars/hayotov-abdullo.png' },
  { no: 33, match: 'Hamdamov Muzaffar', photoUrl: '/uploads/avatars/hamdamov-muzaffar.png' },
  { no: 34, match: 'Abdullayev Jo‘shqin', photoUrl: '/uploads/avatars/abdullayev-joshqin.png' },
  { no: 35, match: 'Boltayev Habibjon', photoUrl: '/uploads/avatars/boltayev-habibjon.png' },
  { no: 36, match: 'Karimov Jaxongir', photoUrl: '/uploads/avatars/karimov-jaxongir.png' },
  { no: 37, match: 'Keunimjayev Muxamedali', photoUrl: '/uploads/avatars/keunimjayev-muxamedali.png' },
  { no: 38, match: 'Umarov Ulug‘bek', photoUrl: '/uploads/avatars/umarov-ulugbek.png' },
];

async function main() {
  let updatedCount = 0;
  for (const item of ALL_MAPPINGS) {
    const scholar = await prisma.scholarProfile.findFirst({
      where: { fullName: { contains: item.match } },
    });
    if (scholar) {
      await prisma.scholarProfile.update({
        where: { id: scholar.id },
        data: { photoUrl: item.photoUrl },
      });
      updatedCount++;
      console.log(`[${item.no}/38] Updated ${scholar.fullName} -> ${item.photoUrl}`);
    } else {
      console.warn(`[${item.no}/38] NOT FOUND in DB: ${item.match}`);
    }
  }
  console.log(`\nSuccessfully updated ${updatedCount} / ${ALL_MAPPINGS.length} scholars in DB!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
