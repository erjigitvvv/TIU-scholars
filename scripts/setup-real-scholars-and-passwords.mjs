import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const MOCK_EMAILS_TO_DELETE = [
  'a.turgunov@tiu.uz',
  'n.karimova@tiu.uz',
  'j.rakhimov@tiu.uz',
  'd.umarova@tiu.uz',
  'b.kasimov@tiu.uz',
  'm.azizova@tiu.uz',
  'r.fayziyev@tiu.uz',
  'z.saidova@tiu.uz',
  's.normatov@tiu.uz',
  'g.sharipova@tiu.uz',
  'a.kadirov@tiu.uz',
  'm.tursunova@tiu.uz',
  'erjigitvovmirhamid@gmail.com', // Duplicate
];

function generatePassword() {
  const num = Math.floor(100 + Math.random() * 900); // 3 digits: 100-999
  return `tiuscholar${num}!`;
}

async function main() {
  console.log('=== 1. DELETING MOCK / FAKE SCHOLARS ===');
  for (const email of MOCK_EMAILS_TO_DELETE) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { scholarProfile: true },
    });
    if (user) {
      console.log(`Deleting mock user: ${user.email} (${user.scholarProfile?.fullName || 'No profile'})...`);
      await prisma.user.delete({ where: { id: user.id } });
    }
  }

  console.log('\n=== 2. UPDATING SADIKOV SHOXRUX POSITION ===');
  const sadikov = await prisma.scholarProfile.findFirst({
    where: { fullName: { contains: 'Sadikov Shoxrux' } },
  });
  if (sadikov) {
    await prisma.scholarProfile.update({
      where: { id: sadikov.id },
      data: {
        positionUz: 'IT departamenti rahbari, DSc, dotsent',
        positionRu: 'Руководитель IT департамента, DSc, доцент',
        positionEn: 'Head of IT Department, DSc, Associate Professor',
      },
    });
    console.log(`Updated Sadikov Shoxrux position to: "IT departamenti rahbari, DSc, dotsent"`);
  } else {
    console.warn('Sadikov Shoxrux not found in DB!');
  }

  console.log('\n=== 3. GENERATING LOGINS & PASSWORDS FOR ALL REAL SCHOLARS ===');
  const realScholars = await prisma.scholarProfile.findMany({
    where: {
      user: {
        email: { endsWith: '@tiu.uz' },
        role: 'SCHOLAR',
      },
    },
    include: {
      user: true,
      department: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${realScholars.length} real university scholars.`);

  const credentialsList = [];

  for (let i = 0; i < realScholars.length; i++) {
    const s = realScholars[i];
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await prisma.user.update({
      where: { id: s.user.id },
      data: {
        passwordHash,
        accountStatus: 'APPROVED',
      },
    });

    credentialsList.push({
      no: i + 1,
      fullName: s.fullName,
      position: s.positionUz || 'Kafedra o‘qituvchisi',
      department: s.department?.nameUz || 'Aniq fanlar va raqamli texnologiyalar kafedrasi',
      email: s.user.email,
      password: plainPassword,
      phone: s.phone || '-',
    });

    console.log(`[${i + 1}/${realScholars.length}] ${s.fullName} -> Login: ${s.user.email} | Password: ${plainPassword}`);
  }

  // Save to JSON
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const jsonFilePath = path.join(dataDir, 'tiu-scholars-credentials.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(credentialsList, null, 2), 'utf8');

  // Save to Markdown table
  let mdContent = `# Toshkent Xalqaro Universiteti (TIU)
## "Aniq fanlar va raqamli texnologiyalar" kafedrasi professor-o‘qituvchilari tizimga kirish (Login & Parol) ma’lumotnomasi

Yaratilgan sana: ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}

| № | Professor-o‘qituvchi F.I.SH. | Lavozimi | Login (Email) | Parol | Telefon raqami |
|---|---|---|---|---|---|
`;

  credentialsList.forEach((c) => {
    mdContent += `| ${c.no} | **${c.fullName}** | ${c.position} | \`${c.email}\` | \`${c.password}\` | ${c.phone} |\n`;
  });

  const mdFilePath = path.join(dataDir, 'tiu-scholars-credentials.md');
  fs.writeFileSync(mdFilePath, mdContent, 'utf8');

  console.log(`\nCredentials saved to:\n- ${jsonFilePath}\n- ${mdFilePath}`);
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
