
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, UserCircle, Home, ListChecks, Users, CalendarDays, UserPlus } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Locale } from '@/lib/types'; 

interface NavItem {
  href: string;
  label: { en: string; ar: string };
  icon?: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: { en: 'Home', ar: 'الرئيسية' }, icon: Home },
  { href: '/services', label: { en: 'Services', ar: 'الخدمات' }, icon: ListChecks },
  { href: '/barbers', label: { en: 'Barbers', ar: 'الحلاقون' }, icon: Users },
  { href: '/appointments', label: { en: 'My Appointments', ar: 'مواعيدي' }, icon: CalendarDays },
  { href: '/profile', label: { en: 'Profile', ar: 'الملف الشخصي' }, icon: UserCircle },
  { href: '/auth', label: { en: 'Login / Register', ar: 'تسجيل / حساب' }, icon: UserCircle },
];

interface PageHeaderProps {
  locale: Locale;
}

export function PageHeader({ locale }: PageHeaderProps) {
  const t = (label: { en: string; ar: string }) => label[locale as keyof typeof label] || label.en;
  const salonName = locale === 'ar' ? 'صالون رسبيكت' : 'Respect Salon';
  const toggleSrText = locale === 'ar' ? 'تبديل قائمة التنقل' : 'Toggle navigation menu';
  const sheetTitleText = locale === 'ar' ? 'القائمة' : 'Menu';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-6 flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Image
            src="https://i.postimg.cc/tgyg008Z/FB-IMG-1749942810921.jpg"
            alt={locale === 'ar' ? 'شعار صالون رسبيكت' : 'Respect Salon Logo'}
            width={32}
            height={32}
            className="object-contain"
            data-ai-hint="salon logo icon"
          />
          <span className="font-headline text-2xl font-bold">{salonName}</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label.en}
                href={`/${locale}${item.href === '/' ? '' : item.href}`}
                className="transition-colors hover:text-primary flex items-center gap-1"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
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
                <SheetHeader className="border-b pb-3 mb-3 text-start">
                  <SheetTitle className="font-headline text-xl">{sheetTitleText}</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-4 text-lg font-medium">
                  <SheetClose asChild>
                    <Link href={`/${locale}`} className="flex items-center gap-2 text-primary mb-2">
                       <Image
                        src="https://i.postimg.cc/tgyg008Z/FB-IMG-1749942810921.jpg"
                        alt={locale === 'ar' ? 'شعار صالون رسبيكت' : 'Respect Salon Logo'}
                        width={24}
                        height={24}
                        className="object-contain"
                        data-ai-hint="salon logo icon"
                      />
                      <span className="font-headline text-lg font-bold">{salonName}</span>
                    </Link>
                  </SheetClose>
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.label.en}>
                      <Link
                        href={`/${locale}${item.href === '/' ? '' : item.href}`}
                        className="transition-colors hover:text-primary py-2 flex items-center gap-2"
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {t(item.label)}
                      </Link>
                    </SheetClose>
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
