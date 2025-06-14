import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/lib/types';
import { CalendarDays, Clock, User, Tag, CheckCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return 'default'; // default is primary based
      case 'Completed': return 'secondary'; // Using secondary for completed
      case 'Pending': return 'outline'; // Outline for pending
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="h-4 w-4 mr-2 text-green-500" />;
      case 'Completed': return <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />;
      case 'Pending': return <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 mr-2 text-red-500" />;
      default: return null;
    }
  };

  const isPastAppointment = new Date(appointment.date) < new Date() && appointment.status !== 'Pending' && appointment.status !== 'Confirmed';


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl text-primary">{appointment.serviceName}</CardTitle>
                <CardDescription className="text-sm">
                    {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize flex items-center whitespace-nowrap">
                {getStatusIcon(appointment.status)}
                {appointment.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-5 w-5 mr-2 text-accent" />
          <span>Time: {appointment.time}</span>
        </div>
        {appointment.barberName && (
          <div className="flex items-center text-muted-foreground">
            <User className="h-5 w-5 mr-2 text-accent" />
            <span>Barber: {appointment.barberName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
        {(appointment.status === 'Confirmed' || appointment.status === 'Pending') && !isPastAppointment && (
          <>
            <Button variant="outline" size="sm">Modify</Button>
            <Button variant="destructive" size="sm">Cancel</Button>
          </>
        )}
        {isPastAppointment && appointment.status === 'Completed' && (
             <Button variant="default" size="sm" className="w-full sm:w-auto">
                <RefreshCcw className="h-4 w-4 mr-2"/>
                Rebook Service
            </Button>
        )}
         {isPastAppointment && appointment.status === 'Completed' && (
             <Button variant="outline" size="sm" className="w-full sm:w-auto">Leave a Review</Button>
        )}
      </CardFooter>
    </Card>
  );
}
