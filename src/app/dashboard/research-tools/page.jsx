'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/useLocale';
import {
  Sparkles,
  Compass,
  BookOpen,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  GraduationCap,
  Percent,
  RefreshCw,
  Send,
  Building2,
  AlertCircle,
  HelpCircle,
  Globe,
  FileCheck,
  Bookmark,
} from 'lucide-react';

const TOOLS_DICT = {
  uz: {
    badge: 'Smart Tadqiqot Muhiti • TIU Scholars',
    title: 'Smart Ilmiy Tadqiqot Asboblari',
    subtitle:
      'OAK dissertatsiya mezonlari nazorati, CrossRef DOI avtotortish, xavfsiz jurnallar tavsiyasi va IMRAD konstruktori orqali ilmiy ishingizni tez va professional yakunlang.',
    writeImrad: 'IMRAD Qo‘lyozma Yozish',
    tab1: '1. OAK Dissertatsiya Kompasi',
    tab2: '2. Smart DOI & BibTeX Markazi',
    tab3: '3. Jurnal Tanlash & Xavfsizlik',
    tab4: '4. IMRAD Qo‘lyozma & Eksport',
  },
  ru: {
    badge: 'Умная научная среда • TIU Scholars',
    title: 'Умные инструменты исследователя',
    subtitle:
      'Контроль критериев ВАК для диссертации, автозагрузка CrossRef DOI, рекомендации проверенных журналов и конструктор IMRAD для быстрой и качественной подготовки научных работ.',
    writeImrad: 'Написать рукопись IMRAD',
    tab1: '1. Компас диссертации ВАК',
    tab2: '2. Центр Smart DOI и BibTeX',
    tab3: '3. Выбор и проверка журнала',
    tab4: '4. Рукопись IMRAD и экспорт',
  },
  en: {
    badge: 'Smart Research Workspace • TIU Scholars',
    title: 'Smart Research Tools',
    subtitle:
      'Track dissertation publication criteria, auto-fetch CrossRef DOI metadata, verify safe peer-reviewed journals, and draft structured IMRAD manuscripts effortlessly.',
    writeImrad: 'Draft IMRAD Manuscript',
    tab1: '1. OAK Dissertation Compass',
    tab2: '2. Smart DOI & BibTeX Hub',
    tab3: '3. Journal Finder & Safety',
    tab4: '4. IMRAD Builder & Export',
  },
};

export default function SmartResearchToolsPage() {
  const locale = useLocale('uz');
  const tx = TOOLS_DICT[locale] || TOOLS_DICT.uz;
  const [activeTab, setActiveTab] = useState('OAK_RADAR'); // 'OAK_RADAR' | 'BIBLIO' | 'JOURNAL_FINDER' | 'IMRAD'

  // ========================================================
  // 1. OAK RADAR STATE
  // ========================================================
  const [radarDegree, setRadarDegree] = useState('PHD');
  const [radarLoading, setRadarLoading] = useState(true);
  const [radarData, setRadarData] = useState(null);

  const loadOakRadar = async (degree = 'PHD') => {
    try {
      setRadarLoading(true);
      const res = await fetch(`/api/research-tools/oak-radar?degree=${degree}`);
      const data = await res.json();
      if (data.success) {
        setRadarData(data);
      }
    } catch (err) {
      console.error('Failed to load OAK radar:', err);
    } finally {
      setRadarLoading(false);
    }
  };

  useEffect(() => {
    loadOakRadar(radarDegree);
  }, [radarDegree]);

  // ========================================================
  // 2. SMART DOI & BIBTEX RESOLVER STATE
  // ========================================================
  const [doiBatchText, setDoiBatchText] = useState(
    '10.1016/j.jbusres.2023.113840\n10.1109/TLT.2021.3129884'
  );
  const [doiResolving, setDoiResolving] = useState(false);
  const [doiItems, setDoiItems] = useState([]);
  const [doiCombinedBibtex, setDoiCombinedBibtex] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('apa'); // 'apa' | 'ieee' | 'gost' | 'bibtex'
  const [copiedKey, setCopiedKey] = useState(null);
  const [doiBatchError, setDoiBatchError] = useState('');

  const handleResolveBatchDoi = async () => {
    if (!doiBatchText.trim()) return;
    try {
      setDoiResolving(true);
      setDoiBatchError('');
      const res = await fetch('/api/research-tools/doi-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: doiBatchText }),
      });
      const data = await res.json();
      if (data.success) {
        setDoiItems(data.items || []);
        setDoiCombinedBibtex(data.combinedBibtex || '');
      } else {
        setDoiBatchError(data.error || 'DOI topilmadi');
      }
    } catch {
      setDoiBatchError('Tarmoq xatosi');
    } finally {
      setDoiResolving(false);
    }
  };

  const handleDownloadBibtex = () => {
    if (!doiCombinedBibtex) return;
    const blob = new Blob([doiCombinedBibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiu-citations.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ========================================================
  // 3. JOURNAL MATCHER & ANTI-PREDATORY STATE
  // ========================================================
  const [journalTitle, setJournalTitle] = useState('');
  const [journalAbstract, setJournalAbstract] = useState('');
  const [journalField, setJournalField] = useState('ALL');
  const [journalTargetType, setJournalTargetType] = useState('ALL');
  const [issnLookup, setIssnLookup] = useState('');
  const [journalMatching, setJournalMatching] = useState(false);
  const [matchedJournals, setMatchedJournals] = useState([]);
  const [singleLookupResult, setSingleLookupResult] = useState(null);

  const handleMatchJournals = async (e) => {
    e?.preventDefault();
    try {
      setJournalMatching(true);
      setSingleLookupResult(null);
      const res = await fetch('/api/research-tools/journal-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: journalTitle,
          abstract: journalAbstract,
          field: journalField,
          targetType: journalTargetType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMatchedJournals(data.data || []);
      }
    } catch {
      console.error('Journal match error');
    } finally {
      setJournalMatching(false);
    }
  };

  const handleCheckIssn = async () => {
    if (!issnLookup.trim()) return;
    try {
      setJournalMatching(true);
      const res = await fetch('/api/research-tools/journal-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIssn: issnLookup.trim() }),
      });
      const data = await res.json();
      if (data.success && data.mode === 'LOOKUP') {
        setSingleLookupResult(data.journal);
      }
    } catch {
      console.error('ISSN lookup error');
    } finally {
      setJournalMatching(false);
    }
  };

  useEffect(() => {
    // Initial fetch of popular journals
    handleMatchJournals();
  }, []);

  // ========================================================
  // 4. IMRAD BUILDER STATE
  // ========================================================
  const [imradTitle, setImradTitle] = useState('Oliy Ta’limda Sun’iy Intellekt Vositalarining Pedagogik Samaradorligi');
  const [imradAbstract, setImradAbstract] = useState(
    'Ushbu maqolada oliy ta’lim muassasalarida sun’iy intellekt texnologiyalaridan foydalanishning pedagogik mezonlari va empirik tahlili yoritilgan.'
  );
  const [imradKeywords, setImradKeywords] = useState('sun’iy intellekt, oliy ta’lim, raqamli pedagogika, TIU');
  const [imradIntro, setImradIntro] = useState(
    'Bugungi kunda jahon ta’lim maydonida talabalarning mustaqil bilim olish faolligini oshirish dolzarb hisoblanadi...'
  );
  const [imradMethods, setImradMethods] = useState(
    'Tadqiqotda 320 nafar talaba o‘rtasida so‘rovnoma hamda qiyosiy statistik tahlil metodlari qo‘llanildi.'
  );
  const [imradResults, setImradResults] = useState(
    'Olingan natijalar adaptiv o‘rganish algoritmlaridan foydalangan guruhda o‘zlashtirish ko‘rsatkichi 24.3% ga oshganligini ko‘rsatdi.'
  );
  const [imradConclusion, setImradConclusion] = useState(
    'Olingan ilmiy xulosalar oliy ta’lim o‘quv rejalariga zamonaviy raqamli texnologiyalarni integratsiya qilishga xizmat qiladi.'
  );

  const abstractWordCount = imradAbstract.trim() ? imradAbstract.trim().split(/\s+/).length : 0;

  const handleDownloadWordDoc = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${imradTitle}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.5; padding: 40px; }
          h1 { text-align: center; font-size: 16pt; margin-bottom: 20px; text-transform: uppercase; }
          h2 { font-size: 13pt; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          p { font-size: 12pt; text-align: justify; text-indent: 1.25cm; margin-bottom: 10px; }
          .abstract { font-style: italic; background: #f9f9f9; padding: 15px; border-left: 4px solid #0056b3; }
          .keywords { font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>${imradTitle}</h1>
        
        <div class="abstract">
          <strong>Annotatsiya (Abstract):</strong>
          <p>${imradAbstract}</p>
          <div class="keywords">Kalit so‘zlar: ${imradKeywords}</div>
        </div>

        <h2>1. KIRISH (INTRODUCTION)</h2>
        <p>${imradIntro}</p>

        <h2>2. METODOLOGIYA (METHODS)</h2>
        <p>${imradMethods}</p>

        <h2>3. NATIJALAR VA TAHLIL (RESULTS & DISCUSSION)</h2>
        <p>${imradResults}</p>

        <h2>4. XULOSA VA TAVSIYALAR (CONCLUSION)</h2>
        <p>${imradConclusion}</p>

        <h2>ADABIYOTLAR RO‘YXATI (REFERENCES)</h2>
        <p>[1] UNESCO. (2023). AI and Education: Guidance for policy-makers. Paris: UNESCO.</p>
        <p>[2] Williamson, B. (2024). Digital education governance. Learning, Media and Technology, 49(1), 1-15.</p>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${imradTitle.slice(0, 30).replace(/\s+/g, '_')}_IMRAD.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Banner */}
      <div className="neu-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-200/70 dark:border-sky-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{tx.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {tx.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {tx.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('IMRAD')}
              className="glass-btn-primary px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>{tx.writeImrad}</span>
            </button>
          </div>
        </div>

        {/* 4 Main Module Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('OAK_RADAR')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'OAK_RADAR'
                ? 'glass-btn-primary shadow-md'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeTab === 'OAK_RADAR' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span>{tx.tab1}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BIBLIO')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'BIBLIO'
                ? 'glass-btn-primary shadow-md'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'BIBLIO' ? 'text-white' : 'text-amber-500'}`} />
            <span>{tx.tab2}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('JOURNAL_FINDER')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'JOURNAL_FINDER'
                ? 'glass-btn-primary shadow-md'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <Search className={`w-4 h-4 ${activeTab === 'JOURNAL_FINDER' ? 'text-white' : 'text-blue-500'}`} />
            <span>{tx.tab3}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IMRAD')}
            className={`px-4 py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'IMRAD'
                ? 'glass-btn-primary shadow-md'
                : 'glass-btn text-slate-700 dark:text-slate-200'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'IMRAD' ? 'text-white' : 'text-purple-500'}`} />
            <span>{tx.tab4}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODULE 1: OAK DISSERTATSIYA KOMPASI (READINESS RADAR) */}
      {/* ======================================================== */}
      {activeTab === 'OAK_RADAR' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span>OAK Dissertatsiya Tayyorgarlik Radari</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  O‘zbekiston Respublikasi OAK mezonlari bo‘yicha maqolalar va nashrlar yetarliligini avtomatik diagnostika qilish.
                </p>
              </div>

              {/* PhD / DSc Degree Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRadarDegree('PHD')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    radarDegree === 'PHD'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  PhD (Falsafa Doktori)
                </button>
                <button
                  type="button"
                  onClick={() => setRadarDegree('DSC')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    radarDegree === 'DSC'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  DSc (Fan Doktori)
                </button>
              </div>
            </div>

            {radarLoading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>OAK ko‘rsatkichlari hisoblanmoqda...</span>
              </div>
            ) : radarData ? (
              <div className="space-y-6">
                {/* Big Score Progress Banner */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100">
                  <div className="md:col-span-4 flex items-center justify-center">
                    <div className="relative w-36 h-36 rounded-full bg-white shadow-md border-4 border-emerald-500 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-3xl font-black text-emerald-700">
                        {radarData.readinessScore}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        OAK Tayyorgarlik
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-2 text-xs">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{radarData.title}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {radarData.isFullyReady
                        ? 'Tabriklaymiz! OAK nashr talablari to‘liq bajarilgan va himoyaga ruxsat etiladi ✅'
                        : 'Dissertatsiya himoyasiga chiqish uchun ayrim nashrlar yetishmayapti'}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      Ushbu ko‘rsatkich sizning tasdiqlangan OAK maqolalaringiz, xalqaro Scopus indeksatsiyasi va anjuman tezislaringizning OAK Nizomi talablariga muvofiqligi asosida real vaqt rejimida hisoblab chiqildi.
                    </p>
                  </div>
                </div>

                {/* 4 Cards Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {radarData.checklist?.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.completed
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Ulushi: {item.weight}
                        </span>
                        {item.completed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Bajarildi</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Yetarli emas</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-900 mb-2">{item.label}</div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-2xl font-black text-slate-900">
                          {item.current} <span className="text-xs text-slate-400 font-normal">/ {item.required} {item.unit}</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          {Math.min(100, Math.round((item.current / (item.required || 1)) * 100))}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deficit / Recommendations */}
                {radarData.deficits?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                    <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>OAK Talabini Bajarish Uchun Nimalar Zarur?</span>
                    </h5>
                    <ul className="space-y-1 text-amber-800 pl-5 list-disc">
                      {radarData.deficits.map((def, idx) => (
                        <li key={idx} className="font-medium">
                          {def}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 2: SMART DOI & BIBTEX BIBLIOGRAFIYA MARKAZI */}
      {/* ======================================================== */}
      {activeTab === 'BIBLIO' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Smart DOI & BibTeX Bibliografiya Generatori</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  CrossRef API orqali bir vaqtning o‘zida o‘nlab DOI raqamlarini tortib, rasmiy APA 7, IEEE, GOST yoki BibTeX formatiga o‘giring.
                </p>
              </div>

              {doiItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadBibtex}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>BibTeX (.bib) Yuklab Olish</span>
                </button>
              )}
            </div>

            {/* Input Textarea */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">
                DOI Raqamlarini Kiriting (Har bir qatorda bittadan):
              </label>
              <textarea
                rows={4}
                value={doiBatchText}
                onChange={(e) => setDoiBatchText(e.target.value)}
                placeholder="10.1016/j.jbusres.2023.113840&#10;10.1109/TLT.2021.3129884"
                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Bir vaqtning o‘zida 15 tagacha DOI qabul qilinadi.
                </span>
                <button
                  type="button"
                  onClick={handleResolveBatchDoi}
                  disabled={doiResolving || !doiBatchText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {doiResolving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{doiResolving ? 'Avtotortilmoqda...' : 'Barchasini Avtotortish ⚡'}</span>
                </button>
              </div>

              {doiBatchError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{doiBatchError}</span>
                </div>
              )}
            </div>

            {/* Formatted Output */}
            {doiItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Avtotortilgan Adabiyotlar ({doiItems.length} ta):
                  </span>

                  {/* Format Selector */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                    {['apa', 'ieee', 'gost', 'bibtex'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-2.5 py-1 rounded-lg uppercase text-[10px] transition cursor-pointer ${
                          selectedFormat === fmt
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {doiItems.map((item, idx) => {
                    const citation = item.citations[selectedFormat];
                    const isBib = selectedFormat === 'bibtex';

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <span className="font-mono text-[10px] font-bold text-amber-700 block">
                            [{idx + 1}] • {item.doi}
                          </span>
                          {isBib ? (
                            <pre className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                              {citation}
                            </pre>
                          ) : (
                            <p
                              className="text-slate-800 text-[11px] leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: citation }}
                            />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(citation, `cit-${idx}`)}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
                          title="Nusxalash"
                        >
                          {copiedKey === `cit-${idx}` ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 3: JOURNAL MATCHER & ANTI-PREDATORY CHECK */}
      {/* ======================================================== */}
      {activeTab === 'JOURNAL_FINDER' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span>Jurnal Tanlash Radari & Anti-Predatory Nazorati</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Maqolangiz mazmuniga mos Scopus (Q1-Q4) va OAK jurnallarini toping hamda yirtqich (predatory) soxta jurnallardan himoyalaning.
              </p>
            </div>

            {/* ISSN Fast Verify Bar */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
              <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Tezkor Jurnal yoki ISSN Tekshiruvi (Soxta Jurnal Aniqlash):</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Jurnal nomi yoki ISSN kiriting (masalan: 0360-1315 yoki Computers & Education)"
                  value={issnLookup}
                  onChange={(e) => setIssnLookup(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCheckIssn}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Tekshirish
                </button>
              </div>

              {singleLookupResult && (
                <div
                  className={`mt-2 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    singleLookupResult.isSafe
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {singleLookupResult.isSafe ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-sm">{singleLookupResult.name}</span>
                    <p className="mt-0.5 text-[11px]">
                      {singleLookupResult.isSafe
                        ? `Rasman tasdiqlangan jurnal (${singleLookupResult.index} ${singleLookupResult.quartile || ''}) • Nashriyot: ${singleLookupResult.publisher}`
                        : singleLookupResult.warningReason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Search Form */}
            <form onSubmit={handleMatchJournals} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maqola Mavzusi:</label>
                  <input
                    type="text"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="Masalan: Raqamli iqtisodiyotda kichik biznes boshqaruvi"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fan Sohasi:</label>
                    <select
                      value={journalField}
                      onChange={(e) => setJournalField(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    >
                      <option value="ALL">Barcha sohalar</option>
                      <option value="ECONOMICS">Iqtisodiyot & Biznes</option>
                      <option value="EDUCATION">Pedagogika & Ta’lim</option>
                      <option value="COMPUTER_SCIENCE">Axborot Texnologiyalari</option>
                      <option value="LAW">Yurisprudensiya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jurnal Turi:</label>
                    <select
                      value={journalTargetType}
                      onChange={(e) => setJournalTargetType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    >
                      <option value="ALL">Scopus & OAK</option>
                      <option value="SCOPUS">Faqat Scopus (Q1-Q4)</option>
                      <option value="OAK">Faqat OAK (O‘zbekiston)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Annotatsiya (Abstract):</label>
                <textarea
                  rows={2}
                  value={journalAbstract}
                  onChange={(e) => setJournalAbstract(e.target.value)}
                  placeholder="Maqola annotatsiyasi yoki kalit so‘zlari..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={journalMatching}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{journalMatching ? 'Qidirilmoqda...' : 'Jurnallarni Solishtirish'}</span>
                </button>
              </div>
            </form>

            {/* Results Grid */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-800">
                Tavsiya Etilgan Jurnallar Ro‘yxati ({matchedJournals.length} ta):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedJournals.map((j) => (
                  <div
                    key={j.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      !j.isSafe
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-white border-slate-200/90 shadow-xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                              j.quartile === 'Q1'
                                ? 'bg-emerald-100 text-emerald-800'
                                : j.quartile === 'Q2'
                                ? 'bg-blue-100 text-blue-800'
                                : j.index === 'OAK'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {j.quartile || j.index}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ISSN: {j.issn}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">{j.name}</h4>
                        <span className="text-[11px] text-slate-500">{j.publisher}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-blue-600 block">
                          {j.matchScore}% mos
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            j.isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {j.isSafe ? 'Tasdiqlangan ✅' : 'Xavfli ⚠️'}
                        </span>
                      </div>
                    </div>

                    {!j.isSafe && (
                      <p className="text-[11px] text-rose-700 bg-white/70 p-2 rounded-xl border border-rose-200">
                        {j.warningReason}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Taqriz vaqti:</span>
                        <span className="font-bold">{j.avgReviewWeeks} hafta</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Qabul darajasi:</span>
                        <span className="font-bold">{j.acceptanceRate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">To‘lov (APC):</span>
                        <span className="font-bold truncate block">{j.apc}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <a
                        href={j.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Jurnal Saytiga O‘tish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 4: IMRAD ILMIY QO‘LYOZMA KONSTRUKTORI & EKSPORT */}
      {/* ======================================================== */}
      {activeTab === 'IMRAD' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>IMRAD Xalqaro Ilmiy Qo‘lyozma Konstruktori</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xalqaro standartdagi IMRAD (Introduction, Methods, Results, Discussion) bo‘limlarini to‘ldiring va 1-klikda Word (.doc) qolipida yuklab oling.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadWordDoc}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Word (.doc) Qolipida Yuklab Olish 📥</span>
              </button>
            </div>

            {/* Article Builder Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Maqola Sarlavhasi (Title):</label>
                <input
                  type="text"
                  value={imradTitle}
                  onChange={(e) => setImradTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Annotatsiya (Abstract):</label>
                  <span
                    className={`text-[10px] font-bold ${
                      abstractWordCount > 250 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {abstractWordCount} / 250 ta so‘z
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={imradAbstract}
                  onChange={(e) => setImradAbstract(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kalit So‘zlar (Keywords):</label>
                <input
                  type="text"
                  value={imradKeywords}
                  onChange={(e) => setImradKeywords(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Kirish (Introduction) & Muammoning Qo‘yilishi:
                  </label>
                  <textarea
                    rows={6}
                    value={imradIntro}
                    onChange={(e) => setImradIntro(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Metodologiya (Methods) & Eksperimental Baza:
                  </label>
                  <textarea
                    rows={6}
                    value={imradMethods}
                    onChange={(e) => setImradMethods(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Natijalar va Tahlil (Results & Discussion):
                  </label>
                  <textarea
                    rows={6}
                    value={imradResults}
                    onChange={(e) => setImradResults(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Xulosa va Tavsiyalar (Conclusion):
                  </label>
                  <textarea
                    rows={6}
                    value={imradConclusion}
                    onChange={(e) => setImradConclusion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Tugmani bosishingiz bilan barcha IMRAD bo‘limlari rasmiy ilmiy andozadagi Word fayliga o‘giriladi.
                </span>

                <button
                  type="button"
                  onClick={handleDownloadWordDoc}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Word Faylini Yuklash (.doc)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
