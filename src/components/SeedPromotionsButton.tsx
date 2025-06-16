
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedPromotionsData } from '@/lib/firebase'; // Updated import
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2, Gift } from 'lucide-react'; // Using Gift icon for promotions
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
    seedDescription: "If the promotions list is empty or not showing data from the database, you might need to seed initial data.",
    seedNote: "Note: This button is for development purposes only. It will add sample promotion data if none exists."
  },
  ar: {
    seedButtonText: "إضافة بيانات العروض الأولية",
    seedingInProgress: "جاري إضافة العروض...",
    seedingSuccessTitle: "إضافة العروض",
    seedingErrorTitle: "خطأ في إضافة العروض",
    seedDescription: "إذا كانت قائمة العروض فارغة أو لا تظهر بيانات من قاعدة البيانات، قد تحتاج إلى إضافة البيانات الأولية.",
    seedNote: "ملاحظة: هذا الزر مخصص للاستخدام في بيئة التطوير فقط. سيضيف بيانات عروض تجريبية إذا لم تكن موجودة."
  }
};

export function SeedPromotionsButton({ locale }: SeedPromotionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = translations[locale];

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const message = await seedPromotionsData(); // Call the specific promotions seeding function
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
    <div className="my-6 p-4 border border-dashed border-accent rounded-md bg-secondary/30 text-center">
      <p className="mb-3 text-sm text-muted-foreground">
        {t.seedDescription}
      </p>
      <Button onClick={handleSeedData} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
        {isLoading ? (
          <>
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
            {t.seedingInProgress}
          </>
        ) : (
          <>
            <Gift className="me-2 h-4 w-4" /> {/* Changed icon to Gift */}
            {t.seedButtonText}
          </>
        )}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        {t.seedNote}
      </p>
    </div>
  );
}
