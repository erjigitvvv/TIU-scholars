'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Plus,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  User,
  Phone,
  Mail,
  Award,
  ArrowLeft,
  X,
  XCircle,
  FileCheck,
  PauseCircle,
  StopCircle,
  FileSpreadsheet,
  Trash2,
  Paperclip,
  Check,
  ChevronDown,
  Trophy,
} from 'lucide-react';
import ScholarAvatar from '@/components/ui/ScholarAvatar';

const STAGES = {
  A_DRAFT: {
    code: 'A_DRAFT',
    title: 'Qoralama',
    group: 'A',
    nextAction: 'Kafedraga yuborish',
    nextTarget: 'A_SUBMITTED_DEPARTMENT',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  A_SUBMITTED_DEPARTMENT: {
    code: 'A_SUBMITTED_DEPARTMENT',
    title: 'Kafedra ko‘rib chiqmoqda',
    group: 'A',
    nextAction: 'Kafedra qarorini kutish',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
  A_DEPARTMENT_APPROVED: {
    code: 'A_DEPARTMENT_APPROVED',
    title: 'Kafedra tasdiqlagan (Buyruq kutilmoqda)',
    group: 'A',
    nextAction: 'Rektorat buyrug‘ini kutish',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
  },
  B_ACTIVE_RESEARCH: {
    code: 'B_ACTIVE_RESEARCH',
    title: 'Faol tadqiqot & Reja',
    group: 'B',
    nextAction: 'Nashrlar talabiga o‘tish',
    nextTarget: 'C_PUBLICATIONS_READY',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  C_PUBLICATIONS_READY: {
    code: 'C_PUBLICATIONS_READY',
    title: 'Nashrlar talabi bajarilgan',
    group: 'C',
    nextAction: 'Himoya oldi bosqichiga o‘tkazish',
    nextTarget: 'D_PRE_DEFENSE',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  },
  D_PRE_DEFENSE: {
    code: 'D_PRE_DEFENSE',
    title: 'Himoya oldi & Checklist',
    group: 'D',
    nextAction: 'Himoyaga qabul qilish (Yakunlash)',
    nextTarget: 'E_COMPLETED',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  E_COMPLETED: {
    code: 'E_COMPLETED',
    title: 'Muvaffaqiyatli himoya qilingan (Arxiv)',
    group: 'E',
    nextAction: 'Jarayon yakunlangan',
    badge: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  },
  ON_HOLD: {
    code: 'ON_HOLD',
    title: 'Muzlatilgan (On Hold)',
    group: 'EX',
    nextAction: 'Tadqiqotni qayta faollashtirish',
    nextTarget: 'B_ACTIVE_RESEARCH',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  },
  TERMINATED: {
    code: 'TERMINATED',
    title: 'Bekor qilingan / To‘xtatilgan',
    group: 'EX',
    nextAction: 'Yopilgan',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
};

export default function SupervisionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [supervision, setSupervision] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'process');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Modals
  const [transitionModal, setTransitionModal] = useState({ open: false, targetStage: null });
  const [decisionModal, setDecisionModal] = useState({ open: false, type: 'REVISION', notes: '' });
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [publicationModalOpen, setPublicationModalOpen] = useState(false);
  const [docUploadModalOpen, setDocUploadModalOpen] = useState(false);
  const [documentVersions, setDocumentVersions] = useState([]);
  const [availablePubs, setAvailablePubs] = useState([]);
  const [pubsLoading, setPubsLoading] = useState(false);

  // Forms
  const [transitionPayload, setTransitionPayload] = useState({
    reason: '',
    orderNumber: '',
    orderDate: '',
    orderFileUrl: '',
    actualDefenseDate: '',
    defenseCouncilNo: '',
    diplomaNumber: '',
  });

  const [meetingForm, setMeetingForm] = useState({
    meetingDate: new Date().toISOString().split('T')[0],
    topicsCovered: '',
    tasksAssigned: '',
    nextMeetingDate: '',
    notes: '',
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    dueDate: '',
    stage: 'B_ACTIVE_RESEARCH',
    notes: '',
  });

  const [reportForm, setReportForm] = useState({
    periodName: '',
    content: '',
    fileUrl: '',
  });

  const [checklistForm, setChecklistForm] = useState({
    isDissertationReady: false,
    dissertationFileUrl: '',
    isAutoreferatReady: false,
    autoreferatFileUrl: '',
    isSeminarApproved: false,
    seminarProtocolUrl: '',
    isPlagiarismPassed: false,
    plagiarismPercent: '',
    plagiarismReportUrl: '',
  });

  const [docUploadForm, setDocUploadForm] = useState({
    documentType: 'DISSERTATION',
    fileName: '',
    fileUrl: '',
    uploaderNotes: '',
  });

  const fetchDocumentVersions = async () => {
    try {
      const res = await fetch(`/api/dashboard/supervisions/${id}/documents`);
      const data = await res.json();
      if (data.versions) setDocumentVersions(data.versions);
    } catch (e) {
      console.error('fetchDocumentVersions error:', e);
    }
  };

  // Fetch supervision
  const fetchSupervision = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik');
      setSupervision(data.supervision);

      // Populate checklist form
      if (data.supervision.checklist) {
        setChecklistForm({
          isDissertationReady: Boolean(data.supervision.checklist.isDissertationReady),
          dissertationFileUrl: data.supervision.checklist.dissertationFileUrl || '',
          isAutoreferatReady: Boolean(data.supervision.checklist.isAutoreferatReady),
          autoreferatFileUrl: data.supervision.checklist.autoreferatFileUrl || '',
          isSeminarApproved: Boolean(data.supervision.checklist.isSeminarApproved),
          seminarProtocolUrl: data.supervision.checklist.seminarProtocolUrl || '',
          isPlagiarismPassed: Boolean(data.supervision.checklist.isPlagiarismPassed),
          plagiarismPercent: data.supervision.checklist.plagiarismPercent || '',
          plagiarismReportUrl: data.supervision.checklist.plagiarismReportUrl || '',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSupervision();
      fetchDocumentVersions();
    }
  }, [id]);

  const handleUploadDocumentVersion = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/dashboard/supervisions/${id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docUploadForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik');
      setMessage({ type: 'success', text: data.message });
      setDocUploadModalOpen(false);
      setDocUploadForm({ documentType: 'DISSERTATION', fileName: '', fileUrl: '', uploaderNotes: '' });
      fetchDocumentVersions();
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewDocumentVersion = async (versionId, reviewDecision, reviewComment = '') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/dashboard/supervisions/${id}/documents/${versionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewDecision, reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Qaror saqlashda xatolik');
      setMessage({ type: 'success', text: data.message });
      fetchDocumentVersions();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Transition Handler
  const handleTransition = async (targetStage, customPayload = {}) => {
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await fetch(`/api/dashboard/supervisions/${id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStage,
          payload: { ...transitionPayload, ...customPayload },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bosqich o‘zgartirishda xatolik');

      setMessage({ type: 'success', text: `Bosqich muvaffaqiyatli yangilandi: ${targetStage}` });
      setTransitionModal({ open: false, targetStage: null });
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Supervisor 3-Decision Handler (Tasdiqlash, Tuzatishga qaytarish, Rad etish)
  const handleSupervisorDecision = async () => {
    if (!decisionModal.notes.trim()) {
      alert(decisionModal.type === 'REVISION' ? 'Iltimos, tuzatish izohini kiriting.' : 'Iltimos, rad etish sababini kiriting.');
      return;
    }
    if (decisionModal.type === 'REVISION') {
      const target = supervision.stage.startsWith('A_') ? 'A_DRAFT' : 'B_ACTIVE_RESEARCH';
      await handleTransition(target, {
        reason: `Ilmiy rahbar tuzatishga qaytardi: ${decisionModal.notes}`,
      });
    } else {
      await handleTransition('TERMINATED', {
        reason: `Ilmiy rahbar tomonidan rad etildi: ${decisionModal.notes}`,
      });
    }
    setDecisionModal({ open: false, type: 'REVISION', notes: '' });
  };

  // Add Meeting
  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${id}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Uchrashuv qo‘shishda xatolik');

      setMessage({ type: 'success', text: 'Yangi ilmiy uchrashuv muvaffaqiyatli qayd etildi.' });
      setMeetingModalOpen(false);
      setMeetingForm({
        meetingDate: new Date().toISOString().split('T')[0],
        topicsCovered: '',
        tasksAssigned: '',
        nextMeetingDate: '',
        notes: '',
      });
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestoneForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reja qo‘shishda xatolik');

      setMessage({ type: 'success', text: 'Yangi reja bosqichi qo‘shildi.' });
      setMilestoneModalOpen(false);
      setMilestoneForm({ title: '', dueDate: '', stage: 'B_ACTIVE_RESEARCH', notes: '' });
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Milestone Complete
  const handleToggleMilestone = async (milestoneId, currentStatus) => {
    try {
      const res = await fetch(`/api/dashboard/supervisions/${id}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          isCompleted: !currentStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Milestone yangilashda xatolik');
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Add Report
  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hisobot topshirishda xatolik');

      setMessage({ type: 'success', text: 'Attestatsiya hisoboti muvaffaqiyatli topshirildi.' });
      setReportModalOpen(false);
      setReportForm({ periodName: '', content: '', fileUrl: '' });
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Save Checklist
  const handleSaveChecklist = async (e) => {
    e?.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${id}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checklist yangilashda xatolik');

      setMessage({ type: 'success', text: 'Himoya oldi tekshiruvlari saqlandi.' });
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch scholar publications for linking
  const openPublicationModal = async () => {
    setPublicationModalOpen(true);
    try {
      setPubsLoading(true);
      const res = await fetch('/api/dashboard/publications');
      const data = await res.json();
      if (res.ok && data.publications) {
        const linkedIds = new Set((supervision?.publications || []).map((p) => p.publicationId));
        setAvailablePubs(data.publications.filter((p) => !linkedIds.has(p.id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPubsLoading(false);
    }
  };

  // Link publication
  const handleLinkPublication = async (publicationId) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/dashboard/supervisions/${id}/publications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nashrni bog‘lashda xatolik');

      setMessage({ type: 'success', text: 'Nashr muvaffaqiyatli bog‘landi!' });
      setPublicationModalOpen(false);
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Unlink publication
  const handleUnlinkPublication = async (publicationId) => {
    if (!confirm('Ushbu nashrni ilmiy izlanishdan uzishni tasdiqlaysizmi?')) return;
    try {
      const res = await fetch(`/api/dashboard/supervisions/${id}/publications?publicationId=${publicationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nashrni uzishda xatolik');
      fetchSupervision();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Ilmiy rahbarlik jarayoni yuklanmoqda...</p>
      </div>
    );
  }

  if (!supervision) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Izlanuvchi topilmadi</h2>
        <Link
          href="/dashboard/supervisions"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Rahbarlik ro‘yxatiga qaytish
        </Link>
      </div>
    );
  }

  const currentStageMeta = STAGES[supervision.stage] || STAGES.A_DRAFT;

  // Inactivity calculation (> 45 days)
  let daysSinceLastMeeting = null;
  let isMeetingInactive = false;
  if (supervision.meetings && supervision.meetings.length > 0) {
    const lastDate = new Date(supervision.meetings[0].meetingDate);
    daysSinceLastMeeting = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    if (daysSinceLastMeeting > 45 && supervision.stage === 'B_ACTIVE_RESEARCH') {
      isMeetingInactive = true;
    }
  } else if (supervision.stage === 'B_ACTIVE_RESEARCH') {
    const createdDate = new Date(supervision.createdAt);
    daysSinceLastMeeting = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    if (daysSinceLastMeeting > 45) isMeetingInactive = true;
  }

  // Next Step Configuration
  let nextStepButton = null;
  if (supervision.stage === 'A_DRAFT') {
    nextStepButton = (
      <button
        onClick={() => handleTransition('A_SUBMITTED_DEPARTMENT')}
        disabled={actionLoading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Kafedraga yuborish</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  } else if (supervision.stage === 'A_SUBMITTED_DEPARTMENT') {
    nextStepButton = (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Kafedra ko‘rib chiqmoqda</span>
        </span>
        <button
          onClick={() => handleTransition('A_DRAFT', { reason: 'Muallif tomonidan qaytarib olindi' })}
          className="text-xs text-slate-500 hover:text-rose-600 underline"
        >
          Qaytarib olish
        </button>
      </div>
    );
  } else if (supervision.stage === 'A_DEPARTMENT_APPROVED') {
    nextStepButton = (
      <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span>Rektorat buyrug‘i kutilmoqda</span>
      </span>
    );
  } else if (supervision.stage === 'B_ACTIVE_RESEARCH') {
    nextStepButton = (
      <button
        onClick={() => setTransitionModal({ open: true, targetStage: 'C_PUBLICATIONS_READY' })}
        disabled={actionLoading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Nashrlar talabiga o‘tish (C qism)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  } else if (supervision.stage === 'C_PUBLICATIONS_READY') {
    nextStepButton = (
      <button
        onClick={() => setTransitionModal({ open: true, targetStage: 'D_PRE_DEFENSE' })}
        disabled={actionLoading}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
      >
        <FileCheck className="w-3.5 h-3.5" />
        <span>Himoya oldiga o‘tkazish (D qism)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  } else if (supervision.stage === 'D_PRE_DEFENSE') {
    const isAllReady = supervision.checklist?.allRequirementsMet;
    nextStepButton = (
      <button
        onClick={() => setTransitionModal({ open: true, targetStage: 'E_COMPLETED' })}
        disabled={actionLoading || !isAllReady}
        title={!isAllReady ? 'Avval barcha checklist talablarini bajaring' : ''}
        className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition ${
          isAllReady
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-slate-400 cursor-not-allowed opacity-75'
        }`}
      >
        <Award className="w-3.5 h-3.5" />
        <span>Himoyani yakunlash (E qism)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  } else if (supervision.stage === 'E_COMPLETED') {
    nextStepButton = (
      <span className="px-3 py-1.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Muvaffaqiyatli himoya qilingan</span>
      </span>
    );
  }

  // Milestones progress
  const milestones = supervision.milestones || [];
  const completedMilestones = milestones.filter((m) => m.isCompleted);
  const milestonePercent = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;

  // BUILD THE VERTICAL PROCESS TIMELINE (Exactly as shown in Image 2)
  const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return (
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  };

  const getStageGroupIndex = (stage) => {
    if (stage.startsWith('A_')) return 0;
    if (stage === 'B_ACTIVE_RESEARCH') return 1;
    if (stage === 'C_PUBLICATIONS_READY') return 2;
    if (stage === 'D_PRE_DEFENSE') return 3;
    if (stage === 'E_COMPLETED') return 4;
    return 1; // Default to B for ON_HOLD / other
  };

  const currentGroupIndex = getStageGroupIndex(supervision.stage);

  const timelineSteps = [
    {
      groupIndex: 0,
      title: 'A qism: Ariza va Tasdiq',
      icon: FileText,
      color: 'emerald',
      dateText: formatDateTime(supervision.createdAt) || 'Jan 15, 2026, 09:00 AM',
      description: 'Izlanuvchi ma’lumotlari va dissertatsiya mavzusi kafedraga kiritildi, muhokama qilindi va rektorat buyrug‘iga ma’qullandi.',
    },
    {
      groupIndex: 1,
      title: 'B qism: Reja va Faol Tadqiqot',
      icon: GraduationCap,
      color: 'indigo',
      dateText:
        formatDateTime(supervision.startDate || supervision.orderDate) ||
        (currentGroupIndex >= 1 ? 'Feb 1, 2026, 10:30 AM' : 'Rejalashtirilgan'),
      description: 'Rektoratning rasmiy biriktirish buyrug‘i qabul qilindi. 3 yillik shaxsiy ish rejasi (Milestones), har 45 kunlik ilmiy maslahat uchrashuvlari va davriy hisobotlar olib borilmoqda.',
    },
    {
      groupIndex: 2,
      title: 'C qism: Ilmiy nashrlar talabi',
      icon: BookOpen,
      color: 'purple',
      dateText:
        formatDateTime(supervision.publications?.[0]?.addedAt) ||
        (currentGroupIndex >= 2 ? 'Oct 15, 2026, 02:00 PM' : 'Rejalashtirilgan'),
      description: 'OAK talabidagi milliy ilmiy jurnallar va xalqaro indekslangan (Scopus / Web of Science) bazalardagi ilmiy maqolalar to‘liq chop etildi va profilga bog‘landi.',
    },
    {
      groupIndex: 3,
      title: 'D qism: Himoya oldi & Checklist',
      icon: FileCheck,
      color: 'teal',
      dateText:
        formatDateTime(supervision.checklist?.updatedAt) ||
        (currentGroupIndex >= 3 ? 'Nov 1, 2026, 11:00 AM' : 'Kutilmoqda'),
      description: 'Dissertatsiyaning to‘liq matni, avtoreferat, kafedra seminari bayonnomasi hamda antiplagiat (kamida 80%) tekshiruvi xulosasi tasdiqlandi.',
    },
    {
      groupIndex: 4,
      title: 'E qism: Ilmiy Kengash himoyasi & Yakun',
      icon: Trophy,
      color: 'amber',
      dateText:
        formatDateTime(supervision.actualDefenseDate || supervision.expectedDefenseDate) ||
        (currentGroupIndex >= 4 ? 'Dec 1, 2026, 04:00 PM' : 'Kutilmoqda'),
      description: 'Ixtisoslashgan Ilmiy Kengashda rasmiy himoya muvaffaqiyatli o‘tdi, OAK diplomi tasdiqlandi va rahbar olimga reyting balli (+6 / +10) biriktirildi.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/supervisions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ilmiy rahbarliklar ro‘yxati</span>
        </Link>
        <div className="flex items-center gap-2">
          {supervision.stage !== 'TERMINATED' && supervision.stage !== 'E_COMPLETED' && (
            <button
              onClick={() => setTransitionModal({ open: true, targetStage: 'ON_HOLD' })}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition shadow-xs"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Muzlatish (On Hold)</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner if message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inactivity Alert */}
      {isMeetingInactive && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-xs">Ilmiy uchrashuv qayd etilmaganiga {daysSinceLastMeeting} kun bo‘ldi!</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                OAK va universitet qoidasiga ko‘ra, faol bosqichda har 45 kunda kamida bir marta ilmiy maslahat uchrashuvi o‘tkazilishi shart.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('meetings');
              setMeetingModalOpen(true);
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition"
          >
            + Uchrashuv qayd etish
          </button>
        </div>
      )}

      {/* HERO CARD & NEXT STEP ACTION */}
      <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {supervision.degreeType}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg ${currentStageMeta.badge}`}>
                {currentStageMeta.title}
              </span>
              {supervision.specialtyCode && (
                <span className="text-xs text-slate-500 font-mono">
                  {supervision.specialtyCode} {supervision.specialtyName ? `— ${supervision.specialtyName}` : ''}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {supervision.studentName}
            </h1>

            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
              <span className="text-slate-400 font-normal">Mavzu: </span>
              {supervision.dissertationTitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              {supervision.studentEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {supervision.studentEmail}
                </span>
              )}
              {supervision.studentPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {supervision.studentPhone}
                </span>
              )}
              {supervision.orderNumber && (
                <span className="flex items-center gap-1 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  Buyruq № {supervision.orderNumber}
                </span>
              )}
            </div>
          </div>

          {/* SUPERVISOR 3-DECISION CONTROL PANEL */}
          <div className="flex flex-col items-start lg:items-end gap-1.5 shrink-0 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Ilmiy Rahbar Qarorlari (3 xil amal)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* 1. TASDIQLASH (Asosiy amal) */}
              {nextStepButton}

              {supervision.stage !== 'E_COMPLETED' && supervision.stage !== 'TERMINATED' && (
                <>
                  {/* 2. TUZATISHGA QAYTARISH */}
                  <button
                    onClick={() => setDecisionModal({ open: true, type: 'REVISION', notes: '' })}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    title="Shogirdga kamchiliklar va izohlar bilan tuzatishga qaytarish"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tuzatishga qaytarish</span>
                  </button>

                  {/* 3. RAD ETISH */}
                  <button
                    onClick={() => setDecisionModal({ open: true, type: 'REJECT', notes: '' })}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    title="Asosli sabab bilan jarayonni rad etish yoki to‘xtatish"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Rad etish</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { key: 'process', label: 'Jarayon (Timeline)', icon: Clock, count: null },
          { key: 'overview', label: 'Tafsilotlar', icon: FileText, count: null },
          { key: 'milestones', label: 'Reja', icon: CheckSquare, count: milestones.length },
          { key: 'meetings', label: 'Uchrashuvlar', icon: Users, count: supervision.meetings?.length || 0 },
          { key: 'reports', label: 'Hisobotlar', icon: FileSpreadsheet, count: supervision.reports?.length || 0 },
          { key: 'publications', label: 'Nashrlar', icon: BookOpen, count: supervision.publications?.length || 0 },
          { key: 'checklist', label: 'Hujjatlar (Checklist)', icon: FileCheck, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: PROCESS TIMELINE (EXACTLY AS IN IMAGE 2) */}
      {activeTab === 'process' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lengthwise Timeline Card */}
          <div className="lg:col-span-2 neu-card p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Ilmiy rahbarlik jarayoni va bosqichlar zanjiri</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arizadan boshlab rasmiy himoyagacha bo‘lgan barcha davrlar va muddatlar monitoringi
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {currentGroupIndex + 1} / 5 Bosqich
              </span>
            </div>

            {/* VERTICAL TIMELINE CONTAINER WITH ANIMATION */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.1 },
                },
              }}
              className="relative pl-2 sm:pl-4 space-y-8"
            >
              {timelineSteps.map((step, idx) => {
                const isLast = idx === timelineSteps.length - 1;
                const isCompleted =
                  supervision.stage === 'E_COMPLETED' || idx < currentGroupIndex;
                const isActive =
                  supervision.stage !== 'E_COMPLETED' && idx === currentGroupIndex;
                const isPending = !isCompleted && !isActive;

                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.title}
                    variants={{
                      hidden: { opacity: 0, y: 15, x: -10 },
                      visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.4 } },
                    }}
                    className="relative flex items-start gap-4 sm:gap-6 group"
                  >
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[15px] sm:left-[17px] top-[34px] bottom-[-32px] w-[2px] transition-colors duration-500 ${
                          isCompleted
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    )}

                    {/* Timeline Node Icon with dedicated Stage Graphic & Micro-animation */}
                    <div className="relative shrink-0 z-10">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25"
                        >
                          <StepIcon className="w-4 h-4 text-white" />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        </motion.div>
                      ) : isActive ? (
                        <div className="relative">
                          {/* Pulsing halo ring */}
                          <motion.span
                            className="absolute -inset-1.5 rounded-full border-2 border-blue-500/50 bg-blue-500/10"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          />
                          <motion.div
                            animate={{ y: [0, -2, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 text-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20"
                          >
                            <StepIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center transition-colors group-hover:border-slate-400">
                          <StepIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div className="pt-0.5 space-y-1.5 flex-1 min-w-0">
                      {/* Timestamp (Image 2 style) */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {step.dateText}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 animate-pulse">
                            Joriy faol bosqich
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Bajarilgan
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-base font-bold tracking-tight ${
                          isActive
                            ? 'text-blue-900 dark:text-blue-300 font-extrabold'
                            : isCompleted
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                        {step.description}
                      </p>

                      {/* Contextual Box if Active */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="text-blue-900 dark:text-blue-200">
                            <span className="font-bold block">Ushbu bosqich holati:</span>
                            <span>{currentStageMeta.title}</span>
                          </div>
                          <div>{nextStepButton}</div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Right Column: Quick Stats & Navigator */}
          <div className="space-y-6">
            {/* Progress Gauge */}
            <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Reja ko‘rsatkichi</span>
                <span className="text-blue-600 font-bold">{milestonePercent}%</span>
              </h3>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {milestones.length} ta asosiy bosqichdan {completedMilestones.length} tasi yakunlangan.
              </p>
            </div>

            {/* Quick Tab Jumpers */}
            <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bo‘limlarga tezkor o‘tish
              </h3>
              <div className="space-y-1.5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('milestones')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>Ish rejalari (Milestones)</span>
                  </span>
                  <span className="text-slate-400 font-mono">{milestones.length} ta</span>
                </button>
                <button
                  onClick={() => setActiveTab('meetings')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Ilmiy uchrashuvlar</span>
                  </span>
                  <span className="text-slate-400 font-mono">{supervision.meetings?.length || 0} ta</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>Attestatsiya hisobotlari</span>
                  </span>
                  <span className="text-slate-400 font-mono">{supervision.reports?.length || 0} ta</span>
                </button>
                <button
                  onClick={() => setActiveTab('publications')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Bog‘langan nashrlar</span>
                  </span>
                  <span className="text-slate-400 font-mono">{supervision.publications?.length || 0} ta</span>
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-slate-700 dark:text-slate-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Himoya oldi Checklist</span>
                  </span>
                  <span className="text-slate-400 font-mono">
                    {supervision.checklist?.allRequirementsMet ? 'Tayyor' : 'Jarayonda'}
                  </span>
                </button>
              </div>
            </div>

            {/* Mentor info card: Scholar Card Style with Circular Avatar */}
            <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ilmiy rahbar profili
                </span>
                {supervision.scholar?.tiuScore > 0 && (
                  <div className="text-right bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-xl border border-blue-200/60 dark:border-blue-900/60">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block leading-none">
                      TIU SCORE
                    </span>
                    <span className="font-mono text-xs font-extrabold text-blue-900 dark:text-blue-300 tabular-nums">
                      {Math.round(supervision.scholar?.tiuScore || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Scholar Circular Avatar & Info */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <ScholarAvatar
                    photoUrl={supervision.scholar?.photoUrl}
                    fullName={supervision.scholar?.fullName}
                    className="w-14 h-14 ring-[3px] ring-blue-500 dark:ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm"
                  />
                  {(supervision.scholar?.academicDegree === 'DSC' || supervision.scholar?.academicDegree === 'PHD') && (
                    <span
                      className={`absolute -bottom-1 -right-1 z-10 font-mono text-[9px] font-extrabold leading-none px-1.5 py-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs ${
                        supervision.scholar?.academicDegree === 'DSC'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-sky-500 text-white'
                      }`}
                    >
                      {supervision.scholar?.academicDegree}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug truncate hover:text-blue-600 transition">
                    {supervision.scholar?.fullName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1">
                    {supervision.scholar?.academicTitle && supervision.scholar.academicTitle !== 'NONE' && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {supervision.scholar.academicTitle}
                      </span>
                    )}
                    {supervision.scholar?.positionUz && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-medium truncate max-w-[140px]">
                        {supervision.scholar.positionUz}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {supervision.scholar?.department?.nameUz || 'Tashkent International University'}
                  </p>
                </div>
              </div>

              {/* Scholar Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block font-medium">Nashrlar</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {supervision.scholar?.publications?.length || 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block font-medium">Iqtiboslar</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {supervision.scholar?.totalCitations || 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block font-medium">h-index</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {supervision.scholar?.hIndex || 0}
                  </span>
                </div>
              </div>

              {/* Verified IDs & View Profile */}
              <div className="space-y-2 pt-1">
                {(supervision.scholar?.orcidId || supervision.scholar?.scopusId) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {supervision.scholar?.orcidId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                        ORCID: {supervision.scholar.orcidId}
                      </span>
                    )}
                    {supervision.scholar?.scopusId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-semibold border border-cyan-200/60 dark:border-cyan-800/60">
                        Scopus ID: {supervision.scholar.scopusId}
                      </span>
                    )}
                  </div>
                )}

                <Link
                  href={`/scholars/${supervision.scholarId}`}
                  target="_blank"
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200/70 dark:border-slate-700"
                >
                  <span>Olim profilini ko‘rish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TAFSILOTLAR (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Tadqiqot tafsilotlari
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Izlanuvchi F.I.SH.</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{supervision.studentName}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Ilmiy daraja turi</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{supervision.degreeType}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 md:col-span-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Ixtisoslik</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {supervision.specialtyCode} — {supervision.specialtyName || 'Kiritilmagan'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 md:col-span-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Dissertatsiya mavzusi</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{supervision.dissertationTitle}</p>
                </div>
              </div>
            </div>

            <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Rasmiy buyruq va muddatlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Biriktirish buyrug‘i raqami</span>
                  <p className="font-semibold text-slate-900 dark:text-white font-mono">
                    {supervision.orderNumber || 'Hali kiritilmagan'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Buyruq sanasi</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {supervision.orderDate ? new Date(supervision.orderDate).toLocaleDateString() : 'Belgilanmagan'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Boshlangan sana</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {supervision.startDate ? new Date(supervision.startDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block mb-0.5">Kutilayotgan himoya sanasi</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {supervision.expectedDefenseDate
                      ? new Date(supervision.expectedDefenseDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Ilmiy rahbar
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                  {supervision.scholar?.fullName?.charAt(0) || 'R'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {supervision.scholar?.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {supervision.scholar?.academicDegree || 'Olim'} • {supervision.scholar?.department?.nameUz || 'TIU'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REJA (MILESTONES) */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ilmiy tadqiqot rejasi (Milestones)</h3>
              <p className="text-xs text-slate-500">
                Har bir bosqich uchun aniq muddat va natijalar monitoringi.
              </p>
            </div>
            <button
              onClick={() => setMilestoneModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Yangi bosqich qo‘shish
            </button>
          </div>

          <div className="space-y-3">
            {milestones.length === 0 ? (
              <div className="p-8 text-center neu-card rounded-2xl text-slate-500 text-sm">
                Hozircha reja bosqichlari mavjud emas. (FAOL bosqichiga o‘tganda avtomatik shakllanadi).
              </div>
            ) : (
              milestones.map((milestone) => {
                const isOverdue = !milestone.isCompleted && new Date(milestone.dueDate) < new Date();
                return (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                      milestone.isCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : isOverdue
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleMilestone(milestone.id, milestone.isCompleted)}
                        className={`mt-0.5 p-1 rounded-lg transition ${
                          milestone.isCompleted
                            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40'
                            : 'text-slate-400 hover:text-blue-600 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-semibold text-sm ${
                              milestone.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {milestone.title}
                          </p>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Muddati o‘tgan
                            </span>
                          )}
                        </div>
                        {milestone.notes && <p className="text-xs text-slate-500">{milestone.notes}</p>}
                      </div>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <span className="text-slate-400 block">Belgilangan muddat:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: UCHRASHUVLAR (MEETINGS) */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ilmiy maslahat uchrashuvlari</h3>
              <p className="text-xs text-slate-500">
                Izlanuvchi bilan muhokama qilingan masalalar va topshiriqlar jurnali.
              </p>
            </div>
            <button
              onClick={() => setMeetingModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Uchrashuv qayd etish
            </button>
          </div>

          <div className="space-y-4">
            {(supervision.meetings || []).length === 0 ? (
              <div className="p-8 text-center neu-card rounded-2xl text-slate-500 text-sm">
                Hozircha birorta ham ilmiy uchrashuv qayd etilmagan.
              </div>
            ) : (
              supervision.meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-5 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.meetingDate).toLocaleDateString()}
                    </span>
                    {meeting.nextMeetingDate && (
                      <span className="text-slate-500">
                        Keyingi reja: {new Date(meeting.nextMeetingDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Muhokama qilingan masalalar:
                    </span>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                      {meeting.topicsCovered}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Topshiriqlar:
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl whitespace-pre-line border border-slate-200/50 dark:border-slate-800">
                      {meeting.tasksAssigned}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: HISOBOTLAR (REPORTS) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Davriy attestatsiya hisobotlari</h3>
              <p className="text-xs text-slate-500">
                Yarim yillik va yillik bajarilgan ishlar hisoboti.
              </p>
            </div>
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Yangi hisobot topshirish
            </button>
          </div>

          <div className="space-y-4">
            {(supervision.reports || []).length === 0 ? (
              <div className="p-8 text-center neu-card rounded-2xl text-slate-500 text-sm">
                Topshirilgan hisobotlar mavjud emas.
              </div>
            ) : (
              supervision.reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{report.periodName}</h4>
                      <p className="text-xs text-slate-400">
                        Topshirilgan: {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        report.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : report.status === 'NEEDS_REVISION'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {report.status === 'ACCEPTED'
                        ? 'Qabul qilingan'
                        : report.status === 'NEEDS_REVISION'
                        ? 'Qayta ishlashga qaytarilgan'
                        : 'Ko‘rib chiqilmoqda'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    {report.content}
                  </p>

                  {report.feedback && (
                    <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                      <span className="font-bold block mb-0.5">Ekspert / Moderator izohi:</span>
                      {report.feedback}
                    </div>
                  )}

                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Biriktirilgan hisobot fayli
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: NASHRLAR (PUBLICATIONS) */}
      {activeTab === 'publications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dissertatsiya bo‘yicha ilmiy nashrlar (C qism)
              </h3>
              <p className="text-xs text-slate-500">
                Mavjud nashrlaringiz bazasidan tanlab bog‘lanadi (ma’lumot takrorlanmaydi).
              </p>
            </div>
            <button
              onClick={openPublicationModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Nashrni bog‘lash
            </button>
          </div>

          <div className="space-y-3">
            {(supervision.publications || []).length === 0 ? (
              <div className="p-8 text-center neu-card rounded-2xl text-slate-500 text-sm">
                Hozircha birorta ham nashr bog‘lanmagan. "+ Nashrni bog‘lash" tugmasi orqali profil nashrlaringizdan tanlang.
              </div>
            ) : (
              supervision.publications.map((sp) => (
                <div
                  key={sp.id}
                  className="p-4 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {sp.publication?.type || 'MAQOLA'}
                      </span>
                      {sp.publication?.year && (
                        <span className="text-xs text-slate-400 font-medium">{sp.publication.year}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {sp.publication?.title}
                    </h4>
                    <p className="text-xs text-slate-500">{sp.publication?.journalOrConference}</p>
                    {sp.publication?.doi && (
                      <a
                        href={`https://doi.org/${sp.publication.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        DOI: {sp.publication.doi} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleUnlinkPublication(sp.publicationId)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Nashrni uzish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: HUJJATLAR & VERSIYALAR TARIXI (CHECKLIST - D QISM) */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* VERSION HISTORY SECTION */}
          <div className="neu-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Hujjatlar va Fayl Versiyalari Tarixi (Version History)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Izlanuvchi yuklagan har bir versiya (v1, v2, v3...) arxivlanadi va rahbarga bildirishnoma yuboriladi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDocUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi versiya yuklash</span>
              </button>
            </div>

            {documentVersions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                Hozircha rasmiy fayl versiyalari yuklanmagan. Birinchi versiyani (v1) yuklash uchun yuqoridagi tugmani bosing.
              </div>
            ) : (
              <div className="space-y-3">
                {documentVersions.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          v{doc.versionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {doc.documentType === 'DISSERTATION'
                            ? 'Dissertatsiya matni'
                            : doc.documentType === 'AUTOREFERAT'
                            ? 'Avtoreferat'
                            : doc.documentType === 'REPORT'
                            ? 'Attestatsiya hisoboti'
                            : doc.documentType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(doc.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 truncate"
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.fileName}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      {doc.uploaderNotes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          &ldquo;{doc.uploaderNotes}&rdquo;
                        </p>
                      )}

                      {doc.reviewComment && (
                        <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900 mt-1">
                          <span className="font-bold block">Rahbar xulosasi:</span>
                          {doc.reviewComment}
                        </div>
                      )}
                    </div>

                    {/* Review Verdict / Action for Supervisor */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {doc.reviewDecision === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlangan
                        </span>
                      ) : doc.reviewDecision === 'NEEDS_REVISION' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                          <RefreshCw className="w-3.5 h-3.5" /> Tuzatishga qaytarilgan
                        </span>
                      ) : doc.reviewDecision === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Rad etilgan
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReviewDocumentVersion(doc.id, 'APPROVED', 'Talablarga to‘liq javob beradi.')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition"
                          >
                            Tasdiqlash
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt('Tuzatish izohini kiriting:');
                              if (note) handleReviewDocumentVersion(doc.id, 'NEEDS_REVISION', note);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition"
                          >
                            Qaytarish
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt('Rad etish sababini kiriting:');
                              if (note) handleReviewDocumentVersion(doc.id, 'REJECTED', note);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold transition"
                          >
                            Rad etish
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Himoyaga tayyorlik tekshiruvi (D qism Checklist)
            </h3>
            <p className="text-xs text-slate-500">
              OAK va universitet talablariga muvofiq barcha bandlar to‘liq bajarilmaguncha himoyaga qabul qilib bo‘lmaydi.
            </p>
          </div>

          <form onSubmit={handleSaveChecklist} className="space-y-4">
            {/* Checklist 1: Dissertation */}
            <div className="p-4 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistForm.isDissertationReady}
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, isDissertationReady: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  1. Dissertatsiyaning to‘liq yakuniy matni tayyor
                </span>
              </label>
              <input
                type="url"
                placeholder="Dissertatsiya PDF hujjati havolasi (Google Drive / Cloud URL)"
                value={checklistForm.dissertationFileUrl}
                onChange={(e) =>
                  setChecklistForm({ ...checklistForm, dissertationFileUrl: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
              />
            </div>

            {/* Checklist 2: Autoreferat */}
            <div className="p-4 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistForm.isAutoreferatReady}
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, isAutoreferatReady: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Avtoreferat tayyorlangan va tasdiqlangan
                </span>
              </label>
              <input
                type="url"
                placeholder="Avtoreferat hujjati havolasi"
                value={checklistForm.autoreferatFileUrl}
                onChange={(e) =>
                  setChecklistForm({ ...checklistForm, autoreferatFileUrl: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
              />
            </div>

            {/* Checklist 3: Seminar approval */}
            <div className="p-4 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistForm.isSeminarApproved}
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, isSeminarApproved: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  3. Ilmiy seminar (Kafedra kengashi) dastlabki muhokamasi xulosasi va protokoli
                </span>
              </label>
              <input
                type="url"
                placeholder="Seminar bayonnomasi / protokoli havolasi"
                value={checklistForm.seminarProtocolUrl}
                onChange={(e) =>
                  setChecklistForm({ ...checklistForm, seminarProtocolUrl: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
              />
            </div>

            {/* Checklist 4: Antiplagiat */}
            <div className="p-4 rounded-2xl neu-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistForm.isPlagiarismPassed}
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, isPlagiarismPassed: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  4. Antiplagiat tekshiruvi xulosasi (Kamida 80% o‘zlashtirilmagan mustaqil matn)
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Antiplagiat foizi (masalan: 86.5)"
                  value={checklistForm.plagiarismPercent}
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, plagiarismPercent: e.target.value })
                  }
                  className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                />
                <input
                  type="url"
                  placeholder="Tekshiruv sertifikati / xulosasi havolasi"
                  value={checklistForm.plagiarismReportUrl}
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, plagiarismReportUrl: e.target.value })
                  }
                  className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Hujjatlar holatini saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: STAGE TRANSITION */}
      <AnimatePresence>
        {transitionModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" /> Bosqichni o‘zgartirish
                </h3>
                <button
                  onClick={() => setTransitionModal({ open: false, targetStage: null })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Mo‘ljallangan yangi bosqich:{' '}
                <strong className="text-blue-600">{transitionModal.targetStage}</strong>
              </p>

              {transitionModal.targetStage === 'E_COMPLETED' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Haqiqiy himoya sanasi *
                    </label>
                    <input
                      type="date"
                      required
                      value={transitionPayload.actualDefenseDate}
                      onChange={(e) =>
                        setTransitionPayload({ ...transitionPayload, actualDefenseDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ilmiy Kengash raqami *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: DSc.03/30.12.2021.T.05.01"
                      value={transitionPayload.defenseCouncilNo}
                      onChange={(e) =>
                        setTransitionPayload({ ...transitionPayload, defenseCouncilNo: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      OAK Diplomi raqami
                    </label>
                    <input
                      type="text"
                      placeholder="01 № 012345"
                      value={transitionPayload.diplomaNumber}
                      onChange={(e) =>
                        setTransitionPayload({ ...transitionPayload, diplomaNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                    />
                  </div>
                </div>
              )}

              {transitionModal.targetStage === 'ON_HOLD' && (
                <div className="text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Muzlatish sababi
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Muddati to‘xtatilish sababi (masalan: akademik ta’til)"
                    value={transitionPayload.reason}
                    onChange={(e) =>
                      setTransitionPayload({ ...transitionPayload, reason: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTransitionModal({ open: false, targetStage: null })}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleTransition(transitionModal.targetStage)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {actionLoading ? 'Bajarilmoqda...' : 'Tasdiqlash va o‘tkazish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUPERVISOR DECISION (TUZATISHGA QAYTARISH / RAD ETISH) */}
      <AnimatePresence>
        {decisionModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  {decisionModal.type === 'REVISION' ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-amber-600" />
                      <span>Shogirdga tuzatishga qaytarish</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Tadqiqotni rad etish / bekor qilish</span>
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setDecisionModal({ open: false, type: 'REVISION', notes: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div
                  className={`p-3 rounded-xl border ${
                    decisionModal.type === 'REVISION'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {decisionModal.type === 'REVISION' ? (
                    <p>
                      Ushbu amal izlanuvchiga xabarnoma yuboradi va uning tadqiqotini tuzatish talabi bilan
                      qaytadan ko‘rib chiqishga yo‘naltiradi.
                    </p>
                  ) : (
                    <p>
                      <strong>Diqqat!</strong> Ushbu qaror tadqiqot jarayonini rasman to‘xtatadi (TERMINATED)
                      va sabab audit jurnalida saqlanadi.
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {decisionModal.type === 'REVISION' ? 'Tuzatish talablari va izoh *' : 'Rad etishning asosli sababi *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      decisionModal.type === 'REVISION'
                        ? 'Masalan: 2-bob adabiyotlar tahlilini Scopus maqolalari bilan boyiting va antiplagiat foizini 85% dan oshiring...'
                        : 'Masalan: Universitet ichki tartib qoidalari va ilmiy reja muddatlari surunkali buzilganligi sababli...'
                    }
                    value={decisionModal.notes}
                    onChange={(e) => setDecisionModal({ ...decisionModal, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDecisionModal({ open: false, type: 'REVISION', notes: '' })}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !decisionModal.notes.trim()}
                  onClick={handleSupervisorDecision}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 ${
                    decisionModal.type === 'REVISION'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionLoading ? 'Yuborilmoqda...' : decisionModal.type === 'REVISION' ? 'Izoh bilan qaytarish' : 'Rad etishni tasdiqlash'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: UPLOAD NEW DOCUMENT VERSION (IZLANUVCHI & RAHBAR UCHUN) */}
      <AnimatePresence>
        {docUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Yangi Hujjat Versiyasini Yuklash</span>
                </h3>
                <button
                  onClick={() => setDocUploadModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadDocumentVersion} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Hujjat turi *
                  </label>
                  <select
                    value={docUploadForm.documentType}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, documentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="DISSERTATION">Dissertatsiyaning to‘liq matni</option>
                    <option value="AUTOREFERAT">Avtoreferat</option>
                    <option value="REPORT">Davriy attestatsiya hisoboti</option>
                    <option value="SEMINAR_PROTOCOL">Kafedra seminari bayonnomasi</option>
                    <option value="ARTICLE">Ilmiy maqola qoralamasi</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Fayl nomi / Sarlavha *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Dissertatsiya_1_va_2_boblar_oxirgi_tahrir.pdf"
                    value={docUploadForm.fileName}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, fileName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Fayl havolasi (URL / Cloud storage / PDF havola) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... yoki https://tiu.uz/files/..."
                    value={docUploadForm.fileUrl}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, fileUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ushbu versiya bo‘yicha izoh (Changelog / Nimalar o‘zgardi)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Masalan: Rahbar talabiga ko‘ra 1.3-paragrafga 6 ta yangi Scopus maqolasi tahlili qo‘shildi..."
                    value={docUploadForm.uploaderNotes}
                    onChange={(e) => setDocUploadForm({ ...docUploadForm, uploaderNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDocUploadModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    {actionLoading ? 'Saqlanmoqda...' : 'Versiyani saqlash va rahbarga bildirish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD MEETING */}
      <AnimatePresence>
        {meetingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> Ilmiy uchrashuvni qayd etish
                </h3>
                <button onClick={() => setMeetingModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMeeting} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Uchrashuv sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingForm.meetingDate}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Muhokama qilingan masalalar *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ilmiy tadqiqot metodikasi, ko‘rib chiqilgan adabiyotlar..."
                    value={meetingForm.topicsCovered}
                    onChange={(e) => setMeetingForm({ ...meetingForm, topicsCovered: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Izlanuvchiga yuklatilgan topshiriqlar *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="1-bob xulosasini tayyorlash, OAK talabidagi maqola qoralamasi..."
                    value={meetingForm.tasksAssigned}
                    onChange={(e) => setMeetingForm({ ...meetingForm, tasksAssigned: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Keyingi uchrashuv sanasi (ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={meetingForm.nextMeetingDate}
                    onChange={(e) => setMeetingForm({ ...meetingForm, nextMeetingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setMeetingModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Saqlanmoqda...' : 'Qayd etish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD MILESTONE */}
      <AnimatePresence>
        {milestoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" /> Yangi reja bosqichi qo‘shish
                </h3>
                <button onClick={() => setMilestoneModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bosqich nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: 2-bob tajriba natijalarini jamlash"
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Oxirgi muddat (Due Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Qo‘shimcha izoh
                  </label>
                  <textarea
                    rows={2}
                    value={milestoneForm.notes}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setMilestoneModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Saqlanmoqda...' : 'Qo‘shish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD REPORT */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Attestatsiya hisobotini topshirish
                </h3>
                <button onClick={() => setReportModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddReport} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Davr nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: 2026/2027 1-yarim yillik monitoring"
                    value={reportForm.periodName}
                    onChange={(e) => setReportForm({ ...reportForm, periodName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bajarilgan ishlar hisoboti matni *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Davr mobaynida nashr etilgan maqolalar, yozilgan boblar va erishilgan natijalar..."
                    value={reportForm.content}
                    onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    PDF fayl havolasi (Google Drive / Cloud URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={reportForm.fileUrl}
                    onChange={(e) => setReportForm({ ...reportForm, fileUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    {actionLoading ? 'Yuborilmoqda...' : 'Topshirish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LINK PUBLICATION */}
      <AnimatePresence>
        {publicationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neu-card bg-white dark:bg-slate-900 max-w-xl w-full p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> Profilingizdagi mavjud nashrni bog‘lash
                </h3>
                <button onClick={() => setPublicationModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                {pubsLoading ? (
                  <div className="p-6 text-center text-xs text-slate-500">Nashrlar yuklanmoqda...</div>
                ) : availablePubs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Bog‘lash uchun yangi nashr topilmadi. (Barcha tasdiqlangan nashrlaringiz allaqachon bog‘langan bo‘lishi mumkin).
                  </div>
                ) : (
                  availablePubs.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-blue-600 block truncate">{pub.title}</span>
                        <span className="text-slate-400 block truncate">
                          {pub.journalOrConference || 'Jurnal'} ({pub.year})
                        </span>
                      </div>
                      <button
                        onClick={() => handleLinkPublication(pub.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shrink-0"
                      >
                        Bog‘lash
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
