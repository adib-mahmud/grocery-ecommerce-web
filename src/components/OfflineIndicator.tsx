/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { WifiOff, Wifi, CloudCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSimulatedOffline, setSimulatedOffline, offlineQueue, language } = useGrocery();
  const t = translations[language];

  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-Time Inventory Sync Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>{t.offlineNotice}</span>
            </span>
          )}

          {offlineQueue.length > 0 && (
            <span className="text-stone-400 flex items-center gap-1">
              <span>·</span>
              <CloudCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{offlineQueue.length} order(s) cached locally</span>
            </span>
          )}
        </div>

        {/* Interactive toggle for testing offline resilience */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-[11px]">Testing Mode:</span>
          <button
            onClick={() => setSimulatedOffline(!isSimulatedOffline)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {isSimulatedOffline ? (
              <span className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Simulate Reconnect
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Simulate Offline
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
