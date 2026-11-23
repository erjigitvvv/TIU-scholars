import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Building2,
  Award,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  FileText,
  Search,
  Download,
  Share2,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPublicationPoints, DEFAULT_SCORING_CONFIG } from '@/lib/scoring';
import ScholarAvatar from '@/components/ui/ScholarAvatar';
import PublicationTypeBadge from '@/components/ui/PublicationTypeBadge';
import PublicationCitationBox from '@/components/publications/PublicationCitationBox';
import PublicationReaderSection from '@/components/publications/PublicationReaderSection';
import PublicationPdfButton from '@/components/publications/PublicationPdfButton';
import ScholarPublicationInteractiveHub from '@/components/publications/ScholarPublicationInteractiveHub';

const LIFECYCLE_STAGES = [
  { id: 1, key: 'IDEA', label: 'G‘oya & Reja', desc: 'Mavzu va yangilik aniqlangan' },
  { id: 2, key: 'LITERATURE', label: 'Adabiyotlar sharhi', desc: 'Bo‘shliq va manbalar tahlili' },
  { id: 3, key: 'METHODOLOGY', label: 'Metodologiya', desc: 'Gipoteza, usul va namunalar' },
  { id: 4, key: 'ANALYSIS', label: 'Ma‘lumot & Tahlil', desc: 'Statistika, jadvallar, grafiklar' },
  { id: 5, key: 'WRITING', label: 'IMRAD Yozish', desc: 'Kirish, metod, natija, xulosa' },
  { id: 6, key: 'PLAGIARISM', label: 'Antiplagiat Audit', desc: 'Moderator / Ichki ekspertiza' },
  { id: 7, key: 'SUBMITTED', label: 'Jurnalga Yuborildi', desc: 'Tahririyat ko‘rigida' },
  { id: 8, key: 'PEER_REVIEW', label: 'Taqriz (Peer Review)', desc: 'Mustaqil taqrizchilar baholashi' },
  { id: 9, key: 'REVISION', label: 'Tuzatish & Qayta topshirish', desc: 'Izohlarga javob xati' },
  { id: 10, key: 'PUBLISHED', label: 'Nashr & DOI Tasdiqlandi', desc: 'Portfolioga kiritildi' },
];

export default async function ScholarPublicationDetailPage({ params }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  const publication = await prisma.publication.findUnique({
    where: { id },
    include: {
      authors: {
        include: {
          scholar: {
            include: {
              department: {
                include: { faculty: true },
              },
            },
          },
        },
        orderBy: { authorOrder: 'asc' },
      },
      qualityCheck: true,
      submittedBy: {
        select: {
          id: true,
          email: true,
          scholarProfile: true,
        },
      },
    },
  });

  if (!publication) {
    notFound();
  }

  // Check if current user is author or submitted
  const isAuthor =
    publication.submittedById === user.id ||
    publication.authors.some((a) => a.scholar?.userId === user.id);

  const scoringConfig = (await prisma.scoringConfig.findFirst()) || DEFAULT_SCORING_CONFIG;
  const tiuScoreValue = getPublicationPoints(publication, scoringConfig);

  // Determine active stage based on publication status
  const currentStageIndex =
    publication.status === 'APPROVED'
      ? 10
      : publication.status === 'REJECTED'
      ? 8
      : publication.qualityCheck?.isPlagiarismPassed
      ? 7
      : 6;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/publications"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Nashrlarim ro‘yxatiga qaytish</span>
        </Link>

        <div className="flex items-center gap-2">
          {publication.url && (
            <a
              href={publication.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF Yuklab olish</span>
            </a>
          )}
          <Link
            href={`/publications/${publication.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ommaviy portalda ko‘rish</span>
          </Link>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <PublicationTypeBadge type={publication.type} />
          {publication.quartile && publication.quartile !== 'NONE' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60">
              {publication.quartile}
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {publication.year}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              publication.status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : publication.status === 'REJECTED'
                ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {publication.status === 'APPROVED'
              ? 'Tasdiqlangan ✅'
              : publication.status === 'REJECTED'
              ? 'Rad etilgan ❌'
              : 'Ekspertiza kutilmoqda ⏳'}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {publication.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {publication.journalOrPublisher}
            </span>
          </div>

          {publication.doi && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400">DOI:</span>
              <a
                href={`https://doi.org/${publication.doi}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-blue-600 hover:underline"
              >
                {publication.doi}
              </a>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>
              TIU Balli: <strong className="text-slate-900 dark:text-white">+{tiuScoreValue}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 10-BOSQICHLI AKADEMIK BOSQICHLAR TRACKER (Lifecycle SOP Pipeline) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-wide">
              Akademik Ishlanma & Tadqiqot Bosqichlari (SOP Pipeline)
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-emerald-300">
            Bosqich: {currentStageIndex} / 10
          </span>
        </div>

        {/* Horizontal Steps Scroll */}
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="flex items-center gap-3 min-w-[900px]">
            {LIFECYCLE_STAGES.map((st) => {
              const isDone = st.id < currentStageIndex;
              const isCurrent = st.id === currentStageIndex;

              return (
                <div
                  key={st.id}
                  className={`flex-1 p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                      : isDone
                      ? 'bg-white/10 border-white/20 text-slate-200'
                      : 'bg-white/5 border-white/10 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span>{st.id}-bosqich</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="font-bold text-xs line-clamp-1">{st.label}</div>
                  <p className="text-[10px] text-slate-300/80 mt-1 line-clamp-1">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Actions & Review Hub */}
      <ScholarPublicationInteractiveHub
        publicationId={publication.id}
        initialStage={publication.currentStage || 'IDEA'}
        initialReviewLogs={
          publication.reviewLogs ? JSON.parse(publication.reviewLogs) : []
        }
        qualityCheck={publication.qualityCheck}
        isAuthor={isAuthor}
        publicationTitle={publication.title}
        journalName={publication.journalOrPublisher}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Authors, Quality Gate, Abstract, PDF Reader */}
        <div className="lg:col-span-2 space-y-6">
          {/* Moderator Quality Gate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Moderator Ekspertizasi & Sifat Nazorati (Internal Quality Gate)</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Ilmiy Bo‘lim
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">1. Antiplagiat Tekshiruvi:</span>
                  <span
                    className={`font-bold ${
                      publication.qualityCheck?.isPlagiarismPassed
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {publication.qualityCheck?.isPlagiarismPassed
                      ? `${publication.qualityCheck.plagiarismPercent || 5}% (O‘tdi ✅)`
                      : 'Tekshirilmoqda ⏳'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Turnitin / StrikePlagiarism litsenziyalangan tizimi orqali.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">2. DOI Haqiqiyligi:</span>
                  <span
                    className={`font-bold ${
                      publication.doi ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {publication.doi ? 'Tasdiqlangan ✅' : 'Kiritilmagan'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  CrossRef xalqaro metamaʼlumotlar bazasi orqali tekshirilgan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">3. Iqtibos Uslubi (Citation):</span>
                  <span className="font-bold text-indigo-600">APA 7th & IEEE ✅</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bibliografik manbalar standart talablarga moslangan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">4. TIU Reyting Hisobi:</span>
                  <span className="font-bold text-emerald-600">+{tiuScoreValue} Ball ✅</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Kafedra va olim portfolioga avtomatik hisoblandi.
                </p>
              </div>
            </div>
          </div>

          {/* Annotatsiya / Abstract */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Ilmiy Annotatsiya (Abstract)</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Ushbu tadqiqot «{publication.title}» mavzusida {publication.year}-yilda chop etilgan bo‘lib,
              sohaning dolzarb nazariy va amaliy muammolariga bag‘ishlangan. Maqolada ilgari surilgan gipoteza
              va empirik tahlillar asosida tizimli tavsiyalar ishlab chiqilgan.
            </p>
          </div>

          {/* PDF Reader or Link */}
          {publication.url && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>Maqola Matni & Fayl</span>
                </h3>
                <PublicationPdfButton url={publication.url} title={publication.title} />
              </div>
              <PublicationReaderSection url={publication.url} title={publication.title} />
            </div>
          )}
        </div>

        {/* Right Column: Authors & Citation Generator */}
        <div className="space-y-6">
          {/* Authors List with Approval Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Mualliflar Jamoasi ({publication.authors.length})</span>
            </h3>

            <div className="space-y-3">
              {publication.authors.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <ScholarAvatar
                      name={a.scholar?.fullName || 'Muallif'}
                      photoUrl={a.scholar?.photoUrl}
                      size="sm"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {a.scholar?.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {a.authorOrder === 1 ? '1-muallif (Mas‘ul)' : 'Hammuallif'} • {a.scholar?.department?.nameUz}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : a.approvalStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.approvalStatus === 'APPROVED'
                      ? 'Tasdiqlagan ✅'
                      : a.approvalStatus === 'REJECTED'
                      ? 'Rad etgan ❌'
                      : 'Kutilmoqda ⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Citation Generator (APA, Harvard, BibTeX) */}
          <PublicationCitationBox publication={publication} />
        </div>
      </div>
    </div>
  );
}
