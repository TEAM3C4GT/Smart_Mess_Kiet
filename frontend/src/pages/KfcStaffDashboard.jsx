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
  Minus,
  X,
  Trash2,
  Package,
  AlertTriangle,
  RotateCcw,
  Check,
  History
} from 'lucide-react';

export const KfcStaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('Live Orders');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuSelectedCategory, setMenuSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Snacks',
    image: '🍗',
    stock: 20
  });

  const categories = ['Buckets', 'Burgers', 'Snacks', 'Sides', 'Desserts', 'Beverages', 'Combos'];
  const menuFilterCategories = ['All', 'Buckets', 'Burgers', 'Snacks', 'Sides', 'Desserts', 'Beverages', 'Combos', 'Chicken', 'Rice Bowls', 'Drinks'];
  const quickEmojis = ['🍗', '🍔', '🍿', '🍟', '🍰', '🥤', '🌮', '🌭', '🍕', '🥗', '🍩', '🍦'];

  const {
    kfcMenu,
    toggleKfcItemAvailability,
    updateKfcItemStock,
    setKfcItemStockDirect,
    restockAllKfcItems,
    addKfcMenuItem,
    removeKfcMenuItem,
    kfcOrders,
    updateKfcOrderStatus,
    advanceKfcOrderStatus,
    refreshKfcOrders,
    clearAllKfcOrders,
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
    const stockNum = parseInt(newItem.stock);
    const initialStock = isNaN(stockNum) || stockNum < 0 ? 20 : stockNum;

    addKfcMenuItem({
      name: newItem.name.trim(),
      price: priceNum,
      category: newItem.category,
      image: newItem.image || '🍗',
      stock: initialStock
    });

    setNewItem({
      name: '',
      price: '',
      category: 'Snacks',
      image: '🍗',
      stock: 20
    });
    setShowAddModal(false);
  };

  // Derived KPI metrics strictly from genuine orders (excluding archived or dummy orders)
  const validStaffOrders = kfcOrders.filter(
    (o) => o.status !== 'Archived' && !String(o.id || '').startsWith('DUMMY')
  );
  const pendingOrders = validStaffOrders.filter((o) => o.status === 'Pending');
  const preparingOrders = validStaffOrders.filter((o) => o.status === 'Preparing');
  const readyOrders = validStaffOrders.filter((o) => o.status === 'Ready');
  const collectedOrders = validStaffOrders.filter((o) => o.status === 'Collected');
  const activeStaffOrders = pendingOrders.concat(preparingOrders, readyOrders);
  const activeOrdersCount = pendingOrders.length + preparingOrders.length;

  const sidebarItems = [
    { name: 'Live Orders', icon: ShoppingBag, badge: activeOrdersCount },
    { name: 'Preparing Queue', icon: Flame, badge: preparingOrders.length },
    { name: 'Ready for Pickup', icon: BellRing, badge: readyOrders.length },
    { name: 'Order History', icon: History, badge: validStaffOrders.length },
    { name: 'Menu & Stock', icon: Tag, badge: kfcMenu.length },
    { name: 'Sales Summary', icon: Receipt }
  ];

  // Real-time cash metrics strictly based on actual customer transactions
  const collectedCashTotal = collectedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCashTotal = activeStaffOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrderValue = collectedCashTotal + pendingCashTotal;

  // Total quantity of items selected by students across all orders
  const totalItemsOrderedCount = validStaffOrders.reduce((total, ord) => {
    return total + (ord.items || []).reduce((sum, item) => sum + (item.qty || 1), 0);
  }, 0);

  // Student items selected breakdown & popularity calculation
  const studentItemsBreakdown = {};
  validStaffOrders.forEach((ord) => {
    (ord.items || []).forEach((item) => {
      const name = item.name || 'Unnamed Item';
      if (!studentItemsBreakdown[name]) {
        studentItemsBreakdown[name] = {
          name,
          qty: 0,
          ordersCount: 0,
          revenue: 0,
          category: kfcMenu.find((m) => m.name === name)?.category || 'KFC',
          image: kfcMenu.find((m) => m.name === name)?.image || '🍗'
        };
      }
      const qty = item.qty || 1;
      studentItemsBreakdown[name].qty += qty;
      studentItemsBreakdown[name].ordersCount += 1;
      studentItemsBreakdown[name].revenue += qty * (item.price || 0);
    });
  });
  const studentItemsList = Object.values(studentItemsBreakdown).sort((a, b) => b.qty - a.qty);
  const maxItemQty = studentItemsList.length > 0 ? Math.max(...studentItemsList.map((i) => i.qty)) : 1;

  // Filtered orders for Order History tab
  const filteredHistoryOrders = validStaffOrders.filter((order) => {
    const matchesStatus =
      historyStatusFilter === 'All' ? true : order.status === historyStatusFilter;
    const query = historySearchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      String(order.token || '').toLowerCase().includes(query) ||
      (order.studentName || '').toLowerCase().includes(query) ||
      (order.room || '').toLowerCase().includes(query) ||
      (order.items || []).some((i) => (i.name || '').toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  // Filter orders for Live Orders tab based on status filter & search query
  const filteredOrders = activeStaffOrders.filter((order) => {
    const matchesStatus = statusFilter === 'All' ? true : order.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      String(order.token || '').toLowerCase().includes(query) ||
      (order.studentName || '').toLowerCase().includes(query) ||
      (order.room || '').toLowerCase().includes(query) ||
      (order.items || []).some((i) => (i.name || '').toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  // Filtered menu for Menu & Stock tab
  const filteredMenu = kfcMenu.filter((item) => {
    const matchesCat =
      menuSelectedCategory === 'All' ||
      item.category.toLowerCase() === menuSelectedCategory.toLowerCase();
    const query = menuSearchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const inStockItemsCount = kfcMenu.filter((i) => i.isAvailable && (i.stock || 0) > 0).length;
  const lowStockItemsCount = kfcMenu.filter(
    (i) => i.isAvailable && (i.stock || 0) > 0 && (i.stock || 0) <= 5
  ).length;
  const soldOutItemsCount = kfcMenu.filter(
    (i) => !i.isAvailable || (i.stock || 0) === 0
  ).length;

  // Product-wise sales breakdown aggregated strictly from settled (collected) orders
  const itemSalesStats = {};
  collectedOrders.forEach((ord) => {
    (ord.items || []).forEach((item) => {
      const name = item.name || 'Unnamed Item';
      if (!itemSalesStats[name]) {
        itemSalesStats[name] = {
          name,
          qty: 0,
          revenue: 0,
          category: kfcMenu.find((m) => m.name === name)?.category || 'KFC'
        };
      }
      const qty = item.qty || 1;
      itemSalesStats[name].qty += qty;
      itemSalesStats[name].revenue += qty * (item.price || 0);
    });
  });
  const itemSalesList = Object.values(itemSalesStats).sort((a, b) => b.qty - a.qty);

  const renderOrderCard = (order) => (
    <div
      key={order.id}
      className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
        order.status === 'Ready'
          ? 'border-emerald-300 ring-2 ring-emerald-500/10'
          : order.status === 'Preparing'
          ? 'border-emerald-300 ring-2 ring-emerald-500/10'
          : order.status === 'Collected'
          ? 'border-slate-200 bg-slate-50/40 opacity-75'
          : 'border-amber-300 ring-2 ring-amber-500/10'
      }`}
    >
      <div>
        {/* Card Header: Token & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-lg bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
              #{order.token}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">
              {order.orderTime}
            </span>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border font-mono ${
              order.status === 'Ready'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : order.status === 'Preparing'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : order.status === 'Collected'
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Student Meta */}
        <div className="mb-3 pb-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">{order.studentName}</p>
          <p className="text-xs text-[#1b4d3e] font-semibold">{order.room}{order.room?.includes('Block') ? '' : ' • Campus Hostel'}</p>
        </div>

        {/* Order Items */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Ordered Items
          </span>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                <span className="font-bold text-[#1b4d3e] mr-1.5">{item.qty}x</span>
                {item.name}
              </span>
              <span className="font-bold text-slate-500 font-mono">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer: Amount Due & One-Click Actions */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Total Due</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">₹{order.totalAmount}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
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
            className="w-full bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      KIET Food Court Terminal
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Counter 01 • Cash on Pickup</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    KFC Staff & Order Operations
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                    Live pre-order fulfillment terminal, student token callout, and inventory availability management.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => refreshKfcOrders(false)}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1b4d3e]" />
                    Sync Queue
                  </button>
                </div>
              </div>

              {/* Operational KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Queue</span>
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
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Ready for Pickup</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center">
                      <BellRing className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-[#1b4d3e] mt-2">{readyOrders.length}</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    Tokens on Display Counter
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('Order History')}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-300 hover:ring-2 hover:ring-emerald-500/10 transition-all"
                  title="Click to view full Order History and Student Selections"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Student Items Selected</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-[#1b4d3e] mt-2">{totalItemsOrderedCount} Items</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Across {validStaffOrders.length} student orders →
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Cash in Drawer</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">₹{collectedCashTotal}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {collectedOrders.length} Paid & Collected • ₹{pendingCashTotal} In Queue
                  </p>
                </div>
              </div>

              {/* Student Items Selected Bar - Quick Popularity Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                      Items Selected by Students
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {totalItemsOrderedCount} Total Items Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {studentItemsList.slice(0, 5).map((item) => (
                      <span
                        key={item.name}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                      >
                        <span>{item.image}</span>
                        <span className="font-bold text-[#1b4d3e] font-mono">{item.qty}x</span>
                        <span className="truncate max-w-[120px]">{item.name}</span>
                      </span>
                    ))}
                    {studentItemsList.length > 5 && (
                      <span className="text-xs font-bold text-slate-400">+{studentItemsList.length - 5} more</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('Order History')}
                  className="bg-[#1b4d3e] hover:bg-[#143d31] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  View Orders History ({validStaffOrders.length})
                </button>
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
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                  {[
                    { label: 'All', count: activeStaffOrders.length },
                    { label: 'Pending', count: pendingOrders.length },
                    { label: 'Preparing', count: preparingOrders.length },
                    { label: 'Ready', count: readyOrders.length }
                  ].map((st) => (
                    <button
                      key={st.label}
                      onClick={() => setStatusFilter(st.label)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        statusFilter === st.label
                          ? 'bg-[#1b4d3e] text-white shadow-xs'
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
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#1b4d3e]" />
                  <h3 className="text-base font-bold text-slate-700">No active orders in queue</h3>
                  <p className="text-xs text-slate-400 mt-1">Live student pre-orders will pop up here in real time as they are placed.</p>
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
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#1b4d3e]" />
                      Kitchen Station
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Active Kitchen Orders</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Preparing Queue
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                    Orders currently being prepared in the kitchen. Mark ready when preparation is complete.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 rounded-xl font-mono">
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
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                      Pickup Counter
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Ready for Collection</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Ready for Pickup
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                    Orders ready at the counter. Verify student token, collect cash payment, and deliver order.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200/70 px-3 py-1.5 rounded-xl font-mono">
                    {readyOrders.length} Ready for Collection
                  </span>
                </div>
              </div>

              {/* Order Cards Grid */}
              {readyOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
                  <BellRing className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600" />
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

          {/* TAB: ORDER HISTORY & ITEMS SELECTED BREAKDOWN */}
          {activeTab === 'Order History' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-[#1b4d3e]" />
                      Audit & Records
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Student Selections & Fulfillment</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Order History & Student Selections
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                    Comprehensive audit trail showing item selection volume bars and complete order history logs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => refreshKfcOrders(false)}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1b4d3e]" />
                    Refresh History
                  </button>
                </div>
              </div>

              {/* 4 Summary KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{validStaffOrders.length}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    All lifetime logged orders
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Items Selected</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-[#1b4d3e] mt-2">{totalItemsOrderedCount} Items</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    Selected across all students
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Delivered & Settled</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-2">{collectedOrders.length}</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    Completed pickups
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Revenue Collected</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">₹{collectedCashTotal}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Cash received at counter
                  </p>
                </div>
              </div>

              {/* SECTION: ITEMS SELECTED BY STUDENTS (VOLUME & POPULARITY BARS) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Items Selected by Students (Popularity & Frequency Bar)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      How many items were selected by students across all canteen orders with visual volume bars
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    {studentItemsList.length} Unique Menu Items Selected
                  </span>
                </div>

                {studentItemsList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-bold text-slate-600">No items selected yet</p>
                    <p className="text-xs text-slate-400">Student item counts will appear here once orders are placed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentItemsList.map((item) => {
                      const percentage = Math.round((item.qty / maxItemQty) * 100);
                      const shareOfTotal = Math.round((item.qty / (totalItemsOrderedCount || 1)) * 100);
                      return (
                        <div key={item.name} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl flex-shrink-0">{item.image}</span>
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900 truncate">{item.name}</span>
                                  <span className="text-[10px] font-mono font-bold text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 shrink-0">
                                    {item.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Ordered in <span className="font-semibold text-slate-700">{item.ordersCount}</span> student orders • Total Value: <span className="font-mono font-bold text-slate-800">₹{item.revenue}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-lg font-black text-[#1b4d3e] font-mono">{item.qty}</span>
                                <span className="text-xs font-bold text-slate-500">items</span>
                              </div>
                              <span className="text-[10px] font-mono font-semibold text-slate-400 block">
                                {shareOfTotal}% volume share
                              </span>
                            </div>
                          </div>

                          {/* Volume Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 6)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: COMPLETE ORDERS HISTORY LOG & FILTER */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-[#1b4d3e]" />
                      Student Orders History Log
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Detailed chronological log of student orders, items list, room numbers, and fulfillment status
                    </p>
                  </div>

                  {/* Search in History */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Token, Student, Room, Item..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { label: 'All', count: validStaffOrders.length },
                    { label: 'Collected', count: collectedOrders.length },
                    { label: 'Ready', count: readyOrders.length },
                    { label: 'Preparing', count: preparingOrders.length },
                    { label: 'Pending', count: pendingOrders.length }
                  ].map((st) => (
                    <button
                      key={st.label}
                      onClick={() => setHistoryStatusFilter(st.label)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        historyStatusFilter === st.label
                          ? 'bg-[#1b4d3e] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {st.label} ({st.count})
                    </button>
                  ))}
                </div>

                {/* Orders History List / Table */}
                {filteredHistoryOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-bold text-slate-600">No orders match filter</p>
                    <p className="text-xs text-slate-400">Try changing the status filter or search query above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistoryOrders.map((ord) => {
                      const totalItemsInOrder = (ord.items || []).reduce((sum, i) => sum + (i.qty || 1), 0);
                      return (
                        <div
                          key={ord.id || ord.token}
                          className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="font-extrabold text-slate-900 text-base bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                              #{ord.token}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{ord.studentName}</span>
                                <span className="text-[11px] font-semibold text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                  {ord.room}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                Ordered at {ord.orderTime || 'Just now'} • {totalItemsInOrder} items in order
                              </p>
                            </div>
                          </div>

                          {/* Items Ordered Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 flex-1 max-w-xl">
                            {(ord.items || []).map((item, iIdx) => (
                              <span
                                key={iIdx}
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                              >
                                <span className="font-extrabold text-[#1b4d3e]">{item.qty}x</span>
                                {item.name}
                              </span>
                            ))}
                          </div>

                          {/* Total Due & Status Pill */}
                          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Total</span>
                              <span className="text-base font-black text-slate-900 font-mono">₹{ord.totalAmount}</span>
                            </div>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${
                                ord.status === 'Ready'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : ord.status === 'Preparing'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : ord.status === 'Collected'
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              {ord.status}
                            </span>

                            {ord.status !== 'Collected' && (
                              <button
                                onClick={() => advanceKfcOrderStatus(ord.id || ord.token)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white shadow-xs transition-all cursor-pointer"
                              >
                                {ord.status === 'Pending' ? 'Start' : ord.status === 'Preparing' ? 'Ready' : 'Deliver'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'Menu & Stock' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#1b4d3e]" />
                      Inventory Control
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Live Canteen Stock</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Menu & Stock
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                    Manage canteen inventory, live stock counts, and instant availability. Stock adjustments and Sold-Out statuses sync immediately with student ordering screens.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => restockAllKfcItems(20)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Replenish All (+20)
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#1b4d3e] hover:bg-[#143d31] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Menu Item
                  </button>
                </div>
              </div>

              {/* 4 Inventory Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Total Menu Items
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-slate-900 font-mono">{kfcMenu.length}</p>
                    <span className="text-[11px] text-slate-500 font-medium">configured</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                    In Stock
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-emerald-700 font-mono">{inStockItemsCount}</p>
                    <span className="text-[11px] text-emerald-600 font-medium">ready to order</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/20 p-4 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
                    Low Stock Alert
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-amber-700 font-mono">{lowStockItemsCount}</p>
                    <span className="text-[11px] text-amber-600 font-medium">≤ 5 units left</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-red-200/80 bg-red-50/20 p-4 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-red-800 uppercase tracking-wider block">
                    Sold Out
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-red-700 font-mono">{soldOutItemsCount}</p>
                    <span className="text-[11px] text-red-600 font-medium">0 stock / disabled</span>
                  </div>
                </div>
              </div>

              {/* Main Inventory Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                  {/* Search */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search menu or category..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4d3e] focus:border-transparent font-medium"
                    />
                    {menuSearchQuery && (
                      <button
                        onClick={() => setMenuSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {menuFilterCategories.map((cat) => {
                      const isSelected = menuSelectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setMenuSelectedCategory(cat)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1b4d3e] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Items Grid */}
                {filteredMenu.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
                    <h3 className="text-base font-bold text-slate-700">No menu items match your filter</h3>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or category filter.</p>
                    <button
                      onClick={() => {
                        setMenuSearchQuery('');
                        setMenuSelectedCategory('All');
                      }}
                      className="mt-3 text-xs font-bold text-[#1b4d3e] hover:underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map((item) => {
                      const isSoldOut = !item.isAvailable || (item.stock || 0) === 0;
                      const isLowStock = !isSoldOut && (item.stock || 0) <= 5;
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs ${
                            isSoldOut
                              ? 'bg-red-50/20 border-red-200/80'
                              : isLowStock
                              ? 'bg-amber-50/20 border-amber-200/80'
                              : 'bg-white border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          {/* Item Top Info */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail / Emoji with Sold Out Indicator */}
                              <div className="relative w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className={`w-full h-full object-cover ${isSoldOut ? 'grayscale opacity-60' : ''}`}
                                  />
                                ) : (
                                  <span className="text-2xl">{item.image || '🍗'}</span>
                                )}
                                {isSoldOut && (
                                  <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="text-[8px] font-black uppercase text-white bg-red-600 px-1 rounded">
                                      0
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                  {isSoldOut ? (
                                    <span className="text-[10px] font-bold text-red-700 bg-red-100/80 border border-red-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-red-600" />
                                      Sold Out
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                      Low Stock
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      In Stock
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{item.name}</h4>
                                <p className="text-xs font-black text-[#1b4d3e] font-mono mt-0.5">₹{item.price}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => removeKfcMenuItem(item.id)}
                              title="Delete menu item"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Inventory Stock Controls */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            {/* Stock Counter Controls */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                              <button
                                onClick={() => updateKfcItemStock(item.id, -1)}
                                disabled={!item.stock || item.stock <= 0}
                                title="Decrease stock by 1"
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="text-center min-w-[32px]">
                                <span className="font-mono font-extrabold text-xs text-slate-900">
                                  {item.stock ?? 0}
                                </span>
                                <span className="text-[9px] text-slate-400 block -mt-1 font-mono">qty</span>
                              </div>
                              <button
                                onClick={() => updateKfcItemStock(item.id, 5)}
                                title="Restock +5 units"
                                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#1b4d3e] hover:border-emerald-300 text-[10px] font-bold cursor-pointer shadow-2xs font-mono"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => updateKfcItemStock(item.id, 10)}
                                title="Restock +10 units"
                                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#1b4d3e] hover:border-emerald-300 text-[10px] font-bold cursor-pointer shadow-2xs font-mono"
                              >
                                +10
                              </button>
                            </div>

                            {/* In Stock / Sold Out Toggle Switch */}
                            <button
                              onClick={() => toggleKfcItemAvailability(item.id)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs ${
                                item.isAvailable && (item.stock || 0) > 0
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                              }`}
                            >
                              {item.isAvailable && (item.stock || 0) > 0 ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>In Stock</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span>Sold Out</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Item Modal */}
                {showAddModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1b4d3e] border border-emerald-200/70 flex items-center justify-center font-bold">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">Add New Menu Item</h3>
                            <p className="text-xs text-slate-400">Configure item name, price, category, and initial inventory</p>
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
                          <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Crispy Chicken Tenders (3 Pcs)"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium"
                          />
                        </div>

                        {/* Price, Category, and Initial Stock in 3 columns */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Category
                            </label>
                            <select
                              value={newItem.category}
                              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                              className="w-full text-sm px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white cursor-pointer font-medium text-xs"
                            >
                              {categories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Initial Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              required
                              placeholder="20"
                              value={newItem.stock}
                              onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium font-mono"
                            />
                          </div>
                        </div>

                        {/* Emoji / Icon Selector */}
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                                    ? 'bg-emerald-50 border-2 border-[#1b4d3e] shadow-xs scale-105'
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
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                                  {newItem.category}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                  Stock: {newItem.stock || 0}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">
                                {newItem.name.trim() || 'Item Preview Name'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-[#1b4d3e] font-mono">
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
                            className="px-5 py-2 text-xs font-bold bg-[#1b4d3e] hover:bg-[#143d31] text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
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
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                      Financial Auditing
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Counter 01 Daily Reconciliation</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Sales Summary
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                    Auditing cash collections, drawer reconciliation, and live product sales breakdown based on real student orders.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset shift sales register? This will clear active and settled orders and reset drawer cash to ₹0.')) {
                        clearAllKfcOrders();
                      }
                    }}
                    className="bg-white hover:bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                    Reset Shift Register
                  </button>
                  <button
                    onClick={() => addToast('Shift financial reconciliation report exported successfully.', 'success')}
                    className="bg-[#1b4d3e] hover:bg-[#143d31] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    Print Shift Report
                  </button>
                </div>
              </div>

              {/* 3 Main Reconciliation KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-emerald-200/90 bg-emerald-50/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                      Cash in Drawer (Settled)
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-black text-emerald-700 mt-2 font-mono">₹{collectedCashTotal}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {collectedOrders.length} settled & paid orders collected at counter
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200/90 bg-amber-50/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
                      Pending Collection (Pipeline)
                    </span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-3xl font-black text-amber-700 mt-2 font-mono">₹{pendingCashTotal}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {activeStaffOrders.length} active orders pending pickup/payment
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#1b4d3e] uppercase tracking-wider block">
                      Total Shift Turnout
                    </span>
                    <TrendingUp className="w-4 h-4 text-[#1b4d3e]" />
                  </div>
                  <p className="text-3xl font-black text-[#1b4d3e] mt-2 font-mono">₹{totalOrderValue}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {collectedOrders.length + activeStaffOrders.length} total student orders placed today
                  </p>
                </div>
              </div>

              {/* Product-wise Sales Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#1b4d3e]" />
                      Items Sold Breakdown Today
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live volume and revenue breakdown based strictly on delivered orders
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                    {itemSalesList.reduce((acc, curr) => acc + curr.qty, 0)} Units Sold
                  </span>
                </div>

                {itemSalesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-slate-100">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-600">No items delivered yet for this shift</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      When student orders are marked "Paid & Delivered", item metrics will automatically populate here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {itemSalesList.map((item) => (
                      <div
                        key={item.name}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[9px] font-mono font-bold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                          <h5 className="font-bold text-slate-900 text-xs mt-1">{item.name}</h5>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.qty} {item.qty === 1 ? 'unit' : 'units'} sold
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-700 text-sm font-mono block">
                            ₹{item.revenue}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">revenue</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settled Cash Collections Log */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#1b4d3e]" />
                      Settled Cash Collections Log
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audit trail of cash collected and delivered to students
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                    {collectedOrders.length} Settled Orders
                  </span>
                </div>

                {collectedOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-slate-100">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-600">No settled orders yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      As soon as an order is marked "Paid & Delivered", it will appear here in the cash log.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {collectedOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-[#1b4d3e] bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg text-xs">
                            #{ord.token}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{ord.studentName}</span>
                            <span className="text-[11px] text-slate-500">
                              {ord.room} • {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                          <span className="text-[10px] font-semibold text-slate-400 font-mono">
                            Delivered at {ord.orderTime}
                          </span>
                          <span className="font-black text-emerald-700 text-sm font-mono bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-lg">
                            ₹{ord.totalAmount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shift Details Footer */}
                <div className="border-t border-slate-100 pt-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-600">
                    Shift Cashier: Canteen Incharge Anand • Counter 01
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Register State: Active • Cash Verified
                  </span>
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
