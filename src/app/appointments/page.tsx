"use client";

import { useState, useMemo } from 'react';
import { AppointmentCard } from '@/components/AppointmentCard';
import { mockAppointments } from '@/lib/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, History } from 'lucide-react';
import type { Appointment } from '@/lib/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

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
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">Your Royal Appointments</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your bookings, review past services, and prepare for your next regal experience.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto mb-8">
          <TabsTrigger value="upcoming" className="py-3 text-base">
            <CalendarDays className="h-5 w-5 mr-2" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="py-3 text-base">
            <History className="h-5 w-5 mr-2" /> Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No upcoming appointments.</p>
              <p className="mt-2">Ready for your next grooming session?</p>
              {/* TODO: Add Link to booking page */}
              {/* <Button asChild className="mt-4">
                <Link href="/services">Book Now</Link>
              </Button> */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No past appointments found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
