'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  BookOpen,
  GraduationCap,
  FileText,
  Briefcase,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Link2,
  Copy,
  Check,
  AlertCircle,
  X,
  Percent,
  ShieldCheck,
  Award,
} from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'ALL', label: 'Barchasi', icon: Layers },
  { id: 'ARTICLE', label: 'Ilmiy Maqola', icon: BookOpen },
  { id: 'THESIS', label: 'Tezis (Konferensiya)', icon: FileText },
  { id: 'DISSERTATION', label: 'Dissertatsiya', icon: GraduationCap },
  { id: 'AUTOREFERAT', label: 'Avtoreferat', icon: Award },
  { id: 'MONOGRAPH', label: 'Monografiya', icon: BookOpen },
  { id: 'GRANT', label: 'Grant arizasi', icon: Briefcase },
];

const CREDIT_TAXONOMY = [
  'Conceptualization',
  'Methodology',
  'Software',
  'Validation',
  'Formal analysis',
  'Investigation',
  'Data curation',
  'Writing - original draft',
  'Writing - review & editing',
  'Visualization',
  'Supervision',
  'Funding acquisition',
];

export default function AcademicProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null); // When viewing / editing in workspace modal
  const [collabModalOpen, setCollabModalOpen] = useState(false);

  // New Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('ARTICLE');
  const [newTarget, setNewTarget] = useState('');
  const [newAbstract, setNewAbstract] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [creating, setCreating] = useState(false);

  // DOI Resolver Form
  const [doiInput, setDoiInput] = useState('');
  const [doiLoading, setDoiLoading] = useState(false);
  const [doiResult, setDoiResult] = useState(null);
  const [doiError, setDoiError] = useState('');

  // Collaborator Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('CO_AUTHOR');
  const [invitePercent, setInvitePercent] = useState('30');
  const [selectedCredit, setSelectedCredit] = useState(['Methodology', 'Writing - original draft']);
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Status message
  const [copiedCitation, setCopiedCitation] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academic-projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreating(true);
      const res = await fetch('/api/academic-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          abstract: newAbstract,
          keywords: newKeywords,
          targetJournal: newType === 'ARTICLE' ? newTarget : undefined,
          targetConference: newType === 'THESIS' ? newTarget : undefined,
          grantFunder: newType === 'GRANT' ? newTarget : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        setNewTitle('');
        setNewTarget('');
        setNewAbstract('');
        setNewKeywords('');
        await fetchProjects();
        // Open the workspace of newly created project
        setActiveProject(data.data);
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert('Loyiha yaratishda xatolik');
    } finally {
      setCreating(false);
    }
  };

  const handleResolveDoi = async () => {
    if (!doiInput.trim()) return;
    try {
      setDoiLoading(true);
      setDoiError('');
      setDoiResult(null);

      const res = await fetch('/api/academic-projects/doi-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doi: doiInput }),
      });

      const data = await res.json();
      if (data.success) {
        setDoiResult(data.data);
      } else {
        setDoiError(data.error || 'DOI maʼlumotlari topilmadi');
      }
    } catch (err) {
      setDoiError('Server bilan aloqa uzildi');
    } finally {
      setDoiLoading(false);
    }
  };

  const handleAddCitationToProject = async (citationText) => {
    if (!activeProject) return;

    let existingRefs = [];
    try {
      existingRefs = activeProject.referencesList ? JSON.parse(activeProject.referencesList) : [];
    } catch {
      existingRefs = [];
    }

    const newRefs = [...existingRefs, citationText];

    try {
      const res = await fetch(`/api/academic-projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referencesList: JSON.stringify(newRefs),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveProject({ ...activeProject, referencesList: JSON.stringify(newRefs) });
        setDoiResult(null);
        setDoiInput('');
        await fetchProjects();
      }
    } catch (err) {
      alert('Iqtibosni saqlashda xatolik');
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeProject) return;

    try {
      setInviting(true);
      setInviteSuccessMsg('');

      const res = await fetch(`/api/academic-projects/${activeProject.id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarEmail: inviteEmail,
          scholarName: inviteName,
          role: inviteRole,
          creditRoles: selectedCredit,
          sharePercent: parseFloat(invitePercent) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInviteSuccessMsg(data.message || 'Taklif muvaffaqiyatli yuborildi!');
        setInviteEmail('');
        setInviteName('');
        // Refresh project
        const refRes = await fetch(`/api/academic-projects/${activeProject.id}`);
        const refData = await refRes.json();
        if (refData.success) {
          setActiveProject(refData.data);
        }
        await fetchProjects();
      } else {
        alert(data.error || 'Taklif yuborishda xatolik');
      }
    } catch (err) {
      alert('Server xatosi');
    } finally {
      setInviting(false);
    }
  };

  const handleRespondInvite = async (inviteId, action) => {
    try {
      const res = await fetch('/api/academic-projects/collaborators/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, action }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProjects();
      } else {
        alert(data.error || 'Amalni bajarishda xatolik');
      }
    } catch {
      alert('Xatolik yuz berdi');
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(key);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesTab = activeTab === 'ALL' || p.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Research Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Ilmiy Loyihalar & Hammualliflik Ustaxonasi
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              Maqola, tezis, dissertatsiya, monografiya va grant arizalarini hammualliflar bilan yozish, DOI iqtiboslarini 1-klikda formatlash hamda Telegram bot orqali tasdiqlash markazi.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-lg hover:bg-emerald-50 active:scale-95 transition-all self-start md:self-auto"
          >
            <Plus className="w-5 h-5 text-emerald-700" />
            <span>Yangi Ilmiy Loyiha</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Jami Loyihalar</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{projects.length} ta</div>
          <p className="text-xs text-slate-400 mt-1">Barcha ilmiy yo‘nalishlar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Maqola & Tezislar</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {projects.filter((p) => p.type === 'ARTICLE' || p.type === 'THESIS').length} ta
          </div>
          <p className="text-xs text-slate-400 mt-1">Scopus, OAK va anjumanlar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Dissertatsiya & Grant</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {projects.filter((p) => ['DISSERTATION', 'AUTOREFERAT', 'GRANT', 'MONOGRAPH'].includes(p.type)).length} ta
          </div>
          <p className="text-xs text-slate-400 mt-1">Yirik ilmiy asarlar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Hammualliflar</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {projects.reduce((acc, p) => acc + (p.collaborators?.length || 0), 0)} kishi
          </div>
          <p className="text-xs text-slate-400 mt-1">CRediT jamoasi</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {PROJECT_TYPES.map((t) => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Loyiha kodi yoki mavzusi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loyihalar yuklanmoqda...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Ushbu bo‘limda ilmiy loyihalar mavjud emas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Yangi maqola, dissertatsiya yoki grant arizasini oching va hammualliflaringiz bilan birgalikda yozishni boshlang.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Loyiha yaratish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <motion.div
              key={p.id}
              layout
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {p.code}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                    {p.type}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition">
                  {p.title}
                </h3>

                {(p.targetJournal || p.targetConference || p.grantFunder) && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{p.targetJournal || p.targetConference || p.grantFunder}</span>
                  </p>
                )}

                {/* Collaborators Avatar Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center -space-x-2">
                    {p.collaborators?.slice(0, 4).map((c, idx) => (
                      <div
                        key={c.id || idx}
                        title={`${c.scholarName || c.scholarEmail} (${c.role} - ${c.sharePercent}%)`}
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-200 shadow-xs"
                      >
                        {(c.scholarName || c.scholarEmail)[0].toUpperCase()}
                      </div>
                    ))}
                    {p.collaborators?.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border-2 border-white flex items-center justify-center">
                        +{p.collaborators.length - 4}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-slate-500">
                    {p.collaborators?.length || 1} hammuallif
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(p.updatedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => setActiveProject(p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ustaxona (Workspace)</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>Yangi Ilmiy Loyiha Ochish</span>
                </h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loyiha Yo‘nalishi / Turi
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ARTICLE">Ilmiy Maqola (Scopus / OAK / Xalqaro)</option>
                    <option value="THESIS">Konferensiya Tezisi</option>
                    <option value="DISSERTATION">Dissertatsiya (PhD / DSc)</option>
                    <option value="AUTOREFERAT">Avtoreferat</option>
                    <option value="MONOGRAPH">Monografiya</option>
                    <option value="GRANT">Grant Arizasi & Smeta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mavzu / Sarlavha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Oliy ta'lim tizimida sun'iy intellekt modellarining samaradorligi..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {newType === 'ARTICLE'
                      ? 'Mo‘ljaldagi Jurnal (masalan: Scopus Q2, OAK ro‘yxati)'
                      : newType === 'THESIS'
                      ? 'Konferensiya Nomi (CFP)'
                      : newType === 'GRANT'
                      ? 'Grant Beruvchi Fond / Dastur'
                      : 'Ixtisoslik Shifri / Kafedra'}
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Journal of Educational Technology (Elsevier)"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qisqacha Annotatsiya (Abstract)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tadqiqot maqsadi, uslubi va kutilayotgan ilmiy natijasi..."
                    value={newAbstract}
                    onChange={(e) => setNewAbstract(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50"
                  >
                    {creating ? 'Yaratilmoqda...' : 'Loyiha Yaratish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE PROJECT WORKSPACE MODAL */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Workspace Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {activeProject.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeProject.type}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {activeProject.title}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveProject(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Workspace Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* 1. Hammualliflar & CRediT Bo'limi */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Hammualliflar & CRediT Hissasi</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Har bir olimning ulushi va xalqaro vazifasi. Takliflar Telegram Bot (@tiuscholarbot) orqali tasdiqlanadi.
                      </p>
                    </div>

                    <button
                      onClick={() => setCollabModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Hammuallif Qo‘shish</span>
                    </button>
                  </div>

                  {/* Collaborators List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {activeProject.collaborators?.map((c) => {
                      let creditList = [];
                      try {
                        creditList = c.creditRoles ? JSON.parse(c.creditRoles) : [];
                      } catch {
                        creditList = [];
                      }

                      return (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {c.scholarName || c.scholarEmail}
                              </div>
                              <div className="text-[11px] text-slate-400">{c.scholarEmail}</div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                c.inviteStatus === 'ACCEPTED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : c.inviteStatus === 'REJECTED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {c.inviteStatus === 'ACCEPTED'
                                ? 'Tasdiqlangan ✅'
                                : c.inviteStatus === 'REJECTED'
                                ? 'Rad etilgan ❌'
                                : 'Kutilmoqda ⏳'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              Rol: {c.role} ({c.sharePercent}%)
                            </span>
                            {c.user?.scholarProfile?.isTelegramConnected && (
                              <span className="text-[10px] font-bold text-teal-600">Telegram ulangan 🤖</span>
                            )}
                          </div>

                          {creditList.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {creditList.map((cr, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-medium"
                                >
                                  {cr}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Smart DOI Bibliografiya Resolver */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Smart DOI Citation Resolver (Avtomatik Bibliografiya)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Iqtibos keltirmoqchi bo‘lgan maqolangizning DOI raqamini kiriting — CrossRef orqali APA 7 va IEEE formatidagi rasmiy bibliografiya bir zumda yaratiladi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Masalan: 10.1016/j.jbusres.2023.113840 yoki https://doi.org/..."
                      value={doiInput}
                      onChange={(e) => setDoiInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleResolveDoi}
                      disabled={doiLoading || !doiInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {doiLoading ? 'Izlanmoqda...' : 'Avtotortish'}
                    </button>
                  </div>

                  {doiError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{doiError}</span>
                    </div>
                  )}

                  {doiResult && (
                    <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-3 mt-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                          Topilgan maqola:
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{doiResult.doi}</span>
                      </div>

                      <div className="text-slate-800 dark:text-slate-200 font-semibold">{doiResult.title}</div>
                      <div className="text-slate-500 text-[11px]">
                        Mualliflar: {doiResult.authorsFormatted} • {doiResult.journal} ({doiResult.year})
                      </div>

                      {/* Formatted Citations Options */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-[10px] text-indigo-600 uppercase">APA 7th:</span>
                            <p
                              className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5"
                              dangerouslySetInnerHTML={{ __html: doiResult.citations.apa }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyToClipboard(doiResult.citations.apa, 'apa')}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white"
                              title="Nusxalash"
                            >
                              {copiedCitation === 'apa' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleAddCitationToProject(doiResult.citations.apa)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              + Qo‘shish
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-[10px] text-blue-600 uppercase">IEEE:</span>
                            <p
                              className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5"
                              dangerouslySetInnerHTML={{ __html: doiResult.citations.ieee }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyToClipboard(doiResult.citations.ieee, 'ieee')}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white"
                              title="Nusxalash"
                            >
                              {copiedCitation === 'ieee' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleAddCitationToProject(doiResult.citations.ieee)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              + Qo‘shish
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Saved References List in Project */}
                  {activeProject.referencesList && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                        Loyihadagi Foydalanilgan Adabiyotlar (
                        {JSON.parse(activeProject.referencesList || '[]').length} ta):
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {JSON.parse(activeProject.referencesList || '[]').map((ref, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2"
                          >
                            <span className="font-bold text-slate-400">[{idx + 1}]</span>
                            <span dangerouslySetInnerHTML={{ __html: ref }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE COLLABORATOR MODAL */}
      <AnimatePresence>
        {collabModalOpen && activeProject && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Hammuallif Taklif Qilish</span>
                </h3>
                <button
                  onClick={() => {
                    setCollabModalOpen(false);
                    setInviteSuccessMsg('');
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {inviteSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs space-y-2 border border-emerald-200">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Taklif yetkazildi!</span>
                  </div>
                  <p>{inviteSuccessMsg}</p>
                  <button
                    onClick={() => {
                      setCollabModalOpen(false);
                      setInviteSuccessMsg('');
                    }}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                  >
                    Tushunarli
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hammuallif Emaili <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="hammuallif@tiu.uz"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      F.I.SH (Ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      placeholder="Dotsent Aliyev Jasur"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mualliflik Roli
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="CO_AUTHOR">Hammuallif (Co-Author)</option>
                        <option value="FIRST_AUTHOR">Birinchi Muallif (First Author)</option>
                        <option value="SUPERVISOR">Ilmiy Rahbar (Supervisor)</option>
                        <option value="CONSULTANT">Konsultant / Maslahatchi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Hissa Ulushi (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={invitePercent}
                        onChange={(e) => setInvitePercent(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* CRediT Checkboxes */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      CRediT Xalqaro Vazifasi (Kamida 1 ta tanlang)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      {CREDIT_TAXONOMY.map((cr) => {
                        const isChecked = selectedCredit.includes(cr);
                        return (
                          <label
                            key={cr}
                            className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer hover:text-emerald-600"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCredit([...selectedCredit, cr]);
                                } else {
                                  setSelectedCredit(selectedCredit.filter((c) => c !== cr));
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{cr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCollabModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{inviting ? 'Yuborilmoqda...' : 'Taklif Yuborish'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
