/* ==========================================================================
   Compiler Service — ارتباط با موتور واقعی TypeScript روی سرور (server.mjs)
   + حالت جایگزین آفلاین (بدون سرور) تا استودیو هرگز نشکند
   ========================================================================== */

let serverAvailable = null; // lazy probe, cached

async function probeServer() {
  if (serverAvailable !== null) return serverAvailable;
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    serverAvailable = res.ok;
    const data = await res.json().catch(() => ({}));
    return serverAvailable && data.tsVersion ? data.tsVersion : serverAvailable;
  } catch {
    serverAvailable = false;
    return false;
  }
}

/**
 * @returns {Promise<{ok:boolean, jsCode:string, diagnostics:*, xrays:*, erasedStats:*, durationMs:number, engine:string}>}
 */
export async function compile(code, flags = {}) {
  const engine = await probeServer();
  if (engine) {
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, flags }),
      });
      if (res.ok) {
        const data = await res.json();
        return { ...data, engine: `tsc ${data.tsVersion}` };
      }
    } catch {
      /* fall through to offline mode */
    }
  }
  return offlineCompile(code);
}

export async function engineLabel() {
  const engine = await probeServer();
  return engine ? `tsc ${engine}` : 'حالت آفلاین (بدون type-check)';
}

/* -------------------------------------------------------------------------- */
/* حالت آفلاین: حذف تایپ‌ها + اجرای JS (فقط وقتی سرور در دسترس نیست)           */
/* -------------------------------------------------------------------------- */

const TYPE_ONLY_LINE = /^\s*(?:export\s+)?(?:declare\s+)?(?:type|interface)\b.*$/;

/**
 * Very small eraser so the studio still runs from file:// without a server.
 * It removes whole type/interface declarations and inline annotations that are
 * unambiguous. It is NOT a TypeScript compiler — only a graceful fallback.
 */
export function stripTypes(source) {
  const lines = source.split('\n');
  const kept = [];
  let skipDepth = 0;

  for (const line of lines) {
    if (skipDepth > 0) {
      for (const ch of line) {
        if (ch === '{') skipDepth++;
        else if (ch === '}') skipDepth--;
      }
      if (skipDepth <= 0) skipDepth = 0;
      continue;
    }

    if (TYPE_ONLY_LINE.test(line) || /^\s*(?:export\s+)?namespace\b/.test(line)) {
      const opens = (line.match(/\{/g) ?? []).length;
      const closes = (line.match(/\}/g) ?? []).length;
      if (opens > closes) skipDepth = opens - closes;
      continue;
    }

    kept.push(
      line
        .replace(/\bas\s+const\b/g, '')
        .replace(/\bsatisfies\b\s+[A-Za-z_$][\w$<>,.[\]|&\s]*/g, '')
        .replace(/\bas\s+[A-Za-z_$][\w$<>,.[\]|&\s]*/g, '')
        .replace(/:\s*(?:readonly\s+)?[A-Za-z_$][\w$<>,.[\]|&\s]*?(?=\s*(?:=|[,);{]|$))/g, '')
        .replace(/<[A-Z][\w$]*(?:\s+extends\s+[^>]+)?>/g, '')
        .replace(/!\./g, '.')
        .replace(/\)\s*!/, ')'),
    );
  }

  return kept.join('\n');
}

function offlineCompile(code) {
  const started = performance.now();
  let jsCode = code;
  const diagnostics = [];
  try {
    jsCode = stripTypes(code);
  } catch (err) {
    diagnostics.push({
      code: 0,
      category: 'error',
      line: 1,
      column: 1,
      message: `حالت آفلاین نتوانست تایپ‌ها را حذف کند: ${err.message}`,
    });
  }
  return {
    ok: diagnostics.length === 0,
    jsCode,
    diagnostics,
    xrays: [],
    erasedStats: {
      tsBytes: new Blob([code]).size,
      jsBytes: new Blob([jsCode]).size,
      erasedNodes: 0,
    },
    durationMs: Math.round((performance.now() - started) * 10) / 10,
    engine: 'حالت آفلاین (سرور در دسترس نیست)',
  };
}

/* -------------------------------------------------------------------------- */
/* اجرای امن JavaScript در Web Worker ایزوله با تایم‌اوت                        */
/* -------------------------------------------------------------------------- */

const WORKER_SOURCE = `
self.onmessage = (e) => {
  const logs = [];
  const serialize = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'bigint') return value + 'n';
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
    if (typeof value === 'symbol') return value.toString();
    try { return JSON.stringify(value, replacer, 2) ?? String(value); }
    catch { return String(value); }
  };
  const replacer = (key, val) => {
    if (typeof val === 'bigint') return val + 'n';
    if (val instanceof Map) return Object.fromEntries(val);
    if (val instanceof Set) return [...val];
    if (val instanceof Error) return { name: val.name, message: val.message };
    return val;
  };
  const fakeConsole = {
    log: (...a) => logs.push({ kind: 'log', text: a.map(serialize).join(' ') }),
    info: (...a) => logs.push({ kind: 'info', text: a.map(serialize).join(' ') }),
    warn: (...a) => logs.push({ kind: 'warn', text: a.map(serialize).join(' ') }),
    error: (...a) => logs.push({ kind: 'error', text: a.map(serialize).join(' ') }),
    table: (...a) => logs.push({ kind: 'log', text: a.map(serialize).join(' ') }),
  };
  const started = performance.now();
  const run = async () => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFunction('console', 'performance', e.data.code);
    await fn(fakeConsole, { now: () => Date.now() - started });
  };
  run().then(
    () => self.postMessage({ ok: true, logs, runtimeMs: Math.round((performance.now() - started) * 10) / 10 }),
    (err) => self.postMessage({ ok: false, logs, error: (err && err.message) || String(err), runtimeMs: Math.round((performance.now() - started) * 10) / 10 })
  );
};
`;

/** Runs emitted JS in an isolated worker with a hard timeout. Never hangs the UI. */
export function runJavaScript(jsCode, timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (!jsCode.trim()) {
      resolve({ ok: true, logs: [], runtimeMs: 0 });
      return;
    }
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, logs: [], error: 'اجرا به دلیل تایم‌اوت متوقف شد (احتمال حلقه‌ی بی‌نهایت).' });
    }, timeoutMs);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };
    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, logs: [], error: err.message || 'خطای ناشناخته در زمان اجرا' });
    };

    worker.postMessage({ code: jsCode.replace(/^\s*export\s+(default\s+)?/gm, '') });
  });
}
