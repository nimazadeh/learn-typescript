/* ==========================================================================
   audit-css — ممیزی stylesheetها بدون هیچ وابستگی بیرونی

   (عمداً از stylelint استفاده نمی‌کنیم: نسخه‌ی موجودش ۵ آسیب‌پذیری
    high-severity دارد و `npm audit` باید صفر بماند.)

   چه چیزی را بررسی می‌کند:
     ۱) هر `var(--x)` که `--x` هیچ‌جا تعریف نشده و fallback هم ندارد → FAIL
        (این دقیقاً همان باگی است که باعث می‌شود یک بخش بی‌صدا بی‌رنگ بماند)
     ۲) هر stylesheet که در index.html لینک شده ولی روی دیسک نیست → FAIL
     ۳) توکن‌های تعریف‌شده ولی هرگز استفاده‌نشده → WARN (بار مرده)
     ۴) انتخابگرهای کلاسی که هیچ‌جا در HTML/JS ساخته نمی‌شوند → WARN (قاعده‌ی مرده)
     ۵) کلاس‌هایی که در UI ساخته می‌شوند ولی هیچ CSS ندارند → WARN (ظاهر نیم‌کاره)
     ۶) تعریف تکراری یک custom property در همان انتخابگر → WARN

   محدودیت صادقانه: این ابزار «ایستا» است. کلاس‌هایی که در زمان اجرا با
   الحاق رشته ساخته می‌شوند (`\`chip chip-${tone}\``) را با جست‌وجوی
   زیررشته‌ای پیدا می‌کند، ولی نمی‌تواند همه‌ی حالت‌های پویا را اثبات کند؛
   پس مورد ۴ و ۵ اخطارند نه شکست.

   اجرا: npm run audit:css
   ========================================================================== */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ARGV = process.argv.slice(2);
const VERBOSE = ARGV.includes('--verbose');

/* ------------------------------ خواندن ورودی‌ها --------------------------- */

const CSS_FILES = readdirSync(join(ROOT, 'styles'))
  .filter((f) => f.endsWith('.css'))
  .sort()
  .map((f) => join(ROOT, 'styles', f));

function collectSources(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.') || name === 'styles' || name === 'tools' || name === 'lib') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) collectSources(full, acc);
    else if (/\.(js|mjs|html)$/.test(name)) acc.push(full);
  }
  return acc;
}

const SOURCES = collectSources(ROOT);
const css = CSS_FILES.map((f) => ({ file: relative(ROOT, f), text: readFileSync(f, 'utf8') }));
const allCss = css.map((c) => c.text).join('\n');
const sourceText = SOURCES.map((f) => readFileSync(f, 'utf8')).join('\n');
const htmlText = readFileSync(join(ROOT, 'index.html'), 'utf8');

/* -------------------------------- گزارش ---------------------------------- */

let failures = 0;
const warnings = [];
const notes = [];

const fail = (msg) => {
  failures++;
  notes.push(`  ❌ ${msg}`);
};
const warn = (msg) => warnings.push(`  ⚠️  ${msg}`);

/* ۱) stylesheetهای لینک‌شده ولی مفقود */
const linked = [...htmlText.matchAll(/href="(styles\/[^"]+\.css)"/g)].map((m) => m[1]);
for (const href of linked) {
  if (!existsSync(join(ROOT, href))) fail(`stylesheet لینک‌شده در index.html وجود ندارد: ${href}`);
}
notes.push(`  • stylesheetهای لینک‌شده: ${linked.length} | موجود روی دیسک: ${css.length}`);

/* ۲) var(--x) بدون تعریف و بدون fallback */
const definedVars = new Set([...allCss.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:/gm)].map((m) => m[1]));
const usedVars = [...allCss.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*(,|\))/g)].map((m) => ({
  name: m[1],
  hasFallback: m[2] === ',',
}));
const undefinedNoFallback = usedVars.filter((u) => !definedVars.has(u.name) && !u.hasFallback);
if (undefinedNoFallback.length) {
  for (const u of new Set(undefinedNoFallback.map((x) => x.name))) fail(`var(${u}) استفاده شده ولی هیچ‌جا تعریف نشده و fallback هم ندارد`);
} else {
  notes.push(`  ✅ همه‌ی ${new Set(usedVars.map((u) => u.name)).size} متغیر CSS استفاده‌شده، تعریف‌شده‌اند`);
}

/* ۳) توکن‌های تعریف‌شده ولی استفاده‌نشده */
const usedNames = new Set(usedVars.map((u) => u.name));
const unusedTokens = [...definedVars].filter((v) => !usedNames.has(v));
// متغیرهایی که فقط در JS خوانده می‌شوند (getComputedStyle) هم معتبرند
const trulyUnused = unusedTokens.filter((v) => !sourceText.includes(v));
if (trulyUnused.length) warn(`${trulyUnused.length} توکن تعریف شده ولی هرگز استفاده نمی‌شود: ${trulyUnused.join(', ')}`);

/* ۴) قواعد مرده: انتخابگر کلاسی که هیچ‌جا ساخته نمی‌شود.
      کلاس‌های ترکیبی (`chip-${tone}` → chip-danger) هم «استفاده‌شده» حساب
      می‌شوند، وگرنه همه‌ی state-کلاس‌ها بی‌دلیل مرده گزارش می‌شوند. */
const classSelectors = new Set(
  [...allCss.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g)].map((m) => m[1]),
);
const composedPrefixes = new Set(
  [...sourceText.matchAll(/([A-Za-z][A-Za-z0-9_-]*)-\$\{/g)].map((m) => `${m[1]}-`),
);
const composedPrefixesCss = new Set(
  [...allCss.matchAll(/([A-Za-z][A-Za-z0-9_-]*)-\$\{/g)].map((m) => `${m[1]}-`),
);
const isComposed = (cls) => {
  const dash = cls.lastIndexOf('-');
  if (dash <= 0) return false;
  const prefix = cls.slice(0, dash + 1);
  return composedPrefixes.has(prefix) || composedPrefixesCss.has(prefix);
};
const deadSelectors = [...classSelectors].filter((cls) => {
  if (htmlText.includes(cls) || sourceText.includes(cls)) return false;
  if (isComposed(cls)) return false;
  // کلاس‌های وضعیتی که با classList.toggle(name, cond) هم می‌آیند
  return true;
});
if (deadSelectors.length) {
  warn(
    `${deadSelectors.length} انتخابگر کلاسی در CSS هست ولی هیچ‌جا استفاده نمی‌شود (قاعده‌ی مرده)` +
      (VERBOSE ? `:\n${deadSelectors.sort().map((d) => `      • .${d}`).join('\n')}` : ' (با --verbose فهرست کامل)'),
  );
}

/* ۵) کلاس‌های ساخته‌شده در UI بدون هیچ CSS */
/**
 * یک نام کلاس معتبر است؟ (نه تکه‌ی یک عبارت جاوااسکریپت)
 * قرارداد این پروژه kebab-case است؛ پس نام camelCase یعنی پسمانده‌ی عبارتی
 * جاوااسکریپتی که از رشته‌ی قالبِ تودرتو بیرون زده است.
 */
const isValidClassName = (c) => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(c);

const uiClasses = new Set();
const addClass = (raw) => {
  /* رشته‌های قالب تودرتو داریم (مثل `lesson-link is-${status} ${a === b ? 'x' : ''}`)
     که تا اولین بک‌تیکِ داخلی خوانده می‌شوند؛ پس تکه‌هایی که عملگر جاوااسکریپت
     دارند (=== ? : و …) دور ریخته می‌شوند چون نام کلاس نیستند. */
  for (const part of String(raw).split(/\s+/)) {
    const clean = part.replace(/\$\{[^}]*/g, '').replace(/['"`?]/g, '').trim();
    if (!clean) continue;
    if (/[=?:.()\[\]{}!&|<>]/.test(clean)) continue;
    if (isValidClassName(clean)) uiClasses.add(clean);
  }
};
for (const m of sourceText.matchAll(/class:\s*'([A-Za-z0-9_\- ]+)'/g)) addClass(m[1]);
for (const m of sourceText.matchAll(/class:\s*`([^`]*)`/g)) addClass(m[1]);
for (const m of sourceText.matchAll(/classList\.(?:add|toggle|remove)\(\s*'([A-Za-z0-9_\- ]+)'/g)) addClass(m[1]);
for (const m of htmlText.matchAll(/class="([^"]+)"/g)) addClass(m[1]);

/** آیا این کلاس در CSS یا در کد «ارجاع» داده شده؟ (querySelector/classList/…) */
const isReferenced = (c) => {
  if (allCss.includes(c)) return true;
  // انتخابگرهای CSS همیشه با نقطه می‌آیند: `.tab-panel`
  if (sourceText.includes(`.${c}`)) return true;
  return new RegExp(
    `classList\\.(?:add|toggle|remove|contains)\\(\\s*['\"]${c}['\"]`,
  ).test(sourceText);
};

// کلاسی که نه CSS دارد و نه هیچ‌جا ارجاع می‌شود، «مرده» است
const unstyledAll = [...uiClasses].filter((c) => !isReferenced(c));
/* کلاس‌هایی که «قلاب» هستند نه پوسته:
   - وضعیت/گونه‌هایی که رنگشان مستقیم روی SVG گذاشته می‌شود (kind-*, status-*)
   - قلاب‌های رفتار که با classList عوض می‌شوند (htimer-*, *-view)
   این‌ها بودنشان درست است و نبودِ CSS برای‌شان باگ نیست. */
const HOOK_PATTERNS = [/^kind-/, /^status-/, /^(htimer|lesson|coach|playbook|playground|roadmap)-/, /-view$/, /^(map-nodes|map-edges)$/, /^is-/];
const unstyled = unstyledAll.filter((c) => !HOOK_PATTERNS.some((re) => re.test(c)));
if (unstyled.length) {
  warn(
    `${unstyled.length} کلاس در UI ساخته می‌شود ولی در CSS هیچ اثری ندارد` +
      (VERBOSE ? `:\n${unstyled.sort().map((u) => `      • ${u}`).join('\n')}` : ' (با --verbose فهرست کامل)'),
  );
}

/* ۶) تعریف تکراری یک custom property در همان انتخابگر */
{
  const blocks = [...allCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const dupes = [];
  for (const [, selector, body] of blocks) {
    const props = [...body.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]);
    const seen = new Set();
    for (const p of props) {
      if (seen.has(p)) dupes.push(`${selector.trim().slice(0, 40)} → ${p}`);
      seen.add(p);
    }
  }
  if (dupes.length) warn(`${dupes.length} تعریف تکراری custom property در یک انتخابگر: ${dupes.slice(0, 5).join(' | ')}`);
}

/* ۷) چند بررسی ساختاری RTL */
{
  // `left/right` مطلق در RTL خطرناک است؛ `inset-inline` یا logical properties امن‌ترند
  const absoluteSides = [...allCss.matchAll(/(^|[{;\s])(left|right)\s*:/gm)].length;
  const logicalSides = [...allCss.matchAll(/(margin|padding|inset|border)-(inline|block)-(start|end)/g)].length;
  notes.push(`  • ویژگی‌های چپ/راست مطلق: ${absoluteSides} | ویژگی‌های منطقی (RTL-امن): ${logicalSides}`);
  if (absoluteSides > logicalSides * 6 && logicalSides > 0) {
    warn('بیشتر موقعیت‌دهی‌ها با left/right مطلق نوشته شده‌اند؛ در اپ RTL ترجیحاً از inset-inline-start/end استفاده کن');
  }
  // prefers-reduced-motion باید پوشش داده شود (حرکت‌های اپ زیاد است)
  if (!allCss.includes('prefers-reduced-motion')) fail('هیچ قاعده‌ای برای prefers-reduced-motion نیست (انیمیشن‌ها برای کاربران حساس به حرکت خاموش نمی‌شوند)');
  else notes.push('  ✅ prefers-reduced-motion پوشش داده شده است');
}

/* -------------------------------- خروجی ---------------------------------- */

const line = '─'.repeat(78);
const out = [];
out.push(`\n${line}`);
out.push('  ممیزی CSS — متغیرها، قواعد مرده، و انطباق RTL');
out.push(line);
out.push(`  فایل‌ها: ${css.map((c) => `${c.file} (${c.text.split('\n').length} خط)`).join('، ')}`);
out.push(`  منابع اسکن‌شده برای کلاس‌ها: ${SOURCES.length} فایل`);
out.push(...notes);

if (warnings.length) {
  out.push('\n  اخطارها:');
  out.push(...warnings);
}

out.push(`\n${line}`);
out.push(
  failures
    ? `  ❌ ممیزی رد شد — ${failures} مشکل واقعی.`
    : `  ✅ هیچ مشکل واقعی در CSS نیست${warnings.length ? ` (${warnings.length} اخطار برای بهبود)` : ''}.`,
);
out.push(`${line}\n`);
process.stdout.write(out.join('\n') + '\n');

process.exit(failures > 0 ? 1 : 0);
