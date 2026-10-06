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
  Sparkles,
  BedDouble,
  ChevronDown,
  ChevronUp,
  LogIn
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoomLeads, setShowRoomLeads] = useState(true);

  // 8 Room Leads across Block D (4 rooms) and Block E (4 rooms)
  const roomLeads = [
    { room: 'Room D-101', name: 'Alex Rivers', email: 'nithin.roomlead@gmail.com', block: 'Block D • Floor 1', code: 'd101' },
    { room: 'Room D-102', name: 'Abhishek Tiwari', email: 'abhishek.lead@kiet.edu', block: 'Block D • Floor 1', code: 'd102' },
    { room: 'Room D-201', name: 'Prashant Singh', email: 'prashant.lead@kiet.edu', block: 'Block D • Floor 2', code: 'd201' },
    { room: 'Room D-202', name: 'Vaibhav Goyal', email: 'vaibhav.lead@kiet.edu', block: 'Block D • Floor 2', code: 'd202' },
    { room: 'Room E-101', name: 'SRIRAM', email: 'sriram.lead@kiet.edu', block: 'Block E • Floor 1', code: 'e101' },
    { room: 'Room E-102', name: 'Aaditya Nair', email: 'aaditya.lead@kiet.edu', block: 'Block E • Floor 1', code: 'e102' },
    { room: 'Room E-201', name: 'Kavya Madhavan', email: 'kavya.lead@kiet.edu', block: 'Block E • Floor 2', code: 'e201' },
    { room: 'Room E-202', name: 'Pooja Hegde', email: 'pooja.lead@kiet.edu', block: 'Block E • Floor 2', code: 'e202' }
  ];

  const handleQuickFill = (emailVal, passVal = '123456789') => {
    setIdentifier(emailVal);
    setPassword(passVal);
  };

  const handleDirectLogin = (emailVal, passVal = '123456789') => {
    setIdentifier(emailVal);
    setPassword(passVal);
    setIsSubmitting(true);
    setTimeout(() => {
      const session = login(emailVal, passVal);
      setIsSubmitting(false);
      if (session && session.path) {
        navigate(session.path);
      }
    }, 200);
  };

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

          {/* Quick 8 Room Lead Logins Panel */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div 
              onClick={() => setShowRoomLeads(!showRoomLeads)}
              className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/80"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1b4d3e] text-emerald-100 flex items-center justify-center shrink-0">
                  <BedDouble className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">8 Room Lead Logins</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-[#1b4d3e] px-1.5 py-0.2 rounded">
                      8 Rooms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">40 Students (5 per room) • Blocks D & E</p>
                </div>
              </div>
              <div className="text-slate-400 p-1">
                {showRoomLeads ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showRoomLeads && (
              <div className="mt-2.5 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {roomLeads.map((rl) => (
                    <div 
                      key={rl.room}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-500/70 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{rl.room}</span>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-1 py-0.5 rounded">
                            {rl.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-800 font-semibold truncate mt-0.5">{rl.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{rl.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleQuickFill(rl.email, '123456789')}
                          className="flex-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Autofill
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin(rl.email, '123456789')}
                          className="flex-1 text-[10px] font-bold text-white bg-[#1b4d3e] hover:bg-[#163f33] py-1 rounded-md transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Login</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 text-center font-medium pt-0.5">
                  Standard password for all Room Leads is <span className="font-mono font-bold text-slate-700">123456789</span>. You can also type room shortcodes (<span className="font-mono font-bold">d101</span>, <span className="font-mono font-bold">e201</span>).
                </p>
              </div>
            )}
          </div>

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
