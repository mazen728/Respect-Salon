import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/StarRating';
import type { Review, Locale } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
  locale: Locale;
}

const translations = {
  en: { service: "Service:", barber: "Barber:" },
  ar: { service: "الخدمة:", barber: "الحلاق:" }
};

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const t = translations[locale];
  const initials = review.customerName.split(' ').map(n => n[0]).join('').toUpperCase(); // Initials are fine as is
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col bg-card">
      <CardHeader className="flex flex-row items-center gap-4 pb-3">
        <Avatar>
          {review.avatarUrl ? (
            <AvatarImage src={review.avatarUrl} alt={review.customerName} data-ai-hint={review.dataAiHint} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <CardTitle className="font-headline text-lg">{review.customerName}</CardTitle>
          <CardDescription className="text-xs">{new Date(review.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <div className="mb-2">
          <StarRating rating={review.rating} size={16} />
        </div>
        {(review.serviceName || review.barberName) && (
          <p className="text-sm font-semibold text-primary mb-1">
            {review.serviceName && `${t.service} ${review.serviceName}`}
            {review.serviceName && review.barberName && " | "}
            {review.barberName && `${t.barber} ${review.barberName}`}
          </p>
        )}
        <p className="text-sm text-foreground/80 leading-relaxed italic">"{review.comment}"</p>
      </CardContent>
    </Card>
  );
}
