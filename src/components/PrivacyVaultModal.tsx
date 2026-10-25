/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import {
  encryptSensitiveData,
  decryptSensitiveData,
} from '../utils/crypto';
import { EncryptedPayload } from '../types/grocery';
import { ShieldCheck, Key, Lock, Unlock, Eye, Copy, Check, X } from 'lucide-react';

export const PrivacyVaultModal: React.FC = () => {
  const {
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    language,
    e2eePassphrase,
    keyFingerprint,
    updatePassphrase,
    orderHistory,
  } = useGrocery();

  const t = translations[language];

  const [customKeyInput, setCustomKeyInput] = useState(e2eePassphrase);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Interactive Live E2EE Sandbox
  const [demoInput, setDemoInput] = useState('742 Evergreen Terrace, Gate Code #9123, Leave inside cold bag');
  const [demoEncrypted, setDemoEncrypted] = useState<EncryptedPayload | null>(null);
  const [demoDecrypted, setDemoDecrypted] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isPrivacyModalOpen) return null;

  const handleSavePassphrase = async () => {
    if (customKeyInput.trim().length >= 8) {
      await updatePassphrase(customKeyInput.trim());
      setIsEditingKey(false);
    }
  };

  const handleTestEncrypt = async () => {
    setIsEncrypting(true);
    const result = await encryptSensitiveData(demoInput, customKeyInput);
    setDemoEncrypted(result);
    setDemoDecrypted('');
    setIsEncrypting(false);
  };

  const handleTestDecrypt = async () => {
    if (!demoEncrypted) return;
    const plaintext = await decryptSensitiveData(demoEncrypted, customKeyInput);
    setDemoDecrypted(plaintext);
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(keyFingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                {t.privacyVaultTitle}
              </h2>
              <p className="text-xs text-stone-500">
                Web Crypto API · AES-GCM 256-bit Client-Side Encryption
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPrivacyModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-stone-700">
          
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-emerald-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Zero-Knowledge Architecture Guarantee</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              {t.privacyVaultDescription} Neither cloud servers nor intermediaries ever receive your delivery address or gate instructions in plaintext.
            </p>
          </div>

          {/* Key & Fingerprint Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-500" />
                <span>{t.passphraseLabel}</span>
              </label>
              {!isEditingKey ? (
                <button
                  onClick={() => setIsEditingKey(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  Change Passphrase
                </button>
              ) : (
                <button
                  onClick={handleSavePassphrase}
                  className="text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded font-medium hover:bg-emerald-800"
                >
                  Save Key
                </button>
              )}
            </div>

            {isEditingKey ? (
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Enter min. 8 character master passphrase"
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-600"
              />
            ) : (
              <div className="px-3 py-2 bg-stone-100 rounded-lg font-mono text-xs text-stone-600 truncate border border-stone-200">
                {e2eePassphrase.replace(/./g, '•')} (Active AES-256 Master Key)
              </div>
            )}

            {/* SHA-256 Fingerprint */}
            <div>
              <div className="text-xs font-semibold text-stone-700 mb-1">
                {t.fingerprintLabel}
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-900 text-emerald-400 rounded-lg font-mono text-xs">
                <span>{keyFingerprint || 'Calculating SHA-256...'}</span>
                <button
                  onClick={copyFingerprint}
                  className="text-stone-400 hover:text-white p-1"
                  title="Copy fingerprint"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Cryptographic Sandbox */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Live E2EE Encryption Inspector
              </span>
              <span className="text-[11px] text-stone-500 font-mono">Algorithm: AES-GCM-256</span>
            </div>

            <div>
              <label className="text-xs text-stone-600 block mb-1">Customer Delivery Details (Plaintext Input):</label>
              <textarea
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTestEncrypt}
                disabled={isEncrypting}
                className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-medium hover:bg-emerald-900 flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt Locally with Web Crypto</span>
              </button>

              {demoEncrypted && (
                <button
                  onClick={handleTestDecrypt}
                  className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-medium hover:bg-stone-700 flex items-center gap-1.5 transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Decrypt with Key</span>
                </button>
              )}
            </div>

            {demoEncrypted && (
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-stone-500" />
                  <span>Cryptographic Wire Output (Ciphertext):</span>
                </div>
                <div className="p-2.5 bg-stone-900 text-stone-300 rounded-lg font-mono text-[11px] overflow-x-auto break-all space-y-1">
                  <div><span className="text-stone-500">IV (96-bit):</span> <span className="text-amber-400">{demoEncrypted.iv}</span></div>
                  <div><span className="text-stone-500">Salt (128-bit):</span> <span className="text-cyan-400">{demoEncrypted.salt}</span></div>
                  <div><span className="text-stone-500">Ciphertext:</span> <span className="text-emerald-400">{demoEncrypted.ciphertext.slice(0, 70)}...</span></div>
                </div>

                {demoDecrypted && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                    <span className="font-semibold">Decrypted Plaintext:</span> {demoDecrypted}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Encrypted Database stats */}
          <div className="text-xs text-stone-500 flex items-center justify-between border-t border-stone-200 pt-3">
            <span>Encrypted Records in Local DB: {orderHistory.length} orders</span>
            <span>PBKDF2 Iterations: 100,000</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => setIsPrivacyModalOpen(false)}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
