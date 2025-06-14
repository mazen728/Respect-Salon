import Link from 'next/link';
import { salonInfo } from '@/lib/mockData';
import { Phone, Mail, MessageSquare } from 'lucide-react';

export function PageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-xl font-headline font-semibold mb-4">{salonInfo.name}</h3>
          <p className="text-sm">{salonInfo.address}</p>
          <p className="text-sm mt-2">{salonInfo.workingHours}</p>
        </div>
        <div>
          <h3 className="text-xl font-headline font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
            <li><Link href="/appointments" className="hover:text-primary transition-colors">My Appointments</Link></li>
            <li><Link href="/profile" className="hover:text-primary transition-colors">Profile</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-headline font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-center md:justify-start">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${salonInfo.phone}`} className="hover:text-primary transition-colors">{salonInfo.phone}</a>
            </li>
            <li className="flex items-center justify-center md:justify-start">
              <Mail className="h-4 w-4 mr-2" />
              <a href={`mailto:${salonInfo.email}`} className="hover:text-primary transition-colors">{salonInfo.email}</a>
            </li>
            <li className="flex items-center justify-center md:justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              <a href={salonInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Us</a>
            </li>
          </ul>
          <div className="flex space-x-4 mt-4 justify-center md:justify-start">
            {salonInfo.socialMedia.map(social => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="hover:text-primary transition-colors">
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center text-sm mt-10 pt-8 border-t border-border/40">
        <p>&copy; {currentYear} {salonInfo.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
