"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  iconClassName?: string;
}

export function StarRating({ rating, totalStars = 5, size = 16, className, iconClassName }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center", className)} aria-label={`Rating: ${rating} out of ${totalStars} stars`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" strokeWidth={0} className={cn("text-accent", iconClassName)} style={{ width: size, height: size }} />
      ))}
      {halfStar && (
        <div style={{ position: 'relative', width: size, height: size }}>
          <Star fill="currentColor" strokeWidth={0} className={cn("text-accent absolute left-0 top-0", iconClassName)} style={{ clipPath: 'inset(0 50% 0 0)', width: size, height: size }} />
          <Star fill="currentColor" strokeWidth={0} className={cn("text-muted-foreground opacity-30 absolute left-0 top-0", iconClassName)} style={{ clipPath: 'inset(0 0 0 50%)', width: size, height: size }} />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="currentColor" strokeWidth={0} className={cn("text-muted-foreground opacity-30", iconClassName)} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}
