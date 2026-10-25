/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import {
  Award,
  Flame,
  Gift,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export const LoyaltyRewards: React.FC = () => {
  const { loyalty, claimDailyStreak, language, setActiveTab } = useGrocery();
  const t = translations[language];

  // Tier calculation
  const tiers = [
    { name: 'Bronze', minPoints: 0, multiplier: '10 pts / $1', perk: 'Standard cold-chain delivery' },
    { name: 'Silver', minPoints: 400, multiplier: '12 pts / $1', perk: 'Free eco-delivery on orders over $35' },
    { name: 'Gold', minPoints: 1000, multiplier: '15 pts / $1', perk: 'Free delivery on all orders + 10% pantry bundles' },
    { name: 'Emerald VIP', minPoints: 2000, multiplier: '20 pts / $1', perk: 'Personal grocery concierge & seasonal rare harvest' },
  ];

  const currentTierIndex = tiers.findIndex((t) => t.name === loyalty.tier);
  const nextTier = tiers[currentTierIndex + 1] || null;
  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - loyalty.points) : 0;
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((loyalty.points - tiers[currentTierIndex].minPoints) / (nextTier.minPoints - tiers[currentTierIndex].minPoints)) * 100))
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              <Award className="w-4 h-4" />
              <span>Verdant FreshClub Rewards</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {loyalty.tier} Member
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-md">
              Earn credits on every organic harvest purchase and redeem instantly for checkout discounts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center min-w-[200px] shrink-0">
            <span className="text-xs uppercase tracking-wider text-stone-300 block font-medium">
              Available Credits
            </span>
            <span className="font-mono-numbers text-4xl font-black text-emerald-300 block my-1">
              {loyalty.points}
            </span>
            <span className="text-xs text-stone-200 font-mono-numbers">
              = ${(loyalty.points / 100).toFixed(2)} Grocery Credit
            </span>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mt-8 pt-6 border-t border-white/15 space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span>Progress to {nextTier.name} Tier</span>
              <span className="font-mono-numbers">{pointsToNext} points remaining</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: Daily Streak & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Streak Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Daily Eco-Streak</span>
              </div>
              <span className="font-mono-numbers text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded font-bold border border-amber-200">
                {loyalty.streakDays} Days Active
              </span>
            </div>

            <h4 className="font-display text-lg font-bold text-stone-900">
              Build Your Daily Harvest Streak
            </h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Check in daily or place reusable eco-tote orders to maintain your streak and earn +25 bonus points every single day.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              +25 pts credited instantly
            </span>
            <button
              onClick={claimDailyStreak}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl text-xs shadow-xs transition-colors"
            >
              <Gift className="w-4 h-4" />
              <span>{t.claimDailyStreak}</span>
            </button>
          </div>
        </div>

        {/* Lifetime Savings Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Harvest Dividends</span>
              </div>
              <span className="text-xs text-stone-400">Since Joining</span>
            </div>

            <h4 className="font-display text-lg font-bold text-stone-900">
              Lifetime Grocery Savings
            </h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Total dollars saved across point redemptions, member bundle pricing, and promotional eco-rebates.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="font-mono-numbers text-3xl font-extrabold text-stone-900">
              ${loyalty.lifetimeSavings.toFixed(2)}
            </span>
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
            >
              <span>Redeem on Next Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Tier Comparison Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Membership Benefits & Perk Ladder
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tiers.map((tr) => {
            const isCurrent = tr.name === loyalty.tier;

            return (
              <div
                key={tr.name}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-stone-50/60 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-stone-900">{tr.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>

                <div className="font-mono-numbers text-xs font-semibold text-emerald-800 mb-1">
                  {tr.multiplier}
                </div>
                <p className="text-xs text-stone-600 leading-snug">{tr.perk}</p>
                <div className="text-[10px] text-stone-400 font-mono mt-3">
                  Unlocks at {tr.minPoints} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
