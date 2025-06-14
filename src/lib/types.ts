import type { LucideIcon } from 'lucide-react';

export type Locale = 'en' | 'ar';

interface LocalizedString {
  en: string;
  ar: string;
}

export interface Barber {
  id: string;
  name: string; // Will be localized string from getMockBarbers
  imageUrl: string;
  dataAiHint?: string;
  specialties: string[]; // Will be array of localized strings
  rating: number;
  availability: string; // Will be localized string
}

export interface Service {
  id:string;
  name: string; // Will be localized string from getMockServices
  price: number;
  duration: string; // Will be localized string
  description: string; // Will be localized string
  icon?: LucideIcon;
}

export interface Appointment {
  id: string;
  serviceName: string; // Consider if this needs localization based on source
  barberName?: string; // Consider if this needs localization
  date: string; 
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}

export interface Promotion {
  id: string;
  title: string; // Will be localized string
  description: string; // Will be localized string
  couponCode?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Review {
  id: string;
  customerName: string; // May remain as is, or could be localized if names differ
  serviceName?: string; // Localized from mock data
  barberName?: string; // Localized from mock data
  rating: number;
  comment: string; // Localized from mock data
  date: string;
  avatarUrl?: string;
  dataAiHint?: string;
}

export interface UserProfile {
  name: string; // Localized
  phone: string;
  email: string;
  address?: string; // Localized
  notifications: {
    appointments: boolean;
    promotions: boolean;
    serviceUpdates: boolean;
  };
  savedPaymentMethods: Array<{ id: string; type: string; last4: string; expiry: string }>;
}

export interface SalonInfoTranslations {
  home: string;
  services: string;
  myAppointments: string;
  profile: string;
  contactUs: string;
  whatsappUs: string;
  allRightsReserved: string;
  welcomeToSalon: string;
  aboutUs: string;
  salonDescription: string;
  glimpseOfSalon: string;
  meetBarbers: string;
  currentOffers: string;
  valuedClientsWords: string;
  bookAppointment: string;
  viewAllBarbers: string;
  experienceRoyalGrooming: string;
  ourFeaturedLook: string; // Added new key for featured look section title
}

export interface SalonInfoData {
  name: string;
  address: string;
  workingHours: string;
  phone: string;
  email: string;
  whatsappLink: string;
  socialMedia: Array<{ name: LocalizedString; url: string; icon: LucideIcon }>;
  locationImage: string;
  locationDataAiHint?: string;
  galleryImages: Array<{ url: string; alt: string; dataAiHint?: string }>;
  translations: SalonInfoTranslations;
}
