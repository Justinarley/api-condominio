import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  const hashBuffer = Buffer.from(originalHash, 'hex');
  const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return timingSafeEqual(hashBuffer, hashToVerify);
}
