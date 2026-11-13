'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { CheckCircle2, XCircle, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminModerationPage() {
  const [tab, setTab] = useState('publications'); // publications, grants, supervisions
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchItems = useCallback(async (currentTab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation?type=${currentTab}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch moderation items', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchItems(tab);
    });
  }, [tab, fetchItems]);

  const handleAction = async (id, status, reason = null) => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: tab, status, rejectionReason: reason }),
      });
      if (res.ok) {
        setRejectModalItem(null);
        setRejectionReason('');
        fetchItems(tab);
      }
    } catch (err) {
      console.error('Moderation action failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Moderation Queue</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve pending publications, grants, and supervisions.</p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setTab('publications')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'publications' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Publications
          </button>
          <button
            onClick={() => setTab('grants')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'grants' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grants
          </button>
          <button
            onClick={() => setTab('supervisions')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'supervisions' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Supervisions
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading moderation queue...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No pending items in this queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Details</th>
                  <th className="py-3 px-6">Submitter</th>
                  <th className="py-3 px-6">Type / Info</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 max-w-md">
                        {item.title || item.dissertationTitle}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.journalOrPublisher || item.fundingSource || `Student: ${item.studentName}`} ({item.year || item.startYear})
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                        >
                          Verify Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {item.submittedBy?.email || item.scholar?.fullName || 'Scholar'}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg">{item.type || item.degreeType || item.role}</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModalItem(item)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reject Submission</h3>
            <p className="text-xs text-slate-500">Provide a rejection reason so the scholar can update and resubmit.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectModalItem.id, 'REJECTED', rejectionReason)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
