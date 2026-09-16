import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CookingPot,
  ShoppingBag,
  UserCheck,
  FileText,
  Settings,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Edit,
  Save,
  CheckCircle2,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const MessInchargeDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const {
    headcount,
    menu,
    updateMenu,
    kfcOrders,
    updateKfcOrderStatus,
    addToast
  } = useApp();

  // Menu edit state
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editedMenu, setEditedMenu] = useState({ ...menu });

  const handleSaveMenu = () => {
    updateMenu(editedMenu);
    setIsEditingMenu(false);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Meal Plan', icon: CookingPot },
    { name: 'KFC Orders', icon: ShoppingBag },
    { name: 'Attendance', icon: UserCheck },
    { name: 'Reports', icon: FileText },
    { name: 'Settings', icon: Settings }
  ];

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentRole="Mess Incharge" />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                  Kitchen Operations & Forecasting
                </span>
                <span className="text-xs font-bold text-slate-500">Main Kitchen Hub</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Mess Incharge Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addToast('Exporting mess data report as CSV...', 'info')}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-purple-600" />
                Export Data
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Headcount</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">185</p>
              <p className="text-xs text-purple-700 mt-1 font-semibold">Tomorrow's Lunch Peak</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Predicted Meals</span>
              <p className="text-2xl font-extrabold text-purple-700 mt-1">192</p>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Forecast (91% Confidence)
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KFC Active Orders</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{activeKfcCount}</p>
              <p className="text-xs text-indigo-600 mt-1 font-medium">Express Queue</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wastage Reduction</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">-32%</p>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Below Target Waste
              </p>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Meal Plan & Headcount Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-lg mb-1">Meal Plan & Headcount Consolidation</h3>
              <p className="text-xs text-slate-500 mb-6">Compare student selections against AI prediction and historical actuals</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
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
                        <td className="py-3.5 font-bold text-slate-900">{row.meal}</td>
                        <td className="py-3.5 text-purple-700 font-extrabold">{row.selected}</td>
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Kitchen Preparation Status</h3>
                <p className="text-xs text-slate-500 mb-6">Real-time cooking completion rate</p>

                <div className="space-y-4">
                  {[
                    { label: 'Vegetarian Meals', percent: 85, color: 'bg-emerald-600' },
                    { label: 'Non-Veg Meals', percent: 70, color: 'bg-purple-600' },
                    { label: 'Snacks & Evening Tea', percent: 95, color: 'bg-indigo-600' },
                    { label: 'KFC Express Pre-Orders', percent: 60, color: 'bg-amber-500' }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="text-slate-900">{item.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>Shift Supervisor: Chief Chef Ramesh</span>
                <span className="bg-purple-50 px-2.5 py-1 rounded-md">Kitchen Ready</span>
              </div>
            </div>
          </div>

          {/* Wastage Chart & Tomorrow Menu Editor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Wastage Trend */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-lg mb-1">Food Wastage Trend (Kg)</h3>
              <p className="text-xs text-slate-500 mb-4">Actual waste vs 10kg target benchmark</p>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wastageTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actualKg" name="Actual Waste (Kg)" stroke="#ef4444" strokeWidth={3} />
                    <Line type="monotone" dataKey="targetKg" name="Target Limit (10 Kg)" stroke="#94a3b8" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tomorrow Menu Editor */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Tomorrow's Menu Editor</h3>
                  <p className="text-xs text-slate-500">Update items displayed to students</p>
                </div>
                {isEditingMenu ? (
                  <button
                    onClick={handleSaveMenu}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Menu
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingMenu(true)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Menu
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => (
                  <div key={mealKey} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <label className="text-xs font-bold text-purple-700 uppercase block mb-1">
                      {mealKey}
                    </label>
                    {isEditingMenu ? (
                      <input
                        type="text"
                        value={editedMenu[mealKey]}
                        onChange={(e) => setEditedMenu({ ...editedMenu, [mealKey]: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-800">{menu[mealKey]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KFC Order Status Manager */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-lg mb-1">KFC Express Orders & Status Updates</h3>
            <p className="text-xs text-slate-500 mb-4">Manage orders for cash pickup counter</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
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
                      <td className="py-3 font-extrabold text-purple-700">{ord.token}</td>
                      <td className="py-3 font-semibold text-slate-800">
                        {ord.studentName} <span className="text-slate-400 font-normal">({ord.room})</span>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3 font-extrabold text-slate-900">₹{ord.totalAmount}</td>
                      <td className="py-3 text-slate-500 font-medium">{ord.orderTime}</td>
                      <td className="py-3 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => updateKfcOrderStatus(ord.id, e.target.value)}
                          className="text-xs font-bold p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
    </div>
  );
};
