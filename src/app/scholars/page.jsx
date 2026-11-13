'use client'

import { useState, useEffect, startTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, BookOpen, Award, TrendingUp, Filter, User } from 'lucide-react'

export default function ScholarsDirectoryPage() {
  const searchParams = useSearchParams()
  const [scholars, setScholars] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [facultyId, setFacultyId] = useState(searchParams.get('facultyId') || '')
  const [departmentId, setDepartmentId] = useState('')
  const [academicDegree, setAcademicDegree] = useState('ALL')
  const [academicTitle, setAcademicTitle] = useState('ALL')
  const [sortBy, setSortBy] = useState('tiuScore')

  useEffect(() => {
    async function fetchScholars() {
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (facultyId) params.set('facultyId', facultyId)
        if (departmentId) params.set('departmentId', departmentId)
        if (academicDegree !== 'ALL') params.set('academicDegree', academicDegree)
        if (academicTitle !== 'ALL') params.set('academicTitle', academicTitle)
        params.set('sortBy', sortBy)

        const res = await fetch(`/api/scholars?${params.toString()}`)
        const data = await res.json()
        if (data.scholars) {
          startTransition(() => {
            setScholars(data.scholars)
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
    fetchScholars()
  }, [q, facultyId, departmentId, academicDegree, academicTitle, sortBy])

  const selectedFaculty = faculties.find(f => f.id === facultyId)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-neutral-900">University Scholars</h1>
        <p className="text-neutral-600 text-sm">Directory of Tashkent International University faculty and researchers</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative flex items-center">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search scholar name or research interest..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={facultyId}
              onChange={(e) => { setFacultyId(e.target.value); setDepartmentId(''); }}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none"
            >
              <option value="">All Faculties</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.nameEn}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={!selectedFaculty}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none disabled:opacity-50"
            >
              <option value="">All Departments</option>
              {selectedFaculty?.departments.map(d => (
                <option key={d.id} value={d.id}>{d.nameEn}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={academicDegree}
              onChange={(e) => setAcademicDegree(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Degrees</option>
              <option value="PHD">PhD</option>
              <option value="DSC">DSc</option>
            </select>

            <select
              value={academicTitle}
              onChange={(e) => setAcademicTitle(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Titles</option>
              <option value="PROFESSOR">Professor</option>
              <option value="DOCENT">Docent</option>
              <option value="ASSISTANT">Assistant</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
            >
              <option value="tiuScore">TIU Score</option>
              <option value="hIndex">H-Index</option>
              <option value="publications">Publication Count</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-20 text-neutral-500">Loading scholars directory...</div>
      ) : scholars.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-neutral-200 text-center text-neutral-500">
          No scholars found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholars.map((scholar) => {
            const approvedPubsCount = scholar.publications.filter(p => p.publication.status === 'APPROVED').length

            return (
              <div key={scholar.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-blue-100 text-blue-800 rounded-2xl font-bold flex items-center justify-center text-xl">
                      {scholar.fullName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                      {scholar.academicDegree}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">{scholar.fullName}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{scholar.department.nameEn}</p>
                    <p className="text-xs text-neutral-400 mt-0.5 capitalize">{scholar.academicTitle.toLowerCase()}</p>
                  </div>
                </div>

                {/* 3 Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-neutral-50 rounded-xl text-center">
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">H-Index</div>
                    <div className="text-sm font-bold text-neutral-900 tabular-nums">{scholar.hIndex}</div>
                  </div>
                  <div className="border-x border-neutral-200">
                    <div className="text-xs text-neutral-500 font-medium">Pubs</div>
                    <div className="text-sm font-bold text-neutral-900 tabular-nums">{approvedPubsCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-medium">TIU Score</div>
                    <div className="text-sm font-bold text-blue-600 tabular-nums">{scholar.tiuScore}</div>
                  </div>
                </div>

                <Link
                  href={`/scholars/${scholar.id}`}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-center font-medium rounded-xl text-sm transition-colors block"
                >
                  View Profile
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
