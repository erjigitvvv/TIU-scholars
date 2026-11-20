'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { Plus, Building2, Layers, Award, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocale } from '@/lib/useLocale';

const DICT = {
  uz: {
    pageTitle: 'Tizim va Ball Sozlamalari',
    pageSub: 'Ilmiy reyting ball koeffitsientlari hamda universitet fakultet va kafedralarini boshqarish.',
    scoringTitle: 'Ball tizimi sozlamalari (Dinamik)',
    scoringSub: 'Har bir ilmiy natija turi uchun beriladigan ballarni tahrirlang. Saqlanganda barcha olimlar reytingi qayta hisoblanadi.',
    saveScoring: 'Ball koeffitsientlarini saqlash va qayta hisoblash',
    savingScoring: 'Saqlanmoqda va qayta hisoblanmoqda...',
    savedOk: 'Ball sozlamalari yangilandi va olimlar reytingi qayta hisoblandi!',
    saveErr: 'Saqlashda xatolik yuz berdi',
    weights: {
      scopusWeight: 'Scopus maqola balli',
      wosWeight: 'Web of Science balli',
      q1Q2Bonus: 'Q1 / Q2 kvartil bonusi',
      oakWeight: 'OAK maqola balli',
      monographWeight: 'Monografiya balli',
      patentWeight: 'Patent / DGU balli',
      conferenceWeight: 'Konferensiya balli',
      citationWeight: '1 ta iqtibos koeffitsienti',
    },
    facultiesTitle: 'Fakultetlar',
    totalSuffix: 'ta jami',
    addFacultyTitle: 'Yangi fakultet qo‘shish',
    addFacultyBtn: 'Fakultet qo‘shish',
    deptsWord: 'ta kafedra',
    departmentsTitle: 'Kafedralar',
    addDeptTitle: 'Tanlangan fakultetga kafedra qo‘shish',
    addDeptBtn: 'Kafedra qo‘shish',
    nameEn: 'Nomi (EN) *',
    nameUz: 'Nomi (UZ)',
    nameRu: 'Nomi (RU)',
    deptEn: 'Kafedra (EN) *',
    deptUz: 'Kafedra (UZ)',
    deptRu: 'Kafedra (RU)',
    loading: 'Yuklanmoqda...',
  },
  ru: {
    pageTitle: 'Настройки системы и баллов',
    pageSub: 'Управление коэффициентами научного рейтинга, а также факультетами и кафедрами университета.',
    scoringTitle: 'Настройки балльной системы (Динамические)',
    scoringSub: 'Настройте баллы за каждый тип научной публикации. При сохранении рейтинг всех учёных пересчитывается автоматически.',
    saveScoring: 'Сохранить коэффициенты и пересчитать',
    savingScoring: 'Сохранение и пересчёт...',
    savedOk: 'Коэффициенты обновлены, рейтинги учёных пересчитаны!',
    saveErr: 'Ошибка при сохранении',
    weights: {
      scopusWeight: 'Статья Scopus',
      wosWeight: 'Статья Web of Science',
      q1Q2Bonus: 'Бонус за Q1 / Q2',
      oakWeight: 'Статья ВАК (OAK)',
      monographWeight: 'Монография',
      patentWeight: 'Патент / Свидетельство',
      conferenceWeight: 'Конференция',
      citationWeight: 'Коэффициент 1 цитирования',
    },
    facultiesTitle: 'Факультеты',
    totalSuffix: 'всего',
    addFacultyTitle: 'Добавить новый факультет',
    addFacultyBtn: 'Добавить факультет',
    deptsWord: 'кафедр',
    departmentsTitle: 'Кафедры',
    addDeptTitle: 'Добавить кафедру в выбранный факультет',
    addDeptBtn: 'Добавить кафедру',
    nameEn: 'Название (EN) *',
    nameUz: 'Название (UZ)',
    nameRu: 'Название (RU)',
    deptEn: 'Кафедра (EN) *',
    deptUz: 'Кафедра (UZ)',
    deptRu: 'Кафедра (RU)',
    loading: 'Загрузка...',
  },
  en: {
    pageTitle: 'University & Scoring Settings',
    pageSub: 'Configure dynamic TIU score weights and manage university faculties and departments.',
    scoringTitle: 'Dynamic Scoring System Weights',
    scoringSub: 'Edit point weights per research output type. Saving automatically recalculates all scholar TIU scores.',
    saveScoring: 'Save Weights & Recalculate',
    savingScoring: 'Saving & recalculating...',
    savedOk: 'Scoring weights updated and all scholar scores recalculated!',
    saveErr: 'Failed to save scoring settings',
    weights: {
      scopusWeight: 'Scopus Article Weight',
      wosWeight: 'Web of Science Weight',
      q1Q2Bonus: 'Q1 / Q2 Quartile Bonus',
      oakWeight: 'OAK Article Weight',
      monographWeight: 'Monograph Weight',
      patentWeight: 'Patent Weight',
      conferenceWeight: 'Conference Paper Weight',
      citationWeight: 'Weight per Citation',
    },
    facultiesTitle: 'Faculties',
    totalSuffix: 'Total',
    addFacultyTitle: 'Add New Faculty',
    addFacultyBtn: 'Add Faculty',
    deptsWord: 'Departments',
    departmentsTitle: 'Departments',
    addDeptTitle: 'Add Department to Selected Faculty',
    addDeptBtn: 'Add Department',
    nameEn: 'Name (EN) *',
    nameUz: 'Name (UZ)',
    nameRu: 'Name (RU)',
    deptEn: 'Dept Name (EN) *',
    deptUz: 'Dept Name (UZ)',
    deptRu: 'Dept Name (RU)',
    loading: 'Loading...',
  },
};

const WEIGHT_KEYS = [
  'scopusWeight',
  'wosWeight',
  'q1Q2Bonus',
  'oakWeight',
  'monographWeight',
  'patentWeight',
  'conferenceWeight',
  'citationWeight',
];

export default function AdminSettingsPage() {
  const locale = useLocale('uz');
  const t = DICT[locale] || DICT.uz;

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFacultyNameUz, setNewFacultyNameUz] = useState('');
  const [newFacultyNameRu, setNewFacultyNameRu] = useState('');
  const [newFacultyNameEn, setNewFacultyNameEn] = useState('');

  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [newDeptNameUz, setNewDeptNameUz] = useState('');
  const [newDeptNameRu, setNewDeptNameRu] = useState('');
  const [newDeptNameEn, setNewDeptNameEn] = useState('');

  const [scoring, setScoring] = useState({
    scopusWeight: 10,
    wosWeight: 10,
    q1Q2Bonus: 5,
    oakWeight: 5,
    monographWeight: 7,
    patentWeight: 6,
    conferenceWeight: 2,
    citationWeight: 0.2,
  });
  const [savingScoring, setSavingScoring] = useState(false);
  const [scoringNotice, setScoringNotice] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [facRes, scoreRes] = await Promise.all([
        fetch('/api/faculties'),
        fetch('/api/admin/scoring'),
      ]);
      const facData = await facRes.json();
      if (Array.isArray(facData)) {
        setFaculties(facData);
        setSelectedFacultyId((prev) => prev || (facData.length > 0 ? facData[0].id : ''));
      }
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        if (scoreData.config) {
          setScoring({
            scopusWeight: scoreData.config.scopusWeight ?? 10,
            wosWeight: scoreData.config.wosWeight ?? 10,
            q1Q2Bonus: scoreData.config.q1Q2Bonus ?? 5,
            oakWeight: scoreData.config.oakWeight ?? 5,
            monographWeight: scoreData.config.monographWeight ?? 7,
            patentWeight: scoreData.config.patentWeight ?? 6,
            conferenceWeight: scoreData.config.conferenceWeight ?? 2,
            citationWeight: scoreData.config.citationWeight ?? 0.2,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchAll();
    });
  }, [fetchAll]);

  const handleSaveScoring = async (e) => {
    e.preventDefault();
    setSavingScoring(true);
    setScoringNotice(null);
    try {
      const res = await fetch('/api/admin/scoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoring),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setScoringNotice({ type: 'error', text: data.error || t.saveErr });
      } else {
        if (data.config) setScoring(data.config);
        setScoringNotice({
          type: 'success',
          text: `${t.savedOk} (${data.recalculatedScholars ?? 0})`,
        });
      }
    } catch (err) {
      setScoringNotice({ type: 'error', text: err.message || t.saveErr });
    } finally {
      setSavingScoring(false);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!newFacultyNameEn) return;
    try {
      const res = await fetch('/api/admin/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameUz: newFacultyNameUz || newFacultyNameEn,
          nameRu: newFacultyNameRu || newFacultyNameEn,
          nameEn: newFacultyNameEn,
        }),
      });
      if (res.ok) {
        setNewFacultyNameUz('');
        setNewFacultyNameRu('');
        setNewFacultyNameEn('');
        fetchAll();
      }
    } catch (err) {
      console.error('Failed to create faculty', err);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptNameEn || !selectedFacultyId) return;
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFacultyId,
          nameUz: newDeptNameUz || newDeptNameEn,
          nameRu: newDeptNameRu || newDeptNameEn,
          nameEn: newDeptNameEn,
        }),
      });
      if (res.ok) {
        setNewDeptNameUz('');
        setNewDeptNameRu('');
        setNewDeptNameEn('');
        fetchAll();
      }
    } catch (err) {
      console.error('Failed to create department', err);
    }
  };

  const getLocalizedName = (item) => {
    if (!item) return '';
    if (locale === 'ru') return item.nameRu || item.nameUz || item.nameEn;
    if (locale === 'en') return item.nameEn || item.nameUz;
    return item.nameUz || item.nameEn;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">{t.pageTitle}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t.pageSub}</p>
      </div>

      {/* Dynamic Scoring Weights Section */}
      <form
        onSubmit={handleSaveScoring}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {t.scoringTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.scoringSub}</p>
          </div>
          <button
            type="submit"
            disabled={savingScoring}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F294A] hover:bg-blue-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Save className="w-4 h-4" />
            {savingScoring ? t.savingScoring : t.saveScoring}
          </button>
        </div>

        {scoringNotice && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              scoringNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {scoringNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{scoringNotice.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEIGHT_KEYS.map((key) => (
            <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t.weights[key]}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={scoring[key] ?? 0}
                onChange={(e) =>
                  setScoring((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
              />
            </div>
          ))}
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Faculties Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {t.facultiesTitle}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
              {faculties.length} {t.totalSuffix}
            </span>
          </div>

          <form onSubmit={handleCreateFaculty} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.addFacultyTitle}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder={t.nameEn}
                value={newFacultyNameEn}
                onChange={(e) => setNewFacultyNameEn(e.target.value)}
                required
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder={t.nameUz}
                value={newFacultyNameUz}
                onChange={(e) => setNewFacultyNameUz(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder={t.nameRu}
                value={newFacultyNameRu}
                onChange={(e) => setNewFacultyNameRu(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t.addFacultyBtn}
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-xs text-slate-400 py-4 text-center">{t.loading}</div>
            ) : (
              faculties.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFacultyId(f.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedFacultyId === f.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{getLocalizedName(f)}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{f.departments?.length || 0} {t.deptsWord}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departments Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              {t.departmentsTitle}
            </h3>
          </div>

          <form onSubmit={handleCreateDepartment} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.addDeptTitle}</h4>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{getLocalizedName(f)}</option>
              ))}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder={t.deptEn}
                value={newDeptNameEn}
                onChange={(e) => setNewDeptNameEn(e.target.value)}
                required
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder={t.deptUz}
                value={newDeptNameUz}
                onChange={(e) => setNewDeptNameUz(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder={t.deptRu}
                value={newDeptNameRu}
                onChange={(e) => setNewDeptNameRu(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t.addDeptBtn}
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {faculties
              .find((f) => f.id === selectedFacultyId)
              ?.departments?.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{getLocalizedName(d)}</span>
                  <span className="text-xs text-slate-500">{d.code}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
