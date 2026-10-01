import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  BedDouble,
  Building2,
  Boxes,
  ChefHat,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

const ROLES = [
  { label: 'Student', desc: 'Choose meals and order KFC', path: '/student', icon: GraduationCap },
  { label: 'Room Lead', desc: 'Verify Room D-101 submissions', path: '/room-lead', icon: BedDouble },
  { label: 'Floor Incharge', desc: 'Monitor Floor 1 participation', path: '/floor-incharge', icon: Building2 },
  { label: 'Block Coordinator', desc: 'Consolidate Block D & E counts', path: '/block-coordinator', icon: Boxes },
  { label: 'Mess Incharge', desc: 'Kitchen headcount and menu', path: '/mess-incharge', icon: ChefHat },
  { label: 'Principal', desc: 'Campus wastage and analytics', path: '/principal', icon: ShieldCheck },
  { label: 'KFC Staff', desc: 'Order queue and stock', path: '/kfc-staff', icon: ShoppingBag },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-stone-900 antialiased">
      <header className="border-b border-stone-200/80 bg-[#f7f4ef]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b4d3e] text-[#e8f2ec] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="block text-[10px] tracking-[0.14em] uppercase text-stone-500 font-medium">KIET</span>
              <span className="block text-sm font-semibold tracking-tight">Smart Mess</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600">
            <a href="#how" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="#roles" className="hover:text-stone-900 transition-colors">Roles</a>
            <Link to="/dashboards" className="hover:text-stone-900 transition-colors">Portals</Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 bg-[#1b4d3e] hover:bg-[#163f33] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileNav((v) => !v)}
            aria-expanded={mobileNav}
            aria-label={mobileNav ? 'Close menu' : 'Open menu'}
            className="md:hidden w-10 h-10 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-700"
          >
            {mobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {mobileNav && (
          <div className="md:hidden border-t border-stone-200 bg-[#f7f4ef] px-5 py-4 space-y-3">
            <a href="#how" onClick={() => setMobileNav(false)} className="block text-sm text-stone-700">How it works</a>
            <a href="#roles" onClick={() => setMobileNav(false)} className="block text-sm text-stone-700">Roles</a>
            <Link to="/dashboards" onClick={() => setMobileNav(false)} className="block text-sm text-stone-700">Portals</Link>
            <Link
              to="/login"
              onClick={() => setMobileNav(false)}
              className="block text-center text-sm font-semibold bg-[#1b4d3e] text-white py-2.5 rounded-lg"
            >
              Sign in
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#1b4d3e]">
            Campus meal system
          </p>
          <h1 className="mt-3 max-w-2xl text-[2.35rem] sm:text-5xl font-semibold tracking-tight leading-[1.12] text-stone-900">
            Plan tomorrow&apos;s mess.
            <span className="block text-stone-500 font-normal">Pick up KFC without the wait.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] sm:text-base leading-relaxed text-stone-600">
            Students mark meals before 10 pm. Room leads, floors, and blocks roll the numbers up.
            Mess cooks to the count. KFC tokens move from kitchen to counter in one queue.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#1b4d3e] hover:bg-[#163f33] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboards"
              className="inline-flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Browse portals
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {[
              { label: 'Roles', value: '7' },
              { label: 'Meal cutoff', value: '10:00 pm' },
              { label: 'KFC payment', value: 'Cash' },
              { label: 'Sync', value: 'Live tabs' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-stone-200 bg-white px-3.5 py-3">
                <div className="text-[11px] uppercase tracking-wide text-stone-500">{item.label}</div>
                <div className="mt-1 text-lg font-semibold text-stone-900">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-stone-200 bg-white">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">How it works</h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600 leading-relaxed">
              One path from room to kitchen. No spreadsheet handoffs.
            </p>

            <ol className="mt-8 grid sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: '1',
                  title: 'Students choose',
                  body: 'Toggle breakfast, lunch, snacks, dinner. Order KFC when you want the counter queue, not a walk-in line.',
                },
                {
                  step: '2',
                  title: 'Leads verify',
                  body: 'Room leads chase pending roommates. Floor and block rollups show who is still open before cutoff.',
                },
                {
                  step: '3',
                  title: 'Kitchen cooks',
                  body: 'Mess sees locked headcount. KFC staff advances tokens from pending to ready at the counter.',
                },
              ].map((item) => (
                <li key={item.step} className="relative">
                  <div className="text-xs font-semibold tracking-wide text-[#1b4d3e] uppercase">Step {item.step}</div>
                  <h3 className="mt-2 text-base font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="roles" className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">Portals by role</h2>
              <p className="mt-2 text-sm text-stone-600">Open any portal directly, or sign in with your campus account.</p>
            </div>
            <Link to="/dashboards" className="text-sm font-semibold text-[#1b4d3e] hover:underline inline-flex items-center gap-1">
              All portals
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ul className="mt-8 divide-y divide-stone-200 border border-stone-200 rounded-2xl bg-white overflow-hidden">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <li key={role.label}>
                  <button
                    type="button"
                    onClick={() => navigate(role.path)}
                    className="w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="w-9 h-9 rounded-lg bg-[#eef5f1] text-[#1b4d3e] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-stone-900">{role.label}</span>
                      <span className="block text-xs sm:text-sm text-stone-500 mt-0.5">{role.desc}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border-t border-stone-200 bg-white">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
            <div className="rounded-2xl border border-stone-200 bg-[#f7f4ef] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-stone-900">Ready to open your portal</h2>
                <p className="mt-2 text-sm text-stone-600 max-w-md leading-relaxed">
                  Students use roll number as password. Staff use the campus staff password.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-[#1b4d3e] hover:bg-[#163f33] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/student"
                  className="inline-flex items-center gap-2 bg-white border border-stone-300 text-stone-800 text-sm font-semibold px-5 py-2.5 rounded-lg hover:border-stone-400 transition-colors"
                >
                  Open student view
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-stone-500">
          <span>Smart Mess &amp; KFC · KIET</span>
          <span>Cutoff 10:00 pm · Cash at KFC counter</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
