// @ts-expect-error - otplib types are problematic
import { authenticator } from 'otplib';
import crypto from 'crypto';

// The encryption key should be exactly 32 bytes for AES-256. 
// For production, this MUST come from an environment variable (e.g. process.env.TOTP_ENCRYPTION_KEY).
// Falling back to a hardcoded string for development ONLY, if not provided.
const ENCRYPTION_KEY_STRING = process.env.TOTP_ENCRYPTION_KEY || 'abge-dev-secret-key-must-be-32-b';

function getEncryptionKey(): Buffer {
  // Ensure the key is exactly 32 bytes
  const key = Buffer.alloc(32);
  const sourceKey = Buffer.from(ENCRYPTION_KEY_STRING, 'utf-8');
  sourceKey.copy(key);
  return key;
}

export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export function generateTotpUri(secret: string, email: string) {
  return authenticator.keyuri(email, 'BhojAI Platform', secret);
}

export function verifyTotpToken(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

export function encryptTotpSecret(secret: string): string {
  const iv = crypto.randomBytes(12); // GCM standard IV size
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);

  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptTotpSecret(encryptedString: string): string {
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted TOTP secret format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
