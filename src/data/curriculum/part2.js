/* ==========================================================================
   فصل ۲ — سیستم تایپ: انواع اولیه و آبجکتی
   (Primitive Types · Object Types · Interface · Class · Enum · Array · Tuple)
   ========================================================================== */

export const PART2_LESSONS = [
  {
    id: 'ts-types-overview',
    chapter: 'ch2',
    titleFa: 'نگرش کلی به تایپ‌های TypeScript',
    titleEn: 'TypeScript Types',
    level: 'beginner',
    minutes: 30,
    goal: 'نقشه‌ی ذهنی کامل تایپ‌ها را بسازی: از انواع اولیه تا انواع بالا/پایین، و بفهمی هر تایپ یک «مجموعه از مقادیر» است.',
    steps: [
      {
        h: 'گام ۱ — مدل ذهنی: تایپ = مجموعه‌ی مقادیر مجاز',
        p:
          'هر تایپ را یک **مجموعه (Set)** از مقادیر ببین. `boolean` مجموعه‌ای با ۲ عضو، `"a" | "b"` مجموعه‌ای با ۲ عضو، `string` مجموعه‌ای بی‌نهایت، و `never` مجموعه‌ی **تهی**. تمام عملیات تایپ (Union، Intersection، extends، Narrowing) در واقع عملیات مجموعه‌ها هستند.',
      },
      {
        h: 'گام ۲ — چهار خانواده‌ی اصلی تایپ‌ها',
        p:
          '۱) **انواع اولیه (Primitive)**: `boolean`، `number`، `string`، `bigint`، `symbol`، `undefined`، `null`، `void`. ۲) **انواع آبجکتی**: `interface`، `class`، `enum`، `Array`، `Tuple`، `Object`، و object literal type. ۳) **انواع بالا (Top)**: `unknown` و `any` که همه‌چیز را می‌پذیرند. ۴) **انواع پایین (Bottom)**: `never` که هیچ مقداری ندارد.',
        code: `const isReady: boolean = true;
const hours: number = 5;
const focus: string = 'TypeScript';
const ids: number[] = [1, 2, 3];
const pair: [string, number] = ['age', 30];

type User = { id: number; name: string };
const user: User = { id: 1, name: 'Nima' };
const mystery: unknown = user;
//    ^?  → unknown (تا وقتی Narrow نشود، هیچ دسترسی مجاز نیست)`,
      },
      {
        h: 'گام ۳ — ترتیب یادگیری بهینه (مسیر کم‌هزینه)',
        p:
          'ترتیب پیشنهادی: Primitive → Object/Interface → Union و Narrowing → Generics → Utility Types → Advanced Types. دلیل این ترتیب: هر مفهوم فقط به مفاهیم قبلی وابسته است و هیچ‌وقت مجبور نمی‌شوی «جلو جلو» فکر کنی.',
      },
      {
        h: 'گام ۴ — سه حالت نوشتن تایپ: صریح، استنتاجی، مشتق',
        p:
          'صریح: `const x: number = 5`. استنتاجی (پیش‌فرض بهتر): `const x = 5`. مشتق (حرفه‌ای‌ترین): `type X = ReturnType<typeof fn>` یا `type Keys = keyof User`. هنر TypeScript در **کمترین annotation صریح با بیشترین دقت** است.',
        code: `// ❌ تکرار و احتمال خطا (نقض DRY):
type User = { id: number; name: string };
const admin: { id: number; name: string } = { id: 1, name: 'Root' };

// ✅ یک منبع حقیقت:
const admin: User = { id: 1, name: 'Root' };

// ✅ مشتق‌سازی از یک آبجکت واقعی (بدون تکرار هیچ تایپی):
const config = { theme: 'dark', fontSize: 14 } as const;
type Config = typeof config;
type ConfigKey = keyof Config; // 'theme' | 'fontSize'`,
      },
    ],
    visual: 'type-lattice',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۰',
        title: 'فرمول مجموعه‌ها در تایپ',
        body:
          'هر سؤال تایپی را به سؤال مجموعه‌ها ترجمه کن: «آیا A زیرمجموعه‌ی B است؟» اگر بله، انتساب مجاز است. `string | number` زیرمجموعه‌ی `unknown` است، پس انتساب به `unknown` همیشه مجاز است. همین یک فرمول، ۹۰٪ خطاهای TS2322 را قابل پیش‌بینی می‌کند.',
        equation: 'انتساب A → B مجاز است اگر و تنها اگر A ⊆ B',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «نقاشی تایپ»',
        body:
          'برای هر مفهوم جدید، یک دیاگرام Venn روی کاغذ بکش: چه مقادیری داخل مجموعه‌اند، چه مقادیری بیرون. این کار ۵ دقیقه‌ای، انتزاع را به تصویر تبدیل می‌کند و حافظه‌ی دیداری را درگیر می‌سازد.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'اول `type`/`interface` بنویس، بعد مقدار',
        body:
          'در طراحی، اول **شکل داده** را بنویس بعد پیاده‌سازی. وقتی تایپ‌ها درست طراحی شوند، کد اجرایی تقریباً خودش نوشته می‌شود («Type-Driven Development»).',
      },
    ],
    quiz: {
      q: 'کدام گزینه بهترین توصیف از رابطه‌ی تایپ‌ها در TypeScript است؟',
      options: [
        'هر تایپ یک مجموعه از مقادیر مجاز است و انتساب زمانی مجاز است که تایپ مبدأ زیرمجموعه‌ی مقصد باشد',
        'تایپ‌ها فقط برچسب‌های متنی هستند و رابطه‌ی ریاضی ندارند',
        'هر تایپ دقیقاً باید با تایپ دیگر یکسان باشد تا انتساب مجاز شود',
        'تایپ‌ها فقط در زمان اجرا معنا دارند',
      ],
      answer: 0,
      explain:
        'TypeScript یک سیستم تایپ ساختاری (Structural) مبتنی بر زیرمجموعه‌بودن است؛ یعنی assignability دقیقاً با رابطه‌ی زیرمجموعه بودن مقادیر تعیین می‌شود، نه با نام تایپ‌ها.',
    },
    lab: {
      task: 'برای یک «برنامه‌ی مطالعه‌ی روزانه» تایپ طراحی کن: هر روز شامل موضوع، ساعات و وضعیت باشد. سپس از `typeof` و `keyof` تایپ کلیدها را مشتق کن.',
      starter: `type StudyDay = {
  readonly topic: string;
  readonly hours: number;
  readonly status: 'planned' | 'done' | 'skipped';
};

const today: StudyDay = { topic: 'Type System', hours: 5, status: 'planned' };

// ⬇️ تایپ کلیدها را مشتق کن:
type DayKey = keyof StudyDay;

console.log(today.topic, today.hours, today.status);`,
      solution: `type DayKey = keyof StudyDay; // 'topic' | 'hours' | 'status'

const key: DayKey = 'hours';
console.log(today[key]); // 5`,
    },
  },

  {
    id: 'type-boolean',
    chapter: 'ch2',
    titleFa: 'تایپ boolean',
    titleEn: 'boolean',
    level: 'beginner',
    minutes: 15,
    goal: 'تایپ بولین را درست استفاده کنی و از سه اشتباه رایج آن (Boolean آبجکت، لیترال true/false، و nullable boolean) پرهیز کنی.',
    steps: [
      {
        h: 'گام ۱ — `boolean` با b کوچک',
        p:
          'همیشه `boolean` بنویس نه `Boolean`. `Boolean` نوع آبجکت wrapper است و تقریباً هرگز چیزی که می‌خواهی نیست. `boolean` فقط دو مقدار دارد: `true` و `false`.',
        code: `let isActive: boolean = true;
const strictMode: boolean = false;

// ❌ هرگز این را ننویس:
// let wrong: Boolean = true;   // آبجکت wrapper — رفتار غیرمنتظره

// ✅ لیترال‌های بولین (برای APIهای تنظیمات):
type FeatureFlag = true;
const enabled: FeatureFlag = true;`,
      },
      {
        h: 'گام ۲ — استنتاج بولین و پهن‌شدن تایپ (Widening)',
        p:
          'با `const` تایپ به لیترال `true` محدود می‌شود؛ با `let` به `boolean` گسترش می‌یابد (چون قابل تغییر است). این تفاوت کوچک، پایه‌ی درک Literal Types است.',
        code: `const locked = true;   // type: true  (لیترال)
let flexible = true;   // type: boolean (گسترش‌یافته)

//    locked   ^?  → const locked: true
//    flexible ^?  → let flexible: boolean`,
      },
      {
        h: 'گام ۳ — boolean در برابر Union لیترال',
        p:
          'وقتی «دو حالت» داری، `boolean` کافی است. وقتی **بیش از دو حالت** داری یا حالت‌ها معنای متفاوت دارند، از Union لیترال استفاده کن. دو پارامتر boolean پشت سر هم تقریباً همیشه نشانه‌ی طراحی بد است.',
        code: `// ❌ نامفهوم و مستعد خطا:
function save(dryRun: boolean, forceFlag: boolean): void {}

// ✅ خودتکلم و غیرقابل اشتباه:
type SaveMode = 'commit' | 'dry-run' | 'force';
function save(mode: SaveMode): void {}

save('dry-run'); // خواننده دقیقاً می‌فهمد چه اتفاقی می‌افتد`,
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'روش «کمینه‌سازی بولین»',
        body:
          'هر پارامتر `boolean` که به تابعی اضافه می‌کنی، تعداد مسیرهای اجرایی را **دو برابر** می‌کند. پیش از اضافه کردن بولین جدید بپرس: آیا این دو حالت معنای متفاوتی دارند؟ اگر بله، Union لیترال بنویس. این یک قاعده‌ی طراحی است، نه سلیقه.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'پدیده‌ی «انفجار بولین» (Boolean Trap)',
        body:
          'تابع `createUser(true, false, true)` در نقطه‌ی فراخوانی کاملاً غیرقابل فهم است. بیش از **یک** پارامتر boolean در یک تابع، بوی بد طراحی است؛ به‌جایش از Union لیترال یا یک آبجکت گزینه‌ها استفاده کن.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'نام‌گذاری predicateها با is/has/can/should',
        body:
          'متغیرها و توابع بولین را با پیشوند `is`، `has`، `can`، `should` بنام‌گذاری کن: `isLoading`، `hasError`، `canEdit`. این کار شرط‌ها را به جمله‌ی انگلیسی خوانا تبدیل می‌کند: `if (canEdit && !isLocked)`.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `const x = true` و `let x = true`',
        body:
          'پاسخ: «`const x = true` تایپ لیترال `true` می‌گیرد چون غیرقابل تغییر است، ولی `let x = true` تایپ `boolean` می‌گیرد چون ممکن است بعداً تغییر کند. این همان مفهوم Type Widening است.»',
      },
    ],
    quiz: {
      q: 'چرا نوشتن `const flag = true` تایپ `true` می‌گیرد ولی `let flag = true` تایپ `boolean`؟',
      options: [
        'چون `const` غیرقابل تغییر است پس تایپ به دقیق‌ترین لیترال محدود می‌شود، ولی `let` قابل تغییر است و به تایپ عمومی گسترش می‌یابد',
        'چون `let` همیشه `any` می‌شود',
        'چون TypeScript بین const و let تفاوتی قائل نیست',
        'چون `true` یک نوع آبجکت است',
      ],
      answer: 0,
      explain:
        'این رفتار Type Widening نام دارد: برای `const` نیازی به گسترش نیست چون مقدار هرگز عوض نمی‌شود، ولی برای `let` کامپایلر فرض می‌کند مقدار ممکن است به `false` تغییر کند.',
    },
    lab: {
      task: 'یک تایپ برای وضعیت یک درس بساز: آیا تکمیل شده؟ آیا چالش دارد؟ سپس تابعی بنویس که گزارش تولید کند.',
      starter: `type LessonState = {
  readonly isCompleted: boolean;
  readonly hasChallenge: boolean;
};

function describe(state: LessonState): string {
  if (state.isCompleted) return state.hasChallenge ? 'تکمیل‌شده با چالش' : 'تکمیل‌شده';
  return state.hasChallenge ? 'در انتظار + چالش' : 'در انتظار';
}

console.log(describe({ isCompleted: false, hasChallenge: true }));`,
      solution: `type LessonState = { readonly isCompleted: boolean; readonly hasChallenge: boolean };
const label = (s: LessonState) =>
  \`\${s.isCompleted ? '✅' : '⬜'} \${s.hasChallenge ? '🎯' : ''}\`;`,
    },
  },

  {
    id: 'type-number',
    chapter: 'ch2',
    titleFa: 'تایپ number',
    titleEn: 'number',
    level: 'beginner',
    minutes: 20,
    goal: 'رفتار اعداد در TypeScript/JavaScript را کامل بشناسی؛ از ممیز شناور و NaN تا bigint و اعداد لیترال.',
    steps: [
      {
        h: 'گام ۱ — یک تایپ عدد: `number` (IEEE 754 double)',
        p:
          'برخلاف C یا Java، TypeScript فقط یک تایپ عددی دارد: `number` که همان double ۶۴بیتی است. `int`، `float`، `short` وجود ندارند. تمام اعداد — صحیح و اعشاری — یک تایپ‌اند.',
        code: `const hours: number = 5;
const ratio: number = 0.75;
const hex: number = 0xff;         // 255
const binary: number = 0b1010;    // 10
const octal: number = 0o17;       // 15
const withSeparator: number = 1_000_000; // جداکننده خوانایی
const infinity: number = Number.POSITIVE_INFINITY;`,
      },
      {
        h: 'گام ۲ — سه دام واقعی اعداد در JavaScript',
        p:
          '۱) `0.1 + 0.2 !== 0.3` (خطای ممیز شناور). ۲) `NaN` تنها مقداری است که با خودش برابر نیست (`NaN === NaN` → false). ۳) `Number.MAX_SAFE_INTEGER` مرز دقت اعداد صحیح است (۲^۵۳−۱).',
        code: `console.log(0.1 + 0.2);                 // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);         // false
console.log(Number.isNaN(NaN));         // true  ✅ (هرگز x !== x استفاده نکن)
console.log(Number.MAX_SAFE_INTEGER);   // 9007199254740991
console.log(2 ** 53 === 2 ** 53 + 1);   // true ⚠️ دقت از دست رفته`,
      },
      {
        h: 'گام ۳ — `bigint` برای اعداد بزرگ دقیق',
        p:
          'برای اعداد صحیح بزرگ‌تر از `MAX_SAFE_INTEGER` از `bigint` استفاده کن (با پسوند `n`). توجه: `bigint` و `number` **با هم جمع نمی‌شوند** و باید صریح تبدیل شوند.',
        code: `const huge: bigint = 9007199254740993n;
const alsoHuge = BigInt('9007199254740993');

// ❌ TypeError در زمان اجرا: cannot mix BigInt and other types
// const mixed = huge + 1;

// ✅ تبدیل صریح:
const safe = huge + BigInt(1);
const asNumber = Number(huge); // ⚠️ دقت از دست می‌رود`,
      },
      {
        h: 'گام ۴ — تایپ‌های عددی دامنه‌دار (Branded Types)',
        p:
          'TypeScript نمی‌تواند «عدد مثبت» یا «عدد بین ۰ تا ۱۰۰» را ذاتاً بیان کند. دو راه داری: Union لیترال برای مجموعه‌های کوچک، یا **Branded Type** برای محدودیت‌های معنایی.',
        code: `// راه ۱ — لیترال (فقط برای مجموعه‌های کوچک):
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// راه ۲ — Branded Type (الگوی حرفه‌ای برای واحدها):
type UserId = number & { readonly __brand: 'UserId' };
type OrderId = number & { readonly __brand: 'OrderId' };

const toUserId = (n: number): UserId => n as UserId;

function getUser(id: UserId): string { return \`user-\${id}\`; }

const uid = toUserId(42);
console.log(getUser(uid));
// getUser(orderId) → ❌ خطای تایپی! همان‌طور که می‌خواهیم`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۱',
        title: 'فرمول Branded Type برای واحدها',
        body:
          'بزرگ‌ترین دسته‌ی باگ‌های عددی در سیستم‌های مالی، **قاطی شدن واحدها**ست (سنت با دلار، میلی‌ثانیه با ثانیه). Branded Type با هزینه‌ی یک خط کد، این دسته باگ را در زمان کامپایل غیرممکن می‌کند.',
        equation: 'نوع برند‌شده = تایپ پایه & { readonly __brand: نام یکتا }',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'مقایسه‌ی اعداد اعشاری با `===`',
        body:
          'هرگز `total === 0.3` ننویس. از `Math.abs(a - b) < Number.EPSILON` یا مقایسه‌ی گردشده استفاده کن. در سیستم مالی، همیشه با **کوچک‌ترین واحد صحیح** (سنت/ریال) کار کن نه اعشار.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'واحد را در نام ببر',
        body:
          '`timeout` مبهم است؛ `timeoutMs` دقیق است. `price` مبهم است؛ `priceInCents` دقیق است. اگر واحد در نام باشد، نیاز به کامنت و مستندسازی خارجی از بین می‌رود.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور بررسی می‌کنی مقداری عدد معتبر است؟',
        body:
          'پاسخ: «`typeof x === "number" && Number.isFinite(x)` — چون `Number.isFinite` هم `NaN` و هم `Infinity` را رد می‌کند. `isFinite` سراسری (بدون `Number.`) رشته‌ها را هم تبدیل می‌کند و خطرناک است.»',
      },
    ],
    quiz: {
      q: 'کدام عبارت برای بررسی اینکه `value` یک عدد واقعی و محدود است، صحیح است؟',
      options: [
        '`typeof value === "number" && Number.isFinite(value)`',
        '`value === value`',
        '`typeof value === "number"`',
        '`Number(value) === value`',
      ],
      answer: 0,
      explain:
        'فقط `typeof` کافی نیست چون `NaN` و `Infinity` هم `number` هستند. `Number.isFinite` هر دو را رد می‌کند. گزینه‌ی `value === value` فقط NaN را می‌گیرد و Infinity را عبور می‌دهد.',
    },
    lab: {
      task: 'یک Branded Type برای `Minutes` و `Hours` بساز و تابع تبدیل ساعت به دقیقه بنویس که از قاطی شدن واحدها جلوگیری کند.',
      starter: `type Minutes = number & { readonly __brand: 'Minutes' };
type Hours = number & { readonly __brand: 'Hours' };

const asHours = (n: number): Hours => n as Hours;

function toMinutes(hours: Hours): Minutes {
  return (hours * 60) as Minutes;
}

const daily: Hours = asHours(5);
console.log(toMinutes(daily)); // 300`,
      solution: `// نکته‌ی کلیدی: toMinutes(hours) فقط Hours می‌پذیرد؛
// پاس دادن یک Minutes به آن خطای تایپی می‌دهد.
type Minutes = number & { readonly __brand: 'Minutes' };
type Hours = number & { readonly __brand: 'Hours' };
const toMinutes = (h: Hours) => (h * 60) as Minutes;`,
    },
  },

  {
    id: 'type-string',
    chapter: 'ch2',
    titleFa: 'تایپ string',
    titleEn: 'string',
    level: 'beginner',
    minutes: 25,
    goal: 'تایپ رشته را با تمام ظرایفش بشناسی: لیترال‌های رشته‌ای، Template Literal Types و مقایسه‌ی امن.',
    steps: [
      {
        h: 'گام ۱ — `string` در برابر لیترال رشته‌ای',
        p:
          '`string` مجموعه‌ی تمام رشته‌هاست، ولی `"admin"` مجموعه‌ای با **یک** عضو. لیترال‌های رشته‌ای قوی‌ترین ابزار مدل‌سازی دامنه در TypeScript هستند.',
        code: `let anything: string = 'hello';      // هر رشته‌ای
const role: 'admin' | 'user' = 'admin';  // فقط دو مقدار مجاز

// ❌ const bad: 'admin' | 'user' = 'root';  // TS2322

// ✅ استنتاج لیترال با as const:
const roles = ['admin', 'user', 'guest'] as const;
type Role = (typeof roles)[number]; // 'admin' | 'user' | 'guest'
console.log(roles.length);`,
      },
      {
        h: 'گام ۲ — Template Literal Types (قدرتمندترین ویژگی رشته‌ها)',
        p:
          'می‌توانی تایپ‌های رشته‌ای **الگودار** بسازی؛ تایپ‌هایی که شکل رشته را محدود می‌کنند.',
        code: `type EventName = 'click' | 'focus' | 'blur';
type Handler = \`on\${Capitalize<EventName>}\`;
// → 'onClick' | 'onFocus' | 'onBlur'

type CssUnit = 'px' | 'rem' | '%';
type CssSize = \`\${number}\${CssUnit}\`;
// → '0px' | '1.5rem' | '100%' | ... (بی‌نهایت ولی الگومند)

const size: CssSize = '16px';      // ✅
// const bad: CssSize = '16em';    // ❌

type Route = \`/users/\${string}/posts/\${number}\`;
const ok: Route = '/users/abc/posts/42';  // ✅
console.log(size, ok);`,
      },
      {
        h: 'گام ۳ — کاراکترها و کدپوینت‌ها (یک دام پنهان)',
        p:
          '`str.length` تعداد **کد واحد UTF-16** است نه تعداد کاراکتر! برای ایموجی و برخی زبان‌ها نتیجه غلط می‌شود. از `Array.from(str)` یا `Intl.Segmenter` برای شمارش واقعی استفاده کن.',
        code: `const text = 'سلام👋';
console.log(text.length);          // 6 (نه 5!)
console.log(Array.from(text).length); // 5 ✅

// مقایسه‌ی امن و زبان‌آگاه:
console.log('ä'.normalize('NFC') === 'ä'.normalize('NFC')); // true
console.log('a'.localeCompare('b', 'fa')); // ترتیب فارسی`,
      },
      {
        h: 'گام ۴ — تغییرناپذیری رشته‌ها',
        p:
          'رشته‌ها در JavaScript تغییرناپذیرند: `str.toUpperCase()` رشته‌ی جدید می‌سازد و اصلی را دست نمی‌زند. هر متدی که «به نظر می‌رسد تغییر می‌دهد» در واقع کپی برمی‌گرداند.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۲',
        title: 'فرمول «لیترال به‌جای رشته»',
        body:
          'هر جا مجموعه‌ی مجاز رشته‌ها **محدود و شناخته‌شده** است، از Union لیترال استفاده کن نه `string`. این یک تصمیم، کل دسته‌ی باگ‌های «غلط املایی در مقدار» را در زمان کامپایل حذف می‌کند.',
        equation: 'امنیت دامنه = (تعداد مقادیر مجاز صریحاً مدل‌شده) ÷ (تعداد مقادیر ممکن در رشته‌ی آزاد)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'یک منبع حقیقت برای مقادیر ثابت (DRY)',
        body:
          'مقادیر را یک‌بار در یک `const ... as const` بنویس و تایپ را از همان **مشتق** کن: `type Role = (typeof ROLES)[number]`. اگر این دو را جدا بنویسی، روزی از هم دور می‌افتند و باگ تولید می‌شود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایجع',
        title: '`length` روی ایموجی و متن فارسی',
        body:
          '`"👋".length === 2` است! هرگاه محدودیت طول (مثل maxLength ورودی کاربر) داری، با `Array.from()` یا `Intl.Segmenter` بشمار، نه با `length`.',
      },
    ],
    quiz: {
      q: "تایپ `on${Capitalize<'click' | 'focus'>}` (یک Template Literal Type) چیست؟",
      options: [
        "`'onClick' | 'onFocus'`",
        '`string`',
        "`'onclick' | 'onfocus'`",
        '`template literal` (یک تایپ عمومی)',
      ],
      answer: 0,
      explain:
        'Template Literal Types روی Union توزیع می‌شوند (Distributive) و `Capitalize` حرف اول را بزرگ می‌کند، پس دو عضو دقیق تولید می‌شود.',
    },
    lab: {
      task: 'یک تایپ برای نام رویدادهای یک فرم بساز: `input`، `change`، `submit`؛ سپس تایپ نام handlerها را با Template Literal مشتق کن.',
      starter: `const FORM_EVENTS = ['input', 'change', 'submit'] as const;

type FormEvent = (typeof FORM_EVENTS)[number];
type HandlerName = \`on\${Capitalize<FormEvent>}\`;
// → 'onInput' | 'onChange' | 'onSubmit'

const handler: HandlerName = 'onSubmit';
console.log(handler);`,
      solution: `type FormEvent = (typeof FORM_EVENTS)[number];
type HandlerName = \`on\${Capitalize<FormEvent>}\`;
const h: HandlerName = 'onChange';`,
    },
  },

  {
    id: 'type-void',
    chapter: 'ch2',
    titleFa: 'تایپ void',
    titleEn: 'void',
    level: 'beginner',
    minutes: 15,
    goal: 'تفاوت دقیق `void`، `undefined` و تابعی که مقدار برمی‌گرداند را بفهمی و از تله‌ی معروف «void-returning callback» آگاه شوی.',
    steps: [
      {
        h: 'گام ۱ — `void` یعنی «مقدار بازگشتی مورد استفاده نیست»',
        p:
          '`void` روی تابع یعنی «این تابع چیزی برنمی‌گرداند که مصرف‌کننده به آن نیاز داشته باشد». توجه کن که `void` با `undefined` فرق دارد: یک تابع `void` از نظر تایپی **می‌تواند** مقداری return کند، ولی آن مقدار نادیده گرفته می‌شود.',
        code: `function logProgress(percent: number): void {
  console.log(\`\${percent}%\`);
}

// تابعی که void اعلام شده ولی مقدار برمی‌گرداند — از نظر تایپ مجاز است:
const noop = (): void => undefined;

logProgress(40);
noop();`,
      },
      {
        h: 'گام ۲ — قانون ویژه: callback با تایپ `void`',
        p:
          'یک تابع که مقدار برمی‌گرداند را **می‌توان** به پارامتری با تایپ `() => void` پاس داد. این طراحی عمدی است تا `array.forEach` با توابع بازگشت‌دار کار کند؛ ولی می‌تواند باگ پنهان بسازد.',
        code: `type VoidCallback = () => void;

// ✅ مجاز! چون مقدار بازگشتی نادیده گرفته می‌شود
const push: VoidCallback = () => [1, 2, 3].push(4);

// ⚠️ خطر واقعی — نتیجه دور ریخته می‌شود:
const ids: number[] = [];
[1, 2, 3].forEach((n) => ids.push(n)); // push عدد برمی‌گرداند ولی void می‌خورد
console.log(ids);`,
      },
      {
        h: 'گام ۳ — `void` در برابر `undefined` در تایپ پارامتر',
        p:
          'پارامتر `undefined` یعنی «فقط مقدار undefined مجاز است»، ولی `void` در جایگاه بازگشت یعنی «چیزی لازم نیست». برای توابع async که نتیجه ندارند، `Promise<void>` بنویس.',
        code: `async function syncCache(): Promise<void> {
  await Promise.resolve();
  // بدون return مقداری
}

function takesUndefined(x: undefined): string { return 'only undefined'; }

syncCache();
console.log(takesUndefined(undefined));`,
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'قاعده‌ی «void یعنی نادیده‌گرفتن عمدی»',
        body:
          'هرگاه تابعی را به جایی پاس می‌دهی که تایپ بازگشتی‌اش `void` است، مقدار بازگشتی **عمداً دور ریخته می‌شود**. پس هرگز به مقدار بازگشتی callbackهایی مثل `forEach` تکیه نکن. `void` یعنی «اینجا نتیجه مهم نیست» — نه «نتیجه‌ای وجود ندارد».',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'نتیجه‌ی دور ریخته‌شده در callbackهای `void`',
        body:
          'اگر تابعی که مقدار مهمی برمی‌گرداند (مثل `Promise`) را به یک callback با تایپ `void` پاس بدهی، کامپایلر ساکت می‌ماند و آن `Promise` **بدون await و بدون catch** رها می‌شود. برای همین `@typescript-eslint/no-misused-promises` حیاتی است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`Promise<void>` به‌جای `Promise<undefined>`',
        body:
          'برای توابع async بدون نتیجه همیشه `Promise<void>` بنویس. این هم خواناتر است و هم به lint‌رها اجازه می‌دهد `await` نشدن آن را شکار کنند.',
      },
    ],
    quiz: {
      q: 'کدام عبارت درباره‌ی `void` درست است؟',
      options: [
        'تابعی با تایپ بازگشت `void` می‌تواند مقدار برگرداند، ولی آن مقدار توسط مصرف‌کننده نادیده گرفته می‌شود',
        '`void` دقیقاً معادل `undefined` است',
        'تابع `void` حتماً باید `return;` خالی داشته باشد',
        'نمی‌توان یک تابع بازگشت‌دار را به پارامتر `() => void` پاس داد',
      ],
      answer: 0,
      explain:
        '`void` یک قرارداد «عدم استفاده از نتیجه» است نه یک مقدار. به همین دلیل TypeScript اجازه می‌دهد توابع بازگشت‌دار به callbackهای void انتساب یابند (قانونی که برای `forEach` طراحی شد).',
    },
    lab: {
      task: 'یک تابع `report` با بازگشت `void` بنویس و نشان بده که پاس دادن تابع بازگشت‌دار به آن مجاز است.',
      starter: `type Reporter = (message: string) => void;

const collect: Reporter = (message) => {
  console.log('collected:', message);
};

const returnsValue: Reporter = (message) => message.length; // ✅ مجاز

collect('سلام');
returnsValue('سلام');`,
      solution: `const r: Reporter = (m) => m.length; // مقدار بازگشتی دور ریخته می‌شود`,
    },
  },

  {
    id: 'type-undefined',
    chapter: 'ch2',
    titleFa: 'تایپ undefined',
    titleEn: 'undefined',
    level: 'beginner',
    minutes: 18,
    goal: 'منشأ `undefined` در JavaScript را بشناسی و تفاوت «نبودِ کلید» با «کلید با مقدار undefined» را درک کنی.',
    steps: [
      {
        h: 'گام ۱ — `undefined` یعنی «مقداری اختصاص نیافته»',
        p:
          'سه منشأ اصلی: متغیر declare شده بدون مقدار، پراپرتی اختیاری که ست نشده، و خروجی تابع بدون `return`. در TypeScript با `strictNullChecks`، این تایپ **صریحاً** در Union ظاهر می‌شود.',
        code: `let notYet: string | undefined;
//    ^?  → let notYet: string | undefined

type Profile = { nickname?: string };
const p: Profile = {};
console.log(p.nickname); // undefined

function noReturn(): undefined { return undefined; }
console.log(noReturn());`,
      },
      {
        h: 'گام ۲ — تفاوت حیاتی `x?: T` و `x: T | undefined`',
        p:
          'با `exactOptionalPropertyTypes: true` این دو **متفاوت**اند: `nickname?: string` یعنی «کلید ممکن است وجود نداشته باشد، ولی اگر هست باید string باشد»؛ `nickname: string | undefined` یعنی «کلید حتماً وجود دارد و مقدارش ممکن است undefined باشد».',
        code: `type A = { nickname?: string };              // کلید اختیاری
type B = { nickname: string | undefined };   // کلید اجباری، مقدار تهی‌پذیر

const a: A = {};                    // ✅
// const aBad: A = { nickname: undefined }; // ❌ با exactOptionalPropertyTypes

const b: B = { nickname: undefined }; // ✅
// const bBad: B = {};                  // ❌ کلید اجباری است

console.log(a, b);`,
      },
      {
        h: 'گام ۳ — سه ابزار مدیریت `undefined`',
        p:
          'Optional Chaining (`?.`) برای دسترسی امن، Nullish Coalescing (`??`) برای مقدار پیش‌فرض، و Type Guard برای حذف کامل تهی بودن.',
        code: `const maybeName: string | undefined = undefined;

console.log(maybeName?.toUpperCase());     // undefined (بدون crash)
console.log(maybeName ?? 'مهمان');          // 'مهمان'
console.log(maybeName ?? '');               // '' — دقت: ?? فقط null/undefined

// تفاوت مهم ?? با ||:
console.log(0 ?? 42);  // 0  ✅ (صفر معتبر است)
console.log(0 || 42);  // 42 ⚠️ (صفر را نادیده می‌گیرد!)`,
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «سه حالت را از هم جدا کن»',
        body:
          'برای هر فیلد، سه حالت را از هم تفکیک کن: ۱) کلید وجود ندارد (`?`) ۲) کلید هست ولی مقدار `undefined` است ۳) کلید هست و مقدار دارد. با `exactOptionalPropertyTypes: true` حالت دوم از بین می‌رود و کد تو قابل استدلال می‌شود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی بسیار رایج',
        title: '`||` به‌جای `??` — باگ مقادیر falsy معتبر',
        body:
          '`count || 10` وقتی `count === 0` است، `10` می‌دهد! برای مقادیر پیش‌فرض **همیشه** `??` بنویس. این یکی از پرتکرارترین باگ‌های واقعی در کد JavaScript/TypeScript است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'از `undefined` صریح در API پرهیز کن',
        body:
          'در مرزهای API ترجیح بده «نبود کلید» یا «مقدار معنادار» داشته باشی نه `undefined` صریح. `{ user: null }` (صریحاً وجود ندارد) از `{ user: undefined }` (مبهم) بهتر است، چون `JSON.stringify` فیلد undefined را کاملاً حذف می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `null` و `undefined`',
        body:
          'پاسخ: «`undefined` یعنی مقدار هرگز اختصاص نیافته (سیستمی)، `null` یعنی عمدتاً «هیچ» گذاشته شده (برنامه‌نویس). در TypeScript هر دو تایپ جدا هستند و با `strictNullChecks` باید صریح مدیریت شوند.»',
      },
    ],
    quiz: {
      q: 'خروجی `0 ?? 42` و `0 || 42` به ترتیب چیست؟',
      options: ['`0` و `42`', '`42` و `42`', '`0` و `0`', '`42` و `0`'],
      answer: 0,
      explain:
        '`??` فقط وقتی `null` یا `undefined` باشد جایگزین می‌کند، پس `0` را نگه می‌دارد. `||` هر مقدار falsy (شامل `0`، `""`، `false`) را جایگزین می‌کند.',
    },
    lab: {
      task: 'تابعی بنویس که یک پراپرتی اختیاری را امن بخواند و در صورت نبود، مقدار پیش‌فرض برگرداند — بدون استفاده از `!`.',
      starter: `type Settings = { theme?: 'dark' | 'light'; fontSize?: number };

function readSettings(s: Settings): { theme: string; fontSize: number } {
  return {
    theme: s.theme ?? 'dark',
    fontSize: s.fontSize ?? 16,
  };
}

console.log(readSettings({ fontSize: 20 }));`,
      solution: `const withDefaults = (s: Settings) => ({ theme: s.theme ?? 'dark', fontSize: s.fontSize ?? 16 });`,
    },
  },

  {
    id: 'type-null',
    chapter: 'ch2',
    titleFa: 'تایپ null و strictNullChecks',
    titleEn: 'null',
    level: 'beginner',
    minutes: 20,
    goal: 'فلسفه‌ی `strictNullChecks` را بفهمی و بتوانی کد «تهی‌ناپذیر» (Null-Safe) بنویسی.',
    steps: [
      {
        h: 'گام ۱ — «میلیارد دلار اشتباه» و راه‌حل TypeScript',
        p:
          'خطاهای `null`/`undefined` معروف‌ترین دسته‌ی باگ در تاریخ نرم‌افزارند. با `strictNullChecks: true`، تایپ `null` از همه‌ی تایپ‌ها جدا می‌شود و **فقط** وقتی مجاز است که صریح در Union بیاید. این یک flag، بخش بزرگی از باگ‌های پروداکشن را حذف می‌کند.',
        code: `let name: string = 'Nima';
// name = null;        // ❌ TS2322 با strictNullChecks
let maybeName: string | null = null;  // ✅ صریح

function greet(user: string | null): string {
  if (user === null) return 'سلام مهمان';
  return \`سلام \${user}\`;
}

console.log(greet(maybeName), greet('سارا'));`,
      },
      {
        h: 'گام ۲ — چهار الگوی مدیریت تهی بودن',
        p:
          '۱) گارد زودهنگام (Early Return) ۲) مقدار پیش‌فرض با `??` ۳) Optional Chaining با `?.` ۴) بازگرداندن Union نتیجه (`T | null`) و وادار کردن فراخوان به تصمیم.',
        code: `type Session = { user: { name: string } | null };

// الگوی ۱ — گارد زودهنگام (تمیزترین):
function displayName(s: Session): string {
  if (!s.user) return 'ناشناس';
  return s.user.name;
}

// الگوی ۳ — Optional Chaining (مختصر):
const short = (s: Session) => s.user?.name ?? 'ناشناس';

const session: Session = { user: { name: 'نیما' } };
console.log(displayName(session), short(session));`,
      },
      {
        h: 'گام ۳ — `NonNullable<T>` و باریک‌سازی دسته‌ای',
        p:
          'وقتی یک Union شامل `null | undefined` است، `NonNullable<T>` هر دو را حذف می‌کند. برای حذف تهی از تمام فیلدهای یک تایپ، از mapped type استفاده کن.',
        code: `type RawUser = { name: string | null; email?: string | undefined };

type CleanUser = {
  [K in keyof RawUser]: NonNullable<RawUser[K]>;
};
// → { name: string; email: string }

const clean: CleanUser = { name: 'نیما', email: 'nima@example.com' };
console.log(clean);`,
      },
      {
        h: 'گام ۴ — کی از `!` (Non-null Assertion) استفاده کنیم؟',
        p:
          'تقریباً هیچ‌وقت! `!` یک دروغ به کامپایلر است و اگر اشتباه کنی، در زمان اجرا crash می‌گیری. تنها جای مجاز: کدی که **خودت** منطق تهی بودنش را تضمین کرده‌ای ولی کامپایلر نمی‌تواند ببیند (مثلاً بعد از یک الگوریتم پیچیده). در آن حالت هم یک کامنت دلیل بنویس.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۳',
        title: 'فرمول «تهی بودن را به مرزها بران»',
        body:
          'در لایه‌ی ورودی (API/فرم) تهی بودن را بررسی و حذف کن، بعد در لایه‌های داخلی با تایپ‌های **غیرتهی** کار کن. این کار، بررسی‌های تکراری `if (x)` را از ده‌ها تابع حذف می‌کند و منطق را تمیز نگه می‌دارد.',
        equation: 'پیچیدگی کد ∝ (تعداد نقاط بررسی تهی) — با Parse-don\'t-validate این تعداد به ۱ می‌رسد',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: '«Parse, don\'t validate»',
        body:
          'به‌جای اینکه یک ورودی را اعتبارسنجی کنی و همان نوع مبهم را عبور دهی، آن را به یک تایپ **دقیق‌تر** تبدیل کن. یعنی `parseUser(input: unknown): User` نه `isValidUser(input: unknown): boolean`. با این الگو، تهی بودن یک‌بار در مرز حل می‌شود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`!` یعنی «به من اعتماد کن» — و کامپایلر هم اعتماد می‌کند!',
        body:
          '`user!.name` اگر `user` واقعاً `null` باشد، در زمان اجرا `TypeError` می‌دهد. هر `!` در کدبیس یک باگ بالقوه‌ی مستندشده است. تعداد `!`ها را در Code Review بشمار؛ باید به صفر نزدیک باشد.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'یک استراتگی تهی برای کل پروژه',
        body:
          'تصمیم بگیر: یا فقط `null` (و `undefined` را ممنوع کن) یا فقط `undefined`. مخلوط کردن هر دو در یک کدبیس، تعداد بررسی‌ها را دو برابر می‌کند. بیشتر تیم‌های مدرن `null` را برای «صریحاً هیچ» و `undefined` را برای «اختیاری/ست‌نشده» نگه می‌دارند و مستندش می‌کنند.',
      },
    ],
    quiz: {
      q: 'با `strictNullChecks: true`، کدام انتساب مجاز است؟',
      options: [
        '`let x: string | null = null;`',
        '`let x: string = null;`',
        '`let x: number = undefined;`',
        '`let x: boolean = null;`',
      ],
      answer: 0,
      explain:
        'با strictNullChecks، `null` و `undefined` زیرمجموعه‌ی تایپ‌های دیگر نیستند و فقط وقتی مجازند که صریحاً در Union حضور داشته باشند.',
    },
    lab: {
      task: 'تابع `findUser` بنویس که `User | null` برمی‌گرداند، و یک فراخوان که بدون `!` و با گارد، نام را چاپ کند.',
      starter: `type User = { readonly id: number; readonly name: string };

const users: readonly User[] = [
  { id: 1, name: 'نیما' },
  { id: 2, name: 'سارا' },
];

function findUser(id: number): User | null {
  return users.find((u) => u.id === id) ?? null;
}

const found = findUser(2);
if (found !== null) {
  console.log(found.name);
} else {
  console.log('کاربر پیدا نشد');
}`,
      solution: `const name = findUser(3)?.name ?? 'نامشخص';
console.log(name);`,
    },
  },

  {
    id: 'obj-interface',
    chapter: 'ch2',
    titleFa: 'تایپ آبجکتی: Interface',
    titleEn: 'Interface',
    level: 'beginner',
    minutes: 30,
    goal: 'اینترفیس را به‌عنوان «قرارداد شکل داده» بشناسی و بتوانی شکل‌های دقیق، اختیاری و فقط‌خواندنی تعریف کنی.',
    steps: [
      {
        h: 'گام ۱ — اینترفیس = قرارداد شکل',
        p:
          '`interface` یک قرارداد ساختاری است: هر مقداری که **حداقل** این فیلدها را با این تایپ‌ها داشته باشد، آن قرارداد را ارضا می‌کند. نام اینترفیس مهم نیست، شکل مهم است (Structural Typing).',
        code: `interface Lesson {
  readonly id: string;
  title: string;
  minutes: number;
  isCompleted?: boolean;   // اختیاری
}

const lesson: Lesson = { id: 'l1', title: 'Interface', minutes: 30 };
lesson.isCompleted = true;
// lesson.id = 'l2';   // ❌ readonly

console.log(lesson.title, lesson.minutes);`,
      },
      {
        h: 'گام ۲ — Excess Property Check (بررسی پراپرتی اضافی)',
        p:
          'وقتی یک **object literal** را مستقیماً به یک تایپ انتساب می‌دهی، TypeScript پراپرتی‌های اضافی را خطا می‌گیرد. این یک ویژگی امنیتی است که غلط‌های املایی را شکار می‌کند. ولی اگر از طریق یک متغیر واسطه عبور کنی، این بررسی انجام نمی‌شود.',
        code: `interface Point { x: number; y: number }

// ❌ TS2353 — پراپرتی اضافی در literal:
// const p: Point = { x: 1, y: 2, z: 3 };

// ✅ از طریق متغیر واسطه مجاز است (Structural Typing):
const raw = { x: 1, y: 2, z: 3 };
const p: Point = raw;

console.log(p.x, p.y);`,
      },
      {
        h: 'گام ۳ — اینترفیس با متد و امضای فراخوانی',
        p:
          'اینترفیس می‌تواند متد، Index Signature و حتی امضای فراخوانی داشته باشد. برای متد دو سینتکس وجود دارد؛ `method(): T` و `property: () => T` که زیر `strictFunctionTypes` رفتار **متفاوت** دارند.',
        code: `interface Logger {
  (message: string, level?: 'info' | 'error'): void; // امضای فراخوانی
  readonly prefix: string;
  flush(): Promise<void>;
}

const logger: Logger = Object.assign(
  (message: string, level: 'info' | 'error' = 'info') => {
    console.log(\`[\${level}] \${message}\`);
  },
  { prefix: 'studio', flush: async () => undefined }
);

logger('درس تکمیل شد');
console.log(logger.prefix);`,
      },
      {
        h: 'گام ۴ — Index Signature برای شکل‌های باز',
        p:
          'وقتی نام کلیدها را نمی‌دانی، از Index Signature استفاده کن. اما آگاه باش: این کار دقت تایپ را کم می‌کند و `Record<string, T>` معمولاً جایگزین بهتری است.',
        code: `interface ScoreBoard {
  readonly [playerName: string]: number;
}

const board: ScoreBoard = { nima: 95, sara: 88 };
console.log(board['nima']);

// جایگزین مدرن و دقیق‌تر:
const board2: Record<string, number> = { nima: 95 };
console.log(board2['nima']);`,
      },
    ],
    visual: 'interface-shape',
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`readonly` به‌صورت پیش‌فرض',
        body:
          'هر فیلدی که نباید بعد از ساخت تغییر کند را `readonly` کن. این کار Mutation تصادفی را در زمان کامپایل می‌گیرد و کد تو را به سمت معماری Immutable می‌برد — همان الگویی که React و Redux مدرن بر آن ساخته شده‌اند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'Index Signature، دقت را می‌کُشد',
        body:
          "با `[key: string]: number` هر کلید دلخواهی مجاز است و غلط املایی دیگر خطا نمی‌دهد: `board['niima']` هم `number` است (در زمان اجرا `undefined`). اگر کلیدها محدودند، Union لیترال + `Record` استفاده کن.",
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Structural Typing یعنی چه؟',
        body:
          'پاسخ: «در TypeScript سازگاری تایپ‌ها بر اساس **ساختار** است نه **نام**. دو تایپ با نام‌های متفاوت ولی شکل یکسان، کاملاً سازگارند. این برخلاف Nominal Typing در زبان‌هایی مثل Java یا C# است.»',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۴',
        title: 'فرمول «کوچک‌ترین قرارداد ممکن»',
        body:
          'هرچه اینترفیس فیلدهای کمتری داشته باشد، قابل استفاده‌تر است (Interface Segregation). تابعی که فقط `{ id: string }` می‌خواهد، در ۱۰ برابر مکان‌های بیشتری قابل استفاده است تا تابعی که کل `User` را می‌خواهد.',
      },
    ],
    quiz: {
      q: 'چرا انتساب `{ x: 1, y: 2, z: 3 }` به `Point` خطا می‌دهد ولی انتساب همان شکل از طریق یک متغیر واسطه مجاز است؟',
      options: [
        'چون Excess Property Check فقط روی object literal مستقیم اعمال می‌شود',
        'چون متغیر واسطه تایپ `any` می‌گیرد',
        'چون TypeScript در حالت دوم strict نیست',
        'چون `z` یک پراپرتی رزرو شده است',
      ],
      answer: 0,
      explain:
        'بررسی پراپرتی اضافی یک قاعده‌ی ویژه برای literalهای تازه‌ساخته است تا غلط املایی شکار شود. وقتی مقدار از یک متغیر با تایپ گسترده‌تر می‌آید، فقط قانون ساختاری (زیرمجموعه بودن) اعمال می‌شود.',
    },
    lab: {
      task: 'یک اینترفیس `RoadmapNode` با فیلدهای فقط‌خواندنی `id`، `title`، یک فیلد اختیاری `note` و متد `isDone()` تعریف کن و یک نمونه بساز.',
      starter: `interface RoadmapNode {
  readonly id: string;
  readonly title: string;
  note?: string;
  isDone(): boolean;
}

const node: RoadmapNode = {
  id: 'intro-ts',
  title: 'Introduction to TypeScript',
  isDone: () => true,
};

console.log(node.title, node.isDone());`,
      solution: `interface RoadmapNode { readonly id: string; readonly title: string; note?: string; isDone(): boolean; }
const n: RoadmapNode = { id: 'x', title: 't', isDone: () => false };`,
    },
  },

  {
    id: 'obj-class',
    chapter: 'ch2',
    titleFa: 'تایپ آبجکتی: Class',
    titleEn: 'Class (as a type)',
    level: 'beginner',
    minutes: 30,
    goal: 'دو چهره‌ی کلاس در TypeScript را بشناسی: یک مقدار (Value) و یک تایپ (Type) — و بدانی کی از کدام استفاده کنی.',
    steps: [
      {
        h: 'گام ۱ — کلاس هم مقدار است هم تایپ',
        p:
          'وقتی `class User {}` می‌نویسی، دو چیز ساخته می‌شود: ۱) یک **مقدار** (سازنده‌ی قابل `new`) ۲) یک **تایپ** (شکل نمونه‌ها). این دوگانگی منبع بیشتر سردرگمی‌هاست.',
        code: `class User {
  constructor(public readonly name: string, private age: number) {}
  greet(): string { return \`سلام \${this.name}\`; }
}

const u: User = new User('نیما', 30);  // User به‌عنوان تایپ
console.log(u.greet());

// User به‌عنوان مقدار (تایپ سازنده):
const Factory: typeof User = User;
const u2 = new Factory('سارا', 25);
console.log(u2.name);`,
      },
      {
        h: 'گام ۲ — `User` در برابر `typeof User`',
        p:
          '`User` = تایپ یک **نمونه**. `typeof User` = تایپ خود **کلاس** (سازنده). اگر بخواهی یک کارخانه یا Dependency Injection بنویسی، به `typeof User` یا `new () => User` نیاز داری.',
        code: `type UserInstance = User;                 // نمونه
type UserConstructor = typeof User;       // خود کلاس
type AnyUserFactory = new (name: string, age: number) => User;

function create(Ctor: AnyUserFactory, name: string): User {
  return new Ctor(name, 20);
}

console.log(create(User, 'مریم').greet());`,
      },
      {
        h: 'گام ۳ — کلاس به‌عنوان تایپ، ساختاری است نه اسمی!',
        p:
          'نکته‌ی شگفت‌انگیز: حتی کلاس‌ها در TypeScript **ساختاری** مقایسه می‌شوند. دو کلاس با فیلدهای عمومی یکسان، با هم سازگارند — حتی اگر هیچ رابطه‌ی ارث‌بری نداشته باشند. (فیلدهای `private`/`protected` این قاعده را می‌شکنند.)',
        code: `class A { constructor(public x: number) {} }
class B { constructor(public x: number) {} }

const a: A = new B(1); // ✅ مجاز! ساختار یکسان است
const b: B = new A(2); // ✅ مجاز

console.log(a.x, b.x);`,
      },
      {
        h: 'گام ۴ — کی کلاس و کی type/interface؟',
        p:
          'در TypeScript مدرن، **پیش‌فرض type/interface** است. کلاس فقط وقتی لازم است که به رفتار + وضعیت کپسوله‌شده، وراثت واقعی، یا Decorator نیاز داری. داده‌ی خالص را هرگز با کلاس مدل نکن.',
      },
    ],
    visual: 'class-vs-type',
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'قاعده‌ی «typeof برای سازنده، نام برای نمونه»',
        body:
          'نام کلاس در TypeScript هم‌زمان دو چیز است: یک **مقدار** (سازنده) و یک **تایپ** (نمونه). هر جا `new` می‌زنی یا خود کلاس را پاس می‌دهی از `typeof Class` استفاده کن، و هر جا نتیجه‌ی `new` را داری از `Class`. همین یک قاعده، دسته‌ی بزرگی از خطاهای TS2345 را حذف می‌کند.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'ترجیح Composition بر Inheritance',
        body:
          'سلسله‌مراتب عمیق ارث‌بری (>۲ سطح) تقریباً همیشه نشانه‌ی طراحی بد است. به‌جای `extends` زنجیره‌ای، از توابع خالص + تایپ‌های ترکیبی (`&`) استفاده کن. کلاس‌ها را فقط برای مرزهای واقعی (Adapter، Repository) نگه دار.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'اشتباه گرفتن `User` با `typeof User`',
        body:
          "خطای `Type 'typeof User' is not assignable to type 'User'` یعنی کلاس را جایی گذاشته‌ای که نمونه انتظار می‌رفته. قاعده: اگر `new` می‌زنی → `typeof User`؛ اگر نتیجه‌ی `new` را داری → `User`.",
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'آیا دو کلاس مستقل با شکل یکسان سازگارند؟',
        body:
          'پاسخ: «بله، مگر اینکه عضو `private` یا `protected` داشته باشند. TypeScript ساختاری است، ولی فیلدهای خصوصی از یک کلاس خاص فقط با همان کلاس (یا زیرکلاس‌هایش) سازگارند.»',
      },
    ],
    quiz: {
      q: 'اگر بخواهی تابعی بنویسی که «خود کلاس User» را بگیرد و از آن نمونه بسازد، تایپ پارامتر چیست؟',
      options: ['`typeof User`', '`User`', '`InstanceType<User>`', '`new User`'],
      answer: 0,
      explain:
        '`User` تایپ یک نمونه است؛ `typeof User` تایپ خود سازنده است و شامل امضای `new` می‌شود. برای جنریک‌تر شدن می‌توان از `new (...args) => User` استفاده کرد.',
    },
    lab: {
      task: 'یک کلاس `StudyTimer` با وضعیت خصوصی و متد عمومی بنویس، سپس تایپ سازنده‌ی آن را استخراج کن.',
      starter: `class StudyTimer {
  #seconds = 0;
  constructor(public readonly label: string) {}
  tick(): number { this.#seconds += 1; return this.#seconds; }
}

const timer = new StudyTimer('ساعت ۱');
console.log(timer.tick(), timer.tick());

type TimerCtor = typeof StudyTimer;
const OtherTimer: TimerCtor = StudyTimer;
console.log(new OtherTimer('ساعت ۲').label);`,
      solution: `type TimerCtor = typeof StudyTimer; // تایپ سازنده
type TimerInstance = InstanceType<TimerCtor>; // تایپ نمونه`,
    },
  },

  {
    id: 'obj-enum',
    chapter: 'ch2',
    titleFa: 'تایپ Enum و جایگزین مدرن آن',
    titleEn: 'Enum',
    level: 'intermediate',
    minutes: 30,
    goal: 'انواع enum را بشناسی، معایبش را بفهمی و الگوی مدرن `as const` + Union را جایگزین کنی.',
    steps: [
      {
        h: 'گام ۱ — enum چه چیزی تولید می‌کند؟',
        p:
          '`enum` یکی از معدود ویژگی‌های TypeScript است که **کد زمان اجرا تولید می‌کند** (یک آبجکت واقعی). این یعنی erasable نیست و در محیط‌های strip-types (Node بومی، esbuild با برخی تنظیمات) مشکل‌ساز می‌شود.',
        code: `enum Direction { Up, Down }

// خروجی JavaScript:
// var Direction;
// (function (Direction) {
//   Direction[Direction["Up"] = 0] = "Up";
//   Direction[Direction["Down"] = 1] = "Down";
// })(Direction || (Direction = {}));

console.log(Direction.Up, Direction[0]); // 0 'Up'`,
      },
      {
        h: 'گام ۲ — سه نوع enum و خطرات هرکدام',
        p:
          '۱) **عددی** (پیش‌فرض): مقادیر ۰،۱،۲… — خطرناک چون هر عددی به آن منتسب می‌شود! ۲) **رشته‌ای**: امن‌تر و خودتوضیح. ۳) **Heterogeneous**: مخلوط عدد و رشته — هرگز استفاده نکن.',
        code: `enum NumStatus { Pending, Done }        // 0, 1
enum StrStatus { Pending = 'pending', Done = 'done' }

// ⚠️ خطر enum عددی — مقدار نامعتبر پذیرفته می‌شود:
const weird: NumStatus = 42;            // ✅ کامپایل می‌شود!
console.log(weird);                     // 42 — بدون هیچ معنایی

const safe: StrStatus = StrStatus.Done; // فقط مقادیر معتبر
console.log(safe);`,
      },
      {
        h: 'گام ۳ — الگوی مدرن: `as const` + Union (توصیه‌ی رسمی)',
        p:
          'امروز جامعه‌ی TypeScript به این الگو رسیده است: یک آبجکت `as const` برای مقادیر زمان اجرا، و یک Union مشتق‌شده برای تایپ. این الگو erasable است، Tree-shaking بهتری دارد و با `Record` exhaustiveness می‌دهد.',
        code: `export const Status = {
  Pending: 'pending',
  Running: 'running',
  Done: 'done',
} as const;

export type Status = (typeof Status)[keyof typeof Status];
// → 'pending' | 'running' | 'done'

const labels: Record<Status, string> = {
  pending: 'در انتظار',
  running: 'در حال اجرا',
  done: 'تکمیل شد',
};

const current: Status = Status.Running;
console.log(labels[current]);`,
      },
      {
        h: 'گام ۴ — `const enum` و چرا امروز توصیه نمی‌شود',
        p:
          '`const enum` در خروجی inlined می‌شود و آبجکتی تولید نمی‌کند، ولی با `isolatedModules` و ترنسپایلرهای تک‌فایلی **ناسازگار** است و می‌تواند مقادیر غلط تولید کند. در پروژه‌های مدرن از آن پرهیز کن.',
      },
    ],
    visual: 'enum-vs-const',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۵',
        title: 'فرمول «Erasable بودن = آینده‌نگری»',
        body:
          'هر ویژگی‌ای که کد زمان اجرا تولید می‌کند (enum، namespace، parameter properties)، تو را به یک کامپایلر خاص زنجیر می‌کند. اگر کدت کاملاً erasable باشد، با هر ابزار build و حتی Node بومی کار می‌کند. این یک تصمیم امروز است که سال‌ها سود می‌دهد.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Exhaustiveness با `Record<Status, T>`',
        body:
          'الگوی `const labels: Record<Status, string> = {...}` تضمین می‌کند **همه‌ی** اعضای Status پوشش داده شده‌اند. اگر روزی عضوی اضافه کنی، کامپایلر فوراً خطا می‌دهد. این قوی‌ترین ابزار نگهداری‌پذیری در TypeScript است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی خطرناک',
        title: 'enum عددی هر عددی را می‌پذیرد',
        body:
          '`const x: SomeEnum = 999` کامپایل می‌شود! این یک حفره‌ی امنیتی تایپی است. اگر مجبوری enum استفاده کنی، **همیشه رشته‌ای** باشد؛ ولی بهتر است کلاً سراغ الگوی `as const` بروی.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا بسیاری تیم‌ها enum را ممنوع کرده‌اند؟',
        body:
          'پاسخ: «۱) کد زمان اجرا تولید می‌کند و erasable نیست ۲) enum عددی مقادیر نامعتبر می‌پذیرد ۳) با `isolatedModules` و باندلرهای مدرن مشکل دارد ۴) الگوی `as const` + Union همه‌ی مزایایش را بدون معایبش می‌دهد.»',
      },
    ],
    quiz: {
      q: 'کدام گزینه درباره‌ی `enum` عددی صحیح است؟',
      options: [
        'انتساب هر عدد دلخواه (مثل ۴۲) به آن از نظر تایپ مجاز است',
        'فقط مقادیر تعریف‌شده در enum را می‌پذیرد',
        'هیچ کد زمان اجرایی تولید نمی‌کند',
        'با `isolatedModules` کاملاً سازگار است',
      ],
      answer: 0,
      explain:
        'TypeScript به دلایل تاریخی (پرچم‌های بیتی) اجازه می‌دهد هر عددی به یک numeric enum انتساب یابد. این یکی از مهم‌ترین دلایل مهاجرت به `as const` + Union است.',
    },
    lab: {
      task: 'یک enum عددی را به الگوی مدرن `as const` + Union تبدیل کن و یک `Record` کامل برای برچسب‌های فارسی بساز.',
      starter: `const Severity = { Low: 'low', Medium: 'medium', High: 'high' } as const;
type Severity = (typeof Severity)[keyof typeof Severity];

const faLabels: Record<Severity, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
};

const s: Severity = Severity.High;
console.log(faLabels[s]);`,
      solution: `const Severity = { Low: 'low', Medium: 'medium', High: 'high' } as const;
type Severity = (typeof Severity)[keyof typeof Severity];
const faLabels: Record<Severity, string> = { low: 'کم', medium: 'متوسط', high: 'زیاد' };`,
    },
  },

  {
    id: 'obj-array',
    chapter: 'ch2',
    titleFa: 'تایپ Array',
    titleEn: 'Array',
    level: 'beginner',
    minutes: 30,
    goal: 'هر دو سینتکس آرایه را بشناسی، تفاوت `readonly` را بفهمی و متدهای کلیدی را با تایپ دقیق استفاده کنی.',
    steps: [
      {
        h: 'گام ۱ — دو سینتکس معادل',
        p:
          '`number[]` و `Array<number>` کاملاً معادل‌اند. سینتکس اول کوتاه‌تر و رایج‌تر است؛ سینتکس دوم برای تایپ‌های پیچیده (`Array<string | number>`) یا Generics خواناتر است.',
        code: `const a: number[] = [1, 2, 3];
const b: Array<number> = [1, 2, 3];
const mixed: (string | number)[] = [1, 'two'];
const nested: number[][] = [[1], [2, 3]];

console.log(a.length, b.length, mixed.length, nested.length);`,
      },
      {
        h: 'گام ۲ — `readonly T[]` در برابر `T[]` (تفاوت حیاتی)',
        p:
          '`readonly T[]` متدهای تغییردهنده (`push`، `pop`، `sort`، `splice`) را حذف می‌کند. یک `T[]` را می‌توان به `readonly T[]` انتساب داد ولی برعکسش **ممکن نیست**.',
        code: `const mutable: number[] = [3, 1, 2];
mutable.push(4);           // ✅
mutable.sort();            // ✅ تغییر درجا

const frozen: readonly number[] = [3, 1, 2];
// frozen.push(4);         // ❌ Property 'push' does not exist
const sorted = [...frozen].sort((x, y) => x - y); // ✅ کپی سپس مرتب‌سازی

// ❌ readonly T[] → T[] مجاز نیست:
// const bad: number[] = frozen;

console.log(mutable, sorted);`,
      },
      {
        h: 'گام ۳ — `noUncheckedIndexedAccess` و دسترسی ایندکسی',
        p:
          'به‌صورت پیش‌فرض `arr[0]` تایپ `T` دارد حتی اگر آرایه خالی باشد — یک دروغ سیستماتیک. با `noUncheckedIndexedAccess: true` تایپ به `T | undefined` تبدیل می‌شود و مجبور به بررسی می‌شوی.',
        code: `const scores: number[] = [];
const first = scores[0];
// با noUncheckedIndexedAccess: number | undefined
console.log(first === undefined ? 'خالی است' : first);

// الگوی امن بدون flag:
function firstOf<T>(list: readonly T[]): T | undefined {
  return list.length > 0 ? list[0] : undefined;
}
console.log(firstOf(scores));`,
      },
      {
        h: 'گام ۴ — استنتاج آرایه از لیترال و `as const`',
        p:
          'یک لیترال آرایه با `const` تایپ `string[]` می‌گیرد (گسترش‌یافته). با `as const` به `readonly ["a","b"]` تبدیل می‌شود — یک Tuple فقط‌خواندنی با مقادیر لیترال. این پایه‌ی مشتق‌سازی Union است.',
        code: `const list1 = ['admin', 'user'];           // string[]
const list2 = ['admin', 'user'] as const;  // readonly ['admin', 'user']

type FromList1 = (typeof list1)[number]; // string
type FromList2 = (typeof list2)[number]; // 'admin' | 'user'

const role: FromList2 = 'admin';
console.log(role, list2.length);`,
      },
    ],
    visual: 'array-readonly',
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پارامترها را `readonly` بگیر، خروجی را آزاد برگردان',
        body:
          'امضای حرفه‌ای: `function total(items: readonly Item[]): Item[]`. ورودی readonly یعنی به فراخوان تضمین می‌دهی داده‌اش را تغییر نمی‌دهی؛ خروجی معمولی یعنی مصرف‌کننده آزاد است. این یک امضا، یک قرارداد روشن است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`sort()` آرایه‌ی اصلی را تغییر می‌دهد',
        body:
          '`arr.sort()` درجا مرتب می‌کند و همان آرایه را برمی‌گرداند. برای آرایه‌های `as const` یا stateهای React این یک باگ خاموش است. همیشه `[...arr].sort()` بنویس.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۱۶',
        title: 'فرمول «یک لیست، یک تایپ»',
        body:
          'هر جا یک لیست از مقادیر ثابت داری (نقش‌ها، وضعیت‌ها، کلیدها)، آن را یک‌بار با `as const` بنویس و **همه‌چیز** را از آن مشتق کن: Union، Record، تابع نگاشت. اضافه‌کردن یک عضو جدید باید فقط یک ویرایش باشد.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'متدهای آرایه را با تایپ‌های برگشتی یاد بگیر',
        body:
          'به‌جای حفظ کردن نام متدها، جدول «ورودی → خروجی» را یاد بگیر: `map: T[] → U[]`، `filter: T[] → T[]`، `reduce: T[] → U`، `find: T[] → T | undefined`، `some/every: T[] → boolean`. وقتی تایپ خروجی را بدانی، انتخاب متد خودکار می‌شود.',
      },
    ],
    quiz: {
      q: 'کدام انتساب مجاز است؟',
      options: [
        '`const x: readonly number[] = someMutableArray;`',
        '`const x: number[] = someReadonlyArray;`',
        '`someReadonlyArray.push(1);`',
        '`const x: number[] = ["1", "2"];`',
      ],
      answer: 0,
      explain:
        '`number[]` زیرمجموعه‌ی `readonly number[]` است (چون قابلیت‌های کمتری ندارد)، پس انتساب به سمت readonly امن و مجاز است. جهت برعکس ناامن است چون می‌تواند تغییرناپذیری را بشکند.',
    },
    lab: {
      task: 'تابعی بنویس که یک آرایه‌ی فقط‌خواندنی از درس‌ها بگیرد و مجموع دقایق را برگرداند — بدون تغییر آرایه‌ی ورودی.',
      starter: `type Lesson = { readonly id: string; readonly minutes: number };

function totalMinutes(lessons: readonly Lesson[]): number {
  return lessons.reduce((sum, l) => sum + l.minutes, 0);
}

const plan: readonly Lesson[] = [
  { id: 'a', minutes: 30 },
  { id: 'b', minutes: 45 },
];

console.log(totalMinutes(plan)); // 75`,
      solution: `const totalMinutes = (ls: readonly { minutes: number }[]) =>
  ls.reduce((s, l) => s + l.minutes, 0);`,
    },
  },

  {
    id: 'obj-tuple',
    chapter: 'ch2',
    titleFa: 'تایپ Tuple',
    titleEn: 'Tuple',
    level: 'intermediate',
    minutes: 30,
    goal: 'تاپل‌ها را با برچسب، عناصر اختیاری و Rest بنویسی و کاربردهای واقعی‌شان (مثل useState و خروجی چندگانه) را بفهمی.',
    steps: [
      {
        h: 'گام ۱ — تاپل = آرایه با طول و تایپ ثابت',
        p:
          'آرایه‌ی `number[]` طول متغیر و تایپ یکسان دارد؛ تاپل `[number, string]` طول دقیقاً ۲ و تایپ‌های موقعیتی متفاوت دارد. تاپل‌ها برای «چند مقدار با نقش مشخص» ایده‌آل‌اند.',
        code: `const point: [number, number] = [10, 20];
const entry: [string, number] = ['age', 30];
const triple: [string, number, boolean] = ['done', 100, true];

const [key, value] = entry; // Destructuring با تایپ دقیق
console.log(point[0], key, value, triple[2]);`,
      },
      {
        h: 'گام ۲ — تاپل با برچسب (Named Tuple) — خوانایی حرفه‌ای',
        p:
          'می‌توانی به هر خانه یک نام بدهی. این نام‌ها فقط برای خوانایی و IntelliSense‌اند و تایپ را تغییر نمی‌دهند، ولی مستندسازی زنده‌ی فوق‌العاده‌ای هستند.',
        code: `type LatLng = [lat: number, lng: number];
type HttpResponse = [status: number, body: string, ok: boolean];

const tehran: LatLng = [35.6892, 51.389];
const response: HttpResponse = [200, '{"ok":true}', true];

const [lat, lng] = tehran;
console.log(lat, lng, response[0]);`,
      },
      {
        h: 'گام ۳ — عناصر اختیاری و Rest در تاپل',
        p:
          'تاپل می‌تواند عناصر اختیاری (`?`) و Rest (`...`) داشته باشد. این الگو، پایه‌ی تایپ‌گذاری دقیق `Parameters<T>` و توابع Variadic است.',
        code: `type OptionalPair = [string, number?];
const a: OptionalPair = ['x'];        // ✅
const b: OptionalPair = ['x', 1];     // ✅

type StringFirst = [string, ...number[]];
const c: StringFirst = ['total', 1, 2, 3]; // ✅
const d: StringFirst = ['total'];           // ✅

// ⚠️ فقط یک Rest و همیشه در انتها
console.log(a.length, b.length, c.length, d.length);`,
      },
      {
        h: 'گام ۴ — کاربرد واقعی: تاپل‌های `readonly` و الگوی React',
        p:
          '`useState` در React یک تاپل برمی‌گرداند: `[value, setter]`. `Object.entries` هم `Array<[string, T]>` می‌دهد. برای جلوگیری از `push` شدن، همیشه `readonly [T, U]` یا `as const` استفاده کن.',
        code: `function useCounter(): readonly [number, () => number] {
  let count = 0;
  return [count, () => ++count] as const;
}

const [count, increment] = useCounter();
console.log(count, increment());

const user = { name: 'نیما', hours: 5 };
const pairs: [string, string | number][] = Object.entries(user);
console.log(pairs.map(([k, v]) => \`\${k}=\${v}\`).join(', '));`,
      },
    ],
    visual: 'tuple-structure',
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'روش «برچسب‌گذاری تاپل»',
        body:
          'تاپل بدون برچسب، خواننده را مجبور به حدس زدن می‌کند. همیشه برچسب بزن: `[min: number, max: number]`. برچسب‌ها در زمان اجرا حذف می‌شوند و هیچ هزینه‌ای ندارند، ولی خطای «جابه‌جا نوشتن دو مقدار هم‌نوع» را در IntelliSense آشکار می‌کنند.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تاپل حداکثر ۲ تا ۳ خانه',
        body:
          'تاپل با ۵ خانه خوانا نیست چون معنا **موقعیتی** است نه اسمی. اگر بیش از ۳ مقدار با نقش‌های متفاوت داری، از یک object type با نام‌های صریح استفاده کن. تاپل برای جفت‌های طبیعی (مختصات، کلید/مقدار، مقدار/ست‌کننده) است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'تاپل بدون `readonly` یک آرایه‌ی قابل تغییر است',
        body:
          '`const p: [number, number] = [1,2]; p.push(3);` کامپایل می‌شود! چون Tuple زیرنوع Array است. برای خروجی توابع همیشه `readonly [T, U]` یا `as const` بگذار.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'خروجی `Object.entries` چه تایپی دارد؟',
        body:
          'پاسخ: «`Array<[string, T]>` — یک آرایه از تاپل‌های دوتایی. به همین دلیل Destructuring داخل `map` روی entries به‌صورت `([k, v]) => ...` نوشته می‌شود.»',
      },
    ],
    quiz: {
      q: 'تایپ `[string, ...number[]]` کدام آرایه را می‌پذیرد؟',
      options: [
        "`['total', 1, 2, 3]` و همچنین `['total']`",
        'فقط آرایه‌هایی با دقیقاً دو خانه',
        'فقط آرایه‌هایی از عدد',
        'هیچ آرایه‌ای — این تایپ نامعتبر است',
      ],
      answer: 0,
      explain:
        'عنصر اول باید `string` باشد و بقیه (صفر یا بیشتر) `number`. این الگوی Variadic Tuple است و پایه‌ی تایپ‌های پیشرفته مثل `Parameters<T>` محسوب می‌شود.',
    },
    lab: {
      task: 'تابعی بنویس که یک آبجکت بگیرد و «کلید و مقدار بیشترین مقدار عددی» را به‌صورت تاپل با برچسب برگرداند.',
      starter: `type TopEntry = [key: string, value: number];

function topEntry(input: Record<string, number>): TopEntry | null {
  const entries = Object.entries(input);
  if (entries.length === 0) return null;
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best)) as TopEntry;
}

console.log(topEntry({ types: 12, generics: 20, utility: 15 }));`,
      solution: `const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] as [string, number];`,
    },
  },

  {
    id: 'obj-object',
    chapter: 'ch2',
    titleFa: 'تایپ Object و object literal',
    titleEn: 'Object',
    level: 'intermediate',
    minutes: 25,
    goal: 'تفاوت `object`، `Object`، `{}` و `Record` را دقیق بفهمی و بدانی چرا هر سه در کد مدرن تقریباً ممنوع‌اند.',
    steps: [
      {
        h: 'گام ۱ — چهار تایپ «آبجکت‌مانند» که همه گیج‌کننده‌اند',
        p:
          '`object` = هر مقدار غیر اولیه (آرایه، تابع، آبجکت). `Object` = تایپ آبجکت جاوااسکریپتی شامل **همه‌چیز جز null/undefined** (تقریباً بی‌فایده). `{}` = دقیقاً مثل `Object` در عمل. `Record<K,V>` = آبجکت با کلیدهای مشخص.',
        code: `const a: object = { x: 1 };          // ✅
const b: object = [1, 2];            // ✅ آرایه هم object است
const c: object = () => {};          // ✅ تابع هم object است

const d: Object = 'string';          // ✅ (!) رشته هم به Object منتسب می‌شود
const e: {} = 42;                    // ✅ عدد هم منتسب می‌شود

console.log(typeof a, typeof b, typeof c, typeof d, typeof e);`,
      },
      {
        h: 'گام ۲ — چرا `object` و `{}` تقریباً بی‌فایده‌اند؟',
        p:
          'با تایپ `object` یا `{}` هیچ دسترسی به پراپرتی مجاز نیست (`obj.x` → خطا) ولی تقریباً هر چیزی را می‌پذیرند. یعنی هم بیش از حد آزادند هم بیش از حد محدود — بدترین ترکیب ممکن.',
        code: `function process(input: object): void {
  // ❌ input.id → Property 'id' does not exist on type 'object'
  console.log(Object.keys(input).length);
}

// ✅ جایگزین‌های درست:
function processKnown(input: { id: string }): void { console.log(input.id); }
function processUnknown(input: unknown): void { console.log(typeof input); }
function processMap(input: Record<string, number>): void { console.log(input['a']); }

process({ id: 'x' });
processKnown({ id: 'x' });
processUnknown({ id: 'x' });
processMap({ a: 1 });`,
      },
      {
        h: 'گام ۳ — `Record<K, V>`: ابزار درست برای نگاشت‌ها',
        p:
          'وقتی یک دیکشنری با کلیدهای شناخته‌شده داری، `Record` بهترین ابزار است. با کلیدهای Union لیترال، **Exhaustiveness** هم می‌گیری.',
        code: `type Lang = 'fa' | 'en';
type Labels = Record<Lang, string>;

const labels: Labels = { fa: 'یادگیری', en: 'Learning' };
// ❌ اگر 'de' را اضافه کنی ولی اینجا نگذاری → خطای کامپایل

type Matrix = Record<string, number[]>;
const scores: Matrix = { types: [12, 15], generics: [18] };

console.log(labels.fa, scores['types']);`,
      },
      {
        h: 'گام ۴ — تایپ object literal دقیق (پیش‌فرض حرفه‌ای)',
        p:
          'در ۹۵٪ موارد، بهترین تایپ یک آبجکت، **تایپ لیترال دقیق** است: `{ id: string; createdAt: Date }`. نه `object`، نه `any`، نه `Record` کلی. دقیق بودن همان چیزی است که IntelliSense و Refactor را ممکن می‌کند.',
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'قاعده‌ی «هیچ‌وقت object ننویس»',
        body:
          'سه تایپ `object`، `Object` و `{}` تقریباً هر مقدار غیراولیه را می‌پذیرند، یعنی عملاً **هیچ تضمینی** نمی‌دهند. به‌جایشان دقیق‌ترین شکل ممکن را بنویس؛ اگر واقعاً شکل ناشناخته است `Record<string, unknown>` استفاده کن تا دسترسی به هر کلید، وادار به Narrowing شود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی بسیار رایج',
        title: '`{}` تقریباً هر چیزی را می‌پذیرد',
        body:
          '`const x: {} = 42` کامپایل می‌شود! چون `{}` یعنی «چیزی که null/undefined نیست». اگر واقعاً «یک آبجکت» می‌خواهی، `object` بنویس؛ اگر شکل مشخص می‌خواهی، تایپ لیترال دقیق بنویس. `{}` را عملاً هرگز استفاده نکن.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'سلسله‌مراتب انتخاب تایپ آبجکت',
        body:
          'ترتیب تصمیم: ۱) شکل دقیق مشخص است → type literal یا interface. ۲) کلیدها Union محدود است → `Record<Union, V>`. ۳) کلیدها آزادند ولی مقدار یکسان است → `Record<string, V>`. ۴) هیچ اطلاعی نداری → `unknown` (نه `object`، نه `any`).',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `object` و `Object`',
        body:
          'پاسخ: «`object` فقط مقادیر غیر اولیه را می‌پذیرد (آرایه، تابع، آبجکت) ولی `Object` تقریباً هر چیزی جز `null`/`undefined` را می‌پذیرد چون همه‌ی مقادیر متدهای prototype را دارند. در عمل هر دو بی‌فایده‌اند و باید از تایپ دقیق یا `unknown` استفاده کرد.»',
      },
    ],
    quiz: {
      q: 'کدام تایپ برای یک «دیکشنری با کلیدهای ناشناخته و مقادیر عددی» مناسب‌ترین است؟',
      options: ['`Record<string, number>`', '`object`', '`Object`', '`{}`'],
      answer: 0,
      explain:
        '`Record<string, number>` هم کلید و هم مقدار را دقیق مشخص می‌کند و دسترسی ایندکسی امن می‌دهد. `object`/`Object`/`{}` هیچ دسترسی پراپرتی مفیدی نمی‌دهند.',
    },
    lab: {
      task: 'یک `Record` با Exhaustiveness بساز: برچسب فارسی برای هر چهار فصل اصلی مسیر یادگیری.',
      starter: `const TRACKS = ['foundation', 'types', 'advanced', 'ecosystem'] as const;
type Track = (typeof TRACKS)[number];

const labels: Record<Track, string> = {
  foundation: 'مبانی',
  types: 'سیستم تایپ',
  advanced: 'انواع پیشرفته',
  ecosystem: 'اکوسیستم',
};

console.log(TRACKS.map((t) => labels[t]).join(' | '));`,
      solution: `const labels: Record<Track, string> = { foundation: 'مبانی', types: 'سیستم تایپ', advanced: 'پیشرفته', ecosystem: 'اکوسیستم' };`,
    },
  },
];
