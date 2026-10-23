/* ==========================================================================
   داده‌های Playground — نمونه‌کدهای آماده و چالش‌های عملی
   جدا از نما (View) نگه داشته می‌شود تا:
     ۱) ابزارهای QA بتوانند همین داده را مستقیماً import و کامپایل کنند
     ۲) نما فقط مسئول نمایش باشد (Separation of Concerns)
   ========================================================================== */

/** نمونه‌کدهای آماده‌ی آزمایشگاه آزاد. */
export const SNIPPETS = [
  {
    id: 'snip-du',
    label: 'Discriminated Union + Exhaustiveness',
    code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; w: number; h: number };

function assertNever(value: never): never {
  throw new Error('شاخه‌ی پوشش‌داده‌نشده: ' + JSON.stringify(value));
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    case 'rect': return shape.w * shape.h;
    default: return assertNever(shape);
  }
}

const shapes: Shape[] = [
  { kind: 'circle', radius: 2 },
  { kind: 'square', side: 3 },
  { kind: 'rect', w: 2, h: 5 },
];

console.log(shapes.map((s) => area(s).toFixed(2)).join(' | '));
// آزمایش کن: یک عضو جدید به Shape اضافه کن و خطای کامپایلر را ببین!`,
  },
  {
    id: 'snip-utility',
    label: 'Utility Types روی یک مدل واقعی',
    code: `type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

type PublicUser = Omit<User, 'password'>;
type UserPatch = Partial<Omit<User, 'id' | 'createdAt'>>;
type UserPreview = Pick<User, 'id' | 'name'>;
type FrozenUser = Readonly<User>;
type NullableEmail = { email: string | null };
type CleanEmail = NonNullable<NullableEmail['email']>;

const publicUser: PublicUser = {
  id: '1', name: 'نیما', email: 'nima@example.com', createdAt: new Date(0),
};
const patch: UserPatch = { name: 'نیما زاد' };

console.log(publicUser.name, patch.name);

// سؤال: تایپ CleanEmail چیست؟ (ستون Type X-Ray را ببین)`,
  },
  {
    id: 'snip-generics',
    label: 'Generic + Constraints + infer',
    code: `function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const users = [
  { id: '1', name: 'نیما', age: 30 },
  { id: '2', name: 'سارا', age: 25 },
];

console.log(pluck(users, 'name'));
console.log(pluck(users, 'age'));

type ReturnOf<T> = T extends (...args: never[]) => infer R ? R : never;
type ParamsOf<T> = T extends (...args: infer P) => unknown ? P : never;

function compute(a: number, b: number): string { return String(a + b); }

type R = ReturnOf<typeof compute>; // string
type P = ParamsOf<typeof compute>; // [a: number, b: number]

const r: R = '42';
const p: P = [1, 2];
console.log(r, p, compute(...p));`,
  },
  {
    id: 'snip-mapped',
    label: 'Mapped + Template Literal Types',
    code: `type User = { id: string; name: string; age: number };

type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type EventKeys<T> = {
  [K in keyof T & string as \`\${K}:changed\`]: (value: T[K]) => void;
};

type UserGetters = Getters<User>;
type StringFields = OnlyStrings<User>;
type UserEvents = EventKeys<User>;

const getters: UserGetters = {
  getId: () => 'u1',
  getName: () => 'نیما',
  getAge: () => 30,
};

const strings: StringFields = { id: 'u1', name: 'نیما' };

console.log(getters.getName(), getters.getAge(), Object.keys(strings));`,
  },
  {
    id: 'snip-parse',
    label: 'الگوی Parse, don\'t validate (مرز API)',
    code: `type Order = {
  readonly id: string;
  readonly total: number;
  readonly items: readonly { sku: string; qty: number }[];
};

type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

function parseOrder(input: unknown): ParseResult<Order> {
  const errors: string[] = [];
  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: ['ورودی باید یک آبجکت باشد'] };
  }
  const raw = input as Record<string, unknown>;

  if (typeof raw.id !== 'string') errors.push('id باید رشته باشد');
  if (typeof raw.total !== 'number') errors.push('total باید عدد باشد');

  const items: { sku: string; qty: number }[] = [];
  if (!Array.isArray(raw.items)) {
    errors.push('items باید آرایه باشد');
  } else {
    for (const item of raw.items as unknown[]) {
      if (typeof item === 'object' && item !== null) {
        const rec = item as Record<string, unknown>;
        if (typeof rec.sku === 'string' && typeof rec.qty === 'number') {
          items.push({ sku: rec.sku, qty: rec.qty });
        } else {
          errors.push('یک آیتم ساختار نامعتبر دارد');
        }
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { id: raw.id as string, total: raw.total as number, items } };
}

const good = parseOrder({ id: 'o1', total: 250, items: [{ sku: 'A', qty: 2 }] });
const bad = parseOrder({ id: 5, total: 'x', items: 'oops' });

console.log(good.ok ? good.value : good.errors);
console.log(bad.ok ? bad.value : bad.errors);`,
  },
  {
    id: 'snip-async',
    label: 'Async + Result type + Awaited/ReturnType',
    code: `type ApiError = { code: number; message: string };
type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };

type Lesson = { id: string; title: string; minutes: number };

async function fetchLessons(): Promise<Result<Lesson[]>> {
  // شبیه‌سازی یک پاسخ شبکه:
  const lessons: Lesson[] = [
    { id: '1', title: 'Mapped Types', minutes: 45 },
    { id: '2', title: 'Conditional Types', minutes: 50 },
  ];
  return { ok: true, data: lessons };
}

// مشتق‌سازی تایپ‌ها از رفتار واقعی (DRY در سطح تایپ):
type LessonsResponse = Awaited<ReturnType<typeof fetchLessons>>;
type Lessons = LessonsResponse extends { ok: true; data: infer D } ? D : never;

async function main(): Promise<void> {
  const result = await fetchLessons();
  if (!result.ok) {
    console.log('خطا:', result.error.message);
    return;
  }
  const total = result.data.reduce((sum, l) => sum + l.minutes, 0);
  console.log(\`\${result.data.length} درس · \${total} دقیقه\`);
}

await main();

export {}; // ← بدون این، await در سطح بالا مجاز نیست (TS1375)`,
  },
];

/** چالش‌های عملی با starter و solution. */
export const CHALLENGES = [
  {
    id: 'ch-easy-1',
    level: 'آسان',
    title: 'تابع `compact` را تایپ‌دار کن',
    prompt: 'تابعی بنویس که `null` و `undefined` را از یک آرایه حذف کند و تایپ بازگشتی‌اش `T[]` باشد (نه `(T | undefined)[]`). راهنما: از overload یا Type Predicate در `filter` استفاده کن.',
    starter: `function compact<T>(list: readonly (T | null | undefined)[]): T[] {
  // ⬅️ اینجا را کامل کن
  return [];
}

console.log(compact([1, null, 2, undefined, 3])); // باید [1,2,3] چاپ شود`,
    solution: `function compact<T>(list: readonly (T | null | undefined)[]): T[] {
  return list.filter((item): item is T => item !== null && item !== undefined);
}`,
  },
  {
    id: 'ch-med-1',
    level: 'متوسط',
    title: 'DeepReadonly بدون شکستن توابع',
    prompt: '`DeepReadonly<T>` بنویس که تودرتو همه‌چیز را readonly کند، ولی توابع و آرایه‌ها را خرد نکند. نکته: شرط تابع و آرایه باید **قبل** از شرط object بیاید.',
    starter: `type DeepReadonly<T> = T; // ⬅️ بازنویسی کن

type State = {
  user: { name: string; tags: string[] };
  save: () => void;
};

const s: DeepReadonly<State> = {
  user: { name: 'نیما', tags: ['a'] },
  save: () => console.log('saved'),
};

console.log(s.user.name, s.user.tags.length);`,
    solution: `type DeepReadonly<T> =
  T extends (...args: never[]) => unknown ? T
  : T extends readonly (infer E)[] ? ReadonlyArray<DeepReadonly<E>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;`,
  },
  {
    id: 'ch-med-2',
    level: 'متوسط',
    title: 'Event emitter کاملاً تایپ‌دار',
    prompt: 'یک `Emitter<TMap>` بنویس که `on(event, handler)` و `emit(event, payload)` داشته باشد و تایپ payload برای هر رویداد **دقیق** باشد. رویداد ناشناخته باید خطای کامپایل بدهد.',
    starter: `type AppEvents = {
  'user:login': { userId: string };
  'user:logout': undefined;
  'lesson:done': { lessonId: string; score: number };
};

class Emitter<TMap> {
  // ⬅️ پیاده‌سازی کن
}

// هدف:
// emitter.on('user:login', (p) => p.userId)   ✅
// emitter.emit('lesson:done', { lessonId: '1', score: 20 }) ✅
// emitter.emit('nope', {})                    ❌ خطای کامپایل
console.log('چالش را کامل کن');`,
    solution: `type Handlers<TMap> = { [K in keyof TMap]: ((payload: TMap[K]) => void)[] };

class Emitter<TMap extends Record<string, unknown>> {
  private handlers = {} as Handlers<TMap>;
  on<K extends keyof TMap>(event: K, handler: (payload: TMap[K]) => void): void {
    (this.handlers[event] ??= []).push(handler);
  }
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}`,
  },
  {
    id: 'ch-hard-1',
    level: 'چالشی',
    title: 'Split یک رشته در سطح تایپ',
    prompt: '`Split<S, D>` بنویس که یک رشته‌ی لیترال را بر اساس جداکننده به یک Tuple از رشته‌ها تبدیل کند: `Split<"a/b/c", "/">` → `["a","b","c"]`.',
    starter: `// ⬅️ بازنویسی کن. تا وقتی stub است، Parts یعنی never و دو خطای زیر
// «عمدی» هستند: همان‌ها دقیقاً نشان می‌دهند تایپت هنوز کار نمی‌کند.
//   TS2322 → مقدار به never پذیرفته نمی‌شود
//   TS2339 → never هیچ پراپرتی‌ای ندارد
type Split<S extends string, D extends string> = never;

type Parts = Split<'users/123/posts', '/'>;
const parts: Parts = ['users', '123', 'posts'];
console.log(parts.length);`,
    solution: `type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\` ? [Head, ...Split<Tail, D>] : [S];`,
  },
  {
    id: 'ch-hard-2',
    level: 'چالشی',
    title: 'State machine با انتقال‌های قانونی در سطح تایپ',
    prompt: 'ماشینی بساز که از حالت `idle` فقط `fetch` مجاز باشد، از `loading` فقط `success`/`failure`، و ارسال رویداد نامعتبر **خطای کامپایل** بدهد.',
    starter: `type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: string }
  | { status: 'error'; message: string };

// هدف: transition(state, event) فقط رویدادهای مجاز همان حالت را بپذیرد
console.log('چالش را کامل کن');`,
    solution: `type EventsByStatus = {
  idle: { type: 'fetch' };
  loading: { type: 'success'; data: string } | { type: 'failure'; message: string };
  done: { type: 'reset' };
  error: { type: 'reset' };
};

function transition<S extends State>(
  state: S,
  event: EventsByStatus[S['status']],
): State {
  if (state.status === 'idle' && event.type === 'fetch') return { status: 'loading' };
  if (state.status === 'loading') {
    return event.type === 'success'
      ? { status: 'done', data: event.data }
      : { status: 'error', message: event.message };
  }
  return { status: 'idle' };
}`,
  },
];
