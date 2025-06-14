import type { LucideIcon } from 'lucide-react';

export interface Barber {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint?: string;
  specialties: string[];
  rating: number;
  availability: string; 
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string; 
  description: string;
  icon?: LucideIcon;
}

export interface Appointment {
  id: string;
  serviceName: string;
  barberName?: string;
  date: string; 
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  couponCode?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Review {
  id: string;
  customerName: string;
  serviceName?: string;
  barberName?: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string;
  dataAiHint?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address?: string;
  notifications: {
    appointments: boolean;
    promotions: boolean;
    serviceUpdates: boolean;
  };
  savedPaymentMethods: Array<{ id: string; type: string; last4: string; expiry: string }>;
}
