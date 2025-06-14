
import Link from 'next/link';
import { salonInfo as getSalonInfo } from '@/lib/mockData'; // Renamed to avoid conflict
import { Phone, MessageSquare } from 'lucide-react';
import type { Locale } from '@/lib/types';

interface PageFooterProps {
  locale: Locale;
}

export function PageFooter({ locale }: PageFooterProps) {
  const currentYear = new Date().getFullYear();
  const salonInfo = getSalonInfo(locale); // Get locale-specific salon info

  const t = (key: keyof typeof salonInfo.translations) => salonInfo.translations[key];

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-start">
        <div>
          <h3 className="text-xl font-headline font-semibold mb-4">{salonInfo.name}</h3>
          <p className="text-sm">{salonInfo.address}</p>
          <p className="text-sm mt-2">{salonInfo.workingHours}</p>
        </div>
        <div>
          <h3 className="text-xl font-headline font-semibold mb-4">{t('contactUs')}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="h-4 w-4" />
              <a href={`tel:${salonInfo.phone}`} className="hover:text-primary transition-colors">{salonInfo.phone}</a>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              <a href={salonInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t('whatsappUs')}</a>
            </li>
          </ul>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
            {salonInfo.socialMedia.map(social => (
              <a key={social.name.en} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name[locale as 'en' | 'ar'] || social.name.en} className="hover:text-primary transition-colors">
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center text-sm mt-10 pt-8 border-t border-border/40">
        <p>&copy; {currentYear} {salonInfo.name}. {t('allRightsReserved')}</p>
      </div>
    </footer>
  );
}
