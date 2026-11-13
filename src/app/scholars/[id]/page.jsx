'use client'

import { useState, useEffect, startTransition } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Award, BookOpen, Briefcase, GraduationCap, Users, User, ExternalLink, Download, Mail, Globe } from 'lucide-react'

export default function ScholarProfilePage() {
  const params = useParams()
  const { id } = params
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('publications')

  // Publications filters
  const [pubYear, setPubYear] = useState('ALL')
  const [pubType, setPubType] = useState('ALL')

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

  const handleDownloadPdfCv = () => {
    if (!data?.scholar) return
    const s = data.scholar
    const content = `
TASHKENT INTERNATIONAL UNIVERSITY — ACADEMIC CURRICULUM VITAE
==============================================================
Name: ${s.fullName}
Degree: ${s.academicDegree} (${s.academicTitle})
Department: ${s.department?.nameEn}
Faculty: ${s.department?.faculty?.nameEn}
Email: ${s.publicEmail || s.user?.email}
ORCID: ${s.orcidId || 'N/A'} | Scopus ID: ${s.scopusId || 'N/A'}

SCIENTIFIC METRICS:
- H-Index: ${s.hIndex}
- Total Citations: ${s.totalCitations}
- Approved Publications: ${s.publications.length}
- TIU Score: ${s.tiuScore}

BIOGRAPHY:
${s.bioEn || 'No biography provided.'}

RESEARCH INTERESTS:
${s.researchInterests}

APPROVED PUBLICATIONS (${s.publications.length}):
${s.publications.map((p, idx) => `${idx + 1}. [${p.type}] ${p.title} - ${p.journalOrPublisher} (${p.year}) DOI: ${p.doi || 'N/A'}`).join('\n')}

APPROVED GRANTS (${s.grantProjects.length}):
${s.grantProjects.map((g, idx) => `${idx + 1}. ${g.title} (${g.fundingSource}, ${g.startYear}-${g.endYear || 'Present'})`).join('\n')}

PhD / DSc SUPERVISIONS (${s.supervisions.length}):
${s.supervisions.map((sup, idx) => `${idx + 1}. ${sup.studentName} (${sup.degreeType}): ${sup.dissertationTitle} (${sup.year})`).join('\n')}
==============================================================
Generated via TIU Scholars Portal (https://tiu.uz)
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${s.fullName.replace(/\s+/g, '_')}_CV.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-20 text-neutral-500">Loading scholar profile...</div>
  if (!data?.scholar) return <div className="text-center py-20 text-neutral-500">Scholar profile not found or inactive.</div>

  const s = data.scholar
  const filteredPubs = s.publications.filter(p => {
    if (pubYear !== 'ALL' && String(p.year) !== pubYear) return false
    if (pubType !== 'ALL' && p.type !== pubType) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-900 text-white rounded-2xl font-bold text-3xl flex items-center justify-center shadow-md">
            {s.fullName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-neutral-900">{s.fullName}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                {s.academicDegree}
              </span>
            </div>
            <p className="text-neutral-600 font-medium text-sm">{s.department?.nameEn} • {s.department?.faculty?.nameEn}</p>
            <p className="text-neutral-500 text-xs capitalize">{s.academicTitle.toLowerCase()}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-600">
              {s.publicEmail && (
                <a href={`mailto:${s.publicEmail}`} className="flex items-center gap-1.5 hover:text-blue-600 font-medium">
                  <Mail className="w-4 h-4 text-neutral-400" /> {s.publicEmail}
                </a>
              )}
              {s.orcidId && (
                <a href={`https://orcid.org/${s.orcidId}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 font-medium">
                  <ExternalLink className="w-4 h-4 text-neutral-400" /> ORCID: {s.orcidId}
                </a>
              )}
              {s.scopusId && (
                <span className="flex items-center gap-1.5 font-medium">
                  <ExternalLink className="w-4 h-4 text-neutral-400" /> Scopus ID: {s.scopusId}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadPdfCv}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-2xl shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Download CV
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">H-Index</div>
          <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{s.hIndex}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Total Citations</div>
          <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{s.totalCitations}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Approved Publications</div>
          <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{s.publications.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">TIU Score</div>
          <div className="text-3xl font-extrabold text-blue-600 tabular-nums">{s.tiuScore}</div>
        </div>
      </div>

      {/* 5 Interactive Tabs */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          {[
            { id: 'publications', label: `Publications (${s.publications.length})`, icon: BookOpen },
            { id: 'grants', label: `Grants (${s.grantProjects.length})`, icon: Briefcase },
            { id: 'supervisions', label: `Supervisions (${s.supervisions.length})`, icon: GraduationCap },
            { id: 'coauthors', label: `Co-Authors (${s.coAuthors.length})`, icon: Users },
            { id: 'bio', label: 'Biography & Interests', icon: User },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
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
                <h3 className="text-lg font-bold text-neutral-900">Approved Publications</h3>
                <div className="flex gap-3">
                  <select
                    value={pubType}
                    onChange={(e) => setPubType(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="ALL">All Types</option>
                    <option value="SCOPUS">SCOPUS</option>
                    <option value="WOS">Web of Science</option>
                    <option value="OAK">OAK</option>
                    <option value="INTERNATIONAL_JOURNAL">International Journal</option>
                  </select>
                </div>
              </div>

              {filteredPubs.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">No publications found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredPubs.map(pub => (
                    <div key={pub.id} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                      <div className="flex items-center gap-2">
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
                      <h4 className="font-bold text-neutral-900 text-base">{pub.title}</h4>
                      <p className="text-xs text-neutral-600">{pub.journalOrPublisher} {pub.doi && `• DOI: ${pub.doi}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'grants' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-neutral-900">Research Grants & Projects</h3>
              {s.grantProjects.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">No grant projects recorded.</div>
              ) : (
                <div className="space-y-4">
                  {s.grantProjects.map(g => (
                    <div key={g.id} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                      <div className="text-xs font-semibold text-blue-600">{g.fundingSource} ({g.startYear} - {g.endYear || 'Present'})</div>
                      <h4 className="font-bold text-neutral-900 text-base">{g.title}</h4>
                      <p className="text-xs text-neutral-600">Role: {g.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'supervisions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-neutral-900">PhD / DSc Supervisions</h3>
              {s.supervisions.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">No supervisions recorded.</div>
              ) : (
                <div className="space-y-4">
                  {s.supervisions.map(sup => (
                    <div key={sup.id} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded">{sup.degreeType}</span>
                        <span className="text-xs text-neutral-500">{sup.year}</span>
                      </div>
                      <h4 className="font-bold text-neutral-900 text-base">Student: {sup.studentName}</h4>
                      <p className="text-xs text-neutral-600">Dissertation: {sup.dissertationTitle}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'coauthors' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-neutral-900">Co-Authors</h3>
              {s.coAuthors.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">No co-authors found from shared publications.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.coAuthors.map(co => (
                    <Link
                      key={co.id}
                      href={`/scholars/${co.id}`}
                      className="p-4 bg-neutral-50 hover:bg-blue-50 border border-neutral-200 hover:border-blue-300 rounded-2xl transition-all flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl font-bold flex items-center justify-center">
                        {co.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">{co.fullName}</div>
                        <div className="text-xs text-neutral-500">{co.department?.nameEn}</div>
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
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Biography</h3>
                <p className="text-neutral-700 text-sm leading-relaxed">{s.bioEn || s.bioUz || s.bioRu || 'No biography provided.'}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Research Interests</h3>
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
                    return <span className="text-xs text-neutral-500">{s.researchInterests}</span>
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
