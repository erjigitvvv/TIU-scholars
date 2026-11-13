'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { Plus, Building2, Layers } from 'lucide-react';

export default function AdminSettingsPage() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFacultyNameUz, setNewFacultyNameUz] = useState('');
  const [newFacultyNameRu, setNewFacultyNameRu] = useState('');
  const [newFacultyNameEn, setNewFacultyNameEn] = useState('');

  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [newDeptNameUz, setNewDeptNameUz] = useState('');
  const [newDeptNameRu, setNewDeptNameRu] = useState('');
  const [newDeptNameEn, setNewDeptNameEn] = useState('');

  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faculties');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFaculties(data);
        setSelectedFacultyId((prev) => prev || (data.length > 0 ? data[0].id : ''));
      }
    } catch (err) {
      console.error('Failed to load faculties', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchFaculties();
    });
  }, [fetchFaculties]);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!newFacultyNameEn) return;
    try {
      const res = await fetch('/api/admin/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameUz: newFacultyNameUz || newFacultyNameEn,
          nameRu: newFacultyNameRu || newFacultyNameEn,
          nameEn: newFacultyNameEn,
        }),
      });
      if (res.ok) {
        setNewFacultyNameUz('');
        setNewFacultyNameRu('');
        setNewFacultyNameEn('');
        fetchFaculties();
      }
    } catch (err) {
      console.error('Failed to create faculty', err);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptNameEn || !selectedFacultyId) return;
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFacultyId,
          nameUz: newDeptNameUz || newDeptNameEn,
          nameRu: newDeptNameRu || newDeptNameEn,
          nameEn: newDeptNameEn,
        }),
      });
      if (res.ok) {
        setNewDeptNameUz('');
        setNewDeptNameRu('');
        setNewDeptNameEn('');
        fetchFaculties();
      }
    } catch (err) {
      console.error('Failed to create department', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">University Structure Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage faculties, departments, and academic configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Faculties Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Faculties
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
              {faculties.length} Total
            </span>
          </div>

          <form onSubmit={handleCreateFaculty} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Add New Faculty</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Name (EN)"
                value={newFacultyNameEn}
                onChange={(e) => setNewFacultyNameEn(e.target.value)}
                required
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Name (UZ)"
                value={newFacultyNameUz}
                onChange={(e) => setNewFacultyNameUz(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Name (RU)"
                value={newFacultyNameRu}
                onChange={(e) => setNewFacultyNameRu(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Faculty
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {faculties.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFacultyId(f.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedFacultyId === f.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{f.nameEn}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">{f.departments?.length || 0} Departments</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Departments
            </h3>
          </div>

          <form onSubmit={handleCreateDepartment} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Add Department to Selected Faculty</h4>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.nameEn}</option>
              ))}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Dept Name (EN)"
                value={newDeptNameEn}
                onChange={(e) => setNewDeptNameEn(e.target.value)}
                required
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Dept Name (UZ)"
                value={newDeptNameUz}
                onChange={(e) => setNewDeptNameUz(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Dept Name (RU)"
                value={newDeptNameRu}
                onChange={(e) => setNewDeptNameRu(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {faculties
              .find((f) => f.id === selectedFacultyId)
              ?.departments?.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{d.nameEn}</span>
                  <span className="text-xs text-slate-500">{d.code}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
