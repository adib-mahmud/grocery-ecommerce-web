/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  Order,
  DeliveryStage,
  LoyaltyProfile,
  Language,
  PushNotification,
  EncryptedPayload,
} from '../types/grocery';
import { initialProducts } from '../data/mockProducts';
import { computePassphraseFingerprint } from '../utils/crypto';
import { playDeliveryChime, playSuccessChime } from '../utils/audio';

interface GroceryContextType {
  products: Product[];
  cart: CartItem[];
  loyalty: LoyaltyProfile;
  activeOrder: Order | null;
  orderHistory: Order[];
  language: Language;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  offlineQueue: Order[];
  notifications: PushNotification[];
  unreadNotificationCount: number;
  e2eePassphrase: string;
  keyFingerprint: string;
  activeTab: 'catalog' | 'pantry' | 'rewards' | 'delivery' | 'admin' | 'privacy';
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isPrivacyModalOpen: boolean;
  
  // Actions
  setActiveTab: (tab: 'catalog' | 'pantry' | 'rewards' | 'delivery' | 'admin' | 'privacy') => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsPrivacyModalOpen: (open: boolean) => void;
  setLanguage: (lang: Language) => void;
  setSimulatedOffline: (offline: boolean) => void;
  
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  updateStock: (productId: string, newStock: number) => void;
  restockProduct: (productId: string, amount: number) => void;
  
  placeOrder: (details: {
    paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'loyalty' | 'cash';
    paymentMasked: string;
    deliveryAddressEncrypted: EncryptedPayload;
    deliveryNotesEncrypted?: EncryptedPayload;
    pointsUsed: number;
  }) => Promise<Order>;
  
  advanceOrderStatus: (orderId: string, nextStage?: DeliveryStage) => void;
  claimDailyStreak: () => void;
  sendPushNotification: (title: string, body: string, type?: 'delivery' | 'inventory' | 'loyalty' | 'security', orderId?: string) => void;
  markNotificationsAsRead: () => void;
  updatePassphrase: (passphrase: string) => Promise<void>;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'verdant_products_v2',
  CART: 'verdant_cart_v2',
  LOYALTY: 'verdant_loyalty_v2',
  ACTIVE_ORDER: 'verdant_active_order_v2',
  ORDER_HISTORY: 'verdant_order_history_v2',
  NOTIFICATIONS: 'verdant_notifications_v2',
  PASSPHRASE: 'verdant_e2ee_passphrase',
  OFFLINE_QUEUE: 'verdant_offline_queue_v2',
  LANGUAGE: 'verdant_selected_lang',
};

const DEFAULT_LOYALTY: LoyaltyProfile = {
  points: 480,
  tier: 'Silver',
  streakDays: 4,
  lastCheckinDate: '',
  lifetimeSavings: 38.50,
};

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
  });

  // 2. Real-time products inventory state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // 3. Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Loyalty Profile
  const [loyalty, setLoyalty] = useState<LoyaltyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOYALTY);
      return saved ? JSON.parse(saved) : DEFAULT_LOYALTY;
    } catch {
      return DEFAULT_LOYALTY;
    }
  });

  // 5. Active and past orders
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDER_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Notifications
  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'welcome-notif',
          title: 'Welcome to Verdant Grocer',
          body: 'Zero-knowledge end-to-end privacy enabled. Enjoy fresh farm produce.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'security',
          read: false,
        },
      ];
    } catch {
      return [];
    }
  });

  // 7. Navigation & Modal UI states
  const [activeTab, setActiveTab] = useState<'catalog' | 'pantry' | 'rewards' | 'delivery' | 'admin' | 'privacy'>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // 8. Offline & Connectivity
  const [isHardwareOnline, setIsHardwareOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const isOnline = isHardwareOnline && !isSimulatedOffline;

  const [offlineQueue, setOfflineQueue] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 9. E2EE Passphrase & SHA-256 fingerprint
  const [e2eePassphrase, setE2eePassphrase] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PASSPHRASE) || 'Verdant-E2EE-ZeroKnowledge-Key-2026';
  });
  const [keyFingerprint, setKeyFingerprint] = useState<string>('');

  useEffect(() => {
    computePassphraseFingerprint(e2eePassphrase).then(setKeyFingerprint);
  }, [e2eePassphrase]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(loyalty));
  }, [loyalty]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, JSON.stringify(activeOrder));
  }, [activeOrder]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Handle hardware online/offline events
  useEffect(() => {
    const handleOnline = () => setIsHardwareOnline(true);
    const handleOffline = () => setIsHardwareOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline queue when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      sendPushNotification(
        'Offline Orders Synchronized',
        `${offlineQueue.length} queued grocery order(s) successfully synced with the store server.`,
        'inventory'
      );
      setOrderHistory((prev) => [...offlineQueue, ...prev]);
      setOfflineQueue([]);
    }
  }, [isOnline, offlineQueue]);

  // Handle language change & RTL support for Arabic
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  };

  // Push notification sender (handles real browser notification API + in-app audio chimes & toast)
  const sendPushNotification = useCallback((
    title: string,
    body: string,
    type: 'delivery' | 'inventory' | 'loyalty' | 'security' = 'delivery',
    orderId?: string
  ) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
      orderId,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);

    // Audio chime & vibration
    if (type === 'delivery') {
      playDeliveryChime();
    } else {
      playSuccessChime();
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // Ignored
      }
    }

    // Native browser push notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Verdant: ${title}`, {
          body,
          icon: '/icon.svg',
          tag: orderId || type,
        });
      } catch (err) {
        console.debug('Native notification skipped', err);
      }
    }
  }, []);

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updatePassphrase = async (passphrase: string) => {
    setE2eePassphrase(passphrase);
    localStorage.setItem(STORAGE_KEYS.PASSPHRASE, passphrase);
    const fp = await computePassphraseFingerprint(passphrase);
    setKeyFingerprint(fp);
    sendPushNotification('Security Key Updated', `E2EE Passphrase updated. SHA-256 fingerprint: ${fp}`, 'security');
  };

  // Cart actions with real-time stock validations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      sendPushNotification('Out of Stock', `${product.name} is currently sold out. Our team is restocking.`, 'inventory');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const targetQty = existing.quantity + quantity;
        if (targetQty > product.stock) {
          sendPushNotification('Stock Limit Reached', `Only ${product.stock} units of ${product.name} left in store.`, 'inventory');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      } else {
        return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });

    playSuccessChime();
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      sendPushNotification('Max Stock Reached', `Cannot add more than ${product.stock} units available.`, 'inventory');
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Real-time Inventory controls
  const updateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const clamped = Math.max(0, newStock);
          if (clamped <= p.reorderThreshold && clamped > 0) {
            sendPushNotification('Low Stock Alert', `${p.name} is running low (${clamped} units remaining).`, 'inventory');
          } else if (clamped === 0) {
            sendPushNotification('Stock Depleted', `${p.name} marked Out of Stock.`, 'inventory');
          }
          return { ...p, stock: clamped };
        }
        return p;
      })
    );
  };

  const restockProduct = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = p.stock + amount;
          sendPushNotification('Inventory Restocked', `Restocked +${amount} units for ${p.name}. Total in aisle: ${updated}.`, 'inventory');
          return { ...p, stock: updated };
        }
        return p;
      })
    );
  };

  // Place Order with client-side stock decrement, loyalty rewards calculation, E2EE verification
  const placeOrder = async (details: {
    paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'loyalty' | 'cash';
    paymentMasked: string;
    deliveryAddressEncrypted: EncryptedPayload;
    deliveryNotesEncrypted?: EncryptedPayload;
    pointsUsed: number;
  }): Promise<Order> => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const deliveryFee = subtotal >= 35 ? 0 : 3.99;
    const pointsDiscount = Math.min(details.pointsUsed / 100, subtotal); // 100 pts = $1
    const total = Math.max(0, subtotal + deliveryFee - pointsDiscount);
    const pointsEarned = Math.floor(total * 10); // 10 points per dollar

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Decrement stock in real-time
    setProducts((prev) =>
      prev.map((prod) => {
        const inCart = cart.find((item) => item.product.id === prod.id);
        if (inCart) {
          const newStock = Math.max(0, prod.stock - inCart.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      subtotal,
      discount: pointsDiscount,
      loyaltyPointsUsed: details.pointsUsed,
      loyaltyPointsEarned: pointsEarned,
      total,
      paymentMethod: details.paymentMethod,
      paymentMasked: details.paymentMasked,
      deliveryAddressEncrypted: details.deliveryAddressEncrypted,
      deliveryNotesEncrypted: details.deliveryNotesEncrypted,
      status: 'placed',
      estimatedMinutes: 24,
      courier: {
        name: 'Mateo Rossi',
        phone: '+1 (555) 234-8901',
        rating: 4.96,
        vehicle: 'Zero-Emission Cargo e-Bike',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
    };

    // Update loyalty
    setLoyalty((prev) => {
      const remainingPoints = Math.max(0, prev.points - details.pointsUsed + pointsEarned);
      let tier = prev.tier;
      if (remainingPoints >= 2000) tier = 'Emerald VIP';
      else if (remainingPoints >= 1000) tier = 'Gold';
      else if (remainingPoints >= 400) tier = 'Silver';

      return {
        ...prev,
        points: remainingPoints,
        tier,
        lifetimeSavings: prev.lifetimeSavings + pointsDiscount,
      };
    });

    if (isOnline) {
      setActiveOrder(newOrder);
      setOrderHistory((prev) => [newOrder, ...prev]);
    } else {
      // Queue offline order
      setOfflineQueue((prev) => [...prev, newOrder]);
      setActiveOrder(newOrder);
    }

    clearCart();

    // Trigger push notification
    sendPushNotification(
      'Order Confirmed & Encrypted',
      `Order #${orderId} for $${total.toFixed(2)} received! Store pickers are gathering your organic produce.`,
      'delivery',
      orderId
    );

    return newOrder;
  };

  // Live order status advancement (simulated or triggered by admin)
  const advanceOrderStatus = (orderId: string, forcedStage?: DeliveryStage) => {
    const stages: DeliveryStage[] = ['placed', 'packing', 'quality_check', 'out_for_delivery', 'delivered'];
    
    setActiveOrder((current) => {
      if (!current || current.id !== orderId) return current;

      let nextStage = forcedStage;
      if (!nextStage) {
        const currentIndex = stages.indexOf(current.status);
        if (currentIndex < stages.length - 1) {
          nextStage = stages[currentIndex + 1];
        } else {
          return current;
        }
      }

      let notifTitle = '';
      let notifBody = '';
      let minutesLeft = current.estimatedMinutes;

      switch (nextStage) {
        case 'packing':
          notifTitle = 'Order Being Packed';
          notifBody = `Store team is hand-inspecting fresh produce for #${orderId}.`;
          minutesLeft = 18;
          break;
        case 'quality_check':
          notifTitle = 'Quality & Freshness Verified';
          notifBody = `Cold-chain sealed and verified. Ready for courier pickup.`;
          minutesLeft = 14;
          break;
        case 'out_for_delivery':
          notifTitle = 'Courier on the Move';
          notifBody = `${current.courier.name} is en route on cargo e-bike! ETA: 8 minutes.`;
          minutesLeft = 8;
          break;
        case 'delivered':
          notifTitle = 'Order Delivered Fresh';
          notifBody = `Package placed at your doorstep with tamper-evident seal. Enjoy your harvest!`;
          minutesLeft = 0;
          break;
      }

      sendPushNotification(notifTitle, notifBody, 'delivery', orderId);

      const updated = {
        ...current,
        status: nextStage,
        estimatedMinutes: minutesLeft,
      };

      setOrderHistory((history) =>
        history.map((o) => (o.id === orderId ? updated : o))
      );

      return updated;
    });
  };

  // Daily Streak Claim
  const claimDailyStreak = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (loyalty.lastCheckinDate === today) {
      sendPushNotification('Already Claimed', 'You have already checked in today! Come back tomorrow for more FreshClub points.', 'loyalty');
      return;
    }

    setLoyalty((prev) => ({
      ...prev,
      points: prev.points + 25,
      streakDays: prev.streakDays + 1,
      lastCheckinDate: today,
    }));

    sendPushNotification(
      'Daily Streak Bonus Claimed',
      `+25 FreshClub points added! You are on a ${loyalty.streakDays + 1}-day streak.`,
      'loyalty'
    );
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <GroceryContext.Provider
      value={{
        products,
        cart,
        loyalty,
        activeOrder,
        orderHistory,
        language,
        isOnline,
        isSimulatedOffline,
        offlineQueue,
        notifications,
        unreadNotificationCount,
        e2eePassphrase,
        keyFingerprint,
        activeTab,
        isCartOpen,
        isCheckoutOpen,
        isPrivacyModalOpen,

        setActiveTab,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsPrivacyModalOpen,
        setLanguage,
        setSimulatedOffline: setIsSimulatedOffline,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        updateStock,
        restockProduct,

        placeOrder,
        advanceOrderStatus,
        claimDailyStreak,
        sendPushNotification,
        markNotificationsAsRead,
        updatePassphrase,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};
