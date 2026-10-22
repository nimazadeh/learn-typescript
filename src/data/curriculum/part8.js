/* ==========================================================================
   فصل ۱۱ — Utility Types (بخش ۲)
   (Extract · NonNullable · Parameters · ReturnType · InstanceType · Awaited)
   ========================================================================== */

export const PART8_LESSONS = [
  {
    id: 'util-extract',
    chapter: 'ch11',
    titleFa: 'Extract<T, U>',
    titleEn: 'Extract',
    level: 'advanced',
    minutes: 25,
    goal: 'با `Extract` اعضای مشترک دو Union را بگیری و الگوهای پیشرفته‌ی فیلتر تایپ را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — تعریف: معکوس `Exclude`',
        p:
          '`Extract<T, U> = T extends U ? T : never`. اعضایی از `T` که با `U` سازگارند نگه داشته می‌شوند و بقیه به `never` (و پس حذف) تبدیل می‌شوند.',
        code: `type MyExtract<T, U> = T extends U ? T : never;

type AllEvents = 'click' | 'scroll' | 'mousedown' | 'keydown';
type MouseEvents = MyExtract<AllEvents, 'click' | 'scroll' | 'mousedown'>;
// → 'click' | 'mousedown'

const e: MouseEvents = 'click';
console.log(e);`,
      },
      {
        h: 'گام ۲ — استخراج اعضای یک Discriminated Union',
        p:
          'یکی از قوی‌ترین کاربردها: از یک Union بزرگ، فقط اعضای دارای یک `kind` مشخص را بیرون بکش.',
        code: `type Event =
  | { kind: 'click'; x: number }
  | { kind: 'scroll'; delta: number }
  | { kind: 'key'; code: string };

type ClickEvent = Extract<Event, { kind: 'click' }>;
type NonKeyEvent = Exclude<Event, { kind: 'key' }>;

const click: ClickEvent = { kind: 'click', x: 10 };
console.log(click.x);

function describe(e: NonKeyEvent): string {
  return e.kind === 'click' ? \`click \${e.x}\` : \`scroll \${e.delta}\`;
}
console.log(describe({ kind: 'scroll', delta: 5 }));`,
      },
      {
        h: 'گام ۳ — `Extract` با تابع و Promise',
        p:
          'می‌توانی اعضایی که تابع یا Promise هستند را جدا کنی — برای ساخت تایپ‌های تحلیلی بسیار مفید است.',
        code: `type Mixed = string | number | (() => void) | Promise<string>;

type Fns = Extract<Mixed, Function>;        // () => void
type Async = Extract<Mixed, Promise<unknown>>; // Promise<string>
type Sync = Exclude<Mixed, Function | Promise<unknown>>; // string | number

const s: Sync = 'text';
console.log(s, typeof Fns, typeof Async);`,
      },
      {
        h: 'گام ۴ — `Extract` در برابر `keyof` و `Pick`',
        p:
          'برای کار با کلیدهای آبجکت، ترکیب سه‌گانه رایج است: `Extract<keyof T, ...>` سپس `Pick<T, ...>`. این الگو، زیرمجموعه‌ای از فیلدها را بر اساس یک شرط انتخاب می‌کند.',
        code: `type User = { id: string; name: string; email: string; createdAt: Date };

type StringKeys = Extract<keyof User, 'id' | 'name' | 'email' | 'phone'>;
// → 'id' | 'name' | 'email'   ('phone' وجود ندارد، بی‌صدا حذف می‌شود)

type StringsOnly = Pick<User, StringKeys>;
const u: StringsOnly = { id: '1', name: 'نیما', email: 'n@x.com' };
console.log(Object.keys(u).join(','));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`Extract` برای allowlist کردن اعضا',
        body:
          'وقتی از یک Union بزرگ عمومی، فقط بخشی را در یک API خاص مجاز می‌کنی، `Extract` را استفاده کن. این کار قرارداد را صریح می‌کند و افزودن عضو جدید به Union والد، بی‌صدا API فرزند را گسترش نمی‌دهد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۲',
        title: 'فرمول «Exclude = تفریق مجموعه، Extract = اشتراک مجموعه»',
        body:
          'هر دو را به زبان مجموعه‌ها بخوان: `Exclude<T,U> = T − U` و `Extract<T,U> = T ∩ U`. با این تصویر ذهنی، می‌توانی نتیجه‌ی هر فیلتر تایپی را بدون اجرا پیش‌بینی کنی.',
        equation: 'Exclude<T,U> = T \\ U  ·  Extract<T,U> = T ∩ U',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'کلید ناموجود بی‌صدا حذف می‌شود',
        body:
          '`Extract<keyof User, "phone">` اگر `phone` وجود نداشته باشد، `never` می‌دهد بدون هیچ خطا. اگر انتظار داشتی حتماً وجود داشته باشد، یک بررسی اضافه کن: `type AssertExists<K> = [K] extends [never] ? "ERROR" : K`.',
      },
    ],
    quiz: {
      q: 'نتیجه‌ی `Extract<"a" | "b" | "c", "b" | "d">` چیست؟',
      options: ['`"b"`', '`"a" | "b" | "c"`', '`never`', '`"b" | "d"`'],
      answer: 0,
      explain:
        '`Extract` اشتراک دو مجموعه است: از بین `"a" | "b" | "c"` فقط `"b"` با `"b" | "d"` سازگار است. `"d"` در `T` وجود ندارد پس نقشی ندارد.',
    },
    lab: {
      task: 'از یک Union رویداد، فقط رویدادهای دارای فیلد `x` را با `Extract` جدا کن.',
      starter: `type Event =
  | { kind: 'click'; x: number; y: number }
  | { kind: 'move'; x: number; y: number }
  | { kind: 'key'; code: string };

type WithCoordinates = Extract<Event, { x: number }>;

function position(e: WithCoordinates): string { return \`(\${e.x},\${e.y})\`; }

console.log(position({ kind: 'click', x: 1, y: 2 }));
console.log(position({ kind: 'move', x: 3, y: 4 }));`,
      solution: `type WithCoordinates = Extract<Event, { x: number }>;`,
    },
  },

  {
    id: 'util-nonnullable',
    chapter: 'ch11',
    titleFa: 'NonNullable<T>',
    titleEn: 'NonNullable',
    level: 'intermediate',
    minutes: 20,
    goal: 'تهی‌زدایی از تایپ‌ها را با `NonNullable` و نسخه‌های عمیق‌تر انجام دهی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و اثر',
        p:
          '`NonNullable<T> = T extends null | undefined ? never : T`. هر دو مقدار تهی را از Union حذف می‌کند و بقیه را دست‌نخورده نگه می‌دارد.',
        code: `type MaybeString = string | null | undefined;
type CleanString = NonNullable<MaybeString>; // string

type Mixed = number | string | null;
type CleanMixed = NonNullable<Mixed>;        // number | string

const a: CleanString = 'text';
const b: CleanMixed = 42;
console.log(a, b);`,
      },
      {
        h: 'گام ۲ — کاربرد در خروجی توابع',
        p:
          'وقتی یک تابع `T | null` برمی‌گرداند ولی در یک نقطه می‌دانی مقدار وجود دارد، `NonNullable` تایپ تمیز را به تو می‌دهد بدون نوشتن دستی Union.',
        code: `type User = { id: string; name: string };

function findUser(users: readonly User[], id: string): User | null {
  return users.find((u) => u.id === id) ?? null;
}

type FoundUser = NonNullable<ReturnType<typeof findUser>>; // User

const users: readonly User[] = [{ id: '1', name: 'نیما' }];
const found = findUser(users, '1');
if (found) {
  const safe: FoundUser = found;
  console.log(safe.name.toUpperCase());
}`,
      },
      {
        h: 'گام ۳ — `DeepNonNullable` برای ساختارهای تودرتو',
        p:
          'نسخه‌ی استاندارد فقط سطح اول را پاک می‌کند. برای پاسخ‌های API تودرتو، نسخه‌ی بازگشتی لازم است.',
        code: `type DeepNonNullable<T> = T extends null | undefined
  ? never
  : T extends readonly (infer E)[]
    ? DeepNonNullable<E>[]
    : T extends object
      ? { [K in keyof T]: DeepNonNullable<T[K]> }
      : T;

type Raw = { user: { name: string | null; tags: (string | null)[] } | null };
type Clean = DeepNonNullable<Raw>;

const clean: Clean = { user: { name: 'نیما', tags: ['a', 'b'] } };
console.log(clean.user.name, clean.user.tags.length);`,
      },
      {
        h: 'گام ۴ — `NonNullable` در برابر `?? `',
        p:
          '`NonNullable` در سطح **تایپ** کار می‌کند؛ `??` در سطح **مقدار**. معمولاً به هر دو نیاز داری: `??` برای تولید مقدار امن و `NonNullable` برای توصیف تایپ نتیجه.',
        code: `const maybe: string | undefined = undefined;
const safe: NonNullable<typeof maybe> = maybe ?? 'پیش‌فرض';
console.log(safe.toUpperCase());`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تهی‌زدایی در مرز، نه در هسته',
        body:
          'یک تابع `parse` در مرز بنویس که `unknown | null` بگیرد و `NonNullable` برگرداند. از آن نقطه به بعد، کل هسته‌ی برنامه با تایپ‌های غیرتهی کار می‌کند و هیچ `?.` تکراری نمی‌بینی.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۳',
        title: 'فرمول «تعداد `?.` معکوس کیفیت طراحی تایپ است»',
        body:
          'اگر در یک تابع پنج بار `?.` نوشتی، یعنی تهی بودن به عمق منطق نشت کرده است. تهی بودن را در ورودی حل کن (با گارد یا `NonNullable`) و بدنه را با تایپ قطعی بنویس.',
        equation: 'خوانایی تابع ∝ ۱ ÷ (تعداد Optional Chaining در بدنه)',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`NonNullable<T>` هیچ اعتبارسنجی زمان اجرا نمی‌کند',
        body:
          'این فقط یک تبدیل تایپی است. اگر مقدار واقعاً `null` باشد، تایپ دروغ گفته و در زمان اجرا می‌شکند. همیشه همراه با یک گارد واقعی یا `??` استفاده کن.',
      },
    ],
    quiz: {
      q: 'نتیجه‌ی `NonNullable<string | number | null | undefined>` چیست؟',
      options: ['`string | number`', '`string | number | null`', '`never`', '`unknown`'],
      answer: 0,
      explain:
        '`NonNullable` هر دو مقدار `null` و `undefined` را از Union حذف می‌کند و بقیه‌ی اعضا را نگه می‌دارد.',
    },
    lab: {
      task: 'یک `DeepNonNullable` بنویس و روی یک تایپ API تودرتو آزمایش کن.',
      starter: `type DeepNonNullable<T> = T extends null | undefined
  ? never
  : T extends object
    ? { [K in keyof T]: DeepNonNullable<T[K]> }
    : T;

type RawResponse = {
  data: { users: { name: string | null }[] | null } | null;
};

type CleanResponse = DeepNonNullable<RawResponse>;

const clean: CleanResponse = { data: { users: [{ name: 'نیما' }] } };
console.log(clean.data.users.length);`,
      solution: `type DeepNonNullable<T> = T extends null | undefined ? never : T extends object ? { [K in keyof T]: DeepNonNullable<T[K]> } : T;`,
    },
  },

  {
    id: 'util-parameters',
    chapter: 'ch11',
    titleFa: 'Parameters<T>',
    titleEn: 'Parameters',
    level: 'advanced',
    minutes: 30,
    goal: 'با `infer` پارامترهای یک تابع را استخراج کنی و الگوهای Wrapper/Proxy تایپ‌دار بسازی.',
    steps: [
      {
        h: 'گام ۱ — تعریف با `infer`',
        p:
          '`Parameters<T> = T extends (...args: infer P) => unknown ? P : never`. نتیجه یک **Tuple** از تایپ پارامترهاست. این اولین جایی است که قدرت `infer` را می‌بینی.',
        code: `type MyParameters<T extends (...args: never[]) => unknown> =
  T extends (...args: infer P) => unknown ? P : never;

function createUser(name: string, age: number, isAdmin = false): string {
  return \`\${name}/\${age}/\${isAdmin}\`;
}

type Args = MyParameters<typeof createUser>; // [name: string, age: number, isAdmin?: boolean]

const args: Args = ['نیما', 30, true];
console.log(createUser(...args));`,
      },
      {
        h: 'گام ۲ — کاربرد طلایی: Wrapperهای تایپ‌دار',
        p:
          'وقتی می‌خواهی یک تابع موجود را تزئین کنی (لاگ، retry، کش) بدون بازنویسی امضا، `Parameters<T>` + `ReturnType<T>` امضای دقیق را بازتولید می‌کند.',
        code: `function withLogging<T extends (...args: never[]) => unknown>(fn: T): T {
  const wrapped = (...args: Parameters<T>): ReturnType<T> => {
    console.log(\`→ \${fn.name} called with \${args.length} args\`);
    const result = fn(...args) as ReturnType<T>;
    console.log('← done');
    return result;
  };
  return wrapped as T;
}

function add(a: number, b: number): number { return a + b; }
const loggedAdd = withLogging(add);

console.log(loggedAdd(2, 3)); // امضای دقیقاً مثل add`,
      },
      {
        h: 'گام ۳ — خانواده‌ی کامل `Parameters`',
        p:
          '`ConstructorParameters<T>` برای سازنده‌ها، `ThisParameterType<T>` برای استخراج تایپ `this`، و `OmitThisParameter<T>` برای حذف آن. این‌ها برای کار با Decoratorها و کلاس‌ها لازم‌اند.',
        code: `class Service {
  constructor(private host: string, private port: number) {}
  url(): string { return \`\${this.host}:\${this.port}\`; }
}

type CtorArgs = ConstructorParameters<typeof Service>; // [host: string, port: number]

const args: CtorArgs = ['localhost', 3000];
console.log(new Service(...args).url());`,
      },
      {
        h: 'گام ۴ — تله‌ی Overloadها',
        p:
          'برای یک تابع با چند امضای overload، `Parameters<T>` فقط **آخرین** امضا (معمولاً عمومی‌ترین) را می‌گیرد. این یک محدودیت شناخته‌شده است.',
        code: `function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number {
  return input;
}

type ParseArgs = Parameters<typeof parse>; // فقط آخرین امضا
const args: ParseArgs = ['text'];
console.log(parse(...args));`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۴',
        title: 'فرمول «امضا را مشتق کن، نه تکرار»',
        body:
          'هر Wrapper، Proxy یا Decorator که امضای تابع اصلی را **دستی** بازنویسی می‌کند، یک نقطه‌ی شکست آینده است. با `Parameters<T>` و `ReturnType<T>`، امضا همیشه به‌صورت خودکار همگام می‌ماند.',
        equation: 'هزینه‌ی تغییر امضای تابع = ۱ ویرایش (با مشتق‌سازی) در برابر n ویرایش (با تکرار دستی)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Higher-Order Functionها را با Generic بنویس نه با `Parameters`',
        body:
          'اگر کنترل کامل روی تابع داری، `<A extends unknown[], R>(fn: (...args: A) => R)` خواناتر از `Parameters<T>` است. `Parameters` را برای وقتی نگه دار که تابع از جای دیگری می‌آید و امضایش را نمی‌توانی Generic کنی.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`Parameters` روی Overload فقط آخرین امضا را می‌گیرد',
        body:
          'اگر تابع هدف چند overload دارد و تو به امضای خاصی نیاز داری، `Parameters` کمکت نمی‌کند. یا تابع را Generic بازنویسی کن یا امضای مورد نظر را دستی تعریف کن.',
      },
    ],
    quiz: {
      q: 'تایپ `Parameters<typeof fn>` برای `function fn(a: string, b: number): boolean` چیست؟',
      options: ['`[a: string, b: number]`', '`string | number`', '`boolean`', '`{ a: string; b: number }`'],
      answer: 0,
      explain:
        '`Parameters` یک **Tuple** (نه آبجکت) از تایپ پارامترها برمی‌گرداند، با برچسب‌های اصلی. به همین دلیل می‌توان آن را با `fn(...args)` spread کرد.',
    },
    lab: {
      task: 'یک Wrapper `withRetry` بنویس که هر تابعی را بگیرد و بدون تغییر امضا، سه بار تلاش کند.',
      starter: `function withRetry<T extends (...args: never[]) => unknown>(fn: T, attempts = 3): T {
  const wrapped = (...args: Parameters<T>): ReturnType<T> => {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return fn(...args) as ReturnType<T>;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  };
  return wrapped as T;
}

let calls = 0;
function unstable(id: number): string {
  calls++;
  if (calls < 3) throw new Error('fail');
  return \`ok-\${id}\`;
}

console.log(withRetry(unstable)(7), calls);`,
      solution: `function withRetry<T extends (...a: never[]) => unknown>(fn: T, n = 3): T {
  return ((...args: Parameters<T>) => { ... }) as T;
}`,
    },
  },

  {
    id: 'util-returntype',
    chapter: 'ch11',
    titleFa: 'ReturnType<T>',
    titleEn: 'ReturnType',
    level: 'advanced',
    minutes: 30,
    goal: 'تایپ بازگشتی توابع را استخراج کنی و الگوهای قدرتمند «تایپ از تابع» را بسازی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و استفاده‌ی پایه',
        p:
          '`ReturnType<T> = T extends (...args: never) => infer R ? R : never`. این یکی از پرکاربردترین Utility Typeهاست چون اجازه می‌دهد تایپ‌ها را از **رفتار واقعی** کد مشتق کنی.',
        code: `type MyReturnType<T extends (...args: never[]) => unknown> =
  T extends (...args: never[]) => infer R ? R : never;

function makeUser(name: string) {
  return { id: crypto.randomUUID?.() ?? 'x', name, createdAt: new Date() };
}

type User = MyReturnType<typeof makeUser>;

const u: User = makeUser('نیما');
console.log(u.name, u.id.length > 0);`,
      },
      {
        h: 'گام ۲ — الگوی طلایی: «تایپ از کارخانه»',
        p:
          'به‌جای اینکه تایپ را دستی بنویسی و بعد کارخانه را مطابق آن بسازی، برعکس عمل کن: تابع کارخانه را بنویس و تایپ را از آن مشتق کن. این کار تکرار را صفر و همگامی را تضمین می‌کند.',
        code: `function createLesson(title: string, minutes: number) {
  return {
    id: title.toLowerCase().replace(/\\s+/g, '-'),
    title,
    minutes,
    isCompleted: false,
  };
}

type Lesson = ReturnType<typeof createLesson>;
type LessonId = Lesson['id'];

const lesson: Lesson = createLesson('ReturnType', 30);
const id: LessonId = lesson.id;
console.log(id, lesson.minutes);`,
      },
      {
        h: 'گام ۳ — ترکیب با `Awaited` برای توابع async',
        p:
          'برای توابع async، `ReturnType` یک `Promise<T>` می‌دهد. برای رسیدن به `T` باید `Awaited` را ترکیب کنی.',
        code: `async function fetchUsers(): Promise<{ id: string; name: string }[]> {
  return [{ id: '1', name: 'نیما' }];
}

type Raw = ReturnType<typeof fetchUsers>;        // Promise<{...}[]>
type Users = Awaited<ReturnType<typeof fetchUsers>>; // {...}[]
type FirstUser = Users[number];                  // { id: string; name: string }

const u: FirstUser = { id: '1', name: 'سارا' };
console.log(u.name, typeof Raw);`,
      },
      {
        h: 'گام ۴ — استخراج تایپ از توابع بیرونی و Redux-style',
        p:
          'الگوی معروف Redux: تایپ Action از `ReturnType<typeof actionCreator>` مشتق می‌شود. این کار باعث می‌شود افزودن یک action جدید، به‌صورت خودکار تایپ‌ها را به‌روز کند.',
        code: `const addTodo = (text: string) => ({ type: 'ADD_TODO', payload: text }) as const;
const toggleTodo = (id: number) => ({ type: 'TOGGLE_TODO', payload: id }) as const;

type Action = ReturnType<typeof addTodo> | ReturnType<typeof toggleTodo>;

function reducer(state: string[], action: Action): string[] {
  switch (action.type) {
    case 'ADD_TODO': return [...state, action.payload];
    case 'TOGGLE_TODO': return state;
  }
}

console.log(reducer([], addTodo('یادگیری TS')));`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۵',
        title: 'فرمول «کد، منبع تایپ است»',
        body:
          'به‌جای نوشتن تایپ و بعد نوشتن کد مطابق آن (که می‌توانند از هم دور بیفتند)، کد را بنویس و تایپ را با `ReturnType` از آن **مشتق** کن. این کار «همگامی تایپ و پیاده‌سازی» را به یک ویژگی ساختاری تبدیل می‌کند نه یک تعهد انسانی.',
        equation: 'همگامی تایپ/کد = ۱۰۰٪ با مشتق‌سازی (ReturnType/typeof) در برابر ~۶۰٪ با تایپ‌های دستی موازی',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Action Creatorها با `as const` + `ReturnType`',
        body:
          'الگوی استاندارد Redux: هر action creator را با `as const` بنویس تا `type` یک لیترال بماند، سپس تایپ Action را با Union از `ReturnType`ها بساز. افزودن action جدید = یک خط، و `switch` به‌صورت خودکار exhaustiveness می‌گیرد.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`ReturnType` روی overload فقط آخرین امضا',
        body:
          'مثل `Parameters`، برای توابع چند-امضایی فقط آخرین overload در نظر گرفته می‌شود. اگر به تایپ بازگشتی یک امضای خاص نیاز داری، آن امضا را دستی استخراج کن.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور تایپ یک پاسخ API را بدون تکرار تعریف کنی؟',
        body:
          'پاسخ: «تابع fetch را بنویسم و `type UserResponse = Awaited<ReturnType<typeof fetchUsers>>` را مشتق کنم. اگر پاسخ عوض شود، تایپ هم خودکار عوض می‌شود و همه‌ی مصرف‌کننده‌ها خطا می‌گیرند.»',
      },
    ],
    quiz: {
      q: 'برای تابع `async function f(): Promise<number[]>`، تایپ `ReturnType<typeof f>` چیست؟',
      options: ['`Promise<number[]>`', '`number[]`', '`number`', '`void`'],
      answer: 0,
      explain:
        'یک تابع async همیشه `Promise<T>` برمی‌گرداند، پس `ReturnType` همان `Promise<number[]>` است. برای رسیدن به `number[]` باید `Awaited<ReturnType<typeof f>>` بنویسی.',
    },
    lab: {
      task: 'سه Action Creator با `as const` بنویس و تایپ Action و State را با `ReturnType` مشتق کن.',
      starter: `const setLoading = (value: boolean) => ({ type: 'SET_LOADING', payload: value }) as const;
const setItems = (items: readonly string[]) => ({ type: 'SET_ITEMS', payload: items }) as const;
const reset = () => ({ type: 'RESET' }) as const;

type Action = ReturnType<typeof setLoading> | ReturnType<typeof setItems> | ReturnType<typeof reset>;

type State = { loading: boolean; items: readonly string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ITEMS': return { ...state, items: action.payload };
    case 'RESET': return { loading: false, items: [] };
  }
}

console.log(reducer({ loading: false, items: [] }, setItems(['a', 'b'])));`,
      solution: `type Action = ReturnType<typeof setLoading> | ReturnType<typeof setItems> | ReturnType<typeof reset>;`,
    },
  },

  {
    id: 'util-instancetype',
    chapter: 'ch11',
    titleFa: 'InstanceType<T>',
    titleEn: 'InstanceType',
    level: 'advanced',
    minutes: 25,
    goal: 'از تایپ یک سازنده به تایپ نمونه‌اش برسی و الگوهای Factory/DI تایپ‌دار بسازی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و جهت حرکت',
        p:
          '`InstanceType<T> = T extends abstract new (...args: never) => infer I ? I : never`. جهت‌ها را به خاطر بسپار: `typeof Class` → سازنده؛ `InstanceType<typeof Class>` → نمونه.',
        code: `class Service {
  constructor(public readonly name: string) {}
  run(): string { return \`\${this.name} running\`; }
}

type ServiceCtor = typeof Service;                    // سازنده
type ServiceInstance = InstanceType<ServiceCtor>;     // نمونه

const instance: ServiceInstance = new Service('api');
console.log(instance.run());`,
      },
      {
        h: 'گام ۲ — کاربرد طلایی: کارخانه‌های Generic',
        p:
          'وقتی یک تابع کارخانه داری که باید هر کلاسی را بپذیرد و نمونه‌ی همان را برگرداند، این الگو ضروری است.',
        code: `type Constructor<T = object> = new (...args: never[]) => T;

function create<T>(Ctor: Constructor<T>, ...args: ConstructorParameters<Constructor<T>>): T {
  return new Ctor(...(args as never[]));
}

class Logger { constructor(public level: string) {} }

const logger = create(Logger, 'debug');
console.log(logger.level);

// یا ساده‌تر با InstanceType:
function instantiate<C extends Constructor>(Ctor: C): InstanceType<C> {
  return new Ctor() as InstanceType<C>;
}
class Empty { value = 1 }
console.log(instantiate(Empty).value);`,
      },
      {
        h: 'گام ۳ — `InstanceType` با کلاس‌های abstract',
        p:
          'برای کلاس‌های انتزاعی، `InstanceType` کار می‌کند ولی `new` کردنش نه. اگر کارخانه باید کلاس‌های abstract را هم بپذیرد، از `abstract new` در قید استفاده کن.',
        code: `abstract class Shape { abstract area(): number }
class Circle extends Shape { constructor(private r: number) { super(); } override area() { return Math.PI * this.r ** 2; } }

type ShapeInstance = InstanceType<typeof Circle>; // Circle

abstract class Base {}
type AbstractCtor = abstract new (...args: never[]) => Base;

const shape: ShapeInstance = new Circle(2);
console.log(shape.area().toFixed(2));`,
      },
      {
        h: 'گام ۴ — الگوی Dependency Injection تایپ‌دار',
        p:
          'در DI Containerها، کلید ثبت یک توکن سازنده است و مقدار، نمونه‌ی آن. `InstanceType` این نگاشت را تایپ‌دار می‌کند.',
        code: `class Container {
  private readonly registry = new Map<unknown, () => unknown>();

  register<T extends new (...a: never[]) => unknown>(token: T, factory: () => InstanceType<T>): void {
    this.registry.set(token, factory);
  }

  resolve<T extends new (...a: never[]) => unknown>(token: T): InstanceType<T> {
    const factory = this.registry.get(token);
    if (!factory) throw new Error('ثبت نشده');
    return factory() as InstanceType<T>;
  }
}

class Db { constructor(public url = 'local') {} }

const c = new Container();
c.register(Db, () => new Db('postgres'));
console.log(c.resolve(Db).url);`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'توکن سازنده به‌جای رشته در DI',
        body:
          'در Dependency Injection، کلید را به‌جای `"db"` یک توکن سازنده (`Db`) بگذار و با `InstanceType<T>` تایپ دقیق نمونه را بگیر. این کار غلط املایی در نام سرویس را غیرممکن و IntelliSense را کامل می‌کند.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۶',
        title: 'فرمول «سازنده ↔ نمونه»',
        body:
          'دو تبدیل پایه‌ای که باید ملکه‌ی ذهنت باشد: `typeof C` = سازنده، `InstanceType<typeof C>` = نمونه. هر خطایی که با «typeof» شروع شود، معمولاً با یکی از این دو حل می‌شود.',
        equation: 'InstanceType<typeof C> ≡ C  ·  typeof C ≡ سازنده‌ی C',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`InstanceType<C>` وقتی `C` خودش یک نمونه است',
        body:
          'خطای `Type "C" does not satisfy the constraint "abstract new (...)"` یعنی یک **نمونه** را به `InstanceType` داده‌ای نه یک سازنده. اگر متغیر از `new` آمده، خودش نمونه است؛ `InstanceType` لازم ندارد.',
      },
    ],
    quiz: {
      q: 'اگر `const s = new Service()` داشته باشیم، تایپ `s` معادل کدام است؟',
      options: [
        '`InstanceType<typeof Service>` (یعنی خود `Service`)',
        '`typeof Service`',
        '`ConstructorParameters<typeof Service>`',
        '`ReturnType<typeof Service>`',
      ],
      answer: 0,
      explain:
        '`typeof Service` تایپ سازنده است و `InstanceType` آن را به تایپ نمونه تبدیل می‌کند که دقیقاً همان تایپ `Service` (نمونه) است.',
    },
    lab: {
      task: 'یک کارخانه‌ی Generic بنویس که یک سازنده و آرگومان‌هایش را بگیرد و نمونه‌ی تایپ‌دار برگرداند.',
      starter: `type Ctor<T> = abstract new (...args: never[]) => T;

function make<C extends new (...args: never[]) => unknown>(
  Ctor: C,
  ...args: ConstructorParameters<C>
): InstanceType<C> {
  return new Ctor(...(args as never[])) as InstanceType<C>;
}

class Timer {
  constructor(public readonly label: string, public readonly ms: number) {}
  describe(): string { return \`\${this.label}: \${this.ms}ms\`; }
}

const timer = make(Timer, 'study', 3000);
console.log(timer.describe());`,
      solution: `function make<C extends new (...a: never[]) => unknown>(Ctor: C, ...args: ConstructorParameters<C>): InstanceType<C> {
  return new Ctor(...args) as InstanceType<C>;
}`,
    },
  },

  {
    id: 'util-awaited',
    chapter: 'ch11',
    titleFa: 'Awaited<T>',
    titleEn: 'Awaited',
    level: 'advanced',
    minutes: 25,
    goal: 'تایپ واقعی پس از `await` را استخراج کنی و Promiseهای تودرتو (Thenables) را درست مدیریت کنی.',
    steps: [
      {
        h: 'گام ۱ — تعریف و رفتار بازگشتی',
        p:
          '`Awaited<T>` به‌صورت **بازگشتی** Promiseها را باز می‌کند: `Awaited<Promise<Promise<string>>>` برابر `string` است. این دقیقاً همان کاری است که `await` در زمان اجرا انجام می‌دهد.',
        code: `type A = Awaited<Promise<string>>;              // string
type B = Awaited<Promise<Promise<number>>>;     // number
type C = Awaited<string>;                       // string (بدون تغییر)
type D = Awaited<Promise<boolean> | number>;    // boolean | number (توزیع می‌شود)

const a: A = 'text';
const b: B = 42;
const c: C = 'plain';
const d: D = true;
console.log(a, b, c, d);`,
      },
      {
        h: 'گام ۲ — ترکیب طلایی `Awaited<ReturnType<T>>`',
        p:
          'پرکاربردترین ترکیب در کل TypeScript برای کار با APIهای async: تایپ داده‌ی واقعی که یک تابع async برمی‌گرداند.',
        code: `async function fetchLessons() {
  return [
    { id: '1', title: 'Awaited', minutes: 25 },
    { id: '2', title: 'Infer', minutes: 30 },
  ];
}

type Lessons = Awaited<ReturnType<typeof fetchLessons>>;
type Lesson = Lessons[number];

const lesson: Lesson = { id: '3', title: 'X', minutes: 10 };
console.log(lesson.title, lesson.minutes);`,
      },
      {
        h: 'گام ۳ — Thenables سفارشی هم باز می‌شوند',
        p:
          '`Awaited` فقط `Promise` را نمی‌شناسد؛ هر آبجکتی با متد `then` (Thenable) را باز می‌کند. این برای کتابخانه‌های Promise سفارشی مهم است.',
        code: `type CustomThenable = { then(onFulfilled: (value: number) => void): void };

type Unwrapped = Awaited<CustomThenable>; // number

const v: Unwrapped = 42;
console.log(v);`,
      },
      {
        h: 'گام ۴ — پیاده‌سازی دستی (برای درک عمیق)',
        p:
          'اگر `infer` با `then` را بنویسی، مکانیزم را کامل می‌فهمی. این یک تمرین عالی برای تسلط بر Conditional Types است.',
        code: `type MyAwaited<T> = T extends null | undefined
  ? T
  : T extends { then(onfulfilled: (value: infer U) => unknown): unknown }
    ? MyAwaited<U>
    : T;

type X = MyAwaited<Promise<Promise<string>>>; // string

const x: X = 'works';
console.log(x);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۶۷',
        title: 'فرمول «سه‌گانه‌ی async»',
        body:
          'برای هر تابع async بیرونی، این سه تایپ را مشتق کن: `type Result = Awaited<ReturnType<typeof fn>>`، `type Args = Parameters<typeof fn>` و `type Fn = typeof fn`. با این سه، می‌توانی هر Wrapper، Mock یا تستی را بدون تکرار امضا بنویسی.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تایپ داده‌ی API را یک‌بار مشتق و export کن',
        body:
          'در فایل `api/users.ts` بنویس: `export type UsersResponse = Awaited<ReturnType<typeof fetchUsers>>`. همه‌ی مصرف‌کننده‌ها از این alias استفاده کنند نه از بازنویسی شکل پاسخ.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`Promise<T>` را به‌جای `T` در تایپ‌ها می‌گذاری',
        body:
          'خطای `Property "map" does not exist on type "Promise<...>"` یعنی فراموش کرده‌ای `await` کنی یا تایپ را با `Awaited` باز کنی. در تایپ‌های state (مثل Redux) همیشه نسخه‌ی Awaited را نگه دار، نه Promise را.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: '`Awaited<Promise<Promise<number>>>` چیست؟',
        body:
          'پاسخ: «`number`. چون `Awaited` بازگشتی است و دقیقاً semantics خود `await` را بازتاب می‌دهد: `await` روی یک Promise تودرتو، تا رسیدن به یک مقدار غیر-Promise ادامه می‌دهد.»',
      },
    ],
    quiz: {
      q: 'نتیجه‌ی `Awaited<Promise<string> | number>` چیست؟',
      options: ['`string | number`', '`Promise<string> | number`', '`string`', '`never`'],
      answer: 0,
      explain:
        '`Awaited` یک Conditional Type توزیع‌شده است: روی هر عضو Union اعمال می‌شود. `Promise<string>` به `string` باز می‌شود و `number` دست‌نخورده می‌ماند.',
    },
    lab: {
      task: 'یک تابع async بنویس و سه تایپ `Args`، `Raw` و `Result` را از آن مشتق کن.',
      starter: `async function searchLessons(query: string, limit = 10) {
  return {
    query,
    total: query.length * limit,
    items: [{ id: '1', title: query }],
  };
}

type Args = Parameters<typeof searchLessons>;
type Raw = ReturnType<typeof searchLessons>;
type Result = Awaited<ReturnType<typeof searchLessons>>;
type Item = Result['items'][number];

const item: Item = { id: '2', title: 'test' };
console.log(item.title, typeof Raw);`,
      solution: `type Result = Awaited<ReturnType<typeof searchLessons>>;
type Item = Result['items'][number];`,
    },
  },
];
