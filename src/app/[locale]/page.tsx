
import type { Locale } from '@/lib/types';

interface HomePageProps {
  params: { locale: Locale };
}

// Temporary simplified page for debugging
export default async function HomePage({ params }: HomePageProps) {
  const currentLocale = params.locale;

  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4" style={{ color: 'white' }}>مرحباً بك في الصفحة الرئيسية! (اختبار)</h1>
      <p className="text-xl text-foreground" style={{ color: 'lightgray' }}>اللغة الحالية: {currentLocale}</p>
      <p className="text-lg text-muted-foreground mt-4" style={{ color: 'gray' }}>
        إذا رأيت هذه الرسالة، فهذا يعني أن الهيكل الأساسي للصفحة يعمل.
        المشكلة الأصلية كانت في محتوى الصفحة المعقد أو في جلب البيانات.
      </p>
    </div>
  );
}
