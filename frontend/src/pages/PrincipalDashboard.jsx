import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  Scale,
  Utensils,
  ShoppingBag,
  AlertTriangle,
  ShieldCheck,
  Download,
  RefreshCw,
  RotateCcw,
  Calendar,
  Grid3x3,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  Clock,
  Activity,
  IndianRupee
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const SEVERITY_STYLES = {
  high: 'bg-rose-100 text-rose-700 border-rose-200',
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-[#D5E4F8] text-[#2B4F80] border-[#D5E4F8]'
};

const heatClass = (value) => {
  if (value === null || value === undefined) return 'bg-[#EDF2F9] text-slate-400 border-[#DCE4EF]';
  if (value >= 95) return 'bg-[#2B4F80] text-white border-[#243F66]';
  if (value >= 90) return 'bg-[#355F97] text-white border-[#2F5488]';
  if (value >= 85) return 'bg-[#4573AC] text-white border-[#355F97]';
  if (value >= 75) return 'bg-amber-400 text-[#293749] border-amber-500';
  if (value >= 60) return 'bg-amber-500 text-white border-amber-600';
  return 'bg-rose-500 text-white border-rose-600';
};

const mealForHour = (hour) => {
  if (hour >= 7 && hour <= 10) return 'Breakfast';
  if (hour >= 12 && hour <= 15) return 'Lunch';
  if (hour >= 16 && hour <= 18) return 'Snacks';
  if (hour >= 19 && hour <= 22) return 'Dinner';
  return 'Other';
};

const getOrderHour = (order) => {
  const ts = order.placedAt || (typeof order.timestamp === 'number' ? order.timestamp : null);
  if (ts) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d.getHours();
  }
  const raw = order.orderTime || '';
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const meridiem = (match[3] || '').toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    return hour;
  }
  return null;
};

const csvEscape = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const toCsv = (rows) => rows.map((row) => row.map(csvEscape).join(',')).join('\n');

const MetricCard = ({ label, value, unit, sub, icon: Icon, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-[#EDF2F9] text-slate-700',
    emerald: 'bg-[#EDF2F9] text-[#355F97]',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    indigo: 'bg-indigo-50 text-indigo-700'
  };
  return (
    <div className="p-5 rounded-2xl border border-[#DCE4EF]/90 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#65748A]">{label}</span>
        <span className={`p-2 rounded-xl ${tones[tone] || tones.slate}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-2xl font-black text-[#293749] font-mono">{value}</p>
        {unit && <span className="text-xs font-bold text-slate-400 font-mono">{unit}</span>}
      </div>
      {sub && <p className="text-xs mt-2 font-medium text-[#65748A]">{sub}</p>}
    </div>
  );
};

const SectionCard = ({ title, subtitle, icon: Icon, right, children }) => (
  <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 shadow-xs">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="font-bold text-[#293749] text-sm flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#355F97]" />}
          {title}
        </h3>
        {subtitle && <p className="text-[11px] text-[#65748A] mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="py-10 text-center">
    <Icon className="w-9 h-9 mx-auto text-slate-300 mb-3" />
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    <p className="text-xs text-[#65748A] mt-1">{message}</p>
  </div>
);

export const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    principalAnalytics = {},
    principalRollups,
    principalWastageTrend = [],
    blockPerformance = [],
    aiAnomalies = [],
    attendanceRecords = [],
    floorRooms = [],
    kfcOrders = [],
    refreshPrincipalAnalytics,
    refreshAnomalies,
    refreshAttendanceRecords,
    refreshKfcOrders,
    refreshRooms,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('Analytics Overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '14d',
    block: 'All',
    meal: 'All',
    severity: 'All'
  });

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const rangeDays = filters.dateRange === 'all' ? Infinity : parseInt(filters.dateRange, 10);

  const anchorDate = useMemo(() => {
    const dates = [];
    (principalWastageTrend || []).forEach((w) => w.date && dates.push(w.date));
    (attendanceRecords || []).forEach((a) => a.date && dates.push(a.date));
    if (!dates.length) return null;
    return dates.sort()[dates.length - 1];
  }, [principalWastageTrend, attendanceRecords]);

  const withinRange = (dateStr) => {
    if (!dateStr || rangeDays === Infinity || !anchorDate) return true;
    const anchor = new Date(`${anchorDate}T00:00:00`).getTime();
    const target = new Date(`${dateStr}T00:00:00`).getTime();
    if (isNaN(anchor) || isNaN(target)) return true;
    const diffDays = Math.round((anchor - target) / 86400000);
    return diffDays >= 0 && diffDays <= rangeDays - 1;
  };

  const filteredWastage = useMemo(
    () => (principalWastageTrend || []).filter((w) => withinRange(w.date)),
    [principalWastageTrend, rangeDays, anchorDate]
  );

  const filteredAttendance = useMemo(
    () =>
      (attendanceRecords || []).filter(
        (a) => withinRange(a.date) && (filters.meal === 'All' || a.meal === filters.meal)
      ),
    [attendanceRecords, rangeDays, anchorDate, filters.meal]
  );

  const filteredAnomalies = useMemo(
    () =>
      (aiAnomalies || []).filter((a) => {
        if (filters.severity !== 'All' && (a.severity || '').toLowerCase() !== filters.severity.toLowerCase()) {
          return false;
        }
        if (filters.block !== 'All' && !(a.scope || '').includes(filters.block)) return false;
        return true;
      }),
    [aiAnomalies, filters.severity, filters.block]
  );

  const filteredBlockRates = useMemo(
    () =>
      (blockPerformance || []).filter(
        (b) => filters.block === 'All' || (b.block || '').includes(filters.block)
      ),
    [blockPerformance, filters.block]
  );

  const wastageChartData = useMemo(
    () =>
      filteredWastage.map((w) => ({
        label: w.date ? w.date.slice(5) : w.day,
        day: w.day,
        actualKg: w.actualKg ?? 0,
        targetKg: w.targetKg ?? 0,
        savedKg: w.savedKg ?? 0
      })),
    [filteredWastage]
  );

  const heatmapRows = useMemo(() => {
    const byDate = {};
    filteredAttendance.forEach((a) => {
      if (!byDate[a.date]) byDate[a.date] = { date: a.date, day: a.day || '', values: {} };
      const rate = a.selectedCount > 0 ? Math.round((a.actualCount / a.selectedCount) * 100) : null;
      byDate[a.date].values[a.meal] = rate;
    });
    return Object.values(byDate).sort((x, y) => (x.date < y.date ? -1 : 1));
  }, [filteredAttendance]);

  const kfcFootfall = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 22; h += 1) hours.push(h);
    const buckets = hours.map((h) => ({
      hour: h,
      label: `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`,
      orders: 0,
      revenue: 0
    }));

    const stamped = (kfcOrders || []).map((o) => {
      const ts = o.placedAt || (typeof o.timestamp === 'number' ? o.timestamp : null);
      return { order: o, ts };
    });
    const allTs = stamped.map((s) => s.ts).filter(Boolean);
    const maxTs = allTs.length ? Math.max(...allTs) : null;
    const cutoff = rangeDays !== Infinity && maxTs ? maxTs - rangeDays * 86400000 : null;

    stamped.forEach(({ order, ts }) => {
      if (cutoff && ts && ts < cutoff) return;
      const room = order.room || '';
      if (filters.block !== 'All' && !room.includes(filters.block.replace('Block ', ''))) return;
      const hour = getOrderHour(order);
      if (hour === null) return;
      if (filters.meal !== 'All' && mealForHour(hour) !== filters.meal) return;
      const bucket = buckets.find((b) => b.hour === hour);
      if (!bucket) return;
      bucket.orders += 1;
      bucket.revenue += order.totalAmount || 0;
    });

    return buckets;
  }, [kfcOrders, rangeDays, filters.block, filters.meal]);

  const roomGrid = useMemo(() => {
    const rooms = (floorRooms || []).filter(
      (r) => filters.block === 'All' || (r.roomNo || '').includes(filters.block.replace('Block ', ''))
    );
    const build = (prefix) => rooms.filter((r) => (r.roomNo || '').includes(prefix));
    return [
      { block: 'Block D', rooms: build('D-') },
      { block: 'Block E', rooms: build('E-') }
    ];
  }, [floorRooms, filters.block]);

  const avgWastageKg = filteredWastage.length
    ? filteredWastage.reduce((sum, w) => sum + (w.actualKg || 0), 0) / filteredWastage.length
    : null;
  const avgWastageDisplay =
    avgWastageKg !== null ? `${avgWastageKg.toFixed(1)} kg/day` : principalAnalytics.avgWastage || '0.0 kg/day';
  const totalSavedKg = filteredWastage.reduce((sum, w) => sum + (w.savedKg || 0), 0);
  const peakWastage = filteredWastage.reduce((max, w) => Math.max(max, w.actualKg || 0), 0);

  const campusTurnout = filteredAttendance.length
    ? Math.round(
        filteredAttendance.reduce(
          (sum, a) => sum + (a.selectedCount > 0 ? (a.actualCount / a.selectedCount) * 100 : 0),
          0
        ) / filteredAttendance.length
      )
    : null;

  const kfcRevenueTotal = (kfcOrders || []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const kfcOrdersDisplay = kfcOrders.length || principalAnalytics.kfcOrders14d || 0;
  const kfcRevenueDisplay = kfcRevenueTotal || principalAnalytics.kfcRevenue || 0;

  const peakFootfallHour = kfcFootfall.reduce(
    (best, b) => (b.orders > (best?.orders ?? 0) ? b : best),
    null
  );

  const submissionRate = principalRollups?.rate ?? 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshPrincipalAnalytics?.(),
        refreshAnomalies?.(),
        refreshAttendanceRecords?.(),
        refreshKfcOrders?.(true),
        refreshRooms?.()
      ]);
      addToast('Executive analytics refreshed from live campus feeds.', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  const resetFilters = () =>
    setFilters({ dateRange: '14d', block: 'All', meal: 'All', severity: 'All' });

  const downloadSummaryReport = () => {
    const rows = [];
    rows.push(['Principal Analytics Summary Report']);
    rows.push(['Generated', new Date().toLocaleString()]);
    rows.push(['Date Range', filters.dateRange === 'all' ? 'All available data' : `Last ${filters.dateRange}`]);
    rows.push(['Block Filter', filters.block]);
    rows.push(['Meal Filter', filters.meal]);
    rows.push([]);
    rows.push(['Executive Metrics']);
    rows.push(['Metric', 'Value']);
    rows.push(['Campus Meal Submission Rate', `${submissionRate}%`]);
    rows.push(['Average Daily Wastage', avgWastageDisplay]);
    rows.push(['Total Wastage Saved', `${totalSavedKg.toFixed(1)} kg`]);
    rows.push(['Campus Meal Turnout', campusTurnout !== null ? `${campusTurnout}%` : 'N/A']);
    rows.push(['Food Court Revenue', `INR ${kfcRevenueDisplay}`]);
    rows.push(['KFC Orders', kfcOrdersDisplay]);
    rows.push(['Active Anomalies', filteredAnomalies.length]);
    rows.push([]);
    rows.push(['Wastage Trend']);
    rows.push(['Date', 'Day', 'Actual (kg)', 'Target (kg)', 'Saved (kg)']);
    filteredWastage.forEach((w) => rows.push([w.date, w.day, w.actualKg, w.targetKg, w.savedKg]));
    rows.push([]);
    rows.push(['Submission & Turnout Heatmap (%)']);
    rows.push(['Date', ...MEALS]);
    heatmapRows.forEach((r) => rows.push([r.date, ...MEALS.map((m) => (r.values[m] ?? ''))]));
    rows.push([]);
    rows.push(['Block Submission Rates']);
    rows.push(['Block', 'Submitted', 'Total', 'Rate %', 'Incharge']);
    filteredBlockRates.forEach((b) => rows.push([b.block, b.submitted, b.total, b.rate, b.incharge]));
    rows.push([]);
    rows.push(['Anomalies & Escalations']);
    rows.push(['Severity', 'Scope', 'Title', 'Description']);
    filteredAnomalies.forEach((a) =>
      rows.push([a.severity, a.scope, a.title, a.description || a.desc])
    );

    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `principal-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Executive summary report downloaded as CSV.', 'success');
  };

  const sidebarItems = [
    { isHeader: true, header: 'Executive Analytics' },
    { name: 'Analytics Overview', icon: LayoutDashboard },
    { name: 'Wastage Trends', icon: Scale },
    { name: 'Submission Heatmap', icon: Grid3x3 },
    { name: 'KFC Footfall', icon: ShoppingBag },
    { isHeader: true, header: 'Risk & Compliance' },
    { name: 'Anomaly & Escalation Log', icon: AlertTriangle, badge: (aiAnomalies || []).length }
  ];

  const isOverview = activeTab === 'Analytics Overview';
  const isWastage = activeTab === 'Wastage Trends';
  const isHeatmap = activeTab === 'Submission Heatmap';
  const isFootfall = activeTab === 'KFC Footfall';
  const isAnomalyLog = activeTab === 'Anomaly & Escalation Log';

  const filterPill = (active) =>
    `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
      active ? 'bg-[#355F97] text-white shadow-xs' : 'bg-[#EDF2F9] hover:bg-slate-200/80 text-slate-600'
    }`;

  const heatLegend = [
    { label: '<60%', className: 'bg-rose-500' },
    { label: '60-74%', className: 'bg-amber-500' },
    { label: '75-84%', className: 'bg-amber-400' },
    { label: '85-89%', className: 'bg-[#4573AC]' },
    { label: '90-94%', className: 'bg-[#355F97]' },
    { label: '95%+', className: 'bg-[#2B4F80]' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]/80 text-[#293749] flex flex-col font-sans">
      <Navbar currentRole="Principal" activeTab={activeTab} onTabChange={setActiveTab} tabs={sidebarItems} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleSignOut} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl border border-[#DCE4EF]/90 shadow-sm relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 bg-[#EDF2F9] text-[#355F97] border-[#D5E4F8]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#355F97]" />
                    Read-Only Executive Analytics
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full border bg-[#EDF2F9] text-slate-600 border-[#DCE4EF]">
                    KIET Group of Institutions
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#293749]">
                  Principal Analytics Console
                </h1>
                <p className="text-xs sm:text-sm text-[#65748A] max-w-2xl font-medium">
                  Institutional trends across mess wastage, hostel meal submission and turnout, and food court
                  footfall. Purely observational — no operational controls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white hover:bg-[#F5F7FA] border border-[#DCE4EF] text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 text-[#355F97] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Analytics</span>
                </button>
                <button
                  onClick={downloadSummaryReport}
                  className="bg-[#355F97] hover:bg-[#2B4F80] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-[#A9C3E4]" />
                  <span>Download Summary Report</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#65748A] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#355F97]" />
                Drill-Down Filters
              </h3>
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-[#65748A] hover:text-[#355F97] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
                Range
              </span>
              {[
                { key: '7d', label: 'Last 7 Days' },
                { key: '14d', label: 'Last 14 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: 'all', label: 'All Data' }
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setFilters((f) => ({ ...f, dateRange: r.key }))}
                  className={filterPill(filters.dateRange === r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Block
                </span>
                <select
                  value={filters.block}
                  onChange={(e) => setFilters((f) => ({ ...f, block: e.target.value }))}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DCE4EF] bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#355F97]"
                >
                  <option value="All">All Blocks</option>
                  <option value="Block D">Block D</option>
                  <option value="Block E">Block E</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Meal
                </span>
                <select
                  value={filters.meal}
                  onChange={(e) => setFilters((f) => ({ ...f, meal: e.target.value }))}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DCE4EF] bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#355F97]"
                >
                  <option value="All">All Meals</option>
                  {MEALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Severity
                </span>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DCE4EF] bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#355F97]"
                >
                  <option value="All">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Meal Submission Rate"
              value={submissionRate}
              unit="%"
              sub={`${principalRollups?.submitted ?? 0} of ${principalRollups?.total ?? 0} residents submitted`}
              icon={CheckCircle2}
              tone="emerald"
            />
            <MetricCard
              label="Avg Daily Wastage"
              value={avgWastageDisplay}
              sub={`Peak ${peakWastage.toFixed(1)} kg • ${totalSavedKg.toFixed(1)} kg saved`}
              icon={Utensils}
              tone="rose"
            />
            <MetricCard
              label="Food Court Revenue"
              value={`₹${kfcRevenueDisplay}`}
              sub={`${kfcOrdersDisplay} orders • peak ${peakFootfallHour?.orders || 0} at ${peakFootfallHour?.label || '—'}`}
              icon={IndianRupee}
              tone="indigo"
            />
            <MetricCard
              label="Active Anomalies"
              value={filteredAnomalies.length}
              sub={`${(aiAnomalies || []).length} total escalations logged`}
              icon={AlertTriangle}
              tone="amber"
            />
          </div>

          {(isOverview || isWastage) && (
            <SectionCard
              title="Wastage Trend (Actual vs Target)"
              subtitle="Daily unconsumed plate wastage against the institutional target"
              icon={Scale}
              right={
                <span className="text-xs font-mono font-bold text-[#2B4F80] bg-[#EDF2F9] px-2.5 py-0.5 rounded-md border border-[#D5E4F8]/70">
                  Avg {avgWastageDisplay}
                </span>
              }
            >
              {wastageChartData.length === 0 ? (
                <EmptyState
                  icon={Scale}
                  title="No wastage records in range"
                  message="Adjust the drill-down date range to view more data."
                />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={wastageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="kg" width={45} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      />
                      <Legend verticalAlign="bottom" height={28} iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                      <ReferenceLine y={10} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#94a3b8' }} />
                      <Line type="monotone" dataKey="actualKg" name="Actual Wastage (kg)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2.5, fill: '#ef4444' }} />
                      <Line type="monotone" dataKey="targetKg" name="Target (kg)" stroke="#355F97" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="savedKg" name="Saved (kg)" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 2, fill: '#6366f1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {isWastage && wastageChartData.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#DCE4EF] text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Day</th>
                        <th className="pb-2">Actual (kg)</th>
                        <th className="pb-2">Target (kg)</th>
                        <th className="pb-2">Saved (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wastageChartData.map((w, idx) => (
                        <tr key={idx} className="hover:bg-[#F5F7FA]/60">
                          <td className="py-2.5 font-mono text-slate-600">{w.label}</td>
                          <td className="py-2.5 text-slate-600">{w.day}</td>
                          <td className="py-2.5 font-bold text-[#293749] font-mono">{w.actualKg}</td>
                          <td className="py-2.5 text-[#65748A] font-mono">{w.targetKg}</td>
                          <td className={`py-2.5 font-mono font-bold ${w.savedKg >= 10 ? 'text-[#2F5488]' : 'text-slate-600'}`}>
                            {w.savedKg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}

          {isOverview && (
            <SectionCard
              title="Hostel Block Meal Submission Rates"
              subtitle="Current cutoff window submission compliance by block"
              icon={Building2}
            >
              {filteredBlockRates.length === 0 ? (
                <EmptyState icon={Building2} title="No block data" message="No blocks match the current filter." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBlockRates.map((block) => (
                    <div key={block.block} className="p-4 rounded-xl border border-[#DCE4EF]/80 bg-[#F5F7FA]/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 text-xs sm:text-sm">{block.block}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">
                          {block.submitted}/{block.total}
                        </span>
                      </div>
                      <p className="text-xl font-black text-[#2F5488] mt-2">{block.rate}%</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div className="bg-[#355F97] h-full rounded-full" style={{ width: `${block.rate}%` }} />
                      </div>
                      {block.incharge && (
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">Incharge: {block.incharge}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {(isOverview || isHeatmap) && (
            <SectionCard
              title="Meal Submission & Turnout Heatmap"
              subtitle="Turnout against opt-in submissions, by day and meal"
              icon={Grid3x3}
              right={
                <span className="text-xs font-mono font-bold text-[#355F97] bg-[#EDF2F9] px-2.5 py-0.5 rounded-md border border-[#D5E4F8]/70">
                  Campus turnout {campusTurnout !== null ? `${campusTurnout}%` : '—'}
                </span>
              }
            >
              {heatmapRows.length === 0 ? (
                <EmptyState
                  icon={Grid3x3}
                  title="No attendance records in range"
                  message="Widen the date range or clear the meal filter."
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-1 text-xs">
                      <thead>
                        <tr>
                          <th className="text-left text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2">
                            Date
                          </th>
                          {MEALS.map((m) => (
                            <th
                              key={m}
                              className="text-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2"
                            >
                              {m}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapRows.map((row) => (
                          <tr key={row.date}>
                            <td className="px-2 py-1.5 font-mono text-slate-600 whitespace-nowrap">
                              <span className="font-bold text-slate-800">{row.date.slice(5)}</span>
                              <span className="text-slate-400 ml-2">{row.day}</span>
                            </td>
                            {MEALS.map((m) => {
                              const value = row.values[m];
                              return (
                                <td key={m} className="p-0">
                                  <div
                                    className={`h-9 rounded-lg border flex items-center justify-center font-mono font-bold text-[11px] ${heatClass(value)}`}
                                    title={`${row.date} • ${m}: ${value === null || value === undefined ? 'no data' : `${value}%`}`}
                                  >
                                    {value === null || value === undefined ? '—' : `${value}%`}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Turnout intensity
                    </span>
                    {heatLegend.map((l) => (
                      <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-[#65748A] font-medium">
                        <span className={`w-3.5 h-3.5 rounded ${l.className}`} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {isHeatmap && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#65748A] mb-3">
                    Room-Wise Submission Compliance
                  </h4>
                  <div className="space-y-3">
                    {roomGrid.map((group) => (
                      <div key={group.block}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-600">{group.block}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {group.rooms.length} rooms
                          </span>
                        </div>
                        {group.rooms.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No rooms in this block.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {group.rooms.map((room) => {
                              const rate =
                                room.rate ??
                                (room.totalMembers
                                  ? Math.round(((room.submittedMembers || 0) / room.totalMembers) * 100)
                                  : 0);
                              return (
                                <div
                                  key={room.roomNo}
                                  className={`px-3 py-2 rounded-lg border text-[11px] font-bold ${heatClass(rate)} min-w-[104px]`}
                                  title={`${room.roomNo} • ${room.leadName || 'Room Lead'} • ${rate}%`}
                                >
                                  <div className="font-mono">{room.roomNo.replace('Room ', '')}</div>
                                  <div className="text-[10px] font-mono opacity-90">{rate}% submitted</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {(isOverview || isFootfall) && (
            <SectionCard
              title="KFC Food Court Footfall"
              subtitle="Hourly order volume and revenue at the express counter"
              icon={ShoppingBag}
              right={
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/70">
                  ₹{kfcRevenueDisplay} • {kfcOrdersDisplay} orders
                </span>
              }
            >
              {kfcOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="No live order data"
                  message="Footfall analytics populate as students place KFC orders."
                />
              ) : (
                <>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={kfcFootfall} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} width={30} />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          width={40}
                          tickFormatter={(v) => `₹${v}`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                        />
                        <Legend verticalAlign="bottom" height={28} iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                        <Bar yAxisId="left" dataKey="orders" name="Orders" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {kfcFootfall.map((b) => (
                            <Cell key={b.hour} fill={peakFootfallHour && b.hour === peakFootfallHour.hour ? '#355F97' : '#e4002b'} />
                          ))}
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#355F97" strokeWidth={2} dot={{ r: 2, fill: '#355F97' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {isFootfall && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#DCE4EF]/70">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                        <p className="text-lg font-black text-[#293749] font-mono mt-0.5">{kfcOrders.length}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#DCE4EF]/70">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                        <p className="text-lg font-black text-[#293749] font-mono mt-0.5">₹{kfcRevenueDisplay}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#DCE4EF]/70">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Peak Hour</span>
                        <p className="text-lg font-black text-[#293749] font-mono mt-0.5">{peakFootfallHour?.label || '—'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#DCE4EF]/70">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Avg Order</span>
                        <p className="text-lg font-black text-[#293749] font-mono mt-0.5">
                          ₹{kfcOrders.length ? Math.round(kfcRevenueTotal / kfcOrders.length) : 0}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </SectionCard>
          )}

          {(isOverview || isAnomalyLog) && (
            <SectionCard
              title="Anomaly & Escalation Log"
              subtitle="Automated risk flags from submission variance and kitchen consumption"
              icon={AlertTriangle}
              right={
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  {filteredAnomalies.length} Notice{filteredAnomalies.length !== 1 ? 's' : ''}
                </span>
              }
            >
              {filteredAnomalies.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No anomalies in current view"
                  message="No escalations match the selected severity or block filter."
                />
              ) : (
                <div className="space-y-3">
                  {filteredAnomalies.map((anomaly, idx) => {
                    const severity = (anomaly.severity || 'low').toLowerCase();
                    const severityClass = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;
                    return (
                      <div
                        key={anomaly.id || idx}
                        className="p-3.5 rounded-xl border border-slate-100 bg-[#F5F7FA]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg mt-0.5 border ${severityClass}`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[#293749]">{anomaly.title}</h4>
                              {anomaly.scope && (
                                <span className="text-[10px] font-mono font-semibold text-[#65748A] bg-white border border-[#DCE4EF] px-1.5 py-0.5 rounded">
                                  {anomaly.scope}
                                </span>
                              )}
                              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${severityClass}`}>
                                {anomaly.severity || 'low'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 max-w-xl">
                              {anomaly.description || anomaly.desc}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {anomaly.time || 'Logged'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>
              Read-only analytics view • {currentUser?.name || 'Principal'} • Auto-synced every few seconds
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
