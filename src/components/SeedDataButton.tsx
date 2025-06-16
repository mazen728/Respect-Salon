
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedBarbersData } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2 } from 'lucide-react';
import type { Locale } from '@/lib/types';

interface SeedDataButtonProps {
  locale: Locale;
}

const translations = {
  en: {
    seedButtonText: "Seed Barbers Data",
    seedingInProgress: "Seeding data...",
    seedingSuccessTitle: "Data Seeding",
    seedingErrorTitle: "Seeding Error",
  },
  ar: {
    seedButtonText: "إضافة بيانات الحلاقين الأولية",
    seedingInProgress: "جاري إضافة البيانات...",
    seedingSuccessTitle: "إضافة البيانات",
    seedingErrorTitle: "خطأ في إضافة البيانات",
  }
};

export function SeedDataButton({ locale }: SeedDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = translations[locale];

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const message = await seedBarbersData();
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
      console.error("Error seeding data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6 p-4 border border-dashed border-primary rounded-md bg-secondary/30 text-center">
      <p className="mb-3 text-sm text-muted-foreground">
        {locale === 'ar' 
          ? "إذا كانت قائمة الحلاقين فارغة أو لا تظهر بيانات من قاعدة البيانات، قد تحتاج إلى إضافة البيانات الأولية." 
          : "If the barbers list is empty or not showing data from the database, you might need to seed initial data."}
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
        {locale === 'ar' 
          ? "ملاحظة: هذا الزر مخصص للاستخدام في بيئة التطوير فقط. سيضيف بيانات تجريبية إذا لم تكن موجودة."
          : "Note: This button is for development purposes only. It will add sample data if none exists."}
      </p>
    </div>
  );
}
