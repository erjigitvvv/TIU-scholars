'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowRight,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Users,
  X,
  Medal,
} from 'lucide-react';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

const ease = [0.22, 1, 0.36, 1];

// #1–#3 oltin/kumush/bronza, qolganlari kulrang
const RANK_MEDAL_STYLES = [
  'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 dark:from-amber-950/80 dark:to-yellow-900/60 dark:text-amber-300 dark:border-amber-700 shadow-2xs',
  'bg-gradient-to-r from-slate-100 to-slate-200/90 text-slate-700 border-slate-300 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200 dark:border-slate-600 shadow-2xs',
  'bg-gradient-to-r from-orange-100 to-amber-100/80 text-orange-800 border-orange-300 dark:from-orange-950/80 dark:to-amber-950/60 dark:text-orange-300 dark:border-orange-700 shadow-2xs',
];

const DEFAULT_RANK_STYLE =
  'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';

// To'liq unvon matni 3 tilda (Professor / Dotsent)
const TITLE_FULL_LOCALE = {
  uz: {
    PROFESSOR: 'Professor',
    DOCENT: 'Dotsent',
    SENIOR_LECTURER: 'Katta o‘qituvchi',
    ASSISTANT: 'Assistent',
    DEFAULT: 'Tadqiqotchi',
  },
  ru: {
    PROFESSOR: 'Профессор',
    DOCENT: 'Доцент',
    SENIOR_LECTURER: 'Старший преподаватель',
    ASSISTANT: 'Ассистент',
    DEFAULT: 'Исследователь',
  },
  en: {
    PROFESSOR: 'Professor',
    DOCENT: 'Associate Professor',
    SENIOR_LECTURER: 'Senior Lecturer',
    ASSISTANT: 'Assistant',
    DEFAULT: 'Researcher',
  },
};

const INTEREST_TRANSLATIONS = {
  'Makroiqtisodiy tahlil': { uz: 'Makroiqtisodiy tahlil', ru: 'Макроэкономический анализ', en: 'Macroeconomic Analysis' },
  'Korporativ moliya': { uz: 'Korporativ moliya', ru: 'Корпоративные финансы', en: 'Corporate Finance' },
  'Yashil iqtisodiyot': { uz: 'Yashil iqtisodiyot', ru: 'Зеленая экономика', en: 'Green Economy' },
  'FinTech va bank ishi': { uz: 'FinTech va bank ishi', ru: 'FinTech и банковское дело', en: 'FinTech & Banking' },
  'Qiyosiy tilshunoslik': { uz: 'Qiyosiy tilshunoslik', ru: 'Сравнительное языкознание', en: 'Comparative Linguistics' },
  'Akademik ingliz tili': { uz: 'Akademik ingliz tili', ru: 'Академический английский язык', en: 'Academic English (ESP)' },
  Tarjimashunoslik: { uz: 'Tarjimashunoslik', ru: 'Переводоведение', en: 'Translation Studies' },
  'Korpus lingvistikasi': { uz: 'Korpus lingvistikasi', ru: 'Корпусная лингвистика', en: 'Corpus Linguistics' },
  'Sun’iy intellekt': { uz: 'Sun’iy intellekt', ru: 'Искусственный интеллект', en: 'Artificial Intelligence' },
  Kiberxavfsizlik: { uz: 'Kiberxavfsizlik', ru: 'Кибербезопасность', en: 'Cybersecurity' },
  'Ma’lumotlar tahlili': { uz: 'Ma’lumotlar tahlili', ru: 'Анализ данных', en: 'Data Analytics' },
  'Bulutli hisoblash': { uz: 'Bulutli hisoblash', ru: 'Облачные вычисления', en: 'Cloud Computing' },
  'Oliy ta’lim menejmenti': { uz: 'Oliy ta’lim menejmenti', ru: 'Менеджмент высшего образования', en: 'Higher Education Management' },
  'Raqamli pedagogika': { uz: 'Raqamli pedagogika', ru: 'Цифровая педагогика', en: 'Digital Pedagogy' },
  'Ta’lim sifati': { uz: 'Ta’lim sifati', ru: 'Качество образования', en: 'Education Quality Assurance' },
  'Kognitiv psixologiya': { uz: 'Kognitiv psixologiya', ru: 'Когнитивная психология', en: 'Cognitive Psychology' },
  'Xalqaro xususiy huquq': { uz: 'Xalqaro xususiy huquq', ru: 'Международное частное право', en: 'Private International Law' },
  'Konstitutsiyaviy huquq': { uz: 'Konstitutsiyaviy huquq', ru: 'Конституционное право', en: 'Constitutional Law' },
  'Raqamli huquq va arbitraj': { uz: 'Raqamli huquq va arbitraj', ru: 'Цифровое право и арбитраж', en: 'Digital Law & Arbitration' },
  'Fuqarolik huquqi': { uz: 'Fuqarolik huquqi', ru: 'Гражданское право', en: 'Civil Law' },
};

// Daraja rangidagi halqa (Avatar uchun: DSc — oltin, PhD — ko'k)
const DEGREE_RING_STYLES = {
  DSC: 'ring-[3px] ring-amber-400 dark:ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-[0_0_14px_rgba(245,158,11,0.3)]',
  PHD: 'ring-[3px] ring-blue-500 dark:ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-[0_0_14px_rgba(59,130,246,0.25)]',
  NONE: 'ring-2 ring-slate-300 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
};

// Avatar burchagidagi kichik "DSc" / "PhD" belgisi stili
const AVATAR_CORNER_DEGREE_STYLES = {
  DSC: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-white dark:border-slate-900',
  PHD: 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-white dark:border-slate-900',
};

// Kattaroq, rangli daraja badge stili (DSc: oltin / PhD: ko'k)
const DEGREE_BADGE_STYLES = {
  DSC: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400/60 shadow-2xs',
  PHD: 'bg-gradient-to-r from-blue-600 to-sky-500 text-white border-blue-500/60 shadow-2xs',
};

// F.I.Sh. dan unvon qisqartmalarini ("Prof.", "Dr.", "Dots.") olib tashlash
function getPureFullName(rawName = '') {
  return rawName
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent|PhD|DSc)\s+/gi, '')
    .replace(/^(Prof\.|Professor|Dr\.|Dots\.|Dotsent)\s+/gi, '')
    .trim();
}

export default function HomeScholarsAndFaculties({
  locale = 'uz',
  topScholars = [],
  faculties = [],
  labels,
}) {
  const carouselRef = useRef(null);
  const isJumpingRef = useRef(false);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);

  const selectedFaculty = faculties.find((f) => f.id === selectedFacultyId) || null;

  const count = topScholars.length;
  // 3x clonelash orqali chapga va o'ngga uzluksiz (cheksiz) aylanishni ta'minlaymiz
  const loopScholars =
    count > 1 ? [...topScholars, ...topScholars, ...topScholars] : topScholars;

  const getSingleSetWidth = useCallback(() => {
    const el = carouselRef.current;
    if (!el || count <= 1) return 0;
    const firstCard = el.querySelector('[data-scholar-card="true"]');
    const gap = 24; // gap-6 = 24px
    const cardW = firstCard ? firstCard.offsetWidth : 265;
    return count * (cardW + gap);
  }, [count]);

  // Dastlabki holatda o'rtadagi (2-chi) to'plamning 1-olimiga joylashtiramiz
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || count <= 1) return;
    const setWidth = getSingleSetWidth();
    if (setWidth > 0 && el.scrollLeft < setWidth * 0.5) {
      el.scrollLeft = setWidth;
    }
  }, [count, getSingleSetWidth]);

  const handleInfiniteScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el || count <= 1 || isJumpingRef.current) return;
    const setWidth = getSingleSetWidth();
    if (!setWidth) return;

    if (el.scrollLeft >= setWidth * 2) {
      isJumpingRef.current = true;
      el.style.scrollBehavior = 'auto';
      el.scrollLeft -= setWidth;
      if (dragStateRef.current.isDown) {
        dragStateRef.current.scrollLeft -= setWidth;
      }
      el.style.scrollBehavior = '';
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    } else if (el.scrollLeft <= setWidth * 0.15) {
      isJumpingRef.current = true;
      el.style.scrollBehavior = 'auto';
      el.scrollLeft += setWidth;
      if (dragStateRef.current.isDown) {
        dragStateRef.current.scrollLeft += setWidth;
      }
      el.style.scrollBehavior = '';
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    }
  }, [count, getSingleSetWidth]);

  const scrollCarousel = useCallback(
    (dir) => {
      const el = carouselRef.current;
      if (!el) return;
      const firstCard = el.querySelector('[data-scholar-card="true"]');
      const step = (firstCard ? firstCard.offsetWidth : 265) + 24;
      const setWidth = getSingleSetWidth();

      if (count > 1 && setWidth > 0) {
        if (dir === 'right' && el.scrollLeft >= setWidth * 2 - step) {
          el.style.scrollBehavior = 'auto';
          el.scrollLeft -= setWidth;
          el.style.scrollBehavior = '';
        } else if (dir === 'left' && el.scrollLeft <= step) {
          el.style.scrollBehavior = 'auto';
          el.scrollLeft += setWidth;
          el.style.scrollBehavior = '';
        }
      }

      el.scrollBy({
        left: dir === 'left' ? -step : step,
        behavior: 'smooth',
      });
    },
    [count, getSingleSetWidth]
  );

  // Klaviatura (← / →) orqali boshqarish
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollCarousel('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollCarousel('right');
    }
  };

  // Sichqoncha bilan sudrash (Mouse drag) funksiyalari
  const handleMouseDown = (e) => {
    const el = carouselRef.current;
    if (!el || e.button !== 0) return;
    dragStateRef.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: 0,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    const el = carouselRef.current;
    if (!el || !dragStateRef.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragStateRef.current.startX;
    dragStateRef.current.moved = Math.max(dragStateRef.current.moved, Math.abs(walk));
    el.scrollLeft = dragStateRef.current.scrollLeft - walk;
    handleInfiniteScroll();
  };

  const endMouseDrag = () => {
    if (!dragStateRef.current.isDown) return;
    dragStateRef.current.isDown = false;
    setIsDragging(false);
  };

  const handleCardClick = (e) => {
    // Agar foydalanuvchi sichqoncha bilan sudragan bo'lsa, linkka o'tib ketmasin
    if (dragStateRef.current.moved > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="w-full min-h-screen bg-[#F8FAFD] dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800 flex flex-col justify-center overflow-x-clip">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        {/* 1. Yetakchi Olimlar Carousel (Markazda 1160px max-width, 4 ta card) */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease }}
            className="w-full max-w-[1160px] mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-800/30 border border-amber-200/80 dark:border-amber-700/50 flex items-center justify-center shadow-xs shrink-0">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A] dark:text-white tracking-tight">
                  {labels.topScholarsTitle}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-0.5">
                  {labels.topScholarsSubtitle}
                </p>
              </div>
            </div>

            <Link
              href="/scholars"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-[#0F294A] dark:text-slate-100 hover:bg-[#0F294A] hover:text-white dark:hover:bg-blue-600 transition-all shadow-xs self-start sm:self-auto"
            >
              {labels.viewAllScholars}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Markazlashgan 1160px Carousel: Desktopda 4 ta, Planshetda 2-3 ta, Telefonda 1 ta + keyingi kartaning cheti */}
          <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Yetakchi olimlar carouseli (chap va o'ng strelkalar bilan boshqarish mumkin)"
            className="relative group/carousel w-full max-w-[1160px] mx-auto outline-none"
          >
            {/* Chap strelka tugmasi */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => scrollCarousel('left')}
              aria-label="Oldingi olimlar"
              className="hidden sm:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-[#0F294A] dark:text-white hover:bg-[#0F294A] hover:text-white dark:hover:bg-blue-600 items-center justify-center shadow-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* O'ng strelka tugmasi */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => scrollCarousel('right')}
              aria-label="Keyingi olimlar"
              className="hidden sm:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-[#0F294A] dark:text-white hover:bg-[#0F294A] hover:text-white dark:hover:bg-blue-600 items-center justify-center shadow-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {/* Scroll-snap + Mouse Drag Track */}
            <div
              ref={carouselRef}
              onScroll={handleInfiniteScroll}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={endMouseDrag}
              onMouseLeave={endMouseDrag}
              data-carousel="true"
              className={`flex gap-6 overflow-x-auto pt-8 pb-10 px-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                isDragging
                  ? 'cursor-grabbing scroll-auto'
                  : 'cursor-grab snap-x snap-mandatory scroll-smooth'
              }`}
            >
              {loopScholars.map((scholar, loopIdx) => {
                const index = count > 0 ? loopIdx % count : loopIdx;
                const pureName = getPureFullName(scholar.fullName);
                const titleDict = TITLE_FULL_LOCALE[locale] || TITLE_FULL_LOCALE.uz;
                const titleFullText =
                  titleDict[scholar.academicTitle] || scholar.academicTitle || titleDict.DEFAULT;
                const degreeLabel =
                  scholar.academicDegree === 'DSC'
                    ? 'DSc'
                    : scholar.academicDegree === 'PHD'
                    ? 'PhD'
                    : '';
                const ringStyle =
                  DEGREE_RING_STYLES[scholar.academicDegree] || DEGREE_RING_STYLES.NONE;
                const badgeStyle =
                  DEGREE_BADGE_STYLES[scholar.academicDegree] ||
                  'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                // Maksimum 2 ta yo'nalish tegi (tanlangan tilda)
                const rawTags =
                  scholar.researchTags && scholar.researchTags.length > 0
                    ? scholar.researchTags.slice(0, 2)
                    : scholar.departmentName
                    ? [scholar.departmentName]
                    : [];
                const tags = rawTags.map((tg) => INTEREST_TRANSLATIONS[tg]?.[locale] || tg);
                const directionsTitle =
                  locale === 'ru'
                    ? 'Направления:'
                    : locale === 'en'
                    ? 'Directions:'
                    : 'Yo‘nalishlar:';

                return (
                  <motion.div
                    key={`${scholar.id}-${loopIdx}`}
                    data-scholar-card="true"
                    whileHover={
                      isDragging
                        ? undefined
                        : {
                            y: -8,
                            transition: { type: 'spring', stiffness: 320, damping: 22 },
                          }
                    }
                    // Telefon: 82% (1 ta + keyingi kartaning cheti ko'rinadi)
                    // Planshet (sm): 2 ta, (md): 3 ta
                    // Desktop (lg): 4 ta karta markazda
                    className="w-[82%] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] snap-start shrink-0"
                  >
                    <Link
                      href={`/scholars/${scholar.id}`}
                      onClick={handleCardClick}
                      draggable={false}
                      className="group h-full min-h-[340px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 p-5 shadow-xs hover:-translate-y-[2px] hover:shadow-xl hover:border-blue-300 dark:hover:border-sky-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950 focus-visible:-translate-y-[2px] focus-visible:shadow-xl transition-all duration-200 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-4">
                        {/* 1. Rasm yoki rangli monogramma (DSc: oltin halqa, PhD: ko'k halqa + burchagida kichik DSc/PhD belgisi) + Reyting medali */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="relative inline-flex shrink-0">
                            <ScholarAvatar
                              photoUrl={scholar.photoUrl}
                              fullName={pureName}
                              index={index}
                              className={`w-16 h-16 ${ringStyle} group-hover:scale-[1.03] transition-transform duration-200`}
                            />
                            {degreeLabel && (
                              <span
                                className={`
                                  absolute -bottom-1 -right-1 z-10 font-mono text-[10px] font-extrabold leading-none
                                  px-1.5 py-0.5 rounded-full border-2 shadow-xs tracking-tight
                                  ${AVATAR_CORNER_DEGREE_STYLES[scholar.academicDegree] || 'bg-slate-700 text-white border-white'}
                                `}
                              >
                                {degreeLabel}
                              </span>
                            )}
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 font-mono px-2.5 py-1 text-xs font-extrabold rounded-full border tabular-nums ${
                              RANK_MEDAL_STYLES[index] || DEFAULT_RANK_STYLE
                            }`}
                            title={`Reyting: #${index + 1}`}
                          >
                            {index < 3 && <Medal className="w-3.5 h-3.5 shrink-0" />}
                            <span>#{index + 1}</span>
                          </span>
                        </div>

                        {/* 2. F.I.Sh. (unvonsiz) + 3. Kattaroq Daraja badge (DSc/PhD), yonida unvon + 1 qator Kafedra */}
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-[17px] leading-snug group-hover:text-blue-600 dark:group-hover:text-sky-400 group-focus-visible:text-blue-600 dark:group-focus-visible:text-sky-400 transition-colors truncate">
                            {pureName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2">
                            {degreeLabel && (
                              <span
                                className={`font-mono px-2.5 py-1 text-xs font-extrabold rounded-lg border ${badgeStyle}`}
                              >
                                {degreeLabel}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                              {titleFullText}
                            </span>
                          </div>

                          {scholar.departmentName && (
                            <p
                              title={scholar.departmentName}
                              className="text-xs text-slate-500 dark:text-slate-400 truncate pt-0.5"
                            >
                              {scholar.departmentName}
                            </p>
                          )}
                        </div>

                        {/* 4. 1–2 ta teg (Yo'nalishlar) */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/80 text-[11px] font-medium truncate max-w-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 5. Pastki qator: ko'rishlar soni va yengil outline "Profilni ochish" */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        <span
                          title="Ko‘rishlar soni"
                          className="font-mono inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{scholar.totalCitations ?? 0}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:border-sky-400 dark:group-hover:text-sky-300 group-hover:bg-blue-50/50 dark:group-hover:bg-sky-950/30 transition-all">
                          <span>{labels.viewProfile || 'Profilni ochish'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Fakultet Yo'nalishlari */}
        <div className="space-y-7 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A] dark:text-white">
                {labels.facultiesTitle}
              </h2>
            </div>
            <Link
              href="/faculties"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-sky-400 hover:text-[#0F294A] dark:hover:text-white transition-colors"
            >
              {labels.facultiesNav}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faculties.map((faculty, idx) => (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease }}
                whileHover={{ y: -5, scale: 1.01 }}
              >
                <Link
                  href={`/faculties?code=${faculty.code}`}
                  className="group w-full text-left h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-sky-600 p-7 shadow-sm hover:shadow-xl hover:ring-2 hover:ring-blue-100 dark:hover:ring-sky-900/50 transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0F294A] dark:text-sky-300 rounded-lg">
                      {faculty.code}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-800 dark:group-hover:text-sky-300 transition-colors">
                      {faculty.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {faculty.departmentCount} {labels.departmentsWord} • {faculty.scholarCount}{' '}
                        {labels.scholarsWord}
                      </span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-[#0F294A] dark:group-hover:bg-sky-500 group-hover:text-white group-hover:border-[#0F294A] transition-all shrink-0">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
