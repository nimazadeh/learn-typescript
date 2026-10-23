/* ==========================================================================
   فصل ۷ — توابع  +  فصل ۸ — اینترفیس‌ها
   (TypeScript Functions · Typing Functions · Function Overloading
    · Interfaces · Types vs Interfaces · Extending · Declaration · Hybrid)
   ========================================================================== */

export const PART5_LESSONS = [
  {
    id: 'ts-functions',
    chapter: 'ch7',
    titleFa: 'توابع در TypeScript — نگرش کلی',
    titleEn: 'TypeScript Functions',
    level: 'intermediate',
    minutes: 30,
    goal: 'چهار شکل نوشتن تابع تایپ‌دار را بشناسی و بدانی هرکدام چه تایپی تولید می‌کند.',
    steps: [
      {
        h: 'گام ۱ — چهار شکل معادل',
        p:
          'Function declaration، Function expression، Arrow function و Method. از نظر تایپ تقریباً یکسان‌اند، ولی تفاوت‌های ظریفی در `this`، hoisting و inference دارند.',
        code: `// ۱) declaration (hoisted)
function addDeclaration(a: number, b: number): number { return a + b; }

// ۲) expression
const addExpression = function (a: number, b: number): number { return a + b; };

// ۳) arrow (پیش‌فرض مدرن)
const addArrow = (a: number, b: number): number => a + b;

// ۴) method inside object/class
const calculator = { add(a: number, b: number): number { return a + b; } };

console.log(addDeclaration(1, 2), addExpression(1, 2), addArrow(1, 2), calculator.add(1, 2));`,
      },
      {
        h: 'گام ۲ — تایپ تابع به‌عنوان یک تایپ مستقل',
        p:
          'می‌توانی تایپ یک تابع را جدا تعریف کنی و به متغیرها یا پارامترها بدهی. این کار برای callbackها و Dependency Injection ضروری است.',
        code: `type BinaryOp = (a: number, b: number) => number;

const multiply: BinaryOp = (a, b) => a * b; // پارامترها از زمینه تایپ می‌گیرند
const subtract: BinaryOp = (a, b) => a - b;

function apply(op: BinaryOp, x: number, y: number): number {
  return op(x, y);
}

console.log(apply(multiply, 3, 4), apply(subtract, 10, 3));`,
      },
      {
        h: 'گام ۳ — `this` در TypeScript',
        p:
          'Arrow functionها `this` خودشان را ندارند (از اسکوپ والد می‌گیرند) — برای callbackها این یک مزیت بزرگ است. برای متدهایی که به `this` تایپ‌دار نیاز دارند، TypeScript یک پارامتر کاذب `this` در ابتدای امضا پشتیبانی می‌کند.',
        code: `type Counter = { count: number; increment(this: Counter): number };

const counter: Counter = {
  count: 0,
  increment() {
    this.count += 1;   // ✅ this تایپ Counter دارد
    return this.count;
  },
};

console.log(counter.increment(), counter.increment());`,
      },
      {
        h: 'گام ۴ — توابع خالص به‌عنوان پیش‌فرض',
        p:
          'در TypeScript مدرن، تابع خالص (بدون `this`، بدون وضعیت بیرونی) پیش‌فرض است. کلاس‌ها و متدها فقط وقتی لازم‌اند که واقعاً وضعیت مشترک و کپسوله‌شده ضروری باشد.',
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پیش‌فرض: Arrow Function + تایپ بازگشتی صریح',
        body:
          'برای توابع export شده: `export const name = (a: T): R => ...`. تایپ بازگشتی صریح از تغییر ناخواسته‌ی قرارداد جلوگیری می‌کند و arrow بودن، مشکل `this` را برای همیشه حذف می‌کند.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۷',
        title: 'فرمول «تابع خالص = تست‌پذیری رایگان»',
        body:
          'تابع خالص (ورودی یکسان → خروجی یکسان، بدون side effect) بدون نیاز به mock تست می‌شود. هرچه نسبت توابع خالص در کدبیس بیشتر باشد، هزینه‌ی تست به همان نسبت کمتر است.',
        equation: 'هزینه‌ی تست ∝ ۱ ÷ (درصد توابع خالص در کدبیس)',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'از دست رفتن `this` در callback',
        body:
          '`button.addEventListener("click", obj.handleClick)` متد را از `obj` جدا می‌کند و `this` داخلش `undefined` می‌شود. راه‌حل: arrow function wrapper یا `obj.handleClick.bind(obj)` یا تعریف متد به‌صورت arrow در کلاس.',
      },
    ],
    quiz: {
      q: 'کدام ویژگی توابع arrow در TypeScript/JavaScript درست است؟',
      options: [
        '`this` اختصاصی ندارند و آن را از اسکوپ enclosing می‌گیرند',
        'همیشه hoist می‌شوند',
        'نمی‌توانند تایپ بازگشتی داشته باشند',
        'فقط داخل کلاس قابل استفاده‌اند',
      ],
      answer: 0,
      explain:
        'Arrow functionها `this`، `arguments`، `super` و `new.target` خودشان را ندارند. به همین دلیل برای callbackها امن‌ترین انتخاب‌اند.',
    },
    lab: {
      task: 'یک تایپ تابع `Transformer<T>` بنویس و سه تابع تبدیل با آن تعریف کن.',
      starter: `type Transformer<T> = (input: T) => T;

const trimText: Transformer<string> = (s) => s.trim();
const doubleNumber: Transformer<number> = (n) => n * 2;
const dedupeArray: Transformer<readonly string[]> = (list) => [...new Set(list)];

console.log(trimText('  hello  '));
console.log(doubleNumber(21));
console.log(dedupeArray(['a', 'b', 'a']));`,
      solution: `type Transformer<T> = (input: T) => T;
const trimText: Transformer<string> = (s) => s.trim();`,
    },
  },

  {
    id: 'typing-functions',
    chapter: 'ch7',
    titleFa: 'تایپ‌گذاری دقیق توابع',
    titleEn: 'Typing Functions',
    level: 'intermediate',
    minutes: 45,
    goal: 'پارامترهای اختیاری، پیش‌فرض، Rest، Generic و Union تابعی را مسلط شوی.',
    steps: [
      {
        h: 'گام ۱ — پارامترهای اختیاری و پیش‌فرض',
        p:
          'پارامتر اختیاری با `?` (تایپش `T | undefined` می‌شود) و پارامتر پیش‌فرض با `= value` (که خودکار اختیاری است و تایپ تهی از آن حذف می‌شود). تفاوت ظریف: با پیش‌فرض، داخل تابع تایپ `T` است نه `T | undefined`.',
        code: `function greet(name: string, greeting?: string, punct = '!'): string {
  const prefix = greeting ?? 'سلام';
  return \`\${prefix}, \${name}\${punct}\`;
}

console.log(greet('نیما'));
console.log(greet('سارا', 'درود', '.'));`,
      },
      {
        h: 'گام ۲ — Rest parameters با Tuple دقیق',
        p:
          'برای توابع Variadic، `...args: T[]` ساده است ولی `...args: [string, number]` دقیق‌تر. با Generic می‌توانی امضای دقیقاً منعکس‌کننده‌ی ورودی بسازی.',
        code: `function joinAll(...parts: readonly (string | number)[]): string {
  return parts.join('-');
}

// نسخه‌ی دقیق با Tuple:
function pair<T, U>(first: T, ...rest: [U]): [T, U] {
  return [first, rest[0] as U];
}

console.log(joinAll('a', 1, 'b'));
console.log(pair('x', 42));`,
      },
      {
        h: 'گام ۳ — توابع Generic و استنتاج خودکار',
        p:
          'وقتی تایپ خروجی به تایپ ورودی وابسته است، Generic تنها راه حفظ دقت است. TypeScript معمولاً خودش `T` را استنتاج می‌کند و نیازی به نوشتن صریح نیست.',
        code: `function firstOr<T>(list: readonly T[], fallback: T): T {
  return list.length > 0 ? (list[0] as T) : fallback;
}

function mapPair<A, B, C>(pairValue: readonly [A, B], fn: (a: A, b: B) => C): C {
  return fn(pairValue[0] as A, pairValue[1] as B);
}

console.log(firstOr([1, 2], 0), firstOr([], 'خالی'));
console.log(mapPair([3, 'x'] as const, (n, s) => \`\${s}\${n}\`));`,
      },
      {
        h: 'گام ۴ — آبجکت گزینه‌ها (Options Object Pattern)',
        p:
          'وقتی یک تابع بیش از ۲ پارامتر دارد یا چند پارامتر اختیاری، از یک آبجکت گزینه‌ها استفاده کن. این الگو خوانایی را تضمین و «انفجار پارامتر» را حذف می‌کند.',
        code: `type FetchOptions = {
  readonly method?: 'GET' | 'POST';
  readonly timeoutMs?: number;
  readonly retry?: number;
};

async function fetchData(url: string, options: FetchOptions = {}): Promise<string> {
  const { method = 'GET', timeoutMs = 5000, retry = 0 } = options;
  return \`\${method} \${url} (timeout=\${timeoutMs}, retry=\${retry})\`;
}

const result = await fetchData('/users', { method: 'POST', retry: 2 });
console.log(result);`,
      },
      {
        h: 'گام ۵ — Union و Intersection توابع',
        p:
          'یک متغیر می‌تواند تایپ «یا این تابع یا آن تابع» را داشته باشد. برای فراخوانی باید اول با یک گارد تشخیص دهی کدام است.',
        code: `type StringFn = (value: string) => number;
type NumberFn = (value: number) => string;
type Either = StringFn | NumberFn;

function call(fn: Either, value: string | number): string | number {
  if (typeof value === 'string') return (fn as StringFn)(value);
  return (fn as NumberFn)(value);
}

const len: StringFn = (s) => s.length;
console.log(call(len, 'typescript'));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قانون «حداکثر ۳ پارامتر، بعد Options Object»',
        body:
          'سه پارامتر موقعیتی حد خوانایی است. `createUser(name, email, role, active)` در نقطه‌ی فراخوانی غیرقابل فهم است؛ `createUser({ name, email, role, active })` خودش را توضیح می‌دهد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۸',
        title: 'فرمول «Generic وقتی خروجی به ورودی وابسته است»',
        body:
          'سؤال تشخیصی: «اگر تایپ ورودی عوض شود، آیا تایپ خروجی هم باید عوض شود؟» اگر بله → Generic. اگر نه → تایپ مشخص. این یک سؤال، ۹۰٪ تصمیم‌های Generic را حل می‌کند.',
        equation: 'نیاز به Generic = (وابستگی تایپ خروجی به تایپ ورودی) = true',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'پارامتر اختیاری قبل از اجباری',
        body:
          '`function f(a?: string, b: number)` خطا می‌دهد. پارامترهای اختیاری همیشه باید **بعد از** پارامترهای اجباری بیایند. اگر ترتیب منطقی دیگری لازم داری، Options Object استفاده کن.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'امضا را اول بنویس، بدنه را آخر',
        body:
          'برای هر تابع، اول امضای کامل (نام، پارامترها با تایپ، تایپ بازگشتی) را بنویس و حتی یک `throw new Error("TODO")` بگذار. بعد بدنه را پر کن. این کار «طراحی از طریق تایپ» است و خطاهای طراحی را قبل از نوشتن منطق نشان می‌دهد.',
      },
    ],
    quiz: {
      q: 'در `function f(a: string, b?: number, c = true)` تایپ `b` و `c` داخل بدنه‌ی تابع چیست؟',
      options: [
        '`b: number | undefined` و `c: boolean`',
        '`b: number` و `c: boolean`',
        '`b: number | undefined` و `c: boolean | undefined`',
        '`b: any` و `c: any`',
      ],
      answer: 0,
      explain:
        'پارامتر `?` تایپش `T | undefined` می‌ماند، ولی پارامتر با مقدار پیش‌فرض بعد از `=` هرگز `undefined` نیست (چون جایگزین می‌شود)، پس تایپش `T` خالص است.',
    },
    lab: {
      task: 'تابع `createUser` را با Options Object و Generic بنویس که `id` تولیدی را هم برگرداند.',
      starter: `type NewUser = { readonly name: string; readonly email: string };
type CreateUserOptions = { readonly generateId?: boolean; readonly role?: 'user' | 'admin' };

function createUser<T extends NewUser>(
  input: T,
  options: CreateUserOptions = {}
): T & { readonly id: string; readonly role: string } {
  const { generateId = true, role = 'user' } = options;
  return {
    ...input,
    id: generateId ? \`u_\${Math.abs(input.email.length * 7)}\` : '',
    role,
  };
}

const user = createUser({ name: 'نیما', email: 'nima@example.com' }, { role: 'admin' });
console.log(user.id, user.role, user.name);`,
      solution: `function createUser<T extends NewUser>(input: T, o: CreateUserOptions = {}) {
  return { ...input, id: crypto.randomUUID?.() ?? 'x', role: o.role ?? 'user' };
}`,
    },
  },

  {
    id: 'function-overloading',
    chapter: 'ch7',
    titleFa: 'Function Overloading',
    titleEn: 'Function Overloading',
    level: 'advanced',
    minutes: 40,
    goal: 'کی از overload واقعی استفاده کنی، کی Union و Generic بهتر است، و چطور overloadها را مرتب و Exhaustive بنویسی.',
    steps: [
      {
        h: 'گام ۱ — ساختار overload: امضاها + یک پیاده‌سازی',
        p:
          'چند «امضای overload» (بدون بدنه) نوشته می‌شود، سپس **یک** پیاده‌سازی با تایپ‌های کلی. فراخوان فقط امضاها را می‌بیند، نه پیاده‌سازی را.',
        code: `function format(value: string): string;
function format(value: number, decimals: number): string;
function format(value: string | number, decimals = 2): string {
  return typeof value === 'string' ? value.trim() : value.toFixed(decimals);
}

console.log(format('  hello  '));
console.log(format(3.14159, 3));`,
      },
      {
        h: 'گام ۲ — قاعده‌ی ترتیب: از خاص به عام',
        p:
          'TypeScript اولین امضای منطبق را انتخاب می‌کند. پس امضاهای **خاص‌تر** باید اول بیایند. اگر امضای عام اول باشد، بقیه هرگز انتخاب نمی‌شوند.',
        code: `function parse(input: 'json', text: string): unknown;   // خاص‌تر اول
function parse(input: 'csv', text: string): string[][];
function parse(input: string, text: string): unknown;      // عام‌تر آخر
function parse(input: string, text: string): unknown {
  if (input === 'csv') return text.split('\\n').map((line) => line.split(','));
  return JSON.parse(text);
}

const rows = parse('csv', 'a,b\\n1,2');
console.log(rows.length);`,
      },
      {
        h: 'گام ۳ — چه زمانی overload **نباید** استفاده کرد',
        p:
          'اگر خروجی فقط به تایپ ورودی وابسته است، Generic ساده‌تر و امن‌تر است. overload فقط وقتی لازم است که **شکل امضا** واقعاً متفاوت باشد (تعداد پارامتر، یا نگاشت غیرقابل بیان با Generic).',
        code: `// ❌ overload غیرضروری:
// function id(x: string): string; function id(x: number): number; ...

// ✅ Generic همان کار را با یک خط می‌کند:
function id<T>(value: T): T { return value; }

// ✅ Generic با نگاشت شرطی (حتی قوی‌تر از overload):
type Unwrap<T> = T extends Promise<infer U> ? U : T;
function unwrap<T>(v: T): Unwrap<T> { return v as Unwrap<T>; }

console.log(id('text'), id(42), unwrap(5));`,
      },
      {
        h: 'گام ۴ — Overload در آبجکت و interface',
        p:
          'می‌توانی چند امضای فراخوانی در یک interface یا object type داشته باشی. این پایه‌ی تایپ‌های کتابخانه‌های بزرگ مثل `Array` و `JSON` است.',
        code: `interface StringConverter {
  (input: string): string;
  (input: number): string;
  (input: readonly string[]): string;
}

const convert: StringConverter = (input: unknown): string => {
  if (Array.isArray(input)) return input.join(',');
  return String(input);
};

console.log(convert('a'), convert(1), convert(['x', 'y']));`,
      },
      {
        h: 'گام ۵ — دیباگ overload: چرا فراخوانیم منطبق نشد؟',
        p:
          'وقتی خطای `No overload matches this call` می‌گیری، TypeScript معمولاً می‌گوید **کدام** overload نزدیک‌تر بود و چرا رد شد. پیام را کامل بخوان: معمولاً مشکل در آرگومان آخر یا در تعداد پارامترهاست.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۳۹',
        title: 'فرمول «اول Generic، بعد Union، آخر Overload»',
        body:
          'ترتیب تصمیم برای توابع چندشکلی: ۱) آیا یک Generic ساده کار را حل می‌کند؟ ۲) آیا یک Union با Narrowing کافی است؟ ۳) فقط اگر هیچ‌کدام نشد، overload. overload پرخرج‌ترین گزینه است (خوانایی کم، تست بیشتر، نگهداری سخت‌تر).',
        equation: 'پیچیدگی امضا: Generic < Union < Overload — همیشه کم‌پیچیده‌ترین گزینه‌ی ممکن را انتخاب کن',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'حداکثر ۳ امضای overload',
        body:
          'بیش از سه امضا یعنی طراحی تابع اشتباه است. به‌جایش از Options Object یا دو تابع با نام‌های متفاوت (`parseJson`، `parseCsv`) استفاده کن. نام‌های متفاوت همیشه خواناتر از overloadهای زیادند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'پیاده‌سازی با امضاها چک نمی‌شود',
        body:
          'بدنه‌ی پیاده‌سازی فقط باید با **تایپ کلی خودش** سازگار باشد؛ TypeScript بررسی نمی‌کند که بدنه واقعاً برای هر امضا درست کار می‌کند. مثلاً اگر امضا بگوید `string` برمی‌گرداند ولی بدنه در یک شاخه `undefined` بدهد، هیچ خطایی نمی‌گیری.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت overload با Union type در پارامتر',
        body:
          'پاسخ: «`(x: string | number) => string` یک امضا دارد و ورودی می‌تواند هر کدام باشد؛ overload چند امضای مستقل دارد و می‌تواند **تعداد و ترتیب پارامترها** را در هر حالت متفاوت کند و تایپ بازگشتی را به شکل ورودی گره بزند.»',
      },
    ],
    quiz: {
      q: 'در یک تابع با چند امضای overload، کدام امضا برای یک فراخوانی انتخاب می‌شود؟',
      options: [
        'اولین امضایی که از بالا با آرگومان‌ها منطبق شود',
        'آخرین امضای نوشته‌شده',
        'پیاده‌سازی نهایی (implementation signature)',
        'امضایی با بیشترین تعداد پارامتر',
      ],
      answer: 0,
      explain:
        'TypeScript امضاها را به ترتیب نوشتن بررسی می‌کند و اولین انطباق را انتخاب می‌کند. به همین دلیل ترتیب «خاص به عام» حیاتی است.',
    },
    lab: {
      task: 'تابع `toArray` با دو overload بنویس: ورودی رشته → آرایه‌ی کاراکترها، ورودی عدد → آرایه‌ی به طول آن عدد.',
      starter: `function toArray(input: string): string[];
function toArray(input: number): number[];
function toArray(input: string | number): string[] | number[] {
  if (typeof input === 'string') return Array.from(input);
  return Array.from({ length: input }, (_, i) => i + 1);
}

console.log(toArray('abc').join('|'));
console.log(toArray(3).join(','));`,
      solution: `function toArray(input: string): string[];
function toArray(input: number): number[];
function toArray(input: string | number) {
  return typeof input === 'string' ? [...input] : Array.from({ length: input }, (_, i) => i + 1);
}`,
    },
  },

  {
    id: 'ts-interfaces',
    chapter: 'ch8',
    titleFa: 'اینترفیس‌ها — نگرش کلی',
    titleEn: 'TypeScript Interfaces',
    level: 'intermediate',
    minutes: 30,
    goal: 'نقش اینترفیس در معماری TypeScript را بفهمی و بدانی کی اینترفیس و کی type alias انتخاب کنی.',
    steps: [
      {
        h: 'گام ۱ — اینترفیس = قرارداد عمومی (Public Contract)',
        p:
          'اینترفیس‌ها بهترین ابزار برای توصیف **API عمومی** هستند: شکل داده‌ای که بین ماژول‌ها رد و بدل می‌شود. دو ویژگی منحصربه‌فرد دارند: Declaration Merging و `implements` در کلاس.',
        code: `export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  deleteById(id: string): Promise<boolean>;
}

type Lesson = { readonly id: string; readonly title: string };

const memoryRepo: Repository<Lesson> = {
  async findById(id) { return id === '1' ? { id, title: 'اینترفیس' } : null; },
  async save(entity) { return entity; },
  async deleteById() { return true; },
};

const found = await memoryRepo.findById('1');
console.log(found?.title);`,
      },
      {
        h: 'گام ۲ — Declaration Merging (ویژگی منحصربه‌فرد)',
        p:
          'دو `interface` با نام یکسان در یک اسکوپ، **به‌صورت خودکار ادغام** می‌شوند. این برای گسترش تایپ‌های کتابخانه‌ها (مثل `Window` یا `Express.Request`) ضروری است — و با `type` ممکن نیست.',
        code: `interface Config { readonly host: string }
interface Config { readonly port: number }
// ادغام شد → { readonly host: string; readonly port: number }

const config: Config = { host: 'localhost', port: 3000 };
console.log(config.host, config.port);`,
      },
      {
        h: 'گام ۳ — `implements` در برابر تایپ متغیر',
        p:
          '`class X implements Y` یک **تعهد** است: کلاس باید قرارداد را ارضا کند. ولی توجه کن که `implements` تایپ `this` را باریک نمی‌کند و ساختاری است نه اسمی.',
        code: `interface Serializable { serialize(): string }

class Settings implements Serializable {
  constructor(private theme: string) {}
  serialize(): string { return JSON.stringify({ theme: this.theme }); }
}

const s = new Settings('dark');
console.log(s.serialize());`,
      },
      {
        h: 'گام ۴ — قواعد انتخاب: interface یا type؟',
        p:
          'قاعده‌ی عملی تیم‌های بزرگ: **برای شکل آبجکت‌های عمومی و کلاس‌ها `interface`**، برای Union، Tuple، Generic پیچیده، Mapped/Conditional و هر چیز غیرآبجکتی `type`. مهم‌تر از انتخاب، **یکدستی** در کل کدبیس است.',
      },
    ],
    visual: 'interface-architecture',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۰',
        title: 'فرمول «وابستگی به قرارداد، نه پیاده‌سازی»',
        body:
          'این اصل SOLID (Dependency Inversion) در TypeScript با interface محقق می‌شود: مصرف‌کننده به `Repository<T>` وابسته باشد نه به `PostgresRepository`. این کار تعویض پیاده‌سازی (و تست با mock) را رایگان می‌کند.',
        equation: 'انعطاف معماری = (تعداد مصرف‌کننده‌هایی که به interface وابسته‌اند) ÷ (کل مصرف‌کننده‌ها)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'اینترفیس کوچک و متمرکز (ISP)',
        body:
          'به‌جای یک `interface God { ...۳۰ فیلد }` چند اینترفیس کوچک بساز: `Identifiable`، `Timestamped`، `Searchable`. مصرف‌کننده فقط آن را که لازم دارد می‌گیرد. این اصل Interface Segregation است.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی Declaration Merging',
        title: 'ادغام ناخواسته‌ی اینترفیس‌ها',
        body:
          'اگر دو فایل در یک اسکوپ سراسری اینترفیسی با نام یکسان تعریف کنند، بی‌صدا ادغام می‌شوند و فیلدهای عجیب ظاهر می‌شوند. در پروژه‌های مدرن همیشه از ماژول (import/export) استفاده کن تا اسکوپ سراسری آلوده نشود.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'دو تفاوت کلیدی interface و type',
        body:
          'پاسخ: «۱) interface از Declaration Merging پشتیبانی می‌کند ولی type نه. ۲) type می‌تواند Union، Tuple، Primitive alias و Mapped/Conditional Types باشد ولی interface فقط شکل آبجکت. در عوض `extends` در interface خطای تداخل را صریح می‌دهد.»',
      },
    ],
    quiz: {
      q: 'کدام ویژگی فقط در `interface` وجود دارد و در `type` نه؟',
      options: [
        'Declaration Merging (ادغام خودکار تعریف‌های هم‌نام)',
        'پشتیبانی از Union types',
        'پشتیبانی از Tuple',
        'پشتیبانی از Generic',
      ],
      answer: 0,
      explain:
        'دو `interface` هم‌نام در یک اسکوپ به‌صورت خودکار ادغام می‌شوند. `type` هم‌نام یک خطای «Duplicate identifier» می‌دهد. Union و Tuple هم فقط با `type` ممکن‌اند، پس جهت برعکس است.',
    },
    lab: {
      task: 'یک `Repository<T>` عمومی با سه متد async بنویس و یک پیاده‌سازی حافظه‌ای برایش بساز.',
      starter: `type Entity = { readonly id: string };

interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
}

class InMemoryRepo<T extends Entity> implements Repository<T> {
  private readonly store = new Map<string, T>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async findAll() { return [...this.store.values()]; }
  async save(entity: T) { this.store.set(entity.id, entity); return entity; }
}

const repo = new InMemoryRepo<{ id: string; name: string }>();
await repo.save({ id: '1', name: 'نیما' });
console.log((await repo.findAll()).length);`,
      solution: `class InMemoryRepo<T extends Entity> implements Repository<T> { ... }`,
    },
  },

  {
    id: 'types-vs-interfaces',
    chapter: 'ch8',
    titleFa: 'Types در برابر Interfaces',
    titleEn: 'Types vs Interfaces',
    level: 'intermediate',
    minutes: 30,
    goal: 'جدول تصمیم کامل بین `type` و `interface` را داشته باشی و بتوانی انتخابت را در Code Review دفاع کنی.',
    steps: [
      {
        h: 'گام ۱ — جدول مقایسه‌ی کامل',
        p:
          'هفت محور مقایسه: قابلیت‌های تایپی، Declaration Merging، پیام خطا، عملکرد کامپایلر، `extends`/`&`، سرعت دیباگ و سازگاری با ابزارها.',
        code: `// با type می‌شود، با interface نه:
type Status = 'a' | 'b';                    // Union
type Pair = [string, number];               // Tuple
type Id = string;                           // Primitive alias
type Fn = (x: number) => string;            // تابع
type Mapped<T> = { [K in keyof T]: T[K] };  // Mapped
type Deep<T> = T extends string ? 1 : 2;    // Conditional

// با interface می‌شود، با type نه:
interface Mergeable { a: string }
interface Mergeable { b: number }           // Declaration Merging

const m: Mergeable = { a: 'x', b: 1 };
console.log(m.a, m.b);`,
      },
      {
        h: 'گام ۲ — تفاوت در پیام خطا و تجربه‌ی توسعه',
        p:
          'اینترفیس‌ها در پیام‌های خطا با **نام خودشان** ظاهر می‌شوند (`User`) که خواناتر است؛ type aliasهای بزرگ گاهی به شکل ساختار باز شده چاپ می‌شوند و پیام خطا را طولانی می‌کنند.',
      },
      {
        h: 'گام ۳ — تفاوت `extends` و `&` در برخورد با تداخل',
        p:
          '`interface A extends B` اگر فیلد ناسازگار داشته باشد **خطای روشن** می‌دهد. `type A = B & C` تداخل را بی‌صدا به `never` تبدیل می‌کند. این یک دلیل واقعی برای ترجیح `extends` در سلسله‌مراتب اینترفیس است.',
        code: `interface Base { readonly value: string }

// ❌ خطای روشن: Interface 'Bad' incorrectly extends 'Base'
// interface Bad extends Base { readonly value: number }

type BaseT = { readonly value: string };
type Silent = BaseT & { readonly value: number }; // ⚠️ value: never — بی‌صدا

const s: Silent = { value: undefined as never };
console.log(typeof s.value);`,
      },
      {
        h: 'گام ۴ — قاعده‌ی نهایی و یکدستی',
        p:
          'پیشنهاد عملی: **پیش‌فرض `type`** برای همه‌چیز (چون عمومی‌تر است)، و `interface` فقط وقتی Declaration Merging لازم داری یا یک سلسله‌مراتب `extends` واقعی می‌سازی. مهم‌ترین نکته: هر قاعده‌ای انتخاب کردی، در کل کدبیس یکدست باش.',
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'یک قاعده، یک کدبیس',
        body:
          'بدترین حالت، مخلوطی بی‌قاعده از `type` و `interface` است. قاعده‌ات را در CONTRIBUTING بنویس و با ESLint (`@typescript-eslint/consistent-type-definitions`) اجبار کن.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۱',
        title: 'فرمول «عمومی‌ترین ابزار را پیش‌فرض کن»',
        body:
          '`type` می‌تواند هر چیزی را بیان کند که `interface` می‌تواند، به‌علاوه‌ی Union/Tuple/Mapped/Conditional. پس به‌عنوان پیش‌فرض، `type` انتخاب کم‌ریسک‌تری است؛ فقط وقتی یک ویژگی انحصاری `interface` لازم شد، سوییچ کن.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'کدام را انتخاب می‌کنی و چرا؟',
        body:
          'پاسخ حرفه‌ای: «بستگی به نیاز دارم: برای Union، Tuple و تایپ‌های مشتق‌شده `type` تنها گزینه است. برای API عمومی که ممکن است توسط مصرف‌کننده گسترش یابد (Declaration Merging) و سلسله‌مراتب `extends` با خطای روشن، `interface`. در یک کدبیس، یکدستی مهم‌تر از انتخاب است.»',
      },
    ],
    quiz: {
      q: 'کدام قابلیت با `type` ممکن است و با `interface` نه؟',
      options: [
        'تعریف یک Union از لیترال‌ها',
        'تعریف فیلد readonly',
        'تعریف متد',
        'ارث‌بری از چند قرارداد',
      ],
      answer: 0,
      explain:
        '`interface` فقط شکل آبجکت (و callable/constructable) را توصیف می‌کند. Union، Tuple، Primitive alias و Mapped/Conditional Types فقط با `type` ممکن‌اند.',
    },
    lab: {
      task: 'برای هر پنج سناریوی زیر، `type` یا `interface` مناسب را بنویس و دلیل انتخابت را در کامنت بگذار.',
      starter: `// ۱) وضعیت یک درخواست (Union) → فقط type ممکن است
type RequestState = 'idle' | 'loading' | 'done' | 'error';

// ۲) قرارداد عمومی یک سرویس که مصرف‌کننده ممکن است گسترش دهد → interface
interface Logger { log(message: string): void }

// ۳) جفت کلید/مقدار (Tuple) → فقط type
type Entry = [key: string, value: unknown];

// ۴) شکل یک کاربر با readonly → هر دو ممکن، type ساده‌تر
type User = { readonly id: string; readonly name: string };

// ۵) تایپ مشتق‌شده (Mapped) → فقط type
type ReadonlyUser = { readonly [K in keyof User]: User[K] };

const u: ReadonlyUser = { id: '1', name: 'نیما' };
console.log(u.id);`,
      solution: `// قاعده: Union/Tuple/Mapped → type | API عمومی قابل گسترش → interface`,
    },
  },

  {
    id: 'extending-interfaces',
    chapter: 'ch8',
    titleFa: 'گسترش اینترفیس‌ها',
    titleEn: 'Extending Interfaces',
    level: 'intermediate',
    minutes: 30,
    goal: 'ارث‌بری اینترفیس‌ها (تکی و چندگانه) و تفاوت آن با `extends` در type و کلاس را مسلط شوی.',
    steps: [
      {
        h: 'گام ۱ — `extends` روی یک یا چند اینترفیس',
        p:
          'یک اینترفیس می‌تواند از چند اینترفیس دیگر ارث ببرد؛ همه‌ی اعضا ادغام می‌شوند. اگر تداخل ناسازگار باشد، کامپایلر **صریحاً خطا می‌دهد** (مزیت بزرگ نسبت به `&`).',
        code: `interface Identifiable { readonly id: string }
interface Timestamped { readonly createdAt: Date }
interface Auditable extends Identifiable, Timestamped {
  readonly createdBy: string;
}

const record: Auditable = {
  id: 'r1', createdAt: new Date(0), createdBy: 'nima',
};
console.log(record.id, record.createdBy);`,
      },
      {
        h: 'گام ۲ — باریک‌سازی (Specialization) — الگوی واقعی',
        p:
          'الگوی قدرتمند: یک اینترفیس عمومی + اینترفیس‌های تخصصی. این کار هم DRY است و هم به مصرف‌کننده اجازه می‌دهد به کمترین قرارداد ممکن وابسته شود.',
        code: `interface Resource { readonly id: string; readonly url: string }

interface ImageResource extends Resource {
  readonly width: number;
  readonly height: number;
}

interface VideoResource extends Resource {
  readonly durationMs: number;
}

function describe(r: Resource): string { return \`\${r.id} → \${r.url}\`; }

const img: ImageResource = { id: 'i1', url: '/a.png', width: 100, height: 50 };
const vid: VideoResource = { id: 'v1', url: '/b.mp4', durationMs: 9000 };

console.log(describe(img));   // ✅ ImageResource زیرمجموعه‌ی Resource است
console.log(describe(vid));`,
      },
      {
        h: 'گام ۳ — `extends` در برابر Intersection (`&`)',
        p:
          'هر دو ترکیب می‌کنند، ولی `extends` فقط برای اینترفیس/کلاس است و تداخل را صریح خطا می‌دهد؛ `&` برای هر تایپی کار می‌کند ولی تداخل را بی‌صدا `never` می‌کند. برای سلسله‌مراتب عمومی، `extends` امن‌تر است.',
        code: `interface A { readonly a: string }
type B = { readonly b: number };

// extends روی type alias کار نمی‌کند، ولی روی interface کار می‌کند:
interface Combined extends A { readonly b: number }
type Combined2 = A & B;

const c1: Combined = { a: 'x', b: 1 };
const c2: Combined2 = { a: 'x', b: 1 };
console.log(c1.a, c2.b);`,
      },
      {
        h: 'گام ۴ — محدود کردن عمق وراثت',
        p:
          'بیش از دو سطح `extends` زنگ خطر طراحی است. اگر سلسله‌مراتب عمیق شد، به‌جایش **ترکیب** (Intersection یا فیلدهای جدا) را در نظر بگیر.',
        code: `// ⚠️ سطح ۳ — معمولاً نشانه‌ی طراحی اشتباه:
interface L1 { readonly a: string }
interface L2 extends L1 { readonly b: string }
interface L3 extends L2 { readonly c: string }

// ✅ جایگزین ترکیبی (سطح همیشه ۱):
type Core = { readonly a: string };
type WithB = Core & { readonly b: string };
type WithC = Core & { readonly b: string; readonly c: string };

const deep: L3 = { a: '1', b: '2', c: '3' };
const flat: WithC = { a: '1', b: '2', c: '3' };
console.log(deep.c, flat.c);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۲',
        title: 'فرمول «عمق وراثت ≤ ۲»',
        body:
          'هر سطح اضافه از وراثت، هزینه‌ی شناختی را **ضربی** می‌کند نه جمعیتی: خواننده باید n فایل را باز کند تا بفهمد یک فیلد از کجا می‌آید. در عمل، عمق بیشتر از ۲ یعنی باید به ترکیب فکر کنی.',
        equation: 'هزینه‌ی شناختی ≈ 2^(عمق وراثت) — هدف: عمق ≤ ۲ یا ترکیب تخت',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'اینترفیس پایه را «قابلیت» بنام نه «موجودیت»',
        body:
          '`Identifiable`، `Timestamped`، `Paginated` نام‌های خوبی‌اند چون یک قابلیت را توصیف می‌کنند و در ده‌ها جای مختلف قابل استفاده‌اند. `BaseEntity` نام مبهمی است که معمولاً به یک اینترفیس بزرگ و بی‌ربط تبدیل می‌شود.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: '`implements` تایپ `this` را باریک نمی‌کند',
        body:
          'اگر کلاس `implements Resource` کند و سپس `resource: Resource` بگیری، نمی‌توانی `width` را ببینی. برای دسترسی به فیلدهای تخصصی باید Narrowing یا Generic استفاده کنی.',
      },
    ],
    quiz: {
      q: 'کدام گزینه درباره‌ی `interface A extends B` درست است؟',
      options: [
        'اگر فیلد هم‌نام با تایپ ناسازگار داشته باشند، کامپایلر خطای روشن می‌دهد',
        'تداخل فیلدها بی‌صدا به `never` تبدیل می‌شود',
        'فقط می‌تواند از یک اینترفیس ارث ببرد',
        'باعث می‌شود `A` دیگر ساختاری نباشد',
      ],
      answer: 0,
      explain:
        'برخلاف `&` که تداخل را به `never` کاهش می‌دهد، `extends` ناسازگاری را با پیام «incorrectly extends» گزارش می‌کند — یکی از مزایای مهم اینترفیس برای سلسله‌مراتب‌های عمومی.',
    },
    lab: {
      task: 'یک اینترفیس پایه‌ی `Identifiable` و دو اینترفیس تخصصی برای «درس» و «چالش» بساز که هر دو از آن ارث ببرند.',
      starter: `interface Identifiable { readonly id: string }
interface Timestamped { readonly updatedAt: Date }

interface Lesson extends Identifiable, Timestamped {
  readonly title: string;
  readonly minutes: number;
}

interface Challenge extends Identifiable, Timestamped {
  readonly prompt: string;
  readonly difficulty: 'easy' | 'hard';
}

function summary(item: Identifiable & Timestamped): string {
  return \`\${item.id} @ \${item.updatedAt.toISOString().slice(0, 10)}\`;
}

const lesson: Lesson = { id: 'l1', title: 'Extending', minutes: 30, updatedAt: new Date(0) };
const challenge: Challenge = { id: 'c1', prompt: '...', difficulty: 'easy', updatedAt: new Date(0) };

console.log(summary(lesson));
console.log(summary(challenge));`,
      solution: `interface Lesson extends Identifiable, Timestamped { readonly title: string; readonly minutes: number }`,
    },
  },

  {
    id: 'interface-declaration',
    chapter: 'ch8',
    titleFa: 'اعلان اینترفیس و Declaration Merging',
    titleEn: 'Interface Declaration',
    level: 'advanced',
    minutes: 35,
    goal: 'مکانیزم Declaration Merging را بفهمی و بتوانی تایپ‌های سراسری (مثل `Window` و `Express.Request`) را امن گسترش دهی.',
    steps: [
      {
        h: 'گام ۱ — قانون ادغام: چه چیزی ادغام می‌شود؟',
        p:
          'دو `interface` هم‌نام در یک اسکوپ ادغام می‌شوند: اعضا جمع می‌شوند. اگر عضو هم‌نام با تایپ **یکسان** باشد مشکلی نیست؛ اگر ناسازگار باشد خطا می‌دهد. ترتیب تعریف مهم نیست (مگر برای overloadها).',
        code: `interface Widget { readonly id: string; render(): void }
interface Widget { readonly label: string }
interface Widget { render(): void } // عضو یکسان — مجاز

const w: Widget = { id: 'w1', label: 'دکمه', render: () => console.log('rendered') };
w.render();
console.log(w.label);`,
      },
      {
        h: 'گام ۲ — گسترش تایپ‌های سراسری (Global Augmentation)',
        p:
          'کاربرد اصلی merging: افزودن فیلدهای سفارشی به تایپ‌های موجود. در یک فایل `.d.ts` با `declare global` بلوک، اینترفیس‌های سراسری را گسترش بده.',
        code: `// types/global.d.ts
declare global {
  interface Window {
    readonly __APP_VERSION__: string;
  }
  interface Array<T> {
    // فقط اعلان — پیاده‌سازی در runtime لازم است
    readonly isEmpty: boolean;
  }
}

export {};

console.log(typeof window !== 'undefined' ? 'has window' : 'no window');`,
      },
      {
        h: 'گام ۳ — Module Augmentation برای پکیج‌ها',
        p:
          'برای گسترش تایپ‌های یک پکیج خارجی (مثل افزودن `user` به `Express.Request`) از `declare module "express"` استفاده کن. این باید داخل یک **ماژول** (فایلی با import/export) باشد.',
        code: `// types/express.d.ts
declare module 'http' {
  interface IncomingMessage {
    readonly requestId?: string;
  }
}

export {};

// مصرف:
declare const req: import('http').IncomingMessage;
console.log(req.requestId ?? 'no-id');`,
      },
      {
        h: 'گام ۴ — قواعد و محدودیت‌های merging',
        p:
          '۱) `type` ادغام نمی‌شود (Duplicate identifier). ۲) فیلدهای غیرتابعی ناسازگار → خطا. ۳) متدها به overload تبدیل می‌شوند (آخرین تعریف بالاترین اولویت). ۴) برای کارکردن `declare global`، فایل باید یک ماژول باشد (`export {}`).',
        code: `interface Overloaded { (x: string): number }
interface Overloaded { (x: number): string }
// ادغام شد → دو امضای overload

const fn: Overloaded = ((x: unknown) => (typeof x === 'string' ? x.length : String(x))) as Overloaded;
console.log(fn('abcd'), fn(12));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'گسترش‌های سراسری را در `types/` متمرکز کن',
        body:
          'همه‌ی `declare global` و module augmentationها را در یک پوشه‌ی `types/` بگذار و در `tsconfig.include` اضافه کن. پراکندن آن‌ها در فایل‌های مختلف، پیدا کردن «این فیلد از کجا آمد؟» را غیرممکن می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی بسیار رایج',
        title: 'فراموش‌کردن `export {}` در فایل `declare global`',
        body:
          'اگر فایل `.d.ts` هیچ import/export نداشته باشد، یک **اسکریپت سراسری** محسوب می‌شود و `declare global` داخلش خطا می‌دهد یا اثر نمی‌کند. همیشه یک `export {};` در انتها بگذار.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۳',
        title: 'فرمول «اعلان ≠ پیاده‌سازی»',
        body:
          'Augmentation فقط به کامپایلر می‌گوید «این فیلد وجود دارد»؛ هیچ کدی اضافه نمی‌کند. اگر واقعاً آن فیلد در زمان اجرا پر نشود، خطای زمان اجرا می‌گیری. همیشه اعلان را با کد واقعی که آن مقدار را ست می‌کند **جفت** کن.',
        equation: 'صحت Augmentation = (اعلان تایپ) ∧ (کد زمان اجرای متناظر) — هر دو لازم‌اند',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Declaration Merging چیست و یک کاربرد واقعی؟',
        body:
          'پاسخ: «ادغام خودکار چند تعریف هم‌نام از یک interface در یک اسکوپ. کاربرد واقعی: افزودن `user` به `Express.Request` بعد از middleware احراز هویت، یا افزودن متغیرهای محیطی سفارشی به `ProcessEnv`.»',
      },
    ],
    quiz: {
      q: 'چرا برای کار کردن `declare global` در یک فایل `.d.ts` به `export {}` نیاز داریم؟',
      options: [
        'تا فایل یک ماژول محسوب شود؛ در غیر این صورت یک اسکریپت سراسری است و `declare global` بی‌اثر/خطا می‌شود',
        'چون TypeScript به یک export برای کامپایل نیاز دارد',
        'تا فایل فشرده نشود',
        'برای فعال‌شدن `strict`',
      ],
      answer: 0,
      explain:
        'در TypeScript، فایلی که هیچ import/export سطح بالا ندارد یک Script است نه Module. `declare global` فقط داخل یک ماژول معنا دارد، و `export {};` ساده‌ترین راه ماژول کردن فایل است.',
    },
    lab: {
      task: 'یک اینترفیس `Env` برای متغیرهای محیطی تعریف کن و با merging فیلدهای دو تیم مختلف را اضافه کن.',
      starter: `interface Env { readonly NODE_ENV: 'development' | 'production' }
interface Env { readonly API_URL: string }
interface Env { readonly FEATURE_STUDIO: boolean }

const env: Env = {
  NODE_ENV: 'development',
  API_URL: 'https://api.local',
  FEATURE_STUDIO: true,
};

console.log(env.NODE_ENV, env.API_URL, env.FEATURE_STUDIO);`,
      solution: `interface Env { readonly NODE_ENV: 'development' | 'production' }
interface Env { readonly API_URL: string } // ادغام خودکار`,
    },
  },

  {
    id: 'hybrid-types',
    chapter: 'ch8',
    titleFa: 'تایپ‌های هیبریدی (Hybrid Types)',
    titleEn: 'Hybrid Types',
    level: 'advanced',
    minutes: 30,
    goal: 'تایپ‌هایی بسازی که هم‌زمان تابع/سازنده و آبجکت‌اند — الگویی که کتابخانه‌های بزرگ مثل jQuery و Express از آن استفاده می‌کنند.',
    steps: [
      {
        h: 'گام ۱ — چرا تایپ هیبریدی لازم است؟',
        p:
          'در JavaScript یک تابع یک آبجکت است و می‌تواند پراپرتی داشته باشد. کتابخانه‌های قدیمی (`$`، `express()`) هم callable هستند و هم تنظیمات دارند. برای تایپ‌گذاری این‌ها به Hybrid Type نیاز داری.',
        code: `interface Counter {
  (start: number): number;      // امضای فراخوانی
  readonly interval: number;    // پراپرتی
  reset(): void;                // متد
}

function createCounter(): Counter {
  const fn = ((start: number) => start * fn.interval) as Counter;
  Object.defineProperty(fn, 'interval', { value: 10 });
  fn.reset = () => console.log('reset');
  return fn;
}

const counter = createCounter();
console.log(counter(5), counter.interval);
counter.reset();`,
      },
      {
        h: 'گام ۲ — الگوی مدرن با Intersection',
        p:
          'امروز تمیزترین راه، ترکیب یک تایپ تابع با یک object type از طریق `&` و ساخت مقدار با `Object.assign` است.',
        code: `type Greeter = ((name: string) => string) & {
  readonly defaultGreeting: string;
  setGreeting(greeting: string): void;
};

function createGreeter(): Greeter {
  let greeting = 'سلام';
  const fn = (name: string) => \`\${greeting}, \${name}\`;
  return Object.assign(fn, {
    defaultGreeting: 'سلام',
    setGreeting: (next: string) => { greeting = next; },
  });
}

const greeter = createGreeter();
console.log(greeter('نیما'));
greeter.setGreeting('درود');
console.log(greeter('نیما'), greeter.defaultGreeting);`,
      },
      {
        h: 'گام ۳ — Hybrid با سازنده (Construct Signature)',
        p:
          'اگر مقدار باید هم `new` شود هم پراپرتی داشته باشد، یک Construct Signature اضافه کن. این الگو در DI Containerها و کلاس‌های کارخانه‌ای رایج است.',
        code: `interface Widget { readonly name: string; render(): string }

interface WidgetFactory {
  new (name: string): Widget;      // امضای سازنده
  readonly version: string;        // پراپرتی استاتیک
  create(name: string): Widget;    // متد کارخانه
}

class WidgetImpl implements Widget {
  constructor(public readonly name: string) {}
  render() { return \`<\${this.name}>\`; }
}

const Factory = Object.assign(WidgetImpl, {
  version: '2.0',
  create: (name: string): Widget => new WidgetImpl(name),
}) as unknown as WidgetFactory;

console.log(new Factory('div').render(), Factory.version, Factory.create('span').render());`,
      },
      {
        h: 'گام ۴ — کی هیبریدی **نباید** ساخت؟',
        p:
          'برای کد جدید خودت، تقریباً هیچ‌وقت. تایپ هیبریدی خوانایی را کم و تست را سخت می‌کند. فقط وقتی لازم است که با یک API موجود (معمولاً قدیمی) تعامل داری. در کد خودت از یک تابع + یک آبجکت تنظیمات جدا استفاده کن.',
      },
    ],
    margins: [
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'فرمول «ابتدا تابع، سپس پراپرتی»',
        body:
          'یک تایپ ترکیبی را این‌طور بنویس: اول امضای فراخوانی (Call Signature)، بعد پراپرتی‌ها. این همان الگویی است که کتابخانه‌های واقعی (مثل jQuery و counterها) استفاده می‌کنند؛ و یادت باشد در JavaScript توابع هم آبجکت‌اند، پس این الگو کاملاً طبیعی است.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'تفکیک «فراخوانی» از «پیکربندی»',
        body:
          'به‌جای یک تابع هیبریدی با ۱۰ پراپرتی، یک تابع اصلی و یک آبجکت تنظیمات جدا export کن: `export function createX()` + `export const defaults`. این کار هم tree-shaking بهتری دارد هم فهم کد را ساده می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'ساخت مقدار هیبریدی نیاز به `Object.assign` یا `defineProperty` دارد',
        body:
          'نمی‌توانی یک تابع را با object literal مخلوط کنی: `const f = () => {}; f.version = 1` در حالت strict با تایپ تابع خطا می‌دهد. از `Object.assign(fn, {...})` استفاده کن تا تایپ هم درست ادغام شود.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'چطور یک کتابخانه‌ی callable را تایپ‌گذاری می‌کنی؟',
        body:
          'پاسخ: «با یک Hybrid Type: Intersection یک امضای فراخوانی (یا سازنده) با یک object type از پراپرتی‌ها. ساخت مقدار با `Object.assign` انجام می‌شود تا تایپ نتیجه دقیقاً همان Intersection باشد.»',
      },
    ],
    quiz: {
      q: 'کدام سینتکس، یک تایپ هیبریدی (هم تابع هم آبجکت) را درست تعریف می‌کند؟',
      options: [
        '`type Fn = ((x: string) => number) & { readonly version: string }`',
        '`type Fn = (x: string) => number | { version: string }`',
        '`interface Fn { call(x: string): number; version: string }`',
        '`type Fn = [(x: string) => number, { version: string }]`',
      ],
      answer: 0,
      explain:
        'Intersection یک Call Signature با یک object type، تایپ هیبریدی می‌سازد. گزینه‌ی دوم یک Union است (یا تابع یا آبجکت) نه هیبریدی، و سوم/چهارم ساختار متفاوتی دارند.',
    },
    lab: {
      task: 'یک تابع هیبریدی `format` بساز: فراخوانی با رشته → رشته قالب‌بندی‌شده؛ به‌علاوه‌ی پراپرتی `locale` و متد `setLocale`.',
      starter: `type Formatter = ((value: number) => string) & {
  locale: string;
  setLocale(next: string): void;
};

function createFormatter(): Formatter {
  let locale = 'fa-IR';
  const fn = (value: number) => \`\${locale}: \${value}\`;
  return Object.assign(fn, {
    locale,
    setLocale(next: string) { locale = next; fn.locale = next; },
  });
}

const fmt = createFormatter();
console.log(fmt(1234));
fmt.setLocale('en-US');
console.log(fmt(1234), fmt.locale);`,
      solution: `type Formatter = ((value: number) => string) & { locale: string; setLocale(next: string): void };`,
    },
  },
];
