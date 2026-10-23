/* ==========================================================================
   فصل ۱ — مبانی و ابزارها (Introduction · TS vs JS · Interop · Install
   · tsconfig · Compiler Options · Running TS · tsc · ts-node · Playground)
   ========================================================================== */

export const PART1_LESSONS = [
  {
    id: 'intro-ts',
    chapter: 'ch1',
    titleFa: 'مقدمه‌ای بر TypeScript',
    titleEn: 'Introduction to TypeScript',
    level: 'beginner',
    minutes: 35,
    goal: 'درک کنی TypeScript دقیقاً چه لایه‌ای روی JavaScript اضافه می‌کند و چرا این لایه در پروژه‌های بزرگ حیاتی است.',
    steps: [
      {
        h: 'گام ۱ — TypeScript یک «ابر مجموعه» است نه یک زبان جدید',
        p: 'هر کد JavaScript معتبر، یک کد TypeScript معتبر هم هست. TypeScript فقط **سیستم تایپ ایستا (Static Type System)** را در زمان نوشتن اضافه می‌کند و در زمان کامپایل، تمام تایپ‌ها را پاک (Erase) می‌کند.',
        code: `// این کد هم JavaScript است، هم TypeScript:
const dailyGoal = 5;

// این کد فقط TypeScript است (تایپ‌ها در خروجی حذف می‌شوند):
const hoursPerDay: number = 5;
const focus: string = 'TypeScript Mastery';`,
      },
      {
        h: 'گام ۲ — سه کاری که TypeScript برای تو انجام می‌دهد',
        p: '۱) **شکار خطا پیش از اجرا** ۲) **تکمیل خودکار هوشمند (IntelliSense)** ۳) **مستندسازی زنده‌ی کد**؛ تایپ‌ها هیچ‌وقت کهنه نمی‌شوند چون اگر کهنه شوند، کامپایلر خطا می‌دهد.',
      },
      {
        h: 'گام ۳ — تفاوت خطای زمان کامپایل با خطای زمان اجرا',
        p: 'در JavaScript خطای `TypeError: undefined is not a function` را در پروداکشن می‌بینی؛ در TypeScript همان خطا را روی کیبورد، با رنگ قرمز و پیام دقیق می‌بینی. این جابه‌جاییِ «زمان کشف خطا» کل ارزش اقتصادی TypeScript است.',
        code: `type User = { name: string; age: number };

const user: User = { name: 'Nima', age: 30 };

// ❌ TypeScript: Property 'nmae' does not exist on type 'User'. (TS2551)
// console.log(user.nmae);

// ✅ درست:
console.log(user.name);`,
      },
    ],
    visual: 'eraser',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱',
        title: 'قانون ۲۰/۸۰ یادگیری TypeScript',
        body: '۲۰٪ از مفاهیم TypeScript (Union، Narrowing، Generics، Utility Types) حدود ۸۰٪ از کد روزمره‌ی تو را می‌سازند. پس **اول آن ۲۰٪ را عمیق یاد بگیر**، نه همه‌ی ۱۰۰ مفهوم را سطحی.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'یادگیری با خطای عمدی (Error-Driven Learning)',
        body: 'برای هر مفهوم، اول یک نسخه‌ی **غلط** بنویس، پیام خطای کامپایلر را کامل بخوان، بعد نسخه‌ی درست را بساز. مغز، پیام خطا را به‌عنوان قلاب حافظه نگه می‌دارد — این سریع‌ترین مسیر تسلط بر TypeScript است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تایپ‌ها را «قرارداد» بنویس نه «مستندات»',
        body: 'نام تایپ باید **قصد** را بگوید نه ساختار را. `type T1 = { a: string }` بد است؛ `type UserDisplayName = { fullName: string }` خوب است. اگر مجبوری تایپ را کامنت کنی، نامش اشتباه است.',
      },
    ],
    quiz: {
      q: 'خروجی JavaScript یک فایل TypeScript پس از کامپایل چه تفاوتی با فایل اصلی دارد؟',
      options: [
        'تمام annotationهای تایپ حذف می‌شوند و منطق اجرایی یکسان می‌ماند',
        'کد به بایت‌کد ماشین مجازی جدید تبدیل می‌شود',
        'تایپ‌ها به کامنت تبدیل می‌شوند',
        'کد همیشه فشرده (minified) می‌شود',
      ],
      answer: 0,
      explain:
        'TypeScript یک زبان «Transpile-shونده» است: `tsc` تایپ‌ها را Erase می‌کند و سینتکس جدید (مثل enum یا parameter properties) را به معادل JavaScript ترجمه می‌کند. Minify کردن وظیفه‌ی ابزار build است نه خود tsc.',
    },
    lab: {
      task: 'یک تایپ `StudySession` بساز با فیلدهای `topic: string` و `hours: number`، سپس یک نمونه‌ی معتبر و یک نمونه‌ی نامعتبر (کامنت‌شده) بنویس.',
      starter: `type StudySession = {
  topic: string;
  hours: number;
};

const session: StudySession = { topic: 'TypeScript Types', hours: 5 };
// const broken: StudySession = { topic: 'Generics', hours: 'five' }; // ❌ TS2322

console.log(\`\${session.topic}: \${session.hours}h/day\`);`,
    },
  },

  {
    id: 'ts-vs-js',
    chapter: 'ch1',
    titleFa: 'TypeScript در برابر JavaScript',
    titleEn: 'TypeScript vs JavaScript',
    level: 'beginner',
    minutes: 30,
    goal: 'بتوانی با استدلال فنی بگویی TypeScript چه چیزی اضافه می‌کند، چه چیزی اضافه نمی‌کند و کجا نباید از آن استفاده کرد.',
    steps: [
      {
        h: 'گام ۱ — چه چیزی اضافه می‌شود؟',
        p: 'تنها چیزی که اضافه می‌شود **اطلاعات** است: تایپ متغیرها، امضای توابع، شکل آبجکت‌ها، و قیدهای Generic. هیچ مدل اجرایی جدیدی اضافه نمی‌شود؛ Event Loop، Closure، Prototype و `this` دقیقاً همان JavaScript است.',
      },
      {
        h: 'گام ۲ — چه چیزی اضافه نمی‌شود؟ (مهم‌ترین سوءتفاهم)',
        p: 'TypeScript **اعتبارسنجی زمان اجرا نمی‌کند**. اگر داده‌ای از API یا `JSON.parse` بیاید و با تایپ تو نخواند، TypeScript هیچ کاری نمی‌کند. برای آن مرزها به ابزارهایی مثل `zod` نیاز داری.',
        code: `type ApiResponse = { id: number; title: string };

// ⚠️ این فقط یک «ادعا» است، نه یک بررسی زمان اجرا:
const raw = JSON.parse('{"id":"oops","title":123}') as ApiResponse;

console.log(raw.id); // زمان اجرا: "oops" (رشته!) — کامپایلر هرگز نمی‌فهمد`,
      },
      {
        h: 'گام ۳ — جدول تصمیم: کجا TypeScript؟',
        p: 'پروژه‌ی بیش از یک هفته عمر، بیش از ۲ نفر تیم، یا بیش از ۵۰۰ خط کد → TypeScript اجباری. اسکریپت یک‌بارمصرف ۲۰ خطی → JavaScript خالص کافی و سریع‌تر است.',
      },
    ],
    visual: 'compare',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲',
        title: 'فرمول بازگشت سرمایه‌ی TypeScript',
        body: 'سود TypeScript = (اندازه‌ی کدبیس × عمر پروژه × تعداد توسعه‌دهنده). اگر هر سه کوچک باشند، هزینه‌ی setup از سودش بیشتر است؛ اگر هر سه بزرگ باشند، نبود TypeScript یعنی فاجعه.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '«تایپ زدم یعنی داده اعتبارسنجی شد»',
        body: 'مرزهای سیستم (API، فرم، فایل، localStorage) تنها جاهایی هستند که تایپ‌ها **دروغ** می‌گویند. همیشه در مرز، یک Runtime Validator بگذار و تایپ را از روی آن مشتق کن (`z.infer`).',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: '«TypeScript چه تضمینی نمی‌دهد؟»',
        body: 'پاسخ طلایی: «تضمین زمان اجرا نمی‌دهد. TypeScript یک ابزار زمان کامپایل است و پس از Erase شدن تایپ‌ها، هیچ اثری در رفتار برنامه ندارد. برای داده‌ی خارجی به Schema Validation نیاز داریم.»',
      },
    ],
    quiz: {
      q: 'کدام سناریو بیشترین نیاز را به Runtime Validation (مثل zod) دارد؟',
      options: [
        'پاسخ دریافتی از یک REST API خارجی',
        'یک ثابت عددی تعریف‌شده در همان فایل',
        'خروجی یک تابع خالص داخلی با تایپ صریح',
        'یک union type از رشته‌های لیترال',
      ],
      answer: 0,
      explain:
        'داده‌ی بیرونی تنها منبعی است که کامپایلر نمی‌تواند شکل واقعی‌اش را ببیند. `as` روی پاسخ API یک ادعای بی‌پشتوانه است؛ zod همان ادعا را به بررسی واقعی تبدیل می‌کند.',
    },
    lab: {
      task: 'تابعی بنویس که یک `unknown` از JSON بگیرد و با گارد دستی به یک تایپ امن تبدیل کند (بدون `as`).',
      starter: `type Config = { theme: 'dark' | 'light'; fontSize: number };

function parseConfig(input: unknown): Config | null {
  if (typeof input !== 'object' || input === null) return null;
  const candidate = input as Record<string, unknown>;
  if (candidate.theme !== 'dark' && candidate.theme !== 'light') return null;
  if (typeof candidate.fontSize !== 'number') return null;
  return { theme: candidate.theme, fontSize: candidate.fontSize };
}

const safe = parseConfig(JSON.parse('{"theme":"dark","fontSize":16}'));
console.log(safe);`,
    },
  },

  {
    id: 'ts-js-interop',
    chapter: 'ch1',
    titleFa: 'تعامل TypeScript و JavaScript',
    titleEn: 'TS and JS Interoperability',
    level: 'beginner',
    minutes: 35,
    goal: 'یاد بگیری چطور کد JavaScript موجود را بدون بازنویسی، تایپ‌دار کنی و چطور مهاجرت تدریجی انجام دهی.',
    steps: [
      {
        h: 'گام ۱ — `allowJs` و `checkJs`',
        p: 'با `allowJs: true` فایل‌های `.js` کنار `.ts` کامپایل می‌شوند. با `checkJs: true` همان فایل‌های JS هم type-check می‌شوند — این قوی‌ترین ابزار مهاجرت تدریجی است.',
      },
      {
        h: 'گام ۲ — JSDoc: تایپ‌گذاری بدون تغییر پسوند',
        p: 'می‌توانی در همان فایل `.js` با کامنت‌های JSDoc تایپ بدهی و با `checkJs` همان سطح امنیت TypeScript را بگیری.',
        code: `// legacy/calculator.js  — بدون تبدیل به .ts کاملاً تایپ‌دار شد
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
  return a + b;
}`,
      },
      {
        h: 'گام ۳ — فایل‌های `.d.ts` و پکیج‌های `@types/*`',
        p: 'برای کتابخانه‌های بدون تایپ، یک فایل Declaration می‌سازی. برای کتابخانه‌های معروف، معمولاً `@types/<name>` در DefinitelyTyped وجود دارد و باید به‌عنوان devDependency نصب شود.',
        code: `// types/legacy-lib.d.ts
declare module 'legacy-lib' {
  export function doThing(input: string): { ok: boolean };
}`,
      },
      {
        h: 'گام ۴ — نقشه‌ی راه مهاجرت تدریجی (۵ مرحله)',
        p: '۱) `allowJs: true` بدون strict ۲) افزودن `.d.ts` برای مرزها ۳) فعال‌کردن `strictNullChecks` ۴) تبدیل فایل‌های هسته به `.ts` ۵) فعال‌کردن `strict: true` کامل و حذف `any`های باقی‌مانده.',
      },
    ],
    visual: 'interop',
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'مهاجرت از برگ به ریشه',
        body: 'در یک کدبیس بزرگ، از **لبه‌ها** شروع کن (utils، helpers) نه از هسته. لبه‌ها وابستگی کمی دارند و خطاهایشان محدود است؛ وقتی اعتماد به نفس گرفتی، به سمت مدل‌های دامنه برو.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قانون «بدون `any` جدید»',
        body: 'هنگام مهاجرت، ممکن است وسوسه شوی همه‌جا `any` بگذاری تا کامپایلر ساکت شود. این کار بدهی فنی را **بدتر** می‌کند. به‌جایش `unknown` بگذار و یک `TODO:` با نام خودت اضافه کن تا قابل جست‌وجو باشد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳',
        title: 'قانون ۱٪ مهاجرت',
        body: 'روزی فقط ۱٪ از فایل‌ها را مهاجرت کن. با روزی ۵ ساعت، یک کدبیس ۵۰۰ فایله در حدود ۱۰ روز کاری کامل مهاجرت می‌شود — بدون هیچ روز پرفشار و بدون شکستن CI.',
      },
    ],
    quiz: {
      q: 'برای type-check کردن فایل‌های `.js` موجود بدون تغییر پسوندشان، کدام ترکیب درست است؟',
      options: [
        '`allowJs: true` همراه با `checkJs: true`',
        'فقط `strict: true`',
        '`declaration: true`',
        '`isolatedModules: true`',
      ],
      answer: 0,
      explain:
        '`allowJs` فایل‌های JS را وارد گراف کامپایل می‌کند و `checkJs` بررسی تایپ را رویشان روشن می‌کند. بدون `allowJs`، گزینه‌ی `checkJs` اثری ندارد.',
    },
    lab: {
      task: 'یک ماژول بدون تایپ را با `declare module` تعریف کن و از آن با تایپ امن استفاده کن.',
      starter: `// ⚠️ declare module فقط در فایلی که «ماژول» نباشد یک Ambient Module می‌سازد.
// اگر همین فایل import/export واقعی داشته باشد، عبارت تبدیل به
// Module Augmentation می‌شود و چون ماژول واقعی وجود ندارد، TS2664 می‌دهد.
// در پروژه‌ی واقعی این بلوک را در یک فایل جدا مثل types/old-analytics.d.ts
// می‌گذاری و با /// <reference path> یا include به tsconfig معرفی‌اش می‌کنی.
declare module 'old-analytics' {
  export function track(event: string, payload?: Record<string, unknown>): void;
}

// حالا «نوع» آن ماژول در دسترس ماست. typeof import(...) فقط تایپ را
// می‌گیرد و در خروجی JavaScript پاک می‌شود؛ پس هیچ بارگذاری واقعی رخ
// نمی‌دهد و کد هم در مرورگر و هم در آزمایشگاه زنده قابل اجرا می‌ماند.
type Analytics = typeof import('old-analytics');

const track: Analytics['track'] = (event, payload) => {
  console.log('track →', event, payload);
};

track('lesson_completed', { lessonId: 'ts-js-interop' });
console.log('tracked');`,
    },
  },

  {
    id: 'install-config',
    chapter: 'ch1',
    titleFa: 'نصب و پیکربندی',
    titleEn: 'Installation and Configuration',
    level: 'beginner',
    minutes: 30,
    goal: 'یک پروژه‌ی TypeScript استاندارد از صفر بسازی و بدانی هر ابزار دقیقاً چه نقشی دارد.',
    steps: [
      {
        h: 'گام ۱ — نصب محلی نه سراسری',
        p: 'همیشه TypeScript را به‌صورت devDependency محلی نصب کن تا همه‌ی اعضای تیم و CI دقیقاً یک نسخه داشته باشند.',
        code: `mkdir ts-studio && cd ts-studio
npm init -y
npm install --save-dev typescript
npx tsc --init          # ساخت tsconfig.json
npx tsc --version       # Version 5.9.3`,
      },
      {
        h: 'گام ۲ — ساختار پوشه‌ی استاندارد',
        p: '`src/` برای کد منبع، `dist/` برای خروجی کامپایل، `types/` برای فایل‌های `.d.ts` سفارشی. `dist/` و `node_modules/` باید در `.gitignore` باشند.',
      },
      {
        h: 'گام ۳ — اسکریپت‌های `package.json`',
        p: 'سه اسکریپت کافی است تا یک گردش کار حرفه‌ای داشته باشی: `build`، `dev` (watch) و `typecheck` (بدون خروجی).',
        code: `{
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w",
    "typecheck": "tsc --noEmit"
  }
}`,
      },
    ],
    visual: 'folders',
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'نسخه‌ی کامپایلر را قفل کن',
        body: 'در `package.json` از `"typescript": "5.9.3"` (بدون `^`) استفاده کن. یک نسخه‌ی جدید minor می‌تواند خطاهای جدیدی تولید کند که CI تیم را بشکند. ارتقا را یک کار آگاهانه و زمان‌بندی‌شده کن، نه یک تصادف.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'هر بار از صفر بساز',
        body: 'حداقل ۳ بار یک پروژه‌ی خالی TS بساز (بدون نگاه‌کردن به یادداشت). ساختن scaffold به حافظه‌ی عضلانی تبدیل می‌شود و در مصاحبه‌های عملی و شروع پروژه‌های جدید، ثانیه‌ها را نجات می‌دهد.',
      },
    ],
    quiz: {
      q: 'چرا نصب TypeScript به‌صورت devDependency محلی بر نصب سراسری (`npm i -g`) ترجیح داده می‌شود؟',
      options: [
        'تا همه‌ی اعضای تیم و CI دقیقاً از یک نسخه‌ی کامپایلر استفاده کنند',
        'چون نصب سراسری کندتر است',
        'چون نصب محلی حجم کمتری دارد',
        'چون نسخه‌ی سراسری strict را پشتیبانی نمی‌کند',
      ],
      answer: 0,
      explain:
        'نسخه‌ی کامپایلر مستقیماً روی مجموعه‌ی خطاها اثر می‌گذارد. «روی دستگاه من کار می‌کند» در پروژه‌های TS معمولاً به تفاوت نسخه‌ی tsc برمی‌گردد.',
    },
    lab: {
      task: 'یک تایپ برای پیکربندی پروژه بساز و یک نمونه‌ی معتبر از آن تعریف کن.',
      starter: `type ProjectScaffold = {
  readonly srcDir: string;
  readonly outDir: string;
  readonly tsVersion: string;
  readonly scripts: readonly string[];
};

const scaffold: ProjectScaffold = {
  srcDir: 'src',
  outDir: 'dist',
  tsVersion: '5.9.3',
  scripts: ['build', 'dev', 'typecheck'],
};

console.log(scaffold.scripts.join(' | '));`,
    },
  },

  {
    id: 'tsconfig-json',
    chapter: 'ch1',
    titleFa: 'فایل tsconfig.json',
    titleEn: 'tsconfig.json',
    level: 'beginner',
    minutes: 40,
    goal: 'تسلط بر ساختار tsconfig و توانایی خواندن/نوشتن یک پیکربندی حرفه‌ای برای پروژه‌ی واقعی.',
    steps: [
      {
        h: 'گام ۱ — سه بخش اصلی tsconfig',
        p: 'یک tsconfig از سه بخش تشکیل شده: `compilerOptions` (چطور کامپایل شود)، `include`/`exclude` (چه فایل‌هایی)، و `references` (پروژه‌های مرکب).',
        code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`,
      },
      {
        h: 'گام ۲ — `target` در برابر `lib` (مهم‌ترین تفاوت گیج‌کننده)',
        p: '`target` تعیین می‌کند خروجی به چه نسخه‌ای از JavaScript **ترجمه** شود (Downlevel). `lib` تعیین می‌کند چه APIهایی در محیط **موجود فرض** شوند. می‌توانی `target: ES2020` با `lib: ["ES2022", "DOM"]` داشته باشی.',
      },
      {
        h: 'گام ۳ — `module` و `moduleResolution` باید با هم بخوانند',
        p: 'برای Node مدرن: `"module": "NodeNext"` + `"moduleResolution": "NodeNext"`. برای باندلرها (Vite/webpack): `"module": "ESNext"` + `"moduleResolution": "Bundler"`. ترکیب ناسازگار، منبع بیشتر خطاهای عجیب `Cannot find module` است.',
      },
      {
        h: 'گام ۴ — `extends` و اشتراک پیکربندی (DRY)',
        p: 'در مونورپو، یک `tsconfig.base.json` بساز و در هر پکیج فقط تفاوت‌ها را override کن. این دقیقاً اصل DRY در پیکربندی است.',
        code: `// packages/api/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}`,
      },
    ],
    visual: 'tsconfig',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴',
        title: 'فرمول پیکربندی حداقل-بیشینه',
        body: 'پیکربندی خوب = **حداقل گزینه‌های لازم** + **حداکثر سخت‌گیری ممکن**. هر گزینه‌ای که بدون دلیل اضافه کنی، یک نقطه‌ی شکست آینده است؛ هر flag سخت‌گیرانه‌ای که خاموش بگذاری، یک دسته باگ بازمانده.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'هیچ گزینه‌ای بدون کامنت دلیل',
        body: 'JSON کامنت نمی‌پذیرد، ولی tsconfig می‌پذیرد (JSONC). بالای هر گزینه‌ی غیربدیهی یک خط توضیح بگذار: `// خروجی .d.ts برای انتشار پکیج لازم است`. شش ماه بعد، خودت از خودت تشکر می‌کنی.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`skipLibCheck: true` یعنی نادیده‌گرفتن خطاهای پکیج‌ها',
        body: 'این flag سرعت کامپایل را زیاد می‌کند و تقریباً همیشه توصیه می‌شود، اما بدان که خطاهای داخل `.d.ts` پکیج‌ها را **پنهان** می‌کند. اگر رفتار عجیبی از یک پکیج دیدی، موقتاً خاموشش کن.',
      },
    ],
    quiz: {
      q: 'تفاوت `target` و `lib` در tsconfig چیست؟',
      options: [
        '`target` نسخه‌ی JavaScript خروجی را تعیین می‌کند، `lib` تایپ‌های APIهای موجود را',
        '`target` فقط برای مرورگر است و `lib` فقط برای Node',
        'هر دو یک چیز هستند و یکی دیگری را override می‌کند',
        '`lib` نسخه‌ی خروجی و `target` مسیر فایل‌ها را تعیین می‌کند',
      ],
      answer: 0,
      explain:
        '`target` سینتکس خروجی را Downlevel می‌کند؛ `lib` فقط دکلاریشن تایپ‌های محیطی (مثل `Promise`، `fetch`، DOM) را در دسترس کامپایلر می‌گذارد بدون اینکه خروجی را تغییر دهد.',
    },
    lab: {
      task: 'تایپ یک tsconfig را مدل‌سازی کن و یک نمونه‌ی معتبر با `satisfies` بساز.',
      starter: `type CompilerOptions = {
  readonly target: 'ES2020' | 'ES2022' | 'ESNext';
  readonly strict: boolean;
  readonly outDir: string;
  readonly rootDir?: string;
};

type TsConfig = {
  readonly compilerOptions: CompilerOptions;
  readonly include: readonly string[];
};

const config = {
  compilerOptions: { target: 'ES2022', strict: true, outDir: 'dist', rootDir: 'src' },
  include: ['src/**/*.ts'],
} satisfies TsConfig;

console.log(config.compilerOptions.target);`,
    },
  },

  {
    id: 'compiler-options',
    chapter: 'ch1',
    titleFa: 'گزینه‌های کامپایلر',
    titleEn: 'Compiler Options',
    level: 'intermediate',
    minutes: 45,
    goal: 'پرچم‌های سخت‌گیرانه‌ی کلیدی را بشناسی و بدانی هرکدام چه دسته‌ای از باگ را شکار می‌کند.',
    steps: [
      {
        h: 'گام ۱ — `strict` یک «چتر» است، نه یک گزینه',
        p: '`strict: true` هفت پرچم را با هم روشن می‌کند: `noImplicitAny`، `strictNullChecks`، `strictFunctionTypes`، `strictBindCallApply`، `strictPropertyInitialization`، `noImplicitThis`، `alwaysStrict` (و در نسخه‌های جدید `useUnknownInCatchVariables`).',
      },
      {
        h: 'گام ۲ — سه پرچمی که حتی در `strict` نیستند و باید دستی روشن کنی',
        p: '`noUncheckedIndexedAccess`، `exactOptionalPropertyTypes`، `noImplicitOverride`. این سه، ظریف‌ترین باگ‌های واقعی را می‌گیرند.',
        code: `{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   // arr[0] می‌شود T | undefined
    "exactOptionalPropertyTypes": true, // { a?: string } اجازه‌ی a: undefined نمی‌دهد
    "noImplicitOverride": true,         // متد بازنویسی‌شده باید override داشته باشد
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}`,
      },
      {
        h: 'گام ۳ — اثر واقعی `noUncheckedIndexedAccess`',
        p: 'بدون این flag، `arr[99]` از نظر تایپ `T` است در حالی که در زمان اجرا `undefined` است — یک دروغ سیستماتیک. با این flag، تایپ به `T | undefined` تبدیل می‌شود و مجبور به بررسی می‌شوی.',
        code: `const scores = [18, 19, 20];

// با noUncheckedIndexedAccess:
const first = scores[0];      // number | undefined
// console.log(first.toFixed(1));   // ❌ TS18048
console.log(first?.toFixed(1));     // ✅ "18.0"`,
      },
      {
        h: 'گام ۴ — گزینه‌های مربوط به ماژول و Interop',
        p: '`esModuleInterop` برای import پیش‌فرض پکیج‌های CommonJS، `verbatimModuleSyntax` برای صریح‌کردن `import type`، و `isolatedModules` برای سازگاری با ترنسپایلرهای تک‌فایلی مثل esbuild.',
      },
    ],
    visual: 'flags',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵',
        title: 'فرمول سخت‌گیری فزاینده',
        body: 'هرچه زودتر سخت‌گیری را بالا ببری، هزینه کمتر است. هزینه‌ی افزودن `strict` به پروژه‌ی ۱۰۰۰ خطی یک ساعت است؛ به پروژه‌ی ۱۰۰٬۰۰۰ خطی، یک ماه. **قانون: سخت‌گیری فقط باید افزایش یابد، هرگز کاهش.**',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پرچم‌ها را در CI قفل کن',
        body: 'یک تست ساده بنویس که خروجی `tsc --showConfig` را با یک Snapshot مقایسه کند. این‌گونه هیچ‌کس نمی‌تواند یواشکی یک flag را خاموش کند تا خطای خودش را پنهان کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`noUnusedLocals` در کد در حال توسعه',
        body: 'این flag هنگام TDD و نوشتن کد مرحله‌به‌مرحله آزاردهنده است (متغیری که هنوز استفاده نشده). بسیاری تیم‌ها آن را فقط در CI روشن می‌کنند نه در `tsconfig` اصلی توسعه.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: '«چه پرچم‌هایی فراتر از strict روشن می‌کنی؟»',
        body: 'پاسخ حرفه‌ای: «`noUncheckedIndexedAccess` چون ایندکس‌زدن در JS واقعاً می‌تواند undefined برگرداند، `exactOptionalPropertyTypes` برای تفکیک «نبود کلید» از «کلید با مقدار undefined»، و `noImplicitOverride` تا تغییر نام متد در کلاس پایه، بی‌صدا کلاس فرزند را نشکند.»',
      },
    ],
    quiz: {
      q: 'با فعال بودن `noUncheckedIndexedAccess`، تایپ `arr[0]` روی یک `number[]` چیست؟',
      options: ['`number | undefined`', '`number`', '`undefined`', '`any`'],
      answer: 0,
      explain:
        'این flag هر دسترسی ایندکسی را بالقوه تهی می‌داند چون در زمان اجرا ممکن است آن ایندکس وجود نداشته باشد. در نتیجه مجبور به `?.` یا بررسی صریح می‌شوی.',
    },
    lab: {
      task: 'تابعی بنویس که با دسترسی ایندکسی امن کار کند و در صورت نبود مقدار، یک مقدار پیش‌فرض برگرداند.',
      starter: `function safeAt<T>(list: readonly T[], index: number, fallback: T): T {
  const value = list[index];
  return value === undefined ? fallback : value;
}

const hours = [5, 4, 5, 3];
console.log(safeAt(hours, 1, 0));   // 4
console.log(safeAt(hours, 99, 0));  // 0`,
    },
  },

  {
    id: 'running-ts',
    chapter: 'ch1',
    titleFa: 'اجرای TypeScript',
    titleEn: 'Running TypeScript',
    level: 'beginner',
    minutes: 30,
    goal: 'چهار روش اجرای کد TS را بشناسی و بدانی هرکدام در چه مرحله‌ای از چرخه‌ی توسعه استفاده می‌شود.',
    steps: [
      {
        h: 'گام ۱ — مدل کلی: TypeScript هیچ‌وقت مستقیم اجرا نمی‌شود',
        p: 'Node و مرورگر فقط JavaScript می‌فهمند. پس همیشه یک مرحله‌ی **ترنسپایل** لازم است. چهار مسیر وجود دارد: کامپایل با `tsc`، اجرا با `ts-node`/`tsx`، اجرا با `node --experimental-strip-types` (نسخه‌های جدید)، و باندل با ابزارهایی مثل esbuild/Vite.',
      },
      {
        h: 'گام ۲ — مسیر رسمی: کامپایل سپس اجرا',
        p: 'این تنها مسیری است که type checking کامل انجام می‌دهد و برای پروداکشن توصیه می‌شود.',
        code: `npx tsc -p tsconfig.json     # src/*.ts → dist/*.js
node dist/index.js

# یا در یک خط:
npm run build && npm start`,
      },
      {
        h: 'گام ۳ — مسیر توسعه: watch mode',
        p: 'در حین توسعه، `tsc -w` به‌صورت پیوسته کامپایل می‌کند و فقط خطاها را نشان می‌دهد. ترکیب آن با `node --watch` یک حلقه‌ی توسعه‌ی کاملاً خودکار می‌سازد.',
      },
      {
        h: 'گام ۴ — تفاوت حیاتی Transpile-only در برابر Full-check',
        p: '`tsx` و `ts-node --swc` فقط تایپ‌ها را پاک می‌کنند و **هیچ خطای تایپی نمی‌دهند**. این سریع است ولی می‌تواند کد ناسالم را اجرا کند. پس در CI همیشه یک `tsc --noEmit` جداگانه لازم است.',
      },
    ],
    visual: 'pipeline',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶',
        title: 'فرمول حلقه‌ی بازخورد سریع',
        body: 'سرعت یادگیری = تعداد چرخه‌های «ویرایش → اجرا → دیدن نتیجه» در ساعت. اگر هر چرخه ۳۰ ثانیه طول بکشد، در ۵ ساعت فقط ۶۰۰ چرخه داری؛ اگر ۳ ثانیه باشد، ۶۰۰۰ چرخه. **ابزارت را برای کوتاه‌کردن این حلقه بهینه کن.**',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'اول typecheck، بعد اجرا',
        body: 'عادت کن قبل از اجرای هر قطعه کد، `tsc --noEmit` بزنی و خطاها را بخوانی. خواندن خطای تایپ بدون اجرای کد، مهارت «پیش‌بینی رفتار» را می‌سازد — همان مهارتی که یک Senior را از Junior جدا می‌کند.',
      },
    ],
    quiz: {
      q: 'چرا اجرای کد با `tsx` به‌تنهایی برای اطمینان از صحت تایپ‌ها کافی نیست؟',
      options: [
        'چون tsx فقط ترنسپایل می‌کند و هیچ type checking انجام نمی‌دهد',
        'چون tsx خروجی را فشرده می‌کند',
        'چون tsx فقط در مرورگر کار می‌کند',
        'چون tsx نسخه‌ی قدیمی TypeScript را دارد',
      ],
      answer: 0,
      explain:
        'ترنسپایلرهای transpile-only (esbuild/tsx/SWC) برای سرعت، تایپ‌ها را بدون بررسی پاک می‌کنند. بررسی صحت فقط کار خود `tsc` است.',
    },
    lab: {
      task: 'یک «شبیه‌ساز خط لوله‌ی اجرا» بنویس: آرایه‌ای از مراحل با نام و زمان، و چاپ گزارش نهایی.',
      starter: `type PipelineStep = { readonly name: string; readonly ms: number };

const pipeline: readonly PipelineStep[] = [
  { name: 'typecheck', ms: 420 },
  { name: 'transpile', ms: 90 },
  { name: 'run', ms: 15 },
];

const total = pipeline.reduce((sum, step) => sum + step.ms, 0);
console.log(\`کل زمان: \${total}ms\`);
console.log(pipeline.map((s) => \`\${s.name}(\${s.ms})\`).join(' → '));`,
    },
  },

  {
    id: 'tsc-cli',
    chapter: 'ch1',
    titleFa: 'خط فرمان `tsc`',
    titleEn: 'tsc',
    level: 'intermediate',
    minutes: 35,
    goal: 'تسلط بر پرچم‌های کاربردی CLI و توانایی دیباگ پیکربندی از خط فرمان.',
    steps: [
      {
        h: 'گام ۱ — پرچم‌هایی که هر روز استفاده می‌کنی',
        p: '`--noEmit` (فقط بررسی)، `-w` (watch)، `-p <path>` (پروژه)، `--init` (ساخت tsconfig)، `--version`.',
        code: `npx tsc --noEmit              # بررسی بدون تولید فایل (CI)
npx tsc -w                    # کامپایل پیوسته
npx tsc -p tsconfig.build.json
npx tsc --init                # ساخت tsconfig با کامنت‌های راهنما`,
      },
      {
        h: 'گام ۲ — دو پرچم دیباگ طلایی: `--showConfig` و `--explainFiles`',
        p: '`--showConfig` پیکربندی **نهایی** پس از اعمال `extends` را چاپ می‌کند (برای فهمیدن اینکه واقعاً چه چیزی فعال است). `--explainFiles` دلیل وارد شدن هر فایل به برنامه را توضیح می‌دهد.',
      },
      {
        h: 'گام ۳ — override کردن tsconfig از خط فرمان',
        p: 'می‌توانی هر گزینه را موقتاً override کنی. نکته‌ی مهم: وقتی نام فایل مستقیم به `tsc` بدهی، tsconfig **نادیده گرفته می‌شود**.',
        code: `npx tsc src/index.ts --target ES2022 --strict --outDir tmp
# ⚠️ در این حالت tsconfig.json کاملاً نادیده گرفته می‌شود!`,
      },
      {
        h: 'گام ۴ — خواندن خروجی خطا به شکل حرفه‌ای',
        p: 'هر خطای tsc چهار بخش دارد: فایل، موقعیت (خط،ستون)، کد خطا (TS2322)، و پیام. **همیشه از کد خطا شروع کن**؛ جست‌وجوی `TS2322` در داکیومنت رسمی، سریع‌ترین راه فهم ریشه است.',
      },
    ],
    visual: 'terminal',
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «خواندن خطا از پایین به بالا»',
        body: 'وقتی چند خطا پشت هم می‌بینی، از **آخرین و عمیق‌ترین** شروع کن. خطاهای زنجیره‌ای معمولاً از یک ریشه آب می‌خورند و با رفع ریشه، بقیه خودبه‌خود ناپدید می‌شوند.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'یک اسکریپت، یک مسئولیت',
        body: 'در `package.json` اسکریپت‌ها را تفکیک کن: `typecheck` (بدون خروجی)، `build` (با خروجی)، `dev` (watch). هرگز `build` را در CI برای بررسی تایپ استفاده نکن؛ کندتر است و آرتیفکت بی‌مصرف می‌سازد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷',
        title: 'فرمول «CI سریع = بازخورد سریع = کیفیت بالا»',
        body: 'اگر CI بیش از ۱۰ دقیقه طول بکشد، توسعه‌دهنده‌ها قبل از push اجرا کردن آن را متوقف می‌کنند. `tsc --noEmit` موازی (با Project References) زمان بررسی را تا چند برابر کاهش می‌دهد.',
      },
    ],
    quiz: {
      q: 'کدام فرمان پیکربندی نهایی اعمال‌شده (پس از `extends`) را چاپ می‌کند؟',
      options: ['`tsc --showConfig`', '`tsc --explainFiles`', '`tsc --init`', '`tsc --diagnostics`'],
      answer: 0,
      explain:
        '`--showConfig` پیکربندی مؤثر نهایی را بدون کامپایل چاپ می‌کند. `--explainFiles` دلیل حضور هر فایل در گراف کامپایل را توضیح می‌دهد.',
    },
    lab: {
      task: 'یک آبجکت از «پرچم‌های CLI» بساز و با Generic، فقط نام پرچم‌ها را استخراج کن.',
      starter: `type CliFlag = { readonly flag: string; readonly description: string };

const flags: readonly CliFlag[] = [
  { flag: '--noEmit', description: 'typecheck without output' },
  { flag: '--showConfig', description: 'print effective config' },
  { flag: '--explainFiles', description: 'why is this file included' },
];

const names = flags.map((f) => f.flag);
console.log(names.join(' '));`,
    },
  },

  {
    id: 'ts-node-runners',
    chapter: 'ch1',
    titleFa: 'اجراکننده‌های سریع (ts-node و tsx)',
    titleEn: 'ts-node / tsx',
    level: 'intermediate',
    minutes: 30,
    goal: 'تفاوت ts-node، tsx و strip-types بومی Node را بدانی و ابزار درست را برای هر سناریو انتخاب کنی.',
    steps: [
      {
        h: 'گام ۱ — `ts-node`: قدیمی و کامل',
        p: 'به‌صورت پیش‌فرض type checking کامل می‌کند (کند اما امن). با `ts-node --swc` یا `TS_NODE_TRANSPILE_ONLY=1` سریع ولی بی‌بررسی می‌شود. برای اسکریپت‌های Node عالی است.',
      },
      {
        h: 'گام ۲ — `tsx`: استاندارد امروزی',
        p: 'بر پایه‌ی esbuild، فوق‌العاده سریع، بدون نیاز به پیکربندی، پشتیبانی از ESM و CJS هم‌زمان، و دارای watch داخلی. امروز برای توسعه‌ی محلی، انتخاب اول بیشتر تیم‌هاست.',
        code: `npm i -D tsx

npx tsx src/index.ts          # اجرای مستقیم
npx tsx watch src/index.ts    # با reload خودکار
npx tsx --tsconfig tsconfig.dev.json src/index.ts`,
      },
      {
        h: 'گام ۳ — Node بومی: `--experimental-strip-types`',
        p: 'از Node 22.6 به بعد می‌توان فایل‌های `.ts` را مستقیم اجرا کرد (Node 23+ به‌صورت پیش‌فرض). محدودیت مهم: سینتکسی که نیاز به **تولید کد** دارد (`enum`، `namespace`، parameter properties) پشتیبانی نمی‌شود؛ چون فقط تایپ‌ها پاک می‌شوند.',
      },
      {
        h: 'گام ۴ — انتخاب ابزار بر اساس سناریو',
        p: 'پروداکشن → `tsc` و اجرای `dist`. توسعه‌ی محلی → `tsx watch`. اسکریپت Node با بررسی کامل → `ts-node`. CI → `tsc --noEmit`. REPL سریع → `tsx` بدون آرگومان.',
      },
    ],
    visual: 'runners',
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`enum` و `namespace` در محیط strip-types می‌شکنند',
        body: 'چون Node بومی و esbuild فقط تایپ‌ها را **پاک** می‌کنند و کد تولید نمی‌کنند، `enum` (که یک آبجکت زمان اجرا می‌سازد) کار نمی‌کند. راه‌حل مدرن: به‌جای `enum` از `const object` + union type استفاده کن.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'سبک «Erasable Syntax Only»',
        body: 'کدت را طوری بنویس که با حذف تایپ‌ها، بدون نیاز به تولید کد اجرا شود (پرچم `erasableSyntaxOnly` در TS 5.8+). یعنی: بدون `enum`، بدون `namespace`، بدون parameter properties، و `import type` صریح. این‌گونه کد تو با **هر** ترنسپایلری سازگار است.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۸',
        title: 'فرمول سازگاری ابزارها',
        body: 'هزینه‌ی تغییر ابزار build در آینده = میزان وابستگی کد تو به ویژگی‌های خاص ابزار فعلی. اگر کدت «Erasable» باشد، این هزینه تقریباً صفر است.',
      },
    ],
    quiz: {
      q: 'کدام ویژگی TypeScript در محیط «strip types» بومی Node پشتیبانی نمی‌شود؟',
      options: ['`enum`', 'type alias', 'interface', 'generic function'],
      answer: 0,
      explain:
        '`enum` در زمان کامپایل یک آبجکت واقعی JavaScript می‌سازد (تولید کد)، ولی strip-types فقط تایپ‌ها را حذف می‌کند. type/interface/generic کاملاً erasable هستند.',
    },
    lab: {
      task: 'یک جایگزین مدرن و Erasable برای `enum` بساز: `const object` + union type + تابع نگاشت معکوس.',
      starter: `const Status = {
  Idle: 'idle',
  Running: 'running',
  Done: 'done',
} as const;

type Status = (typeof Status)[keyof typeof Status];

const labels: Record<Status, string> = {
  idle: 'در انتظار',
  running: 'در حال اجرا',
  done: 'تکمیل شد',
};

const current: Status = Status.Running;
console.log(labels[current]);`,
    },
  },

  {
    id: 'ts-playground',
    chapter: 'ch1',
    titleFa: 'زمین بازی TypeScript',
    titleEn: 'TS Playground',
    level: 'beginner',
    minutes: 25,
    goal: 'ابزارهای کاوش تایپ را بشناسی و تکنیک `^?` را به عادت روزانه تبدیل کنی.',
    steps: [
      {
        h: 'گام ۱ — تکنیک `^?` (مهم‌ترین ابزار این درس)',
        p: 'در VS Code و Playground، اگر در خط بعد یک عبارت `//    ^?` بنویسی، تایپ استنتاج‌شده **دقیقاً در همان نقطه** چاپ می‌شود. این برای فهم تایپ‌های پیچیده‌ی شرطی و mapped حیاتی است.',
        code: `const config = { mode: 'strict', hours: 5 };
//    ^?  → const config: { mode: string; hours: number }

const frozen = { mode: 'strict', hours: 5 } as const;
//    ^?  → const frozen: { readonly mode: "strict"; readonly hours: 5 }

type Keys = keyof typeof frozen;
//   ^?  → type Keys = "mode" | "hours"`,
      },
      {
        h: 'گام ۲ — ابزارهای VS Code برای دیدن تایپ',
        p: 'Hover (نشانگر روی عبارت)، `Go to Type Definition`، `Inlay Hints` (نمایش تایپ‌های استنتاجی داخل متن)، و `Select for Type Query`.',
      },
      {
        h: 'گام ۳ — Twoslash: مستندسازی زنده',
        p: 'با کامنت‌های `// @errors: 2322`، `// @log`، `// @showEmit` و `// ---cut---` می‌توانی مثال‌های آموزشی بسازی که **خودشان کامپایل می‌شوند**. داکیومنت رسمی TypeScript با همین تکنیک نوشته شده.',
      },
      {
        h: 'گام ۴ — اشتراک‌گذاری و دیباگ از راه دور',
        p: 'Playground یک URL کوتاه برای کد تو می‌سازد. این بهترین راه پرسیدن سؤال در Stack Overflow یا Discord است: به‌جای چسباندن کد، لینک Playground بفرست تا طرف مقابل همان نسخه‌ی کامپایلر و تنظیمات را ببیند.',
      },
    ],
    visual: 'playground',
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «اول حدس بزن، بعد `^?`»',
        body: 'قبل از اینکه hover کنی، تایپ را **روی کاغذ حدس بزن** و بعد بررسی کن. این یک Active Recall واقعی است. حدس زدن بدون تأیید، توهم یادگیری می‌سازد؛ حدس زدن با تأیید فوری، قوی‌ترین شکل یادگیری است.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۹',
        title: 'فرمول «بازخورد فوری»',
        body: 'یادگیری = تمرین + بازخورد فوری + تصحیح. بدون بازخورد، تمرین فقط اشتباه را تقویت می‌کند. ابزارهایی مثل `^?`، Playground و همین استودیو، تأخیر بازخورد را به صفر می‌رسانند.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'مستندات را با مثال کامپایل‌شونده بنویس',
        body: 'هر مثال کد در README را داخل یک فایل `.ts` واقعی نگه دار و در CI کامپایل کن. مثال‌های کپی‌شده در Markdown به‌مرور می‌پوسند و خواننده را گمراه می‌کنند.',
      },
    ],
    quiz: {
      q: 'کامنت `// ^?` چه کاربردی دارد؟',
      options: [
        'نمایش تایپ استنتاج‌شده‌ی عبارت خط بالایی در همان نقطه',
        'سرکوب خطای تایپی خط بالایی',
        'تبدیل کد به JavaScript',
        'اجرای تست روی عبارت',
      ],
      answer: 0,
      explain:
        '`^?` یک Type Query است (از Twoslash) که کامپایلر را وادار می‌کند تایپ واقعی آن نقطه را چاپ کند. در VS Code با فرمان "Select for Type Query" هم در دسترس است.',
    },
    lab: {
      task: 'با استفاده از `^?` (ستون Type X-Ray همین استودیو همان کار را می‌کند) تایپ نهایی هر سه عبارت زیر را پیش‌بینی کن و بعد اجرا کن.',
      starter: `const a = [1, 2, 3];
const b = [1, 2, 3] as const;
const c = { list: [1, 2, 3] };

// پیش‌بینی کن: تایپ a، b و c.list چیست؟

console.log(typeof a, typeof b, typeof c);`,
    },
  },
];
