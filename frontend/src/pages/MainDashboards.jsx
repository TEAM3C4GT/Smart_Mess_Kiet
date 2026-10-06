import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useApp, STAFF_ACCOUNTS } from '../context/AppContext';
import {
  GraduationCap,
  BedDouble,
  Building2,
  Boxes,
  CookingPot,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  Users,
  LayoutGrid,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  X,
  RefreshCw,
  SlidersHorizontal,
  Mail,
  UserCheck,
  UserX,
  BadgeCheck,
  KeyRound
} from 'lucide-react';

export const MainDashboards = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    users = [],
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    loginAsUser,
    addToast
  } = useApp();

  // Active Tab: 'Switchboard' or 'UserManager'
  const [activeTab, setActiveTab] = useState('Switchboard');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showRoomLeadModal, setShowRoomLeadModal] = useState(false);

  // Form State for Add User
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    badge: '',
    status: 'Active'
  });

  // Form State for Edit User
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    badge: '',
    status: 'Active'
  });

  // Role Switchboard Cards Definition
  const roleCards = [
    {
      id: 'principal',
      title: 'Principal',
      icon: ShieldCheck,
      emoji: '🏛️',
      path: '/principal',
      description: 'Executive analytics on food wastage, block attendance, and campus KFC footfall.',
      badge: 'Executive Command',
      color: 'bg-[#1b4d3e]'
    },
    {
      id: 'kfc-staff',
      title: 'KFC Staff',
      icon: ShoppingBag,
      emoji: '🍗',
      path: '/kfc-staff',
      description: 'Live order queue, token pickup verification, and menu stock availability.',
      badge: 'Canteen Fulfillment',
      color: 'bg-[#1b4d3e]'
    },
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      emoji: '🎓',
      path: '/student',
      description: "Select tomorrow's meals and order KFC without waiting.",
      badge: 'Meal Selection & KFC',
      color: 'bg-[#1b4d3e]'
    },
    {
      id: 'room-lead',
      title: 'Room Lead',
      icon: BedDouble,
      emoji: '🛏️',
      path: '/room-lead',
      description: 'Track room submissions and remind pending students across all 8 rooms.',
      badge: '8 Rooms • All Leads',
      color: 'bg-[#1b4d3e]'
    },
    {
      id: 'floor-incharge',
      title: 'Floor Incharge',
      icon: Building2,
      emoji: '🏢',
      path: '/floor-incharge',
      description: 'Monitor floor participation and identify low-submission rooms.',
      badge: 'Floor 2 Management',
      color: 'bg-[#1b4d3e]'
    },
    {
      id: 'block-coordinator',
      title: 'Block Coordinator',
      icon: Boxes,
      emoji: '🏬',
      path: '/block-coordinator',
      description: 'Consolidate floor-wise meal counts for the block.',
      badge: 'Block D & E Summary',
      color: 'bg-[#1b4d3e]'
    },
    {
      id: 'mess-incharge',
      title: 'Mess Incharge',
      icon: ChefHat,
      emoji: '🍲',
      path: '/mess-incharge',
      description: 'Monitor final headcount, meal planning and kitchen preparation.',
      badge: 'Final Headcount & Kitchen',
      color: 'bg-[#1b4d3e]'
    }
  ];

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.badge && u.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // KPI Metrics
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'Suspended').length;
  const distinctRolesCount = new Set(users.map((u) => u.role)).size;

  // Handle Add User Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Name and email are required', 'error');
      return;
    }

    // Auto default badge if omitted
    let assignedBadge = formData.badge.trim();
    if (!assignedBadge) {
      if (formData.role === 'Student') assignedBadge = 'Campus Resident';
      else if (formData.role === 'Room Lead') assignedBadge = 'Room Representative';
      else if (formData.role === 'Floor Incharge') assignedBadge = 'Floor Supervisor';
      else if (formData.role === 'Block Coordinator') assignedBadge = 'Block Coordinator';
      else if (formData.role === 'Mess Incharge') assignedBadge = 'Kitchen Command';
      else if (formData.role === 'Principal') assignedBadge = 'Executive Command';
      else if (formData.role === 'KFC Staff') assignedBadge = 'Canteen Counter';
      else assignedBadge = 'Campus Staff';
    }

    addUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      badge: assignedBadge,
      status: formData.status
    });

    setFormData({
      name: '',
      email: '',
      role: 'Student',
      badge: '',
      status: 'Active'
    });
    setShowAddModal(false);
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      badge: user.badge || '',
      status: user.status || 'Active'
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      addToast('Name and email are required', 'error');
      return;
    }

    updateUser(editingUser.id, editFormData);
    setEditingUser(null);
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  // Switch Portal / Login As
  const handleLoginAs = (user) => {
    loginAsUser(user);
    navigate(user.path || '/student');
  };

  // 8 Room Leads across Block D & Block E
  const roomLeadsList = useMemo(() => {
    const fromUsers = users.filter((u) => u.role === 'Room Lead');
    if (fromUsers.length >= 8) return fromUsers;
    return STAFF_ACCOUNTS.filter((st) => st.role === 'Room Lead');
  }, [users]);

  // Launch role dashboard from Switchboard (auto-switch session for seamless demo access)
  const handleLaunchDashboard = (card) => {
    if (card.id === 'room-lead') {
      setShowRoomLeadModal(true);
      return;
    }
    if (currentUser && currentUser.role === 'Admin') {
      navigate(card.path);
      return;
    }
    if (currentUser && currentUser.role === card.title) {
      navigate(card.path);
      return;
    }
    const matchingUser =
      users.find((u) => u.role === card.title || u.path === card.path) ||
      (Array.isArray(STAFF_ACCOUNTS) && STAFF_ACCOUNTS.find((st) => st.role === card.title || st.path === card.path));
    if (matchingUser) {
      loginAsUser(matchingUser);
    }
    navigate(card.path);
  };

  // Distinct role options for selects
  const roleOptions = [
    'Student',
    'Room Lead',
    'Floor Incharge',
    'Block Coordinator',
    'Mess Incharge',
    'Principal',
    'KFC Staff',
    'Admin'
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar with Tab integration */}
      <Navbar
        currentRole="Admin"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Sub-header / In-page Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-[#1b4d3e] px-3.5 py-1 rounded-full text-xs font-mono font-bold mb-2 border border-emerald-200/70 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1b4d3e]" />
              <span>CAMPUS SUPERADMIN CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'Switchboard' ? 'Role Switchboard' : 'Campus User Manager'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {activeTab === 'Switchboard'
                ? 'Select any portal below or manage campus credentials in the User Manager directory.'
                : 'Provision users, modify roles, suspend or activate logins, and switch sessions in real-time.'}
            </p>
          </div>

          {/* Quick Tab Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('Switchboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Switchboard'
                  ? 'bg-white text-[#1b4d3e] shadow-sm border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Role Switchboard</span>
            </button>

            <button
              onClick={() => setActiveTab('UserManager')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'UserManager'
                  ? 'bg-[#1b4d3e] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Manager</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                activeTab === 'UserManager'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-emerald-100 text-[#1b4d3e]'
              }`}>
                {totalUsersCount}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: ROLE SWITCHBOARD VIEW */}
        {activeTab === 'Switchboard' && (
          <div className="flex-1 flex flex-col justify-between">
            {/* User Manager Quick Access Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1b4d3e] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Campus User Directory & Account Provisioning
                    </h3>
                    <span className="text-[10px] font-mono font-extrabold bg-[#1b4d3e] text-emerald-100 px-2 py-0.5 rounded-md">
                      {totalUsersCount} Accounts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Add new campus accounts, update student room numbers, suspend credentials, or inspect active logins.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('UserManager')}
                className="inline-flex items-center justify-center gap-2 bg-[#1b4d3e] hover:bg-[#153e32] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer hover:shadow-md"
              >
                <span>Open User Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Role Switchboard Header */}
            <div className="text-center pt-2 pb-6 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Campus Multi-Role Hierarchy
              </h2>
              <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Directly launch any authorized campus dashboard to monitor live meal counts, pre-orders, kitchen production, or hostel rooms.
              </p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-2">
              {roleCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleLaunchDashboard(card)}
                    className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/5 hover:-translate-y-0.5 hover:border-emerald-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#1b4d3e] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5 text-emerald-200" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#1b4d3e] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70">
                          {card.badge}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{card.emoji}</span>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1b4d3e] transition-colors">
                          {card.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
                        {card.description}
                      </p>
                    </div>

                    {/* Action Link */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[#1b4d3e]">
                      <span className="text-xs font-bold font-mono uppercase tracking-wider group-hover:underline">
                        Open Dashboard
                      </span>
                      <div className="w-7 h-7 rounded-full bg-emerald-50 group-hover:bg-[#1b4d3e] group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Info */}
            <footer className="text-center pt-8 pb-2">
              <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#1b4d3e]" /> Multi-Role SaaS Hierarchy
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <UtensilsCrossed className="w-4 h-4 text-[#1b4d3e]" /> Integrated KFC Express
                </span>
              </div>
            </footer>
          </div>
        )}

        {/* TAB 2: USER MANAGER VIEW */}
        {activeTab === 'UserManager' && (
          <div className="flex-1 flex flex-col gap-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Users
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                  {totalUsersCount}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Across all campus categories
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Active Accounts
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1b4d3e] mt-2 font-mono">
                  {activeUsersCount}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Authorized to login</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Suspended
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                    <UserX className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-2 font-mono">
                  {suspendedUsersCount}
                </div>
                <p className="text-[11px] text-amber-600 font-medium mt-1">
                  Access blocked at login
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Roles Covered
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                  {distinctRolesCount} / 8
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Hierarchical role templates
                </p>
              </div>
            </div>

            {/* Controls Bar: Search, Role Filter, Status Filter, Add User */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, role, or room/badge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e] bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Action */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1b4d3e] cursor-pointer"
                >
                  <option value="All">All Roles ({totalUsersCount})</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1b4d3e] cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only ({activeUsersCount})</option>
                  <option value="Suspended">Suspended Only ({suspendedUsersCount})</option>
                </select>

                {/* Add User Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 bg-[#1b4d3e] hover:bg-[#153e32] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-md ml-auto md:ml-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">User Details</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 hidden md:table-cell">Campus Assignment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 hidden lg:table-cell">Last Active</th>
                      <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                          <p className="font-semibold text-sm text-slate-700">No campus users found</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Try adjusting your search query or role filter.
                          </p>
                          {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setRoleFilter('All');
                                setStatusFilter('All');
                              }}
                              className="mt-3 px-3 py-1.5 bg-emerald-50 text-[#1b4d3e] rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                            >
                              Reset Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSuspended = user.status === 'Suspended';
                        const firstInitial = user.name.charAt(0).toUpperCase();

                        return (
                          <tr
                            key={user.id}
                            className={`hover:bg-slate-50/60 transition-colors ${
                              isSuspended ? 'bg-red-50/20' : ''
                            }`}
                          >
                            {/* User details */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                                  isSuspended
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-[#1b4d3e] text-emerald-100'
                                }`}>
                                  {firstInitial}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 truncate">
                                      {user.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                      {user.id}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{user.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${
                                user.role === 'Admin'
                                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                                  : user.role === 'Principal'
                                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                  : user.role === 'KFC Staff'
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : user.role === 'Mess Incharge'
                                  ? 'bg-orange-50 text-orange-900 border-orange-200'
                                  : 'bg-emerald-50 text-[#1b4d3e] border-emerald-200/80'
                              }`}>
                                {user.role}
                              </span>
                            </td>

                            {/* Campus Assignment / Badge */}
                            <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap text-slate-600">
                              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                                {user.badge || 'Campus Member'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                                title="Click to toggle Active / Suspended status"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                                  isSuspended
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                <span>{user.status || 'Active'}</span>
                              </button>
                            </td>

                            {/* Last Active */}
                            <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap text-slate-400 font-mono text-[11px]">
                              {user.lastActive || 'Recently'}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Switch Portal / Login As */}
                                <button
                                  onClick={() => handleLoginAs(user)}
                                  title={`Switch portal session to ${user.name} (${user.role})`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-[#1b4d3e] text-[#1b4d3e] hover:text-white rounded-lg text-[11px] font-bold transition-all border border-emerald-200/80 cursor-pointer shadow-2xs"
                                >
                                  <span>Portal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => openEditModal(user)}
                                  title="Edit user details"
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => setDeletingUser(user)}
                                  title="Delete user account"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer with count info */}
              <div className="bg-slate-50/70 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing <b>{filteredUsers.length}</b> of <b>{totalUsersCount}</b> registered campus accounts
                </span>
                <span className="font-mono text-[11px]">
                  Real-time synchronization enabled
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW USER */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Provision Campus User</h3>
                  <p className="text-xs text-slate-500">Create a new account with customized role and location</p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Varma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Campus Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.varma@demo.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Campus Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1b4d3e] bg-white cursor-pointer"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1b4d3e] bg-white cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Room / Assignment Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room D-101 • Block D (Optional)"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to auto-generate default badge for the selected role.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1b4d3e] hover:bg-[#153e32] text-white transition-colors shadow-xs"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT USER */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setEditingUser(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1b4d3e] flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit User Details</h3>
                  <p className="text-xs text-slate-500">Modifying profile for {editingUser.name}</p>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Campus Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Campus Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1b4d3e] bg-white cursor-pointer"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#1b4d3e] bg-white cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Room / Assignment Badge
                  </label>
                  <input
                    type="text"
                    value={editFormData.badge}
                    onChange={(e) => setEditFormData({ ...editFormData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b4d3e]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1b4d3e] hover:bg-[#153e32] text-white transition-colors shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: DELETE CONFIRMATION */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <h3 className="text-center text-lg font-bold text-slate-900">
                Delete User Account?
              </h3>
              <p className="text-center text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently remove <b>{deletingUser.name}</b> ({deletingUser.email})? This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ROOM LEAD SELECTION MODAL (8 ROOMS) */}
        {showRoomLeadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowRoomLeadModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1b4d3e] text-emerald-100 flex items-center justify-center">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Select Room Lead Portal (8 Rooms)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    40 students across 8 rooms (5 members per room) • Blocks D & E
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 my-4">
                {roomLeadsList.map((lead) => {
                  const roomMatch = (lead.badge || lead.name || '').match(/Room\s+[DE]-\d{3}/i);
                  const roomTitle = roomMatch ? roomMatch[0] : (lead.badge || 'Room Lead');
                  const isBlockD = roomTitle.includes('D-');

                  return (
                    <div
                      key={lead.id || lead.email}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{roomTitle}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isBlockD ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isBlockD ? 'Block D' : 'Block E'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                          {lead.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {lead.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          loginAsUser(lead);
                          setShowRoomLeadModal(false);
                          navigate('/room-lead');
                        }}
                        className="mt-2.5 w-full bg-[#1b4d3e] hover:bg-[#163f33] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Launch Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">All 8 Room Leads configured</span>
                <button
                  type="button"
                  onClick={() => setShowRoomLeadModal(false)}
                  className="px-4 py-1.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainDashboards;
