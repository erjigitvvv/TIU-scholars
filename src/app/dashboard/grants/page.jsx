'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  FileCheck,
  Send,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Award,
  ChevronRight,
  Calculator,
  ShieldCheck,
  X,
  Layers,
  BookOpen,
  Download,
} from 'lucide-react';

export default function GrantsPage() {
  const [activeTab, setActiveTab] = useState('MY_GRANTS'); // 'MY_GRANTS' | 'OPEN_CALLS'
  const [grants, setGrants] = useState([]);
  const [openCalls, setOpenCalls] = useState([]);
  const [tiuScholars, setTiuScholars] = useState([]);
  const [scholarPublications, setScholarPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Studio / Modal States
  const [wizardModalOpen, setWizardModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [editingGrantId, setEditingGrantId] = useState(null);
  const [savingGrant, setSavingGrant] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [uploadingProposalFile, setUploadingProposalFile] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Selected Call / Grant Detail Modal
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedGrantModal, setSelectedGrantModal] = useState(null);

  // Deliverables Link Modal
  const [deliverablesModalGrant, setDeliverablesModalGrant] = useState(null);
  const [selectedPubToLink, setSelectedPubToLink] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    role: 'Principal Investigator',
    fundingSource: 'O‘zbekiston Respublikasi Innovatsion rivojlanish agentligi',
    grantProgram: 'Amaliy tadqiqotlar loyihalari',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 2,
    budgetRequested: 850000000,
    deadlineDate: '2026-05-15',
    status: 'DRAFT',
    applicationFileUrl: '',
    applicationFileName: '',
    proposalData: {
      urgency: '',
      objectives: '',
      novelty: '',
      methodology: '',
      workPlanGantt: '',
      teamExperience: '',
      risks: '',
      impact: '',
    },
    budgetItems: [
      { id: 1, category: 'SALARY', title: 'Ilmiy jamoa ish haqi (soliqlar bilan)', amount: 450000000, justification: '12 oylik ish haqi (12% daromad + 12% ijtimoiy soliq)' },
      { id: 2, category: 'EQUIPMENT', title: 'Laboratoriya va IT asbob-uskunalari', amount: 200000000, justification: 'Server va yuqori quvvatli hisoblash stansiyasi' },
      { id: 3, category: 'TRAVEL', title: 'Xalqaro ilmiy konferensiya va dala tadqiqoti', amount: 80000000, justification: 'Tadqiqot maʼlumotlarini yig‘ish va approbatsiya' },
      { id: 4, category: 'SUPPLIES', title: 'Reaktivlar va sarflash materiallari', amount: 70000000, justification: 'Eksperimental namunalar va sinov vositalari' },
      { id: 5, category: 'PUBLISHING', title: 'Scopus Q1/Q2 jurnallarida Open Access nashr', amount: 50000000, justification: 'Xalqaro ilmiy jurnallarda natijalarni chop etish' },
    ],
    teamMembers: [],
    documentsList: [
      { name: 'Universitet Ilmiy Kengashi Xulosasi', status: 'REQUIRED' },
      { name: 'Loyiha Pasporti va Kalendar Reja', status: 'READY' },
      { name: 'Xarajatlar Smetasi va Asosnomasi', status: 'READY' },
      { name: 'Jamoa Aʼzolari Ilmiy CV-Maʼlumotnomasi', status: 'READY' },
    ],
  });

  const fetchGrantsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/grants');
      const data = await res.json();
      if (data.success) {
        setGrants(data.grants || []);
        setOpenCalls(data.openCalls || []);
        setTiuScholars(data.tiuScholars || []);
        setScholarPublications(data.scholarPublications || []);
      }
    } catch (err) {
      console.error('Fetch grants error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrantsData();
  }, []);

  const totalBudgetCalculated = formData.budgetItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // Readiness Score calculation
  const calculateReadinessScore = () => {
    let score = 0;
    if (formData.title.trim()) score += 20;
    if (formData.proposalData.urgency.trim()) score += 15;
    if (formData.proposalData.objectives.trim()) score += 15;
    if (formData.proposalData.novelty.trim()) score += 15;
    if (parseFloat(formData.budgetRequested) > 0) score += 15;
    if (formData.teamMembers.length > 0) score += 10;
    if (formData.applicationFileUrl) score += 10;
    return Math.min(100, score);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingProposalFile(true);
      setUploadError('');
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/dashboard/grants/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.success && result.url) {
        setFormData((prev) => ({
          ...prev,
          applicationFileUrl: result.url,
          applicationFileName: result.originalName || file.name,
        }));
      } else {
        setUploadError(result.error || 'Yuklashda xatolik yuz berdi');
      }
    } catch {
      setUploadError('Faylni yuklashda server xatosi');
    } finally {
      setUploadingProposalFile(false);
    }
  };

  const handleOpenNewFromCall = (call) => {
    setEditingGrantId(null);
    setFormData({
      ...formData,
      title: `${call.priorityAreas[0] || 'Innovatsion tadqiqot'} bo‘yicha ilmiy loyiha`,
      fundingSource: call.funder,
      grantProgram: call.program,
      budgetRequested: call.maxBudget,
      deadlineDate: call.deadline.split('T')[0],
      status: 'DRAFT',
    });
    setActiveStep(1);
    setWizardModalOpen(true);
    setSelectedCall(null);
  };

  const handleOpenEdit = (grant) => {
    setEditingGrantId(grant.id);
    let proposal = {};
    let budget = [];
    let team = [];
    let docs = [];

    try {
      proposal = grant.proposalData ? JSON.parse(grant.proposalData) : {};
    } catch {}
    try {
      budget = grant.budgetItems ? JSON.parse(grant.budgetItems) : [];
    } catch {}
    try {
      team = grant.teamMembers ? JSON.parse(grant.teamMembers) : [];
    } catch {}
    try {
      docs = grant.documentsList ? JSON.parse(grant.documentsList) : [];
    } catch {}

    setFormData({
      title: grant.title,
      role: grant.role,
      fundingSource: grant.fundingSource,
      grantProgram: grant.grantProgram || '',
      startYear: grant.startYear,
      endYear: grant.endYear || grant.startYear + 2,
      budgetRequested: grant.budgetRequested || 0,
      deadlineDate: grant.deadlineDate ? grant.deadlineDate.split('T')[0] : '',
      status: grant.status,
      applicationFileUrl: grant.applicationFileUrl || '',
      applicationFileName: grant.applicationFileName || '',
      proposalData: {
        urgency: proposal.urgency || '',
        objectives: proposal.objectives || '',
        novelty: proposal.novelty || '',
        methodology: proposal.methodology || '',
        workPlanGantt: proposal.workPlanGantt || '',
        teamExperience: proposal.teamExperience || '',
        risks: proposal.risks || '',
        impact: proposal.impact || '',
      },
      budgetItems: budget.length > 0 ? budget : formData.budgetItems,
      teamMembers: team,
      documentsList: docs.length > 0 ? docs : formData.documentsList,
    });

    setActiveStep(1);
    setWizardModalOpen(true);
  };

  const handleSaveGrant = async (targetStatus = null) => {
    try {
      setSavingGrant(true);
      setSaveSuccessMsg('');

      const payload = {
        title: formData.title,
        role: formData.role,
        fundingSource: formData.fundingSource,
        grantProgram: formData.grantProgram,
        startYear: formData.startYear,
        endYear: formData.endYear,
        budgetRequested: parseFloat(formData.budgetRequested) || 0,
        deadlineDate: formData.deadlineDate,
        status: targetStatus || formData.status,
        applicationFileUrl: formData.applicationFileUrl || null,
        applicationFileName: formData.applicationFileName || null,
        proposalData: formData.proposalData,
        budgetItems: formData.budgetItems,
        teamMembers: formData.teamMembers,
        documentsList: formData.documentsList,
      };

      const url = editingGrantId
        ? `/api/dashboard/grants/${editingGrantId}`
        : '/api/dashboard/grants';
      const method = editingGrantId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg(
          targetStatus === 'SUBMITTED_INTERNAL'
            ? 'Loyiha arizasi Universitet Ilmiy Bo‘limi tasdig‘iga muvaffaqiyatli topshirildi! 🎉'
            : 'Grant loyihasi muvaffaqiyatli saqlandi! ✅'
        );
        setTimeout(async () => {
          setWizardModalOpen(false);
          setSaveSuccessMsg('');
          await fetchGrantsData();
        }, 1500);
      } else {
        alert(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      alert('Server xatosi');
    } finally {
      setSavingGrant(false);
    }
  };

  const handleDeleteGrant = async (id) => {
    if (!confirm('Ushbu grant loyihasini o‘chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/dashboard/grants/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchGrantsData();
      }
    } catch {
      alert('O‘chirishda xatolik');
    }
  };

  const handleLinkPublicationToGrant = async () => {
    if (!deliverablesModalGrant || !selectedPubToLink) return;
    const pub = scholarPublications.find((p) => p.id === selectedPubToLink);
    if (!pub) return;

    let existingDeliverables = [];
    try {
      existingDeliverables = deliverablesModalGrant.deliverables
        ? JSON.parse(deliverablesModalGrant.deliverables)
        : [];
    } catch {}

    const newDeliverables = [
      ...existingDeliverables,
      {
        id: Date.now().toString(),
        type: pub.type,
        title: pub.title,
        year: pub.year,
        journal: pub.journalOrPublisher,
        doi: pub.doi,
        publicationId: pub.id,
        linkedAt: new Date().toISOString(),
      },
    ];

    try {
      const res = await fetch(`/api/dashboard/grants/${deliverablesModalGrant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverables: newDeliverables }),
      });
      const data = await res.json();
      if (data.success) {
        setDeliverablesModalGrant(null);
        setSelectedPubToLink('');
        await fetchGrantsData();
      }
    } catch {
      alert('Bog‘lashda xatolik');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Research Grant & Funding Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Grant Loyihalari & Smart Ariza Studiyasi
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Ochiq grant tanlovlarini qidirish, 8 ta ilmiy bo‘limli rasmiy arizani tayyorlash, jonli smeta kalkulyatori va yutilgan loyiha natijalarini monitoring qilish.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <a
              href="/api/dashboard/grants/template"
              download="TIU_Grant_Ariza_Shabloni_va_Korsatmalari.doc"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition shadow-sm"
              title="Arizani to‘g‘ri yozish bo‘yicha ko‘rsatmalarga ega rasmiy .docx shablon"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>📄 .docx Ko‘rsatmali Shablon</span>
            </a>

            <button
              onClick={() => {
                setEditingGrantId(null);
                setFormData({
                  title: '',
                  role: 'Principal Investigator',
                  fundingSource: 'O‘zbekiston Respublikasi Innovatsion rivojlanish agentligi',
                  grantProgram: 'Amaliy tadqiqotlar loyihalari',
                  startYear: new Date().getFullYear(),
                  endYear: new Date().getFullYear() + 2,
                  budgetRequested: 850000000,
                  deadlineDate: '2026-05-15',
                  status: 'DRAFT',
                  applicationFileUrl: '',
                  applicationFileName: '',
                  proposalData: {
                    urgency: '',
                    objectives: '',
                    novelty: '',
                    methodology: '',
                    workPlanGantt: '',
                    teamExperience: '',
                    risks: '',
                    impact: '',
                  },
                  budgetItems: [
                    { id: 1, category: 'SALARY', title: 'Ilmiy jamoa ish haqi (soliqlar bilan)', amount: 450000000, justification: '12 oylik ish haqi (12% daromad + 12% ijtimoiy soliq)' },
                    { id: 2, category: 'EQUIPMENT', title: 'Laboratoriya va IT asbob-uskunalari', amount: 200000000, justification: 'Server va yuqori quvvatli hisoblash stansiyasi' },
                    { id: 3, category: 'TRAVEL', title: 'Xalqaro ilmiy konferensiya va dala tadqiqoti', amount: 80000000, justification: 'Tadqiqot maʼlumotlarini yig‘ish va approbatsiya' },
                    { id: 4, category: 'SUPPLIES', title: 'Reaktivlar va sarflash materiallari', amount: 70000000, justification: 'Eksperimental namunalar va sinov vositalari' },
                    { id: 5, category: 'PUBLISHING', title: 'Scopus Q1/Q2 jurnallarida Open Access nashr', amount: 50000000, justification: 'Xalqaro ilmiy jurnallarda natijalarni chop etish' },
                  ],
                  teamMembers: [],
                  documentsList: [
                    { name: 'Universitet Ilmiy Kengashi Xulosasi', status: 'REQUIRED' },
                    { name: 'Loyiha Pasporti va Kalendar Reja', status: 'READY' },
                    { name: 'Xarajatlar Smetasi va Asosnomasi', status: 'READY' },
                    { name: 'Jamoa Aʼzolari Ilmiy CV-Maʼlumotnomasi', status: 'READY' },
                  ],
                });
                setActiveStep(1);
                setWizardModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yangi Grant Arizasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Mening Loyihalarim</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{grants.length} ta</div>
          <p className="text-xs text-slate-400 mt-1">Arizalar va yutilgan grantlar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Yutilgan (Faol) Grantlar</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {grants.filter((g) => g.status === 'WON' || g.status === 'APPROVED').length} ta
          </div>
          <p className="text-xs text-slate-400 mt-1">Moliyalashtirilayotgan</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Ochiq Tanlovlar (Calls)</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{openCalls.length} ta</div>
          <p className="text-xs text-slate-400 mt-1">Hozirda ariza qabulida</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Tasdiqda Kutilayotgan</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {grants.filter((g) => g.status === 'SUBMITTED_INTERNAL' || g.status === 'PENDING').length} ta
          </div>
          <p className="text-xs text-slate-400 mt-1">Universitet / Fond ko‘rigida</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('MY_GRANTS')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'MY_GRANTS'
              ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Mening Grant Loyihalarim ({grants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OPEN_CALLS')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'OPEN_CALLS'
              ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Ochiq Grant Tanlovlari Katalogi ({openCalls.length})</span>
        </button>
      </div>

      {/* TAB 1: MY GRANTS */}
      {activeTab === 'MY_GRANTS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Yuklanmoqda...</div>
          ) : grants.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hozircha grant loyihalari mavjud emas
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Ochiq grant tanlovlaridan birini tanlang yoki yangi ilmiy grant arizasini tayyorlashni boshlang.
              </p>
              <button
                onClick={() => setActiveTab('OPEN_CALLS')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ochiq Tanlovlarni Ko‘rish</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {grants.map((g) => {
                let deliverablesList = [];
                try {
                  deliverablesList = g.deliverables ? JSON.parse(g.deliverables) : [];
                } catch {}

                return (
                  <motion.div
                    key={g.id}
                    layout
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/60">
                          {g.grantCode || `TIU-GRT-${g.startYear}`}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            g.status === 'WON' || g.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                              : g.status === 'SUBMITTED_INTERNAL'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : g.status === 'REJECTED'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {g.status === 'WON' || g.status === 'APPROVED'
                            ? 'Yutilgan (Faol) 🏆'
                            : g.status === 'SUBMITTED_INTERNAL'
                            ? 'Universitet ko‘rigida ⏳'
                            : g.status === 'DRAFT'
                            ? 'Qoralama 📝'
                            : g.status}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedGrantModal({ type: 'MY_GRANT', data: g })}
                        className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        {g.title}
                      </h3>

                      <div className="space-y-1 mt-3 text-xs text-slate-500">
                        <div className="flex items-center justify-between">
                          <span>Fond / Dastur:</span>
                          <strong className="text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                            {g.fundingSource}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Mening rolim:</span>
                          <span className="font-semibold text-indigo-600">{g.role}</span>
                        </div>
                        {g.budgetRequested && (
                          <div className="flex items-center justify-between">
                            <span>So‘ralayotgan byudjet:</span>
                            <span className="font-mono font-bold text-emerald-600">
                              {g.budgetRequested.toLocaleString()} so‘m
                            </span>
                          </div>
                        )}
                        {g.applicationFileUrl && (
                          <div className="flex items-center justify-between pt-1">
                            <span>Biriktirilgan ariza:</span>
                            <a
                              href={g.applicationFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[170px]">{g.applicationFileName || 'Yuklangan fayl'}</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Deliverables summary */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Bog‘langan nashrlar: <strong>{deliverablesList.length} ta</strong></span>
                        </span>

                        <button
                          onClick={() => setDeliverablesModalGrant(g)}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          + Nashr bog‘lash
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleDeleteGrant(g.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ariza Studiyasi (Workspace)</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPEN GRANT CALLS */}
      {activeTab === 'OPEN_CALLS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {openCalls.map((call) => (
              <div
                key={call.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Qabul ochiq ✅
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Dedlayn: {new Date(call.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedGrantModal({ type: 'CALL', data: call })}
                    className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-emerald-600 transition"
                  >
                    {call.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{call.funder}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {call.description}
                  </p>

                  <div
                    onClick={() => setSelectedGrantModal({ type: 'CALL', data: call })}
                    className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 cursor-pointer hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Maksimal byudjet:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                        {call.currency === 'UZS'
                          ? `${(call.maxBudget / 1000000).toLocaleString()} mln so‘m`
                          : `${call.maxBudget.toLocaleString()} ${call.currency}`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Davomiyligi:</span>
                      <span className="font-semibold">{call.durationMonths} oy</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedGrantModal({ type: 'CALL', data: call })}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Batafsil ma’lumot va shartlar 👉
                  </button>

                  <button
                    onClick={() => handleOpenNewFromCall(call)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ariza Yozish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRANT PROPOSAL WIZARD / STUDIO MODAL */}
      <AnimatePresence>
        {wizardModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Studio Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {editingGrantId ? 'Tahrirlash' : 'Yangi Ariza'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Tayyorgarlik darajasi: {calculateReadinessScore()}%
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1 mt-1">
                    {formData.title || 'Ilmiy Grant Arizasi Studiyasi'}
                  </h2>
                </div>

                <button
                  onClick={() => setWizardModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wizard Steps Tabs */}
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-2 overflow-x-auto gap-2 text-xs">
                {[
                  { step: 1, label: '1. Pasport & Fond' },
                  { step: 2, label: '2. Ilmiy Ariza (8 blok)' },
                  { step: 3, label: '3. Byudjet & Muddat' },
                  { step: 4, label: '4. Jamoa Matrisasi' },
                  { step: 5, label: '5. Audit & Topshirish' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                      activeStep === s.step
                        ? 'bg-slate-900 dark:bg-blue-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Studio Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {saveSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 font-bold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* STEP 1: PASPORT */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Loyiha Sarlavhasi (Mavzusi) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Raqamli iqtisodiyotda sun'iy intellekt modellarini joriy etish..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Grant Beruvchi Tashkilot (Fond)
                        </label>
                        <input
                          type="text"
                          value={formData.fundingSource}
                          onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tanlov Dasturi / Yo‘nalishi
                        </label>
                        <input
                          type="text"
                          value={formData.grantProgram}
                          onChange={(e) => setFormData({ ...formData, grantProgram: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Loyihadagi Rolim
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        >
                          <option value="Principal Investigator">Loyiha Rahbari (PI)</option>
                          <option value="Co-Investigator">Katta Ilmiy Xodim (Co-PI)</option>
                          <option value="Researcher">Yetakchi Ijrochi</option>
                          <option value="Junior Researcher">Yosh Olim / Tadqiqotchi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Boshlanish Yili
                        </label>
                        <input
                          type="number"
                          value={formData.startYear}
                          onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Topshirish Dedlayni
                        </label>
                        <input
                          type="date"
                          value={formData.deadlineDate}
                          onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PROPOSAL SECTIONS */}
                {activeStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        1. Dolzarblik va Muammo (Urgency & Problem Statement)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Sohadagi mavjud bo‘shliq va tadqiqotning zarurati..."
                        value={formData.proposalData.urgency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            proposalData: { ...formData.proposalData, urgency: e.target.value },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                          2. Maqsad va Vazifalar (Objectives)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Loyiha maqsadi va 3-4 ta asosiy vazifalari..."
                          value={formData.proposalData.objectives}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              proposalData: { ...formData.proposalData, objectives: e.target.value },
                            })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                          3. Ilmiy Yangilik va Kutilayotgan Natija (Novelty)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Qanday yangi usul, model yoki mahsulot yaratiladi..."
                          value={formData.proposalData.novelty}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              proposalData: { ...formData.proposalData, novelty: e.target.value },
                            })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        4. Metodologiya va Kalendar Ish Rejasi (Gantt Schedule)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Qaysi usullardan foydalaniladi va oylar bo‘yicha taqsimot..."
                        value={formData.proposalData.methodology}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            proposalData: { ...formData.proposalData, methodology: e.target.value },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: ODDIY VA QULAY BYUDJET */}
                {activeStep === 3 && (
                  <div className="space-y-5">
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          So‘ralayotgan jami byudjet summasi:
                        </span>
                        <div className="text-2xl md:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                          {Number(formData.budgetRequested || 0).toLocaleString()} so‘m
                        </div>
                      </div>
                      <DollarSign className="w-9 h-9 text-emerald-600" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          Jami talab qilinadigan byudjet miqdori (UZS) *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Masalan: 850000000"
                          value={formData.budgetRequested}
                          onChange={(e) =>
                            setFormData({ ...formData, budgetRequested: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-[11px] text-slate-400">
                          Loyiha uchun fonddan so‘ralayotgan umumiy mablag‘ summasi.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          Loyiha muddati (Yillar)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              value={formData.startYear}
                              onChange={(e) =>
                                setFormData({ ...formData, startYear: parseInt(e.target.value) || new Date().getFullYear() })
                              }
                              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-semibold"
                              placeholder="Boshlanish"
                            />
                            <span className="text-[10px] text-slate-400 block mt-1">Boshlanish yili</span>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={formData.endYear}
                              onChange={(e) =>
                                setFormData({ ...formData, endYear: parseInt(e.target.value) || (formData.startYear + 2) })
                              }
                              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-semibold"
                              placeholder="Tugash"
                            />
                            <span className="text-[10px] text-slate-400 block mt-1">Tugash yili</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Xarajatlarning asosiy yo‘nalishlari va maqsadli taqsimoti (Qisqa asosnoma)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Masalan: Ilmiy jamoa a’zolari oylik ish haqi (50%), yuqori quvvatli server va laboratoriya uskunalari (25%), xalqaro Q1/Q2 jurnallarda Open Access nashr va xizmat safari (25%)..."
                        value={formData.proposalData.budgetJustification || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            proposalData: { ...formData.proposalData, budgetJustification: e.target.value },
                          })
                        }
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400">
                        Keraksiz hisob-kitoblarsiz, mablag‘ nimalarga sarflanishini umumiy va lo‘nda ko‘rsating.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: TEAM MATRIX */}
                {activeStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Loyiha Ijrochi Jamoasi
                      </h4>
                      <span className="text-xs text-slate-400">TIU Olimlaridan tanlash mumkin</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                        TIU Olimlaridan Jamoaga Qo‘shish:
                      </label>
                      <select
                        onChange={(e) => {
                          const scholarId = e.target.value;
                          const s = tiuScholars.find((x) => x.id === scholarId);
                          if (s && !formData.teamMembers.some((m) => m.email === s.user?.email)) {
                            setFormData({
                              ...formData,
                              teamMembers: [
                                ...formData.teamMembers,
                                {
                                  name: s.fullName,
                                  email: s.user?.email || '',
                                  role: 'Katta Ilmiy Xodim',
                                  degree: s.academicDegree,
                                  sharePercent: 20,
                                },
                              ],
                            });
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      >
                        <option value="">Olimni tanlang...</option>
                        {tiuScholars.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName} ({s.academicDegree}) • {s.department?.nameUz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      {formData.teamMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                            <div className="text-[11px] text-slate-400">{m.role} • {m.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                teamMembers: formData.teamMembers.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-red-500 font-bold hover:underline"
                          >
                            O‘chirish
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: AUDIT & SUBMIT */}
                {activeStep === 5 && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-blue-900 dark:text-blue-300">
                          Ariza Tayyorgarligi (Readiness Score):
                        </span>
                        <span className="font-mono font-extrabold text-base text-blue-800 dark:text-blue-200">
                          {calculateReadinessScore()}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${calculateReadinessScore()}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Universitet Ichki Ekspertizasi va Yo‘llanma Xati</span>
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        Arizani topshirishdan oldin Universitet Ilmiy Bo‘limi va Ekspertiza Komissiyasi arizangizni ko‘rib chiqib, davlat/fond tanloviga rasmiy yo‘llanma xati (Endorsement Letter) beradi.
                      </p>
                    </div>

                    {/* DOCX / PDF PROPOSAL DOCUMENT UPLOAD & TEMPLATE DOWNLOAD */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Rasmiy Ariza Hujjati (.docx yoki .pdf)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Ko‘rsatmalarga asosan to‘ldirilgan to‘liq arizangizni yuklang yoki rasmiy shablonni oling
                          </p>
                        </div>

                        <a
                          href="/api/dashboard/grants/template"
                          download="TIU_Grant_Ariza_Shabloni_va_Korsatmalari.doc"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 hover:bg-blue-100 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.docx Shablonni Yuklab Olish</span>
                        </a>
                      </div>

                      {uploadError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                          {uploadError}
                        </div>
                      )}

                      {formData.applicationFileUrl ? (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <a
                                href={formData.applicationFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-emerald-900 dark:text-emerald-200 hover:underline truncate"
                              >
                                {formData.applicationFileName || 'Yuklangan grant arizasi'}
                              </a>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                Muvaffaqiyatli biriktirildi ✅ (Tekshiruvga tayyor)
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={formData.applicationFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                            >
                              Ko‘rish
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  applicationFileUrl: '',
                                  applicationFileName: '',
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold text-[11px] hover:bg-rose-200"
                            >
                              O‘chirish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center space-y-2 hover:border-blue-400 transition">
                          <input
                            type="file"
                            id="grantProposalInput"
                            accept=".docx,.doc,.pdf"
                            onChange={handleFileUpload}
                            disabled={uploadingProposalFile}
                            className="hidden"
                          />
                          <label
                            htmlFor="grantProposalInput"
                            className="cursor-pointer inline-flex flex-col items-center justify-center space-y-1"
                          >
                            <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {uploadingProposalFile
                                ? 'Fayl serverga yuklanmoqda...'
                                : 'Arizani yuklash uchun bu yerga bosing (.docx yoki .pdf)'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Maksimal hajm: 25 MB • Microsoft Word (.docx, .doc) yoki Adobe PDF
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {!formData.title.trim() && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Topshirish uchun avval 1-qadamda loyiha sarlavhasini kiriting.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Persistent Wizard Navigation Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {activeStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      👈 Oldingi qadam
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSaveGrant('DRAFT')}
                    disabled={savingGrant || !formData.title.trim()}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    Qoralama sifatida saqlash
                  </button>

                  {activeStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Keyingi qadam 👉</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveGrant('SUBMITTED_INTERNAL')}
                      disabled={savingGrant || !formData.title.trim()}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{savingGrant ? 'Yuborilmoqda...' : 'Universitet Tasdig‘iga Yuborish 🚀'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELIVERABLES LINK MODAL */}
      <AnimatePresence>
        {deliverablesModalGrant && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Grantga Chiqqan Nashrni Bog‘lash</span>
                </h3>
                <button
                  onClick={() => setDeliverablesModalGrant(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mening nashrlarimdan tanlang:
                </label>
                <select
                  value={selectedPubToLink}
                  onChange={(e) => setSelectedPubToLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">Nashrni tanlang...</option>
                  {scholarPublications.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.type} • {p.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverablesModalGrant(null)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleLinkPublicationToGrant}
                  disabled={!selectedPubToLink}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Bog‘lash
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* RICH GRANT DETAIL MODAL (Cardga bosilganda chiqadigan to'liq modal) */}
      <AnimatePresence>
        {selectedGrantModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {selectedGrantModal.type === 'CALL'
                        ? 'Ochiq Grant Tanlovi'
                        : selectedGrantModal.data.grantCode || `TIU-GRT-${selectedGrantModal.data.startYear}`}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedGrantModal.type === 'CALL'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : selectedGrantModal.data.status === 'WON' || selectedGrantModal.data.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : selectedGrantModal.data.status === 'SUBMITTED_INTERNAL'
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {selectedGrantModal.type === 'CALL'
                        ? 'Ariza qabul qilinmoqda 🚀'
                        : selectedGrantModal.data.status === 'WON' || selectedGrantModal.data.status === 'APPROVED'
                        ? 'Yutilgan (Faol) 🏆'
                        : selectedGrantModal.data.status === 'SUBMITTED_INTERNAL'
                        ? 'Universitet Ilmiy Bo‘limi ko‘rigida ⏳'
                        : 'Qoralama 📝'}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    {selectedGrantModal.data.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedGrantModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Funder & Key Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Fond / Dastur
                  </span>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                    {selectedGrantModal.type === 'CALL'
                      ? selectedGrantModal.data.funder
                      : selectedGrantModal.data.fundingSource}
                  </div>
                  {selectedGrantModal.data.grantProgram && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      {selectedGrantModal.data.grantProgram}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    {selectedGrantModal.type === 'CALL' ? 'Maksimal Ajratiladigan Mablag‘' : 'So‘ralgan Byudjet'}
                  </span>
                  <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                    {selectedGrantModal.type === 'CALL'
                      ? selectedGrantModal.data.currency === 'UZS'
                        ? `${(selectedGrantModal.data.maxBudget / 1000000).toLocaleString()} mln so‘m`
                        : `${selectedGrantModal.data.maxBudget.toLocaleString()} ${selectedGrantModal.data.currency}`
                      : `${Number(selectedGrantModal.data.budgetRequested || 0).toLocaleString()} so‘m`}
                  </div>
                </div>
              </div>

              {/* Timing & Deadlines with Countdown */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                      {selectedGrantModal.type === 'CALL'
                        ? `Ariza topshirish oxirgi muddati: ${new Date(selectedGrantModal.data.deadline).toLocaleDateString()}`
                        : `Ijro muddati: ${selectedGrantModal.data.startYear} - ${selectedGrantModal.data.endYear || selectedGrantModal.data.startYear + 2} yy.`}
                    </span>
                    {selectedGrantModal.type === 'CALL' && (
                      <span className="text-[11px] text-amber-700 dark:text-amber-300">
                        Davomiyligi: {selectedGrantModal.data.durationMonths} oy
                      </span>
                    )}
                  </div>
                </div>

                {selectedGrantModal.type === 'CALL' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-extrabold text-xs shrink-0 font-mono">
                    ⏳ {Math.max(0, Math.ceil((new Date(selectedGrantModal.data.deadline) - new Date()) / (1000 * 60 * 60 * 24)))} kun qoldi
                  </div>
                )}
              </div>

              {/* Description & Objectives */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                  Grant Tavsifi va Yo‘nalishlari
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedGrantModal.data.description ||
                    'Mazkur ilmiy tadqiqot loyihasi TIU tadqiqotchilari tomonidan amaliy natijalarni ishlab chiqarishga joriy etish va xalqaro nufuzli jurnallarda natijalarni chop etishga qaratilgan.'}
                </p>
              </div>

              {/* Priority Areas / Tags */}
              {selectedGrantModal.data.priorityAreas && selectedGrantModal.data.priorityAreas.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Ustuvor Ilmiy Yo‘nalishlar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGrantModal.data.priorityAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px] border border-blue-200/60"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents / Submission Route Info */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 space-y-1.5">
                <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Ariza topshirish va tasdiqlash yo‘nalishi:</span>
                </span>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  Platformada to‘ldirilgan yoki biriktirilgan ariza <strong>Universitet Ilmiy Bo‘limi (Moderator)</strong>ga yo‘naltiriladi. Ilmiy Kengash xulosasi va rasmiy qo‘llab-quvvatlash xati berilgach, loyiha davlat/xalqaro portalga ro‘yxatga topshiriladi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedGrantModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
                >
                  Yopish
                </button>

                {selectedGrantModal.type === 'CALL' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const call = selectedGrantModal.data;
                      setSelectedGrantModal(null);
                      handleOpenNewFromCall(call);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ushbu tanlovga ariza yaratish 🚀</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const g = selectedGrantModal.data;
                      setSelectedGrantModal(null);
                      handleOpenEdit(g);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-bold shadow-md transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Ariza Studiyasida Ochish ✏️</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
