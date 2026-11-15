import Link from 'next/link';
import { MapPin, Mail, Phone, Globe, Clock, BookOpen, Users, Award, ShieldCheck } from 'lucide-react';

const FOOTER_LABELS = {
  uz: {
    portalSubtitle: 'Ilmiy Salohiyat Portali',
    portalHeading: 'Portal',
    categoriesHeading: 'Ilmiy Kategoriyalar',
    scopusWos: 'Scopus & Web of Science',
    oakJournals: 'OAK Jurnallar',
    monographs: 'Monografiya & Darsliklar',
    patents: 'Patentlar & Guvohnomalar',
    contactHeading: "Bog'lanish",
    address: "Toshkent, Kichik Halqa yo'li 7",
    hours: 'Du-Ju: 9:00 - 18:00',
    rights: 'Barcha huquqlar himoyalangan.',
    bottomTagline: 'TIU Scholars — Ilmiy Salohiyat Portali',
  },
  ru: {
    portalSubtitle: 'Портал научного потенциала',
    portalHeading: 'Портал',
    categoriesHeading: 'Научные категории',
    scopusWos: 'Scopus и Web of Science',
    oakJournals: 'Журналы ВАК',
    monographs: 'Монографии и учебники',
    patents: 'Патенты и свидетельства',
    contactHeading: 'Контакты',
    address: 'Ташкент, ул. Малая Кольцевая, 7',
    hours: 'Пн-Пт: 9:00 - 18:00',
    rights: 'Все права защищены.',
    bottomTagline: 'TIU Scholars — Портал научного потенциала',
  },
  en: {
    portalSubtitle: 'Scientific Potential Portal',
    portalHeading: 'Portal',
    categoriesHeading: 'Scientific Categories',
    scopusWos: 'Scopus & Web of Science',
    oakJournals: 'HAC / OAK Journals',
    monographs: 'Monographs & Textbooks',
    patents: 'Patents & Certificates',
    contactHeading: 'Contact',
    address: '7 Kichik Halqa Yuli, Tashkent',
    hours: 'Mon-Fri: 9:00 - 18:00',
    rights: 'All rights reserved.',
    bottomTagline: 'TIU Scholars — Scientific Potential Portal',
  },
};

export default function Footer({ dict, currentLocale = 'uz' }) {
  const f = FOOTER_LABELS[currentLocale] || FOOTER_LABELS.uz;

  return (
    <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-4">
            <div className="inline-flex items-center gap-3.5">
              <img
                src="/tiu-logo-white.png"
                alt="Tashkent International University"
                className="h-10 w-auto object-contain"
              />
              <div className="border-l border-slate-700/80 pl-3.5">
                <span className="text-sm font-bold text-white tracking-tight block leading-none">
                  {dict.brand}
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                  {f.portalSubtitle}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {dict.tagline}
            </p>
          </div>

          {/* Portal Links */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              {f.portalHeading}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/scholars" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {dict.nav.scholars}
                </Link>
              </li>
              <li>
                <Link href="/publications" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  {dict.nav.publications}
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  {dict.nav.rankings}
                </Link>
              </li>
              <li>
                <Link href="/login" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  {dict.nav.login}
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Categories */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              {f.categoriesHeading}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/publications?type=SCOPUS" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {f.scopusWos}
                </Link>
              </li>
              <li>
                <Link href="/publications?type=OAK" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {f.oakJournals}
                </Link>
              </li>
              <li>
                <Link href="/publications?type=MONOGRAPH" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {f.monographs}
                </Link>
              </li>
              <li>
                <Link href="/publications?type=PATENT" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {f.patents}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact with Icons */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              {f.contactHeading}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{f.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+998951315555" className="hover:text-white transition-colors">
                  +998 95 131 55 55
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:info@tiu.uz" className="hover:text-white transition-colors">
                  info@tiu.uz
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{f.hours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="https://tiu.uz" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  https://tiu.uz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tashkent International University. {f.rights}</p>
          <p className="mt-2 sm:mt-0">{f.bottomTagline}</p>
        </div>
      </div>
    </footer>
  );
}
