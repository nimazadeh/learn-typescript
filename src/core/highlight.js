/* ==========================================================================
   Syntax Highlighter — یک توکنایزر تک‌گذر برای تمام بلوک‌های کد استودیو (DRY)
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

/** Wraps highlighted code into a numbered <pre> block (used by every view). */
export function highlightedLines(code) {
  const lines = code.replace(/\t/g, '  ').split('\n');
  return lines
    .map((line) => `<span class="code-line">${highlight(line) || '&nbsp;'}</span>`)
    .join('\n');
}
