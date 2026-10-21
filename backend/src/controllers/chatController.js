import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Student, Menu, KFCMenuItem } from '../models/Schemas.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The tool schema is the single source of truth shared with the Python service.
const candidateSchemaPaths = [
  path.resolve(__dirname, '..', '..', 'ai-service', 'training', 'tools_schema.json'),
  path.resolve(process.cwd(), 'backend', 'ai-service', 'training', 'tools_schema.json'),
  path.resolve(process.cwd(), 'ai-service', 'training', 'tools_schema.json'),
  path.resolve('/var/task/backend/ai-service/training/tools_schema.json')
];
const SCHEMA_PATH = candidateSchemaPaths.find((p) => fs.existsSync(p)) || candidateSchemaPaths[0];

const AI_SERVICE_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS) || 5000;
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 4000;
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 45000;

/**
 * Shared system prompt for the direct LLM backends (Ollama / Gemini). Includes
 * the caller's scope and role so replies stay relevant to the open dashboard.
 */
function buildSystemPrompt(payload) {
  const roleHint = payload.role ? ` The signed-in user's role is "${payload.role}".` : '';
  const scopeHint = payload.scope ? ` They are currently on the "${payload.scope}" dashboard.` : '';
  return (
    'You are "Mess Guide", the AI campus dining assistant for KIET Smart Mess & KFC ' +
    '(a hostel mess plus a KFC Express canteen).' + roleHint + scopeHint +
    ' Answer concisely and helpfully in plain text, using the conversation so far. ' +
    'Never invent live figures, menus, or order statuses you have not been given.'
  );
}

/**
 * Direct Ollama backend. Lets a self-hosted Ollama server, reachable over a
 * public URL, power the assistant from a serverless host (e.g. Vercel) without
 * the Python AI microservice hop. Enabled by setting OLLAMA_URL.
 */
async function generateOllamaResponse(payload) {
  const base = process.env.OLLAMA_URL;
  if (!base) return null;
  const model = process.env.OLLAMA_MODEL || 'llama3.2:latest';

  try {
    const res = await fetch(`${base.replace(/\/+$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ngrok's free tier serves an interstitial to browser-like requests;
        // this header keeps API traffic clean. Harmless for other hosts.
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: buildSystemPrompt(payload) }, ...payload.messages],
        stream: false,
        options: { temperature: Number(process.env.TEMPERATURE) || 0.3 }
      }),
      signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS)
    });
    const data = await res.json().catch(() => ({}));
    const reply = data?.message?.content;
    if (res.ok && typeof reply === 'string' && reply.trim()) {
      return { reply: reply.trim(), sources: [{ title: `Ollama (${model})` }] };
    }
    if (!res.ok) console.warn('Ollama error:', data?.error || res.status);
  } catch (err) {
    console.warn('Ollama request failed:', err.message);
  }
  return null;
}

/**
 * Google Gemini cloud backend. Enabled by setting GEMINI_API_KEY; a fallback
 * for hosts where no Ollama/GGUF model is reachable.
 */
async function generateGeminiResponse(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Gemini expects alternating user/model turns and must start on a user turn.
  const contents = [];
  for (const m of payload.messages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    if (contents.length === 0 && role === 'model') continue;
    contents.push({ role, parts: [{ text: m.content }] });
  }
  if (contents.length === 0) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt(payload) }] },
          contents
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS)
      }
    );
    const data = await res.json().catch(() => ({}));
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (res.ok && typeof reply === 'string' && reply.trim()) {
      return { reply: reply.trim(), sources: [{ title: 'Gemini Cloud LLM' }] };
    }
    if (!res.ok) console.warn('Gemini error:', data?.error?.message || res.status);
  } catch (err) {
    console.warn('Gemini request failed:', err.message);
  }
  return null;
}

/**
 * Built-in rule & database responder. The final fallback when no LLM backend is
 * reachable: answers menu/KFC/forecast questions from MongoDB and returns guidance
 * otherwise (100% offline & serverless ready).
 */
async function generateFallbackChatResponse(payload) {
  const lastMsg = payload.messages[payload.messages.length - 1]?.content || '';
  const lower = lastMsg.toLowerCase();

  // Built-in intelligent rule & database responder (100% offline & serverless ready)
  if (lower.includes('menu') || lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('snack') || lower.includes('food')) {
    try {
      const menuDoc = await Menu.findOne().lean();
      if (menuDoc) {
        const parts = [];
        if (menuDoc.breakfast) parts.push(`🍳 Breakfast: ${menuDoc.breakfast}`);
        if (menuDoc.lunch) parts.push(`🍛 Lunch: ${menuDoc.lunch}`);
        if (menuDoc.snacks) parts.push(`☕ Snacks: ${menuDoc.snacks}`);
        if (menuDoc.dinner) parts.push(`🍲 Dinner: ${menuDoc.dinner}`);
        return {
          reply: `Here is the current KIET mess menu:\n\n${parts.join('\n')}`,
          sources: [{ title: 'KIET Mess Menu System' }]
        };
      }
    } catch (_) {}
    return {
      reply: "Current Mess Menu:\n• Breakfast (7:30 - 9:00 AM): Idli Sambhar, Poha, Milk/Tea\n• Lunch (12:30 - 2:00 PM): Dal Tadka, Seasonal Sabzi, Phulka, Steamed Rice, Raita\n• Snacks (5:00 - 6:00 PM): Samosa/Pakora, Tea\n• Dinner (8:00 - 9:30 PM): Paneer Butter Masala, Chapati, Pulao, Dessert",
      sources: [{ title: 'Mess Menu Schedule' }]
    };
  }

  if (lower.includes('kfc') || lower.includes('burger') || lower.includes('order') || lower.includes('canteen')) {
    try {
      const kfcItems = await KFCMenuItem.find({ inStock: true }).limit(5).lean();
      if (kfcItems.length) {
        const itemsList = kfcItems.map(i => `• ${i.name} (₹${i.price})`).join('\n');
        return {
          reply: `🍗 KFC Express Canteen is open! Top in-stock items:\n${itemsList}\n\nYou can order directly from the KFC tab with live token tracking!`,
          sources: [{ title: 'KFC Express Live Menu' }]
        };
      }
    } catch (_) {}
    return {
      reply: "KFC Express is ready for orders! Available items include Zinger Burger (₹149), Crispy Popcorn (₹119), Veg Box (₹139), and Choco Krushers (₹89).",
      sources: [{ title: 'KFC Express Menu' }]
    };
  }

  if (lower.includes('forecast') || lower.includes('predict') || lower.includes('headcount') || lower.includes('waste')) {
    return {
      reply: "Our AI Headcount Forecast engine uses 7-Day Weighted Moving Average regression with day-of-week seasonality to predict meal turnouts with >92% confidence. Head over to the Mess Incharge or Principal dashboard to view live batch sizing and food waste analytics!",
      sources: [{ title: 'AI Headcount Engine' }]
    };
  }

  if (lower.includes('room') || lower.includes('lead') || lower.includes('hostel')) {
    return {
      reply: "Room Leads can manage their roommates' meal opt-in/opt-out status and submit daily kitchen requisitions from the Room Lead dashboard.",
      sources: [{ title: 'Hostel Guidelines' }]
    };
  }

  return {
    reply: `Hello! I'm Mess Guide, your campus dining assistant for KIET Smart Mess & KFC. I can help you check today's mess menu, explore KFC Express offerings, track meal selections, and navigate institutional dashboards. How can I assist you today?`,
    sources: [{ title: 'KIET Smart Mess System' }]
  };
}

/* ==========================================================================
   MESS GUIDE AI CHAT CONTROLLER
   Answer flow: self-hosted Ollama -> Gemini cloud -> Python AI microservice
   (FastAPI; the caller's JWT is forwarded so tool execution runs under the real
   RBAC) -> built-in rule & database responder.
   ========================================================================== */
export const postChat = async (req, res) => {
  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'A non-empty messages array is required.'
    });
  }

  const payload = {
    messages: messages
      .filter((m) => m && typeof m.content === 'string' && typeof m.role === 'string')
      .map((m) => ({ role: m.role, content: m.content })),
    // Trust the decoded token over any client-supplied role.
    role: req.user?.role || null,
    // Scope is a UX hint (which dashboard is open); tool access is still role-gated.
    scope: typeof req.body?.scope === 'string' ? req.body.scope : null
  };

  if (payload.messages.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid messages supplied.' });
  }

  const headers = { 'Content-Type': 'application/json' };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  // 1) Direct LLM backends. Prefer a self-hosted Ollama server (OLLAMA_URL),
  //    then Gemini cloud (GEMINI_API_KEY) - the usable paths on serverless hosts.
  const direct = (await generateOllamaResponse(payload)) || (await generateGeminiResponse(payload));
  if (direct) {
    return res.json({ success: true, ...direct });
  }

  // 2) Python AI microservice (local / Render with a hosted model + tool calling).
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

    const aiBase = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const chatUrl = new URL('chat', aiBase.endsWith('/') ? aiBase : `${aiBase}/`);

    const response = await fetch(chatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Microservice returned error: use the built-in rule & DB responder.
      const fallback = await generateFallbackChatResponse(payload);
      return res.json({ success: true, ...fallback });
    }

    return res.json({ success: true, ...data });
  } catch (err) {
    // Microservice offline or timeout: use the built-in rule & DB responder.
    const fallback = await generateFallbackChatResponse(payload);
    return res.json({ success: true, ...fallback });
  }
};

/* ==========================================================================
   MESS GUIDE ACTION EXECUTOR
   Confirmed write actions are run here, never in the model or a pure client:
   the executor validates the tool against the shared schema, injects the
   caller's identity from the verified JWT (so it can't be spoofed), and calls
   the real endpoint with the caller's token so every existing guard still runs.
   ========================================================================== */
let writeToolMap = null;

const loadWriteTools = () => {
  if (writeToolMap) return writeToolMap;
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  writeToolMap = schema.tools.reduce((acc, tool) => {
    if (tool.kind === 'write') acc[tool.name] = tool;
    return acc;
  }, {});
  return writeToolMap;
};

const roleAllowed = (tool, role) => {
  const required = tool.requiredRole || [];
  if (required.length === 0) return true;
  if (role === 'Admin' || role === 'Principal') return true;
  return required.includes(role);
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const resolveRoom = async (rollNo) => {
  if (!rollNo) return null;
  try {
    const student = await Student.findOne({ studentId: rollNo }).lean();
    if (!student) return null;
    const block = student.blockId === 'block-e' ? 'Block E' : 'Block D';
    return `${student.roomNo} • ${block}`;
  } catch {
    return null;
  }
};

export const postChatExecute = async (req, res) => {
  const { tool, args } = req.body || {};

  let tools;
  try {
    tools = loadWriteTools();
  } catch (err) {
    return res.status(500).json({ success: false, message: `Action schema unavailable: ${err.message}` });
  }

  const definition = tools[tool];
  if (!definition) {
    return res.status(400).json({ success: false, message: `'${tool}' is not an executable action.` });
  }
  if (!roleAllowed(definition, req.user?.role)) {
    const required = (definition.requiredRole || []).join(', ');
    return res.status(403).json({ success: false, message: `This action requires one of: ${required}.` });
  }

  const body = args && typeof args === 'object' ? { ...args } : {};

  // Identity comes from the verified token, never the client payload.
  body.studentName = req.user?.name;
  body.studentId = req.user?.id;
  body.studentRoll = req.user?.rollNo;
  body.rollNo = req.user?.rollNo;

  if (tool === 'set_meal_selection') {
    if (typeof body.selected === 'string') {
      body.selected = ['true', 'yes', '1', 'on'].includes(body.selected.trim().toLowerCase());
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date || ''))) {
      body.date = todayISO();
    }
  }
  if (tool === 'place_kfc_order' && !body.room) {
    body.room = (await resolveRoom(req.user?.rollNo)) || 'Room D-101';
  }

  let urlPath = definition.http.path;
  for (const param of definition.http.pathParams || []) {
    if (body[param] === undefined || body[param] === null || body[param] === '') {
      return res.status(400).json({ success: false, message: `Missing '${param}' for this action.` });
    }
    urlPath = urlPath.replace(`{${param}}`, encodeURIComponent(body[param]));
  }

  const host = req.get('host');
  const protocol = req.protocol || 'http';
  const base = host ? `${protocol}://${host}/api` : `http://127.0.0.1:${process.env.PORT || 5000}/api`;

  try {
    const response = await fetch(base + urlPath, {
      method: definition.http.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      return res.status(response.status >= 400 ? response.status : 400).json({
        success: false,
        message: data.message || 'The action could not be completed.',
        result: data
      });
    }

    return res.json({ success: true, tool, result: data });
  } catch (err) {
    return res.status(502).json({ success: false, message: `Action failed: ${err.message}` });
  }
};
