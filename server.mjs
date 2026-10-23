/* ==========================================================================
   TypeScript Mastery Studio — local server
   1) serves the static studio (index.html, styles, src, assets)
   2) POST /api/compile → REAL TypeScript 5.9 compiler (diagnostics + emitted JS
      + a "Type X-Ray" of every inferred type, including `// ^?` queries)
   ========================================================================== */

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

/* ------------------------------------------------------------------ */
/* Compiler service                                                    */
/* ------------------------------------------------------------------ */

const ERROR_COACH = {
  2304: ['نام پیدا نشد', 'این شناسه تعریف یا import نشده. نام تایپ/متغیر را بررسی کن — در TypeScript باید هر تایپ قبل از استفاده تعریف شده باشد.'],
  2307: ['ماژول پیدا نشد', 'مسیر import اشتباه است یا پسوند لازم را ندارد. با `moduleResolution: NodeNext` باید `./file.js` بنویسی حتی برای فایل `.ts`.'],
  2322: ['انتساب تایپ ناسازگار', 'مقداری که داری زیرمجموعه‌ی تایپ مقصد نیست. تایپ مقصد را با `^?` ببین و بررسی کن کدام فیلد یا عضو Union نمی‌خواند.'],
  2339: ['پراپرتی وجود ندارد', 'یا نام فیلد را اشتباه نوشته‌ای، یا تایپ را هنوز Narrow نکرده‌ای. اگر Union است، اول با `typeof`/`in`/`kind` شاخه‌ی درست را جدا کن.'],
  2345: ['آرگومان ناسازگار', 'مقداری که به تابع پاس داده‌ای با امضای پارامتر نمی‌خواند. اگر Generic داری، قید `extends` را چک کن.'],
  2353: ['پراپرتی اضافی', 'در object literal فیلدی داری که در تایپ مقصد وجود ندارد. یا تایپ را گسترش بده یا فیلد اضافی را حذف کن.'],
  2451: ['شناسه تکراری', 'دو تعریف هم‌نام در یک اسکوپ داری. اگر می‌خواهی ادغام شوند، از `interface` استفاده کن (Declaration Merging).'],
  2551: ['پیشنهاد اصلاح املا', 'کامپایلر یک نام نزدیک را پیشنهاد داده — معمولاً یک غلط املایی ساده است.'],
  2554: ['تعداد آرگومان‌ها اشتباه است', 'امضای تابع با تعداد آرگومان‌های تو نمی‌خواند. پارامترهای اختیاری (`?`) و پیش‌فرض را بررسی کن.'],
  2571: ['مقدار از نوع unknown است', 'این مقدار از `unknown` آمده (مثلاً `catch` یا `JSON.parse`). قبل از استفاده باید Narrow یا پارس شود — این ویژگی امنیتی است نه باگ.'],
  18046: ['مقدار از نوع unknown است', 'قبل از دسترسی به عضو، با یک Type Guard (مثل `typeof`، `instanceof` یا `in`) تایپ را اثبات کن.'],
  18048: ['ممکن است undefined باشد', 'یک بررسی `!== undefined` یا `?.` یا `??` اضافه کن. از `!` پرهیز کن چون فقط باگ را به زمان اجرا منتقل می‌کند.'],
  2531: ['ممکن است null باشد', 'قبل از دسترسی، null را بررسی کن یا از Optional Chaining استفاده کن.'],
  2532: ['ممکن است undefined باشد', 'قبل از دسترسی، undefined را بررسی کن یا از `?.` / `??` استفاده کن.'],
  2571: ['مقدار ناشناخته است', 'ابتدا با گارد نوع، تایپ را باریک کن.'],
  2739: ['فیلدهای اجباری جا افتاده', 'تایپ مقصد فیلدهایی دارد که در مقدار تو نیستند. یا فیلدها را اضافه کن یا تایپ را `Partial` کن.'],
  2741: ['فیلد اجباری جا افتاده', 'یک فیلد ضروری در object literal نیست. نام فیلد را در پیام خطا ببین.'],
  7006: ['پارامتر به‌طور ضمنی any شده', 'تایپ پارامتر را صریح بنویس، یا اگر callback است، تایپ ظرف را مشخص کن تا Contextual Typing کار کند.'],
  7031: ['پارامتر Binding به‌طور ضمنی any شده', 'برای destructuring پارامتر، تایپ صریح بنویس: `({ a, b }: { a: string; b: number })`.'],
  7053: ['دسترسی ایندکسی با کلید ناشناخته', 'کلید را به `keyof typeof obj` محدود کن یا از `Record<string, T>` استفاده کن.'],
  2349: ['این عبارت قابل فراخوانی نیست', 'تایپ مورد نظر امضای فراخوانی ندارد. اگر آبجکت است، شاید منظورت متد داخلش بوده.'],
  2365: ['عملگر روی این تایپ‌ها مجاز نیست', 'دو طرف عملگر تایپ ناسازگار دارند (مثلاً جمع رشته با آبجکت). یکی را تبدیل یا Narrow کن.'],
  2367: ['مقایسه بی‌معنا', 'دو تایپ هیچ هم‌پوشانی ندارند؛ احتمالاً یک شرط مرده یا غلط املایی در مقدار لیترال داری.'],
  2589: ['بازگشت تایپ بیش از حد عمیق', 'تایپ بازگشتی از سقف عمق کامپایلر گذشته. شرط پایه را دقیق‌تر کن یا یک لایه از تودرتویی را کم کن.'],
  2769: ['هیچ overload منطبق نشد', 'امضاها را از خاص به عام مرتب کن و آرگومان‌ها را با هر overload مقایسه کن.'],
  1238: ['پارامتر دارای پیش‌فرض باید بعد از پارامترهای اجباری بیاید', 'ترتیب پارامترها را عوض کن یا از Options Object استفاده کن.'],
  1005: ['سینتکس ناقص', 'یک علامت (کاما، براکت، `>` یا `;`) جا افتاده است. از انتهای عبارت به عقب نگاه کن.'],
};

function coachFor(code, message) {
  const hit = ERROR_COACH[code];
  if (hit) return { title: hit[0], advice: hit[1] };
  if (/is not assignable to/i.test(message)) {
    return {
      title: 'انتساب ناموفق',
      advice: 'تایپ مبدأ باید زیرمجموعه‌ی تایپ مقصد باشد. هر دو را با `^?` ببین و اعضای اضافه/کم‌بود را پیدا کن.',
    };
  }
  if (/does not exist on type/i.test(message)) {
    return {
      title: 'عضو ناموجود روی تایپ',
      advice: 'اگر تایپ یک Union است، باید اول آن را Narrow کنی. اگر آبجکت است، شاید فیلد اختیاری (`?`) است و باید `?.` بنویسی.',
    };
  }
  if (/implicitly has an 'any' type/i.test(message)) {
    return {
      title: 'any ضمنی',
      advice: '`noImplicitAny` فعال است. تایپ را صریح بنویس یا با Generic/Contextual Typing آن را قابل استنتاج کن.',
    };
  }
  return { title: 'خطای تایپی', advice: 'پیام را از انتها بخوان؛ TypeScript معمولاً دقیقاً می‌گوید کدام تایپ با کدام نمی‌خواند.' };
}

/** Expands complex inferred types into readable shapes for the X-Ray panel. */
function readableType(checker, type, enclosingNode) {
  const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias;
  const text = checker.typeToString(type, enclosingNode, flags);

  const isObjectType = (type.flags & ts.TypeFlags.Object) !== 0;
  const isCallable = checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0
    || checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length > 0;

  // آبجکت‌های بی‌نام و طولانی را به شکل خوانا باز می‌کنیم
  if (isObjectType && !isCallable && text.startsWith('{') && text.length > 48) {
    const props = checker.getPropertiesOfType(type);
    if (props.length > 0 && props.length <= 12) {
      const parts = props.map((prop) => {
        const propType = checker.getTypeOfSymbolAtLocation(prop, enclosingNode ?? prop.valueDeclaration);
        const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0 ? '?' : '';
        const readonlyMod = isReadonlySymbol(prop) ? 'readonly ' : '';
        const propText = checker.typeToString(propType, enclosingNode, ts.TypeFormatFlags.NoTruncation);
        return `${readonlyMod}${prop.getName()}${optional}: ${propText}`;
      });
      const expanded = `{ ${parts.join('; ')} }`;
      if (expanded.length < text.length) return expanded;
    }
  }

  if (type.isUnion() && text.length > 60) {
    const members = type.types.map((t) => checker.typeToString(t, enclosingNode, flags));
    return members.join(' | ');
  }

  return text;
}

function isReadonlySymbol(symbol) {
  const decl = symbol.declarations?.[0];
  if (!decl) return false;
  const modifiers = ts.canHaveModifiers(decl) ? ts.getModifiers(decl) : undefined;
  return Boolean(modifiers?.some((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword));
}

/* ------------------------------------------------------------------ */
/* Compiler host — یک محیط ایزوله که فقط فایل کاربر و libهای رسمی       */
/* TypeScript را می‌بیند. libها یک‌بار خوانده و کش می‌شوند.              */
/* ------------------------------------------------------------------ */

const LIB_DIR = join(ROOT, 'node_modules', 'typescript', 'lib');

/** `lib.es2022.d.ts` → `lib.es2022.d.ts` و `@typescript/lib-es2022.d.ts` → همان */
function normalizeLibName(name) {
  const base = name.replace(/^.*[\\/]/, '');
  return base.startsWith('lib-') ? base.replace(/^lib-/, 'lib.').replace(/-/g, '.') : base;
}

const libTextCache = new Map();
function readLibText(fileName) {
  const base = normalizeLibName(fileName);
  if (!base.endsWith('.d.ts')) return undefined;
  if (libTextCache.has(base)) return libTextCache.get(base);
  let text;
  try {
    text = require$readFileSync(join(LIB_DIR, base));
  } catch {
    text = undefined;
  }
  libTextCache.set(base, text);
  return text;
}

function createSandboxHost(options, fileName, sourceFile, source) {
  const host = ts.createCompilerHost(options, true);
  const defaultLibPath = join(LIB_DIR, ts.getDefaultLibFileName(options));

  host.getSourceFile = (name, languageVersion, onError, shouldCreate) => {
    if (name === fileName) return sourceFile;
    const text = readLibText(name);
    if (text !== undefined) {
      return ts.createSourceFile(normalizeLibName(name), text, languageVersion, true);
    }
    return undefined;
  };
  host.getSourceFileByPath = (name, _path, languageVersion) => host.getSourceFile(name, languageVersion);
  host.getDefaultLibFileName = () => defaultLibPath;
  host.fileExists = (f) => f === fileName || readLibText(f) !== undefined;
  host.readFile = (f) => (f === fileName ? source : readLibText(f));
  host.writeFile = () => {};
  host.getCurrentDirectory = () => ROOT;
  host.getCanonicalFileName = (f) => (f === fileName ? f : normalizeLibName(f));
  host.useCaseSensitiveFileNames = () => true;
  host.getNewLine = () => '\n';
  host.directoryExists = () => false;
  host.getDirectories = () => [];
  host.readDirectory = () => [];
  host.realpath = (f) => f;
  host.getEnvironmentVariable = () => undefined;

  return host;
}

function compileTypeScript(source, userFlags = {}) {
  const fileName = '/input.ts';
  const started = performance.now();

  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    strict: userFlags.strict !== false,
    noUncheckedIndexedAccess: Boolean(userFlags.noUncheckedIndexedAccess),
    exactOptionalPropertyTypes: Boolean(userFlags.exactOptionalPropertyTypes),
    noImplicitOverride: userFlags.noImplicitOverride !== false,
    noEmitOnError: false,
    removeComments: false,
    skipLibCheck: true,
    allowJs: false,
    experimentalDecorators: false,
  };

  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true);
  const host = createSandboxHost(options, fileName, sourceFile, source);

  const program = ts.createProgram([fileName], options, host);

  let emitted = '';
  program.emit(undefined, (_file, text) => { emitted += text; }, undefined, false, {
    after: [],
  });

  const diagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ];

  const checker = program.getTypeChecker();
  const xrays = [];

  /* `// ^?` (پرسش تایپ) و `// ^!` (پرسش خطا) دقیقاً مثل زبان رسمی TypeScript:
     کاراکتر زیر `^` در «خط بالایی» هدف پرسش است. */
  const lines = source.split('\n');
  const lineStarts = [];
  {
    let acc = 0;
    for (const line of lines) { lineStarts.push(acc); acc += line.length + 1; }
  }

  lines.forEach((line, lineIndex) => {
    const caret = line.indexOf('^');
    if (caret === -1 || lineIndex === 0) return;
    const isQuery = line[caret + 1] === '?';
    const isError = line[caret + 1] === '!';
    if (!isQuery && !isError) return;

    const prevText = lines[lineIndex - 1];
    const column = Math.min(caret, Math.max(0, prevText.length - 1));
    try {
      const pos = lineStarts[lineIndex - 1] + column;
      const token = findTokenAt(sourceFile, pos);
      if (!token) return;
      const name = token.getText(sourceFile);

      if (isQuery) {
        const resolved = readableType(checker, checker.getTypeAtLocation(token), token);
        if (resolved && !xrays.some((x) => x.name === name && x.type === resolved)) {
          xrays.push({ kind: 'query', name, type: resolved, line: lineIndex });
        }
        return;
      }

      const hits = program
        .getSemanticDiagnostics(sourceFile)
        .filter((d) => d.start != null && d.start <= pos && pos <= d.start + (d.length ?? 0))
        .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
      const type = hits.length ? hits.join('\n') : '✅ خطایی در این نقطه گزارش نشد';
      if (!xrays.some((x) => x.name === name && x.type === type)) {
        xrays.push({ kind: 'errors', name, type, line: lineIndex });
      }
    } catch (error) {
      /* یک پرسش خراب هرگز نباید اجرا را بشکند */
      console.warn('[xray] query failed at line', lineIndex + 1, error?.message ?? error);
    }
  });

  // then collect declarations
  visit(sourceFile);

  function visit(node) {
    try {
      if (ts.isTypeAliasDeclaration(node)) {
        const type = checker.getTypeAtLocation(node.name);
        push('type', node.name.getText(sourceFile), checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias), node);
      } else if (ts.isInterfaceDeclaration(node)) {
        const type = checker.getTypeAtLocation(node.name);
        push('interface', node.name.getText(sourceFile), readableType(checker, type, node), node);
      } else if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
        const type = checker.getTypeAtLocation(node.name);
        const isConst = Boolean(node.parent && ts.isVariableDeclarationList(node.parent) && (node.parent.flags & ts.NodeFlags.Const) !== 0);
        push(isConst ? 'const' : 'let', node.name.getText(sourceFile), readableType(checker, type, node), node);
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const type = checker.getTypeAtLocation(node.name);
        push('function', node.name.getText(sourceFile), checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation), node);
      } else if (ts.isClassDeclaration(node) && node.name) {
        const instanceType = checker.getTypeAtLocation(node.name);
        push('class', node.name.getText(sourceFile), readableType(checker, instanceType, node), node);
      } else if (ts.isEnumDeclaration(node)) {
        const type = checker.getTypeAtLocation(node.name);
        push('enum', node.name.getText(sourceFile), checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation), node);
      }
    } catch (error) {
      /* keep scanning */
      console.warn('[xray] visit failed:', error?.message ?? error);
    }
    ts.forEachChild(node, visit);
  }

  function push(kind, name, type, node) {
    if (!type || type === 'any' && kind !== 'let' && kind !== 'const') return;
    if (xrays.some((x) => x.name === name && x.kind === kind && x.type === type)) return;
    if (xrays.length > 60) return;
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    xrays.push({ kind, name, type, line: line + 1 });
  }

  const mappedDiagnostics = diagnostics
    .filter((d) => d.file && d.file.fileName === fileName)
    .map((d) => {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
      const message = ts.flattenDiagnosticMessageText(d.messageText, ' ');
      return {
        code: d.code,
        category: d.category === ts.DiagnosticCategory.Error ? 'error' : d.category === ts.DiagnosticCategory.Warning ? 'warning' : 'info',
        line: line + 1,
        column: character + 1,
        message,
        coach: d.category === ts.DiagnosticCategory.Error || d.category === ts.DiagnosticCategory.Warning
          ? coachFor(d.code, message)
          : null,
      };
    });

  const tsBytes = Buffer.byteLength(source, 'utf8');
  const jsBytes = Buffer.byteLength(emitted, 'utf8');

  return {
    ok: mappedDiagnostics.every((d) => d.category !== 'error'),
    jsCode: emitted,
    diagnostics: mappedDiagnostics,
    xrays,
    erasedStats: {
      tsBytes,
      jsBytes,
      erasedNodes: countErasedNodes(sourceFile),
    },
    durationMs: Math.round((performance.now() - started) * 100) / 100,
    tsVersion: ts.version,
  };
}

/**
 * تعداد گره‌های AST که فقط در TypeScript معنا دارند و در خروجی JS پاک می‌شوند.
 * این عدد، «حجم تایپ» کد را صادقانه نشان می‌دهد (برخلاف تفاوت بایت‌ها).
 */
function countErasedNodes(sourceFile) {
  const ERASED_KINDS = new Set([
    ts.SyntaxKind.TypeAliasDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeAnnotation,
    ts.SyntaxKind.TypeParameter,
    ts.SyntaxKind.TypeReference,
    ts.SyntaxKind.TypeOperator,
    ts.SyntaxKind.TypeQuery,
    ts.SyntaxKind.TypeLiteral,
    ts.SyntaxKind.ArrayType,
    ts.SyntaxKind.TupleType,
    ts.SyntaxKind.UnionType,
    ts.SyntaxKind.IntersectionType,
    ts.SyntaxKind.LiteralType,
    ts.SyntaxKind.FunctionType,
    ts.SyntaxKind.ConstructorType,
    ts.SyntaxKind.MappedType,
    ts.SyntaxKind.ConditionalType,
    ts.SyntaxKind.IndexedAccessType,
    ts.SyntaxKind.TemplateLiteralType,
    ts.SyntaxKind.AsExpression,
    ts.SyntaxKind.SatisfiesExpression,
    ts.SyntaxKind.NonNullExpression,
    ts.SyntaxKind.PropertySignature,
    ts.SyntaxKind.MethodSignature,
    ts.SyntaxKind.IndexSignature,
    ts.SyntaxKind.CallSignature,
    ts.SyntaxKind.ConstructSignature,
    ts.SyntaxKind.HeritageClause,
    ts.SyntaxKind.EnumDeclaration,
    ts.SyntaxKind.ModuleDeclaration,
  ]);

  let count = 0;
  (function walk(node) {
    if (ERASED_KINDS.has(node.kind)) count++;
    ts.forEachChild(node, walk);
  })(sourceFile);

  return count;
}

function findTokenAt(sourceFile, position) {
  function find(node) {
    if (position < node.getStart(sourceFile) || position > node.getEnd()) return null;
    let best = null;
    node.forEachChild((child) => {
      const found = find(child);
      if (found) best = found;
    });
    return best ?? node;
  }
  const node = find(sourceFile);
  if (!node) return null;
  if (ts.isIdentifier(node)) return node;
  const children = node.getChildren(sourceFile);
  return children.find((c) => ts.isIdentifier(c) && c.getStart(sourceFile) <= position && c.getEnd() >= position) ?? node;
}

/* ------------------------------------------------------------------ */
/* Static file server                                                  */
/* ------------------------------------------------------------------ */

import { readFileSync } from 'node:fs';
function require$readFileSync(path) {
  return readFileSync(path, 'utf8');
}

async function serveStatic(pathname, res) {
  const rel = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = normalize(join(ROOT, rel));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const info = await stat(filePath);
    const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const data = await readFile(target);
    const ext = extname(target).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': ext === '.woff2' ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(data);
  } catch {
    // SPA-ish fallback: unknown paths return the shell
    try {
      const data = await readFile(join(ROOT, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(data);
    } catch {
      res.writeHead(404).end('Not found');
    }
  }
}

/* ------------------------------------------------------------------ */
/* HTTP server                                                         */
/* ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, tsVersion: ts.version }));
    return;
  }

  if (url.pathname === '/api/compile' && req.method === 'POST') {
    let body = '';
    req.setEncoding('utf8');
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 2_000_000) break;
    }
    try {
      const payload = JSON.parse(body || '{}');
      const code = typeof payload.code === 'string' ? payload.code : '';
      if (code.length > 60_000) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, diagnostics: [{ code: 0, category: 'error', line: 1, column: 1, message: 'کد بیش از حد بزرگ است (حداکثر ۶۰ هزار نویسه).' }], jsCode: '', xrays: [], erasedStats: {}, durationMs: 0 }));
        return;
      }
      const result = compileTypeScript(code, payload.flags ?? {});
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
    }
    return;
  }

  if (req.method === 'GET') {
    await serveStatic(url.pathname, res);
    return;
  }

  res.writeHead(405).end('Method not allowed');
});

server.listen(PORT, HOST, () => {
  console.log(`✦ TypeScript Mastery Studio → http://localhost:${PORT}`);
  console.log(`  compiler engine: TypeScript ${ts.version}`);
});
