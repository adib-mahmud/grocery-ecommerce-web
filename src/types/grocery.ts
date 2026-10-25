/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'Produce' | 'Bakery' | 'Dairy' | 'Pantry' | 'Beverages';
  unit: string;
  price: number;
  originalPrice?: number;
  stock: number;
  reorderThreshold: number;
  aisle: string;
  origin: string;
  organic: boolean;
  vegan: boolean;
  glutenFree: boolean;
  calories: string;
  description: string;
  consumptionCycleDays: number; // e.g. average household consumes in 4 days
  lastPurchasedDaysAgo?: number; // for personalized pantry tracking
  imageFallback: {
    emoji: string;
    bgGradient: string;
    accentColor: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryStage = 'placed' | 'packing' | 'quality_check' | 'out_for_delivery' | 'delivered';

export interface CourierInfo {
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  avatar: string;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  timestamp: string;
  maskedSummary: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'loyalty' | 'cash';
  paymentMasked: string;
  deliveryAddressEncrypted: EncryptedPayload;
  deliveryNotesEncrypted?: EncryptedPayload;
  status: DeliveryStage;
  estimatedMinutes: number;
  courier: CourierInfo;
}

export interface LoyaltyProfile {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Emerald VIP';
  streakDays: number;
  lastCheckinDate: string;
  lifetimeSavings: number;
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'bn';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'delivery' | 'inventory' | 'loyalty' | 'security';
  read: boolean;
  orderId?: string;
}
