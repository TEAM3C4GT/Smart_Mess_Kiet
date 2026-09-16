import React, { useState } from 'react';
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
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
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
    addToast
  } = useApp();

  // Active top navigation tab: 'My Meals' | 'History' | 'KFC' | 'Alerts'
  const [activeTab, setActiveTab] = useState('My Meals');

  // KFC Store State
  const [selectedKfcCategory, setSelectedKfcCategory] = useState('All');
  const [cart, setCart] = useState({ 3: 1 }); // Default has 1 Hot Wings in cart matching screenshot 2
  const [isCartOpen, setIsCartOpen] = useState(false);

  const kfcCategories = ['All', 'Burgers', 'Snacks', 'Chicken', 'Combos', 'Rice Bowls', 'Drinks', 'Desserts'];

  const handleCartChange = (itemId, delta) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const calculateCartItemsCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const calculateCartTotal = () => {
    return Object.keys(cart).reduce((sum, id) => {
      const item = kfcMenu.find((m) => m.id === parseInt(id));
      return sum + (item ? item.price * cart[id] : 0);
    }, 0);
  };

  const handlePlaceOrder = () => {
    const items = Object.keys(cart).map((id) => {
      const item = kfcMenu.find((m) => m.id === parseInt(id));
      return { name: item.name, qty: cart[id], price: item.price };
    });

    if (items.length === 0) return;
    const totalAmount = calculateCartTotal();
    placeKfcOrder(items, totalAmount);
    setCart({});
    setIsCartOpen(false);
  };

  // Active student token
  const activeOrder = kfcOrders.find((o) => o.status !== 'Collected') || kfcOrders[0] || null;

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
                        {meal.items.map((item, idx) => (
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
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Bar: Selection Summary & Confirmation */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {selectedMealsCount} {selectedMealsCount === 1 ? 'meal' : 'meals'} selected
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  All caught up
                </p>
              </div>

              <button
                onClick={confirmStudentMealSelection}
                className="bg-[#1b4d3e] hover:bg-[#163f33] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer self-stretch sm:self-auto text-center"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: KFC (Matching Reference Screenshots 2 & 5)                    */}
        {/* ==================================================================== */}
        {activeTab === 'KFC' && (
          <div className="space-y-6 pb-20">
            {/* Top Food Court Banner */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md min-h-[140px] sm:min-h-[170px] flex items-center px-6 sm:px-10 py-6">
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
            </div>

            {/* Active Token Tracker Card (Matching Screenshot 2) */}
            {activeOrder && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Token Identifier */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    TOKEN
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeOrder.token}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Status: <span className="font-bold text-slate-700">{activeOrder.status}</span>
                  </p>
                </div>

                {/* Middle: Stepper 4 stages */}
                <div className="flex-1 max-w-md mx-auto w-full px-2">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-emerald-600/30 -z-0"></div>

                    {/* Step 1 */}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    {/* Step 4 */}
                    <div className="relative z-10 w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                      4
                    </div>
                  </div>
                </div>

                {/* Right: Ready badge */}
                <div className="self-start md:self-center">
                  <span className="inline-block bg-rose-50 text-[#e4002b] text-xs font-bold px-3.5 py-1.5 rounded-full border border-rose-200">
                    Ready for pickup!
                  </span>
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
                const qty = cart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    {/* Item Image */}
                    <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Item Meta & Actions */}
                    <div className="p-4">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                        {item.name}
                      </h3>

                      <div className="flex items-center justify-between mt-3 pt-2">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{item.price}
                        </span>

                        {qty === 0 ? (
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

            {/* Floating Review Cart Bottom Bar (Screenshot 2) */}
            {calculateCartItemsCount() > 0 && (
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-xl px-5 py-3 flex items-center gap-6 animate-fade-in">
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

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="bg-[#e4002b] hover:bg-[#c90026] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Review cart
                </button>
              </div>
            )}

            {/* Slide-over Right Cart Drawer (Screenshot 5) */}
            {isCartOpen && (
              <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
                <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
                  {/* Drawer Header */}
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Your cart
                      </h3>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-260px)]">
                      {Object.keys(cart).map((id) => {
                        const item = kfcMenu.find((m) => m.id === parseInt(id));
                        if (!item) return null;
                        const qty = cart[id];
                        return (
                          <div key={id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                  ₹{item.price} × {qty}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleCartChange(item.id, -1)}
                                className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 w-4 text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleCartChange(item.id, 1)}
                                className="w-6 h-6 rounded-md bg-[#e4002b] text-white flex items-center justify-center hover:bg-[#c90026] shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drawer Bottom Bar: Total & Place Order */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Total</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{calculateCartTotal()}.00
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Pay cash at counter
                    </p>

                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-[#e4002b] hover:bg-[#c90026] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                    >
                      Place order
                    </button>
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

export default StudentDashboard;