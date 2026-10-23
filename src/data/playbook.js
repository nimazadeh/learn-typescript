/* ==========================================================================
   Playbook — فرمول‌های موفقیت، روش‌های یادگیری علمی، مرور فاصله‌دار،
   بانک سؤال مصاحبه، پروژه‌های عملی و منابع معتبر
   ========================================================================== */

/* -------------------------------------------------------------------------- */
/* ۱) قوانین طلایی موفقیت (هسته‌ی حاشیه‌نویسی‌های استودیو)                     */
/* -------------------------------------------------------------------------- */
export const SUCCESS_FORMULAS = [
  {
    id: 'five-hour-architecture',
    icon: '⏱️',
    title: 'معماری روز ۵ ساعته',
    equation: '۵ ساعت = ۳× (۵۰ دقیقه کار عمیق + ۱۰ دقیقه استراحت) + ۲× (۵۰ + ۱۰)',
    body:
      '۵ ساعت پیوسته کار نمی‌کند؛ مغز بعد از ~۵۰ دقیقه افت تمرکز شدید دارد. روز را به پنج بلوک ۵۰ دقیقه‌ای با استراحت ۱۰ دقیقه‌ای تقسیم کن. در استراحت **هیچ صفحه‌نمایشی** نبیند (پیاده‌روی، آب، حرکات کششی) تا حافظه تثبیت شود.',
    impact: 'بازدهی مؤثر ~۴.۲ ساعت به‌جای ~۲.۵ ساعت مطالعه‌ی پیوسته',
  },
  {
    id: 'active-recall',
    icon: '🧠',
    title: 'بازیابی فعال (Active Recall)',
    equation: 'یادگیری = تلاش برای به‌خاطرآوردن، نه بازخوانی',
    body:
      'بازخوانی درس، توهم تسلط می‌سازد. بعد از هر درس کتاب را ببند و بپرس: «سه نکته‌ی کلیدی چه بود؟» اگر نتوانستی بگویی، یاد نگرفته‌ای. در این استودیو، ستون Type X-Ray و کوییزها دقیقاً همین کار را مکانیزه می‌کنند.',
    impact: '۲ تا ۳ برابر ماندگاری نسبت به بازخوانی منفعل',
  },
  {
    id: 'spaced-repetition',
    icon: '📅',
    title: 'مرور فاصله‌دار (Spaced Repetition)',
    equation: 'فاصله‌ی مرور: ۱ → ۳ → ۷ → ۱۴ → ۳۰ روز',
    body:
      'منحنی فراموشی ابینگهاوس می‌گوید بدون مرور، ~۷۰٪ مطلب در ۲۴ ساعت می‌پرد. هر بار که درست در آستانه‌ی فراموشی مرور کنی، منحنی صاف‌تر می‌شود. بخش «مرور فاصله‌دار» همین استودیو کارت‌ها را بر اساس همین فاصله‌ها زمان‌بندی می‌کند.',
    impact: 'انتقال از حافظه‌ی کوتاه‌مدت به بلندمدت با ~۲۰ دقیقه مرور روزانه',
  },
  {
    id: 'feynman',
    icon: '🗣️',
    title: 'تکنیک فاینمن',
    equation: 'اگر نتوانی ساده توضیح دهی، نفهمیده‌ای',
    body:
      'بعد از هر درس، در ستون حاشیه‌نویسی با **زبان خودت و بدون اصطلاح** توضیح بده چه یاد گرفتی. هر جا گیر کردی یا مجبور شدی از واژه‌ی تخصصی استفاده کنی، همان‌جا شکاف دانشی توست — برگرد و همان قسمت را دوباره بخوان.',
    impact: 'شناسایی دقیق شکاف‌های دانش به‌جای توهم تسلط',
  },
  {
    id: 'error-driven',
    icon: '💥',
    title: 'یادگیری خطا-محور',
    equation: 'خطای عمدی + خواندن پیام کامل کامپایلر = یادگیری ماندگار',
    body:
      'برای هر مفهوم، اول کد را بشکن: تایپ غلط بده، فیلد را حذف کن، `!` بگذار. پیام خطای tsc را **کامل** بخوان و حدس بزن چرا. سپس اصلاح کن. پیام خطا به قلاب حافظه تبدیل می‌شود و در پروژه‌ی واقعی، همان خطا را در دو ثانیه تشخیص می‌دهی.',
    impact: 'تسلط بر ~۳۰ کد خطای پرکاربرد TS در دو هفته',
  },
  {
    id: 'project-first',
    icon: '🏗️',
    title: 'پروژه‌محوری (Project-First)',
    equation: 'دانش بدون کاربرد = ۸۰٪ فراموشی در ۳۰ روز',
    body:
      'بعد از هر فصل، یک مینی‌پروژه بساز (فهرست پروژه‌ها در همین استودیو). تایپ‌ها را روی داده‌ی **واقعی** تمرین کن: یک API، یک فرم، یک state machine. یادگیری بدون کاربرد، فقط انباشت اطلاعات است نه مهارت.',
    impact: 'تبدیل دانش به مهارت قابل نمایش در رزومه و مصاحبه',
  },
  {
    id: 'dri-types',
    icon: '♻️',
    title: 'DRY در سطح تایپ',
    equation: 'یک منبع حقیقت → n تایپ مشتق',
    body:
      'هرگز یک فیلد را در دو تایپ تکرار نکن. از `keyof`، `typeof`، `Pick`، `Omit`، `ReturnType` و `as const` مشتق کن. معیار سلامت: با تغییر یک فیلد در تایپ منبع، **صفر** تایپ دیگر نیاز به ویرایش دستی داشته باشد.',
    impact: 'حذف کامل ناهمگامی تایپ‌ها و کاهش ۶۰٪ حجم کد تایپی',
  },
  {
    id: 'strict-from-day-one',
    icon: '🔒',
    title: 'سخت‌گیری از روز اول',
    equation: 'هزینه‌ی strict ∝ اندازه‌ی کدبیس در لحظه‌ی فعال‌سازی',
    body:
      '`strict: true` را در اولین commit بگذار، نه در ماه ششم. هزینه‌ی فعال‌کردنش در یک پروژه‌ی ۱۰۰۰ خطی یک ساعت است و در یک پروژه‌ی ۱۰۰٬۰۰۰ خطی یک ماه. سخت‌گیری فقط باید افزایش یابد، هرگز کاهش.',
    impact: 'حذف ~۷ دسته باگ کلاسیک از همان ابتدا',
  },
  {
    id: 'boundary-law',
    icon: '🚧',
    title: 'قانون مرزها',
    equation: '۸۰٪ باگ‌های تایپی واقعی از مرزهای بدون اعتبارسنجی می‌آیند',
    body:
      'تایپ‌ها در مرزهای سیستم (API، فرم، فایل، localStorage، event) بیشترین ارزش و بیشترین خطر را دارند. در مرز `unknown` بگیر، یک‌بار پارس کن، و در هسته فقط تایپ دقیق جریان بده. این الگو (Parse, don\'t validate) بررسی‌های تکراری را از ده‌ها تابع حذف می‌کند.',
    impact: 'حذف باگ‌های زمان اجرای داده‌ی بیرونی و ساده‌سازی هسته‌ی برنامه',
  },
  {
    id: 'feedback-loop',
    icon: '⚡',
    title: 'کوتاه‌کردن حلقه‌ی بازخورد',
    equation: 'سرعت یادگیری ∝ ۳۶۰۰ ÷ زمان هر چرخه‌ی ویرایش→نتیجه',
    body:
      'ابزارت را طوری بچین که فاصله‌ی ذخیره تا دیدن نتیجه زیر ۲ ثانیه باشد: `tsx watch` + `tsc --noEmit --watch` + همین استودیو با کامپایل زنده. هرچه حلقه کوتاه‌تر، تکرار بیشتر در ساعت، و یادگیری نمایی سریع‌تر.',
    impact: '۱۰ برابر تعداد تکرارهای تمرینی در یک جلسه‌ی ۵ ساعته',
  },
  {
    id: 'teach-to-learn',
    icon: '🎓',
    title: 'یاددادن برای یادگرفتن',
    equation: 'بازده یادگیری: خواندن ۱۰٪ ← نوشتن ۴۰٪ ← یاددادن ۹۰٪',
    body:
      'هر هفته یک مفهوم را در یک پست، توییت، یا یک کامنت بلند برای خودت توضیح بده. وقتی مجبوری مطلب را **ساختار** بدهی و به سؤال پاسخ دهی، شکاف‌های دانش بی‌رحمانه آشکار می‌شوند.',
    impact: 'تثبیت عمیق + ساخت نمونه‌کار عمومی برای رزومه',
  },
  {
    id: 'interview-driven',
    icon: '🎯',
    title: 'یادگیری مصاحبه‌محور',
    equation: 'هر درس = یک سؤال مصاحبه که باید بتوانی پاسخ دهی',
    body:
      'برای هر درس، سؤال مصاحبه‌ی مرتبطش را (در ستون حاشیه‌نویسی) با صدای بلند پاسخ بده. این کار دو سود دارد: دانش را به شکل قابل بیان (نه فقط قابل خواندن) ذخیره می‌کند و آماده‌ی مصاحبه‌ی واقعی می‌شوی.',
    impact: 'آمادگی هم‌زمان فنی و بیانی برای مصاحبه‌های Senior',
  },
];

/* -------------------------------------------------------------------------- */
/* ۲) روش‌های مطالعه‌ی مؤثر (چطور درس بخوانی)                                 */
/* -------------------------------------------------------------------------- */
export const STUDY_METHODS = [
  {
    icon: '🔎',
    title: 'قانون سه‌گذر (Three-Pass Rule)',
    body:
      'گذر ۱ (۱۰ دقیقه): فقط عناوین، هدف درس و دیاگرام‌ها — نقشه‌ی کلی را بساز. گذر ۲ (۳۰ دقیقه): بدنه‌ی درس + اجرای کدها در آزمایشگاه. گذر ۳ (۱۰ دقیقه): کوییز + نوشتن خلاصه‌ی فاینمن در حاشیه. سه گذر کوتاه مؤثرتر از یک گذر طولانی است.',
  },
  {
    icon: '✍️',
    title: 'کد را با دست بنویس، کپی نکن',
    body:
      'هرگز کد درس را copy-paste نکن. تایپ کردن دستی، حافظه‌ی عضلانی سینتکس (`extends`، `infer`، `<K in keyof T>`) را می‌سازد. در مصاحبه‌ی عملی هیچ auto-complete ای نداری.',
  },
  {
    icon: '🔮',
    title: 'اول پیش‌بینی کن، بعد اجرا',
    body:
      'قبل از زدن دکمه‌ی Run، تایپ استنتاج‌شده و خروجی را روی کاغذ بنویس. بعد مقایسه کن. پیش‌بینی + بازخورد فوری قوی‌ترین ترکیب یادگیری است؛ اجرا بدون پیش‌بینی فقط تماشای کد است.',
  },
  {
    icon: '🧪',
    title: 'هر درس را با سه حالت آزمایش کن',
    body:
      'برای هر تایپ: ۱) حالت معتبر ۲) حالت نامعتبر (باید خطا بدهد) ۳) حالت مرزی (empty، null، Union بزرگ). کسی که فقط حالت خوش‌بینانه را تست می‌کند، مفهوم را یاد نگرفته است.',
  },
  {
    icon: '🗂️',
    title: 'دفترچه‌ی کدهای خطا (Error Journal)',
    body:
      'یک فایل `errors.md` بساز و هر خطای جالب را با فرمت سه‌بخشی ثبت کن: «کد خطا + چه نوشتی + چرا اشتباه بود». بعد از ۵۰ رکورد، تو یک راهنمای شخصی داری که هیچ کتابی ندارد.',
  },
  {
    icon: '⏸️',
    title: 'قانون ۲۵ دقیقه گیرکردن',
    body:
      'اگر ۲۵ دقیقه روی یک خطا گیر کردی، کمک بگیر (Playground، جست‌وجوی کد خطا، AI). ادامه‌ی فرسایشی فقط انگیزه را می‌کُشد. ولی قبل از پذیرش جواب، حتماً علت را بنویس.',
  },
  {
    icon: '🌙',
    title: 'خواب به‌عنوان بخشی از برنامه',
    body:
      'تثبیت حافظه در خواب عمیق اتفاق می‌افتد. ۵ ساعت مطالعه + ۶ ساعت خواب، نتیجه‌ی کمتری از ۴ ساعت مطالعه + ۸ ساعت خواب دارد. شب قبل از خواب، ۱۰ دقیقه مرور کارت‌ها بازدهی را چند برابر می‌کند.',
  },
  {
    icon: '📊',
    title: 'اندازه‌گیری هفتگی',
    body:
      'هر جمعه سه عدد را ثبت کن: درس‌های تکمیل‌شده، دقایق مطالعه، درصد موفقیت کوییزها. روندها انگیزه می‌سازند و نقاط ضعف را نشان می‌دهند. آنچه اندازه‌گیری نشود، مدیریت نمی‌شود.',
  },
];

/* -------------------------------------------------------------------------- */
/* ۳) کارت‌های مرور فاصله‌دار (Flashcards)                                     */
/* -------------------------------------------------------------------------- */
export const FLASHCARDS = [
  { id: 'fc-1', topic: 'انواع پایه', front: 'هفت خروجی ممکن عملگر `typeof` در زمان اجرا کدام‌اند؟', back: '`"string"`، `"number"`، `"boolean"`، `"undefined"`، `"object"`، `"function"`، `"symbol"`، `"bigint"` — توجه: `typeof null === "object"`.' },
  { id: 'fc-2', topic: 'انواع پایه', front: 'تفاوت `null` و `undefined` در TypeScript چیست؟', back: '`undefined` یعنی مقدار هرگز اختصاص نیافته (سیستمی)؛ `null` یعنی عمدتاً «هیچ» گذاشته شده (برنامه‌نویس). هر دو تایپ جدا هستند و با strictNullChecks باید صریح مدیریت شوند.' },
  { id: 'fc-3', topic: 'Assertion', front: 'تفاوت `as` و `satisfies` چیست؟', back: '`as` یک **ادعا**ست (تایپ را تغییر می‌دهد، بررسی کامل نمی‌کند). `satisfies` یک **بررسی** است (سازگاری را می‌سنجد ولی تایپ استنتاج‌شده‌ی دقیق را حفظ می‌کند).' },
  { id: 'fc-4', topic: 'Assertion', front: '`as const` چه سه تغییری ایجاد می‌کند؟', back: '۱) مقادیر به لیترال تبدیل می‌شوند ۲) همه‌ی پراپرتی‌ها `readonly` می‌شوند ۳) آرایه‌ها به Tuple فقط‌خواندنی تبدیل می‌شوند — به‌صورت بازگشتی و عمقی.' },
  { id: 'fc-5', topic: 'انواع بالا/پایین', front: 'چرا `unknown` امن‌تر از `any` است؟', back: '`any` بررسی را در هر دو جهت خاموش می‌کند؛ `unknown` ورودی آزاد می‌دهد ولی هر استفاده‌ای را بدون Narrowing ممنوع می‌کند. پس `unknown` تو را مجبور به اثبات تایپ می‌کند.' },
  { id: 'fc-6', topic: 'انواع بالا/پایین', front: 'سه کاربرد طلایی `never` کدام‌اند؟', back: '۱) توابعی که هرگز برنمی‌گردند (throw/حلقه بی‌پایان) ۲) Exhaustiveness Checking با `assertNever` ۳) فیلتر کردن اعضا در Conditional Types (پایه‌ی `Exclude` و `NonNullable`).' },
  { id: 'fc-7', topic: 'Narrowing', front: 'هفت ابزار باریک‌سازی تایپ کدام‌اند؟', back: '`typeof`، `instanceof`، `in`، بررسی برابری (`===` / `== null`)، Truthiness، Discriminant property (switch روی `kind`)، و Type Predicate سفارشی (`x is T`).' },
  { id: 'fc-8', topic: 'Narrowing', front: 'چرا `arr.filter(x => x !== undefined)` تایپ را باریک نمی‌کند؟', back: 'چون امضای عمومی `filter` تایپ عنصر را حفظ می‌کند. باید یک Type Predicate بنویسی: `arr.filter((x): x is string => x !== undefined)` تا نتیجه `string[]` شود.' },
  { id: 'fc-9', topic: 'ترکیب تایپ', front: 'نتیجه‌ی `keyof (A | B)` و `keyof (A & B)` چیست؟', back: '`keyof (A | B)` = کلیدهای **مشترک** (اشتراک)؛ `keyof (A & B)` = کلیدهای **هر دو** (اجتماع). چون مقدار `A | B` می‌تواند هر کدام باشد، فقط کلید مشترک امن است.' },
  { id: 'fc-10', topic: 'ترکیب تایپ', front: 'چرا `string & number` عملاً `never` است؟', back: 'چون Intersection اشتراک مجموعه‌ی مقادیر است و هیچ مقداری نمی‌تواند هم رشته باشد هم عدد؛ پس مجموعه تهی می‌شود.' },
  { id: 'fc-11', topic: 'Utility', front: 'تعریف داخلی `Partial`، `Required`، `Readonly` و `Pick` را بنویس.', back: '`Partial<T> = { [K in keyof T]?: T[K] }` · `Required<T> = { [K in keyof T]-?: T[K] }` · `Readonly<T> = { readonly [K in keyof T]: T[K] }` · `Pick<T,K> = { [P in K]: T[P] }`' },
  { id: 'fc-12', topic: 'Utility', front: 'چرا `Omit` روی یک Union نتیجه‌ی غیرمنتظره می‌دهد؟', back: 'چون `Omit` توزیع‌شده نیست و ابتدا `keyof (A|B)` (اشتراک کلیدها) را می‌گیرد. راه‌حل: `type DistributiveOmit<T,K> = T extends unknown ? Omit<T,K> : never`.' },
  { id: 'fc-13', topic: 'Utility', front: 'تفاوت `Exclude` و `Extract` چیست؟', back: '`Exclude<T,U> = T extends U ? never : T` (تفریق مجموعه: T − U) و `Extract<T,U> = T extends U ? T : never` (اشتراک مجموعه: T ∩ U). هر دو روی Union توزیع می‌شوند.' },
  { id: 'fc-14', topic: 'Utility', front: 'خروجی `Awaited<ReturnType<typeof f>>` برای `async function f(): Promise<User[]>` چیست؟', back: '`User[]`. چون `ReturnType` یک `Promise<User[]>` می‌دهد و `Awaited` به‌صورت بازگشتی Promiseها را باز می‌کند.' },
  { id: 'fc-15', topic: 'Utility', front: '`Parameters<T>` چه چیزی برمی‌گرداند و چرا Tuple است؟', back: 'یک Tuple از تایپ پارامترها با برچسب‌های اصلی، مثل `[a: string, b: number]`. Tuple بودن اجازه می‌دهد با `fn(...args)` آن را spread کنی.' },
  { id: 'fc-16', topic: 'پیشرفته', front: 'چه زمانی یک Conditional Type روی Union توزیع می‌شود؟', back: 'فقط وقتی طرف چپ `extends` یک **پارامتر Generic برهنه** باشد (`T extends U`). با `[T] extends [U]` توزیع غیرفعال می‌شود و کل Union یک واحد در نظر گرفته می‌شود.' },
  { id: 'fc-17', topic: 'پیشرفته', front: 'چهار بخش سازنده‌ی هر Mapped Type کدام‌اند؟', back: '۱) منبع کلیدها (`keyof T` یا یک Union) ۲) فیلتر/تغییرنام کلید (`as ... | never`) ۳) modifierها (`readonly`/`?` با `+`/`-`) ۴) تایپ مقدار (`T[K]` یا هر عبارت).' },
  { id: 'fc-18', topic: 'پیشرفته', front: 'قاعده‌ی Variance توابع را بنویس.', back: 'پارامترها **Contravariant** (ورودی پهن‌تر مجاز است) و بازگشتی **Covariant** (خروجی باریک‌تر مجاز است). `(A→B) ⊆ (C→D)` اگر `C ⊆ A` و `B ⊆ D`.' },
  { id: 'fc-19', topic: 'پیشرفته', front: 'چطور تایپ «نام getterهای یک آبجکت» را می‌سازی؟', back: 'با Mapped Type + Key Remapping + Template Literal: `{ [K in keyof T as \\`get${Capitalize<string & K>}\\`]: () => T[K] }`.' },
  { id: 'fc-20', topic: 'ماژول‌ها', front: 'چه فایلی «ماژول» و چه فایلی «اسکریپت سراسری» است؟', back: 'فایلی با حداقل یک `import`/`export` سطح‌بالا یک ماژول با اسکوپ اختصاصی است. بدون آن، یک اسکریپت سراسری است و همه‌ی اعلان‌هایش به اسکوپ جهانی می‌روند (منبع تداخل نام).' },
  { id: 'fc-21', topic: 'ماژول‌ها', front: 'چرا برای `declare global` به `export {}` نیاز داریم؟', back: 'چون در یک اسکریپت سراسری، اعلان‌ها از قبل جهانی‌اند و `declare global` بی‌اثر/نامعتبر است. `export {};` فایل را ماژول می‌کند تا آن بلوک معنا پیدا کند.' },
  { id: 'fc-22', topic: 'ابزارها', front: 'تفاوت `tsc --noEmit` و `tsx src/index.ts` چیست؟', back: '`tsc --noEmit` type checking کامل بدون تولید فایل (دروازه‌ی CI). `tsx` فقط ترنسپایل سریع بدون هیچ بررسی تایپی (حلقه‌ی توسعه). برای اطمینان، هر دو لازم‌اند.' },
  { id: 'fc-23', topic: 'ابزارها', front: 'چهار پرچم سخت‌گیرانه که در `strict` نیستند کدام‌اند؟', back: '`noUncheckedIndexedAccess`، `exactOptionalPropertyTypes`، `noImplicitOverride` و `noImplicitReturns` (به‌همراه `noUnusedLocals`/`noUnusedParameters` برای کد مرده).' },
  { id: 'fc-24', topic: 'ابزارها', front: 'کامنت `// ^?` چه می‌کند؟', back: 'یک Type Query (از Twoslash) است که تایپ استنتاج‌شده‌ی عبارت خط بالایی را دقیقاً در همان نقطه چاپ می‌کند — ابزار اصلی دیباگ تایپ‌های پیچیده.' },
];

/* -------------------------------------------------------------------------- */
/* ۴) بانک سؤال مصاحبه                                                          */
/* -------------------------------------------------------------------------- */
export const INTERVIEW_BANK = [
  { level: 'junior', q: 'تفاوت `interface` و `type` چیست و کدام را کجا انتخاب می‌کنی؟', a: '`interface` فقط شکل آبجکت را توصیف می‌کند، از Declaration Merging پشتیبانی می‌کند و تداخل `extends` را صریح خطا می‌دهد. `type` می‌تواند Union، Tuple، Primitive alias و Mapped/Conditional باشد. پیش‌فرض من `type` است و `interface` را فقط برای API عمومی قابل گسترش یا سلسله‌مراتب `extends` انتخاب می‌کنم؛ مهم‌تر از انتخاب، یکدستی در کدبیس است.' },
  { level: 'junior', q: '`any` و `unknown` چه تفاوتی دارند؟', a: '`any` بررسی را در هر دو جهت خاموش می‌کند و مسری است. `unknown` انتساب ورودی را آزاد می‌گذارد ولی هر استفاده‌ای را بدون Narrowing ممنوع می‌کند. پس برای داده‌ی بیرونی همیشه `unknown` + گارد.' },
  { level: 'junior', q: 'Type Widening چیست و چطور کنترلش می‌کنی؟', a: 'فرایندی که تایپ لیترال دقیق به تایپ پایه گسترش می‌یابد (مثلاً `let x = "a"` → `string`). سه راه کنترل: `const`، annotation صریح لیترال، و `as const` برای ساختارهای تودرتو.' },
  { level: 'junior', q: 'تفاوت `==` و `===` و تنها استفاده‌ی مجاز `==` چیست؟', a: '`==` تبدیل اجباری انجام می‌دهد (`0 == ""` → true) و `===` نه. تنها استفاده‌ی پذیرفته‌شده‌ی `==` عبارت `value == null` است که دقیقاً معادل `value === null || value === undefined` است.' },
  { level: 'junior', q: 'خروجی `0 ?? 42` و `0 || 42` چیست؟', a: '`??` فقط `null`/`undefined` را جایگزین می‌کند پس `0` می‌دهد؛ `||` هر falsy را جایگزین می‌کند پس `42` می‌دهد. برای مقدار پیش‌فرض همیشه `??` صحیح‌تر است.' },

  { level: 'mid', q: 'Discriminated Union چیست و چرا قدرتمند است؟', a: 'یک Union از object typeها که همه یک فیلد مشترک با مقادیر لیترال یکتا دارند (`kind`). با `switch` روی آن فیلد، کامپایلر هر شاخه را خودکار Narrow می‌کند و با `assertNever` در default، پوشش کامل در زمان کامپایل تضمین می‌شود. مزیت بزرگ: «حالت‌های نامعتبر غیرقابل بیان می‌شوند».' },
  { level: 'mid', q: 'Structural Typing در برابر Nominal Typing چیست و چطور Nominal را شبیه‌سازی می‌کنی؟', a: 'در TypeScript سازگاری بر اساس **شکل** است نه نام؛ دو تایپ هم‌شکل سازگارند. برای شبیه‌سازی Nominal از Branded Type استفاده می‌کنم: `type UserId = string & { readonly __brand: "UserId" }` تا `UserId` و `OrderId` جابه‌جانشدنی نباشند.' },
  { level: 'mid', q: '`satisfies` چه مشکلی را حل کرد؟', a: 'قبلاً مجبور بودی بین «اعتبارسنجی با annotation» (که استنتاج دقیق و لیترال‌ها را از بین می‌برد) و «بدون annotation» (که هیچ بررسی ندارد) یکی را انتخاب کنی. `satisfies` هر دو را می‌دهد: سازگاری بررسی می‌شود و تایپ استنتاج‌شده‌ی دقیق حفظ می‌شود. ترکیب `as const satisfies T` قدرتمندترین شکل آن است.' },
  { level: 'mid', q: 'چطور Exhaustiveness را در یک `switch` تضمین می‌کنی؟', a: 'با یک تابع `assertNever(value: never): never` در شاخه‌ی default. اگر همه‌ی اعضا پوشش داده شوند، تایپ متغیر در default به `never` باریک می‌شود و انتساب مجاز است؛ در غیر این صورت خطای TS2345 می‌گیرم که دقیقاً عضو جامانده را نشان می‌دهد.' },
  { level: 'mid', q: 'چرا `Omit<User, "passwrd">` (با غلط املایی) خطرناک است؟', a: 'چون امضای `Omit<T, K extends keyof any>` هر کلیدی را می‌پذیرد؛ پس غلط املایی نه خطا می‌دهد نه فیلدی حذف می‌کند و `password` بی‌صدا در خروجی می‌ماند. راه‌حل: `type OmitStrict<T, K extends keyof T> = Omit<T, K>` یا استفاده از `Pick` (allowlist) برای داده‌های حساس.' },
  { level: 'mid', q: 'Variance را توضیح بده و بگو چرا آرایه‌های تغییرپذیر ناامن‌اند؟', a: 'برای توابع: پارامترها Contravariant و بازگشتی Covariant. ولی `T[]` در TypeScript به دلایل تاریخی Covariant ناسالم است: `string[]` به `(string|number)[]` منتسب می‌شود و سپس `push(1)` آرایه‌ی اصلی را آلوده می‌کند. راه‌حل: در امضاهای عمومی `readonly T[]` استفاده کنم.' },
  { level: 'mid', q: 'چطور داده‌ی یک API خارجی را تایپ‌دار می‌کنی؟', a: 'الگوی Parse-don\'t-validate: در مرز `unknown` می‌گیرم، یک گارد یا schema (zod) را اعمال می‌کنم و تایپ را از schema مشتق می‌کنم (`z.infer`). از آن نقطه به بعد، هسته‌ی برنامه فقط تایپ دقیق می‌بیند و هیچ `as` یا `!` لازم نیست.' },

  { level: 'senior', q: 'یک Mapped Type بنویس که فقط فیلدهای تابعی یک تایپ را نگه دارد.', a: '`type OnlyFunctions<T> = { [K in keyof T as T[K] extends (...a: never[]) => unknown ? K : never]: T[K] }`. بخش `as ... : never` کلیدهای غیرتابعی را حذف می‌کند (Key Remapping با never).' },
  { level: 'senior', q: 'چطور یک Conditional Type را از توزیع شدن روی Union منع می‌کنی و چرا لازم است؟', a: 'با پیچیدن هر دو طرف در Tuple: `[T] extends [U] ? X : Y`. لازم است وقتی می‌خواهم کل Union را یک واحد ببینم؛ مثلاً `IsNever<T> = [T] extends [never] ? true : false` (نسخه‌ی توزیع‌شده همیشه false می‌دهد) یا بررسی «آیا T دقیقاً boolean است».' },
  { level: 'senior', q: 'خطای TS2589 (excessively deep) چه‌طور ایجاد و رفع می‌شود؟', a: 'وقتی بازگشت تایپ از سقف عمق کامپایلر (~۵۰ سطح) می‌گذرد؛ معمولاً در DeepPartial/DeepReadonly روی ساختارهای بازگشتی یا Template Literal با Unionهای بزرگ. رفع: شرط پایه‌ی دقیق‌تر (تابع/آرایه/Map اول)، محدودکردن عمق با Tuple شمارنده، یا ساده‌سازی به نسخه‌ی کم‌عمق.' },
  { level: 'senior', q: 'چطور تایپ‌های یک SDK را طراحی می‌کنی که هم Type-safe باشد هم Ergonomic؟', a: '۱) ورودی‌ها با Generic + Constraint (`K extends keyof T`) تا استنتاج خودکار کار کند. ۲) خروجی‌ها با تایپ صریح و `Awaited<ReturnType<>>` برای async. ۳) Options Object با `Partial` و پیش‌فرض‌های متمرکز. ۴) Builder Pattern با `this` polymorphic برای زنجیره‌ها. ۵) `satisfies` در تست‌ها برای قفل کردن قراردادها بدون از دست دادن دقت.' },
  { level: 'senior', q: 'استراتژی مهاجرت یک کدبیس ۱۰۰ هزار خطی JS به TS چیست؟', a: 'فازبندی: ۱) `allowJs: true` بدون strict و افزودن CI typecheck. ۲) نوشتن `.d.ts` برای مرزها و پکیج‌های بدون تایپ. ۳) فعال‌کردن `strictNullChecks` و رفع خطاها از لبه‌ها به هسته. ۴) تبدیل فایل‌ها به `.ts` بر اساس ترافیک و ریسک (نه الفبا). ۵) فعال‌کردن `strict` کامل و ممنوعیت `any` جدید با ESLint. در همه‌ی مراحل: قانون «بدون شکستن build» و یک اسکریپت `typecheck` در pre-commit.' },
];

/* -------------------------------------------------------------------------- */
/* ۵) پروژه‌های عملی (از مبتدی تا پیشرفته)                                     */
/* -------------------------------------------------------------------------- */
export const PROJECTS = [
  {
    id: 'proj-1',
    level: 'beginner',
    title: 'سیستم مدیریت برنامه‌ی مطالعه',
    afterChapter: 'ch6',
    skills: ['Union Types', 'Discriminated Union', 'Narrowing', 'Array methods', 'readonly'],
    spec:
      'یک CLI/ماژول که لیست درس‌ها را نگه می‌دارد. هر درس یک Discriminated Union با سه وضعیت است (`planned` / `studying` / `done` با نمره). توابع: افزودن درس، تغییر وضعیت، محاسبه‌ی آمار هفتگی، و چاپ گزارش. همه‌ی داده‌ها `readonly` و هیچ `any` مجاز نیست.',
    acceptance: [
      'افزودن یک وضعیت جدید به Union بدون به‌روزرسانی `switch`ها باید خطای کامپایل بدهد (assertNever).',
      'هیچ تابعی آرایه‌ی ورودی را تغییر ندهد (`readonly T[]`).',
      'آمار با `reduce` و بدون `for` حلقه‌ی دستی محاسبه شود.',
    ],
  },
  {
    id: 'proj-2',
    level: 'beginner',
    title: 'پارسر پیکربندی نوع‌دار (Config Parser)',
    afterChapter: 'ch3',
    skills: ['unknown', 'Type Guards', 'satisfies', 'as const', 'DeepReadonly'],
    spec:
      'یک تابع `parseConfig(input: unknown): AppConfig` که یک JSON خام را می‌گیرد، با گاردهای دستی اعتبارسنجی می‌کند، مقدارهای پیش‌فرض را اعمال می‌کند و یک کانفیگ `DeepReadonly` برمی‌گرداند. هیچ `as any` و هیچ `!` مجاز نیست.',
    acceptance: [
      'ورودی نامعتبر باید `Result<Config, ConfigError>` برگرداند نه throw.',
      'مقادیر پیش‌فرض در یک `const DEFAULTS ... as const satisfies AppConfig` متمرکز باشند.',
      'برای هر خطا یک کد و پیام فارسی/انگلیسی دقیق برگردانده شود.',
    ],
  },
  {
    id: 'proj-3',
    level: 'intermediate',
    title: 'لایه‌ی Repository با Generic',
    afterChapter: 'ch10',
    skills: ['Generics', 'Constraints', 'interface', 'Promise', 'Repository pattern'],
    spec:
      'یک `interface Repository<TEntity extends { id: string }>` با متدهای `findById`, `findAll`, `save`, `deleteById`. دو پیاده‌سازی: `InMemoryRepository<T>` و یک `FilteredRepository<T>` که یک Repository دیگر را می‌پوشاند (Decorator pattern) و فقط بر اساس یک predicate نتیجه می‌دهد.',
    acceptance: [
      'هر دو پیاده‌سازی بدون هیچ کد تکراری مشترک کار کنند (DRY).',
      'تایپ بازگشتی `findById` دقیقاً `TEntity | null` باشد نه `any`.',
      'یک تست تایپی بنویس که `save` با موجودیت اشتباه خطا بدهد.',
    ],
  },
  {
    id: 'proj-4',
    level: 'intermediate',
    title: 'مسیریاب نوع‌دار (Type-Safe Router)',
    afterChapter: 'ch12',
    title2: '',
    skills: ['Template Literal Types', 'Mapped Types', 'Record', 'keyof', 'Conditional Types'],
    spec:
      'یک `navigate(path, params)` که مسیرهای مجاز از یک `Routes` map مشتق می‌شوند و تایپ `params` برای هر مسیر **دقیقاً** همان چیزی است که آن مسیر لازم دارد. مسیر ناموجود یا پارامتر اشتباه باید خطای کامپایل بدهد.',
    acceptance: [
      '`navigate("/users", { userId: "1" })` معتبر و `navigate("/users", { id: "1" })` خطا باشد.',
      'افزودن یک مسیر جدید به `Routes` بدون نوشتن handler باید خطا بدهد (Record exhaustiveness).',
      'خروجی تابع یک `URL` نوع‌دار باشد نه رشته‌ی آزاد.',
    ],
  },
  {
    id: 'proj-5',
    level: 'advanced',
    title: 'State Machine نوع‌دار',
    afterChapter: 'ch12',
    skills: ['Discriminated Union', 'Conditional Types', 'Generics', 'Exhaustiveness', 'Immutability'],
    spec:
      'یک ماشین حالت عمومی `Machine<TState, TEvent>` که انتقال‌های مجاز در سطح تایپ تعریف می‌شوند: از حالت `idle` فقط رویداد `fetch` مجاز است، از `loading` فقط `success`/`failure`. تلاش برای ارسال رویداد نامعتبر باید **خطای کامپایل** بدهد نه خطای زمان اجرا.',
    acceptance: [
      'تایپ `transition(state, event)` با Conditional Type، حالت خروجی را دقیق محاسبه کند.',
      'هیچ وضعیتی غیرممکن قابل بیان نباشد (مثلاً `loading` با `data` پر).',
      'یک `history` تغییرناپذیر از انتقال‌ها نگه داشته شود.',
    ],
  },
  {
    id: 'proj-6',
    level: 'advanced',
    title: 'کتابخانه‌ی اعتبارسنجی Schema-محور (زودِ دست‌ساز)',
    afterChapter: 'ch12',
    skills: ['infer', 'Mapped Types', 'Recursive Types', 'Generic Constraints', 'Result Type'],
    spec:
      'یک کتابخانه‌ی کوچک schema: `s.object({ name: s.string(), age: s.number().min(0) })` که هم در زمان اجرا اعتبارسنجی می‌کند و هم تایپ را با `z.infer`-مانند مشتق می‌کند. شامل `s.array`, `s.union`, `s.optional` و نسخه‌ی بازگشتی برای آبجکت‌های تودرتو.',
    acceptance: [
      '`type User = Infer<typeof UserSchema>` دقیقاً `{ name: string; age: number }` باشد.',
      'خطاها به‌صورت یک آرایه‌ی `{ path, message, code }` برگردانده شوند.',
      'schemaهای تودرتو و آرایه‌ای کار کنند (بازگشت تایپ بدون TS2589).',
    ],
  },
  {
    id: 'proj-7',
    level: 'advanced',
    title: 'انتشار یک پکیج npm تایپ‌دار',
    afterChapter: 'ch14',
    skills: ['tsconfig for libraries', 'declaration', 'exports map', 'ESM/CJS', 'CI'],
    spec:
      'یکی از پروژه‌های قبلی را به یک پکیج npm واقعی تبدیل کن: build با `tsup` (ESM + CJS + `.d.ts`)، `exports` شرطی درست، تست با Vitest، lint با typescript-eslint `strictTypeChecked`، و یک workflow ساده برای `typecheck → lint → test → build`.',
    acceptance: [
      'مصرف‌کننده‌ی ESM و CJS هر دو بدون خطا import کنند و تایپ‌ها را ببینند.',
      '`sideEffects: false` و tree-shaking تأیید شود.',
      'نسخه‌ی TypeScript در devDependencies قفل شده و در CI همان نسخه اجرا شود.',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* ۶) منابع معتبر                                                              */
/* -------------------------------------------------------------------------- */
export const RESOURCES = [
  {
    group: 'رسمی',
    items: [
      { label: 'TypeScript Handbook (کتاب راهنمای رسمی)', href: 'https://www.typescriptlang.org/docs/handbook/intro.html', note: 'منبع اصلی؛ هر فصل آن را با همین استودیو تمرین کن.' },
      { label: 'TSConfig Reference', href: 'https://www.typescriptlang.org/tsconfig/', note: 'مرجع کامل همه‌ی پرچم‌ها با مثال.' },
      { label: 'TypeScript Playground', href: 'https://www.typescriptlang.org/play', note: 'آزمایش سریع + Twoslash + `^?` + اشتراک لینک.' },
      { label: 'TypeScript GitHub Repository', href: 'https://github.com/microsoft/TypeScript', note: 'برای خواندن Issueها و Release Notes نسخه‌های جدید.' },
    ],
  },
  {
    group: 'تمرین عملی',
    items: [
      { label: 'Type Challenges (چالش‌های تایپ سطح‌بندی‌شده)', href: 'https://github.com/type-challenges/type-challenges', note: 'از easy تا extreme؛ بهترین تمرین برای فصل‌های پیشرفته.' },
      { label: 'Total TypeScript (آموزش‌های Matt Pocock)', href: 'https://www.totaltypescript.com/', note: 'عمیق‌ترین محتوای رایگان/پولی برای تایپ‌های پیشرفته.' },
      { label: 'roadmap.sh/typescript', href: 'https://roadmap.sh/typescript', note: 'همین نقشه‌ی راهی که این استودیو بر اساس آن ساخته شده.' },
      { label: 'Exercism TypeScript Track', href: 'https://exercism.org/tracks/typescript', note: 'تمرین با بازخورد منتور واقعی.' },
    ],
  },
  {
    group: 'عمیق و مرجع',
    items: [
      { label: 'TypeScript Deep Dive (کتاب آنلاین)', href: 'https://basarat.gitbook.io/typescript/', note: 'رایگان و بسیار عملی؛ برای درک internals.' },
      { label: 'Effective TypeScript (کتاب Dan Vanderkam)', href: 'https://effectivetypescript.com/', note: '۸۳ توصیه‌ی عملی؛ منبع عالی برای سطح Senior.' },
      { label: 'typescript-eslint Rules', href: 'https://typescript-eslint.io/rules/', note: 'فهرست قواعد lint با توضیح و مثال.' },
      { label: 'DefinitelyTyped (@types)', href: 'https://github.com/DefinitelyTyped/DefinitelyTyped', note: 'برای بررسی اینکه آیا یک پکیج تایپ دارد یا نه.' },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* ۷) شاخص‌های پیشرفت هفتگی                                                    */
/* -------------------------------------------------------------------------- */
export const WEEKLY_KPIS = [
  { key: 'lessons', label: 'درس‌های تکمیل‌شده', target: 15, unit: 'درس' },
  { key: 'minutes', label: 'دقایق مطالعه‌ی متمرکز', target: 1500, unit: 'دقیقه' },
  { key: 'quizAccuracy', label: 'دقت در کوییزها', target: 80, unit: '٪' },
  { key: 'labRuns', label: 'اجرای آزمایشگاه زنده', target: 60, unit: 'بار' },
  { key: 'flashcards', label: 'کارت‌های مرور شده', target: 120, unit: 'کارت' },
  { key: 'errors', label: 'خطاهای ثبت‌شده در دفترچه', target: 20, unit: 'خطا' },
];
