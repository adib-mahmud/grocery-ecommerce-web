/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EncryptedPayload } from '../types/grocery';

// Default application zero-knowledge master passphrase (can be personalized by the user in Privacy Vault)
const DEFAULT_PASSPHRASE = 'Verdant-E2EE-ZeroKnowledge-Key-2026';

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Derives a 256-bit AES-GCM key from a user passphrase and cryptographic salt
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary sensitive customer plaintext using AES-GCM 256-bit with IV and salt
 */
export async function encryptSensitiveData(
  plainText: string,
  customPassphrase?: string
): Promise<EncryptedPayload> {
  if (!plainText) {
    return {
      ciphertext: '',
      iv: '',
      salt: '',
      timestamp: new Date().toISOString(),
      maskedSummary: 'Empty',
    };
  }

  const passphrase = customPassphrase || localStorage.getItem('verdant_e2ee_passphrase') || DEFAULT_PASSPHRASE;
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM

  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const encodedPlaintext = enc.encode(plainText);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedPlaintext
  );

  // Generate a non-sensitive preview mask (e.g., "123 Main... [AES-256 Encrypted]")
  const masked = plainText.length > 8 ? `${plainText.slice(0, 4)}*** ${plainText.slice(-3)}` : '****';

  return {
    ciphertext: bufferToHex(encryptedBuffer),
    iv: bufferToHex(iv.buffer),
    salt: bufferToHex(salt.buffer),
    timestamp: new Date().toISOString(),
    maskedSummary: masked,
  };
}

/**
 * Decrypts an EncryptedPayload using the current passphrase
 */
export async function decryptSensitiveData(
  payload: EncryptedPayload,
  customPassphrase?: string
): Promise<string> {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.salt) {
    return '';
  }

  try {
    const passphrase = customPassphrase || localStorage.getItem('verdant_e2ee_passphrase') || DEFAULT_PASSPHRASE;
    const saltBuffer = new Uint8Array(hexToBuffer(payload.salt));
    const ivBuffer = new Uint8Array(hexToBuffer(payload.iv));
    const ciphertextBuffer = hexToBuffer(payload.ciphertext);

    const key = await deriveKey(passphrase, saltBuffer);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      ciphertextBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.warn('E2EE Decryption failed (passphrase mismatch or altered payload):', err);
    return '[Decryption Error: Passphrase Mismatch]';
  }
}

/**
 * Computes a SHA-256 cryptographic fingerprint of current key material for visual verification
 */
export async function computePassphraseFingerprint(passphrase?: string): Promise<string> {
  const pass = passphrase || localStorage.getItem('verdant_e2ee_passphrase') || DEFAULT_PASSPHRASE;
  const enc = new TextEncoder();
  const digestBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(pass));
  const hex = bufferToHex(digestBuffer);
  return `${hex.slice(0, 4)}:${hex.slice(4, 8)}:${hex.slice(8, 12)}:${hex.slice(12, 16)}`;
}
