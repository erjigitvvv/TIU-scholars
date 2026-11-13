export default function Footer({ dict }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                TIU
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {dict.brand}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {dict.tagline}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/scholars" className="hover:text-white transition-colors">{dict.nav.scholars}</a></li>
              <li><a href="/publications" className="hover:text-white transition-colors">{dict.nav.publications}</a></li>
              <li><a href="/rankings" className="hover:text-white transition-colors">{dict.nav.rankings}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Contact
            </h4>
            <p className="text-sm text-slate-400">
              Tashkent International University<br />
              Bakkhor Street, Tashkent, Uzbekistan<br />
              Email: info@tiu.uz
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tashkent International University. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Scientific Potential & Scholars Portal</p>
        </div>
      </div>
    </footer>
  );
}
