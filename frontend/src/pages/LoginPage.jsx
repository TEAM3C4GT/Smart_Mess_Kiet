import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const session = login(identifier, password);
      setIsSubmitting(false);
      if (session && session.path) {
        navigate(session.path);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* LEFT PANE: Deep Forest Green Branding Banner */}
      <div className="w-full lg:w-[50%] bg-[#1b4d3e] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden shrink-0">
        {/* Subtle background ambient blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-800/70 border border-emerald-600/40 flex items-center justify-center text-emerald-100 shadow-sm">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-widest text-emerald-200/80 uppercase block font-semibold">
              CAMPUS OS
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
              Smart Mess & KFC
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-16 lg:my-auto max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/50 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-emerald-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>KIET CAMPUS MANAGEMENT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-[1.15]">
            Zero-waste mess.<br />
            <span className="text-[#a7f3d0] font-extrabold">
              Instant KFC pickup.
            </span>
          </h1>

          <p className="mt-5 text-emerald-100/90 text-sm sm:text-base leading-relaxed font-normal">
            Role-based meal planning, live hierarchy rollups, and a food-court queue that never keeps you waiting.
          </p>

          {/* Badges */}
          <div className="mt-8 flex items-center gap-6 text-xs text-emerald-200/90 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#a7f3d0]" />
              <span>8 roles</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#a7f3d0]" />
              <span>Live queue</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-4">
          <p className="text-xs font-mono text-emerald-300/60 tracking-wider">
            v1 • Warm campus, tactical speed.
          </p>
        </div>
      </div>

      {/* RIGHT PANE: Clean Sign In Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-white lg:bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl lg:border lg:border-slate-200/90 lg:shadow-sm p-6 sm:p-9 transition-all">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign in
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Enter your Roll Number or Campus Email to access your portal.
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Roll Number / Campus Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                placeholder="e.g. 23B21A4225 or nithin.kfcstaff@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4d3e] focus:border-transparent transition-all bg-white font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Students: Same as Roll No
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Roll No for students / Password for staff"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4d3e] focus:border-transparent transition-all bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1b4d3e] hover:bg-[#163f33] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-5"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-8 pt-5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Looking for all portals?</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-slate-500 hover:text-slate-800 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboards')}
                className="text-[#1b4d3e] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Dashboards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
