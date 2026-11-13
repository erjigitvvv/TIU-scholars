import { PrismaClient } from '@prisma/client'
import { Award, BookOpen, Users, Briefcase, GraduationCap, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const prisma = new PrismaClient()

export default async function DashboardOverview() {
  // For demo/simulated session, fetch the first scholar profile or create/seed if none
  let scholar = await prisma.scholarProfile.findFirst({
    include: {
      department: {
        include: { faculty: true }
      },
      publications: {
        include: { publication: true }
      },
      grantProjects: true,
      supervisions: true,
      kpiTargets: true,
    }
  })

  if (!scholar) {
    return (
      <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No Scholar Profile Found</h2>
        <p className="text-neutral-600 mb-4">Please seed the database or complete your profile setup.</p>
      </div>
    )
  }

  const pubs = scholar.publications.map(p => p.publication)
  const approvedCount = pubs.filter(p => p.status === 'APPROVED').length
  const pendingCount = pubs.filter(p => p.status === 'PENDING').length
  const rejectedCount = pubs.filter(p => p.status === 'REJECTED').length

  const kpiTarget = scholar.kpiTargets[0] || { targetPublications: 5, targetScopus: 2, targetScore: 25 }
  const pubProgress = Math.min(100, Math.round((approvedCount / (kpiTarget.targetPublications || 1)) * 100))
  const scoreProgress = Math.min(100, Math.round((scholar.tiuScore / (kpiTarget.targetScore || 1)) * 100))

  const recentNotifications = pubs.filter(p => p.status === 'REJECTED').slice(0, 3)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Welcome back, {scholar.fullName}!</h2>
          <p className="text-neutral-600 text-sm mt-1">
            {scholar.department.nameEn} • {scholar.academicDegree} ({scholar.academicTitle})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Account Active
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Pubs</span>
            <BookOpen className="w-5 text-blue-600 h-5" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">{approvedCount}</div>
          <div className="text-xs text-neutral-500 mt-1">{pendingCount} pending review</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">H-Index</span>
            <TrendingUp className="w-5 text-indigo-600 h-5" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">{scholar.hIndex}</div>
          <div className="text-xs text-neutral-500 mt-1">{scholar.totalCitations} total citations</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">TIU Score</span>
            <Award className="w-5 text-amber-600 h-5" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">{scholar.tiuScore}</div>
          <div className="text-xs text-neutral-500 mt-1">Weighted metric index</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Grants</span>
            <Briefcase className="w-5 text-emerald-600 h-5" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">{scholar.grantProjects.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Active research projects</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supervisions</span>
            <GraduationCap className="w-5 text-purple-600 h-5" />
          </div>
          <div className="text-3xl font-bold text-neutral-900">{scholar.supervisions.length}</div>
          <div className="text-xs text-neutral-500 mt-1">PhD / DSc candidates</div>
        </div>
      </div>

      {/* Annual KPI Target Progress Bars */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-neutral-900">Annual KPI Targets ({new Date().getFullYear()})</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-neutral-700">Approved Publications Target ({approvedCount} / {kpiTarget.targetPublications})</span>
              <span className="text-blue-600">{pubProgress}%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pubProgress}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-neutral-700">TIU Score Target ({scholar.tiuScore} / {kpiTarget.targetScore})</span>
              <span className="text-emerald-600">{scoreProgress}%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${scoreProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications / Rejections */}
      {recentNotifications.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Moderation Rejections Requiring Attention</span>
          </div>
          <div className="space-y-3">
            {recentNotifications.map(pub => (
              <div key={pub.id} className="bg-white p-4 rounded-xl border border-red-100 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">{pub.title}</h4>
                  <p className="text-xs text-red-600 mt-0.5">Reason: {pub.rejectionReason || 'No reason provided'}</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 font-semibold rounded-full">Rejected</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
