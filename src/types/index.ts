export type PropertyType = 'residential' | 'commercial';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  addresses: Address[];
  referralCode: string;
  credits: number;
  tier: 'regular' | 'vip';
  notificationPreferences?: {
    push: boolean;
    email: boolean;
  };
  termsAcceptedAt?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  propertyType: PropertyType;
  isDefault: boolean;
}

export type ServiceCategory = 'roofing' | 'gutters' | 'maintenance' | 'storm';

export type ServiceApplicability = 'residential' | 'commercial' | 'both';

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
  applicableTo: ServiceApplicability;
}

export interface Addon {
  id: string;
  title: string;
  price: number;
  description: string;
}

export type OrderStatus = 
  | 'received' 
  | 'scheduled' 
  | 'in_progress' 
  | 'job_complete' 
  | 'finished' 
  | 'cancelled';

export interface Order {
  id: string;
  jobRef: string;
  userId: string;
  serviceId: string;
  addonIds: string[];
  addressId: string;
  propertyType: PropertyType;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  type: 'order' | 'system';
}

export interface EstimateInput {
  service: Service;
  quantity?: number;
  roofType?: string;
  stories?: number;
  addonIds: string[];
}
