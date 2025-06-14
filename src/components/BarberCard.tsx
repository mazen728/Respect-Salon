import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/StarRating';
import type { Barber, Locale } from '@/lib/types';
import { Briefcase, Clock } from 'lucide-react';

interface BarberCardProps {
  barber: Barber;
  locale: Locale;
}

const translations = {
  en: { specialties: "Specialties:" },
  ar: { specialties: "التخصصات:" }
};

export function BarberCard({ barber, locale }: BarberCardProps) {
  const t = translations[locale];
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="relative w-full h-56">
        <Image
          src={barber.imageUrl}
          alt={barber.name} // Barber name is already localized from mockData
          layout="fill"
          objectFit="cover"
          data-ai-hint={barber.dataAiHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{barber.name}</CardTitle>
        <div className="flex items-center mt-1">
          <StarRating rating={barber.rating} size={18} />
          <span className={`text-sm text-muted-foreground ${locale === 'ar' ? 'me-2' : 'ms-2'}`}>({barber.rating.toFixed(1)})</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Briefcase className={`h-4 w-4 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
            <span>{t.specialties}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {barber.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="bg-accent/20 text-accent-foreground hover:bg-accent/30">{specialty}</Badge>
            ))}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className={`h-4 w-4 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
            <span>{barber.availability}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
