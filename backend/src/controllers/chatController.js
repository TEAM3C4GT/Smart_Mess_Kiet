import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Student } from '../models/Schemas.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// The tool schema is the single source of truth shared with the Python service.
const SCHEMA_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'ai-service',
  'training',
  'tools_schema.json'
);

/* ==========================================================================
   MESS GUIDE AI CHAT CONTROLLER
   Proxies chat requests to the Python AI microservice (FastAPI, port 8000),
   forwarding the caller's JWT so tool executions run under the real RBAC.
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

  try {
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status === 503 ? 503 : 502).json({
        success: false,
        message: data.detail || data.message || 'Mess Guide could not answer right now.'
      });
    }

    return res.json({ success: true, ...data });
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'Mess Guide is offline. Start the ai-service (uvicorn main:app --port 8000) and try again.'
    });
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
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
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

  const base = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

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
