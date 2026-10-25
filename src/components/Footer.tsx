/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { Leaf, ShieldCheck, Lock, Wifi } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setActiveTab, setIsPrivacyModalOpen } = useGrocery();
  const t = translations[language];

  return (
    <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                {t.appName}
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-400">
            <button
              onClick={() => setActiveTab('catalog')}
              className="hover:text-white transition-colors"
            >
              {t.navCatalog}
            </button>
            <button
              onClick={() => setActiveTab('pantry')}
              className="hover:text-white transition-colors"
            >
              {t.navPantry}
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className="hover:text-white transition-colors"
            >
              {t.navRewards}
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className="hover:text-white transition-colors"
            >
              {t.navDelivery}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-white transition-colors"
            >
              {t.navAdmin}
            </button>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.navPrivacy}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Verdant Grocer Systems Inc. All rights reserved. Zero-Knowledge Cryptographic Compliance.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" /> Web Crypto AES-256 E2EE
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-500" /> Offline Indexed Cache Ready
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
