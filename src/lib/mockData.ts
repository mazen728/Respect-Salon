
import type { Barber, Service, Appointment, Promotion, Review, UserProfile, Locale, SalonInfoData } from './types';
import { Scissors, Users, CalendarDays, Star, Percent, MapPin, Clock, Phone, MessageSquare, Briefcase, Tag, Wand2, Wind, Smile, Baby, Coffee, Palette, Zap, Ticket, LucideIcon, Instagram, Facebook } from 'lucide-react';


interface LocalizedString {
  en: string;
  ar: string;
}

const t = (localizedString: LocalizedString, locale: Locale): string => {
  return localizedString[locale] || localizedString.en;
};

// This is the original mock data generation logic, now named to avoid conflict
// and used as a fallback and for seeding.
export const generateMockBarbers = (locale: Locale): Barber[] => [
  { id: '1', name: t({ en: 'Ahmed "The Blade" Al-Fassi', ar: 'أحمد "الشفرة" الفاسي' }, locale), imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'male barber portrait', specialties: [t({en:'Classic Cuts', ar:'قصات كلاسيكية'}, locale), t({en:'Beard Styling', ar:'تصفيف اللحية'}, locale)], rating: 4.8, availability: t({ en: 'Mon-Fri: 10am-7pm', ar: 'الاثنين-الجمعة: 10ص-7م' }, locale) },
  { id: '2', name: t({ en: 'Youssef "The Sculptor" Zaki', ar: 'يوسف "النحات" زكي' }, locale), imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'barber grooming beard', specialties: [t({en:'Modern Fades', ar:'تدرجات حديثة'}, locale), t({en:'Hot Towel Shaves', ar:'حلاقة بالمنشفة الساخنة'}, locale)], rating: 4.9, availability: t({ en: 'Tue-Sat: 9am-6pm', ar: 'الثلاثاء-السبت: 9ص-6م' }, locale) },
  { id: '3', name: t({ en: 'Khalid "The Precisionist" Ibrahim', ar: 'خالد "الدقيق" ابراهيم' }, locale), imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'barber working client', specialties: [t({en:'Detailed Beard Trims', ar:'تشذيب لحية دقيق'}, locale), t({en:'Kids Cuts', ar:"قصات أطفال"}, locale)], rating: 4.7, availability: t({ en: 'Wed-Sun: 11am-8pm', ar: 'الأربعاء-الأحد: 11ص-8م' }, locale) },
];


// Updated getMockBarbers to use local mock data directly
export function getMockBarbers(locale: Locale): Barber[] {
  return generateMockBarbers(locale);
}


export const getMockServices = (locale: Locale): Service[] => [
  { id: 's1', name: t({ en: 'Sultan\'s Haircut', ar: 'قصة السلطان' }, locale), price: 50, duration: t({ en: '45 min', ar: '45 دقيقة' }, locale), description: t({ en: 'A royal haircut experience, tailored to your style.', ar: 'تجربة قص شعر ملكية، مصممة خصيصًا لأسلوبك.' }, locale), icon: Scissors },
  { id: 's2', name: t({ en: 'Royal Beard Trim', ar: 'تشذيب اللحية الملكي' }, locale), price: 30, duration: t({ en: '30 min', ar: '30 دقيقة' }, locale), description: t({ en: 'Expert shaping and trimming for a majestic beard.', ar: 'تشكيل وتشذيب احترافي للحية مهيبة.' }, locale), icon: Users },
  { id: 's3', name: t({ en: 'Pasha\'s Skin Cleanse', ar: 'تنظيف بشرة الباشا' }, locale), price: 65, duration: t({ en: '60 min', ar: '60 دقيقة' }, locale), description: t({ en: 'Deep cleansing facial treatment for refreshed skin.', ar: 'علاج تنظيف عميق للوجه لبشرة منتعشة.' }, locale), icon: Smile },
  { id: 's4', name: t({ en: 'Emir\'s Hair/Beard Dye', ar: 'صبغة شعر/لحية الأمير' }, locale), price: 70, duration: t({ en: '75 min', ar: '75 دقيقة' }, locale), description: t({ en: 'Professional coloring for hair or beard.', ar: 'صبغ احترافي للشعر أو اللحية.' }, locale), icon: Palette },
  { id: 's5', name: t({ en: 'Vizier\'s Steam & Massage', ar: 'بخار ومساج الوزير' }, locale), price: 45, duration: t({ en: '40 min', ar: '40 دقيقة' }, locale), description: t({ en: 'Relaxing facial steam and invigorating massage.', ar: 'بخار وجه مريح ومساج منشط.' }, locale), icon: Wind },
  { id: 's6', name: t({ en: 'Young Prince Haircut (Kids)', ar: 'قصة الأمير الصغير (للأطفال)' }, locale), price: 35, duration: t({ en: '30 min', ar: '30 دقيقة' }, locale), description: t({ en: 'Gentle and stylish haircuts for young royalty.', ar: 'قصات شعر لطيفة وأنيقة للملوك الصغار.' }, locale), icon: Baby },
];


export const mockAppointments: Appointment[] = [
  { id: 'a1', serviceName: 'Sultan\'s Haircut', barberName: 'Ahmed "The Blade" Al-Fassi', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: '2:00 PM', status: 'Confirmed' },
  { id: 'a2', serviceName: 'Royal Beard Trim', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), time: '11:00 AM', status: 'Completed' },
  { id: 'a3', serviceName: 'Pasha\'s Skin Cleanse', barberName: 'Youssef "The Sculptor" Zaki', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), time: '4:30 PM', status: 'Pending' },
];

// Raw structure for seeding promotions
export interface RawPromotionData {
  id: string; 
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  couponCode?: string;
  imageUrl?: string;
  dataAiHint?: string;
  icon?: LucideIcon; // Keep icon for mock data consistency, not stored in Firestore
}

const rawMockPromotionsData: RawPromotionData[] = [
  { id: 'p1', title: { en: 'Mid-Week Majesty', ar: 'جلال منتصف الأسبوع' }, description: { en: '20% off all services on Wednesdays!', ar: 'خصم 20% على جميع الخدمات أيام الأربعاء!' }, couponCode: 'WEDNESDAY20', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'salon interior promotion', icon: Percent },
  { id: 'p2', title: { en: 'New Client Welcome', ar: 'ترحيب بالعميل الجديد' }, description: { en: 'First-time customers get 15% off their first service.', ar: 'يحصل العملاء الجدد على خصم 15% على خدمتهم الأولى.' }, imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'barber tools flatlay', icon: Star },
  { id: 'p3', title: { en: 'Weekend Relaxation Package', ar: 'باقة استرخاء نهاية الأسبوع' }, description: { en: 'Special price on Haircut + Steam & Massage this weekend!', ar: 'سعر خاص على قصة الشعر + بخار ومساج في نهاية هذا الأسبوع!' }, couponCode: 'WEEKENDRELAX', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'spa treatment products', icon: Zap },
];

// Function to get raw data for seeding
export const getRawMockPromotions = (): RawPromotionData[] => rawMockPromotionsData;

// Existing getMockPromotions will use this raw data
export const getMockPromotions = (locale: Locale): Promotion[] => {
  return rawMockPromotionsData.map(promo => ({
    id: promo.id,
    title: t(promo.title, locale),
    description: t(promo.description, locale),
    couponCode: promo.couponCode,
    imageUrl: promo.imageUrl,
    dataAiHint: promo.dataAiHint,
    // icon: promo.icon, // Icon is for display, not part of Firestore data model for Promotion
  }));
};


export const getMockReviews = (locale: Locale): Review[] => [
  { id: 'r1', customerName: 'Ali Hasan', serviceName: t({en: "Sultan's Haircut", ar: "قصة السلطان"}, locale), barberName: t({en: 'Ahmed "The Blade" Al-Fassi', ar: 'أحمد "الشفرة" الفاسي'}, locale), rating: 5, comment: t({en: 'Best haircut I\'ve had in years! Ahmed is a true artist.', ar: 'أفضل قصة شعر حصلت عليها منذ سنوات! أحمد فنان حقيقي.'}, locale), date: '2024-07-15', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'happy customer face' },
  { id: 'r2', customerName: 'Omar Sharif', serviceName: t({en: 'Royal Beard Trim', ar: 'تشذيب اللحية الملكي'}, locale), rating: 4, comment: t({en: 'Great attention to detail on the beard trim. The place has a fantastic vibe.', ar: 'اهتمام كبير بالتفاصيل في تشذيب اللحية. المكان يتمتع بأجواء رائعة.'}, locale), date: '2024-07-10', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'smiling man portrait' },
];

export const getMockUserProfile = (locale: Locale): UserProfile => ({
  name: t({ en: 'Valued Customer', ar: 'عميل مميز' }, locale),
  phone: '035836388',
  email: 'customer@example.com',
  address: t({ en: '191 Abdel Salam Aref St. - Louran', ar: '191 ش عبد السلام عارف - لوران' }, locale),
  notifications: {
    appointments: true,
    promotions: true,
    serviceUpdates: false,
  },
  savedPaymentMethods: [
    { id: 'pm1', type: 'Visa', last4: '1234', expiry: '12/25' },
    { id: 'pm2', type: 'Apple Pay', last4: 'N/A', expiry: 'N/A' },
  ],
});

const salonInfoEn = {
  name: "Respect Salon",
  address: "191 Abdel Salam Aref St. - Louran",
  workingHours: "Daily: 1:00 PM - 1:00 AM",
  phone: "035836388",
  whatsappLink: "https://api.whatsapp.com/send/?phone=201203412006&text&type=phone_number&app_absent=0&wame_ctl=1",
  socialMedia: [
    { name: { en: "Instagram", ar: "انستجرام" }, url: "https://www.instagram.com/respect_men_salon?igsh=cDJ2dTdxcm5namVu", icon: Instagram },
    { name: { en: "Facebook", ar: "فيسبوك" }, url: "https://www.facebook.com/share/15yWNrD3FE/", icon: Facebook },
  ],
  locationImage: "https://placehold.co/800x400.png",
  locationDataAiHint: "salon map location",
  galleryImages: [
    { url: "https://i.postimg.cc/HxdSzdYB/resized-image-400x300-1.jpg", alt: "Salon Interior 1", dataAiHint: "luxury salon interior" },
    { url: "https://i.postimg.cc/T3ZkFn97/FB-IMG-1750080535312.jpg", alt: "Salon Interior 2", dataAiHint: "barber station chair" },
    { url: "https://i.postimg.cc/zfHB7HDF/resized-image-1.jpg", alt: "Happy Customer", dataAiHint: "customer smiling barber" },
  ],
  translations: {
    home: "Home",
    services: "Services",
    myAppointments: "My Appointments",
    profile: "Profile",
    contactUs: "Contact Us",
    whatsappUs: "WhatsApp Us",
    allRightsReserved: "All rights reserved.",
    welcomeToSalon: "Welcome to Our Salon",
    aboutUs: "About Us",
    salonDescription: "Step into a realm of unparalleled luxury and tradition at Respect Salon. We offer a sanctuary where classic barbering artistry meets modern sophistication. Our master barbers are dedicated to providing you with an exceptional grooming experience, tailored to your unique style.",
    glimpseOfSalon: "Glimpse of Our Salon",
    meetBarbers: "Meet Our Master Barbers",
    currentOffers: "Current Offers & Promotions",
    valuedClientsWords: "Words From Our Valued Clients",
    bookAppointment: "Book Your Appointment",
    viewAllBarbers: "View All Barbers",
    experienceRoyalGrooming: "Experience Royal Grooming",
    ourFeaturedLook: "Our Featured Look",
  }
};

const salonInfoAr: SalonInfoData = {
  name: "صالون رسبيكت",
  address: "191 ش عبد السلام عارف - لوران",
  workingHours: "يومياً: 1:00 ظهراً - 1:00 صباحاً",
  phone: "035836388",
  email: salonInfoEn.email, // Assuming email is not localized or is the same
  whatsappLink: "https://api.whatsapp.com/send/?phone=201203412006&text&type=phone_number&app_absent=0&wame_ctl=1",
   socialMedia: [
    { name: { en: "Instagram", ar: "انستجرام" }, url: "https://www.instagram.com/respect_men_salon?igsh=cDJ2dTdxcm5namVu", icon: Instagram },
    { name: { en: "Facebook", ar: "فيسبوك" }, url: "https://www.facebook.com/share/15yWNrD3FE/", icon: Facebook },
  ],
  locationImage: "https://placehold.co/800x400.png",
  locationDataAiHint: "salon map location",
  galleryImages: [
    { url: "https://i.postimg.cc/HxdSzdYB/resized-image-400x300-1.jpg", alt: "الصالون من الداخل 1", dataAiHint: "luxury salon interior" },
    { url: "https://i.postimg.cc/T3ZkFn97/FB-IMG-1750080535312.jpg", alt: "الصالون من الداخل 2", dataAiHint: "barber station chair" },
    { url: "https://i.postimg.cc/zfHB7HDF/resized-image-1.jpg", alt: "عميل سعيد", dataAiHint: "customer smiling barber" },
  ],
  translations: {
    home: "الرئيسية",
    services: "الخدمات",
    myAppointments: "مواعيدي",
    profile: "الملف الشخصي",
    contactUs: "اتصل بنا",
    whatsappUs: "راسلنا على واتساب",
    allRightsReserved: "جميع الحقوق محفوظة.",
    welcomeToSalon: "مرحباً بك في صالوننا",
    aboutUs: "من نحن",
    salonDescription: "ادخل إلى عالم من الفخامة والتقاليد التي لا مثيل لها في صالون رسبيكت. نقدم ملاذًا حيث يلتقي فن الحلاقة الكلاسيكي بالأناقة العصرية. حلاقونا المحترفون مكرسون لتزويدك بتجربة عناية استثنائية مصممة خصيصًا لأسلوبك الفريد.",
    glimpseOfSalon: "لمحة عن صالوننا",
    meetBarbers: "تعرف على حلاقينا المحترفين",
    currentOffers: "العروض والتخفيضات الحالية",
    valuedClientsWords: "كلمات من عملائنا الكرام",
    bookAppointment: "احجز موعدك",
    viewAllBarbers: "عرض كل الحلاقين",
    experienceRoyalGrooming: "جرب العناية الملكية",
    ourFeaturedLook: "إطلالتنا المميزة",
  }
};

export const salonInfo = (locale: Locale): SalonInfoData => {
  if (locale === 'ar') {
    // Ensure salonInfoAr is fully populated and consistent with SalonInfoData type
    const arData: SalonInfoData = {
      ...salonInfoAr,
      // Explicitly map fields that might be missing or need default from English version
      email: salonInfoEn.email, // Example: if email is not meant to be localized
      // Ensure all fields from SalonInfoData are present
    };
    return arData;
  }
  return salonInfoEn;
};


export const mockServices = getMockServices('en'); // Fallback or default locale for non-localized parts
export const mockPromotions = getMockPromotions('en'); // Fallback or default
export const mockReviews = getMockReviews('en'); // Fallback or default
export const mockUserProfile = getMockUserProfile('en'); // Fallback or default
    

    

