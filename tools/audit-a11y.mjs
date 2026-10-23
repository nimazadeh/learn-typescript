/* ==========================================================================
   audit-a11y — ممیزی دسترس‌پذیری با axe-core روی DOM واقعی

   اپلیکیشن را در jsdom بالا می‌آورد (همان محیط smoke) و تک‌تک نماها را
   با موتور axe-core اسکن می‌کند. چون اپ فارسی و RTL است، چند بررسی
   دستیِ مخصوص RTL هم اضافه شده که axe پوشش نمی‌دهد.

   سیاست شدت:
     critical / serious  → FAIL  (دسترس‌پذیری عملاً شکسته است)
     moderate / minor    → WARN  (باید بهتر شود، ولی مسدودکننده نیست)

   نکته‌ی صادقانه: jsdom «چیدمان» ندارد، پس قواعدی که به هندسه یا
   رنگِ محاسبه‌شده نیاز دارند (مثل color-contrast) اینجا قابل اجرا نیستند
   و خاموش شده‌اند — این‌ها را باید با یک مرورگر واقعی سنجید.

   اجرا: npm run audit:a11y   (سرور باید بالا باشد: npm start)
   ========================================================================== */

import { readFileSync } from 'node:fs';

import { join } from 'node:path';
import { createStudioEnv, ROOT } from './dom-env.mjs';

const AXV_SOURCE = readFileSync(
  join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'),
  'utf8',
);

/** نماهایی که اسکن می‌شوند. */
const TARGETS = [
  { name: 'نقشه‌ی راه', view: 'roadmap' },
  { name: 'درس (union-types)', view: 'academy', params: { nodeId: 'union-types' } },
  { name: 'درس (keyof-operator)', view: 'academy', params: { nodeId: 'keyof-operator' } },
  { name: 'آزمایشگاه آزاد', view: 'playground' },
  { name: 'مربی مطالعه', view: 'coach' },
  { name: 'کتابچه‌ی راه', view: 'playbook' },
];

/** قواعدی که در jsdom معنا ندارند (نیاز به چیدمان/رنگ محاسبه‌شده). */
const DISABLED_RULES = ['color-contrast'];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const env = await createStudioEnv();
const { window, document, app } = env;

// axe-core را داخل همان window تزریق می‌کنیم تا به document درست دسترسی داشته باشد
window.eval(AXV_SOURCE);

/** @type {Map<string, {id:string, impact:string, help:string, helpUrl:string, views:Set<string>, nodes:string[], count:number}>} */
const violations = new Map();
const perView = [];

for (const target of TARGETS) {
  app.navigate(target.view, target.params);
  await wait(260);

  let result;
  try {
    result = await window.axe.run(document.documentElement, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
      rules: Object.fromEntries(DISABLED_RULES.map((r) => [r, { enabled: false }])),
    });
  } catch (err) {
    console.error(`✗ axe روی «${target.name}» اجرا نشد: ${err.message}`);
    process.exit(1);
  }

  perView.push({ name: target.name, violations: result.violations.length, passes: result.passes.length });

  for (const v of result.violations) {
    const existing = violations.get(v.id);
    const samples = v.nodes.slice(0, 2).map((n) => (n.target ?? []).join(' '));
    if (existing) {
      existing.views.add(target.name);
      existing.count += v.nodes.length;
      if (existing.nodes.length < 4) existing.nodes.push(...samples);
    } else {
      violations.set(v.id, {
        id: v.id,
        impact: v.impact ?? 'minor',
        help: v.help,
        helpUrl: v.helpUrl,
        views: new Set([target.name]),
        nodes: samples,
        count: v.nodes.length,
      });
    }
  }
}

/* --------------------- بررسی‌های دستیِ مخصوص RTL/فارسی --------------------- */

const manual = [];
const check = (label, ok, detail = '') => manual.push({ label, ok: Boolean(ok), detail });

check(
  '<html lang="fa"> تنظیم شده است',
  document.documentElement.getAttribute('lang') === 'fa',
  document.documentElement.getAttribute('lang') ?? '(خالی)',
);
check(
  '<html dir="rtl"> تنظیم شده است',
  document.documentElement.getAttribute('dir') === 'rtl',
  document.documentElement.getAttribute('dir') ?? '(خالی)',
);
check('<title> خالی نیست', document.title.trim().length > 3, document.title.trim());
check(
  'فقط یک <h1> در صفحه هست',
  document.querySelectorAll('h1').length === 1,
  `${document.querySelectorAll('h1').length} عدد`,
);
check('main/landmark اصلی وجود دارد', Boolean(document.querySelector('main, [role="main"], #view-root')));
check(
  'nav با برچسب دسترس‌پذیر وجود دارد',
  [...document.querySelectorAll('nav')].every((n) => Boolean(n.getAttribute('aria-label') || n.getAttribute('aria-labelledby') || n.querySelector('h1,h2,h3'))),
);

// بلوک‌های کد همیشه LTR هستند — حتی در صفحه‌ی RTL
const codeBlocks = [...document.querySelectorAll('pre, code, textarea, .code-pre')];
check(
  'بلوک‌های کد dir="ltr" دارند (صفحه RTL است)',
  codeBlocks.length > 0 && codeBlocks.every((n) => (n.getAttribute('dir') ?? getComputedStyleDir(n)) === 'ltr'),
  `${codeBlocks.filter((n) => (n.getAttribute('dir') ?? getComputedStyleDir(n)) !== 'ltr').length} بلوک بدون ltr از ${codeBlocks.length}`,
);
function getComputedStyleDir(node) {
  try {
    return window.getComputedStyle(node).direction;
  } catch {
    return null;
  }
}

// عنصر تعاملی بدون نام دسترس‌پذیر
const unnamed = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')].filter((n) => {
  const text = (n.textContent ?? '').trim();
  const label = n.getAttribute('aria-label') || n.getAttribute('title') || n.getAttribute('placeholder');
  const labelledBy = n.getAttribute('aria-labelledby');
  const alt = n.getAttribute('alt');
  return !text && !label && !labelledBy && !alt;
});
check('هیچ عنصر تعاملیِ بی‌نام وجود ندارد', unnamed.length === 0, `${unnamed.length} مورد`);

// کنترل تعاملی تودرتو (دکمه داخل دکمه) — هم برای a11y هم برای UX خطا
const nested = [...document.querySelectorAll('button button, a a, button a, a button')];
check('کنترل تعاملی تودرتو نداریم', nested.length === 0, `${nested.length} مورد`);

// تصویر/آیکون تزئینی باید aria-hidden داشته باشد
const decorativeSvg = [...document.querySelectorAll('svg')].filter(
  (s) => !s.getAttribute('aria-label') && !s.querySelector('title') && s.getAttribute('aria-hidden') !== 'true' && !s.getAttribute('role'),
);
check(
  'SVGهای تزئینی aria-hidden="true" دارند',
  decorativeSvg.length === 0,
  `${decorativeSvg.length} SVG بدون وضعیت روشن از ${document.querySelectorAll('svg').length}`,
);

/* --------------------------------- گزارش --------------------------------- */

const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const list = [...violations.values()].sort((a, b) => order[a.impact] - order[b.impact] || b.count - a.count);
const fails = list.filter((v) => v.impact === 'critical' || v.impact === 'serious');
const warns = list.filter((v) => v.impact === 'moderate' || v.impact === 'minor');
const manualFails = manual.filter((m) => !m.ok);

const line = '─'.repeat(78);
const out = [];
out.push(`\n${line}`);
out.push('  ممیزی دسترس‌پذیری — axe-core روی DOM واقعی همه‌ی نماها');
out.push(line);
out.push('  نماهای اسکن‌شده:');
for (const v of perView) out.push(`    • ${v.name.padEnd(26)} ${v.violations} تخلف | ${v.passes} قاعده‌ی موفق`);

if (list.length) {
  out.push('\n  تخلف‌های axe (تجمیع‌شده در همه‌ی نماها):');
  for (const v of list) {
    const icon = v.impact === 'critical' ? '🔴' : v.impact === 'serious' ? '🟠' : v.impact === 'moderate' ? '🟡' : '⚪';
    out.push(`\n  ${icon} [${v.impact}] ${v.id} — ${v.help}`);
    out.push(`     ${v.count} عنصر در ${v.views.size} نما: ${[...v.views].join('، ')}`);
    for (const n of v.nodes.slice(0, 3)) out.push(`       ▸ ${n}`);
    out.push(`     راهنما: ${v.helpUrl}`);
  }
} else {
  out.push('\n  ✅ axe هیچ تخلفی پیدا نکرد.');
}

out.push('\n  بررسی‌های دستیِ RTL/فارسی:');
for (const m of manual) out.push(`    ${m.ok ? '✓' : '✗'} ${m.label}${m.detail ? ` — ${m.detail}` : ''}`);

out.push(`\n${line}`);
const broken = fails.length + manualFails.length;
out.push(
  broken
    ? `  ❌ ممیزی رد شد — ${fails.length} تخلف جدی axe + ${manualFails.length} بررسی دستی ناموفق.`
    : `  ✅ تخلف جدی ندارد (${warns.length} مورد خفیف برای بهبود باقی است).`,
);
out.push(`${line}\n`);
process.stdout.write(out.join('\n') + '\n');

process.exit(broken > 0 ? 1 : 0);
