/* ==========================================================================
   فصل ۵ — ترکیب تایپ‌ها  +  فصل ۶ — گاردها و باریک‌سازی
   (Combining · Union · Intersection · Aliases · keyof · Narrowing · instanceof
    · typeof · Equality · Truthiness · Type Predicates)
   ========================================================================== */

export const PART4_LESSONS = [
  {
    id: 'combining-types',
    chapter: 'ch5',
    titleFa: 'ترکیب تایپ‌ها — نگرش کلی',
    titleEn: 'Combining Types',
    level: 'intermediate',
    minutes: 25,
    goal: 'چهار ابزار ترکیب تایپ را بشناسی و بدانی برای هر مسئله کدام ابزار درست است.',
    steps: [
      {
        h: 'گام ۱ — چهار ابزار، چهار سؤال متفاوت',
        p:
          '`A | B` = «یا این یا آن» (اجتماع مقادیر). `A & B` = «هم این هم آن» (اشتراک الزامات). `type X = ...` = نام‌گذاری مجدد. `keyof T` = مجموعه‌ی کلیدها. انتخاب ابزار درست، ۸۰٪ طراحی تایپ است.',
        code: `type Admin = { role: 'admin'; canDelete: boolean };
type User = { id: string; name: string };

type AdminUser = Admin & User;          // هر دو مجموعه‌ی فیلد
type Identity = string | number;         // یکی از دو
type UserKey = keyof User;               // 'id' | 'name'

const u: AdminUser = { role: 'admin', canDelete: true, id: '1', name: 'نیما' };
const key: UserKey = 'name';
console.log(u[key], u.canDelete);`,
      },
      {
        h: 'گام ۲ — جدول تصمیم سریع',
        p:
          '«مقدار می‌تواند یکی از چند شکل باشد» → Union. «مقدار باید همه‌ی این ویژگی‌ها را داشته باشد» → Intersection. «می‌خواهم یک تایپ پیچیده را نام‌گذاری کنم» → Alias. «می‌خواهم کلیدهای یک تایپ را داشته باشم» → keyof.',
      },
      {
        h: 'گام ۳ — اصل DRY در ترکیب تایپ‌ها',
        p:
          'هرگز یک فیلد را در دو تایپ تکرار نکن. یک تایپ پایه بنویس و با Intersection یا `extends` ترکیب کن. اگر روزی `email` عوض شد، باید فقط یک ویرایش لازم باشد.',
        code: `type Timestamps = { readonly createdAt: Date; readonly updatedAt: Date };
type Identity = { readonly id: string };

type BaseEntity = Identity & Timestamps;
type Post = BaseEntity & { readonly title: string };
type AppComment = BaseEntity & { readonly body: string; readonly postId: string };

const post: Post = {
  id: 'p1', createdAt: new Date(0), updatedAt: new Date(0), title: 'TypeScript',
};
console.log(post.title, post.id);`,
      },
    ],
    visual: 'combine-venn',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۷',
        title: 'فرمول «تایپ‌های کوچک، ترکیب‌های بزرگ»',
        body:
          'به‌جای سه تایپ بزرگ با فیلدهای تکراری، هفت تایپ کوچک و قابل ترکیب بساز. تایپ کوچک = قابل استفاده‌تر، قابل تست‌تر، و قابل حذف‌تر. این همان اصل Single Responsibility در سطح تایپ است.',
        equation: 'انعطاف طراحی = (تعداد تایپ‌های کوچک) × (تعداد راه‌های ترکیب آن‌ها)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قاعده‌ی نام‌گذاری: `Base`، `With*`، `*Only`',
        body:
          'برای تایپ‌های ترکیبی نام‌های گویا بساز: `BaseEntity`، `WithTimestamps`، `IdOnly`. این کار خواننده را از بازکردن تعریف تایپ بی‌نیاز می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'Intersection از تایپ‌های ناسازگار = `never`',
        body:
          '`string & number` عملاً `never` است چون هیچ مقداری نمی‌تواند هم رشته باشد هم عدد. اگر Intersection غیرمنتظره‌ای `never` شد، یعنی دو تایپ عضو ناسازگار دارند (معمولاً یک فیلد با دو تایپ متفاوت).',
      },
    ],
    quiz: {
      q: 'برای مدلسازی «یک موجودیت که هم `id` دارد و هم `createdAt` و هم `title`»، کدام ابزار مناسب‌ترین است؟',
      options: [
        'Intersection تایپ‌های کوچک (`Identity & Timestamps & { title: string }`)',
        'Union سه تایپ',
        '`keyof` روی یک تایپ بزرگ',
        '`Record<string, unknown>`',
      ],
      answer: 0,
      explain:
        'وقتی مقدار باید **همه‌ی** ویژگی‌ها را داشته باشد، Intersection ابزار درست است. ترکیب تایپ‌های کوچک هم اصل DRY را رعایت می‌کند.',
    },
    lab: {
      task: 'سه تایپ کوچک (`Id`، `Audit`، `Content`) بساز و با Intersection یک تایپ `Article` مشتق کن.',
      starter: `type Id = { readonly id: string };
type Audit = { readonly createdAt: Date; readonly updatedAt: Date };
type Content = { readonly title: string; readonly body: string };

type Article = Id & Audit & Content;

const article: Article = {
  id: 'a1',
  createdAt: new Date(0),
  updatedAt: new Date(0),
  title: 'ترکیب تایپ‌ها',
  body: 'Intersection یعنی اشتراک الزامات.',
};

console.log(article.title, article.id);`,
      solution: `type Article = Id & Audit & Content;`,
    },
  },

  {
    id: 'union-types',
    chapter: 'ch5',
    titleFa: 'Union Types',
    titleEn: 'Union Types',
    level: 'intermediate',
    minutes: 45,
    goal: 'Union را عمیقاً بفهمی؛ از Union لیترال تا Discriminated Union که مهم‌ترین الگوی طراحی تایپ در TypeScript است.',
    steps: [
      {
        h: 'گام ۱ — Union یعنی «یکی از این‌ها»',
        p:
          '`A | B` مجموعه‌ی **اجتماع** مقادیر است. نکته‌ی کلیدی: روی یک Union فقط به اعضا و متدهای **مشترک** همه‌ی اعضا دسترسی داری؛ برای بقیه باید Narrow کنی.',
        code: `function formatId(id: string | number): string {
  // ✅ متد مشترک: toString روی هر دو وجود دارد
  const asText = id.toString();

  // ❌ id.toUpperCase() → فقط روی string است
  if (typeof id === 'string') {
    return id.toUpperCase();
  }
  return asText.padStart(6, '0');
}

console.log(formatId('abc'), formatId(42));`,
      },
      {
        h: 'گام ۲ — Union لیترال: قوی‌ترین ابزار مدل‌سازی دامنه',
        p:
          'به‌جای `string` آزاد، مقادیر مجاز را صریح فهرست کن. این کار هم غلط املایی را می‌گیرد، هم IntelliSense کامل می‌دهد، هم Refactor را امن می‌کند.',
        code: `type Status = 'idle' | 'loading' | 'success' | 'error';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function request(method: HttpMethod, path: string): string {
  return \`\${method} \${path}\`;
}

const status: Status = 'loading';
console.log(request('GET', '/users'), status);`,
      },
      {
        h: 'گام ۳ — Discriminated Union: الگوی طلایی طراحی تایپ',
        p:
          'هر عضو یک فیلد مشترک با مقدار لیترال یکتا دارد (Discriminant، مثل `kind`). با یک `switch` روی آن فیلد، TypeScript به‌صورت خودکار هر شاخه را Narrow می‌کند و به فیلدهای اختصاصی دسترسی می‌دهی.',
        code: `type Result<T> =
  | { readonly kind: 'ok'; readonly value: T }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'pending' };

function render(result: Result<string>): string {
  switch (result.kind) {
    case 'ok':      return \`✅ \${result.value}\`;
    case 'error':   return \`❌ \${result.message}\`;
    case 'pending': return '⏳ در حال بارگذاری';
  }
}

console.log(render({ kind: 'ok', value: 'موفق' }));
console.log(render({ kind: 'error', message: 'تایم‌اوت' }));`,
      },
      {
        h: 'گام ۴ — عملیات روی Union: توزیع (Distribution)',
        p:
          'Conditional Types روی Union **توزیع** می‌شوند: `T extends U ? X : Y` برای هر عضو جدا اجرا می‌شود. همچنین `keyof (A | B)` = `keyof A & keyof B` (فقط کلیدهای مشترک).',
        code: `type NonNullish<T> = T extends null | undefined ? never : T;
type Clean = NonNullish<string | number | null>; // string | number

type Box = { size: number; color: string };
type Colored = { color: string; opacity: number };
type CommonKeys = keyof (Box | Colored); // 'color'

const c: Clean = 'text';
const k: CommonKeys = 'color';
console.log(c, k);`,
      },
    ],
    visual: 'union-narrow',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۸',
        title: 'فرمول «حالت‌های نامعتبر را غیرقابل بیان کن»',
        body:
          'به‌جای `interface State { isLoading: boolean; error: string | null; data: User[] | null }` (که ۸ حالت ممکن دارد و فقط ۴ تایشان معتبر است)، یک Discriminated Union بنویس که **فقط** حالت‌های معتبر را اجازه دهد. این کار کل دسته‌ی باگ‌های «loading و error هم‌زمان true» را حذف می‌کند.',
        equation: 'باگ‌های حالت = (تعداد حالت‌های قابل بیان) − (تعداد حالت‌های معتبر) → هدف: صفر',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'نام Discriminant را یکدست کن',
        body:
          'در کل کدبیس یک نام انتخاب کن: `kind` یا `type` یا `_tag`. مخلوط کردن آن‌ها، نوشتن توابع عمومی را غیرممکن می‌کند. `kind` رایج‌ترین انتخاب در جامعه‌ی TypeScript است.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'Unionها را روی کاغذ رسم کن',
        body:
          'برای هر Discriminated Union، یک درخت تصمیم بکش: گره‌ها = `kind`ها، برگ‌ها = فیلدهای موجود. این تصویر، نوشتن `switch` کامل را مکانیکی می‌کند و جای هیچ case فراموش‌شده‌ای نمی‌ماند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Discriminated Union چیست و چرا قدرتمند است؟',
        body:
          'پاسخ: «یک Union از object typeها که همه یک فیلد مشترک با مقادیر لیترال یکتا دارند. با switch روی آن فیلد، کامپایلر هر شاخه را به‌صورت خودکار Narrow می‌کند و ترکیب آن با `assertNever` پوشش کامل را در زمان کامپایل تضمین می‌کند.»',
      },
    ],
    quiz: {
      q: 'روی یک متغیر با تایپ `string | number`، کدام متد بدون Narrowing قابل فراخوانی است؟',
      options: ['`toString()`', '`toUpperCase()`', '`toFixed()`', '`padStart()`'],
      answer: 0,
      explain:
        'TypeScript فقط به اعضای **اشتراک** همه‌ی اعضای Union اجازه‌ی دسترسی می‌دهد. `toString` روی هر دو وجود دارد، ولی `toUpperCase` فقط string و `toFixed`/`padStart` هر کدام مخصوص یکی‌اند.',
    },
    lab: {
      task: 'یک Discriminated Union برای «وضعیت یک درس» بساز (برنامه‌ریزی‌شده / در حال مطالعه / تکمیل‌شده با نمره) و تابع رندر بنویس.',
      starter: `type LessonStatus =
  | { readonly kind: 'planned'; readonly date: string }
  | { readonly kind: 'studying'; readonly progress: number }
  | { readonly kind: 'done'; readonly score: number };

function renderLesson(s: LessonStatus): string {
  switch (s.kind) {
    case 'planned': return \`📅 برنامه‌ریزی: \${s.date}\`;
    case 'studying': return \`⏳ پیشرفت: \${s.progress}%\`;
    case 'done': return \`✅ نمره: \${s.score}\`;
  }
}

console.log(renderLesson({ kind: 'studying', progress: 60 }));
console.log(renderLesson({ kind: 'done', score: 19 }));`,
      solution: `// افزودن assertNever در default، پوشش کامل را تضمین می‌کند
default: { const _exhaustive: never = s; return _exhaustive; }`,
    },
  },

  {
    id: 'intersection-types',
    chapter: 'ch5',
    titleFa: 'Intersection Types',
    titleEn: 'Intersection Types',
    level: 'intermediate',
    minutes: 30,
    goal: 'Intersection را برای ترکیب قراردادها به کار بگیری و از دو تله‌ی اصلی آن (ناسازگاری و تکرار) پرهیز کنی.',
    steps: [
      {
        h: 'گام ۱ — `&` یعنی «همه‌ی الزامات با هم»',
        p:
          '`A & B` تایپی است که باید **هم** اعضای `A` و **هم** اعضای `B` را ارضا کند. پرکاربردترین کاربرد: افزودن قابلیت‌ها به یک تایپ پایه (Mixin).',
        code: `type HasId = { readonly id: string };
type HasTimestamps = { readonly createdAt: Date };
type Trackable = { readonly trackingId: string };

type Entity = HasId & HasTimestamps & Trackable;

const e: Entity = {
  id: 'e1', createdAt: new Date(0), trackingId: 'tr-9',
};
console.log(e.id, e.trackingId);`,
      },
      {
        h: 'گام ۲ — تداخل فیلدها: چه اتفاقی می‌افتد؟',
        p:
          'اگر دو تایپ فیلد هم‌نام با تایپ‌های متفاوت داشته باشند، تایپ نهایی **Intersection آن دو** می‌شود. اگر ناسازگار باشند، نتیجه `never` است و آن فیلد غیرقابل استفاده می‌شود.',
        code: `type A = { value: string };
type B = { value: number };
type AB = A & B;

// ❌ عملاً غیرقابل ساخت:
// const bad: AB = { value: 'x' };   // number هم لازم است
// const bad2: AB = { value: 1 };    // string هم لازم است

// ✅ تنها راه (بدون faking):
const forced: AB = { value: 'x' as unknown as string & number };
console.log(typeof forced.value);`,
      },
      {
        h: 'گام ۳ — `extends` در interface در برابر `&`',
        p:
          'هر دو ترکیب می‌کنند، ولی تفاوت ظریف دارند: `interface X extends Y` **قبل از ادغام بررسی تداخل** می‌کند و خطای واضح می‌دهد، ولی `&` تداخل را بی‌صدا به `never` تبدیل می‌کند. برای اینترفیس‌ها، `extends` امن‌تر است.',
        code: `interface Base { readonly id: string }
interface Extended extends Base { readonly name: string }

type ExtendedViaIntersection = Base & { readonly name: string };

const a: Extended = { id: '1', name: 'نیما' };
const b: ExtendedViaIntersection = { id: '1', name: 'سارا' };
console.log(a.name, b.name);`,
      },
      {
        h: 'گام ۴ — Intersection با تابع (Callable + Properties)',
        p:
          'الگوی قدرتمند: یک تابع که هم callable است هم پراپرتی دارد (مثل `Object.assign`). برای این کار یک امضای فراخوانی را با یک object type ترکیب می‌کنیم.',
        code: `type Formatter = ((input: string) => string) & { readonly version: string };

const formatter: Formatter = Object.assign(
  (input: string) => input.trim().toUpperCase(),
  { version: '1.0.0' }
);

console.log(formatter('  سلام  '), formatter.version);`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی خاموش',
        title: 'Intersection ناسازگار، `never` می‌سازد بدون هیچ هشدار',
        body:
          'برخلاف `interface extends` که تداخل را صریحاً خطا می‌دهد، `&` بی‌صدا یک تایپ غیرقابل ساخت می‌سازد. اگر دیدی ساخت یک آبجکت غیرممکن شده، اول Intersectionها را برای فیلد هم‌نام بررسی کن.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Mixinهای کوچک و تک‌مسئولیتی',
        body:
          'هر قابلیت را در یک تایپ کوچک با پیشوند `Has*` یا `With*` بگذار: `HasId`، `WithPagination`، `Trackable`. این‌گونه ترکیب‌ها خوانا و قابل استفاده‌ی مجدد می‌شوند و تکرار به صفر می‌رسد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۲۹',
        title: 'فرمول «ترکیب به‌جای وراثت»',
        body:
          'هر جا در زبان‌های شیءگرا `extends` می‌نوشتی، در TypeScript اول `&` (یا `extends` اینترفیس) را امتحان کن. ترکیب، سلسله‌مراتب شکننده نمی‌سازد و هر جزء به‌تنهایی قابل تست و حذف است.',
        equation: 'شکنندگی طراحی ∝ (عمق سلسله‌مراتب وراثت) — ترکیب این عمق را صفر نگه می‌دارد',
      },
    ],
    quiz: {
      q: 'نتیجه‌ی `string & number` چیست و چرا؟',
      options: [
        'عملاً `never`، چون هیچ مقداری نمی‌تواند هم‌زمان رشته و عدد باشد',
        '`string | number`',
        '`any`',
        'یک تایپ جدید به نام `stringNumber`',
      ],
      answer: 0,
      explain:
        'Intersection اشتراک مجموعه‌ی مقادیر است و اشتراک رشته و عدد تهی است. TypeScript آن را به `never` کاهش می‌دهد (گاهی با تأخیر و در قالب یک intersection حل‌نشده نمایش می‌دهد).',
    },
    lab: {
      task: 'دو Mixin بساز (`WithPagination` و `WithSorting`) و با Intersection یک تایپ `QueryOptions` بساز.',
      starter: `type WithPagination = { readonly page: number; readonly perPage: number };
type WithSorting = { readonly sortBy: string; readonly order: 'asc' | 'desc' };

type QueryOptions = WithPagination & WithSorting & { readonly search?: string };

const options: QueryOptions = {
  page: 1, perPage: 20, sortBy: 'createdAt', order: 'desc', search: 'typescript',
};

console.log(options.page, options.order, options.search);`,
      solution: `type QueryOptions = WithPagination & WithSorting & { readonly search?: string };`,
    },
  },

  {
    id: 'type-aliases',
    chapter: 'ch5',
    titleFa: 'Type Aliases',
    titleEn: 'Type Aliases',
    level: 'intermediate',
    minutes: 30,
    goal: 'توانایی نام‌گذاری هر تایپی (از لیترال تا Generic و Union) را پیدا کنی و قواعد نام‌گذاری حرفه‌ای را بدانی.',
    steps: [
      {
        h: 'گام ۱ — alias می‌تواند «هر تایپی» باشد',
        p:
          'برخلاف `interface` که فقط شکل آبجکت است، `type` می‌تواند Union، Tuple، Primitive، تابع، Generic، Conditional و Mapped type را نام‌گذاری کند. این انعطاف، دلیل اصلی انتخاب `type` در کد مدرن است.',
        code: `type UserId = string;                       // Primitive
type Pair = [string, number];               // Tuple
type Status = 'idle' | 'done';              // Union
type Callback = (err: Error | null) => void; // تابع
type Box<T> = { readonly value: T };        // Generic
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

const id: UserId = 'u1';
const p: Pair = ['x', 1];
const b: Box<number> = { value: 42 };
console.log(id, p, b.value);`,
      },
      {
        h: 'گام ۲ — alias یک «نام جدید» است نه یک «تایپ جدید»',
        p:
          '`type UserId = string` هیچ محافظت نام‌ایجاد نمی‌کند: `UserId` و `string` کاملاً جابه‌جایند. اگر تفکیک واقعی می‌خواهی، Branded Type لازم است.',
        code: `type UserId = string;
type OrderId = string;

function getUser(id: UserId): string { return \`user-\${id}\`; }

const orderId: OrderId = 'o-1';
console.log(getUser(orderId)); // ✅ کامپایل می‌شود! ⚠️ بدون محافظت

// ✅ محافظت واقعی:
type SafeUserId = string & { readonly __brand: 'UserId' };
function getUserSafe(id: SafeUserId): string { return \`user-\${id}\`; }
console.log(getUserSafe('u-1' as SafeUserId));`,
      },
      {
        h: 'گام ۳ — قواعد نام‌گذاری حرفه‌ای',
        p:
          'PascalCase، بدون پیشوند `I` یا `T` (سبک قدیمی C#)، و نام باید **دامنه** را بگوید نه ساختار را. `UserDto` نه `IUserDto`، `SerializedPost` نه `PostObject`.',
        code: `// ❌ سبک قدیمی و پر از نویز:
// interface IUserDTO { ... }

// ✅ سبک مدرن:
type UserDto = { readonly id: string; readonly name: string };
type SerializedUser = string;
type UserMap = ReadonlyMap<string, UserDto>;

const users: UserMap = new Map([['1', { id: '1', name: 'نیما' }]]);
console.log(users.size);`,
      },
      {
        h: 'گام ۴ — aliasهای بازگشتی (Recursive)',
        p:
          'alias می‌تواند به خودش ارجاع دهد؛ این پایه‌ی مدل‌سازی ساختارهای درختی و JSON است.',
        code: `type JsonValue =
  | string | number | boolean | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

const payload: JsonValue = { users: [{ id: '1', tags: ['a', 'b'] }] };
console.log(JSON.stringify(payload));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پیشوند `I` را برای همیشه حذف کن',
        body:
          '`IUser` یک عادت باقی‌مانده از C# است و در TypeScript نویز محسوب می‌شود. داکیومنت رسمی و تمام کتابخانه‌های بزرگ از `User` استفاده می‌کنند. خواننده نیازی ندارد بداند تایپ با `type` نوشته شده یا `interface`.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۰',
        title: 'فرمول «نام دامنه، نه نام ساختار»',
        body:
          'نام تایپ باید به سؤال «این چیست؟» پاسخ دهد نه «چطور ساخته شده؟». `NonEmptyStringList` بد است؛ `SearchSuggestions` خوب است. وقتی نام دامنه‌ای باشد، تغییر ساختار بدون شکستن نام ممکن می‌شود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'alias بدون برند، محافظت نمی‌کند',
        body:
          '`type Email = string` و `type Phone = string` کاملاً جابه‌جایند؛ پاس دادن شماره تلفن به تابع ایمیل هیچ خطایی نمی‌دهد. برای شناسه‌های هم‌شکل، Branded Type تنها راه محافظت واقعی است.',
      },
    ],
    quiz: {
      q: 'کدام تایپ را **فقط** با `type` می‌توان نام‌گذاری کرد و با `interface` نمی‌شود؟',
      options: [
        'یک Union از لیترال‌ها (`type Status = "a" | "b"`)',
        'یک شکل آبجکت با فیلدهای readonly',
        'یک اینترفیس با متد',
        'یک اینترفیس که از دیگری ارث می‌برد',
      ],
      answer: 0,
      explain:
        '`interface` فقط می‌تواند شکل آبجکت (و callable/constructable) را توصیف کند. Union، Tuple، Primitive alias، Mapped و Conditional Types فقط با `type` ممکن‌اند.',
    },
    lab: {
      task: 'یک تایپ بازگشتی `Tree<T>` بساز و یک درخت از سرفصل‌های درس ایجاد کن.',
      starter: `type Tree<T> = {
  readonly value: T;
  readonly children?: readonly Tree<T>[];
};

const syllabus: Tree<string> = {
  value: 'TypeScript',
  children: [
    { value: 'Types', children: [{ value: 'Union' }, { value: 'Intersection' }] },
    { value: 'Generics' },
  ],
};

function depth<T>(node: Tree<T>): number {
  return 1 + Math.max(0, ...(node.children ?? []).map(depth));
}

console.log(depth(syllabus)); // 3`,
      solution: `type Tree<T> = { readonly value: T; readonly children?: readonly Tree<T>[] };`,
    },
  },

  {
    id: 'keyof-operator',
    chapter: 'ch5',
    titleFa: 'عملگر keyof',
    titleEn: 'keyof Operator',
    level: 'intermediate',
    minutes: 40,
    goal: '`keyof`، `typeof` و Indexed Access را به‌عنوان سه‌گانه‌ی طلایی مشتق‌سازی تایپ مسلط شوی.',
    steps: [
      {
        h: 'گام ۱ — `keyof T` = Union کلیدها',
        p:
          '`keyof` تمام کلیدهای عمومی یک تایپ را به یک Union تبدیل می‌کند. برای Index Signature نتیجه `string | number` و برای تایپ بدون کلید `never` است.',
        code: `type User = { id: string; name: string; age?: number };
type UserKey = keyof User; // 'id' | 'name' | 'age'

const k: UserKey = 'name';
console.log(k);

// نکته: برای آرایه، کلیدها شامل متدها هم می‌شوند
type ArrKeys = keyof string[]; // 'length' | 'push' | 'map' | ...
console.log(typeof k);`,
      },
      {
        h: 'گام ۲ — سه‌گانه‌ی طلایی: `keyof` + `typeof` + Indexed Access',
        p:
          'این سه با هم، قوی‌ترین ابزار DRY در TypeScript هستند: از یک **مقدار واقعی** تایپ بساز، کلیدهایش را استخراج کن، و تایپ هر کلید را بگیر.',
        code: `const DEFAULT_SETTINGS = {
  theme: 'dark',
  fontSize: 14,
  autosave: true,
} as const;

type Settings = typeof DEFAULT_SETTINGS;      // از مقدار به تایپ
type SettingKey = keyof Settings;             // 'theme' | 'fontSize' | 'autosave'
type ThemeValue = Settings['theme'];          // 'dark'

const key: SettingKey = 'fontSize';
const value = DEFAULT_SETTINGS[key];
console.log(value, DEFAULT_SETTINGS.theme);`,
      },
      {
        h: 'گام ۳ — الگوی `getProperty` با Generic (کاربرد کلاسیک)',
        p:
          'مهم‌ترین کاربرد `keyof`: نوشتن توابع عمومی که با هر آبجکتی کار می‌کنند و تایپ بازگشتی **دقیق** دارند.',
        code: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 'u1', name: 'نیما', age: 30 };

const name = getProperty(user, 'name'); // string
const age = getProperty(user, 'age');   // number
// ❌ getProperty(user, 'email') → خطای کامپایلر

console.log(name, age);`,
      },
      {
        h: 'گام ۴ — `keyof` با Union و Intersection',
        p:
          '`keyof (A | B)` = کلیدهای **مشترک** (اشتراک). `keyof (A & B)` = کلیدهای **هر دو** (اجتماع). این قاعده را حفظ کن؛ منبع بسیاری از تعجب‌هاست.',
        code: `type A = { a: string; shared: number };
type B = { b: string; shared: number };

type UnionKeys = keyof (A | B);   // 'shared'
type InterKeys = keyof (A & B);   // 'a' | 'b' | 'shared'

const u: UnionKeys = 'shared';
const i: InterKeys = 'a';
console.log(u, i);`,
      },
    ],
    visual: 'keyof-flow',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۱',
        title: 'فرمول «هرگز کلید را دستی تکرار نکن»',
        body:
          'اگر نام یک فیلد را در بیش از یک جا نوشتی، نقض DRY کرده‌ای. با `keyof typeof source` کلیدها را از **یک منبع** بگیر. افزودن فیلد جدید باید فقط یک ویرایش باشد و همه‌جا خودکار به‌روز شود.',
        equation: 'تعداد نقاط شکست هنگام افزودن فیلد = ۱ (با keyof) در برابر n (با تکرار دستی)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'توابع عمومی را با `K extends keyof T` بنویس',
        body:
          'هر تابعی که نام فیلد را به‌عنوان ورودی می‌گیرد باید این امضا را داشته باشد. بدون آن، غلط املایی در نام کلید بی‌صدا عبور می‌کند و `undefined` برمی‌گردد.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تمرین «تایپ را از داده بساز»',
        body:
          'برای هر ثابت در پروژه‌ات (کانفیگ، برچسب‌ها، مسیرها) یک بار `typeof` + `keyof` بزن و تایپ‌ها را مشتق کن. بعد از ۱۰ تمرین، مغزت به‌صورت خودکار به‌جای «تایپ بنویسم» می‌گوید «از داده مشتق کنم».',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `keyof T` و `keyof typeof x`',
        body:
          'پاسخ: «`keyof T` روی یک تایپ عمل می‌کند؛ `keyof typeof x` اول تایپ مقدار `x` را می‌گیرد بعد کلیدهایش را. برای ثابت‌های زمان اجرا (مثل یک آبجکت کانفیگ) همیشه `keyof typeof` لازم است.»',
      },
    ],
    quiz: {
      q: 'تایپ `keyof (A | B)` که `A = {a: string; s: number}` و `B = {b: string; s: number}` است، چیست؟',
      options: ["`'s'`", "`'a' | 'b' | 's'`", "`'a' | 'b'`", '`never`'],
      answer: 0,
      explain:
        'یک مقدار از نوع `A | B` می‌تواند A یا B باشد، پس فقط به کلیدی می‌توان دسترسی داشت که در **هر دو** وجود دارد. بنابراین `keyof` روی Union، اشتراک کلیدها را می‌دهد.',
    },
    lab: {
      task: 'تابع `pick` بنویس که فقط کلیدهای مشخصی از یک آبجکت را برمی‌دارد — کاملاً تایپ‌امن و بدون `any`.',
      starter: `function pick<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = source[key];
  }
  return result;
}

const user = { id: 'u1', name: 'نیما', age: 30, email: 'n@x.com' };
const preview = pick(user, ['id', 'name']);
console.log(preview);`,
      solution: `function pick<T extends object, K extends keyof T>(src: T, keys: readonly K[]): Pick<T, K> {
  return keys.reduce((acc, k) => ({ ...acc, [k]: src[k] }), {} as Pick<T, K>);
}`,
    },
  },

  {
    id: 'type-guards-narrowing',
    chapter: 'ch6',
    titleFa: 'گاردهای تایپ و باریک‌سازی',
    titleEn: 'Type Guards / Narrowing',
    level: 'intermediate',
    minutes: 45,
    goal: 'مفهوم Control Flow Analysis را بفهمی و شش دسته گارد را بشناسی تا هر Union را به‌درستی باریک کنی.',
    steps: [
      {
        h: 'گام ۱ — Narrowing چیست؟',
        p:
          'TypeScript جریان کنترل کد تو را **دنبال** می‌کند: اگر داخل `if (typeof x === "string")` باشی، در آن بلوک `x` تایپ `string` دارد. این تحلیل، Control Flow Analysis نام دارد و قلب امنیت TypeScript است.',
        code: `function describe(value: string | number | boolean): string {
  if (typeof value === 'string') return \`رشته: \${value.toUpperCase()}\`;
  if (typeof value === 'number') return \`عدد: \${value.toFixed(2)}\`;
  return \`بولین: \${value ? 'درست' : 'نادرست'}\`;
}

console.log(describe('سلام'));
console.log(describe(3.14159));
console.log(describe(false));`,
      },
      {
        h: 'گام ۲ — هفت ابزار باریک‌سازی',
        p:
          '۱) `typeof` ۲) `instanceof` ۳) `in` ۴) بررسی برابری (`===`، `== null`) ۵) Truthiness ۶) Discriminant property ۷) Type Predicate سفارشی (`x is T`). هرکدام برای یک دسته تایپ مناسب است.',
        code: `class ApiError extends Error { constructor(public code: number) { super('api'); } }

function handle(e: unknown): string {
  if (e instanceof ApiError) return \`API \${e.code}\`;         // instanceof
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;                       // typeof
  if (e && typeof e === 'object' && 'message' in e) {        // in
    return String((e as { message: unknown }).message);
  }
  return 'ناشناخته';
}

console.log(handle(new ApiError(500)), handle('خطای ساده'));`,
      },
      {
        h: 'گام ۳ — باریک‌سازی با `in` و Discriminant',
        p:
          'عملگر `in` برای تشخیص وجود پراپرتی استفاده می‌شود و Union را بر اساس آن جدا می‌کند. برای Discriminated Union، یک `switch` روی فیلد مشترک کافی است.',
        code: `type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird): string {
  if ('swim' in animal) { animal.swim(); return 'شنا کرد'; }
  animal.fly();
  return 'پرواز کرد';
}

const bird: Bird = { fly: () => console.log('🕊️') };
console.log(move(bird));`,
      },
      {
        h: 'گام ۴ — باریک‌سازی با تابع کمکی (الگوی حرفه‌ای)',
        p:
          'اگر یک بررسی را در چند جا تکرار می‌کنی، آن را به یک **Type Predicate** تبدیل کن. این کار هم DRY است و هم در همه‌ی نقاط Narrowing انجام می‌دهد.',
        code: `function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function shout(value: unknown): string {
  if (!isNonEmptyString(value)) return '(خالی)';
  return value.toUpperCase() + '!'; // ✅ value: string
}

console.log(shout('typescript'), shout('   '), shout(42));`,
      },
      {
        h: 'گام ۵ — وقتی Narrowing کار نمی‌کند (سه حالت رایج)',
        p:
          '۱) داخل callbackها (چون زمان اجرا متفاوت است). ۲) بعد از `await` برای متغیرهای `let`. ۳) وقتی پراپرتی را در یک متغیر واسطه نگه داری. راه‌حل: نتیجه‌ی بررسی را در یک `const` ذخیره کن.',
        code: `const items: (string | undefined)[] = ['a', undefined, 'b'];

// ❌ این کار نمی‌کند — filter بدون predicate تایپ را باریک نمی‌کند
const naive = items.filter((x) => x !== undefined); // (string | undefined)[]

// ✅ با Type Predicate:
const clean = items.filter((x): x is string => x !== undefined); // string[]

console.log(naive.length, clean.map((s) => s.toUpperCase()));`,
      },
    ],
    visual: 'narrowing-tree',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۲',
        title: 'فرمول «یک‌بار بررسی، همه‌جا استفاده»',
        body:
          'هر بررسی نوعی که بیش از یک‌بار تکرار شود باید به یک Type Guard تبدیل شود. این کار سه سود دارد: حذف تکرار، Narrowing خودکار در همه‌ی نقاط مصرف، و یک نقطه‌ی تغییر برای منطق اعتبارسنجی.',
        equation: 'تعداد باگ‌های اعتبارسنجی ∝ ۱ ÷ (میزان مرکزی‌سازی گاردها)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'گاردها را در `guards.ts` متمرکز کن',
        body:
          'همه‌ی Type Predicateهای پروژه را در یک ماژول بگذار و با نام `is*` export کن. این کار باعث می‌شود منطق اعتبارسنجی قابل بازبینی، قابل تست و قابل جایگزینی باشد.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «حذف تدریجی»',
        body:
          'هنگام Narrowing یک Union بزرگ، از **ساده‌ترین و قطعی‌ترین** بررسی شروع کن (`typeof`، سپس `instanceof`، سپس `in`) و با هر شاخه یک عضو را حذف کن. این الگو مثل الگوریتم جست‌وجوی دودویی، سریع به جواب می‌رسد.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'Narrowing داخل callback از بین می‌رود',
        body:
          'اگر `if (x !== undefined)` بنویسی و داخلش یک callback (مثل `setTimeout` یا `.map`) استفاده کنی، TypeScript دوباره تایپ را broad می‌کند چون مقدار ممکن است عوض شود. راه‌حل: `const safeX = x;` بعد از گارد.',
      },
    ],
    quiz: {
      q: 'چرا `items.filter(x => x !== undefined)` تایپ آرایه را به `string[]` باریک نمی‌کند؟',
      options: [
        'چون `filter` بدون یک Type Predicate، تایپ عنصر را تغییر نمی‌دهد و باید `(x): x is string => ...` نوشت',
        'چون `filter` همیشه `any[]` برمی‌گرداند',
        'چون `undefined` در زمان اجرا حذف نمی‌شود',
        'چون باید از `map` استفاده کرد',
      ],
      answer: 0,
      explain:
        'امضای عمومی `filter` تایپ عنصر را حفظ می‌کند. TypeScript یک overload ویژه برای predicate دارد: اگر callback یک Type Guard (`x is T`) برگرداند، نتیجه `T[]` می‌شود.',
    },
    lab: {
      task: 'یک گارد `isRecord` و یک گارد `isUser` بنویس و یک `unknown` را به `User` تبدیل کن.',
      starter: `type User = { readonly id: string; readonly name: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUser(value: unknown): value is User {
  return isRecord(value)
    && typeof value['id'] === 'string'
    && typeof value['name'] === 'string';
}

const data: unknown = JSON.parse('{"id":"u1","name":"نیما"}');
if (isUser(data)) {
  console.log(data.name.toUpperCase());
} else {
  console.log('کاربر نامعتبر');
}`,
      solution: `function isUser(v: unknown): v is User {
  return isRecord(v) && typeof v.id === 'string' && typeof v.name === 'string';
}`,
    },
  },

  {
    id: 'guard-instanceof',
    chapter: 'ch6',
    titleFa: 'گارد instanceof',
    titleEn: 'instanceof',
    level: 'intermediate',
    minutes: 25,
    goal: '`instanceof` را درست به کار بگیری و سه محدودیت مهمش (cross-realm، ساختارگرایی، و خطاهای ناشی از `unknown`) را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — `instanceof` روی زنجیره‌ی prototype',
        p:
          '`x instanceof C` بررسی می‌کند آیا `C.prototype` در زنجیره‌ی prototype مقدار `x` هست یا نه. TypeScript از این بررسی برای باریک‌سازی به تایپ نمونه‌ی `C` استفاده می‌کند.',
        code: `class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

function describeError(err: unknown): string {
  if (err instanceof HttpError) return \`HTTP \${err.status}: \${err.message}\`;
  if (err instanceof Error) return \`Error: \${err.message}\`;
  return \`Unknown: \${String(err)}\`;
}

console.log(describeError(new HttpError(404, 'یافت نشد')));
console.log(describeError(new RangeError('خارج از محدوده')));`,
      },
      {
        h: 'گام ۲ — `instanceof` فقط برای سازنده‌ها کار می‌کند',
        p:
          'نمی‌توانی `x instanceof string` بنویسی (خطای زمان اجرا!). برای انواع اولیه فقط `typeof` کار می‌کند. همچنین `interface` و `type alias` چون سازنده ندارند، با `instanceof` قابل بررسی نیستند.',
        code: `// ❌ TypeError در زمان اجرا:
// console.log('text' instanceof String); // کار می‌کند ولی false برای primitive!

console.log(typeof 'text' === 'string');     // ✅ true
console.log('text' instanceof String);       // ⚠️ false (primitive ≠ wrapper)
console.log(new String('x') instanceof String); // true

interface Shape { area(): number }  // بدون سازنده → instanceof ممکن نیست
class Circle implements Shape { area() { return 1; } }
console.log(new Circle() instanceof Circle); // ✅`,
      },
      {
        h: 'گام ۳ — مشکل Cross-realm (iframe/worker/vm)',
        p:
          'هر realm یک `Array` و `Error` مستقل دارد. `iframeArray instanceof Array` در realm والد **false** است! برای همین بررسی‌های ساختاری مثل `Array.isArray` همیشه ترجیح داده می‌شوند.',
        code: `function safeCheck(value: unknown): string {
  if (Array.isArray(value)) return \`array(\${value.length})\`;  // ✅ cross-realm safe
  if (value instanceof Date) return 'date';                    // ⚠️ cross-realm ناامن
  return typeof value;
}

console.log(safeCheck([1, 2, 3]), safeCheck(new Date(0)), safeCheck(42));`,
      },
      {
        h: 'گام ۴ — الگوی حرفه‌ای: Discriminated Union به‌جای instanceof',
        p:
          'در کد مدرن TypeScript، سلسله‌مراتب کلاس + `instanceof` معمولاً با Union + `kind` جایگزین می‌شود؛ چون ساختاری است، قابل serialize است، و با `assertNever` پوشش کامل می‌دهد.',
        code: `type Failure =
  | { readonly kind: 'http'; readonly status: number }
  | { readonly kind: 'network'; readonly reason: string }
  | { readonly kind: 'unknown' };

function label(f: Failure): string {
  switch (f.kind) {
    case 'http': return \`HTTP \${f.status}\`;
    case 'network': return \`Network: \${f.reason}\`;
    case 'unknown': return 'Unknown';
  }
}

console.log(label({ kind: 'http', status: 500 }));`,
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تکنیک «اول instanceof، بعد گارد دستی»',
        body:
          'ترتیب بهینه: اگر با کلاس‌های واقعی سروکار داری `instanceof` کوتاه‌ترین راه است؛ اگر با داده‌ی JSON یا ماژول‌های تکراری سروکار داری، سراغ گارد ساختاری (بررسی وجود فیلد مميز) برو. `instanceof` در دو realm مختلف یا دو کپی از یک کلاس، به‌شکلی خاموش جواب غلط می‌دهد.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی مهم',
        title: 'Cross-realm: `instanceof Array` ممکن است false باشد',
        body:
          'برای آرایه همیشه `Array.isArray` استفاده کن (تنها راه cross-realm امن). برای آبجکت‌های ساده هم `typeof v === "object" && v !== null` مطمئن‌تر از `instanceof Object` است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'خطاهای سفارشی را با یک Base Class مرکزی بساز',
        body:
          'یک `class AppError extends Error` با فیلد `code` بساز و همه‌ی خطاهای دامنه از آن ارث ببرند. سپس در مرز برنامه یک‌بار `if (err instanceof AppError)` بررسی کن. این کار مدیریت خطا را DRY و قابل پیش‌بینی می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا `catch (err)` در TS 4.4+ از نوع `unknown` است؟',
        body:
          'پاسخ: «با `useUnknownInCatchVariables` (عضو strict)، چون در JavaScript هر چیزی می‌تواند throw شود — رشته، آبجکت، حتی `undefined`. پس `unknown` صادقانه‌ترین تایپ است و تو را مجبور به بررسی می‌کند.»',
      },
    ],
    quiz: {
      q: 'کدام بررسی برای «آیا مقدار یک آرایه است» مطمئن‌ترین است؟',
      options: ['`Array.isArray(value)`', '`value instanceof Array`', '`typeof value === "array"`', '`value.constructor === Array`'],
      answer: 0,
      explain:
        '`Array.isArray` تنها روشی است که cross-realm کار می‌کند و برای آرایه‌های ساخته‌شده در iframe/worker/vm هم درست جواب می‌دهد. `typeof` برای آرایه `"object"` برمی‌گرداند نه `"array"`.',
    },
    lab: {
      task: 'یک سلسله‌مراتب خطای سفارشی بساز (`AppError` ← `ValidationError` و `NotFoundError`) و یک تابع گزارش بنویس.',
      starter: `class AppError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

class ValidationError extends AppError {
  constructor(public readonly field: string) { super('VALIDATION', \`فیلد نامعتبر: \${field}\`); }
}

class NotFoundError extends AppError {
  constructor(resource: string) { super('NOT_FOUND', \`\${resource} پیدا نشد\`); }
}

function report(err: unknown): string {
  if (err instanceof ValidationError) return \`[\${err.code}] \${err.field}\`;
  if (err instanceof NotFoundError) return \`[\${err.code}] \${err.message}\`;
  if (err instanceof AppError) return \`[\${err.code}] عمومی\`;
  if (err instanceof Error) return err.message;
  return 'خطای ناشناخته';
}

console.log(report(new ValidationError('email')));
console.log(report(new NotFoundError('کاربر')));`,
      solution: `class AppError extends Error { constructor(public readonly code: string, message: string) { super(message); } }`,
    },
  },

  {
    id: 'guard-typeof',
    chapter: 'ch6',
    titleFa: 'گارد typeof',
    titleEn: 'typeof',
    level: 'beginner',
    minutes: 25,
    goal: 'هفت خروجی ممکن `typeof` را بشناسی، تفاوت `typeof` نوعی و `typeof` تایپی را بفهمی و الگوهای ترکیبی را یاد بگیری.',
    steps: [
      {
        h: 'گام ۱ — هفت خروجی واقعی `typeof` در زمان اجرا',
        p:
          '`"string"`، `"number"`، `"boolean"`، `"undefined"`، `"object"`، `"function"`، `"symbol"`، `"bigint"`. توجه: `typeof null === "object"` (یک باگ تاریخی جاوااسکریپت) و `typeof [] === "object"`.',
        code: `const samples: unknown[] = ['x', 1, true, undefined, null, {}, () => {}, Symbol('s'), 10n];

for (const s of samples) {
  console.log(typeof s);
}
// ⚠️ null هم 'object' چاپ می‌شود!`,
      },
      {
        h: 'گام ۲ — دو `typeof` کاملاً متفاوت',
        p:
          'در **موقعیت مقدار**، `typeof x` یک رشته برمی‌گرداند. در **موقعیت تایپ**، `typeof x` تایپ آن مقدار را استخراج می‌کند. این دوگانگی یکی از قدرتمندترین ویژگی‌های TypeScript است.',
        code: `const config = { theme: 'dark', size: 14 };

// موقعیت مقدار → رشته:
console.log(typeof config); // 'object'

// موقعیت تایپ → تایپ خود آبجکت:
type Config = typeof config;      // { theme: string; size: number }
type ConfigKeys = keyof typeof config; // 'theme' | 'size'

const c: Config = { theme: 'light', size: 16 };
console.log(c.theme);`,
      },
      {
        h: 'گام ۳ — الگوهای ترکیبی رایج',
        p:
          'بررسی «آبجکت واقعی» نیاز به دو شرط دارد: `typeof v === "object" && v !== null`. برای توابع `typeof v === "function"` (که هم callable بودن و هم وجود را می‌سنجد).',
        code: `function typeOfValue(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  switch (typeof v) {
    case 'string': return 'string';
    case 'number': return Number.isFinite(v) ? 'number' : 'non-finite';
    case 'boolean': return 'boolean';
    case 'undefined': return 'undefined';
    case 'function': return 'function';
    case 'bigint': return 'bigint';
    case 'symbol': return 'symbol';
    default: return 'object';
  }
}

console.log([null, [1], 'a', NaN, () => {}].map(typeOfValue).join(', '));`,
      },
      {
        h: 'گام ۴ — محدودیت `typeof`: نمی‌تواند تایپ‌های سفارشی را تشخیص دهد',
        p:
          '`typeof` فقط انواع اولیه را تفکیک می‌کند. برای تشخیص `Date`، `RegExp`، یا کلاس‌های خودت به `instanceof` یا بررسی ساختاری (`in`، یا گارد سفارشی) نیاز داری.',
        code: `function describe(v: unknown): string {
  if (typeof v !== 'object' || v === null) return typeof v;
  if (v instanceof Date) return \`date(\${v.toISOString().slice(0, 10)})\`;
  if (v instanceof RegExp) return \`regex(\${v.source})\`;
  return 'plain object';
}

console.log(describe(new Date(0)), describe(/abc/g), describe({ a: 1 }));`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی تاریخی',
        title: '`typeof null === "object"`',
        body:
          'این یک باگ در اولین نسخه‌ی JavaScript بود که هرگز اصلاح نشد (چون کل وب به آن وابسته است). پس هر بررسی `typeof v === "object"` **باید** با `v !== null` همراه باشد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۳',
        title: 'فرمول «typeof برای اولیه، instanceof برای کلاس، in برای ساختار»',
        body:
          'این سه‌گانه را حفظ کن و به ترتیب استفاده کن. بیشتر باگ‌های Narrowing از انتخاب ابزار اشتباه می‌آید: مثلاً استفاده از `instanceof Object` به‌جای `typeof v === "object"`.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'یک تابع `typeName(value: unknown): string` مشترک بنویس',
        body:
          'به‌جای پراکندن زنجیره‌ی `typeof`ها در کل کد، یک تابع کمکی بنویس که `null`، `array`، `date` و بقیه را درست تشخیص دهد. این تابع در لاگ‌گیری و دیباگ بارها استفاده می‌شود.',
      },
    ],
    quiz: {
      q: 'در `type X = typeof myValue`، عملگر `typeof` چه کاری می‌کند؟',
      options: [
        'تایپ مقدار `myValue` را استخراج می‌کند (نه یک رشته)',
        'یک رشته مثل `"object"` برمی‌گرداند',
        'مقدار را به `any` تبدیل می‌کند',
        'خطا می‌دهد چون `typeof` فقط در زمان اجرا معتبر است',
      ],
      answer: 0,
      explain:
        'در موقعیت تایپ، `typeof` یک عملگر کاملاً متفاوت است: تایپ استنتاج‌شده‌ی یک مقدار زمان اجرا را به یک تایپ تبدیل می‌کند. این پایه‌ی الگوی «تایپ از داده» است.',
    },
    lab: {
      task: 'تابع `typeName` بنویس که `null`، آرایه، `Date` و انواع اولیه را درست تشخیص دهد.',
      starter: `function typeName(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  const t = typeof value;
  if (t === 'object') return 'object';
  return t;
}

const samples: unknown[] = [null, [1, 2], new Date(0), /x/, 'text', 5, undefined, {}];
console.log(samples.map(typeName).join(' | '));`,
      solution: `const typeName = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : v instanceof Date ? 'date' : typeof v;`,
    },
  },

  {
    id: 'guard-equality',
    chapter: 'ch6',
    titleFa: 'باریک‌سازی با برابری (Equality)',
    titleEn: 'Equality',
    level: 'intermediate',
    minutes: 25,
    goal: 'سه عملگر برابری و اثر دقیق هرکدام بر Narrowing را بشناسی و از `== null` به‌درستی استفاده کنی.',
    steps: [
      {
        h: 'گام ۱ — `===` و باریک‌سازی لیترال‌ها',
        p:
          'مقایسه‌ی `===` با یک لیترال، تایپ را به همان لیترال باریک می‌کند. این پایه‌ی کار با Union لیترال است.',
        code: `function handle(status: 'idle' | 'loading' | 'done'): string {
  if (status === 'idle') return 'آماده';       // status: 'idle'
  if (status === 'loading') return 'در حال…';  // status: 'loading'
  return \`تکمیل: \${status}\`;                   // status: 'done'
}

console.log(handle('idle'), handle('done'));`,
      },
      {
        h: 'گام ۲ — `== null`: تنها استفاده‌ی مجاز از `==`',
        p:
          '`value == null` دقیقاً معادل `value === null || value === undefined` است. این تنها موردی است که جامعه‌ی JS/TS استفاده از `==` را می‌پذیرد و حتی ESLint با گزینه‌ی `eqeqeq: ["error", "always", {null: "ignore"}]` آن را مجاز می‌کند.',
        code: `function orDefault<T>(value: T | null | undefined, fallback: T): T {
  if (value == null) return fallback;  // هر دو null و undefined
  return value;
}

console.log(orDefault(null, 'default'));
console.log(orDefault(undefined, 42));
console.log(orDefault('real', 'default'));`,
      },
      {
        h: 'گام ۳ — چرا `==` خطرناک است (جدول تبدیل اجباری)',
        p:
          '`0 == ""`، `0 == false`، `"" == false`، `[] == false` همه `true` هستند! این تبدیل‌های اجباری غیرقابل پیش‌بینی‌اند. تنها استثناء منطقی، `== null` است.',
        code: `console.log(0 == '' as unknown as number); // مقایسه‌های گیج‌کننده
console.log([] == false);   // true ⚠️
console.log('0' == false);  // true ⚠️
console.log([] === false);  // false ✅
console.log(null == undefined);  // true (تنها مورد مفید)
console.log(null === undefined); // false`,
      },
      {
        h: 'گام ۴ — باریک‌سازی با `!==` و حذف اعضا',
        p:
          'مقایسه‌ی منفی، اعضای Union را **حذف** می‌کند. اگر همه‌ی اعضا لیترال باشند، در شاخه‌ی `else` تایپ دقیقاً به باقی‌مانده محدود می‌شود.',
        code: `type Mode = 'read' | 'write' | 'admin';

function permission(mode: Mode): number {
  if (mode === 'read') return 1;
  if (mode === 'write') return 2;
  return 3; // اینجا mode: 'admin'
}

console.log(permission('admin'));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قانون `eqeqeq` با استثنا برای null',
        body:
          'در ESLint: `"eqeqeq": ["error", "always", { "null": "ignore" }]`. این‌گونه هم از تبدیل اجباری خطرناک جلوگیری می‌کنی و هم از `== null` مختصر و خوانا بهره می‌بری.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۴',
        title: 'فرمول «حذف تدریجی اعضا»',
        body:
          'در یک Union با n عضو، هر مقایسه‌ی `===` یک عضو را قطعی و هر `!==` یک عضو را حذف می‌کند. پس با n−۱ مقایسه، عضو آخر به‌صورت خودکار و بدون هیچ بررسی تعیین می‌شود — این همان Exhaustive narrowing است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`if (!value)` با مقدار `0` و `""`',
        body:
          'Truthiness گارد، مقادیر معتبر مثل `0`، `""` و `false` را هم حذف می‌کند. وقتی این مقادیر معنادارند، فقط `value == null` یا `value === undefined` بنویس.',
      },
    ],
    quiz: {
      q: 'عبارت `value == null` دقیقاً با کدام عبارت معادل است؟',
      options: [
        '`value === null || value === undefined`',
        '`value === null`',
        '`!value`',
        '`value === undefined`',
      ],
      answer: 0,
      explain:
        'در تبدیل اجباری JavaScript، `null` و `undefined` فقط با هم و با خودشان با `==` برابرند. پس `== null` هر دو حالت تهی را می‌گیرد ولی `0`، `""` و `false` را نمی‌گیرد.',
    },
    lab: {
      task: 'تابعی بنویس که یک مقدار ممکن‌التهی بگیرد و با `== null` مقدار پیش‌فرض برگرداند — طوری که `0` و `""` به‌درستی حفظ شوند.',
      starter: `function withDefault<T>(value: T | null | undefined, fallback: T): T {
  return value == null ? fallback : value;
}

console.log(withDefault(0, 42));        // 0  ✅
console.log(withDefault('', 'x'));      // '' ✅
console.log(withDefault(null, 'x'));    // 'x'
console.log(withDefault(undefined, 7)); // 7`,
      solution: `const withDefault = <T>(v: T | null | undefined, fb: T): T => (v == null ? fb : v);`,
    },
  },

  {
    id: 'guard-truthiness',
    chapter: 'ch6',
    titleFa: 'باریک‌سازی با Truthiness',
    titleEn: 'Truthiness',
    level: 'intermediate',
    minutes: 25,
    goal: 'هفت مقدار falsy را بشناسی، اثر truthiness بر Narrowing را بفهمی و از سه باگ کلاسیک پرهیز کنی.',
    steps: [
      {
        h: 'گام ۱ — دقیقاً هفت مقدار falsy وجود دارد',
        p:
          '`false`، `0`، `-0`، `0n`، `""`، `null`، `undefined`، `NaN`. هر چیز دیگری truthy است — **شامل `[]`، `{}` و `"0"`** که تازه‌کارها را غافلگیر می‌کند.',
        code: `const falsyValues: unknown[] = [false, 0, -0, 0n, '', null, undefined, NaN];
const surprising: unknown[] = [[], {}, '0', ' ', () => {}];

console.log('falsy:', falsyValues.filter((v) => !v).length);   // 8
console.log('truthy:', surprising.filter((v) => Boolean(v)).length); // 5`,
      },
      {
        h: 'گام ۲ — Narrowing با truthiness چه چیزی را حذف می‌کند؟',
        p:
          '`if (value)` روی `string | undefined` تایپ را به `string` باریک می‌کند — ولی هم‌زمان `""` را هم حذف می‌کند! اگر رشته‌ی خالی معنادار است، این گارد اشتباه است.',
        code: `function shoutMaybe(value: string | undefined): string {
  if (value) return value.toUpperCase();  // "" هم رد می‌شود!
  return '(خالی)';
}

function shoutPrecise(value: string | undefined): string {
  if (value !== undefined) return value.toUpperCase() || '(رشته‌ی خالی)';
  return '(تعریف‌نشده)';
}

console.log(shoutMaybe(''), shoutMaybe('سلام'));
console.log(shoutPrecise(''), shoutPrecise(undefined));`,
      },
      {
        h: 'گام ۳ — سه باگ کلاسیک truthiness',
        p:
          '۱) `if (count)` وقتی `count === 0` معنادار است. ۲) `if (items)` برای آرایه — همیشه truthy است حتی اگر خالی باشد. ۳) `value || default` که مقادیر falsy معتبر را دور می‌ریزد.',
        code: `const items: string[] = [];
console.log(items ? 'truthy!' : 'falsy');  // 'truthy!' ⚠️ همیشه
console.log(items.length ? 'پر' : 'خالی');  // ✅ درست

let retries = 0;
const usedRetries = retries || 3;   // ⚠️ 3 — صفر را نادیده گرفت
const correctRetries = retries ?? 3; // ✅ 0

console.log(usedRetries, correctRetries);`,
      },
      {
        h: 'گام ۴ — الگوی صحیح برای هر دسته تایپ',
        p:
          'برای `T | null | undefined` → `v == null`. برای آرایه → `v.length > 0`. برای عدد → `v !== undefined`. برای رشته → `v !== undefined && v.length > 0` (اگر خالی مهم است).',
        code: `type Maybe<T> = T | null | undefined;

const isPresent = <T>(v: Maybe<T>): v is T => v != null;
const isNonEmptyArray = <T>(v: Maybe<T[]>): v is T[] => Array.isArray(v) && v.length > 0;
const isNonEmptyString = (v: Maybe<string>): v is string => typeof v === 'string' && v.length > 0;

console.log(isPresent(0), isNonEmptyArray([]), isNonEmptyString(''));`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی بسیار رایج',
        title: '`if (arr)` همیشه truthy است',
        body:
          'آرایه‌ی خالی یک آبجکت است و truthy. `if (users)` هرگز false نمی‌شود. همیشه `if (users.length > 0)` بنویس. همین اشتباه برای `{}` هم صادق است.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۵',
        title: 'فرمول «هر گارد باید دقیقاً همان چیزی را حذف کند که می‌خواهی»',
        body:
          'قبل از نوشتن `if (value)` از خودت بپرس: «کدام مقادیر را می‌خواهم رد کنم؟» اگر جواب شامل `0` یا `""` نیست، گارد truthiness **اشتباه** است و باید صریح مقایسه کنی.',
        equation: 'صحت گارد = (مجموعه‌ی مقادیر ردشده توسط گارد) == (مجموعه‌ی مقادیر نامعتبر مورد نظر)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پیش‌فرض: `??` و صریح‌سازی',
        body:
          'در کد مدرن، `||` را با `??` جایگزین کن مگر اینکه **عمداً** بخواهی همه‌ی falsyها جایگزین شوند. این یک تغییر کوچک، یک دسته باگ بزرگ را حذف می‌کند.',
      },
    ],
    quiz: {
      q: 'کدام مقدار truthy است؟',
      options: ['`[]` (آرایه‌ی خالی)', '`0n`', '`""`', '`NaN`'],
      answer: 0,
      explain:
        'آرایه و آبجکت — حتی خالی — همیشه truthy هستند. هفت مقدار falsy عبارت‌اند از: `false`، `0`، `-0`، `0n`، `""`، `null`، `undefined`، `NaN`.',
    },
    lab: {
      task: 'سه گارد دقیق بنویس: `isPresent`، `isNonEmptyString`، `isNonEmptyArray` و هر سه را آزمایش کن.',
      starter: `type Maybe<T> = T | null | undefined;

function isPresent<T>(v: Maybe<T>): v is T { return v != null; }
function isNonEmptyString(v: Maybe<string>): v is string {
  return typeof v === 'string' && v.length > 0;
}
function isNonEmptyArray<T>(v: Maybe<readonly T[]>): v is readonly T[] {
  return Array.isArray(v) && v.length > 0;
}

console.log(isPresent(0), isNonEmptyString(''), isNonEmptyArray([]));
console.log(isPresent('x'), isNonEmptyString('x'), isNonEmptyArray([1]));`,
      solution: `const isPresent = <T>(v: T | null | undefined): v is T => v != null;`,
    },
  },

  {
    id: 'guard-predicates',
    chapter: 'ch6',
    titleFa: 'Type Predicates و توابع گارد سفارشی',
    titleEn: 'Type Predicates',
    level: 'advanced',
    minutes: 40,
    goal: 'توابع گارد سفارشی (`x is T`) و `asserts` بنویسی و بدانی چطور گاردها را ترکیب و تست کنی.',
    steps: [
      {
        h: 'گام ۱ — سینتکس `value is Type`',
        p:
          'یک تابع با تایپ بازگشتی `x is T` به کامپایلر می‌گوید: «اگر `true` برگشتم، `x` از نوع `T` است». این قدرتمندترین ابزار Narrowing برای منطق‌های پیچیده است.',
        code: `type Cat = { readonly meow: () => string };
type Dog = { readonly bark: () => string };

function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal;
}

const kitty: Cat = { meow: () => 'میو!' };
if (isCat(kitty)) {
  console.log(kitty.meow()); // ✅ Cat
}`,
      },
      {
        h: 'گام ۲ — گاردهای ترکیبی و Generic',
        p:
          'گاردها را می‌توان ترکیب کرد و عمومی نوشت. این الگو، پایه‌ی کتابخانه‌های اعتبارسنجی مثل zod است.',
        code: `function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const names: unknown = ['نیما', 'سارا'];
const ages: unknown = [30, 25];

if (isArrayOf(names, isString)) console.log(names.map((n) => n.toUpperCase()));
if (isArrayOf(ages, isNumber)) console.log(ages.reduce((a, b) => a + b, 0));`,
      },
      {
        h: 'گام ۳ — `asserts` : گاردهای بدون بازگشت مقدار',
        p:
          '`asserts value is T` یعنی «اگر این تابع بدون throw برگشت، از این خط به بعد `value` از نوع `T` است». برای توابع اعتبارسنجی که throw می‌کنند ایده‌آل است.',
        code: `function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('مقدار باید رشته باشد');
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const input: unknown = 'سلام دنیا';
assertIsString(input);
console.log(input.toUpperCase()); // ✅ input: string

const list: unknown[] = [1, 2];
assert(list.length > 0, 'لیست خالی است');
console.log(list.length);`,
      },
      {
        h: 'گام ۴ — خطر بزرگ: گارد دروغگو',
        p:
          'Type Predicate یک **تعهد** است نه یک بررسی. اگر بدنه‌ی تابع با ادعای امضا نخواند، کامپایلر هیچ خطایی نمی‌دهد و تو در زمان اجرا crash می‌گیری. پس هر گارد باید تست واحد داشته باشد.',
        code: `// ❌ گارد دروغگو — کامپایل می‌شود ولی اشتباه است:
function isStringBad(v: unknown): v is string {
  return v != null; // هر چیزی جز تهی را string اعلام می‌کند!
}

const bad: unknown = 42;
if (isStringBad(bad)) {
  // کامپایلر فکر می‌کند bad یک string است:
  console.log(typeof bad === 'string' ? bad.toUpperCase() : 'دروغ گفت!');
}`,
      },
    ],
    visual: 'predicate-flow',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۶',
        title: 'فرمول «گارد = مستند + تست + Narrowing»',
        body:
          'یک Type Guard خوب سه نقش هم‌زمان دارد: مستندسازی قرارداد داده، فراهم‌کردن تست‌پذیری متمرکز، و باریک‌سازی تایپ در همه‌ی نقاط مصرف. سرمایه‌گذاری روی گاردها، بیشترین بازدهی را در کل کدبیس دارد.',
        equation: 'کیفیت تایپ کدبیس = (درصد ورودی‌های بیرونی که از گارد عبور می‌کنند) × (دقت گاردها)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'گاردها را خالص و بدون side effect بنویس',
        body:
          'یک گارد نباید لاگ بزند، چیزی ذخیره کند یا وضعیت عوض کند. فقط بررسی و `boolean`. این کار تست کردن و استدلال درباره‌اش را ساده می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی جدی',
        title: 'کامپایلر بدنه‌ی گارد را بررسی نمی‌کند',
        body:
          'اگر بنویسی `function isDog(x: unknown): x is Dog { return true; }` هیچ خطایی نمی‌گیری ولی کل امنیت تایپ را از بین برده‌ای. همیشه برای هر گارد حداقل دو تست (مورد مثبت و منفی) بنویس.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `x is T` و `asserts x is T`',
        body:
          'پاسخ: «`x is T` یک تایپ بازگشتی است و Narrowing به نتیجه‌ی boolean وابسته است؛ `asserts x is T` تایپ بازگشتی `void` دارد و Narrowing **بعد از فراخوانی** اعمال می‌شود (اگر throw نکند). دومی برای توابع اعتبارسنجی assert-style مناسب است.»',
      },
    ],
    quiz: {
      q: 'اگر بدنه‌ی یک تابع با امضای `v is string` منطقی اشتباه داشته باشد، چه اتفاقی می‌افتد؟',
      options: [
        'کامپایلر خطا نمی‌دهد و در زمان اجرا ممکن است برنامه بشکند',
        'کامپایلر خطای TS2322 می‌دهد',
        'TypeScript بدنه را بررسی و اصلاح می‌کند',
        'تابع به `boolean` معمولی تبدیل می‌شود',
      ],
      answer: 0,
      explain:
        'Type Predicate یک تعهد برنامه‌نویس است. کامپایلر به آن اعتماد می‌کند و صحت منطقی بدنه را نمی‌سنجد — به همین دلیل گاردها باید تست واحد داشته باشند.',
    },
    lab: {
      task: 'یک گارد `isNonEmptyArray` بنویس و از آن برای فیلتر یک لیست `unknown` استفاده کن.',
      starter: `function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

const raw: unknown = ['نیما', 'سارا', 'آرش'];

if (isNonEmptyArray<string>(raw)) {
  const [first, ...rest] = raw;
  console.log(first.toUpperCase(), rest.length);
} else {
  console.log('لیست خالی است');
}`,
      solution: `function isNonEmptyArray<T>(v: unknown): v is [T, ...T[]] {
  return Array.isArray(v) && v.length > 0;
}`,
    },
  },
];
