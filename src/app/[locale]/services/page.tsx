
"use client"; 

import { useState } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { ServiceCard } from '@/components/ServiceCard';
import { AiSuggestions } from '@/components/AiSuggestions';
import { getMockServices } from '@/lib/mockData';
import { ListChecks, Wand2 } from 'lucide-react';
import type { Locale } from '@/lib/types';

// Removed params from props interface
// interface ServicesPageProps {
//   params: { locale: Locale };
// }

const pageTranslations = {
  en: {
    pageTitle: "Our Royal Services",
    pageDescription: "Indulge in our meticulously crafted services, designed for the modern client. Each treatment is a blend of tradition and precision.",
    aiTitle: "Personalized Enhancements",
    aiDescription: "Let our AI assist you in crafting the perfect salon experience. Select a service above to see tailored suggestions."
  },
  ar: {
    pageTitle: "خدماتنا الملكية",
    pageDescription: "استمتع بخدماتنا المصممة بدقة للعميل العصري. كل علاج هو مزيج من التقاليد والدقة.",
    aiTitle: "تحسينات مخصصة",
    aiDescription: "دع الذكاء الاصطناعي يساعدك في صياغة تجربة الصالون المثالية. اختر خدمة أعلاه لرؤية الاقتراحات المصممة خصيصًا لك."
  }
};

export default function ServicesPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale; // Assuming locale is always 'en' or 'ar'

  const [selectedServiceForAI, setSelectedServiceForAI] = useState<string | null>(null);
  
  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    return <div>Loading page...</div>;
  }
  
  const mockServices = getMockServices(locale);
  const t = pageTranslations[locale];


  const handleServiceSelection = (serviceName: string) => {
    setSelectedServiceForAI(serviceName);
    const aiSection = document.getElementById('ai-suggestions-section');
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <section className="mb-16">
        <div className="text-center mb-10">
          <ListChecks className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.pageTitle}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.pageDescription}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onSelectService={handleServiceSelection}
              locale={locale}
            />
          ))}
        </div>
      </section>

      <section id="ai-suggestions-section" className="mb-12">
         <div className="text-center mb-10">
          <Wand2 className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-3">{t.aiTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.aiDescription}
          </p>
        </div>
        <AiSuggestions selectedService={selectedServiceForAI} locale={locale} />
      </section>
    </div>
  );
}
