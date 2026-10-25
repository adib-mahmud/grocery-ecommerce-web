/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  ShieldCheck,
  Award,
  ArrowRight,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateCartQuantity,
    removeFromCart,
    loyalty,
    language,
  } = useGrocery();

  const t = translations[language];

  // Loyalty points slider (100 pts = $1)
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeDeliveryThreshold = 35.0;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 3.99;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const maxRedeemablePoints = Math.min(loyalty.points, Math.floor(subtotal * 100));
  const pointsDiscount = (pointsToRedeem / 100);
  const total = Math.max(0, subtotal + deliveryFee - pointsDiscount);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                {t.cartTitle}
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-medium mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                {subtotal >= freeDeliveryThreshold
                  ? 'Free 15-Min Eco-Delivery Unlocked!'
                  : `Add $${remainingForFreeDelivery.toFixed(2)} for Free Delivery`}
              </span>
              <span className="font-mono-numbers font-bold">{freeDeliveryPercent}%</span>
            </div>
            <div className="h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center text-stone-400 space-y-3">
                <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-sm font-semibold text-stone-700">{t.cartEmpty}</p>
                <p className="text-xs">Browse our farm fresh aisles to pick ripe produce and artisan bakery items.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3.5 p-3 rounded-xl border border-stone-200/80 bg-stone-50/40"
                >
                  <span className="text-3xl shrink-0">{item.product.imageFallback.emoji}</span>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">{item.product.unit}</p>
                    <div className="font-mono-numbers text-xs font-bold text-emerald-800 mt-1">
                      ${(item.product.price * item.quantity).toFixed(2)}
                      <span className="text-[10px] text-stone-400 font-normal ml-1">
                        (${item.product.price.toFixed(2)}/ea)
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono-numbers font-bold px-1 text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 rounded flex items-center justify-center text-emerald-800 hover:bg-emerald-50 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Calculation */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 space-y-4">
              
              {/* Loyalty Redemption Slider */}
              {loyalty.points > 0 && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      <span>{t.redeemPoints}</span>
                    </span>
                    <span className="font-mono-numbers text-purple-700 font-bold">
                      -${pointsDiscount.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxRedeemablePoints}
                    step={50}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                    <span>0 pts</span>
                    <span>Using {pointsToRedeem} / {loyalty.points} pts</span>
                  </div>
                </div>
              )}

              {/* Subtotal & Total Breakdowns (Tabular numerals) */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-mono-numbers font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{t.deliveryFee}</span>
                  <span className="font-mono-numbers font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">{t.freeDelivery}</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>{t.pointsDiscount}</span>
                    <span className="font-mono-numbers">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>{t.orderTotal}</span>
                  <span className="font-mono-numbers text-base text-emerald-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* E2EE Assurance tag */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Protected by Web Crypto AES-256 E2EE</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>{t.checkoutButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
