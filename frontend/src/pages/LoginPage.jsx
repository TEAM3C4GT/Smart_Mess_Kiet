import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

const SERIF = "Georgia, 'Times New Roman', ui-serif, serif";

const inputClasses =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-base text-stone-900 ' +
  'placeholder-stone-400 outline-none transition-colors ' +
  'focus:border-[#355F97] focus:ring-2 focus:ring-[#355F97]/25 sm:text-sm';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const session = await login(identifier, password);
      if (session?.path) navigate(session.path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-stone-900">
      <div className="h-1.5 bg-[#355F97]" />

      <header className="border-b border-stone-200 bg-white">
        <div className="flex w-full items-start justify-between gap-6 px-3 pt-3 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
          <div className="min-w-0 flex-1 self-start text-left">
            <h1
              style={{ fontFamily: SERIF }}
              className="text-base font-bold leading-tight tracking-[-0.01em] text-[#0f172a] sm:text-2xl"
            >
              Kakinada Institute of Engineering and Technology
            </h1>
            <p className="mt-1 text-sm font-medium text-stone-500 sm:text-lg">
              Made for KIET, made to be eaten 🫶🏻
            </p>
          </div>
          <img
            src="/KIETGroup.jpg"
            alt="KIET Group of Institutions emblem"
            className="ml-auto h-16 w-auto shrink-0 object-contain object-right sm:h-20"
          />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[26rem]">
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 style={{ fontFamily: SERIF }} className="text-xl font-bold text-stone-900 sm:text-2xl">
              Hungry? Sign in
            </h2>
            <p className="mt-1 text-sm text-stone-600">Access your mess and KFC portal.</p>
            <div className="mt-4 h-[3px] w-10 rounded-full bg-[#a97c2f]" aria-hidden="true" />

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600"
                >
                  Roll number or campus email
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="23B21A4225 or staff@kiet.edu"
                  className={inputClasses}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-stone-500">Students: same as roll number</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`${inputClasses} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#355F97] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2B4F80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355F97] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-stone-500">
            Need help signing in? Contact the hostel office or the mess in-charge.
          </p>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1 px-5 py-4 text-[11px] text-stone-500 sm:flex-row sm:text-xs">
          <span>&copy; 2026 Kakinada Institute of Engineering and Technology</span>
          <span>Smart Mess &amp; KFC Campus OS</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
