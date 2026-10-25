/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { DeliveryStage } from '../types/grocery';
import { decryptSensitiveData } from '../utils/crypto';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  ChevronRight,
  Package,
  Sparkles,
  Lock,
} from 'lucide-react';

export const DeliveryTracker: React.FC = () => {
  const {
    activeOrder,
    advanceOrderStatus,
    language,
    setActiveTab,
  } = useGrocery();

  const t = translations[language];

  const [decryptedAddress, setDecryptedAddress] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  if (!activeOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="font-display text-xl font-bold text-stone-900">
          No Active Deliveries in Progress
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our fresh aisles, add artisanal organic produce to your bag, and complete an encrypted order to track live dispatch telemetry.
        </p>
        <button
          onClick={() => setActiveTab('catalog')}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          Browse Fresh Aisles
        </button>
      </div>
    );
  }

  const stages: { key: DeliveryStage; title: string; subtitle: string }[] = [
    { key: 'placed', title: t.stagePlaced, subtitle: 'Order received & queued' },
    { key: 'packing', title: t.stagePacking, subtitle: 'Pickers gathering fresh items' },
    { key: 'quality_check', title: t.stageQuality, subtitle: 'Cold-chain seal applied' },
    { key: 'out_for_delivery', title: t.stageOut, subtitle: 'Courier on cargo e-bike' },
    { key: 'delivered', title: t.stageDelivered, subtitle: 'Arrived at your doorstep' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === activeOrder.status);

  // Decrypt address on demand using client-side Web Crypto
  const handleDecryptAddress = async () => {
    setIsDecrypting(true);
    const decrypted = await decryptSensitiveData(activeOrder.deliveryAddressEncrypted);
    setDecryptedAddress(decrypted);
    setIsDecrypting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Order #{activeOrder.id} · Live Telemetry</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-900">
            {activeOrder.status === 'delivered' ? 'Harvest Successfully Delivered!' : 'En Route to Your Doorstep'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Placed on {activeOrder.date} · Payment: {activeOrder.paymentMasked}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-stone-500 block uppercase tracking-wider font-semibold">
              {t.driverEta}
            </span>
            <span className="font-mono-numbers text-2xl font-extrabold text-stone-900">
              {activeOrder.estimatedMinutes > 0 ? `${activeOrder.estimatedMinutes} Mins` : 'Just Arrived'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-6">
          Dispatch Milestones & Quality Audit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {stages.map((stg, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stg.key}
                className={`relative flex flex-col items-start p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                    : isCompleted
                    ? 'bg-stone-50/70 border-stone-200'
                    : 'bg-white border-dashed border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  )}
                </div>

                <div className="font-semibold text-xs text-stone-900">{stg.title}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">{stg.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Advance Simulation Controller for testing */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-stone-500">
            Staff & Simulation controls: advance dispatch stages to test real-time push audio & alert triggers.
          </span>
          <button
            onClick={() => advanceOrderStatus(activeOrder.id)}
            disabled={activeOrder.status === 'delivered'}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Advance Next Stage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two Column Grid: Live Interactive Map + Courier & Encrypted Address */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulated Interactive Route Map */}
        <div className="lg:col-span-7 bg-stone-900 rounded-2xl p-6 text-stone-200 border border-stone-800 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
          
          {/* Map Grid Canvas Background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Map Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Live GPS Transit Telemetry
              </span>
            </div>
            <span className="text-xs font-mono text-stone-400">Route 14A · Micro-Depot #2</span>
          </div>

          {/* Interactive Visual Route Path */}
          <div className="relative z-10 my-10 px-4">
            <div className="relative h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                style={{
                  width: `${
                    activeOrder.status === 'placed'
                      ? '15%'
                      : activeOrder.status === 'packing'
                      ? '35%'
                      : activeOrder.status === 'quality_check'
                      ? '55%'
                      : activeOrder.status === 'out_for_delivery'
                      ? '85%'
                      : '100%'
                  }`,
                }}
              />
            </div>

            {/* Courier Position Marker */}
            <div className="flex justify-between items-center mt-4 text-xs">
              <div className="flex items-center gap-1.5 text-stone-400">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Verdant Store</span>
              </div>

              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300 font-medium">
                <Truck className="w-3.5 h-3.5" />
                <span>{activeOrder.courier.vehicle}</span>
              </div>

              <div className="flex items-center gap-1.5 text-stone-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Your Address</span>
              </div>
            </div>
          </div>

          {/* Map Footer Telemetry */}
          <div className="relative z-10 pt-4 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between font-mono">
            <span>Speed: 18 km/h</span>
            <span>Temperature: 4°C (Cold-chain verified)</span>
          </div>

        </div>

        {/* Right Column: Courier Card & Encrypted Address */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Courier Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Assigned Eco-Courier
            </h4>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-lg">
                MR
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-stone-900 truncate">
                  {activeOrder.courier.name}
                </h5>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                  <span className="flex items-center text-amber-600 font-semibold font-mono-numbers">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                    {activeOrder.courier.rating}
                  </span>
                  <span>·</span>
                  <span className="truncate">{activeOrder.courier.vehicle}</span>
                </div>
              </div>

              <a
                href={`tel:${activeOrder.courier.phone}`}
                className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                title="Call Courier"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* E2EE Encrypted Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Delivery Address (E2EE)</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">AES-256</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700 space-y-1">
              <div className="font-mono text-stone-500 text-[11px] truncate">
                Ciphertext: {activeOrder.deliveryAddressEncrypted.ciphertext.slice(0, 36)}...
              </div>

              {decryptedAddress ? (
                <div className="pt-2 text-stone-900 font-medium">
                  {decryptedAddress}
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-stone-600">
                    Preview: {activeOrder.deliveryAddressEncrypted.maskedSummary}
                  </span>
                  <button
                    onClick={handleDecryptAddress}
                    disabled={isDecrypting}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isDecrypting ? 'Decrypting...' : 'Decrypt with Key'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Harvest Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 uppercase tracking-wider">
              <span>Packed Items ({activeOrder.items.length})</span>
              <span className="font-mono-numbers text-emerald-800 text-sm">
                ${activeOrder.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {activeOrder.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.product.imageFallback.emoji}</span>
                    <span className="text-stone-800 font-medium truncate max-w-[180px]">
                      {item.product.name}
                    </span>
                    <span className="text-stone-400 font-mono-numbers">×{item.quantity}</span>
                  </div>
                  <span className="font-mono-numbers font-medium text-stone-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
