"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Appointment, Locale } from '@/lib/types';
import { CalendarDays, Clock, User, Tag, CheckCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AppointmentCardProps {
  appointment: Appointment;
  locale: Locale;
}

const translations = {
  en: {
    time: "Time",
    barber: "Barber",
    modify: "Modify",
    cancel: "Cancel",
    rebookService: "Rebook Service",
    leaveReview: "Leave a Review",
    status: {
      Confirmed: "Confirmed",
      Pending: "Pending",
      Cancelled: "Cancelled",
      Completed: "Completed",
    }
  },
  ar: {
    time: "الوقت",
    barber: "الحلاق",
    modify: "تعديل",
    cancel: "إلغاء",
    rebookService: "إعادة حجز الخدمة",
    leaveReview: "اترك تقييمًا",
    status: {
      Confirmed: "مؤكد",
      Pending: "قيد الانتظار",
      Cancelled: "ملغى",
      Completed: "مكتمل",
    }
  }
};

export function AppointmentCard({ appointment, locale }: AppointmentCardProps) {
  const t = translations[locale];
  const tStatus = (statusKey: Appointment['status']) => t.status[statusKey] || statusKey;

  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    setIsPast(new Date(appointment.date) < new Date() && appointment.status !== 'Pending' && appointment.status !== 'Confirmed');
  }, [appointment.date, appointment.status]);


  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return 'default'; 
      case 'Completed': return 'secondary'; 
      case 'Pending': return 'outline'; 
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    const iconProps = { className: `h-4 w-4 ${locale === 'ar' ? 'ms-2' : 'me-2'}` };
    switch (status) {
      case 'Confirmed': return <CheckCircle {...iconProps} />;
      case 'Completed': return <CheckCircle {...iconProps}  />;
      case 'Pending': return <AlertTriangle {...iconProps} />;
      case 'Cancelled': return <XCircle {...iconProps} />;
      default: return null;
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl text-primary">{appointment.serviceName}</CardTitle> {/* Service name might need localization if it comes from a dynamic source */}
                <CardDescription className="text-sm">
                    {new Date(appointment.date).toLocaleDateString(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize flex items-center whitespace-nowrap">
                {getStatusIcon(appointment.status)}
                {tStatus(appointment.status)}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-muted-foreground">
          <Clock className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
          <span>{t.time}: {appointment.time}</span>
        </div>
        {appointment.barberName && (
          <div className="flex items-center text-muted-foreground">
            <User className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
            <span>{t.barber}: {appointment.barberName}</span> {/* Barber name might need localization */}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
        {(appointment.status === 'Confirmed' || appointment.status === 'Pending') && !isPast && (
          <>
            <Button variant="outline" size="sm">{t.modify}</Button>
            <Button variant="destructive" size="sm">{t.cancel}</Button>
          </>
        )}
        {isPast && appointment.status === 'Completed' && (
             <Button variant="default" size="sm" className="w-full sm:w-auto">
                <RefreshCcw className={`h-4 w-4 ${locale === 'ar' ? 'ms-2' : 'me-2'}`}/>
                {t.rebookService}
            </Button>
        )}
         {isPast && appointment.status === 'Completed' && (
             <Button variant="outline" size="sm" className="w-full sm:w-auto">{t.leaveReview}</Button>
        )}
      </CardFooter>
    </Card>
  );
}
