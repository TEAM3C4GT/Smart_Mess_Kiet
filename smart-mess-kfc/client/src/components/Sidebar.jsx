import React from 'react';

export const Sidebar = ({ items = [], activeTab = 'Dashboard', onTabChange = () => {} }) => {
  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200/80 p-4 shrink-0">
      <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap text-left ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />}
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
