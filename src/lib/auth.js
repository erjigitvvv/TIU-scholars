import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from './prisma';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-123456';
  return new TextEncoder().encode(secret);
};

export async function signToken(payload) {
  const iat = Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime('7d')
    .sign(getJwtSecretKey());
}

export async function verifyToken(token) {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tiu_token')?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        scholarProfile: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

export function requireRole(user, allowedRoles) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(user.role);
}

export async function requireModeratorOrAdmin() {
  const user = await getCurrentUser();
  if (!user || !requireRole(user, ['MODERATOR', 'SUPER_ADMIN']) || user.accountStatus !== 'ACTIVE') {
    return null;
  }
  return user;
}

export async function getActiveScholar() {
  const user = await getCurrentUser();
  if (!user || user.accountStatus !== 'ACTIVE') {
    return null;
  }

  // Agar moderator yoki admin bo'lib scholarProfile hali yaratilmagan bo'lsa, avtomatik yaratish/ulash
  if (!user.scholarProfile && (user.role === 'MODERATOR' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
    let scholar = await prisma.scholarProfile.findFirst({
      where: { userId: user.id },
    });
    if (!scholar) {
      const defaultDept = await prisma.department.findFirst();
      if (defaultDept) {
        scholar = await prisma.scholarProfile.create({
          data: {
            userId: user.id,
            fullName: user.name || 'Moderator (Ilmiy Bo‘lim)',
            departmentId: defaultDept.id,
            academicDegree: 'PHD',
            academicTitle: 'DOCENT',
            tiuScore: 0,
          },
        });
      }
    }
    if (scholar) {
      return { ...scholar, accountEmail: user.email || '' };
    }
  }

  if (!user.scholarProfile) {
    return null;
  }
  return { ...user.scholarProfile, accountEmail: user.email || '' };
}
