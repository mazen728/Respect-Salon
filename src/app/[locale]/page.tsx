// src/app/[locale]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PromotionCard } from '@/components/PromotionCard';
import { ReviewCard } from '@/components/ReviewCard';
import { salonInfo as getSalonInfo, getMockPromotions, getMockReviews } from '@/lib/mockData';
import { fetchPromotionsFromFirestore } from '@/lib/firebase';
import { SeedPromotionsButton } from '@/components/SeedPromotionsButton';
import type { Locale, Promotion, Review } from '@/lib/types';
import { Users, Percent, Star, MapPin, Sparkles, Ticket } from 'lucide-react'; // Added Ticket icon

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params }: HomePageProps) {
  const currentLocale = params.locale;
  const salonInfoData = getSalonInfo(currentLocale);
  const mockReviewsData = getMockReviews(currentLocale);

  let promotionsData: Promotion[] = [];
  let fetchError = false;
  let usingFirestorePromotions = false;

  try {
    const firestorePromotions = await fetchPromotionsFromFirestore(currentLocale);
    if (firestorePromotions.length > 0) {
      promotionsData = firestorePromotions;
      usingFirestorePromotions = true;
    } else {
      // If Firestore returns no promotions, promotionsData will be empty.
      // We will rely on the length check later to display "no promotions".
      // If we want to fall back to mocks when Firestore is empty (not just on error), this logic would change.
      // For now, an empty Firestore result means no promotions.
      console.warn(`No promotions found in Firestore for locale: ${currentLocale}. Displaying 'no promotions' message if applicable.`);
      // We don't set promotionsData to mock here if Firestore is just empty but successfully queried.
      // Fallback to mock only happens on actual fetchError.
    }
  } catch (error) {
    console.error("Error fetching promotions from Firestore, falling back to mock data:", error);
    fetchError = true;
    promotionsData = getMockPromotions(currentLocale); // Fallback to mock on error
  }
  
  // If there was no fetch error, but firestore had no data, promotionsData would be empty.
  // If there was a fetch error, promotionsData would be mock data.
  // If mock data was also empty (not currently the case), then promotionsData would be empty.

  const t = (key: keyof typeof salonInfoData.translations) => salonInfoData.translations[key];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center text-center bg-gradient-to-br from-primary/30 via-background to-background">
          <Image
            src="https://placehold.co/1200x800.png"
            alt={t('welcomeToSalon')}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-30"
            data-ai-hint="barber shop atmosphere"
            priority
          />
          <div className="relative z-10 p-6 bg-background/70 backdrop-blur-sm rounded-lg shadow-xl">
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
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-headline font-bold text-primary mb-6">{t('aboutUs')}</h2>
            <p className="text-lg text-secondary-foreground max-w-3xl mx-auto leading-relaxed">
              {salonInfoData.translations.salonDescription}
            </p>
          </div>
        </section>

        {/* Gallery Section - Simplified */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-headline font-bold text-primary text-center mb-10">{t('glimpseOfSalon')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salonInfoData.galleryImages.slice(0, 3).map((image, index) => (
                <Card key={index} className="overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <div className="relative h-64 w-full">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={image.dataAiHint}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Look Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt={t('ourFeaturedLook')}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  data-ai-hint="stylish haircut model"
                />
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

        {/* Promotions Section */}
        <section id="promotions" className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <Percent className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-headline font-bold text-primary mb-3">{t('currentOffers')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {currentLocale === 'ar' ? 'استفد من عروضنا الحصرية وخصوماتنا المميزة. تجديد مستمر لتستمتع بأفضل الخدمات بأفضل الأسعار.' : 'Take advantage of our exclusive offers and special discounts. Constantly updated for you to enjoy the best services at the best prices.'}
              </p>
            </div>

            <SeedPromotionsButton locale={currentLocale} />

            {fetchError && (
              <div className="mb-8 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive text-center">
                <p>{currentLocale === 'ar' ? 'حدث خطأ أثناء جلب العروض. يتم عرض البيانات الافتراضية.' : 'Error fetching promotions. Displaying fallback data.'}</p>
              </div>
            )}
            {!fetchError && promotionsData.length > 0 && ( // Only show this note if not error AND there is data to show
              <div className="mb-4 p-3 border rounded-md bg-secondary/20 text-sm text-muted-foreground text-center">
                {usingFirestorePromotions ? 
                    (currentLocale === 'ar' ? 'يتم عرض العروض من قاعدة البيانات.' : 'Displaying promotions from Firestore.') : 
                    (currentLocale === 'ar' ? 'يتم عرض العروض من البيانات الوهمية (فشل الاتصال بـ Firestore أو لا يوجد معرّف مشروع).' : 'Displaying mock promotions data (Firestore connection failed or no project ID).')
                }
              </div>
            )}

            {promotionsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {promotionsData.map((promo) => (
                  <PromotionCard key={promo.id} promotion={promo} locale={currentLocale} />
                ))}
              </div>
            ) : (
              // Enhanced "No promotions" message
              // This block is shown if promotionsData is empty, regardless of fetchError.
              // If fetchError was true, the error message above would have already been shown.
              <div className="text-center py-10 bg-card rounded-lg my-8 shadow">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-60" />
                <p className="text-xl font-semibold text-primary mb-2">
                  {currentLocale === 'ar' ? 'لا توجد عروض متوفرة حالياً' : 'No Current Promotions'}
                </p>
                <p className="text-muted-foreground">
                  {currentLocale === 'ar' ? 'يرجى التحقق مرة أخرى لاحقًا لرؤية أحدث الصفقات!' : 'Please check back later to see our latest deals!'}
                </p>
              </div>
            )}
          </div>
        </section>

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
              <div className="h-80 md:h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={salonInfoData.locationImage}
                  alt={currentLocale === 'ar' ? `موقع ${salonInfoData.name}` : `${salonInfoData.name} Location`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={salonInfoData.locationDataAiHint}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
