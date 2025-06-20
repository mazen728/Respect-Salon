
// src/app/[locale]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PromotionCard } from '@/components/PromotionCard';
import { ReviewCard } from '@/components/ReviewCard';
import { salonInfo as getSalonInfo, getMockReviews } from '@/lib/mockData';
import { fetchPromotionsFromFirestore, getPromotionsVisibilitySetting } from '@/lib/firebase';
import type { Locale, Promotion, Review, SalonInfoData } from '@/lib/types';
import { Percent, Star, MapPin, Ticket, AlertTriangle, Instagram, Facebook } from 'lucide-react';
// import { SeedPromotionsButton } from '@/components/SeedPromotionsButton'; // Removed

interface FetchedData {
  currentLocale: Locale;
  promotionsVisible: boolean;
  salonInfoData: SalonInfoData;
  mockReviewsData: Review[];
  promotionsData: Promotion[];
  fetchError: boolean;
  firebaseErrorType: 'permission' | 'generic' | null;
  usingFirestorePromotions: boolean;
}

// fetchData now accepts the params object
async function fetchData(params: { locale: Locale }): Promise<FetchedData> {
  const resolvedLocale = params.locale; // Access locale inside the async function

  const promotionsVisible = await getPromotionsVisibilitySetting();
  const salonInfoData = getSalonInfo(resolvedLocale);
  const mockReviewsData = getMockReviews(resolvedLocale);

  let promotionsData: Promotion[] = [];
  let fetchError = false;
  let firebaseErrorType: 'permission' | 'generic' | null = null;
  let usingFirestorePromotions = false;

  if (promotionsVisible) {
    try
      {
      const firestorePromotions = await fetchPromotionsFromFirestore(resolvedLocale);
      if (firestorePromotions.length > 0) {
        promotionsData = firestorePromotions;
        usingFirestorePromotions = true;
      }
    } catch (error: any) {
      fetchError = true;
      if (error.message && (error.message.toLowerCase().includes('permission') || error.message.toLowerCase().includes('denied'))) {
        firebaseErrorType = 'permission';
      } else {
        firebaseErrorType = 'generic';
      }
    }
  }

  return {
    currentLocale: resolvedLocale,
    promotionsVisible,
    salonInfoData,
    mockReviewsData,
    promotionsData,
    fetchError,
    firebaseErrorType,
    usingFirestorePromotions,
  };
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  // Explicitly "await" the params object to satisfy Next.js for dynamic routes.
  const awaitedParams = await Promise.resolve(params);

  // Pass the awaited params object to fetchData
  const {
    currentLocale,
    promotionsVisible,
    salonInfoData,
    mockReviewsData,
    promotionsData,
    fetchError,
    firebaseErrorType,
    // usingFirestorePromotions, // Not directly used in JSX, but available
  } = await fetchData(awaitedParams);

  const t = (key: keyof typeof salonInfoData.translations) => salonInfoData.translations[key];

  const youtubeVideoId = "KwBadz1zX1g";
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&showinfo=0&fs=0&disablekb=1&iv_load_policy=3`;


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center text-center bg-black">
          <div className="relative z-10 p-6 bg-black rounded-lg shadow-xl">
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary mb-4">
              {salonInfoData.name}
            </h1>
            <p className="text-xl md:text-2xl text-foreground mb-8 max-w-2xl mx-auto">
              {t('experienceRoyalGrooming')}
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href={`/${currentLocale}/services`}>{t('bookAppointment')}</Link>
            </Button>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-headline font-bold text-primary mb-6">{t('aboutUs')}</h2>
            <p className="text-lg text-secondary-foreground max-w-3xl mx-auto leading-relaxed">
              {salonInfoData.translations.salonDescription}
            </p>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-headline font-bold text-primary text-center mb-10">{t('glimpseOfSalon')}</h2>
            <div className="aspect-video w-full max-w-3xl mx-auto bg-muted rounded-lg shadow-lg overflow-hidden">
               <iframe
                className="w-full h-full pointer-events-none"
                src={youtubeEmbedUrl}
                title={t('glimpseOfSalon')}
                allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Featured Look Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                {/* Image removed */}
              </div>
              <div className="md:w-1/2 text-center md:text-start">
                <h2 className="text-4xl font-headline font-bold text-primary mb-4">{t('ourFeaturedLook')}</h2>
                <p className="text-lg text-secondary-foreground mb-4">
                  {currentLocale === 'ar' ? 'اكتشف الإطلالة الأكثر رواجاً هذا الموسم، والمصممة خصيصاً لتعكس أحدث صيحات الموضة الرجالية. فريقنا من الحلاقين المبدعين جاهز ليمنحك هذا المظهر العصري والأنيق.' : 'Discover this season\'s hottest look, expertly crafted to reflect the latest trends in men\'s fashion. Our talented barbers are ready to give you this modern and stylish appearance.'}
                </p>
                <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Link href={`/${currentLocale}/services`}>{t('bookAppointment')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Promotions Section Logic */}
        {promotionsVisible && promotionsData.length > 0 ? (
          <section id="promotions" className="py-16 bg-background">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <Percent className="h-12 w-12 text-accent mx-auto mb-4" />
                <h2 className="text-4xl font-headline font-bold text-primary mb-3">{t('currentOffers')}</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {currentLocale === 'ar' ? 'استفد من عروضنا الحصرية وخصوماتنا المميزة. تجديد مستمر لتستمتع بأفضل الخدمات بأفضل الأسعار.' : 'Take advantage of our exclusive offers and special discounts. Constantly updated for you to enjoy the best services at the best prices.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {promotionsData.map((promo) => (
                  <PromotionCard key={promo.id} promotion={promo} locale={currentLocale} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-6 text-center">
              <div className="py-10 bg-card rounded-lg shadow-lg my-8">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-75" />
                <p className="text-2xl font-headline text-primary mb-3">
                  {currentLocale === 'ar' ? 'لا توجد عروض متوفرة حالياً' : 'No Current Promotions'}
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  {currentLocale === 'ar' ? 'يرجى التحقق مرة أخرى لاحقًا لرؤية أحدث الصفقات!' : 'Please check back later to see our latest deals!'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <Star className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-headline font-bold text-primary mb-3">{t('valuedClientsWords')}</h2>
            </div>
            {mockReviewsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockReviewsData.map((review) => (
                  <ReviewCard key={review.id} review={review} locale={currentLocale} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">{currentLocale === 'ar' ? 'لا توجد تقييمات لعرضها بعد.' : 'No reviews to display yet.'}</p>
            )}
          </div>
        </section>

        {/* Location/Contact Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <MapPin className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-headline font-bold text-primary mb-3">{salonInfoData.translations.contactUs}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-headline">{salonInfoData.name}</CardTitle>
                    <CardDescription>{salonInfoData.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p><span className="font-semibold">{currentLocale === 'ar' ? 'ساعات العمل:' : 'Working Hours:'}</span> {salonInfoData.workingHours}</p>
                    <p><span className="font-semibold">{currentLocale === 'ar' ? 'الهاتف:' : 'Phone:'}</span> <a href={`tel:${salonInfoData.phone}`} className="text-accent hover:underline">{salonInfoData.phone}</a></p>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 mt-2">
                      <a href={salonInfoData.whatsappLink} target="_blank" rel="noopener noreferrer">{salonInfoData.translations.whatsappUs}</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div className="h-80 md:h-96 rounded-lg shadow-xl bg-white">
                {/* Image removed and background set to white */}
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-headline font-bold text-primary mb-10">
              {currentLocale === 'ar' ? 'تابعنا على وسائل التواصل' : 'Connect With Us'}
            </h2>
            <div className="flex justify-center items-center space-x-8 rtl:space-x-reverse">
              {salonInfoData.socialMedia.filter(social => social.icon).map((social) => (
                <a
                  key={social.name[currentLocale as 'en' | 'ar'] || social.name.en}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name[currentLocale as 'en' | 'ar'] || social.name.en}
                  className="text-primary hover:text-accent transition-colors duration-300 transform hover:scale-110"
                >
                  <social.icon className="h-10 w-10 md:h-12 md:w-12" />
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

