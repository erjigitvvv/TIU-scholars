'use client'

import { useState, useEffect, startTransition } from 'react'
import { Plus, GraduationCap, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function SupervisionsPage() {
  const [supervisions, setSupervisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    studentName: '',
    degreeType: 'PHD',
    dissertationTitle: '',
    year: new Date().getFullYear(),
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/supervisions')
        const data = await res.json()
        if (data.supervisions) {
          startTransition(() => {
            setSupervisions(data.supervisions)
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

  const fetchSupervisions = async () => {
    try {
      const res = await fetch('/api/dashboard/supervisions')
      const data = await res.json()
      if (data.supervisions) setSupervisions(data.supervisions)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/dashboard/supervisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create supervision')
      setModalOpen(false)
      fetchSupervisions()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">PhD / DSc Supervisions</h2>
          <p className="text-neutral-600 text-sm">Manage doctoral students and dissertation advisement.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Supervision
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading supervisions...</div>
        ) : supervisions.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No supervisions added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Degree</th>
                  <th className="p-4">Dissertation Title</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {supervisions.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 font-semibold text-neutral-900">{s.studentName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded">
                        {s.degreeType}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">{s.dissertationTitle}</td>
                    <td className="p-4 text-neutral-600">{s.year}</td>
                    <td className="p-4">
                      {s.status === 'APPROVED' && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">Approved</span>}
                      {s.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">Pending</span>}
                      {s.status === 'REJECTED' && <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-neutral-900">Add PhD/DSc Supervision</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({...form, studentName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Degree Type</label>
                <select
                  value={form.degreeType}
                  onChange={(e) => setForm({...form, degreeType: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none bg-white"
                >
                  <option value="PHD">PhD</option>
                  <option value="DSC">DSc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Dissertation Title</label>
                <textarea
                  required
                  rows={3}
                  value={form.dissertationTitle}
                  onChange={(e) => setForm({...form, dissertationTitle: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Year</label>
                <input
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({...form, year: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-neutral-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium">Save Supervision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
