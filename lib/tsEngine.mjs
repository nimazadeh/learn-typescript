/* ==========================================================================
   موتور کامپایلر TypeScript — تنها پیاده‌سازی
   این ماژول هم توسط سرور (`POST /api/compile`) و هم توسط ابزارهای QA استفاده
   می‌شود تا «کدی که تست می‌شود» و «کدی که کاربر اجرا می‌کند» دقیقاً یکی باشد.
   ========================================================================== */

import ts from 'typescript';

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

/**
 * کش SourceFile پارس‌شده‌ی libهای رسمی (کلید: نام + نسخه‌ی زبان).
 * بدون این کش، هر کامپایل ~۳۰۰ms فقط صرف پارسِ دوباره‌ی libها می‌کرد؛
 * با آن، هر کامپایل ~۱۶ms شد (۱۲ برابر سریع‌تر) — هم برای آزمایشگاه زنده
 * و هم برای ممیزی ۵۰۰ قطعه‌ی محتوا.
 */
const libSourceCache = new Map();

function createSandboxHost(options, fileName, sourceFile, source) {
  /* تنها سه override لازم است: فایل کاربر از حافظه بیاید، نه از دیسک.

     ⚠️ دست‌کاری بقیه‌ی متدها (به‌ویژه `directoryExists`، `getCanonicalFileName`
     و بستن `readFile` روی libها) باعث می‌شود TypeScript زنجیره‌ی
     `/// <reference lib="es2021" />` را حل نکند و `lib.es5.d.ts` هرگز
     بارگذاری نشود — آن‌وقت Record، JSON، Promise، Array، Map و console
     همه «Cannot find name» می‌دهند. این یک باگ واقعی و پنهان در
     آزمایشگاه زنده بود و با tools/audit-compile-content.mjs کشف شد. */
  const host = ts.createCompilerHost(options, true);
  const defaultGetSourceFile = host.getSourceFile.bind(host);

  /* libهای رسمی هرگز تغییر نمی‌کنند، پس SourceFile پارس‌شده‌ی آن‌ها را کش
     می‌کنیم؛ بدون این کش هر کامپایل ~۳۰۰ms فقط صرف پارس libها می‌کرد
     (ممیزی ۶۰۰ قطعه‌ی محتوا ۱۹۰ ثانیه طول می‌کشید). */
  host.getSourceFile = (name, languageVersion, onError, shouldCreate) => {
    if (name === fileName) return sourceFile;
    const cacheKey = `${name}|${languageVersion}`;
    const cached = libSourceCache.get(cacheKey);
    if (cached !== undefined) return cached || undefined;
    const sf = defaultGetSourceFile(name, languageVersion, onError, shouldCreate);
    libSourceCache.set(cacheKey, sf ?? false);
    return sf;
  };
  host.fileExists = (f) => f === fileName || ts.sys.fileExists(f);
  host.readFile = (f) => (f === fileName ? source : ts.sys.readFile(f));
  host.writeFile = () => {};

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
    /* اگر `^` بیرون از محدوده‌ی خط بالایی باشد، یعنی پرسش «تراز» نیست.
       پیش‌تر ستون به آخرین نویسه clamp می‌شد و در نتیجه یک پرسش کج، پاسخِ
       یک عبارت کاملاً بی‌ربط را برمی‌گرداند (مثلاً `any` برای کل یک دستور).
       پاسخِ «چیزی پیدا نشد» صادقانه‌تر از پاسخِ غلط است. */
    if (caret >= prevText.length) return;
    const column = caret;
    try {
      const pos = lineStarts[lineIndex - 1] + column;
      const token = findTokenAt(sourceFile, pos);
      if (!token) return;

      /* `findTokenAt` ممکن است به گره‌ی «دربرگیرنده» برسد (مثلاً کلِ
         VariableStatement) که هیچ‌کدام از نویسه‌هایش زیر `^` نیست.
         چنین توکنی را رد می‌کنیم تا فقط عبارتِ واقعاً هدف گزارش شود. */
      const targetStart = lineStarts[lineIndex - 1];
      const targetEnd = targetStart + prevText.length;
      const tokenStart = token.getStart(sourceFile);
      const tokenEnd = token.getEnd();
      if (tokenStart < targetStart || tokenEnd > targetEnd) return;
      if (tokenStart > pos || tokenEnd <= pos) return;

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

/**
 * «برگ» واقعی (توکن) در یک موقعیت را برمی‌گرداند، یا `null`.
 *
 * چرا سخت‌گیرانه؟ دو باگ پنهان اینجا بود:
 *   ۱) نسخه‌ی پیشین وقتی `^` زیرِ فاصله یا نویسه‌ی بی‌توکن می‌افتاد، به گره‌ی
 *      «دربرگیرنده» برمی‌گشت (مثلاً کلِ VariableDeclarationList) و در نتیجه
 *      یک پرسشِ کج، پاسخِ عبارتی بی‌ربط را با تایپ `any` برمی‌گرداند.
 *   ۲) کلیدواژه‌ها «عبارت» نیستند و getTypeAtLocation برایشان `any` می‌دهد.
 *      دامنه‌ی isIdentifier در TypeScript کلیدواژه‌ها را هم شامل می‌شود،
 *      پس باید صریح رد شوند.
 * «چیزی پیدا نشد» همیشه بهتر از پاسخِ غلط است.
 */
function findTokenAt(sourceFile, position) {
  function find(node) {
    const start = node.getStart(sourceFile);
    const end = node.getEnd();
    if (position < start || position >= end) return null;
    let best = null;
    node.forEachChild((child) => {
      const found = find(child);
      if (found) best = found;
    });
    return best ?? node;
  }

  const node = find(sourceFile);
  if (!node) return null;

  // ۱) اول «توکنِ» واقعی را پیدا کن (برگِ دربرگیرنده‌ی موقعیت)
  let token = null;
  if (node.getChildCount(sourceFile) === 0) {
    token = node;
  } else {
    token = node.getChildren(sourceFile).find((child) => {
      const start = child.getStart(sourceFile);
      const end = child.getEnd();
      return child.getChildCount(sourceFile) === 0 && start <= position && position < end;
    }) ?? null;
  }
  if (!token) return null;

  // ۲) بعد ردش کن اگر کلیدواژه یا نشانه است (لیترال‌ها تایپ دارند، پس می‌مانند)
  const kind = token.kind;
  const isLiteral =
    kind === ts.SyntaxKind.NumericLiteral ||
    kind === ts.SyntaxKind.StringLiteral ||
    kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
    kind === ts.SyntaxKind.BigIntLiteral ||
    kind === ts.SyntaxKind.TrueKeyword ||
    kind === ts.SyntaxKind.FalseKeyword ||
    kind === ts.SyntaxKind.NullKeyword;
  if (!isLiteral) {
    if (kind >= ts.SyntaxKind.FirstKeyword && kind <= ts.SyntaxKind.LastKeyword) return null;
    if (kind >= ts.SyntaxKind.FirstPunctuation && kind <= ts.SyntaxKind.LastPunctuation) return null;
    if (kind >= ts.SyntaxKind.FirstTriviaToken && kind <= ts.SyntaxKind.LastTriviaToken) return null;
  }

  return token;
}

/** نسخه‌ی TypeScript در حال استفاده — تنها منبع حقیقت برای UI و ابزارها. */
export const TS_VERSION = ts.version;

/* `createSandboxHost` هم صادر می‌شود چون `tools/ts-engine.test.mjs` برای آزمونِ
   واحدِ `readableType` به همان میزبانی نیاز دارد که موتور می‌سازد؛ ساختِ دستیِ
   میزبان، همان تله‌ی «libها بارگذاری نمی‌شوند» را دوباره زنده می‌کند. */
export {
  compileTypeScript,
  countErasedNodes,
  findTokenAt,
  readableType,
  createSandboxHost,
  coachFor,
  ERROR_COACH,
};
