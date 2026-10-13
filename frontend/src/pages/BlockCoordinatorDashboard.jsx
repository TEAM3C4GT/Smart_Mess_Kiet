import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const BlockCoordinatorDashboard = () => {
  const {
    blockData = [],
    blockConsolidatedSent,
    blockSentMap = { 'Block D': false, 'Block E': false, 'All': false },
    sendBlockConsolidatedCount,
    nudgeFloorIncharge,
    nudgeRoomLead,
    floorRooms = [],
    aiAnomalies = []
  } = useApp();

  // Active Block Tab: 'Block D' | 'Block E' | 'All'
  const [selectedBlock, setSelectedBlock] = useState('Block D');

  // Block D Metrics
  const blockDFloors = blockData.filter((f) => (f?.floor || '').includes('Block D'));
  const blockDFloorRooms = floorRooms.filter((r) => (r?.roomNo || '').includes('D-'));
  const blockDStudents = blockDFloors.reduce((sum, f) => sum + (f?.totalStudents || 0), 0) || 20;
  const blockDSubmissions = blockDFloorRooms.reduce((sum, r) => sum + (r?.submitted || 0), 0);
  const blockDPending = Math.max(0, blockDStudents - blockDSubmissions);
  const blockDRate = blockDStudents > 0 ? ((blockDSubmissions / blockDStudents) * 100).toFixed(1) : 0;

  // Block E Metrics
  const blockEFloors = blockData.filter((f) => (f?.floor || '').includes('Block E'));
  const blockEFloorRooms = floorRooms.filter((r) => (r?.roomNo || '').includes('E-'));
  const blockEStudents = blockEFloors.reduce((sum, f) => sum + (f?.totalStudents || 0), 0) || 20;
  const blockESubmissions = blockEFloorRooms.reduce((sum, r) => sum + (r?.submitted || 0), 0);
  const blockEPending = Math.max(0, blockEStudents - blockESubmissions);
  const blockERate = blockEStudents > 0 ? ((blockESubmissions / blockEStudents) * 100).toFixed(1) : 0;

  // Active View Resolution
  const isBlockD = selectedBlock === 'Block D';
  const isBlockE = selectedBlock === 'Block E';
  const isAll = selectedBlock === 'All';

  const activeFloors = isBlockD ? blockDFloors : isBlockE ? blockEFloors : blockData;
  const activeFloorRooms = isBlockD ? blockDFloorRooms : isBlockE ? blockEFloorRooms : floorRooms;
  const activeStudents = isBlockD ? blockDStudents : isBlockE ? blockEStudents : blockDStudents + blockEStudents;
  const activeSubmissions = isBlockD ? blockDSubmissions : isBlockE ? blockESubmissions : blockDSubmissions + blockESubmissions;
  const activePending = isBlockD ? blockDPending : isBlockE ? blockEPending : blockDPending + blockEPending;
  const activeRate = activeStudents > 0 ? ((activeSubmissions / activeStudents) * 100).toFixed(1) : 0;
  const activeTotalFloors = activeFloors.length;
  const activeTotalRooms = activeFloorRooms.length;

  // Sent status for current block selection
  const isCurrentBlockSent = blockSentMap ? !!blockSentMap[selectedBlock] : blockConsolidatedSent;

  // Meal counts per active view
  const mealCountData = [
    { meal: 'Breakfast', submitted: Math.round(activeSubmissions * 0.95), expected: activeStudents || 20 },
    { meal: 'Lunch', submitted: Math.round(activeSubmissions * 1.0), expected: activeStudents || 20 },
    { meal: 'Snacks', submitted: Math.round(activeSubmissions * 0.8), expected: activeStudents || 20 },
    { meal: 'Dinner', submitted: Math.round(activeSubmissions * 0.95), expected: activeStudents || 20 }
  ];

  // Sidebar navigation items for Block Coordinator
  const sidebarItems = [
    { isHeader: true, header: 'HOSTEL BLOCKS' },
    {
      id: 'Block D',
      label: 'Block D (Senior Wing)',
      icon: Building,
      badge: `${blockDSubmissions}/${blockDStudents}`
    },
    {
      id: 'Block E',
      label: 'Block E (International)',
      icon: Building,
      badge: `${blockESubmissions}/${blockEStudents}`
    },
    {
      id: 'All',
      label: 'All Blocks (Combined)',
      icon: Layers,
      badge: `${blockDSubmissions + blockESubmissions}/${blockDStudents + blockEStudents}`
    },
    { isHeader: true, header: 'COORDINATION & COMPLIANCE' },
    {
      id: 'Room Leads',
      label: 'Room Leads Oversight',
      icon: Users,
      badge: activeTotalRooms
    }
  ];

  const handleBlockTabChange = (tabId) => {
    if (tabId === 'Room Leads') {
      setSelectedBlock('All');
      setTimeout(() => {
        const el = document.getElementById('room-leads-coordination-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setSelectedBlock(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]/80 text-[#293749] flex flex-col font-sans">
      <Navbar
        currentRole="Block Coordinator"
        activeTab={selectedBlock}
        onTabChange={handleBlockTabChange}
        tabs={sidebarItems}
      />

      {/* Main Flex Layout: Sidebar on Left, Content on Right */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Navigation Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={selectedBlock}
          onTabChange={handleBlockTabChange}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">

          {(aiAnomalies || []).length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-lg leading-none">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {aiAnomalies.length} AI anomaly alert{aiAnomalies.length !== 1 ? 's' : ''} detected
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  {aiAnomalies[0].title}
                  {aiAnomalies[0].description || aiAnomalies[0].desc ? ` — ${aiAnomalies[0].description || aiAnomalies[0].desc}` : ''}
                </p>
              </div>
            </div>
          )}
        {/* Header with Block Subtitle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#355F97] bg-[#EDF2F9] border border-[#D5E4F8]/70 px-2.5 py-0.5 rounded-md">
                {isBlockD ? 'Block D Coordinator' : isBlockE ? 'Block E Coordinator' : 'Hostel Multi-Block Consolidation'}
              </span>
              <span className="text-xs font-mono font-bold text-[#65748A]">
                {isBlockD
                  ? 'Hostel Block D • B.Tech Residency'
                  : isBlockE
                  ? 'Hostel Block E • International & PG'
                  : 'Hostel Blocks D & E Combined'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293749] tracking-tight mt-1">
              {isBlockD
                ? 'Hostel Block D Coordinator Dashboard'
                : isBlockE
                ? 'Hostel Block E Coordinator Dashboard'
                : 'Consolidated Blocks D & E Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-[#65748A] mt-0.5 font-medium">
              {isBlockD
                ? 'Dedicated management for Floors D-1 & D-2 (Rooms D-101, D-102, D-201, D-202).'
                : isBlockE
                ? 'Dedicated management for Floors E-1 & E-2 (Rooms E-101, E-102, E-201, E-202).'
                : 'Consolidated cross-block aggregation, wing performance comparison, and kitchen sync.'}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => sendBlockConsolidatedCount(selectedBlock)}
            className={`font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer ${
              isCurrentBlockSent
                ? 'bg-[#355F97] hover:bg-[#2F5488] text-white shadow-[#355F97]/20'
                : 'bg-[#355F97] hover:bg-[#2B4F80] text-white shadow-[#355F97]/20 hover:shadow-md'
            }`}
          >
            {isCurrentBlockSent ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>
                  {isBlockD
                    ? 'Block D Count Sent'
                    : isBlockE
                    ? 'Block E Count Sent'
                    : 'Consolidated Count Sent'}
                </span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>
                  {isBlockD
                    ? 'Send Block D Count to Mess'
                    : isBlockE
                    ? 'Send Block E Count to Mess'
                    : 'Send Consolidated Count to Mess'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* BLOCK SEPARATION SELECTOR TABS */}
        <div className="bg-[#EDF2F9]/90 p-1.5 rounded-2xl border border-[#DCE4EF]/90 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Block D Tab */}
            <button
              onClick={() => setSelectedBlock('Block D')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBlock === 'Block D'
                  ? 'bg-[#355F97] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#293749] hover:bg-white/80'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Block D (Senior Wing)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedBlock === 'Block D'
                    ? 'bg-[#243F66]/60 text-[#D5E4F8]'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {blockDSubmissions}/{blockDStudents} ({blockDRate}%)
              </span>
            </button>

            {/* Block E Tab */}
            <button
              onClick={() => setSelectedBlock('Block E')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBlock === 'Block E'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#293749] hover:bg-white/80'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Block E (International / PG)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedBlock === 'Block E'
                    ? 'bg-blue-900/60 text-blue-100'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {blockESubmissions}/{blockEStudents} ({blockERate}%)
              </span>
            </button>

            {/* All Blocks Consolidated Tab */}
            <button
              onClick={() => setSelectedBlock('All')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBlock === 'All'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#293749] hover:bg-white/80'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Blocks (Combined)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedBlock === 'All'
                    ? 'bg-slate-950 text-slate-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {blockDSubmissions + blockESubmissions}/{blockDStudents + blockEStudents}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 text-xs text-[#65748A] font-mono hidden md:flex">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Cutoff: 10:00 PM Tonight</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4EF]/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL FLOORS
            </span>
            <p className="text-2xl font-extrabold text-[#293749] mt-1">{activeTotalFloors}</p>
            <p className="text-xs text-[#65748A] mt-1 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              {isBlockD ? 'Floors D-1 & D-2' : isBlockE ? 'Floors E-1 & E-2' : 'Floors 1 - 4 Across Blocks'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4EF]/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL ROOMS
            </span>
            <p className="text-2xl font-extrabold text-[#293749] mt-1">{activeTotalRooms}</p>
            <p className="text-xs text-[#65748A] mt-1 font-medium flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" /> {activeStudents} Students Allocated
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4EF]/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL SUBMISSIONS
            </span>
            <p className="text-2xl font-extrabold text-[#355F97] mt-1">{activeSubmissions}</p>
            <p className="text-xs text-[#355F97] mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {activeRate}% Compliance Rate
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4EF]/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PENDING STUDENTS
            </span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{activePending}</p>
            <p className="text-xs text-amber-600 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {isBlockD ? 'In Block D' : isBlockE ? 'In Block E' : 'Across all wings'}
            </p>
          </div>
        </div>

        {/* COMPARATIVE CARDS (Shown when All Blocks view is selected) */}
        {isAll && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Block D Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#D5E4F8]/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#355F97]"></span>
                    <h3 className="font-bold text-[#293749] text-base">Hostel Block D (Senior Wing)</h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-[#EDF2F9] text-[#355F97] px-2 py-0.5 rounded border border-[#D5E4F8]">
                    {blockDRate}% Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Floors D-1 & D-2 • Rooms D-101, D-102, D-201, D-202
                </p>
                <div className="grid grid-cols-3 gap-2 text-center bg-[#F5F7FA] p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Total</span>
                    <span className="text-base font-bold text-[#293749]">{blockDStudents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Submitted</span>
                    <span className="text-base font-bold text-[#355F97]">{blockDSubmissions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Pending</span>
                    <span className="text-base font-bold text-amber-600">{blockDPending}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlock('Block D')}
                className="mt-4 w-full py-2 bg-[#EDF2F9] hover:bg-[#355F97] text-[#355F97] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Dedicated Block D Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Block E Card */}
            <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <h3 className="font-bold text-[#293749] text-base">Hostel Block E (International & PG)</h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {blockERate}% Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Floors E-1 & E-2 • Rooms E-101, E-102, E-201, E-202
                </p>
                <div className="grid grid-cols-3 gap-2 text-center bg-[#F5F7FA] p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Total</span>
                    <span className="text-base font-bold text-[#293749]">{blockEStudents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Submitted</span>
                    <span className="text-base font-bold text-blue-700">{blockESubmissions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Pending</span>
                    <span className="text-base font-bold text-amber-600">{blockEPending}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlock('Block E')}
                className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-700 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Dedicated Block E Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Meal Count Chart */}
        <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
            <div>
              <h3 className="font-bold text-[#293749] text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#355F97]" />
                {isBlockD
                  ? 'Block D Meal Headcount (Submitted vs Expected)'
                  : isBlockE
                  ? 'Block E Meal Headcount (Submitted vs Expected)'
                  : 'Consolidated Meal Headcount (Blocks D & E Combined)'}
              </h3>
              <p className="text-xs text-[#65748A]">
                {isBlockD
                  ? 'Meal requisitions for Senior Residency residents ready for kitchen preparation'
                  : isBlockE
                  ? 'Meal requisitions for International & PG residents ready for kitchen preparation'
                  : 'Combined campus meal counts ready to be transferred to kitchen preparation'}
              </p>
            </div>
            <span className="text-xs font-mono text-[#2B4F80] bg-[#D5E4F8] px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto border border-[#D5E4F8]/60">
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
                <Bar
                  dataKey="submitted"
                  name="Submitted Count"
                  fill={isBlockE ? '#2563eb' : '#355F97'}
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="expected" name="Expected Max Count" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floor Summary Table */}
        <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
            <div>
              <h3 className="font-bold text-[#293749] text-base sm:text-lg">
                {isBlockD
                  ? 'Block D Floor-wise Submission Breakdown'
                  : isBlockE
                  ? 'Block E Floor-wise Submission Breakdown'
                  : 'Multi-Block Floor Submission Breakdown'}
              </h3>
              <p className="text-xs text-[#65748A]">
                {isBlockD
                  ? 'Floors D-1 & D-2 participation and compliance tracking'
                  : isBlockE
                  ? 'Floors E-1 & E-2 participation and compliance tracking'
                  : 'Overview of all 4 hostel floors across Block D and Block E'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#65748A]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cutoff: 10:00 PM Tonight</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DCE4EF]/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Floor</th>
                  <th className="pb-3">Total Rooms</th>
                  <th className="pb-3">Submissions</th>
                  <th className="pb-3">Submission Rate</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Floor Incharge Connect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeFloors.map((fl) => (
                  <tr key={fl.floor} className="hover:bg-[#F5F7FA]/80 transition-colors">
                    <td className="py-3.5 font-bold text-[#293749] flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          fl.floor.includes('Block D') ? 'bg-[#355F97]' : 'bg-blue-600'
                        }`}
                      ></span>
                      <span>{fl.floor}</span>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{fl.rooms} Rooms</td>
                    <td className="py-3.5 text-slate-700 font-semibold font-mono text-xs">
                      {fl.submitted} / {fl.totalStudents} Students
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-[#293749] min-w-10">{fl.rate}%</span>
                        <div className="w-24 bg-[#EDF2F9] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              fl.floor.includes('Block D') ? 'bg-[#355F97]' : 'bg-blue-600'
                            }`}
                            style={{ width: `${fl.rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          fl.rate >= 85
                            ? 'bg-[#EDF2F9] text-[#355F97] border-[#D5E4F8]/70'
                            : 'bg-amber-50 text-amber-800 border-amber-200/70'
                        }`}
                      >
                        {fl.rate >= 85 ? (
                          <CheckCircle2 className="w-3 h-3 text-[#355F97]" />
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
                        <span className="inline-flex items-center gap-1 text-[#2F5488] font-semibold text-xs ml-auto">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#355F97]" />
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

        {/* Room Leads Coordination Table */}
        <div id="room-leads-coordination-section" className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#293749] text-base sm:text-lg">
                  {isBlockD
                    ? 'Block D Room Leads Coordination'
                    : isBlockE
                    ? 'Block E Room Leads Coordination'
                    : 'Block D & Block E Room Leads Coordination'}
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B4F80] bg-[#EDF2F9] border border-[#D5E4F8]/80 px-2 py-0.5 rounded">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#65748A] mt-0.5">
                {isBlockD
                  ? 'Direct oversight of Room Leads across Floor D-1 and Floor D-2.'
                  : isBlockE
                  ? 'Direct oversight of Room Leads across Floor E-1 and Floor E-2.'
                  : 'Direct oversight of Room Leads across 4 floors. Dispatch real-time compliance nudges before cutoff.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#65748A] font-mono font-medium">
                Total {activeTotalRooms} Rooms Managed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DCE4EF]/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
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
                {activeFloorRooms.map((room) => {
                  const roomNoStr = room?.roomNo || '';
                  const leadName = room?.lead || 'Room Lead';
                  const isBlockDItem = roomNoStr.includes('D-');
                  const floorNum = roomNoStr.includes('10') ? 'Floor 1' : 'Floor 2';
                  const isComplete = (room?.pending || 0) === 0;

                  return (
                    <tr key={roomNoStr || Math.random()} className="hover:bg-[#F5F7FA]/80 transition-colors">
                      <td className="py-3.5 font-bold text-[#293749] flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBlockDItem ? 'bg-[#355F97]' : 'bg-blue-600'
                          }`}
                        ></span>
                        <span className="font-mono">{roomNoStr}</span>
                      </td>
                      <td className="py-3.5 text-slate-800 font-medium">{leadName}</td>
                      <td className="py-3.5 text-[#65748A] text-xs font-mono">
                        {floorNum} • {isBlockDItem ? 'Block D' : 'Block E'}
                      </td>
                      <td className="py-3.5 text-slate-700 font-semibold font-mono text-xs">
                        {room?.submitted || 0} / {room?.members || 5}
                      </td>
                      <td className="py-3.5 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#293749] min-w-8 text-xs">{room?.rate || 0}%</span>
                          <div className="w-20 bg-[#EDF2F9] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                room?.rate === 100
                                  ? isBlockDItem
                                    ? 'bg-[#355F97]'
                                    : 'bg-blue-600'
                                  : (room?.rate || 0) >= 75
                                  ? 'bg-[#355F97]'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${room?.rate || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isComplete
                              ? 'bg-[#EDF2F9] text-[#355F97] border-[#D5E4F8]/70'
                              : 'bg-amber-50 text-amber-800 border-amber-200/70'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-3 h-3 text-[#355F97]" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {isComplete ? 'Complete' : `${room?.pending || 0} Pending`}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {!isComplete ? (
                          <button
                            onClick={() =>
                              nudgeRoomLead(
                                roomNoStr,
                                `Urgent cutoff notice: ${room?.pending || 0} pending student meal selections`,
                                'Nithin (Block Coordinator)'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95 ml-auto"
                            title={`Nudge ${leadName} of ${roomNoStr}`}
                          >
                            <BellRing className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                            <span>Nudge Lead ({leadName.split(' ')[0]})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              nudgeRoomLead(
                                roomNoStr,
                                '100% headcount verified. Prepared for kitchen consolidation.',
                                'Nithin (Block Coordinator)'
                              )
                            }
                            className="inline-flex items-center gap-1 text-[#2F5488] hover:text-[#2B4F80] font-semibold text-xs ml-auto border border-[#D5E4F8] bg-[#EDF2F9]/50 hover:bg-[#EDF2F9] px-2.5 py-1 rounded-md transition-colors"
                            title={`Send acknowledgement to ${leadName}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#355F97]" />
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
    </div>
  );
};

export default BlockCoordinatorDashboard;
