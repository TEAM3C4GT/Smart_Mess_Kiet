import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { useApp, authFetch } from '../context/AppContext';
import {
  Utensils,
  History,
  UtensilsCrossed,
  Bell,
  Clock,
  Flame,
  Check,
  CheckCircle2,
  BellRing,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  X,
  Sparkles,
  Search,
  ArrowRight,
  Lock,
  ShieldCheck,
  Info,
  Trash2
} from 'lucide-react';

export const StudentDashboard = () => {
  const {
    currentUser,
    studentMealPlan,
    toggleStudentMeal,
    confirmStudentMealSelection,
    mealHistory,
    studentNotifications,
    markAllNotificationsRead,
    kfcMenu,
    kfcOrders,
    placeKfcOrder,
    addToast,
    floorMealSheets = []
  } = useApp();

  const [activeTab, setActiveTab] = useState('My Meals');
  const [confirmedAt, setConfirmedAt] = useState(null);

  // KFC store state
  const [selectedKfcCategory, setSelectedKfcCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [sidePanelMode, setSidePanelMode] = useState(null);

  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const [placedOrderToken, setPlacedOrderToken] = useState(() => {
    try {
      return sessionStorage.getItem('smart_mess_placed_kfc_token') || null;
    } catch {
      return null;
    }
  });

  // ---------------------------------------------------------------------------
  // Cutoff lock (configurable; defaults to 21:00 the previous day)
  // ---------------------------------------------------------------------------
  const cutoffTime = studentMealPlan.cutoff || '21:00';
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cutoffDate = useMemo(() => {
    const d = new Date();
    const [h, m] = String(cutoffTime).split(':').map((n) => parseInt(n, 10));
    d.setHours(Number.isFinite(h) ? h : 21, Number.isFinite(m) ? m : 0, 0, 0);
    return d;
  }, [cutoffTime]);

  const isLocked = now >= cutoffDate.getTime();
  const msLeft = Math.max(0, cutoffDate.getTime() - now);
  const countdown = [
    String(Math.floor(msLeft / 3600000)).padStart(2, '0'),
    String(Math.floor((msLeft % 3600000) / 60000)).padStart(2, '0'),
    String(Math.floor((msLeft % 60000) / 1000)).padStart(2, '0')
  ].join(':');

  // AI-suggested default from the last 2 weeks of personal history.
  const aiSuggested = useMemo(() => {
    const recent = (mealHistory || []).slice(-14);
    const keys = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const suggestion = {};
    keys.forEach((k) => {
      const positives = recent.filter((d) => d[k]).length;
      suggestion[k] = recent.length === 0 ? true : positives * 2 >= recent.length;
    });
    return suggestion;
  }, [mealHistory]);

  // A missed cutoff gets an AI-suggested default applied (source: "ai-default").
  const aiDefaultApplied = isLocked && !confirmedAt;

  // ---------------------------------------------------------------------------
  // Personal KFC order history
  // ---------------------------------------------------------------------------
  const studentRoll = currentUser?.rollNo || '23B21A4225';
  const studentStorageKey = `smart_mess_student_kfc_history_${studentRoll}`;

  const [personalHistory, setPersonalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(studentStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const fetchStudentOrders = () => {
      if (studentRoll) {
        authFetch(`/api/kfc/orders/student/${studentRoll}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.orders)) {
              setPersonalHistory(data.orders);
              try {
                localStorage.setItem(studentStorageKey, JSON.stringify(data.orders));
              } catch (e) {}
            }
          })
          .catch(() => {});
      }
    };
    fetchStudentOrders();
    const interval = setInterval(fetchStudentOrders, 3000);
    return () => clearInterval(interval);
  }, [studentRoll, studentStorageKey]);

  const kfcCategories = ['All', 'Burgers', 'Snacks', 'Chicken', 'Combos', 'Rice Bowls', 'Drinks', 'Desserts'];

  const handleCartChange = (itemId, delta) => {
    const key = String(itemId);
    const menuItem = kfcMenu.find((m) => String(m.id) === key);
    if (delta > 0 && menuItem && menuItem.isAvailable === false) {
      addToast(`${menuItem.name} is currently sold out`, 'error');
      return;
    }
    const current = cart[key] || 0;
    const availableStock = menuItem?.stock !== undefined ? menuItem.stock : 20;
    if (delta > 0 && current + delta > availableStock) {
      addToast(`Only ${availableStock} ${menuItem?.name || 'item'} available in stock`, 'warning');
      return;
    }
    setCart((prev) => {
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  };

  useEffect(() => {
    setCart((prevCart) => {
      const itemIds = Object.keys(prevCart);
      if (itemIds.length === 0) return prevCart;
      let removedAny = false;
      const validCart = {};
      for (const id of itemIds) {
        if (kfcMenu.some((m) => String(m.id) === String(id))) validCart[id] = prevCart[id];
        else removedAny = true;
      }
      if (removedAny) {
        addToast('An item in your cart is no longer on the menu and was removed.', 'info');
        return validCart;
      }
      return prevCart;
    });
  }, [kfcMenu]);

  const calculateCartItemsCount = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const calculateCartTotal = () =>
    Object.keys(cart).reduce((sum, id) => {
      const item = kfcMenu.find((m) => String(m.id) === String(id));
      return sum + (item ? item.price * cart[id] : 0);
    }, 0);

  const handleClearCart = () => {
    setCart({});
    addToast('Cart cleared', 'info');
  };

  const handlePlaceOrder = async () => {
    const items = Object.keys(cart)
      .map((id) => {
        const item = kfcMenu.find((m) => String(m.id) === String(id));
        return item ? { name: item.name, qty: cart[id], price: item.price } : null;
      })
      .filter(Boolean);

    if (items.length === 0) return;
    const totalAmount = calculateCartTotal();
    const createdOrder = await placeKfcOrder(items, totalAmount);
    if (createdOrder?.token) {
      setPlacedOrderToken(createdOrder.token);
      try {
        sessionStorage.setItem('smart_mess_placed_kfc_token', createdOrder.token);
      } catch (e) {}
      setPersonalHistory((prev) => {
        const updated = [createdOrder, ...prev.filter((o) => o.token !== createdOrder.token)];
        try {
          localStorage.setItem(studentStorageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
    setCart({});
    setSidePanelMode('history');
  };

  const studentOrdersHistory = useMemo(() => {
    const studentNameLower = (currentUser?.name || '').toLowerCase();
    const roll = (currentUser?.rollNo || '').toLowerCase();
    const liveMatches = kfcOrders.filter(
      (o) =>
        (placedOrderToken && (o.token === placedOrderToken || o.id === placedOrderToken || o.orderId === placedOrderToken)) ||
        (o.studentRoll && roll && o.studentRoll.toLowerCase() === roll) ||
        (o.studentName && o.studentName.toLowerCase() === studentNameLower) ||
        String(o.token || '').includes(currentUser?.rollNo?.slice(-4) || '___')
    );
    const merged = [...liveMatches];
    personalHistory.forEach((histOrd) => {
      const existingIdx = merged.findIndex((m) => m.token === histOrd.token || m.id === histOrd.id || m.orderId === histOrd.orderId);
      if (existingIdx === -1) merged.push(histOrd);
      else merged[existingIdx] = { ...histOrd, ...merged[existingIdx] };
    });
    return merged;
  }, [kfcOrders, placedOrderToken, currentUser, personalHistory]);

  const filteredStudentHistory = useMemo(() => {
    return studentOrdersHistory.filter((order) => {
      const matchesStatus =
        historyStatusFilter === 'All'
          ? true
          : historyStatusFilter === 'Active'
          ? order.status === 'Pending' || order.status === 'Preparing' || order.status === 'Ready'
          : order.status === historyStatusFilter;
      const query = historySearchQuery.toLowerCase().trim();
      const matchesQuery =
        query === '' ||
        String(order.token || '').toLowerCase().includes(query) ||
        (order.items || []).some((item) => (item.name || '').toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [studentOrdersHistory, historyStatusFilter, historySearchQuery]);

  const activeOrder = useMemo(() => {
    if (placedOrderToken) {
      const match = kfcOrders.find(
        (o) => (o.token === placedOrderToken || o.id === placedOrderToken || o.orderId === placedOrderToken) && o.status !== 'Cancelled'
      );
      if (match) return match;
    }
    const studentNameLower = (currentUser?.name || '').toLowerCase();
    const roll = (currentUser?.rollNo || '').toLowerCase();
    return (
      kfcOrders.find(
        (o) =>
          ((o.studentRoll && roll && o.studentRoll.toLowerCase() === roll) ||
            (o.studentName && o.studentName.toLowerCase() === studentNameLower)) &&
          ['Pending', 'Preparing', 'Ready', 'Collected'].includes(o.status)
      ) || null
    );
  }, [placedOrderToken, kfcOrders, currentUser]);

  const getStageNumber = (status) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Preparing':
        return 2;
      case 'Ready':
        return 3;
      case 'Collected':
        return 4;
      default:
        return 1;
    }
  };

  const currentOrderStage = activeOrder ? getStageNumber(activeOrder.status) : 0;
  const selectedMealsCount = Object.values(studentMealPlan.selections).filter(Boolean).length;

  const filteredKfcItems = kfcMenu.filter((item) => {
    if (selectedKfcCategory === 'All') return true;
    return item.category.toLowerCase() === selectedKfcCategory.toLowerCase();
  });

  const confirmSelection = () => {
    if (isLocked) return;
    confirmStudentMealSelection();
    setConfirmedAt(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#293749] flex flex-col font-sans">
      <Navbar currentRole="Student" activeStudentTab={activeTab} onStudentTabChange={setActiveTab} />

      <div className="md:hidden flex items-center justify-between overflow-x-auto gap-1 px-4 py-2.5 bg-white border-b border-[#DCE4EF]/80 scrollbar-none sticky top-14 z-20">
        {[
          { id: 'My Meals', label: 'My Meals', icon: Utensils },
          { id: 'History', label: 'History', icon: History },
          { id: 'KFC', label: 'KFC', icon: UtensilsCrossed },
          { id: 'Alerts', label: 'Alerts', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                isActive ? 'bg-[#D5E4F8] text-[#355F97] font-bold border border-[#D5E4F8]' : 'text-slate-600 hover:text-[#293749]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-gradient-to-r from-[#EDF2F9] via-[#EDF2F9]/40 to-slate-50 border border-[#D5E4F8]/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#355F97] text-[#D5E4F8] flex items-center justify-center font-extrabold text-lg shadow-xs">
              {(currentUser?.name ? currentUser.name.charAt(0) : 'S').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#293749] tracking-tight">
                  Welcome, {currentUser?.name || 'Student'}
                </h2>
                {currentUser?.rollNo && (
                  <span className="text-xs font-mono font-bold bg-[#355F97] text-[#D5E4F8] px-2.5 py-0.5 rounded-md">
                    {currentUser.rollNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {currentUser?.badge || 'KIET Hostel Resident'} • Select tomorrow's meals & order KFC express without waiting.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B4F80] bg-[#D5E4F8]/70 px-3 py-1.5 rounded-xl border border-[#D5E4F8]/80">
              <Sparkles className="w-3.5 h-3.5 text-[#2F5488]" />
              <span>Active Student Portal</span>
            </span>
          </div>
        </div>

        {/* TAB 1: MY MEALS */}
        {activeTab === 'My Meals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">MENU FOR</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293749] tracking-tight mt-0.5">{studentMealPlan.date}</h1>
                <p className="text-xs sm:text-sm text-[#65748A] mt-1 font-medium">{studentMealPlan.dateSubtitle}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/70">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{studentMealPlan.streak}-day streak</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-xs ${
                    isLocked ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-700 bg-white border-[#DCE4EF]'
                  }`}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{isLocked ? 'Selections Locked' : `Cutoff in ${countdown}`}</span>
                </span>
              </div>
            </div>

            {aiDefaultApplied && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-amber-900">Cutoff passed — AI-suggested default applied</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#355F97] bg-[#D5E4F8] border border-[#A9C3E4]/70 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> source: ai-default
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Based on your last 2-week dining pattern:{' '}
                      {Object.entries(aiSuggested)
                        .filter(([, v]) => v)
                        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join(', ') || 'no meals'}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLocked && confirmedAt && (
              <div className="bg-[#EDF2F9] border border-[#D5E4F8] rounded-2xl p-3.5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#355F97]" />
                <p className="text-xs font-semibold text-[#2B4F80]">Your selections were confirmed before the cutoff and are locked in.</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-[#EDF2F9] via-[#EDF2F9] to-white border border-[#D5E4F8]/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#355F97] text-white flex items-center justify-center shrink-0 shadow-xs text-xl">👨‍🍳</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#293749] text-sm sm:text-base">Chef Ramesh • Main Mess Kitchen</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#2B4F80] bg-[#D5E4F8]/70 border border-[#A9C3E4]/70 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#2F5488]" />
                      {floorMealSheets.some((s) => s.status === 'Confirmed by Kitchen') ? 'Kitchen Cooking Confirmed' : 'Menu Published & Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {floorMealSheets.some((s) => s.status === 'Confirmed by Kitchen')
                      ? 'Floor requisitions verified. Batch cooking underway according to student opt-in counts.'
                      : `Tomorrow's dishes finalized by Mess Incharge. Meal choices open until ${cutoffTime} tonight.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs text-[#65748A]">
                <span className="bg-white/80 border border-[#DCE4EF]/80 px-2.5 py-1.5 rounded-xl font-bold text-slate-700">🍽️ Live Menu Sync Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => {
                const meal = studentMealPlan.meals[mealKey];
                const isSelected = studentMealPlan.selections[mealKey];
                return (
                  <div key={mealKey} className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 shadow-xs transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] border border-[#DCE4EF]/70 flex items-center justify-center text-slate-700 text-lg">
                            {mealKey === 'breakfast' && '🌅'}
                            {mealKey === 'lunch' && '☀️'}
                            {mealKey === 'snacks' && '🍪'}
                            {mealKey === 'dinner' && '🌙'}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#293749] text-base leading-tight">{meal.title}</h3>
                            <span className="text-xs text-slate-400 font-medium block">{meal.optionsCount}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => toggleStudentMeal(mealKey)}
                          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                            isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          } ${isSelected ? 'bg-[#355F97]' : 'bg-slate-200'}`}
                        >
                          <span className={`w-5 h-5 rounded-full bg-white block shadow-xs transition-transform transform ${isSelected ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3.5">
                        {(!meal?.items || meal.items.length === 0) ? (
                          <div className="py-4 text-center text-xs text-slate-400 font-medium bg-[#F5F7FA]/70 rounded-xl border border-dashed border-[#DCE4EF]">
                            No dishes published for this meal yet.
                          </div>
                        ) : (
                          meal.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-[#EDF2F9] text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">🍽️</div>
                              )}
                              <div className="overflow-hidden">
                                <h4 className="text-sm font-semibold text-[#293749] truncate">{item.name}</h4>
                                <p className="text-xs text-slate-400 font-medium">{item.tags}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold text-[#293749]">
                  {selectedMealsCount} {selectedMealsCount === 1 ? 'meal' : 'meals'} selected for tomorrow
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Submits all four meals at once to the Main Mess Kitchen.</p>
              </div>
              <button
                type="button"
                disabled={isLocked}
                onClick={confirmSelection}
                className={`text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all self-stretch sm:self-auto text-center flex items-center justify-center gap-2 ${
                  isLocked ? 'bg-[#EDF2F9] text-slate-400 border border-[#DCE4EF] cursor-not-allowed' : 'bg-[#355F97] hover:bg-[#2B4F80] text-white cursor-pointer active:scale-95'
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-[#A9C3E4]" />}
                <span>{isLocked ? 'Selections Locked' : 'Confirm Selection'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KFC */}
        {activeTab === 'KFC' && (
          <div className="space-y-6 pb-20">
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md min-h-[140px] sm:min-h-[170px] flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 sm:px-10 py-6">
              <img
                src="https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=1200&auto=format&fit=crop&q=80"
                alt="KFC Fried Chicken"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>

              <div className="relative z-10 max-w-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/90 font-bold block flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  CAMPUS FOOD COURT
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-1 leading-tight">
                  Crispy. Hot. <span className="text-[#e4002b]">Right now.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Pay cash at counter • Live token status</p>
              </div>

              <div className="relative z-10 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSidePanelMode('cart')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cart ({calculateCartItemsCount()})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidePanelMode('history')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <History className="w-3.5 h-3.5 text-[#A9C3E4]" />
                  <span>Order History ({studentOrdersHistory.length})</span>
                </button>
              </div>
            </div>

            {activeOrder && (
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">TOKEN</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeOrder.status === 'Ready'
                            ? 'bg-[#e4002b] animate-ping'
                            : activeOrder.status === 'Preparing'
                            ? 'bg-amber-500 animate-pulse'
                            : activeOrder.status === 'Collected'
                            ? 'bg-[#4573AC]'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#293749] tracking-tight font-mono">#{activeOrder.token}</p>
                    <p className="text-xs text-[#65748A] font-medium mt-0.5">
                      For: <span className="font-semibold text-slate-700">{activeOrder.studentName}</span> • {activeOrder.room}
                    </p>
                  </div>

                  <div className="flex-1 max-w-md mx-auto w-full px-2 py-1">
                    <div className="relative">
                      <div className="absolute left-4 right-4 top-3.5 h-1 bg-[#EDF2F9] rounded-full -z-0"></div>
                      <div
                        className="absolute left-4 top-3.5 h-1 bg-[#355F97] rounded-full -z-0 transition-all duration-500"
                        style={{ width: currentOrderStage === 1 ? '0%' : currentOrderStage === 2 ? '33%' : currentOrderStage === 3 ? '66%' : 'calc(100% - 32px)' }}
                      ></div>
                      <div className="relative z-10 flex items-center justify-between">
                        {['Placed', 'Preparing', 'Ready', 'Collected'].map((label, i) => {
                          const stage = i + 1;
                          const reached = currentOrderStage >= stage;
                          const isReadyStep = label === 'Ready' && currentOrderStage === 3;
                          return (
                            <div key={label} className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all ${
                                  reached
                                    ? isReadyStep
                                      ? 'bg-[#e4002b] text-white ring-4 ring-rose-200 animate-bounce'
                                      : 'bg-[#355F97] text-white'
                                    : 'bg-white border-2 border-slate-300 text-slate-400 text-xs font-bold'
                                }`}
                              >
                                {reached && !isReadyStep ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : reached ? <BellRing className="w-3.5 h-3.5 text-white" /> : stage}
                              </div>
                              <span className={`text-[10px] font-bold mt-1 font-mono ${reached ? (isReadyStep ? 'text-[#e4002b] font-black' : 'text-[#355F97]') : 'text-slate-400'}`}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="self-start md:self-center">
                    {activeOrder.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Order Received • In Queue</span>
                      </span>
                    )}
                    {activeOrder.status === 'Preparing' && (
                      <span className="inline-flex items-center gap-1.5 bg-[#EDF2F9] text-[#2B4F80] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D5E4F8] shadow-2xs">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-pulse" />
                        <span>Kitchen is Preparing</span>
                      </span>
                    )}
                    {activeOrder.status === 'Ready' && (
                      <span className="inline-flex items-center gap-1.5 bg-rose-50 text-[#e4002b] text-xs font-black px-4 py-2 rounded-full border border-rose-300 shadow-sm animate-pulse">
                        <CheckCircle2 className="w-4 h-4 text-[#e4002b]" />
                        <span>Ready for pickup! • Counter 01</span>
                      </span>
                    )}
                    {activeOrder.status === 'Collected' && (
                      <span className="inline-flex items-center gap-1.5 bg-[#EDF2F9] text-[#355F97] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D5E4F8] shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#355F97]" />
                        <span>Order Collected & Settled</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 flex-wrap">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#355F97] shrink-0" />
                    <span className="font-semibold text-[#293749]">{activeOrder.items?.map((i) => `${i.qty}x ${i.name}`).join(', ')}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono font-extrabold text-[#293749]">₹{activeOrder.totalAmount}.00</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#65748A] font-mono text-[11px]">{activeOrder.orderTime}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#65748A] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Pay cash at counter • Show token
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {kfcCategories.map((cat) => {
                const isSelected = selectedKfcCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedKfcCategory(cat)}
                    className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      isSelected ? 'bg-[#e4002b] text-white shadow-sm' : 'bg-white border border-[#DCE4EF] text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredKfcItems.map((item) => {
                const qty = cart[String(item.id)] || 0;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-[#DCE4EF]/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div className="h-44 w-full bg-[#EDF2F9] overflow-hidden relative flex items-center justify-center">
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                          <span className="bg-[#C63352] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">Sold Out</span>
                        </div>
                      )}
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className={`w-full h-full object-cover transition-transform duration-300 ${!item.isAvailable ? 'grayscale' : 'hover:scale-105'}`} />
                      ) : (
                        <span className="text-6xl">{item.image || '🍗'}</span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">{item.category}</span>
                        {item.isAvailable && item.stock !== undefined && item.stock <= 5 && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded">Only {item.stock} left</span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#293749] text-sm mt-0.5">{item.name}</h3>

                      <div className="flex items-center justify-between mt-3 pt-2">
                        <span className="text-base font-extrabold text-[#293749]">₹{item.price}</span>
                        {!item.isAvailable ? (
                          <button disabled className="bg-[#EDF2F9] text-slate-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#DCE4EF] cursor-not-allowed">Sold Out</button>
                        ) : qty === 0 ? (
                          <button onClick={() => handleCartChange(item.id, 1)} className="bg-[#e4002b] hover:bg-[#c90026] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-xs transition-all cursor-pointer">Add</button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleCartChange(item.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-[#EDF2F9] cursor-pointer">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-[#293749] w-4 text-center">{qty}</span>
                            <button onClick={() => handleCartChange(item.id, 1)} className="w-7 h-7 rounded-lg bg-[#e4002b] text-white flex items-center justify-center hover:bg-[#c90026] cursor-pointer shadow-xs">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5 items-end">
              <button
                type="button"
                onClick={() => setSidePanelMode('cart')}
                className="group bg-white hover:bg-[#F5F7FA] border border-[#DCE4EF]/90 shadow-lg hover:shadow-xl rounded-2xl p-2.5 sm:px-3 sm:py-2.5 flex items-center gap-2.5 transition-all cursor-pointer hover:border-rose-300 text-slate-800 active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#e4002b] flex items-center justify-center relative">
                  <ShoppingCart className="w-4 h-4" />
                  {calculateCartItemsCount() > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#e4002b] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                      {calculateCartItemsCount()}
                    </span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block leading-tight">Canteen</span>
                  <span className="text-xs font-black text-[#293749] block leading-tight">Cart</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidePanelMode('history')}
                className="group bg-white hover:bg-[#F5F7FA] border border-[#DCE4EF]/90 shadow-lg hover:shadow-xl rounded-2xl p-2.5 sm:px-3 sm:py-2.5 flex items-center gap-2.5 transition-all cursor-pointer hover:border-[#A9C3E4] text-slate-800 active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EDF2F9] text-[#355F97] flex items-center justify-center relative">
                  <History className="w-4 h-4" />
                  {studentOrdersHistory.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#355F97] text-white text-[10px] font-black flex items-center justify-center">
                      {studentOrdersHistory.length}
                    </span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block leading-tight">Canteen</span>
                  <span className="text-xs font-black text-[#293749] block leading-tight">Orders ({studentOrdersHistory.length})</span>
                </div>
              </button>
            </div>

            {sidePanelMode !== null && (
              <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in" onClick={() => setSidePanelMode(null)}>
                <div onClick={(e) => e.stopPropagation()} className="bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 w-full max-w-md">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-[#F5F7FA]/70">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#DCE4EF] shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setSidePanelMode('cart')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          sidePanelMode === 'cart' ? 'bg-[#e4002b] text-white shadow-xs' : 'text-slate-600 hover:text-[#293749] hover:bg-[#EDF2F9]'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Cart</span>
                        {calculateCartItemsCount() > 0 && (
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${sidePanelMode === 'cart' ? 'bg-white text-[#e4002b]' : 'bg-rose-100 text-[#e4002b]'}`}>
                            {calculateCartItemsCount()}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSidePanelMode('history')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          sidePanelMode === 'history' ? 'bg-[#355F97] text-white shadow-xs' : 'text-slate-600 hover:text-[#293749] hover:bg-[#EDF2F9]'
                        }`}
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Orders</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${sidePanelMode === 'history' ? 'bg-white text-[#355F97]' : 'bg-[#D5E4F8] text-[#355F97]'}`}>
                          {studentOrdersHistory.length}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSidePanelMode(null)}
                      className="w-8 h-8 rounded-full bg-white border border-[#DCE4EF] hover:bg-[#EDF2F9] text-slate-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {sidePanelMode === 'cart' ? (
                      <div className="flex flex-col justify-between h-full overflow-hidden p-5 sm:p-6">
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold text-[#293749] flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#e4002b]" />
                                <span>Your Cart</span>
                              </h3>
                              <span className="text-xs font-bold text-[#65748A] font-mono">({calculateCartItemsCount()} items)</span>
                            </div>
                            {calculateCartItemsCount() > 0 && (
                              <button type="button" onClick={handleClearCart} className="text-xs font-bold text-slate-400 hover:text-[#C63352] flex items-center gap-1 cursor-pointer transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Clear all</span>
                              </button>
                            )}
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {calculateCartItemsCount() === 0 ? (
                              <div className="py-16 text-center text-slate-400">
                                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#e4002b] mx-auto flex items-center justify-center mb-3">
                                  <ShoppingBag className="w-7 h-7" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">Your cart is currently empty</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Browse the KFC menu items and click "Add" to start building your order.</p>
                              </div>
                            ) : (
                              Object.keys(cart).map((id) => {
                                const item = kfcMenu.find((m) => String(m.id) === String(id));
                                if (!item) return null;
                                const qty = cart[id];
                                return (
                                  <div key={id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-[#F5F7FA]/50 hover:bg-[#F5F7FA] transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                      {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-[#DCE4EF] shrink-0" />
                                      ) : (
                                        <div className="w-12 h-12 rounded-xl bg-[#EDF2F9] flex items-center justify-center text-2xl shrink-0">{item.image || '🍗'}</div>
                                      )}
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-[#293749] truncate">{item.name}</h4>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                          ₹{item.price} × {qty} = <span className="text-slate-800 font-bold">₹{item.price * qty}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button type="button" onClick={() => handleCartChange(item.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-[#EDF2F9] cursor-pointer">
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-xs font-bold text-[#293749] w-4 text-center">{qty}</span>
                                      <button type="button" onClick={() => handleCartChange(item.id, 1)} className="w-7 h-7 rounded-lg bg-[#e4002b] text-white flex items-center justify-center hover:bg-[#c90026] shadow-xs cursor-pointer">
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3 mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#65748A] font-medium">Total to Pay</span>
                            <span className="text-lg font-black text-[#e4002b] font-mono">₹{calculateCartTotal()}.00</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Pay cash at counter • Show token on pickup
                          </p>
                          <button
                            type="button"
                            disabled={calculateCartItemsCount() === 0}
                            onClick={handlePlaceOrder}
                            className={`w-full font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                              calculateCartItemsCount() > 0 ? 'bg-[#e4002b] hover:bg-[#c90026] text-white active:scale-98' : 'bg-[#EDF2F9] text-slate-400 cursor-not-allowed border border-[#DCE4EF]'
                            }`}
                          >
                            <span>Place Canteen Order</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between h-full overflow-hidden p-5 sm:p-6">
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <div className="pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold text-[#293749] flex items-center gap-2">
                                <History className="w-5 h-5 text-[#355F97]" />
                                <span>Canteen Orders History</span>
                              </h3>
                              <span className="text-xs font-bold text-[#355F97] bg-[#EDF2F9] px-2.5 py-0.5 rounded-full font-mono">{studentOrdersHistory.length} Orders</span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search by token, items..."
                                value={historySearchQuery}
                                onChange={(e) => setHistorySearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DCE4EF] text-xs focus:outline-none focus:ring-1 focus:ring-[#355F97]"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {['All', 'Active', 'Collected'].map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => setHistoryStatusFilter(f)}
                                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    historyStatusFilter === f ? 'bg-[#355F97] text-white shadow-2xs' : 'bg-[#EDF2F9] text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                            {filteredStudentHistory.length === 0 ? (
                              <div className="py-16 text-center text-slate-400">
                                <p className="text-sm font-bold text-slate-700">No orders found</p>
                                <p className="text-xs text-slate-400 mt-1">Orders placed will appear here with live tracking.</p>
                              </div>
                            ) : (
                              filteredStudentHistory.map((order) => (
                                <div key={order.token || order.id} className="p-3.5 rounded-2xl border border-[#DCE4EF]/90 bg-white shadow-2xs">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-sm font-mono text-[#293749] bg-[#EDF2F9] px-2.5 py-0.5 rounded-lg">#{order.token}</span>
                                      <span className="text-[11px] text-slate-400 font-mono">{order.orderTime}</span>
                                    </div>
                                    <span
                                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                        order.status === 'Ready'
                                          ? 'bg-rose-100 text-[#e4002b] animate-pulse'
                                          : order.status === 'Preparing'
                                          ? 'bg-[#EDF2F9] text-[#2B4F80]'
                                          : order.status === 'Pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-[#D5E4F8] text-[#2B4F80]'
                                      }`}
                                    >
                                      {order.status === 'Ready' ? <BellRing className="w-3 h-3" /> : order.status === 'Preparing' ? <Flame className="w-3 h-3" /> : order.status === 'Pending' ? <Clock className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                      <span>{order.status}</span>
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-700 font-medium py-1">
                                    {(order.items || []).map((i) => `${i.qty}x ${i.name}`).join(', ')}
                                  </div>
                                  <div className="pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-sm font-black text-[#293749] font-mono">₹{order.totalAmount}.00</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 text-center">
                          <span className="text-xs text-slate-400 font-medium">Live updates from Campus KFC Counter</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'History' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293749] tracking-tight">Meal History</h1>
              <p className="text-xs sm:text-sm text-[#65748A] mt-1 font-medium flex items-center gap-1.5">
                <span>Your last 8 days</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-800">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  {studentMealPlan.streak}-day streak
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {mealHistory.map((day) => (
                <div key={day.id} className="bg-white rounded-2xl border border-[#DCE4EF]/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
                  <div>
                    <h3 className="font-bold text-[#293749] text-sm sm:text-base">{day.date}</h3>
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">{day.dateCode}</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    {[
                      { key: 'breakfast', label: 'Breakfast' },
                      { key: 'lunch', label: 'Lunch' },
                      { key: 'snacks', label: 'Snacks' },
                      { key: 'dinner', label: 'Dinner' }
                    ].map((m) => {
                      const isEaten = day[m.key];
                      return (
                        <div key={m.key} className="flex items-center gap-1.5 text-xs font-semibold">
                          {isEaten ? (
                            <div className="w-4 h-4 rounded-full bg-[#D5E4F8] text-[#2F5488] flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                          )}
                          <span className={isEaten ? 'text-slate-800' : 'text-slate-400'}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ALERTS */}
        {activeTab === 'Alerts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">INBOX</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#293749] tracking-tight mt-0.5">Notifications</h1>
                <p className="text-xs sm:text-sm text-[#65748A] mt-1 font-medium">
                  {studentNotifications.filter((n) => !n.read).length} unread • {studentNotifications.length} total
                </p>
              </div>
              <button
                onClick={markAllNotificationsRead}
                className="bg-white hover:bg-[#F5F7FA] border border-[#DCE4EF] text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#355F97]" />
                <span>Mark all read</span>
              </button>
            </div>

            {studentNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#DCE4EF]/90 py-16 px-6 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF2F9] text-[#355F97] flex items-center justify-center mx-auto mb-3 text-2xl">📬</div>
                <h4 className="font-bold text-slate-800 text-sm">Inbox is completely clear!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You will receive real-time updates when Chef Ramesh publishes menus or when your KFC order is ready.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentNotifications.map((notif) => {
                  const isMess = notif.type === 'mess' || notif.type === 'kitchen';
                  const isKfc = notif.type === 'kfc';
                  const isPrincipal = notif.type === 'principal';
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        !notif.read ? 'bg-white border-[#A9C3E4]/80 shadow-xs' : 'bg-[#F5F7FA]/70 border-[#DCE4EF]/80 opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-2xs ${
                            isMess ? 'bg-[#EDF2F9] border border-[#D5E4F8] text-[#355F97]' : isKfc ? 'bg-amber-50 border border-amber-200 text-amber-700' : isPrincipal ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' : 'bg-[#EDF2F9] border border-[#D5E4F8] text-[#355F97]'
                          }`}
                        >
                          {isMess ? '👨‍🍳' : isKfc ? '🍗' : isPrincipal ? '🏛️' : '🏢'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-bold text-[#293749] text-sm sm:text-base leading-tight">{notif.title}</h4>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-[#4573AC] shrink-0 animate-pulse"></span>}
                            <span
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isMess ? 'bg-[#EDF2F9] text-[#2B4F80] border border-[#D5E4F8]' : isKfc ? 'bg-amber-50 text-amber-800 border border-amber-200' : isPrincipal ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-[#EDF2F9] text-[#2B4F80] border border-[#D5E4F8]'
                              }`}
                            >
                              {isMess ? 'Mess Kitchen' : isKfc ? 'KFC Express' : isPrincipal ? 'Principal Office' : 'Room & Floor Lead'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">{notif.message}</p>
                          <div className="flex items-center gap-3 mt-2.5 text-[11px] font-mono text-slate-400">
                            <span>From: {notif.sender || 'Mess Incharge'}</span>
                            <span>•</span>
                            <span>{notif.time || 'Just now'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
