import Link from 'next/link';
import { MapPin, Mail, Phone, Globe, BookOpen, Users, Award, ShieldCheck } from 'lucide-react';

export default function Footer({ dict }) {
  return (
    <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-4">
            <div className="inline-flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl shadow-sm">
              <img
                src="/tiu-logo.png"
                alt="Tashkent International University"
                className="h-9 w-auto object-contain"
              />
              <div className="border-l border-slate-200 pl-3">
                <span className="text-sm font-bold text-slate-900 tracking-tight block leading-none">
                  {dict.brand}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Scholars Portal
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
              Portal
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
              Ilmiy Kategoriyalar
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/publications?type=SCOPUS" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Scopus & Web of Science
                </Link>
              </li>
              <li>
                <Link href="/publications?type=OAK" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  OAK Jurnallar
                </Link>
              </li>
              <li>
                <Link href="/publications?type=MONOGRAPH" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Monografiya & Darsliklar
                </Link>
              </li>
              <li>
                <Link href="/publications?type=PATENT" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Patentlar & Guvohnomalar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact with Icons */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Bog&apos;lanish
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Toshkent sh., Yunusobod tumani, TIU Kampusi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+998712000000" className="hover:text-white transition-colors">
                  +998 (71) 200-00-00
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:science@tiu.uz" className="hover:text-white transition-colors">
                  science@tiu.uz
                </a>
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
          <p>© {new Date().getFullYear()} Tashkent International University. Barcha huquqlar himoyalangan.</p>
          <p className="mt-2 sm:mt-0">TIU Scholars — Ilmiy Salohiyat Portali</p>
        </div>
      </div>
    </footer>
  );
}
