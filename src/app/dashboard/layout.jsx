import Link from 'next/link'
import { LayoutDashboard, BookOpen, Briefcase, GraduationCap, User, LogOut, Globe } from 'lucide-react'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-neutral-900 tracking-tight">
            TIU <span className="text-blue-600">Scholars</span>
          </Link>
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 font-medium rounded">Professor</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-neutral-500" />
            Overview
          </Link>
          <Link
            href="/dashboard/publications"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-neutral-500" />
            My Publications
          </Link>
          <Link
            href="/dashboard/grants"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-neutral-500" />
            Grants & Projects
          </Link>
          <Link
            href="/dashboard/supervisions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-neutral-500" />
            PhD/DSc Supervisions
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <User className="w-4 h-4 text-neutral-500" />
            Profile Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-neutral-400" />
            Public Portal
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">Professor Cabinet</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 font-medium">Active Professor Session</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
