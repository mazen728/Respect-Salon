
import type { Metadata } from 'next';
import './globals.css';
import { PageHeader } from '@/components/PageHeader';
import { PageFooter } from '@/components/PageFooter';
import { Toaster } from "@/components/ui/toaster";
import type { Locale } from '@/lib/types'; // Import Locale

// Helper function to get translations
const getTranslations = (locale: Locale) => { // Use Locale type
  if (locale === 'ar') {
    return {
      title: 'صالون رسبيكت',
      description: 'احجز موعدك في صالون رسبيكت.',
    };
  }
  // Default to English if locale is not 'ar' or is undefined/invalid
  return {
    title: 'Respect Salon',
    description: 'Book your appointment at Respect Salon.',
  };
};

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> { // Use Locale type
  await Promise.resolve(); // Ensure an async tick before accessing params
  // Fallback to 'en' if params.locale is somehow not provided or is an unexpected value.
  const currentLocale = (params.locale && ['en', 'ar'].includes(params.locale)) ? params.locale : 'en';
  const t = getTranslations(currentLocale);
  return {
    title: t.title,
    description: t.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale }; // Use Locale type
}>) {
  await Promise.resolve(); // Ensure an async tick before accessing params
  // Fallback to 'en' if params.locale is somehow not provided or is an unexpected value.
  const currentLocale = (params.locale && ['en', 'ar'].includes(params.locale)) ? params.locale : 'en';
  const direction = currentLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={currentLocale} dir={direction}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Noto+Kufi+Arabic:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-body antialiased flex flex-col min-h-screen ${currentLocale === 'ar' ? 'font-arabic' : ''}`}>
        <PageHeader locale={currentLocale} />
        <main className="flex-grow">
          {children}
        </main>
        <PageFooter locale={currentLocale} />
        <Toaster />
      </body>
    </html>
  );
}
