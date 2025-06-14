import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Scissors } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavItem {
  href: string;
  label: { en: string; ar: string };
}

const navItems: NavItem[] = [
  { href: '/', label: { en: 'Home', ar: 'الرئيسية' } },
  { href: '/services', label: { en: 'Services', ar: 'الخدمات' } },
  { href: '/appointments', label: { en: 'My Appointments', ar: 'مواعيدي' } },
  { href: '/profile', label: { en: 'Profile', ar: 'الملف الشخصي' } },
];

interface PageHeaderProps {
  locale: string;
}

export function PageHeader({ locale }: PageHeaderProps) {
  const t = (label: { en: string; ar: string }) => label[locale as keyof typeof label] || label.en;
  const salonName = locale === 'ar' ? 'صالون رسبيكت' : 'Respect Salon';
  const toggleSrText = locale === 'ar' ? 'تبديل قائمة التنقل' : 'Toggle navigation menu';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-6 flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Scissors className="h-8 w-8" />
          <span className="font-headline text-2xl font-bold">{salonName}</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label.en}
                href={`/${locale}${item.href === '/' ? '' : item.href}`}
                className="transition-colors hover:text-primary"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher currentLocale={locale} />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{toggleSrText}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-[280px] sm:w-[320px]">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <Link href={`/${locale}`} className="flex items-center gap-2 text-primary mb-4">
                    <Scissors className="h-7 w-7" />
                    <span className="font-headline text-xl font-bold">{salonName}</span>
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.label.en}
                      href={`/${locale}${item.href === '/' ? '' : item.href}`}
                      className="transition-colors hover:text-primary py-2"
                    >
                      {t(item.label)}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
