import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Utensils,
  History,
  Bell,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  LayoutGrid,
  TrendingUp,
  Users,
  CookingPot
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({
  currentRole,
  activeTab,
  onTabChange,
  activeStudentTab,
  onStudentTabChange,
  darkMode,
  onToggleDarkMode
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
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const darkActive = darkMode !== undefined ? darkMode : isDark;

  const handleToggleDark = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      setIsDark(prev => !prev);
    }
  };

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

  const principalTabs = [
    { id: 'Analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'Rollups', label: 'Rollups', icon: Users },
    { id: 'Mess', label: 'Mess', icon: CookingPot },
    { id: 'Alerts', label: 'Alerts', icon: Bell }
  ];

  const adminTabs = [
    { id: 'Switchboard', label: 'Role Switchboard', icon: LayoutGrid },
    { id: 'UserManager', label: 'User Manager', icon: Users }
  ];

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
    <header className={`sticky top-0 z-30 px-4 lg:px-8 py-2.5 flex items-center justify-between backdrop-blur-md transition-colors duration-300 ${
      darkActive ? 'bg-slate-900/95 border-b border-slate-800' : 'bg-white/95 border-b border-slate-200/80'
    }`}>
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="flex items-center gap-2.5 group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-4 h-4 text-slate-200" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-400 block leading-tight">
              CAMPUS OS
            </span>
            <span className={`text-sm font-extrabold tracking-tight leading-tight ${darkActive ? 'text-white' : 'text-slate-900'}`}>
              Smart Mess • KFC
            </span>
          </div>
        </Link>

        {!isStudentPortal && !isPrincipalPortal && !isAdminPortal && currentRole && (
          <div className={`flex items-center gap-2 pl-2 sm:pl-4 border-l ${darkActive ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-400'}`}>
            <ChevronRight className="w-4 h-4" />
            <span className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border ${
              darkActive
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}>
              {currentRole}
            </span>
          </div>
        )}
      </div>

      {/* CENTER: Student Nav Tabs */}
      {isStudentPortal && currentTabChangeHandler && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-2xl border border-slate-200/70">
          {studentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => currentTabChangeHandler(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs dark:bg-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* CENTER: Principal Nav Tabs (Matching Reference Screenshots 1, 3, 4, 5) */}
      {isPrincipalPortal && currentTabChangeHandler && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          {principalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => currentTabChangeHandler(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs dark:bg-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* CENTER: Admin Nav Tabs */}
      {isAdminPortal && currentTabChangeHandler && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => currentTabChangeHandler(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs dark:bg-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
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
            className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
              darkActive
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-4 z-50 animate-fade-in ${
              darkActive ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span className="font-bold text-xs">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="my-2.5 max-h-72 overflow-y-auto space-y-2">
                {activeNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <p className="font-semibold text-slate-500">No new notifications</p>
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
                          ? darkActive
                            ? 'bg-slate-800/80 border-slate-700'
                            : 'bg-slate-100 border-slate-300'
                          : darkActive
                          ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                          : 'bg-slate-50/80 border-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-100 animate-pulse"></span>}
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${darkActive ? 'text-slate-300' : 'text-slate-600'}`}>
                        {notif.message}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          From: <strong className="text-slate-700 dark:text-slate-200">{notif.sender || 'Floor Incharge'}</strong>
                        </span>
                        {isRoomLeadPortal && (
                          !notif.read ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (markRoomLeadNotificationRead) markRoomLeadNotificationRead(notif.id);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer shadow-xs active:scale-95"
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">
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
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={handleToggleDark}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            darkActive
              ? 'text-slate-200 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title={darkActive ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
        >
          {darkActive ? <Sun className="w-4 h-4 text-slate-200" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Badge with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl transition-all cursor-pointer text-left ${
              darkActive ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="hidden sm:block">
              <span className={`text-xs font-bold block leading-tight ${darkActive ? 'text-white' : 'text-slate-800'}`}>
                {userName}
              </span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase block leading-tight">
                {userRoleLabel}
              </span>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border py-2 z-50 animate-fade-in ${
              darkActive ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200/90'
            }`}>
              <div className={`px-3 py-2 border-b ${darkActive ? 'border-slate-700' : 'border-slate-100'}`}>
                <p className={`text-xs font-bold ${darkActive ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
                <p className={`text-[11px] font-mono ${darkActive ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.email || 'user@demo.edu'}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/dashboards"
                  onClick={() => setShowUserMenu(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold ${
                    darkActive ? 'text-slate-300 hover:bg-slate-700/60' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                  All Portals
                </Link>
              </div>

              <div className={`pt-1 border-t ${darkActive ? 'border-slate-700' : 'border-slate-100'}`}>
                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 ${
                    darkActive ? 'hover:bg-rose-950/30' : 'hover:bg-red-50'
                  } text-left cursor-pointer`}
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
