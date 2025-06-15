"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/StarRating';
import type { Review, Locale } from '@/lib/types';
import { useEffect, useState } from 'react';

interface ReviewCardProps {
  review: Review;
  locale: Locale;
}

const translations = {
  en: { service: "Service:", barber: "Barber:", dateLocale: 'en-US' },
  ar: { service: "الخدمة:", barber: "الحلاق:", dateLocale: 'ar-EG' }
};

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const t = translations[locale];
  const initials = review.customerName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Format date on client to avoid hydration mismatch for locale-specific formatting
    setFormattedDate(new Date(review.date).toLocaleDateString(t.dateLocale));
  }, [review.date, t.dateLocale]);
  
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
          {formattedDate && <CardDescription className="text-xs">{formattedDate}</CardDescription>}
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
