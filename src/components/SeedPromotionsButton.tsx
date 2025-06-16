
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedPromotionsData } from '@/lib/firebase'; // Will be created
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2 } from 'lucide-react';
import type { Locale } from '@/lib/types';

interface SeedPromotionsButtonProps {
  locale: Locale;
}

const translations = {
  en: {
    seedButtonText: "Seed Promotions Data",
    seedingInProgress: "Seeding promotions...",
    seedingSuccessTitle: "Promotions Seeding",
    seedingErrorTitle: "Promotions Seeding Error",
    initialDataNote: "If promotions are not showing from the database, you might need to seed initial data.",
    devOnlyNote: "Note: This button is for development. It adds sample promotions if none exist."
  },
  ar: {
    seedButtonText: "إضافة بيانات العروض الأولية",
    seedingInProgress: "جاري إضافة العروض...",
    seedingSuccessTitle: "إضافة العروض",
    seedingErrorTitle: "خطأ في إضافة العروض",
    initialDataNote: "إذا لم تظهر العروض من قاعدة البيانات، قد تحتاج إلى إضافة البيانات الأولية.",
    devOnlyNote: "ملاحظة: هذا الزر مخصص للتطوير. يضيف عروضًا تجريبية إذا لم تكن موجودة."
  }
};

export function SeedPromotionsButton({ locale }: SeedPromotionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = translations[locale];

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const message = await seedPromotionsData();
      toast({
        title: t.seedingSuccessTitle,
        description: message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        variant: "destructive",
        title: t.seedingErrorTitle,
        description: errorMessage,
      });
      console.error("Error seeding promotions data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6 p-4 border border-dashed border-primary rounded-md bg-secondary/30 text-center">
      <p className="mb-3 text-sm text-muted-foreground">
        {t.initialDataNote}
      </p>
      <Button onClick={handleSeedData} disabled={isLoading} className="bg-primary hover:bg-primary/90">
        {isLoading ? (
          <>
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
            {t.seedingInProgress}
          </>
        ) : (
          <>
            <Database className="me-2 h-4 w-4" />
            {t.seedButtonText}
          </>
        )}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        {t.devOnlyNote}
      </p>
    </div>
  );
}
