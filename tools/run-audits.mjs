/* ==========================================================================
   run-audits — همه‌ی ممیزی‌ها را با یک سرور موقت اجرا می‌کند

   چرا این فایل؟ چون `smoke`، `audit:content` و `audit:a11y` به موتور
   کامپایلر واقعی روی `/api/compile` نیاز دارند. به‌جای اینکه کاربر مجبور
   باشد اول `npm start` بزند و بعد ممیزی کند (و یادش برود)، اینجا سرور را
   خودکار بالا می‌آوریم، ممیزی‌ها را اجرا می‌کنیم و در پایان می‌بندیم.

   اجرا: npm run audit
   ========================================================================== */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.AUDIT_PORT) || 3100;
const ORIGIN = `http://127.0.0.1:${PORT}`;

/** لایه‌هایی که به سرور نیاز دارند. */
const NEEDS_SERVER = [
  ['ممیزی کامپایل محتوا', ['node', 'tools/audit-compile-content.mjs']],
  ['ممیزی دسترس‌پذیری', ['node', 'tools/audit-a11y.mjs']],
  ['تست دود (رابط کاربری)', ['node', 'tools/smoke.mjs']],
];
/** لایه‌هایی که مستقل‌اند. */
const STANDALONE = [['ممیزی CSS', ['node', 'tools/audit-css.mjs']]];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${ORIGIN}/api/health`);
      if (res.ok) return true;
    } catch {
      /* هنوز بالا نیامده */
    }
    await sleep(200);
  }
  return false;
}

function run([label, [cmd, ...args]], env = {}) {
  return new Promise((resolve) => {
    process.stdout.write(`\n▶ ${label}\n`);
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
    child.on('close', (code) => resolve({ label, code: code ?? 1 }));
    child.on('error', (err) => {
      process.stdout.write(`  ✗ اجرا نشد: ${err.message}\n`);
      resolve({ label, code: 1 });
    });
  });
}

const results = [];
for (const layer of STANDALONE) results.push(await run(layer));

const server = spawn(process.execPath, ['server.mjs'], {
  cwd: ROOT,
  stdio: 'ignore',
  env: { ...process.env, PORT: String(PORT) },
});
let serverUp = false;
try {
  serverUp = await waitForServer();
  if (!serverUp) {
    process.stdout.write(`\n✗ سرور ممیزی روی ${ORIGIN} بالا نیامد — ممیزی‌های وابسته اجرا نمی‌شوند.\n`);
  } else {
    process.stdout.write(`\n✓ سرور ممیزی روی ${ORIGIN} بالا آمد\n`);
    for (const layer of NEEDS_SERVER) results.push(await run(layer, { SMOKE_ORIGIN: ORIGIN }));
  }
} finally {
  server.kill('SIGTERM');
  await sleep(120);
  if (!server.killed) server.kill('SIGKILL');
}

const failed = results.filter((r) => r.code !== 0);
const line = '─'.repeat(70);
process.stdout.write(`\n${line}\n  خلاصه‌ی ممیزی‌ها\n${line}\n`);
for (const r of results) process.stdout.write(`  ${r.code === 0 ? '✅' : '❌'} ${r.label}\n`);
if (!serverUp) process.stdout.write('  ⚠️  سرور بالا نیامد؛ لایه‌های وابسته بی‌نتیجه ماندند\n');
process.stdout.write(`${line}\n`);

process.exit(failed.length || !serverUp ? 1 : 0);
