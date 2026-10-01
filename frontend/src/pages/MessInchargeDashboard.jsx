import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import {
  CookingPot,
  ShoppingBag,
  TrendingDown,
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
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

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
    confirmFloorMealSheetInKitchen
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

  useEffect(() => {
    if (!isEditingMenu) {
      setEditedMenu({ ...menu });
    }
  }, [menu, isEditingMenu]);

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

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans">
      <Navbar currentRole="Mess Incharge" />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md">
                Kitchen Operations & Forecasting
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Main Kitchen Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Mess Incharge Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Daily prep headcounts, AI waste minimization, menu publishing, and food court sync.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => addToast('Exporting mess data report as CSV...', 'info')}
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
              TOTAL HEADCOUNT
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {headcount.find((h) => h.meal === 'Lunch')?.selected || 185}
            </p>
            <p className="text-xs text-[#1b4d3e] mt-1 font-semibold flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5 text-[#1b4d3e]" /> Tomorrow's Lunch Peak
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PREDICTED MEALS
            </span>
            <p className="text-2xl font-extrabold text-[#1b4d3e] mt-1">
              {headcount.find((h) => h.meal === 'Lunch')?.predicted || 192}
            </p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Forecast (91% Conf.)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              KFC ACTIVE ORDERS
            </span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{activeKfcCount}</p>
            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> Express Pickup Queue
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              WASTAGE REDUCTION
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">-32%</p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Below Target Waste
            </p>
          </div>
        </div>

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
                <LineChart data={wastageTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                </LineChart>
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
