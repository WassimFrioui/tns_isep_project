import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET, { expiresIn: '7d' });
};

export const setAuthCookie = (token: string, res: Response) => {
  res.headers.append(
    'Set-Cookie',
    serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
  );
};

export const getUserIdFromToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};