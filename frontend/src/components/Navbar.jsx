import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Utensils,
  History,
  Bell,
  ChevronRight,
  LogOut,
  LayoutGrid,
  TrendingUp,
  Users,
  CookingPot,
  Scale,
  Layers,
  BrainCircuit,
  AlertTriangle,
  Building,
  Building2,
  LayoutDashboard,
  Clock,
  HeartHandshake,
  BellRing,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({
  currentRole,
  activeTab,
  onTabChange,
  activeStudentTab,
  onStudentTabChange,
  tabs: propTabs
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    roomLeadNotifications = [],
    markRoomLeadNotificationRead,
    markAllRoomLeadNotificationsRead,
    clearRoomLeadNotifications,
    studentNotifications = [],
    markAllNotificationsRead
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const isStudentPortal = currentRole === 'Student' || location.pathname === '/student';
  const isPrincipalPortal = currentRole === 'Principal' || location.pathname === '/principal';
  const isAdminPortal = currentRole === 'Admin' || location.pathname === '/dashboards';

  // Active tab and handler resolution
  const currentActiveTab = activeTab || activeStudentTab;
  const currentTabChangeHandler = onTabChange || onStudentTabChange;

  const studentTabs = [
    { id: 'My Meals', label: 'My Meals', icon: Utensils },
    { id: 'History', label: 'History', icon: History },
    { id: 'KFC', label: 'KFC', icon: UtensilsCrossed },
    { id: 'Alerts', label: 'Alerts', icon: Bell }
  ];

  const messInchargeTabs = [
    { id: "Today's Menu", label: "Today's Menu", icon: UtensilsCrossed },
    { id: 'Headcount & Forecast', label: 'Headcount & Forecast', icon: Scale },
    { id: 'Kitchen Requisitions', label: 'Kitchen Requisitions', icon: Layers },
    { id: 'AI Forecast Engine', label: 'AI Forecast', icon: BrainCircuit },
    { id: 'Anomaly Alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'Student Requests', label: 'Student Requests', icon: CookingPot }
  ];

  const blockCoordinatorTabs = [
    { id: 'Block D', label: 'Block D', icon: Building },
    { id: 'Block E', label: 'Block E', icon: Building },
    { id: 'All', label: 'All Blocks', icon: Layers },
    { id: 'Room Leads', label: 'Room Leads', icon: Users }
  ];

  const roomLeadTabs = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Room Members', label: 'Room Members', icon: Users },
    { id: 'Incharge Alerts', label: 'Alerts', icon: Bell },
    { id: 'Kitchen Requisition', label: 'Requisition', icon: UtensilsCrossed },
    { id: 'Editing Window', label: 'Window', icon: Clock }
  ];

  const floorInchargeTabs = [
    { id: 'Room & Floor Monitoring', label: 'Monitoring', icon: LayoutDashboard },
    { id: 'Floor Roster', label: 'Floor Roster', icon: Users },
    { id: 'Live Room Submissions', label: 'Rooms', icon: Building2 },
    { id: 'Meal Requisition', label: 'Requisition', icon: UtensilsCrossed },
    { id: 'Student Care & Diet', label: 'Care & Diet', icon: HeartHandshake },
    { id: 'Alerts & Nudges', label: 'Alerts', icon: BellRing }
  ];

  const principalTabs = [
    { id: 'Campus Analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'Meal Rollups', label: 'Rollups', icon: Users },
    { id: 'Mess Cook Plan', label: 'Mess Ops', icon: CookingPot },
    { id: 'Alerts & Notices', label: 'Alerts', icon: Bell }
  ];

  const kfcStaffTabs = [
    { id: 'Live Orders', label: 'Live Orders', icon: Clock },
    { id: 'Order History', label: 'History', icon: History },
    { id: 'Menu & Stock', label: 'Menu & Stock', icon: UtensilsCrossed },
    { id: 'Analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const adminTabs = [
    { id: 'Switchboard', label: 'Role Switchboard', icon: LayoutGrid },
    { id: 'UserManager', label: 'User Manager', icon: Users }
  ];

  // Resolve active tabs for top navigation
  const resolvedTabs = propTabs || (
    isStudentPortal ? studentTabs :
    isAdminPortal ? adminTabs :
    isPrincipalPortal ? principalTabs :
    (currentRole === 'Mess Incharge' || location.pathname.includes('mess-incharge')) ? messInchargeTabs :
    (currentRole === 'Block Coordinator' || location.pathname.includes('block-coordinator')) ? blockCoordinatorTabs :
    (currentRole === 'Room Lead' || location.pathname.includes('room-lead')) ? roomLeadTabs :
    (currentRole === 'Floor Incharge' || location.pathname.includes('floor-incharge')) ? floorInchargeTabs :
    (currentRole === 'KFC Staff' || location.pathname.includes('kfc-staff')) ? kfcStaffTabs :
    null
  );

  // User badge info
  let userInitial = 'U';
  let userName = currentUser?.name || 'User';
  let userRoleLabel = currentUser?.role?.toUpperCase() || 'USER';

  if (isStudentPortal) {
    userName = currentUser?.name || 'Student';
    userInitial = (currentUser?.name ? currentUser.name.charAt(0) : 'S').toUpperCase();
    userRoleLabel = currentUser?.rollNo || 'STUDENT';
  } else if (isPrincipalPortal) {
    userInitial = (currentUser?.name ? currentUser.name.charAt(0) : 'P').toUpperCase();
    userName = currentUser?.name || 'Principal';
    userRoleLabel = 'PRINCIPAL';
  } else if (isAdminPortal) {
    userInitial = (currentUser?.name ? currentUser.name.charAt(0) : 'A').toUpperCase();
    userName = currentUser?.name || 'Admin';
    userRoleLabel = 'ADMIN';
  } else if (currentUser?.name) {
    userInitial = currentUser.name.charAt(0).toUpperCase();
    userName = currentUser.name;
    userRoleLabel = currentUser.role?.toUpperCase() || 'USER';
  }

  // Resolve active notifications based on current role/portal
  const isRoomLeadPortal = currentRole === 'Room Lead' || location.pathname.includes('room-lead');

  const activeNotifications = isRoomLeadPortal
    ? roomLeadNotifications
    : isStudentPortal
    ? studentNotifications.map((s, idx) => ({
        id: idx + 1,
        title: s.title || 'Student Mess Notice',
        message: typeof s === 'string' ? s : s.message || s.text || 'Meal notice',
        time: s.time || 'Today',
        read: s.read || false,
        sender: 'Hostel Mess Incharge'
      }))
    : [
        {
          id: 'camp-1',
          title: 'Daily Cutoff Verification Active',
          message: 'Kitchen requisitions for tomorrow are actively monitored.',
          time: 'Active',
          read: true,
          sender: 'Campus Mess OS'
        }
      ];

  const unreadCount = isRoomLeadPortal
    ? roomLeadNotifications.filter((n) => !n.read).length
    : isStudentPortal
    ? studentNotifications.filter((n) => !n.read).length
    : 0;

  const handleMarkAllRead = () => {
    if (isRoomLeadPortal && markAllRoomLeadNotificationsRead) {
      markAllRoomLeadNotificationsRead();
    } else if (markAllNotificationsRead) {
      markAllNotificationsRead();
    }
  };

  const handleClearAll = () => {
    if (isRoomLeadPortal && clearRoomLeadNotifications) {
      clearRoomLeadNotifications();
    }
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-2.5 flex items-center justify-between backdrop-blur-md bg-white/95 border-b border-[#DCE4EF]/80 transition-colors duration-300">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="flex items-center gap-2.5 group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-[#355F97] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-4 h-4 text-slate-200" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-400 block leading-tight">
              CAMPUS OS
            </span>
            <span className="text-sm font-extrabold tracking-tight leading-tight text-[#293749]">
              Smart Mess • KFC
            </span>
          </div>
        </Link>

        {!isStudentPortal && !isAdminPortal && currentRole && (
          <div className="hidden sm:flex items-center gap-2 pl-2 sm:pl-4 border-l border-[#DCE4EF] text-slate-400">
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border bg-[#EDF2F9] text-slate-800 border-slate-300">
              {currentRole}
            </span>
          </div>
        )}
      </div>

      {/* CENTER: Universal Nav Tabs (Dynamic across all roles & synced with sidebar) */}
      {resolvedTabs && resolvedTabs.length > 0 && currentTabChangeHandler && (
        <nav className="hidden md:flex items-center gap-1 bg-[#F5F7FA]/90 p-1 rounded-2xl border border-[#DCE4EF]/80 max-w-[48vw] xl:max-w-2xl overflow-x-auto scrollbar-none shadow-2xs">
          {resolvedTabs
            .filter((tab) => !tab.isHeader)
            .map((tab) => {
              const Icon = tab.icon;
              const tabId = tab.id || tab.name || tab.label;
              const tabLabel = tab.label || tab.name || tab.id;
              const isActive =
                currentActiveTab === tabId ||
                currentActiveTab === tabLabel ||
                currentActiveTab === tab.name ||
                (typeof currentActiveTab === 'string' &&
                  typeof tabId === 'string' &&
                  currentActiveTab.toLowerCase() === tabId.toLowerCase());

              const hasBadge =
                tab.badge !== undefined &&
                tab.badge !== null &&
                tab.badge !== '' &&
                tab.badge !== 0;

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => currentTabChangeHandler(tabId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#355F97] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-[#293749] hover:bg-white/80'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-[#65748A]'
                      }`}
                    />
                  )}
                  <span>{tabLabel}</span>
                  {hasBadge && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.badgeColor
                          ? `${tab.badgeColor} text-white`
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell with Interactive Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl transition-colors cursor-pointer text-[#65748A] hover:text-slate-700 hover:bg-[#EDF2F9]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#355F97] text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-4 z-50 animate-fade-in bg-white border-[#DCE4EF]/90 text-[#293749]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EF]/80">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-xs">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EDF2F9] text-slate-800">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-slate-700 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="my-2.5 max-h-72 overflow-y-auto space-y-2">
                {activeNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <p className="font-semibold text-[#65748A]">No new notifications</p>
                    <p className="text-[11px] mt-0.5">You're completely up to date!</p>
                  </div>
                ) : (
                  activeNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (isRoomLeadPortal && markRoomLeadNotificationRead) {
                          markRoomLeadNotificationRead(notif.id);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        !notif.read
                          ? 'bg-[#EDF2F9] border-slate-300'
                          : 'bg-[#F5F7FA]/80 border-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-[#293749] flex items-center gap-1.5">
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-[#355F97] animate-pulse"></span>}
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        {notif.message}
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#DCE4EF]/60 flex items-center justify-between">
                        <span className="text-[10px] text-[#65748A] font-medium">
                          From: <strong className="text-slate-700">{notif.sender || 'Floor Incharge'}</strong>
                        </span>
                        {isRoomLeadPortal && (
                          !notif.read ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (markRoomLeadNotificationRead) markRoomLeadNotificationRead(notif.id);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-[#355F97] text-white text-[10px] font-bold hover:bg-slate-800 cursor-pointer shadow-xs active:scale-95"
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-700 font-bold">
                              ✓ Read
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#DCE4EF]/80 flex items-center justify-between text-[11px]">
                <button
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="font-bold text-slate-600 hover:text-[#293749] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Badge with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl transition-all cursor-pointer text-left hover:bg-[#EDF2F9]"
          >
            <div className="w-7 h-7 rounded-full bg-[#355F97] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold block leading-tight text-slate-800">
                {userName}
              </span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase block leading-tight">
                {userRoleLabel}
              </span>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border py-2 z-50 animate-fade-in bg-white border-[#DCE4EF]/90">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#293749]">{userName}</p>
                <p className="text-[11px] font-mono text-[#65748A]">{currentUser?.email || 'user@demo.edu'}</p>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
