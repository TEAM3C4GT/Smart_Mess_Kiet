import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BedDouble,
  Building2,
  Boxes,
  CookingPot,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Utensils
} from 'lucide-react';

export const MainDashboards = () => {
  const navigate = useNavigate();

  const roleCards = [
    {
      id: 'principal',
      title: 'Principal',
      icon: ShieldCheck,
      emoji: '🏛️',
      path: '/principal',
      description: 'Executive analytics on food wastage, block attendance, and campus KFC footfall.',
      badge: 'Executive Command Center',
      color: 'from-violet-700 to-purple-900',
      lightBg: 'bg-purple-50/80',
      borderHover: 'hover:border-purple-400'
    },
    {
      id: 'kfc-staff',
      title: 'KFC Staff',
      icon: Utensils,
      emoji: '🍗',
      path: '/kfc-staff',
      description: 'Live order queue, token pickup verification, and menu stock availability.',
      badge: 'Canteen Order Fulfillment',
      color: 'from-purple-600 to-indigo-600',
      lightBg: 'bg-purple-50/80',
      borderHover: 'hover:border-purple-300'
    },
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      emoji: '🎓',
      path: '/student',
      description: "Select tomorrow's meals and order KFC without waiting.",
      badge: 'Meal Selection & KFC',
      color: 'from-purple-600 to-indigo-600',
      lightBg: 'bg-purple-50/80',
      borderHover: 'hover:border-purple-300'
    },
    {
      id: 'room-lead',
      title: 'Room Lead',
      icon: BedDouble,
      emoji: '🛏️',
      path: '/room-lead',
      description: 'Track room submissions and remind pending students.',
      badge: 'Room 302 Tracking',
      color: 'from-purple-600 to-violet-600',
      lightBg: 'bg-indigo-50/80',
      borderHover: 'hover:border-indigo-300'
    },
    {
      id: 'floor-incharge',
      title: 'Floor Incharge',
      icon: Building2,
      emoji: '🏢',
      path: '/floor-incharge',
      description: 'Monitor floor participation and identify low-submission rooms.',
      badge: 'Floor 2 Management',
      color: 'from-purple-700 to-purple-900',
      lightBg: 'bg-purple-50/80',
      borderHover: 'hover:border-purple-400'
    },
    {
      id: 'block-coordinator',
      title: 'Block Coordinator',
      icon: Boxes,
      emoji: '🏬',
      path: '/block-coordinator',
      description: 'Consolidate floor-wise meal counts for the block.',
      badge: 'Block B Summary',
      color: 'from-indigo-600 to-purple-800',
      lightBg: 'bg-indigo-50/80',
      borderHover: 'hover:border-indigo-400'
    },
    {
      id: 'mess-incharge',
      title: 'Mess Incharge',
      icon: CookingPot,
      emoji: '🍲',
      path: '/mess-incharge',
      description: 'Monitor final headcount, meal planning and kitchen preparation.',
      badge: 'Final Headcount & Kitchen',
      color: 'from-purple-800 to-indigo-900',
      lightBg: 'bg-purple-50/80',
      borderHover: 'hover:border-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-purple-50/30 to-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-12">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full text-center pt-4 pb-8">
        <div className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 border border-purple-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Smart Mess & KFC SaaS Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          SMART MESS & KFC <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
            MANAGEMENT SYSTEM
          </span>
        </h1>

        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-purple-200"></span>
          <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-slate-500">
            DASHBOARDS
          </p>
          <span className="h-px w-12 bg-purple-200"></span>
        </div>
        
        <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">
          Select a role to inspect real-time meal selections, headcount forecasts, KFC pre-orders, and hierarchy notifications.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-auto">
        {roleCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className={`group relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${card.borderHover}`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-100/70 px-2.5 py-1 rounded-full border border-purple-200/60">
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{card.emoji}</span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {card.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-purple-700 group-hover:text-purple-800">
                <span className="text-sm font-bold">Open Dashboard</span>
                <div className="w-8 h-8 rounded-full bg-purple-50 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto w-full text-center pt-10 pb-4">
        <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Multi-Role SaaS Hierarchy
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-purple-600" /> Integrated KFC Express
          </span>
        </div>
      </footer>
    </div>
  );
};
