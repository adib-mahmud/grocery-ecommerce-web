/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { translations } from '../utils/translations';
import { Product, DeliveryStage } from '../types/grocery';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    updateStock,
    restockProduct,
    orderHistory,
    activeOrder,
    advanceOrderStatus,
    language,
  } = useGrocery();

  const t = translations[language];

  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Metrics
  const totalRevenue = orderHistory.reduce((acc, o) => acc + o.total, 0) + (activeOrder ? activeOrder.total : 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.reorderThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const activeOrdersCount = activeOrder && activeOrder.status !== 'delivered' ? 1 : 0;

  // Filtered inventory
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.aisle.toLowerCase().includes(q);
    }
    return true;
  });

  const categories = ['All', 'Produce', 'Bakery', 'Dairy', 'Pantry', 'Beverages'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
            <Package className="w-4 h-4" />
            <span>Store Operations Console</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            {t.adminTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {t.adminSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time WebSocket link active</span>
        </div>
      </div>

      {/* KPI Stat Cards (Single-elevation, Tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Today&apos;s Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 font-mono-numbers text-2xl font-extrabold text-stone-900">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-stone-400">From verified harvest checkouts</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Active Deliveries</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 font-mono-numbers text-2xl font-extrabold text-stone-900">
            {activeOrdersCount} in transit
          </div>
          <div className="mt-1 text-[11px] text-stone-400">15-minute dispatch radius</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 font-mono-numbers text-2xl font-extrabold text-amber-700">
            {lowStockCount} SKUs
          </div>
          <div className="mt-1 text-[11px] text-stone-400">Below threshold trigger</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>E2EE Privacy Audit</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 font-mono-numbers text-2xl font-extrabold text-stone-900">
            100% Encrypted
          </div>
          <div className="mt-1 text-[11px] text-stone-400">Zero plaintext leakage</div>
        </div>

      </div>

      {/* Real-Time Order Dispatch Pipeline */}
      {activeOrder && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Active Order Dispatch Console (#{activeOrder.id})
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              Status: <strong className="text-emerald-800 uppercase">{activeOrder.status.replace('_', ' ')}</strong>
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-stone-900">
                Customer items ({activeOrder.items.length}):{' '}
                {activeOrder.items.map((i) => `${i.product.name} (×${i.quantity})`).join(', ')}
              </div>
              <div className="text-stone-500">
                Total: <span className="font-mono-numbers font-bold text-stone-900">${activeOrder.total.toFixed(2)}</span> · Courier: {activeOrder.courier.name} ({activeOrder.courier.vehicle})
              </div>
              <div className="text-[11px] text-stone-500 font-mono truncate max-w-lg">
                Address (Ciphertext): {activeOrder.deliveryAddressEncrypted.ciphertext.slice(0, 48)}...
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => advanceOrderStatus(activeOrder.id)}
                disabled={activeOrder.status === 'delivered'}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.dispatchOrder}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        
        {/* Table Controls Bar */}
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Real-Time Stock Inventory Manager
            </h3>
            <span className="text-xs text-stone-400 font-mono-numbers">({products.length} Products)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Filter by SKU or Aisle..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-emerald-600 w-48"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-1.5 px-3 bg-white border border-stone-300 rounded-lg focus:outline-emerald-600 text-stone-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/60 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Aisle & Location</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-center">Live Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4 text-right">Quick Restock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock > 0 && prod.stock <= prod.reorderThreshold;
                const isOut = prod.stock === 0;

                return (
                  <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                    
                    {/* Product & Emoji */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{prod.imageFallback.emoji}</span>
                        <div>
                          <div className="font-semibold text-stone-900">{prod.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {prod.id} · {prod.unit}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Aisle */}
                    <td className="py-3 px-4 text-stone-600">
                      <div>{prod.aisle}</div>
                      <div className="text-[10px] text-stone-400">{prod.origin}</div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono-numbers font-semibold text-stone-900">
                      ${prod.price.toFixed(2)}
                    </td>

                    {/* Live Stock Counter */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono-numbers font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </div>
                    </td>

                    {/* Threshold */}
                    <td className="py-3 px-4 font-mono-numbers text-stone-500">
                      Min {prod.reorderThreshold}
                    </td>

                    {/* Quick Restock Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => updateStock(prod.id, prod.stock - 1)}
                          disabled={prod.stock <= 0}
                          className="p-1 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 transition-colors"
                          title="Decrement stock by 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateStock(prod.id, prod.stock + 1)}
                          className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Increment stock by 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => restockProduct(prod.id, 10)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] transition-colors"
                          title="Restock +10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => restockProduct(prod.id, 50)}
                          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded font-semibold text-[11px] transition-colors"
                          title="Restock +50 units"
                        >
                          +50
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
