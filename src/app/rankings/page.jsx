'use client'

import { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { Award, Users, BookOpen, TrendingUp, Building2 } from 'lucide-react'

export default function RankingsPage() {
  const [data, setData] = useState({ scholars: [], departments: [] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('scholars') // scholars, departments

  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get('tab')
    if (urlTab === 'departments') setTab('departments')
  }, [])

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rankings')
        const json = await res.json()
        if (json.scholars) {
          startTransition(() => {
            setData(json)
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
    fetchRankings()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-neutral-900">Scientific Rankings</h1>
        <p className="text-neutral-600 text-sm">Performance leaderboards for TIU scholars and academic departments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-neutral-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setTab('scholars')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === 'scholars' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
        >
          <Award className="w-4 h-4 text-blue-600" /> Scholar Leaderboard
        </button>
        <button
          onClick={() => setTab('departments')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === 'departments' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" /> Department Leaderboard
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500">Loading rankings...</div>
      ) : tab === 'scholars' ? (
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Scholar</th>
                <th className="p-4">Department</th>
                <th className="p-4 text-center">H-Index</th>
                <th className="p-4 text-center">Approved Pubs</th>
                <th className="p-4 text-center">Citations</th>
                <th className="p-4 pr-6 text-right">TIU Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {data.scholars.map((scholar, idx) => {
                const pubCount = scholar.publications.filter(p => p.publication.status === 'APPROVED').length

                return (
                  <tr key={scholar.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-neutral-500 tabular-nums">#{idx + 1}</td>
                    <td className="p-4">
                      <Link href={`/scholars/${scholar.id}`} className="font-bold text-neutral-900 hover:text-blue-600 transition-colors">
                        {scholar.fullName}
                      </Link>
                      <div className="text-xs text-neutral-500">{scholar.academicDegree}</div>
                    </td>
                    <td className="p-4 text-neutral-600 text-xs">{scholar.department.nameEn}</td>
                    <td className="p-4 text-center font-semibold text-neutral-900 tabular-nums">{scholar.hIndex}</td>
                    <td className="p-4 text-center font-semibold text-neutral-900 tabular-nums">{pubCount}</td>
                    <td className="p-4 text-center font-semibold text-neutral-900 tabular-nums">{scholar.totalCitations}</td>
                    <td className="p-4 pr-6 text-right font-extrabold text-blue-600 tabular-nums text-base">{scholar.tiuScore}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Department / Unit</th>
                <th className="p-4">Faculty</th>
                <th className="p-4 text-center">Active Scholars</th>
                <th className="p-4 text-center">Approved Publications</th>
                <th className="p-4 text-center">Scopus Count</th>
                <th className="p-4 pr-6 text-right">Total TIU Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {data.departments.map((dept, idx) => (
                <tr key={dept.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-neutral-500 tabular-nums">#{idx + 1}</td>
                  <td className="p-4 font-bold text-neutral-900">{dept.nameEn}</td>
                  <td className="p-4 text-neutral-600 text-xs">{dept.facultyName}</td>
                  <td className="p-4 text-center font-semibold text-neutral-900 tabular-nums">{dept.scholarsCount}</td>
                  <td className="p-4 text-center font-semibold text-neutral-900 tabular-nums">{dept.approvedPubsCount}</td>
                  <td className="p-4 text-center font-semibold text-neutral-900 tabular-nums">{dept.scopusCount}</td>
                  <td className="p-4 pr-6 text-right font-extrabold text-indigo-600 tabular-nums text-base">{dept.totalTiuScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
