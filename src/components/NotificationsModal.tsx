/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { PushNotification } from '../types/grocery';
import { Bell, Truck, Package, ShieldCheck, Award, CheckCircle2, X } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationsAsRead,
    setActiveTab,
  } = useGrocery();

  if (!isOpen) return null;

  const requestNativeNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Verdant Grocer', {
          body: 'Native push notifications enabled for live delivery tracking!',
          icon: '/icon.svg',
        });
      }
    }
  };

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'delivery':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'inventory':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'loyalty':
        return <Award className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-display">
                Push Notifications & Live Alerts
              </h3>
              <p className="text-[11px] text-stone-500">
                Delivery status changes, inventory restocks & security alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markNotificationsAsRead}
              className="text-[11px] text-stone-500 hover:text-stone-800 underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Native Browser Notification Banner */}
        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
          <div className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-900">
              Receive browser alerts when your courier is near?
            </span>
            <button
              onClick={requestNativeNotification}
              className="px-2.5 py-1 bg-emerald-800 text-white rounded text-[11px] font-semibold hover:bg-emerald-900 transition-colors"
            >
              Enable Push
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <span>No notifications yet</span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border text-xs transition-colors ${
                  notif.read
                    ? 'bg-stone-50/60 border-stone-200 text-stone-600'
                    : 'bg-white border-emerald-200 shadow-xs text-stone-800 ring-1 ring-emerald-500/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-stone-100 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-stone-900 truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-[11.5px]">
                      {notif.body}
                    </p>
                    {notif.orderId && (
                      <button
                        onClick={() => {
                          setActiveTab('delivery');
                          onClose();
                        }}
                        className="mt-2 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>View Live Delivery Dispatch</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
