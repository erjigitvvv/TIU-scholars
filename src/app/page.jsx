import Link from 'next/link'
import { BookOpen, Users, Award, Briefcase, Search, Globe, ExternalLink, ArrowRight } from 'lucide-react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function Home() {
  // Fetch stats & top scholars strictly for ACTIVE scholars and APPROVED publications
  const activeScholarsCount = await prisma.scholarProfile.count({
    where: { user: { accountStatus: 'ACTIVE' } }
  })

  const approvedPubsCount = await prisma.publication.count({
    where: { status: 'APPROVED' }
  })

  const grantsCount = await prisma.grantProject.count({
    where: { status: 'APPROVED' }
  })

  // Calculate total citations from approved publications
  const approvedPubs = await prisma.publication.findMany({
    where: { status: 'APPROVED' },
    select: { citationsCount: true }
  })
  const totalCitations = approvedPubs.reduce((acc, p) => acc + (p.citationsCount || 0), 0)

  // Top 5 Researchers
  const topScholars = await prisma.scholarProfile.findMany({
    where: { user: { accountStatus: 'ACTIVE' } },
    include: { department: { include: { faculty: true } } },
    orderBy: { tiuScore: 'desc' },
    take: 5,
  })

  // Faculties with counts
  const faculties = await prisma.faculty.findMany({
    include: {
      departments: {
        include: {
          scholars: {
            where: { user: { accountStatus: 'ACTIVE' } },
            include: {
              publications: {
                include: { publication: true }
              }
            }
          }
        }
      }
    }
  })

  // Latest 5 Approved Publications
  const latestPubs = await prisma.publication.findMany({
    where: { status: 'APPROVED' },
    include: {
      authors: {
        include: { scholar: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-950 text-white py-20 px-6 rounded-3xl mx-6 mt-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.3),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-block px-4 py-1.5 bg-blue-800/80 text-blue-200 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-700">
            Tashkent International University
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Scientific Potential & Scholars Portal
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto font-light">
            Explore cutting-edge research, Scopus & Web of Science publications, research grants, and doctoral supervisions.
          </p>

          {/* Search Bar */}
          <form action="/scholars" method="GET" className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-lg flex gap-2">
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                name="q"
                placeholder="Search scholar name, research interest, or keyword..."
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Animated KPI Cards */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{activeScholarsCount}</div>
              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Active Scholars</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{approvedPubsCount}</div>
              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Approved Publications</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{totalCitations}</div>
              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Total Citations</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-neutral-900 tabular-nums">{grantsCount}</div>
              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Funded Grants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top-5 Researchers Showcase */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Leading Researchers</h2>
            <p className="text-neutral-600 text-sm mt-1">Top ranking professors and scholars by TIU Score</p>
          </div>
          <Link href="/scholars" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1.5">
            View All Scholars <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {topScholars.map((scholar, idx) => (
            <Link
              key={scholar.id}
              href={`/scholars/${scholar.id}`}
              className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-xl font-bold flex items-center justify-center text-lg">
                    {scholar.fullName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                    #{idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-1">{scholar.fullName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{scholar.department.nameEn}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex justify-between items-center text-xs font-semibold">
                <span className="text-neutral-500">TIU Score</span>
                <span className="text-blue-600 text-sm tabular-nums">{scholar.tiuScore}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Faculties Quick Filter Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Faculties & Academic Units</h2>
          <p className="text-neutral-600 text-sm mt-1">Explore research activity by faculty</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faculties.map((faculty) => {
            const facultyScholars = faculty.departments.flatMap(d => d.scholars)
            const facultyPubsCount = facultyScholars.reduce((acc, s) => acc + s.publications.filter(p => p.publication.status === 'APPROVED').length, 0)

            return (
              <Link
                key={faculty.id}
                href={`/scholars?facultyId=${faculty.id}`}
                className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-neutral-100 text-neutral-800 rounded-xl font-bold flex items-center justify-center text-sm">
                    {faculty.code}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                    {faculty.departments.length} Depts
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-lg">{faculty.nameEn}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{facultyScholars.length} Active Scholars • {facultyPubsCount} Publications</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Latest Approved Publications */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Latest Approved Publications</h2>
            <p className="text-neutral-600 text-sm mt-1">Recent peer-reviewed research papers added to the repository</p>
          </div>
          <Link href="/publications" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1.5">
            View All Publications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm divide-y divide-neutral-200">
          {latestPubs.map((pub) => (
            <div key={pub.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-50 transition-colors">
              <div className="space-y-1.5 max-w-3xl">
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
                <h3 className="font-bold text-neutral-900 text-base">{pub.title}</h3>
                <p className="text-xs text-neutral-600">
                  {pub.journalOrPublisher} {pub.doi && `• DOI: ${pub.doi}`}
                </p>
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
      </section>
    </div>
  )
}
