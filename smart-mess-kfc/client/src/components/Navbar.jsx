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
  onStudentTabChange
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const isStudentPortal = currentRole === 'Student' || location.pathname === '/student';
  const isPrincipalPortal = currentRole === 'Principal' || location.pathname === '/principal';

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

  // User badge info
  let userInitial = 'U';
  let userName = currentUser?.name || 'User';
  let userRoleLabel = currentUser?.role?.toUpperCase() || 'USER';

  if (isStudentPortal) {
    userInitial = 'A';
    userName = 'Aarav Sharma';
    userRoleLabel = 'STUDENT';
  } else if (isPrincipalPortal) {
    userInitial = 'D';
    userName = 'Dr. Sunita Rao';
    userRoleLabel = 'PRINCIPAL';
  } else if (currentUser?.name) {
    userInitial = currentUser.name.charAt(0);
    userName = currentUser.name;
    userRoleLabel = currentUser.role?.toUpperCase() || 'USER';
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="flex items-center gap-2.5 group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1b4d3e] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-400 block leading-tight">
              CAMPUS OS
            </span>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
              Smart Mess • KFC
            </span>
          </div>
        </Link>

        {!isStudentPortal && !isPrincipalPortal && currentRole && (
          <div className="flex items-center gap-2 text-slate-400 pl-2 sm:pl-4 border-l border-slate-200">
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 bg-emerald-50 text-emerald-900 px-3 py-1 rounded-full border border-emerald-200/70">
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
                    ? 'bg-[#e6f4ea] text-[#1b4d3e] font-bold shadow-xs border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1b4d3e]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* CENTER: Principal Nav Tabs (Matching Reference Screenshots 1, 3, 4, 5) */}
      {isPrincipalPortal && currentTabChangeHandler && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-2xl border border-slate-200/70">
          {principalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => currentTabChangeHandler(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e6f4ea] text-[#1b4d3e] font-bold shadow-xs border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1b4d3e]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <button
          onClick={() => {
            if (currentTabChangeHandler) {
              currentTabChangeHandler('Alerts');
            }
          }}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 ring-2 ring-white"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Badge with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase block leading-tight">
                {userRoleLabel}
              </span>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{userName}</p>
                <p className="text-[11px] text-slate-500 font-mono">{currentUser?.email || 'user@demo.edu'}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/dashboards"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                  All Portals
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
