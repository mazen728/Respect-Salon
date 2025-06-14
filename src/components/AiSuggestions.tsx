"use client";

import React, { useState, useEffect } from 'react'; // Added React import
import { suggestComplementaryServices, type SuggestComplementaryServicesOutput } from '@/ai/flows/suggest-complementary-services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Wand2, Coffee, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Locale } from '@/lib/types';


interface AiSuggestionsProps {
  selectedService: string | null;
  locale: Locale;
}

const translations = {
  en: {
    personalizedRecs: "Personalized Recommendations",
    selectServicePrompt: "Select a service above to get AI-powered recommendations for complementary services and refreshments to enhance your visit!",
    aiPoweredFor: "AI-Powered Suggestions for",
    enhanceExperience: "Enhance your experience with these personalized recommendations.",
    craftingSuggestions: "Crafting your suggestions...",
    errorTitle: "Error",
    complementaryServices: "Complementary Services:",
    noServiceSuggestions: "No specific service suggestions at this time, but feel free to ask your barber!",
    refreshmentSuggestion: "Refreshment Suggestion:",
    enjoyBeverage: "Enjoy a complimentary beverage during your visit.",
    addToBooking: "Add to Booking (Mock)",
    failedToFetch: "Failed to fetch AI suggestions. Please try again.",
    aiSuggestionError: "AI Suggestion Error",
    couldNotFetch: "Could not fetch suggestions at this time."
  },
  ar: {
    personalizedRecs: "توصيات مخصصة",
    selectServicePrompt: "اختر خدمة من الأعلى للحصول على توصيات مدعومة بالذكاء الاصطناعي لخدمات تكميلية ومرطبات لتعزيز زيارتك!",
    aiPoweredFor: "اقتراحات مدعومة بالذكاء الاصطناعي لـ",
    enhanceExperience: "عزز تجربتك مع هذه التوصيات المخصصة.",
    craftingSuggestions: "جارٍ إعداد اقتراحاتك...",
    errorTitle: "خطأ",
    complementaryServices: "الخدمات التكميلية:",
    noServiceSuggestions: "لا توجد اقتراحات خدمة محددة في الوقت الحالي ، ولكن لا تتردد في سؤال حلاقك!",
    refreshmentSuggestion: "اقتراح المرطبات:",
    enjoyBeverage: "استمتع بمشروب مجاني خلال زيارتك.",
    addToBooking: "إضافة إلى الحجز (تجريبي)",
    failedToFetch: "فشل في جلب اقتراحات الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
    aiSuggestionError: "خطأ في اقتراح الذكاء الاصطناعي",
    couldNotFetch: "تعذر جلب الاقتراحات في الوقت الحالي."
  }
};

export function AiSuggestions({ selectedService, locale }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestComplementaryServicesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const t = translations[locale];

  const fetchSuggestions = async (serviceName: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      // For AI flow, we might want to pass the service name in English or a neutral key
      // if the AI model is primarily trained in English. Here, we pass the selectedService as is.
      const result = await suggestComplementaryServices({ selectedHaircut: serviceName });
      setSuggestions(result);
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setError(t.failedToFetch);
      toast({
        variant: "destructive",
        title: t.aiSuggestionError,
        description: t.couldNotFetch,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchSuggestions(selectedService);
    } else {
      setSuggestions(null);
      setError(null);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, locale]); // Added locale to dependencies in case translations affect fetch logic indirectly in future


  if (!selectedService) {
    return (
        <Card className="mt-8 bg-secondary/50 border-dashed border-accent">
            <CardHeader>
                <CardTitle className="flex items-center font-headline text-xl text-accent">
                    <Wand2 className="h-6 w-6 me-2" />
                    {t.personalizedRecs}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t.selectServicePrompt}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg border-accent">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl text-accent">
          <Wand2 className="h-6 w-6 me-2" />
          {t.aiPoweredFor} "{selectedService}"
        </CardTitle>
        <CardDescription>
          {t.enhanceExperience}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <LoadingSpinner size={32} />
            <p className="mt-2 text-muted-foreground">{t.craftingSuggestions}</p>
          </div>
        )}
        {error && (
           <Alert variant="destructive" className="mb-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>{t.errorTitle}</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        {suggestions && !isLoading && !error && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center">
                <Sparkles className="h-5 w-5 me-2 text-primary" />
                {t.complementaryServices}
              </h4>
              {suggestions.suggestedServices && suggestions.suggestedServices.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 ps-2 text-foreground/80">
                  {suggestions.suggestedServices.map((service, index) => (
                    <li key={index}>{service}</li> // These suggestions come from AI, may not be translated yet
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">{t.noServiceSuggestions}</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center">
                <Coffee className="h-5 w-5 me-2 text-primary" />
                {t.refreshmentSuggestion}
              </h4>
              <p className="text-foreground/80">{suggestions.coffeeSuggestion || t.enjoyBeverage}</p>
            </div>
             <Button className="mt-4 w-full sm:w-auto bg-primary hover:bg-primary/80">{t.addToBooking}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
