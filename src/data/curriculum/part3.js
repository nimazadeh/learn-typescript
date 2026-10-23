/* ==========================================================================
   فصل ۳ — انواع بالا/پایین و Assertions  +  فصل ۴ — استنتاج و سازگاری
   (unknown · any · never · as [type] · as any · as const · Non-null · satisfies
    · Type Inference · Type Compatibility)
   ========================================================================== */

export const PART3_LESSONS = [
  {
    id: 'top-unknown',
    chapter: 'ch3',
    titleFa: 'تایپ unknown — جایگزین امن any',
    titleEn: 'unknown',
    level: 'intermediate',
    minutes: 30,
    goal: '`unknown` را به‌عنوان «نوع امن ورودی ناشناخته» مسلط شوی و الگوی Parse-don\'t-validate را پیاده کنی.',
    steps: [
      {
        h: 'گام ۱ — `unknown` یعنی «نمی‌دانم چیست، پس اجازه‌ی دسترسی نداری»',
        p:
          'هر مقداری را می‌توان به `unknown` انتساب داد (Top Type)، ولی تا وقتی **اثبات** نکنی چه تایپی دارد، هیچ عملیاتی روی آن مجاز نیست. این دقیقاً همان انضباطی است که برای داده‌ی بیرونی لازم داری.',
        code: `const input: unknown = JSON.parse('{"id":1}');

// ❌ همه‌ی این‌ها خطا می‌دهند:
// input.id          → TS18046
// input.toUpperCase()
// input + 1

// ✅ تنها راه: اول Narrow کن
if (typeof input === 'object' && input !== null && 'id' in input) {
  const record = input as { id: number };
  console.log(record.id);
}`,
      },
      {
        h: 'گام ۲ — جدول مقایسه‌ی `unknown` و `any`',
        p:
          '`any` = کامپایلر را **خاموش** می‌کند (هر ورودی، هر خروجی، هر عملیات). `unknown` = کامپایلر را **حساس‌تر** می‌کند (هر ورودی، ولی هیچ عملیاتی بدون اثبات). `any` مسری است و به کل کدبیس سرایت می‌کند؛ `unknown` در مرز متوقف می‌شود.',
        code: `let a: any = 'text';
a.foo.bar.baz();        // ✅ کامپایل می‌شود → 💥 زمان اجرا

let u: unknown = 'text';
// u.foo();             // ❌ خطای کامپایلر — تو را مجبور به بررسی می‌کند

// انتساب unknown به یک تایپ مشخص هم ممنوع است:
// const s: string = u; // ❌ باید اول Narrow شود
const s2: string = typeof u === 'string' ? u : '';
console.log(a, s2);`,
      },
      {
        h: 'گام ۳ — سه جایگاه طلایی `unknown`',
        p:
          '۱) `catch (err: unknown)` — از TS 4.4 به بعد پیش‌فرض است. ۲) ورودی توابع عمومی (پارسر، API client). ۳) `JSON.parse` و هر منبع داده‌ی بیرونی.',
        code: `function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'خطای ناشناخته';
}

try {
  throw new Error('اتصال برقرار نشد');
} catch (err) {
  console.log(toErrorMessage(err));
}`,
      },
      {
        h: 'گام ۴ — الگوی حرفه‌ای: Type Guard سفارشی برای unknown',
        p:
          'به‌جای پراکندن `typeof`ها در کل کد، یک تابع گارد بنویس و یک‌بار برای همیشه مرز را امن کن.',
        code: `type ApiUser = { readonly id: number; readonly name: string };

function isApiUser(value: unknown): value is ApiUser {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v['id'] === 'number' && typeof v['name'] === 'string';
}

function parseUser(value: unknown): ApiUser {
  if (!isApiUser(value)) throw new Error('ساختار کاربر نامعتبر است');
  return value; // از اینجا به بعد کاملاً تایپ‌شده
}

console.log(parseUser({ id: 1, name: 'نیما' }));`,
      },
    ],
    visual: 'unknown-vs-any',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۷',
        title: 'فرمول «unknown در مرز، تایپ دقیق در هسته»',
        body:
          'معماری تایپی سالم: داده‌ی ناشناخته در **مرز** با `unknown` پذیرفته می‌شود، همان‌جا یک‌بار اعتبارسنجی و تبدیل می‌شود، و در **هسته‌ی برنامه** فقط تایپ‌های دقیق جریان دارند. این کار بررسی‌های تکراری را حذف و اطمینان را متمرکز می‌کند.',
        equation: 'امنیت تایپ = (اعتبارسنجی کامل در مرز) × (صفر any در هسته)',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «اول unknown بنویس»',
        body:
          'هر بار که وسوسه شدی `any` بنویسی، `unknown` بگذار. سپس اجازه بده کامپایلر تو را مجبور به نوشتن گارد کند. بعد از ۲۰ بار، نوشتن Type Guard به حافظه‌ی عضلانی تبدیل می‌شود — یکی از ارزشمندترین مهارت‌های TypeScript.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قانون `catch (err: unknown)`',
        body:
          'هرگز `catch (err: any)` ننویس و هرگز بدون بررسی `err.message` را چاپ نکن. یک تابع کمکی `toErrorMessage(err: unknown): string` بنویس و در کل پروژه از آن استفاده کن (DRY).',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`unknown` را با `as` دور نزن',
        body:
          '`value as string` روی یک `unknown` کامپایل می‌شود ولی هیچ تضمینی نمی‌دهد — عملاً `any` را با یک قدم اضافه بازسازی کرده‌ای. اگر گارد نوشتی، دیگر به `as` نیاز نداری.',
      },
    ],
    quiz: {
      q: 'کدام عبارت درباره‌ی `unknown` صحیح است؟',
      options: [
        'هر مقداری به آن انتساب‌پذیر است، ولی بدون Narrowing هیچ عملیاتی روی آن مجاز نیست',
        'مثل `any` است و همه‌ی عملیات‌ها مجازند',
        'فقط `null` و `undefined` را می‌پذیرد',
        'نمی‌توان آن را به هیچ تایپ دیگری انتساب داد حتی با گارد',
      ],
      answer: 0,
      explain:
        '`unknown` یک Top Type ایمن است: در انتساب ورودی آزاد است (مثل any) ولی در استفاده محدود است (برخلاف any). پس از گارد موفق، به تایپ هدف Narrow می‌شود.',
    },
    lab: {
      task: 'یک پارسر امن برای پاسخ API بنویس: ورودی `unknown`، خروجی `Order | null` — بدون هیچ `as any`.',
      starter: `type Order = { readonly id: string; readonly total: number };

function parseOrder(value: unknown): Order | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v['id'] !== 'string') return null;
  if (typeof v['total'] !== 'number') return null;
  return { id: v['id'], total: v['total'] };
}

console.log(parseOrder({ id: 'o-1', total: 250 }));
console.log(parseOrder('not an object'));`,
      solution: `const parseOrder = (v: unknown): Order | null =>
  typeof v === 'object' && v !== null &&
  typeof (v as any).id === 'string' && typeof (v as any).total === 'number'
    ? { id: (v as any).id, total: (v as any).total }
    : null;`,
    },
  },

  {
    id: 'top-any',
    chapter: 'ch3',
    titleFa: 'تایپ any — چرا و کجا ممنوع است',
    titleEn: 'any',
    level: 'intermediate',
    minutes: 25,
    goal: 'هزینه‌ی واقعی `any` را بفهمی، سه جایگزین امن را یاد بگیری و استراتژی حذف تدریجی آن را داشته باشی.',
    steps: [
      {
        h: 'گام ۱ — `any` یعنی خاموش‌کردن کامپایلر',
        p:
          'با `any`، TypeScript عملاً به JavaScript برمی‌گردد: هیچ بررسی، هیچ IntelliSense، هیچ حمایتی از Refactor. بدتر از همه، `any` **مسری** است: از یک پارامتر به متغیر بعدی، به خروجی تابع، و از آنجا به کل کدبیس سرایت می‌کند.',
        code: `function risky(input: any): any {
  return input.value.deep.nested; // هیچ هشداری نیست
}

const result = risky({});   // ✅ کامپایل
console.log('این خط هرگز اجرا نمی‌شود اگر ورودی خالی باشد');
// 💥 TypeError: Cannot read properties of undefined`,
      },
      {
        h: 'گام ۲ — سه جایگزین به ترتیب اولویت',
        p:
          '۱) `unknown` + گارد (برای ورودی ناشناخته). ۲) Generic (`<T>`) وقتی تایپ از فراخوان می‌آید. ۳) تایپ دقیق دامنه. فقط اگر هیچ‌کدام ممکن نبود و در حال مهاجرت هستی، `any` با `TODO` و `@ts-expect-error` مستند.',
        code: `// ۱) unknown + گارد
function safeParse(input: unknown): string {
  return typeof input === 'string' ? input : JSON.stringify(input);
}

// ۲) Generic — تایپ از فراخوان استنتاج می‌شود
function identity<T>(value: T): T { return value; }

// ۳) تایپ دقیق
function toUpper(value: string): string { return value.toUpperCase(); }

console.log(safeParse(12), identity('x'), toUpper('abc'));`,
      },
      {
        h: 'گام ۳ — `implicit any` در برابر `explicit any`',
        p:
          'با `noImplicitAny: true` (عضو `strict`)، هر جایی که کامپایلر نتواند تایپ را استنتاج کند خطا می‌دهد — این مهم‌ترین پرچم TypeScript است. `explicit any` (که خودت می‌نویسی) همچنان مجاز است؛ برای ممنوع کردنش به ESLint نیاز داری.',
        code: `// ❌ implicit any → TS7006 با noImplicitAny
// function broken(x) { return x.length; }

// ✅ صریح:
function fixed(x: unknown): number {
  return typeof x === 'string' ? x.length : 0;
}

console.log(fixed('سلام'));`,
      },
      {
        h: 'گام ۴ — استراتژی حذف `any` از کدبیس موجود',
        p:
          '۱) قانون «بدون `any` جدید» در Code Review. ۲) فعال‌کردن `@typescript-eslint/no-explicit-any` در حالت warn. ۳) شمارش `any`ها در CI و نمودار روند. ۴) هر اسپرینت تعداد مشخصی را حذف کن، از مرزهای پرتردد شروع کن.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۸',
        title: 'فرمول «سرایت any»',
        body:
          'یک `any` در یک تایپ پرکاربرد، عملاً صدها نقطه از کد را بی‌دفاع می‌کند. پس هزینه‌ی واقعی هر `any` برابر است با **تعداد نقاط مصرف آن تایپ**. به همین دلیل حذف `any` از مدل‌های دامنه اولویت اول است، نه از توابع کم‌مصرف.',
        equation: 'ریسک یک any = (عمق سرایت در گراف تایپ) × (تعداد فراخوانی آن نقطه)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`@ts-expect-error` به‌جای `@ts-ignore`',
        body:
          '`@ts-ignore` خطا را حتی وقتی وجود ندارد هم ساکت می‌کند (و بی‌صدا کهنه می‌شود). `@ts-expect-error` اگر خطایی نباشد **خودش خطا می‌دهد**، پس همیشه زنده و صادق می‌ماند. همیشه با کامنت دلیل همراهش کن.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`any` پنهان در کتابخانه‌های بدون تایپ',
        body:
          'وقتی یک پکیج `@types` ندارد و `declare module` نزده‌ای، خروجی‌اش `any` است و بی‌صدا به کدت سرایت می‌کند. برای مرزها همیشه یک لایه‌ی Adapter با تایپ دقیق بساز.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا `unknown` بهتر از `any` است؟',
        body:
          'پاسخ: «`any` بررسی را در **هر دو جهت** خاموش می‌کند؛ `unknown` فقط ورودی را آزاد می‌گذارد و خروجی/استفاده را محدود می‌کند. در نتیجه `unknown` تو را مجبور به اثبات تایپ می‌کند و امنیت زمان کامپایل را حفظ می‌کند.»',
      },
    ],
    quiz: {
      q: 'کدام گزینه بهترین جایگزین برای `function handle(data: any)` وقتی شکل داده ناشناخته است؟',
      options: [
        '`function handle(data: unknown)` همراه با یک گارد یا پارسر در ابتدای تابع',
        '`function handle(data: object)`',
        '`function handle(data: {})`',
        '`function handle(data: never)`',
      ],
      answer: 0,
      explain:
        '`unknown` همان آزادی ورودی را می‌دهد ولی استفاده‌ی ناامن را ممنوع می‌کند، پس تو را به اعتبارسنجی صریح وادار می‌سازد. `object` و `{}` هم ناامن‌اند و هم دسترسی مفید نمی‌دهند.',
    },
    lab: {
      task: 'تابع زیر را که `any` دارد به نسخه‌ی کاملاً امن با Generic و unknown تبدیل کن.',
      starter: `// ❌ نسخه‌ی ناامن:
// function readField(obj: any, key: any): any { return obj[key]; }

// ✅ نسخه‌ی امن با Generic:
function readField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const config = { theme: 'dark', fontSize: 14 } as const;
console.log(readField(config, 'theme'));  // 'dark'
console.log(readField(config, 'fontSize')); // 14`,
      solution: `function readField<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }`,
    },
  },

  {
    id: 'bottom-never',
    chapter: 'ch3',
    titleFa: 'تایپ never — مجموعه‌ی تهی',
    titleEn: 'never',
    level: 'advanced',
    minutes: 35,
    goal: 'سه کاربرد طلایی `never` را مسلط شوی: توابع بی‌بازگشت، Exhaustiveness Checking و فیلتر Unionها.',
    steps: [
      {
        h: 'گام ۱ — `never` یعنی «هیچ مقداری وجود ندارد»',
        p:
          '`never` مجموعه‌ی تهی است: Bottom Type. هیچ مقداری نمی‌تواند `never` باشد، ولی `never` را می‌توان به **هر** تایپی انتساب داد. سه منشأ طبیعی آن: تابعی که هرگز برنمی‌گردد، حلقه‌ی بی‌پایان، و تابعی که همیشه throw می‌کند.',
        code: `function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) { /* هرگز برنمی‌گردد */ }
}

// never را می‌توان به هر تایپی انتساب داد (Bottom Type):
const a: string = undefined as never; // ✅
const b: number = undefined as never; // ✅
console.log(typeof a, typeof b);`,
      },
      {
        h: 'گام ۲ — کاربرد طلایی ۱: Exhaustiveness Checking',
        p:
          'مهم‌ترین الگوی `never`: در انتهای یک `switch` روی Union، `case` پیش‌فرض را به تابعی با بازگشت `never` بسپار. اگر روزی عضوی به Union اضافه شود و پوشش داده نشود، **کامپایلر خطا می‌دهد**.',
        code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };

function assertNever(value: never): never {
  throw new Error(\`مقدار غیرمنتظره: \${JSON.stringify(value)}\`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    default: return assertNever(shape); // ✅ اگر Shape عضوی جدید بگیرد، اینجا خطا می‌دهد
  }
}

console.log(area({ kind: 'circle', radius: 2 }).toFixed(2));`,
      },
      {
        h: 'گام ۳ — کاربرد طلایی ۲: فیلتر کردن Unionها',
        p:
          'چون `never` در Union **حذف** می‌شود (`A | never === A`)، Conditional Types از آن برای فیلتر استفاده می‌کنند. این دقیقاً اساس `Exclude` و `NonNullable` است.',
        code: `type WithNulls = string | number | null | undefined;
type Cleaned = Exclude<WithNulls, null | undefined>; // string | number

// ساخت دستی NonNullable:
type MyNonNullable<T> = T extends null | undefined ? never : T;
type Result = MyNonNullable<string | null | undefined>; // string

const value: Result = 'clean';
console.log(value);`,
      },
      {
        h: 'گام ۴ — کاربرد طلایی ۳: غیرممکن‌کردن انتساب',
        p:
          'برای اینکه مطمئن شوی یک فیلد هرگز پر نمی‌شود یا یک Generic فقط با تایپ خاصی کار می‌کند، `never` ابزار دقیق‌سازی است. همچنین `keyof` یک تایپ بدون کلید، `never` است.',
        code: `type NoKeys = keyof { [k: number]: string }; // number
type Empty = keyof Record<string, never>;     // string

// ممنوع کردن یک پراپرتی به شکل صریح:
type Forbidden = { readonly doNotUse: never };
const f: Forbidden = { doNotUse: undefined as never };

console.log(f);`,
      },
    ],
    visual: 'never-lattice',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۹',
        title: 'فرمول «Exhaustiveness = آینده‌نگری رایگان»',
        body:
          'الگوی `assertNever` یک سرمایه‌گذاری ۳ خطی است که سودش ماه‌ها بعد می‌رسد: روزی که یک وضعیت جدید به Union اضافه می‌کنی، کامپایلر **همه‌ی** نقاطی که باید به‌روز شوند را به تو نشان می‌دهد. این همان چیزی است که Refactor بزرگ را از ترسناک به لذت‌بخش تبدیل می‌کند.',
        equation: 'هزینه‌ی افزودن عضو جدید به Union = O(۱) با assertNever در برابر O(n) جست‌وجوی دستی',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`assertNever` را یک‌بار بنویس و export کن',
        body:
          'این تابع را در یک ماژول مشترک بگذار و در کل پروژه استفاده کن. تکرار آن در هر فایل نقض DRY است. در TypeScript 5.x حتی می‌توانی بدون تابع کمکی، `default: { const _exhaustive: never = shape; }` بنویسی.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تست Exhaustiveness را عمداً بشکن',
        body:
          'بعد از نوشتن `assertNever`، یک عضو جدید به Union اضافه کن و ببین کامپایلر کجاها خطا می‌دهد. این آزمایش ۲ دقیقه‌ای، ارزش واقعی الگو را به شکل تجربی در ذهن تو حک می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا `never` را می‌توان به هر تایپی انتساب داد؟',
        body:
          'پاسخ: «چون `never` مجموعه‌ی تهی است و مجموعه‌ی تهی زیرمجموعه‌ی هر مجموعه‌ای است. در تئوری مجموعه‌ها ∅ ⊆ A همیشه صادق است، و assignability در TypeScript دقیقاً رابطه‌ی زیرمجموعه بودن است.»',
      },
    ],
    quiz: {
      q: 'اصلی‌ترین کاربرد `assertNever(value: never): never` در یک `switch` چیست؟',
      options: [
        'تضمین پوشش کامل همه‌ی اعضای Union در زمان کامپایل (Exhaustiveness Checking)',
        'بهبود سرعت اجرای switch',
        'تبدیل Union به Intersection',
        'جلوگیری از throw شدن خطا در زمان اجرا',
      ],
      answer: 0,
      explain:
        'اگر همه‌ی caseها پوشش داده شوند، تایپ `shape` در شاخه‌ی default به `never` باریک می‌شود و انتساب مجاز است. اگر عضوی پوشش داده نشود، تایپ آن عضو باقی می‌ماند و انتساب به `never` خطای کامپایل می‌دهد.',
    },
    lab: {
      task: 'یک Discriminated Union با سه عضو بساز و با `assertNever` پوشش کامل را تضمین کن. سپس عضوی چهارم اضافه کن و خطا را ببین.',
      starter: `type AppEvent =
  | { kind: 'click'; x: number; y: number }
  | { kind: 'key'; code: string }
  | { kind: 'scroll'; delta: number };

function assertNever(v: never): never {
  throw new Error('پوشش ناقص: ' + JSON.stringify(v));
}

function describe(e: AppEvent): string {
  switch (e.kind) {
    case 'click': return \`click at \${e.x},\${e.y}\`;
    case 'key': return \`key \${e.code}\`;
    case 'scroll': return \`scroll \${e.delta}\`;
    default: return assertNever(e);
  }
}

console.log(describe({ kind: 'key', code: 'Enter' }));`,
      solution: `// افزودن | { kind: 'hover'; target: string } بدون case جدید → خطای TS2345 در default`,
    },
  },

  {
    id: 'assert-as-type',
    chapter: 'ch3',
    titleFa: 'Type Assertion با `as [type]`',
    titleEn: 'as [type]',
    level: 'intermediate',
    minutes: 30,
    goal: 'قوانین دقیق `as` را بشناسی، بدانی کجا مجاز و کجا ممنوع است، و جایگزین‌های امن‌تر را انتخاب کنی.',
    steps: [
      {
        h: 'گام ۱ — `as` یک «ادعا» است نه یک تبدیل',
        p:
          '`value as T` به کامپایلر می‌گوید: «من بیشتر از تو می‌دانم، این را T فرض کن.» هیچ تبدیل زمان اجرایی اتفاق نمی‌افتد. اگر ادعایت غلط باشد، کامپایلر ساکت می‌ماند و برنامه در زمان اجرا می‌شکند.',
        code: `const el = document.createElement('canvas');
const ctx = el.getContext('2d') as CanvasRenderingContext2D;
// هیچ تبدیلی رخ نداده؛ فقط تایپ تغییر کرده

const raw = '{"id": 1}' as string;
console.log(typeof ctx, raw);`,
      },
      {
        h: 'گام ۲ — قانون سازگاری: `as` فقط بین تایپ‌های «هم‌پوشان»',
        p:
          'TypeScript اجازه نمی‌دهد یک تایپ کاملاً بی‌ربط را assert کنی. `string as number` خطا می‌دهد. راه فرار: اول به `unknown` و بعد به هدف (Double Assertion) — که تقریباً همیشه نشانه‌ی طراحی اشتباه است.',
        code: `// ❌ خطا: Conversion of type 'string' to type 'number' may be a mistake
// const bad = 'text' as number;

// ⚠️ راه فرار خطرناک (هرگز بدون دلیل موجه):
const risky = 'text' as unknown as { length: number };
console.log(risky.length); // کار می‌کند چون واقعاً length دارد

// ✅ درست: تایپ را از ابتدا دقیق تعریف کن
const safe: { length: number } = { length: 'text'.length };
console.log(safe.length);`,
      },
      {
        h: 'گام ۳ — سه جایگاه مشروع `as`',
        p:
          '۱) DOM APIهایی که تایپ کلی برمی‌گردانند (`document.querySelector`). ۲) تست‌ها و داده‌های fixture. ۳) کار با کتابخانه‌های قدیمی بدون تایپ. در هر سه مورد، **بلافاصله بعد از assert** یک گارد یا مرز ایزوله بگذار.',
        code: `const input = document.querySelector('#email') as HTMLInputElement | null;
console.log(input?.value ?? '');

// fixture تست:
const fakeUser = { id: 1, name: 'Test' } as const;
console.log(fakeUser.id);`,
      },
      {
        h: 'گام ۴ — سینتکس قدیمی `<T>value` و چرا ممنوع است',
        p:
          'سینتکس زاویه‌ای `<HTMLInputElement>el` در فایل‌های `.tsx` با JSX تداخل می‌کند و کار نمی‌کند. برای یکدستی، همیشه `as` استفاده کن.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۰',
        title: 'فرمول «هر `as` یک بدهی مستند»',
        body:
          'تعداد `as`های یک کدبیس، شاخص مستقیم سلامت تایپی آن است. هدف: **صفر `as` در لایه‌ی دامنه**، چند `as` مستند در لایه‌ی Adapter. هر `as` باید یا کامنت دلیل داشته باشد یا در یک تابع متمرکز (مثل `parseX`) محصور شود.',
        equation: 'سلامت تایپ = ۱ − (تعداد as در هسته‌ی دامنه ÷ تعداد as در مرزها)',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی خطرناک',
        title: 'Double Assertion (`as unknown as T`) = خروج از سیستم تایپ',
        body:
          'این الگو هر بررسی‌ای را دور می‌زند. اگر واقعاً لازم داری، یعنی یا تایپ‌ها اشتباه مدل شده‌اند یا داده از مرزی آمده که باید پارس شود. در ۹۹٪ موارد، یک Type Guard جایگزین درست است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تابع «پارس» بنویس، نه «ادعا»',
        body:
          'به‌جای `data as User` یک `parseUser(data: unknown): User` بنویس. این کار سه سود دارد: اعتبارسنجی واقعی، یک نقطه‌ی تغییر برای منطق، و حذف کامل `as` از بدنه‌ی برنامه.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'قانون ۲۴ ساعت برای `as`',
        body:
          'وقتی به `as` نیاز پیدا کردی، اول ۲۴ ساعت (یا حداقل یک استراحت) با `unknown` و گارد تلاش کن. اگر واقعاً نشد، `as` بگذار. بیشتر `as`ها در همین تلاش اول حذف می‌شوند و تو Type Guard نوشتن یاد می‌گیری.',
      },
    ],
    quiz: {
      q: 'کدام عبارت درباره‌ی `as` صحیح است؟',
      options: [
        'هیچ تبدیل زمان اجرایی انجام نمی‌دهد و فقط تایپ دیده‌شده توسط کامپایلر را تغییر می‌دهد',
        'مقدار را واقعاً به تایپ هدف تبدیل می‌کند',
        'همیشه امن است چون کامپایلر بررسی می‌کند',
        'معادل `satisfies` است',
      ],
      answer: 0,
      explain:
        'Type Assertion یک عملیات صرفاً زمان‌کامپایل است. در خروجی JavaScript هیچ اثری از آن باقی نمی‌ماند و اگر ادعا غلط باشد، خطا فقط در زمان اجرا ظاهر می‌شود.',
    },
    lab: {
      task: 'یک تابع `parseConfig` بنویس که `unknown` بگیرد و بدون `as` (فقط با گارد) یک تایپ دقیق برگرداند.',
      starter: `type Config = { readonly theme: 'dark' | 'light'; readonly fontSize: number };

function parseConfig(value: unknown): Config {
  if (typeof value !== 'object' || value === null) throw new Error('config باید آبجکت باشد');
  // بعد از گارد بالا، value فقط object است؛ با as به نگاشت کلید/مقدار تبدیلش کن
  const raw = value as Record<string, unknown>;
  const theme = raw['theme'];
  if (theme !== 'dark' && theme !== 'light') throw new Error('theme نامعتبر');
  const fontSize = raw['fontSize'];
  if (typeof fontSize !== 'number') throw new Error('fontSize باید عدد باشد');
  return { theme, fontSize };
}

console.log(parseConfig({ theme: 'dark', fontSize: 16 }));`,
      solution: `// کلید: به‌جای raw as Config، هر فیلد را جدا بررسی کن
// تا تایپ‌ها به‌صورت طبیعی Narrow شوند.`,
    },
  },

  {
    id: 'assert-as-any',
    chapter: 'ch3',
    titleFa: 'Assertion خطرناک: `as any`',
    titleEn: 'as any',
    level: 'intermediate',
    minutes: 20,
    goal: 'بفهمی چرا `as any` بدترین Assertion است، و چهار جایگزین محدود و کنترل‌شده را یاد بگیری.',
    steps: [
      {
        h: 'گام ۱ — `as any` یعنی حذف کامل محافظت',
        p:
          'با `as any`، آن مقدار از سیستم تایپ **خارج** می‌شود: هر پراپرتی، هر فراخوانی و هر انتسابی مجاز است. بدتر اینکه این بی‌دفاعی به هر جایی که آن مقدار برود سرایت می‌کند.',
        code: `const user = { id: 1, name: 'نیما' };
const escaped = user as any;

console.log(escaped.namee);      // ✅ کامپایل → undefined در اجرا!
escaped.whatever.deep.chain();   // ✅ کامپایل → 💥 در اجرا

// حتی انتساب ناممکن هم مجاز می‌شود:
const n: number = escaped as number;
console.log(typeof n);`,
      },
      {
        h: 'گام ۲ — چهار جایگزین به ترتیب اولویت',
        p:
          '۱) تایپ دقیق بنویس. ۲) `as unknown as T` (حداقل زنجیره را محدود می‌کند). ۳) `satisfies` اگر فقط می‌خواهی بررسی کنی. ۴) گارد/پارسر. هیچ‌کدام به اندازه‌ی `as any` خطرناک نیستند.',
        code: `type Raw = Record<string, unknown>;

const data: Raw = { id: 1 };

// ۲) محدود به جای بی‌نهایت:
const typed = data as { id: number };
console.log(typed.id);

// ۴) گارد واقعی:
function hasId(v: unknown): v is { id: number } {
  return typeof v === 'object' && v !== null && 'id' in v;
}
console.log(hasId(data) ? data.id : 'no id');`,
      },
      {
        h: 'گام ۳ — چگونه `as any` را از کدبیس ریشه‌کن کنیم',
        p:
          'قانون ESLint `@typescript-eslint/no-explicit-any` با سطح `error` + شمارش در CI + ممنوعیت در Code Review. برای کد مهاجرتی، یک `any` موقت با `// TODO(any-cleanup): دلیل` بگذار تا قابل جست‌وجو باشد.',
        code: `// ✅ الگوی مهاجرت مستند:
// TODO(any-cleanup): کتابخانه‌ی legacy هنوز تایپ ندارد — Adapter بساز
type LegacyAdapter = { run(input: string): string };

const legacy: LegacyAdapter = {
  run: (input) => input.trim().toUpperCase(),
};

console.log(legacy.run('  سلام  '));`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی شماره یک TypeScript',
        title: '`as any` یک باگ زمان اجرا می‌سازد که کامپایلر هرگز نمی‌بیند',
        body:
          'این تنها راهی است که می‌توانی یک خطای ۱۰۰٪ قطعی زمان اجرا را از دید TypeScript پنهان کنی. هر `as any` در کدبیس یعنی یک نقطه‌ی کور در نقشه‌ی امنیت تایپی.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۱',
        title: 'فرمول «محدودسازی نشتی»',
        body:
          'اگر مجبوری از یک تایپ ناامن استفاده کنی، آن را در **کوچک‌ترین اسکوپ ممکن** محصور کن: یک تابع، یک خط، یک ماژول Adapter. هرچه اسکوپ کوچک‌تر، نشتی کمتر و دیباگ آسان‌تر.',
        equation: 'خطر = (وسعت اسکوپ ناامن) × (مدت زمان باقی‌ماندن آن در کدبیس)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Adapter Pattern برای کد بیرونی ناامن',
        body:
          'همه‌ی `any`های اجتناب‌ناپذیر را در یک فایل `adapters/` جمع کن. داخل آن فایل، داده را از `any` به تایپ‌های دقیق دامنه تبدیل کن. بقیه‌ی کدبیس هرگز `any` نمی‌بیند.',
      },
    ],
    quiz: {
      q: 'چرا `as unknown as T` بر `as any` ترجیح داده می‌شود؟',
      options: [
        'چون نتیجه‌ی نهایی یک تایپ دقیق (`T`) است و بی‌دفاعی فقط در یک گام میانی محدود می‌ماند',
        'چون در زمان اجرا تبدیل واقعی انجام می‌دهد',
        'چون کامپایلر آن را بررسی می‌کند',
        'چون سریع‌تر است',
      ],
      answer: 0,
      explain:
        'با `as any` مقدار برای همیشه از سیستم تایپ خارج می‌شود و به همه‌جا سرایت می‌کند؛ با `as unknown as T` نقطه‌ی پایانی دوباره داخل سیستم تایپ و دقیق است.',
    },
    lab: {
      task: 'یک Adapter بنویس که یک ورودی کاملاً ناشناخته را به تایپ دقیق `Lesson` تبدیل کند — بدون `as any`.',
      starter: `type Lesson = { readonly id: string; readonly minutes: number };

function lessonFrom(raw: unknown): Lesson {
  if (typeof raw !== 'object' || raw === null) throw new Error('invalid');
  const obj = raw as Record<string, unknown>;
  if (typeof obj['id'] !== 'string' || typeof obj['minutes'] !== 'number') {
    throw new Error('invalid lesson shape');
  }
  return { id: obj['id'], minutes: obj['minutes'] };
}

console.log(lessonFrom({ id: 'never', minutes: 35 }));`,
      solution: `const lessonFrom = (raw: unknown): Lesson => {
  const obj = raw as Record<string, unknown>;
  return { id: String(obj['id']), minutes: Number(obj['minutes']) };
};`,
    },
  },

  {
    id: 'assert-as-const',
    chapter: 'ch3',
    titleFa: 'Assertion تغییرناپذیر: `as const`',
    titleEn: 'as const',
    level: 'intermediate',
    minutes: 30,
    goal: '`as const` را به‌عنوان ابزار ساخت تایپ از داده مسلط شوی و سه الگوی کاربردی آن را پیاده کنی.',
    steps: [
      {
        h: 'گام ۱ — `as const` چه تغییری ایجاد می‌کند؟',
        p:
          'سه اثر هم‌زمان: ۱) مقادیر به **لیترال** تبدیل می‌شوند (`string` → `"dark"`). ۲) همه‌ی پراپرتی‌ها `readonly` می‌شوند. ۳) آرایه‌ها به **Tuple فقط‌خواندنی** تبدیل می‌شوند. عمیق و بازگشتی اعمال می‌شود.',
        code: `const a = { theme: 'dark' };              // { theme: string }
const b = { theme: 'dark' } as const;     // { readonly theme: "dark" }

const list = [1, 2];                      // number[]
const frozenList = [1, 2] as const;       // readonly [1, 2]

console.log(b.theme, frozenList[0]);`,
      },
      {
        h: 'گام ۲ — الگوی طلایی ۱: Union از یک لیست (DRY محض)',
        p:
          'این مهم‌ترین الگوی `as const` است: یک آرایه‌ی واقعی از مقادیر (که در زمان اجرا هم لازم است) بنویس و تایپ Union را **از همان** مشتق کن. یک منبع حقیقت، صفر تکرار.',
        code: `export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
// → 'beginner' | 'intermediate' | 'advanced'

// استفاده‌ی زمان اجرا:
console.log(DIFFICULTIES.join(', '));

// استفاده‌ی زمان کامپایل:
const level: Difficulty = 'advanced';
console.log(level);`,
      },
      {
        h: 'گام ۳ — الگوی طلایی ۲: تنظیمات با `readonly` عمقی',
        p:
          'برای کانفیگ‌ها و ثابت‌های سراسری، `as const` تضمین می‌کند هیچ‌کس نمی‌تواند تصادفاً تغییرشان دهد — حتی در آرایه‌های تودرتو.',
        code: `const CONFIG = {
  api: { baseUrl: 'https://api.example.com', timeoutMs: 5000 },
  features: ['studio', 'roadmap'] ,
} as const;

// ❌ CONFIG.api.timeoutMs = 1000;  → Cannot assign to 'timeoutMs' (readonly)
// ❌ CONFIG.features.push('x');    → push وجود ندارد

type ApiConfig = (typeof CONFIG)['api'];
console.log(CONFIG.api.baseUrl, CONFIG.features[0]);`,
      },
      {
        h: 'گام ۴ — الگوی طلایی ۳: پارامترهای Generic با استنتاج لیترال',
        p:
          'با `const` type parameter (TS 5.0+) یا `as const` در فراخوانی، می‌توانی استنتاج لیترال را در توابع عمومی فعال کنی.',
        code: `// TS 5.0+: const type parameter
function pick<const T extends readonly string[]>(items: T): T[number] {
  return items[0] as T[number];
}

console.log(pick(['fa', 'en'])); // تایپ: 'fa' | 'en'  (نه string!)

// معادل قدیمی‌تر: فراخوانی با as const
function first<const T>(value: T): T { return value; }
console.log(first('hello')); // 'hello'`,
      },
    ],
    visual: 'as-const-transform',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۲',
        title: 'فرمول «داده، منبع تایپ است»',
        body:
          'به‌جای اینکه تایپ و داده را جدا بنویسی (و روزی از هم دور بیفتند)، داده را با `as const` بنویس و تایپ را از آن مشتق کن. این یعنی **یک منبع حقیقت** برای هر دو جهان: زمان اجرا و زمان کامپایل.',
        equation: 'type T = (typeof VALUES)[number]  →  تغییر در VALUES ⇒ به‌روزرسانی خودکار T',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'همیشه `VALUES` و `type` را کنار هم export کن',
        body:
          'الگوی استاندارد: `export const ROLES = [...] as const; export type Role = (typeof ROLES)[number];` این جفت باید همیشه با هم در یک فایل باشند و هر دو export شوند تا مصرف‌کننده به هر دو دسترسی داشته باشد.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`as const` روی عبارت تابع نتیجه نمی‌دهد',
        body:
          '`const f = () => ({ a: 1 }) as const` خروجی تابع را readonly نمی‌کند (فقط عبارت را). باید تایپ بازگشت را صریح `as const` کنی یا از `readonly` در تایپ بازگشت استفاده کنی: `(): { readonly a: 1 } => ({ a: 1 })`.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `readonly` و `as const`',
        body:
          'پاسخ: «`readonly` یک modifier روی تایپ است و فقط سطح اول را تغییرناپذیر می‌کند و مقادیر را لیترال نمی‌سازد. `as const` یک Assertion است که **بازگشتی** اعمال می‌شود، همه‌چیز را readonly و همه‌ی مقادیر را لیترال می‌کند.»',
      },
    ],
    quiz: {
      q: 'تایپ `[{ id: 1 }, { id: 2 }] as const` چیست؟',
      options: [
        '`readonly [{ readonly id: 1 }, { readonly id: 2 }]`',
        '`{ id: number }[]`',
        '`readonly { id: number }[]`',
        '`[{ id: number }, { id: number }]`',
      ],
      answer: 0,
      explain:
        '`as const` بازگشتی اعمال می‌شود: آرایه به Tuple فقط‌خواندنی، هر آبجکت به readonly، و هر مقدار به لیترال تبدیل می‌شود.',
    },
    lab: {
      task: 'یک لیست از فصل‌های مسیر یادگیری بساز و تایپ Union شناسه‌ها را از همان لیست مشتق کن.',
      starter: `const CHAPTERS = ['tools', 'types', 'assertions', 'narrowing', 'generics'] as const;
type ChapterId = (typeof CHAPTERS)[number];

const labels: Record<ChapterId, string> = {
  tools: 'ابزارها',
  types: 'انواع',
  assertions: 'ادعاها',
  narrowing: 'باریک‌سازی',
  generics: 'جنریک‌ها',
};

const current: ChapterId = 'generics';
console.log(labels[current], CHAPTERS.length);`,
      solution: `type ChapterId = (typeof CHAPTERS)[number];
const labels: Record<ChapterId, string> = { tools: 'ابزارها', types: 'انواع', assertions: 'ادعاها', narrowing: 'باریک‌سازی', generics: 'جنریک‌ها' };`,
    },
  },

  {
    id: 'assert-non-null',
    chapter: 'ch3',
    titleFa: 'Non-null Assertion (`!`)',
    titleEn: 'Non-null Assertion',
    level: 'intermediate',
    minutes: 20,
    goal: 'بدانی `!` دقیقاً چه می‌کند، چرا خطرناک است، و چهار الگوی جایگزین امن را به کار بگیری.',
    steps: [
      {
        h: 'گام ۱ — `!` چه می‌کند؟',
        p:
          'پسوند `!` تایپ `T | null | undefined` را به `T` تبدیل می‌کند. هیچ بررسی زمان اجرایی اضافه نمی‌کند — صرفاً `null`/`undefined` را از تایپ **حذف** می‌کند. اگر اشتباه کنی، در زمان اجرا crash می‌گیری.',
        code: `const maybeName: string | undefined = undefined;

// ❌ maybeName.length → TS18048 (possibly undefined)
// ✅ ولی خطرناک:
const len: number = maybeName!.length;
console.log('این خط اجرا می‌شود:', typeof len); // 💥 در اجرا TypeError`,
      },
      {
        h: 'گام ۲ — چهار جایگزین امن (به ترتیب اولویت)',
        p:
          '۱) گارد صریح با Early Return. ۲) `??` با مقدار پیش‌فرض معنادار. ۳) `?.` برای زنجیره‌ی دسترسی. ۴) تغییر طراحی تایپ تا تهی بودن اصلاً ممکن نباشد (Make Illegal States Unrepresentable).',
        code: `const items: string[] = [];

// ۱) گارد صریح
function firstGuarded(list: string[]): string {
  if (list.length === 0) return '';
  return list[0] as string;
}

// ۲) مقدار پیش‌فرض
const name = items[0] ?? 'بدون نام';

// ۳) Optional chaining
const upper = items[0]?.toUpperCase() ?? 'N/A';

console.log(firstGuarded(items), name, upper);`,
      },
      {
        h: 'گام ۳ — تنها جایگاه‌های قابل قبول `!`',
        p:
          '۱) `strictPropertyInitialization` وقتی پراپرتی در متدی غیر از constructor پر می‌شود (مثل `ngOnInit` یا `connectedCallback`). ۲) کدی که منطق تهی بودنش در جای دیگری تضمین شده و کامپایلر نمی‌تواند ببیند. در هر دو مورد، **کامنت دلیل** الزامی است.',
        code: `class ElementWatcher {
  // ✅ قابل قبول: در connectedCallback پر می‌شود، نه constructor
  private root!: HTMLElement;

  attach(el: HTMLElement): void {
    this.root = el;
  }

  describe(): string {
    return this.root.tagName;
  }
}

const w = new ElementWatcher();
w.attach(document.createElement('div'));
console.log(w.describe());`,
      },
      {
        h: 'گام ۴ — `!` در برابر `?.` و `??` (سه نماد، سه معنی)',
        p:
          '`x!` = «مطمئنم تهی نیست». `x?.y` = «اگر تهی است، کل عبارت undefined شود». `x ?? y` = «اگر تهی است، y را بگذار». این سه را قاطی نکن؛ هر کدام جهت متفاوتی دارند.',
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی جدی',
        title: '`!` یک دروغ به کامپایلر است و کامپایلر باور می‌کند',
        body:
          'هر `!` یعنی «من از کامپایلر مطمئن‌ترم». در عمل یعنی یک باگ زمان اجرا که هیچ ابزاری قبل از پروداکشن نمی‌گیرد. در Code Review، هر `!` بدون کامنت دلیل باید رد شود.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۳',
        title: 'فرمول «حالت نامعتبر را غیرقابل بیان کن»',
        body:
          "به‌جای مدیریت حالت تهی در ۱۰ نقطه، تایپ را طوری طراحی کن که آن حالت **اصلاً وجود نداشته باشد**. مثلاً به‌جای `{ user: User | null; isLoggedIn: boolean }` از یک Discriminated Union استفاده کن: `{ status: 'guest' } | { status: 'user'; user: User }`.",
        equation: 'تعداد باگ‌های تهی ∝ (تعداد حالت‌های نامعتبری که تایپ اجازه‌ی بیان‌شان را می‌دهد)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قانون ESLint `no-non-null-assertion`',
        body:
          'این قاعده را در سطح `error` فعال کن و استثناها را فقط با `// eslint-disable-next-line -- دلیل` اجازه بده. بدون این قاعده، تعداد `!`ها در هر کدبیس به‌صورت نمایی رشد می‌کند.',
      },
    ],
    quiz: {
      q: 'کدام گزینه جایگزین امن و ترجیحی برای `document.getElementById("x")!.style` است؟',
      options: [
        '`document.getElementById("x")?.style`',
        '`(document.getElementById("x") as any).style`',
        '`document.getElementById("x")!.style!`',
        '`// @ts-ignore`',
      ],
      answer: 0,
      explain:
        'Optional Chaining در صورت نبود عنصر، کل عبارت را `undefined` می‌کند و هیچ خطای زمان اجرا تولید نمی‌شود. بقیه‌ی گزینه‌ها یا ناامن‌اند یا بررسی را سرکوب می‌کنند.',
    },
    lab: {
      task: 'تابع زیر را که `!` دارد به نسخه‌ی کاملاً امن تبدیل کن.',
      starter: `function longestName(names: readonly string[]): string {
  if (names.length === 0) return '';
  // ❌ نسخه‌ی ناامن: return names.sort(...)[0]!;
  const sorted = [...names].sort((a, b) => b.length - a.length);
  return sorted[0] ?? '';
}

console.log(longestName(['نیما', 'آرش', 'کوروش']));
console.log(longestName([]));`,
      solution: `const longestName = (names: readonly string[]) =>
  [...names].sort((a, b) => b.length - a.length)[0] ?? '';`,
    },
  },

  {
    id: 'satisfies-keyword',
    chapter: 'ch3',
    titleFa: 'کلیدواژه‌ی `satisfies`',
    titleEn: 'satisfies keyword',
    level: 'advanced',
    minutes: 35,
    goal: 'تفاوت حیاتی `satisfies` و `:` و `as` را بفهمی و بدان کجا `satisfies` تنها راه درست است.',
    steps: [
      {
        h: 'گام ۱ — مشکل اصلی: تایپ صریح، استنتاج دقیق را می‌کُشد',
        p:
          'وقتی `const x: T = ...` می‌نویسی، تایپ `x` دقیقاً `T` می‌شود — نه تایپ دقیق‌تر خود مقدار. یعنی هم اعتبارسنجی می‌کنی و هم اطلاعات را از دست می‌دهی. `satisfies` این تناقض را حل می‌کند.',
        code: `type Palette = Record<'black' | 'white', string | [number, number, number]>;

// ❌ با تایپ صریح، دقت از دست می‌رفت:
const loose: Palette = { black: '#000', white: [255, 255, 255] };
// loose.black.toUpperCase() → خطا! چون تایپ string | [n,n,n] است

// ✅ با satisfies، هم بررسی می‌شود هم دقت حفظ می‌شود:
const precise = { black: '#000', white: [255, 255, 255] } satisfies Palette;
console.log(precise.black.toUpperCase()); // ✅ string
console.log(precise.white[0]);            // ✅ number`,
      },
      {
        h: 'گام ۲ — جدول تصمیم: `:` در برابر `as` در برابر `satisfies`',
        p:
          '`: T` = تایپ را **تحویل** می‌دهد (Widening، از دست رفتن دقت). `as T` = **ادعا** می‌کند (بدون بررسی کامل). `satisfies T` = **بررسی** می‌کند ولی تایپ استنتاج‌شده‌ی دقیق را **نگه می‌دارد**.',
        code: `type Config = { readonly host: string; readonly port: number };

// ۱) تایپ تحویلی — دقیق ولی بدون انعطاف
const a: Config = { host: 'localhost', port: 3000 };

// ۲) satisfies — بررسی + حفظ لیترال‌ها
const b = { host: 'localhost', port: 3000 } as const satisfies Config;
// → b.host تایپ "localhost" است نه string!

// ۳) as — بدون بررسی واقعی (خطرناک)
const c = { host: 'localhost', portt: 3000 } as Config; // ❗ کامپایل می‌شود

console.log(a.host, b.port, c.host);`,
      },
      {
        h: 'گام ۳ — کاربرد طلایی ۱: Exhaustiveness + دقت هم‌زمان',
        p:
          'برای نگاشت‌ها (Record) این بهترین الگو است: `satisfies` تضمین می‌کند همه‌ی کلیدها پوشش داده شده‌اند، ولی تایپ هر مقدار دقیق باقی می‌ماند.',
        code: `type RouteHandler = {
  readonly path: string;
  readonly needsAuth: boolean;
};

const routes = {
  home: { path: '/', needsAuth: false },
  profile: { path: '/profile', needsAuth: true },
} satisfies Record<string, RouteHandler>;

// ✅ تایپ دقیق حفظ شده:
console.log(routes.home.path.toUpperCase());
console.log(routes.profile.needsAuth);

// ✅ و کلیدهای ناشناخته خطا می‌دهند:
// routes.typo → TS2339`,
      },
      {
        h: 'گام ۴ — کاربرد طلایی ۲: `as const satisfies T` (قدرتمندترین ترکیب)',
        p:
          'ترتیب مهم است: اول `as const` (تا مقادیر لیترال و readonly شوند)، بعد `satisfies T` (تا بررسی شوند). این ترکیب، ثابت‌های سراسری کاملاً دقیق و کاملاً اعتبارسنجی‌شده می‌سازد.',
        code: `const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
} as const satisfies Record<string, number>;

type StatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
// → 200 | 404   (لیترال‌های دقیق!)

const code: StatusCode = 404;
console.log(code, HTTP_STATUS.OK);`,
      },
    ],
    visual: 'satisfies-compare',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۴',
        title: 'فرمول «هم بررسی، هم دقت»',
        body:
          'قبل از `satisfies` مجبور بودی یکی را انتخاب کنی: یا تایپ صریح بگذاری و دقت استنتاج را از دست بدهی، یا تایپ نگذاری و اعتبارسنجی را. `satisfies` این معامله را باطل کرد. هر جا یک آبجکت/نگاشت باید هم قرارداد داشته باشد هم دقیق بماند، `satisfies` جواب است.',
        equation: 'satisfies = اعتبارسنجی (مثل `:`) + حفظ استنتاج دقیق (مثل بی‌annotation)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'برای هر نگاشت تنظیمات، `satisfies` بگذار',
        body:
          'هر آبجکتی که ساختارش توسط یک تایپ قرارداد تعیین می‌شود (routes، labels، themes، handlers) باید `satisfies` داشته باشد. این کار هم کلیدهای غلط را می‌گیرد و هم امکان استفاده از مقادیر دقیق را نگه می‌دارد.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'ترتیب `satisfies` و `as const`',
        body:
          '`x satisfies T as const` با `x as const satisfies T` متفاوت است! ترتیب درست `as const` **اول** است. اگر برعکس بنویسی، لیترال‌ها گسترش می‌یابند و مزیت اصلی از بین می‌رود.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `satisfies` با type annotation',
        body:
          'پاسخ: «annotation تایپ متغیر را **تعیین** می‌کند و استنتاج دقیق‌تر را از بین می‌برد؛ `satisfies` فقط **سازگاری** مقدار با یک تایپ را بررسی می‌کند و تایپ استنتاج‌شده‌ی اصلی (با لیترال‌ها) را حفظ می‌کند.»',
      },
    ],
    quiz: {
      q: 'با `const cfg = { port: 3000 } satisfies { port: number }`، تایپ `cfg.port` چیست؟',
      options: ['`number`', '`3000`', '`any`', '`unknown`'],
      answer: 0,
      explain:
        '`satisfies` تایپ را به تایپ قرارداد تغییر نمی‌دهد، ولی چون `const` روی یک آبجکت است و پراپرتی قابل تغییر است، تایپ پراپرتی به `number` گسترش می‌یابد. برای گرفتن لیترال `3000` باید `as const satisfies` بنویسی.',
    },
    lab: {
      task: 'یک نگاشت از «فصل → شماره‌ی روز شروع» بساز که هم کامل بودن را تضمین کند و هم مقادیر لیترال دقیق داشته باشد.',
      starter: `const CHAPTER_IDS = ['ch1', 'ch2', 'ch3'] as const;
type ChapterId = (typeof CHAPTER_IDS)[number];

const startDays = {
  ch1: 1,
  ch2: 4,
  ch3: 9,
} as const satisfies Record<ChapterId, number>;

type DayOf = (typeof startDays)['ch2']; // 4  (لیترال دقیق!)

const day: DayOf = 4;
console.log(day, startDays.ch3);`,
      solution: `const startDays = { ch1: 1, ch2: 4, ch3: 9 } as const satisfies Record<ChapterId, number>;`,
    },
  },

  {
    id: 'type-inference',
    chapter: 'ch4',
    titleFa: 'استنتاج تایپ (Type Inference)',
    titleEn: 'Type Inference',
    level: 'intermediate',
    minutes: 40,
    goal: 'هفت مکانیزم استنتاج TypeScript را بشناسی و بدانی کجا تایپ صریح بنویسی و کجا به کامپایلر اعتماد کنی.',
    steps: [
      {
        h: 'گام ۱ — استنتاج از مقدار (Value-based Inference)',
        p:
          'ساده‌ترین حالت: کامپایلر از مقدار اولیه، تایپ را می‌سازد. با `const` تایپ به لیترال محدود می‌شود، با `let`/`var` گسترش می‌یابد (Widening).',
        code: `const name = 'نیما';        // 'نیما'  (لیترال)
let age = 30;               // number   (گسترش‌یافته)
const list = [1, 2, 3];     // number[]
const obj = { a: 1 };       // { a: number }

console.log(name, age, list.length, obj.a);`,
      },
      {
        h: 'گام ۲ — استنتاج زمینه‌ای (Contextual Typing) — پرکاربردترین',
        p:
          'وقتی یک عبارت در موقعیتی با تایپ معلوم قرار می‌گیرد (پارامتر تابع، مقدار بازگشتی، عضو آرایه)، کامپایلر از **زمینه** تایپ را استنتاج می‌کند. این دلیل آن است که پارامترهای callback نیازی به annotation ندارند.',
        code: `const names = ['نیما', 'سارا'];

// ✅ بدون annotation — تایپ از زمینه می‌آید:
const upper = names.map((n) => n.toUpperCase());

// اگر زمینه نباشد، implicit any خطا می‌دهد:
const handler = (n) => n.length; // ❌ TS7006 با noImplicitAny

console.log(upper.join(', '));`,
      },
      {
        h: 'گام ۳ — استنتاج از تایپ بازگشتی (Return Type Inference)',
        p:
          'اگر تایپ بازگشت تابع را ننویسی، کامپایلر از بدنه استنتاج می‌کند. برای توابع داخلی کوچک این خوب است؛ برای **API عمومی** باید صریح بنویسی تا تغییر بدنه، ناخواسته قرارداد را نشکند.',
        code: `// استنتاج‌شده: (a: number, b: number) => number
function add(a: number, b: number) { return a + b; }

// صریح — قرارداد پایدار (پیش‌فرض برای توابع export شده):
export function multiply(a: number, b: number): number { return a * b; }

console.log(add(2, 3), multiply(2, 3));`,
      },
      {
        h: 'گام ۴ — استنتاج Generic و `infer`',
        p:
          'Genericها به‌صورت خودکار از آرگومان‌ها استنتاج می‌شوند. در سطح پیشرفته‌تر، `infer` اجازه می‌دهد تایپی را از دل یک تایپ دیگر **بیرون بکشی**.',
        code: `function first<T>(list: readonly T[]): T | undefined { return list[0]; }
console.log(first([1, 2, 3]));   // T = number (خودکار)

type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type A = ElementOf<string[]>;    // string
type B = ElementOf<readonly [1, 'x']>; // 1 | 'x'

const a: A = 'text';
const b: B = 'x';
console.log(a, b);`,
      },
      {
        h: 'گام ۵ — قانون طلایی: کجا صریح بنویسیم؟',
        p:
          'صریح بنویس وقتی: ۱) تابع export شده است (قرارداد عمومی). ۲) تایپ استنتاج‌شده خیلی پیچیده/ناخوانا می‌شود. ۳) می‌خواهی لیترال یا Union محدود داشته باشی. ۴) خطای کامپایلر گمراه‌کننده است. در بقیه‌ی موارد، استنتاج را رها کن.',
      },
    ],
    visual: 'inference-flow',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۵',
        title: 'فرمول «Annotation حداقل، دقت حداکثر»',
        body:
          'هر annotation صریح یک نقطه‌ی نگهداری است که می‌تواند کهنه شود. قانون عملی: **در مرزهای عمومی (export) صریح، در داخل توابع استنتاجی.** این کار هم قرارداد را پایدار نگه می‌دارد و هم تکرار را حذف می‌کند.',
        equation: 'تکرار کد ≈ (تعداد annotationهای غیرضروری) — هدف: صفر annotation قابل استنتاج',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تایپ بازگشت توابع عمومی را همیشه بنویس',
        body:
          'اگر تابعی export شده و تایپ بازگشتش را ننوشته‌ای، یک تغییر کوچک در بدنه می‌تواند قرارداد را بی‌صدا عوض کند و تمام مصرف‌کننده‌ها را بشکند. نوشتن `: Promise<User[]>` یک بیمه‌نامه‌ی رایگان است.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'آزمون «تایپ را حدس بزن»',
        body:
          'برای هر عبارت، قبل از hover کردن تایپ را روی کاغذ بنویس. اگر اشتباه کردی، دقیقاً همان‌جا یک شکاف دانشی داری. این تمرین ۱۰ دقیقه‌ای روزانه، درک استنتاج را به شدت عمیق می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Contextual Typing چیست؟',
        body:
          'پاسخ: «استنتاج تایپ یک عبارت از تایپ موقعیتی که در آن قرار گرفته. مثلاً پارامتر یک callback از تایپ آن callback در امضای تابع والد تایپ می‌گیرد — به همین دلیل `arr.map(x => ...)` نیازی به annotation روی `x` ندارد.»',
      },
    ],
    quiz: {
      q: 'چرا در `names.map((n) => n.toUpperCase())` پارامتر `n` نیازی به annotation ندارد؟',
      options: [
        'چون Contextual Typing تایپ آن را از امضای `map` و تایپ آرایه استنتاج می‌کند',
        'چون `n` به‌صورت پیش‌فرض `any` است',
        'چون TypeScript همیشه رشته را استنتاج می‌کند',
        'چون `noImplicitAny` به‌صورت پیش‌فرض خاموش است',
      ],
      answer: 0,
      explain:
        'امضای `Array<string>.map` تایپ callback را مشخص می‌کند، پس کامپایلر `n` را از همان زمینه `string` می‌گیرد. این دقیقاً همان Contextual Typing است.',
    },
    lab: {
      task: 'تایپ استنتاج‌شده‌ی هر چهار عبارت زیر را حدس بزن، سپس با ستون Type X-Ray بررسی کن.',
      starter: `const a = { items: [1, 2, 3] };
const b = [1, 'two', true] as const;
const c = a.items.map((n) => n * 2);
const d = c.filter((n) => n > 2);

console.log(a, b, c, d);`,
      solution: `// a: { items: number[] }
// b: readonly [1, 'two', true]
// c: number[]
// d: number[]`,
    },
  },

  {
    id: 'type-compatibility',
    chapter: 'ch4',
    titleFa: 'سازگاری تایپ‌ها (Type Compatibility)',
    titleEn: 'Type Compatibility',
    level: 'advanced',
    minutes: 45,
    goal: 'قواعد Assignability را کامل بفهمی: Structural Typing، Variance در توابع، و Excess Property Check.',
    steps: [
      {
        h: 'گام ۱ — اصل بنیادین: Structural Subtyping',
        p:
          'در TypeScript سازگاری بر اساس **شکل** است نه **نام**. `A` به `B` انتساب‌پذیر است اگر `A` حداقل همه‌ی اعضای لازم `B` را با تایپ‌های سازگار داشته باشد. نام تایپ هیچ نقشی ندارد.',
        code: `type Named = { name: string };
type Aged = { age: number };
type Person = { name: string; age: number };

const person: Person = { name: 'نیما', age: 30 };

const n: Named = person;  // ✅ Person همه‌ی اعضای Named را دارد
const a: Aged = person;   // ✅

// ❌ const p: Person = n; → age ندارد
console.log(n.name, a.age);`,
      },
      {
        h: 'گام ۲ — Variance در توابع: پارامترها Contravariant',
        p:
          'برای اینکه یک تابع به تابع دیگر انتساب‌پذیر باشد: **پارامترها باید پهن‌تر (Contravariant)** و **بازگشتی باید باریک‌تر (Covariant)** باشد. این قاعده، اساس امنیت جایگزینی است.',
        code: `type Handler<T> = (value: T) => void;

const handleUnknown: Handler<unknown> = (v) => console.log('any:', v);
const handleString: Handler<string> = (v) => console.log('string:', v);

// ✅ تابع پهن‌تر را می‌توان جای باریک‌تر گذاشت (امن):
const safe: Handler<string> = handleUnknown;

// ❌ با strictFunctionTypes، برعکسش خطا می‌دهد:
// const risky: Handler<unknown> = handleString;

safe('سلام');
handleString('سلام');`,
      },
      {
        h: 'گام ۳ — بازگشتی‌ها Covariant و آرایه‌ها (یک حفره‌ی تاریخی)',
        p:
          'خروجی توابع باید زیرمجموعه باشد. ولی `T[]` در TypeScript **Covariant ناسالم** است: می‌توانی `string[]` را به `(string | number)[]` انتساب دهی و سپس عددی داخلش بگذاری — این یک حفره‌ی تاریخی برای سازگاری با JS است.',
        code: `const strings: string[] = ['a'];
const mixed: (string | number)[] = strings; // ✅ مجاز (ولی ناامن!)
mixed.push(1);                              // حالا strings هم ۱ دارد! 💥

console.log(strings[1]); // 1 — تایپ می‌گوید string!

// ✅ readonly T[] این حفره را می‌بندد:
const safeList: readonly string[] = ['a'];
// safeList.push → ❌ مجاز نیست
console.log(safeList.length);`,
      },
      {
        h: 'گام ۴ — Excess Property Check: استثنا یا قاعده؟',
        p:
          'این یک قاعده‌ی **جدا** از assignability است که فقط روی object literalهای تازه اعمال می‌شود تا غلط املایی گرفته شود. اگر مقدار از متغیر واسطه بیاید، اعمال نمی‌شود.',
        code: `type Point = { x: number; y: number };

// ❌ literal مستقیم → TS2353
// const p1: Point = { x: 1, y: 2, z: 3 };

// ✅ متغیر واسطه → فقط ساختار بررسی می‌شود
const raw = { x: 1, y: 2, z: 3 };
const p2: Point = raw;

console.log(p2.x, p2.y);`,
      },
      {
        h: 'گام ۵ — `extends` در Generic در برابر `implements`',
        p:
          '`T extends U` در سطح تایپ یعنی «T زیرمجموعه‌ی U است» (Constraint). `implements` در کلاس یعنی «این کلاس باید این قرارداد را ارضا کند». هر دو از همان قواعد سازگاری ساختاری استفاده می‌کنند.',
      },
    ],
    visual: 'variance',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۶',
        title: 'فرمول Variance به زبان ساده',
        body:
          'برای توابع: **ورودی پهن‌تر، خروجی باریک‌تر.** این همان اصل جایگزینی Liskov است. اگر این را حفظ کنی، می‌توانی هر خطای TS2322 مربوط به تابع را در چند ثانیه تشخیص دهی.',
        equation: '(A → B) ⊆ (C → D)  اگر  C ⊆ A  و  B ⊆ D',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی تاریخی',
        title: 'Covariance ناسالم آرایه‌های تغییرپذیر',
        body:
          '`string[]` به `(string | number)[]` منتسب می‌شود و این یک حفره‌ی امنیتی تایپی است. راه‌حل عملی: در امضاهای عمومی همیشه `readonly T[]` استفاده کن تا `push`/`splice` ممکن نباشد و حفره بسته شود.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`strictFunctionTypes` را هرگز خاموش نکن',
        body:
          'این flag (عضو `strict`) بررسی Contravariance را برای پارامترهای تابع فعال می‌کند. بدون آن، توابع را می‌توان در جهت ناامن جایگزین کرد و باگ‌های ظریف زمان اجرا تولید می‌شود.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Nominal در برابر Structural Typing',
        body:
          'پاسخ: «در Structural (TypeScript) سازگاری با شکل تعیین می‌شود؛ در Nominal (Java، C#) با نام و رابطه‌ی اعلانی. برای شبیه‌سازی Nominal در TS از Branded Types (`T & { __brand }`) استفاده می‌کنیم.»',
      },
    ],
    quiz: {
      q: 'با `strictFunctionTypes: true`، کدام انتساب مجاز است؟',
      options: [
        '`const f: (v: string) => void = (v: unknown) => {}`',
        '`const f: (v: unknown) => void = (v: string) => {}`',
        'هر دو مجازند',
        'هیچ‌کدام مجاز نیستند',
      ],
      answer: 0,
      explain:
        'پارامترها Contravariant هستند: تابعی که ورودی پهن‌تر (`unknown`) می‌پذیرد را می‌توان در جایگاهی گذاشت که ورودی باریک‌تر (`string`) انتظار می‌رود. جهت برعکس ناامن است و خطا می‌دهد.',
    },
    lab: {
      task: 'یک Branded Type بساز تا سازگاری ساختاری را عمداً بشکنی (Nominal Typing شبیه‌سازی‌شده) و خطا را ببین.',
      starter: `type Email = string & { readonly __brand: 'Email' };
type Username = string & { readonly __brand: 'Username' };

const asEmail = (s: string): Email => s as Email;
const asUsername = (s: string): Username => s as Username;

function sendEmail(to: Email): string { return \`sent to \${to}\`; }

const email = asEmail('nima@example.com');
const username = asUsername('nima');

console.log(sendEmail(email));
// ❌ sendEmail(username) → خطای تایپی!`,
      solution: `type Email = string & { readonly __brand: 'Email' };
const sendEmail = (to: Email) => \`sent to \${to}\`;
// sendEmail(asUsername('x')) → TS2345`,
    },
  },
];
