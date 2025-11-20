export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  referralCode: string;
  credits: number;
  tier: 'guest' | 'regular' | 'vip';
}

export interface Address {
  id: string;
  label: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export type ServiceCategory = 'roofing' | 'gutters' | 'maintenance' | 'storm';

export interface Service {
  id: string;
  slug: string;
  category: ServiceCategory;
  title: string;
  description: string;
  heroImage: string;
  basePrice: number;
  unit: 'linear_ft' | 'sqft' | 'fixed' | 'hour';
  durationMin: number;
  inclusions: string[];
  exclusions: string[];
  addons: Addon[];
}

export interface Addon {
  id: string;
  title: string;
  price: number;
  description: string;
}

export type OrderStatus = 'received' | 'scheduled' | 'on-site' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  addonIds: string[];
  addressId: string;
  photos: Photo[];
  preferredWindow: string;
  notes: string;
  estimateLow: number;
  estimateHigh: number;
  status: OrderStatus;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
  quantity?: number;
  roofType?: string;
  stories?: number;
}

export interface Photo {
  id: string;
  dataUrl: string;
  caption?: string;
}

export interface Promo {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  type: 'order' | 'promo' | 'system';
}

export interface EstimateInput {
  service: Service;
  quantity?: number;
  roofType?: string;
  stories?: number;
  addonIds: string[];
}
