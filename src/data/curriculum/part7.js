/* ==========================================================================
   فصل ۱۱ — Utility Types (بخش ۱)
   (Utility Types · Partial · Pick · Omit · Readonly · Record · Exclude)
   ========================================================================== */

export const PART7_LESSONS = [
  {
    id: 'utility-types',
    chapter: 'ch11',
    titleFa: 'Utility Types — نگرش کلی',
    titleEn: 'Utility Types',
    level: 'intermediate',
    minutes: 30,
    goal: 'نقشه‌ی کامل ۱۷ Utility Type داخلی را داشته باشی و بفهمی همه از سه سازوکار ساده ساخته شده‌اند.',
    steps: [
      {
        h: 'گام ۱ — Utility Type چیست؟',
        p:
          'توابعی در **سطح تایپ**: یک تایپ می‌گیرند و تایپ جدید تولید می‌کنند. همه از سه ابزار ساخته شده‌اند: Mapped Types (`[K in keyof T]`)، Conditional Types (`T extends U ? X : Y`) و `infer`. پس اگر آن سه را بفهمی، همه را می‌فهمی.',
        code: `type User = { id: string; name: string; email: string; password: string };

// سه ابزار، هفت تایپ جدید:
type Draft = Partial<User>;                  // همه اختیاری
type PublicUser = Omit<User, 'password'>;    // حذف یک فیلد
type Preview = Pick<User, 'id' | 'name'>;    // انتخاب چند فیلد
type Frozen = Readonly<User>;                // تغییرناپذیر
type ById = Record<string, User>;            // نگاشت
type Keys = keyof User;                      // 'id' | 'name' | 'email' | 'password'
type Safe = NonNullable<string | null>;      // string

console.log(typeof Keys, typeof Safe);`,
      },
      {
        h: 'گام ۲ — دسته‌بندی ۱۷ تایپ داخلی',
        p:
          '۱) **تغییر ضرورت/تغییرپذیری**: `Partial`، `Required`، `Readonly`. ۲) **انتخاب/حذف فیلد**: `Pick`، `Omit`، `Record`، `Exclude`، `Extract`. ۳) **تهی‌زدایی**: `NonNullable`، `NoInfer`. ۴) **استخراج از تابع**: `Parameters`، `ConstructorParameters`، `ReturnType`، `InstanceType`، `ThisParameterType`، `OmitThisParameter`. ۵) **Promise**: `Awaited`. ۶) **رشته‌ای**: `Uppercase`، `Lowercase`، `Capitalize`، `Uncapitalize`.',
      },
      {
        h: 'گام ۳ — چرا Utility Types مهم‌اند؟ (DRY در سطح تایپ)',
        p:
          'بدون آن‌ها مجبوری برای هر سناریو یک تایپ کامل بنویسی: `UserDto`، `UserForm`، `UserPatch`… و هر بار که `User` عوض شود، ده تایپ باید دستی به‌روز شوند. با Utility Types، همه از **یک منبع** مشتق می‌شوند.',
        code: `type User = { id: string; name: string; email: string; createdAt: Date };

// همه از یک منبع مشتق شدند — تغییر User همه را به‌روز می‌کند:
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
type UpdateUserInput = Partial<CreateUserInput>;
type UserPreview = Pick<User, 'id' | 'name'>;
type UserResponse = Readonly<User>;

const input: CreateUserInput = { name: 'نیما', email: 'n@x.com' };
const patch: UpdateUserInput = { name: 'نیما زاد' };
console.log(input.email, patch.name);`,
      },
      {
        h: 'گام ۴ — Utility Type سفارشی خودت را بساز',
        p:
          'اگر یک الگو را سه بار تکرار کردی، یک Utility Type محلی بساز. این همان قانون سه‌بار (Rule of Three) در سطح تایپ است.',
        code: `// Utility سفارشی: همه‌ی فیلدها اختیاری و فقط‌خواندنی
type Draft<T> = { readonly [K in keyof T]?: T[K] };

// Utility سفارشی: حذف فیلدهای تابعی
type DataOnly<T> = { [K in keyof T as T[K] extends (...a: never[]) => unknown ? never : K]: T[K] };

type Widget = { id: string; render(): string };

const draft: Draft<Widget> = { id: 'w1' };
type WidgetData = DataOnly<Widget>; // { id: string }
const data: WidgetData = { id: 'w1' };

console.log(draft.id, data.id);`,
      },
    ],
    visual: 'utility-map',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۵',
        title: 'فرمول «یک تایپ منبع، n تایپ مشتق»',
        body:
          'تعداد تایپ‌های دستی که باید هنگام تغییر مدل داده به‌روز شوند، شاخص مستقیم سلامت تایپی کدبیس است. هدف: با تغییر یک فیلد در تایپ منبع، **صفر** تایپ دیگر نیاز به ویرایش دستی داشته باشد.',
        equation: 'هزینه‌ی تغییر مدل داده = (تعداد تایپ‌های مشتق‌شده) × ۰ + (تعداد تایپ‌های دستی تکراری) × ۱',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'نام تایپ‌های مشتق را بر اساس **نقش** بگذار',
        body:
          '`Partial<User>` را مستقیم در امضاها ننویس؛ یک alias با نام نقش بساز: `type UserPatchInput = Partial<Pick<User, "name" | "email">>`. این کار هم خوانایی می‌دهد و هم یک نقطه‌ی تغییر متمرکز.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'تعریف هر Utility را در `lib.es5.d.ts` بخوان',
        body:
          'هر ۱۷ تایپ داخلی، هرکدام کمتر از ۵ خط تعریف دارند. یک ساعت وقت بگذار و همه را در `node_modules/typescript/lib/lib.es5.d.ts` بخوان. بعد از آن، هیچ Utility Type ای برایت جادو نخواهد بود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`Partial` عمیق نیست',
        body:
          '`Partial<User>` فقط فیلدهای سطح اول را اختیاری می‌کند. `user.address.city` هنوز اجباری است. برای تو رفتن، `DeepPartial<T>` سفارشی لازم داری.',
      },
    ],
    quiz: {
      q: 'سه سازوکار پایه‌ای که همه‌ی Utility Types از آن‌ها ساخته شده‌اند کدام‌اند؟',
      options: [
        'Mapped Types، Conditional Types و `infer`',
        'Union، Intersection و `keyof`',
        'Generics، Decorators و Namespaces',
        '`as const`، `satisfies` و `typeof`',
      ],
      answer: 0,
      explain:
        'هر Utility داخلی ترکیبی از `[K in keyof T]` (Mapped)، `T extends U ? X : Y` (Conditional) و `infer` (استخراج تایپ) است. بقیه‌ی گزینه‌ها ابزارهای مکمل‌اند نه پایه‌ی ساخت.',
    },
    lab: {
      task: 'برای یک مدل `Product` چهار تایپ مشتق بساز: ورودی ساخت، ورودی به‌روزرسانی، پیش‌نمایش و پاسخ API.',
      starter: `type Product = {
  id: string;
  title: string;
  price: number;
  createdAt: Date;
};

type CreateProductInput = Omit<Product, 'id' | 'createdAt'>;
type UpdateProductInput = Partial<CreateProductInput>;
type ProductPreview = Pick<Product, 'id' | 'title' | 'price'>;
type ProductResponse = Readonly<Product>;

const create: CreateProductInput = { title: 'کیبورد', price: 1200 };
const update: UpdateProductInput = { price: 990 };
console.log(create.title, update.price);`,
      solution: `type CreateProductInput = Omit<Product, 'id' | 'createdAt'>;
type UpdateProductInput = Partial<CreateProductInput>;`,
    },
  },

  {
    id: 'util-partial',
    chapter: 'ch11',
    titleFa: 'Partial<T>',
    titleEn: 'Partial',
    level: 'intermediate',
    minutes: 25,
    goal: 'پیاده‌سازی داخلی `Partial` را بفهمی، کاربردهای درستش را بشناسی و از `DeepPartial` و `Required` آگاه شوی.',
    steps: [
      {
        h: 'گام ۱ — تعریف واقعی (فقط یک خط)',
        p:
          '`Partial<T>` یک Mapped Type است که به هر فیلد modifier اختیاری (`?`) اضافه می‌کند. Modifier `+?` صریحاً می‌گوید «اختیاری کن».',
        code: `// تعریف در lib.es5.d.ts:
type MyPartial<T> = { [P in keyof T]?: T[P] };

type Config = { host: string; port: number; secure: boolean };
type PartialConfig = MyPartial<Config>;
// → { host?: string; port?: number; secure?: boolean }

const cfg: PartialConfig = { port: 3000 };
console.log(cfg.port, cfg.host);`,
      },
      {
        h: 'گام ۲ — سه کاربرد اصلی',
        p:
          '۱) ورودی PATCH (به‌روزرسانی جزئی). ۲) Options Object با پیش‌فرض‌ها. ۳) ساخت تدریجی آبجکت در چند مرحله.',
        code: `type Settings = { theme: 'dark' | 'light'; fontSize: number; autosave: boolean };

const DEFAULTS: Settings = { theme: 'dark', fontSize: 14, autosave: true };

// کاربرد ۲ — Options با پیش‌فرض:
function createSettings(overrides: Partial<Settings> = {}): Settings {
  return { ...DEFAULTS, ...overrides };
}

const mine = createSettings({ fontSize: 18 });
console.log(mine);`,
      },
      {
        h: 'گام ۳ — `DeepPartial` برای ساختارهای تودرتو',
        p:
          '`Partial` فقط سطح اول است. برای کانفیگ‌های تودرتو یک نسخه‌ی بازگشتی لازم داری — با مراقبت از آرایه و توابع.',
        code: `type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

type Nested = { server: { host: string; tls: { enabled: boolean; cert: string } } };
type NestedDraft = DeepPartial<Nested>;

const draft: NestedDraft = { server: { tls: { enabled: true } } };
console.log(draft.server?.tls?.enabled);`,
      },
      {
        h: 'گام ۴ — معکوس‌ها و هم‌خانواده‌ها',
        p:
          '`Required<T>` با `-?` همه‌ی `?`ها را حذف می‌کند. `Partial<Required<T>>` یک ترفند رایج برای یکدست‌کردن modifierهاست.',
        code: `type Loose = { a?: string; b?: number };
type Strict = Required<Loose>; // { a: string; b: number }

const strict: Strict = { a: 'x', b: 1 };
console.log(strict.a, strict.b);`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`Partial` عمق ندارد و توهم امنیت می‌سازد',
        body:
          'با `Partial<NestedConfig>` فکر می‌کنی همه‌چیز اختیاری شده، ولی `config.server.tls.cert` هنوز اجباری است. همیشه برای ساختارهای تودرتو `DeepPartial` سفارشی بنویس.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پیش‌فرض‌ها را یک‌جا و `Partial` را در امضا بگذار',
        body:
          'الگوی تمیز: یک `const DEFAULTS: Settings` و تابع `create(overrides: Partial<Settings>)` که با spread ادغام می‌کند. این کار منطق پیش‌فرض را از ده‌ها نقطه‌ی فراخوانی حذف می‌کند.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۶',
        title: 'فرمول Modifierها در Mapped Types',
        body:
          '`+?`/`-?` برای اختیاری بودن و `+readonly`/`-readonly` برای تغییرناپذیری. چهار modifier، پایه‌ی ساخت `Partial`، `Required`، `Readonly` و `Mutable` هستند. اگر این چهار را حفظ باشی، می‌توانی هر Utility سفارشی بسازی.',
      },
    ],
    quiz: {
      q: 'تعریف درست `Required<T>` چیست؟',
      options: ['`{ [P in keyof T]-?: T[P] }`', '`{ [P in keyof T]?: T[P] }`', '`{ [P in keyof T]: T[P] }`', '`T & { required: true }`'],
      answer: 0,
      explain:
        'Modifier `-?` اختیاری بودن را **حذف** می‌کند. `Partial` از `+?` (یا `?` ساده) استفاده می‌کند و `Required` دقیقاً عکس آن است.',
    },
    lab: {
      task: 'یک `DeepPartial` بنویس و یک کانفیگ تودرتو را فقط با دو فیلد پر کن.',
      starter: `type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

type AppConfig = {
  server: { host: string; port: number; tls: { enabled: boolean } };
  logging: { level: 'info' | 'debug'; file: string };
};

const partial: DeepPartial<AppConfig> = {
  server: { tls: { enabled: true } },
};

console.log(partial.server?.tls?.enabled, partial.logging);`,
      solution: `type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;`,
    },
  },

  {
    id: 'util-pick',
    chapter: 'ch11',
    titleFa: 'Pick<T, K>',
    titleEn: 'Pick',
    level: 'intermediate',
    minutes: 25,
    goal: 'با `Pick` زیرمجموعه‌ی فیلدها را استخراج کنی و الگوی «کمترین داده‌ی لازم» را در طراحی API پیاده کنی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و کارکرد',
        p:
          '`Pick<T, K extends keyof T>` یک تایپ جدید فقط با کلیدهای `K` می‌سازد. قید `K extends keyof T` تضمین می‌کند کلیدهای اشتباه خطا بدهند.',
        code: `// تعریف در lib.es5.d.ts:
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

type User = { id: string; name: string; email: string; password: string };

type UserCard = MyPick<User, 'id' | 'name'>;
const card: UserCard = { id: 'u1', name: 'نیما' };
console.log(card.id, card.name);
// ❌ card.email → وجود ندارد`,
      },
      {
        h: 'گام ۲ — کاربرد اصلی: کمینه‌سازی داده در API',
        p:
          'اصل کمترین امتیاز در سطح تایپ: هر endpoint فقط فیلدهایی را برمی‌گرداند که لازم است. `Pick` این را صریح و قابل بازبینی می‌کند.',
        code: `type User = { id: string; name: string; email: string; passwordHash: string; role: 'admin' | 'user' };

type PublicUser = Pick<User, 'id' | 'name' | 'role'>;
type AdminUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

function toPublic(user: User): PublicUser {
  return { id: user.id, name: user.name, role: user.role };
}

const full: User = { id: '1', name: 'نیما', email: 'n@x.com', passwordHash: 'secret', role: 'admin' };
console.log(toPublic(full));  // passwordHash هرگز نشت نمی‌کند`,
      },
      {
        h: 'گام ۳ — `Pick` با کلیدهای مشتق‌شده',
        p:
          'قدرت واقعی وقتی است که `K` را هم مشتق کنی: مثلاً فقط فیلدهای رشته‌ای، یا فقط فیلدهای غیرتابعی.',
        code: `type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
type PickStrings<T> = Pick<T, StringKeys<T>>;

type Form = { name: string; email: string; age: number; submit(): void };
type StringFields = PickStrings<Form>; // { name: string; email: string }

const fields: StringFields = { name: 'نیما', email: 'n@x.com' };
console.log(fields.name, fields.email);`,
      },
      {
        h: 'گام ۴ — `Pick` در برابر `Omit`',
        p:
          '`Pick` برای «چند فیلد از خیلی‌ها» و `Omit` برای «همه جز چندتا». قاعده‌ی انتخاب: کدام لیست کوتاه‌تر است؟ لیست کوتاه‌تر را صریح بنویس تا تایپ خواناتر و امن‌تر باشد.',
        code: `type User = { id: string; name: string; email: string; password: string; createdAt: Date };

type SafeA = Omit<User, 'password'>;              // ۴ فیلد باقی می‌ماند
type SafeB = Pick<User, 'id' | 'name' | 'email' | 'createdAt'>; // دقیقاً همان

const a: SafeA = { id: '1', name: 'نیما', email: 'n@x.com', createdAt: new Date(0) };
console.log(a.id, Object.keys(a).length);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۷',
        title: 'فرمول «Pick برای allowlist، Omit برای denylist»',
        body:
          'برای داده‌های حساس (رمز، توکن، داده‌ی شخصی) همیشه `Pick` استفاده کن — یعنی **فقط** آنچه صریحاً اجازه داده‌ای نشت می‌کند. `Omit` یک denylist است: اگر فردا فیلد حساس جدیدی اضافه شود، بی‌صدا نشت می‌کند.',
        equation: 'امنیت داده = allowlist (Pick) ≫ denylist (Omit) — چون افزودن فیلد جدید در allowlist به‌صورت پیش‌فرض مسدود است',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'برای هر endpoint یک تایپ `Pick` مجزا',
        body:
          'هرگز تایپ کامل دامنه را مستقیماً از API برنگردان. `type UserListResponse = Pick<User, "id" | "name">[]` بنویس. این کار payload را کوچک، قرارداد را صریح و نشت داده را غیرممکن می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا `Omit<User, "password">` خطرناک‌تر از `Pick` است؟',
        body:
          'پاسخ: «`Omit` یک denylist است؛ اگر فیلد حساس جدیدی (مثل `ssn`) به `User` اضافه شود، به‌صورت خودکار در خروجی ظاهر می‌شود. `Pick` یک allowlist است و فیلد جدید تا وقتی صریح اضافه نشود، نشت نمی‌کند.»',
      },
    ],
    quiz: {
      q: 'قید `K extends keyof T` در `Pick<T, K>` چه تضمینی می‌دهد؟',
      options: [
        'فقط کلیدهای واقعی `T` قابل انتخاب‌اند و کلید اشتباه خطای کامپایل می‌دهد',
        '`K` باید یک رشته باشد',
        'نتیجه همیشه readonly است',
        '`T` باید یک interface باشد',
      ],
      answer: 0,
      explain:
        'این قید، غلط املایی در نام کلید را در زمان کامپایل می‌گیرد. بدون آن، `Pick<User, "naem">` یک تایپ خالی و بی‌فایده می‌ساخت بدون هیچ هشدار.',
    },
    lab: {
      task: 'از یک تایپ `Article` با هفت فیلد، سه تایپ مشتق بساز: `ArticleListItem`، `ArticleDetail` و `ArticleAdmin`.',
      starter: `type Article = {
  id: string;
  title: string;
  slug: string;
  body: string;
  authorId: string;
  isPublished: boolean;
  createdAt: Date;
};

type ArticleListItem = Pick<Article, 'id' | 'title' | 'slug'>;
type ArticleDetail = Pick<Article, 'id' | 'title' | 'slug' | 'body' | 'createdAt'>;
type ArticleAdmin = Article;

const item: ArticleListItem = { id: '1', title: 'Pick', slug: 'pick' };
console.log(Object.keys(item).join(','));`,
      solution: `type ArticleListItem = Pick<Article, 'id' | 'title' | 'slug'>;
type ArticleDetail = Omit<Article, 'authorId' | 'isPublished'>;`,
    },
  },

  {
    id: 'util-omit',
    chapter: 'ch11',
    titleFa: 'Omit<T, K>',
    titleEn: 'Omit',
    level: 'intermediate',
    minutes: 25,
    goal: '`Omit` را درست استفاده کنی، تفاوتش با `Exclude` را بفهمی و دو تله‌ی معروفش را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و پیاده‌سازی داخلی',
        p:
          '`Omit<T, K>` در واقع `Pick<T, Exclude<keyof T, K>>` است. از TS 4.5 قید آن `K extends keyof any` است، یعنی **کلیدهای ناشناخته هم پذیرفته می‌شوند** (بدون خطا!).',
        code: `// تعریف در lib.es5.d.ts:
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type User = { id: string; name: string; password: string };
type PublicUser = MyOmit<User, 'password'>;

const u: PublicUser = { id: '1', name: 'نیما' };
console.log(u.id, u.name);`,
      },
      {
        h: 'گام ۲ — تله‌ی شماره ۱: کلید اشتباه بی‌صدا عبور می‌کند',
        p:
          '`Omit<User, "passwrd">` (غلط املایی) هیچ خطایی نمی‌دهد و هیچ فیلدی را هم حذف نمی‌کند! برای گرفتن این خطا، از `OmitStrict` سفارشی استفاده کن.',
        code: `type User = { id: string; name: string; password: string };

// ⚠️ غلط املایی — بی‌صدا و بی‌اثر:
const withTypo: Omit<User, 'passwrd'> = { id: '1', name: 'نیما', password: 'x' };

// ✅ نسخه‌ی سخت‌گیرانه‌ی سفارشی:
type OmitStrict<T, K extends keyof T> = Omit<T, K>;
const strict: OmitStrict<User, 'password'> = { id: '1', name: 'نیما' };

console.log(withTypo.id, strict.id);`,
      },
      {
        h: 'گام ۳ — تله‌ی شماره ۲: `Omit` روی Union توزیع نمی‌شود',
        p:
          '`Omit<A | B, "x">` ابتدا کلیدهای مشترک را می‌گیرد (چون `keyof (A|B)` اشتراک است) و نتیجه‌ای غیرمنتظره می‌سازد. راه‌حل: `DistributiveOmit`.',
        code: `type Circle = { kind: 'circle'; radius: number; id: string };
type Square = { kind: 'square'; side: number; id: string };
type Shape = Circle | Square;

// ⚠️ فقط کلیدهای مشترک باقی می‌مانند:
type Bad = Omit<Shape, 'id'>; // { kind: 'circle' | 'square' }

// ✅ توزیع‌شده:
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Good = DistributiveOmit<Shape, 'id'>;

const good: Good = { kind: 'circle', radius: 2 };
console.log(good.kind);`,
      },
      {
        h: 'گام ۴ — کاربردهای واقعی `Omit`',
        p:
          '۱) حذف فیلدهای سرور-ساخت (`id`، `createdAt`) از ورودی ساخت. ۲) حذف فیلدهای حساس از پاسخ. ۳) ساخت تایپ رویداد از تایپ موجودیت (حذف فیلدهای بی‌ربط).',
        code: `type Entity = { id: string; createdAt: Date; updatedAt: Date; title: string };

type CreateInput = Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateInput = Omit<Entity, 'id' | 'createdAt'> & { id: string };

const create: CreateInput = { title: 'سلام' };
const update: UpdateInput = { id: '1', updatedAt: new Date(0), title: 'سلام ۲' };
console.log(create.title, update.id);`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی جدی',
        title: '`Omit` روی Union، اعضای Union را خرد می‌کند',
        body:
          'نتیجه‌ی `Omit<Shape, "id">` دیگر یک Union نیست؛ یک آبجکت با فقط کلیدهای مشترک است. اگر با Discriminated Union کار می‌کنی، همیشه `DistributiveOmit` بنویس.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'برای ورودی‌های ساخت، `Omit` صریح بنویس',
        body:
          '`type CreatePostInput = Omit<Post, "id" | "createdAt" | "authorId">` هم مستندسازی است هم محافظت: خواننده دقیقاً می‌بیند چه چیزی توسط سرور پر می‌شود و هیچ‌وقت نمی‌تواند `id` جعلی بفرستد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۸',
        title: 'فرمول «Omit برای چیزهایی که نمی‌دانی، Pick برای چیزهایی که می‌دانی»',
        body:
          'اگر مجموعه‌ی فیلدهای حذفی کوچک و پایدار است → `Omit`. اگر مجموعه‌ی فیلدهای لازم، امنیتی یا متغیر است → `Pick`. این انتخاب، جهت خطا را تعیین می‌کند: `Pick` به سمت «کمتر نشان بده» و `Omit` به سمت «همه را نشان بده مگر…».',
      },
    ],
    quiz: {
      q: 'چرا `Omit<User, "passwrd">` (با غلط املایی) خطای کامپایل نمی‌دهد؟',
      options: [
        'چون قید `Omit` از `keyof T` استفاده نمی‌کند بلکه `keyof any` است',
        'چون TypeScript غلط املایی را تشخیص نمی‌دهد',
        'چون `Omit` همیشه `any` برمی‌گرداند',
        'چون `strict` خاموش است',
      ],
      answer: 0,
      explain:
        'امضای `Omit<T, K extends keyof any>` اجازه می‌دهد هر کلیدی (حتی ناموجود) پاس داده شود. برای سخت‌گیری، `type OmitStrict<T, K extends keyof T> = Omit<T, K>` تعریف کن.',
    },
    lab: {
      task: 'یک `DistributiveOmit` بنویس و روی یک Discriminated Union آزمایش کن.',
      starter: `type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type AppEvent =
  | { kind: 'click'; x: number; y: number; id: string }
  | { kind: 'key'; code: string; id: string };

type EventWithoutId = DistributiveOmit<AppEvent, 'id'>;

const e: EventWithoutId = { kind: 'key', code: 'Enter' };
console.log(e.kind);`,
      solution: `type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;`,
    },
  },

  {
    id: 'util-readonly',
    chapter: 'ch11',
    titleFa: 'Readonly<T>',
    titleEn: 'Readonly',
    level: 'intermediate',
    minutes: 25,
    goal: 'تغییرناپذیری در سطح تایپ را با `Readonly`، `readonly T[]` و `ReadonlyMap` پیاده کنی و مرزهای واقعی‌اش را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و اثر',
        p:
          '`Readonly<T>` با modifier `+readonly` همه‌ی فیلدها را فقط‌خواندنی می‌کند. تلاش برای نوشتن، خطای کامپایل می‌دهد.',
        code: `// تعریف در lib.es5.d.ts:
type MyReadonly<T> = { readonly [P in keyof T]: T[P] };

type Point = { x: number; y: number };
type FrozenPoint = MyReadonly<Point>;

const p: FrozenPoint = { x: 1, y: 2 };
// ❌ p.x = 5; → Cannot assign to 'x' because it is a read-only property
console.log(p.x, p.y);`,
      },
      {
        h: 'گام ۲ — خانواده‌ی کامل تغییرناپذیری',
        p:
          'برای هر ساختار داده یک نسخه‌ی readonly وجود دارد: `readonly T[]`، `ReadonlyArray<T>`، `ReadonlyMap`، `ReadonlySet`، `Readonly<T>`. استفاده از این‌ها در امضاهای عمومی، تعهد می‌دهد که داده‌ی فراخوان تغییر نمی‌کند.',
        code: `const list: readonly number[] = [1, 2, 3];
const map: ReadonlyMap<string, number> = new Map([['a', 1]]);
const set: ReadonlySet<string> = new Set(['x']);

// ❌ list.push(4) / map.set('b', 2) / set.add('y')
function total(values: readonly number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}

console.log(total(list), map.get('a'), set.has('x'));`,
      },
      {
        h: 'گام ۳ — `DeepReadonly` برای ساختارهای تودرتو',
        p:
          'مثل `Partial`، نسخه‌ی استاندارد فقط سطح اول است. برای کانفیگ‌ها و stateهای تودرتو، `DeepReadonly` لازم است.',
        code: `type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? ReadonlyArray<DeepReadonly<T[number]>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type State = { user: { profile: { name: string } }; items: string[] };
type FrozenState = DeepReadonly<State>;

const state: FrozenState = { user: { profile: { name: 'نیما' } }, items: ['a'] };
// ❌ state.user.profile.name = 'x'
console.log(state.user.profile.name, state.items.length);`,
      },
      {
        h: 'گام ۴ — محدودیت مهم: readonly فقط زمان کامپایل است',
        p:
          '`Readonly<T>` هیچ `Object.freeze` انجام نمی‌دهد. در زمان اجرا آبجکت کاملاً قابل تغییر است (با `as any` یا از مرزهای دیگر). برای تغییرناپذیری واقعی زمان اجرا، `Object.freeze` (که خودش هم فقط سطح اول است) لازم داری.',
        code: `const frozenAtRuntime = Object.freeze({ x: 1, nested: { y: 2 } });
// ❌ frozenAtRuntime.x = 5 → TypeError در strict mode
frozenAtRuntime.nested.y = 9; // ✅ تغییر می‌کند! freeze عمیق نیست

type Freeze2 = Readonly<typeof frozenAtRuntime>;
const typed: Freeze2 = frozenAtRuntime;
console.log(typed.x, typed.nested.y);`,
      },
      {
        h: 'گام ۵ — معکوس: `Mutable<T>`',
        p:
          'گاهی (مثلاً در reducerها) لازم است readonly را برداری. یک Utility سفارشی با `-readonly` این کار را می‌کند.',
        code: `type Mutable<T> = { -readonly [P in keyof T]: T[P] };

type Frozen = { readonly a: string };
type Thawed = Mutable<Frozen>;

const t: Thawed = { a: 'x' };
t.a = 'y'; // ✅ حالا مجاز است
console.log(t.a);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۹',
        title: 'فرمول «readonly به‌صورت پیش‌فرض»',
        body:
          'هر فیلد، پارامتر و خروجی را `readonly` بنویس مگر اینکه **واقعاً** به تغییر نیاز داشته باشی. این یک تصمیم ساده، کل دسته‌ی باگ‌های Mutation تصادفی را حذف می‌کند و کد را به سمت معماری Immutable می‌برد.',
        equation: 'باگ‌های Mutation ≈ (تعداد نقاط نوشتن روی state مشترک) → هدف: کمینه با readonly پیش‌فرض',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی مهم',
        title: '`Readonly` زمان اجرا نیست',
        body:
          'اگر به تغییرناپذیری واقعی (مثلاً برای امنیت یا state management) نیاز داری، `Object.freeze` هم لازم است — و آن هم فقط سطح اول را منجمد می‌کند. برای freeze عمقی باید بازگشتی عمل کنی.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'ورودی `readonly`، خروجی `readonly`',
        body:
          'امضای حرفه‌ای: `function process(items: readonly Item[]): readonly Item[]`. این دو کلمه به فراخوان تضمین می‌دهند که نه داده‌اش تغییر می‌کند و نه نتیجه‌ی بازگشتی قرار است در جای دیگری جهش یابد.',
      },
    ],
    quiz: {
      q: 'کدام عبارت درباره‌ی `Readonly<T>` درست است؟',
      options: [
        'فقط در زمان کامپایل نوشتن را ممنوع می‌کند و در زمان اجرا اثری ندارد',
        'به‌صورت خودکار `Object.freeze` اعمال می‌کند',
        'فقط روی سطح اول اثر می‌کند و زمان اجرا هم محافظت می‌کند',
        'معادل `const` برای متغیر است',
      ],
      answer: 0,
      explain:
        'مثل همه‌ی تایپ‌ها، `readonly` هم در خروجی JavaScript پاک می‌شود. برای محافظت زمان اجرا باید صریحاً `Object.freeze` (و برای عمق، به‌صورت بازگشتی) استفاده کنی.',
    },
    lab: {
      task: 'یک `DeepReadonly` و یک `Mutable` بنویس و روی یک state تودرتو آزمایش کن.',
      starter: `type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type AppState = { readonly user: { readonly name: string }; readonly count: number };

function increment(state: DeepReadonly<AppState>): DeepReadonly<AppState> {
  return { ...state, count: state.count + 1 };
}

const s1: DeepReadonly<AppState> = { user: { name: 'نیما' }, count: 0 };
const s2 = increment(s1);
console.log(s1.count, s2.count);`,
      solution: `const next: Mutable<AppState> = { user: { name: 'x' }, count: 1 };
next.count = 2;`,
    },
  },

  {
    id: 'util-record',
    chapter: 'ch11',
    titleFa: 'Record<K, V>',
    titleEn: 'Record',
    level: 'intermediate',
    minutes: 30,
    goal: 'با `Record` نگاشت‌های نوع‌دار بسازی، Exhaustiveness بگیری و تفاوتش با `Map` و Index Signature را بفهمی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و دو حالت کلید',
        p:
          '`Record<K, V>` یک آبجکت با کلیدهای `K` و مقادیر `V` است. اگر `K` یک Union لیترال باشد، **همه‌ی کلیدها اجباری‌اند** (Exhaustiveness). اگر `K = string` باشد، یک دیکشنری باز است.',
        code: `// تعریف در lib.es5.d.ts:
type MyRecord<K extends keyof any, V> = { [P in K]: V };

type Lang = 'fa' | 'en' | 'de';
type Labels = MyRecord<Lang, string>;   // همه‌ی سه کلید اجباری

const labels: Labels = { fa: 'سلام', en: 'Hello', de: 'Hallo' };
// ❌ حذف 'de' → خطای Property 'de' is missing

const open: Record<string, number> = { a: 1 };
console.log(labels.fa, open['a']);`,
      },
      {
        h: 'گام ۲ — Exhaustiveness: مهم‌ترین کاربرد',
        p:
          'با `Record<Union, T>`، افزودن یک عضو جدید به Union فوراً در همه‌ی نگاشت‌ها خطا می‌دهد. این قدرتمندترین ابزار نگهداری در TypeScript است.',
        code: `type Status = 'idle' | 'loading' | 'success' | 'error';

const STATUS_LABELS: Record<Status, string> = {
  idle: 'آماده',
  loading: 'در حال بارگذاری',
  success: 'موفق',
  error: 'خطا',
};

const STATUS_ICONS: Record<Status, string> = {
  idle: '⚪', loading: '⏳', success: '✅', error: '❌',
};

function render(s: Status): string { return \`\${STATUS_ICONS[s]} \${STATUS_LABELS[s]}\`; }
console.log(render('loading'));`,
      },
      {
        h: 'گام ۳ — `Record` در برابر `Map`',
        p:
          '`Record` برای کلیدهای **ثابت و شناخته‌شده** در زمان کامپایل؛ `Map` برای کلیدهای **پویا**، تعداد زیاد، یا کلیدهای غیررشته‌ای. `Record` یک آبجکت ساده است (سریالایز می‌شود)؛ `Map` نه.',
        code: `// Record — کلیدهای ثابت:
type Config = Record<'host' | 'port', string | number>;
const cfg: Config = { host: 'localhost', port: 3000 };

// Map — کلیدهای پویا:
const cache = new Map<string, number>();
cache.set('a', 1);
cache.delete('a');

console.log(cfg.host, cache.size);`,
      },
      {
        h: 'گام ۴ — `Record` با کلید عددی و Template Literal',
        p:
          '`Record<number, T>` برای آرایه‌مانندها و `Record<\`user_\${string}\`, T>` برای کلیدهای الگودار استفاده می‌شود.',
        code: `const byIndex: Record<number, string> = { 0: 'صفر', 1: 'یک' };
const byUserKey: Record<\`user_\${string}\`, number> = { user_1: 30, user_2: 25 };

console.log(byIndex[0], byUserKey['user_1']);`,
      },
      {
        h: 'گام ۵ — تله‌ی `noUncheckedIndexedAccess`',
        p:
          'با `Record<string, T>` و این flag روشن، `record["anything"]` از نوع `T | undefined` است (چون ممکن است آن کلید وجود نداشته باشد). ولی با `Record<Union, T>` همچنان `T` است، چون همه‌ی کلیدها اجباری‌اند.',
        code: `type Lang = 'fa' | 'en';
const closed: Record<Lang, string> = { fa: 'سلام', en: 'Hello' };
const open: Record<string, string> = { fa: 'سلام' };

console.log(closed.fa.toUpperCase());      // ✅ همیشه string
console.log(open['de'] ?? 'یافت نشد');      // ✅ مدیریت undefined`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۰',
        title: 'فرمول «Exhaustiveness با Record»',
        body:
          'هر Union در کدبیس که نیاز به «نگاشت» دارد (برچسب، آیکون، رنگ، handler، پیام خطا) باید با `Record<Union, T>` تعریف شود. این کار، افزودن عضو جدید به Union را به یک فهرست کار خودکار تبدیل می‌کند.',
        equation: 'تعداد نقاط فراموش‌شده هنگام افزودن عضو Union = ۰ (با Record) در برابر n (با switch دستی بدون assertNever)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'نگاشت‌های ثابت را `const ... : Record<Union, T>` بنویس',
        body:
          'ترکیب طلایی: `const LABELS: Record<Status, string> = {...} as const satisfies Record<Status, string>`. هم exhaustiveness داری، هم مقادیر لیترال دقیق، و هم تغییرناپذیری.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`Record<string, T>` دروغ می‌گوید',
        body:
          'بدون `noUncheckedIndexedAccess`، تایپ می‌گوید `record["anything"]` یک `T` است ولی در زمان اجرا `undefined` است. یا این flag را روشن کن، یا همیشه `?? fallback` بنویس.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'کی `Record` و کی `Map`؟',
        body:
          'پاسخ: «`Record` وقتی کلیدها در زمان کامپایل شناخته‌شده و محدودند (exhaustiveness لازم است) و ساختار باید JSON-serializable باشد. `Map` وقتی کلیدها پویا یا غیررشته‌ای‌اند، تعداد زیاد است، یا نیاز به عملیات مکرر افزودن/حذف در زمان اجرا داری.»',
      },
    ],
    quiz: {
      q: 'با `Record<"a" | "b", number>`، اگر فقط `{ a: 1 }` بنویسی چه اتفاقی می‌افتد؟',
      options: [
        'خطای کامپایل: `Property "b" is missing`',
        'کامپایل می‌شود و `b` برابر `undefined` است',
        'خطای زمان اجرا می‌دهد',
        'تایپ به `Record<string, number>` گسترش می‌یابد',
      ],
      answer: 0,
      explain:
        'وقتی `K` یک Union لیترال است، `Record` همه‌ی کلیدها را اجباری می‌کند. این همان ویژگی Exhaustiveness است که افزودن عضو جدید به Union را ایمن می‌کند.',
    },
    lab: {
      task: 'برای هر فصل مسیر یادگیری، یک برچسب فارسی، یک رنگ و یک اولویت با سه `Record` تعریف کن.',
      starter: `const CHAPTERS = ['tools', 'types', 'guards', 'generics', 'utility'] as const;
type Chapter = (typeof CHAPTERS)[number];

const LABELS: Record<Chapter, string> = {
  tools: 'ابزارها', types: 'انواع', guards: 'گاردها', generics: 'جنریک', utility: 'Utility',
};

const PRIORITY: Record<Chapter, 1 | 2 | 3> = {
  tools: 3, types: 1, guards: 1, generics: 2, utility: 2,
};

console.log(CHAPTERS.map((c) => \`\${LABELS[c]} (P\${PRIORITY[c]})\`).join(' | '));`,
      solution: `const LABELS: Record<Chapter, string> = { tools: 'ابزارها', types: 'انواع', guards: 'گاردها', generics: 'جنریک', utility: 'Utility' };`,
    },
  },

  {
    id: 'util-exclude',
    chapter: 'ch11',
    titleFa: 'Exclude<T, U>',
    titleEn: 'Exclude',
    level: 'advanced',
    minutes: 30,
    goal: 'مکانیزم توزیع (Distribution) را بفهمی و با `Exclude` اعضای یک Union را فیلتر کنی.',
    steps: [
      {
        h: 'گام ۱ — تعریف: یک Conditional Type توزیع‌شده',
        p:
          '`Exclude<T, U> = T extends U ? never : T`. چون `T` یک پارامتر Generic **برهنه** (naked) است، روی هر عضو Union جداگانه توزیع می‌شود و اعضایی که با `U` می‌خوانند به `never` تبدیل و از Union حذف می‌شوند.',
        code: `// تعریف در lib.es5.d.ts:
type MyExclude<T, U> = T extends U ? never : T;

type All = 'a' | 'b' | 'c';
type WithoutA = MyExclude<All, 'a'>;   // 'b' | 'c'
type OnlyStrings = MyExclude<string | number | (() => void), number | Function>;

const x: WithoutA = 'b';
console.log(x, typeof OnlyStrings);`,
      },
      {
        h: 'گام ۲ — درک Distribution با یک آزمایش',
        p:
          'اگر `T` را داخل `[]` بگذاری (نپوشانی)، توزیع **غیرفعال** می‌شود و نتیجه کاملاً متفاوت است. این کلید فهم Conditional Types است.',
        code: `type Distributed<T, U> = T extends U ? never : T;
type NonDistributed<T, U> = [T] extends [U] ? never : T;

type Input = 'a' | 'b';

type A = Distributed<Input, 'a'>;       // 'b'  (توزیع شد)
type B = NonDistributed<Input, 'a'>;    // 'a' | 'b'  (توزیع نشد، چون کل Union با 'a' نمی‌خواند)

const a: A = 'b';
const b: B = 'a';
console.log(a, b);`,
      },
      {
        h: 'گام ۳ — `Exclude` در برابر `Omit`',
        p:
          '`Exclude` روی **مقادیر تایپ** (اعضای Union) کار می‌کند؛ `Omit` روی **کلیدهای یک آبجکت**. این دو را قاطی نکن: `Exclude<keyof T, "password">` نتیجه‌ی همان کلیدهاست که `Omit` از آن استفاده می‌کند.',
        code: `type User = { id: string; name: string; password: string };

type SafeKeys = Exclude<keyof User, 'password'>; // 'id' | 'name'
type SafeUser = Pick<User, SafeKeys>;            // معادل Omit<User, 'password'>

const u: SafeUser = { id: '1', name: 'نیما' };
console.log(u.id, u.name);`,
      },
      {
        h: 'گام ۴ — کاربردهای واقعی',
        p:
          '۱) حذف `null`/`undefined` از یک Union. ۲) جداکردن توابع از فیلدهای داده. ۳) ساخت «رویدادهای باقی‌مانده» در یک سیستم پیام‌رسانی.',
        code: `type Value = string | number | null | undefined | (() => void);

type NonNull = Exclude<Value, null | undefined>;       // string | number | (() => void)
type NonFunction = Exclude<NonNull, Function>;         // string | number
type OnlyFunctions = Extract<Value, Function>;         // () => void

const a: NonFunction = 'text';
const b: NonFunction = 42;
console.log(a, b);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۱',
        title: 'فرمول «توزیع فقط برای Generic برهنه»',
        body:
          'یک Conditional Type فقط وقتی روی Union توزیع می‌شود که طرف چپ `extends` یک **پارامتر Generic برهنه** باشد. `T extends U` توزیع می‌شود؛ `[T] extends [U]`، `T[] extends U` و `keyof T extends U` توزیع نمی‌شوند. این یک قاعده، ۹۰٪ سردرگمی‌های Conditional Type را حل می‌کند.',
        equation: 'توزیع ⟺ (طرف چپ = پارامتر Generic برهنه، بدون هیچ پوشش)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'به‌جای `Exclude<T, never>` از `NonNullable` استفاده کن',
        body:
          'برای حذف تهی‌ها، `NonNullable<T>` خواناتر و هدف‌مندتر از `Exclude<T, null | undefined>` است. از `Exclude` وقتی استفاده کن که واقعاً یک زیرمجموعه‌ی معنادار را حذف می‌کنی.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'توزیع را با یک Union دو عضوی آزمایش کن',
        body:
          'هر بار که یک Conditional Type نوشتی و نتیجه گیج‌کننده بود، با ساده‌ترین حالت آزمایش کن: `type T = "a" | "b"` و ببین هر عضو جدا چه می‌شود. این تکنیک، پیچیده‌ترین تایپ‌ها را قابل فهم می‌کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چرا `Exclude<"a" | "b", "a">` برابر `"b"` است؟',
        body:
          'پاسخ: «چون Conditional Type روی Union توزیع می‌شود: `("a" extends "a" ? never : "a") | ("b" extends "a" ? never : "b")` = `never | "b"` = `"b"`. و `never` در Union حذف می‌شود.»',
      },
    ],
    quiz: {
      q: 'کدام حالت باعث می‌شود یک Conditional Type روی Union **توزیع نشود**؟',
      options: [
        'پیچیدن طرف چپ در Tuple: `[T] extends [U] ? X : Y`',
        'استفاده از `never` در شاخه‌ی true',
        'استفاده از `keyof T` در شاخه‌ی false',
        'افزودن یک پارامتر Generic دوم',
      ],
      answer: 0,
      explain:
        'توزیع فقط وقتی رخ می‌دهد که طرف چپ یک Generic برهنه باشد. `[T]` آن را می‌پوشاند (naked نیست)، پس کل Union به‌عنوان یک واحد بررسی می‌شود.',
    },
    lab: {
      task: 'از یک تایپ بزرگ که هم فیلد داده دارد هم متد، فقط کلیدهای غیرتابعی را با `Exclude` استخراج کن.',
      starter: `type Widget = {
  id: string;
  label: string;
  count: number;
  render(): string;
  dispose(): void;
};

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

type DataKeys<T> = Exclude<keyof T, FunctionKeys<T>>;

type WidgetDataKeys = DataKeys<Widget>; // 'id' | 'label' | 'count'

const keys: WidgetDataKeys = 'label';
console.log(keys);`,
      solution: `type DataKeys<T> = Exclude<keyof T, FunctionKeys<T>>;`,
    },
  },
];
