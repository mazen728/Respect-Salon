"use client"; // This page needs to be a client component for useState and interactions

import { useState } from 'react';
import { ServiceCard } from '@/components/ServiceCard';
import { AiSuggestions } from '@/components/AiSuggestions';
import { mockServices } from '@/lib/mockData';
import { ListChecks, Wand2 } from 'lucide-react';

export default function ServicesPage() {
  const [selectedServiceForAI, setSelectedServiceForAI] = useState<string | null>(null);

  const handleServiceSelection = (serviceName: string) => {
    setSelectedServiceForAI(serviceName);
    // Optionally, scroll to AI suggestions or highlight it
    const aiSection = document.getElementById('ai-suggestions-section');
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <section className="mb-16">
        <div className="text-center mb-10">
          <ListChecks className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">Our Royal Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Indulge in our meticulously crafted services, designed for the modern Sultan. Each treatment is a blend of tradition and precision.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onSelectService={handleServiceSelection}
            />
          ))}
        </div>
      </section>

      <section id="ai-suggestions-section" className="mb-12">
         <div className="text-center mb-10">
          <Wand2 className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-3">Personalized Enhancements</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let our AI assist you in crafting the perfect salon experience. Select a service above to see tailored suggestions.
          </p>
        </div>
        <AiSuggestions selectedService={selectedServiceForAI} />
      </section>
    </div>
  );
}
