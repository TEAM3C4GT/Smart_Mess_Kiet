import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import {
  Utensils,
  History,
  UtensilsCrossed,
  Bell,
  Clock,
  Flame,
  Check,
  CheckCircle,
  CheckCircle2,
  BellRing,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Columns,
  RotateCcw,
  Search,
  Trash2,
  ArrowRight,
  Receipt,
  Calendar,
  Star,
  AlertCircle
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
    clearAllStudentNotifications,
    kfcMenu,
    kfcOrders,
    placeKfcOrder,
    cancelKfcOrder,
    submitOrderFeedback,
    addToast,
    floorMealSheets = []
  } = useApp();

  // Active top navigation tab: 'My Meals' | 'History' | 'KFC' | 'Alerts'
  const [activeTab, setActiveTab] = useState('My Meals');

  // Dietary requirement selector state
  const [dietaryOption, setDietaryOption] = useState('Standard Student Dining');
  const [customDietaryInput, setCustomDietaryInput] = useState('');
  const [showCustomDietary, setShowCustomDietary] = useState(false);

  // KFC Store State
  const [selectedKfcCategory, setSelectedKfcCategory] = useState('All');
  const [cart, setCart] = useState({}); // Cart starts empty

  // Live timer for cancellation countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Order Feedback Modal state
  const [feedbackTargetOrder, setFeedbackTargetOrder] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState([]);

  // Side-over drawer state: null (closed) | 'cart' | 'history' | 'both'
  const [sidePanelMode, setSidePanelMode] = useState(null);
  const isCartOpen = sidePanelMode === 'cart' || sidePanelMode === 'both';
  const isHistoryOpen = sidePanelMode === 'history' || sidePanelMode === 'both';

  // Student Order History filters
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const [placedOrderToken, setPlacedOrderToken] = useState(() => {
    try {
      return sessionStorage.getItem('smart_mess_placed_kfc_token') || null;
    } catch {
      return null;
    }
  });

  // Persistent student canteen order history
  const studentRoll = currentUser?.rollNo || '23B21A4225';
  const studentStorageKey = `smart_mess_student_kfc_history_${studentRoll}`;

  const [personalHistory, setPersonalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(studentStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'ORD-HIST-01',
        token: 'KFC-D101-84',
        studentName: currentUser?.name || 'NITHIN',
        room: currentUser?.badge?.split(' • ').slice(1).join(' • ') || 'Room D-101 • Hostel Block D',
        items: [
          { name: 'Zinger Burger', qty: 2, price: 179 },
          { name: 'Pepsi 500ml', qty: 1, price: 60 }
        ],
        totalAmount: 418,
        orderTime: 'Today, 10:45 AM',
        status: 'Collected',
        date: 'Today'
      },
      {
        id: 'ORD-HIST-02',
        token: 'KFC-D101-12',
        studentName: currentUser?.name || 'NITHIN',
        room: currentUser?.badge?.split(' • ').slice(1).join(' • ') || 'Room D-101 • Hostel Block D',
        items: [
          { name: 'Chicken Popcorn', qty: 1, price: 149 },
          { name: 'French Fries', qty: 1, price: 99 }
        ],
        totalAmount: 248,
        orderTime: 'Yesterday, 04:30 PM',
        status: 'Collected',
        date: 'Yesterday'
      }
    ];
  });

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

  // Automatically sanitize cart if any item was removed from KFC menu by staff
  useEffect(() => {
    setCart((prevCart) => {
      const itemIds = Object.keys(prevCart);
      if (itemIds.length === 0) return prevCart;
      let removedAny = false;
      const validCart = {};
      for (const id of itemIds) {
        if (kfcMenu.some((m) => String(m.id) === String(id))) {
          validCart[id] = prevCart[id];
        } else {
          removedAny = true;
        }
      }
      if (removedAny) {
        addToast('An item in your cart is no longer on the menu and was removed.', 'info');
        return validCart;
      }
      return prevCart;
    });
  }, [kfcMenu]);

  const calculateCartItemsCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const calculateCartTotal = () => {
    return Object.keys(cart).reduce((sum, id) => {
      const item = kfcMenu.find((m) => String(m.id) === String(id));
      return sum + (item ? item.price * cart[id] : 0);
    }, 0);
  };

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
      } catch (e) {
        console.warn(e);
      }
      setPersonalHistory((prev) => {
        const updated = [createdOrder, ...prev.filter((o) => o.token !== createdOrder.token)];
        try {
          localStorage.setItem(studentStorageKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
    setCart({});
    // Keep panel in history or both so student sees active token in their history list immediately
    setSidePanelMode((prev) => (prev === 'both' ? 'both' : 'history'));
  };

  // Reorder items from past order straight into cart
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    setCart((prev) => {
      const copy = { ...prev };
      order.items.forEach((item) => {
        const menuItem = kfcMenu.find((m) => m.name === item.name);
        if (menuItem) {
          const key = String(menuItem.id);
          copy[key] = (copy[key] || 0) + (item.qty || 1);
        }
      });
      return copy;
    });
    addToast(`Added ${order.items.map((i) => `${i.qty || 1}x ${i.name}`).join(', ')} to cart!`, 'success');
  };

  // Merge live kfcOrders with personal history to ensure status transitions update live
  const studentOrdersHistory = useMemo(() => {
    const studentNameLower = (currentUser?.name || '').toLowerCase();
    const liveMatches = kfcOrders.filter(
      (o) =>
        (placedOrderToken && o.token === placedOrderToken) ||
        (o.studentName && o.studentName.toLowerCase() === studentNameLower) ||
        String(o.token || '').includes(currentUser?.rollNo?.slice(-4) || '225')
    );

    const merged = [...liveMatches];
    personalHistory.forEach((histOrd) => {
      const existingIdx = merged.findIndex((m) => m.token === histOrd.token || m.id === histOrd.id);
      if (existingIdx === -1) {
        merged.push(histOrd);
      } else {
        merged[existingIdx] = { ...histOrd, ...merged[existingIdx] };
      }
    });

    return merged;
  }, [kfcOrders, placedOrderToken, currentUser, personalHistory]);

  // Filtered student history for search & status tabs
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

  // Active order: find by placedOrderToken OR find any current active order for this student in queue
  const activeOrder = useMemo(() => {
    if (placedOrderToken) {
      const match = kfcOrders.find(
        (o) => o.token === placedOrderToken && !['Collected', 'Cancelled'].includes(o.status)
      );
      if (match) return match;
    }
    const studentNameLower = (currentUser?.name || '').toLowerCase();
    const studentRoll = currentUser?.rollNo;
    return (
      kfcOrders.find(
        (o) =>
          ((o.studentName && o.studentName.toLowerCase() === studentNameLower) ||
           (o.studentRoll && o.studentRoll === studentRoll) ||
           String(o.token || '').includes(studentRoll?.slice(-4) || '___')) &&
          ['Pending', 'Preparing', 'Ready'].includes(o.status)
      ) || null
    );
  }, [placedOrderToken, kfcOrders, currentUser]);

  const getOrderCancelWindow = (order) => {
    if (!order) return { canCancel: false, secondsLeft: 0 };
    if (['Ready', 'Collected', 'Cancelled'].includes(order.status)) {
      return { canCancel: false, secondsLeft: 0 };
    }
    const placedTime = order.placedAt || order.timestamp || null;
    if (!placedTime) return { canCancel: true, secondsLeft: 120 };
    const elapsed = now - placedTime;
    const remaining = Math.max(0, Math.ceil((120000 - elapsed) / 1000));
    return { canCancel: remaining > 0, secondsLeft: remaining };
  };

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

  // Selected meals count in My Meals tab
  const selectedMealsCount = Object.values(studentMealPlan.selections).filter(Boolean).length;

  // Filter KFC Items
  const filteredKfcItems = kfcMenu.filter((item) => {
    if (selectedKfcCategory === 'All') return true;
    return item.category.toLowerCase() === selectedKfcCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentRole="Student"
        activeStudentTab={activeTab}
        onStudentTabChange={setActiveTab}
      />

      {/* Mobile Top Navigation Pills (shown only on small screens where header tabs are hidden) */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto gap-1 px-4 py-2.5 bg-white border-b border-slate-200/80 scrollbar-none sticky top-14 z-20">
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Student Greeting Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1b4d3e] text-emerald-100 flex items-center justify-center font-extrabold text-lg shadow-xs">
              {(currentUser?.name ? currentUser.name.charAt(0) : 'S').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome, {currentUser?.name || 'Student'}! 👋
                </h2>
                {currentUser?.rollNo && (
                  <span className="text-xs font-mono font-bold bg-[#1b4d3e] text-emerald-100 px-2.5 py-0.5 rounded-md">
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
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Active Student Portal</span>
            </span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: MY MEALS (Matching Reference Screenshot 3)                    */}
        {/* ==================================================================== */}
        {activeTab === 'My Meals' && (
          <div className="space-y-6">
            {/* Header with Title and Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-slate-400 block">
                  MENU FOR
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {studentMealPlan.date}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  {studentMealPlan.dateSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/70">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{studentMealPlan.streak}-day streak</span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cutoff {studentMealPlan.cutoff}</span>
                </span>
              </div>
            </div>

            {/* Mess Kitchen Preparation & Confirmation Status Strip */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1b4d3e] text-white flex items-center justify-center shrink-0 shadow-xs text-xl">
                  👨‍🍳
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      Chef Ramesh • Main Mess Kitchen
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-300/70 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      {floorMealSheets.some((s) => s.status === 'Confirmed by Kitchen')
                        ? 'Kitchen Cooking Confirmed'
                        : 'Menu Published & Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {floorMealSheets.some((s) => s.status === 'Confirmed by Kitchen')
                      ? "Floor requisitions verified. Batch cooking underway according to student opt-in counts."
                      : "Tomorrow's dishes finalized by Mess Incharge. Meal choices open until 10:00 PM tonight."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs text-slate-500">
                <span className="bg-white/80 border border-slate-200/80 px-2.5 py-1.5 rounded-xl font-bold text-slate-700">
                  🍽️ Live Menu Sync Active
                </span>
              </div>
            </div>

            {/* 2x2 Grid of Meal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => {
                const meal = studentMealPlan.meals[mealKey];
                const isSelected = studentMealPlan.selections[mealKey];

                return (
                  <div
                    key={mealKey}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Meal Icon, Title, Options & Toggle Switch */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-700 text-lg">
                            {mealKey === 'breakfast' && '🌅'}
                            {mealKey === 'lunch' && '☀️'}
                            {mealKey === 'snacks' && '🍪'}
                            {mealKey === 'dinner' && '🌙'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base leading-tight">
                              {meal.title}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium block">
                              {meal.optionsCount}
                            </span>
                          </div>
                        </div>

                        {/* Modern Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => toggleStudentMeal(mealKey)}
                          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer focus:outline-none ${
                            isSelected ? 'bg-[#1b4d3e]' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full bg-white block shadow-xs transition-transform transform ${
                              isSelected ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Dish Items List */}
                      <div className="space-y-3.5">
                        {(!meal?.items || meal.items.length === 0) ? (
                          <div className="py-4 text-center text-xs text-slate-400 font-medium bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                            No dishes published for this meal yet.
                          </div>
                        ) : (
                          meal.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                                  🍽️
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <h4 className="text-sm font-semibold text-slate-900 truncate">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium">
                                  {item.tags}
                                </p>
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

            {/* Bottom Bar: Selection Summary, Dietary Requisition & Confirmation */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMealsCount} {selectedMealsCount === 1 ? 'meal' : 'meals'} selected for tomorrow
                    </p>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Direct Kitchen Requisition
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Your preferences will be transmitted directly to Chef Ramesh in the Main Mess Kitchen
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const finalNote = showCustomDietary && customDietaryInput.trim() ? customDietaryInput.trim() : dietaryOption;
                    confirmStudentMealSelection(finalNote);
                  }}
                  className="bg-[#1b4d3e] hover:bg-[#163f33] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer self-stretch sm:self-auto text-center active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Confirm Selection to Kitchen</span>
                </button>
              </div>

              {/* Special Dietary / Allergy Request Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Special Dietary Note / Allergy Request to Mess Incharge:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomDietary(!showCustomDietary)}
                    className="text-[11px] font-mono text-[#1b4d3e] hover:underline font-bold cursor-pointer"
                  >
                    {showCustomDietary ? '← Pick standard options' : '+ Type custom note'}
                  </button>
                </div>

                {!showCustomDietary ? (
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Standard Student Dining',
                      'Jain Meal (Strict Veg, No Onion/Garlic)',
                      'High Protein / Extra Curd',
                      'Egg / Food Allergy Notice',
                      'Late Dining (Lab / Project Work)'
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDietaryOption(opt)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer ${
                          dietaryOption === opt
                            ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Strict Jain meal, egg allergy, late dinner pick up at 9:30 PM..."
                      value={customDietaryInput}
                      onChange={(e) => setCustomDietaryInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: KFC (Matching Reference Screenshots 2 & 5)                    */}
        {/* ==================================================================== */}
        {activeTab === 'KFC' && (
          <div className="space-y-6 pb-20">
            {/* Top Food Court Banner */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md min-h-[140px] sm:min-h-[170px] flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 sm:px-10 py-6">
              {/* Background photography */}
              <img
                src="https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=1200&auto=format&fit=crop&q=80"
                alt="KFC Fried Chicken"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>

              {/* Overlay Content */}
              <div className="relative z-10 max-w-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/90 font-bold block flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  CAMPUS FOOD COURT
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-1 leading-tight">
                  Crispy. Hot.{' '}
                  <span className="text-[#e4002b]">Right now.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Pay cash at counter • Live token status
                </p>
              </div>

              {/* Quick Side Panel Access Actions */}
              <div className="relative z-10 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSidePanelMode('cart')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  title="Open Canteen Cart"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cart ({calculateCartItemsCount()})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidePanelMode('history')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  title="Open Canteen Orders History"
                >
                  <History className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Order History ({studentOrdersHistory.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidePanelMode('both')}
                  className="bg-[#e4002b] hover:bg-[#c90026] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/30 active:scale-95"
                  title="Open Cart and Order History Side by Side"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side by Side</span>
                </button>
              </div>
            </div>

            {/* Active Token Tracker Card - Only pops up when student placed an active order */}
            {activeOrder && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Token Identifier */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                        TOKEN
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeOrder.status === 'Ready'
                            ? 'bg-[#e4002b] animate-ping'
                            : activeOrder.status === 'Preparing'
                            ? 'bg-amber-500 animate-pulse'
                            : activeOrder.status === 'Collected'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                      #{activeOrder.token}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      For: <span className="font-semibold text-slate-700">{activeOrder.studentName}</span> • {activeOrder.room}
                    </p>
                  </div>

                  {/* Middle: Stepper 4 stages */}
                  <div className="flex-1 max-w-md mx-auto w-full px-2 py-1">
                    <div className="relative">
                      {/* Background Track */}
                      <div className="absolute left-4 right-4 top-3.5 h-1 bg-slate-100 rounded-full -z-0"></div>
                      
                      {/* Active Fill Track */}
                      <div
                        className="absolute left-4 top-3.5 h-1 bg-[#1b4d3e] rounded-full -z-0 transition-all duration-500"
                        style={{
                          width:
                            currentOrderStage === 1
                              ? '0%'
                              : currentOrderStage === 2
                              ? '33%'
                              : currentOrderStage === 3
                              ? '66%'
                              : 'calc(100% - 32px)'
                        }}
                      ></div>

                      <div className="relative z-10 flex items-center justify-between">
                        {/* Step 1: Placed */}
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-[10px] font-bold text-[#1b4d3e] mt-1 font-mono">
                            Placed
                          </span>
                        </div>

                        {/* Step 2: Preparing */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all ${
                              currentOrderStage >= 2
                                ? 'bg-[#1b4d3e] text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400 text-xs font-bold'
                            }`}
                          >
                            {currentOrderStage > 2 ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : currentOrderStage === 2 ? (
                              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                            ) : (
                              '2'
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold mt-1 font-mono ${
                              currentOrderStage >= 2 ? 'text-[#1b4d3e]' : 'text-slate-400'
                            }`}
                          >
                            Preparing
                          </span>
                        </div>

                        {/* Step 3: Ready */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all ${
                              currentOrderStage >= 3
                                ? currentOrderStage === 3
                                  ? 'bg-[#e4002b] text-white ring-4 ring-rose-200 animate-bounce'
                                  : 'bg-[#1b4d3e] text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400 text-xs font-bold'
                            }`}
                          >
                            {currentOrderStage > 3 ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : currentOrderStage === 3 ? (
                              <BellRing className="w-3.5 h-3.5 text-white" />
                            ) : (
                              '3'
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold mt-1 font-mono ${
                              currentOrderStage >= 3
                                ? currentOrderStage === 3
                                  ? 'text-[#e4002b] font-black'
                                  : 'text-[#1b4d3e]'
                                : 'text-slate-400'
                            }`}
                          >
                            Ready
                          </span>
                        </div>

                        {/* Step 4: Collected */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all ${
                              currentOrderStage >= 4
                                ? 'bg-[#1b4d3e] text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400 text-xs font-bold'
                            }`}
                          >
                            {currentOrderStage >= 4 ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              '4'
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold mt-1 font-mono ${
                              currentOrderStage >= 4 ? 'text-[#1b4d3e]' : 'text-slate-400'
                            }`}
                          >
                            Collected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Dynamic Status badge */}
                  <div className="self-start md:self-center">
                    {activeOrder.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Order Received • In Queue</span>
                      </span>
                    )}
                    {activeOrder.status === 'Preparing' && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400 animate-pulse" />
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
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#1b4d3e] text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Order Collected & Settled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Item Details Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 flex-wrap">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#1b4d3e] shrink-0" />
                    <span className="font-semibold text-slate-900">
                      {activeOrder.items?.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      ₹{activeOrder.totalAmount}.00
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {activeOrder.orderTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Checklist #6 & #7: Cancel Order button within 2 minutes */}
                    {(() => {
                      const { canCancel, secondsLeft } = getOrderCancelWindow(activeOrder);
                      if (canCancel) {
                        return (
                          <button
                            type="button"
                            onClick={() => cancelKfcOrder(activeOrder.id || activeOrder.token)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                            title="Cancel order and restore stock to canteen within 2 minutes"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Cancel Order ({Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')})</span>
                          </button>
                        );
                      }
                      return null;
                    })()}

                    {/* Checklist #6: Rate & Review button if Collected */}
                    {activeOrder.status === 'Collected' && !activeOrder.feedback && (
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackTargetOrder(activeOrder);
                          setFeedbackRating(5);
                          setFeedbackComment('');
                          setSelectedFeedbackTags([]);
                        }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    {activeOrder.status === 'Collected' && activeOrder.feedback && (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>Rated {activeOrder.feedback.rating}/5</span>
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Pay cash at counter • Show token
                    </span>
                    <button
                      type="button"
                      onClick={() => setSidePanelMode('history')}
                      className="text-[#1b4d3e] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View History</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {kfcCategories.map((cat) => {
                const isSelected = selectedKfcCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedKfcCategory(cat)}
                    className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#e4002b] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Food Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredKfcItems.map((item) => {
                const qty = cart[String(item.id)] || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    {/* Item Image with Sold Out Overlay */}
                    <div className="h-44 w-full bg-slate-100 overflow-hidden relative flex items-center justify-center">
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                            Sold Out
                          </span>
                        </div>
                      )}

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            !item.isAvailable ? 'grayscale' : 'hover:scale-105'
                          }`}
                        />
                      ) : (
                        <span className="text-6xl">{item.image || '🍗'}</span>
                      )}
                    </div>

                    {/* Item Meta & Actions */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                          {item.category}
                        </span>
                        {item.isAvailable && item.stock !== undefined && item.stock <= 5 && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded">
                            Only {item.stock} left
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                        {item.name}
                      </h3>

                      <div className="flex items-center justify-between mt-3 pt-2">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{item.price}
                        </span>

                        {!item.isAvailable ? (
                          <button
                            disabled
                            className="bg-slate-100 text-slate-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200 cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        ) : qty === 0 ? (
                          <button
                            onClick={() => handleCartChange(item.id, 1)}
                            className="bg-[#e4002b] hover:bg-[#c90026] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-xs transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCartChange(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleCartChange(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#e4002b] text-white flex items-center justify-center hover:bg-[#c90026] cursor-pointer shadow-xs"
                            >
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

            {/* Floating Quick Dock on Right Edge: Cart, Orders History, and Side-by-Side Dual View */}
            <div className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5 items-end">
              {/* Cart Launcher */}
              <button
                type="button"
                onClick={() => setSidePanelMode('cart')}
                className="group bg-white hover:bg-slate-50 border border-slate-200/90 shadow-lg hover:shadow-xl rounded-2xl p-2.5 sm:px-3 sm:py-2.5 flex items-center gap-2.5 transition-all cursor-pointer hover:border-rose-300 text-slate-800 active:scale-95"
                title="Open Canteen Cart"
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
                  <span className="text-xs font-black text-slate-900 block leading-tight">Cart</span>
                </div>
              </button>

              {/* Order History Launcher */}
              <button
                type="button"
                onClick={() => setSidePanelMode('history')}
                className="group bg-white hover:bg-slate-50 border border-slate-200/90 shadow-lg hover:shadow-xl rounded-2xl p-2.5 sm:px-3 sm:py-2.5 flex items-center gap-2.5 transition-all cursor-pointer hover:border-emerald-300 text-slate-800 active:scale-95"
                title="Open Canteen Orders History"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center relative">
                  <History className="w-4 h-4" />
                  {studentOrdersHistory.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1b4d3e] text-white text-[10px] font-black flex items-center justify-center">
                      {studentOrdersHistory.length}
                    </span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block leading-tight">Canteen</span>
                  <span className="text-xs font-black text-slate-900 block leading-tight">Orders ({studentOrdersHistory.length})</span>
                </div>
              </button>

              {/* Side-by-Side Dual View Launcher */}
              <button
                type="button"
                onClick={() => setSidePanelMode('both')}
                className="group bg-[#1b4d3e] hover:bg-[#143d31] text-white shadow-lg hover:shadow-xl rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
                title="Open Cart & Orders Side by Side"
              >
                <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center">
                  <Columns className="w-4 h-4" />
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-200/80 block leading-tight">Dual View</span>
                  <span className="text-xs font-black text-white block leading-tight">Side by Side</span>
                </div>
              </button>
            </div>

            {/* Bottom Floating Bar with Cart, History, and Side by Side */}
            {calculateCartItemsCount() > 0 && (
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-xl px-4 sm:px-5 py-3 flex items-center gap-3 sm:gap-5 animate-fade-in flex-wrap justify-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-[#e4002b] flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {calculateCartItemsCount()} {calculateCartItemsCount() === 1 ? 'Item' : 'Items'}
                    </span>
                    <span className="text-xs font-extrabold text-[#e4002b] block leading-tight">
                      ₹{calculateCartTotal()}.00
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSidePanelMode('cart')}
                    className="bg-[#e4002b] hover:bg-[#c90026] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    Review Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidePanelMode('history')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="View Past Orders History"
                  >
                    <History className="w-3.5 h-3.5 text-[#1b4d3e]" />
                    <span className="hidden sm:inline">Orders</span> History ({studentOrdersHistory.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidePanelMode('both')}
                    className="bg-[#1b4d3e] hover:bg-[#143d31] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="Open Cart and Order History Side by Side"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Side by Side</span>
                  </button>
                </div>
              </div>
            )}

            {/* Slide-over Right Canteen Hub: Cart & Order History (Single & Side-by-Side Dual View) */}
            {sidePanelMode !== null && (
              <div
                className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in"
                onClick={() => setSidePanelMode(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 transition-all ${
                    sidePanelMode === 'both'
                      ? 'w-full max-w-4xl lg:max-w-5xl'
                      : 'w-full max-w-md'
                  }`}
                >
                  {/* Hub Universal Top Bar with View Toggles */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        id="hub-tab-cart"
                        type="button"
                        onClick={() => setSidePanelMode('cart')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          sidePanelMode === 'cart'
                            ? 'bg-[#e4002b] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Cart</span>
                        {calculateCartItemsCount() > 0 && (
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                              sidePanelMode === 'cart' ? 'bg-white text-[#e4002b]' : 'bg-rose-100 text-[#e4002b]'
                            }`}
                          >
                            {calculateCartItemsCount()}
                          </span>
                        )}
                      </button>

                      <button
                        id="hub-tab-history"
                        type="button"
                        onClick={() => setSidePanelMode('history')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          sidePanelMode === 'history'
                            ? 'bg-[#1b4d3e] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Orders</span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                            sidePanelMode === 'history' ? 'bg-white text-[#1b4d3e]' : 'bg-emerald-100 text-[#1b4d3e]'
                          }`}
                        >
                          {studentOrdersHistory.length}
                        </span>
                      </button>

                      <button
                        id="hub-tab-both"
                        type="button"
                        onClick={() => setSidePanelMode('both')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          sidePanelMode === 'both'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="View Cart and Order History Side by Side"
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Side by Side</span>
                        <span className="sm:hidden">Both</span>
                      </button>
                    </div>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setSidePanelMode(null)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Close Panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hub Body: Single View or Dual Column Side-by-Side */}
                  <div className="flex-1 overflow-hidden">
                    {sidePanelMode === 'both' ? (
                      /* ================= SIDE BY SIDE DUAL VIEW ================= */
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 h-full">
                        {/* Column 1: Cart */}
                        <div className="flex flex-col justify-between h-full overflow-hidden p-4 sm:p-5">
                          <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <ShoppingCart className="w-4 h-4 text-[#e4002b]" />
                                  <span>Your Cart</span>
                                </h3>
                                <span className="text-xs font-bold text-slate-500 font-mono">
                                  ({calculateCartItemsCount()} items)
                                </span>
                              </div>
                              {calculateCartItemsCount() > 0 && (
                                <button
                                  type="button"
                                  onClick={handleClearCart}
                                  className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Clear</span>
                                </button>
                              )}
                            </div>

                            {/* Cart Items List */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                              {calculateCartItemsCount() === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#e4002b] mx-auto flex items-center justify-center mb-2.5">
                                    <ShoppingBag className="w-6 h-6" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-700">Your cart is currently empty</p>
                                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                                    Click "Add" on any food item or "Reorder" from your order history.
                                  </p>
                                </div>
                              ) : (
                                Object.keys(cart).map((id) => {
                                  const item = kfcMenu.find((m) => String(m.id) === String(id));
                                  if (!item) return null;
                                  const qty = cart[id];
                                  return (
                                    <div
                                      key={id}
                                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {item.imageUrl ? (
                                          <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                                            {item.image || '🍗'}
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-bold text-slate-900 truncate">
                                            {item.name}
                                          </h4>
                                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                            ₹{item.price} × {qty} = <span className="text-slate-700 font-bold">₹{item.price * qty}</span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleCartChange(item.id, -1)}
                                          className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold text-slate-900 w-4 text-center">
                                          {qty}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleCartChange(item.id, 1)}
                                          className="w-6 h-6 rounded-md bg-[#e4002b] text-white flex items-center justify-center hover:bg-[#c90026] shadow-xs cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Cart Footer Checkout Bar */}
                          <div className="pt-3 border-t border-slate-100 space-y-2.5 mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Subtotal</span>
                              <span className="font-extrabold text-slate-900 font-mono">₹{calculateCartTotal()}.00</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Campus Subsidized Delivery</span>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                FREE (₹0)
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
                              <span className="text-xs font-bold text-slate-900 uppercase">Total to Pay</span>
                              <span className="text-base font-black text-[#e4002b] font-mono">
                                ₹{calculateCartTotal()}.00
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Pay cash at counter • Show token on pickup
                            </p>

                            <button
                              type="button"
                              disabled={calculateCartItemsCount() === 0}
                              onClick={handlePlaceOrder}
                              className={`w-full font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                                calculateCartItemsCount() > 0
                                  ? 'bg-[#e4002b] hover:bg-[#c90026] text-white shadow-rose-600/20 active:scale-98'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              <span>Place Canteen Order</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Column 2: Order History */}
                        <div className="flex flex-col justify-between h-full overflow-hidden p-4 sm:p-5">
                          <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <History className="w-4 h-4 text-[#1b4d3e]" />
                                  <span>Canteen Orders History</span>
                                </h3>
                                <span className="text-xs font-bold text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                                  {studentOrdersHistory.length}
                                </span>
                              </div>
                            </div>

                            {/* Search and Filter Row */}
                            <div className="space-y-2 mb-3">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="Search token, items..."
                                  value={historySearchQuery}
                                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#1b4d3e]"
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                {['All', 'Active', 'Collected'].map((f) => (
                                  <button
                                    key={f}
                                    type="button"
                                    onClick={() => setHistoryStatusFilter(f)}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                      historyStatusFilter === f
                                        ? 'bg-[#1b4d3e] text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Order Cards List */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                              {filteredStudentHistory.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                  <p className="text-xs font-bold text-slate-700">No matching orders found</p>
                                  <p className="text-[11px] text-slate-400 mt-1">Orders placed will appear here with live tracking.</p>
                                </div>
                              ) : (
                                filteredStudentHistory.map((order) => (
                                  <div
                                    key={order.token || order.id}
                                    className={`p-3 rounded-xl border transition-all ${
                                      order.status === 'Ready'
                                        ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-400/20'
                                        : order.status === 'Preparing'
                                        ? 'border-blue-300 bg-blue-50/20'
                                        : order.status === 'Pending'
                                        ? 'border-amber-300 bg-amber-50/20'
                                        : 'border-slate-200/90 bg-white shadow-2xs'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-xs font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                          #{order.token}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {order.orderTime}
                                        </span>
                                      </div>

                                      {/* Status Pill */}
                                      <span
                                        className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                          order.status === 'Ready'
                                            ? 'bg-rose-100 text-[#e4002b] animate-pulse'
                                            : order.status === 'Preparing'
                                            ? 'bg-blue-100 text-blue-800'
                                            : order.status === 'Pending'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                      >
                                        {order.status === 'Ready' ? (
                                          <BellRing className="w-2.5 h-2.5" />
                                        ) : order.status === 'Preparing' ? (
                                          <Flame className="w-2.5 h-2.5" />
                                        ) : order.status === 'Pending' ? (
                                          <Clock className="w-2.5 h-2.5" />
                                        ) : (
                                          <Check className="w-2.5 h-2.5" />
                                        )}
                                        <span>{order.status}</span>
                                      </span>
                                    </div>

                                    {/* Items List */}
                                    <div className="text-xs text-slate-700 font-medium py-1">
                                      {(order.items || []).map((i) => `${i.qty}x ${i.name}`).join(', ')}
                                    </div>

                                    {/* Total, Cancel, Feedback, Reorder Button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 flex-wrap gap-2">
                                      <span className="text-xs font-black text-slate-900 font-mono">
                                        ₹{order.totalAmount}.00
                                      </span>

                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {(() => {
                                          const { canCancel, secondsLeft } = getOrderCancelWindow(order);
                                          if (canCancel) {
                                            return (
                                              <button
                                                type="button"
                                                onClick={() => cancelKfcOrder(order.id || order.token)}
                                                className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                                title="Cancel order within 2 minutes"
                                              >
                                                <Trash2 className="w-2.5 h-2.5 text-rose-600" />
                                                <span>Cancel ({Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')})</span>
                                              </button>
                                            );
                                          }
                                          return null;
                                        })()}

                                        {order.status === 'Collected' && !order.feedback && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setFeedbackTargetOrder(order);
                                              setFeedbackRating(5);
                                              setFeedbackComment('');
                                              setSelectedFeedbackTags([]);
                                            }}
                                            className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                          >
                                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                            <span>Rate</span>
                                          </button>
                                        )}

                                        {order.feedback && (
                                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                            {order.feedback.rating}/5
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => handleReorder(order)}
                                          className="text-[11px] font-bold text-[#1b4d3e] hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                          title="Add these items to your cart"
                                        >
                                          <RotateCcw className="w-3 h-3 text-[#1b4d3e]" />
                                          <span>Reorder</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Order History Summary Note */}
                          <div className="pt-3 border-t border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-medium">
                              Tokens automatically sync with live counter status
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : sidePanelMode === 'cart' ? (
                      /* ================= CART ONLY VIEW ================= */
                      <div className="flex flex-col justify-between h-full overflow-hidden p-5 sm:p-6">
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#e4002b]" />
                                <span>Your Cart</span>
                              </h3>
                              <span className="text-xs font-bold text-slate-500 font-mono">
                                ({calculateCartItemsCount()} items)
                              </span>
                            </div>
                            {calculateCartItemsCount() > 0 && (
                              <button
                                type="button"
                                onClick={handleClearCart}
                                className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Clear all</span>
                              </button>
                            )}
                          </div>

                          {/* Cart Items List */}
                          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                            {calculateCartItemsCount() === 0 ? (
                              <div className="py-16 text-center text-slate-400">
                                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#e4002b] mx-auto flex items-center justify-center mb-3">
                                  <ShoppingBag className="w-7 h-7" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">Your cart is currently empty</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                  Browse the KFC menu items and click "Add" to start building your order.
                                </p>
                              </div>
                            ) : (
                              Object.keys(cart).map((id) => {
                                const item = kfcMenu.find((m) => String(m.id) === String(id));
                                if (!item) return null;
                                const qty = cart[id];
                                return (
                                  <div
                                    key={id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {item.imageUrl ? (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                                          {item.image || '🍗'}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">
                                          {item.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                          ₹{item.price} × {qty} = <span className="text-slate-800 font-bold">₹{item.price * qty}</span>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleCartChange(item.id, -1)}
                                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-xs font-bold text-slate-900 w-4 text-center">
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCartChange(item.id, 1)}
                                        className="w-7 h-7 rounded-lg bg-[#e4002b] text-white flex items-center justify-center hover:bg-[#c90026] shadow-xs cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Cart Footer */}
                        <div className="pt-4 border-t border-slate-100 space-y-3 mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Subtotal</span>
                            <span className="font-extrabold text-slate-900 font-mono">₹{calculateCartTotal()}.00</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Hostel Campus Delivery</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              FREE (₹0)
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
                            <span className="text-xs font-bold text-slate-900 uppercase">Total to Pay</span>
                            <span className="text-lg font-black text-[#e4002b] font-mono">
                              ₹{calculateCartTotal()}.00
                            </span>
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
                              calculateCartItemsCount() > 0
                                ? 'bg-[#e4002b] hover:bg-[#c90026] text-white shadow-rose-600/20 active:scale-98'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                          >
                            <span>Place Canteen Order</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ================= ORDER HISTORY ONLY VIEW ================= */
                      <div className="flex flex-col justify-between h-full overflow-hidden p-5 sm:p-6">
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-[#1b4d3e]" />
                                <span>Canteen Orders History</span>
                              </h3>
                              <span className="text-xs font-bold text-[#1b4d3e] bg-emerald-50 px-2.5 py-0.5 rounded-full font-mono">
                                {studentOrdersHistory.length} Orders
                              </span>
                            </div>
                          </div>

                          {/* Search and Filters */}
                          <div className="space-y-2 mb-3">
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search by token, items..."
                                value={historySearchQuery}
                                onChange={(e) => setHistorySearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#1b4d3e]"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              {['All', 'Active', 'Collected'].map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => setHistoryStatusFilter(f)}
                                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    historyStatusFilter === f
                                      ? 'bg-[#1b4d3e] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Orders List */}
                          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                            {filteredStudentHistory.length === 0 ? (
                              <div className="py-16 text-center text-slate-400">
                                <p className="text-sm font-bold text-slate-700">No orders found</p>
                                <p className="text-xs text-slate-400 mt-1">Orders placed will appear here with live tracking.</p>
                              </div>
                            ) : (
                              filteredStudentHistory.map((order) => (
                                <div
                                  key={order.token || order.id}
                                  className={`p-3.5 rounded-2xl border transition-all ${
                                    order.status === 'Ready'
                                      ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-400/20'
                                      : order.status === 'Preparing'
                                      ? 'border-blue-300 bg-blue-50/20'
                                      : order.status === 'Pending'
                                      ? 'border-amber-300 bg-amber-50/20'
                                      : 'border-slate-200/90 bg-white shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-sm font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                                        #{order.token}
                                      </span>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        {order.orderTime}
                                      </span>
                                    </div>

                                    {/* Status Badge */}
                                    <span
                                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                        order.status === 'Ready'
                                          ? 'bg-rose-100 text-[#e4002b] animate-pulse'
                                          : order.status === 'Preparing'
                                          ? 'bg-blue-100 text-blue-800'
                                          : order.status === 'Pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {order.status === 'Ready' ? (
                                        <BellRing className="w-3 h-3" />
                                      ) : order.status === 'Preparing' ? (
                                        <Flame className="w-3 h-3" />
                                      ) : order.status === 'Pending' ? (
                                        <Clock className="w-3 h-3" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      <span>{order.status}</span>
                                    </span>
                                  </div>

                                  {/* Items */}
                                  <div className="text-xs text-slate-700 font-medium py-1">
                                    {(order.items || []).map((i) => `${i.qty}x ${i.name}`).join(', ')}
                                  </div>

                                   {/* Footer Total, Cancel, Feedback & Reorder Button */}
                                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2 flex-wrap gap-2">
                                    <span className="text-sm font-black text-slate-900 font-mono">
                                      ₹{order.totalAmount}.00
                                    </span>

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {(() => {
                                        const { canCancel, secondsLeft } = getOrderCancelWindow(order);
                                        if (canCancel) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => cancelKfcOrder(order.id || order.token)}
                                              className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                              title="Cancel order within 2 minutes"
                                            >
                                              <Trash2 className="w-3 h-3 text-rose-600" />
                                              <span>Cancel ({Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')})</span>
                                            </button>
                                          );
                                        }
                                        return null;
                                      })()}

                                      {order.status === 'Collected' && !order.feedback && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFeedbackTargetOrder(order);
                                            setFeedbackRating(5);
                                            setFeedbackComment('');
                                            setSelectedFeedbackTags([]);
                                          }}
                                          className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-200 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                        >
                                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                          <span>Rate & Review</span>
                                        </button>
                                      )}

                                      {order.feedback && (
                                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 flex items-center gap-1">
                                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                          <span>Rated {order.feedback.rating}/5</span>
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleReorder(order)}
                                        className="text-xs font-bold text-[#1b4d3e] hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                        title="Add these items to your cart"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5 text-[#1b4d3e]" />
                                        <span>Reorder to Cart</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Order History Footer */}
                        <div className="pt-3 border-t border-slate-100 text-center">
                          <span className="text-xs text-slate-400 font-medium">
                            Live updates from Campus KFC Counter
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: HISTORY (Matching Reference Screenshot 4)                     */}
        {/* ==================================================================== */}
        {activeTab === 'History' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Meal History
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                <span>Your last 8 days</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-800">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  0-day streak
                </span>
              </p>
            </div>

            {/* List of 8-day Meal History Cards */}
            <div className="space-y-3">
              {mealHistory.map((day) => (
                <div
                  key={day.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300"
                >
                  {/* Left: Date */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {day.date}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">
                      {day.dateCode}
                    </span>
                  </div>

                  {/* Right: 4 Meal status checks */}
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
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                          )}
                          <span className={isEaten ? 'text-slate-800' : 'text-slate-400'}>
                            {m.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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

        {/* ==================================================================== */}
        {/* TAB 4: ALERTS (Matching Reference Screenshot 1)                      */}
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
                  {studentNotifications.length} unread • {studentNotifications.length} total
                </p>
              </div>

              <button
                onClick={markAllNotificationsRead}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark all read</span>
              </button>
            </div>

            {/* Notifications List */}
            {studentNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 py-16 px-6 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center mx-auto mb-3 text-2xl">
                  📬
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Inbox is completely clear!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No pending notices. You will receive real-time updates when Chef Ramesh publishes menus or when your KFC order is ready.
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
                        !notif.read
                          ? 'bg-white border-emerald-300/80 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 opacity-90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-2xs ${
                              isMess
                                ? 'bg-emerald-50 border border-emerald-200 text-[#1b4d3e]'
                                : isKfc
                                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                : isPrincipal
                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                                : 'bg-blue-50 border border-blue-200 text-blue-700'
                            }`}
                          >
                            {isMess ? '👨‍🍳' : isKfc ? '🍗' : isPrincipal ? '🏛️' : '🏢'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                              )}
                              <span
                                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isMess
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : isKfc
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : isPrincipal
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {isMess
                                  ? 'Mess Kitchen'
                                  : isKfc
                                  ? 'KFC Express'
                                  : isPrincipal
                                  ? 'Principal Office'
                                  : 'Room & Floor Lead'}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-3 mt-2.5 text-[11px] font-mono text-slate-400">
                              <span>From: {notif.sender || 'Mess Incharge'}</span>
                              <span>•</span>
                              <span>{notif.time || 'Just now'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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

        {/* Checklist #6: Customer Feedback Modal (Star Rating + Review Comments) */}
        {feedbackTargetOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#e4002b] bg-rose-50 px-2 py-0.5 rounded">
                    KFC Express Feedback
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Rate Order #{feedbackTargetOrder.token}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your feedback helps campus canteen improve taste, temperature, and service speed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackTargetOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Star Rating Selector */}
              <div className="text-center py-2">
                <span className="text-xs font-bold text-slate-600 block mb-2">
                  Tap to Rate:
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-extrabold text-amber-700 font-mono mt-1.5 block">
                  {feedbackRating === 5
                    ? '⭐⭐⭐⭐⭐ Exceptional (5/5)'
                    : feedbackRating === 4
                    ? '⭐⭐⭐⭐ Good (4/5)'
                    : feedbackRating === 3
                    ? '⭐⭐⭐ Average (3/5)'
                    : feedbackRating === 2
                    ? '⭐⭐ Below Expectations (2/5)'
                    : '⭐ Needs Improvement (1/5)'}
                </span>
              </div>

              {/* Quick Experience Tags */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Quick Experience Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '🔥 Hot & Crispy',
                    '⚡ Fast Service',
                    '📦 Neat Packaging',
                    '🍗 Perfect Portion',
                    '😊 Courteous Staff'
                  ].map((tag) => {
                    const isSelected = selectedFeedbackTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedFeedbackTags((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Comment Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Comments / Note (Optional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details on food taste, packaging, or speed..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1b4d3e] font-medium resize-none"
                ></textarea>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackTargetOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fullComment = [
                      ...selectedFeedbackTags,
                      feedbackComment.trim()
                    ].filter(Boolean).join(' • ');
                    submitOrderFeedback(
                      feedbackTargetOrder.id || feedbackTargetOrder.token,
                      feedbackRating,
                      fullComment
                    );
                    setFeedbackTargetOrder(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#1b4d3e] hover:bg-[#163f33] text-white text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-98"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;