'use client'

import { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { Search, BookOpen, ExternalLink } from 'lucide-react'

export default function PublicationsDirectoryPage() {
  const [publications, setPublications] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState('')
  const [type, setType] = useState('ALL')
  const [year, setYear] = useState('ALL')
  const [facultyId, setFacultyId] = useState('')

  useEffect(() => {
    async function fetchPubs() {
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (type !== 'ALL') params.set('type', type)
        if (year !== 'ALL') params.set('year', year)
        if (facultyId) params.set('facultyId', facultyId)

        const res = await fetch(`/api/publications?${params.toString()}`)
        const data = await res.json()
        if (data.publications) {
          startTransition(() => {
            setPublications(data.publications)
            if (data.faculties) setFaculties(data.faculties)
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
    fetchPubs()
  }, [q, type, year, facultyId])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-neutral-900">Publications Database</h1>
        <p className="text-neutral-600 text-sm">Explore all approved scholarly works authored by TIU researchers</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative flex items-center">
          <Search className="w-5 h-5 text-neutral-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search article title, DOI, or journal..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none"
          />
        </div>

        <div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none"
          >
            <option value="ALL">All Publication Types</option>
            <option value="SCOPUS">SCOPUS</option>
            <option value="WOS">Web of Science</option>
            <option value="OAK">OAK</option>
            <option value="INTERNATIONAL_JOURNAL">International Journal</option>
            <option value="CONFERENCE">Conference</option>
            <option value="MONOGRAPH">Monograph</option>
            <option value="PATENT">Patent</option>
          </select>
        </div>

        <div>
          <select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none"
          >
            <option value="">All Faculties</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-neutral-500">Loading publications...</div>
      ) : publications.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-neutral-200 text-center text-neutral-500">
          No approved publications found matching your criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm divide-y divide-neutral-200">
          {publications.map(pub => (
            <div key={pub.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-50 transition-colors">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded">
                    {pub.type}
                  </span>
                  {pub.quartile && pub.quartile !== 'NONE' && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                      {pub.quartile}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500">{pub.year}</span>
                </div>

                <h3 className="font-bold text-neutral-900 text-base">{pub.title}</h3>
                <p className="text-xs text-neutral-600">
                  {pub.journalOrPublisher} {pub.doi && `• DOI: ${pub.doi}`}
                </p>

                {/* Authors */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-neutral-500">Authors:</span>
                  {pub.authors?.map(auth => auth.scholar && (
                    <Link
                      key={auth.scholar.id}
                      href={`/scholars/${auth.scholar.id}`}
                      className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                    >
                      {auth.scholar.fullName}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-neutral-500">Citations</div>
                  <div className="text-sm font-bold text-neutral-900 tabular-nums">{pub.citationsCount}</div>
                </div>
                {pub.doi && (
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors"
                    title="View DOI"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
