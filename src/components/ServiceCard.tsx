"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Service, Locale } from '@/lib/types';
import { Tag, Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelectService?: (serviceName: string) => void;
  locale: Locale;
}

const translations = {
  en: {
    price: "Price",
    duration: "Duration",
    selectService: "Select Service",
  },
  ar: {
    price: "السعر",
    duration: "المدة",
    selectService: "اختر الخدمة",
  }
};

export function ServiceCard({ service, onSelectService, locale }: ServiceCardProps) {
  const t = translations[locale];
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-xl text-primary">{service.name}</CardTitle>
          {service.icon && <service.icon className="h-8 w-8 text-accent" />}
        </div>
        <CardDescription className="pt-1">{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-muted-foreground text-sm mb-2">
          <Tag className="h-4 w-4 me-2 text-accent" />
          <span>{t.price}: SAR {service.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <Clock className="h-4 w-4 me-2 text-accent" />
          <span>{t.duration}: {service.duration}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => onSelectService && onSelectService(service.name)}
          aria-label={`${t.selectService}: ${service.name}`}
        >
          {t.selectService}
        </Button>
      </CardFooter>
    </Card>
  );
}
