
import { BarberCard } from '@/components/BarberCard';
import { getMockBarbers } from '@/lib/mockData'; 
import { fetchBarbersFromFirestore } from '@/lib/firebase'; 
import type { Locale, Barber } from '@/lib/types';
import { Users, AlertTriangle } from 'lucide-react';
// SeedDataButton import removed

interface BarbersPageProps {
  params: { locale: Locale };
}

const translations = {
  en: {
    title: "Our Esteemed Barbers",
    description: "Meet the artisans who will craft your perfect look. Each barber brings a unique blend of skill, experience, and passion for the art of grooming.",
    fetchErrorTitle: "Failed to Load Barbers",
    fetchErrorDescription: "We couldn't fetch the list of barbers from the database at the moment. Displaying available mock data. Please check your internet connection or try again later.",
    noBarbersFound: "No barbers found at this time.",
    firestoreNote: "Displaying barbers from Firestore. If this list is empty or incorrect, ensure data is seeded and security rules are configured.",
    mockDataNote: "Displaying mock barbers data as a fallback. Please check Firestore connection or seed data if needed."
  },
  ar: {
    title: "حلاقونا الموقرون",
    description: "تعرف على الفنانين الذين سيصنعون مظهرك المثالي. كل حلاق يجلب مزيجًا فريدًا من المهارة والخبرة والشغف بفن العناية.",
    fetchErrorTitle: "فشل في تحميل قائمة الحلاقين",
    fetchErrorDescription: "لم نتمكن من جلب قائمة الحلاقين من قاعدة البيانات في الوقت الحالي. يتم عرض البيانات الوهمية المتاحة. يرجى التحقق من اتصالك بالإنترنت أو المحاولة مرة أخرى لاحقًا.",
    noBarbersFound: "لم يتم العثور على حلاقين في الوقت الحالي.",
    firestoreNote: "يتم عرض الحلاقين من Firestore. إذا كانت هذه القائمة فارغة أو غير صحيحة، تأكد من إضافة البيانات الأولية وضبط قواعد الأمان.",
    mockDataNote: "يتم عرض بيانات الحلاقين الوهمية كبديل. يرجى التحقق من اتصال Firestore أو إضافة البيانات الأولية إذا لزم الأمر."
  },
};

export default async function BarbersPage({ params }: BarbersPageProps) {
  await Promise.resolve(); // Ensure an async tick before accessing params
  const localeParam = params.locale; // Read locale from params early
  
  let barbers: Barber[] = [];
  let fetchError = false;
  let usingFirestoreData = false;
  let currentLocaleForTranslations = localeParam; // Use for translations initially
  let t = translations[currentLocaleForTranslations] || translations.en;

  try {
    // Main async data fetching using localeParam
    const firestoreBarbers = await fetchBarbersFromFirestore(localeParam);
    
    // Update currentLocaleForTranslations and t after await if needed (though localeParam should be stable)
    currentLocaleForTranslations = localeParam;
    t = translations[currentLocaleForTranslations] || translations.en;

    if (firestoreBarbers.length > 0) {
      barbers = firestoreBarbers;
      usingFirestoreData = true;
    } else {
      barbers = getMockBarbers(currentLocaleForTranslations);
    }
  } catch (error) {
    currentLocaleForTranslations = localeParam; // Ensure locale is set for error messages
    t = translations[currentLocaleForTranslations] || translations.en;
    fetchError = true;
    barbers = getMockBarbers(currentLocaleForTranslations); 
  }
  
  // Final locale for rendering (should be same as localeParam)
  const currentLocale = localeParam;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <Users className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.description}
        </p>
      </div>

      {/* SeedDataButton component usage removed */}

      {fetchError && (
        <div className="mb-8 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 me-2" />
            <h3 className="font-semibold">{t.fetchErrorTitle}</h3>
          </div>
          <p className="text-sm">{t.fetchErrorDescription}</p>
        </div>
      )}

      {!fetchError && (
        <div className="mb-4 p-3 border rounded-md bg-secondary/20 text-sm text-muted-foreground">
          {usingFirestoreData ? t.firestoreNote : t.mockDataNote}
        </div>
      )}

      {barbers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} locale={currentLocale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">{t.noBarbersFound}</p>
        </div>
      )}
    </div>
  );
}
