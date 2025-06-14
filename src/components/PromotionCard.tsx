import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Promotion, Locale } from '@/lib/types';
import { Ticket } from 'lucide-react';

interface PromotionCardProps {
  promotion: Promotion;
  locale: Locale;
}

const translations = {
  en: { code: "CODE:", learnMore: "Learn More" },
  ar: { code: "الكود:", learnMore: "اعرف المزيد" }
};

export function PromotionCard({ promotion, locale }: PromotionCardProps) {
  const t = translations[locale];
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
      {promotion.imageUrl && (
        <div className="relative w-full md:w-1/3 h-48 md:h-auto">
          <Image
            src={promotion.imageUrl}
            alt={promotion.title} // Title is localized from mockData
            layout="fill"
            objectFit="cover"
            data-ai-hint={promotion.dataAiHint}
          />
        </div>
      )}
      <div className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">{promotion.title}</CardTitle>
          <CardDescription className="text-sm mt-1">{promotion.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          {promotion.couponCode && (
            <div className="mb-4">
              <Badge variant="outline" className="border-accent text-accent font-bold py-1 px-3">
                <Ticket className={`h-4 w-4 ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
                {t.code} {promotion.couponCode}
              </Badge>
            </div>
          )}
          <Button variant="default" className="w-full md:w-auto self-start mt-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {t.learnMore}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
