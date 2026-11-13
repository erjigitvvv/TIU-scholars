'use client'

import { useState, useEffect, startTransition } from 'react'
import { User, RefreshCw, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/profile')
        const data = await res.json()
        if (data.profile) {
          startTransition(() => {
            setProfile(data.profile)
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

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/dashboard/profile')
      const data = await res.json()
      if (data.profile) setProfile(data.profile)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      setSuccessMsg('Profile successfully updated!')
      fetchProfile()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSyncOrcid = async () => {
    if (!profile?.orcidId) {
      alert('Please enter your ORCID ID first.')
      return
    }
    setSyncing(true)
    setSuccessMsg('')
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, syncOrcid: true }),
      })
      if (!res.ok) throw new Error('Failed to sync from ORCID')
      setSuccessMsg('Successfully synced public works from ORCID!')
      fetchProfile()
    } catch (err) {
      alert(err.message)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-neutral-500">Loading profile...</div>
  if (!profile) return <div className="p-8 text-center text-neutral-500">Profile not found.</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Profile & Integrations</h2>
          <p className="text-neutral-600 text-sm">Update your academic bio, external identifiers, and sync publications.</p>
        </div>
        <button
          type="button"
          onClick={handleSyncOrcid}
          disabled={syncing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing ORCID...' : 'Sync from ORCID'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={profile.fullName || ''}
              onChange={(e) => setProfile({...profile, fullName: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Public Email</label>
            <input
              type="email"
              value={profile.publicEmail || ''}
              onChange={(e) => setProfile({...profile, publicEmail: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Academic Degree</label>
            <select
              value={profile.academicDegree || 'NONE'}
              onChange={(e) => setProfile({...profile, academicDegree: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none bg-white"
            >
              <option value="NONE">None</option>
              <option value="PHD">PhD</option>
              <option value="DSC">DSc</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Academic Title</label>
            <select
              value={profile.academicTitle || 'NONE'}
              onChange={(e) => setProfile({...profile, academicTitle: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none bg-white"
            >
              <option value="NONE">None</option>
              <option value="ASSISTANT">Assistant</option>
              <option value="DOCENT">Docent (Associate Prof)</option>
              <option value="PROFESSOR">Professor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ORCID ID</label>
            <input
              type="text"
              placeholder="0000-0002-1825-0097"
              value={profile.orcidId || ''}
              onChange={(e) => setProfile({...profile, orcidId: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Scopus Author ID</label>
            <input
              type="text"
              value={profile.scopusId || ''}
              onChange={(e) => setProfile({...profile, scopusId: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none font-mono text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Google Scholar URL</label>
            <input
              type="url"
              value={profile.googleScholarUrl || ''}
              onChange={(e) => setProfile({...profile, googleScholarUrl: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Biography (English)</label>
            <textarea
              rows={3}
              value={profile.bioEn || ''}
              onChange={(e) => setProfile({...profile, bioEn: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm"
          >
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  )
}
