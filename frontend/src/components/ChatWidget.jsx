import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Check } from 'lucide-react';
import { useApp, authFetch } from '../context/AppContext';

const DEFAULT_SUGGESTIONS = [
  'What can you help me with here?',
  'Show me the current menu',
  'What are the KFC ordering rules?',
  'How does headcount forecasting work?',
];

// Suggested starter questions, tailored to the dashboard the user is currently on.
const SUGGESTIONS_BY_SCOPE = {
  student: [
    "What's on today's mess menu?",
    'How do I opt in or out of a meal?',
    'What are the KFC ordering rules?',
    'When is the meal-selection cutoff?',
  ],
  'room-lead': [
    "Which roommates haven't submitted yet?",
    'How do I submit my room meal choices?',
    'Remind my pending roommates',
    "What's the editing window?",
  ],
  'floor-incharge': [
    'Which rooms on my floor are pending?',
    'Show floor submission progress',
    'How do I remind a Room Lead?',
    'Send my floor requisition to the kitchen',
  ],
  'block-coordinator': [
    'Show Block D vs Block E submission rates',
    'Which rooms are lagging behind?',
    'Consolidate and send the block headcount',
    'How does block aggregation work?',
  ],
  mess: [
    "What's the locked headcount for tomorrow?",
    'How much should I cook per dish?',
    'Show the AI turnout forecast',
    "Record today's actual attendance",
  ],
  principal: [
    'Show the wastage trend',
    "What's the campus submission rate?",
    'Show KFC footfall analytics',
    'Are there any anomalies right now?',
  ],
  kfc: [
    'Show the live order queue',
    'Which menu items are low on stock?',
    "What are today's sales?",
    'How do I mark an order as ready?',
  ],
  admin: [
    'How do I add a new campus user?',
    'Show all campus roles',
    'How do I suspend an account?',
    'Reseed the database',
  ],
  home: DEFAULT_SUGGESTIONS,
};

// The assistant is scoped to whichever dashboard is currently open.
const ROUTE_SCOPES = [
  { test: (p) => p.startsWith('/student'), scope: 'student', label: 'Student Dining Portal' },
  { test: (p) => p.startsWith('/room-lead'), scope: 'room-lead', label: 'Room Lead Hub' },
  { test: (p) => p.startsWith('/floor-incharge'), scope: 'floor-incharge', label: 'Floor Incharge Console' },
  { test: (p) => p.startsWith('/block-coordinator'), scope: 'block-coordinator', label: 'Block Coordinator Hub' },
  { test: (p) => p.startsWith('/mess-incharge'), scope: 'mess', label: 'Mess Incharge Centre' },
  { test: (p) => p.startsWith('/principal'), scope: 'principal', label: 'Principal Dashboard' },
  { test: (p) => p.startsWith('/kfc'), scope: 'kfc', label: 'KFC Express Console' },
  { test: (p) => p.startsWith('/dashboards'), scope: 'admin', label: 'Campus Admin' },
];

const HOME_SCOPE = { scope: 'home', label: 'Project Home' };

const resolveScope = (pathname) => ROUTE_SCOPES.find((entry) => entry.test(pathname)) || HOME_SCOPE;

export const ChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useApp();
  const { scope, label } = resolveScope(location.pathname);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm Mess Guide - your assistant for the ${label}. Ask me anything about this screen.`,
    },
  ]);
  const scrollRef = useRef(null);

  // Reset the conversation whenever the open dashboard changes, so the greeting
  // and starter questions always match the screen the user is currently on.
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi, I'm Mess Guide - your assistant for the ${label}. Ask me anything about this screen.`,
      },
    ]);
  }, [scope, label]);

  const scopeSuggestions = SUGGESTIONS_BY_SCOPE[scope] || DEFAULT_SUGGESTIONS;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The assistant belongs to the signed-in dashboards, not the public login screen.
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  const send = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          role: currentUser?.role || null,
          scope,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message || "I couldn't reach the guide service.", error: true },
        ]);
        return;
      }

      const action = data.action || null;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || '(no reply)',
          sources: data.sources || [],
          action,
          actionState: action?.type === 'pending_action' ? 'pending' : null,
        },
      ]);

      if (action?.type === 'ui' && typeof action?.args?.page === 'string' && action.args.page.startsWith('/')) {
        navigate(action.args.page);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Mess Guide is offline right now. Please try again shortly.', error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setActionState = (idx, actionState) =>
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, actionState } : m)));

  const confirmAction = async (idx) => {
    const target = messages[idx];
    if (!target?.action || target.actionState !== 'pending') return;

    setActionState(idx, 'running');
    try {
      const res = await authFetch('/api/chat/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: target.action.tool, args: target.action.args || {} }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && data.success;

      setActionState(idx, ok ? 'done' : 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: ok
            ? `Done - ${target.action.summary || target.action.tool}.`
            : data.message || 'That action could not be completed.',
          error: !ok,
        },
      ]);
    } catch (err) {
      setActionState(idx, 'error');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Action failed - the server is unreachable.', error: true },
      ]);
    }
  };

  const dismissAction = (idx) => setActionState(idx, 'cancelled');

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[22rem] max-w-[calc(100vw-2.5rem)] h-[28rem] bg-white border border-stone-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#355F97] text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <div className="leading-tight">
                <div className="text-sm font-semibold">Mess Guide</div>
                <div className="text-[11px] text-[#D5E4F8]/80">{label}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Mess Guide"
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#F5F7FA]">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ' +
                    (m.role === 'user'
                      ? 'bg-[#355F97] text-white rounded-br-sm'
                      : m.error
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 rounded-bl-sm'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm')
                  }
                >
                  {m.content}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                      Sources:{' '}
                      {m.sources
                        .map((s) => (typeof s === 'string' ? s : s?.title || ''))
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                  {m.action?.type === 'pending_action' && (
                    <div className="mt-2 pt-2 border-t border-stone-100">
                      {m.actionState === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => confirmAction(idx)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#355F97] hover:bg-[#2B4F80] text-white px-2.5 py-1 rounded-md"
                          >
                            <Check className="w-3 h-3" />
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => dismissAction(idx)}
                            className="text-[11px] font-medium border border-stone-300 text-stone-600 px-2.5 py-1 rounded-md hover:border-stone-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : m.actionState === 'running' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Running...
                        </div>
                      ) : (
                        <div
                          className={
                            'text-[11px] ' +
                            (m.actionState === 'done'
                              ? 'text-[#355F97]'
                              : m.actionState === 'cancelled'
                              ? 'text-stone-400'
                              : 'text-rose-600')
                          }
                        >
                          {m.actionState === 'done'
                            ? 'Completed'
                            : m.actionState === 'cancelled'
                            ? 'Cancelled'
                            : 'Failed'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-3 py-2 text-stone-500 flex items-center gap-2 text-[13px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {scopeSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:border-[#355F97] hover:text-[#355F97] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 px-3 py-3 border-t border-stone-200 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the mess system..."
              aria-label="Message Mess Guide"
              className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-[#355F97]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-lg bg-[#355F97] text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Mess Guide' : 'Ask Mess Guide'}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-[#355F97] hover:bg-[#2B4F80] text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
