"use client";

import { useState } from 'react';
import { suggestComplementaryServices, type SuggestComplementaryServicesOutput } from '@/ai/flows/suggest-complementary-services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Wand2, Coffee, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


interface AiSuggestionsProps {
  selectedService: string | null;
}

export function AiSuggestions({ selectedService }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestComplementaryServicesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = async (serviceName: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await suggestComplementaryServices({ selectedHaircut: serviceName });
      setSuggestions(result);
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setError("Failed to fetch AI suggestions. Please try again.");
      toast({
        variant: "destructive",
        title: "AI Suggestion Error",
        description: "Could not fetch suggestions at this time.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch suggestions when selectedService changes and is not null
  // This replaces the button click to fetch suggestions
  React.useEffect(() => {
    if (selectedService) {
      fetchSuggestions(selectedService);
    } else {
      // Clear suggestions if no service is selected
      setSuggestions(null);
      setError(null);
      setIsLoading(false);
    }
  }, [selectedService]);


  if (!selectedService) {
    return (
        <Card className="mt-8 bg-secondary/50 border-dashed border-accent">
            <CardHeader>
                <CardTitle className="flex items-center font-headline text-xl text-accent">
                    <Wand2 className="h-6 w-6 mr-2" />
                    Personalized Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Select a service above to get AI-powered recommendations for complementary services and refreshments to enhance your visit!</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg border-accent">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl text-accent">
          <Wand2 className="h-6 w-6 mr-2" />
          AI-Powered Suggestions for "{selectedService}"
        </CardTitle>
        <CardDescription>
          Enhance your experience with these personalized recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <LoadingSpinner size={32} />
            <p className="mt-2 text-muted-foreground">Crafting your suggestions...</p>
          </div>
        )}
        {error && (
           <Alert variant="destructive" className="mb-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        {suggestions && !isLoading && !error && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Complementary Services:
              </h4>
              {suggestions.suggestedServices && suggestions.suggestedServices.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/80">
                  {suggestions.suggestedServices.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">No specific service suggestions at this time, but feel free to ask your barber!</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center">
                <Coffee className="h-5 w-5 mr-2 text-primary" />
                Refreshment Suggestion:
              </h4>
              <p className="text-foreground/80">{suggestions.coffeeSuggestion || "Enjoy a complimentary beverage during your visit."}</p>
            </div>
             <Button className="mt-4 w-full sm:w-auto bg-primary hover:bg-primary/80">Add to Booking (Mock)</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
