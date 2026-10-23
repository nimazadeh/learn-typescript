/* ==========================================================================
   محیط تست مشترک — استودیو را داخل یک DOM واقعی (jsdom) بالا می‌آورد.

   همه‌ی ابزارهای QA که به DOM نیاز دارند (smoke و audit-a11y) از همین
   یک پیاده‌سازی استفاده می‌کنند تا «محیطی که تست می‌کند» و «محیطی که
   ممیزی می‌کند» مو نکند؛ وگرنه هر ابزار شیم‌های خودش را دارد و نتیجه‌ها
   قابل مقایسه نیستند (DRY).

   نکته: هر فراخوانی باید در یک «پروسه‌ی جدا» انجام شود، چون ماژول‌های
   اپلیکیشن یک‌بار ارزیابی می‌شوند و به همان window اول بسته می‌مانند.
   ========================================================================== */

import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ORIGIN = process.env.SMOKE_ORIGIN ?? 'http://127.0.0.1:3000';

/**
 * استودیو را در jsdom بالا می‌آورد.
 * @param {{ origin?: string }} [opts]
 */
export async function createStudioEnv(opts = {}) {
  const origin = opts.origin ?? ORIGIN;

  /* -------------------------------------------------------------------------- */
  /* خطاهای کنسول و خطاهای نگرفته‌شده را به‌عنوان شکست ثبت می‌کنیم                  */
  /* -------------------------------------------------------------------------- */
  const consoleErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => consoleErrors.push(`jsdomError: ${e.message}`));
  virtualConsole.on('error', (...args) => consoleErrors.push(`console.error: ${args.join(' ')}`));

  const dom = new JSDOM(readFileSync(join(ROOT, 'index.html'), 'utf8'), {
    url: `${ORIGIN}/`,
    pretendToBeVisual: true,
    virtualConsole,
  });
  const { window } = dom;
  const { document } = window;

  /* -------------------------------------------------------------------------- */
  /* شیم APIهای مرورگر که jsdom ندارد (بدون آن‌ها تست بی‌دلیل می‌شکند)              */
  /* -------------------------------------------------------------------------- */
  function shimBrowserApis() {
    window.Element.prototype.scrollIntoView = function scrollIntoView() {};
    window.Element.prototype.setPointerCapture = function setPointerCapture() {};
    window.Element.prototype.releasePointerCapture = function releasePointerCapture() {};
    window.Element.prototype.hasPointerCapture = function hasPointerCapture() { return false; };
    window.SVGElement.prototype.setPointerCapture = function setPointerCapture() {};
    window.SVGElement.prototype.releasePointerCapture = function releasePointerCapture() {};

    window.URL.createObjectURL = () => 'blob:ts-studio-stub';
    window.URL.revokeObjectURL = () => {};

    window.AudioContext = class StubAudioContext {
      constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
      createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 440 }, type: 'sine' }; }
      createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, value: 1 } }; }
      resume() { return Promise.resolve(); }
      close() { return Promise.resolve(); }
    };

    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });

    // اجرای JS کاربر در Worker ایزوله انجام می‌شود. jsdom Worker واقعی ندارد،
    // پس «دقیقاً همان قرارداد پیام» را شبیه‌سازی می‌کنیم:
    //   postMessage({ code }) → onmessage({ ok, logs: [{kind,text}], runtimeMs, error? })
    window.Worker = class StubWorker {
      constructor() { this.onmessage = null; this.onerror = null; }
      postMessage(payload) {
        const logs = [];
        const started = Date.now();
        const fakeConsole = {
          log: (...a) => logs.push({ kind: 'log', text: a.map(String).join(' ') }),
          info: (...a) => logs.push({ kind: 'info', text: a.map(String).join(' ') }),
          warn: (...a) => logs.push({ kind: 'warn', text: a.map(String).join(' ') }),
          error: (...a) => logs.push({ kind: 'error', text: a.map(String).join(' ') }),
          table: (...a) => logs.push({ kind: 'log', text: a.map(String).join(' ') }),
        };
        const reply = (ok, error) => queueMicrotask(() => {
          this.onmessage?.({ data: { ok, logs, error: error ?? null, runtimeMs: Date.now() - started } });
        });
        try {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
          const fn = new AsyncFunction('console', 'performance', payload.code);
          Promise.resolve(fn(fakeConsole, { now: () => Date.now() - started }))
            .then(() => reply(true), (err) => reply(false, err?.message ?? String(err)));
        } catch (err) {
          reply(false, err?.message ?? String(err));
        }
      }
      terminate() {}
      addEventListener(type, handler) { if (type === 'message') this.onmessage = handler; }
      removeEventListener() {}
    };
  }

  function exposeGlobals() {
    const names = [
      'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
      'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Element', 'Node', 'Event',
      'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'Blob', 'FileReader',
      'URLSearchParams', 'DOMParser', 'SVGElement', 'getComputedStyle', 'requestAnimationFrame',
      'cancelAnimationFrame', 'matchMedia', 'Worker', 'AudioContext',
    ];
    for (const name of names) {
      const value = name === 'window' ? window : window[name];
      if (value === undefined) continue;
      // برخی کلیدها (مثل navigator) در Node فقط getter دارند
      Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
    }
    Object.defineProperty(globalThis, 'URL', { value: window.URL, writable: true, configurable: true });

    // fetch نسبی را به سرور واقعی استودیو وصل می‌کنیم تا موتور TypeScript واقعی تست شود
    const nodeFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => {
      const url = typeof input === 'string'
        ? (input.startsWith('http') ? input : ORIGIN + (input.startsWith('/') ? input : `/${input}`))
        : input;
      return nodeFetch(url, init);
    };
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function waitFor(predicate, { timeout = 10000, label = 'condition', debug } = {}) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (predicate()) return true;
      await wait(50);
    }
    const extra = typeof debug === 'function' ? `\n    debug: ${debug()}` : '';
    throw new Error(`timeout waiting for ${label}${extra}`);
  }

  /* -------------------------------------------------------------------------- */
  /* اجرا                                                                        */
  /* -------------------------------------------------------------------------- */
  shimBrowserApis();
  exposeGlobals();

  let app;
  let store;
  let timer;
  try {
  app = await import(pathToFileURL(join(ROOT, 'src/app.js')).href);
  store = await import(pathToFileURL(join(ROOT, 'src/core/store.js')).href);
  timer = await import(pathToFileURL(join(ROOT, 'src/services/timer.js')).href);
  } catch (error) {
  console.log(`✗ بارگذاری src/app.js شکست خورد: ${error.stack ?? error.message}`);
  process.exit(1);
  }

  await wait(300);

  return {
    ROOT, origin, window, document, dom,
    app, store, timer,
    consoleErrors,
    wait, waitFor,
    $: (sel) => document.querySelector(sel),
    $$: (sel) => [...document.querySelectorAll(sel)],
    count: (sel) => document.querySelectorAll(sel).length,
  };
}

export { ROOT, ORIGIN };
