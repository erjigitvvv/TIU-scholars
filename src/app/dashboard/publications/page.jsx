'use client'

import { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, CheckCircle, Clock, XCircle, Trash2, Edit, Eye, Award, Search, RefreshCw, Sparkles, Image as ImageIcon, X } from 'lucide-react'

export default function PublicationsPage() {
  const [publications, setPublications] = useState([])
  const [allScholars, setAllScholars] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [reviewModalPub, setReviewModalPub] = useState(null)
  const [coAuthorIds, setCoAuthorIds] = useState([])
  const [coAuthorSearch, setCoAuthorSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPubId, setEditingPubId] = useState(null)
  const [mode, setMode] = useState('doi') // doi, bibtex, manual

  // Form states
  const [doiInput, setDoiInput] = useState('')
  const [bibInput, setBibInput] = useState('')
  const [manualForm, setManualForm] = useState({
    title: '',
    type: 'SCOPUS',
    journalOrPublisher: '',
    year: new Date().getFullYear(),
    doi: '',
    url: '',
    isbnOrPatentNo: '',
    coverImageUrl: '',
    quartile: 'NONE',
    citationsCount: 0,
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [syncOrcidLoading, setSyncOrcidLoading] = useState(false)

  const handleSyncOrcid = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    setSyncOrcidLoading(true)
    try {
      const res = await fetch('/api/dashboard/publications/sync-orcid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'ORCID sinxronizatsiyasida xatolik yuz berdi.')
        return
      }
      setSuccessMsg(data.message || 'ORCID dan nashrlar muvaffaqiyatli tortildi!')
      fetchPublications()
    } catch {
      setErrorMsg('ORCID serveriga ulanishda xatolik yuz berdi.')
    } finally {
      setSyncOrcidLoading(false)
    }
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg('')
    setUploadingPdf(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/dashboard/publications/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'PDF yuklashda xatolik')
        return
      }
      setManualForm((prev) => ({ ...prev, url: data.url }))
      setSuccessMsg('PDF muvaffaqiyatli yuklandi!')
    } catch {
      setErrorMsg('PDF yuklashda xatolik')
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg('')
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/dashboard/publications/upload-image', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Rasm yuklashda xatolik yuz berdi')
        return
      }
      setManualForm((prev) => ({ ...prev, coverImageUrl: data.url }))
      setSuccessMsg('Maqola rasmi muvaffaqiyatli yuklandi!')
    } catch {
      setErrorMsg('Rasm yuklashda xatolik yuz berdi')
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/publications')
        const data = await res.json()
        if (data.publications) {
          startTransition(() => {
            setPublications(data.publications)
            if (Array.isArray(data.allScholars)) setAllScholars(data.allScholars)
            if (Array.isArray(data.pendingApprovals)) setPendingApprovals(data.pendingApprovals)
          })

          // Check if URL has ?review=ID
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            const reviewId = urlParams.get('review')
            if (reviewId) {
              const target = data.publications?.find((p) => p.id === reviewId) || data.pendingApprovals?.find((p) => p.id === reviewId)
              if (target) setReviewModalPub(target)
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        startTransition(() => {
          setLoading(false)
        })
      }
    }
    loadData()
  }, [])

  const fetchPublications = async () => {
    try {
      const res = await fetch('/api/dashboard/publications')
      const data = await res.json()
      if (data.publications) {
        setPublications(data.publications)
        if (Array.isArray(data.pendingApprovals)) setPendingApprovals(data.pendingApprovals)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRespondCoauthor = async (publicationId, action, reason = '') => {
    try {
      const res = await fetch('/api/dashboard/publications/respond-coauthor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId, action, rejectionNote: reason }),
      })
      const data = await res.json()
      if (data.success) {
        setReviewModalPub(null)
        setSuccessMsg(data.message || 'Muvaffaqiyatli bajarildi')
        setTimeout(() => setSuccessMsg(''), 4000)
        await fetchPublications()
      } else {
        alert(data.error || 'Xatolik yuz berdi')
      }
    } catch {
      alert('Server xatosi')
    }
  }

  const openAddModal = () => {
    setEditingPubId(null)
    setMode('doi')
    setManualForm({
      title: '',
      type: 'SCOPUS',
      journalOrPublisher: '',
      year: new Date().getFullYear(),
      doi: '',
      url: '',
      isbnOrPatentNo: '',
      coverImageUrl: '',
      quartile: 'NONE',
      citationsCount: 0,
    })
    setCoAuthorIds([])
    setCoAuthorSearch('')
    setModalOpen(true)
  }

  const openEditModal = (pub) => {
    setEditingPubId(pub.id)
    setMode('manual')
    setManualForm({
      title: pub.title || '',
      type: pub.type || 'SCOPUS',
      journalOrPublisher: pub.journalOrPublisher || '',
      year: pub.year || new Date().getFullYear(),
      doi: pub.doi || '',
      url: pub.url || '',
      isbnOrPatentNo: pub.isbnOrPatentNo || '',
      coverImageUrl: pub.coverImageUrl || '',
      quartile: pub.quartile || 'NONE',
      citationsCount: pub.citationsCount || 0,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (editingPubId) {
        const res = await fetch(`/api/dashboard/publications/${editingPubId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(manualForm),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update publication')
        setSuccessMsg('Nashr muvaffaqiyatli yangilandi!')
        setModalOpen(false)
        setEditingPubId(null)
        fetchPublications()
        return
      }

      const payload = {
        mode,
        pdfUrl: manualForm.url || '',
        coverImageUrl: manualForm.coverImageUrl || '',
        coAuthorIds,
      }
      if (mode === 'doi') payload.doi = doiInput
      if (mode === 'bibtex') payload.bibContent = bibInput
      if (mode === 'manual') payload.manualData = manualForm

      const res = await fetch('/api/dashboard/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit publication')
      }

      setSuccessMsg('Nashr muvaffaqiyatli qo‘shildi / bog‘landi!')
      setModalOpen(false)
      setDoiInput('')
      setBibInput('')
      setCoAuthorIds([])
      setCoAuthorSearch('')
      fetchPublications()
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleDelete = async (id, status) => {
    if (status === 'APPROVED') {
      alert('Taqiqlangan: Tasdiqlangan nashrlarni o‘chirib bo‘lmaydi.')
      return
    }
    if (!confirm('Ushbu nashrni o‘chirishga ishonchingiz komilmi?')) return

    try {
      const res = await fetch(`/api/dashboard/publications/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Delete failed')
        return
      }
      fetchPublications()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="neu-card p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Nashrlarim / My Publications
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Scopus, Web of Science, OAK maqolalari, monografiyalar va PDF fayllarni boshqaring.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncOrcid}
            disabled={syncOrcidLoading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
            title="ORCID profilidan maqolalar va iqtiboslarni avtomatik import qilish"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${syncOrcidLoading ? 'animate-spin' : ''}`} />
            <span>{syncOrcidLoading ? 'Sinxronlanmoqda...' : 'ORCID dan tortish'}</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0F294A] to-[#1B4275] hover:from-[#163660] hover:to-[#21508C] text-white shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" /> Nashr qo&apos;shish
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="neu-card-sm p-4 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-2xl text-sm">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="neu-card-sm p-4 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm">{successMsg}</div>
      )}

      {/* Tasdiqlash kutilayotgan nashrlar (Pending Co-Author Approvals) */}
      {pendingApprovals.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              ⚠️
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                Hammualliflik Tasdig‘ingiz Kutilmoqda ({pendingApprovals.length} ta nashr)
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-400 mt-0.5">
                Hamkasblaringiz ushbu ilmiy ishlarga sizni hammuallif sifatida ko‘rsatgan. Iltimos, ko‘rib chiqib o‘z tasdig‘ingizni bering.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {pendingApprovals.map((pub) => (
              <div
                key={pub.id}
                className="bg-white dark:bg-slate-900 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      {pub.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{pub.year}</span>
                    {pub.quartile && pub.quartile !== 'NONE' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {pub.quartile}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {pub.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {pub.journalOrPublisher}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReviewModalPub(pub)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ko‘rib chiqish</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespondCoauthor(pub.id, 'APPROVE')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                    >
                      ✅ Tasdiqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Rad etish sababini kiriting (ixtiyoriy):')
                        handleRespondCoauthor(pub.id, 'REJECT', reason || '')
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
                    >
                      Rad etish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications Table */}
      <div className="neu-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
        ) : publications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">Hozircha nashrlar qo&apos;shilmagan.</div>
        ) : (
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md">
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Title & Journal</th>
                  <th className="p-4">Type / Quartile</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Citations</th>
                  <th className="p-4">Ko&apos;rishlar / Ball</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-sm">
                {publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 max-w-md">
                      <Link
                        href={`/dashboard/publications/${pub.id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors block"
                      >
                        {pub.title}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">{pub.journalOrPublisher} {pub.doi && `• DOI: ${pub.doi}`}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded">
                          {pub.type}
                        </span>
                        {pub.quartile && pub.quartile !== 'NONE' && (
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded">
                            {pub.quartile}
                          </span>
                        )}
                        {pub.isScopusIndexed && (
                          <span className="inline-block px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold rounded">
                            Scopus
                          </span>
                        )}
                        {pub.isOrcidVerified && (
                          <span className="inline-block px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold rounded">
                            ORCID
                          </span>
                        )}
                        {pub.isScholarIndexed && (
                          <span className="inline-block px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-bold rounded">
                            Scholar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{pub.year}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{pub.citationsCount}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          {pub.views || 0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-bold">
                          <Award className="w-3 h-3" />+{pub.tiuScoreValue || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {pub.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {pub.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {pub.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700" title={pub.rejectionReason}>
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/dashboard/publications/${pub.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ko‘rish</span>
                      </Link>
                      {pub.status !== 'APPROVED' && (
                        <>
                          <button
                            onClick={() => openEditModal(pub)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pub.id, pub.status)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Publication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-neutral-900">Add Publication</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 font-bold text-xl">×</button>
            </div>

            {/* Mode selection tabs */}
            <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('doi')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'doi' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                DOI Auto-fill
              </button>
              <button
                type="button"
                onClick={() => setMode('bibtex')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'bibtex' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                BibTeX Batch (.bib)
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'manual' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Manual Entry
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'doi' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Digital Object Identifier (DOI)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.1016/j.jclepro.2021.128765"
                    value={doiInput}
                    onChange={(e) => setDoiInput(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-neutral-500">Automatically fetches title, publisher, year, and citations via Crossref API.</p>
                </div>
              )}

              {mode === 'bibtex' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">BibTeX Content (.bib)</label>
                  <textarea
                    required
                    rows={6}
                    placeholder={`@article{author2023,\n  title={Example Title},\n  journal={Journal Name},\n  year={2023},\n  doi={10.1234/example}\n}`}
                    value={bibInput}
                    onChange={(e) => setBibInput(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                  />
                </div>
              )}

              {mode === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Title</label>
                    <input
                      type="text"
                      required
                      value={manualForm.title}
                      onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Type</label>
                    <select
                      value={manualForm.type}
                      onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none bg-white"
                    >
                      <option value="SCOPUS">SCOPUS</option>
                      <option value="WOS">Web of Science (WoS)</option>
                      <option value="OAK">OAK (Uzbekistan)</option>
                      <option value="INTERNATIONAL_JOURNAL">International Journal</option>
                      <option value="LOCAL_JOURNAL">Local Journal</option>
                      <option value="CONFERENCE">Conference</option>
                      <option value="MONOGRAPH">Monograph</option>
                      <option value="TEXTBOOK">Textbook</option>
                      <option value="PATENT">Patent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Quartile</label>
                    <select
                      value={manualForm.quartile}
                      onChange={(e) => setManualForm({...manualForm, quartile: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none bg-white"
                    >
                      <option value="NONE">None</option>
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Journal or Publisher</label>
                    <input
                      type="text"
                      required
                      value={manualForm.journalOrPublisher}
                      onChange={(e) => setManualForm({...manualForm, journalOrPublisher: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Year</label>
                    <input
                      type="number"
                      required
                      value={manualForm.year}
                      onChange={(e) => setManualForm({...manualForm, year: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Citations Count</label>
                    <input
                      type="number"
                      value={manualForm.citationsCount}
                      onChange={(e) => setManualForm({...manualForm, citationsCount: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">DOI (Optional)</label>
                    <input
                      type="text"
                      value={manualForm.doi}
                      onChange={(e) => setManualForm({...manualForm, doi: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">ISBN / Patent No (Optional)</label>
                    <input
                      type="text"
                      value={manualForm.isbnOrPatentNo}
                      onChange={(e) => setManualForm({...manualForm, isbnOrPatentNo: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              {/* PDF File Upload / URL (Available for DOI, BibTeX & Manual) */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-sm font-medium text-neutral-700">
                  Maqola PDF fayli (ixtiyoriy) yoki Havola (URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="https://... yoki o‘ngdagi tugma orqali .pdf yuklang"
                    value={manualForm.url}
                    onChange={(e) => setManualForm({...manualForm, url: e.target.value})}
                    className="flex-1 px-4 py-2 border rounded-xl outline-none text-sm"
                  />
                  <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                    <span>{uploadingPdf ? 'Yuklanmoqda...' : 'PDF yuklash'}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cover Image / Graphical Abstract Upload */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-neutral-700">
                    Maqola rasmi / Graphical Abstract (ixtiyoriy)
                  </label>
                  <span className="text-[11px] text-slate-400">JPG, PNG, WebP (max 10MB)</span>
                </div>

                {manualForm.coverImageUrl ? (
                  <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
                    <img
                      src={manualForm.coverImageUrl}
                      alt="Publication cover preview"
                      className="h-28 w-auto max-w-full object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setManualForm((prev) => ({ ...prev, coverImageUrl: '' }))}
                      className="absolute top-3 right-3 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition"
                      title="Rasmni o‘chirish"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="https://... rasm havolasi yoki o‘ngdagi tugma orqali rasm yuklang"
                      value={manualForm.coverImageUrl || ''}
                      onChange={(e) => setManualForm({ ...manualForm, coverImageUrl: e.target.value })}
                      className="flex-1 px-4 py-2 border rounded-xl outline-none text-sm"
                    />
                    <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 cursor-pointer shrink-0 transition">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                <p className="text-[11px] text-neutral-500">
                  Maqolaning grafik abstrakti, ilmiy diagrammasi yoki jurnal muqovasi portalda va ijtimoiy tarmoqlarda ko‘rinadi.
                </p>
              </div>

              {!editingPubId && allScholars.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Hammualliflar (TIU olimlari — ixtiyoriy)
                    </label>
                    {coAuthorIds.length > 0 && (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {coAuthorIds.length} ta tanlandi
                      </span>
                    )}
                  </div>
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={coAuthorSearch}
                      onChange={(e) => setCoAuthorSearch(e.target.value)}
                      placeholder="Olim ismi bo'yicha qidirish..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                    {(() => {
                      const q = coAuthorSearch.trim().toLowerCase()
                      const filtered = q
                        ? allScholars.filter(
                            (s) => s.fullName.toLowerCase().includes(q) || coAuthorIds.includes(s.id)
                          )
                        : allScholars
                      if (filtered.length === 0) {
                        return (
                          <span className="text-xs text-slate-400 py-1 px-1">
                            Mos olim topilmadi
                          </span>
                        )
                      }
                      return filtered.map((s) => {
                        const selected = coAuthorIds.includes(s.id)
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setCoAuthorIds((prev) =>
                                selected ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              selected
                                ? 'bg-blue-900 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {s.fullName}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm"
                >
                  Submit Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REVIEW & APPROVE MODAL */}
      {reviewModalPub && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold text-xs">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Nashrni Ko‘rib Chiqish
                  </h3>
                  <p className="text-[11px] text-slate-400">Hammualliflik roziligini berish yoki rad etish</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalPub(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Mavzu / Sarlavha:</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {reviewModalPub.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Turi:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewModalPub.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Yili:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewModalPub.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Jurnal / Nashriyot:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {reviewModalPub.journalOrPublisher}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kvartil:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewModalPub.quartile || 'NONE'}</span>
                </div>
              </div>

              {reviewModalPub.doi && (
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">DOI:</span>
                  <a
                    href={`https://doi.org/${reviewModalPub.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-blue-600 hover:underline break-all"
                  >
                    https://doi.org/{reviewModalPub.doi}
                  </a>
                </div>
              )}

              {reviewModalPub.url && (
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">Fayl / Havola:</span>
                  <a
                    href={reviewModalPub.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-blue-600 hover:underline break-all"
                  >
                    {reviewModalPub.url}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const reason = prompt('Rad etish sababi:')
                  handleRespondCoauthor(reviewModalPub.id, 'REJECT', reason || '')
                }}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition"
              >
                Rad etish
              </button>
              <button
                type="button"
                onClick={() => handleRespondCoauthor(reviewModalPub.id, 'APPROVE')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                ✅ Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
