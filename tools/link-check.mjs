/* ==========================================================================
   Link Check — یکپارچگی ماژول‌های ES با «پارسر و لینکر خودِ Node»

   چرا این ابزار؟ چون خطاهای «export وجود ندارد» در مرورگر فقط به‌صورت
   یک صفحه‌ی سفید دیده می‌شوند. اینجا همان خطاها را پیش از اجرا می‌گیریم.

   اجرا:  npm run link
   ========================================================================== */

import vm from 'node:vm';
import { createRequire } from 'node:module';

const requireShim = createRequire(pathToFileURL(path.join(process.cwd(), 'noop.js')).href);
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', 'dist', 'build', 'coverage']);

function collectModules(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectModules(full, out);
    } else if (/\.m?js$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const rel = (file) => path.relative(ROOT, file);
let problems = 0;
const fail = (message) => { problems++; console.log(`✗ ${message}`); };

/* -------------------------------------------------------------------------- */
/* ۱) ساخت ماژول‌ها (بدون اجرا) — خطای سینتکس همین‌جا گرفته می‌شود               */
/* -------------------------------------------------------------------------- */
const context = vm.createContext({});
const modules = new Map();
const parseErrors = [];

for (const file of collectModules(ROOT)) {
  const url = pathToFileURL(file).href;
  try {
    modules.set(url, new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { identifier: url, context }));
  } catch (error) {
    parseErrors.push(`${rel(file)}:${error.message.split('\n')[0]}`);
  }
}

/* -------------------------------------------------------------------------- */
/* ۲) link — Node خودش «نام export نبوده» و «مسیر نیافت‌شده» را گزارش می‌دهد     */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* ۲) link — Node خودش «نام export نبوده» و «مسیر نیافت‌شده» را گزارش می‌دهد     */
/* -------------------------------------------------------------------------- */

// فقط importهای «نسبی» را خودمان resolve می‌کنیم. برای builtinها و پکیج‌های npm
// یک ماژول مصنوعی با همان نام‌های export می‌سازیم تا لینک کامل انجام شود.
const VALID_IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const synthetic = new Map();

function externalExportNames(specifier) {
  try {
    // بیشتر builtinها و پکیج‌ها CJS هستند؛ کلیدهایشان همان نام‌های export است.
    // برای module‌های «تابع‌مانند» (مثل node:module) هم کلیدهای خودِ تابع لازم است.
    const required = requireShim(specifier);
    const keys = required && (typeof required === 'object' || typeof required === 'function')
      ? Object.keys(required)
      : [];
    return keys.filter((name) => VALID_IDENTIFIER.test(name) && name !== 'default');
  } catch {
    return []; // پکیج‌های فقط-ESM (مثل jsdom) → فقط default بررسی می‌شود
  }
}

function externalModuleFor(specifier) {
  if (synthetic.has(specifier)) return synthetic.get(specifier);
  const body = [
    ...externalExportNames(specifier).map((name) => `export const ${name} = 0;`),
    'export default 0;',
  ].join('\n');
  const mod = new vm.SourceTextModule(body, { identifier: `synthetic:${specifier}`, context });
  synthetic.set(specifier, mod);
  return mod;
}

const resolve = (specifier, referencing) => {
  if (!specifier.startsWith('.')) return externalModuleFor(specifier);
  const targetUrl = pathToFileURL(
    path.resolve(path.dirname(fileURLToPath(referencing.identifier)), specifier),
  ).href;
  const target = modules.get(targetUrl);
  if (!target) throw new Error(`فایل مقصد پیدا نشد: ${specifier}`);
  return target;
};

for (const [url, mod] of modules) {
  if (mod.status !== 'unlinked') continue;
  try {
    await mod.link(resolve);
  } catch (error) {
    fail(`${rel(fileURLToPath(url))} → ${error.message.split('\n')[0]}`);
  }
}

/* -------------------------------------------------------------------------- */
/* ۳) exportهای استفاده‌نشده = کد مرده                                          */
/* -------------------------------------------------------------------------- */
const importedNames = new Set();
const importClause = /^\s*import\s+([\s\S]*?)\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/gm;
for (const file of modules.keys()) {
  const source = fs.readFileSync(fileURLToPath(file), 'utf8');
  for (const match of source.matchAll(importClause)) {
    const [, clause] = match;
    const braces = clause.match(/\{([\s\S]*)\}/);
    if (braces) {
      for (const part of braces[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/)[0].trim();
        if (name) importedNames.add(name);
      }
    }
    const defaultName = clause.replace(/\{[\s\S]*\}/, '').replace(/,/g, '').trim();
    if (defaultName && !defaultName.startsWith('*')) importedNames.add('default');
  }
}

const unused = [];
for (const [url, mod] of modules) {
  const file = fileURLToPath(url);
  if (rel(file).startsWith('tools')) continue;
  if (mod.status !== 'linked' || !mod.exportNames) continue;
  for (const name of mod.exportNames) {
    if (name !== 'default' && !importedNames.has(name)) unused.push(`${rel(file)}:${name}`);
  }
}

/* -------------------------------------------------------------------------- */
/* ۴) گزارش                                                                    */
/* -------------------------------------------------------------------------- */
console.log(`\nبررسی‌شد: ${modules.size} ماژول`);
if (parseErrors.length) {
  console.log('\n✗ خطای سینتکس:');
  parseErrors.forEach((e) => console.log(`  ${e}`));
  problems += parseErrors.length;
}
if (unused.length) {
  console.log(`\n⚠ ${unused.length} export استفاده‌نشده (احتمالاً کد مرده):`);
  unused.forEach((u) => console.log(`  ${u}`));
}
console.log(problems === 0 ? '\n✅ همه‌ی ماژول‌ها درست به هم متصل‌اند.' : `\n❌ ${problems} مشکل.`);
process.exit(problems === 0 ? 0 : 1);
