/* ==========================================================================
   فصل ۱۲ — انواع پیشرفته
   (Advanced Types · Mapped · Conditional · Literal · Template Literal · Recursive)
   ========================================================================== */

export const PART9_LESSONS = [
  {
    id: 'advanced-types',
    chapter: 'ch12',
    titleFa: 'انواع پیشرفته — نگرش کلی',
    titleEn: 'Advanced Types',
    level: 'advanced',
    minutes: 35,
    goal: 'نقشه‌ی ذهنی «برنامه‌نویسی در سطح تایپ» را بسازی و بفهمی این فصل چه قدرتی به تو می‌دهد.',
    steps: [
      {
        h: 'گام ۱ — تایپ‌ها یک زبان برنامه‌نویسی جدا هستند',
        p:
          'لایه‌ی تایپ TypeScript یک زبان **تابعی کامل** است: متغیر (type alias)، پارامتر (Generic)، شرط (Conditional)، حلقه (Mapped روی کلیدها)، تابع (Utility Types) و بازگشت. یاد گرفتن این زبان، سطح تو را از «کاربر TypeScript» به «طراح تایپ» ارتقا می‌دهد.',
        code: `// متغیر ← type alias
type Name = string;

// پارامتر ← Generic
type Box<T> = { value: T };

// شرط ← Conditional
type IsString<T> = T extends string ? true : false;

// حلقه ← Mapped
type ReadonlyAll<T> = { readonly [K in keyof T]: T[K] };

// تابع ← Utility composition
type Draft<T> = Partial<Omit<T, 'id'>>;

type A = IsString<'x'>;   // true
type B = IsString<1>;     // false
const a: A = true;
const b: B = false;
console.log(a, b);`,
      },
      {
        h: 'گام ۲ — پنج ابزار اصلی این فصل',
        p:
          '۱) **Mapped Types** — تبدیل همه‌ی فیلدها. ۲) **Conditional Types** — منطق شرطی + توزیع. ۳) **Literal Types** — مقادیر به‌عنوان تایپ. ۴) **Template Literal Types** — الگوهای رشته‌ای + دستکاری رشته. ۵) **Recursive Types** — ساختارهای خودارجاع.',
      },
      {
        h: 'گام ۳ — یک مثال ترکیبی واقعی',
        p:
          'قدرت واقعی وقتی است که این پنج با هم ترکیب شوند. مثلاً ساخت خودکار تایپ رویدادهای یک آبجکت.',
        code: `type User = { id: string; name: string; age: number };

// ۱) Template Literal + Mapped: نام رویدادها
type EventName<T> = { [K in keyof T & string as \`\${K}Changed\`]: T[K] };

// ۲) Conditional: فقط فیلدهای عددی
type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];

type UserEvents = EventName<User>;
// → { idChanged: string; nameChanged: string; ageChanged: number }

type Numeric = NumericKeys<User>; // 'age'

const events: UserEvents = { idChanged: '1', nameChanged: 'نیما', ageChanged: 31 };
const numeric: Numeric = 'age';
console.log(events.ageChanged, numeric);`,
      },
      {
        h: 'گام ۴ — قانون طلایی: سادگی بر هوشمندی',
        p:
          'تایپ‌های پیشرفته ابزار قدرتمندی هستند ولی **خوانایی** یک کدبیس مهم‌تر از ظرافت تایپی است. اگر یک تایپ برای فهمیدن به بیش از ۱۰ ثانیه زمان نیاز دارد، ساده‌اش کن یا نام‌های میانی بگذار.',
        code: `// ❌ غیرقابل خواندن:
type Bad<T> = T extends readonly (infer E)[] ? E extends { id: infer I } ? I : never : never;

// ✅ همان کار، قابل خواندن:
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type IdOf<T> = T extends { id: infer I } ? I : never;
type Good<T> = IdOf<ElementOf<T>>;

type Ids = Good<{ id: string }[]>; // string
const ids: Ids = 'x';
console.log(ids, typeof Bad);`,
      },
    ],
    visual: 'type-programming',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۸',
        title: 'فرمول «۸۰/۲۰ تایپ‌های پیشرفته»',
        body:
          'برای ۹۵٪ کار روزمره، همین‌ها کافی است: `keyof`، `typeof`، Indexed Access، `Partial/Pick/Omit/Record`، یک Conditional ساده و یک Mapped ساده. بقیه‌ی ابزارها (`infer` تودرتو، Template Literal پیچیده) را فقط وقتی لازم شد یاد بگیر.',
        equation: 'بهره‌وری تایپی = تسلط عمیق بر ۶ ابزار پرکاربرد > آشنایی سطحی با ۳۰ ابزار کمیاب',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تایپ‌های پیچیده را به لایه‌های نام‌دار بشکن',
        body:
          'به‌جای یک تایپ ۵ خطی تودرتو، سه alias یک‌خطی با نام معنادار بنویس. هر alias یک نقطه‌ی مستندسازی و یک نقطه‌ی تست است. خواننده می‌تواند در هر لایه متوقف شود.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'با «تایپ‌های کوچکی که شکست می‌خورند» یاد بگیر',
        body:
          'برای هر تایپ پیشرفته، یک نسخه‌ی ساده با ورودی مشخص بنویس و نتیجه را با `^?` ببین. بعد ورودی را پیچیده‌تر کن. این روش «افزایشی»، یادگیری تایپ‌های پیشرفته را از ترسناک به بازی تبدیل می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'سطح تایپ TypeScript یک زبان برنامه‌نویسی است؟',
        body:
          'پاسخ: «بله، یک زبان تابعی Turing-complete در سطح تایپ. Generic = تابع، Conditional = شرط، Mapped = حلقه، `infer` = الگومatching، Union/Intersection = نوع داده‌ی جبری. به همین دلیل می‌توان محاسبات واقعی (مثل Type-level arithmetic) در آن انجام داد.»',
      },
    ],
    quiz: {
      q: 'کدام ابزار سطح تایپ، نقش «حلقه» را در برنامه‌نویسی تایپ بازی می‌کند؟',
      options: ['Mapped Types (`[K in keyof T]`)', 'Conditional Types', '`infer`', 'Union Types'],
      answer: 0,
      explain:
        'Mapped Type روی مجموعه‌ی کلیدها پیمایش می‌کند و برای هر کلید یک فیلد جدید تولید می‌کند — دقیقاً معادل یک حلقه `for..in` در سطح تایپ.',
    },
    lab: {
      task: 'یک تایپ `Getters<T>` بساز که برای هر فیلد `T` یک متد `get<Field>()` تولید کند.',
      starter: `type Capitalize2<S extends string> = S extends \`\${infer F}\${infer R}\`
  ? \`\${Uppercase<F>}\${R}\`
  : S;

type Getters<T> = {
  [K in keyof T as \`get\${Capitalize2<K & string>}\`]: () => T[K];
};

type User = { id: string; age: number };
type UserGetters = Getters<User>;
// → { getId: () => string; getAge: () => number }

const getters: UserGetters = {
  getId: () => 'u1',
  getAge: () => 30,
};
console.log(getters.getId(), getters.getAge());`,
      solution: `type Getters<T> = { [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K] };`,
    },
  },

  {
    id: 'mapped-types',
    chapter: 'ch12',
    titleFa: 'Mapped Types',
    titleEn: 'Mapped Types',
    level: 'advanced',
    minutes: 45,
    goal: 'ساختار Mapped Types را کامل بفهمی: Modifierها، Key Remapping با `as` و Homomorphic بودن.',
    steps: [
      {
        h: 'گام ۱ — ساختار پایه: `[K in keyof T]`',
        p:
          'یک Mapped Type روی مجموعه‌ی کلیدها پیمایش می‌کند و برای هر کلید یک فیلد با تایپ دلخواه می‌سازد. این پایه‌ی ساخت `Partial`، `Readonly`، `Pick` و ده‌ها تایپ سفارشی است.',
        code: `type Stringify<T> = { [K in keyof T]: string };
type Optionalize<T> = { [K in keyof T]?: T[K] };
type ArraysOf<T> = { [K in keyof T]: T[K][] };

type User = { id: number; name: string; active: boolean };

type AllStrings = Stringify<User>;       // { id: string; name: string; active: string }
type AllOptional = Optionalize<User>;
type AllArrays = ArraysOf<User>;

const a: AllStrings = { id: '1', name: 'نیما', active: 'true' };
const b: AllArrays = { id: [1], name: ['x'], active: [true] };
console.log(a.id, b.id.length);`,
      },
      {
        h: 'گام ۲ — چهار Modifier: `+?`, `-?`, `+readonly`, `-readonly`',
        p:
          'Modifierها اجازه می‌دهند ویژگی‌های فیلد را اضافه یا حذف کنی. پیشوند `+` (یا بدون پیشوند) افزودن و `-` حذف کردن است.',
        code: `type Partial2<T> = { [K in keyof T]+?: T[K] };      // افزودن اختیاری
type Required2<T> = { [K in keyof T]-?: T[K] };     // حذف اختیاری
type Readonly2<T> = { readonly [K in keyof T]: T[K] }; // افزودن readonly
type Mutable2<T> = { -readonly [K in keyof T]: T[K] }; // حذف readonly

type Loose = { readonly a?: string };
type Tight = Required2<Mutable2<Loose>>;  // { a: string }

const t: Tight = { a: 'x' };
console.log(t.a);`,
      },
      {
        h: 'گام ۳ — Key Remapping با `as` (قدرتمندترین ویژگی)',
        p:
          'با `as` می‌توانی **نام کلید** را تغییر دهی، و با `never` یک کلید را **حذف** کنی. این پایه‌ی ساخت `Getters`، `Omit` دستی و فیلتر فیلدهاست.',
        code: `type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type Renamed<T> = {
  [K in keyof T as \`_\${string & K}\`]: T[K];
};

type User = { id: string; name: string; age: number };

type Strings = OnlyStrings<User>; // { id: string; name: string }
type Private = Renamed<User>;     // { _id: string; _name: string; _age: number }

const s: Strings = { id: '1', name: 'نیما' };
const p: Private = { _id: '1', _name: 'نیما', _age: 30 };
console.log(s.name, p._age);`,
      },
      {
        h: 'گام ۴ — Homomorphic بودن و چرا مهم است',
        p:
          'وقتی الگو دقیقاً `{ [K in keyof T]: ... }` باشد، Mapped Type «هم‌ریخت» است: Modifierهای اصلی (`readonly`، `?`) را **حفظ** می‌کند و روی Union توزیع می‌شود. اگر از `keyof T` مستقیم استفاده نکنی، این ویژگی‌ها از دست می‌روند.',
        code: `// Homomorphic — modifierها حفظ می‌شوند:
type Keep<T> = { [K in keyof T]: T[K] };

// Non-homomorphic — modifierها از دست می‌روند:
type Lose<T> = { [K in keyof T as K]: T[K] extends undefined ? never : T[K] };

type Source = { readonly a: string; readonly b?: number };

type Kept = Keep<Source>;  // { readonly a: string; readonly b?: number }

const k: Kept = { a: 'x' };
console.log(k.a, k.b);`,
      },
      {
        h: 'گام ۵ — Mapped Type روی Union و Tuple',
        p:
          'اگر `T` یک Tuple باشد، Mapped Type یک Tuple هم‌اندازه می‌سازد (نه آبجکت!). این ویژگی برای نگاشت آرگومان‌های تابع حیاتی است.',
        code: `type Boxed<T> = { [K in keyof T]: { value: T[K] } };

type TupleBoxed = Boxed<[string, number]>; // [{value: string}, {value: number}]
type ArrayBoxed = Boxed<string[]>;         // { value: string }[]

const t: TupleBoxed = [{ value: 'a' }, { value: 1 }];
const a: ArrayBoxed = [{ value: 'x' }, { value: 'y' }];
console.log(t[1].value, a.length);`,
      },
    ],
    visual: 'mapped-anatomy',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۹',
        title: 'فرمول چهار بخشی Mapped Type',
        body:
          'هر Mapped Type از چهار بخش ساخته شده: **منبع کلیدها** (`keyof T` یا یک Union)، **فیلتر/تغییرنام کلید** (`as ... | never`)، **modifierها** (`readonly`/`?` با `+`/`-`)، و **تایپ مقدار** (`T[K]` یا هر عبارت). اگر این چهار را جدا ببینی، هر Mapped Type پیچیده‌ای قابل خواندن می‌شود.',
        equation: 'Mapped = [منبع کلید] + [as remap] + [modifiers] + [تایپ مقدار]',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قبل از نوشتن Mapped سفارشی، داخلی‌ها را چک کن',
        body:
          'بسیاری از Mapped Typeهای سفارشی از قبل وجود دارند: `Partial`، `Required`، `Readonly`، `Pick`، `Record`، `Omit`. اگر یکی از آن‌ها (یا ترکیب‌شان) کار را حل می‌کند، کد جدید ننویس — این DRY در سطح تایپ است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`as K` homomorphic بودن را می‌شکند',
        body:
          'اضافه‌کردن `as K` (حتی بدون تغییر واقعی) باعث می‌شود Mapped Type دیگر modifierهای اصلی را حفظ نکند و روی Union توزیع نشود. اگر این رفتار را نمی‌خواهی، `as` را حذف کن.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'Utility داخلی را بازنویسی کن',
        body:
          'بهترین تمرین: `Partial`، `Required`، `Readonly`، `Pick` و `Record` را خودت از صفر بنویس و با `^?` نتیجه را مقایسه کن. بعد `Omit` را با ترکیب `Pick` + `Exclude` بساز. یک بعدازظهر، کل این فصل را ملکه‌ی ذهنت می‌کند.',
      },
    ],
    quiz: {
      q: 'کدام بخش از یک Mapped Type باعث **حذف** یک کلید از نتیجه می‌شود؟',
      options: ['نگاشت کلید به `never` در بخش `as`', 'استفاده از `readonly`', 'گذاشتن `T[K]` به‌عنوان تایپ مقدار', 'افزودن `?` به کلید'],
      answer: 0,
      explain:
        'در Key Remapping، اگر عبارت `as` برای یک کلید `never` تولید کند، آن کلید از تایپ نتیجه کاملاً حذف می‌شود. این مکانیزم پایه‌ی فیلتر کردن فیلدهاست.',
    },
    lab: {
      task: 'یک `DeepReadonly<T>` و یک `OnlyFunctions<T>` با Key Remapping بنویس.',
      starter: `type DeepReadonly<T> = T extends (...a: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type OnlyFunctions<T> = {
  [K in keyof T as T[K] extends (...a: never[]) => unknown ? K : never]: T[K];
};

type Service = {
  readonly name: string;
  config: { retries: number };
  start(): void;
  stop(): void;
};

type FrozenService = DeepReadonly<Service>;
type ServiceApi = OnlyFunctions<Service>;

const api: ServiceApi = { start: () => undefined, stop: () => undefined };
api.start();
// ⚠️ FrozenService یک تایپ است نه مقدار ← typeof FrozenService یعنی TS2693.
console.log(Object.keys(api).length);`,
      solution: `type OnlyFunctions<T> = { [K in keyof T as T[K] extends Function ? K : never]: T[K] };`,
    },
  },

  {
    id: 'conditional-types',
    chapter: 'ch12',
    titleFa: 'Conditional Types',
    titleEn: 'Conditional Types',
    level: 'advanced',
    minutes: 50,
    goal: '`T extends U ? X : Y`، `infer`، توزیع و غیرفعال‌سازی توزیع را کامل مسلط شوی.',
    steps: [
      {
        h: 'گام ۱ — ساختار پایه و قیاس با `if`',
        p:
          'یک Conditional Type دقیقاً مثل یک `if/else` در سطح تایپ است: اگر `T` زیرمجموعه‌ی `U` باشد، نتیجه `X` وگرنه `Y`. می‌توان آن‌ها را تودرتو نوشت.',
        code: `type IsArray<T> = T extends readonly unknown[] ? true : false;
type TypeName<T> =
  T extends string ? 'string'
  : T extends number ? 'number'
  : T extends boolean ? 'boolean'
  : T extends readonly unknown[] ? 'array'
  : T extends object ? 'object'
  : 'other';

type A = IsArray<[1, 2]>;        // true
type B = TypeName<'x'>;          // 'string'
type C = TypeName<{ a: 1 }>;     // 'object'

const a: A = true;
const b: B = 'string';
const c: C = 'object';
console.log(a, b, c);`,
      },
      {
        h: 'گام ۲ — `infer`: استخراج تایپ از دل یک تایپ',
        p:
          '`infer` یک «متغیر الگو» است که در شاخه‌ی true قابل استفاده است. این پایه‌ی `ReturnType`، `Parameters`، `Awaited` و `ElementOf` است.',
        code: `type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type ReturnOf<T> = T extends (...a: never[]) => infer R ? R : never;
type PromiseOf<T> = T extends Promise<infer U> ? U : never;
type FirstArg<T> = T extends (first: infer F, ...rest: never[]) => unknown ? F : never;

type E = ElementOf<string[]>;        // string
type R = ReturnOf<() => number>;     // number
type P = PromiseOf<Promise<boolean>>; // boolean
type F = FirstArg<(name: string, age: number) => void>; // string

const vals: [E, R, P, F] = ['x', 1, true, 'name'];
console.log(vals.join(','));`,
      },
      {
        h: 'گام ۳ — توزیع (Distribution) و غیرفعال‌سازی آن',
        p:
          'اگر طرف چپ یک Generic **برهنه** باشد، Conditional روی هر عضو Union جدا اجرا می‌شود. با پیچیدن در Tuple، توزیع را خاموش می‌کنی — که گاهی لازم است.',
        code: `type ToArray<T> = T extends unknown ? T[] : never;           // توزیع‌شده
type ToArrayNoDist<T> = [T] extends [unknown] ? T[] : never; // غیرتوزیعی

type A = ToArray<string | number>;        // string[] | number[]
type B = ToArrayNoDist<string | number>;  // (string | number)[]

const a: A = ['x'];
const b: B = ['x', 1];
console.log(a.length, b.length);`,
      },
      {
        h: 'گام ۴ — الگوی پیشرفته: `infer` با Template Literal',
        p:
          'ترکیب `infer` با Template Literal اجازه می‌دهد رشته‌ها را در سطح تایپ **تجزیه** کنی — قدرتمندترین ابزار این فصل.',
        code: `type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\` ? [Head, ...Split<Tail, D>] : [S];

type Route = Split<'users/123/posts', '/'>; // ['users', '123', 'posts']

type AfterDot<S extends string> = S extends \`\${string}.\${infer Ext}\` ? Ext : never;
type Ext = AfterDot<'archive.tar.gz'>; // 'tar.gz'

const parts: Route = ['users', '123', 'posts'];
const ext: Ext = 'tar.gz';
console.log(parts.length, ext);`,
      },
      {
        h: 'گام ۵ — `never` در شاخه‌ها و حذف خودکار',
        p:
          'بازگرداندن `never` در شاخه‌ی false یک تکنیک فیلتر است (پایه‌ی `Exclude`). و اگر **همه‌ی** اعضا `never` شوند، نتیجه‌ی کل `never` است.',
        code: `type OnlyStrings<T> = T extends string ? T : never;
type Strings = OnlyStrings<'a' | 1 | 'b' | true>; // 'a' | 'b'

type NoneLeft = OnlyStrings<1 | true>; // never

const s: Strings = 'a';
console.log(s, typeof NoneLeft);`,
      },
    ],
    visual: 'conditional-tree',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۰',
        title: 'فرمول «توزیع = نگاشت روی اعضای Union»',
        body:
          'یک Conditional توزیع‌شده دقیقاً مثل `map` روی اعضای Union است: برای هر عضو جدا اجرا می‌شود و نتایج با `|` جمع می‌شوند. اگر این تصویر ذهنی را داشته باشی، می‌توانی نتیجه‌ی هر Conditional پیچیده‌ای را روی کاغذ حساب کنی.',
        equation: 'Cond<A | B, U, X, Y> = Cond<A,U,X,Y> | Cond<B,U,X,Y>',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'شرط‌های تودرتو را به aliasهای نام‌دار بشکن',
        body:
          'یک `type TypeName<T>` با ۶ شرط تودرتو غیرقابل خواندن است. به‌جایش `type IsString<T>`، `type IsNumber<T>`… بساز و در انتها ترکیب کن. هر alias یک نام مستندساز است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`boolean` توزیع می‌شود چون `true | false` است',
        body:
          '`Cond<boolean, ...>` روی `true` و `false` جدا اجرا می‌شود و نتایج Union می‌شوند. اگر این را نمی‌خواهی، `[T] extends [boolean]` بنویس. همین تله برای `never` هم وجود دارد (توزیع روی مجموعه‌ی تهی، `never` می‌دهد).',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'با `^?` گام‌به‌گام جلو برو',
        body:
          'برای فهم یک Conditional پیچیده، لایه‌ها را یکی‌یکی با aliasهای میانی باز کن و هر کدام را با `^?` (ستون Type X-Ray همین استودیو) بررسی کن. حدس زدن نتیجه‌ی نهایی بدون دیدن لایه‌ها، تقریباً همیشه اشتباه است.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور توزیع را غیرفعال می‌کنی و چرا لازم است؟',
        body:
          'پاسخ: «با پیچیدن هر دو طرف در Tuple: `[T] extends [U] ? X : Y`. لازم است وقتی می‌خواهی کل Union را یک واحد در نظر بگیرم — مثلاً بررسی اینکه آیا `T` دقیقاً `boolean` است یا آیا یک آرایه است، بدون اینکه روی اعضا پخش شود.»',
      },
    ],
    quiz: {
      q: 'نتیجه‌ی `T extends unknown ? T[] : never` برای `T = string | number` چیست؟',
      options: [
        '`string[] | number[]`',
        '`(string | number)[]`',
        '`never[]`',
        '`unknown[]`',
      ],
      answer: 0,
      explain:
        'چون `T` یک Generic برهنه است، Conditional توزیع می‌شود: برای `string` نتیجه `string[]` و برای `number` نتیجه `number[]`، و این دو با Union جمع می‌شوند.',
    },
    lab: {
      task: 'سه تایپ کمکی بنویس: `ElementOf<T>`، `IsNever<T>` و `Flatten<T>` (باز کردن یک سطح آرایه).',
      starter: `type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type IsNever<T> = [T] extends [never] ? true : false;
type Flatten<T> = T extends readonly (infer E)[] ? (E extends readonly unknown[] ? E : T) : T;

type A = ElementOf<string[][]>;      // string[]
type B = IsNever<never>;             // true
type C = IsNever<string>;            // false
type D = Flatten<string[][]>;        // string[]

const a: A = ['x'];
const b: B = true;
const c: C = false;
const d: D = ['y'];
console.log(a.length, b, c, d.length);`,
      solution: `type IsNever<T> = [T] extends [never] ? true : false; // بدون Tuple توزیع می‌شود و همیشه false می‌دهد`,
    },
  },

  {
    id: 'literal-types',
    chapter: 'ch12',
    titleFa: 'Literal Types',
    titleEn: 'Literal Types',
    level: 'intermediate',
    minutes: 30,
    goal: 'تایپ‌های لیترال (رشته، عدد، بولین) را بسازی، Widening را کنترل کنی و از لیترال‌ها برای مدل‌سازی دامنه استفاده کنی.',
    steps: [
      {
        h: 'گام ۱ — لیترال = تایپ با یک عضو',
        p:
          '`"admin"` تایپی است که فقط یک مقدار مجاز دارد. این «کوچک‌ترین تایپ ممکن» پایه‌ی مدل‌سازی دقیق دامنه است. سه دسته: رشته‌ای، عددی و بولینی.',
        code: `const a: 'admin' = 'admin';
const b: 200 = 200;
const c: true = true;
const d: null = null;
const e: undefined = undefined;

// Union لیترال‌ها = تایپ محدود:
type HttpStatus = 200 | 201 | 400 | 404 | 500;
const status: HttpStatus = 404;

console.log(a, b, c, d, e, status);`,
      },
      {
        h: 'گام ۲ — Widening: چرا `let x = "a"` تایپ `string` می‌گیرد',
        p:
          'TypeScript برای مقادیر قابل تغییر، تایپ لیترال را به تایپ پایه «گسترش» می‌دهد. سه راه جلوگیری: `const`، annotation صریح لیترال، و `as const`.',
        code: `let widened = 'admin';             // string
const kept = 'admin';              // 'admin'
let annotated: 'admin' = 'admin';  // 'admin'
const frozen = { role: 'admin' } as const; // { readonly role: 'admin' }

function needsAdmin(role: 'admin'): string { return \`ok \${role}\`; }

console.log(needsAdmin(kept), needsAdmin(frozen.role));
console.log(typeof widened);`,
      },
      {
        h: 'گام ۳ — لیترال‌های عددی و Template Numeric',
        p:
          'لیترال‌های عددی برای کدهای وضعیت، سطوح، اندازه‌های ثابت و Gridها عالی‌اند. با Template Literal می‌توان لیترال‌های رشته‌ای مشتق از عدد ساخت.',
        code: `type GridSize = 4 | 8 | 12 | 16 | 24 | 32;
type SpacingClass = \`p-\${GridSize}\`; // 'p-4' | 'p-8' | ... | 'p-32'

const size: GridSize = 16;
const cls: SpacingClass = 'p-16';

console.log(size, cls);`,
      },
      {
        h: 'گام ۴ — لیترال در برابر enum (چرا لیترال برنده است)',
        p:
          'لیترال‌ها erasable، بدون کد زمان اجرا، قابل ترکیب با Template Literal و کاملاً Exhaustive هستند. به همین دلیل در TypeScript مدرن، تقریباً همیشه بر `enum` ترجیح داده می‌شوند.',
        code: `const STATUS = { Idle: 'idle', Done: 'done' } as const;
type Status = (typeof STATUS)[keyof typeof Status];

type IconMap = Record<Status, string>;
const icons: IconMap = { idle: '⚪', done: '✅' };

const current: Status = STATUS.Done;
console.log(icons[current], Object.keys(STATUS).length);`,
      },
      {
        h: 'گام ۵ — `NoInfer<T>` و کنترل استنتاج لیترال (TS 5.4+)',
        p:
          'گاهی می‌خواهی یک آرگومان در استنتاج Generic **نقش نداشته باشد** تا لیترال‌ها بیش از حد تنگ نشوند. `NoInfer<T>` دقیقاً همین کار را می‌کند.',
        code: `function pickFirst<T>(list: readonly T[], fallback: NoInfer<T>): T {
  return list[0] ?? fallback;
}

// T از list استنتاج می‌شود (string)، نه از fallback:
const first = pickFirst(['a', 'b'], 'default');
console.log(first.toUpperCase());`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۱',
        title: 'فرمول «لیترال به‌جای Primitive آزاد»',
        body:
          'هر پارامتری که مجموعه‌ی مقادیر مجازش محدود است باید لیترال Union بگیرد نه `string` یا `number`. این یک تصمیم، سه سود می‌دهد: شکار غلط املایی، IntelliSense کامل، و exhaustiveness در `switch`/`Record`.',
        equation: 'کیفیت API = (مقادیر مجاز صریحاً مدل‌شده) ÷ (کل مقادیر ممکن تایپ پایه)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'لیست مقادیر را `as const` نگه دار و تایپ را مشتق کن',
        body:
          'هرگز لیست مقادیر و Union را جدا ننویس. `export const X = [...] as const; export type X = (typeof X)[number]` تنها الگوی درست است: یک منبع حقیقت برای زمان اجرا و زمان کامپایل.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'Widening ناخواسته در خروجی تابع',
        body:
          '`function f() { return "admin"; }` تایپ بازگشتی `string` می‌دهد نه `"admin"`. اگر به لیترال نیاز داری، تایپ بازگشتی را صریح بنویس یا `as const` بگذار.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Type Widening چیست و چطور کنترلش می‌کنی؟',
        body:
          'پاسخ: «فرایندی که در آن یک تایپ لیترال دقیق به تایپ پایه‌ی گسترده‌تر تبدیل می‌شود (معمولاً برای `let` و خروجی توابع). سه راه کنترل: `const`، annotation صریح، و `as const` برای ساختارهای تودرتو.»',
      },
    ],
    quiz: {
      q: 'تایپ `let role = "admin"` چیست؟',
      options: ['`string`', '`"admin"`', '`any`', '`"admin" | string`'],
      answer: 0,
      explain:
        'چون `role` با `let` تعریف شده و قابل تغییر است، TypeScript تایپ را به `string` گسترش می‌دهد. با `const role = "admin"` تایپ `"admin"` می‌ماند.',
    },
    lab: {
      task: 'یک تایپ `ThemeName` از لیترال‌ها و یک `ThemeTokens` با Record بساز که exhaustiveness داشته باشد.',
      starter: `const THEMES = ['dark', 'light', 'high-contrast'] as const;
type ThemeName = (typeof THEMES)[number];

type ThemeTokens = Record<ThemeName, { readonly bg: string; readonly fg: string }>;

const tokens: ThemeTokens = {
  dark: { bg: '#090e1c', fg: '#e8eefb' },
  light: { bg: '#f3f6fc', fg: '#0f172a' },
  'high-contrast': { bg: '#000000', fg: '#ffffff' },
};

function bgOf(theme: ThemeName): string { return tokens[theme].bg; }
console.log(bgOf('dark'), THEMES.length);`,
      solution: `type ThemeName = (typeof THEMES)[number];
type ThemeTokens = Record<ThemeName, { bg: string; fg: string }>;`,
    },
  },

  {
    id: 'template-literal-types',
    chapter: 'ch12',
    titleFa: 'Template Literal Types',
    titleEn: 'Template Literal Types',
    level: 'advanced',
    minutes: 45,
    goal: 'رشته‌ها را در سطح تایپ بسازی، تجزیه کنی و تغییر دهی — از نام رویدادها تا مسیریابی نوع‌دار.',
    steps: [
      {
        h: 'گام ۱ — ساختار پایه و ضرب کارتزینی',
        p:
          'یک Template Literal Type با جای‌گذاری Unionها ساخته می‌شود و نتیجه **ضرب کارتزینی** اعضاست: ۲ × ۳ = ۶ عضو.',
        code: `type Color = 'red' | 'blue';
type Size = 'sm' | 'md' | 'lg';

type Class = \`\${Color}-\${Size}\`; // 6 عضو
// 'red-sm' | 'red-md' | 'red-lg' | 'blue-sm' | 'blue-md' | 'blue-lg'

const cls: Class = 'blue-md';
console.log(cls);

type EventName = \`on\${Capitalize<Color>}\`; // 'onRed' | 'onBlue'
const e: EventName = 'onRed';
console.log(e);`,
      },
      {
        h: 'گام ۲ — چهار Helper داخلی رشته‌ای',
        p:
          '`Uppercase<S>`، `Lowercase<S>`، `Capitalize<S>` و `Uncapitalize<S>` روی Union توزیع می‌شوند و هر عضو را جدا تغییر می‌دهند.',
        code: `type Names = 'click' | 'focus';

type Upper = Uppercase<Names>;       // 'CLICK' | 'FOCUS'
type Cap = Capitalize<Names>;        // 'Click' | 'Focus'
type Uncap = Uncapitalize<'Click'>;  // 'click'

type Handlers = \`on\${Cap}\`;         // 'onClick' | 'onFocus'

const h: Handlers = 'onFocus';
console.log(h, typeof Upper);`,
      },
      {
        h: 'گام ۳ — تجزیه‌ی رشته با `infer` (قدرتمندترین الگو)',
        p:
          'با `\`\${infer A}\${sep}\${infer B}\`` می‌توانی رشته را در سطح تایپ بشکنی. این پایه‌ی مسیریابی نوع‌دار، تجزیه‌ی CSS و i18n است.',
        code: `type Split<S extends string, D extends string> =
  S extends \`\${infer H}\${D}\${infer T}\` ? [H, ...Split<T, D>] : [S];

type Parts = Split<'fa-IR-Tehran', '-'>; // ['fa', 'IR', 'Tehran']

type AfterSep<S extends string, D extends string> =
  S extends \`\${string}\${D}\${infer Rest}\` ? Rest : never;

type Tail = AfterSep<'user:123:admin', ':'>; // '123:admin'

const p: Parts = ['fa', 'IR', 'Tehran'];
const t: Tail = '123:admin';
console.log(p.length, t);`,
      },
      {
        h: 'گام ۴ — کاربرد واقعی ۱: مسیریابی نوع‌دار',
        p:
          'می‌توانی مسیرهای مجاز و پارامترهای هر مسیر را در سطح تایپ مدل کنی — یک الگوی واقعی در فریمورک‌هایی مثل Next.js و tRPC.',
        code: `type Routes = {
  '/users': { userId: string };
  '/posts': { postId: string; slug: string };
  '/home': Record<string, never>;
};

type RoutePath = keyof Routes;

function navigate<P extends RoutePath>(path: P, params: Routes[P]): string {
  const query = Object.entries(params as Record<string, string>)
    .map(([k, v]) => \`\${k}=\${v}\`)
    .join('&');
  return query ? \`\${path}?\${query}\` : path;
}

console.log(navigate('/users', { userId: 'u1' }));
console.log(navigate('/posts', { postId: 'p1', slug: 'ts' }));
console.log(navigate('/home', {}));`,
      },
      {
        h: 'گام ۵ — کاربرد واقعی ۲: Key Remapping خودکار',
        p:
          'ترکیب Mapped + Template Literal، نام‌ها را به‌صورت خودکار تغییر می‌دهد: ساخت getter، setter، رویداد و نسخه‌ی `on*`.',
        code: `type User = { id: string; email: string };

type Setters<T> = { [K in keyof T as \`set\${Capitalize<string & K>}\`]: (v: T[K]) => void };
type ChangedEvents<T> = { [K in keyof T as \`\${string & K}:changed\`]: T[K] };

const setters: Setters<User> = {
  setId: (v) => console.log('id →', v),
  setEmail: (v) => console.log('email →', v),
};

type Events = ChangedEvents<User>; // { 'id:changed': string; 'email:changed': string }

setters.setId('u1');
console.log(typeof Events);`,
      },
    ],
    visual: 'template-literal',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۲',
        title: 'فرمول «رشته‌های ساختاریافته باید تایپ داشته باشند»',
        body:
          'هر رشته‌ای که **ساختار** دارد (مسیر، کلید i18n، نام کلاس CSS، شناسه‌ی مرکب مثل `"user:123"`) باید یک Template Literal Type بگیرد. رشته‌ی آزاد = باگ‌های املایی نامرئی؛ رشته‌ی تایپ‌دار = صحت در زمان کامپایل.',
        equation: 'باگ‌های رشته‌ای ∝ (تعداد رشته‌های ساختاریافته‌ی بدون تایپ) → هدف: صفر',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی جدی',
        title: 'انفجاب ترکیبی (Combinatorial Explosion)',
        body:
          '`\`\${A}\${B}\${C}\`` با سه Union ده‌عضوی، ۱۰۰۰ عضو می‌سازد و کامپایلر را کند یا قفل می‌کند. اگر یکی از Unionها باز (مثل `string`) باشد، نتیجه به `string` سقوط می‌کند. همیشه اندازه‌ی ضرب کارتزینی را تخمین بزن.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'helperهای رشته‌ای را یک‌بار بنویس و export کن',
        body:
          '`Split`، `Join`، `StartsWith`، `CamelCase` را یک‌بار در `types/string-utils.ts` بنویس و در کل پروژه استفاده کن. بازنویسی آن‌ها در هر فایل، هم تکرار است هم منبع ناسازگاری.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور تایپ «نام getterهای یک آبجکت» را می‌سازی؟',
        body:
          'پاسخ: «با Mapped Type و Key Remapping: `type Getters<T> = { [K in keyof T as \\`get${Capitalize<string & K>}\\`]: () => T[K] }`. ترکیب Mapped + Template Literal + Capitalize این کار را به‌صورت خودکار انجام می‌دهد.»',
      },
    ],
    quiz: {
      q: 'نتیجه‌ی `` `${"a" | "b"}-${1 | 2}` `` چیست؟',
      options: [
        '`"a-1" | "a-2" | "b-1" | "b-2"`',
        '`string`',
        '`"a-b-1-2"`',
        '`("a" | "b") & (1 | 2)`',
      ],
      answer: 0,
      explain:
        'Template Literal Types ضرب کارتزینی اعضای Unionها را تولید می‌کنند: ۲ × ۲ = ۴ رشته‌ی لیترال دقیق.',
    },
    lab: {
      task: 'یک تایپ `EventMap<T>` بساز که برای هر فیلد `T` سه رویداد `changed`، `reset` و `validate` تولید کند.',
      starter: `type FieldEvent<K extends string> = \`\${K}:changed\` | \`\${K}:reset\` | \`\${K}:validate\`;

type EventMap<T> = {
  [K in keyof T & string as FieldEvent<K>]: { field: K; value: T[K] };
};

type User = { name: string; age: number };
type UserEvents = EventMap<User>;

const evt: UserEvents['name:changed'] = { field: 'name', value: 'نیما' };
console.log(evt.field, evt.value);`,
      solution: `type EventMap<T> = { [K in keyof T & string as \`\${K}:changed\` | \`\${K}:reset\`]: { field: K; value: T[K] } };`,
    },
  },

  {
    id: 'recursive-types',
    chapter: 'ch12',
    titleFa: 'Recursive Types',
    titleEn: 'Recursive Types',
    level: 'advanced',
    minutes: 40,
    goal: 'تایپ‌های بازگشتی برای ساختارهای درختی، JSON و Utilityهای عمیق بسازی و از خطای «بازگشت بیش از حد» پرهیز کنی.',
    steps: [
      {
        h: 'گام ۱ — سه شکل بازگشت در تایپ‌ها',
        p:
          '۱) بازگشت در **ساختار داده** (درخت، لیست پیوندی). ۲) بازگشت در **Utility Type** (DeepReadonly، DeepPartial). ۳) بازگشت در **Conditional** (Awaited، Split). همه‌ی این‌ها با ارجاع تایپ به خودش ساخته می‌شوند.',
        code: `// ۱) ساختار درختی:
type TreeNode<T> = { readonly value: T; readonly children?: readonly TreeNode<T>[] };

// ۲) لیست پیوندی:
type LinkedList<T> = { readonly head: T; readonly tail?: LinkedList<T> };

// ۳) JSON:
type Json = string | number | boolean | null | readonly Json[] | { readonly [k: string]: Json };

const tree: TreeNode<string> = { value: 'root', children: [{ value: 'a' }, { value: 'b' }] };
const json: Json = { list: [1, 'two', { deep: true }] };
console.log(tree.children?.length, typeof json);`,
      },
      {
        h: 'گام ۲ — DeepReadonly و DeepPartial بازگشتی',
        p:
          'الگوی استاندارد: شرط‌های محافظ برای توابع، آرایه‌ها و انواع اولیه، سپس بازگشت روی اعضای آبجکت.',
        code: `type DeepReadonly<T> =
  T extends (...args: never[]) => unknown ? T
  : T extends readonly (infer E)[] ? ReadonlyArray<DeepReadonly<E>>
  : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type State = { user: { tags: string[]; profile: { age: number } } };
type Frozen = DeepReadonly<State>;

const frozen: Frozen = { user: { tags: ['a'], profile: { age: 30 } } };
// ❌ frozen.user.tags.push('b')
console.log(frozen.user.tags.length, frozen.user.profile.age);`,
      },
      {
        h: 'گام ۳ — بازگشت در سطح مقدار: توابع بازگشتی تایپ‌دار',
        p:
          'توابع بازگشتی روی ساختارهای بازگشتی نیاز به تایپ دقیق دارند تا TypeScript بتواند باریک‌سازی کند.',
        code: `type Tree<T> = { readonly value: T; readonly children?: readonly Tree<T>[] };

function flatten<T>(node: Tree<T>): T[] {
  const result: T[] = [node.value];
  for (const child of node.children ?? []) {
    result.push(...flatten(child));
  }
  return result;
}

function depth<T>(node: Tree<T>): number {
  const childDepths = (node.children ?? []).map(depth);
  return 1 + (childDepths.length > 0 ? Math.max(...childDepths) : 0);
}

const tree: Tree<string> = {
  value: 'TypeScript',
  children: [
    { value: 'Basics', children: [{ value: 'Types' }, { value: 'Functions' }] },
    { value: 'Advanced', children: [{ value: 'Generics' }] },
  ],
};

console.log(flatten(tree).join(' → '));
console.log('depth:', depth(tree));`,
      },
      {
        h: 'گام ۴ — محدودیت‌ها و خطای «Type instantiation is excessively deep»',
        p:
          'TypeScript یک سقف عمق (~۵۰ سطح) برای بازگشت تایپ دارد. اگر بازگشت خیلی عمیق یا بی‌نهایت شود، خطای TS2589 می‌گیری. راه‌حل: شرط پایه‌ی دقیق‌تر، محدودکردن عمق با Tuple، یا ساده‌سازی تایپ.',
        code: `// بازگشت با عمق محدود (Tuple به‌عنوان شمارنده):
type Repeat<S extends string, N extends number, Acc extends unknown[] = []> =
  Acc['length'] extends N ? '' : \`\${S}\${Repeat<S, N, [...Acc, unknown]>}\`;

type Three = Repeat<'ab', 3>; // 'ababab'

const three: Three = 'ababab';
console.log(three);`,
      },
      {
        h: 'گام ۵ — الگوی «ساختار + پیمایش» برای دامنه‌ی واقعی',
        p:
          'برای منوی سایت، سرفصل درس‌ها، کامنت‌های تودرتو و فایل‌سیستم، همیشه دو چیز لازم داری: یک تایپ بازگشتی و یک تابع پیمایش بازگشتی با تایپ دقیق.',
        code: `type MenuItem = { readonly label: string; readonly href?: string; readonly children?: readonly MenuItem[] };

function toFlatList(items: readonly MenuItem[], level = 0): string[] {
  return items.flatMap((item) => [
    \`\${'  '.repeat(level)}- \${item.label}\`,
    ...toFlatList(item.children ?? [], level + 1),
  ]);
}

const menu: readonly MenuItem[] = [
  { label: 'آموزش', children: [{ label: 'TypeScript', href: '/ts' }, { label: 'React' }] },
  { label: 'درباره ما', href: '/about' },
];

console.log(toFlatList(menu).join('\\n'));`,
      },
    ],
    visual: 'recursive-tree',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۷۳',
        title: 'فرمول «شرط پایه اول»',
        body:
          'در هر تایپ بازگشتی، **اول** حالت‌های پایه (تابع، آرایه، اولیه) را بررسی کن و بعد بازگشت. اگر ترتیب برعکس باشد، تایپ روی توابع و آرایه‌ها هم بازگشت می‌کند و یا بی‌نهایت می‌شود یا نتیجه‌ی غلط می‌دهد.',
        equation: 'بازگشت سالم = (شرط پایه‌ی صریح) ∧ (کاهش اندازه در هر گام) — دقیقاً مثل توابع بازگشتی',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'عمق بازگشت را محدود و مستند کن',
        body:
          'اگر یک Utility عمیق مثل `DeepPartial` داری، در کامنت بنویس تا چه عمقی تست شده. برای ساختارهای با عمق نامحدود (مثل Json) یک نسخه‌ی کم‌عمق هم ارائه بده تا مصرف‌کننده انتخاب کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'TS2589: «Type instantiation is excessively deep»',
        body:
          'این خطا یعنی بازگشت تایپ از سقف عمق کامپایلر گذشته. سه راه‌حل: ۱) شرط پایه را دقیق‌تر کن ۲) یک لایه از تودرتویی کم کن ۳) از Tuple به‌عنوان شمارنده‌ی عمق استفاده کن.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور یک ساختار درختی نامحدود را تایپ می‌کنی؟',
        body:
          'پاسخ: «با یک تایپ بازگشتی: `type Tree<T> = { value: T; children?: Tree<T>[] }`. برای جلوگیری از تغییر ناخواسته، `readonly` می‌گذارم و برای پیمایش، یک تابع بازگشتی با تایپ دقیق می‌نویسم. اگر عمق ثابت است، Tuple تودرتو دقیق‌تر است.»',
      },
    ],
    quiz: {
      q: 'در یک تایپ بازگشتی مثل `DeepReadonly<T>`، چرا شرط‌های مربوط به تابع و آرایه باید **اول** بیایند؟',
      options: [
        'چون توابع و آرایه‌ها هم `object` هستند و اگر بازگشت روی آن‌ها اعمال شود، نتیجه غلط یا بی‌نهایت می‌شود',
        'چون TypeScript به ترتیب شرط‌ها اهمیت نمی‌دهد',
        'چون آرایه‌ها نمی‌توانند readonly باشند',
        'چون توابع نمی‌توانند در Mapped Type ظاهر شوند',
      ],
      answer: 0,
      explain:
        'در TypeScript هر تابع و هر آرایه یک `object` است. اگر شرط `T extends object` اول بیاید، تایپ تابع به یک آبجکت با کلیدهای عجیب تبدیل می‌شود و آرایه به یک آبجکت ایندکسی — نه آرایه.',
    },
    lab: {
      task: 'یک تایپ بازگشتی `NestedConfig` و تابع `flattenConfig` بنویس که کلیدهای نقطه‌ای تولید کند.',
      starter: `type NestedConfig = { readonly [key: string]: string | number | NestedConfig };

function flattenConfig(config: NestedConfig, prefix = ''): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(config)) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenConfig(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

const config: NestedConfig = {
  server: { host: 'localhost', tls: { enabled: true as unknown as number } },
  port: 3000,
};

console.log(flattenConfig(config));`,
      solution: `type NestedConfig = { readonly [key: string]: string | number | NestedConfig };
function flattenConfig(c: NestedConfig, p = ''): Record<string, string | number> { /* ... */ }`,
    },
  },
];
