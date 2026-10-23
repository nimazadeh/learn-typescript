/* ==========================================================================
   Smoke Test — اپلیکیشن را در یک DOM واقعی (jsdom) بالا می‌آورد و همه‌ی
   نماها، درس‌ها، کوییزها و آزمایشگاه زنده را اجرا می‌کند.

   اجرا:  npm run smoke   (سرور باید در حال اجرا باشد: npm start)
   ========================================================================== */

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { createStudioEnv, ROOT } from './dom-env.mjs';

/* -------------------------------------------------------------------------- */
/* گزارش‌دهی                                                                     */
/* -------------------------------------------------------------------------- */
let failures = 0;
let checks = 0;

function check(label, condition, detail = '') {
  checks++;
  const ok = Boolean(condition);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

function section(title) {
  console.log(`\n— ${title} —`);
}

const env = await createStudioEnv();
const { window, document, app, store, timer, consoleErrors, wait, waitFor, $, $$, count } = env;

section('پوسته‌ی اپلیکیشن');
check('سربرگ و نوار ناوبری ساخته شد', count('.nav-tab') >= 5, `${count('.nav-tab')} سربرگ`);
check('نشان موتور کامپایل مقدار واقعی گرفت', /tsc \d+\.\d+\.\d+/.test($('#engine-badge')?.textContent ?? ''), $('#engine-badge')?.textContent?.trim());
check('نوار پیشرفت در سربرگ وجود دارد', Boolean($('#header-progress-fill')));
check('بدنه‌ی اپ RTL است', document.documentElement.getAttribute('dir') === 'rtl', document.documentElement.getAttribute('dir'));

section('نمای نقشه‌ی راه');
check('بوم SVG نقشه رندر شد', count('#view-root svg') > 0);
check('گره‌های نقشه رسم شدند', count('.map-node') >= 90, `${count('.map-node')} گره`);
check('یال‌های نقشه رسم شدند', count('#view-root path, #view-root line') > 20, `${count('#view-root path, #view-root line')} یال`);

section('نمای درس‌ها');
app.navigate('academy', { nodeId: 'union-types' });
await wait(200);
check('ساختار سه‌ستونی درس ساخته شد', count('.lesson-grid') === 1);
check('گام‌های درس رندر شدند', count('.lesson-steps .step, .lesson-steps > *') >= 3, `${count('.lesson-steps > *')} گام`);
check('حاشیه‌نویسی فرمول‌های موفقیت رندر شد', count('.margin-notes .margin-note, .lesson-margin, .margin-note') > 0, `${count('.margin-note')} حاشیه`);
check('کوییز درس رندر شد', count('.quiz-card .quiz-option') >= 3, `${count('.quiz-option')} گزینه`);
check('آزمایشگاه زنده رندر شد', count('.live-lab') >= 1);
check('ویرایشگر کد با برجسته‌سازی سینتکس ساخته شد', count('.editor-input') === 1 && count('.editor-preview') === 1);
check('شمارنده‌ی خطوط ویرایشگر ساخته شد', count('.editor-gutter .gutter-line') > 1, `${count('.gutter-line')} خط`);

section('کوییز — تعامل واقعی');
{
  const before = readQuizStats();
  const options = $$('.quiz-card .quiz-option');
  options[0].click();
  await wait(120);
  const feedback = $('.quiz-feedback');
  check('پاسخ به کوییز بازخورد نشان داد', Boolean(feedback) && feedback.hidden === false);
  check('گزینه‌ی درست با کلاس مشخص شد', count('.quiz-option.is-correct') === 1);
  check('توضیح پاسخ پس از انتخاب نمایش داده شد', (feedback?.textContent ?? '').trim().length > 20);
  const after = readQuizStats();
  check('آمار کوییز در وضعیت مرکزی به‌روز شد', after.correct + after.wrong === before.correct + before.wrong + 1, `${JSON.stringify(after)}`);
  await wait(320);
  const persisted = readPersistedStats();
  check('آمار کوییز در localStorage پایدار شد', persisted.correct + persisted.wrong === after.correct + after.wrong, JSON.stringify(persisted));
}

section('آزمایشگاه زنده — کامپایل با TypeScript واقعی');
{
  const lab = $('.live-lab');
  check('برگه‌های آزمایشگاه (کنسول/خطاها/X-Ray/خروجی JS) ساخته شدند', count('.lab-tabs .lab-tab') === 4, `${count('.lab-tabs .lab-tab')} برگه`);

  const tabs = [...lab.querySelectorAll('.lab-tab')];
  const tabByLabel = (re) => tabs.find((b) => re.test(b.textContent));
  // چهار پنل به ترتیب ثابت ساخته می‌شوند: کنسول، خطاها، X-Ray، خروجی JS
  const panes = [...lab.querySelectorAll('.lab-tab-body > .pane-body')];
  check('هر چهار پنل آزمایشگاه در DOM حاضرند', panes.length === 4, `${panes.length} پنل`);
  const [consolePane, diagPane, _xrayPane, jsPane] = panes;
  const visiblePane = () => panes.find((pane) => pane.hidden === false);

  // اول صبر می‌کنیم اجرای خودکارِ کد اولیه تمام شود تا نتیجه‌ی تست قاطی نشود
  await waitFor(() => /tsc/.test($('.lab-meta')?.textContent ?? ''), { label: 'initial auto-run' });
  await wait(600);

  const editor = lab.querySelector('.editor-input');
  const marker = 'SMOKE_MARKER_42';
  editor.value = [
    `const ${marker} = 1; // نشانگر تست`,
    'type Minutes = number;',
    'const daily: Minutes = 300;',
    'const plan = [daily, daily];',
    '//    ^?',
    'const broken = daily.nope;',
    'console.log(plan.length, broken ?? 0);',
  ].join('\n');
  editor.dispatchEvent(new window.Event('input', { bubbles: true }));

  const runButton = [...lab.querySelectorAll('.lab-actions button')].find((b) => /اجرا/.test(b.textContent));
  check('دکمه‌ی «اجرا و کالبدشکافی» پیدا شد', Boolean(runButton));
  runButton.click();

  // تا وقتی صبر می‌کنیم که نتیجه‌ی «کد تزریق‌شده» روی صفحه آمده باشد
  await waitFor(
    () => count('.diag-head') >= 1 && /TS2339/.test(diagPane.textContent),
    { label: 'TS2339 diagnostic for the injected code' },
  );

  const metaText = $('.lab-meta').textContent.replace(/\s+/g, ' ');
  check('موتور کامپایل واقعی TypeScript پاسخ داد', /tsc \d+\.\d+\.\d+/.test(metaText), metaText.slice(0, 130));
  check('گره‌های تایپ پاک‌شده شمارش شد', /گره‌های تایپ پاک‌شده: [۱-۹۰-۹]+/.test(metaText) && !/پاک‌شده: ۰/.test(metaText), (metaText.match(/گره‌های تایپ پاک‌شده: [۰-۹]+/) ?? [])[0]);

  check('خطای TS2339 با مربی فارسی نمایش داده شد', count('.diag-head') >= 1 && count('.diag-coach') >= 1, `${count('.diag-head')} خطا`);
  const diagText = diagPane.textContent.replace(/\s+/g, ' ');
  check('کد و موقعیت خطای TypeScript گزارش شد', /TS2339/.test(diagText) && /line \d+:\d+/.test(diagText), diagText.slice(0, 120));


  tabByLabel(/X-Ray/).click();
  await wait(150);
  const xrayRows = $$('.xray-row').map((r) => r.textContent.replace(/\s+/g, ' ').trim());
  check('پرسش `// ^?` تایپ استنتاجی را نشان داد', xrayRows.some((r) => /number\[\]/.test(r)), xrayRows.slice(0, 8).join(' | ').slice(0, 200));
  check('تایپ‌های استنتاجی متغیرها در X-Ray هست', xrayRows.some((r) => /Minutes|number/.test(r)) && xrayRows.length >= 3, `${xrayRows.length} ردیف`);

  check('هنگام وجود خطای تایپ، اجرا متوقف می‌شود (رفتار عمدی)', /اجرا متوقف شد/.test(consolePane.textContent));

  // فاز دوم: کد سالم → باید خروجی JS تولید و در کنسول اجرا شود
  editor.value = [
    'type Minutes = number;',
    'const daily: Minutes = 300;',
    'const plan = [daily, daily];',
    '//    ^?',
    'const total: number = plan.reduce((a, b) => a + b, 0);',
    // eslint-disable-next-line no-template-curly-in-string -- این رشته «کد TypeScript نمونه» است، نه قالب جاوااسکریپت
    'console.log(`plan=${plan.length} total=${total}`);',
  ].join('\n');
  editor.dispatchEvent(new window.Event('input', { bubbles: true }));
  runButton.click();

  await waitFor(
    () => /اجرا شد|خطای زمان اجرا/.test($('.lab-status')?.textContent ?? ''),
    {
      label: 'successful run',
      debug: () => {
        const status = $('.lab-status')?.textContent;
        const panes = $$('.pane-body').map((p) => p.textContent.replace(/\s+/g, ' ').trim().slice(0, 100));
        return `status="${status}" | panes=${JSON.stringify(panes)}`;
      },
    },
  );
  check('کد بدون خطا با موفقیت اجرا شد', /✓ اجرا شد/.test($('.lab-status').textContent), $('.lab-status').textContent.trim());

  tabByLabel(/خروجی JS/).click();
  await wait(150);
  check('کلیک روی برگه، پنل درست را فعال می‌کند', visiblePane() === jsPane);
  const jsText = jsPane.textContent;
  check('خروجی JavaScript تولید شد و تایپ‌ها پاک شدند', /const daily = 300/.test(jsText) && !/Minutes/.test(jsText), jsText.replace(/\s+/g, ' ').slice(0, 150));

  tabByLabel(/کنسول/).click();
  await wait(250);
  const consoleText = consolePane.textContent.replace(/\s+/g, ' ');
  check('کنسول خروجی واقعی اجرای کد را نشان داد', /plan=2 total=600/.test(consoleText), consoleText.slice(0, 150));

  tabByLabel(/X-Ray/).click();
  await wait(150);
  const xrayRows2 = $$('.xray-row').map((r) => r.textContent.replace(/\s+/g, ' ').trim());
  check('X-Ray تایپ `// ^?` را برای کد سالم نشان داد', xrayRows2.some((r) => /^\s*🔬plan query number\[\]/.test(r) || /query/.test(r)), xrayRows2.slice(0, 6).join(' | ').slice(0, 180));
}

section('همه‌ی نماها');
for (const [name, hint] of [
  ['roadmap', 'svg'],
  ['academy', '.lesson-grid'],
  ['playground', '.live-lab'],
  ['coach', '.coach'],
  ['playbook', '.playbook'],
]) {
  try {
    app.navigate(name);
    await wait(200);
    const nodes = count('#view-root > *');
    check(`نمای «${name}» بدون خطا رندر شد`, nodes > 0, `${nodes} گره‌ی ریشه${hint ? ` · انتظار ${hint}` : ''}`);
  } catch (error) {
    check(`نمای «${name}» بدون خطا رندر شد`, false, error.message);
  }
}

section('پالت فرمان (Ctrl+K)');
{
  app.navigate('roadmap');
  await wait(150);
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  await wait(150);
  check('پالت با Ctrl+K باز شد', $('#palette')?.hidden === false || $('#palette')?.classList.contains('is-open'));
  const input = $('#palette-input');
  if (input) {
    input.value = 'Generic';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    await wait(250);
    check('جست‌وجوی پالت نتیجه داد', count('#palette-results > *') > 0, `${count('#palette-results > *')} نتیجه`);
  }
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
}

section('مربی روزانه و برنامه‌ی ۵ ساعت');
{
  app.navigate('coach');
  await wait(200);
  const coachText = $('#view-root').textContent;
  check('بلوک‌های مطالعه‌ی ۵ ساعته نمایش داده شدند', /۵ ساعت|۳۰۰/.test(coachText));
  check('ساعت تایمر با قالب mm:ss رندر شد', /\d\d:\d\d/.test($('#view-root .timer-clock')?.textContent ?? ''), $('#view-root .timer-clock')?.textContent);
  const totalText = $('#view-root .timer-total')?.textContent ?? '';
  check('مجموع بلوک‌ها دقیقاً ۵ ساعت (۳۰۰ دقیقه) است', /=\s*۳۰۰ دقیقه \(۵ ساعت\)/.test(totalText), totalText.trim());
  check('هر ۵ بلوک روزانه با کار عمیق و استراحت رندر شدند', count('#view-root .block-card') === 5, `${count('#view-root .block-card')} بلوک`);
  check('کارت بلوک، دقیقه‌ی کار و استراحت را نشان می‌دهد', /۵۰ \+ ۱۰ استراحت/.test($('#view-root .block-card')?.textContent ?? ''), $('#view-root .block-card')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 90));

  const startBtn = $$('#view-root .timer-controls button').find((b) => /شروع بلوک/.test(b.textContent));
  check('دکمه‌ی شروع بلوک وجود دارد', Boolean(startBtn));
  startBtn.click();
  await wait(150);
  check('تایمر با کلیک شروع شد و دکمه به «توقف» تغییر کرد', $$('#view-root .timer-controls button').some((b) => /توقف/.test(b.textContent)));
  const stopBtn = $$('#view-root .timer-controls button').find((b) => /توقف/.test(b.textContent));
  stopBtn?.click();
  await wait(150);
  check('تایمر متوقف شد', $$('#view-root .timer-controls button').some((b) => /شروع بلوک/.test(b.textContent)));

  // ثبت دقیقه‌های مطالعه: با «بلوک بعدی» جابه‌جا می‌شویم تا منطق ثبت دقیقه سنجیده شود
  const skipBtn = $$('#view-root .timer-controls button').find((b) => /بلوک بعدی/.test(b.textContent));
  skipBtn.click();
  await wait(150);
  check('با رفتن به بلوک بعد، تایمر روی ۵۰ دقیقه بازنشانی شد', $('#view-root .timer-clock')?.textContent === '50:00', $('#view-root .timer-clock')?.textContent);
}

section('تایمر پومودورو سراسری — شمارش معکوس دلخواه');
{
  app.navigate('roadmap');
  await wait(150);

  const headerTimer = $('#header-timer .htimer');
  check('تایمر در سربرگ سوار شده (سراسری، نه داخل یک نما)', Boolean(headerTimer));
  const openBtn = $('#header-timer .htimer-open');
  check('دکمه‌ی بازکردن تنظیمات تایمر هست و aria دارد',
    Boolean(openBtn) && openBtn.getAttribute('aria-haspopup') === 'dialog' && openBtn.getAttribute('aria-expanded') === 'false');

  openBtn.click();
  await wait(80);
  check('پاپ‌اور تنظیم مدت باز شد', $('#header-timer .htimer-popover')?.hidden === false);
  check('مدت‌های آماده شامل ۲۵ دقیقه‌ی پومودورو است',
    $$('#header-timer .htimer-preset').map((b) => b.dataset.minutes).includes('25'),
    $$('#header-timer .htimer-preset').map((b) => b.dataset.minutes).join(','));
  check('ورودی مدت دلخواه وجود دارد (هر عددی، نه فقط preset)', Boolean($('#header-timer .htimer-custom-input')));

  // مدت دلخواه و کوچک تا شمارش معکوس سریع و قطعی سنجیده شود
  const custom = $('#header-timer .htimer-custom-input');
  custom.value = '1';
  custom.dispatchEvent(new window.Event('input', { bubbles: true }));
  await wait(60);
  check('برای مدت دلخواه هیچ preset انتخاب‌شده‌ای نمی‌ماند (ورودی آزاد است)',
    $$('#header-timer .htimer-preset').every((b) => !b.classList.contains('is-selected')));
  // و برعکس: زدن preset، ورودی دلخواه را هم‌رنگ خودش می‌کند
  $$('#header-timer .htimer-preset').find((b) => b.dataset.minutes === '25').click();
  await wait(60);
  check('زدن preset ۲۵ هم ورودی را پر می‌کند هم هایلایت می‌شود',
    $('#header-timer .htimer-custom-input').value === '25'
      && $$('#header-timer .htimer-preset').some((b) => b.dataset.minutes === '25' && b.classList.contains('is-selected')));
  custom.value = '1';
  custom.dispatchEvent(new window.Event('input', { bubbles: true }));
  await wait(60);

  const runsBefore = store.getState().pomodorosDone ?? 0;
  $('#header-timer .htimer-start').click();
  await wait(120);

  check('پاپ‌اور پس از شروع بسته شد', $('#header-timer .htimer-popover')?.hidden === true);
  check('شمارش معکوس با ۰۱:۰۰ شروع شد (قالب mm:ss)', $('#header-timer .htimer-clock')?.textContent === '01:00', $('#header-timer .htimer-clock')?.textContent);
  check('شمارنده‌ی پومودوروها یکی زیاد شد', (store.getState().pomodorosDone ?? 0) === runsBefore + 1);

  await wait(1250);
  const after = $('#header-timer .htimer-clock')?.textContent;
  check('واقعاً معکوس می‌شمارد (۰۱:۰۰ → ۰۰:۵۹)', after === '00:59', after);
  check('حلقه‌ی پیشرفت با گذشت زمان جلو رفته است',
    Number($('#header-timer .htimer-ring-fill')?.getAttribute('stroke-dashoffset')) < 81,
    $('#header-timer .htimer-ring-fill')?.getAttribute('stroke-dashoffset'));

  // تایمر باید از جابه‌جایی بین نماها جان سالم به در ببرد
  const beforeNav = $('#header-timer .htimer-clock')?.textContent;
  app.navigate('academy', { nodeId: 'union-types' });
  await wait(200);
  app.navigate('playground');
  await wait(200);
  check('تایمر پس از جابه‌جایی بین نماها زنده ماند',
    $('#header-timer .htimer-clock')?.textContent !== undefined && store.getState().pomodoro?.running === true,
    `${beforeNav} → ${$('#header-timer .htimer-clock')?.textContent}`);

  // توقف / ادامه
  $('#header-timer .htimer-toggle').click();
  await wait(120);
  check('با توقف، اجرا متوقف شد', store.getState().pomodoro?.running === false);
  const pausedAt = $('#header-timer .htimer-clock')?.textContent;
  await wait(600);
  check('در حالت توقف، زمان جلو نمی‌رود', $('#header-timer .htimer-clock')?.textContent === pausedAt, `${pausedAt} → ${$('#header-timer .htimer-clock')?.textContent}`);
  $('#header-timer .htimer-toggle').click();
  await wait(120);
  check('با ادامه، دوباره در حال اجرا شد', store.getState().pomodoro?.running === true);

  // پایان تایمر → هشدار ملایم (به‌صورت قطعی با گذشته‌نگری endsAt)
  store.setState((prev) => ({ pomodoro: { ...prev.pomodoro, endsAt: Date.now() - 1000 } }));
  check('reconcile پایان تایمر را تشخیص داد', timer.reconcile() === true);
  await wait(150);
  check('پس از پایان، زمان صفر نمایش داده شد', $('#header-timer .htimer-clock')?.textContent === '00:00', $('#header-timer .htimer-clock')?.textContent);
  check('پیام پایان (toast) به کاربر نشان داده شد', count('body .toast') >= 1, $$('.toast').map((t) => t.textContent).join(' | ').slice(0, 90));
  check('وضعیت «تمام‌شده» روی تایمر نشست', $('#header-timer .htimer')?.classList.contains('is-done') === true);
  check('تایمر تمام‌شده دیگر اجرا نمی‌شود', store.getState().pomodoro?.running === false);

  // بی‌صدا کردن
  const soundBtn = $('#header-timer .htimer-sound');
  const soundBefore = store.getState().prefs?.sound !== false;
  soundBtn.click();
  await wait(80);
  check('دکمه‌ی صدا، ترجیح کاربر را عوض کرد', (store.getState().prefs?.sound !== false) === !soundBefore);
  check('aria-pressed دکمه‌ی صدا به‌روز شد', soundBtn.getAttribute('aria-pressed') === String(!soundBefore));
  soundBtn.click();
  await wait(80);

  $('#header-timer .htimer-cancel').click();
  await wait(120);
  check('با لغو، تایمر از سربرگ پنهان شد', $('#header-timer .htimer-active')?.hidden === true);
}

section('بازنمایی بصری درس‌ها');
{
  const { ALL_LESSONS } = await import(pathToFileURL(join(ROOT, 'src/data/curriculum/index.js')).href);
  const diagrams = await import(pathToFileURL(join(ROOT, 'src/components/diagrams.js')).href);

  const badKeys = ALL_LESSONS.filter((l) => l.visual && !diagrams.diagramKeys().includes(l.visual));
  check('کلید visual همه‌ی درس‌ها واقعاً وجود دارد', badKeys.length === 0, badKeys.map((l) => `${l.id}→${l.visual}`).join(', '));

  const withVisual = ALL_LESSONS.filter((l) => l.visual);
  let emptyBoxes = 0;
  let rendered = 0;
  for (const lesson of withVisual) {
    app.navigate('academy', { nodeId: lesson.id });
    await wait(0);
    const box = $('.lesson-visual');
    if (!box) { emptyBoxes++; continue; }
    if (box.querySelector('.diagram')) rendered++;
    else emptyBoxes++;
  }
  check(`جعبه‌ی «بازنمایی بصری» هیچ درس خالی نیست (${rendered}/${withVisual.length})`, emptyBoxes === 0, `${emptyBoxes} جعبه‌ی خالی`);

  // درسی بدون visual نباید جعبه‌ی خالی بسازد
  const withoutVisual = ALL_LESSONS.filter((l) => !l.visual)[0];
  app.navigate('academy', { nodeId: withoutVisual.id });
  await wait(50);
  check(`درس بدون دیاگرام (${withoutVisual.id}) جعبه‌ی خالی نمی‌سازد`, count('.lesson-visual') === 0);
}

section('آمار زنده — KPIهایی که قبلاً صفر می‌ماندند');
{
  app.navigate('academy', { nodeId: 'union-types' });
  await wait(250);
  const runsBefore = store.getState().labRuns ?? 0;
  const lab = $('.live-lab');
  const editor = lab.querySelector('.editor-input');
  editor.value = 'const kpiProbe: number = 1;\nconsole.log(kpiProbe);';
  editor.dispatchEvent(new window.Event('input', { bubbles: true }));
  const runButton = [...lab.querySelectorAll('.lab-actions button')].find((b) => /اجرا/.test(b.textContent));
  runButton.click();
  await waitFor(() => (store.getState().labRuns ?? 0) > runsBefore, { label: 'labRuns increase', timeout: 15000 });
  check('اجرای آزمایشگاه، KPI «labRuns» را افزایش داد', (store.getState().labRuns ?? 0) > runsBefore, `${runsBefore} → ${store.getState().labRuns}`);

  const { WEEKLY_KPIS, kpiActual } = await import(pathToFileURL(join(ROOT, 'src/data/playbook.js')).href);
  const actual = kpiActual(store.getState(), (id) => Boolean(store.getState().labSaves[id] ?? true));
  check('هر KPI هفتگی یک منبع محاسبه‌شده‌ی واقعی دارد',
    WEEKLY_KPIS.every((k) => Number.isFinite(actual[k.key])),
    WEEKLY_KPIS.map((k) => `${k.key}=${actual[k.key]}`).join(', '));
  check('KPI اجرای آزمایشگاه واقعاً از صفر گذشته است', actual.labRuns > 0, `labRuns=${actual.labRuns}`);
  check('KPI پومودورو با همین تست افزایش یافته است', actual.pomodoros > 0, `pomodoros=${actual.pomodoros}`);
  check('KPI دقت کوییز با پاسخ‌های قبلی پر شده است', actual.quizAccuracy > 0, `quizAccuracy=${actual.quizAccuracy}`);
}

section('کوییز per-lesson');
{
  const PROBE_LESSON = 'intersection-types';
  app.navigate('academy', { nodeId: PROBE_LESSON });
  await wait(200);
  const solvedBefore = store.getState().quizSolved?.[PROBE_LESSON];
  $$('.quiz-card .quiz-option')[0].click();
  await wait(150);
  const solvedAfter = store.getState().quizSolved?.[PROBE_LESSON];
  check('نتیجه‌ی کوییز برای همان درس ذخیره شد', solvedBefore === undefined && typeof solvedAfter === 'boolean', `${solvedBefore} → ${solvedAfter}`);
  check('نشان کوییز در فهرست درس‌ها ظاهر شد', count('.lesson-quiz-badge') >= 1, `${count('.lesson-quiz-badge')} نشان`);

  // بازگردانی: با ورود دوباره به همان درس، نتیجه باید برگردد نه کوییز خام
  app.navigate('roadmap');
  await wait(120);
  app.navigate('academy', { nodeId: PROBE_LESSON });
  await wait(200);
  check('کوییز پاسخ‌داده‌شده، بازگردانی شد (دوباره خام نیست)',
    $('.quiz-card')?.classList.contains('is-answered') === true && $$('.quiz-option').every((b) => b.disabled),
  );
  check('توضیح پاسخ هنگام بازگردانی هم دیده می‌شود', ($('.quiz-feedback')?.textContent ?? '').trim().length > 20);
}

section('پوشش کامل محتوا در DOM');
{
  const { ALL_LESSONS } = await import(pathToFileURL(join(ROOT, 'src/data/curriculum/index.js')).href);
  let rendered = 0;
  const broken = [];
  for (const lesson of ALL_LESSONS) {
    try {
      app.navigate('academy', { nodeId: lesson.id });
      await wait(0);
      if (count('.lesson-grid') === 1 && count('.quiz-option') >= 2 && count('.live-lab') >= 1) rendered++;
      else broken.push(lesson.id);
    } catch (error) {
      broken.push(`${lesson.id} (${error.message})`);
    }
  }
  check(`هر ${ALL_LESSONS.length} درس کامل رندر شد (گام + کوییز + آزمایشگاه)`, broken.length === 0, broken.slice(0, 8).join(', '));
  console.log(`  رندرشد: ${rendered}/${ALL_LESSONS.length}`);
}

section('خطاهای کنسول');
const realErrors = consoleErrors.filter((e) => !/Could not parse CSS|Not implemented/i.test(e));
check('هیچ خطای کنسولی ثبت نشد', realErrors.length === 0, realErrors.slice(0, 5).join(' || ').slice(0, 400));

console.log(`\n${failures === 0 ? `✅ همه‌ی ${checks} بررسی موفق بود.` : `❌ ${failures} بررسی ناموفق از ${checks}.`}`);
process.exit(failures === 0 ? 0 : 1);

function readQuizStats() {
  return store.getState().quizStats ?? { correct: 0, wrong: 0 };
}

function readPersistedStats() {
  const raw = window.localStorage.getItem('ts-visual-studio/v1');
  const parsed = raw ? JSON.parse(raw) : { quizStats: {} };
  return parsed.quizStats ?? { correct: 0, wrong: 0 };
}
