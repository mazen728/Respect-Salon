import type { Barber, Service, Appointment, Promotion, Review, UserProfile } from './types';
import { Scissors, User, Users, CalendarDays, Star, Percent, MapPin, Clock, Phone, Mail, MessageSquare, Briefcase, Tag, Wand2, Wind, Smile, Baby, Coffee, Drama, Palette, Zap } from 'lucide-react';

type Locale = 'en' | 'ar';

interface LocalizedString {
  en: string;
  ar: string;
}

const t = (localizedString: LocalizedString, locale: Locale): string => {
  return localizedString[locale] || localizedString.en;
};


export const getMockBarbers = (locale: Locale): Barber[] => [
  { id: '1', name: t({ en: 'Ahmed "The Blade" Al-Fassi', ar: 'أحمد "الشفرة" الفاسي' }, locale), imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'male barber portrait', specialties: [t({en:'Classic Cuts', ar:'قصات كلاسيكية'}, locale), t({en:'Beard Styling', ar:'تصفيف اللحية'}, locale)], rating: 4.8, availability: t({ en: 'Mon-Fri: 10am-7pm', ar: 'الاثنين-الجمعة: 10ص-7م' }, locale) },
  { id: '2', name: t({ en: 'Youssef "The Sculptor" Zaki', ar: 'يوسف "النحات" زكي' }, locale), imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'barber grooming beard', specialties: [t({en:'Modern Fades', ar:'تدرجات حديثة'}, locale), t({en:'Hot Towel Shaves', ar:'حلاقة بالمنشفة الساخنة'}, locale)], rating: 4.9, availability: t({ en: 'Tue-Sat: 9am-6pm', ar: 'الثلاثاء-السبت: 9ص-6م' }, locale) },
  { id: '3', name: t({ en: 'Khalid "The Precisionist" Ibrahim', ar: 'خالد "الدقيق" ابراهيم' }, locale), imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'barber working client', specialties: [t({en:'Detailed Beard Trims', ar:'تشذيب لحية دقيق'}, locale), t({en:'Kids Cuts', ar:"قصات أطفال"}, locale)], rating: 4.7, availability: t({ en: 'Wed-Sun: 11am-8pm', ar: 'الأربعاء-الأحد: 11ص-8م' }, locale) },
];

export const getMockServices = (locale: Locale): Service[] => [
  { id: 's1', name: t({ en: 'Sultan\'s Haircut', ar: 'قصة السلطان' }, locale), price: 50, duration: t({ en: '45 min', ar: '45 دقيقة' }, locale), description: t({ en: 'A royal haircut experience, tailored to your style.', ar: 'تجربة قص شعر ملكية، مصممة خصيصًا لأسلوبك.' }, locale), icon: Scissors },
  { id: 's2', name: t({ en: 'Royal Beard Trim', ar: 'تشذيب اللحية الملكي' }, locale), price: 30, duration: t({ en: '30 min', ar: '30 دقيقة' }, locale), description: t({ en: 'Expert shaping and trimming for a majestic beard.', ar: 'تشكيل وتشذيب احترافي للحية مهيبة.' }, locale), icon: Users },
  { id: 's3', name: t({ en: 'Pasha\'s Skin Cleanse', ar: 'تنظيف بشرة الباشا' }, locale), price: 65, duration: t({ en: '60 min', ar: '60 دقيقة' }, locale), description: t({ en: 'Deep cleansing facial treatment for refreshed skin.', ar: 'علاج تنظيف عميق للوجه لبشرة منتعشة.' }, locale), icon: Smile },
  { id: 's4', name: t({ en: 'Emir\'s Hair/Beard Dye', ar: 'صبغة شعر/لحية الأمير' }, locale), price: 70, duration: t({ en: '75 min', ar: '75 دقيقة' }, locale), description: t({ en: 'Professional coloring for hair or beard.', ar: 'صبغ احترافي للشعر أو اللحية.' }, locale), icon: Palette },
  { id: 's5', name: t({ en: 'Vizier\'s Steam & Massage', ar: 'بخار ومساج الوزير' }, locale), price: 45, duration: t({ en: '40 min', ar: '40 دقيقة' }, locale), description: t({ en: 'Relaxing facial steam and invigorating massage.', ar: 'بخار وجه مريح ومساج منشط.' }, locale), icon: Wind },
  { id: 's6', name: t({ en: 'Young Prince Haircut (Kids)', ar: 'قصة الأمير الصغير (للأطفال)' }, locale), price: 35, duration: t({ en: '30 min', ar: '30 دقيقة' }, locale), description: t({ en: 'Gentle and stylish haircuts for young royalty.', ar: 'قصات شعر لطيفة وأنيقة للملوك الصغار.' }, locale), icon: Baby },
];


export const mockAppointments: Appointment[] = [ // Appointments data generally remains in one language for data consistency
  { id: 'a1', serviceName: 'Sultan\'s Haircut', barberName: 'Ahmed "The Blade" Al-Fassi', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: '2:00 PM', status: 'Confirmed' },
  { id: 'a2', serviceName: 'Royal Beard Trim', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), time: '11:00 AM', status: 'Completed' },
  { id: 'a3', serviceName: 'Pasha\'s Skin Cleanse', barberName: 'Youssef "The Sculptor" Zaki', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), time: '4:30 PM', status: 'Pending' },
];

export const getMockPromotions = (locale: Locale): Promotion[] => [
  { id: 'p1', title: t({ en: 'Mid-Week Majesty', ar: 'جلال منتصف الأسبوع' }, locale), description: t({ en: '20% off all services on Wednesdays!', ar: 'خصم 20% على جميع الخدمات أيام الأربعاء!' }, locale), couponCode: 'WEDNESDAY20', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'salon interior promotion' },
  { id: 'p2', title: t({ en: 'New Client Welcome', ar: 'ترحيب بالعميل الجديد' }, locale), description: t({ en: 'First-time customers get 15% off their first service.', ar: 'يحصل العملاء الجدد على خصم 15% على خدمتهم الأولى.' }, locale), imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'barber tools flatlay' },
];

export const getMockReviews = (locale: Locale): Review[] => [ // Customer names and comments are often multilingual or kept in original language
  { id: 'r1', customerName: 'Ali Hasan', serviceName: t({en: "Sultan's Haircut", ar: "قصة السلطان"}, locale), barberName: t({en: 'Ahmed "The Blade" Al-Fassi', ar: 'أحمد "الشفرة" الفاسي'}, locale), rating: 5, comment: t({en: 'Best haircut I\'ve had in years! Ahmed is a true artist.', ar: 'أفضل قصة شعر حصلت عليها منذ سنوات! أحمد فنان حقيقي.'}, locale), date: '2024-07-15', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'happy customer face' },
  { id: 'r2', customerName: 'Omar Sharif', serviceName: t({en: 'Royal Beard Trim', ar: 'تشذيب اللحية الملكي'}, locale), rating: 4, comment: t({en: 'Great attention to detail on the beard trim. The place has a fantastic vibe.', ar: 'اهتمام كبير بالتفاصيل في تشذيب اللحية. المكان يتمتع بأجواء رائعة.'}, locale), date: '2024-07-10', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'smiling man portrait' },
];

export const getMockUserProfile = (locale: Locale): UserProfile => ({
  name: t({ en: 'Valued Customer', ar: 'عميل مميز' }, locale),
  phone: '+968 99999999', // Usually not translated
  email: 'customer@example.com', // Usually not translated
  address: t({ en: '1 Royal Palace, Capital City', ar: '1 القصر الملكي، العاصمة' }, locale),
  notifications: { // Boolean flags, labels translated in UI
    appointments: true,
    promotions: true,
    serviceUpdates: false,
  },
  savedPaymentMethods: [ // Payment details usually not translated
    { id: 'pm1', type: 'Visa', last4: '1234', expiry: '12/25' },
    { id: 'pm2', type: 'Apple Pay', last4: 'N/A', expiry: 'N/A' },
  ],
});

interface SalonTranslations {
  quickLinks: string;
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
}

const salonInfoEn = {
  name: "Respect Salon",
  address: "123 Royal Avenue, Luxury City, LC 45678",
  workingHours: "Mon-Sat: 9 AM - 8 PM, Sun: 10 AM - 6 PM",
  phone: "+1 (555) 123-4567",
  email: "contact@respectsalon.com",
  whatsappLink: "https://wa.me/15551234567",
  socialMedia: [
    { name: { en: "Instagram", ar: "انستجرام" }, url: "#", icon: Zap },
    { name: { en: "Facebook", ar: "فيسبوك" }, url: "#", icon: Zap },
    { name: { en: "Twitter", ar: "تويتر" }, url: "#", icon: Zap },
  ],
  locationImage: "https://placehold.co/800x400.png",
  locationDataAiHint: "salon map location",
  galleryImages: [
    { url: "https://placehold.co/400x300.png", alt: "Salon Interior 1", dataAiHint: "luxury salon interior" },
    { url: "https://placehold.co/400x300.png", alt: "Salon Interior 2", dataAiHint: "barber station chair" },
    { url: "https://placehold.co/400x300.png", alt: "Happy Customer", dataAiHint: "customer smiling barber" },
  ],
  translations: {
    quickLinks: "Quick Links",
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
  }
};

const salonInfoAr: typeof salonInfoEn = {
  name: "صالون رسبيكت",
  address: "123 رويال أفينيو، مدينة فاخرة، LC 45678",
  workingHours: "الاثنين-السبت: 9 صباحًا - 8 مساءً، الأحد: 10 صباحًا - 6 مساءً",
  phone: "+1 (555) 123-4567", // Phone numbers usually not translated
  email: "contact@respectsalon.com", // Emails usually not translated
  whatsappLink: "https://wa.me/15551234567",
   socialMedia: [
    { name: { en: "Instagram", ar: "انستجرام" }, url: "#", icon: Zap },
    { name: { en: "Facebook", ar: "فيسبوك" }, url: "#", icon: Zap },
    { name: { en: "Twitter", ar: "تويتر" }, url: "#", icon: Zap },
  ],
  locationImage: "https://placehold.co/800x400.png",
  locationDataAiHint: "salon map location",
  galleryImages: [
    { url: "https://placehold.co/400x300.png", alt: "الصالون من الداخل 1", dataAiHint: "luxury salon interior" },
    { url: "https://placehold.co/400x300.png", alt: "الصالون من الداخل 2", dataAiHint: "barber station chair" },
    { url: "https://placehold.co/400x300.png", alt: "عميل سعيد", dataAiHint: "customer smiling barber" },
  ],
  translations: {
    quickLinks: "روابط سريعة",
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
  }
};

export const salonInfo = (locale: Locale) => locale === 'ar' ? salonInfoAr : salonInfoEn;

// Keep existing non-localized exports for pages that might not need full localization of this data yet
export const mockBarbers = getMockBarbers('en');
export const mockServices = getMockServices('en');
// export const mockAppointments - already defined, doesn't need localization wrapper
export const mockPromotions = getMockPromotions('en');
export const mockReviews = getMockReviews('en');
export const mockUserProfile = getMockUserProfile('en');
