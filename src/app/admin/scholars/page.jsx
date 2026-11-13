'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, UserCheck, Search, Filter } from 'lucide-react';

export default function AdminScholarsPage() {
  const [scholars, setScholars] = useState([]);
  const [tab, setTab] = useState('PENDING'); // PENDING or ALL
  const [rejectModalUserId, setRejectModalUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchScholars = useCallback(async (statusFilter) => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/admin/scholars?status=${statusFilter}` : '/api/admin/scholars';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setScholars(data);
      }
    } catch (err) {
      console.error('Failed to fetch scholars', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchScholars(tab === 'PENDING' ? 'PENDING' : null);
    });
  }, [tab, fetchScholars]);

  const handleStatusChange = async (userId, accountStatus, reason = null) => {
    try {
      const res = await fetch('/api/admin/scholars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accountStatus, rejectionReason: reason }),
      });
      if (res.ok) {
        setRejectModalUserId(null);
        setRejectionReason('');
        fetchScholars(tab === 'PENDING' ? 'PENDING' : null);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Scholar Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Approve registrations and manage accounts.</p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setTab('PENDING')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'PENDING' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Approvals
          </button>
          <button
            onClick={() => setTab('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'ALL' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Scholars
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading scholars...</div>
        ) : scholars.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No scholars found in this view.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Scholar</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Degree / Title</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholars.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="text-xs text-slate-500">{s.user?.email}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {s.department?.nameEn}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.user?.accountStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        s.user?.accountStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {s.user?.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {s.academicDegree} • {s.academicTitle}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {s.user?.accountStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(s.userId, 'ACTIVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModalUserId(s.userId)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {s.user?.accountStatus === 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusChange(s.userId, 'SUSPENDED')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition-all"
                        >
                          Suspend
                        </button>
                      )}
                      {s.user?.accountStatus === 'SUSPENDED' && (
                        <button
                          onClick={() => handleStatusChange(s.userId, 'ACTIVE')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reject Scholar Application</h3>
            <p className="text-xs text-slate-500">Provide a rejection reason so the scholar can update their application.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalUserId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(rejectModalUserId, 'REJECTED', rejectionReason)}
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
