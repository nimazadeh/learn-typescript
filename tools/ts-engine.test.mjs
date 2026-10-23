/**
 * آزمون واحد برای `lib/tsEngine.mjs` — موتور کامپایل TypeScript.
 *
 * چرا این فایل لازم است؟
 *   تا پیش از این رفتار موتور فقط «غیرمستقیم» و از راه `tools/audit-compile-content.mjs`
 *   سنجیده می‌شد؛ یعنی بررسی می‌کردیم که *محتوای درس‌ها* کامپایل می‌شود، نه اینکه
 *   *خودِ موتور* درست کار می‌کند. باگی که پیدا و رفع شد (X-Ray یک نتیجه‌ی جعلی
 *   `const m: Minutes = 50 → any` برمی‌گرداند چون `findTokenAt` به گره‌ی «دربرگیرنده»
 *   برمی‌گشت و ستون هم بی‌صدا clamp می‌شد) بدون آزمونِ سطح موتور، بی‌صدا می‌ماند.
 *
 * قرارداد خروجی `compileTypeScript(source, flags)` که اینجا قفل می‌شود:
 *   { ok, jsCode, diagnostics[], xrays[], erasedStats{tsBytes,jsBytes,erasedNodes}, durationMs, tsVersion }
 *
 * این آزمون‌ها DOM و سرور نمی‌خواهند؛ با `node:test` خالص اجرا می‌شوند.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import ts from 'typescript';

import {
  compileTypeScript,
  countErasedNodes,
  findTokenAt,
  readableType,
  createSandboxHost,
  coachFor,
  ERROR_COACH,
  TS_VERSION,
} from '../lib/tsEngine.mjs';

/* ---------- ابزارهای کمکی محلی (DRY) ---------- */

/** فقط پرسش‌های `^?` (نه گزارشِ خودکارِ تعریف‌ها). */
const queriesOf = (result) => result.xrays.filter((x) => x.kind === 'query');

/** پرسش‌های `^?` را به شکل `['نام → تایپ', …]` استخراج می‌کند. */
const queryLines = (source, flags = {}) =>
  queriesOf(compileTypeScript(source, flags)).map((x) => `${x.name} → ${x.type}`);

/** کد شماره‌ای همه‌ی خطاها (category === 'error'). */
const errorCodes = (source, flags = {}) =>
  compileTypeScript(source, flags).diagnostics.filter((d) => d.category === 'error').map((d) => d.code);

const sourceFileOf = (text) => ts.createSourceFile('t.ts', text, ts.ScriptTarget.ES2022, true);

/** یک TypeChecker واقعی روی متن دلخواه — برای آزمونِ توابعِ سطحِ پایینِ موتور. */
function checkerFor(text) {
  const fileName = '/probe.ts';
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
  };
  const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.ES2022, true);
  const program = ts.createProgram([fileName], options, createSandboxHost(options, fileName, sourceFile, text));
  return { checker: program.getTypeChecker(), sourceFile, program };
}

/** تایپِ خوانایِ نخستین `const` در متن. */
function readableOfFirstConst(text) {
  const { checker, sourceFile } = checkerFor(text);
  const stmt = sourceFile.statements.find((n) => ts.isVariableStatement(n));
  const decl = stmt.declarationList.declarations[0];
  const node = decl.name;
  return readableType(checker, checker.getTypeAtLocation(node), node);
}


/* ---------- نسخه و قرارداد خروجی ---------- */

test('TS_VERSION معتبر و هم‌خوان با نصبِ typescript است', () => {
  assert.equal(typeof TS_VERSION, 'string');
  assert.match(TS_VERSION, /^\d+\.\d+\.\d+/);
  assert.equal(TS_VERSION, ts.version);
  assert.equal(compileTypeScript('const a = 1;', {}).tsVersion, ts.version);
});

test('خروجی compileTypeScript همه‌ی فیلدهای قرارداد را دارد', () => {
  const result = compileTypeScript('const x: number = 1;\nconsole.log(x);', {});
  for (const key of ['ok', 'jsCode', 'diagnostics', 'xrays', 'erasedStats', 'durationMs', 'tsVersion']) {
    assert.ok(key in result, `فیلد «${key}» در خروجی نیست`);
  }
  assert.equal(typeof result.ok, 'boolean');
  assert.equal(typeof result.jsCode, 'string');
  assert.ok(Array.isArray(result.diagnostics));
  assert.ok(Array.isArray(result.xrays));
  assert.equal(typeof result.erasedStats.erasedNodes, 'number');
});

/* ---------- کامپایل و پاک‌سازی تایپ ---------- */

test('تایپ پاک می‌شود و JS سالم تولید می‌شود', () => {
  const result = compileTypeScript('type A = number;\nconst x: A = 1;\nconsole.log(x);', {});
  assert.equal(result.ok, true);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.jsCode.trim(), '"use strict";\nconst x = 1;\nconsole.log(x);');
  assert.equal(result.erasedStats.erasedNodes, 2);
  assert.ok(result.erasedStats.jsBytes < result.erasedStats.tsBytes, 'JS باید از TS کوچک‌تر باشد');
});

test('کد بدون خطا → jsCode غیرخالی و ok === true', () => {
  const result = compileTypeScript('const greet = (n: string): string => `hi ${n}`;', {});
  assert.equal(result.ok, true);
  assert.ok(result.jsCode.includes('const greet'));
});

test('countErasedNodes گره‌های تایپ‌محور را می‌شمارد', () => {
  const withTypes = countErasedNodes(
    sourceFileOf('interface I { a: string }\ntype T = I;\nconst v: T = { a: "x" };'),
  );
  assert.ok(withTypes >= 4, `انتظار حداقل ۴ گره‌ی پاک‌شده، دریافت ${withTypes}`);
  assert.equal(countErasedNodes(sourceFileOf('const plain = 1;')), 0);
});

/* ---------- تشخیص خطا ---------- */

test('خطای نوع با کد درست و پیام گویا گزارش می‌شود', () => {
  const result = compileTypeScript('const n: number = "text";', {});
  assert.equal(result.ok, false);
  const codes = result.diagnostics.map((d) => d.code);
  assert.ok(codes.includes(2322), `کدها: ${codes.join(',')}`);
  const diag = result.diagnostics.find((d) => d.code === 2322);
  assert.ok(diag.message.includes('string'), 'پیام باید نوع اشتباه را نام ببرد');
  assert.ok(diag.coach && diag.coach.title, 'هر خطا باید راهنمای آموزشی فارسی داشته باشد');
});

test('شناسه‌ی تعریف‌نشده → TS2304', () => {
  assert.ok(errorCodes('const a = doesNotExist + 1;').includes(2304));
});

test('global های Node بدون lib مناسب → TS2580', () => {
  const codes = errorCodes('process.exit(0);');
  assert.ok(codes.includes(2580), `کدها: ${codes.join(',')}`);
});

test('پرچم strict بررسی پوچی را فعال/غیرفعال می‌کند', () => {
  const src = 'let s: string | null = null;\ns.length;';
  const strictCodes = errorCodes(src, {});
  assert.ok(strictCodes.includes(18047), `کدها: ${strictCodes.join(',')}`);
  assert.deepEqual(errorCodes(src, { strict: false }), [], 'با strict:false نباید خطایی بماند');
});

test('وایت‌لیست پرچم‌ها: تنها پرچم‌های UI اثر می‌کنند', () => {
  // قراردادِ موتور با FLAG_PRESETS در `src/components/liveLab.js` یکی است.
  // پرچمِ بیرون از وایت‌لیست بی‌صدا نادیده گرفته می‌شود (strict را نمی‌شکند)؛
  // اگر روزی پرچمی به UI اضافه شد، این آزمون یادآوری می‌کند که
  // وایت‌لیستِ `compileTypeScript` هم باید به‌روز شود.
  const src = 'let s: string | null = null;\ns.length;';
  assert.deepEqual(errorCodes(src, { strict: false }), []);
  assert.ok(errorCodes(src, { strictNullChecks: false }).includes(18047),
    'پرچمِ بیرون از وایت‌لیست نباید strict را خاموش کند');

  const idx = 'const a = [1];\nconst b: number = a[0];';
  assert.ok(errorCodes(idx, { noUncheckedIndexedAccess: true }).includes(2322),
    'noUncheckedIndexedAccess باید a[0] را number | undefined کند');
  assert.deepEqual(errorCodes(idx, { noUncheckedIndexedAccess: false }), []);
});

test('هر دیباگ خط، ستون و دسته‌بندی دارد', () => {
  const result = compileTypeScript('const a: number = 1;\nconst b: number = "x";', {});
  assert.ok(result.diagnostics.length >= 1);
  for (const d of result.diagnostics) {
    assert.equal(typeof d.code, 'number');
    assert.ok(d.line >= 1, 'شماره‌ی خط باید از ۱ شروع شود');
    assert.ok(d.column >= 0);
    assert.equal(typeof d.message, 'string');
    assert.ok(['error', 'warning', 'suggestion', 'message'].includes(d.category), `دسته‌ی نامعتبر: ${d.category}`);
  }
  assert.ok(result.diagnostics.some((d) => d.line === 2), 'خطای خط دوم باید گزارش شود');
});

/* ---------- ERROR_COACH / coachFor ---------- */

test('ERROR_COACH: کلیدها شماره‌ی TS و مقدارها [عنوان، راهنما] هستند', () => {
  const keys = Object.keys(ERROR_COACH);
  assert.ok(keys.length >= 8, `تعداد راهنماها: ${keys.length}`);
  for (const key of keys) {
    assert.match(key, /^\d+$/, 'کلید باید شماره‌ی TS باشد');
    const entry = ERROR_COACH[key];
    assert.ok(Array.isArray(entry), `راهنمای ${key} باید آرایه باشد`);
    assert.equal(entry.length, 2, `راهنمای ${key} باید [عنوان، متن] باشد`);
    assert.ok(entry[0].trim().length > 2, `عنوان ${key} خالی است`);
    assert.ok(entry[1].trim().length > 10, `متن ${key} خیلی کوتاه است`);
  }
});

test('coachFor همیشه {title, advice} می‌دهد و برای کد ناشناخته به راهنمای عمومی می‌رسد', () => {
  const known = coachFor(2322);
  assert.ok(known.title.length > 2 && known.advice.length > 10);
  const fallback = coachFor(999999);
  assert.equal(typeof fallback.title, 'string');
  assert.ok(fallback.advice.length > 10, 'کد ناشناخته باید راهنمای عمومی بگیرد، نه پاسخ خالی');
  assert.notDeepEqual(fallback, known);
});

/* ---------- X-Ray: خوانایی تایپ ---------- */

test('readableType: آبجکت بی‌نامِ بزرگ به فهرست خوانا باز می‌شود', () => {
  const text = 'const cfg = { port: 3000, host: "localhost", debug: true, retries: 3, name: "x", mode: "dev" };';
  const readable = readableOfFirstConst(text);
  assert.ok(readable.includes('port'), `باز نشده: ${readable}`);
  assert.ok(readable.includes('number') && readable.includes('string') && readable.includes('boolean'));
  assert.ok(readable.includes('port: number'), `قالبِ «نام: تایپ» رعایت نشده: ${readable}`);
});

test('readableType: تایپ فراخوانی‌شدنی باز نمی‌شود (امضا خوانا می‌ماند)', () => {
  const readable = readableOfFirstConst('const f = (a: string, b: number): boolean => a.length > b;');
  assert.ok(readable.includes('=>'), `امضا باید دیده شود: ${readable}`);
  assert.ok(!readable.includes('\n'), 'امضا نباید چندخطی باز شود');
});

test('readableType: تایپ‌های ساده دست‌نخورده می‌مانند (const لیترال، let گسترده)', () => {
  // تفاوتِ آموزشیِ مهم: `const` تایپِ لیترال را نگه می‌دارد ولی `let` آن را
  // به تایپِ پایه گسترش می‌دهد. readableType نباید هیچ‌کدام را دست بزند.
  assert.equal(readableOfFirstConst('const n = 42;'), '42');
  assert.equal(readableOfFirstConst('const s = "hi";'), '"hi"');
  assert.equal(readableOfFirstConst('const a = [1, 2, 3];'), 'number[]');
  assert.equal(readableOfFirstConst('let m = 42;'), 'number');
  assert.equal(readableOfFirstConst('let t = "hi";'), 'string');
});

test('X-Ray: آبجکت بزرگ در پاسخ پرسش هم باز می‌شود', () => {
  const [q] = queriesOf(
    compileTypeScript('const cfg = { port: 3000, host: "localhost", on: true };\n//    ^?\n', {}),
  );
  assert.ok(q, 'پرسش باید یک نتیجه بدهد');
  assert.equal(q.name, 'cfg');
  assert.ok(q.type.includes('port'), `تایپ باز نشده: ${q.type}`);
  assert.ok(q.type.includes('number') && q.type.includes('string'));
  assert.equal(q.line, 1, 'پرسش باید به خطِ عبارت اشاره کند');
});

/* ---------- X-Ray: پرسش‌های ^? ---------- */

test('X-Ray: پرسش ترازِ درست، تایپ استنتاجی را می‌دهد', () => {
  assert.deepEqual(queryLines('const arr = [1, 2, 3];\n//    ^?\n'), ['arr → number[]']);
  assert.deepEqual(queryLines('const plan = [300, 300];\n//    ^?\n'), ['plan → number[]']);
});

test('X-Ray: تایپِ آبجکت و اینترفیس درست حل می‌شود', () => {
  assert.deepEqual(queryLines('interface P { x: number }\nconst p: P = { x: 1 };\n//    ^?\n'), [
    'p → P',
  ]);
});

test('X-Ray: Union بدون ساده‌سازی بیش‌ازحد گزارش می‌شود', () => {
  assert.deepEqual(queryLines('type U = string | number;\nconst u: U = 1;\n//    ^?\n'), [
    'u → string | number',
  ]);
});

test('X-Ray: لیترال عددی تایپ خود را دارد', () => {
  assert.deepEqual(queryLines('const z = 42;\n//        ^?\n'), ['42 → 42']);
});

test('X-Ray: امضای تابع گزارش می‌شود', () => {
  assert.deepEqual(
    queryLines('function f(a: string) { return a; }\nconst w = f("x");\n//        ^?\n'),
    ['f → (a: string) => string'],
  );
});

test('X-Ray: چند پرسش در یک فایل، هر دو پاسخ می‌گیرند', () => {
  assert.deepEqual(queryLines('const a = [1];\n//    ^?\nconst b = { x: 1 };\n//    ^?\n'), [
    'a → number[]',
    'b → { x: number; }',
  ]);
});

test('X-Ray: تعریف‌ها هم خودکار گزارش می‌شوند (kind غیر از query)', () => {
  const result = compileTypeScript('type Minutes = number;\nconst m: Minutes = 50;\n', {});
  const declared = result.xrays.filter((x) => x.kind !== 'query');
  const names = declared.map((x) => x.name);
  assert.ok(names.includes('m'), `نام‌ها: ${names.join(',')}`);
  for (const x of declared) {
    assert.ok(['const', 'let', 'var', 'function', 'class', 'enum', 'type', 'interface'].includes(x.kind));
    assert.equal(typeof x.type, 'string');
    assert.ok(x.type.length > 0);
  }
});

/* ---------- X-Ray: رگرسیونِ باگ‌های رفع‌شده ---------- */

test('رگرسیون: پرسشِ کج باید «بی‌پاسخ» بماند، نه پاسخِ غلط', () => {
  // ستون از انتهای خط بیرون است — پیش‌تر clamp می‌شد و عبارت بی‌ربطی
  // با تایپ `any` برمی‌گرداند.
  assert.deepEqual(queryLines('const x = 1;\n//                              ^?\n'), []);
});

test('رگرسیون: `^?` زیر فاصله هیچ نتیجه‌ای نمی‌دهد', () => {
  assert.deepEqual(queryLines('const m: number = 50;\n//  ^?\n'), []);
});

test('رگرسیون: `^?` زیر کلیدواژه (const/let/type) نتیجه نمی‌دهد', () => {
  assert.deepEqual(queryLines('const y = 1;\n//^?\n'), []);
  assert.deepEqual(queryLines('const y = 1;\n//^^^?\n'), []);
  assert.deepEqual(queryLines('type T = number;\n//^?\n'), []);
});

test('هیچ پرسش X-Ray نباید تایپ `any` بی‌دلیل برگرداند', () => {
  const sources = [
    'const arr = [1, 2, 3];\n//    ^?\n',
    'const m: number = 50;\n//  ^?\n',
    'const y = 1;\n//^?\n',
    'const x = 1;\n//                              ^?\n',
    'interface P { x: number }\nconst p: P = { x: 1 };\n//    ^?\n',
  ];
  for (const src of sources) {
    for (const q of queriesOf(compileTypeScript(src, {}))) {
      assert.notEqual(q.type, 'any', `پاسخِ «any» برای ${JSON.stringify(src)} → ${q.name}`);
      assert.notEqual(q.name.length > 20, true, `نامِ بیش‌ازحد طولانی نشانه‌ی گره‌ی دربرگیرنده است: ${q.name}`);
    }
  }
});

/* ---------- findTokenAt ---------- */

test('findTokenAt فقط برگِ واقعی برمی‌گرداند، نه گره‌ی دربرگیرنده', () => {
  const sourceFile = sourceFileOf('const arr = [1];');

  // موقعیت ۶ = شناسه‌ی `arr`
  const ident = findTokenAt(sourceFile, 6);
  assert.ok(ident, 'باید توکن `arr` پیدا شود');
  assert.equal(ident.getText(sourceFile), 'arr');
  assert.equal(ident.getChildCount(sourceFile), 0);

  // موقعیت ۲ = زیر کلیدواژه‌ی `const` → باید رد شود
  assert.equal(findTokenAt(sourceFile, 2), null);
  // موقعیت ۵ = فاصله → باید رد شود
  assert.equal(findTokenAt(sourceFile, 5), null);
  // بیرون از فایل → باید رد شود
  assert.equal(findTokenAt(sourceFile, 9999), null);
  assert.equal(findTokenAt(sourceFile, -1), null);
});

test('findTokenAt لیترال‌ها را نگه می‌دارد ولی نشانه‌ها را رد می‌کند', () => {
  const sourceFile = sourceFileOf('const z = 42;');
  const literal = findTokenAt(sourceFile, 10);
  assert.ok(literal, 'لیترال عددی باید برگردد');
  assert.equal(literal.getText(sourceFile), '42');

  assert.equal(findTokenAt(sourceFile, 8), null, 'نشانه‌ی `=` نباید برگردد');
});

/* ---------- امنیت و پایداری ---------- */

test('ورودی خالی یا بی‌ربط موتور را نمی‌شکند', () => {
  for (const src of ['', '   ', '// فقط کامنت', ';;;', '{{{', 'const']) {
    const result = compileTypeScript(src, {});
    assert.equal(typeof result.jsCode, 'string');
    assert.ok(Array.isArray(result.diagnostics));
    assert.ok(Array.isArray(result.xrays));
    assert.equal(typeof result.ok, 'boolean');
  }
});

test('پرچم‌های ناشناخته باعث پرتاب استثنا نمی‌شوند', () => {
  const result = compileTypeScript('const a: number = 1;', {
    notARealFlag: true,
    target: 'ES2022',
  });
  assert.equal(typeof result.jsCode, 'string');
  assert.equal(result.ok, true);
});

test('عملکرد: میانگین هر کامپایل زیر ۲۵۰ms (با کش lib)', () => {
  compileTypeScript('const warm = 1;', {}); // گرم‌کردن کش
  const source = 'type A = { b: string };\nconst v: A = { b: "x" };\nconsole.log(v);';
  const runs = 20;
  const started = Date.now();
  for (let i = 0; i < runs; i += 1) compileTypeScript(source, {});
  const perRun = (Date.now() - started) / runs;
  assert.ok(perRun < 250, `میانگین ${perRun.toFixed(1)}ms بیش از حد کند است`);
});
