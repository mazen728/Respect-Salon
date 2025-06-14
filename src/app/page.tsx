import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarberCard } from '@/components/BarberCard';
import { PromotionCard } from '@/components/PromotionCard';
import { ReviewCard } from '@/components/ReviewCard';
import { mockBarbers, mockPromotions, mockReviews, salonInfo } from '@/lib/mockData';
import { MapPin, Clock, Award, Users, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-12 bg-background">
      {/* Hero Section */}
      <section className="container mx-auto text-center">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl">
          <Image 
            src="https://placehold.co/1200x500.png" 
            alt="The Sultan's Chair luxury salon interior" 
            layout="fill" 
            objectFit="cover" 
            priority
            data-ai-hint="luxury salon panoramic"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-8">
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
              {salonInfo.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              Experience Royal Grooming
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-md shadow-lg">
              <Link href="/services">Book Your Appointment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Salon Information Section */}
      <section className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl font-semibold mb-6 text-primary">Welcome to Our Salon</h2>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl">About Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-foreground/80">
                <p>Step into a realm of unparalleled luxury and tradition at The Sultan's Chair. We offer a sanctuary where classic barbering artistry meets modern sophistication. Our master barbers are dedicated to providing you with an exceptional grooming experience, tailored to your unique style.</p>
                <div className="flex items-start space-x-3 pt-2">
                  <MapPin className="h-5 w-5 mt-1 text-accent shrink-0" />
                  <span>{salonInfo.address}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 mt-1 text-accent shrink-0" />
                  <span>{salonInfo.workingHours}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
             <Image src={salonInfo.locationImage} alt="Salon Map Location" layout="fill" objectFit="cover" data-ai-hint={salonInfo.locationDataAiHint}/>
          </div>
        </div>
      </section>
      
      {/* Salon Gallery */}
      <section className="container mx-auto">
        <h2 className="font-headline text-3xl font-semibold mb-8 text-center text-primary">Glimpse of Our Salon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {salonInfo.galleryImages.map((img, index) => (
            <div key={index} className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
              <Image src={img.url} alt={img.alt} layout="fill" objectFit="cover" data-ai-hint={img.dataAiHint} className="hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </section>


      {/* Featured Barbers Section */}
      <section className="container mx-auto">
        <div className="flex items-center justify-center mb-8 space-x-3">
          <Users className="h-10 w-10 text-accent" />
          <h2 className="font-headline text-3xl font-semibold text-primary">Meet Our Master Barbers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBarbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/barbers">View All Barbers</Link>
          </Button>
        </div>
      </section>

      {/* Current Promotions Section */}
      <section className="container mx-auto">
         <div className="flex items-center justify-center mb-8 space-x-3">
            <Award className="h-10 w-10 text-accent" />
            <h2 className="font-headline text-3xl font-semibold text-primary">Current Offers & Promotions</h2>
        </div>
        <div className="space-y-6">
          {mockPromotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="container mx-auto">
        <div className="flex items-center justify-center mb-8 space-x-3">
            <Star className="h-10 w-10 text-accent" />
            <h2 className="font-headline text-3xl font-semibold text-primary">Words From Our Valued Sultans</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
