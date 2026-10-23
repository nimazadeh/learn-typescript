/* ==========================================================================
   Smoke Test — اپلیکیشن را در یک DOM واقعی (jsdom) بالا می‌آورد و همه‌ی
   نماها، درس‌ها، کوییزها و آزمایشگاه زنده را اجرا می‌کند.

   اجرا:  npm run smoke   (سرور باید در حال اجرا باشد: npm start)
   ========================================================================== */

import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ORIGIN = process.env.SMOKE_ORIGIN ?? 'http://127.0.0.1:3000';

/* -------------------------------------------------------------------------- */
/* گزارش‌دهی                                                                     */
/* -------------------------------------------------------------------------- */
let failures = 0;
let checks = 0;

function check(label, condition, detail = '') {
  checks++;
  const ok = Boolean(condition);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

function section(title) {
  console.log(`\n— ${title} —`);
}

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
try {
  app = await import(pathToFileURL(join(ROOT, 'src/app.js')).href);
  store = await import(pathToFileURL(join(ROOT, 'src/core/store.js')).href);
} catch (error) {
  console.log(`✗ بارگذاری src/app.js شکست خورد: ${error.stack ?? error.message}`);
  process.exit(1);
}

await wait(300);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const count = (sel) => $$(sel).length;

section('پوسته‌ی اپلیکیشن');
check('سربرگ و نوار ناوبری ساخته شد', count('.nav-tab') >= 5, `${count('.nav-tab')} سربرگ`);
check('نشان موتور کامپایل مقدار واقعی گرفت', /tsc \d+\.\d+\.\d+/.test($('#engine-badge')?.textContent ?? ''), $('#engine-badge')?.textContent?.trim());
check('نوار پیشرفت در سربرگ وجود دارد', Boolean($('#header-progress-fill')));
check('بدنه‌ی اپ RTL است', document.documentElement.getAttribute('dir') === 'rtl', document.documentElement.getAttribute('dir'));

section('نمای نقشه‌ی راه');
check('بوم SVG نقشه رندر شد', count('#view-root svg') > 0);
check('گره‌های نقشه رسم شدند', count('.map-node') >= 90, `${count('.map-node')} گره`);
check('یال‌های نقشه رسم شدند', count('#view-root path, #view-root line') > 20, `${count('#view-root path, #view-root line')} یال`);

section('نمای درس‌ها');
app.navigate('academy', { nodeId: 'union-types' });
await wait(200);
check('ساختار سه‌ستونی درس ساخته شد', count('.lesson-grid') === 1);
check('گام‌های درس رندر شدند', count('.lesson-steps .step, .lesson-steps > *') >= 3, `${count('.lesson-steps > *')} گام`);
check('حاشیه‌نویسی فرمول‌های موفقیت رندر شد', count('.margin-notes .margin-note, .lesson-margin, .margin-note') > 0, `${count('.margin-note')} حاشیه`);
check('کوییز درس رندر شد', count('.quiz-card .quiz-option') >= 3, `${count('.quiz-option')} گزینه`);
check('آزمایشگاه زنده رندر شد', count('.live-lab') >= 1);
check('ویرایشگر کد با برجسته‌سازی سینتکس ساخته شد', count('.editor-input') === 1 && count('.editor-preview') === 1);
check('شمارنده‌ی خطوط ویرایشگر ساخته شد', count('.editor-gutter .gutter-line') > 1, `${count('.gutter-line')} خط`);

section('کوییز — تعامل واقعی');
{
  const before = readQuizStats();
  const options = $$('.quiz-card .quiz-option');
  options[0].click();
  await wait(120);
  const feedback = $('.quiz-feedback');
  check('پاسخ به کوییز بازخورد نشان داد', Boolean(feedback) && feedback.hidden === false);
  check('گزینه‌ی درست با کلاس مشخص شد', count('.quiz-option.is-correct') === 1);
  check('توضیح پاسخ پس از انتخاب نمایش داده شد', (feedback?.textContent ?? '').trim().length > 20);
  const after = readQuizStats();
  check('آمار کوییز در وضعیت مرکزی به‌روز شد', after.correct + after.wrong === before.correct + before.wrong + 1, `${JSON.stringify(after)}`);
  await wait(320);
  const persisted = readPersistedStats();
  check('آمار کوییز در localStorage پایدار شد', persisted.correct + persisted.wrong === after.correct + after.wrong, JSON.stringify(persisted));
}

section('آزمایشگاه زنده — کامپایل با TypeScript واقعی');
{
  const lab = $('.live-lab');
  check('برگه‌های آزمایشگاه (کنسول/خطاها/X-Ray/خروجی JS) ساخته شدند', count('.lab-tabs .lab-tab') === 4, `${count('.lab-tabs .lab-tab')} برگه`);

  const tabs = [...lab.querySelectorAll('.lab-tab')];
  const tabByLabel = (re) => tabs.find((b) => re.test(b.textContent));
  // چهار پنل به ترتیب ثابت ساخته می‌شوند: کنسول، خطاها، X-Ray، خروجی JS
  const panes = [...lab.querySelectorAll('.lab-tab-body > .pane-body')];
  check('هر چهار پنل آزمایشگاه در DOM حاضرند', panes.length === 4, `${panes.length} پنل`);
  const [consolePane, diagPane, xrayPane, jsPane] = panes;
  const visiblePane = () => panes.find((pane) => pane.hidden === false);

  // اول صبر می‌کنیم اجرای خودکارِ کد اولیه تمام شود تا نتیجه‌ی تست قاطی نشود
  await waitFor(() => /tsc/.test($('.lab-meta')?.textContent ?? ''), { label: 'initial auto-run' });
  await wait(600);

  const editor = lab.querySelector('.editor-input');
  const marker = 'SMOKE_MARKER_42';
  editor.value = [
    `const ${marker} = 1; // نشانگر تست`,
    'type Minutes = number;',
    'const daily: Minutes = 300;',
    'const plan = [daily, daily];',
    '//    ^?',
    'const broken = daily.nope;',
    'console.log(plan.length, broken ?? 0);',
  ].join('\n');
  editor.dispatchEvent(new window.Event('input', { bubbles: true }));

  const runButton = [...lab.querySelectorAll('.lab-actions button')].find((b) => /اجرا/.test(b.textContent));
  check('دکمه‌ی «اجرا و کالبدشکافی» پیدا شد', Boolean(runButton));
  runButton.click();

  // تا وقتی صبر می‌کنیم که نتیجه‌ی «کد تزریق‌شده» روی صفحه آمده باشد
  await waitFor(
    () => count('.diag-head') >= 1 && /TS2339/.test(diagPane.textContent),
    { label: 'TS2339 diagnostic for the injected code' },
  );

  const metaText = $('.lab-meta').textContent.replace(/\s+/g, ' ');
  check('موتور کامپایل واقعی TypeScript پاسخ داد', /tsc \d+\.\d+\.\d+/.test(metaText), metaText.slice(0, 130));
  check('گره‌های تایپ پاک‌شده شمارش شد', /گره‌های تایپ پاک‌شده: [۱-۹۰-۹]+/.test(metaText) && !/پاک‌شده: ۰/.test(metaText), (metaText.match(/گره‌های تایپ پاک‌شده: [۰-۹]+/) ?? [])[0]);

  check('خطای TS2339 با مربی فارسی نمایش داده شد', count('.diag-head') >= 1 && count('.diag-coach') >= 1, `${count('.diag-head')} خطا`);
  const diagText = diagPane.textContent.replace(/\s+/g, ' ');
  check('کد و موقعیت خطای TypeScript گزارش شد', /TS2339/.test(diagText) && /line \d+:\d+/.test(diagText), diagText.slice(0, 120));


  tabByLabel(/X-Ray/).click();
  await wait(150);
  const xrayRows = $$('.xray-row').map((r) => r.textContent.replace(/\s+/g, ' ').trim());
  check('پرسش `// ^?` تایپ استنتاجی را نشان داد', xrayRows.some((r) => /number\[\]/.test(r)), xrayRows.slice(0, 8).join(' | ').slice(0, 200));
  check('تایپ‌های استنتاجی متغیرها در X-Ray هست', xrayRows.some((r) => /Minutes|number/.test(r)) && xrayRows.length >= 3, `${xrayRows.length} ردیف`);

  check('هنگام وجود خطای تایپ، اجرا متوقف می‌شود (رفتار عمدی)', /اجرا متوقف شد/.test(consolePane.textContent));

  // فاز دوم: کد سالم → باید خروجی JS تولید و در کنسول اجرا شود
  editor.value = [
    'type Minutes = number;',
    'const daily: Minutes = 300;',
    'const plan = [daily, daily];',
    '//    ^?',
    'const total: number = plan.reduce((a, b) => a + b, 0);',
    'console.log(`plan=${plan.length} total=${total}`);',
  ].join('\n');
  editor.dispatchEvent(new window.Event('input', { bubbles: true }));
  runButton.click();

  await waitFor(
    () => /اجرا شد|خطای زمان اجرا/.test($('.lab-status')?.textContent ?? ''),
    {
      label: 'successful run',
      debug: () => {
        const status = $('.lab-status')?.textContent;
        const panes = $$('.pane-body').map((p) => p.textContent.replace(/\s+/g, ' ').trim().slice(0, 100));
        return `status="${status}" | panes=${JSON.stringify(panes)}`;
      },
    },
  );
  check('کد بدون خطا با موفقیت اجرا شد', /✓ اجرا شد/.test($('.lab-status').textContent), $('.lab-status').textContent.trim());

  tabByLabel(/خروجی JS/).click();
  await wait(150);
  check('کلیک روی برگه، پنل درست را فعال می‌کند', visiblePane() === jsPane);
  const jsText = jsPane.textContent;
  check('خروجی JavaScript تولید شد و تایپ‌ها پاک شدند', /const daily = 300/.test(jsText) && !/Minutes/.test(jsText), jsText.replace(/\s+/g, ' ').slice(0, 150));

  tabByLabel(/کنسول/).click();
  await wait(250);
  const consoleText = consolePane.textContent.replace(/\s+/g, ' ');
  check('کنسول خروجی واقعی اجرای کد را نشان داد', /plan=2 total=600/.test(consoleText), consoleText.slice(0, 150));

  tabByLabel(/X-Ray/).click();
  await wait(150);
  const xrayRows2 = $$('.xray-row').map((r) => r.textContent.replace(/\s+/g, ' ').trim());
  check('X-Ray تایپ `// ^?` را برای کد سالم نشان داد', xrayRows2.some((r) => /^\s*🔬plan query number\[\]/.test(r) || /query/.test(r)), xrayRows2.slice(0, 6).join(' | ').slice(0, 180));
}

section('همه‌ی نماها');
for (const [name, hint] of [
  ['roadmap', 'svg'],
  ['academy', '.lesson-grid'],
  ['playground', '.live-lab'],
  ['coach', '.coach'],
  ['playbook', '.playbook'],
]) {
  try {
    app.navigate(name);
    await wait(200);
    const nodes = count('#view-root > *');
    check(`نمای «${name}» بدون خطا رندر شد`, nodes > 0, `${nodes} گره‌ی ریشه${hint ? ` · انتظار ${hint}` : ''}`);
  } catch (error) {
    check(`نمای «${name}» بدون خطا رندر شد`, false, error.message);
  }
}

section('پالت فرمان (Ctrl+K)');
{
  app.navigate('roadmap');
  await wait(150);
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  await wait(150);
  check('پالت با Ctrl+K باز شد', $('#palette')?.hidden === false || $('#palette')?.classList.contains('is-open'));
  const input = $('#palette-input');
  if (input) {
    input.value = 'Generic';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    await wait(250);
    check('جست‌وجوی پالت نتیجه داد', count('#palette-results > *') > 0, `${count('#palette-results > *')} نتیجه`);
  }
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
}

section('مربی روزانه و برنامه‌ی ۵ ساعت');
{
  app.navigate('coach');
  await wait(200);
  const coachText = $('#view-root').textContent;
  check('بلوک‌های مطالعه‌ی ۵ ساعته نمایش داده شدند', /۵ ساعت|۳۰۰/.test(coachText));
  check('ساعت تایمر با قالب mm:ss رندر شد', /\d\d:\d\d/.test($('#view-root .timer-clock')?.textContent ?? ''), $('#view-root .timer-clock')?.textContent);
  const totalText = $('#view-root .timer-total')?.textContent ?? '';
  check('مجموع بلوک‌ها دقیقاً ۵ ساعت (۳۰۰ دقیقه) است', /=\s*۳۰۰ دقیقه \(۵ ساعت\)/.test(totalText), totalText.trim());
  check('هر ۵ بلوک روزانه با کار عمیق و استراحت رندر شدند', count('#view-root .block-card') === 5, `${count('#view-root .block-card')} بلوک`);
  check('کارت بلوک، دقیقه‌ی کار و استراحت را نشان می‌دهد', /۵۰ \+ ۱۰ استراحت/.test($('#view-root .block-card')?.textContent ?? ''), $('#view-root .block-card')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 90));

  const startBtn = $$('#view-root .timer-controls button').find((b) => /شروع بلوک/.test(b.textContent));
  check('دکمه‌ی شروع بلوک وجود دارد', Boolean(startBtn));
  startBtn.click();
  await wait(150);
  check('تایمر با کلیک شروع شد و دکمه به «توقف» تغییر کرد', $$('#view-root .timer-controls button').some((b) => /توقف/.test(b.textContent)));
  const stopBtn = $$('#view-root .timer-controls button').find((b) => /توقف/.test(b.textContent));
  stopBtn?.click();
  await wait(150);
  check('تایمر متوقف شد', $$('#view-root .timer-controls button').some((b) => /شروع بلوک/.test(b.textContent)));

  // ثبت دقیقه‌های مطالعه: با «بلوک بعدی» جابه‌جا می‌شویم تا منطق ثبت دقیقه سنجیده شود
  const minutesBefore = store.todayEntry().minutes ?? 0;
  const skipBtn = $$('#view-root .timer-controls button').find((b) => /بلوک بعدی/.test(b.textContent));
  skipBtn.click();
  await wait(150);
  check('با رفتن به بلوک بعد، تایمر روی ۵۰ دقیقه بازنشانی شد', $('#view-root .timer-clock')?.textContent === '50:00', $('#view-root .timer-clock')?.textContent);
}

section('پوشش کامل محتوا در DOM');
{
  const { ALL_LESSONS } = await import(pathToFileURL(join(ROOT, 'src/data/curriculum/index.js')).href);
  let rendered = 0;
  const broken = [];
  for (const lesson of ALL_LESSONS) {
    try {
      app.navigate('academy', { nodeId: lesson.id });
      await wait(0);
      if (count('.lesson-grid') === 1 && count('.quiz-option') >= 2 && count('.live-lab') >= 1) rendered++;
      else broken.push(lesson.id);
    } catch (error) {
      broken.push(`${lesson.id} (${error.message})`);
    }
  }
  check(`هر ${ALL_LESSONS.length} درس کامل رندر شد (گام + کوییز + آزمایشگاه)`, broken.length === 0, broken.slice(0, 8).join(', '));
  console.log(`  رندرشد: ${rendered}/${ALL_LESSONS.length}`);
}

section('خطاهای کنسول');
const realErrors = consoleErrors.filter((e) => !/Could not parse CSS|Not implemented/i.test(e));
check('هیچ خطای کنسولی ثبت نشد', realErrors.length === 0, realErrors.slice(0, 5).join(' || ').slice(0, 400));

console.log(`\n${failures === 0 ? `✅ همه‌ی ${checks} بررسی موفق بود.` : `❌ ${failures} بررسی ناموفق از ${checks}.`}`);
process.exit(failures === 0 ? 0 : 1);

function readQuizStats() {
  return store.getState().quizStats ?? { correct: 0, wrong: 0 };
}

function readPersistedStats() {
  const raw = window.localStorage.getItem('ts-visual-studio/v1');
  const parsed = raw ? JSON.parse(raw) : { quizStats: {} };
  return parsed.quizStats ?? { correct: 0, wrong: 0 };
}
