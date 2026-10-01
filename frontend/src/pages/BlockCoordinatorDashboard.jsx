import React from 'react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import {
  Send,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  Building,
  AlertCircle,
  Clock,
  BellRing,
  Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const BlockCoordinatorDashboard = () => {
  const {
    blockData,
    blockConsolidatedSent,
    sendBlockConsolidatedCount,
    nudgeFloorIncharge,
    nudgeRoomLead,
    floorRooms = []
  } = useApp();

  const totalFloors = blockData.length;
  const totalRooms = blockData.reduce((sum, f) => sum + f.rooms, 0);
  const totalStudents = blockData.reduce((sum, f) => sum + f.totalStudents, 0);
  const totalSubmissions = blockData.reduce((sum, f) => sum + f.submitted, 0);
  const totalPending = blockData.reduce((sum, f) => sum + f.pending, 0);
  const overallRate = totalStudents > 0 ? ((totalSubmissions / totalStudents) * 100).toFixed(1) : 0;

  // Dynamically aggregated meal headcount from live room members and floor rooms
  const d101Sub = floorRooms.find((r) => r.roomNo === 'Room D-101')?.submitted || 5;
  const otherSub = floorRooms.filter((r) => r.roomNo !== 'Room D-101').reduce((s, r) => s + (r.submitted || 0), 0);
  const liveTotalSub = d101Sub + otherSub;

  const mealCountData = [
    { meal: 'Breakfast', submitted: Math.round(liveTotalSub * 0.95), expected: totalStudents || 40 },
    { meal: 'Lunch', submitted: Math.round(liveTotalSub * 1.0), expected: totalStudents || 40 },
    { meal: 'Snacks', submitted: Math.round(liveTotalSub * 0.8), expected: totalStudents || 40 },
    { meal: 'Dinner', submitted: Math.round(liveTotalSub * 0.95), expected: totalStudents || 40 }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans">
      <Navbar currentRole="Block Coordinator" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md">
                Block Level Consolidation
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Hostel Blocks D & E</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Block D & E Coordinator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Multi-floor aggregation, live cutoff monitoring, and mess kitchen forwarding.
            </p>
          </div>

          <button
            onClick={sendBlockConsolidatedCount}
            className={`font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer ${
              blockConsolidatedSent
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-[#1b4d3e] hover:bg-[#143d31] text-white shadow-[#1b4d3e]/20 hover:shadow-md'
            }`}
          >
            {blockConsolidatedSent ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Consolidated Count Sent</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Send Consolidated Count to Mess</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL FLOORS
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalFloors}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" /> Floors 1 - 4
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL ROOMS
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalRooms}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" /> {totalStudents} Students Total
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL SUBMISSIONS
            </span>
            <p className="text-2xl font-extrabold text-[#1b4d3e] mt-1">{totalSubmissions}</p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {overallRate}% Overall Rate
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PENDING STUDENTS
            </span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalPending}</p>
            <p className="text-xs text-amber-600 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Across all floors
            </p>
          </div>
        </div>

        {/* Meal Count Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1b4d3e]" />
                Consolidated Meal Headcount (Submitted vs Expected)
              </h3>
              <p className="text-xs text-slate-500">
                Total meal counts ready to be transferred to kitchen preparation
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-[#e6f4ea] px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto border border-emerald-200/60">
              Kitchen Sync Ready
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealCountData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="meal" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                <Bar dataKey="submitted" name="Submitted Count" fill="#1b4d3e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expected" name="Expected Max Count" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floor Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Floor-wise Submission Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Block D & Block E floor performance and submission status
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cutoff: 10:00 PM Tonight</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Floor</th>
                  <th className="pb-3">Total Rooms</th>
                  <th className="pb-3">Submissions</th>
                  <th className="pb-3">Submission Rate</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Floor Incharge Connect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockData.map((fl) => (
                  <tr key={fl.floor} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1b4d3e]"></span>
                      <span>{fl.floor}</span>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{fl.rooms} Rooms</td>
                    <td className="py-3.5 text-slate-700 font-semibold font-mono text-xs">
                      {fl.submitted} / {fl.totalStudents} Students
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 min-w-10">{fl.rate}%</span>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#1b4d3e] h-full rounded-full transition-all duration-500"
                            style={{ width: `${fl.rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          fl.rate >= 85
                            ? 'bg-emerald-50 text-[#1b4d3e] border-emerald-200/70'
                            : 'bg-amber-50 text-amber-800 border-amber-200/70'
                        }`}
                      >
                        {fl.rate >= 85 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        )}
                        {fl.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {fl.pending > 0 ? (
                        <button
                          onClick={() => nudgeFloorIncharge(fl.floor, fl.pending)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95 ml-auto"
                          title={`Dispatch urgent cutoff notice to Floor Incharge for ${fl.floor}`}
                        >
                          <BellRing className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                          <span>Nudge Incharge ({fl.pending} pending)</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs ml-auto">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>100% Incharge Verified</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Block D & E Room Leads Coordination & Direct Nudge */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Block D & Block E Room Leads Coordination
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct oversight of Room Leads across 4 floors. Dispatch real-time compliance nudges before cutoff.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono font-medium">
                Total 8 Rooms Managed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Room Lead</th>
                  <th className="pb-3">Floor / Block</th>
                  <th className="pb-3">Submissions</th>
                  <th className="pb-3">Compliance</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Direct Room Lead Nudge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {floorRooms.map((room) => {
                  const isBlockD = room.roomNo.includes('D-');
                  const floorNum = room.roomNo.includes('10') ? 'Floor 1' : 'Floor 2';
                  const isComplete = room.pending === 0;

                  return (
                    <tr key={room.roomNo} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBlockD ? 'bg-[#1b4d3e]' : 'bg-blue-600'
                          }`}
                        ></span>
                        <span className="font-mono">{room.roomNo}</span>
                      </td>
                      <td className="py-3.5 text-slate-800 font-medium">
                        {room.lead}
                      </td>
                      <td className="py-3.5 text-slate-500 text-xs font-mono">
                        {floorNum} • {isBlockD ? 'Block D' : 'Block E'}
                      </td>
                      <td className="py-3.5 text-slate-700 font-semibold font-mono text-xs">
                        {room.submitted} / {room.members}
                      </td>
                      <td className="py-3.5 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 min-w-8 text-xs">{room.rate}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                room.rate === 100
                                  ? 'bg-[#1b4d3e]'
                                  : room.rate >= 75
                                  ? 'bg-emerald-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${room.rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isComplete
                              ? 'bg-emerald-50 text-[#1b4d3e] border-emerald-200/70'
                              : 'bg-amber-50 text-amber-800 border-amber-200/70'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {isComplete ? 'Complete' : `${room.pending} Pending`}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {!isComplete ? (
                          <button
                            onClick={() =>
                              nudgeRoomLead(
                                room.roomNo,
                                `Urgent cutoff notice: ${room.pending} pending student meal selections`,
                                'Nithin (Block Coordinator)'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95 ml-auto"
                            title={`Nudge ${room.lead} of ${room.roomNo}`}
                          >
                            <BellRing className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                            <span>Nudge Lead ({room.lead.split(' ')[0]})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              nudgeRoomLead(
                                room.roomNo,
                                '100% headcount verified. Prepared for kitchen consolidation.',
                                'Nithin (Block Coordinator)'
                              )
                            }
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold text-xs ml-auto border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 px-2.5 py-1 rounded-md transition-colors"
                            title={`Send acknowledgement to ${room.lead}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified ✓</span>
                          </button>
                        )}
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
  );
};
