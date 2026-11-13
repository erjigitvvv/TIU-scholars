'use client'

import { useState, useEffect, startTransition } from 'react'
import { Plus, BookOpen, CheckCircle, Clock, XCircle, Trash2, Edit } from 'lucide-react'

export default function PublicationsPage() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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
    quartile: 'NONE',
    citationsCount: 0,
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/publications')
        const data = await res.json()
        if (data.publications) {
          startTransition(() => {
            setPublications(data.publications)
          })
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
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = { mode }
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

      setSuccessMsg('Publication successfully added/linked!')
      setModalOpen(false)
      setDoiInput('')
      setBibInput('')
      fetchPublications()
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleDelete = async (id, status) => {
    if (status === 'APPROVED') {
      alert('Forbidden: Cannot delete approved publications.')
      return
    }
    if (!confirm('Are you sure you want to delete this publication?')) return

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Publications</h2>
          <p className="text-neutral-600 text-sm">Manage your research papers, monographs, and patents.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Publication
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>
      )}

      {/* Publications Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading publications...</div>
        ) : publications.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No publications added yet. Click &quot;Add Publication&quot; above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Title & Journal</th>
                  <th className="p-4">Type / Quartile</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Citations</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 max-w-md">
                      <div className="font-semibold text-neutral-900">{pub.title}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{pub.journalOrPublisher} {pub.doi && `• DOI: ${pub.doi}`}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-800 text-xs font-medium rounded">
                        {pub.type}
                      </span>
                      {pub.quartile && pub.quartile !== 'NONE' && (
                        <span className="ml-1.5 inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                          {pub.quartile}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-neutral-600">{pub.year}</td>
                    <td className="p-4 text-neutral-600 font-medium">{pub.citationsCount}</td>
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
                    <td className="p-4 text-right space-x-2">
                      {pub.status === 'APPROVED' ? (
                        <span className="text-xs text-neutral-400 italic">Locked (Approved)</span>
                      ) : (
                        <>
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
    </div>
  )
}
