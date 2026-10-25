/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { Product } from '../types/grocery';
import { Sparkles, ShoppingBag, Plus, RefreshCw, Calendar, CheckCircle } from 'lucide-react';

export const SmartPantry: React.FC = () => {
  const { products, addToCart, language, setIsCartOpen } = useGrocery();
  const t = translations[language];

  // Filter items that are due for replenishment
  const dueItems = products.filter((p) => {
    const daysAgo = p.lastPurchasedDaysAgo ?? 0;
    return daysAgo >= p.consumptionCycleDays - 1;
  });

  const healthyItems = products.filter((p) => {
    const daysAgo = p.lastPurchasedDaysAgo ?? 0;
    return daysAgo < p.consumptionCycleDays - 1 && daysAgo > 0;
  });

  const handleReplenishAll = () => {
    dueItems.forEach((item) => {
      if (item.stock > 0) {
        addToCart(item, 1);
      }
    });
    setIsCartOpen(true);
  };

  // Frequently Bought Together Bundle: Breakfast Duo
  const sourdough = products.find((p) => p.id === 'prod-sourdough');
  const eggs = products.find((p) => p.id === 'prod-eggs');
  const milk = products.find((p) => p.id === 'prod-milk');

  const handleAddBreakfastBundle = () => {
    if (sourdough && sourdough.stock > 0) addToCart(sourdough, 1);
    if (eggs && eggs.stock > 0) addToCart(eggs, 1);
    if (milk && milk.stock > 0) addToCart(milk, 1);
    setIsCartOpen(true);
  };

  const bundleOriginalTotal = (sourdough?.price || 0) + (eggs?.price || 0) + (milk?.price || 0);
  const bundleDiscountedTotal = bundleOriginalTotal * 0.9;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Personalized Predictive Replenishment</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            {t.smartPantryTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.smartPantrySubtitle}
          </p>
        </div>

        {dueItems.length > 0 && (
          <button
            onClick={handleReplenishAll}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.replenishAll} ({dueItems.length})</span>
          </button>
        )}
      </div>

      {/* Due for Replenishment Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-base font-bold text-stone-900">
              {t.dueForRestock} ({dueItems.length} items)
            </h3>
          </div>
          <span className="text-xs text-stone-500">Based on regular purchase cycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dueItems.map((product) => {
            const daysAgo = product.lastPurchasedDaysAgo ?? 0;
            const isOverdue = daysAgo >= product.consumptionCycleDays;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-3xl">{product.imageFallback.emoji}</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        isOverdue
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isOverdue ? 'Depleted' : 'Low at Home'}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                    {product.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">{product.unit}</p>

                  {/* Consumption cadence unboxed metadata */}
                  <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>Every {product.consumptionCycleDays} days</span>
                      </span>
                      <span className="font-mono-numbers text-stone-700">
                        Purchased {daysAgo}d ago
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-900 font-mono-numbers">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock <= 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{product.stock <= 0 ? t.outOfStock : t.addToCart}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Bought Together: Smart Pairing Engine */}
      <div className="bg-stone-100/70 border border-stone-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Personalized Pairing Engine
            </span>
            <h3 className="font-display text-xl font-bold text-stone-900 mt-0.5">
              {t.frequentlyBoughtTogether}: Farmhouse Breakfast Trio
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Customers who buy artisan sourdough regularly pair it with fresh pasture-raised eggs and glass-bottled Jersey milk.
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-stone-400 line-through font-mono-numbers">
              ${bundleOriginalTotal.toFixed(2)}
            </div>
            <div className="text-xl font-bold text-emerald-800 font-mono-numbers">
              ${bundleDiscountedTotal.toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Save 10% on bundle</span>
          </div>
        </div>

        {/* Bundle Items Visual Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[sourdough, eggs, milk].map((item, idx) => {
            if (!item) return null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 border border-stone-200 flex items-center gap-3 relative"
              >
                <span className="text-3xl">{item.imageFallback.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-stone-900 truncate">{item.name}</h5>
                  <p className="text-[11px] text-stone-500">{item.unit}</p>
                  <p className="text-xs font-semibold text-emerald-800 font-mono-numbers mt-0.5">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                {idx < 2 && (
                  <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-stone-200 text-stone-600 text-xs flex items-center justify-center font-bold">
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAddBreakfastBundle}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>{t.addBundle}</span>
          </button>
        </div>
      </div>

      {/* Stocked & Healthy in Your Household */}
      {healthyItems.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Sufficiently Stocked at Home
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {healthyItems.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-stone-200/80 rounded-xl p-3 text-center opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="text-2xl mb-1">{prod.imageFallback.emoji}</div>
                <div className="text-xs font-medium text-stone-800 truncate">{prod.name}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {(prod.consumptionCycleDays - (prod.lastPurchasedDaysAgo ?? 0))}d left
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
