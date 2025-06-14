import type { Metadata } from 'next';
import './globals.css';
import { PageHeader } from '@/components/PageHeader';
import { PageFooter } from '@/components/PageFooter';
import { Toaster } from "@/components/ui/toaster";

// Helper function to get translations
const getTranslations = (locale: string) => {
  if (locale === 'ar') {
    return {
      title: 'صالون رسبيكت',
      description: 'احجز موعدك في صالون رسبيكت.',
    };
  }
  return {
    title: 'Respect Salon',
    description: 'Book your appointment at Respect Salon.',
  };
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getTranslations(params.locale);
  return {
    title: t.title,
    description: t.description,
  };
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const direction = params.locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={params.locale} dir={direction}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Noto+Kufi+Arabic:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-body antialiased flex flex-col min-h-screen ${params.locale === 'ar' ? 'font-arabic' : ''}`}>
        <PageHeader locale={params.locale} />
        <main className="flex-grow">
          {children}
        </main>
        <PageFooter locale={params.locale} />
        <Toaster />
      </body>
    </html>
  );
}
