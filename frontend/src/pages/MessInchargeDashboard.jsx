import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  Scale,
  CookingPot,
  Edit,
  Save,
  CheckCircle2,
  Plus,
  Clock,
  ChefHat,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Lock,
  LockOpen,
  ClipboardCheck,
  ImagePlus,
  Trash2
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MEALS = [
  { key: 'Breakfast', menuKey: 'breakfast', icon: '🌅', time: '08:00 AM - 10:00 AM' },
  { key: 'Lunch', menuKey: 'lunch', icon: '☀️', time: '12:30 PM - 02:30 PM' },
  { key: 'Snacks', menuKey: 'snacks', icon: '🍪', time: '04:30 PM - 06:00 PM' },
  { key: 'Dinner', menuKey: 'dinner', icon: '🌙', time: '07:30 PM - 09:30 PM' }
];

const CUTOFF_TIME = '21:00';

// Rough raw-ingredient consumption per diner, keyed by dish keyword.
const PORTION_FACTORS = [
  { match: ['biryani', 'pulao', 'jeera rice', 'steamed rice', 'chawal', 'rice'], unit: 'kg', per: 0.16 },
  { match: ['dal', 'sambar', 'rasam', 'curry', 'gravy'], unit: 'L', per: 0.14 },
  { match: ['paneer', 'sabzi', 'aloo', 'chole', 'rajma', 'kofta', 'veg'], unit: 'kg', per: 0.16 },
  { match: ['roti', 'phulka', 'naan', 'chapati', 'paratha'], unit: 'pcs', per: 3 },
  { match: ['oil', 'ghee', 'butter'], unit: 'kg', per: 0.022 },
  { match: ['tea', 'chai', 'coffee', 'milk'], unit: 'cups', per: 1 },
  { match: ['idli', 'dosa', 'vada', 'poha', 'upma'], unit: 'pcs', per: 2 },
  { match: ['samosa', 'cutlet', 'pakora', 'snack'], unit: 'pcs', per: 2 },
  { match: ['gulab', 'jamun', 'halwa', 'kheer', 'sweet', 'dessert'], unit: 'pcs', per: 1 }
];
const DEFAULT_PORTION = { unit: 'portions', per: 1 };

const getPortionFactor = (dishName) => {
  const lower = (dishName || '').toLowerCase();
  return PORTION_FACTORS.find((f) => f.match.some((m) => lower.includes(m))) || DEFAULT_PORTION;
};

// Downscale an uploaded image to a small JPEG data URL so it survives localStorage.
const fileToDownscaledDataUrl = (file, maxSize = 512, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const TAG_OPTIONS = ['Veg', 'Non-Veg', 'High Protein', 'Jain', 'Dessert', 'Beverage', 'Festive Special'];

export const MessInchargeDashboard = () => {
  const {
    headcount = [],
    menu,
    updateMenu,
    removeMessDish,
    addMessDish,
    updateMessDishImage,
    studentMealPlan,
    addToast,
    blockHeadcount = {},
    blockSentMap = { 'Block D': false, 'Block E': false },
    attendanceRecords = [],
    saveMealAttendance,
    aiForecast,
    aiScenario = 'standard',
    fetchAIForecast,
    aiAnomalies = [],
    resolveAnomaly
  } = useApp();

  const [activeTab, setActiveTab] = useState('Headcount & Cutoff');
  const [isHeadcountLocked, setIsHeadcountLocked] = useState(false);

  // Menu management state
  const [newDishInputs, setNewDishInputs] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });
  const [newDishTags, setNewDishTags] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });
  const [newDishImages, setNewDishImages] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });

  // Post-meal attendance entry state
  const todayIso = new Date().toISOString().split('T')[0];
  const [attendanceDate, setAttendanceDate] = useState(todayIso);
  const [attendanceDrafts, setAttendanceDrafts] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });

  useEffect(() => {
    if (fetchAIForecast) {
      MEALS.forEach((m) => fetchAIForecast(m.key, '2026-10-01', aiScenario));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill the attendance form once per selected date (won't clobber in-progress typing on the 4s poll)
  const prefilledDateRef = useRef(null);
  useEffect(() => {
    if (prefilledDateRef.current === attendanceDate) return;
    if (attendanceRecords.length === 0) return; // wait for first load
    const next = { breakfast: '', lunch: '', snacks: '', dinner: '' };
    MEALS.forEach((m) => {
      const rec = attendanceRecords.find((r) => r.date === attendanceDate && r.meal === m.key);
      if (rec && rec.actualCount != null) next[m.menuKey] = String(rec.actualCount);
    });
    setAttendanceDrafts(next);
    prefilledDateRef.current = attendanceDate;
  }, [attendanceDate, attendanceRecords]);

  const buffer = aiForecast?.bufferPortions || 0;

  const predictedFor = (mealKey) => {
    const row = headcount.find((h) => h.meal === mealKey);
    return row?.predicted ?? null;
  };

  const lockedFor = (menuKey) => {
    const d = blockHeadcount?.['Block D']?.[menuKey];
    const e = blockHeadcount?.['Block E']?.[menuKey];
    if (d == null && e == null) return null;
    return (d || 0) + (e || 0);
  };

  const prepTargetFor = (menuKey, mealKey) => {
    const locked = lockedFor(menuKey);
    if (locked) return locked + buffer;
    const predicted = predictedFor(mealKey);
    if (predicted) return predicted + buffer;
    return aiForecast?.prepTarget || 0;
  };

  const handleAddDish = (menuKey) => {
    const dish = (newDishInputs[menuKey] || '').trim();
    if (!dish) return;
    addMessDish(menuKey, dish, newDishTags[menuKey] || '', newDishImages[menuKey] || '');
    setNewDishInputs((prev) => ({ ...prev, [menuKey]: '' }));
    setNewDishTags((prev) => ({ ...prev, [menuKey]: '' }));
    setNewDishImages((prev) => ({ ...prev, [menuKey]: '' }));
  };

  const handleNewDishImage = async (menuKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      setNewDishImages((prev) => ({ ...prev, [menuKey]: dataUrl }));
    } catch (err) {
      addToast('Could not process that image file.', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handleChangeDishImage = async (menuKey, dishName, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      updateMessDishImage(menuKey, dishName, dataUrl);
    } catch (err) {
      addToast('Could not process that image file.', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handlePublishMenu = () => {
    updateMenu(menu);
    addToast("Tomorrow's menu published to all student portals.", 'success');
  };

  const handleSaveAttendance = async (meal) => {
    const raw = attendanceDrafts[meal.menuKey];
    const actualCount = parseInt(raw, 10);
    if (isNaN(actualCount) || actualCount < 0) {
      addToast(`Enter a valid actual headcount for ${meal.key}.`, 'error');
      return;
    }
    const row = headcount.find((h) => h.meal === meal.key);
    await saveMealAttendance({
      date: attendanceDate,
      day: new Date(`${attendanceDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      meal: meal.key,
      actualCount,
      selectedCount: row?.selected ?? undefined,
      predictedCount: predictedFor(meal.key) ?? undefined
    });
  };

  const unresolvedAnomaliesCount = aiAnomalies.filter((a) => a.status !== 'Resolved').length;

  const tabs = [
    { id: 'Headcount & Cutoff', label: 'Headcount & Cutoff', icon: Scale },
    { id: 'Quantity to Cook', label: 'Quantity to Cook', icon: CookingPot },
    { id: 'Menu Management', label: 'Menu Management', icon: Edit },
    { id: 'Actual Attendance', label: 'Actual Attendance', icon: ClipboardCheck },
    { id: 'Anomaly Alerts', label: 'Anomaly Alerts', icon: AlertTriangle, badge: unresolvedAnomaliesCount, badgeColor: 'bg-rose-500' }
  ];

  const sidebarItems = [
    { isHeader: true, header: 'KITCHEN PLANNING' },
    { id: 'Headcount & Cutoff', label: 'Headcount & Cutoff', icon: Scale },
    { id: 'Quantity to Cook', label: 'Quantity to Cook', icon: CookingPot },
    { id: 'Menu Management', label: 'Menu Management', icon: Edit },
    { isHeader: true, header: 'OPERATIONS' },
    { id: 'Actual Attendance', label: 'Actual Attendance', icon: ClipboardCheck },
    { id: 'Anomaly Alerts', label: 'Anomaly Alerts', icon: AlertTriangle, badge: unresolvedAnomaliesCount, badgeColor: 'bg-rose-500' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]/80 text-[#293749] flex flex-col font-sans">
      <Navbar
        currentRole="Mess Incharge"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#355F97] bg-[#EDF2F9] border border-[#D5E4F8]/70 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-[#355F97]" /> Main Kitchen Hub
                </span>
                <span className="text-xs font-mono font-bold text-[#65748A]">Cutoff at {CUTOFF_TIME}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293749] tracking-tight mt-1">
                Mess Incharge
              </h1>
              <p className="text-xs sm:text-sm text-[#65748A] mt-0.5 font-medium">
                Locked headcount, quantity-to-cook planning, menu management, and post-meal attendance.
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-[#DCE4EF]/90 pb-3 mb-6 text-xs sm:text-sm font-bold">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#355F97] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-[#293749] hover:bg-white bg-[#EDF2F9]/80 border border-[#DCE4EF]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#65748A]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : (tab.badgeColor || 'bg-[#D5E4F8] text-[#355F97]')
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* =====================================================================
              TAB 1: HEADCOUNT & CUTOFF
              ===================================================================== */}
          {activeTab === 'Headcount & Cutoff' && (
            <div className="space-y-6">
              {/* Cutoff banner */}
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-xl border ${isHeadcountLocked ? 'bg-[#EDF2F9] border-[#D5E4F8] text-[#355F97]' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    {isHeadcountLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#293749]">
                      {isHeadcountLocked ? 'Headcount Locked for Kitchen' : 'Headcount Open — Locks at ' + CUTOFF_TIME}
                    </p>
                    <p className="text-[11px] text-[#65748A]">
                      Student selections freeze at {CUTOFF_TIME}; finalized per-block counts drive tomorrow's cooking batch.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {['Block D', 'Block E'].map((b) => (
                    <span
                      key={b}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                        blockSentMap?.[b]
                          ? 'bg-[#EDF2F9] text-[#2B4F80] border-[#D5E4F8]'
                          : 'bg-[#F5F7FA] text-[#65748A] border-[#DCE4EF]'
                      }`}
                    >
                      {b}: {blockSentMap?.[b] ? 'Verified' : 'Pending'}
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      setIsHeadcountLocked(true);
                      addToast('Locked headcount confirmed and sent to the kitchen.', 'success');
                    }}
                    disabled={isHeadcountLocked}
                    className={`font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                      isHeadcountLocked
                        ? 'bg-[#355F97] text-white cursor-default'
                        : 'bg-[#355F97] hover:bg-[#2B4F80] text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {isHeadcountLocked ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isHeadcountLocked ? 'Locked' : 'Confirm & Lock Headcount'}
                  </button>
                </div>
              </div>

              {/* Per-meal, per-block table */}
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                  <div>
                    <h3 className="font-bold text-[#293749] text-base sm:text-lg">Final Locked Headcount per Meal</h3>
                    <p className="text-xs text-[#65748A]">Per-block counts at cutoff, compared against AI predicted turnout</p>
                  </div>
                  <span className="text-xs font-mono text-[#2B4F80] bg-[#D5E4F8] px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto border border-[#D5E4F8]/60">
                    Live Kitchen Sync
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#DCE4EF]/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3">Meal</th>
                        <th className="pb-3">Block D</th>
                        <th className="pb-3">Block E</th>
                        <th className="pb-3">Total Locked</th>
                        <th className="pb-3">AI Predicted Turnout</th>
                        <th className="pb-3 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MEALS.map((meal) => {
                        const d = blockHeadcount?.['Block D']?.[meal.menuKey];
                        const e = blockHeadcount?.['Block E']?.[meal.menuKey];
                        const locked = lockedFor(meal.menuKey);
                        const predicted = predictedFor(meal.key);
                        const variance = locked != null && predicted != null ? predicted - locked : null;
                        return (
                          <tr key={meal.key} className="hover:bg-[#F5F7FA]/80 transition-colors">
                            <td className="py-3.5 font-bold text-[#293749] flex items-center gap-2">
                              <span>{meal.icon}</span>
                              <span>{meal.key}</span>
                            </td>
                            <td className="py-3.5 font-mono font-bold text-[#355F97]">{d ?? '—'}</td>
                            <td className="py-3.5 font-mono font-bold text-[#355F97]">{e ?? '—'}</td>
                            <td className="py-3.5 font-extrabold text-[#293749] font-mono">{locked ?? '—'}</td>
                            <td className="py-3.5 font-semibold text-slate-700 font-mono">{predicted ?? '—'}</td>
                            <td className="py-3.5 text-right">
                              {variance == null ? (
                                <span className="text-slate-400">—</span>
                              ) : (
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                                  variance >= 0 ? 'bg-[#EDF2F9] text-[#2B4F80]' : 'bg-rose-50 text-rose-800'
                                }`}>
                                  {variance >= 0 ? `+${variance}` : variance}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#DCE4EF] font-bold text-[#293749]">
                        <td className="pt-3.5">Total</td>
                        <td className="pt-3.5 font-mono">{MEALS.reduce((s, m) => s + (blockHeadcount?.['Block D']?.[m.menuKey] || 0), 0) || '—'}</td>
                        <td className="pt-3.5 font-mono">{MEALS.reduce((s, m) => s + (blockHeadcount?.['Block E']?.[m.menuKey] || 0), 0) || '—'}</td>
                        <td className="pt-3.5 font-mono">{MEALS.reduce((s, m) => s + (lockedFor(m.menuKey) || 0), 0) || '—'}</td>
                        <td className="pt-3.5 font-mono">{MEALS.reduce((s, m) => s + (predictedFor(m.key) || 0), 0) || '—'}</td>
                        <td className="pt-3.5 text-right text-slate-400">—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: QUANTITY TO COOK
              ===================================================================== */}
          {activeTab === 'Quantity to Cook' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Sparkles className="w-4 h-4 text-[#355F97]" />
                  Suggested quantities scale off the <strong className="text-[#355F97]">locked headcount + {buffer} buffer portions</strong>.
                </div>
                <span className="text-[11px] font-mono font-bold text-[#2B4F80] bg-[#EDF2F9] px-3 py-1.5 rounded-lg border border-[#D5E4F8] shrink-0">
                  Zero Over-Preparation
                </span>
              </div>

              {MEALS.map((meal) => {
                const items = studentMealPlan?.meals?.[meal.menuKey]?.items || [];
                const target = prepTargetFor(meal.menuKey, meal.key);
                return (
                  <div key={meal.key} className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <h3 className="font-bold text-[#293749] text-base flex items-center gap-2">
                        <span>{meal.icon}</span>
                        <span>{meal.key}</span>
                        <span className="text-[11px] font-mono font-normal text-slate-400">({meal.time})</span>
                      </h3>
                      <span className="text-xs font-mono font-bold text-[#355F97] bg-[#EDF2F9] border border-[#D5E4F8] px-2.5 py-1 rounded-lg self-start sm:self-auto">
                        Prep Target: {target || '—'} portions
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No dishes on this menu yet. Add dishes in Menu Management.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-[#DCE4EF]/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                              <th className="pb-2.5">Dish</th>
                              <th className="pb-2.5">Suggested Quantity to Cook</th>
                              <th className="pb-2.5 text-right">Basis</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {items.map((item, idx) => {
                              const factor = getPortionFactor(item.name);
                              const qty = factor.unit === 'portions'
                                ? null
                                : Math.max(1, Math.round(factor.per * (target || 0) * 10) / 10);
                              return (
                                <tr key={`${meal.key}-${idx}`} className="hover:bg-[#F5F7FA]/80 transition-colors">
                                  <td className="py-3 font-semibold text-[#293749]">{item.name}</td>
                                  <td className="py-3 font-mono font-extrabold text-[#355F97]">
                                    {qty == null ? `≈ ${target || '—'} portions` : `${qty} ${factor.unit}`}
                                  </td>
                                  <td className="py-3 text-right text-[11px] font-mono text-[#65748A]">
                                    {factor.unit === 'portions' ? '1 portion / diner' : `${factor.per}${factor.unit === 'pcs' ? ' pcs' : factor.unit === 'cups' ? ' cup' : ' ' + factor.unit} / diner`}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* =====================================================================
              TAB 3: MENU MANAGEMENT
              ===================================================================== */}
          {activeTab === 'Menu Management' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#293749] text-base">Tomorrow's Menu</h3>
                  <p className="text-xs text-[#65748A]">Create or update dishes, add photos, then publish to student portals.</p>
                </div>
                <button
                  onClick={handlePublishMenu}
                  className="bg-[#355F97] hover:bg-[#2B4F80] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5" /> Publish Menu
                </button>
              </div>

              {MEALS.map((meal) => {
                const items = studentMealPlan?.meals?.[meal.menuKey]?.items || [];
                return (
                  <div key={meal.key} className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#293749] text-base flex items-center gap-2">
                        <span>{meal.icon}</span>
                        <span>{meal.key}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({items.length} items)</span>
                      </h3>
                    </div>

                    {/* Dish cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No dishes yet — add one below.</p>
                      ) : (
                        items.map((item, idx) => (
                          <div key={`${meal.key}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#DCE4EF]/90 bg-[#F5F7FA]/60">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border border-[#DCE4EF] bg-white shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#293749] truncate">{item.name}</p>
                              {item.tags && (
                                <p className="text-[10px] text-slate-400 truncate">{item.tags}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <label className="p-1.5 rounded-md text-slate-400 hover:text-[#355F97] hover:bg-[#EDF2F9] cursor-pointer" title="Change image">
                                <ImagePlus className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleChangeDishImage(meal.menuKey, item.name, e)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => removeMessDish(meal.menuKey, item.name)}
                                title={`Remove ${item.name}`}
                                className="p-1.5 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add dish row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-slate-100">
                      <input
                        type="text"
                        placeholder={`Add dish to ${meal.key}...`}
                        value={newDishInputs[meal.menuKey] || ''}
                        onChange={(e) => setNewDishInputs((prev) => ({ ...prev, [meal.menuKey]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddDish(meal.menuKey); }}
                        className="flex-1 text-xs px-2.5 py-2 bg-white border border-[#DCE4EF] rounded-lg focus:outline-none focus:border-[#4573AC] font-medium placeholder:text-slate-400"
                      />
                      <select
                        value={newDishTags[meal.menuKey] || ''}
                        onChange={(e) => setNewDishTags((prev) => ({ ...prev, [meal.menuKey]: e.target.value }))}
                        className="text-xs px-2 py-2 bg-white border border-[#DCE4EF] rounded-lg focus:outline-none focus:border-[#4573AC] font-medium cursor-pointer"
                      >
                        <option value="">Auto tag</option>
                        {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <label className="text-xs font-bold px-3 py-2 rounded-lg border border-[#DCE4EF] bg-white hover:bg-[#F5F7FA] cursor-pointer flex items-center gap-1.5 text-slate-700">
                        <ImagePlus className="w-3.5 h-3.5 text-[#355F97]" />
                        {newDishImages[meal.menuKey] ? 'Image ready' : 'Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleNewDishImage(meal.menuKey, e)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddDish(meal.menuKey)}
                        disabled={!(newDishInputs[meal.menuKey] || '').trim()}
                        className="px-3 py-2 bg-[#EDF2F9] hover:bg-[#355F97] text-[#355F97] hover:text-white border border-[#D5E4F8] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =====================================================================
              TAB 4: ACTUAL ATTENDANCE
              ===================================================================== */}
          {activeTab === 'Actual Attendance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#293749] text-base">Post-Meal Actual Attendance</h3>
                  <p className="text-xs text-[#65748A]">Record the real number of diners after each meal to close the loop and track AI accuracy.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#355F97]" /> Date
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-white border border-[#DCE4EF] rounded-lg focus:outline-none focus:border-[#4573AC] font-medium"
                  />
                </label>
              </div>

              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#DCE4EF]/80 text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3">Meal</th>
                        <th className="pb-3">AI Predicted</th>
                        <th className="pb-3">Actual Diners</th>
                        <th className="pb-3">Saved Variance</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MEALS.map((meal) => {
                        const predicted = predictedFor(meal.key);
                        const rec = attendanceRecords.find((r) => r.date === attendanceDate && r.meal === meal.key);
                        const savedActual = rec?.actualCount;
                        const savedVariance = savedActual != null && predicted != null ? savedActual - predicted : null;
                        return (
                          <tr key={meal.key} className="hover:bg-[#F5F7FA]/80 transition-colors">
                            <td className="py-3.5 font-bold text-[#293749] flex items-center gap-2">
                              <span>{meal.icon}</span>
                              <span>{meal.key}</span>
                            </td>
                            <td className="py-3.5 font-mono font-semibold text-slate-700">{predicted ?? '—'}</td>
                            <td className="py-3.5">
                              <input
                                type="number"
                                min="0"
                                placeholder="—"
                                value={attendanceDrafts[meal.menuKey] ?? ''}
                                onChange={(e) => setAttendanceDrafts((prev) => ({ ...prev, [meal.menuKey]: e.target.value }))}
                                className="w-24 text-xs px-2.5 py-1.5 bg-white border border-[#DCE4EF] rounded-lg focus:outline-none focus:border-[#4573AC] font-mono font-bold"
                              />
                            </td>
                            <td className="py-3.5">
                              {savedActual == null ? (
                                <span className="text-slate-400 text-[11px]">Not recorded</span>
                              ) : (
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                                  savedVariance >= 0 ? 'bg-[#EDF2F9] text-[#2B4F80]' : 'bg-rose-50 text-rose-800'
                                }`}>
                                  {savedActual} ({savedVariance >= 0 ? `+${savedVariance}` : savedVariance})
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleSaveAttendance(meal)}
                                className="px-3 py-1.5 rounded-lg bg-[#355F97] hover:bg-[#2B4F80] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Save
                              </button>
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

          {/* =====================================================================
              TAB 5: ANOMALY ALERTS (kept)
              ===================================================================== */}
          {activeTab === 'Anomaly Alerts' && (
            <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-[#293749] text-base sm:text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    AI Dining Anomalies & Early Risk Alerts
                  </h3>
                  <p className="text-xs text-[#65748A]">
                    Real-time pattern anomaly alerts detected across hostel rooms, KFC food court, and dining halls
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-[#F5F7FA] border border-[#DCE4EF] px-3 py-1 rounded-lg self-start sm:self-auto">
                  {aiAnomalies.length} Total Alerts • {unresolvedAnomaliesCount} Active
                </span>
              </div>

              <div className="space-y-3">
                {aiAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={`p-4 rounded-xl border transition-all ${
                      anomaly.status === 'Resolved'
                        ? 'bg-[#F5F7FA] border-[#DCE4EF]/60 opacity-60'
                        : anomaly.severity === 'high'
                        ? 'bg-rose-50/70 border-rose-200'
                        : anomaly.severity === 'medium'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-[#EDF2F9]/70 border-[#D5E4F8]'
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
                                : 'bg-[#355F97]'
                            }`}
                          ></span>
                          <h4 className="font-bold text-[#293749] text-sm">{anomaly.title}</h4>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#DCE4EF] text-slate-700">
                            {anomaly.scope}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {anomaly.desc || anomaly.description}
                        </p>
                        {anomaly.mitigation && (
                          <p className="text-[11px] text-[#2B4F80] mt-1 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            <strong>Mitigation:</strong> {anomaly.mitigation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 mt-2 sm:mt-0">
                        {anomaly.metricDifference && (
                          <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-md border border-[#DCE4EF]">
                            {anomaly.metricDifference}
                          </span>
                        )}
                        {anomaly.status === 'Resolved' ? (
                          <span className="text-xs font-bold text-slate-400 bg-[#EDF2F9] px-3 py-1 rounded-lg">Resolved</span>
                        ) : (
                          <button
                            onClick={() => resolveAnomaly(anomaly.id)}
                            className="bg-white hover:bg-[#EDF2F9] text-slate-700 border border-slate-300 font-bold px-3 py-1 rounded-lg text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {aiAnomalies.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No anomalies detected. Kitchen operations are within expected variance.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessInchargeDashboard;
