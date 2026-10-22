/* ==========================================================================
   Visual Diagrams — یک DSL اعلامی + چند رندرکننده برای همه‌ی نمودارهای استودیو
   (به‌جای ۳۶ نمودار دستی: یک موتور، ۳۶ توصیف داده‌ای — DRY محض)
   ========================================================================== */

import { el, svg, render } from '../core/dom.js';
import { svgRect, svgText } from './ui.js';
import { highlightedLines } from '../core/highlight.js';

/* -------------------------------------------------------------------------- */
/* Renderers                                                                   */
/* -------------------------------------------------------------------------- */

function renderVenn(spec) {
  const width = 520;
  const height = 260;
  const shapes = spec.sets.map((set) =>
    svg('g', { class: 'venn-set' }, [
      svg('circle', { cx: set.x, cy: set.y, r: set.r, class: `venn-blob tone-${set.tone ?? 'blue'}` }),
      svgText(set.x, set.y - set.r + 20, set.label, { class: 'venn-label' }),
      ...(set.items ?? []).map((item, i) =>
        svgText(set.x + (set.dx ?? 0), set.y - 6 + i * 20, item, { class: 'venn-item' })),
    ]),
  );

  return svgFrame(width, height, [
    ...shapes,
    spec.overlap && svgText(spec.overlap.x, spec.overlap.y, spec.overlap.label, { class: 'venn-overlap' }),
    spec.caption && svgText(width / 2, height - 12, spec.caption, { class: 'diagram-caption' }),
  ]);
}

function renderLattice(spec) {
  const width = 560;
  const rowH = 46;
  const height = spec.levels.length * rowH + 56;
  const nodes = [];
  const edges = [];

  spec.levels.forEach((level, rowIndex) => {
    const y = 26 + rowIndex * rowH;
    const cellW = width / (level.length + 1);
    level.forEach((item, colIndex) => {
      const cx = cellW * (colIndex + 1);
      nodes.push({ ...item, cx, y, rowIndex });
    });
  });

  (spec.links ?? []).forEach(([fromLabel, toLabel]) => {
    const a = nodes.find((n) => n.label === fromLabel);
    const b = nodes.find((n) => n.label === toLabel);
    if (!a || !b) return;
    edges.push(
      svg('line', {
        x1: a.cx, y1: a.y + 13, x2: b.cx, y2: b.y - 13,
        class: 'lattice-edge',
        'stroke-dasharray': a.rowIndex > b.rowIndex ? '4 4' : '0',
      }),
    );
  });

  const boxes = nodes.map((node) => {
    const w = Math.max(86, node.label.length * 9 + 26);
    return svg('g', {}, [
      svgRect(node.cx - w / 2, node.y - 13, w, 26, { class: `lattice-node tone-${node.tone ?? 'blue'}` }),
      svgText(node.cx, node.y, node.label, { class: 'lattice-label' }),
    ]);
  });

  return svgFrame(width, height, [
    ...edges,
    ...boxes,
    spec.caption && svgText(width / 2, height - 12, spec.caption, { class: 'diagram-caption' }),
  ]);
}

function renderFlow(spec) {
  const width = 560;
  const stepW = (width - 40) / spec.steps.length;
  const height = 132;
  const items = [];

  spec.steps.forEach((step, index) => {
    const x = 20 + index * stepW;
    items.push(
      svg('g', {}, [
        svgRect(x, 34, stepW - 14, 54, { class: `flow-node tone-${step.tone ?? 'blue'}` }),
        svgText(x + (stepW - 14) / 2, 52, step.title, { class: 'flow-title' }),
        svgText(x + (stepW - 14) / 2, 72, step.note ?? '', { class: 'flow-note' }),
      ]),
    );
    if (index < spec.steps.length - 1) {
      items.push(
        svg('path', {
          d: `M ${x + stepW - 12} 61 L ${x + stepW - 2} 61`,
          class: 'flow-arrow',
          'marker-end': 'url(#arrowhead)',
        }),
      );
    }
  });

  return svgFrame(width, height, [
    svg('defs', {}, [
      svg('marker', { id: 'arrowhead', markerWidth: 8, markerHeight: 8, refX: 6, refY: 3, orient: 'auto' }, [
        svg('path', { d: 'M0,0 L6,3 L0,6 Z', class: 'flow-arrow-head' }),
      ]),
    ]),
    spec.title && svgText(width / 2, 18, spec.title, { class: 'flow-head' }),
    ...items,
    spec.caption && svgText(width / 2, height - 10, spec.caption, { class: 'diagram-caption' }),
  ]);
}

function renderCompare(spec) {
  return el('div', { class: 'compare-grid' }, spec.columns.map((col) =>
    el('div', { class: `compare-col tone-${col.tone}` }, [
      el('h5', { class: 'compare-title' }, [col.icon ? `${col.icon} ` : '', col.title]),
      el('ul', { class: 'compare-list' }, col.rows.map((row) => el('li', { text: row }))),
      col.foot && el('p', { class: 'compare-foot', text: col.foot }),
    ]),
  ));
}

function renderTable(spec) {
  return el('div', { class: 'table-scroll' }, [
    el('table', { class: 'data-table' }, [
      el('thead', {}, [el('tr', {}, spec.headers.map((h, i) => el('th', { dir: i === 0 ? 'ltr' : 'rtl', text: h })))]),
      el('tbody', {}, spec.rows.map((row) =>
        el('tr', {}, row.map((cell, i) => el('td', {
          dir: /^[A-Za-z0-9_`[\]|&<>{}(),.'":? -]+$/.test(String(cell)) ? 'ltr' : 'rtl',
          text: cell,
        })))),
      ),
    ]),
    spec.caption && el('p', { class: 'diagram-caption', text: spec.caption }),
  ]);
}

function renderAnatomy(spec) {
  return el('div', { class: 'anatomy' }, [
    el('pre', { class: 'anatomy-code', dir: 'ltr', innerHTML: highlightedLines(spec.code.replace(/\s+$/, '')) }),
    el('ol', { class: 'anatomy-notes' }, spec.parts.map((part, i) =>
      el('li', {}, [el('strong', { text: `${i + 1}. ` }), el('span', { text: part })]))),
  ]);
}

function renderBars(spec) {
  const max = Math.max(...spec.bars.map((b) => b.value));
  return el('div', { class: 'bar-chart' }, [
    ...spec.bars.map((bar) =>
      el('div', { class: 'bar-row' }, [
        el('span', { class: 'bar-label', text: bar.label }),
        el('div', { class: 'bar-track' }, [
          el('div', {
            class: `bar-fill tone-${bar.tone ?? 'blue'}`,
            style: { width: `${Math.max(4, (bar.value / max) * 100)}%` },
          }),
        ]),
        el('span', { class: 'bar-value', dir: 'ltr', text: String(bar.value) }),
      ]),
    ),
    spec.caption && el('p', { class: 'diagram-caption', text: spec.caption }),
  ]);
}

const RENDERERS = {
  venn: renderVenn,
  lattice: renderLattice,
  flow: renderFlow,
  compare: renderCompare,
  table: renderTable,
  anatomy: renderAnatomy,
  bars: renderBars,
};

function svgFrame(width, height, children) {
  return el('div', { class: 'svg-scroll' }, [
    svg('svg', {
      viewBox: `0 0 ${width} ${height}`,
      class: 'diagram-svg',
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
    }, children.filter(Boolean)),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Diagram data — هر کلید یک توصیف داده‌ای است، نه کد رندر                     */
/* -------------------------------------------------------------------------- */

const DIAGRAMS = {
  eraser: {
    kind: 'flow',
    title: 'چرخه‌ی حیات یک فایل TypeScript',
    steps: [
      { title: 'source.ts', note: 'کد + تایپ‌ها', tone: 'blue' },
      { title: 'tsc', note: 'بررسی + حذف تایپ', tone: 'violet' },
      { title: 'bundle.js', note: 'فقط JavaScript', tone: 'amber' },
      { title: 'Runtime', note: 'Node / Browser', tone: 'green' },
    ],
    caption: 'تایپ‌ها فقط در دو مرحله‌ی اول وجود دارند — در زمان اجرا صفر سربار',
  },

  'type-lattice': {
    kind: 'lattice',
    levels: [
      [{ label: 'unknown', tone: 'violet' }, { label: 'any', tone: 'danger' }],
      [{ label: 'object', tone: 'blue' }, { label: 'string', tone: 'blue' }, { label: 'number', tone: 'blue' }],
      [{ label: '"admin"', tone: 'green' }, { label: '42', tone: 'green' }, { label: 'true', tone: 'green' }],
      [{ label: 'never', tone: 'slate' }],
    ],
    links: [
      ['unknown', 'object'], ['unknown', 'string'], ['unknown', 'number'],
      ['object', 'never'], ['string', '"admin"'], ['number', '42'],
      ['"admin"', 'never'], ['42', 'never'], ['true', 'never'],
    ],
    caption: 'بالا = گسترده‌تر (همه را می‌پذیرد) · پایین = باریک‌تر (مقادیر کمتر) · never = مجموعه‌ی تهی',
  },

  compare: {
    kind: 'compare',
    columns: [
      { title: 'JavaScript', icon: '🟨', tone: 'amber', rows: ['خطا در زمان اجرا', 'بدون قرارداد صریح', 'Refactor پرخطر', 'مستندات کهنه‌شدنی', 'setup صفر'] },
      { title: 'TypeScript', icon: '🟦', tone: 'blue', rows: ['خطا روی کیبورد', 'تایپ = قرارداد زنده', 'Refactor با اطمینان', 'مستندات همیشه همگام', 'یک مرحله‌ی build'] },
    ],
  },

  interop: {
    kind: 'flow',
    title: 'مسیرهای تعامل TS و JS',
    steps: [
      { title: '.js موجود', note: 'allowJs', tone: 'amber' },
      { title: 'JSDoc', note: 'checkJs', tone: 'blue' },
      { title: '.d.ts', note: '@types/*', tone: 'violet' },
      { title: '.ts کامل', note: 'strict: true', tone: 'green' },
    ],
    caption: 'مهاجرت تدریجی: هیچ‌وقت لازم نیست کل کدبیس را یک‌جا تبدیل کنی',
  },

  folders: {
    kind: 'table',
    headers: ['مسیر', 'نقش', 'در git؟'],
    rows: [
      ['src/', 'کد منبع TypeScript', 'بله'],
      ['dist/', 'خروجی کامپایل (JS + .d.ts)', 'خیر — gitignore'],
      ['types/', 'فایل‌های .d.ts سفارشی و اعلان‌های سراسری', 'بله'],
      ['tests/', 'تست‌ها (Vitest / Jest)', 'بله'],
      ['tsconfig.json', 'قرارداد build و سخت‌گیری پروژه', 'بله'],
      ['node_modules/', 'وابستگی‌ها', 'خیر — gitignore'],
    ],
  },

  tsconfig: {
    kind: 'anatomy',
    code: `{
  "compilerOptions": {
    "target": "ES2022",        // 1
    "module": "NodeNext",      // 2
    "strict": true,            // 3
    "outDir": "dist",          // 4
    "rootDir": "src",          // 4
    "declaration": true        // 5
  },
  "include": ["src/**/*.ts"]   // 6
}`,
    parts: [
      'target → نسخه‌ی JavaScript خروجی (Downlevel)',
      'module + moduleResolution → سیستم ماژول و نحوه‌ی یافتن فایل‌ها',
      'strict → چتر هفت بررسی سخت‌گیرانه (مهم‌ترین گزینه)',
      'outDir/rootDir → جداسازی منبع از خروجی',
      'declaration → تولید .d.ts برای مصرف‌کننده‌های تایپی',
      'include → کدام فایل‌ها بخشی از پروژه‌اند',
    ],
  },

  flags: {
    kind: 'table',
    headers: ['پرچم', 'چه باگی را می‌گیرد', 'در strict؟'],
    rows: [
      ['noImplicitAny', 'پارامتر/متغیر با تایپ any ضمنی', 'بله'],
      ['strictNullChecks', 'دسترسی به null/undefined بدون بررسی', 'بله'],
      ['noUncheckedIndexedAccess', 'arr[i] می‌تواند undefined باشد', 'خیر'],
      ['exactOptionalPropertyTypes', 'اختلاط «کلید نیست» با «کلید = undefined»', 'خیر'],
      ['noImplicitOverride', 'بازنویسی کهنه/ناخواسته در کلاس فرزند', 'خیر'],
      ['noUnusedLocals', 'کد مرده و متغیر بی‌مصرف', 'خیر'],
      ['noFallthroughCasesInSwitch', 'case بدون break که ناخواسته می‌ریزد', 'خیر'],
    ],
    caption: 'پرچم‌هایی که در strict نیستند، بیشترین سود را نسبت به هزینه دارند',
  },

  pipeline: {
    kind: 'flow',
    title: 'چهار مسیر اجرای TypeScript',
    steps: [
      { title: 'tsc + node', note: 'دقیق · کند', tone: 'green' },
      { title: 'tsx', note: 'سریع · بدون check', tone: 'blue' },
      { title: 'node --strip-types', note: 'بومی · erasable', tone: 'violet' },
      { title: 'bundler', note: 'Vite/esbuild', tone: 'amber' },
    ],
  },

  terminal: {
    kind: 'table',
    headers: ['فرمان', 'کاربرد', 'کی؟'],
    rows: [
      ['tsc --noEmit', 'بررسی تایپ بدون تولید فایل', 'CI و قبل از هر commit'],
      ['tsc -w', 'کامپایل/بررسی پیوسته', 'حین توسعه'],
      ['tsc --showConfig', 'چاپ پیکربندی نهایی پس از extends', 'دیباگ tsconfig'],
      ['tsc --explainFiles', 'چرا این فایل وارد برنامه شد', 'دیباگ پروژه‌های بزرگ'],
      ['tsc -p tsconfig.json', 'کامپایل یک پروژه‌ی مشخص', 'build رسمی'],
      ['tsc file.ts', '⚠️ tsconfig را نادیده می‌گیرد!', 'فقط آزمایش سریع'],
    ],
  },

  runners: {
    kind: 'table',
    headers: ['ابزار', 'type-check؟', 'سرعت', 'بهترین کاربرد'],
    rows: [
      ['tsc', 'بله (کامل)', 'کند', 'build رسمی و CI'],
      ['ts-node', 'بله (پیش‌فرض)', 'متوسط', 'اسکریپت‌های Node'],
      ['tsx (esbuild)', 'خیر', 'بسیار سریع', 'توسعه‌ی روزمره + watch'],
      ['node --strip-types', 'خیر', 'بومی', 'Node 22+ بدون وابستگی'],
      ['vitest / jest', 'خیر (transpile)', 'سریع', 'تست‌ها'],
    ],
  },

  playground: {
    kind: 'anatomy',
    code: `const settings = { theme: 'dark', hours: 5 };
//    ^?
type Keys = keyof typeof settings;
//   ^?`,
    parts: [
      '^? زیر `settings` → تایپ استنتاج‌شده را در همان خط چاپ می‌کند: `{ theme: string; hours: number }`',
      '^? زیر `Keys` → `"theme" | "hours"`',
      'این تنها ابزار برای دیدن تایپ‌های پیچیده‌ی شرطی و mapped است — بدون آن داری حدس می‌زنی',
      'در همین استودیو، ستون «Type X-Ray» همان کار را خودکار انجام می‌دهد',
    ],
  },

  'interface-shape': {
    kind: 'venn',
    sets: [
      { label: 'interface Lesson', x: 200, y: 130, r: 96, tone: 'blue', items: ['id', 'title', 'minutes'], dx: -34 },
      { label: 'مقدار واقعی', x: 320, y: 130, r: 86, tone: 'green', items: ['+ note?'], dx: 40 },
    ],
    overlap: { x: 262, y: 210, label: 'سازگار (Structural)' },
    caption: 'هر مقداری که حداقل اعضای قرارداد را داشته باشد، آن اینترفیس را ارضا می‌کند',
  },

  'class-vs-type': {
    kind: 'compare',
    columns: [
      { title: 'User (تایپ نمونه)', icon: '🧬', tone: 'blue', rows: ['شکل یک instance', 'نتیجه‌ی new User()', 'برای متغیرها و پارامترها', 'فقط زمان کامپایل'] },
      { title: 'typeof User (تایپ سازنده)', icon: '🏭', tone: 'violet', rows: ['شکل خود کلاس', 'شامل امضای new', 'برای Factory و DI', 'فقط زمان کامپایل'] },
    ],
  },

  'enum-vs-const': {
    kind: 'compare',
    columns: [
      { title: 'enum (قدیمی)', icon: '🧱', tone: 'danger', rows: ['کد زمان اجرا می‌سازد', 'numeric enum هر عددی را می‌پذیرد', 'با isolatedModules مشکل دارد', 'erasable نیست'] },
      { title: 'as const + Union', icon: '✨', tone: 'green', rows: ['کاملاً erasable', 'فقط مقادیر معتبر', 'با هر باندلری سازگار', 'Record<Union,T> → exhaustiveness'] },
    ],
  },

  'array-readonly': {
    kind: 'venn',
    sets: [
      { label: 'readonly T[]', x: 230, y: 128, r: 112, tone: 'blue', items: ['map / filter / reduce', 'length', 'بدون push/sort'], dx: -44 },
      { label: 'T[]', x: 330, y: 128, r: 78, tone: 'green', items: ['+ push', '+ sort', '+ splice'], dx: 44 },
    ],
    caption: 'T[] زیرمجموعه‌ی readonly T[] است → انتساب فقط در این جهت مجاز است',
  },

  'tuple-structure': {
    kind: 'table',
    headers: ['تایپ', 'طول', 'مثال معتبر'],
    rows: [
      ['number[]', 'متغیر', '[1, 2, 3]'],
      ['[number, string]', 'دقیقاً ۲', '[42, "x"]'],
      ['[string, number?]', '۱ یا ۲', '["a"] یا ["a", 1]'],
      ['[string, ...number[]]', 'حداقل ۱', '["total", 1, 2, 3]'],
      ['readonly [1, 2]', 'دقیقاً ۲ (لیترال)', '[1, 2] بدون push'],
    ],
  },

  'unknown-vs-any': {
    kind: 'compare',
    columns: [
      { title: 'any', icon: '☠️', tone: 'danger', rows: ['هر ورودی ✓', 'هر استفاده ✓', 'هر خروجی ✓', 'کامپایلر خاموش', 'مسری به کل کدبیس'] },
      { title: 'unknown', icon: '🛡️', tone: 'green', rows: ['هر ورودی ✓', 'استفاده ✗ تا Narrow', 'انتساب به تایپ دیگر ✗', 'کامپایلر حساس‌تر', 'در مرز متوقف می‌شود'] },
    ],
  },

  'never-lattice': {
    kind: 'lattice',
    levels: [
      [{ label: 'unknown / any', tone: 'violet' }],
      [{ label: 'string', tone: 'blue' }, { label: 'number', tone: 'blue' }],
      [{ label: '"a"', tone: 'green' }, { label: '42', tone: 'green' }],
      [{ label: 'never', tone: 'slate' }],
    ],
    links: [['unknown / any', 'string'], ['unknown / any', 'number'], ['string', '"a"'], ['number', '42'], ['"a"', 'never'], ['42', 'never']],
    caption: 'never زیرمجموعه‌ی همه‌ی تایپ‌هاست → انتساب آن به هر تایپی مجاز است (و در Union حذف می‌شود)',
  },

  variance: {
    kind: 'table',
    headers: ['جایگاه', 'جهت مجاز', 'نام'],
    rows: [
      ['پارامتر تابع', 'پهن‌تر (unknown ← string)', 'Contravariant'],
      ['بازگشتی تابع', 'باریک‌تر (Dog ← Animal)', 'Covariant'],
      ['عضو readonly آبجکت', 'باریک‌تر', 'Covariant'],
      ['T[] تغییرپذیر', 'باریک‌تر (⚠️ ناامن تاریخی)', 'Covariant ناسالم'],
      ['readonly T[]', 'باریک‌تر (امن)', 'Covariant'],
    ],
    caption: 'قاعده‌ی طلایی: ورودی پهن‌تر، خروجی باریک‌تر (اصل جایگزینی Liskov)',
  },

  'inference-flow': {
    kind: 'flow',
    title: 'مسیر تصمیم کامپایلر برای استنتاج تایپ',
    steps: [
      { title: 'Annotation؟', note: 'اگر بود → همان', tone: 'green' },
      { title: 'زمینه؟', note: 'پارامتر/بازگشت', tone: 'blue' },
      { title: 'مقدار اولیه؟', note: 'const→لیترال', tone: 'violet' },
      { title: 'Widening', note: 'let→تایپ پایه', tone: 'amber' },
    ],
  },

  'combine-venn': {
    kind: 'venn',
    sets: [
      { label: 'A | B  (Union)', x: 150, y: 120, r: 78, tone: 'blue', items: ['مقادیر A', '+ مقادیر B'], dx: -18 },
      { label: 'A & B', x: 300, y: 120, r: 78, tone: 'green', items: ['الزامات A', '+ الزامات B'], dx: 26 },
      { label: 'keyof T', x: 440, y: 120, r: 62, tone: 'violet', items: ['کلیدهای T'], dx: 0 },
    ],
    caption: 'Union = اجتماع مقادیر · Intersection = اجتماع الزامات · keyof = مجموعه‌ی کلیدها',
  },

  'union-narrow': {
    kind: 'flow',
    title: 'Discriminated Union + switch',
    steps: [
      { title: 'Result<T>', note: 'ok | error | pending', tone: 'blue' },
      { title: 'switch (kind)', note: 'کلید مشترک', tone: 'violet' },
      { title: 'case "ok"', note: 'value: T', tone: 'green' },
      { title: 'default', note: 'never → exhaustiveness', tone: 'amber' },
    ],
  },

  'narrowing-tree': {
    kind: 'flow',
    title: 'ترتیب بهینه‌ی گاردها (حذف تدریجی)',
    steps: [
      { title: 'typeof', note: 'انواع اولیه', tone: 'blue' },
      { title: 'instanceof', note: 'کلاس‌ها', tone: 'violet' },
      { title: 'in / discriminant', note: 'ساختار آبجکت', tone: 'amber' },
      { title: 'predicate', note: 'منطق سفارشی', tone: 'green' },
    ],
  },

  'predicate-flow': {
    kind: 'flow',
    title: 'جریان یک Type Predicate',
    steps: [
      { title: 'ورودی unknown', note: 'مرز سیستم', tone: 'slate' },
      { title: 'is User(v)', note: 'بررسی خالص', tone: 'blue' },
      { title: 'true → User', note: 'Narrowing خودکار', tone: 'green' },
      { title: 'false → fallback', note: 'مسیر خطا', tone: 'danger' },
    ],
  },

  'mapped-anatomy': {
    kind: 'anatomy',
    code: `type OnlyStrings<T> = {
  readonly [K in keyof T as T[K] extends string ? K : never]-?: string;
};`,
    parts: [
      'keyof T → منبع کلیدها (پیمایش مثل حلقه)',
      'as ... ? K : never → تغییرنام یا حذف کلید (با never)',
      'readonly → modifier افزودن تغییرناپذیری',
      '-? → modifier حذف اختیاری بودن (+? افزودن، -readonly حذف)',
      'string → تایپ مقدار هر فیلد (می‌تواند T[K] یا هر عبارت باشد)',
    ],
  },

  'conditional-tree': {
    kind: 'flow',
    title: 'اجرای یک Conditional Type توزیع‌شده روی Union',
    steps: [
      { title: 'T = A | B', note: 'ورودی Union', tone: 'blue' },
      { title: 'توزیع', note: 'Generic برهنه؟', tone: 'violet' },
      { title: 'Cond<A>', note: 'شاخه‌ی مستقل', tone: 'amber' },
      { title: 'Cond<A>|Cond<B>', note: 'نتیجه‌ی نهایی', tone: 'green' },
    ],
    caption: 'با [T] extends [U] توزیع خاموش می‌شود و کل Union یک واحد است',
  },

  'template-literal': {
    kind: 'table',
    headers: ['الگو', 'نتیجه', 'کاربرد'],
    rows: [
      ['`${"a"|"b"}-${1|2}`', '"a-1" | "a-2" | "b-1" | "b-2"', 'ضرب کارتزینی'],
      ['`on${Capitalize<"click">}`', '"onClick"', 'نام handler'],
      ['`p-${4|8|16}`', '"p-4" | "p-8" | "p-16"', 'کلاس‌های CSS'],
      ['`/users/${string}`', 'مسیر با بخش آزاد', 'مسیریابی نوع‌دار'],
      ['`${infer H}/${infer T}`', 'تجزیه‌ی رشته', 'پارس مسیر/کلید'],
    ],
  },

  'recursive-tree': {
    kind: 'flow',
    title: 'بازگشت تایپ: شرط پایه اول، بعد بازگشت',
    steps: [
      { title: 'تابع؟', note: '→ همان T', tone: 'slate' },
      { title: 'آرایه؟', note: '→ ReadonlyArray<...>', tone: 'blue' },
      { title: 'object؟', note: '→ پیمایش کلیدها', tone: 'violet' },
      { title: 'اولیه؟', note: '→ readonly T', tone: 'green' },
    ],
    caption: 'اگر شرط object اول بیاید، توابع و آرایه‌ها خرد می‌شوند (آن‌ها هم object‌اند)',
  },

  'type-programming': {
    kind: 'table',
    headers: ['مفهوم برنامه‌نویسی', 'معادل در سطح تایپ'],
    rows: [
      ['متغیر', 'type alias'],
      ['پارامتر تابع', 'Generic <T>'],
      ['if/else', 'Conditional Type (T extends U ? X : Y)'],
      ['حلقه for', 'Mapped Type ([K in keyof T])'],
      ['pattern matching', 'infer'],
      ['نوع داده‌ی جبری', 'Union از object typeها'],
      ['تابع بازگشتی', 'تایپ بازگشتی (DeepReadonly)'],
      ['کتابخانه‌ی استاندارد', 'Utility Types داخلی'],
    ],
  },

  'module-graph': {
    kind: 'flow',
    title: 'مسیر یک import در پروژه‌ی ESM',
    steps: [
      { title: './mod.js', note: 'مسیر با پسوند خروجی', tone: 'amber' },
      { title: 'mod.ts', note: 'فایل واقعی منبع', tone: 'blue' },
      { title: 'tsc / bundler', note: 'حل مسیر', tone: 'violet' },
      { title: 'dist/mod.js', note: 'خروجی اجراشدنی', tone: 'green' },
    ],
    caption: 'با moduleResolution: NodeNext باید پسوند .js بنویسی حتی برای فایل .ts',
  },

  'class-anatomy': {
    kind: 'anatomy',
    code: `class Session {
  static readonly MAX = 5;      // 1
  #minutes = 0;                 // 2
  private label: string;        // 3
  readonly id: string;          // 4
  constructor(id: string, label: string) { this.id = id; this.label = label; }
  add(n: number): void { this.#minutes += n; }  // 5
}`,
    parts: [
      'static readonly → عضو کلاس (نه نمونه)، تغییرناپذیر',
      '#minutes → خصوصی واقعی زمان اجرا (ECMAScript private)',
      'private label → خصوصی فقط زمان کامپایل (با as any قابل دور زدن)',
      'readonly id → فقط در constructor قابل نوشتن',
      'متد عمومی → تنها سطح تماس بیرونی کلاس',
    ],
  },

  'generic-flow': {
    kind: 'flow',
    title: 'جریان یک Generic از فراخوانی تا بازگشت',
    steps: [
      { title: 'فراخوانی', note: 'identity("a")', tone: 'blue' },
      { title: 'استنتاج', note: 'T = "a"', tone: 'violet' },
      { title: 'قید', note: 'T extends ...؟', tone: 'amber' },
      { title: 'بازگشت', note: 'T (دقیق)', tone: 'green' },
    ],
  },

  'utility-map': {
    kind: 'table',
    headers: ['دسته', 'ابزارها', 'سؤال پاسخ‌داده‌شده'],
    rows: [
      ['ضرورت/تغییرپذیری', 'Partial · Required · Readonly', 'آیا فیلد اجباری/قابل تغییر است؟'],
      ['انتخاب فیلد', 'Pick · Omit · Record', 'کدام فیلدها را لازم دارم؟'],
      ['تهی‌زدایی', 'NonNullable · Exclude', 'کدام مقادیر تهی حذف شوند؟'],
      ['استخراج از تابع', 'Parameters · ReturnType · InstanceType · ConstructorParameters', 'امضای این تابع/کلاس چیست؟'],
      ['Promise', 'Awaited', 'بعد از await چه تایپی می‌ماند؟'],
      ['رشته', 'Uppercase · Capitalize · Lowercase · Uncapitalize', 'تبدیل نام‌ها در سطح تایپ'],
    ],
  },

  'interface-architecture': {
    kind: 'flow',
    title: 'وابستگی به قرارداد، نه پیاده‌سازی',
    steps: [
      { title: 'UI / Service', note: 'مصرف‌کننده', tone: 'blue' },
      { title: 'Repository<T>', note: 'interface', tone: 'violet' },
      { title: 'InMemoryRepo', note: 'پیاده‌سازی ۱', tone: 'green' },
      { title: 'PostgresRepo', note: 'پیاده‌سازی ۲', tone: 'amber' },
    ],
    caption: 'تعویض پیاده‌سازی = صفر تغییر در مصرف‌کننده · تست = mock ساده',
  },

  'satisfies-compare': {
    kind: 'table',
    headers: ['ابزار', 'بررسی می‌کند؟', 'تایپ نهایی', 'کاربرد'],
    rows: [
      [': T (annotation)', 'بله', 'T (دقت از دست می‌رود)', 'وقتی واقعاً تایپ T را می‌خواهی'],
      ['as T (assertion)', 'خیلی کم', 'T (ادعای تو)', 'مرزهای بیرونی، DOM API'],
      ['satisfies T', 'بله (کامل)', 'تایپ استنتاج‌شده‌ی دقیق', 'ثابت‌ها، نگاشت‌ها، کانفیگ'],
      ['as const satisfies T', 'بله', 'لیترال‌های readonly دقیق', 'قدرتمندترین ترکیب'],
    ],
  },

  'as-const-transform': {
    kind: 'compare',
    columns: [
      { title: 'بدون as const', icon: '🔓', tone: 'amber', rows: ['theme: string', 'items: string[]', 'قابل تغییر', 'تایپ کلی'] },
      { title: 'با as const', icon: '🔒', tone: 'green', rows: ['theme: "dark"', 'items: readonly ["a","b"]', 'غیرقابل تغییر', 'لیترال‌های دقیق + قابل مشتق‌سازی'] },
    ],
  },
};

/** Renders a diagram by key; returns null when the key is unknown. */
export function diagram(key) {
  const spec = DIAGRAMS[key];
  if (!spec) return null;
  const renderer = RENDERERS[spec.kind];
  if (!renderer) return null;
  return el('div', { class: `diagram diagram-${spec.kind}` }, [renderer(spec)]);
}

export function diagramKeys() {
  return Object.keys(DIAGRAMS);
}

/** Renders a diagram into a container (used when refreshing after theme change). */
export function mountDiagram(container, key) {
  const node = diagram(key);
  if (node) render(container, node);
  return Boolean(node);
}
