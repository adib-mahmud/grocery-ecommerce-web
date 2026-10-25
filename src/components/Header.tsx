/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { Language } from '../types/grocery';
import {
  ShoppingBag,
  Bell,
  ShieldCheck,
  Globe,
  WifiOff,
  Leaf,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    cart,
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    setIsCartOpen,
    setIsPrivacyModalOpen,
    isOnline,
    unreadNotificationCount,
    keyFingerprint,
  } = useGrocery();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = translations[language];

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'US' },
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
    { code: 'ar', label: 'العربية', flag: 'SA' },
    { code: 'bn', label: 'বাংলা', flag: 'BD' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      {/* Universal Top Bar Contract: Exactly 3 Zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element Brand Wordmark */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-emerald-50 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <Leaf className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
              {t.appName}
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'catalog'
                ? 'text-emerald-800 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            {t.navCatalog}
          </button>

          <button
            onClick={() => setActiveTab('pantry')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'pantry'
                ? 'text-emerald-800 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            {t.navPantry}
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'rewards'
                ? 'text-emerald-800 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            {t.navRewards}
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'delivery'
                ? 'text-emerald-800 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            {t.navDelivery}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'admin'
                ? 'text-emerald-800 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            {t.navAdmin}
          </button>
        </nav>

        {/* Zone 3: 1 primary action lockup (Cart + Controls) */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Offline badge if disconnected */}
          {!isOnline && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Cache</span>
            </div>
          )}

          {/* E2EE Privacy Vault Button */}
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            title={`E2EE Privacy Shield Active (Key: ${keyFingerprint || '256-bit'})`}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="hidden xl:inline font-mono-numbers text-[11px] text-stone-500">
              {keyFingerprint ? keyFingerprint.slice(0, 9) : 'E2EE'}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs uppercase font-medium">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                      language === l.code ? 'font-semibold text-emerald-800 bg-emerald-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-stone-400 text-[10px] uppercase font-mono">{l.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-stone-50" />
            )}
          </button>

          {/* Primary Cart CTA Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] rounded-lg transition-all shadow-xs whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.cartTitle}</span>
            {totalCartItems > 0 && (
              <span className="ml-0.5 bg-emerald-700 px-1.5 py-0.5 rounded text-[11px] font-mono-numbers">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden border-t border-stone-200 bg-stone-100/60 overflow-x-auto py-2 px-4 gap-4 scrollbar-none">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`text-xs whitespace-nowrap px-2 py-1 rounded ${
            activeTab === 'catalog' ? 'bg-white shadow-xs font-semibold text-emerald-800' : 'text-stone-600'
          }`}
        >
          {t.navCatalog}
        </button>
        <button
          onClick={() => setActiveTab('pantry')}
          className={`text-xs whitespace-nowrap px-2 py-1 rounded ${
            activeTab === 'pantry' ? 'bg-white shadow-xs font-semibold text-emerald-800' : 'text-stone-600'
          }`}
        >
          {t.navPantry}
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`text-xs whitespace-nowrap px-2 py-1 rounded ${
            activeTab === 'rewards' ? 'bg-white shadow-xs font-semibold text-emerald-800' : 'text-stone-600'
          }`}
        >
          {t.navRewards}
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`text-xs whitespace-nowrap px-2 py-1 rounded ${
            activeTab === 'delivery' ? 'bg-white shadow-xs font-semibold text-emerald-800' : 'text-stone-600'
          }`}
        >
          {t.navDelivery}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`text-xs whitespace-nowrap px-2 py-1 rounded ${
            activeTab === 'admin' ? 'bg-white shadow-xs font-semibold text-emerald-800' : 'text-stone-600'
          }`}
        >
          {t.navAdmin}
        </button>
      </div>
    </header>
  );
};
