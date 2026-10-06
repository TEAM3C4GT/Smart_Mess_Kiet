import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({
  items = [],
  activeTab = 'Dashboard',
  onTabChange = () => {},
  darkMode = false,
  basicColors = false,
  onLogout
}) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <aside className={`w-full lg:w-64 border-r p-4 shrink-0 transition-colors duration-300 lg:sticky lg:top-[57px] lg:self-start lg:h-[calc(100vh-57px)] flex flex-col justify-between lg:overflow-y-auto z-20 ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
    }`}>
      {/* Top Navigation Items */}
      <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        {items.map((item, idx) => {
          if (item.isHeader) {
            return (
              <div
                key={item.header || idx}
                className="pt-3 pb-1 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 mt-2 first:mt-0 first:border-0 select-none"
              >
                {item.header}
              </div>
            );
          }
          const itemId = item.id || item.name || item.label;
          const itemLabel = item.label || item.name || item.id;
          const Icon = item.icon;
          const isActive =
            activeTab === itemId || activeTab === itemLabel || activeTab === item.name;

          const hasBadge =
            item.badge !== undefined &&
            item.badge !== null &&
            item.badge !== '' &&
            item.badge !== 0;

          return (
            <button
              key={itemId}
              onClick={() => onTabChange(itemId)}
              className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap text-left cursor-pointer ${
                isActive
                  ? darkMode
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs font-semibold'
                    : 'bg-[#1b4d3e] text-white shadow-xs font-semibold'
                  : darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  />
                )}
                <span>{itemLabel}</span>
              </div>
              {hasBadge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Active User Snapshot & Log Out Option */}
      <div className="pt-4 mt-auto border-t border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0">
        {currentUser && (
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className={`text-xs font-bold truncate leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 uppercase truncate">
                {currentUser?.role || 'Campus User'}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
