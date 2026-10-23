/* ==========================================================================
   فصل ۹ — کلاس‌ها  +  فصل ۱۰ — Generics و Decorators
   ========================================================================== */

export const PART6_LESSONS = [
  {
    id: 'ts-classes',
    chapter: 'ch9',
    titleFa: 'کلاس‌ها در TypeScript',
    titleEn: 'Classes',
    level: 'intermediate',
    minutes: 40,
    goal: 'کلاس تایپ‌دار را با فیلدهای صریح، initializer و `useDefineForClassFields` درست بنویسی.',
    steps: [
      {
        h: 'گام ۱ — فیلدها باید اعلان شوند',
        p:
          'با `strictPropertyInitialization` (عضو strict)، هر فیلد غیراختیاری باید یا در تعریف مقدار اولیه داشته باشد یا در constructor ست شود. این کار «فیلدهای undefined ناخواسته» را حذف می‌کند.',
        code: `class StudySession {
  readonly startedAt: Date;
  minutesSpent = 0;
  private topic: string;

  constructor(topic: string) {
    this.topic = topic;
    this.startedAt = new Date();
  }

  addMinutes(m: number): void { this.minutesSpent += m; }
  describe(): string { return \`\${this.topic}: \${this.minutesSpent} دقیقه\`; }
}

const session = new StudySession('TypeScript');
session.addMinutes(50);
console.log(session.describe(), session.startedAt instanceof Date);`,
      },
      {
        h: 'گام ۲ — `useDefineForClassFields` و تفاوت ظریف مقداردهی',
        p:
          'با `target: ES2022+` این گزینه به‌صورت پیش‌فرض `true` است و فیلدها با `Object.defineProperty` semantics تعریف می‌شوند. نتیجه: مقداردهی فیلد **بعد از** `super()` و با تعریف واقعی انجام می‌شود، که می‌تواند پارامترهای setter کلاس پایه را بازنویسی کند.',
        code: `class Base {
  value = 1;
  constructor() { console.log('base value =', this.value); }
}

class Derived extends Base {
  override value = 2; // ⚠️ بعد از super() دوباره تعریف می‌شود
}

console.log(new Derived().value);`,
      },
      {
        h: 'گام ۳ — فیلدهای خصوصی واقعی (`#`) در برابر `private`',
        p:
          '`private` یک محدودیت **فقط زمان کامپایل** است (در JS خروجی قابل دسترسی است). `#field` یک محدودیت **واقعی زمان اجرا** است (ECMAScript private). برای کد جدید، `#` امن‌تر است.',
        code: `class Wallet {
  #balance = 0;              // خصوصی واقعی (زمان اجرا)
  private readonly label: string; // خصوصی تایپی (فقط کامپایل)

  constructor(label: string) { this.label = label; }

  deposit(amount: number): number { this.#balance += amount; return this.#balance; }
  describe(): string { return \`\${this.label}: \${this.#balance}\`; }
}

const wallet = new Wallet('پس‌انداز');
wallet.deposit(100);
console.log(wallet.describe());
// ❌ wallet.#balance → SyntaxError`,
      },
      {
        h: 'گام ۴ — `readonly` و `static`',
        p:
          '`readonly` فیلد را فقط در تعریف یا constructor قابل نوشتن می‌کند. `static` عضو را به خود کلاس نسبت می‌دهد نه نمونه‌ها. ترکیب `static readonly` برای ثابت‌های کلاس ایده‌آل است.',
        code: `class Constants {
  static readonly MAX_HOURS = 5;
  static describe(): string { return \`حداکثر \${Constants.MAX_HOURS} ساعت\`; }
  private constructor() {} // غیرقابل نمونه‌سازی
}

console.log(Constants.MAX_HOURS, Constants.describe());`,
      },
    ],
    visual: 'class-anatomy',
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پیش‌فرض `readonly` و `#private`',
        body:
          'هر فیلدی که بعد از ساخت عوض نمی‌شود را `readonly` کن و هر فیلد داخلی را با `#` خصوصی کن. این دو کلمه، کپسوله‌سازی واقعی می‌سازند و از بزرگ‌ترین منبع باگ‌های Mutation جلوگیری می‌کنند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'تفاوت `private` و `#private` در زمان اجرا',
        body:
          '`(obj as any).privateField` کار می‌کند! چون `private` فقط در TypeScript وجود دارد و در خروجی JS پاک می‌شود. اگر واقعاً باید پنهان بماند، از `#field` استفاده کن.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۴',
        title: 'فرمول «کلاس فقط برای رفتار + وضعیت»',
        body:
          'اگر یک کلاس فقط داده نگه می‌دارد و متد معناداری ندارد، باید یک `type` باشد نه کلاس. کلاس فقط وقتی ارزش دارد که **رفتار** و **وضعیت کپسوله** با هم لازم باشند. داده‌ی خالص را با object literal و تایپ مدل کن.',
      },
    ],
    quiz: {
      q: 'تفاوت `private field` و `#field` در چیست؟',
      options: [
        '`private` فقط در زمان کامپایل محدود می‌کند، ولی `#` در زمان اجرا هم واقعاً غیرقابل دسترسی است',
        'هر دو کاملاً یکسان‌اند',
        '`#field` فقط در کلاس‌های abstract کار می‌کند',
        '`private` سریع‌تر است چون حذف می‌شود',
      ],
      answer: 0,
      explain:
        '`private` یک modifier تایپی است و در خروجی JavaScript اثری ندارد (با `as any` قابل دور زدن). `#field` یک ویژگی ECMAScript است که در زمان اجرا هم دسترسی را ممنوع می‌کند.',
    },
    lab: {
      task: 'کلاس `Lesson` با فیلد خصوصی `#minutes`، یک `readonly id` و متد `complete()` بنویس.',
      starter: `class Lesson {
  readonly id: string;
  #minutes = 0;
  #completed = false;

  constructor(id: string, minutes: number) {
    this.id = id;
    this.#minutes = minutes;
  }

  complete(): string {
    this.#completed = true;
    return \`\${this.id} تکمیل شد (\${this.#minutes} دقیقه)\`;
  }

  get isCompleted(): boolean { return this.#completed; }
}

const lesson = new Lesson('classes', 40);
console.log(lesson.complete(), lesson.isCompleted);`,
      solution: `class Lesson { readonly id: string; #minutes = 0; complete() { return this.id; } }`,
    },
  },

  {
    id: 'constructor-params',
    chapter: 'ch9',
    titleFa: 'Parameter Properties در سازنده',
    titleEn: 'Constructor Params',
    level: 'intermediate',
    minutes: 25,
    goal: 'سینتکس شکر Parameter Properties را بشناسی، مزیت و هزینه‌اش را بسنجی و جایگزین مدرنش را بدانی.',
    steps: [
      {
        h: 'گام ۱ — سینتکس فشرده',
        p:
          'اگر قبل از پارامتر constructor یک modifier (`public`، `private`، `protected`، `readonly`) بگذاری، TypeScript **به‌صورت خودکار** فیلد هم‌نام را اعلان و مقداردهی می‌کند. این یک ویژگی تولیدکننده‌ی کد است.',
        code: `class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
    private label = 'point',
  ) {}

  describe(): string { return \`\${this.label}(\${this.x},\${this.y})\`; }
}

const p = new Point(3, 4);
console.log(p.x, p.describe());
// ❌ p.label → Property 'label' is private`,
      },
      {
        h: 'گام ۲ — معادل دستی (برای درک آنچه واقعاً تولید می‌شود)',
        p:
          'خروجی JavaScript معادل این است: اعلان فیلد + انتساب در ابتدای constructor. دانستن این، دیباگ را ساده می‌کند.',
        code: `// معادل دستی Parameter Properties:
class PointManual {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceFromOrigin(): number { return Math.hypot(this.x, this.y); }
}

console.log(new PointManual(3, 4).distanceFromOrigin());`,
      },
      {
        h: 'گام ۳ — هزینه: erasable نیست',
        p:
          'چون Parameter Properties **کد تولید می‌کند**، با `isolatedModules`، strip-types بومی Node و `verbatimModuleSyntax` مشکل دارد (TS 5.8 پرچم `erasableSyntaxOnly` آن را ممنوع می‌کند). در پروژه‌های مدرن، بسیاری تیم‌ها آن را کنار گذاشته‌اند.',
        code: `// ✅ الگوی مدرن و Erasable (بدون parameter property):
class Config {
  readonly host: string;
  readonly port: number;

  constructor(options: { host: string; port: number }) {
    this.host = options.host;
    this.port = options.port;
  }
}

const cfg = new Config({ host: 'localhost', port: 3000 });
console.log(cfg.host, cfg.port);`,
      },
      {
        h: 'گام ۴ — جایگزین کارخانه‌ای (Factory) — اغلب بهتر از کلاس',
        p:
          'برای داده‌ی ساده، یک تابع کارخانه + type alias هم خواناتر است هم کاملاً erasable و هم بدون مشکل `this`.',
        code: `type User = { readonly id: string; readonly name: string };

function createUser(name: string, id = crypto.randomUUID?.() ?? 'x'): User {
  return { id, name };
}

console.log(createUser('نیما').name);`,
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی مهم',
        title: 'Parameter Properties با ترنسپایلرهای تک‌فایلی می‌شکند',
        body:
          'esbuild/SWC/Babel/Node-strip-types هر فایل را جدا ترنسپایل می‌کنند و نمی‌دانند `constructor(public x: number)` باید یک فیلد کلاس بسازد. با `isolatedModules: true` یا `erasableSyntaxOnly: true` خطا می‌گیری.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قاعده‌ی تیمی: یا همه‌جا یا هیچ‌جا',
        body:
          'مخلوط کردن `constructor(private readonly repo: Repo)` با اعلان دستی فیلدها، کد را ناهمگون می‌کند. یک قاعده انتخاب کن: یا Parameter Properties در کل کدبیس، یا اعلان صریح فیلدها (توصیه‌ی مدرن: دومی).',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۵',
        title: 'فرمول «Object Parameter برای سازنده‌های بیش از ۲ پارامتر»',
        body:
          '`new Service(a, b, c, d)` در نقطه‌ی فراخوانی مبهم است؛ `new Service({ host, port, timeout })` خودش را توضیح می‌دهد و افزودن پارامتر جدید هیچ فراخوانی موجودی را نمی‌شکند.',
      },
    ],
    quiz: {
      q: 'چرا Parameter Properties با `isolatedModules` / strip-types بومی Node سازگار نیست؟',
      options: [
        'چون کد زمان اجرا تولید می‌کند (اعلان و انتساب فیلد) و erasable نیست',
        'چون فقط در کلاس‌های abstract کار می‌کند',
        'چون باعث کندی کامپایل می‌شود',
        'چون با `readonly` ترکیب نمی‌شود',
      ],
      answer: 0,
      explain:
        'ترنسپایلرهای تک‌فایلی فقط تایپ‌ها را پاک می‌کنند و نمی‌توانند کد جدید تولید کنند. Parameter Properties نیاز به تولید اعلان فیلد و انتساب دارد، پس در این محیط‌ها کار نمی‌کند.',
    },
    lab: {
      task: 'یک کلاس را دو بار بنویس: یک بار با Parameter Properties و یک بار با الگوی مدرن Erasable. خروجی هر دو باید یکسان باشد.',
      starter: `// نسخه‌ی فشرده (parameter properties):
class Compact {
  constructor(public readonly name: string, private retries = 3) {}
  describe(): string { return \`\${this.name}/\${this.retries}\`; }
}

// نسخه‌ی مدرن (erasable):
class Modern {
  readonly name: string;
  private readonly retries: number;
  constructor(options: { name: string; retries?: number }) {
    this.name = options.name;
    this.retries = options.retries ?? 3;
  }
  describe(): string { return \`\${this.name}/\${this.retries}\`; }
}

console.log(new Compact('a').describe(), new Modern({ name: 'a' }).describe());`,
      solution: `class Modern { readonly name: string; constructor(o: { name: string }) { this.name = o.name; } }`,
    },
  },

  {
    id: 'access-modifiers',
    chapter: 'ch9',
    titleFa: 'سطوح دسترسی (Access Modifiers)',
    titleEn: 'Access Modifiers',
    level: 'intermediate',
    minutes: 30,
    goal: 'چهار سطح دسترسی را بشناسی و کپسوله‌سازی واقعی را با ترکیب درست `private`/`protected`/`readonly`/`#` پیاده کنی.',
    steps: [
      {
        h: 'گام ۱ — چهار سطح و معنی دقیق هرکدام',
        p:
          '`public` (پیش‌فرض): همه‌جا. `private`: فقط داخل همان کلاس. `protected`: داخل کلاس و زیرکلاس‌ها. `readonly`: فقط نوشتن در تعریف/constructor. به‌علاوه‌ی `#field` که خصوصی واقعی زمان اجراست.',
        code: `class Account {
  public readonly owner: string;
  protected balance = 0;
  private readonly secretKey: string;
  #auditLog: string[] = [];

  constructor(owner: string, secretKey: string) {
    this.owner = owner;
    this.secretKey = secretKey;
  }

  deposit(amount: number): void {
    this.balance += amount;
    this.#auditLog.push(\`+\${amount}\`);
  }

  protected log(): string { return this.#auditLog.join(', '); }
}

const acc = new Account('نیما', 'k-1');
acc.deposit(100);
console.log(acc.owner, acc.log()); // ❌ acc.balance / acc.secretKey / acc.#auditLog`,
      },
      {
        h: 'گام ۲ — `private` در برابر `protected`: انتخاب معماری',
        p:
          '`private` یعنی «این جزئیات پیاده‌سازی است و حتی زیرکلاس نباید به آن دست بزند» — انعطاف بیشتری برای تغییر داری. `protected` یعنی «زیرکلاس‌ها به این نیاز دارند» — یک قرارداد داخلی می‌سازد که تغییرش سخت‌تر است. **پیش‌فرض: `private`.**',
      },
      {
        h: 'گام ۳ — `protected` با `private` در سازگاری تایپ‌ها',
        p:
          'کلاسی که عضو `private`/`protected` دارد فقط با همان کلاس (و زیرکلاس‌هایش برای protected) سازگار است — این تنها جایی است که TypeScript از ساختارگرایی محض خارج می‌شود.',
        code: `class A { private x = 1; }
class B { private x = 1; }

// ❌ const a: A = new B(); → Types have separate declarations of a private property 'x'

class C extends A {}
const c: A = new C(); // ✅ زیرکلاس با کلاس پایه سازگار است

console.log(c instanceof A);`,
      },
      {
        h: 'گام ۴ — Getter/Setter به‌جای فیلد عمومی',
        p:
          'برای کنترل دسترسی، فیلد را `private`/`#` کن و یک `get` عمومی بگذار. این کار اجازه می‌دهد بعداً اعتبارسنجی یا محاسبه اضافه کنی **بدون شکستن مصرف‌کننده‌ها**.',
        code: `class Temperature {
  #celsius = 0;

  get celsius(): number { return this.#celsius; }
  set celsius(value: number) {
    if (!Number.isFinite(value) || value < -273.15) throw new RangeError('دمای نامعتبر');
    this.#celsius = value;
  }

  get fahrenheit(): number { return this.#celsius * 9 / 5 + 32; }
}

const t = new Temperature();
t.celsius = 25;
console.log(t.celsius, t.fahrenheit);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۶',
        title: 'فرمول «کمترین سطح دسترسی ممکن»',
        body:
          'هر عضو را با **محدودترین** سطحی شروع کن که کار می‌کند (`#`/`private`) و فقط وقتی واقعاً لازم شد بازترش کن. هر سطح دسترسی بازتر، یک تعهد دائمی به مصرف‌کننده‌هاست که بعداً شکستنش هزینه دارد.',
        equation: 'آزادی تغییر در آینده ∝ ۱ ÷ (تعداد اعضای public)',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Getter عمومی + فیلد خصوصی = API پایدار',
        body:
          'هرگز یک فیلد عمومی تغییرپذیر را در API عمومی نگذار. با `get`/`set` می‌توانی بعداً اعتبارسنجی، لاگ یا محاسبه‌ی تنبل اضافه کنی بدون اینکه یک خط از کد مصرف‌کننده تغییر کند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'تفاوت `private` و `protected` و `#field`',
        body:
          'پاسخ: «`private` فقط داخل همان کلاس (زمان کامپایل)، `protected` داخل کلاس و زیرکلاس‌ها (زمان کامپایل)، `#field` خصوصی واقعی در زمان اجرا که حتی با `as any` قابل دسترسی نیست. همچنین اعضای private/protected سازگاری ساختاری را می‌شکنند.»',
      },
    ],
    quiz: {
      q: 'کدام modifier اجازه می‌دهد زیرکلاس‌ها به یک عضو دسترسی داشته باشند ولی کد بیرونی نه؟',
      options: ['`protected`', '`private`', '`readonly`', '`static`'],
      answer: 0,
      explain:
        '`protected` دسترسی را به کلاس و زیرکلاس‌هایش محدود می‌کند. `private` حتی زیرکلاس را هم ممنوع می‌کند و `readonly` فقط نوشتن را محدود می‌کند نه خواندن را.',
    },
    lab: {
      task: 'کلاس `BankAccount` با فیلد خصوصی `#balance`، متد عمومی `deposit`/`withdraw` و getter فقط‌خواندنی بنویس.',
      starter: `class BankAccount {
  #balance = 0;
  constructor(public readonly owner: string) {}

  get balance(): number { return this.#balance; }

  deposit(amount: number): void {
    if (amount <= 0) throw new RangeError('مبلغ باید مثبت باشد');
    this.#balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount > this.#balance) return false;
    this.#balance -= amount;
    return true;
  }
}

const account = new BankAccount('نیما');
account.deposit(500);
console.log(account.balance, account.withdraw(200), account.balance);`,
      solution: `class BankAccount { #balance = 0; get balance() { return this.#balance; } deposit(a: number) { this.#balance += a; } }`,
    },
  },

  {
    id: 'abstract-classes',
    chapter: 'ch9',
    titleFa: 'کلاس‌های انتزاعی (Abstract)',
    titleEn: 'Abstract Classes',
    level: 'intermediate',
    minutes: 30,
    goal: 'Template Method Pattern را با کلاس انتزاعی پیاده کنی و بدانی کی abstract و کی interface انتخاب کنی.',
    steps: [
      {
        h: 'گام ۱ — `abstract` یعنی «کلیت دارد، پیاده‌سازی کامل ندارد»',
        p:
          'کلاس abstract قابل `new` شدن نیست و می‌تواند متد abstract (بدون بدنه) داشته باشد که زیرکلاس **مجبور** به پیاده‌سازی آن است. این قوی‌ترین ابزار اجبار قرارداد همراه با اشتراک کد است.',
        code: `abstract class Report {
  abstract buildRows(): string[];      // زیرکلاس باید پیاده کند
  protected abstract title(): string;

  // Template Method — منطق مشترک اینجا زندگی می‌کند
  render(): string {
    const rows = this.buildRows();
    return \`# \${this.title()}\\n\${rows.map((r) => \`- \${r}\`).join('\\n')}\`;
  }
}

class DailyReport extends Report {
  protected title() { return 'گزارش روزانه'; }
  buildRows() { return ['۵ ساعت مطالعه', '۳ درس تکمیل شد']; }
}

console.log(new DailyReport().render());`,
      },
      {
        h: 'گام ۲ — abstract در برابر interface',
        p:
          '`interface` فقط قرارداد است (بدون کد مشترک). `abstract class` قرارداد **+ پیاده‌سازی مشترک** می‌دهد. اگر منطق واقعی برای اشتراک داری → abstract. اگر فقط شکل داده/متد داری → interface.',
      },
      {
        h: 'گام ۳ — تایپ کلاس انتزاعی به‌عنوان قرارداد',
        p:
          'می‌توانی از نام کلاس abstract به‌عنوان تایپ استفاده کنی (پلیمورفیسم). همچنین می‌توانی تایپ «سازنده‌ی یک کلاس انتزاعی» را بنویسی.',
        code: `abstract class Shape { abstract area(): number }

class Square extends Shape { constructor(private side: number) { super(); } override area() { return this.side ** 2; } }
class Circle extends Shape { constructor(private r: number) { super(); } override area() { return Math.PI * this.r ** 2; } }

function totalArea(shapes: readonly Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

console.log(totalArea([new Square(2), new Circle(1)]).toFixed(2));`,
      },
      {
        h: 'گام ۴ — abstract property و constructor محافظت‌شده',
        p:
          'abstract می‌تواند روی پراپرتی هم اعمال شود. برای جلوگیری از نمونه‌سازی مستقیم بدون abstract کردن، `protected constructor` استفاده کن.',
        code: `abstract class Validator<T> {
  abstract validate(value: unknown): value is T;
  abstract readonly name: string;
}

class EmailValidator extends Validator<string> {
  readonly name = 'email';
  validate(value: unknown): value is string {
    return typeof value === 'string' && value.includes('@');
  }
}

const v = new EmailValidator();
console.log(v.name, v.validate('a@b.com'), v.validate('bad'));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Template Method را در کلاس پایه، تغییرپذیرها را abstract کن',
        body:
          'الگوی طلایی: مراحل ثابت (ترتیب، مدیریت خطا، قالب‌بندی) را در یک متد عمومی کلاس پایه بگذار و فقط نقاط تغییر را `abstract` کن. این کار بیشترین اشتراک کد را با کمترین انعطاف‌ناپذیری می‌دهد.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۷',
        title: 'فرمول «قرارداد + کد مشترک = abstract»',
        body:
          'تصمیم ساده: اگر فقط قرارداد داری → `interface`. اگر قرارداد + منطق مشترک داری → `abstract class`. اگر قرارداد + منطق مشترک + **وضعیت** داری → abstract class با فیلدهای protected.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'abstract class هم erasable نیست',
        body:
          'کلاس‌ها کد زمان اجرا تولید می‌کنند، پس در محیط‌های strip-types کار می‌کنند (چون کلاس یک ویژگی JS است) ولی `abstract` و parameter properties نه. اگر به دنبال حداکثر سازگاری هستی، ترکیب «توابع خالص + type» را انتخاب کن.',
      },
    ],
    quiz: {
      q: 'چه زمانی `abstract class` بر `interface` ترجیح دارد؟',
      options: [
        'وقتی علاوه بر قرارداد، منطق یا وضعیت مشترکی هست که باید بین پیاده‌سازی‌ها به اشتراک گذاشته شود',
        'همیشه، چون قدرتمندتر است',
        'وقتی فقط شکل داده مهم است',
        'وقتی به Union type نیاز داریم',
      ],
      answer: 0,
      explain:
        '`interface` نمی‌تواند پیاده‌سازی یا فیلد واقعی داشته باشد. مزیت منحصربه‌فرد abstract class، اشتراک‌گذاری کد (Template Method) و وضعیت در کنار اجبار قرارداد است.',
    },
    lab: {
      task: 'یک کلاس انتزاعی `Exporter` با Template Method بنویس: `export()` مراحل را اجرا می‌کند و `serialize()` و `extension` را abstract می‌گذارد.',
      starter: `abstract class Exporter<T> {
  protected abstract readonly extension: string;
  protected abstract serialize(item: T): string;

  export(items: readonly T[]): string {
    const body = items.map((i) => this.serialize(i)).join('\\n');
    return \`file.\${this.extension}\\n\${body}\`;
  }
}

class JsonExporter extends Exporter<{ id: string }> {
  protected readonly extension = 'json';
  protected serialize(item: { id: string }) { return JSON.stringify(item); }
}

class CsvExporter extends Exporter<{ id: string }> {
  protected readonly extension = 'csv';
  protected serialize(item: { id: string }) { return item.id; }
}

const items = [{ id: 'a' }, { id: 'b' }];
console.log(new JsonExporter().export(items));
console.log(new CsvExporter().export(items));`,
      solution: `abstract class Exporter<T> { protected abstract serialize(item: T): string; export(items: readonly T[]) { return items.map(i => this.serialize(i)).join('\\n'); } }`,
    },
  },

  {
    id: 'inheritance-polymorphism',
    chapter: 'ch9',
    titleFa: 'وراثت در برابر چندریختی',
    titleEn: 'Inheritance vs Polymorphism',
    level: 'advanced',
    minutes: 35,
    goal: 'دو مفهوم را از هم تفکیک کنی و بفهمی در TypeScript چندریختی چطور بدون وراثت هم ممکن است.',
    steps: [
      {
        h: 'گام ۱ — تفکیک دقیق دو مفهوم',
        p:
          '**وراثت** یک مکانیزم *اشتراک کد* است (یک کلاس از کلاس دیگر فیلد/متد می‌گیرد). **چندریختی** یک قابلیت *رفتاری* است (یک فراخوانی واحد، رفتارهای متفاوت بسته به نوع واقعی). این دو مستقل‌اند: چندریختی بدون وراثت کاملاً ممکن است.',
      },
      {
        h: 'گام ۲ — چندریختی پارامتریک (Generic)',
        p:
          'بدون هیچ وراثتی، یک تابع برای همه‌ی تایپ‌ها کار می‌کند. این رایج‌ترین شکل چندریختی در TypeScript مدرن است.',
        code: `function firstOf<T>(list: readonly T[]): T | undefined { return list[0]; }
function wrap<T>(value: T): { readonly value: T } { return { value }; }

console.log(firstOf([1, 2, 3]), firstOf(['a', 'b']));
console.log(wrap('text'), wrap(42));`,
      },
      {
        h: 'گام ۳ — چندریختی Subtype (بدون کلاس!)',
        p:
          'به‌لطف Structural Typing، چندریختی بدون هیچ `extends` ممکن است: کافی است شکل‌ها سازگار باشند. این تفاوت بزرگ TypeScript با Java/C# است.',
        code: `interface Shape { area(): number }

const square: Shape = { area: () => 4 };
const circle: Shape = { area: () => Math.PI };

function total(shapes: readonly Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

console.log(total([square, circle]).toFixed(2)); // هیچ کلاسی وجود ندارد!`,
      },
      {
        h: 'گام ۴ — چندریختی Ad-hoc (Overload) و چندریختی با Union',
        p:
          'Overload چندریختی بر اساس شکل ورودی است. Union + `switch` هم چندریختی داده‌محور است که امروز در TypeScript **ترجیح داده می‌شود** چون exhaustiveness دارد.',
        code: `type Notification =
  | { readonly kind: 'email'; readonly to: string }
  | { readonly kind: 'sms'; readonly phone: string }
  | { readonly kind: 'push'; readonly token: string };

function send(n: Notification): string {
  switch (n.kind) {
    case 'email': return \`email → \${n.to}\`;
    case 'sms': return \`sms → \${n.phone}\`;
    case 'push': return \`push → \${n.token}\`;
  }
}

console.log(send({ kind: 'sms', phone: '+98' }));`,
      },
      {
        h: 'گام ۵ — چرا «ترکیب بر وراثت»؟',
        p:
          'وراثت یک وابستگی **محکم** و سلسله‌مراتبی می‌سازد: تغییر کلاس پایه همه‌ی فرزندان را تحت تأثیر قرار می‌دهد (Fragile Base Class). ترکیب و Generic این وابستگی را ندارند و تست‌پذیری بالاتر است.',
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۸',
        title: 'فرمول «چهار نوع چندریختی»',
        body:
          '۱) پارامتریک (Generic) ۲) Subtype (interface/کلاس) ۳) Ad-hoc (Overload) ۴) Coercion. در TypeScript مدرن به ترتیب اولویت: Generic → Union/switch → interface → کلاس وراثتی. هرچه به راست بروی، شکنندگی بیشتر است.',
        equation: 'اولویت طراحی: Generic > Union + switch > Interface > Class Inheritance',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Union + Discriminant به‌جای سلسله‌مراتب کلاس',
        body:
          'برای «چند نوع چیز با رفتار متفاوت»، یک Discriminated Union با `switch` بنویس نه یک سلسله‌مراتب `extends`. مزایا: داده قابل serialize است، exhaustiveness با `never` تضمین می‌شود، و همه‌ی حالات در یک فایل دیده می‌شوند.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'آیا بدون وراثت می‌توان چندریختی داشت؟',
        body:
          'پاسخ: «بله، سه راه: Generic (پارامتریک)، Structural Subtyping با interface (بدون implements)، و Union + switch. در TypeScript به‌لطف ساختاری بودن تایپ‌ها، چندریختی اصلاً به وراثت وابسته نیست.»',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی طراحی',
        title: 'Fragile Base Class',
        body:
          'اگر کلاس پایه را تغییر دهی (مثلاً یک متد protected اضافه یا تغییر دهی)، ممکن است زیرکلاس‌هایی که هیچ‌وقت ندیده‌ای بشکنند. این دلیل اصلی توصیه‌ی «ترکیب بر وراثت» است.',
      },
    ],
    quiz: {
      q: 'کدام گزینه چندریختی را **بدون** وراثت پیاده می‌کند؟',
      options: [
        'تابع Generic `function id<T>(x: T): T`',
        '`class Dog extends Animal`',
        '`abstract class Shape` با زیرکلاس‌ها',
        '`class X implements Y` همراه با ارث‌بری از یک کلاس پایه',
      ],
      answer: 0,
      explain:
        'Generic چندریختی پارامتریک است و هیچ سلسله‌مراتب وراثتی ندارد. بقیه‌ی گزینه‌ها مستقیم یا غیرمستقیم بر وراثت/پیاده‌سازی کلاس متکی‌اند.',
    },
    lab: {
      task: 'یک سیستم اعلان با Union + switch بنویس (بدون هیچ کلاسی) و با `assertNever` پوشش کامل را تضمین کن.',
      starter: `type Notification =
  | { readonly kind: 'email'; readonly to: string; readonly subject: string }
  | { readonly kind: 'sms'; readonly phone: string }
  | { readonly kind: 'push'; readonly token: string; readonly silent?: boolean };

function assertNever(v: never): never { throw new Error('unhandled: ' + JSON.stringify(v)); }

function dispatch(n: Notification): string {
  switch (n.kind) {
    case 'email': return \`EMAIL \${n.to}: \${n.subject}\`;
    case 'sms': return \`SMS \${n.phone}\`;
    case 'push': return \`PUSH \${n.token}\${n.silent ? ' (silent)' : ''}\`;
    default: return assertNever(n);
  }
}

console.log(dispatch({ kind: 'email', to: 'a@b.c', subject: 'سلام' }));
console.log(dispatch({ kind: 'push', token: 'tk', silent: true }));`,
      solution: `function dispatch(n: Notification): string {
  switch (n.kind) {
    case 'email': return n.to;
    case 'sms': return n.phone;
    case 'push': return n.token;
    default: { const x: never = n; return x; }
  }
}`,
    },
  },

  {
    id: 'method-overriding',
    chapter: 'ch9',
    titleFa: 'بازنویسی متدها (Method Overriding)',
    titleEn: 'Method Overriding',
    level: 'intermediate',
    minutes: 25,
    goal: '`override`، `noImplicitOverride` و قواعد covariant/contravariant بازنویسی را بفهمی.',
    steps: [
      {
        h: 'گام ۱ — `override` و چرا اجباری‌کردنش حیاتی است',
        p:
          'با `noImplicitOverride: true`، هر متدی که در زیرکلاس متد کلاس پایه را بازنویسی می‌کند **باید** کلمه‌ی `override` داشته باشد. سود بزرگ: اگر متد در کلاس پایه تغییر نام یابد یا حذف شود، کامپایلر فوراً خطا می‌دهد.',
        code: `class Logger {
  log(message: string): string { return \`[log] \${message}\`; }
}

class VerboseLogger extends Logger {
  override log(message: string): string {
    return \`[verbose] \${super.log(message)}\`;
  }
}

console.log(new VerboseLogger().log('سلام'));`,
      },
      {
        h: 'گام ۲ — بدون `override` چه خطری وجود دارد؟',
        p:
          'اگر در کلاس پایه متدی با نام `log` وجود داشته باشد و تو در زیرکلاس ناخواسته متدی هم‌نام بنویسی (بدون قصد بازنویسی)، یک باگ خاموش ساخته‌ای. `override` این را **غیرممکن** می‌کند: اگر متد بالایی وجود نداشته باشد، خطا می‌گیری.',
        code: `class Base { greet(): string { return 'hi'; } }

class Child extends Base {
  // ❌ با noImplicitOverride خطا: باید override بنویسی
  // greet(): string { return 'hello'; }

  override greet(): string { return 'hello'; }
}

console.log(new Child().greet());`,
      },
      {
        h: 'گام ۳ — قواعد تایپ در بازنویسی (Variance)',
        p:
          'متد بازنویسی‌شده باید با امضای کلاس پایه سازگار باشد: پارامترها می‌توانند **پهن‌تر** و بازگشتی می‌تواند **باریک‌تر** باشد. باریک‌کردن پارامتر خطا می‌دهد.',
        code: `class Handler {
  handle(input: unknown): string { return String(input); }
}

class SafeHandler extends Handler {
  // ✅ بازگشتی باریک‌تر، پارامتر پهن‌تر (همان unknown)
  override handle(input: unknown): 'ok' | 'error' {
    return input == null ? 'error' : 'ok';
  }
}

console.log(new SafeHandler().handle(1), new SafeHandler().handle(null));`,
      },
      {
        h: 'گام ۴ — `super` و ترتیب فراخوانی',
        p:
          'برای حفظ رفتار کلاس پایه، `super.method()` را صدا کن. تصمیم «قبل یا بعد» به منطق تو بستگی دارد؛ برای لاگ/تزئین معمولاً بعد، و برای اعتبارسنجی معمولاً قبل.',
        code: `class Repository {
  save(id: string): string { return \`saved:\${id}\`; }
}

class AuditedRepository extends Repository {
  override save(id: string): string {
    const result = super.save(id);
    return \`audit(\${result})\`;
  }
}

console.log(new AuditedRepository().save('u1'));`,
      },
    ],
    margins: [
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: '`noImplicitOverride: true` را از روز اول فعال کن',
        body:
          'این یک flag، یکی از خطرناک‌ترین دسته‌های باگ در سلسله‌مراتب کلاس را حذف می‌کند: بازنویسی ناخواسته و بازنویسی کهنه‌شده. هزینه‌اش فقط نوشتن یک کلمه است.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۴۹',
        title: 'فرمول «Liskov در عمل»',
        body:
          'یک بازنویسی درست باید هر جایی که کلاس پایه استفاده می‌شد، بدون تغییر رفتار قابل جایگزینی باشد. تست عملی: آیا مصرف‌کننده‌ای که `Base` می‌خواهد، با `Derived` هم درست کار می‌کند؟ اگر نه، طراحی را عوض کن.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'بازنویسی فیلد با متد (و برعکس)',
        body:
          'اگر در کلاس پایه `value` یک فیلد است و در زیرکلاس یک getter با همان نام بنویسی، رفتار به `useDefineForClassFields` وابسته و گیج‌کننده می‌شود. همیشه شکل عضو (فیلد/متد) را در سراسر سلسله‌مراتب یکسان نگه دار.',
      },
    ],
    quiz: {
      q: 'پرچم `noImplicitOverride` چه چیزی را اجباری می‌کند؟',
      options: [
        'نوشتن کلمه‌ی `override` روی هر متدی که متد کلاس پایه را بازنویسی می‌کند',
        'استفاده از `super` در همه‌ی متدها',
        'abstract بودن کلاس پایه',
        'private بودن متدهای بازنویسی‌شده',
      ],
      answer: 0,
      explain:
        'با این flag، بازنویسی بدون کلمه‌ی `override` خطای کامپایل می‌دهد. مزیت: اگر متد پایه حذف یا تغییر نام یابد، `override` بی‌جا فوراً خطا می‌دهد و بازنویسی کهنه شکار می‌شود.',
    },
    lab: {
      task: 'یک کلاس پایه `Formatter` و دو زیرکلاس با `override` بنویس که هر کدام `super.format()` را تزئین کنند.',
      starter: `class Formatter {
  format(value: string): string { return value.trim(); }
}

class UpperFormatter extends Formatter {
  override format(value: string): string { return super.format(value).toUpperCase(); }
}

class BracketFormatter extends Formatter {
  constructor(private readonly bracket = '[]') { super(); }
  override format(value: string): string { return \`\${this.bracket[0]}\${super.format(value)}\${this.bracket[1]}\`; }
}

console.log(new UpperFormatter().format('  hello  '));
console.log(new BracketFormatter('{}').format('  x  '));`,
      solution: `class UpperFormatter extends Formatter { override format(v: string) { return super.format(v).toUpperCase(); } }`,
    },
  },

  {
    id: 'constructor-overloading',
    chapter: 'ch9',
    titleFa: 'Overloading سازنده',
    titleEn: 'Constructor Overloading',
    level: 'advanced',
    minutes: 30,
    goal: 'چند امضای سازنده بنویسی و بدان چرا Union یا Factory معمولاً راه‌حل بهتری است.',
    steps: [
      {
        h: 'گام ۱ — سینتکس overload در constructor',
        p:
          'مثل توابع: چند امضای `constructor` بدون بدنه، سپس یک پیاده‌سازی با تایپ کلی. پیاده‌سازی باید همه‌ی حالت‌ها را پوشش دهد.',
        code: `class Duration {
  readonly ms: number;

  constructor(ms: number);
  constructor(value: number, unit: 'ms' | 's' | 'min');
  constructor(seconds: string);
  constructor(first: number | string, unit: 'ms' | 's' | 'min' = 'ms') {
    if (typeof first === 'string') {
      this.ms = Number.parseFloat(first) * 1000;
    } else if (unit === 's') {
      this.ms = first * 1000;
    } else if (unit === 'min') {
      this.ms = first * 60_000;
    } else {
      this.ms = first;
    }
  }
}

console.log(new Duration(1500).ms, new Duration(2, 's').ms, new Duration('1.5').ms);`,
      },
      {
        h: 'گام ۲ — راه‌حل تمیزتر: Union در یک امضا',
        p:
          'اگر حالت‌ها با یک Discriminated Union قابل بیان‌اند، یک امضای واحد خواناتر و امن‌تر است.',
        code: `type SizeInput =
  | { readonly kind: 'px'; readonly value: number }
  | { readonly kind: 'percent'; readonly value: number };

class Size {
  constructor(public readonly input: SizeInput) {}
  toCss(): string {
    return this.input.kind === 'px' ? \`\${this.input.value}px\` : \`\${this.input.value}%\`;
  }
}

console.log(new Size({ kind: 'px', value: 12 }).toCss());
console.log(new Size({ kind: 'percent', value: 50 }).toCss());`,
      },
      {
        h: 'گام ۳ — راه‌حل حرفه‌ای‌تر: Static Factory Methods',
        p:
          'به‌جای overload، سازنده را خصوصی/ساده کن و چند متد کارخانه‌ی **خودتوضیح** بگذار. این الگو در کتابخانه‌های مدرن (مثل Luxon، Temporal) استاندارد است.',
        code: `class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: 'IRR' | 'USD',
  ) {}

  static fromIRR(amount: number): Money { return new Money(amount, 'IRR'); }
  static fromUSD(amount: number): Money { return new Money(amount, 'USD'); }
  static parse(text: string): Money {
    const [amount, currency] = text.split(' ');
    return new Money(Number(amount), currency === 'USD' ? 'USD' : 'IRR');
  }

  format(): string { return \`\${this.amount} \${this.currency}\`; }
}

console.log(Money.fromIRR(1000).format());
console.log(Money.parse('25 USD').format());`,
      },
      {
        h: 'گام ۴ — Overload با Generic در سازنده',
        p:
          'گاهی ترکیب overload و Generic لازم است؛ مثلاً وقتی تایپ بازگشتی به ورودی وابسته است. در این حالت `static create<T>` معمولاً از overload constructor تمیزتر است.',
        code: `class Box<T> {
  private constructor(public readonly value: T) {}
  static of<T>(value: T): Box<T> { return new Box(value); }
  static empty(): Box<never> { return new Box<never>(undefined as never); }
  map<U>(fn: (v: T) => U): Box<U> { return Box.of(fn(this.value)); }
}

console.log(Box.of(5).map((n) => n * 2).value);`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۰',
        title: 'فرمول «نام کارخانه، مستندسازی رایگان»',
        body:
          '`Money.fromUSD(25)` خودش را توضیح می‌دهد؛ `new Money(25, "USD")` هم همین‌طور، ولی `new Money(25, 1)` مبهم است. Static factory methodها اجازه می‌دهند **نام** را به‌عنوان مستندسازی به کار ببری و overload را حذف کنی.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'یک سازنده، یک شکل ورودی',
        body:
          'سازنده را با یک امضای ساده (ترجیحاً Options Object) نگه دار و تنوع ورودی را به Static Factory Methodها منتقل کن. این کار تست، مستندسازی و IntelliSense را به شدت بهبود می‌دهد.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'پیاده‌سازی overload با امضاها چک نمی‌شود',
        body:
          'همان‌طور که در overload توابع، بدنه‌ی constructor هم با امضاها راستی‌آزمایی نمی‌شود. اگر یک شاخه فراموش شود، فیلد `undefined` می‌ماند و خطای زمان اجرا می‌گیری. همیشه exhaustiveness دستی با `assertNever` اضافه کن.',
      },
    ],
    quiz: {
      q: 'کدام الگو معمولاً جایگزین بهتری برای constructor overloading است؟',
      options: [
        'Static factory methods با نام‌های گویا (`fromX`, `parse`, `empty`)',
        'استفاده از `any` در پارامتر سازنده',
        'افزودن تعداد overloadها تا پوشش کامل',
        'حذف سازنده و استفاده از فیلدهای عمومی',
      ],
      answer: 0,
      explain:
        'کارخانه‌های ایستا نام‌دار، خودمستندسازند، IntelliSense بهتری می‌دهند، محدودیت «یک پیاده‌سازی» را ندارند و تست‌پذیرترند. این الگو در کتابخانه‌های مدرن استاندارد شده است.',
    },
    lab: {
      task: 'کلاس `Temperature` را با سه Static Factory (`fromCelsius`، `fromFahrenheit`، `parse`) بنویس — بدون overload.',
      starter: `class Temperature {
  private constructor(public readonly celsius: number) {}

  static fromCelsius(c: number): Temperature { return new Temperature(c); }
  static fromFahrenheit(f: number): Temperature { return new Temperature((f - 32) * 5 / 9); }
  static parse(text: string): Temperature {
    const value = Number.parseFloat(text);
    return text.trim().toUpperCase().endsWith('F')
      ? Temperature.fromFahrenheit(value)
      : Temperature.fromCelsius(value);
  }

  toString(): string { return \`\${this.celsius.toFixed(1)}°C\`; }
}

console.log(Temperature.fromCelsius(25).toString());
console.log(Temperature.fromFahrenheit(77).toString());
console.log(Temperature.parse('100F').toString());`,
      solution: `class Temperature { private constructor(public readonly celsius: number) {} static fromCelsius(c: number) { return new Temperature(c); } }`,
    },
  },

  {
    id: 'ts-generics',
    chapter: 'ch10',
    titleFa: 'Generics — نگرش کلی',
    titleEn: 'Generics',
    level: 'advanced',
    minutes: 40,
    goal: 'فلسفه‌ی Generics را بفهمی: «تایپ به‌عنوان پارامتر» و اینکه چطور دقت را بدون تکرار حفظ می‌کند.',
    steps: [
      {
        h: 'گام ۱ — مشکل اصلی که Generic حل می‌کند',
        p:
          'بدون Generic فقط سه راه داری: ۱) تایپ را از دست بده (`any`) ۲) کد را تکرار کن (برای هر تایپ یک تابع) ۳) تایپ را بیش از حد گسترده کن. Generic راه چهارم است: **یک پیاده‌سازی، دقت کامل برای هر تایپ**.',
        code: `// ❌ راه ۱ — دقت از دست می‌رود:
function identityAny(value: any): any { return value; }

// ❌ راه ۲ — تکرار (نقض DRY):
function identityString(v: string): string { return v; }
function identityNumber(v: number): number { return v; }

// ✅ راه ۴ — Generic:
function identity<T>(value: T): T { return value; }

const a = identity('text'); // string
const b = identity(42);     // number
console.log(a.toUpperCase(), b.toFixed(1));`,
      },
      {
        h: 'گام ۲ — سه جایگاه Generic',
        p:
          'Generic می‌تواند روی **تابع**، **تایپ/اینترفیس** و **کلاس** باشد. در همه‌ی حالات، `T` یک پارامتر تایپ است که در نقطه‌ی استفاده مشخص می‌شود.',
        code: `// تابع
const last = <T>(list: readonly T[]): T | undefined => list[list.length - 1];

// تایپ
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// اینترفیس
interface Store<T> { get(key: string): T | undefined }

// کلاس
class MemoryStore<T> implements Store<T> {
  private readonly map = new Map<string, T>();
  set(key: string, value: T): void { this.map.set(key, value); }
  get(key: string): T | undefined { return this.map.get(key); }
}

const store = new MemoryStore<number>();
store.set('a', 1);
const ok: Result<number> = { ok: true, value: store.get('a') ?? 0 };
console.log(last([1, 2, 3]), ok);`,
      },
      {
        h: 'گام ۳ — قواعد نام‌گذاری پارامترهای تایپ',
        p:
          'قرارداد جامعه: `T` (Type)، `K` (Key)، `V` (Value)، `E` (Element/Error)، `S`/`U` (پارامترهای دوم و سوم). برای دامنه‌های معنادار، نام توصیفی بهتر است: `TEntity`، `TResponse`.',
      },
      {
        h: 'گام ۴ — Generic پیش‌فرض (Default) و استنتاج',
        p:
          'می‌توانی مقدار پیش‌فرض بدهی: `<T = unknown>`. TypeScript معمولاً `T` را از آرگومان‌ها استنتاج می‌کند؛ نوشتن صریح `fn<string>(...)` فقط وقتی لازم است که استنتاج ناموفق یا بیش از حد گسترده باشد.',
        code: `function parse<T = unknown>(text: string): T {
  return JSON.parse(text) as T;
}

type User = { id: string; name: string };

const inferred = parse<User>('{"id":"1","name":"نیما"}');
const defaulted = parse('{"a":1}'); // T = unknown

console.log(inferred.name, typeof defaulted);`,
      },
    ],
    visual: 'generic-flow',
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۱',
        title: 'فرمول تشخیص نیاز به Generic',
        body:
          'دو سؤال: ۱) آیا تایپ خروجی به تایپ ورودی وابسته است؟ ۲) آیا تابع باید با تایپ‌های متفاوت **و حفظ دقت** کار کند؟ اگر پاسخ هر دو بله است → Generic. اگر فقط «هر چیزی» می‌خواهی → `unknown`.',
        equation: 'Generic = (وابستگی خروجی به ورودی) ∨ (نیاز به دقت در چند تایپ) — وگرنه unknown',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Generic را در اسکوپ محدود نگه دار',
        body:
          'یک Generic که در کل ماژول جریان دارد، فهم کد را سخت می‌کند. Generic را فقط در امضایی بگذار که لازم است و در بدنه تا حد ممکن با تایپ‌های مشخص کار کن.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'Generic بی‌فایده: `<T>(x: T) => void`',
        body:
          'اگر `T` فقط یک بار و در موقعیت ورودی استفاده شده و هیچ‌جا در خروجی یا قید ظاهر نمی‌شود، Generic هیچ ارزشی ندارد — همان `unknown` ساده‌تر و صادقانه‌تر است.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Generic در زمان اجرا وجود دارد؟',
        body:
          'پاسخ: «خیر. Genericها کاملاً در زمان کامپایل Erase می‌شوند؛ یک تابع Generic فقط یک پیاده‌سازی JavaScript دارد (برخلاف C++ template یا C# که برای هر تایپ کد تولید می‌شود). به این می‌گویند Type Erasure.»',
      },
    ],
    quiz: {
      q: 'چرا `function log<T>(value: T): void` یک Generic بی‌فایده است؟',
      options: [
        'چون `T` در خروجی یا قید استفاده نشده، پس `unknown` همان کار را صادقانه‌تر انجام می‌دهد',
        'چون Generic فقط برای کلاس‌ها مجاز است',
        'چون `void` نمی‌تواند بازگشتی یک Generic باشد',
        'چون TypeScript نمی‌تواند `T` را استنتاج کند',
      ],
      answer: 0,
      explain:
        'ارزش Generic در **حفظ رابطه‌ی تایپی** بین ورودی و خروجی است. وقتی خروجی `void` است و هیچ قیدی روی `T` نیست، هیچ رابطه‌ای حفظ نمی‌شود و `unknown` معادل و خواناتر است.',
    },
    lab: {
      task: 'یک تابع `zip` با Generic بنویس که دو آرایه را به آرایه‌ای از جفت‌ها تبدیل کند و تایپ دقیق حفظ شود.',
      starter: `function zip<A, B>(left: readonly A[], right: readonly B[]): [A, B][] {
  const length = Math.min(left.length, right.length);
  const result: [A, B][] = [];
  for (let i = 0; i < length; i++) {
    result.push([left[i] as A, right[i] as B]);
  }
  return result;
}

const names = ['نیما', 'سارا'];
const ages = [30, 25];
console.log(zip(names, ages));`,
      solution: `function zip<A, B>(a: readonly A[], b: readonly B[]): [A, B][] {
  return a.map((v, i) => [v, b[i] as B]).slice(0, b.length);
}`,
    },
  },

  {
    id: 'generic-types',
    chapter: 'ch10',
    titleFa: 'تایپ‌های Generic',
    titleEn: 'Generic Types',
    level: 'advanced',
    minutes: 40,
    goal: 'تایپ‌ها و اینترفیس‌های Generic بسازی، چند پارامتر و پیش‌فرض را مدیریت کنی و الگوهای واقعی را بشناسی.',
    steps: [
      {
        h: 'گام ۱ — تایپ Generic ساده',
        p:
          'یک تایپ Generic مثل یک **تابع در سطح تایپ** است: پارامتر می‌گیرد و تایپ جدید تولید می‌کند.',
        code: `type Box<T> = { readonly value: T };
type Nullable<T> = T | null;
type List<T> = readonly T[];

const stringBox: Box<string> = { value: 'سلام' };
const maybeNumber: Nullable<number> = null;
const names: List<string> = ['نیما', 'سارا'];

console.log(stringBox.value, maybeNumber, names.length);`,
      },
      {
        h: 'گام ۲ — چند پارامتر و پیش‌فرض‌ها',
        p:
          'تایپ‌های واقعی معمولاً چند پارامتر دارند. پارامترهای دارای پیش‌فرض باید **آخر** بیایند (مثل پارامترهای اختیاری تابع).',
        code: `type ApiResponse<TData, TError = { code: string; message: string }> =
  | { readonly ok: true; readonly data: TData }
  | { readonly ok: false; readonly error: TError };

type Users = { readonly users: readonly string[] };

const success: ApiResponse<Users> = { ok: true, data: { users: ['نیما'] } };
const failure: ApiResponse<Users, { code: 404 }> = { ok: false, error: { code: 404 } };

console.log(success.ok, failure.ok);`,
      },
      {
        h: 'گام ۳ — Generic بازگشتی (Recursive)',
        p:
          'تایپ Generic می‌تواند به خودش ارجاع دهد — پایه‌ی مدل‌سازی ساختارهای درختی، JSON و `DeepReadonly`.',
        code: `type Json =
  | string | number | boolean | null
  | readonly Json[]
  | { readonly [key: string]: Json };

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type Config = { server: { host: string; ports: number[] } };
type FrozenConfig = DeepReadonly<Config>;

const frozen: FrozenConfig = { server: { host: 'localhost', ports: [3000] } };
console.log(frozen.server.host, frozen.server.ports.length);`,
      },
      {
        h: 'گام ۴ — اینترفیس و کلاس Generic در عمل',
        p:
          'اینترفیس Generic برای قراردادها (Repository، Serializer) و کلاس Generic برای نگهدارندگان وضعیت (Store، Cache) استفاده می‌شود.',
        code: `interface Serializer<T> {
  serialize(value: T): string;
  deserialize(text: string): T;
}

class JsonCache<T> {
  private readonly entries = new Map<string, T>();
  constructor(private readonly serializer: Serializer<T>) {}

  set(key: string, value: T): void { this.entries.set(key, value); }
  get(key: string): T | undefined { return this.entries.get(key); }
  dump(): string { return this.serializer.serialize([...this.entries.values()]); }
}

const serializer: Serializer<readonly string[]> = {
  serialize: (v) => JSON.stringify(v),
  deserialize: (t) => JSON.parse(t) as string[],
};

const cache = new JsonCache<string>(serializer as Serializer<string>);
cache.set('a', 'value');
console.log(cache.get('a'), cache.dump());`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۲',
        title: 'فرمول «تایپ Generic = تابع تایپ»',
        body:
          'هر تایپ Generic را مثل یک تابع ببین: ورودی (پارامترهای تایپ) → خروجی (یک تایپ جدید). همان‌طور که توابع را کوچک و تک‌مسئولیتی می‌نویسی، تایپ‌های Generic را هم کوچک بنویس و با ترکیب، تایپ‌های بزرگ بساز.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'پارامترهای تایپ را نام‌گذاری معنادار بده',
        body:
          'در تایپ‌های عمومی با بیش از دو پارامتر، `T1`/`T2` غیرقابل خواندن است. `TData`/`TError`/`TKey`/`TValue` بنویس. نام خوب، امضا را مستندسازی می‌کند.',
      },
      {
        kind: 'trap',
        kicker: 'تله‌ی رایج',
        title: 'پارامتر پیش‌فرض قبل از پارامتر بدون پیش‌فرض',
        body:
          '`type X<T = string, U>` خطا می‌دهد. مثل توابع، پارامترهای دارای پیش‌فرض باید بعد از پارامترهای اجباری بیایند.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'Genericهای کتابخانه‌ی استاندارد را بخوان',
        body:
          '`Promise<T>`، `Map<K,V>`، `Array<T>`، `Record<K,V>` و `Partial<T>` را در `lib.es5.d.ts` باز کن و تعریفشان را بخوان. این بهترین آموزش رایگان Generic در دنیاست — فقط چند خط برای هرکدام.',
      },
    ],
    quiz: {
      q: 'در `type ApiResponse<TData, TError = Error>`، چرا `TError` می‌تواند پیش‌فرض داشته باشد ولی `TData` نه؟',
      options: [
        'چون پارامترهای دارای پیش‌فرض باید بعد از پارامترهای اجباری بیایند',
        'چون `TError` یک کلاس است',
        'چون TypeScript فقط یک پیش‌فرض اجازه می‌دهد',
        'چون پیش‌فرض فقط روی اینترفیس کار می‌کند',
      ],
      answer: 0,
      explain:
        'قاعده دقیقاً مثل پارامترهای تابع است: یک پارامتر اجباری نمی‌تواند بعد از یک پارامتر دارای پیش‌فرض بیاید، وگرنه فراخوانی `ApiResponse<X>` مبهم می‌شود.',
    },
    lab: {
      task: 'یک تایپ `Paginated<T>` با `items`، `page` و `totalPages` بساز و یک نمونه‌ی `Paginated<Lesson>` ایجاد کن.',
      starter: `type Paginated<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly totalPages: number;
};

type Lesson = { readonly id: string; readonly title: string };

const result: Paginated<Lesson> = {
  items: [{ id: '1', title: 'Generic Types' }],
  page: 1,
  totalPages: 12,
};

console.log(result.items[0]?.title, result.page, result.totalPages);`,
      solution: `type Paginated<T> = { readonly items: readonly T[]; readonly page: number; readonly totalPages: number };`,
    },
  },

  {
    id: 'generic-constraints',
    chapter: 'ch10',
    titleFa: 'قیدهای Generic (Constraints)',
    titleEn: 'Generic Constraints',
    level: 'advanced',
    minutes: 45,
    goal: '`extends` در Generic را مسلط شوی و قیدهای ترکیبی، `keyof` و `infer` را در مسائل واقعی به کار بگیری.',
    steps: [
      {
        h: 'گام ۱ — `T extends U` یعنی «T باید حداقل U باشد»',
        p:
          'قید به کامپایلر می‌گوید چه عملیاتی روی `T` مجاز است. بدون قید، `T` می‌تواند هر چیزی باشد و هیچ دسترسی عضو مجاز نیست.',
        code: `// ❌ بدون قید: value.length خطا می‌دهد
// function len<T>(v: T) { return v.length; }

// ✅ با قید:
function lengthOf<T extends { length: number }>(value: T): number {
  return value.length;
}

console.log(lengthOf('text'));       // string
console.log(lengthOf([1, 2, 3]));    // array
console.log(lengthOf({ length: 5 }));`,
      },
      {
        h: 'گام ۲ — الگوی طلایی `K extends keyof T`',
        p:
          'مهم‌ترین قید در کل TypeScript: کلید باید یکی از کلیدهای **واقعی** آبجکت باشد و تایپ بازگشتی دقیقاً تایپ همان فیلد است.',
        code: `function pluck<T, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = source[key];
  }
  return result;
}

const user = { id: 'u1', name: 'نیما', age: 30, email: 'n@x.com' };
const preview = pluck(user, ['id', 'name']);
console.log(preview); // { id: 'u1', name: 'نیما' } — age و email حذف شدند`,
      },
      {
        h: 'گام ۳ — قید با Union لیترال و Default',
        p:
          'می‌توانی قید را به یک Union محدود کنی تا فقط مقادیر مجاز پذیرفته شوند. ترکیب قید + پیش‌فرض، APIهای بسیار خوانا می‌سازد.',
        code: `type SortOrder = 'asc' | 'desc';

function sortBy<T, K extends keyof T>(
  items: readonly T[],
  key: K,
  order: SortOrder = 'asc',
): readonly T[] {
  return [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return order === 'asc' ? cmp : -cmp;
  });
}

const lessons = [
  { title: 'B', minutes: 40 },
  { title: 'A', minutes: 20 },
];

console.log(sortBy(lessons, 'title').map((l) => l.title).join(','));
console.log(sortBy(lessons, 'minutes', 'desc').map((l) => l.minutes).join(','));`,
      },
      {
        h: 'گام ۴ — قیدهای ترکیبی و `infer`',
        p:
          'می‌توان چند قید را با `&` ترکیب کرد. `infer` هم اجازه می‌دهد بخشی از یک تایپ را **استخراج** کنی — ابزار اصلی تایپ‌های پیشرفته.',
        code: `type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type ReturnOf<T> = T extends (...args: never[]) => infer R ? R : never;
type Awaited2<T> = T extends Promise<infer U> ? Awaited2<U> : T;

type A = ElementOf<readonly string[]>;      // string
type B = ReturnOf<() => number>;            // number
type C = Awaited2<Promise<Promise<boolean>>>; // boolean

// قید ترکیبی:
function describe<T extends { id: string } & { createdAt: Date }>(item: T): string {
  return \`\${item.id}@\${item.createdAt.getFullYear()}\`;
}

console.log(describe({ id: 'x', createdAt: new Date(0) }));
const vals: [A, B, C] = ['s', 1, true];
console.log(vals.length);`,
      },
      {
        h: 'گام ۵ — قید بازگشتی (`T extends Self<T>`)',
        p:
          'الگوی F-bounded polymorphism برای مقایسه‌پذیری و Builderها. قدرتمند ولی پیچیده؛ فقط وقتی لازم است استفاده کن.',
        code: `interface Comparable<T> { compareTo(other: T): number }

class Version implements Comparable<Version> {
  constructor(private readonly n: number) {}
  compareTo(other: Version): number { return this.n - other.n; }
}

function maxOf<T extends Comparable<T>>(items: readonly T[]): T | undefined {
  return items.reduce<T | undefined>(
    (best, cur) => (best === undefined || cur.compareTo(best) > 0 ? cur : best),
    undefined,
  );
}

console.log(maxOf([new Version(1), new Version(3), new Version(2)])?.compareTo(new Version(3)));`,
      },
    ],
    margins: [
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۳',
        title: 'فرمول «قید حداقل لازم»',
        body:
          'قید را فقط به اندازه‌ی عملیاتی که واقعاً در بدنه استفاده می‌کنی تنگ کن. قید بیش از حد تنگ، قابلیت استفاده‌ی مجدد را می‌کُشد؛ قید بیش از حد شل، بدنه کامپایل نمی‌شود. **قید = دقیقاً همان چیزی که بدنه لازم دارد.**',
        equation: 'قابلیت استفاده‌ی مجدد ∝ ۱ ÷ (سختی قید) — ولی صحت ∝ (سختی قید) ⇒ نقطه‌ی بهینه = حداقل قید لازم',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'قید را با یک type alias نام‌گذاری کن',
        body:
          'به‌جای تکرار `<T extends { id: string; createdAt: Date; updatedAt: Date }>` در ده تابع، `type Entity = {...}` بنویس و `<T extends Entity>` استفاده کن. تغییر قرارداد باید یک ویرایش باشد.',
      },
      {
        kind: 'method',
        kicker: 'روش یادگیری',
        title: 'قید را حذف کن و خطاها را بخوان',
        body:
          'برای فهمیدن اینکه یک قید دقیقاً چه کاری می‌کند، آن را حذف کن و ببین کدام خطوط بدنه خطا می‌دهند. آن خطاها دقیقاً همان عملیاتی هستند که قید مجاز کرده است.',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: '`K extends keyof T` چه تضمینی می‌دهد؟',
        body:
          'پاسخ: «دو تضمین: ۱) `K` فقط می‌تواند یکی از کلیدهای واقعی `T` باشد (غلط املایی غیرممکن می‌شود) ۲) تایپ `T[K]` دقیقاً تایپ همان فیلد است، پس بازگشتی کاملاً type-safe و دقیق داریم.»',
      },
    ],
    quiz: {
      q: 'در `function f<T extends { length: number }>(v: T): number { return v.length; }`، کدام آرگومان **قابل قبول نیست**؟',
      options: ['`{ size: 3 }`', '`"text"`', '`[1, 2, 3]`', '`{ length: 0 }`'],
      answer: 0,
      explain:
        'قید الزام می‌کند که پراپرتی `length` از نوع `number` است. `{ size: 3 }` این پراپرتی را ندارد. رشته و آرایه هر دو `length: number` دارند و آبجکت صریح هم قید را ارضا می‌کند.',
    },
    lab: {
      task: 'تابع `updateField` بنویس که یک آبجکت، یک کلید معتبر و مقدار جدید بگیرد و یک کپی به‌روز برگرداند — کاملاً تایپ‌امن.',
      starter: `function updateField<T extends object, K extends keyof T>(
  source: T,
  key: K,
  value: T[K],
): T {
  return { ...source, [key]: value };
}

const user = { id: 'u1', name: 'نیما', age: 30 };
const updated = updateField(user, 'name', 'سارا');
console.log(updated);

// ❌ updateField(user, 'name', 42) → خطا چون T[K] = string
// ❌ updateField(user, 'email', 'x') → خطا چون 'email' کلید نیست`,
      solution: `function updateField<T extends object, K extends keyof T>(src: T, key: K, value: T[K]): T {
  return { ...src, [key]: value };
}`,
    },
  },

  {
    id: 'ts-decorators',
    chapter: 'ch10',
    titleFa: 'Decorators',
    titleEn: 'Decorators',
    level: 'advanced',
    minutes: 45,
    goal: 'استاندارد TC39 Stage-3 (TypeScript 5+) را بفهمی، چهار نوع decorator را بشناسی و کاربرد واقعی‌شان را ببینی.',
    steps: [
      {
        h: 'گام ۱ — دو استاندارد متفاوت (مهم‌ترین نکته)',
        p:
          'TypeScript **دو** سیستم decorator دارد: ۱) Legacy با `experimentalDecorators` (که Angular و NestJS هنوز استفاده می‌کنند). ۲) استاندارد TC39 Stage-3 که از TS 5.0 **پیش‌فرض** است و به هیچ flag نیاز ندارد. این دو با هم ناسازگارند!',
        code: `// ✅ استاندارد جدید (TS 5.0+) — بدون هیچ flag:
function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = String(context.name);
  return function (this: This, ...args: Args): Return {
    console.log(\`→ \${name}(\${args.length} args)\`);
    const result = target.apply(this, args);
    console.log(\`← \${name} done\`);
    return result;
  };
}

class Service {
  @logged
  run(id: number): string { return \`ran \${id}\`; }
}

console.log(new Service().run(7));`,
      },
      {
        h: 'گام ۲ — پنج جایگاه decorator',
        p:
          '`@dec` می‌تواند روی **کلاس**، **متد**، **getter/setter**، **فیلد** و **پارامتر** (فقط legacy) بنشیند. هر جایگاه یک `context` متفاوت با `kind` مخصوص به خود دریافت می‌کند.',
        code: `function classDeco<T extends new (...args: never[]) => object>(
  target: T,
  context: ClassDecoratorContext,
) {
  return class extends target {
    override toString(): string { return \`[\${String(context.name)}]\`; }
  };
}

@classDeco
class Tagged {}

console.log(new Tagged().toString());`,
      },
      {
        h: 'گام ۳ — Decorator کاربردی: اندازه‌گیری زمان اجرا',
        p:
          'رایج‌ترین کاربرد واقعی: cross-cutting concerns مثل لاگ، زمان‌سنجی، کش، اعتبارسنجی و کنترل دسترسی — بدون آلوده‌کردن بدنه‌ی متد.',
        code: `function timed<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  return function (this: This, ...args: Args): Return {
    const started = performance.now();
    try {
      return target.apply(this, args);
    } finally {
      const ms = (performance.now() - started).toFixed(3);
      console.log(\`⏱ \${String(context.name)}: \${ms}ms\`);
    }
  };
}

class Compiler {
  @timed
  compile(lines: number): number {
    let sum = 0;
    for (let i = 0; i < lines; i++) sum += Math.sqrt(i);
    return sum;
  }
}

console.log(new Compiler().compile(20000).toFixed(0));`,
      },
      {
        h: 'گام ۴ — Accessor Decorator و `accessor` keyword',
        p:
          'TS 5.0 کلمه‌ی `accessor` را معرفی کرد که با decorator برای فیلدها کار می‌کند و به‌جای getter/setter دستی، یک جعبه‌ی قابل کنترل می‌دهد.',
        code: `function range(min: number, max: number) {
  return function (_value: number, context: ClassFieldDecoratorContext): (initial: number) => number {
    return function (initial: number): number {
      return Math.min(max, Math.max(min, initial));
    };
  };
}

class Settings {
  @range(0, 100)
  volume = 250; // → به 100 محدود می‌شود
}

console.log(new Settings().volume);`,
      },
      {
        h: 'گام ۵ — ترتیب اجرا و `addInitializer`',
        p:
          'Decoratorهای متد **پایین به بالا** ارزیابی می‌شوند ولی **بالا به پایین** اعمال می‌شوند. `context.addInitializer` اجازه می‌دهد کدی را در زمان ساخت نمونه اجرا کنی (برای ثبت‌نام، bind کردن و…).',
      },
    ],
    margins: [
      {
        kind: 'trap',
        kicker: 'تله‌ی بزرگ',
        title: 'Legacy در برابر Standard Decorators',
        body:
          'اگر `experimentalDecorators: true` در tsconfig داری، سینتکس **قدیمی** فعال است و کد آموزشی جدید کار نمی‌کند (و برعکس). قبل از هر کاری بررسی کن کدام استاندارد در پروژه‌ات فعال است. NestJS/Angular هنوز legacy هستند.',
      },
      {
        kind: 'cleancode',
        kicker: 'بهترین رویه',
        title: 'Decorator فقط برای Cross-Cutting Concerns',
        body:
          'منطق دامنه را داخل decorator نگذار. Decorator برای لاگ، متریک، کش، احراز هویت و اعتبارسنجی است — چیزهایی که در ده‌ها متد تکرار می‌شوند. اگر فقط یک متد از آن استفاده می‌کند، یک تابع ساده بنویس.',
      },
      {
        kind: 'formula',
        kicker: 'فرمول موفقیت ۵۴',
        title: 'فرمول «AOP = حذف تکرار عرضی»',
        body:
          'هر کدی که در N متد **تکرار** می‌شود ولی بخشی از منطق اصلی هیچ‌کدام نیست (لاگ، زمان‌سنجی، try/catch)، یک کاندیدای Decorator است. این همان DRY در بُعد «عرضی» معماری است.',
        equation: 'کاهش تکرار = (تعداد متدهای تزئین‌شده) × (خطوط کد cross-cutting حذف‌شده در هر متد)',
      },
      {
        kind: 'interview',
        kicker: 'سؤال مصاحبه',
        title: 'Decorator چیست و چه تفاوتی با Higher-Order Function دارد؟',
        body:
          'پاسخ: «Decorator یک تابع است که یک تعریف (کلاس/متد/فیلد) را می‌گیرد و نسخه‌ی تغییر یافته‌اش را برمی‌گرداند. تفاوت با HOF در **نحوه‌ی اتصال** است: decorator با سینتکس `@` به تعریف چسبانده می‌شود و metadata (`context`) دریافت می‌کند، ولی HOF صریحاً فراخوانی می‌شود.»',
      },
    ],
    quiz: {
      q: 'برای استفاده از Decoratorهای استاندارد TC39 در TypeScript 5.0+ چه چیزی لازم است؟',
      options: [
        'هیچ flag خاصی لازم نیست؛ کافی است `experimentalDecorators` روشن **نباشد**',
        '`experimentalDecorators: true` در tsconfig',
        'نصب پکیج `reflect-metadata`',
        '`emitDecoratorMetadata: true`',
      ],
      answer: 0,
      explain:
        'از TS 5.0 استاندارد جدید به‌صورت پیش‌فرض فعال است. `experimentalDecorators` مربوط به نسخه‌ی legacy است و روشن کردنش، استاندارد جدید را غیرفعال می‌کند. `reflect-metadata` فقط برای فریم‌ورک‌های DI قدیمی لازم است.',
    },
    lab: {
      task: 'یک decorator متد بنویس که خطاهای پرتاب‌شده را بگیرد و یک مقدار پیش‌فرض برگرداند.',
      starter: `function fallback<This, Args extends unknown[], Return>(
  defaultValue: Return,
) {
  return function (
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return function (this: This, ...args: Args): Return {
      try {
        return target.apply(this, args);
      } catch (err) {
        console.log(\`⚠️ \${String(context.name)} failed: \${String(err)}\`);
        return defaultValue;
      }
    };
  };
}

class RiskyService {
  @fallback('empty')
  fetch(id: number): string {
    if (id < 0) throw new Error('id منفی');
    return \`data-\${id}\`;
  }
}

const svc = new RiskyService();
console.log(svc.fetch(1));
console.log(svc.fetch(-1));`,
      solution: `function fallback<R>(dflt: R) {
  return (target: (...a: never[]) => R, ctx: ClassMethodDecoratorContext) =>
    function (...a: never[]) { try { return target(...a); } catch { return dflt; } };
}`,
    },
  },
];
