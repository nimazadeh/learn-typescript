/* ==========================================================================
   پیکربندی ESLint (flat config) — بدون هیچ وابستگی اضافه

   عمداً پکیج `globals` را نصب نمی‌کنیم: این پروژه فقط به مجموعه‌ی کوچکی
   از APIهای مرورگر و Node نیاز دارد و فهرست‌کردن همان‌ها هم دقیق‌تر است
   و هم `npm audit` را صفر نگه می‌دارد.

   هدف این لایه «گرفتن باگ» است نه «سلیقه‌ی قالب‌بندی»؛ قالب‌بندی کار
   Prettier است (npm run format).

   اجرا: npm run lint
   ========================================================================== */

/* APIهای سراسری مرورگر که اپلیکیشن واقعاً استفاده می‌کند.
   این فهرست از `grep` واقعی روی src/ به دست آمده، نه حدس. */
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  history: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  HTMLTextAreaElement: 'readonly',
  SVGElement: 'readonly',
  Element: 'readonly',
  Node: 'readonly',
  Event: 'readonly',
  CustomEvent: 'readonly',
  KeyboardEvent: 'readonly',
  MouseEvent: 'readonly',
  PointerEvent: 'readonly',
  Blob: 'readonly',
  FileReader: 'readonly',
  File: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  DOMParser: 'readonly',
  Worker: 'readonly',
  AudioContext: 'readonly',
  getComputedStyle: 'readonly',
  alert: 'readonly',
  confirm: 'readonly',
  print: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  matchMedia: 'readonly',
  structuredClone: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  queueMicrotask: 'readonly',
  performance: 'readonly',
  fetch: 'readonly',
  console: 'readonly',
};

/* APIهای سراسری Node که سرور و ابزارها استفاده می‌کنند. */
const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  performance: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  queueMicrotask: 'readonly',
  fetch: 'readonly',
  structuredClone: 'readonly',
  globalThis: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
};

/** قواعدی که «باگ» می‌گیرند؛ عمدداً سخت‌گیرانه ولی بدون قانونِ سلیقه‌ای. */
const bugCatchingRules = {
  // تعریف‌شده ولی استفاده‌نشده = بار مرده یا فراموشی
  'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
  // استفاده از نام تعریف‌نشده (همان باگی که در coachView رخ داد: `timerState is not defined`)
  'no-undef': 'error',
  'no-const-assign': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-duplicate-case': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'error',
  'no-unreachable': 'error',
  'no-unsafe-negation': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
  // حذف `const/let` باعث می‌شود متغیر ناخواسته سراسری شود
  'no-implicit-globals': 'error',
  // `return` بدون مقدار در تابعی که جای دیگر مقدار برمی‌گرداند
  'getter-return': 'error',
  'no-async-promise-executor': 'error',
  'no-await-in-loop': 'off', // در ابزارهای QA عمداً سریال اجرا می‌کنیم
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-fallthrough': 'error',
  'no-prototype-builtins': 'error',
  'no-regex-spaces': 'error',
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'require-atomic-updates': 'error',
  // فراخوانی تابع قبل از تعریف، در ESM برای function declaration مجاز است
  'no-use-before-define': ['error', { functions: false, classes: true, variables: false }],
  eqeqeq: ['error', 'always', { null: 'ignore' }],
};

export default [
  {
    ignores: ['node_modules/**', 'assets/**', 'dist/**', 'coverage/**'],
  },

  /* هیچ preset بیرونی وارد نمی‌کنیم (حتی @eslint/js) تا سطح وابستگی‌ها
     کوچک بماند و `npm audit` صفر؛ قواعد «باگ‌گیر» را خودمان فهرست کرده‌ایم. */

  /* --- کد اپلیکیشن: جاوااسکریپت مرورگر، ESM --- */
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: bugCatchingRules,
  },

  /* --- داده‌ی آموزشی ---
     رشته‌های معمولیِ محتوا عمداً کد نمونه‌ی TypeScript را با `${...}` نشان
     می‌دهند (مثلاً Template Literal Types). پس `no-template-curly-in-string`
     اینجا فقط نویز تولید می‌کند. */
  {
    files: ['src/data/**/*.js'],
    rules: {
      'no-template-curly-in-string': 'off',
      // داده‌ی محتوا یک آرایه/آبجکت بزرگ است؛ `no-undef` و... معنا ندارد
      'no-unused-vars': ['error', { varsIgnorePattern: '^(PART\\d+_LESSONS)$' }],
    },
  },

  /* --- سرور، موتور کامپایلر و ابزارهای QA: Node --- */
  {
    files: ['server.mjs', 'lib/**/*.mjs', 'tools/**/*.mjs', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...browserGlobals, ...nodeGlobals },
    },
    rules: {
      ...bugCatchingRules,
      // ابزارها عمداً برای گزارش، process.exit می‌کنند
      'no-process-exit': 'off',
    },
  },
  /* --- آزمون‌های موتور ---
     این فایل‌ها عمداً رشته‌های نمونه‌ی TypeScript را با `${...}` نگه می‌دارند
     (Template Literal Types در کدِ درس). چون در flat config «بلوکِ بعدی
     برنده است»، این override باید *پس از* بلوکِ Node بیاید. */
  {
    files: ['tools/**/*.test.mjs'],
    rules: {
      'no-template-curly-in-string': 'off',
    },
  },
];
