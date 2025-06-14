import type { Barber, Service, Appointment, Promotion, Review, UserProfile } from './types';
import { Scissors, User, Users, CalendarDays, Star, Percent, MapPin, Clock, Phone, Mail, MessageSquare, Briefcase, Tag, Wand2, Wind, Smile, Baby, Coffee, Drama, Palette, Zap } from 'lucide-react';

export const mockBarbers: Barber[] = [
  { id: '1', name: 'Ahmed "The Blade" Al-Fassi', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'male barber portrait', specialties: ['Classic Cuts', 'Beard Styling'], rating: 4.8, availability: 'Mon-Fri: 10am-7pm' },
  { id: '2', name: 'Youssef "The Sculptor" Zaki', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'barber grooming beard', specialties: ['Modern Fades', 'Hot Towel Shaves'], rating: 4.9, availability: 'Tue-Sat: 9am-6pm' },
  { id: '3', name: 'Khalid "The Precisionist" Ibrahim', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'barber working client', specialties: ['Detailed Beard Trims', 'Kids Cuts'], rating: 4.7, availability: 'Wed-Sun: 11am-8pm' },
];

export const mockServices: Service[] = [
  { id: 's1', name: 'Sultan\'s Haircut', price: 50, duration: '45 min', description: 'A royal haircut experience, tailored to your style.', icon: Scissors },
  { id: 's2', name: 'Royal Beard Trim', price: 30, duration: '30 min', description: 'Expert shaping and trimming for a majestic beard.', icon: Users /* Represents beard styling well */ },
  { id: 's3', name: 'Pasha\'s Skin Cleanse', price: 65, duration: '60 min', description: 'Deep cleansing facial treatment for refreshed skin.', icon: Smile },
  { id: 's4', name: 'Emir\'s Hair/Beard Dye', price: 70, duration: '75 min', description: 'Professional coloring for hair or beard.', icon: Palette },
  { id: 's5', name: 'Vizier\'s Steam & Massage', price: 45, duration: '40 min', description: 'Relaxing facial steam and invigorating massage.', icon: Wind },
  { id: 's6', name: 'Young Prince Haircut (Kids)', price: 35, duration: '30 min', description: 'Gentle and stylish haircuts for young royalty.', icon: Baby },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', serviceName: 'Sultan\'s Haircut', barberName: 'Ahmed "The Blade" Al-Fassi', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: '2:00 PM', status: 'Confirmed' },
  { id: 'a2', serviceName: 'Royal Beard Trim', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), time: '11:00 AM', status: 'Completed' },
  { id: 'a3', serviceName: 'Pasha\'s Skin Cleanse', barberName: 'Youssef "The Sculptor" Zaki', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), time: '4:30 PM', status: 'Pending' },
];

export const mockPromotions: Promotion[] = [
  { id: 'p1', title: 'Mid-Week Majesty', description: '20% off all services on Wednesdays!', couponCode: 'WEDNESDAY20', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'salon interior promotion' },
  { id: 'p2', title: 'New Sultan Welcome', description: 'First-time customers get 15% off their first service.', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'barber tools flatlay' },
];

export const mockReviews: Review[] = [
  { id: 'r1', customerName: 'Ali Hasan', serviceName: 'Sultan\'s Haircut', barberName: 'Ahmed "The Blade" Al-Fassi', rating: 5, comment: 'Best haircut I\'ve had in years! Ahmed is a true artist.', date: '2024-07-15', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'happy customer face' },
  { id: 'r2', customerName: 'Omar Sharif', serviceName: 'Royal Beard Trim', rating: 4, comment: 'Great attention to detail on the beard trim. The place has a fantastic vibe.', date: '2024-07-10', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'smiling man portrait' },
  { id: 'r3', customerName: 'Faisal Khan', barberName: 'Youssef "The Sculptor" Zaki', rating: 5, comment: 'Youssef gave me an amazing fade. Highly recommend!', date: '2024-07-05', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'man stylish haircut' },
];

export const mockUserProfile: UserProfile = {
  name: 'Sultan Qaboos',
  phone: '+968 99999999',
  email: 'sultan@example.com',
  address: 'Al Alam Palace, Muscat, Oman',
  notifications: {
    appointments: true,
    promotions: true,
    serviceUpdates: false,
  },
  savedPaymentMethods: [
    { id: 'pm1', type: 'Visa', last4: '1234', expiry: '12/25' },
    { id: 'pm2', type: 'Apple Pay', last4: 'N/A', expiry: 'N/A' },
  ],
};

export const salonInfo = {
  name: "The Sultan's Chair",
  address: "123 Royal Avenue, Luxury City, LC 45678",
  workingHours: "Mon-Sat: 9 AM - 8 PM, Sun: 10 AM - 6 PM",
  phone: "+1 (555) 123-4567",
  email: "contact@sultanschair.com",
  whatsappLink: "https://wa.me/15551234567",
  socialMedia: [
    { name: "Instagram", url: "#", icon: Zap /* Placeholder, use specific if available */ },
    { name: "Facebook", url: "#", icon: Zap },
    { name: "Twitter", url: "#", icon: Zap },
  ],
  locationImage: "https://placehold.co/800x400.png",
  locationDataAiHint: "salon map location",
  galleryImages: [
    { url: "https://placehold.co/400x300.png", alt: "Salon Interior 1", dataAiHint: "luxury salon interior" },
    { url: "https://placehold.co/400x300.png", alt: "Salon Interior 2", dataAiHint: "barber station chair" },
    { url: "https://placehold.co/400x300.png", alt: "Happy Customer", dataAiHint: "customer smiling barber" },
  ]
};
