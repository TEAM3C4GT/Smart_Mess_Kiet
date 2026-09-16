import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  FileText,
  UserCheck,
  Bell,
  Flag,
  BarChart2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const FloorInchargeDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { floorRooms, remindRoomLead, flagRoom } = useApp();

  const totalRooms = floorRooms.length;
  const submittedRooms = floorRooms.filter((r) => r.rate >= 75).length;
  const pendingRooms = totalRooms - submittedRooms;
  const avgRate = Math.round(floorRooms.reduce((acc, r) => acc + r.rate, 0) / totalRooms);

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Floor Overview', icon: Building2 },
    { name: 'Low Participation', icon: AlertTriangle },
    { name: 'Reports', icon: FileText },
    { name: 'Profile', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="Floor Incharge" />

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
                <span className="text-xs font-bold text-slate-500">Floor Level View</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Floor 2 Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                2 Rooms Low Participation
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rooms</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalRooms}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Floor 2 Total</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Rooms</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">{submittedRooms}</p>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> High Participation
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Rooms</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRooms}</p>
              <p className="text-xs text-amber-600 mt-1 font-semibold">Need Attention</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Submission Rate</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{avgRate}%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${avgRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Submission Rate Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              Room Submission Rates (%)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Floor 2 room-wise completion status</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={floorRooms} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="roomNo" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {floorRooms.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate < 60 ? '#ef4444' : entry.rate < 80 ? '#f59e0b' : '#7c3aed'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Rooms & Participation Status</h3>
                <p className="text-xs text-slate-500">Monitor and escalate low submission rooms</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="pb-3">Room No</th>
                    <th className="pb-3">Room Lead</th>
                    <th className="pb-3">Submissions</th>
                    <th className="pb-3">Submission Rate</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {floorRooms.map((room) => {
                    const isLow = room.rate < 60;
                    return (
                      <tr
                        key={room.roomNo}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isLow ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          {room.roomNo}
                          {room.flagged && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              FLAGGED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-600 font-medium">{room.lead}</td>
                        <td className="py-3.5 text-slate-700 font-semibold">
                          {room.submitted} / {room.members}
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{room.rate}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  room.rate < 60
                                    ? 'bg-rose-500'
                                    : room.rate < 80
                                    ? 'bg-amber-500'
                                    : 'bg-purple-600'
                                }`}
                                style={{ width: `${room.rate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              room.rate < 60
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : room.rate < 80
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => remindRoomLead(room.roomNo, room.lead)}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors border border-purple-200 flex items-center gap-1"
                            >
                              <Bell className="w-3 h-3" />
                              Remind
                            </button>
                            <button
                              onClick={() => flagRoom(room.roomNo)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                room.flagged
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border-slate-200'
                              }`}
                              title="Flag Room"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
