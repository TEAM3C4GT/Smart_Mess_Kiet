import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Users,
  CookingPot,
  Bell,
  AlertTriangle,
  Flag,
  Send,
  Check,
  Building,
  UtensilsCrossed,
  Clock,
  Star,
  Receipt
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const PrincipalDashboard = () => {
  const {
    principalAnalytics,
    principalRollups,
    togglePrincipalRollupFlag,
    remindPendingStudentPrincipal,
    remindAllPendingPrincipal,
    principalMess,
    principalNotifications,
    markAllPrincipalNotificationsRead,
    addToast
  } = useApp();

  // Active top navigation tab: 'Analytics' | 'Rollups' | 'Mess' | 'Alerts'
  const [activeTab, setActiveTab] = useState('Analytics');

  const principalNavTabs = [
    { id: 'Analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'Rollups', label: 'Rollups', icon: Users },
    { id: 'Mess', label: 'Mess', icon: CookingPot },
    { id: 'Alerts', label: 'Alerts', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentRole="Principal"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Mobile Top Navigation Pills (shown only on small screens where header tabs are hidden) */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto gap-1 px-4 py-2.5 bg-white border-b border-slate-200/80 scrollbar-none sticky top-14 z-20">
        {principalNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#e6f4ea] text-[#1b4d3e] font-bold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ==================================================================== */}
        {/* TAB 1: ANALYTICS (Matching Reference Screenshots 1 & 2)              */}
        {/* ==================================================================== */}
        {activeTab === 'Analytics' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">
                PRINCIPAL • BIRDS-EYE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Campus analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                14-day trends across mess wastage, block submissions, and food court.
              </p>
            </div>

            {/* 4 Metric Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  AVG WASTAGE
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {principalAnalytics.avgWastage}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  MESS RATING
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-1">
                  <span>{principalAnalytics.messRating}</span>
                  <span className="text-amber-500">★</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  KFC ORDERS (14D)
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {principalAnalytics.kfcOrders14d}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  KFC REVENUE
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  ₹{principalAnalytics.kfcRevenue}
                </p>
              </div>
            </div>

            {/* Predicted vs Actual (14d) Line Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                Predicted vs actual (14d)
              </h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={principalAnalytics.predictedVsActual}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis
                      domain={[0, 1]}
                      ticks={[0, 0.25, 0.5, 0.75, 1]}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={28}
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', color: '#475569' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="actual"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      dot={{ r: 2.5, fill: '#ef4444' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="predicted"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      dot={{ r: 2.5, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Block Submission Rate (today) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <Building className="w-4 h-4 text-slate-600" />
                Block submission rate (today)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {principalAnalytics.blockRates.map((block) => (
                  <div
                    key={block.block}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                        {block.block}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {block.ratio}
                      </span>
                    </div>

                    <p className="text-xl font-black text-rose-600 mt-2">
                      {block.rate}%
                    </p>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${block.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KFC Food Court Footfall Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">
                KFC food court footfall
              </h3>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={principalAnalytics.kfcFootfall}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      formatter={(val) => [`${val} orders`, 'Footfall']}
                    />
                    <Bar dataKey="count" fill="#e4002b" radius={[4, 4, 0, 0]} maxBarSize={400} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Escalation Log */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-6">
                Escalation log
              </h3>

              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                No escalations.
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: ROLLUPS (Matching Reference Screenshot 3)                     */}
        {/* ==================================================================== */}
        {activeTab === 'Rollups' && (
          <div className="space-y-6">
            {/* Header & Escalation Flag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">
                  CAMPUS ROLLUP
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Meal submissions • {principalRollups.date}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Live progress across your scope • cutoff {principalRollups.cutoff}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50/90 border border-amber-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Below 60% — consider escalating</span>
                <button
                  onClick={togglePrincipalRollupFlag}
                  className={`ml-2 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    principalRollups.flagged
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white hover:bg-amber-100/60 border-amber-300 text-amber-800'
                  }`}
                >
                  Flag
                </button>
              </div>
            </div>

            {/* Progress & Meal Breakdown Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left side: Overall submission % & progress bar */}
              <div className="flex-1 max-w-md">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {principalRollups.rate}%
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {principalRollups.submitted}/{principalRollups.total} submitted • {principalRollups.pending} pending
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-[#1b4d3e] h-full rounded-full transition-all"
                    style={{ width: `${principalRollups.rate}%` }}
                  ></div>
                </div>
              </div>

              {/* Right side: 4 meal counters */}
              <div className="flex items-center gap-6 sm:gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                <div>
                  <span className="text-xl font-bold text-slate-900 block text-center">
                    {principalRollups.mealCounts.breakfast}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                    BREAKFAST
                  </span>
                </div>

                <div>
                  <span className="text-xl font-bold text-slate-900 block text-center">
                    {principalRollups.mealCounts.lunch}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                    LUNCH
                  </span>
                </div>

                <div>
                  <span className="text-xl font-bold text-slate-900 block text-center">
                    {principalRollups.mealCounts.snacks}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                    SNACKS
                  </span>
                </div>

                <div>
                  <span className="text-xl font-bold text-slate-900 block text-center">
                    {principalRollups.mealCounts.dinner}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                    DINNER
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Students List */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Pending students ({principalRollups.pendingStudents.length})
                </h3>

                <button
                  onClick={remindAllPendingPrincipal}
                  className="bg-[#1b4d3e] hover:bg-[#163f33] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Remind all</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {principalRollups.pendingStudents.map((st) => (
                  <div
                    key={st.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {st.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {st.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {st.email} • {st.room}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => remindPendingStudentPrincipal(st.name)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-slate-500" />
                      <span>Remind</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MESS (Matching Reference Screenshot 4)                        */}
        {/* ==================================================================== */}
        {activeTab === 'Mess' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">
                MESS CONSOLE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Cook plan • {principalMess.date}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Headcounts, forecast, and suggested cook quantities.
              </p>
            </div>

            {/* Buffer Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => (
                <div
                  key={mealKey}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    {mealKey.toUpperCase()}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {principalMess.buffers[mealKey]}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Predicted + 8% buffer
                  </p>
                </div>
              ))}
            </div>

            {/* Locked Headcount by Block Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">
                Locked headcount by block
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                      <th className="pb-3">BLOCK</th>
                      <th className="pb-3">STUDENTS</th>
                      <th className="pb-3">BREAKFAST</th>
                      <th className="pb-3">LUNCH</th>
                      <th className="pb-3">SNACKS</th>
                      <th className="pb-3">DINNER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {principalMess.lockedHeadcount.map((row) => (
                      <tr key={row.block} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-bold text-slate-900">{row.block}</td>
                        <td className="py-3 text-slate-700">{row.students}</td>
                        <td className="py-3 text-slate-500 font-mono">{row.breakfast}</td>
                        <td className="py-3 text-slate-500 font-mono">{row.lunch}</td>
                        <td className="py-3 text-slate-500 font-mono">{row.snacks}</td>
                        <td className="py-3 text-slate-500 font-mono">{row.dinner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Menu & Suggested Cook Qty */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CookingPot className="w-4 h-4 text-slate-600" />
                  Menu & suggested cook qty
                </h3>

                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Total predicted: 0
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {principalMess.suggestedCook.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-center gap-3.5 hover:border-slate-300 transition-all"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {item.meal}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {item.formula}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: ALERTS (Matching Reference Screenshot 5)                      */}
        {/* ==================================================================== */}
        {activeTab === 'Alerts' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">
                  INBOX
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  {principalNotifications.length} unread • {principalNotifications.length} total
                </p>
              </div>

              <button
                onClick={markAllPrincipalNotificationsRead}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark all read</span>
              </button>
            </div>

            {/* Empty Inbox Container */}
            <div className="bg-white rounded-2xl border border-slate-200/90 py-16 px-6 text-center shadow-xs">
              <p className="text-sm font-medium text-slate-400">
                No notifications yet.
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-300 cursor-not-allowed"
              >
                Previous
              </button>

              <span className="font-bold text-slate-700">Page 1</span>

              <button
                disabled
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-300 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrincipalDashboard;
