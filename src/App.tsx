/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GroceryProvider, useGrocery } from './context/GroceryContext';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { SmartPantry } from './components/SmartPantry';
import { LoyaltyRewards } from './components/LoyaltyRewards';
import { DeliveryTracker } from './components/DeliveryTracker';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PrivacyVaultModal } from './components/PrivacyVaultModal';
import { NotificationsModal } from './components/NotificationsModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, notifications } = useGrocery();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Latest unread notification for smooth bottom toast
  const latestNotification = notifications.find((n) => !n.read);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Offline Mode Indicator & Testing Switch */}
      <OfflineIndicator />

      {/* 2. Top Navigation Bar (Strict 3-Zone Contract) */}
      <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />

      {/* 3. Main Dynamic Content Body */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <>
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreCatalog={() => {
                const el = document.getElementById('catalog-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <div id="catalog-grid">
              <ProductCatalog searchQuery={searchQuery} />
            </div>
          </>
        )}

        {activeTab === 'pantry' && <SmartPantry />}

        {activeTab === 'rewards' && <LoyaltyRewards />}

        {activeTab === 'delivery' && <DeliveryTracker />}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Drawers and Modals */}
      <CartDrawer />
      <CheckoutModal />
      <PrivacyVaultModal />
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* 6. Live In-App Notification Toast */}
      {latestNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-800 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{latestNotification.title}</span>
              </div>
              <p className="text-stone-300 text-xs mt-1 leading-relaxed">
                {latestNotification.body}
              </p>
            </div>
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 shrink-0"
            >
              View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <GroceryProvider>
      <AppContent />
    </GroceryProvider>
  );
}
