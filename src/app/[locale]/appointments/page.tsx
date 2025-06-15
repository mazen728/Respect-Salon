
"use client";

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { AppointmentCard } from '@/components/AppointmentCard';
import { mockAppointments } from '@/lib/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, History } from 'lucide-react';
import type { Appointment, Locale } from '@/lib/types';

// Removed params from props interface, as useParams will be used.
// interface AppointmentsPageProps {
//   params: { locale: Locale };
// }

const pageTranslations = {
  en: {
    yourAppointments: "Your Royal Appointments",
    manageBookings: "Manage your bookings, review past services, and prepare for your next regal experience.",
    upcoming: "Upcoming",
    past: "Past",
    noUpcoming: "No upcoming appointments.",
    readyForNext: "Ready for your next grooming session?",
    bookNow: "Book Now",
    noPast: "No past appointments found."
  },
  ar: {
    yourAppointments: "مواعيدك الملكية",
    manageBookings: "قم بإدارة حجوزاتك، ومراجعة الخدمات السابقة، والاستعداد لتجربتك الملكية القادمة.",
    upcoming: "القادمة",
    past: "السابقة",
    noUpcoming: "لا توجد مواعيد قادمة.",
    readyForNext: "هل أنت مستعد لجلسة العناية التالية؟",
    bookNow: "احجز الآن",
    noPast: "لم يتم العثور على مواعيد سابقة."
  }
};

export default function AppointmentsPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale; // Assuming locale is always a string 'en' or 'ar'

  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  // Fallback if locale is not immediately available or invalid, though middleware should handle this.
  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    // Render a loading state or default content if locale is not valid
    // This situation should ideally be prevented by routing/middleware
    return <div>Loading page...</div>;
  }

  const t = pageTranslations[locale];

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(appt => (appt.status === 'Confirmed' || appt.status === 'Pending') && new Date(appt.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    return appointments
      .filter(appt => appt.status === 'Completed' || appt.status === 'Cancelled' || new Date(appt.date) < new Date())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <CalendarDays className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.yourAppointments}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.manageBookings}
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto mb-8">
          <TabsTrigger value="upcoming" className="py-3 text-base">
            <CalendarDays className="h-5 w-5 me-2" /> {t.upcoming}
          </TabsTrigger>
          <TabsTrigger value="past" className="py-3 text-base">
            <History className="h-5 w-5 me-2" /> {t.past}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">{t.noUpcoming}</p>
              <p className="mt-2">{t.readyForNext}</p>
              <Button asChild className="mt-4">
                <Link href={`/${locale}/services`}>{t.bookNow}</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">{t.noPast}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
