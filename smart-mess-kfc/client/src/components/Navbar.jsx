import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, Calendar, Bell, ChevronRight } from 'lucide-react';

export const Navbar = ({ currentRole }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block">
              Smart Mess & KFC
            </span>
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              Management System
            </span>
          </div>
        </Link>

        {currentRole && (
          <div className="flex items-center gap-2 text-slate-400 pl-2 sm:pl-4 border-l border-slate-200">
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 bg-purple-50 text-purple-800 px-3 py-1 rounded-full border border-purple-200/60">
              {currentRole}
            </span>
          </div>
        )}
      </div>

      {/* Quick Nav Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-purple-600" />
          <span>Sunday, 14 Sept (Tomorrow's Meal Plan)</span>
        </div>

        {location.pathname !== '/' && (
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-all border border-purple-200"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Switch Role</span>
          </Link>
        )}

        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
