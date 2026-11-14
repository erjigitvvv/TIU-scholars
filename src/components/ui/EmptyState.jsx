import { FileQuestion, RefreshCcw } from 'lucide-react'

export default function EmptyState({ title = "No records found", subtitle = "Try adjusting your search or filters to find what you are looking for.", onReset }) {
  return (
    <div className="bg-[#F8FAFC] border border-neutral-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
      <div className="w-16 h-16 bg-white text-neutral-400 rounded-2xl mx-auto flex items-center justify-center shadow-sm border border-neutral-100">
        <FileQuestion className="w-8 h-8 text-blue-600" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">{subtitle}</p>
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Reset Filters
        </button>
      )}
    </div>
  )
}
