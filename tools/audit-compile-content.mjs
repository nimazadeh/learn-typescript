/* ==========================================================================
   audit-compile-content — «آیا کدی که به دانشجو نشان می‌دهیم واقعاً درست است؟»

   هر قطعه کد محتوا را با **همان موتوری** کامپایل می‌کند که سرور استفاده
   می‌کند (`lib/tsEngine.mjs` → TypeScript واقعی)، پس چیزی که اینجا سنجیده
   می‌شود دقیقاً همان چیزی است که کاربر در آزمایشگاه زنده می‌بیند.

   لایه‌ها (به ترتیب سخت‌گیری):
     L0  زبان بلوک: `bash`/`json` اصلاً TypeScript نیست → کامپایل نمی‌شود،
         فقط شمرده و گزارش می‌شود (این بلوک‌ها در UI هم دکمه‌ی «اجرا» ندارند).
     L1  گام درس‌ها: یک بلوک آموزشی معمولاً چند مثال ❌ و ✅ را کنار هم
         می‌گذارد، پس خطاهای «معنایی» در آن طبیعی است. فقط خطای **سینتکسی**
         یعنی بلوک خراب است (FAIL).
     L2  starter آزمایشگاه‌ها: دانشجو این را می‌بیند و «اجرا» می‌زند →
         باید تمیز کامپایل شود، مگر آنکه در allowlist دلیل‌دار باشد.
     L3  solution و نمونه‌های Playground و چالش‌ها: یا باید تمیز باشند،
         یا «قطعه» باشند (فقط به خاطر نبودِ context خطای «نام پیدا نشد»
         می‌دهند) که آن‌وقت WARN است نه FAIL.

   allowlist: فایل `tools/content-allowlist.json`. هر ورودی باید `reason`
   فارسی داشته باشد. اگر قطعه‌ای که در allowlist است سالم شود، ممیزی
   اخطار «ورودی کهنه» می‌دهد تا list پوسیده نماند.

   استفاده:
     node tools/audit-compile-content.mjs [--verbose] [--json] [--filter <substr>]
   کد خروج: ۱ اگر حتی یک FAIL وجود داشته باشد.
   ========================================================================== */

import { performance } from 'node:perf_hooks';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compileTypeScript } from '../lib/tsEngine.mjs';
import { detectLang } from '../src/core/highlight.js';
import { ALL_LESSONS } from '../src/data/curriculum/index.js';
import { SNIPPETS, CHALLENGES } from '../src/data/playground.js';

/* ------------------------------- CLI ---------------------------------- */

const ARGV = process.argv.slice(2);
const has = (f) => ARGV.includes(f);
const valueOf = (f) => (ARGV.includes(f) ? ARGV[ARGV.indexOf(f) + 1] : undefined);
const VERBOSE = has('--verbose');
const AS_JSON = has('--json');
const FILTER = valueOf('--filter');

const ALLOWLIST_PATH = new URL('./content-allowlist.json', import.meta.url);

/** خطاهای سینتکسی — یعنی بلوک حتی پارس نمی‌شود. */
const SYNTAX_CODES = new Set([1005, 1109, 1127, 1128, 1135, 1136, 1434, 1003, 1068, 1161, 1162]);
/** خطاهایی که از نبودِ context می‌آیند (نشانه‌ی «قطعه» بودن، نه خرابی). */
const CONTEXT_CODES = new Set([2304, 2307, 2552, 2664, 2693, 2686, 2503, 2749]);

function loadAllowlist() {
  const path = fileURLToPath(ALLOWLIST_PATH);
  if (!existsSync(path)) return { entries: new Map(), raw: null };
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return { entries: new Map(raw.entries.map((e) => [e.key, e])), raw };
}

/* --------------------------- قطعه‌سنجی -------------------------------- */

/**
 * @typedef {{
 *   key: string, origin: string, layer: 'L0'|'L1'|'L2'|'L3',
 *   code: string, allowFragment: boolean
 * }} Unit
 */

function compile(code) {
  const started = performance.now();
  let out;
  try {
    out = compileTypeScript(code, {});
  } catch (err) {
    return { crashed: String(err?.message ?? err), errors: [], ms: performance.now() - started };
  }
  const errors = (out.diagnostics ?? [])
    .filter((d) => d.category === 'error')
    .map((d) => ({ code: d.code, line: d.line, column: d.column, message: d.message }));
  return { errors, ms: performance.now() - started };
}

/**
 * آیا این کد یک «طرح نیمه‌تمام» است؟ بعضی solutionها عمداً بدنه‌ی تابع را
 * با `{ ... }` یا یک `type` خالی نشان می‌دهند تا شکل راه‌حل را برسانند.
 * نشانه‌اش نقطه‌چینی است که «بدنه» باشد، نه rest/spread (`...args`) و نه
 * range (`a...b`).
 */
function isSketch(code) {
  return /(^|[^.\w])\.{3}([^.\w]|$)/.test(code) || /[({\[]\s*…\s*[)}\]]/.test(code);
}

/** داوری یک واحد بر اساس لایه‌اش. */
function judge(unit, result) {
  if (result.crashed) return { status: 'FAIL', reason: `موتور crash کرد: ${result.crashed}` };

  const syntax = result.errors.filter((e) => SYNTAX_CODES.has(e.code));

  // لایه‌ی ۱ (گام درس) و طرح‌های نیمه‌تمام: فقط سینتکس اهمیت دارد.
  // بلوک آموزشی معمولاً مثال ❌ و ✅ را کنار هم می‌گذارد، پس خطای معنایی
  // در آن طبیعی است — ولی اگر پارس نشود، یعنی بلاک واقعاً خراب است.
  if (unit.layer === 'L1' || unit.sketch) {
    if (!syntax.length) {
      return {
        status: 'PASS',
        reason: unit.sketch ? 'طرح نیمه‌تمام — سینتکس سالم است' : '',
      };
    }
    return { status: 'FAIL', reason: `${syntax.length} خطای سینتکسی در بلوک آموزشی` };
  }

  if (result.errors.length === 0) return { status: 'PASS', reason: '' };

  // قطعه‌ای که برای اجرا به context درس نیاز دارد
  if (unit.allowFragment && result.errors.some((e) => CONTEXT_CODES.has(e.code))) {
    return {
      status: 'WARN',
      reason: `قطعه است — بدون context درس اجرا نمی‌شود (${result.errors.map((e) => `TS${e.code}`).join(', ')})`,
    };
  }
  return { status: 'FAIL', reason: `${result.errors.length} خطای کامپایل در کدی که دانشجو اجرا می‌کند` };
}

/* ------------------------------ گردآوری ------------------------------- */

function collectUnits() {
  /** @type {Unit[]} */
  const units = [];
  /** @type {{ key: string, lang: string, origin: string }[]} */
  const nonTs = [];

  for (const lesson of ALL_LESSONS) {
    lesson.steps?.forEach((step, i) => {
      if (!step.code) return;
      const key = `${lesson.id}#step${i + 1}`;
      const origin = `درس «${lesson.titleFa}» — ${step.h ?? `گام ${i + 1}`}`;
      const lang = detectLang(step);
      if (lang !== 'ts' && lang !== 'js') {
        nonTs.push({ key, lang, origin });
        return;
      }
      units.push({ key, origin, layer: 'L1', code: step.code, allowFragment: false });
    });

    if (lesson.lab?.starter) {
      units.push({
        key: `${lesson.id}#lab.starter`,
        origin: `درس «${lesson.titleFa}» — starter آزمایشگاه`,
        layer: 'L2',
        code: lesson.lab.starter,
        allowFragment: false,
      });
    }
    if (lesson.lab?.solution) {
      units.push({
        key: `${lesson.id}#lab.solution`,
        origin: `درس «${lesson.titleFa}» — solution آزمایشگاه`,
        layer: 'L3',
        code: lesson.lab.solution,
        allowFragment: true,
      });
    }
  }

  for (const snippet of SNIPPETS) {
    units.push({
      key: `playground/${snippet.id}`,
      origin: `Playground — نمونه‌ی «${snippet.label}»`,
      layer: 'L3',
      code: snippet.code,
      allowFragment: false,
    });
  }

  for (const ch of CHALLENGES) {
    for (const part of ['starter', 'solution']) {
      if (!ch[part]) continue;
      units.push({
        key: `challenge/${ch.id}/${part}`,
        origin: `چالش «${ch.title}» — ${part}`,
        // starter چالش عمداً «ناتمام» است تا دانشجو کاملش کند
        layer: part === 'starter' ? 'L3' : 'L3',
        code: ch[part],
        allowFragment: part === 'solution',
      });
    }
  }

  return { units, nonTs };
}

/* -------------------------------- اجرا -------------------------------- */

const startedAt = performance.now();
const { entries: allowlist } = loadAllowlist();
let { units, nonTs } = collectUnits();
if (FILTER) units = units.filter((u) => u.key.includes(FILTER) || u.origin.includes(FILTER));

const results = [];
const usedAllowKeys = new Set();

for (const unit of units) {
  const result = compile(unit.code);
  const unitWithSketch = { ...unit, sketch: unit.layer === 'L3' && isSketch(unit.code) };
  let { status, reason } = judge(unitWithSketch, result);

  const allowed = allowlist.get(unit.key);
  if (allowed && status === 'FAIL') {
    status = 'ALLOWED';
    reason = `مجاز (allowlist): ${allowed.reason}`;
    usedAllowKeys.add(unit.key);
  }

  results.push({ ...unit, ...result, status, reason });
}

// ورودی‌های کهنه: قطعه‌ای که قبلاً خراب بود و الان سالم شده
const stale = [...allowlist.keys()].filter((k) => !usedAllowKeys.has(k));

const count = (s) => results.filter((r) => r.status === s).length;
const fails = results.filter((r) => r.status === 'FAIL');
const warns = results.filter((r) => r.status === 'WARN');
const allowedHits = results.filter((r) => r.status === 'ALLOWED');
const totalMs = performance.now() - startedAt;

if (AS_JSON) {
  process.stdout.write(
    JSON.stringify(
      { total: results.length, nonTs: nonTs.length, pass: count('PASS'), warn: warns, allowed: allowedHits.length, fails, stale },
      null,
      2,
    ) + '\n',
  );
  process.exit(fails.length > 0 ? 1 : 0);
}

const line = '─'.repeat(78);
const out = [];
out.push(`\n${line}`);
out.push('  ممیزی کامپایل محتوا — TypeScript واقعی روی همه‌ی کدهای آموزشی');
out.push(line);
out.push(`  کل قطعه‌ها: ${results.length}   |   غیرTypeScript (Shell/JSON): ${nonTs.length}   |   زمان: ${(totalMs / 1000).toFixed(1)}s`);
out.push(`  ✅ PASS ${count('PASS')}   ⚠️  WARN ${warns.length}   📋 ALLOWED ${allowedHits.length}   ❌ FAIL ${fails.length}`);

const report = (title, list, showErrors = true) => {
  if (!list.length) return;
  out.push(`\n${title}`);
  for (const r of list) {
    out.push(`\n  • ${r.key}   [${r.layer}]`);
    out.push(`    ${r.origin}`);
    out.push(`    ${r.reason}`);
    if (showErrors) {
      for (const e of r.errors.slice(0, 4)) out.push(`      TS${e.code} [${e.line}:${e.column}] ${e.message}`);
      if (r.errors.length > 4) out.push(`      … و ${r.errors.length - 4} خطای دیگر`);
    }
  }
};

report('❌ باید اصلاح شود:', fails);
if (stale.length) {
  out.push('\n🧹 ورودی‌های کهنه در allowlist (این قطعه‌ها دیگر خراب نیستند — حذفشان کن):');
  for (const k of stale) out.push(`  • ${k} — ${allowlist.get(k).reason}`);
}
report('⚠️  قطعه‌هایی که فقط با context درس اجرا می‌شوند:', warns, false);
report('📋 خطاهای مجازِ دلیل‌دار (allowlist):', allowedHits, false);

if (VERBOSE) {
  out.push('\n✅ همه‌ی قطعه‌های سالم:');
  for (const r of results.filter((x) => x.status === 'PASS')) out.push(`  • ${r.key} [${r.layer}] (${r.ms.toFixed(0)}ms)`);
  out.push('\nغیرTypeScript:');
  for (const n of nonTs) out.push(`  • ${n.key} → ${n.lang} | ${n.origin}`);
}

out.push(`\n${line}`);
out.push(
  fails.length
    ? `  ❌ ممیزی رد شد — ${fails.length} قطعه کد آموزشی مشکل واقعی دارد.`
    : `  ✅ هیچ کد آموزشی خرابی پیدا نشد (${count('PASS')} سالم، ${warns.length} قطعه، ${allowedHits.length} مجازِ دلیل‌دار).`,
);
out.push(`${line}\n`);
process.stdout.write(out.join('\n') + '\n');

process.exit(fails.length > 0 ? 1 : 0);
