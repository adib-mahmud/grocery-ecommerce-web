/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { Search, Sparkles, Shield, Clock, Sprout } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onExploreCatalog: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  onExploreCatalog,
}) => {
  const { language, products } = useGrocery();
  const t = translations[language];

  const inStockCount = products.filter((p) => p.stock > 0).length;

  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-12 lg:py-16 border-b border-stone-800">
      
      {/* Decorative organic glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Editorial Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Editorial Kicker (Zero-Pill Discipline: Unboxed text with subtle separator) */}
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <Sprout className="w-4 h-4" />
              <span>Direct Farm-to-Kitchen Harvest</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-stone-300 font-mono-numbers">{inStockCount} Harvested SKUs Today</span>
            </div>

            {/* Headline with text-wrap: balance */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              Exceptional organic groceries, delivered in fifteen minutes.
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Hand-selected sourdough loaves, ripe heirloom crops, and cold-pressed olive oils. Real-time live inventory and end-to-end encrypted privacy.
            </p>

            {/* Search Input Bar */}
            <div className="pt-2 max-w-lg">
              <div className="relative flex items-center bg-stone-800/90 border border-stone-700 rounded-xl shadow-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full py-3 pl-3 pr-4 text-xs sm:text-sm bg-transparent text-white placeholder-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-3 text-xs text-stone-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Trust Proof Metrics Strip (Claim-to-proof adjacency) */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-stone-200 font-semibold font-mono-numbers">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>15–20 Mins</span>
                </div>
                <div className="text-[11px] text-stone-400">Cold-chain cargo dispatch</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-stone-200 font-semibold">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>AES-256 E2EE</span>
                </div>
                <div className="text-[11px] text-stone-400">Client-side zero knowledge</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-stone-200 font-semibold font-mono-numbers">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>10 Pts / $1</span>
                </div>
                <div className="text-[11px] text-stone-400">FreshClub loyalty credits</div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Hero Showcase with Zero-Broken-Image Fallback */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 border border-stone-700/80 p-6 sm:p-8 shadow-2xl">
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                    Morning Batch Selection
                  </span>
                  <h3 className="font-display text-lg font-bold text-white mt-0.5">
                    Artisanal Morning Breakfast
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-300 font-mono-numbers text-xs font-semibold border border-emerald-700/50">
                  Save 15%
                </span>
              </div>

              {/* Showcase items row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-stone-800/70 p-3 rounded-xl border border-stone-700/60 text-center">
                  <div className="text-3xl mb-1.5">🥑</div>
                  <div className="text-xs font-medium text-stone-200 truncate">Hass Avocado</div>
                  <div className="text-[11px] font-mono-numbers text-emerald-400 mt-0.5">$5.49</div>
                </div>

                <div className="bg-stone-800/70 p-3 rounded-xl border border-stone-700/60 text-center">
                  <div className="text-3xl mb-1.5">🥖</div>
                  <div className="text-xs font-medium text-stone-200 truncate">Sourdough</div>
                  <div className="text-[11px] font-mono-numbers text-emerald-400 mt-0.5">$6.25</div>
                </div>

                <div className="bg-stone-800/70 p-3 rounded-xl border border-stone-700/60 text-center">
                  <div className="text-3xl mb-1.5">🥚</div>
                  <div className="text-xs font-medium text-stone-200 truncate">Pasture Eggs</div>
                  <div className="text-[11px] font-mono-numbers text-emerald-400 mt-0.5">$5.95</div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-stone-400">
                  <span>Farm-picked at dawn</span>
                  <span className="mx-1.5">·</span>
                  <span className="text-emerald-400 font-medium">Ready to dispatch</span>
                </div>
                <button
                  onClick={onExploreCatalog}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  Shop Fresh Aisles
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
