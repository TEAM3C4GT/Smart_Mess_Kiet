import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Flame,
  Receipt,
  DollarSign,
  Coffee,
  Sparkles,
  Timer,
  ChevronRight,
  TrendingUp,
  Tag,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  BellRing,
  Plus,
  X,
  Trash2
} from 'lucide-react';

export const KfcStaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('Live Orders');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Snacks',
    image: '🍗'
  });

  const categories = ['Buckets', 'Burgers', 'Snacks', 'Sides', 'Desserts', 'Beverages', 'Combos'];
  const quickEmojis = ['🍗', '🍔', '🍿', '🍟', '🍰', '🥤', '🌮', '🌭', '🍕', '🥗', '🍩', '🍦'];

  const {
    kfcMenu,
    toggleKfcItemAvailability,
    addKfcMenuItem,
    removeKfcMenuItem,
    kfcOrders,
    updateKfcOrderStatus,
    advanceKfcOrderStatus,
    addToast
  } = useApp();

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      addToast('Please enter an item name', 'error');
      return;
    }
    const priceNum = parseFloat(newItem.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('Please enter a valid price in ₹', 'error');
      return;
    }

    addKfcMenuItem({
      name: newItem.name.trim(),
      price: priceNum,
      category: newItem.category,
      image: newItem.image || '🍗'
    });

    setNewItem({
      name: '',
      price: '',
      category: 'Snacks',
      image: '🍗'
    });
    setShowAddModal(false);
  };

  const sidebarItems = [
    { name: 'Live Orders', icon: ShoppingBag },
    { name: 'Preparing Queue', icon: Flame },
    { name: 'Ready for Pickup', icon: BellRing },
    { name: 'Menu & Stock', icon: Tag },
    { name: 'Sales Summary', icon: Receipt }
  ];

  // Derived KPI metrics
  const pendingOrders = kfcOrders.filter((o) => o.status === 'Pending');
  const preparingOrders = kfcOrders.filter((o) => o.status === 'Preparing');
  const readyOrders = kfcOrders.filter((o) => o.status === 'Ready');
  const collectedOrders = kfcOrders.filter((o) => o.status === 'Collected');
  const activeOrdersCount = pendingOrders.length + preparingOrders.length;
  
  // Real-time cash metrics
  const collectedCashTotal = collectedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCashTotal = kfcOrders
    .filter((o) => o.status !== 'Collected')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrderValue = kfcOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter orders for Live Orders tab based on status filter & search query
  const filteredOrders = kfcOrders.filter((order) => {
    const matchesStatus = statusFilter === 'All' ? true : order.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      String(order.token).toLowerCase().includes(query) ||
      order.studentName.toLowerCase().includes(query) ||
      order.room.toLowerCase().includes(query) ||
      order.items.some((i) => i.name.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const renderOrderCard = (order) => (
    <div
      key={order.id}
      className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
        order.status === 'Ready'
          ? 'border-emerald-300 ring-2 ring-emerald-500/10'
          : order.status === 'Preparing'
          ? 'border-purple-300 ring-2 ring-purple-500/10'
          : order.status === 'Collected'
          ? 'border-slate-200 bg-slate-50/40 opacity-75'
          : 'border-amber-300 ring-2 ring-amber-500/10'
      }`}
    >
      <div>
        {/* Card Header: Token & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-lg bg-slate-100 px-2.5 py-1 rounded-lg">
              #{order.token}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {order.orderTime}
            </span>
          </div>

          <select
            value={order.status}
            onChange={(e) => updateKfcOrderStatus(order.id, e.target.value)}
            className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600 ${
              order.status === 'Ready'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : order.status === 'Preparing'
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : order.status === 'Collected'
                ? 'bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Collected">Collected</option>
          </select>
        </div>

        {/* Student Meta */}
        <div className="mb-3 pb-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">{order.studentName}</p>
          <p className="text-xs text-purple-700 font-semibold">{order.room} • Hostel Block B</p>
        </div>

        {/* Order Items */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Ordered Items
          </span>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                <span className="font-bold text-purple-700 mr-1.5">{item.qty}x</span>
                {item.name}
              </span>
              <span className="font-bold text-slate-500">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer: Amount Due & One-Click Actions */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Due</span>
            <span className="text-lg font-extrabold text-slate-900">₹{order.totalAmount}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Cash at Counter
          </span>
        </div>

        {/* Action Progression Button */}
        {order.status === 'Pending' && (
          <button
            onClick={() => advanceKfcOrderStatus(order.id)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            Start Preparing
          </button>
        )}

        {order.status === 'Preparing' && (
          <button
            onClick={() => advanceKfcOrderStatus(order.id)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5" />
            Mark Ready for Pickup
          </button>
        )}

        {order.status === 'Ready' && (
          <button
            onClick={() => advanceKfcOrderStatus(order.id)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Paid & Delivered
          </button>
        )}

        {order.status === 'Collected' && (
          <div className="w-full text-center py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Order Collected & Settled
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="KFC Staff" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: LIVE ORDERS */}
          {activeTab === 'Live Orders' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      KIET Food Court Terminal
                    </span>
                    <span className="text-xs font-bold text-slate-500">Counter 01 • Cash on Pickup</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    KFC Staff & Order Operations
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Live pre-order fulfillment terminal, student token callout, and inventory availability management.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => addToast('Refreshing live queue with kitchen server...', 'info')}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    Sync Queue
                  </button>
                </div>
              </div>

              {/* Operational KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Queue</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeOrdersCount}</p>
                  <p className="text-xs font-semibold text-amber-700 mt-1">
                    {pendingOrders.length} Pending • {preparingOrders.length} Preparing
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready for Pickup</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <BellRing className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-purple-700 mt-2">{readyOrders.length}</p>
                  <p className="text-xs font-semibold text-purple-600 mt-1">
                    Tokens on Display Counter
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Prep Speed</span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Timer className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-indigo-700 mt-2">4.2 min</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Within &lt;5 min Target
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cash in Drawer</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-2">₹{collectedCashTotal}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {collectedOrders.length} Paid & Collected • ₹{pendingCashTotal} In Queue
                  </p>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Token, Student, Room, or Item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                  {[
                    { label: 'All', count: kfcOrders.length },
                    { label: 'Pending', count: pendingOrders.length },
                    { label: 'Preparing', count: preparingOrders.length },
                    { label: 'Ready', count: readyOrders.length },
                    { label: 'Collected', count: collectedOrders.length }
                  ].map((st) => (
                    <button
                      key={st.label}
                      onClick={() => setStatusFilter(st.label)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        statusFilter === st.label
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {st.label} ({st.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards Grid */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-700">No orders matching this filter</h3>
                  <p className="text-xs text-slate-400 mt-1">All orders in this stage have been fulfilled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => renderOrderCard(order))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PREPARING QUEUE */}
          {activeTab === 'Preparing Queue' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-purple-600" />
                      Kitchen Station
                    </span>
                    <span className="text-xs font-bold text-slate-500">Active Kitchen Orders</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Preparing Queue
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Orders currently being prepared in the kitchen. Mark ready when preparation is complete.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-xl">
                    {preparingOrders.length} In Preparation
                  </span>
                </div>
              </div>

              {/* Order Cards Grid */}
              {preparingOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
                  <Flame className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-700">No orders in preparation</h3>
                  <p className="text-xs text-slate-400 mt-1">Kitchen queue is clear. New incoming orders will appear here when preparation begins.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {preparingOrders.map((order) => renderOrderCard(order))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: READY FOR PICKUP */}
          {activeTab === 'Ready for Pickup' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                      Pickup Counter
                    </span>
                    <span className="text-xs font-bold text-slate-500">Ready for Collection</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Ready for Pickup
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Orders ready at the counter. Verify student token, collect cash payment, and deliver order.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                    {readyOrders.length} Ready for Collection
                  </span>
                </div>
              </div>

              {/* Order Cards Grid */}
              {readyOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
                  <BellRing className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-700">No orders ready for pickup</h3>
                  <p className="text-xs text-slate-400 mt-1">All prepared orders have been handed over to students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyOrders.map((order) => renderOrderCard(order))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MENU & STOCK MANAGEMENT */}
          {activeTab === 'Menu & Stock' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    Inventory Control
                  </span>
                  <span className="text-xs font-bold text-slate-500">Live Canteen Stock</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Menu & Stock
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Manage canteen inventory and toggle availability. Changes reflect immediately on student pre-order screens.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Tag className="w-5 h-5 text-purple-600" />
                      KFC Menu & Inventory Availability
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle items in stock or mark sold-out. Changes reflect instantly on student pre-order screens.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl">
                      {kfcMenu.filter((i) => i.isAvailable).length} / {kfcMenu.length} Active Items
                    </span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kfcMenu.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        item.isAvailable
                          ? 'bg-slate-50/70 border-slate-200/90'
                          : 'bg-red-50/30 border-red-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.image}</span>
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h4>
                          <p className="text-xs font-extrabold text-purple-700 mt-0.5">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleKfcItemAvailability(item.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                            item.isAvailable
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              : 'bg-red-100 hover:bg-red-200 text-red-800'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              In Stock
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              Sold Out
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => removeKfcMenuItem(item.id)}
                          title="Remove from menu"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Modal */}
                {showAddModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">Add New Menu Item</h3>
                            <p className="text-xs text-slate-400">Add food or beverage to campus canteen menu</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddModal(false)}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleAddItem} className="space-y-4">
                        {/* Item Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Crispy Chicken Tenders (3 Pcs)"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          />
                        </div>

                        {/* Price & Category in 2 columns */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              placeholder="199"
                              value={newItem.price}
                              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Category
                            </label>
                            <select
                              value={newItem.category}
                              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white cursor-pointer"
                            >
                              {categories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Emoji / Icon Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Select Icon / Emoji
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {quickEmojis.map((emoji) => (
                              <button
                                type="button"
                                key={emoji}
                                onClick={() => setNewItem({ ...newItem, image: emoji })}
                                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                                  newItem.image === emoji
                                    ? 'bg-purple-100 border-2 border-purple-600 shadow-xs scale-105'
                                    : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview Banner */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{newItem.image}</span>
                            <div>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                                {newItem.category}
                              </span>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">
                                {newItem.name.trim() || 'Item Preview Name'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-purple-700">
                            ₹{newItem.price || 0}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Add to Menu
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SALES SUMMARY */}
          {activeTab === 'Sales Summary' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    Financial Auditing
                  </span>
                  <span className="text-xs font-bold text-slate-500">Counter 01 Daily Reconciliation</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Sales Summary
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Auditing cash payments verified upon token collection and daily shift reconciliation.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-3xl">
                <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  Today's Cash Counter & Sales Reconciliation
                </h3>
                <p className="text-xs text-slate-500 mb-6">Auditing cash payments verified upon token collection</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Cash in Drawer</span>
                    <p className="text-xl font-extrabold text-emerald-700 mt-1">₹{collectedCashTotal}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{collectedOrders.length} settled & paid orders</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <span className="text-xs font-bold text-amber-800 uppercase">Pending Collection</span>
                    <p className="text-xl font-extrabold text-amber-700 mt-1">₹{pendingCashTotal}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{kfcOrders.length - collectedOrders.length} orders in pipeline</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80">
                    <span className="text-xs font-bold text-purple-800 uppercase">Total Order Value</span>
                    <p className="text-xl font-extrabold text-purple-700 mt-1">₹{totalOrderValue}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{kfcOrders.length} pre-orders today</p>
                  </div>
                </div>

                {/* Settled Collections Log */}
                <div className="mb-6">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Settled Cash Collections Log</h4>
                  {collectedOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      No orders settled yet. As soon as an order is delivered, it will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {collectedOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                              #{ord.token}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block">{ord.studentName}</span>
                              <span className="text-[11px] text-slate-500">{ord.room} • {ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-emerald-700 text-sm block">₹{ord.totalAmount}</span>
                            <span className="text-[10px] font-semibold text-slate-400">{ord.orderTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Shift Cashier: Canteen Incharge Anand</span>
                  <button
                    onClick={() => addToast('Cash counter shift closing report exported.', 'success')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                  >
                    Print Shift Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default KfcStaffDashboard;
