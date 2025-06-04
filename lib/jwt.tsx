import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret_key';

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    // Si decoded est string, retourner null, sinon JwtPayload
    if (typeof decoded === 'string') {
      return null;
    }
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}
