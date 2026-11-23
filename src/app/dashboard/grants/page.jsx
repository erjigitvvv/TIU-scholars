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

  // Selected Call Detail Modal
  const [selectedCall, setSelectedCall] = useState(null);

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
    if (formData.title.trim()) score += 15;
    if (formData.proposalData.urgency.trim()) score += 15;
    if (formData.proposalData.objectives.trim()) score += 15;
    if (formData.proposalData.novelty.trim()) score += 15;
    if (formData.proposalData.methodology.trim()) score += 15;
    if (totalBudgetCalculated > 0) score += 15;
    if (formData.teamMembers.length > 0) score += 10;
    return Math.min(100, score);
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
        budgetRequested: totalBudgetCalculated,
        deadlineDate: formData.deadlineDate,
        status: targetStatus || formData.status,
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

          <button
            onClick={() => {
              setEditingGrantId(null);
              setActiveStep(1);
              setWizardModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg active:scale-95 transition-all self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>+ Yangi Grant Arizasi</span>
          </button>
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

                      <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
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

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2">
                    {call.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{call.funder}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {call.description}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
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
                    onClick={() => setSelectedCall(call)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Batafsil shartlar 👉
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
                  { step: 3, label: '3. Smart Smeta Kalkulyatori' },
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

                {/* STEP 3: SMART BUDGET CALCULATOR */}
                {activeStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Jami Hisoblangan Smetasi:
                        </span>
                        <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                          {totalBudgetCalculated.toLocaleString()} so‘m
                        </div>
                      </div>
                      <Calculator className="w-8 h-8 text-emerald-600" />
                    </div>

                    <div className="space-y-3">
                      {formData.budgetItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...formData.budgetItems];
                                updated[idx].title = e.target.value;
                                setFormData({ ...formData, budgetItems: updated });
                              }}
                              className="font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full"
                            />
                            <input
                              type="text"
                              placeholder="Xarajat asosnomasi..."
                              value={item.justification}
                              onChange={(e) => {
                                const updated = [...formData.budgetItems];
                                updated[idx].justification = e.target.value;
                                setFormData({ ...formData, budgetItems: updated });
                              }}
                              className="text-[11px] text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => {
                                const updated = [...formData.budgetItems];
                                updated[idx].amount = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, budgetItems: updated });
                              }}
                              className="w-36 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-right text-xs"
                            />
                            <span className="text-slate-400 font-semibold">so‘m</span>
                          </div>
                        </div>
                      ))}
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

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSaveGrant('DRAFT')}
                        disabled={savingGrant}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                      >
                        Qoralama sifatida saqlash
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveGrant('SUBMITTED_INTERNAL')}
                        disabled={savingGrant || calculateReadinessScore() < 50}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>Universitet Tasdig‘iga Yuborish</span>
                      </button>
                    </div>
                  </div>
                )}
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
    </div>
  );
}
