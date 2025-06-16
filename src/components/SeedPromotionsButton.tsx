import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromotionCard } from '@/components/PromotionCard';
import { ReviewCard } from '@/components/ReviewCard';
import { salonInfo as getSalonInfo, getMockReviews, getMockPromotions } from '@/lib/mockData';
import { fetchPromotionsFromFirestore } from '@/lib/firebase';
// import { SeedPromotionsButton } from '@/components/SeedPromotionsButton'; // Removed
import { MapPin, Clock, Award, Users, Star, Scissors, AlertTriangle } from 'lucide-react';
import type { Locale, Promotion } from '@/lib/types';

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params }: HomePageProps) {
  const currentLocale = params.locale;
  const salonInfoData = getSalonInfo(currentLocale);
  const mockReviewsData = getMockReviews(currentLocale);
  const t = (key: keyof typeof salonInfoData.translations) => salonInfoData.translations[key];

  let promotionsData: Promotion[] = [];
  let promotionFetchError = false;
  let usingFirestorePromotions = false;

  try {
    const firestorePromotions = await fetchPromotionsFromFirestore(currentLocale);
    if (firestorePromotions.length > 0) {
      promotionsData = firestorePromotions;
      usingFirestorePromotions = true;
    } else {
      console.warn(`No promotions found in Firestore for locale: ${currentLocale}. Falling back to mock data.`);
      promotionsData = getMockPromotions(currentLocale); // Fallback
    }
  } catch (error) {
    console.error("Error fetching promotions from Firestore, falling back to mock data:", error);
    promotionFetchError = true;
    promotionsData = getMockPromotions(currentLocale); // Fallback
  }

  const translationsAlerts = {
    en: {
      fetchErrorTitle: "Failed to Load Promotions",
      fetchErrorDescription: "We couldn't fetch promotions from the database. Displaying sample promotions. Check connection or seed data.",
      firestoreNote: "Displaying promotions from Firestore. If this list is empty or incorrect, ensure data is seeded.",
      mockDataNote: "Displaying sample promotions. Please check Firestore connection or seed data if needed."
    },
    ar: {
      fetchErrorTitle: "فشل تحميل العروض",
      fetchErrorDescription: "لم نتمكن من جلب العروض من قاعدة البيانات. يتم عرض عروض تجريبية. تحقق من الاتصال أو قم بإضافة البيانات الأولية.",
      firestoreNote: "يتم عرض العروض من Firestore. إذا كانت القائمة فارغة أو غير صحيحة، تأكد من إضافة البيانات الأولية.",
      mockDataNote: "يتم عرض عروض تجريبية. يرجى التحقق من اتصال Firestore أو إضافة البيانات الأولية إذا لزم الأمر."
    }
  };
  const tAlerts = translationsAlerts[currentLocale];


  return (
    <div className="space-y-16 py-12 bg-background">
      {/* Hero Section */}
      <section className="container mx-auto text-center">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8">
            <div className="mb-6">
              <Image
                src="https://i.postimg.cc/xCBD2Mqx/respect-salon-150x150.png"
                alt={currentLocale === 'ar' ? "شعار صالون رسبيكت" : "Respect Salon Logo"}
                width={150}
                height={150}
                className="object-contain"
                data-ai-hint="salon logo R"
                priority
              />
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
              {salonInfoData.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              {t('experienceRoyalGrooming')}
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-md shadow-lg">
              <Link href={`/${currentLocale}/services`}>{t('bookAppointment')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Salon Information Section */}
      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl font-semibold mb-6 text-primary">{t('welcomeToSalon')}</h2>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{t('aboutUs')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-foreground/80">
                <p>{salonInfoData.translations.salonDescription}</p>
                <div className="flex items-start gap-3 pt-2">
                  <MapPin className="h-5 w-5 mt-1 text-accent shrink-0" />
                  <span>{salonInfoData.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-1 text-accent shrink-0" />
                  <span>{salonInfoData.workingHours}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
             <Image src={salonInfoData.locationImage} alt={currentLocale === 'ar' ? "موقع الصالون على الخريطة" : "Salon Map Location"} layout="fill" objectFit="cover" data-ai-hint={salonInfoData.locationDataAiHint}/>
          </div>
        </div>
      </section>
      
      {/* Salon Gallery */}
      <section className="container mx-auto">
        <h2 className="font-headline text-3xl font-semibold mb-8 text-center text-primary">{t('glimpseOfSalon')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {salonInfoData.galleryImages.map((img, index) => (
            <div key={index} className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
              <Image src={img.url} alt={img.alt} layout="fill" objectFit="cover" data-ai-hint={img.dataAiHint} className="hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* Current Promotions Section */}
      <section className="container mx-auto">
         <div className="flex items-center justify-center mb-8 gap-3">
            <Award className="h-10 w-10 text-accent" />
            <h2 className="font-headline text-3xl font-semibold text-primary">{t('currentOffers')}</h2>
        </div>

        {/* SeedPromotionsButton was here, now removed */}

        {promotionFetchError && (
          <div className="mb-8 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 me-2" />
              <h3 className="font-semibold">{tAlerts.fetchErrorTitle}</h3>
            </div>
            <p className="text-sm">{tAlerts.fetchErrorDescription}</p>
          </div>
        )}

        {!promotionFetchError && (
          <div className="mb-4 p-3 border rounded-md bg-secondary/20 text-sm text-muted-foreground">
            {usingFirestorePromotions ? tAlerts.firestoreNote : tAlerts.mockDataNote}
          </div>
        )}
        
        {promotionsData.length > 0 ? (
          <div className="space-y-6">
            {promotionsData.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} locale={currentLocale} />
            ))}
          </div>
        ) : (
           <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">{currentLocale === 'ar' ? 'لا توجد عروض حالياً.' : 'No current offers available.'}</p>
          </div>
        )}
      </section>

      {/* Customer Testimonials Section */}
      <section className="container mx-auto">
        <div className="flex items-center justify-center mb-8 gap-3">
            <Star className="h-10 w-10 text-accent" />
            <h2 className="font-headline text-3xl font-semibold text-primary">{t('valuedClientsWords')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockReviewsData.map((review) => (
            <ReviewCard key={review.id} review={review} locale={currentLocale} />
          ))}
        </div>
      </section>
    </div>
  );
}