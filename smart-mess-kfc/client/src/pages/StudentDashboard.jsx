import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Sparkles,
  Ticket,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const {
    studentSelections,
    updateStudentSelection,
    studentSubmitted,
    submitStudentMealPlan,
    kfcMenu,
    kfcOrders,
    placeKfcOrder
  } = useApp();

  // Cart state for KFC Pre-Order tab
  const [cart, setCart] = useState({});

  const handleCartQuantity = (itemId, change) => {
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const calculateCartTotal = () => {
    let total = 0;
    Object.keys(cart).forEach((id) => {
      const item = kfcMenu.find((m) => m.id === parseInt(id));
      if (item) total += item.price * cart[id];
    });
    return total;
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
    setActiveTab('My Orders');
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Meal Selection', icon: Utensils },
    { name: 'KFC Pre-Order', icon: ShoppingBag },
    { name: 'My Orders', icon: Clock },
    { name: 'Profile', icon: User }
  ];

  // Calculated metrics
  const selectedCount = Object.values(studentSelections).filter((v) => v === 'will_eat').length;
  const totalSpent = kfcOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeKfcOrder = kfcOrders[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="Student" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header Greeting */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, Student 👋
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Room 302 • Hostel Block B • Student ID: #ST-2024-89
              </p>
            </div>
            {studentSubmitted && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tomorrow's Meal Selection Confirmed
              </span>
            )}
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Selected</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{selectedCount} / 4</p>
              <p className="text-xs font-semibold text-purple-700 mt-1">Tomorrow's Selection</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KFC Orders</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{kfcOrders.length}</p>
              <p className="text-xs font-semibold text-indigo-700 mt-1">Total Orders Placed</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">₹{totalSpent}</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">Cash on Pickup</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Status</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-2 truncate">
                {activeKfcOrder ? activeKfcOrder.token : 'No Active Order'}
              </p>
              <span className={`inline-block text-xs font-bold mt-1 px-2 py-0.5 rounded-md ${
                activeKfcOrder?.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                activeKfcOrder?.status === 'Preparing' ? 'bg-purple-100 text-purple-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {activeKfcOrder ? activeKfcOrder.status : 'Idle'}
              </span>
            </div>
          </div>

          {/* MAIN TAB CONTENT */}
          {(activeTab === 'Dashboard' || activeTab === 'Meal Selection') && (
            <div className="space-y-6">
              {/* Meal Selection Box */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Tomorrow's Meal Selection
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cutoff time: 10:00 PM tonight. Helps kitchen cook optimal quantities.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full self-start">
                    Sunday, Sept 14
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'breakfast', label: 'Breakfast', time: '7:30 AM - 9:30 AM', menu: 'Idli, Sambar, Tea / Coffee, Boiled Eggs' },
                    { id: 'lunch', label: 'Lunch', time: '12:30 PM - 2:30 PM', menu: 'Paneer Butter Masala, Rice, Chapati, Dal' },
                    { id: 'snacks', label: 'Snacks', time: '4:30 PM - 5:30 PM', menu: 'Samosa, Mint Chutney, Tea / Milk' },
                    { id: 'dinner', label: 'Dinner', time: '7:30 PM - 9:30 PM', menu: 'Kadai Chicken / Veg Korma, Jeera Rice, Jamun' },
                  ].map((meal) => {
                    const isWillEat = studentSelections[meal.id] === 'will_eat';
                    return (
                      <div
                        key={meal.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isWillEat
                            ? 'border-purple-300 bg-purple-50/50 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-900">{meal.label}</h3>
                          <span className="text-[10px] font-semibold text-slate-500">{meal.time}</span>
                        </div>

                        <p className="text-xs text-slate-600 min-h-[32px] mb-4">
                          {meal.menu}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => updateStudentSelection(meal.id, 'will_eat')}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                              isWillEat
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Will Eat
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStudentSelection(meal.id, 'will_not_eat')}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                              !isWillEat
                                ? 'bg-slate-700 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Skip
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submitStudentMealPlan}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Tomorrow's Meal Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KFC PRE-ORDER TAB */}
          {(activeTab === 'KFC Pre-Order' || (activeTab === 'Dashboard' && cart && Object.keys(cart).length > 0)) && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                      KFC Express Pre-Order Menu
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Skip mess queue! Pre-order now and pay cash at pickup counter.
                    </p>
                  </div>
                  {calculateCartTotal() > 0 && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full self-start">
                      Cart Total: ₹{calculateCartTotal()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {kfcMenu.map((item) => {
                    const qty = cart[item.id] || 0;
                    const isSoldOut = item.isAvailable === false;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                          isSoldOut
                            ? 'bg-slate-100/70 border-slate-200 opacity-60'
                            : 'bg-slate-50/70 border-slate-200/80 hover:border-purple-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">{item.image}</span>
                            <div className="flex items-center gap-1.5">
                              {isSoldOut && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                                  Sold Out
                                </span>
                              )}
                              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                          <p className="text-sm font-extrabold text-purple-700 mt-1">₹{item.price}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">
                            {isSoldOut ? 'Availability' : 'Quantity'}
                          </span>
                          {isSoldOut ? (
                            <span className="text-xs font-bold text-red-600">Unavailable</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <>
                                  <button
                                    onClick={() => handleCartQuantity(item.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-sm font-bold text-slate-900 w-4 text-center">{qty}</span>
                                </>
                              )}
                              <button
                                onClick={() => handleCartQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {calculateCartTotal() > 0 && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Ready to Pre-order</p>
                      <p className="text-sm font-bold text-slate-900">
                        Total Amount: <span className="text-purple-700 text-base">₹{calculateCartTotal()}</span> (Pay Cash at Pickup)
                      </p>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20"
                    >
                      Place Pre-Order Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY ORDERS TAB */}
          {activeTab === 'My Orders' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                My KFC Orders & Pickup Tokens
              </h2>

              {kfcOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {kfcOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-xs text-center shrink-0">
                          TOKEN
                          <br />
                          {ord.token.split('-')[2] || '01'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base">{ord.token}</span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                ord.status === 'Ready'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'Preparing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ord.status === 'Collected'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">Order Time: {ord.orderTime}</p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                        <p className="text-xs font-bold text-slate-500 uppercase">Amount Due</p>
                        <p className="text-lg font-extrabold text-purple-700">₹{ord.totalAmount}</p>
                        <p className="text-[10px] font-semibold text-slate-400">Cash on Pickup</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'Profile' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-xl">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Student Profile
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Name</span>
                  <span className="font-bold text-slate-800">Alex Rivers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Student ID</span>
                  <span className="font-bold text-slate-800">#ST-2024-89</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Hostel Block</span>
                  <span className="font-bold text-slate-800">Block B</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Floor</span>
                  <span className="font-bold text-slate-800">Floor 2</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Room No</span>
                  <span className="font-bold text-slate-800">Room 302</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
