import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import {
  CookingPot,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Edit,
  Save,
  CheckCircle2,
  Download,
  UtensilsCrossed,
  Clock,
  Flame,
  ChefHat,
  Plus,
  X,
  Trash2,
  BrainCircuit,
  Scale,
  Sliders,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

export const MessInchargeDashboard = () => {
  const {
    headcount,
    menu,
    updateMenu,
    removeMessDish,
    addMessDish,
    studentMealPlan,
    kfcOrders,
    updateKfcOrderStatus,
    blockConsolidatedSent,
    addToast,
    floorMealSheets = [],
    confirmFloorMealSheetInKitchen,
    studentDiningRequests = [],
    acknowledgeStudentDiningRequest,
    // AI Forecasting Engine
    aiForecast,
    selectedAiMeal = 'Lunch',
    setSelectedAiMeal,
    aiScenario = 'standard',
    setAiScenario,
    aiLoading,
    fetchAIForecast,
    runAiSimulation,
    aiAnomalies = [],
    resolveAnomaly
  } = useApp();

  // Menu edit state
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editedMenu, setEditedMenu] = useState({ ...menu });
  const [newDishInputs, setNewDishInputs] = useState({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: ''
  });

  // AI Forecasting UI State
  const [aiSubTab, setAiSubTab] = useState('chart'); // 'chart' | 'log' | 'batch' | 'simulator' | 'anomalies'
  const [customSliderCount, setCustomSliderCount] = useState(aiForecast?.selectedCount || 185);
  const [isBatchDispatched, setIsBatchDispatched] = useState(false);

  useEffect(() => {
    if (!isEditingMenu) {
      setEditedMenu({ ...menu });
    }
  }, [menu, isEditingMenu]);

  useEffect(() => {
    if (fetchAIForecast) {
      fetchAIForecast(selectedAiMeal, '2026-10-01', aiScenario);
    }
  }, [selectedAiMeal]);

  useEffect(() => {
    if (aiForecast?.selectedCount) {
      setCustomSliderCount(aiForecast.selectedCount);
    }
  }, [aiForecast?.selectedCount]);

  const handleSaveMenu = () => {
    updateMenu(editedMenu);
    setIsEditingMenu(false);
  };

  const handleAddDish = (mealKey) => {
    const dish = (newDishInputs[mealKey] || '').trim();
    if (!dish) return;
    addMessDish(mealKey, dish);
    setNewDishInputs((prev) => ({ ...prev, [mealKey]: '' }));
  };

  const handleSelectMeal = (mealKey) => {
    if (setSelectedAiMeal) setSelectedAiMeal(mealKey);
    if (fetchAIForecast) fetchAIForecast(mealKey, '2026-10-01', aiScenario);
  };

  const handleSelectScenario = (scenKey) => {
    if (setAiScenario) setAiScenario(scenKey);
    if (runAiSimulation) runAiSimulation(scenKey, customSliderCount !== aiForecast?.selectedCount ? customSliderCount : null);
  };

  const handleSliderChange = (newCount) => {
    setCustomSliderCount(newCount);
    if (fetchAIForecast) {
      fetchAIForecast(selectedAiMeal, '2026-10-01', aiScenario, newCount);
    }
  };

  const handleDispatchBatch = () => {
    setIsBatchDispatched(true);
    addToast(
      `Batch requisition of ${aiForecast?.prepTarget || 200} portions (${aiForecast?.kitchenBatch?.rawRiceKg || 32}kg Rice, ${aiForecast?.kitchenBatch?.dalLiters || 28}L Dal) dispatched to Kitchen Stoves!`,
      'success'
    );
  };

  const handleExportBatchSheet = () => {
    addToast('Kitchen Store Requisition Sheet exported as CSV / Print Ready!', 'info');
  };

  const wastageTrendData = [
    { date: 'Mon', actualKg: 18, targetKg: 10 },
    { date: 'Tue', actualKg: 14, targetKg: 10 },
    { date: 'Wed', actualKg: 11, targetKg: 10 },
    { date: 'Thu', actualKg: 9, targetKg: 10 },
    { date: 'Fri', actualKg: 8, targetKg: 10 },
    { date: 'Sat', actualKg: 6, targetKg: 10 },
    { date: 'Sun (Pred)', actualKg: 5, targetKg: 10 }
  ];

  const activeKfcCount = kfcOrders.filter((o) => o.status !== 'Collected').length;

  const mealTimes = {
    Breakfast: '08:00 AM - 10:00 AM',
    Lunch: '12:30 PM - 02:30 PM',
    Snacks: '04:30 PM - 06:00 PM',
    Dinner: '07:30 PM - 09:30 PM'
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans">
      <Navbar currentRole="Mess Incharge" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-[#1b4d3e]" /> AI Kitchen Forecasting Engine v2.4
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Main Kitchen Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Mess Incharge Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Past-data AI predictive headcount, dynamic kitchen buffer batching, zero-waste optimization, and menu management.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                fetchAIForecast && fetchAIForecast(selectedAiMeal, '2026-10-01', aiScenario);
                addToast('AI predictive headcount recomputed with 14-day historical regression!', 'success');
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#1b4d3e] border border-emerald-200/80 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              Re-run AI Model
            </button>
            <button
              onClick={() => addToast('Exporting mess & AI forecast report as CSV...', 'info')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#1b4d3e]" />
              Export Data
            </button>
          </div>
        </div>

        {/* Block Consolidated Count Status Banner */}
        {blockConsolidatedSent && (
          <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 mb-6 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Block Coordinator Forwarded Finalized Headcounts
                </p>
                <p className="text-[11px] text-emerald-700">
                  Consolidated meal counts for Block D & Block E are locked and verified for tomorrow's kitchen preparation.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              Verified • Block D & E
            </span>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PORTAL OPT-INS ({selectedAiMeal.toUpperCase()})
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {aiForecast?.selectedCount || headcount.find((h) => h.meal === selectedAiMeal)?.selected || 185}
            </p>
            <p className="text-xs text-[#1b4d3e] mt-1 font-semibold flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5 text-[#1b4d3e]" /> Student App Selections
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              AI PREDICTED TURNOUT
            </span>
            <p className="text-2xl font-extrabold text-[#1b4d3e] mt-1">
              {aiForecast?.predictedCount || headcount.find((h) => h.meal === selectedAiMeal)?.predicted || 192}
            </p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Past WMA ({aiForecast?.confidence || 94.6}% Accuracy)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              RECOMMENDED BATCH PREP
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {aiForecast?.prepTarget || 200}
            </p>
            <p className="text-xs text-indigo-600 mt-1 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> +{aiForecast?.bufferPortions || 8} Buffer Portions
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PREVENTED FOOD WASTE
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              -{aiForecast?.wastageMetrics?.wasteReductionPct || 54}%
            </p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> {aiForecast?.wastageMetrics?.wasteSavedKg || 5.5} kg saved (₹{aiForecast?.wastageMetrics?.costSavedRs || 990})
            </p>
          </div>
        </div>

        {/* ==========================================================================
            AI HISTORICAL PREDICTIVE INTELLIGENCE & SMART KITCHEN HUB
            ========================================================================== */}
        <section className="bg-white rounded-2xl border border-emerald-200/90 shadow-sm p-5 sm:p-6 mb-8 relative overflow-hidden">
          {/* Top Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-[#1b4d3e] border border-emerald-200/60">
                  <BrainCircuit className="w-4 h-4" />
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  AI Headcount Forecasting & Kitchen Batch Intelligence
                </h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-100/70 text-[#1b4d3e] px-2 py-0.5 rounded-full border border-emerald-300/80">
                  Past-Data Driven
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Trained on 14-day campus dining history using Weighted Moving Average (WMA), Day-of-Week seasonality factors, and walk-in variance.
              </p>
            </div>

            {/* Meal Switcher Tabs */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 self-start lg:self-auto">
              {[
                { key: 'Breakfast', icon: '🌅', label: 'Breakfast' },
                { key: 'Lunch', icon: '☀️', label: 'Lunch' },
                { key: 'Snacks', icon: '🍪', label: 'Snacks' },
                { key: 'Dinner', icon: '🌙', label: 'Dinner' }
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleSelectMeal(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedAiMeal === m.key
                      ? 'bg-white text-[#1b4d3e] shadow-xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shift & Confidence Overview Ribbon */}
          <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/70 rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#1b4d3e] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {selectedAiMeal} Shift: <span className="font-mono text-slate-700">{mealTimes[selectedAiMeal] || 'Regular Shift'}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">
                Historical Conversion Ratio:{' '}
                <strong className="font-mono text-[#1b4d3e] font-bold">
                  {aiForecast?.historicalTurnoutRatio ? `${(aiForecast.historicalTurnoutRatio * 100).toFixed(1)}%` : '103.8%'}
                </strong>{' '}
                <span className="text-[11px] text-slate-400">
                  (Turnout vs Selections)
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200/80">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                95% CI: {aiForecast?.confidenceInterval?.min || 188} – {aiForecast?.confidenceInterval?.max || 196}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-[#1b4d3e] text-white">
                {aiForecast?.confidence || 94.6}% Confidence
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setAiSubTab('chart')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                aiSubTab === 'chart'
                  ? 'border-[#1b4d3e] text-[#1b4d3e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Past 7-Day Trend Model
            </button>
            <button
              onClick={() => setAiSubTab('log')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                aiSubTab === 'log'
                  ? 'border-[#1b4d3e] text-[#1b4d3e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Day-by-Day Historical Log
            </button>
            <button
              onClick={() => setAiSubTab('batch')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                aiSubTab === 'batch'
                  ? 'border-[#1b4d3e] text-[#1b4d3e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <CookingPot className="w-3.5 h-3.5" />
              Kitchen Store Batch Order ({aiForecast?.prepTarget || 200} Portions)
            </button>
            <button
              onClick={() => setAiSubTab('simulator')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                aiSubTab === 'simulator'
                  ? 'border-[#1b4d3e] text-[#1b4d3e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              "What-If" AI Scenario Simulator
            </button>
            <button
              onClick={() => setAiSubTab('anomalies')}
              className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                aiSubTab === 'anomalies'
                  ? 'border-[#1b4d3e] text-[#1b4d3e]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              AI Risk & Anomalies ({aiAnomalies.filter((a) => a.status !== 'Resolved').length})
            </button>
          </div>

          {/* TAB 1: CHART VIEW */}
          {aiSubTab === 'chart' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Past 7-Day Actual Turnout vs. AI Prediction ({selectedAiMeal})
                  </h3>
                  <p className="text-slate-500">
                    Compares student portal choices (blue bars), actual scanner attendance (emerald bars), and AI model fit (indigo line).
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Opt-Ins
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Actual Turnout
                  </span>
                  <span className="flex items-center gap-1 text-indigo-700">
                    <span className="w-2.5 h-1 rounded-full bg-indigo-600"></span> AI Forecast
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2.5 h-1 rounded-full bg-amber-500"></span> Waste (Kg)
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={aiForecast?.pastTrend || []}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      yAxisId="headcount"
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="waste"
                      orientation="right"
                      domain={[0, 15]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#d97706', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      formatter={(val, name) => [val, name]}
                    />
                    <Bar yAxisId="headcount" dataKey="selected" name="Student Opt-Ins" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={18} />
                    <Bar yAxisId="headcount" dataKey="actual" name="Actual Turnout" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                    <Line
                      yAxisId="headcount"
                      type="monotone"
                      dataKey="predicted"
                      name="AI Prediction"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4f46e5' }}
                    />
                    <Line
                      yAxisId="waste"
                      type="monotone"
                      dataKey="wastageKg"
                      name="Wastage (Kg)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#f59e0b' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Insight Footer */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700">
                    <strong>AI Mathematical Insight:</strong> Model computes a Weighted Moving Average of{' '}
                    <strong className="font-mono text-[#1b4d3e]">{aiForecast?.wma || 191}</strong> meals with a{' '}
                    <strong className="font-mono text-emerald-700">+{((aiForecast?.historicalTurnoutRatio || 1.038) * 100 - 100).toFixed(1)}%</strong> walk-in factor for Thursday dining.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                  MSE Variance: 1.84%
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORICAL LOG TABLE */}
          {aiSubTab === 'log' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Date & Day</th>
                    <th className="pb-3">Opt-Ins</th>
                    <th className="pb-3">AI Forecast</th>
                    <th className="pb-3">Actual Turnout</th>
                    <th className="pb-3">Variance</th>
                    <th className="pb-3">AI Accuracy</th>
                    <th className="pb-3">Waste (Kg)</th>
                    <th className="pb-3">Operational Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(aiForecast?.pastTrend || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-900 font-mono">
                        {row.date} <span className="text-slate-400 font-normal">({row.day})</span>
                      </td>
                      <td className="py-3 font-semibold text-blue-600 font-mono">{row.selected}</td>
                      <td className="py-3 font-bold text-indigo-700 font-mono">{row.predicted}</td>
                      <td className="py-3 font-extrabold text-[#1b4d3e] font-mono">{row.actual}</td>
                      <td className="py-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                          row.variance >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {row.variance >= 0 ? `+${row.variance}` : row.variance}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-600">
                        {row.accuracy}%
                      </td>
                      <td className="py-3 font-mono text-slate-600">
                        {row.wastageKg} kg
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {row.event}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: KITCHEN BATCH STORE ORDER */}
          {aiSubTab === 'batch' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Smart Kitchen Batch Order Formulation
                  </h3>
                  <p className="text-slate-500">
                    Exact store issue requisition calculated for <strong className="text-[#1b4d3e]">{aiForecast?.prepTarget || 200} portions</strong> ({aiForecast?.predictedCount || 192} predicted + {aiForecast?.bufferPortions || 8} buffer)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBatchSheet}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Print Order
                  </button>
                  <button
                    onClick={handleDispatchBatch}
                    className={`font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                      isBatchDispatched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1b4d3e] hover:bg-[#143d31] text-white active:scale-95'
                    }`}
                  >
                    {isBatchDispatched ? <Check className="w-3.5 h-3.5" /> : <CookingPot className="w-3.5 h-3.5" />}
                    {isBatchDispatched ? 'Batch Dispatched to Chefs' : 'Dispatch Batch to Stoves'}
                  </button>
                </div>
              </div>

              {/* Ingredient Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    🍚 BASMATI RICE
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {aiForecast?.kitchenBatch?.rawRiceKg || 32.0} <span className="text-xs font-normal text-slate-500">kg</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">160g / portion</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    🥣 TOOR / MOONG DAL
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {aiForecast?.kitchenBatch?.dalLiters || 28.0} <span className="text-xs font-normal text-slate-500">L</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">140ml / portion</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    🧀 PANEER / VEG
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {aiForecast?.kitchenBatch?.vegPaneerKg || 32.0} <span className="text-xs font-normal text-slate-500">kg</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">160g / portion</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    🫓 HOT ROTIS
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {aiForecast?.kitchenBatch?.rotisPcs || 600} <span className="text-xs font-normal text-slate-500">pcs</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">3 pcs / student</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    🧈 OIL & SPICES
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    {aiForecast?.kitchenBatch?.oilSpicesKg || 4.4} <span className="text-xs font-normal text-slate-500">kg</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">22g / portion</span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                    🛡️ SAFETY BUFFER
                  </span>
                  <p className="text-xl font-extrabold text-[#1b4d3e] mt-1 font-mono">
                    +{aiForecast?.bufferPortions || 8} <span className="text-xs font-normal text-emerald-700">meals</span>
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {aiForecast?.kitchenBatch?.bufferKg || 2.2} kg raw buffer
                  </span>
                </div>
              </div>

              {/* Chef Cooking Instructions Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-[#1b4d3e]" />
                    Chef Preparation Protocol:
                  </h4>
                  <p className="text-slate-600 mt-0.5">
                    Start batch 1 (150 portions) at 11:30 AM. Hold buffer batch 2 (50 portions) on simmering heat until live turnstile footfall reaches 140 at 01:15 PM.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto">
                  Zero Over-Preparation Mode Active
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: WHAT-IF SCENARIO SIMULATOR */}
          {aiSubTab === 'simulator' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Interactive AI "What-If" Demand Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate unforeseen environmental conditions, weather variations, or campus events before locking kitchen batches.
                </p>
              </div>

              {/* Scenario Preset Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block mb-2">
                  Select Event / Weather Scenario:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { key: 'standard', title: 'Standard Day', multiplier: '1.00x', icon: '☀️' },
                    { key: 'rainy', title: 'Heavy Rain', multiplier: '+8% Stay', icon: '🌧️' },
                    { key: 'exam', title: 'Exam Week', multiplier: '+12% Study', icon: '📝' },
                    { key: 'weekend_leave', title: 'Weekend Outing', multiplier: '-18% Leave', icon: '🎒' },
                    { key: 'festival_feast', title: 'Special Feast', multiplier: '+15% Rush', icon: '🎉' }
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleSelectScenario(s.key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        aiScenario === s.key
                          ? 'border-[#1b4d3e] bg-emerald-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-base mb-1">
                        <span>{s.icon}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          aiScenario === s.key ? 'bg-[#1b4d3e] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.multiplier}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-slate-900">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Student Headcount Slider */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#1b4d3e]" />
                    Adjust Student Opt-In Intent:
                  </label>
                  <span className="text-sm font-extrabold font-mono text-[#1b4d3e] bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    {customSliderCount} Students
                  </span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="230"
                  step="1"
                  value={customSliderCount}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1b4d3e]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                  <span>120 (Minimal Outing)</span>
                  <span>185 (Typical Campus Average)</span>
                  <span>230 (Full Capacity Rush)</span>
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-extrabold text-[#1b4d3e] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Simulated Output ({aiScenario.toUpperCase()}):
                  </h4>
                  <p className="text-emerald-800 mt-0.5">
                    Predicted Turnout: <strong className="font-mono text-slate-900">{aiForecast?.predictedCount || 192}</strong> meals.
                    Recommended Cooking: <strong className="font-mono text-slate-900">{aiForecast?.prepTarget || 200}</strong> portions (+{aiForecast?.bufferPortions || 8} safety margin).
                  </p>
                </div>
                <button
                  onClick={() => addToast(`Scenario "${aiScenario}" applied to active kitchen prep schedule!`, 'success')}
                  className="bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Apply Scenario
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: AI ANOMALIES & RISK INSIGHTS */}
          {aiSubTab === 'anomalies' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <p className="text-slate-500">
                  Real-time pattern anomaly alerts detected across hostel rooms, KFC food court, and dining halls.
                </p>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {aiAnomalies.length} Alerts Monitored
                </span>
              </div>

              <div className="space-y-3">
                {aiAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={`p-4 rounded-xl border transition-all ${
                      anomaly.status === 'Resolved'
                        ? 'bg-slate-50 border-slate-200/60 opacity-60'
                        : anomaly.severity === 'high'
                        ? 'bg-rose-50/70 border-rose-200'
                        : anomaly.severity === 'medium'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              anomaly.severity === 'high'
                                ? 'bg-rose-600'
                                : anomaly.severity === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                          ></span>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {anomaly.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                            {anomaly.scope}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {anomaly.desc || anomaly.description}
                        </p>
                        {anomaly.mitigation && (
                          <p className="text-[11px] text-emerald-800 mt-1 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            <strong>Mitigation:</strong> {anomaly.mitigation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 mt-2 sm:mt-0">
                        {anomaly.metricDifference && (
                          <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-md border border-slate-200">
                            {anomaly.metricDifference}
                          </span>
                        )}
                        {anomaly.status === 'Resolved' ? (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                            Resolved
                          </span>
                        ) : (
                          <button
                            onClick={() => resolveAnomaly(anomaly.id)}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-1 rounded-lg text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* MAIN GRID: Meal Plan Table + Kitchen Prep Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Meal Plan & Headcount Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Meal Plan & Headcount Consolidation
                </h3>
                <p className="text-xs text-slate-500">
                  Compare student selections against AI prediction and historical actuals
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-[#e6f4ea] px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto border border-emerald-200/60">
                Live Kitchen Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Meal</th>
                    <th className="pb-3">Selected</th>
                    <th className="pb-3">AI Predicted</th>
                    <th className="pb-3">Actual (Prev)</th>
                    <th className="pb-3 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {headcount.map((row) => (
                    <tr key={row.meal} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1b4d3e]"></span>
                        <span>{row.meal}</span>
                      </td>
                      <td className="py-3.5 text-[#1b4d3e] font-extrabold text-sm">{row.selected}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{row.predicted}</td>
                      <td className="py-3.5 text-slate-500 font-medium">{row.actual}</td>
                      <td className="py-3.5 text-right font-bold text-emerald-600">
                        {row.variance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kitchen Prep Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">
                Kitchen Preparation Status
              </h3>
              <p className="text-xs text-slate-500 mb-6">Real-time cooking completion rate</p>

              <div className="space-y-4">
                {[
                  { label: 'Vegetarian Meals', percent: 85, color: 'bg-emerald-600' },
                  { label: 'Non-Veg Meals', percent: 70, color: 'bg-[#1b4d3e]' },
                  { label: 'Snacks & Evening Tea', percent: 95, color: 'bg-teal-600' },
                  { label: 'KFC Express Pre-Orders', percent: 60, color: 'bg-amber-500' }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-900 font-mono">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#1b4d3e]" />
                Chef Ramesh
              </span>
              <span className="text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold">
                Kitchen Ready
              </span>
            </div>
          </div>
        </div>

        {/* Floor Incharge Headcount Sheets & Requisitions Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Floor Incharge Headcount Sheets & Requisitions
                </h3>
                <span className="text-[10px] font-mono text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Real-time Floor Feed
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Verified floor dining attendance submitted by Floor Incharges for tomorrow's kitchen preparation
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Floor & Block</th>
                  <th className="pb-3">Floor Incharge</th>
                  <th className="pb-3">Breakfast</th>
                  <th className="pb-3">Lunch</th>
                  <th className="pb-3">Snacks</th>
                  <th className="pb-3">Dinner</th>
                  <th className="pb-3 text-right">Kitchen Confirmation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {floorMealSheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900 font-mono">{sheet.floor}</td>
                    <td className="py-3 font-semibold text-slate-700">{sheet.incharge}</td>
                    <td className="py-3 font-mono font-bold text-[#1b4d3e]">{sheet.requirements?.breakfast || 10}</td>
                    <td className="py-3 font-mono font-bold text-[#1b4d3e]">{sheet.requirements?.lunch || 10}</td>
                    <td className="py-3 font-mono font-bold text-[#1b4d3e]">{sheet.requirements?.snacks || 8}</td>
                    <td className="py-3 font-mono font-bold text-[#1b4d3e]">{sheet.requirements?.dinner || 10}</td>
                    <td className="py-3 text-right">
                      {sheet.status === 'Confirmed by Kitchen' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 ml-auto">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Kitchen Confirmed
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmFloorMealSheetInKitchen(sheet.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5 ml-auto"
                        >
                          <CookingPot className="w-3.5 h-3.5" />
                          Confirm & Prep Cooking
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Live Meal Confirmations & Dietary Requisitions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Student Live Meal Confirmations & Dietary Requisitions
                </h3>
                <span className="text-[10px] font-mono text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Direct Student Feed • Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time student meal opt-ins, allergy notices, and special dietary requests from hostel portals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                {studentDiningRequests.length} Students Logged
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Student & Roll No</th>
                  <th className="pb-3">Room & Block</th>
                  <th className="pb-3">Meals Selected</th>
                  <th className="pb-3">Dietary / Allergy Requisition</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-right">Kitchen Acknowledged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentDiningRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1b4d3e]"></span>
                        <span>{req.studentName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block pl-4">
                        {req.rollNo}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-700 text-xs font-medium">
                      {req.roomNo} <span className="text-slate-400">• {req.block}</span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {req.meals?.breakfast && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            🌅 B
                          </span>
                        )}
                        {req.meals?.lunch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ☀️ L
                          </span>
                        )}
                        {req.meals?.snacks && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            🍪 S
                          </span>
                        )}
                        {req.meals?.dinner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            🌙 D
                          </span>
                        )}
                        {!req.meals?.breakfast && !req.meals?.lunch && !req.meals?.snacks && !req.meals?.dinner && (
                          <span className="text-xs text-slate-400 italic">No meals</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        (req.dietaryNote || '').toLowerCase().includes('jain') || (req.dietaryNote || '').toLowerCase().includes('strict')
                          ? 'bg-purple-50 text-purple-900 border border-purple-200'
                          : (req.dietaryNote || '').toLowerCase().includes('allergy')
                          ? 'bg-rose-50 text-rose-900 border border-rose-200'
                          : (req.dietaryNote || '').toLowerCase().includes('protein')
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : (req.dietaryNote || '').toLowerCase().includes('late')
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {req.dietaryNote || 'Standard Student Dining'}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-500 text-xs">
                      {req.time}
                    </td>
                    <td className="py-3.5 text-right">
                      {req.acknowledged ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 ml-auto">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Kitchen Prepping
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeStudentDiningRequest(req.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5 ml-auto"
                          title="Acknowledge student dietary request and notify student"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          Acknowledge & Prep
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wastage Chart & Tomorrow Menu Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Wastage Trend */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Food Wastage Trend (Kg)</h3>
                <p className="text-xs text-slate-500">Actual waste vs 10kg target benchmark</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                -32% Under
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={wastageTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 12 }} />
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
                  <Line type="monotone" dataKey="actualKg" name="Actual Waste (Kg)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="targetKg" name="Target Limit (10 Kg)" stroke="#94a3b8" strokeDasharray="3 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tomorrow Menu Editor */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Tomorrow's Menu Editor</h3>
                  <span className="text-[10px] font-mono text-emerald-800 bg-[#e6f4ea] px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Live Sync Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">Add or remove dishes in real-time across student portals</p>
              </div>
              <div className="flex items-center gap-2">
                {isEditingMenu ? (
                  <button
                    onClick={handleSaveMenu}
                    className="bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Menu
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingMenu(true)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-[#1b4d3e] border border-emerald-200/70 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Raw Text
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => {
                const mealItems = studentMealPlan?.meals?.[mealKey]?.items || [];
                const mealIcon =
                  mealKey === 'breakfast' ? '🌅' : mealKey === 'lunch' ? '☀️' : mealKey === 'snacks' ? '🍪' : '🌙';

                return (
                  <div
                    key={mealKey}
                    className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 transition-colors focus-within:border-emerald-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-mono font-bold text-[#1b4d3e] uppercase flex items-center gap-1.5">
                        <span>{mealIcon}</span>
                        <span>{mealKey}</span>
                        <span className="text-slate-400 font-normal">({mealItems.length} items)</span>
                      </label>
                    </div>

                    {isEditingMenu ? (
                      <input
                        type="text"
                        value={editedMenu[mealKey] || ''}
                        onChange={(e) => setEditedMenu({ ...editedMenu, [mealKey]: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                      />
                    ) : (
                      <div className="space-y-2.5">
                        {/* Interactive Dish Pills with Quick Remove */}
                        <div className="flex flex-wrap gap-2">
                          {mealItems.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No dishes listed. Add one below!</span>
                          ) : (
                            mealItems.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 hover:border-rose-300 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs group transition-all"
                              >
                                <span>{item.name}</span>
                                {item.tags && (
                                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                                    • {item.tags.split('•')[0]}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeMessDish(mealKey, item.name)}
                                  title={`Remove ${item.name}`}
                                  className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-0.5 rounded-md transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3 stroke-[2.5]" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Inline Add Dish Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder={`+ Add dish to ${mealKey}...`}
                            value={newDishInputs[mealKey] || ''}
                            onChange={(e) => setNewDishInputs({ ...newDishInputs, [mealKey]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddDish(mealKey);
                            }}
                            className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDish(mealKey)}
                            disabled={!(newDishInputs[mealKey] || '').trim()}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-[#1b4d3e] text-[#1b4d3e] hover:text-white border border-emerald-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KFC Order Status Manager */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                KFC Express Orders & Status Updates
              </h3>
              <p className="text-xs text-slate-500">
                Live queue dispatch and status updates for food-court counter pickup
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Counter Open
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Order Token</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kfcOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-extrabold text-[#1b4d3e]">{ord.token}</td>
                    <td className="py-3 font-semibold text-slate-800">
                      {ord.studentName} <span className="text-slate-400 font-normal">({ord.room})</span>
                    </td>
                    <td className="py-3 text-slate-600 font-medium">
                      {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 font-extrabold text-slate-900 font-mono">₹{ord.totalAmount}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs font-medium">{ord.orderTime}</td>
                    <td className="py-3 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => updateKfcOrderStatus(ord.id, e.target.value)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 text-[#1b4d3e] focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs font-mono"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Collected">Collected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
