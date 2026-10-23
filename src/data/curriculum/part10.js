/* ==========================================================================
   فصل ۱۳ — ماژول‌ها  +  فصل ۱۴ — اکوسیستم
   (Modules · Namespaces · Ambient · External · Namespace/Global Augmentation
    · Ecosystem · Formatting · Linting · Useful Packages · Build Tools)
   ========================================================================== */

export const PART10_LESSONS = [
  {
    id: 'ts-modules',
    chapter: 'ch13',
    titleFa: 'ماژول‌های TypeScript — نگرش کلی',
    titleEn: 'TypeScript Modules',
    level: 'intermediate',
    minutes: 35,
    goal: 'مدل ماژول در TypeScript را بفهمی و تفاوت ESM، CommonJS و تنظیمات مربوطه را مسلط شوی.',
    steps: [
      {
        h: 'گام ۱ — یک فایل = یک ماژول',
        p:
          'هر فایل `.ts` که حداقل یک `import` یا `export` سطح‌بالا دارد، یک **ماژول** است و اسکوپ اختصاصی دارد. فایلی بدون import/export یک **اسکریپت سراسری** است و همه‌ی متغیرهایش در اسکوپ جهانی قرار می‌گیرند (منبع تداخل نام).',
        code: `// ❌ اسکریپت سراسری (بدون import/export) — نام‌ها جهانی می‌شوند
// const config = {};  // در همه‌جا دیده می‌شود!

// ✅ ماژول:
export const config = { theme: 'dark' };
export type Theme = 'dark' | 'light';

import type { Theme as T } from './ts-modules.js';
console.log(config.theme, typeof (undefined as unknown as T));`,
      },
      {
        h: 'گام ۲ — ESM در برابر CommonJS',
        p:
          'دو سیستم ماژول در دنیای Node وجود دارد: ESM (`import`/`export`، ایستا، استاندارد آینده) و CommonJS (`require`، پویا، قدیمی). تنظیمات `module` و `moduleResolution` باید با هدف تو بخوانند.',
        code: `// ESM (پیش‌فرض مدرن):
// import { x } from './mod.js';  export const y = 1;

// CommonJS (قدیمی):
// const { x } = require('./mod');  module.exports = { y: 1 };

// پیکربندی سازگار:
const configs = {
  nodeEsm: { module: 'NodeNext', moduleResolution: 'NodeNext', type: 'module' },
  bundler: { module: 'ESNext', moduleResolution: 'Bundler' },
  legacyCjs: { module: 'CommonJS', moduleResolution: 'Node10' },
} as const;

console.log(Object.keys(configs).join(', '));`,
      },
      {
        h: 'گام ۳ — `import type` و `verbatimModuleSyntax`',
        p:
          'چون تایپ‌ها در زمان اجرا وجود ندارند، وارد کردنشان با `import` معمولی می‌تواند یک import زمان‌اجرای بی‌فایده تولید کند. `import type` صریحاً می‌گوید «این فقط تایپ است» و در خروجی حذف می‌شود.',
        code: `export type User = { readonly id: string; readonly name: string };
export const DEFAULT_USER: User = { id: '0', name: 'ناشناس' };

// در فایل مصرف‌کننده:
// import type { User } from './users.js';      // ✅ حذف می‌شود در خروجی
// import { DEFAULT_USER } from './users.js';   // ✅ import واقعی

type Local = { ok: boolean };
const local: Local = { ok: true };
console.log(DEFAULT_USER.name, local.ok);`,
      },
      {
        h: 'گام ۴ — Re-export و ساختار barrel',
        p:
          'یک `index.ts` که همه‌ی exportهای یک پوشه را جمع می‌کند (barrel) مصرف را ساده می‌کند، ولی می‌تواند tree-shaking را بشکند و چرخه‌ی وابستگی بسازد. در کتابخانه‌های بزرگ، barrel را محدود نگه دار.',
        code: `// src/users/index.ts (barrel)
export type { User } from './types.js';
export { createUser, DEFAULT_USER } from './factory.js';
export * from './validators.js';

// مصرف‌کننده:
// import { createUser, type User } from './users/index.js';
console.log('barrel ready');`,
      },
      {
        h: 'گام ۵ — چرخه‌ی وابستگی (Circular Dependency)',
        p:
          'وقتی A از B و B از A import کند، در زمان اجرا ممکن است یکی از آن‌ها `undefined` باشد. TypeScript این را خطا نمی‌دهد. ابزارهای مثل `madge` یا `dpdm` برای شناسایی چرخه‌ها استفاده می‌شوند.',
      },
    ],
    visual: 'module-graph',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۴',
        title: 'فرمول «ماژول = مرز تصمیم»',
        body:
          'هر ماژول یک مرز است: چه چیزی export می‌شود (قرارداد عمومی) و چه چیزی داخلی می‌ماند (آزادی تغییر). هرچه سطح export کوچک‌تر باشد، آزادی تو برای تغییر داخلی بیشتر است. هدف: کمترین export ممکن برای هر فایل.',
        equation: 'آزادی تغییر ∝ ۱ ÷ (تعداد exportهای عمومی یک ماژول)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'همیشه `import type` صریح',
        body:
          'با `verbatimModuleSyntax: true` مجبور می‌شوی تایپ‌ها را با `import type` وارد کنی. این کار خروجی JS را تمیز، tree-shaking را دقیق و مرز بین «کد» و «تایپ» را شفاف می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'پسوند `.js` در import فایل‌های `.ts`',
        body:
          'با `module: "NodeNext"` باید `import { x } from "./mod.js"` بنویسی حتی اگر فایل `mod.ts` باشد! این یکی از گیج‌کننده‌ترین خطاهای TS2307 برای تازه‌کارهاست. دلیل: مسیر باید با خروجی واقعی بعد از کامپایل بخواند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت یک «ماژول» و یک «اسکریپت سراسری»',
        body:
          'پاسخ: «فایلی با حداقل یک import/export سطح‌بالا یک ماژول است و اسکوپ اختصاصی دارد. بدون آن، یک اسکریپت سراسری است و همه‌ی اعلان‌هایش به اسکوپ جهانی می‌روند — که باعث تداخل نام و خطاهای غیرمنتظره می‌شود.»',
      },
    ],
    quiz: {
      q: 'با `module: "NodeNext"` در یک پروژه‌ی ESM، import صحیح یک فایل محلی `utils.ts` کدام است؟',
      options: [
        '`import { x } from "./utils.js"`',
        '`import { x } from "./utils.ts"`',
        '`import { x } from "./utils"`',
        '`const { x } = require("./utils")`',
      ],
      answer: 0,
      explain:
        'در ESM مسیر باید به فایل **خروجی** اشاره کند که `.js` است. نوشتن `.ts` خطا می‌دهد و حذف پسوند هم در NodeNext برای ESM مجاز نیست.',
    },
    lab: {
      task: 'یک ماژول کوچک طراحی کن: تایپ‌ها را با `export type` و توابع را با `export` جدا کن و یک barrel بساز.',
      starter: `// --- types ---
export type Lesson = { readonly id: string; readonly title: string; readonly minutes: number };
export type LessonSummary = { readonly count: number; readonly totalMinutes: number };

// --- factory ---
export const DEFAULT_LESSON: Lesson = { id: 'default', title: 'بدون عنوان', minutes: 0 };

export function createLesson(title: string, minutes: number): Lesson {
  return { id: title.toLowerCase().replace(/\\s+/g, '-'), title, minutes };
}

// --- aggregator ---
export function summarize(lessons: readonly Lesson[]): LessonSummary {
  return {
    count: lessons.length,
    totalMinutes: lessons.reduce((sum, l) => sum + l.minutes, 0),
  };
}

const summary = summarize([createLesson('Modules', 35), DEFAULT_LESSON]);
console.log(summary);`,
      solution: `// index.ts
export type { Lesson, LessonSummary } from './types.js';
export { createLesson, summarize, DEFAULT_LESSON } from './factory.js';`,
    },
  },

  {
    id: 'namespaces',
    chapter: 'ch13',
    titleFa: 'Namespaces (فضای نام)',
    titleEn: 'Namespaces',
    level: 'intermediate',
    minutes: 25,
    goal: 'بفهمی namespace چیست، چرا امروز منسوخ شده و تنها کاربردهای باقی‌مانده‌اش را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — namespace چه بود و چه می‌کند',
        p:
          '`namespace` مکانیزم قدیمی TypeScript برای گروه‌بندی کد در یک اسکوپ نام بود (قبل از استاندارد شدن ES Modules). یک آبجکت زمان اجرا می‌سازد و اعضا را زیر آن قرار می‌دهد.',
        code: `namespace Validation {
  export interface StringValidator { isAcceptable(s: string): boolean }
  export const lettersRegexp = /^[A-Za-z]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string): boolean { return lettersRegexp.test(s); }
  }
}

const validator = new Validation.LettersOnlyValidator();
console.log(validator.isAcceptable('TypeScript'), Validation.lettersRegexp.source);`,
      },
      {
        h: 'گام ۲ — چرا منسوخ شد',
        p:
          'سه دلیل: ۱) ESM استاندارد شد و همان کار را بهتر انجام می‌دهد. ۲) namespace کد زمان اجرا تولید می‌کند (erasable نیست، با isolatedModules و strip-types مشکل دارد). ۳) tree-shaking را سخت می‌کند و ابزارهای مدرن آن را خوب پشتیبانی نمی‌کنند.',
        code: `// ✅ معادل مدرن با ES Modules:
// validation.ts
export interface StringValidator { isAcceptable(s: string): boolean }
export const lettersRegexp = /^[A-Za-z]+$/;
export class LettersOnlyValidator implements StringValidator {
  isAcceptable(s: string): boolean { return lettersRegexp.test(s); }
}

// consumer.ts
// import { LettersOnlyValidator } from './validation.js';
console.log(new LettersOnlyValidator().isAcceptable('abc'));`,
      },
      {
        h: 'گام ۳ — کاربردهای باقی‌مانده‌ی مشروع',
        p:
          '۱) `declare namespace` در فایل‌های `.d.ts` برای توصیف APIهای سراسری قدیمی (مثل `jQuery`). ۲) گروه‌بندی تایپ‌ها زیر یک نام در کتابخانه‌هایی که backward compatibility لازم دارند. ۳) Global augmentation در پروژه‌های غیرماژولی.',
        code: `// types/legacy-jquery.d.ts
declare namespace LegacyJQuery {
  type Selector = string;
  interface Element { text(): string }
  function select(selector: Selector): Element;
}

declare function useJQuery(s: LegacyJQuery.Selector): LegacyJQuery.Element;
console.log(typeof useJQuery);`,
      },
      {
        h: 'گام ۴ — `namespace` با ماژول ترکیب می‌شود',
        p:
          'می‌توانی یک namespace را به یک ماژول اضافه کنی (Declaration Merging با تابع/کلاس) — مثلاً افزودن تایپ‌های کمکی زیر نام یک تابع export شده.',
        code: `export function createId(prefix: string): string { return \`\${prefix}_1\`; }

export namespace createId {
  export type Format = \`\${string}_\${number}\`;
}

const id: createId.Format = 'user_1';
console.log(createId('user'), id);`,
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'روش «مهاجرت از namespace به ماژول»',
        body:
          'اگر در کد قدیمی `namespace` دیدی، قدم‌به‌قدم به ماژول ES تبدیلش کن: ۱) فایل را به `export` تبدیل کن ۲) `import`های صریح اضافه کن ۳) نام‌های تودرتو را حذف کن. `namespace` فقط برای Ambient Declaration (`declare global` و `declare module`) همچنان مجاز است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی مدرن',
        title: 'در کد جدید هرگز `namespace` ننویس',
        body:
          'استفاده از namespace در کد جدید یعنی: کد غیر-erasable، سازگاری کمتر با باندلرها، و یک الگوی منسوخ در رزومه‌ات. تنها استثنا: `declare namespace` داخل فایل‌های `.d.ts` برای توصیف APIهای قدیمی.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'ساختار پوشه به‌جای namespace',
        body:
          'به‌جای `namespace Validation { ... }` از ساختار پوشه استفاده کن: `src/validation/` با فایل‌های جدا و یک `index.ts`. این کار هم مرزهای واقعی می‌سازد و هم با ابزارهای مدرن سازگار است.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا namespace منسوخ شد؟',
        body:
          'پاسخ: «چون ES Modules همان مسئله را به‌صورت استاندارد حل کرد، namespace کد زمان اجرا تولید می‌کند (پس erasable نیست)، با `isolatedModules` و ترنسپایلرهای تک‌فایلی مشکل دارد، و tree-shaking را پیچیده می‌کند.»',
      },
    ],
    quiz: {
      q: 'جایگزین مدرن و توصیه‌شده برای `namespace` در کد جدید چیست؟',
      options: [
        'ES Modules (فایل‌های جدا با `import`/`export`) و ساختار پوشه',
        '`declare module`',
        'کلاس‌های static',
        'IIFE در JavaScript',
      ],
      answer: 0,
      explain:
        'ES Modules استاندارد رسمی زبان است، erasable نیست ولی توسط همه‌ی ابزارها پشتیبانی می‌شود، tree-shaking دارد و مرزهای واقعی می‌سازد.',
    },
    lab: {
      task: 'یک namespace قدیمی را به ماژول مدرن تبدیل کن و نشان بده رفتار یکسان است.',
      starter: `// ❌ نسخه‌ی قدیمی:
// namespace MathUtils { export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n)); }

// ✅ نسخه‌ی مدرن:
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type Range = { readonly min: number; readonly max: number };

export function clampToRange(value: number, range: Range): number {
  return clamp(value, range.min, range.max);
}

console.log(clamp(15, 0, 10), clampToRange(-5, { min: 0, max: 100 }));`,
      solution: `export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));`,
    },
  },

  {
    id: 'ambient-modules',
    chapter: 'ch13',
    titleFa: 'Ambient Modules',
    titleEn: 'Ambient Modules',
    level: 'advanced',
    minutes: 30,
    goal: 'با `declare module` برای ماژول‌های بدون تایپ، اعلان بنویسی و مرزهای بیرونی را تایپ‌دار کنی.',
    steps: [
      {
        h: 'گام ۱ — `declare module` چیست؟',
        p:
          'یک «اعلان محیطی» که به کامپایلر می‌گوید: «ماژولی با این نام وجود دارد و این شکل را دارد» — بدون اینکه کدی تولید کند. دو کاربرد: توصیف یک پکیج بدون تایپ، و تعریف ماژول‌های غیر JS (مثل `.css` یا `.svg`).',
        code: `// types/legacy.d.ts
declare module 'legacy-analytics' {
  export function track(event: string, payload?: Record<string, unknown>): void;
  export type EventName = 'click' | 'view';
}

// types/assets.d.ts
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

console.log('declarations ready');`,
      },
      {
        h: 'گام ۲ — wildcard module برای پترن‌ها',
        p:
          'می‌توانی با `*` یک الگو را پوشش دهی — مثلاً همه‌ی importهای `/api/*` یا همه‌ی فایل‌های تصویری.',
        code: `declare module 'virtual:*' {
  const module: { readonly data: string };
  export default module;
}

declare module '*.png' {
  const src: string;
  export default src;
}

// مصرف (در زمان اجرا توسط bundler حل می‌شود):
console.log('wildcard patterns declared');`,
      },
      {
        h: 'گام ۳ — `declare module "x";` بدون بدنه = فرار اضطراری',
        p:
          'یک خط `declare module "some-lib";` کل ماژول را `any` می‌کند. این سریع‌ترین راه رفع خطای TS2307 است ولی امنیت تایپ را از بین می‌برد. فقط موقتاً و با `TODO` استفاده کن.',
        code: `// ⚠️ موقت — کل ماژول any می‌شود:
// declare module 'totally-untyped-lib';

// ✅ درست — حداقل قرارداد را بنویس:
declare module 'semi-typed-lib' {
  export function init(config: { debug: boolean }): void;
  export const version: string;
}

console.log('escape hatch documented');`,
      },
      {
        h: 'گام ۴ — `@types/*` و ترتیب اولویت',
        p:
          'اول بررسی کن آیا `@types/<pkg>` در DefinitelyTyped وجود دارد (`npm i -D @types/lodash`). اگر پکیج خودش `types` در `package.json` دارد، هیچ نصبی لازم نیست. فقط اگر هیچ‌کدام نبود، `.d.ts` دستی بنویس.',
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'همه‌ی اعلان‌ها در `types/` + ثبت در tsconfig',
        body:
          'یک پوشه‌ی `types/` بساز، اعلان‌ها را بر اساس موضوع جدا کن (`assets.d.ts`، `legacy.d.ts`، `env.d.ts`) و `"include": ["src", "types"]` را در tsconfig بگذار. پراکندن اعلان‌ها، «این تایپ از کجا آمد؟» را غیرقابل پاسخ می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'اعلان بدون پیاده‌سازی = خطای زمان اجرا',
        body:
          '`declare module "*.svg"` به کامپایلر می‌گوید این import معتبر است، ولی اگر bundler تنظیم نشده باشد، در زمان اجرا می‌شکند. اعلان محیطی فقط **قرارداد تایپی** است، نه پیکربندی ابزار build.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۵',
        title: 'فرمول «مرزهای بیرونی را اول تایپ‌دار کن»',
        body:
          'در مهاجرت یا شروع یک پروژه، اولین کار نوشتن اعلان برای مرزهای بیرونی است (APIها، assetها، پکیج‌های قدیمی). با تایپ‌دار شدن مرزها، IntelliSense در کل کدبیس فعال می‌شود و سرعت توسعه چند برابر می‌گردد.',
      },
    ],
    quiz: {
      q: 'کدام گزینه یک ماژول بدون تایپ را کاملاً `any` می‌کند؟',
      options: [
        '`declare module "some-lib";` (بدون بدنه)',
        '`declare module "some-lib" { export const x: string }`',
        '`import * as lib from "some-lib"`',
        '`// @ts-expect-error`',
      ],
      answer: 0,
      explain:
        'یک اعلان بدون بدنه، یک «shorthand ambient module» است که هر import از آن را `any` می‌کند. سریع‌ترین راه رفع خطاست ولی امنیت تایپ را در آن مرز کاملاً از بین می‌برد.',
    },
    lab: {
      task: 'اعلان محیطی برای یک API قدیمی بنویس که فقط دو تابع دارد، و از آن با تایپ دقیق استفاده کن.',
      starter: `declare module 'legacy-report' {
  export type Row = readonly (string | number)[];
  export function generate(title: string, rows: readonly Row[]): string;
  export function dispose(): void;
}

// شبیه‌سازی مصرف (در همین فایل):
type Row = readonly (string | number)[];
function generate(title: string, rows: readonly Row[]): string {
  return \`\${title}: \${rows.length} rows\`;
}

console.log(generate('گزارش فروش', [['Q1', 120], ['Q2', 90]]));`,
      solution: `declare module 'legacy-report' {
  export function generate(title: string, rows: readonly (string | number)[][]): string;
}`,
    },
  },

  {
    id: 'external-modules',
    chapter: 'ch13',
    titleFa: 'External Modules',
    titleEn: 'External Modules',
    level: 'intermediate',
    minutes: 25,
    goal: 'انواع export/import و الگوهای مدیریت مرز ماژول را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — شش شکل export',
        p:
          'named export (پیش‌فرض توصیه‌شده)، default export (بحث‌برانگیز)، `export *` (re-export همه)، `export { X as Y }` (تغییر نام)، `export =` (CommonJS legacy) و `export type`.',
        code: `// named (توصیه‌شده):
export type Level = 'beginner' | 'advanced';
export const LEVELS: readonly Level[] = ['beginner', 'advanced'];
export function isAdvanced(level: Level): boolean { return level === 'advanced'; }

// تغییر نام هنگام export:
const internalHelper = (): string => 'helper';
export { internalHelper as helper };

console.log(LEVELS.length, isAdvanced('advanced'), helper());`,
      },
      {
        h: 'گام ۲ — default export و چرا کمتر توصیه می‌شود',
        p:
          'سه مشکل default export: ۱) نام در هر import متفاوت می‌تواند باشد (تفرقه در کدبیس). ۲) refactor/تغییر نام با ابزار کار نمی‌کند. ۳) IntelliSense ضعیف‌تر است. بیشتر تیم‌های مدرن (و کتابخانه‌های بزرگ) named export را ترجیح می‌دهند.',
        code: `// ❌ default — نام در هر مصرف‌کننده می‌تواند متفاوت باشد:
// export default class Whatever {}
// import A from './x.js'; import B from './x.js';  // دو نام برای یک چیز!

// ✅ named — نام یکدست در کل کدبیس:
export class LessonService {
  list(): readonly string[] { return ['a', 'b']; }
}

const svc = new LessonService();
console.log(svc.list().join(','));`,
      },
      {
        h: 'گام ۳ — `export =` و `import =` برای CommonJS',
        p:
          'برای سازگاری با پکیج‌های CommonJS که `module.exports = ...` دارند، TypeScript سینتکس `export =` و `import x = require()` را پشتیبانی می‌کند. در کد ESM مدرن تقریباً هرگز لازم نیست.',
        code: `// legacy.cjs.ts
// export = function legacy(): string { return 'legacy'; };

// مصرف:
// import legacy = require('./legacy.cjs.js');

// جایگزین مدرن با esModuleInterop:
export default function modern(): string { return 'modern'; }
console.log(modern());`,
      },
      {
        h: 'گام ۴ — مرز عمومی و خصوصی یک ماژول',
        p:
          'هر چیزی که export **نشود**، داخلی و آزادانه قابل تغییر است. این قوی‌ترین ابزار کپسوله‌سازی در TypeScript مدرن است — بهتر از `private` در کلاس، چون کل اسکوپ را پوشش می‌دهد.',
        code: `// internals (صادر نمی‌شود → آزادانه قابل تغییر):
const CACHE_TTL_MS = 60_000;
function normalizeKey(key: string): string { return key.trim().toLowerCase(); }

// public API:
export function readCache(key: string): { key: string; ttl: number } {
  return { key: normalizeKey(key), ttl: CACHE_TTL_MS };
}

console.log(readCache('  UserName  '));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'named export پیش‌فرض، default ممنوع',
        body:
          'یک قاعده‌ی تیمی ساده: «همه‌ی exportها named هستند». این کار نام‌گذاری یکدست، refactor خودکار، IntelliSense دقیق و tree-shaking بهتر می‌دهد. ESLint: `import/no-default-export`.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۶',
        title: 'فرمول «سطح export = تعهد عمومی»',
        body:
          'هر export یک تعهد دائمی به مصرف‌کننده‌هاست. قبل از export کردن هر نماد بپرس: «آیا حاضرم این را برای همیشه پشتیبانی کنم؟» اگر نه، داخلی نگهش دار.',
        equation: 'بدهی API = Σ(تعداد نمادهای export شده) × (احتمال تغییر هرکدام)',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`export *` تداخل نام می‌سازد',
        body:
          'اگر دو ماژول نماد هم‌نام داشته باشند، `export *` از هر دو باعث تداخل و خطای غیرمنتظره می‌شود. در barrel fileها ترجیح بده `export { a, b } from ...` صریح بنویسی.',
      },
    ],
    quiz: {
      q: 'کدام گزینه یک مزیت واقعی named export نسبت به default export است؟',
      options: [
        'نام در تمام مصرف‌کننده‌ها یکسان می‌ماند و refactor خودکار کار می‌کند',
        'حجم خروجی را کم می‌کند',
        'نیازی به `import type` ندارد',
        'در CommonJS کار نمی‌کند',
      ],
      answer: 0,
      explain:
        'با default export، هر مصرف‌کننده می‌تواند نام دلخواه بگذارد (`import Foo from ...`) که منجر به چند نام برای یک موجودیت در کدبیس می‌شود. named export نام را قفل می‌کند و ابزارهای rename و auto-import دقیق کار می‌کنند.',
    },
    lab: {
      task: 'یک ماژول کوچک با مرز عمومی/خصوصی شفاف بنویس: دو تابع داخلی بدون export و یک تابع عمومی.',
      starter: `// --- داخلی (آزادانه قابل تغییر) ---
const SEPARATOR = '·';
function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/\\s+/g, '-');
}
function initials(name: string): string {
  return name.split(' ').map((p) => p[0] ?? '').join('.');
}

// --- عمومی ---
export type CourseTag = { readonly slug: string; readonly label: string };

export function createTag(name: string): CourseTag {
  return { slug: slugify(name), label: \`\${initials(name)} \${SEPARATOR} \${name}\` };
}

console.log(createTag('TypeScript Advanced'));`,
      solution: `export function createTag(name: string): CourseTag { return { slug: slugify(name), label: name }; }`,
    },
  },

  {
    id: 'namespace-augmentation',
    chapter: 'ch13',
    titleFa: 'Namespace Augmentation',
    titleEn: 'Namespace Augmentation',
    level: 'advanced',
    minutes: 25,
    goal: 'تایپ‌های یک ماژول یا namespace موجود را از بیرون گسترش دهی، بدون دست‌کاری فایل اصلی.',
    steps: [
      {
        h: 'گام ۱ — Module Augmentation چیست؟',
        p:
          'افزودن اعلان جدید به یک ماژول موجود از یک فایل دیگر. کاربرد اصلی: افزودن فیلد به تایپ‌های یک پکیج (مثل `user` روی `Request` در Express) یا افزودن متغیرهای محیطی.',
        code: `// types/express.d.ts
declare module 'express-serve-static-core' {
  interface Request {
    readonly userId?: string;
    readonly requestId: string;
  }
}
export {};

// مصرف در هر فایل دیگر — بدون import اضافی:
declare const request: import('express-serve-static-core').Request;
console.log(request.requestId, request.userId ?? 'guest');`,
      },
      {
        h: 'گام ۲ — شرایط لازم برای کارکردن',
        p:
          'سه شرط: ۱) فایل باید یک **ماژول** باشد (یک `import` یا `export {}`). ۲) مسیر ماژول باید دقیقاً همان چیزی باشد که import می‌شود. ۳) فایل باید در `include` تسکانفیگ باشد. نقض هر شرط = augmentation بی‌اثر و بدون خطا.',
      },
      {
        h: 'گام ۳ — محدودیت‌ها: چه چیزی را نمی‌توان اضافه کرد؟',
        p:
          'فقط **اعضای جدید** می‌توانی اضافه کنی. نمی‌توانی اعضای موجود را تغییر دهی یا حذف کنی، و نمی‌توانی به یک `type alias` موجود عضو اضافه کنی (فقط `interface` ادغام می‌شود).',
        code: `interface Config { readonly host: string }

// ✅ افزودن عضو جدید با declaration merging:
interface Config { readonly port: number }

// ❌ تغییر عضو موجود ممکن نیست:
// interface Config { readonly host: number }  → خطا

const config: Config = { host: 'localhost', port: 3000 };
console.log(config.host, config.port);`,
      },
      {
        h: 'گام ۴ — الگوی واقعی: متغیرهای محیطی تایپ‌دار',
        p:
          'رایج‌ترین augmentation در پروژه‌های مدرن: تایپ‌دار کردن `process.env` یا `import.meta.env`.',
        code: `// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly API_URL: string;
    readonly FEATURE_STUDIO?: string;
  }
}
export {};

const env = { NODE_ENV: 'development', API_URL: 'https://api.local' } as NodeJS.ProcessEnv;
console.log(env.NODE_ENV, env.API_URL);`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی بی‌صدا',
        title: 'Augmentation بی‌اثر هیچ خطایی نمی‌دهد',
        body:
          'اگر `export {}` را فراموش کنی یا مسیر ماژول اشتباه باشد، augmentation کاملاً نادیده گرفته می‌شود و فقط خطای «Property does not exist» در نقطه‌ی مصرف می‌بینی. همیشه اول سه شرط کارکردن را چک کن.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'هر augmentation با کامنت «چرا»',
        body:
          'چون augmentation از راه دور اثر می‌کند، همیشه بالای آن بنویس چرا لازم است و به کدام پکیج/نسخه مربوط است. مثلاً: `// Express پس از middleware احراز هویت، userId را روی Request می‌گذارد`.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۷',
        title: 'فرمول «گسترش از بیرون بهتر از fork کردن»',
        body:
          'وقتی یک پکیج تایپ ناقص دارد، سه گزینه داری: fork کردن، `any` کردن، یا augmentation. augmentation کم‌هزینه‌ترین و پایدارترین است: با ارتقای پکیج نمی‌شکند و در یک فایل متمرکز می‌ماند.',
      },
    ],
    quiz: {
      q: 'کدام شرط برای کارکردن Module Augmentation لازم است؟',
      options: [
        'فایل حاوی augmentation باید یک ماژول باشد (حداقل یک `import` یا `export {}`)',
        'پکیج باید با `npm link` نصب شده باشد',
        '`strict` باید خاموش باشد',
        'فایل باید پسوند `.ts` داشته باشد نه `.d.ts`',
      ],
      answer: 0,
      explain:
        'در یک اسکریپت سراسری، `declare module "x"` به‌جای augmentation یک **اعلان ماژول جدید** (Ambient Module) تلقی می‌شود. `export {};` ساده‌ترین راه ماژول کردن فایل است.',
    },
    lab: {
      task: 'یک اینترفیس `AppConfig` تعریف کن و با merging دو فیلد جدید از «تیم‌های متفاوت» اضافه کن.',
      starter: `interface AppConfig { readonly apiUrl: string }
interface AppConfig { readonly timeoutMs: number }      // تیم پلتفرم
interface AppConfig { readonly featureFlags: string[] }  // تیم محصول

const config: AppConfig = {
  apiUrl: 'https://api.local',
  timeoutMs: 5000,
  featureFlags: ['studio', 'roadmap'],
};

console.log(config.apiUrl, config.timeoutMs, config.featureFlags.join(','));`,
      solution: `interface AppConfig { readonly apiUrl: string }
interface AppConfig { readonly timeoutMs: number } // ادغام خودکار`,
    },
  },

  {
    id: 'global-augmentation',
    chapter: 'ch13',
    titleFa: 'Global Augmentation',
    titleEn: 'Global Augmentation',
    level: 'advanced',
    minutes: 25,
    goal: 'اسکوپ سراسری را تایپ‌دار و گسترش دهی (`declare global`) و بدانی کی این کار لازم و کی ممنوع است.',
    steps: [
      {
        h: 'گام ۱ — `declare global` و پیش‌نیاز ماژول بودن',
        p:
          'برای افزودن چیزی به اسکوپ سراسری از داخل یک ماژول، از بلوک `declare global` استفاده کن. بدون `export {}` یا یک import، این بلوک کار نمی‌کند.',
        code: `// types/global.d.ts
declare global {
  interface Window {
    readonly __APP_VERSION__: string;
    readonly __STUDIO__: { ready: boolean };
  }

  var __BUILD_TIME__: string;

  function reportReady(): void;
}

export {};

// مصرف:
if (typeof window !== 'undefined') {
  console.log('window typed');
}`,
      },
      {
        h: 'گام ۲ — افزودن متدهای سراسری با پیاده‌سازی',
        p:
          'اعلان سراسری فقط **تایپ** می‌دهد؛ پیاده‌سازی واقعی باید در یک فایل اجرایی باشد که حتماً import می‌شود. این جفت باید همیشه با هم باشند.',
        code: `// global-impl.ts — این فایل باید در entrypoint import شود
declare global {
  function formatHours(minutes: number): string;
}

globalThis.formatHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? \`\${h}h \${m}m\` : \`\${m}m\`;
};

export {};

console.log(globalThis.formatHours(300)); // 5h 0m`,
      },
      {
        h: 'گام ۳ — تایپ‌دار کردن `import.meta.env` (Vite)',
        p:
          'رایج‌ترین global augmentation در پروژه‌های فرانت‌اند: تعریف متغیرهای محیطی Vite.',
        code: `// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_STUDIO: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const env = { VITE_API_URL: 'https://api.local', VITE_ENABLE_STUDIO: 'true' } as ImportMetaEnv;
console.log(env.VITE_API_URL, env.VITE_ENABLE_STUDIO);`,
      },
      {
        h: 'گام ۴ — کی global augmentation ممنوع است؟',
        p:
          'برای داده‌های دامنه‌ی خودت، هرگز. اسکوپ سراسری یک منبع مشترک و آلوده‌شدنی است: تداخل نام، وابستگی پنهان و تست‌ناپذیری می‌سازد. فقط برای: گسترش تایپ‌های میزبان (`Window`، `ProcessEnv`)، افزودن polyfillهای واقعی، و سازگاری با کتابخانه‌های قدیمی.',
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'قاعده‌ی «Augmentation باید محلی و مستند باشد»',
        body:
          'هر augmentation که روی تایپ‌های سراسری انجام می‌دهی باید در یک فایل مشخص با نام روشن (مثل `types/augments.d.ts`) جمع شود و بالای آن کامنت **دلیل** داشته باشد. پراکنده کردن augmentation در پروژه، یکی از سخت‌ترین منبع‌های باگ برای تشخیص است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'اسکوپ سراسری را حداقلی نگه دار',
        body:
          'هر نماد سراسری یک وابستگی پنهان در کل کدبیس است. قانون: حداکثر چند نماد سراسری (نسخه‌ی اپ، یک تابع گزارش‌گیری) و همه در یک فایل `global.d.ts` مستند. بقیه‌ی چیزها باید از ماژول‌ها import شوند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'اعلان سراسری بدون پیاده‌سازی',
        body:
          '`declare global { function track(): void }` فقط به کامپایلر می‌گوید این تابع وجود دارد. اگر هیچ‌جا پیاده‌سازی نشود، کد کامپایل می‌شود ولی در زمان اجرا `ReferenceError` می‌گیری. همیشه اعلان و پیاده‌سازی را در یک commit اضافه کن.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور `window.myApp` را تایپ‌دار می‌کنی؟',
        body:
          'پاسخ: «در یک فایل `.d.ts` که یک ماژول است (`export {}`)، بلوک `declare global { interface Window { readonly myApp: MyAppApi } }` را می‌نویسم و آن فایل را در `include` تسکانفیگ قرار می‌دهم.»',
      },
    ],
    quiz: {
      q: 'چرا برای کارکردن `declare global` فایل باید یک ماژول باشد؟',
      options: [
        'چون در یک اسکریپت سراسری، اعلان‌ها از قبل سراسری‌اند و `declare global` معنی/اثر ندارد',
        'چون TypeScript فقط ماژول‌ها را کامپایل می‌کند',
        'چون `declare global` فقط در فایل‌های `.ts` کار می‌کند',
        'چون اسکریپت‌های سراسری از `strict` پشتیبانی نمی‌کنند',
      ],
      answer: 0,
      explain:
        'در یک فایل غیرماژول (script)، همه‌ی اعلان‌ها خودشان سراسری‌اند؛ `declare global` در آن بافت نامعتبر است. با `export {}` فایل ماژول می‌شود و آن‌گاه `declare global` راه ورود به اسکوپ سراسری است.',
    },
    lab: {
      task: 'یک تابع سراسری `__studioVersion` را اعلان و پیاده‌سازی کن و مصرفش را نشان بده.',
      starter: `declare global {
  function __studioVersion(): string;
}

globalThis.__studioVersion = (): string => '2.0.0';

export {};

console.log(__studioVersion());`,
      solution: `declare global { function __studioVersion(): string }
globalThis.__studioVersion = () => '2.0.0';
export {};`,
    },
  },

  {
    id: 'ts-ecosystem',
    chapter: 'ch14',
    titleFa: 'اکوسیستم TypeScript — نگرش کلی',
    titleEn: 'Ecosystem',
    level: 'intermediate',
    minutes: 25,
    goal: 'نقشه‌ی اکوسیستم اطراف TypeScript را بشناسی: چه ابزاری چه مشکلی را حل می‌کند.',
    steps: [
      {
        h: 'گام ۱ — چهار لایه‌ی اکوسیستم',
        p:
          '۱) **کیفیت کد**: Prettier (فرمت)، ESLint + typescript-eslint (قواعد). ۲) **اعتبارسنجی زمان اجرا**: zod، valibot، arktype. ۳) **اجرا و build**: tsx، esbuild، SWC، Vite، tsup، turbo. ۴) **تست**: Vitest، Jest، testing-library.',
      },
      {
        h: 'گام ۲ — ابزار ضروری برای هر پروژه',
        p:
          'حداقل‌ها: `typescript`، یک فرمت‌دهنده (Prettier)، یک linter (ESLint + typescript-eslint)، و یک runner تست (Vitest). این چهار، ۹۰٪ نیازهای کیفیت کد یک پروژه را پوشش می‌دهند.',
        code: `// package.json — مجموعه‌ی حداقلی حرفه‌ای
{
  "devDependencies": {
    "typescript": "5.9.3",
    "prettier": "^3.4.0",
    "eslint": "^9.0.0",
    "typescript-eslint": "^8.0.0",
    "vitest": "^3.0.0",
    "tsx": "^4.19.0"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  }
}
console.log('toolchain defined');`,
      },
      {
        h: 'گام ۳ — ترتیب اجرا در CI (مهم)',
        p:
          'ترتیب بهینه: `format:check` (سریع‌ترین) → `lint` → `typecheck` → `test` → `build`. هر مرحله که شکست، بقیه اجرا نشوند. این کار بازخورد را در چند ثانیه می‌دهد.',
      },
      {
        h: 'گام ۴ — انتخاب ابزار بر اساس نوع پروژه',
        p:
          'کتابخانه‌ی npm → `tsup` یا `tsc` با `declaration`. اپ فرانت‌اند → Vite. اپ Node/API → `tsx` برای توسعه و `tsc` برای build. مونورپو → Turborepo یا Nx + Project References.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۸',
        title: 'فرمول «ابزار کمتر، عمق بیشتر»',
        body:
          'هر ابزار جدید در زنجیره، یک نقطه‌ی پیکربندی، یک نقطه‌ی شکست و یک هزینه‌ی نگهداری است. با حداقل مجموعه شروع کن و فقط وقتی یک مشکل **واقعی و تکرارشونده** دیدی، ابزار اضافه کن.',
        equation: 'هزینه‌ی نگهداری toolchain = Σ(تعداد ابزارها × پیچیدگی پیکربندی هرکدام)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پیکربندی ابزارها را در ریپو، نه در ذهن تیم',
        body:
          'همه‌ی قواعد (`.prettierrc`، `eslint.config.js`، `tsconfig.json`) باید در ریپو commit شوند و در CI اجرا شوند. اگر یک قاعده فقط در ذهن یک نفر باشد، وجود ندارد.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'هفته‌ی اکوسیستم را آخر بگذار',
        body:
          'ابزارها را قبل از فهمیدن زبان یاد نگیر. ابتدا هسته‌ی TypeScript را مسلط شو (فصل‌های ۱ تا ۱۲)، بعد یک هفته کامل روی toolchain وقت بگذار. ابزار بدون درک زبان، فقط نویز است.',
      },
    ],
    quiz: {
      q: 'کدام ترتیب برای مراحل CI بهینه‌ترین بازخورد را می‌دهد؟',
      options: [
        'format:check → lint → typecheck → test → build',
        'build → test → lint → format:check → typecheck',
        'test → build → typecheck → lint → format:check',
        'lint → build → test → format → typecheck',
      ],
      answer: 0,
      explain:
        'اصل «ارزان‌ترین و سریع‌ترین بررسی اول»: بررسی فرمت چند ثانیه است، typecheck سریع‌تر از تست‌ها، و build کندترین. با این ترتیب، بیشتر شکست‌ها در چند ثانیه‌ی اول گزارش می‌شوند.',
    },
    lab: {
      task: 'یک تایپ برای «پیکربندی toolchain» بساز که نام ابزار، نقش و اسکریپت متناظر را نگه دارد.',
      starter: `type ToolRole = 'format' | 'lint' | 'typecheck' | 'test' | 'build' | 'run';

type Tool = { readonly name: string; readonly role: ToolRole; readonly script: string };

const TOOLCHAIN: readonly Tool[] = [
  { name: 'prettier', role: 'format', script: 'format' },
  { name: 'eslint', role: 'lint', script: 'lint' },
  { name: 'tsc', role: 'typecheck', script: 'typecheck' },
  { name: 'vitest', role: 'test', script: 'test' },
  { name: 'tsc', role: 'build', script: 'build' },
  { name: 'tsx', role: 'run', script: 'dev' },
];

const order: readonly ToolRole[] = ['format', 'lint', 'typecheck', 'test', 'build'];
const pipeline = order.map((role) => TOOLCHAIN.find((t) => t.role === role)?.name ?? '?');
console.log(pipeline.join(' → '));`,
      solution: `type ToolRole = 'format' | 'lint' | 'typecheck' | 'test' | 'build' | 'run';`,
    },
  },

  {
    id: 'eco-formatting',
    chapter: 'ch14',
    titleFa: 'قالب‌بندی کد (Formatting)',
    titleEn: 'Formatting',
    level: 'beginner',
    minutes: 20,
    goal: 'قالب‌بندی خودکار را پیکربندی کنی و بدان چرا Prettier و ESLint باید از هم جدا باشند.',
    steps: [
      {
        h: 'گام ۱ — اصل تفکیک: Prettier برای ظاهر، ESLint برای صحت',
        p:
          'Prettier یک **فرمت‌دهنده‌ی قطعی** است (فقط ظاهر: فاصله، پرش خط، کوتیشن). ESLint یک **تحلیل‌گر صحت** است (قواعد منطقی و سبکی). این دو باید جدا باشند؛ قاعده‌ی قالب‌بندی را هرگز در ESLint فعال نکن.',
        code: `// .prettierrc — پیکربندی رایج و پایدار
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}`,
      },
      {
        h: 'گام ۲ — نکات مخصوص TypeScript در Prettier',
        p:
          'پیشوند type در `interface`/`type`، جداکننده‌ی عضو (`;` در برابر `,`)، و شکستن Genericهای طولانی. Prettier همه را به‌صورت قطعی حل می‌کند — هیچ بحثی لازم نیست.',
        code: `// ورودی نامرتب:
type   User={id:string,name:string,   email:string}
const  x :number=5

// خروجی Prettier (همیشه یکسان):
type User = { id: string; name: string; email: string };
const x: number = 5;

console.log(x);`,
      },
      {
        h: 'گام ۳ — اجرا خودکار: editor، pre-commit و CI',
        p:
          'سه لایه: ۱) format-on-save در ادیتور. ۲) `lint-staged` + `husky` در pre-commit. ۳) `prettier --check .` در CI. با این سه، هیچ کد بدفرمتی وارد ریپو نمی‌شود.',
        lang: 'json',
        code: `// .husky/pre-commit
// npx lint-staged

// .lintstagedrc
{ "*.{ts,tsx,js,json,md,css}": "prettier --write" }

// CI:
// npx prettier --check .`,
      },
      {
        h: 'گام ۴ — `.prettierignore`',
        p:
          'خروجی build (`dist`)، فایل‌های تولیدشده، `package-lock.json` و assetها را ignore کن. فرمت کردن فایل‌های تولیدشده فقط diff نویز می‌سازد.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۹',
        title: 'فرمول «صفر بحث روی سبک»',
        body:
          'بحث روی سبک کد (space در برابر tab، کوتیشن، طول خط) یکی از پرهزینه‌ترین اتلاف‌های زمان در تیم است. با یک فرمت‌دهنده‌ی خودکار، این بحث **برای همیشه** حذف می‌شود. هزینه: یک فایل پیکربندی. سود: ساعت‌ها زمان و انسجام کامل.',
        equation: 'زمان صرفه‌جویی‌شده = (تعداد بحث‌های سبکی در سال) × (میانگین زمان هر بحث) → بی‌نهایت در برابر هزینه‌ی ~۰',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قواعد فرمت را در ESLint فعال نکن',
        body:
          'قاعده‌هایی مثل `indent`، `quotes` و `comma-dangle` در ESLint با Prettier تداخل می‌کنند و جنگ بی‌پایان می‌سازند. همه‌ی قواعد ظاهری را به Prettier بسپار و ESLint را فقط برای صحت نگه دار.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'فرمت کردن کل ریپو در یک commit بزرگ',
        body:
          'اگر Prettier را بعداً به یک ریپوی بزرگ اضافه می‌کنی، اجرای آن روی همه‌ی فایل‌ها یک commit عظیم می‌سازد که `git blame` را نابود می‌کند. راه‌حل: یک commit جداگانه **فقط** برای فرمت، و افزودن آن به `.git-blame-ignore-revs`.',
      },
    ],
    quiz: {
      q: 'تفکیک درست مسئولیت‌ها بین Prettier و ESLint چیست؟',
      options: [
        'Prettier فقط ظاهر (فرمت) و ESLint فقط صحت و قواعد منطقی',
        'Prettier برای TypeScript و ESLint برای JavaScript',
        'ESLint برای فرمت و Prettier برای خطاها',
        'هر دو یک کار می‌کنند و فقط یکی لازم است',
      ],
      answer: 0,
      explain:
        'Prettier یک فرمت‌دهنده‌ی قطعی است و هیچ درکی از صحت کد ندارد؛ ESLint یک تحلیل‌گر است. فعال‌کردن قواعد ظاهری در ESLint باعث تداخل و جنگ با Prettier می‌شود.',
    },
    lab: {
      task: 'یک تایپ برای «قواعد فرمت» بساز و یک آبجکت پیکربندی معتبر تولید کن.',
      starter: `type PrettierConfig = {
  readonly semi: boolean;
  readonly singleQuote: boolean;
  readonly printWidth: number;
  readonly tabWidth: 2 | 4;
  readonly trailingComma: 'none' | 'es5' | 'all';
};

const config = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
} as const satisfies PrettierConfig;

console.log(config.printWidth, config.trailingComma);`,
      solution: `const config = { semi: true, singleQuote: true, printWidth: 100, tabWidth: 2, trailingComma: 'all' } as const satisfies PrettierConfig;`,
    },
  },

  {
    id: 'eco-linting',
    chapter: 'ch14',
    titleFa: 'Linting با typescript-eslint',
    titleEn: 'Linting',
    level: 'intermediate',
    minutes: 35,
    goal: 'یک پیکربندی ESLint حرفه‌ای با قواعد type-aware بسازی و بدان کدام قواعد بیشترین سود را دارند.',
    steps: [
      {
        h: 'گام ۱ — دو سطح قواعد: syntax-only و type-aware',
        p:
          'قواعد معمولی فقط AST را می‌بینند (سریع). قواعد **type-aware** با `projectService` به اطلاعات تایپ دسترسی دارند (کندتر ولی بسیار قدرتمندتر). برای پروژه‌های جدی، type-aware ضروری است.',
        code: `// eslint.config.js (Flat Config — ESLint 9+)
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  { ignores: ['dist/', 'node_modules/'] },
);
console.log('config loaded');`,
      },
      {
        h: 'گام ۲ — پنج قاعده‌ای که بیشترین باگ را می‌گیرند',
        p:
          '۱) `no-floating-promises` (فراموش‌کردن await). ۲) `no-misused-promises` (پاس دادن تابع async به callback هم‌زمان). ۳) `no-unnecessary-condition` (شرط همیشه درست/غلط). ۴) `restrict-template-expressions` (رشته‌کردن آبجکت). ۵) `no-explicit-any`.',
        code: `async function loadUser(id: string): Promise<string> { return \`user-\${id}\`; }

// ❌ no-floating-promises:
// loadUser('1');

// ✅ درست:
void loadUser('1');           // صریحاً نادیده گرفته می‌شود
await loadUser('1');          // یا واقعاً انتظار کشیده می‌شود

// ❌ restrict-template-expressions:
const obj = { a: 1 };
console.log(\`value: \${JSON.stringify(obj)}\`); // ✅ صریح رشته‌سازی`,
      },
      {
        h: 'گام ۳ — `strict` در برابر `strictTypeChecked` در برابر `recommended`',
        p:
          'چهار سطح آماده وجود دارد: `recommended` (پایه)، `strict` (بدون type info)، `recommendedTypeChecked` و `strictTypeChecked` (حداکثر). برای پروژه‌ی جدید، مستقیم `strictTypeChecked` را انتخاب کن؛ برای کدبیس قدیمی، پله‌پله بالا برو.',
      },
      {
        h: 'گام ۴ — مدیریت استثناها بدون خاموش‌کردن قاعده',
        p:
          'هرگز یک قاعده را به‌خاطر یک مورد خاص خاموش نکن. از `// eslint-disable-next-line <rule> -- دلیل` استفاده کن تا هم استثنا مستند باشد و هم قابل جست‌وجو.',
        code: `function unsafeParse(text: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- JSON.parse ذاتاً unsafe است؛ گارد در لایه‌ی بالاتر
  return JSON.parse(text);
}

console.log(unsafeParse('{"a":1}'));`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۸۰',
        title: 'فرمول «قاعده‌ی type-aware = شکار باگ زمان اجرا در زمان lint»',
        body:
          'قواعدی مثل `no-floating-promises` و `no-unnecessary-condition` باگ‌هایی را می‌گیرند که `tsc` نمی‌گیرد و فقط در پروداکشن ظاهر می‌شدند. فعال‌کردن `strictTypeChecked` ارزان‌ترین ارتقای کیفیت کدبیس است.',
        equation: 'باگ‌های فراری = (باگ‌های ممکن) − (آنچه tsc می‌گیرد) − (آنچه lint type-aware می‌گیرد)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'هر `disable` باید دلیل داشته باشد',
        body:
          'قاعده‌ی تیمی: `eslint-disable` بدون `-- دلیل` در Code Review رد می‌شود. دلیل‌های مستند، یک پایگاه دانش از موارد لبه‌ی پروژه می‌سازند و حذف تدریجی استثناها را ممکن می‌کنند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'ESLint بدون `projectService` قواعد type-aware را اجرا نمی‌کند',
        body:
          'اگر `parserOptions.projectService` (یا `project`) تنظیم نشده باشد، قواعد type-aware بی‌صدا نادیده گرفته یا خطا می‌دهند. بعد از ارتقا به ESLint 9 + Flat Config، این پیکربندی را اول بررسی کن.',
      },
    ],
    quiz: {
      q: 'قاعده‌ی `@typescript-eslint/no-floating-promises` چه باگی را شکار می‌کند؟',
      options: [
        'فراخوانی یک تابع async بدون `await`، `.then()` یا `void` — که خطاهایش بی‌صدا گم می‌شوند',
        'استفاده از `any` در پارامتر تابع',
        'تعریف یک Promise بدون resolve',
        'استفاده از `async` در یک کلاس',
      ],
      answer: 0,
      explain:
        'یک Promise رهاشده (floating) اگر reject شود، هیچ‌کس آن را نمی‌گیرد: نه لاگی، نه retry، نه خطای گزارش‌شده. این یکی از رایج‌ترین باگ‌های خاموش در کد async است و فقط با lint type-aware قابل شکار است.',
    },
    lab: {
      task: 'یک مجموعه از «قواعد ممنوعه» را به‌صورت تایپ‌دار مدل کن: نام قاعده، سطح و دلیل.',
      starter: `type RuleLevel = 'off' | 'warn' | 'error';

type Rule = {
  readonly name: string;
  readonly level: RuleLevel;
  readonly why: string;
};

const RULES: readonly Rule[] = [
  { name: 'no-explicit-any', level: 'error', why: 'any امنیت تایپ را از بین می‌برد' },
  { name: 'no-non-null-assertion', level: 'error', why: '! یک دروغ به کامپایلر است' },
  { name: 'no-floating-promises', level: 'error', why: 'Promise رهاشده خطاها را می‌بلعد' },
  { name: 'consistent-type-imports', level: 'warn', why: 'مرز تایپ/کد باید صریح باشد' },
];

const active = RULES.filter((r) => r.level === 'error');
console.log(active.map((r) => r.name).join(', '));`,
      solution: `type RuleLevel = 'off' | 'warn' | 'error';
type Rule = { readonly name: string; readonly level: RuleLevel; readonly why: string };`,
    },
  },

  {
    id: 'eco-packages',
    chapter: 'ch14',
    titleFa: 'پکیج‌های کاربردی اکوسیستم',
    titleEn: 'Useful Packages',
    level: 'intermediate',
    minutes: 35,
    goal: 'مهم‌ترین پکیج‌های اکوسیستم TypeScript را بشناسی و بدان هرکدام چه خلائی را پر می‌کند.',
    steps: [
      {
        h: 'گام ۱ — اعتبارسنجی زمان اجرا: zod و valibot',
        p:
          'مهم‌ترین دسته: TypeScript در مرزها هیچ کاری نمی‌کند. `zod` یک schema می‌گیرد و **هم** اعتبارسنجی زمان اجرا می‌دهد **هم** تایپ را با `z.infer` مشتق می‌کند — یعنی یک منبع حقیقت.',
        code: `// zod (الگو — نصب واقعی لازم است)
// import { z } from 'zod';
// const UserSchema = z.object({ id: z.string(), name: z.string(), age: z.number().min(0) });
// type User = z.infer<typeof UserSchema>;
// const user = UserSchema.parse(JSON.parse(raw));

// الگوی معادل با گارد دستی (بدون وابستگی):
type User = { readonly id: string; readonly name: string; readonly age: number };

function parseUser(input: unknown): User {
  if (typeof input !== 'object' || input === null) throw new TypeError('not an object');
  const raw = input as Record<string, unknown>;
  if (typeof raw['id'] !== 'string') throw new TypeError('bad id');
  if (typeof raw['name'] !== 'string') throw new TypeError('bad name');
  if (typeof raw['age'] !== 'number' || raw['age'] < 0) throw new TypeError('bad age');
  return { id: raw['id'], name: raw['name'], age: raw['age'] };
}

console.log(parseUser({ id: '1', name: 'نیما', age: 30 }));`,
      },
      {
        h: 'گام ۲ — ابزارهای توسعه: tsx، tsup، ts-node',
        p:
          '`tsx` برای اجرای سریع، `tsup` برای build کتابخانه (بر پایه‌ی esbuild، با `.d.ts` و ESM/CJS هم‌زمان)، `ts-node` برای اسکریپت‌های Node با بررسی کامل.',
      },
      {
        h: 'گام ۳ — ابزارهای تحلیل و کیفیت تایپ',
        p:
          '`typescript-eslint` (lint)، `knip` (یافتن export و وابستگی‌های استفاده‌نشده)، `madge` (چرخه‌ی وابستگی)، `ts-prune` (کد مرده)، `@total-typescript/ts-reset` (بازنشانی تایپ‌های ناامن استاندارد).',
        code: `// ts-reset — یک import، چند تایپ ناامن استاندارد را اصلاح می‌کند
// import '@total-typescript/ts-reset';
// اثرها: JSON.parse → unknown (نه any)
//        Array.prototype.filter با گارد → تایپ باریک‌شده
//        fetch response.json() → unknown

// معادل دستی برای JSON.parse:
function safeJsonParse(text: string): unknown {
  return JSON.parse(text) as unknown;
}

const parsed = safeJsonParse('{"a":1}');
console.log(typeof parsed, parsed !== null);`,
      },
      {
        h: 'گام ۴ — کتابخانه‌های تایپ‌محور',
        p:
          '`type-fest` (مجموعه‌ای از Utility Typeهای آماده)، `ts-toolbelt` (ابزارهای پیشرفته‌تر)، `effect` (مدل‌سازی اثرها با تایپ‌های قوی)، `neverthrow` (Result type). این‌ها را فقط وقتی لازم شد اضافه کن.',
        code: `// الگوی Result (معادل neverthrow، بدون وابستگی):
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

function divide(a: number, b: number): Result<number, 'division-by-zero'> {
  if (b === 0) return { ok: false, error: 'division-by-zero' };
  return { ok: true, value: a / b };
}

const r = divide(10, 2);
if (r.ok) console.log(r.value);
else console.log(r.error);

const bad = divide(10, 0);
console.log(bad.ok ? bad.value : bad.error);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۸۱',
        title: 'فرمول «یک schema، دو جهان»',
        body:
          'با ابزارهایی مثل zod، یک schema هم **اعتبارسنجی زمان اجرا** می‌دهد و هم **تایپ زمان کامپایل**. این یعنی حذف کامل تکرار بین «تایپ» و «اعتبارسنجی» — بزرگ‌ترین سود DRY در مرزهای سیستم.',
        equation: 'تعداد منابع حقیقت برای شکل داده = ۱ (با schema) در برابر ۲ (تایپ دستی + validator دستی)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قبل از افزودن هر پکیج، سه سؤال بپرس',
        body:
          '۱) آیا با ۳۰ خط کد خودم حل می‌شود؟ ۲) آیا نگهداری‌شده و تایپ‌دار است؟ ۳) آیا حجم/وابستگی‌هایش متناسب با سودش است؟ اگر پاسخ سؤال ۱ بله است، پکیج اضافه نکن.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`JSON.parse` تایپ `any` می‌دهد',
        body:
          'خروجی `JSON.parse` در تایپ‌های استاندارد `any` است که بی‌صدا به همه‌جا سرایت می‌کند. یا `@total-typescript/ts-reset` را اضافه کن (که آن را `unknown` می‌کند) یا خودت `as unknown` بگذار و بعد گارد بنویس.',
      },
    ],
    quiz: {
      q: 'مزیت اصلی استفاده از یک کتابخانه‌ی schema مثل zod چیست؟',
      options: [
        'یک منبع حقیقت که هم اعتبارسنجی زمان اجرا می‌دهد و هم تایپ زمان کامپایل را مشتق می‌کند',
        'جایگزین کامل TypeScript می‌شود',
        'سرعت اجرای برنامه را افزایش می‌دهد',
        'نیاز به `tsc` را از بین می‌برد',
      ],
      answer: 0,
      explain:
        'بدون schema، تایپ و اعتبارسنجی دو کد جدا هستند که می‌توانند از هم دور بیفتند. با `z.infer<typeof Schema>` این دو از یک منبع مشتق می‌شوند و همیشه همگام می‌مانند.',
    },
    lab: {
      task: 'یک «پارسر schema-محور» کوچک بنویس که بدون وابستگی خارجی، هم اعتبارسنجی کند و هم تایپ مشتق بدهد.',
      starter: `type FieldValidator<T> = (value: unknown) => T;

type Schema<S extends Record<string, FieldValidator<unknown>>> = {
  parse(input: unknown): { [K in keyof S]: ReturnType<S[K]> };
};

const str: FieldValidator<string> = (v) => {
  if (typeof v !== 'string') throw new TypeError('expected string');
  return v;
};
const num: FieldValidator<number> = (v) => {
  if (typeof v !== 'number') throw new TypeError('expected number');
  return v;
};

function createSchema<S extends Record<string, FieldValidator<unknown>>>(shape: S): Schema<S> {
  return {
    parse(input: unknown) {
      if (typeof input !== 'object' || input === null) throw new TypeError('expected object');
      const raw = input as Record<string, unknown>;
      const result = {} as { [K in keyof S]: ReturnType<S[K]> };
      for (const key of Object.keys(shape) as (keyof S)[]) {
        result[key] = shape[key](raw[key as string]) as ReturnType<S[typeof key]>;
      }
      return result;
    },
  };
}

const UserSchema = createSchema({ name: str, age: num });
type User = ReturnType<typeof UserSchema.parse>;

const user: User = UserSchema.parse({ name: 'نیما', age: 30 });
console.log(user.name.toUpperCase(), user.age);`,
      solution: `type FieldValidator<T> = (value: unknown) => T;
const schema = { name: str, age: num };
type User = { [K in keyof typeof schema]: ReturnType<(typeof schema)[K]> };`,
    },
  },

  {
    id: 'eco-build-tools',
    chapter: 'ch14',
    titleFa: 'ابزارهای Build',
    titleEn: 'Build Tools',
    level: 'advanced',
    minutes: 40,
    goal: 'ابزارهای build را بشناسی، یک کتابخانه‌ی npm را درست بسته‌بندی کنی و استراتژی build مونورپو را بفهمی.',
    steps: [
      {
        h: 'گام ۱ — سه دسته ابزار build',
        p:
          '۱) **کامپایلر مرجع**: `tsc` (دقیق، با type check، کندتر). ۲) **ترنسپایلرهای سریع**: esbuild، SWC، Babel (بدون type check، ۱۰ تا ۱۰۰ برابر سریع‌تر). ۳) **باندلرها**: Vite (dev)، Rollup، webpack، tsup (کتابخانه)، Turbopack.',
        code: `// tsup.config.ts — پیکربندی استاندارد انتشار کتابخانه
// import { defineConfig } from 'tsup';
// export default defineConfig({
//   entry: ['src/index.ts'],
//   format: ['esm', 'cjs'],
//   dts: true,
//   sourcemap: true,
//   clean: true,
//   treeshake: true,
// });

type BuildFormat = 'esm' | 'cjs';
type BuildConfig = {
  readonly entry: readonly string[];
  readonly formats: readonly BuildFormat[];
  readonly dts: boolean;
  readonly sourcemap: boolean;
};

const config: BuildConfig = {
  entry: ['src/index.ts'],
  formats: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
};

console.log(config.formats.join('+'), config.dts);`,
      },
      {
        h: 'گام ۲ — الگوی طلایی: typecheck با tsc، build با ابزار سریع',
        p:
          'بهترین ترکیب سرعت و صحت: `tsc --noEmit` برای بررسی تایپ (در CI و watch)، و esbuild/Vite/tsup برای تولید خروجی. هرگز build را بدون یک typecheck جدا منتشر نکن.',
        code: `{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsup",
    "verify": "npm run typecheck && npm run lint && npm test && npm run build"
  }
}
console.log('verify pipeline defined');`,
      },
      {
        h: 'گام ۳ — بسته‌بندی درست یک کتابخانه‌ی npm',
        p:
          'چهار چیز لازم است: `main` (CJS)، `module`/`exports` (ESM)، `types` (فایل `.d.ts`) و `files` (محدود کردن محتوای منتشرشده). بدون `exports` درست، مصرف‌کننده‌ها با Node ESM مشکل می‌گیرند.',
        code: `{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false
}`,
      },
      {
        h: 'گام ۴ — مونورپو: Project References و build incrementی',
        p:
          'در مونورپو، `tsc --build` (با `references`) فقط پکیج‌های تغییرکرده را کامپایل می‌کند و `.tsbuildinfo` را کش می‌کند. Turborepo/Nx هم کش سطح بالاتر اضافه می‌کنند.',
        code: `// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,        // لازم برای project references
    "declaration": true,
    "declarationMap": true,
    "incremental": true,
    "strict": true
  }
}

// packages/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [{ "path": "../core" }, { "path": "../ui" }]
}

// build:
// tsc --build packages/web
console.log('composite build configured');`,
      },
      {
        h: 'گام ۵ — `declaration` و `declarationMap` برای کتابخانه‌ها',
        p:
          '`declaration: true` فایل‌های `.d.ts` می‌سازد (ضروری برای مصرف‌کننده‌ها). `declarationMap: true` اجازه می‌دهد مصرف‌کننده با Go-to-Definition به **کد منبع واقعی** تو برسد نه فایل `.d.ts`.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۸۲',
        title: 'فرمول «دو خط جدا: صحت و سرعت»',
        body:
          'یک ابزار نمی‌تواند هم دقیق‌ترین باشد هم سریع‌ترین. معماری درست: **صحت** با `tsc --noEmit` (در CI و watch) و **سرعت** با esbuild/Vite (در build و dev). این تفکیک، هم اطمینان می‌دهد هم زمان build را چند برابر کاهش می‌دهد.',
        equation: 'زمان build کل ≈ max(زمان ترنسپایل سریع) و اطمینان = ۱۰۰٪ (با tsc --noEmit موازی)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`sideEffects: false` را صادقانه بگذار',
        body:
          'اگر پکیجت هیچ side effect در سطح ماژول ندارد (که باید نداشته باشد)، `"sideEffects": false` را در package.json بگذار. این یک flag، tree-shaking را در همه‌ی مصرف‌کننده‌ها فعال و حجم bundle را کم می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی جدی',
        title: 'build با esbuild بدون typecheck = انتشار کد ناسالم',
        body:
          'esbuild/Vite/tsup **هیچ** خطای تایپی نمی‌دهند. اگر `npm run build` فقط tsup باشد، می‌توانی یک پکیج با خطاهای تایپی منتشر کنی. همیشه یک `typecheck` جدا در CI و در اسکریپت `verify` داشته باش.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور یک کتابخانه‌ی TypeScript را منتشر می‌کنی؟',
        body:
          'پاسخ: «`tsup` (یا `tsc`) با `format: ["esm","cjs"]` و `dts: true`، سپس `package.json` با `exports` شرطی (`types`/`import`/`require`)، `files: ["dist"]` و `sideEffects: false`. در CI: typecheck + lint + test + build + publish با نسخه‌ی قفل‌شده.»',
      },
    ],
    quiz: {
      q: 'چرا در یک pipeline حرفه‌ای، `tsc --noEmit` و build با esbuild/tsup هر دو لازم‌اند؟',
      options: [
        'چون ابزارهای سریع type checking نمی‌کنند و `tsc --noEmit` صحت تایپ‌ها را بدون تولید فایل تضمین می‌کند',
        'چون tsc نمی‌تواند خروجی تولید کند',
        'چون esbuild فقط برای مرورگر است',
        'چون هر دو دقیقاً یک کار می‌کنند و یکی پشتیبان دیگری است',
      ],
      answer: 0,
      explain:
        'ترنسپایلرهای سریع برای سرعت، بررسی تایپ را حذف می‌کنند. `tsc --noEmit` همان بررسی را بدون هزینه‌ی نوشتن فایل انجام می‌دهد و در CI به‌عنوان دروازه‌ی کیفیت عمل می‌کند.',
    },
    lab: {
      task: 'یک تایپ برای «پیکربندی انتشار پکیج» بساز و یک نمونه‌ی معتبر با `exports` شرطی تولید کن.',
      starter: `type ExportCondition = {
  readonly types: string;
  readonly import: string;
  readonly require?: string;
};

type PackageManifest = {
  readonly name: string;
  readonly version: string;
  readonly type: 'module' | 'commonjs';
  readonly exports: Readonly<Record<string, ExportCondition>>;
  readonly files: readonly string[];
  readonly sideEffects: boolean;
};

const manifest: PackageManifest = {
  name: 'ts-studio-core',
  version: '1.0.0',
  type: 'module',
  exports: {
    '.': { types: './dist/index.d.ts', import: './dist/index.js', require: './dist/index.cjs' },
  },
  files: ['dist'],
  sideEffects: false,
};

console.log(manifest.name, manifest.exports['.']?.import, manifest.sideEffects);`,
      solution: `type PackageManifest = { name: string; version: string; exports: Record<string, ExportCondition>; files: readonly string[]; sideEffects: boolean };`,
    },
  },
];
