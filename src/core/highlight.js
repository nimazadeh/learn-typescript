/* ==========================================================================
   Syntax Highlighter — توکنایزر تک‌گذر برای بلوک‌های کد استودیو (DRY)
   زبان‌ها: TypeScript (پیش‌فرض)، Shell/Bash و JSON.
   هیچ وابستگی بیرونی ندارد.
   ========================================================================== */

const KEYWORDS = new Set([
  'abstract', 'as', 'asserts', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
  'constructor', 'continue', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export',
  'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements',
  'import', 'in', 'infer', 'instanceof', 'interface', 'is', 'keyof', 'let', 'namespace',
  'new', 'null', 'of', 'override', 'private', 'protected', 'public', 'readonly', 'require',
  'return', 'satisfies', 'set', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'type', 'typeof', 'undefined', 'var', 'void', 'while', 'yield',
]);

const TYPES = new Set([
  'any', 'bigint', 'boolean', 'never', 'number', 'object', 'string', 'symbol', 'unknown',
  'Array', 'Promise', 'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Exclude',
  'Extract', 'NonNullable', 'Parameters', 'ReturnType', 'InstanceType', 'Awaited', 'Map',
  'Set', 'Date', 'Error', 'JSON', 'Math', 'Object', 'String', 'Number', 'Boolean',
]);

// تک‌گذر: comment | string | template | number | identifier | punctuation
const TOKEN_RE =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(`(?:\\[\s\S]|[^\\`])*`)|('(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\'\n])*")|\b(0[xXbBoO][0-9a-fA-F_]+n?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?)\b|([A-Za-z_$][\w$]*)|([{}()[\];,.:?]|=>|[+\-*/%<>=!&|^~]+)/g;

function escapeHtml(value) {
  return value.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);
}

/** Highlights TypeScript source into safe HTML (no external dependency). */
export function highlight(code) {
  let out = '';
  let last = 0;
  TOKEN_RE.lastIndex = 0;

  for (let match; (match = TOKEN_RE.exec(code)) !== null;) {
    if (match.index > last) out += escapeHtml(code.slice(last, match.index));
    const [full, comment, template, str, num, ident, punct] = match;

    if (comment) out += `<span class="tok-com">${escapeHtml(comment)}</span>`;
    else if (template) out += `<span class="tok-str">${escapeHtml(template)}</span>`;
    else if (str) out += `<span class="tok-str">${escapeHtml(str)}</span>`;
    else if (num) out += `<span class="tok-num">${escapeHtml(num)}</span>`;
    else if (ident) {
      if (KEYWORDS.has(ident)) out += `<span class="tok-kw">${ident}</span>`;
      else if (TYPES.has(ident)) out += `<span class="tok-type">${ident}</span>`;
      else if (/^[A-Z]/.test(ident)) out += `<span class="tok-type">${ident}</span>`;
      else if (code[TOKEN_RE.lastIndex] === '(') out += `<span class="tok-fn">${ident}</span>`;
      else out += escapeHtml(ident);
    } else if (punct) out += `<span class="tok-pun">${escapeHtml(punct)}</span>`;
    else out += escapeHtml(full);

    last = match.index + full.length;
  }

  if (last < code.length) out += escapeHtml(code.slice(last));
  return out;
}

/* -------------------------------------------------------------------------- */
/* زبان‌های دیگر — همه از یک توکنایزر مشترک استفاده می‌کنند (DRY)                 */
/* -------------------------------------------------------------------------- */

/**
 * توکنایزر عمومی: یک RegExp با گروه‌های نام‌دار + یک نگاشت «گروه → کلاس CSS».
 * @param {string} code
 * @param {RegExp} re
 * @param {(groups: Record<string,string|undefined>, code: string, next: string) => string|null} classify
 */
function tokenize(code, re, classify) {
  let out = '';
  let last = 0;
  re.lastIndex = 0;
  for (let m; (m = re.exec(code)) !== null;) {
    if (m[0] === '') { re.lastIndex++; continue; }
    if (m.index > last) out += escapeHtml(code.slice(last, m.index));
    const cls = classify(m.groups ?? {}, code, code[re.lastIndex] ?? '');
    out += cls ? `<span class="${cls}">${escapeHtml(m[0])}</span>` : escapeHtml(m[0]);
    last = m.index + m[0].length;
  }
  if (last < code.length) out += escapeHtml(code.slice(last));
  return out;
}

const BASH_RE =
  /(?<comment>#[^\n]*)|(?<str>"(?:\\.|[^"\\])*"|'[^'\n]*')|(?<flag>(?<=\s)--?[A-Za-z][\w-]*)|(?<num>\b\d[\w.]*\b)|(?<word>[A-Za-z_$][\w$.\/-]*)|(?<punct>[|&;<>(){}\[\]*+=!~]+)/gu;

const BASH_KEYWORDS = new Set(['cd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'echo', 'export', 'ls', 'pwd', 'sudo', 'curl', 'git', 'if', 'then', 'fi', 'for', 'do', 'done', 'while']);

/** highlighting برای Shell/Bash — `npm i -D typescript` باید شبیه کد TS رنگ نشود. */
export function highlightBash(code) {
  return tokenize(code, BASH_RE, (g, src, next) => {
    if (g.comment) return 'tok-com';
    if (g.str) return 'tok-str';
    if (g.flag) return 'tok-num';
    if (g.num) return 'tok-num';
    if (g.word) {
      if (BASH_KEYWORDS.has(g.word)) return 'tok-kw';
      if (/^[A-Z_][A-Z0-9_]*$/.test(g.word)) return 'tok-type';
      if (next.trimStart().startsWith(' ')) return 'tok-fn';
      return null;
    }
    if (g.punct) return 'tok-pun';
    return null;
  });
}

const JSON_RE =
  /(?<key>"(?:\\.|[^"\\])*")(?=\s*:)|(?<str>"(?:\\.|[^"\\])*")|(?<num>-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(?<lit>\btrue\b|\bfalse\b|\bnull\b)|(?<punct>[{}\[\],:])/gu;

/** highlighting برای JSON (مثل tsconfig.json) — کلیدها رنگ تایپ می‌گیرند. */
export function highlightJson(code) {
  return tokenize(code, JSON_RE, (g) => {
    if (g.key) return 'tok-type';
    if (g.str) return 'tok-str';
    if (g.num) return 'tok-num';
    if (g.lit) return 'tok-kw';
    if (g.punct) return 'tok-pun';
    return null;
  });
}

/** زبان‌های پشتیبانی‌شده و برچسب هرکدام. `js` همان رنگ TS را می‌گیرد. */
export const CODE_LANGS = {
  ts: { label: 'TypeScript', highlight },
  js: { label: 'JavaScript', highlight },
  bash: { label: 'Shell', highlight: highlightBash },
  json: { label: 'JSON', highlight: highlightJson },
};

/**
 * زبان یک بلوک کد را برمی‌گرداند: اول `lang` صریح محتوا، بعد تشخیص خودکار.
 * این تابع هم توسط نما (برای رنگ و دکمه‌ی اجرا) و هم توسط ممیزی محتوا استفاده
 * می‌شود تا هر دو یک قضاوت داشته باشند (DRY).
 * @param {{ code?: string, lang?: string }} block
 * @returns {'ts'|'bash'|'json'}
 */
export function detectLang({ code = '', lang } = {}) {
  if (lang && CODE_LANGS[lang]) return lang;

  // خط‌های توضیح و خالی مزاحم تشخیص نیستند: `.prettierrc` معمولاً با کامنت شروع می‌شود
  const head = code
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'))
    .join('\n')
    .replace(/^\s+/, '');
  const firstLine = head.split('\n')[0] ?? '';

  if (/^(npm|npx|pnpm|yarn|bun|deno|tsc|ts-node|tsx|node|mkdir|cd|git|rm|cp|mv|cat|echo|ls|pwd|curl|sudo)\b/.test(firstLine)) return 'bash';
  if (firstLine.startsWith('$ ')) return 'bash';

  // JSON/JSONC: با `{` یا `[` شروع شود و «کلید رشته‌ای» داشته باشد.
  // (رشته‌ی `"strict"` داخل JSON باعث می‌شود بررسی ساده‌ی `\bconst\b` خطا بدهد،
  //  پس نشانه‌های TS را فقط با الگوهای غیررشته‌ای بررسی می‌کنیم.)
  if (/^[{[]/.test(firstLine)) {
    const hasQuotedKeys = /"[\w$@.*\/-]+"\s*:/.test(head);
    // نشانه‌های TS با دقت انتخاب شده‌اند: `"extends"` داخل tsconfig.json یک کلید است،
    // نه کلیدواژه‌ی `type X extends Y`. به همین دلیل الگو لنگر دارد.
    const hasTsSyntax =
      /=>|(^|\n)\s*(export\s+)?(declare\s+)?(abstract\s+)?(async\s+)?function\b/.test(head) ||
      /(^|\n)\s*(export\s+)?(type|interface|class|enum|const|let|var)\s/.test(head) ||
      /\w\s*:\s*(string|number|boolean|unknown|never|any)\b/.test(head);
    if (hasQuotedKeys && !hasTsSyntax) return 'json';
  }

  return 'ts';
}

/** Wraps highlighted code into a numbered <pre> block (used by every view). */
export function highlightedLines(code, lang = 'ts') {
  const paint = CODE_LANGS[lang]?.highlight ?? highlight;
  const lines = code.replace(/\t/g, '  ').split('\n');
  return lines
    .map((line) => `<span class="code-line">${paint(line) || '&nbsp;'}</span>`)
    .join('\n');
}
