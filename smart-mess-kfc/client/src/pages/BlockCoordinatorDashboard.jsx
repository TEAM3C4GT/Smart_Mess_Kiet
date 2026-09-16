import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  FileSpreadsheet,
  UserCheck,
  Send,
  CheckCircle2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const BlockCoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { blockData, blockConsolidatedSent, sendBlockConsolidatedCount } = useApp();

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Block Summary', icon: Boxes },
    { name: 'Floor Details', icon: Layers },
    { name: 'Reports', icon: FileSpreadsheet },
    { name: 'Profile', icon: UserCheck }
  ];

  const totalFloors = blockData.length;
  const totalRooms = blockData.reduce((sum, f) => sum + f.rooms, 0);
  const totalSubmissions = blockData.reduce((sum, f) => sum + f.submitted, 0);
  const totalPending = blockData.reduce((sum, f) => sum + f.pending, 0);

  const mealCountData = [
    { meal: 'Breakfast', submitted: 169, expected: 185 },
    { meal: 'Lunch', submitted: 185, expected: 195 },
    { meal: 'Snacks', submitted: 140, expected: 160 },
    { meal: 'Dinner', submitted: 178, expected: 190 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="Block Coordinator" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                  Block Level Consolidation
                </span>
                <span className="text-xs font-bold text-slate-500">Hostel Block B</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Block B Coordinator Dashboard
              </h1>
            </div>
            <button
              onClick={sendBlockConsolidatedCount}
              className={`font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto ${
                blockConsolidatedSent
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
              }`}
            >
              {blockConsolidatedSent ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Consolidated Count Sent
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Consolidated Count to Mess Incharge
                </>
              )}
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Floors</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalFloors}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Floors 1 - 4</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rooms</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">{totalRooms}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">200 Students Total</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{totalSubmissions}</p>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 84.5% Overall Rate
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Students</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalPending}</p>
              <p className="text-xs text-amber-600 mt-1 font-medium">Across all floors</p>
            </div>
          </div>

          {/* Meal Count Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Consolidated Meal Headcount (Submitted vs Expected)
            </h3>
            <p className="text-xs text-slate-500 mb-6">Total meal counts ready to be transferred to kitchen preparation</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealCountData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="meal" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submitted" name="Submitted Count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expected" name="Expected Max Count" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Floor Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Floor-wise Submission Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Block B floor performance status</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="pb-3">Floor</th>
                    <th className="pb-3">Total Rooms</th>
                    <th className="pb-3">Submissions</th>
                    <th className="pb-3">Submission Rate</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blockData.map((fl) => (
                    <tr key={fl.floor} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">{fl.floor}</td>
                      <td className="py-3.5 text-slate-600 font-medium">{fl.rooms} Rooms</td>
                      <td className="py-3.5 text-slate-700 font-semibold">
                        {fl.submitted} / {fl.totalStudents} Students
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{fl.rate}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${fl.rate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            fl.rate >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {fl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
