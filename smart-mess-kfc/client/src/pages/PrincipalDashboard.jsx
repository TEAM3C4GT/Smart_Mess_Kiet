import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Building2,
  ShoppingBag,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  UtensilsCrossed,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const PrincipalDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [anomalyTab, setAnomalyTab] = useState('Active');

  const {
    principalWastageTrend,
    blockPerformance,
    kfcHourlyFootfall,
    aiAnomalies,
    resolveAnomaly,
    addToast
  } = useApp();

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Wastage Analytics', icon: TrendingDown },
    { name: 'Hostel Blocks', icon: Building2 },
    { name: 'KFC Footfall', icon: ShoppingBag },
    { name: 'AI & Anomalies', icon: Sparkles },
    { name: 'Reports', icon: FileSpreadsheet }
  ];

  // Meal type distribution data for Pie Chart
  const mealDistributionData = [
    { name: 'Breakfast', count: 412, color: '#8b5cf6' },
    { name: 'Lunch', count: 455, color: '#6366f1' },
    { name: 'Snacks', count: 368, color: '#ec4899' },
    { name: 'Dinner', count: 440, color: '#3b82f6' }
  ];

  // Aggregated calculations
  const totalEnrolled = blockPerformance.reduce((acc, b) => acc + b.total, 0);
  const totalSubmissions = blockPerformance.reduce((acc, b) => acc + b.submitted, 0);
  const overallSubmissionRate = ((totalSubmissions / totalEnrolled) * 100).toFixed(1);
  const activeAnomaliesCount = aiAnomalies.filter((a) => a.status === 'Active').length;
  const resolvedAnomaliesCount = aiAnomalies.filter((a) => a.status === 'Resolved').length;

  // Real client-side data export generator (Ready to be wired to backend PDF endpoint)
  const handleDownloadReport = (report) => {
    let csvData = '';
    const dateStr = new Date().toISOString().slice(0, 10);

    if (report.id === 'wastage') {
      csvData = 'Day,Actual Waste (Kg),Target Limit (Kg),Food Saved (Kg)\n' +
        principalWastageTrend.map(r => `${r.day},${r.actualKg},${r.targetKg},${r.savedKg}`).join('\n');
    } else if (report.id === 'attendance') {
      csvData = 'Hostel Block,Block Incharge,Total Students,Submitted,Pending,Participation Rate (%)\n' +
        blockPerformance.map(b => `"${b.block}","${b.incharge}",${b.total},${b.submitted},${b.pending},${b.rate}%`).join('\n');
    } else if (report.id === 'kfc') {
      csvData = 'Time Window,Orders Count,Revenue (INR)\n' +
        kfcHourlyFootfall.map(k => `${k.time},${k.orders},${k.revenue}`).join('\n');
    } else {
      csvData = 'Metric,Value\n' +
        `Total Enrolled Students,${totalEnrolled}\n` +
        `Overall Submission Rate,${overallSubmissionRate}%\n` +
        `Food Wastage Rate,6.2 Kg/Day\n` +
        `Weekly Meals Saved,142 Meals\n` +
        `KFC Daily Revenue,18450 INR\n`;
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.id}_audit_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast(`Exported ${report.title} as CSV.`, 'success');
  };

  const handleExportReport = () => {
    handleDownloadReport({ id: 'executive_summary', title: 'Executive Summary Audit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="Principal" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: EXECUTIVE DASHBOARD & OVERVIEW */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              {/* Executive Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Executive Command Center
                    </span>
                    <span className="text-xs font-bold text-slate-500">Institution Level Analytics</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Principal Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Comprehensive visibility into mess efficiency, food wastage reduction, block participation, and food court operations.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs text-xs font-bold">
                    <button
                      onClick={() => setSelectedTimeframe('today')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedTimeframe === 'today' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setSelectedTimeframe('7d')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedTimeframe === '7d' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setSelectedTimeframe('30d')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        selectedTimeframe === '30d' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Month
                    </button>
                  </div>

                  <button
                    onClick={handleExportReport}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Audit
                  </button>
                </div>
              </div>

              {/* Top Executive KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Rate</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-extrabold text-slate-900">{overallSubmissionRate}%</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-emerald-700 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +4.2%
                      </span>
                      <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-semibold mt-1">
                      {totalSubmissions} / {totalEnrolled} Students Submitted
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Wastage</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-extrabold text-emerald-600">6.2 Kg / Day</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        -38% Below Limit
                      </span>
                      <span className="text-xs text-slate-500">(10 Kg Target)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Baseline: 18.2 Kg prior to AI rollup
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Saved Equivalent</span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-extrabold text-indigo-700">142 Meals</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>₹12,400 Institution Savings</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Calculated at avg ₹87/portion cost
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KFC Daily Footfall</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-extrabold text-slate-900">164 Pre-Orders</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ₹18,450 Revenue
                      </span>
                      <span className="text-xs text-slate-500">• 0 queue delays</span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-semibold mt-1">
                      Avg Token Turnaround: 4.2 mins
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Anomalies & Alert Banner if any active */}
              {activeAnomaliesCount > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">
                        AI Mess Intelligence: {activeAnomaliesCount} Operational Anomalies Flagged
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        1 low participation room detected prior to cutoff & 1 surge in evening food court orders.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('AI & Anomalies')}
                    className="self-start sm:self-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Review Anomalies
                  </button>
                </div>
              )}
              {/* Row 1: Wastage Trend + Meal Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Wastage Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Food Wastage Reduction Trajectory</h3>
                      <p className="text-xs text-slate-500">Actual daily kitchen waste (kg) vs 10 kg institutional target threshold</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md self-start">
                      Target: &lt;10 Kg / day
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={principalWastageTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                          formatter={(value, name) => [`${value} Kg`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Line
                          type="monotone"
                          dataKey="actualKg"
                          name="Actual Waste (Kg)"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#ef4444' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="targetKg"
                          name="Target Limit (10 Kg)"
                          stroke="#94a3b8"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="savedKg"
                          name="Waste Prevented (Kg)"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Meal Breakdown Donut Chart */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Tomorrow's Meal Demand</h3>
                    <p className="text-xs text-slate-500 mb-4">Student turnout distribution across 4 shifts</p>

                    <div className="h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mealDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="count"
                          >
                            {mealDistributionData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} students`, 'Turnout']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {mealDistributionData.map((m) => (
                        <div key={m.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }}></span>
                          <div className="overflow-hidden">
                            <span className="text-[11px] font-bold text-slate-700 block truncate">{m.name}</span>
                            <span className="text-xs font-extrabold text-slate-900">{m.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Hostel Block Leaderboard & Performance */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Hostel Blocks Performance Leaderboard</h3>
                    <p className="text-xs text-slate-500">Real-time submission rate ranking across student residences</p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full self-start">
                    Benchmark: 95% Cutoff Target
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                        <th className="pb-3">Hostel Block</th>
                        <th className="pb-3">Block Incharge</th>
                        <th className="pb-3">Students</th>
                        <th className="pb-3">Submitted</th>
                        <th className="pb-3">Pending</th>
                        <th className="pb-3">Submission Rate</th>
                        <th className="pb-3 text-right">Operational Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blockPerformance.map((row) => (
                        <tr key={row.block} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            {row.block}
                          </td>
                          <td className="py-3.5 text-slate-700 font-medium">{row.incharge}</td>
                          <td className="py-3.5 text-slate-600">{row.total}</td>
                          <td className="py-3.5 text-purple-700 font-bold">{row.submitted}</td>
                          <td className="py-3.5 text-slate-500">{row.pending}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 w-12">{row.rate}%</span>
                              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    row.rate >= 95 ? 'bg-emerald-500' : row.rate >= 90 ? 'bg-indigo-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${row.rate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                row.status === 'Optimal'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WASTAGE ANALYTICS */}
          {activeTab === 'Wastage Analytics' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    Efficiency & Sustainability
                  </span>
                  <span className="text-xs font-bold text-slate-500">Kitchen Waste Audit</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Food Wastage Analytics
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Evaluating daily food waste reduction, portions saved, and cost reduction metrics gained via automated rollups.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-lg mb-1">In-Depth Food Wastage Audit</h3>
                <p className="text-xs text-slate-500 mb-6">Evaluating institutional efficiency gained via automated meal intent rollups</p>

                <div className="h-72 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={principalWastageTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(val) => [`${val} Kg`, '']} />
                      <Legend />
                      <Bar dataKey="actualKg" name="Actual Food Waste (Kg)" fill="#f87171" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="savedKg" name="Food Saved (Kg)" fill="#34d399" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-xs font-bold text-purple-700 uppercase">Weekly Food Saved</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">47.4 Kg</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Equivalent to 544 portions conserved</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-700 uppercase">Cost Reduction</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">₹41,200 / Month</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Reduced over-procurement of dairy & raw staples</p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-700 uppercase">AI Forecasting Accuracy</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">94.1%</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Variance within ±3% of kitchen attendance</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOSTEL BLOCKS */}
          {activeTab === 'Hostel Blocks' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    Residential Headcount
                  </span>
                  <span className="text-xs font-bold text-slate-500">Hostel Compliance</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Hostel Blocks Performance
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Block-by-block submission breakdown comparing actual attendance to residence bed capacity.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-lg mb-1">Hostel Block Comparison & Attendance Rollup</h3>
                <p className="text-xs text-slate-500 mb-6">Comparing submissions against total bed capacity</p>

                <div className="h-72 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={blockPerformance} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="block" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total Capacity (Students)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="submitted" name="Submitted Intent" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto pt-4 border-t border-slate-100">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                        <th className="pb-3">Hostel Block</th>
                        <th className="pb-3">Block Incharge</th>
                        <th className="pb-3">Capacity</th>
                        <th className="pb-3">Submitted</th>
                        <th className="pb-3">Pending</th>
                        <th className="pb-3">Submission Rate</th>
                        <th className="pb-3 text-right">Operational Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blockPerformance.map((row) => (
                        <tr key={row.block} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            {row.block}
                          </td>
                          <td className="py-3.5 text-slate-700 font-medium">{row.incharge}</td>
                          <td className="py-3.5 text-slate-600">{row.total}</td>
                          <td className="py-3.5 text-purple-700 font-bold">{row.submitted}</td>
                          <td className="py-3.5 text-slate-500">{row.pending}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 w-12">{row.rate}%</span>
                              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    row.rate >= 95 ? 'bg-emerald-500' : row.rate >= 90 ? 'bg-indigo-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${row.rate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                row.status === 'Optimal'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KFC FOOTFALL */}
          {activeTab === 'KFC Footfall' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    Commercial Food Court
                  </span>
                  <span className="text-xs font-bold text-slate-500">Express Operations</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  KFC Footfall & Demand Analytics
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tracking hourly rush distribution, pre-order traffic, and queue-bypass efficiency across peak intervals.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">KIET Food Court (KFC) Pre-Order Footfall</h3>
                    <p className="text-xs text-slate-500">Hourly order volume showing peak rush bypass between classes</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full self-start">
                    Peak Rush: 4:30 PM (Evening Snacks)
                  </span>
                </div>

                <div className="h-64 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kfcHourlyFootfall} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(val, name) => [name === 'revenue' ? `₹${val}` : val, name]} />
                      <Legend />
                      <Bar dataKey="orders" name="Pre-Orders Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="revenue" name="Revenue (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-xs font-bold text-slate-500 uppercase">Average Queue Saved</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">11.5 Minutes</p>
                    <p className="text-[11px] text-slate-500">Per student via counter token pickup</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-xs font-bold text-slate-500 uppercase">Cash Collection Reliability</span>
                    <p className="text-lg font-extrabold text-emerald-600 mt-1">100%</p>
                    <p className="text-[11px] text-slate-500">Token verified at counter handover</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-xs font-bold text-slate-500 uppercase">Top Selling Item</span>
                    <p className="text-lg font-extrabold text-purple-700 mt-1">Zinger Burger Duo</p>
                    <p className="text-[11px] text-slate-500">48 units ordered today</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI & ANOMALIES */}
          {activeTab === 'AI & Anomalies' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Predictive Intelligence
                  </span>
                  <span className="text-xs font-bold text-slate-500">Operational Anomaly Feed</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  AI Mess Intelligence & Anomalies
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Automated outlier detection flagging low participation rooms, unexpected demand surges, and milestone alerts.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      AI Mess Intelligence & Outlier Escalation Feed
                    </h3>
                    <p className="text-xs text-slate-500">Automated pattern recognition flagging unusual attendance or reporting anomalies</p>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setAnomalyTab('Active')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        anomalyTab === 'Active'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Active Outliers ({activeAnomaliesCount})
                    </button>
                    <button
                      onClick={() => setAnomalyTab('Resolved')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        anomalyTab === 'Resolved'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Resolved History ({resolvedAnomaliesCount})
                    </button>
                  </div>
                </div>

                {/* Filtered Anomalies List */}
                {aiAnomalies.filter((a) => (anomalyTab === 'Active' ? a.status === 'Active' : a.status === 'Resolved')).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-90" />
                    <p className="font-bold text-slate-800 text-sm">
                      {anomalyTab === 'Active'
                        ? 'No Active Operational Anomalies'
                        : 'No Resolved Anomalies In History'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {anomalyTab === 'Active'
                        ? 'All hostel residences and food court services are operating within normal parameters.'
                        : 'Resolved anomaly records will be cataloged here for institutional auditing.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiAnomalies
                      .filter((a) => (anomalyTab === 'Active' ? a.status === 'Active' : a.status === 'Resolved'))
                      .map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            item.status === 'Resolved'
                              ? 'bg-slate-50/70 border-slate-200'
                              : item.severity === 'high'
                              ? 'bg-red-50/40 border-red-200'
                              : item.severity === 'medium'
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-purple-50/40 border-purple-200'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                                item.severity === 'high'
                                  ? 'bg-red-600'
                                  : item.severity === 'medium'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                            >
                              {item.severity.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                    item.severity === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : item.severity === 'medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {item.severity}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                              </div>
                              <p className="text-xs font-semibold text-purple-700 mt-0.5">{item.scope}</p>
                              <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                            </div>
                          </div>

                          {item.status === 'Active' ? (
                            <button
                              onClick={() => resolveAnomaly(item.id)}
                              className="self-start sm:self-auto bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 self-start sm:self-auto">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Resolved
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'Reports' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                    Auditing & Compliance
                  </span>
                  <span className="text-xs font-bold text-slate-500">Institutional Documentation</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Institutional Reports & Audits
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Export validated attendance logs, kitchen food waste audits, and canteen transaction reports for governance and compliance.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-3xl">
                <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  Institutional Mess & KFC Auditing Reports
                </h3>
                <p className="text-xs text-slate-500 mb-6">Generate and download official compliance and operational audits</p>

                <div className="space-y-4">
                  {[
                    { id: 'wastage', title: 'Weekly Food Wastage & Cost Savings Report', size: 'CSV Audit Log', date: 'Sept 14, 2026' },
                    { id: 'attendance', title: 'Hostel Block Attendance & Compliance Audit', size: 'CSV Audit Log', date: 'Sept 13, 2026' },
                    { id: 'kfc', title: 'KFC Food Court Revenue & Reconciliation Log', size: 'CSV Audit Log', date: 'Sept 14, 2026' },
                    { id: 'executive', title: 'Monthly Executive Summary for Board of Trustees', size: 'CSV Audit Log', date: 'August 2026' }
                  ].map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 hover:border-purple-200 transition-all"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Generated: {doc.date} • {doc.size}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadReport(doc)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-purple-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download CSV
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Live operational data exported as RFC-4180 CSV. For official signed PDF reports, endpoint connects to: <code className="text-purple-700 font-mono">/api/reports/:id/pdf</code></span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
