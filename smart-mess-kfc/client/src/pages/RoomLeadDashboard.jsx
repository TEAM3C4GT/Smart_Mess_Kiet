import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  BellRing,
  UserCheck,
  Send,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const RoomLeadDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { roomMembers, remindStudent, remindAllPendingInRoom } = useApp();

  const totalMembers = roomMembers.length;
  const submittedCount = roomMembers.filter((m) => m.status === 'Submitted').length;
  const pendingCount = totalMembers - submittedCount;
  const submissionRate = Math.round((submittedCount / totalMembers) * 100);

  const pieData = [
    { name: 'Submitted', value: submittedCount, color: '#7c3aed' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' }
  ];

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Room Overview', icon: Users },
    { name: 'Pending Students', icon: Clock },
    { name: 'Notifications', icon: BellRing },
    { name: 'Profile', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="Room Lead" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                  Hostel Block B
                </span>
                <span className="text-xs font-bold text-slate-500">Group 3</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Room 302 Dashboard
              </h1>
            </div>
            <button
              onClick={remindAllPendingInRoom}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Send className="w-4 h-4" />
              Send Reminder to Pending ({pendingCount})
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalMembers}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Room 302</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">{submittedCount}</p>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
              <p className="text-xs text-amber-600 mt-1 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Awaiting
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Rate</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{submissionRate}%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${submissionRate}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cutoff Time</span>
              <p className="text-2xl font-extrabold text-purple-900 mt-1">10:00 PM</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Tonight</p>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart Column */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
                  <PieIcon className="w-5 h-5 text-purple-600" />
                  Submission Breakdown
                </h3>
                <p className="text-xs text-slate-500">Live participation status for Room 302</p>
              </div>

              <div className="h-56 w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Room Lead: Alex Rivers</span>
                <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">Group 3</span>
              </div>
            </div>

            {/* Room Meal Choices Summary */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-lg mb-1">Room Meal Choices Summary</h3>
              <p className="text-xs text-slate-500 mb-6">Aggregated choices of room members for tomorrow</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { meal: 'Breakfast', count: 3, total: 5 },
                  { meal: 'Lunch', count: 4, total: 5 },
                  { meal: 'Snacks', count: 2, total: 5 },
                  { meal: 'Dinner', count: 3, total: 5 }
                ].map((item) => (
                  <div key={item.meal} className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-xs font-bold text-purple-700 uppercase">{item.meal}</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">{item.count} <span className="text-xs font-medium text-slate-500">/ {item.total} Will Eat</span></p>
                  </div>
                ))}
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Submission Status</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-bold text-slate-800">{member.name}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              member.status === 'Submitted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-medium">{member.time}</td>
                        <td className="py-3 text-right">
                          {member.status === 'Pending' ? (
                            <button
                              onClick={() => remindStudent(member.name)}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-lg text-xs transition-colors border border-purple-200"
                            >
                              Remind
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
