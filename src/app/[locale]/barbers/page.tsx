
import { BarberCard } from '@/components/BarberCard';
import { getMockBarbers } from '@/lib/mockData'; // Renamed to avoid conflict
import { fetchBarbersFromFirestore } from '@/lib/firebase'; // Import the Firestore fetch function
import type { Locale, Barber } from '@/lib/types';
import { Users, AlertTriangle } from 'lucide-react';

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
  },
  ar: {
    title: "حلاقونا الموقرون",
    description: "تعرف على الفنانين الذين سيصنعون مظهرك المثالي. كل حلاق يجلب مزيجًا فريدًا من المهارة والخبرة والشغف بفن العناية.",
    fetchErrorTitle: "فشل في تحميل قائمة الحلاقين",
    fetchErrorDescription: "لم نتمكن من جلب قائمة الحلاقين من قاعدة البيانات في الوقت الحالي. يتم عرض البيانات الوهمية المتاحة. يرجى التحقق من اتصالك بالإنترنت أو المحاولة مرة أخرى لاحقًا.",
    noBarbersFound: "لم يتم العثور على حلاقين في الوقت الحالي.",
  },
};

export default async function BarbersPage({ params }: BarbersPageProps) {
  const t = translations[params.locale] || translations.en;
  let barbers: Barber[] = [];
  let fetchError = false;

  try {
    const firestoreBarbers = await fetchBarbersFromFirestore(params.locale);
    if (firestoreBarbers.length > 0) {
      barbers = firestoreBarbers;
    } else {
      // If Firestore returns empty (e.g., no data seeded or locale specific data missing),
      // fall back to mock data for demonstration purposes.
      console.warn(`No barbers found in Firestore for locale: ${params.locale}. Falling back to mock data.`);
      barbers = getMockBarbers(params.locale);
    }
  } catch (error) {
    console.error("Error fetching barbers from Firestore, falling back to mock data:", error);
    fetchError = true;
    barbers = getMockBarbers(params.locale); // Fallback to mock data on error
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <Users className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.description}
        </p>
      </div>

      {fetchError && (
        <div className="mb-8 p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 me-2" />
            <h3 className="font-semibold">{t.fetchErrorTitle}</h3>
          </div>
          <p className="text-sm">{t.fetchErrorDescription}</p>
        </div>
      )}

      {barbers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} locale={params.locale} />
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
