import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
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
  Utensils,
  Clock,
  Star,
  Receipt,
  ShieldCheck,
  GraduationCap,
  BedDouble,
  Building2,
  Boxes,
  ChefHat,
  ShoppingBag,
  KeyRound,
  Search,
  Filter,
  ExternalLink,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  CheckCircle2,
  Sparkles,
  Lock,
  Mail,
  SlidersHorizontal,
  ChevronRight,
  Info
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
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    principalAnalytics,
    principalRollups,
    togglePrincipalRollupFlag,
    remindPendingStudentPrincipal,
    remindAllPendingPrincipal,
    principalMess,
    principalNotifications,
    markAllPrincipalNotificationsRead,
    aiAnomalies = [],
    addToast,
    nudgeRoomLead,
    nudgeFloorIncharge,
    floorRooms = [],
    users = [],
    loginAsUser,
    toggleUserStatus
  } = useApp();

  // Active Sidebar Tab: Defaults to 'Campus Analytics'
  const [activeTab, setActiveTab] = useState('Campus Analytics');

  // Directory filter state (for Accounts screens)
  const [accountSearch, setAccountSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Grouped user counts segregated by role
  const studentUsers = useMemo(() => users.filter((u) => u.role === 'Student'), [users]);
  const roomLeadUsers = useMemo(() => users.filter((u) => u.role === 'Room Lead'), [users]);
  const floorInchargeUsers = useMemo(() => users.filter((u) => u.role === 'Floor Incharge'), [users]);
  const blockCoordUsers = useMemo(() => users.filter((u) => u.role === 'Block Coordinator'), [users]);
  const messUsers = useMemo(() => users.filter((u) => u.role === 'Mess Incharge'), [users]);
  const kfcUsers = useMemo(() => users.filter((u) => u.role === 'KFC Staff'), [users]);
  const adminUsers = useMemo(() => users.filter((u) => u.role === 'Admin'), [users]);

  // Sidebar navigation items matching Floor Incharge layout structure + Role Segregated Accounts
  const sidebarItems = [
    { isHeader: true, header: 'Executive Oversight' },
    { name: 'Campus Analytics', icon: TrendingUp },
    { name: 'Meal Rollups', icon: Users, badge: principalRollups?.pending ?? 0 },
    { name: 'Mess Cook Plan', icon: CookingPot },
    { name: 'Alerts & Notices', icon: Bell, badge: (principalNotifications?.length || 0) + (aiAnomalies?.length || 0) },

    { isHeader: true, header: 'Campus Accounts by Role' },
    { name: 'All Campus Accounts', icon: ShieldCheck, badge: users.length },
    { name: 'Students', icon: GraduationCap, badge: studentUsers.length },
    { name: 'Room Leads', icon: BedDouble, badge: roomLeadUsers.length },
    { name: 'Floor Incharges', icon: Building2, badge: floorInchargeUsers.length },
    { name: 'Block Coordinators', icon: Boxes, badge: blockCoordUsers.length },
    { name: 'Mess Kitchen Team', icon: ChefHat, badge: messUsers.length },
    { name: 'KFC Canteen Staff', icon: ShoppingBag, badge: kfcUsers.length },
    { name: 'Campus Admins', icon: KeyRound, badge: adminUsers.length }
  ];

  // Resolve which role filter to apply when user clicks sidebar item
  const activeRoleView = useMemo(() => {
    switch (activeTab) {
      case 'Students':
        return 'Student';
      case 'Room Leads':
        return 'Room Lead';
      case 'Floor Incharges':
        return 'Floor Incharge';
      case 'Block Coordinators':
        return 'Block Coordinator';
      case 'Mess Kitchen Team':
        return 'Mess Incharge';
      case 'KFC Canteen Staff':
        return 'KFC Staff';
      case 'Campus Admins':
        return 'Admin';
      default:
        return roleFilter;
    }
  }, [activeTab, roleFilter]);

  // Filtered accounts list for the account directory views
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (activeRoleView !== 'All' && u.role !== activeRoleView) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && u.status !== statusFilter) {
        return false;
      }
      // Search term
      if (accountSearch.trim()) {
        const query = accountSearch.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(query);
        const matchesEmail = (u.email || '').toLowerCase().includes(query);
        const matchesRoll = (u.rollNo || '').toLowerCase().includes(query);
        const matchesBadge = (u.badge || '').toLowerCase().includes(query);
        const matchesRole = (u.role || '').toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesRoll || matchesBadge || matchesRole;
      }
      return true;
    });
  }, [users, activeRoleView, statusFilter, accountSearch]);

  // Launch portal as specific user
  const handleLaunchPortal = (targetUser) => {
    loginAsUser(targetUser);
    navigate(targetUser.path || '/student');
  };

  // Dispatch directive to user
  const handleNudgeUser = (targetUser) => {
    if (targetUser.role === 'Room Lead') {
      const roomMatch = targetUser.badge?.match(/Room [DE]-\d+/)?.[0] || 'Room D-101';
      nudgeRoomLead(
        roomMatch,
        `Executive notice from Principal: Ensure all roommates submit meal plans before 10:00 PM cutoff.`,
        'Dr. S. K. Sharma (Principal Office)'
      );
    } else if (targetUser.role === 'Floor Incharge') {
      const floorMatch = targetUser.name?.includes('Floor 2') ? 'Floor 2 (Block D)' : 'Floor 1 (Block D)';
      nudgeFloorIncharge(floorMatch, 2);
    } else {
      addToast(`Executive notice dispatched to ${targetUser.name}!`, 'success');
    }
  };

  const isAccountsTab = [
    'All Campus Accounts',
    'Students',
    'Room Leads',
    'Floor Incharges',
    'Block Coordinators',
    'Mess Kitchen Team',
    'KFC Canteen Staff',
    'Campus Admins'
  ].includes(activeTab);

  const isRollupsTab = ['Meal Rollups', 'Rollups', 'Block Attendance', 'Campus Rollup'].includes(activeTab);
  const isMessPlanTab = ['Mess Cook Plan', 'Kitchen Requisitions', 'Mess Ops'].includes(activeTab);
  const isAlertsTab = ['Alerts & Notices', 'Executive Alerts', 'Alerts'].includes(activeTab);
  const isAnalyticsTab = ['Campus Analytics', 'Analytics'].includes(activeTab) || (!isAccountsTab && !isRollupsTab && !isMessPlanTab && !isAlertsTab);

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans">
      {/* 1. Universal Top Navigation Bar */}
      <Navbar
        currentRole="Principal"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={sidebarItems}
      />

      {/* Main Body Layout: Collapsible Sidebar on Left + Content on Right */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 2. Left-Hand Navigation Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleSignOut}
        />

        {/* 3. Main Dashboard Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Executive Hero Banner - Matching Floor Incharge UI & Layout */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 bg-emerald-50 text-[#1b4d3e] border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1b4d3e]" />
                    Principal Office • Institutional Command
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
                    KIET Group of Institutions
                  </span>
                  <span className="text-xs flex items-center gap-1 font-medium text-slate-500">
                    <Utensils className="w-3.5 h-3.5 text-slate-700" /> Tomorrow's Institutional Dining Feeds
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Principal Executive Console
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
                  {isAccountsTab
                    ? 'Role-segregated directory of all accounts in Smart Mess KIET with direct portal access and executive directives.'
                    : isAnalyticsTab
                    ? '14-day institutional trends across mess wastage, block submissions, and food court operations.'
                    : isRollupsTab
                    ? 'Live campus-wide meal submission progress, room compliance rates, and executive lead directives.'
                    : isMessPlanTab
                    ? "Kitchen production plan, block headcounts, AI safety buffer reserves, and chef cook quantities."
                    : 'Disciplinary notices, cutoff compliance alerts, and automated AI anomaly warnings.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => addToast('Executive analytics synchronized with all campus blocks and kitchen!', 'success')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-[#1b4d3e]" />
                  <span>Sync Campus Feeds</span>
                </button>
                <button
                  onClick={() => addToast('Comprehensive Institutional Report exported as PDF / Print Ready!', 'info')}
                  className="bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>Export Executive Dossier</span>
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SCREEN 1: CAMPUS ANALYTICS                                           */}
          {/* ==================================================================== */}
          {isAnalyticsTab && (
            <div className="space-y-6">
              {/* 4 PRIMARY METRIC CARDS - Structurally Identical to Floor Incharge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Assigned Supervision Scope */}
                <div className="p-5 rounded-2xl border transition-all duration-200 shadow-sm bg-white border-slate-200/90">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Institutional Scope
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      <Building2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900">Campus HQ</p>
                    <span className="text-xs font-semibold text-slate-500">• 2 Blocks</span>
                  </div>
                  <p className="text-xs mt-2 font-medium text-slate-500">
                    <strong className="text-slate-700">8 Rooms</strong> under supervision (40 residents)
                  </p>
                </div>

                {/* Card 2: Meal Submissions Progress */}
                <div className="p-5 rounded-2xl border transition-all duration-200 shadow-sm bg-white border-slate-200/90">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Meal Submissions
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900">
                      {principalRollups?.submitted ?? 0}{' '}
                      <span className="text-sm font-normal text-slate-400">/ {principalRollups?.total ?? 40}</span>
                    </p>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        (principalRollups?.pending ?? 0) === 0
                          ? 'bg-slate-900 text-white border border-slate-800'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {(principalRollups?.pending ?? 0) === 0 ? 'All Submitted' : `${principalRollups?.pending ?? 0} Pending`}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (principalRollups?.pending ?? 0) === 0 ? 'bg-slate-900' : 'bg-[#1b4d3e]'
                        }`}
                        style={{ width: `${principalRollups?.rate ?? 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Average Plate Waste Index */}
                <div className="p-5 rounded-2xl border transition-all duration-200 shadow-sm bg-white border-slate-200/90">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Avg Plate Waste
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-[#1b4d3e]">
                      <Utensils className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900">{principalAnalytics.avgWastage}</p>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      -32% Under Target
                    </span>
                  </div>
                  <p className="text-xs mt-2 font-medium text-slate-500">
                    Consolidated mess rating: <strong className="text-slate-800">{principalAnalytics.messRating} ★</strong>
                  </p>
                </div>

                {/* Card 4: Food Court Revenue */}
                <div className="p-5 rounded-2xl border transition-all duration-200 shadow-sm bg-white border-slate-200/90">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Food Court Revenue
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-rose-700">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 font-mono">
                      ₹{principalAnalytics.kfcRevenue || 18410}
                    </p>
                    <span className="text-xs font-semibold text-slate-500">
                      • {principalAnalytics.kfcOrders14d || 148} Orders
                    </span>
                  </div>
                  <p className="text-xs mt-2 font-medium text-slate-500">
                    Express Counter 01 active & settled
                  </p>
                </div>
              </div>

              {/* Predicted vs Actual (14d) Line Chart */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Predicted vs Actual Dining Attendance (14-Day Timeline)
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70">
                    94.6% Model Fit
                  </span>
                </div>

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
                  Hostel Block Meal Submission Rates (Today's Cutoff)
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

                      <p className="text-xl font-black text-emerald-700 mt-2">
                        {block.rate}%
                      </p>

                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className="bg-[#1b4d3e] h-full rounded-full"
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
                  KFC Food Court Hourly Peak Footfall
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

              {/* Escalation & AI Turnout Anomalies Log */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      AI Dining Anomaly & Risk Escalations
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Real-time automated flags from Floor Incharges and kitchen consumption variance
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                    {aiAnomalies.length} Active Notice{aiAnomalies.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {aiAnomalies.map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          anomaly.severity === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : anomaly.severity === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {anomaly.title}
                            </h4>
                            <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                              {anomaly.scope}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 max-w-xl">
                            {anomaly.desc || anomaly.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {anomaly.time}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToast(`Escalation acknowledged for ${anomaly.scope}`, 'success')}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer shadow-2xs"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SCREEN 2: MEAL ROLLUPS                                               */}
          {/* ==================================================================== */}
          {isRollupsTab && (
            <div className="space-y-6">
              {/* Header & Escalation Flag */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">
                    CAMPUS ROLLUP
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    Meal Submissions • {principalRollups?.date || 'Today'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Live progress across campus hostels • Cutoff {principalRollups?.cutoff || '22:00'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50/90 border border-amber-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Below 60% — consider escalating</span>
                  <button
                    onClick={togglePrincipalRollupFlag}
                    className={`ml-2 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      principalRollups?.flagged
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
                <div className="flex-1 max-w-md">
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {principalRollups?.rate ?? 0}%
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {principalRollups?.submitted ?? 0}/{principalRollups?.total ?? 40} submitted • {principalRollups?.pending ?? 0} pending
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-[#1b4d3e] h-full rounded-full transition-all"
                      style={{ width: `${principalRollups?.rate ?? 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* 4 meal counters */}
                <div className="flex items-center gap-6 sm:gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                  <div>
                    <span className="text-xl font-bold text-slate-900 block text-center">
                      {principalRollups?.mealCounts?.breakfast ?? 0}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                      BREAKFAST
                    </span>
                  </div>

                  <div>
                    <span className="text-xl font-bold text-slate-900 block text-center">
                      {principalRollups?.mealCounts?.lunch ?? 0}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                      LUNCH
                    </span>
                  </div>

                  <div>
                    <span className="text-xl font-bold text-slate-900 block text-center">
                      {principalRollups?.mealCounts?.snacks ?? 0}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block text-center mt-0.5">
                      SNACKS
                    </span>
                  </div>

                  <div>
                    <span className="text-xl font-bold text-slate-900 block text-center">
                      {principalRollups?.mealCounts?.dinner ?? 0}
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
                    Pending Resident Students ({(principalRollups?.pendingStudents || []).length})
                  </h3>

                  <button
                    onClick={remindAllPendingPrincipal}
                    className="bg-[#1b4d3e] hover:bg-[#163f33] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Remind All</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                  {(principalRollups?.pendingStudents || []).map((st, idx) => {
                    const stName = st?.name || `Student ${idx + 1}`;
                    const initial = st?.initial || stName.charAt(0).toUpperCase();
                    const stEmail = st?.email || `${stName.toLowerCase().replace(/[^a-z]/g, '')}@kiet.edu`;
                    const stRoom = st?.room || 'Hostel';

                    return (
                      <div
                        key={st?.id || idx}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {stName}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {stEmail} • {stRoom}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => remindPendingStudentPrincipal(stName)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-slate-500" />
                          <span>Remind</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hostel Room-Wise Compliance & Direct Room Lead Directives */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        Hostel Room-Wise Compliance & Directives
                      </h3>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                        Live Sync
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct communication with Room Leads across Block D & Block E hostels.
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {(floorRooms || []).length} Registered Rooms ({((floorRooms || []).length || 8) * 5} Students)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3">Room</th>
                        <th className="pb-3">Room Lead</th>
                        <th className="pb-3">Block / Floor</th>
                        <th className="pb-3">Submissions</th>
                        <th className="pb-3">Compliance</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-right">Principal Executive Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(floorRooms || []).map((room, idx) => {
                        const roomNo = room?.roomNo || `Room D-10${idx + 1}`;
                        const leadName = room?.lead || 'Room Lead';
                        const isBlockD = roomNo.includes('D-');
                        const floorNum = roomNo.includes('10') ? 'Floor 1' : 'Floor 2';
                        const pendingCount = room?.pending !== undefined ? room.pending : Math.max(0, (room?.members || 5) - (room?.submitted || 0));
                        const isComplete = pendingCount === 0;
                        const leadFirstName = leadName.split(' ')[0] || 'Lead';
                        const complianceRate = room?.rate !== undefined ? room.rate : (room?.members ? Math.round(((room.submitted || 0) / room.members) * 100) : 0);

                        return (
                          <tr key={roomNo} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isBlockD ? 'bg-[#1b4d3e]' : 'bg-blue-600'
                                }`}
                              ></span>
                              <span className="font-mono">{roomNo}</span>
                            </td>
                            <td className="py-3.5 text-slate-800 font-medium">
                              {leadName}
                            </td>
                            <td className="py-3.5 text-slate-500 text-xs font-mono">
                              {isBlockD ? 'Block D' : 'Block E'} • {floorNum}
                            </td>
                            <td className="py-3.5 text-slate-700 font-semibold font-mono text-xs">
                              {room?.submitted ?? 0} / {room?.members ?? 5}
                            </td>
                            <td className="py-3.5 min-w-[130px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 min-w-8 text-xs">{complianceRate}%</span>
                                <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      complianceRate === 100
                                        ? 'bg-[#1b4d3e]'
                                        : complianceRate >= 75
                                        ? 'bg-emerald-600'
                                        : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${complianceRate}%` }}
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
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                )}
                                {isComplete ? 'Complete' : `${pendingCount} Pending`}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              {!isComplete ? (
                                <button
                                  onClick={() =>
                                    nudgeRoomLead(
                                      roomNo,
                                      `Executive Notice from Principal: ${pendingCount} pending meal submission(s) in ${roomNo}. Ensure 100% compliance before 10:00 PM cutoff.`,
                                      'Dr. S. K. Sharma (Principal Office)'
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b4d3e] hover:bg-[#163f33] text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95 ml-auto"
                                  title={`Dispatch executive directive to ${leadName}`}
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Directive to {leadFirstName}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    nudgeRoomLead(
                                      roomNo,
                                      'Principal Office commends 100% room meal compliance ahead of cutoff.',
                                      'Dr. S. K. Sharma (Principal Office)'
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold text-xs ml-auto border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 px-2.5 py-1 rounded-md transition-colors"
                                  title="Commend Room Lead"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>100% Verified ✓</span>
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
            </div>
          )}

          {/* ==================================================================== */}
          {/* ==================================================================== */}
          {/* SCREEN 3: MESS COOK PLAN                                             */}
          {/* ==================================================================== */}
          {isMessPlanTab && (
            <div className="space-y-6">
              {/* Buffer Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => (
                  <div
                    key={mealKey}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {mealKey.toUpperCase()} SAFETY BUFFER
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-[#1b4d3e] mt-1 font-mono">
                      {principalMess?.buffers?.[mealKey] ?? 0}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      AI Projected + 8% Buffer Portions
                    </p>
                  </div>
                ))}
              </div>

              {/* Locked Headcount by Block Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Verified Locked Headcounts by Block (Kitchen Preparation)
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/70">
                    Hostel Block D & E Locked
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3">BLOCK</th>
                        <th className="pb-3">RESIDENTS</th>
                        <th className="pb-3">BREAKFAST</th>
                        <th className="pb-3">LUNCH</th>
                        <th className="pb-3">SNACKS</th>
                        <th className="pb-3">DINNER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(principalMess?.lockedHeadcount || []).map((row) => (
                        <tr key={row.block} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900">Block {row.block}</td>
                          <td className="py-3.5 text-slate-700 font-semibold">{row.students}</td>
                          <td className="py-3.5 text-slate-500 font-mono font-bold">{row.breakfast}</td>
                          <td className="py-3.5 text-slate-500 font-mono font-bold">{row.lunch}</td>
                          <td className="py-3.5 text-slate-500 font-mono font-bold">{row.snacks}</td>
                          <td className="py-3.5 text-slate-500 font-mono font-bold">{row.dinner}</td>
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
                    <CookingPot className="w-4 h-4 text-[#1b4d3e]" />
                    Tomorrow's Menu & Recommended Chef Cooking Quantities
                  </h3>

                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Zero Waste Formulation Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(principalMess?.suggestedCook || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-center gap-3.5 hover:border-slate-300 transition-all"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded uppercase">
                          {item.meal}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 font-mono">
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
          {/* SCREEN 4: ALERTS & NOTICES                                           */}
          {/* ==================================================================== */}
          {isAlertsTab && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Executive Inbox & Disciplinary Alerts
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Real-time cut-off compliance warnings, kitchen escalations, and dining anomalies
                  </p>
                </div>

                <button
                  onClick={markAllPrincipalNotificationsRead}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Read</span>
                </button>
              </div>

              {/* Anomaly Alerts Cards */}
              <div className="space-y-3">
                {(aiAnomalies || []).map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl mt-0.5 ${
                        anomaly.severity === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : anomaly.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {anomaly.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {anomaly.scope}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
                          {anomaly.desc || anomaly.description}
                        </p>
                        {anomaly.mitigation && (
                          <p className="text-[11px] text-[#1b4d3e] font-semibold mt-1">
                            Recommended Action: {anomaly.mitigation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {anomaly.time}
                      </span>
                      <button
                        onClick={() => addToast(`Executive escalation acknowledged for ${anomaly.scope}`, 'success')}
                        className="bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SCREEN 5: ROLE-SEGREGATED ACCOUNTS DIRECTORY                          */}
          {/* ==================================================================== */}
          {isAccountsTab && (
            <div className="space-y-6">
              {/* Role Segregation Counter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Students', count: studentUsers.length, icon: GraduationCap, roleKey: 'Student', color: 'text-blue-600' },
                  { label: 'Room Leads', count: roomLeadUsers.length, icon: BedDouble, roleKey: 'Room Lead', color: 'text-emerald-700' },
                  { label: 'Floor Incharges', count: floorInchargeUsers.length, icon: Building2, roleKey: 'Floor Incharge', color: 'text-purple-600' },
                  { label: 'Block Coord.', count: blockCoordUsers.length, icon: Boxes, roleKey: 'Block Coordinator', color: 'text-teal-600' },
                  { label: 'Mess Kitchen', count: messUsers.length, icon: ChefHat, roleKey: 'Mess Incharge', color: 'text-amber-600' },
                  { label: 'KFC Canteen', count: kfcUsers.length, icon: ShoppingBag, roleKey: 'KFC Staff', color: 'text-red-600' },
                  { label: 'Campus Admin', count: adminUsers.length, icon: KeyRound, roleKey: 'Admin', color: 'text-slate-700' }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => {
                      setRoleFilter(item.roleKey);
                      setActiveTab('All Campus Accounts');
                    }}
                    className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer shadow-xs hover:border-emerald-300 ${
                      activeRoleView === item.roleKey
                        ? 'border-[#1b4d3e] ring-2 ring-emerald-600/20 bg-emerald-50/20'
                        : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {item.label}
                      </span>
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <p className={`text-xl font-extrabold mt-1 font-mono ${item.color}`}>
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>

              {/* Search, Role Selector Filter Bar & Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#1b4d3e]" />
                      Campus Role Directory & Direct Access
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Principal possesses universal privileges to inspect and launch any campus account across Smart Mess KIET.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl self-start md:self-auto">
                    {filteredUsers.length} of {users.length} Accounts Listed
                  </span>
                </div>

                {/* Role Switcher Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                  {[
                    { key: 'All', label: 'All Roles' },
                    { key: 'Student', label: `Students (${studentUsers.length})` },
                    { key: 'Room Lead', label: `Room Leads (${roomLeadUsers.length})` },
                    { key: 'Floor Incharge', label: `Floor Incharges (${floorInchargeUsers.length})` },
                    { key: 'Block Coordinator', label: `Block Coordinators (${blockCoordUsers.length})` },
                    { key: 'Mess Incharge', label: `Mess Kitchen (${messUsers.length})` },
                    { key: 'KFC Staff', label: `KFC Staff (${kfcUsers.length})` },
                    { key: 'Admin', label: `Admins (${adminUsers.length})` }
                  ].map((rf) => (
                    <button
                      key={rf.key}
                      onClick={() => {
                        setRoleFilter(rf.key);
                        if (activeTab !== 'All Campus Accounts') setActiveTab('All Campus Accounts');
                      }}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeRoleView === rf.key
                          ? 'bg-[#1b4d3e] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {rf.label}
                    </button>
                  ))}
                </div>

                {/* Search & Status Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search accounts by name, email, roll number, room, or designation..."
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b4d3e] font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Suspended">Suspended Only</option>
                    </select>

                    {accountSearch && (
                      <button
                        onClick={() => setAccountSearch('')}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Accounts Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => {
                  const isStudent = user.role === 'Student';
                  const isLead = user.role === 'Room Lead';
                  const isFloor = user.role === 'Floor Incharge';
                  const isBlock = user.role === 'Block Coordinator';
                  const isMess = user.role === 'Mess Incharge';
                  const isKfc = user.role === 'KFC Staff';
                  const isAdmin = user.role === 'Admin';

                  const roleBadgeClass = isStudent
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : isLead
                    ? 'bg-emerald-50 text-[#1b4d3e] border-emerald-200'
                    : isFloor
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : isBlock
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : isMess
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : isKfc
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200';

                  return (
                    <div
                      key={user.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between gap-4"
                    >
                      <div>
                        {/* Header: Name, Role Badge, Status */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              isStudent ? 'bg-blue-100 text-blue-800' : isLead ? 'bg-emerald-100 text-[#1b4d3e]' : 'bg-slate-900 text-white'
                            }`}>
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">
                                {user.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {user.email || user.rollNo || 'KIET Resident'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${roleBadgeClass}`}>
                              {user.role}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${user.status === 'Suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`} title={user.status || 'Active'}></span>
                          </div>
                        </div>

                        {/* Middle: Details & Room Assignment */}
                        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs space-y-1 my-3">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 text-[10px] font-mono uppercase">Scope / Unit</span>
                            <span className="font-semibold text-slate-800 font-mono text-[11px] truncate max-w-[200px]">
                              {user.badge || 'Campus General'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 text-[10px] font-mono uppercase">Password Hint</span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {isStudent ? 'Roll Number' : '123456789'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: 1-Click Launch Portal & Executive Actions */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              user.status === 'Suspended'
                                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800'
                            }`}
                            title={user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                          >
                            {user.status === 'Suspended' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleNudgeUser(user)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-[#1b4d3e] transition-colors cursor-pointer"
                            title="Dispatch Executive Directive / Nudge"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleLaunchPortal(user)}
                          className="bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ml-auto"
                          title={`Switch portal session and launch ${user.role} Dashboard`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Launch Portal</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
