
import { BarberCard } from '@/components/BarberCard';
import { getMockBarbers } from '@/lib/mockData';
import type { Locale } from '@/lib/types';
import { Users } from 'lucide-react';

interface BarbersPageProps {
  params: { locale: Locale };
}

const translations = {
  en: {
    title: "Our Esteemed Barbers",
    description: "Meet the artisans who will craft your perfect look. Each barber brings a unique blend of skill, experience, and passion for the art of grooming.",
  },
  ar: {
    title: "حلاقونا الموقرون",
    description: "تعرف على الفنانين الذين سيصنعون مظهرك المثالي. كل حلاق يجلب مزيجًا فريدًا من المهارة والخبرة والشغف بفن العناية.",
  },
};

export default async function BarbersPage({ params }: BarbersPageProps) { // Made function async
  const mockBarbersData = getMockBarbers(params.locale);
  const t = translations[params.locale] || translations.en;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <Users className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockBarbersData.map((barber) => (
          <BarberCard key={barber.id} barber={barber} locale={params.locale} />
        ))}
      </div>
    </div>
  );
}
