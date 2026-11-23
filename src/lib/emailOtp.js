import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);

let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * 1 daqiqalik 6 xonali tasdiqlash kodini generatsiya qilish va emailga yuborish
 */
export async function generateEmailOtp({ email, userId = null, purpose = 'CHANGE_EMAIL' }) {
  if (!email) throw new Error('Email manzili kiritilishi shart');
  const normalized = email.trim().toLowerCase();

  // Eski kodlarni tozalash
  await prisma.emailVerificationCode.deleteMany({
    where: {
      email: normalized,
      purpose,
    },
  }).catch(() => {});

  // 6 xonali tasdiqlash kodi
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 daqiqa (60 soniya)

  await prisma.emailVerificationCode.create({
    data: {
      userId,
      email: normalized,
      code,
      purpose,
      expiresAt,
    },
  });

  const subjectTitle =
    purpose === 'RESET_PASSWORD'
      ? 'TIU Scholars: Parolni tiklash uchun 1 daqiqalik kod'
      : 'TIU Scholars: Yangi emailni tasdiqlash kodi';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0F294A; margin: 0;">Tashkent International University</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Ilmiy tadqiqotchilar platformasi</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 12px; text-align: center;">
        <p style="color: #334155; font-size: 14px; margin-bottom: 12px;">
          ${purpose === 'RESET_PASSWORD' ? 'Hisobingiz parolini tiklash uchun tasdiqlash kodi:' : 'Yangi email manzilingizni tasdiqlash uchun 1 daqiqalik kod:'}
        </p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1; display: inline-block;">
          ${code}
        </div>
        <p style="color: #e11d48; font-size: 12px; font-weight: bold; margin-top: 14px;">
          ⏱ Ushbu kod aynan 1 daqiqa (60 soniya) davomida amal qiladi.
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 20px;">
        Agar ushbu so‘rovni siz amalga oshirmagan bo‘lsangiz, xatga e’tibor bermang.
      </p>
    </div>
  `;

  // Xat yuborish
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TIU Scholars" <${SMTP_USER}>`,
        to: normalized,
        subject: subjectTitle,
        html: htmlContent,
      });
      console.log(`[Email Sent] Successfully sent 1-min OTP code to ${normalized}`);
    } catch (err) {
      console.error('[Email Send Error]', err.message);
    }
  } else {
    console.log(`\n========================================`);
    console.log(`[TEST EMAIL OTP] To: ${normalized}`);
    console.log(`[CODE (60s)]: ${code}`);
    console.log(`[PURPOSE]: ${purpose}`);
    console.log(`========================================\n`);
  }

  return {
    success: true,
    email: normalized,
    code, // dev muhitida tezkor ko'rish uchun
    expiresAt,
    expiresInSeconds: 60,
  };
}

/**
 * 1 daqiqalik 6 xonali kodni tekshirish
 */
export async function verifyEmailOtp({ email, code, purpose = 'CHANGE_EMAIL' }) {
  if (!email || !code) {
    return { success: false, error: 'Email va tasdiqlash kodi kiritilishi shart.' };
  }

  const normalized = email.trim().toLowerCase();
  const cleanCode = code.trim().replace(/\D/g, ''); // faqat raqamlar

  const record = await prisma.emailVerificationCode.findFirst({
    where: {
      email: normalized,
      code: cleanCode,
      purpose,
      expiresAt: { gt: new Date() }, // 1 daqiqadan o'tmagan
    },
  });

  if (!record) {
    return {
      success: false,
      error: 'Kiritilgan 6 xonali kod xato yoki uning 1 daqiqalik amal qilish muddati tugagan.',
    };
  }

  // Kod bir martalik, o'chirib tashlaymiz
  await prisma.emailVerificationCode.delete({
    where: { id: record.id },
  }).catch(() => {});

  return { success: true };
}
