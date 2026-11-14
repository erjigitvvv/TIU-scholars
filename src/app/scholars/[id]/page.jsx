'use client'

import { useState, useEffect, startTransition } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Users,
  User,
  ExternalLink,
  Download,
  Mail,
  BarChart3,
} from 'lucide-react'
import { generatePdfCv } from '@/lib/pdfCv'
import ScholarAvatar from '@/components/ui/ScholarAvatar'

export default function ScholarProfilePage() {
  const params = useParams()
  const { id } = params
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('publications')

  const [pubYear, setPubYear] = useState('ALL')
  const [pubType, setPubType] = useState('ALL')
  const [pubQuartile, setPubQuartile] = useState('ALL')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/scholars/${id}`)
        const json = await res.json()
        if (json.scholar) {
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
    fetchProfile()
  }, [id])

  if (loading) return <div className="text-center py-20 text-neutral-500">Loading scholar profile...</div>
  if (!data?.scholar) return <div className="text-center py-20 text-neutral-500">Scholar profile not found or inactive.</div>

  const s = data.scholar
  const years = Array.from(new Set(s.publications.map((p) => p.year).filter(Boolean))).sort((a, b) => b - a)

  const filteredPubs = s.publications.filter((p) => {
    if (pubYear !== 'ALL' && String(p.year) !== pubYear) return false
    if (pubType !== 'ALL' && p.type !== pubType) return false
    if (pubQuartile !== 'ALL' && p.quartile !== pubQuartile) return false
    return true
  })

  const bd = s.scoreBreakdown || {
    scopusWos: { count: 0, points: 0 },
    oak: { count: 0, points: 0 },
    otherPubs: { count: 0, points: 0 },
    citations: { count: 0, points: 0 },
    grants: { count: 0, points: 0 },
    supervisions: { count: 0, points: 0 },
  }

  const maxBreakdown = Math.max(
    1,
    bd.scopusWos.points,
    bd.oak.points,
    bd.citations.points,
    bd.grants.points,
    bd.supervisions.points,
    bd.otherPubs.points
  )

  const breakdownRows = [
    {
      label: `Scopus / Web of Science (${bd.scopusWos.count})`,
      points: bd.scopusWos.points,
      color: 'bg-emerald-600',
    },
    {
      label: `OAK Jurnallar (${bd.oak.count})`,
      points: bd.oak.points,
      color: 'bg-blue-600',
    },
    {
      label: `Iqtiboslar / Citations (${bd.citations.count})`,
      points: bd.citations.points,
      color: 'bg-indigo-600',
    },
    {
      label: `Grantlar (${bd.grants.count})`,
      points: bd.grants.points,
      color: 'bg-amber-500',
    },
    {
      label: `Ilmiy rahbarlik (${bd.supervisions.count})`,
      points: bd.supervisions.points,
      color: 'bg-purple-600',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-white via-[#F6FAFF] to-[#EBF4FD] p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <ScholarAvatar
            photoUrl={s.photoUrl}
            fullName={s.fullName}
            index={0}
            className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-white shadow-md"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F294A]">{s.fullName}</h1>
              {s.academicTitle && (
                <span className="px-3 py-1 bg-[#0F294A] text-white text-xs font-bold rounded-full capitalize">
                  {s.academicTitle.toLowerCase().replace('_', ' ')}
                </span>
              )}
              {s.academicDegree && s.academicDegree !== 'NONE' && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                  {s.academicDegree}
                </span>
              )}
            </div>
            <p className="text-slate-600 font-medium text-sm">
              {s.department?.nameUz || s.department?.nameEn} • {s.department?.faculty?.nameUz || s.department?.faculty?.nameEn}
            </p>

            {/* ORCID, Scopus ID, Google Scholar, Email */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
              {s.publicEmail && (
                <a href={`mailto:${s.publicEmail}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 font-medium transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.publicEmail}
                </a>
              )}
              {s.orcidId && (
                <a
                  href={`https://orcid.org/${s.orcidId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> ORCID: {s.orcidId}
                </a>
              )}
              {s.scopusId && (
                <a
                  href={`https://www.scopus.com/authid/detail.uri?authorId=${s.scopusId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-700 font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-orange-500" /> Scopus ID: {s.scopusId}
                </a>
              )}
              {s.googleScholarUrl && (
                <a
                  href={s.googleScholarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Google Scholar
                </a>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => generatePdfCv(s)}
          className="flex items-center gap-2 bg-[#0F294A] hover:bg-blue-800 text-white font-semibold px-5 py-3 rounded-2xl shadow-sm transition-colors shrink-0"
        >
          <Download className="w-4 h-4" /> Download PDF CV
        </button>
      </div>

      {/* Statistika bloki (5 ta asosiy ko'rsatkich + TIU Ball) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">H-Index</div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{s.hIndex}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Jami iqtiboslar</div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{s.totalCitations}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Scopus / WoS</div>
          <div className="text-3xl font-extrabold text-emerald-700 tabular-nums">{s.scopusWosCount ?? 0}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Grantlar</div>
          <div className="text-3xl font-extrabold text-amber-600 tabular-nums">{s.grantProjects.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Shogirdlar</div>
          <div className="text-3xl font-extrabold text-purple-700 tabular-nums">{s.supervisions.length}</div>
        </div>
        <div className="bg-[#0F294A] p-5 rounded-2xl border border-[#0F294A] shadow-sm text-white">
          <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mb-1.5">TIU Ball</div>
          <div className="text-3xl font-extrabold tabular-nums">{Math.round(s.tiuScore)}</div>
        </div>
      </div>

      {/* Ball tarkibi (Score Breakdown) — shaffoflik bloki */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F294A]">Ball tarkibi (Score Breakdown)</h2>
              <p className="text-xs text-slate-500">Har bir ilmiy faoliyat yo‘nalishi bo‘yicha shaffof ballar taqsimoti</p>
            </div>
          </div>
          <span className="text-sm font-extrabold text-[#0F294A] bg-blue-50 px-3.5 py-1.5 rounded-full tabular-nums">
            Umumiy TIU Ball: {s.tiuScore}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {breakdownRows.map((row) => {
            const pct = Math.min(100, Math.round((row.points / maxBreakdown) * 100))
            return (
              <div key={row.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 line-clamp-1">{row.label}</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">+{row.points}</div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5 Interactive Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'publications', label: `Nashrlar (${s.publications.length})`, icon: BookOpen },
            { id: 'grants', label: `Grantlar (${s.grantProjects.length})`, icon: Briefcase },
            { id: 'supervisions', label: `Shogirdlar (${s.supervisions.length})`, icon: GraduationCap },
            { id: 'coauthors', label: `Hammualliflar (${s.coAuthors.length})`, icon: Users },
            { id: 'bio', label: 'Biografiya & Yo‘nalishlar', icon: User },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-8">
          {activeTab === 'publications' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Tasdiqlangan nashrlar ro‘yxati</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Yil bo'yicha filtr */}
                  <select
                    value={pubYear}
                    onChange={(e) => setPubYear(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">Barcha yillar</option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>

                  {/* Kvartil bo'yicha filtr */}
                  <select
                    value={pubQuartile}
                    onChange={(e) => setPubQuartile(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">Barcha kvartillar</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>

                  {/* Tur bo'yicha filtr */}
                  <select
                    value={pubType}
                    onChange={(e) => setPubType(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">Barcha turlar</option>
                    <option value="SCOPUS">Scopus</option>
                    <option value="WOS">Web of Science</option>
                    <option value="OAK">OAK</option>
                    <option value="MONOGRAPH">Monografiya</option>
                    <option value="PATENT">Patent</option>
                  </select>
                </div>
              </div>

              {filteredPubs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Tanlangan filtr bo‘yicha nashrlar topilmadi.</div>
              ) : (
                <div className="space-y-4">
                  {filteredPubs.map((pub) => (
                    <div key={pub.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded">
                          {pub.type}
                        </span>
                        {pub.quartile && pub.quartile !== 'NONE' && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                            {pub.quartile}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-500 tabular-nums">{pub.year}</span>
                        {pub.citationsCount > 0 && (
                          <span className="text-xs font-semibold text-blue-700 tabular-nums ml-auto">
                            Iqtiboslar: {pub.citationsCount}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{pub.title}</h4>
                      <p className="text-xs text-slate-600">
                        {pub.journalOrPublisher} {pub.doi && `• DOI: ${pub.doi}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'grants' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Ilmiy grantlar va loyihalar</h3>
              {s.grantProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Grant loyihalari kiritilmagan.</div>
              ) : (
                <div className="space-y-4">
                  {s.grantProjects.map((g) => (
                    <div key={g.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="text-xs font-semibold text-blue-600">
                        {g.fundingSource} ({g.startYear} - {g.endYear || 'Hozirgacha'})
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{g.title}</h4>
                      <p className="text-xs text-slate-600">Roli: {g.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'supervisions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">PhD / DSc ilmiy rahbarlik</h3>
              {s.supervisions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Ilmiy rahbarlik ma’lumotlari yo‘q.</div>
              ) : (
                <div className="space-y-4">
                  {s.supervisions.map((sup) => (
                    <div key={sup.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded">{sup.degreeType}</span>
                        <span className="text-xs text-slate-500">{sup.year}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Shogird: {sup.studentName}</h4>
                      <p className="text-xs text-slate-600">Dissertatsiya: {sup.dissertationTitle}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'coauthors' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Hammualliflar</h3>
              {s.coAuthors.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Hammualliflar topilmadi.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.coAuthors.map((co, idx) => (
                    <Link
                      key={co.id}
                      href={`/scholars/${co.id}`}
                      className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all flex items-center gap-3"
                    >
                      <ScholarAvatar photoUrl={co.photoUrl} fullName={co.fullName} index={idx + 1} className="w-11 h-11" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{co.fullName}</div>
                        <div className="text-xs text-slate-500">{co.department?.nameUz || co.department?.nameEn}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Biografiya</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{s.bioUz || s.bioEn || s.bioRu || 'Biografiya kiritilmagan.'}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ilmiy qiziqishlar</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const interests = JSON.parse(s.researchInterests || '[]')
                      if (Array.isArray(interests) && interests.length > 0) {
                        return interests.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl">
                            {tag}
                          </span>
                        ))
                      }
                    } catch (e) {}
                    return <span className="text-xs text-slate-500">{s.researchInterests}</span>
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
