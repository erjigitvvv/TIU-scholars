'use client'

import { useState, useEffect, startTransition } from 'react'
import { Plus, Briefcase, Calendar, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'

export default function GrantsPage() {
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    role: 'Principal Investigator',
    fundingSource: 'Ministry of Higher Education',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 2,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/grants')
        const data = await res.json()
        if (data.grants) {
          startTransition(() => {
            setGrants(data.grants)
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

  const fetchGrants = async () => {
    try {
      const res = await fetch('/api/dashboard/grants')
      const data = await res.json()
      if (data.grants) setGrants(data.grants)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/dashboard/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create grant')
      setModalOpen(false)
      fetchGrants()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Grants & Projects</h2>
          <p className="text-neutral-600 text-sm">Manage research grants, commercialization projects, and funding.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Grant
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading grants...</div>
        ) : grants.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No grant projects added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Funding Source</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {grants.map((g) => (
                  <tr key={g.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 font-semibold text-neutral-900">{g.title}</td>
                    <td className="p-4 text-neutral-600">{g.role}</td>
                    <td className="p-4 text-neutral-600">{g.fundingSource}</td>
                    <td className="p-4 text-neutral-600">{g.startYear} - {g.endYear || 'Present'}</td>
                    <td className="p-4">
                      {g.status === 'APPROVED' && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">Approved</span>}
                      {g.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">Pending</span>}
                      {g.status === 'REJECTED' && <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">Rejected</span>}
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
              <h3 className="text-xl font-bold text-neutral-900">Add Grant Project</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Project Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Role</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Funding Source</label>
                <input
                  type="text"
                  required
                  value={form.fundingSource}
                  onChange={(e) => setForm({...form, fundingSource: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Start Year</label>
                  <input
                    type="number"
                    required
                    value={form.startYear}
                    onChange={(e) => setForm({...form, startYear: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">End Year</label>
                  <input
                    type="number"
                    value={form.endYear}
                    onChange={(e) => setForm({...form, endYear: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-neutral-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium">Save Grant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
