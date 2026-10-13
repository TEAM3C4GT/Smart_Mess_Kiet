import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({
  items = [],
  activeTab = 'Dashboard',
  onTabChange = () => {},
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
    <aside className="w-full lg:w-64 border-r border-[#DCE4EF] bg-white p-4 shrink-0 transition-colors duration-300 lg:sticky lg:top-[57px] lg:self-start lg:h-[calc(100vh-57px)] flex flex-col justify-between lg:overflow-y-auto z-20">
      <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        {items.map((item, idx) => {
          if (item.isHeader) {
            return (
              <div
                key={item.header || idx}
                className="pt-3 pb-1 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8494AB] border-t border-[#EDF2F9] mt-2 first:mt-0 first:border-0 select-none"
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
                  ? 'bg-[#355F97] text-white shadow-xs font-semibold'
                  : 'text-[#65748A] hover:text-[#293749] hover:bg-[#EDF2F9]'
              }`}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8494AB]'}`} />
                )}
                <span>{itemLabel}</span>
              </div>
              {hasBadge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#D5E4F8] text-[#355F97] border border-[#DCE4EF]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 mt-auto border-t border-[#DCE4EF] space-y-2 shrink-0">
        {currentUser && (
          <div className="px-3.5 py-2 rounded-xl bg-[#EDF2F9] border border-[#DCE4EF] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#355F97] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate leading-tight text-[#293749]">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] font-mono text-[#65748A] uppercase truncate">
                {currentUser?.role || 'Campus User'}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs text-[#C63352] hover:bg-[#fbeaee] border border-transparent hover:border-[#f3cdd8] transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#C63352]" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
