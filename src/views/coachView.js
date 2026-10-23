/* ==========================================================================
   Coach View — موتور مطالعه‌ی روزانه: ۵ ساعت، ۵ بلوک، مرور فاصله‌دار، KPI
   ========================================================================== */

import { el, render, toFa, formatClock } from '../core/dom.js';
import {
  getState, setState, subscribe, statusOf, streakDays, todayEntry, logStudyMinutes,
  markBlockDone, cardProgress, reviewCard, dueCards,
} from '../core/store.js';
import { sectionTitle, chip, progressBar } from '../components/ui.js';
import { FLASHCARDS, WEEKLY_KPIS, STUDY_METHODS } from '../data/playbook.js';
import {
  ALL_LESSONS, DAY_OF_LESSON, TOTAL_DAYS, CHAPTER_BY_ID, DAILY_MINUTES,
} from '../data/curriculum/index.js';
import { diagram } from '../components/diagrams.js';

/* ------------------------------------------------------------------ */
/* Study Blocks — معماری روز ۵ ساعته                                   */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Study Blocks — معماری روز ۵ ساعته (تنها منبع حقیقت)                    */
/* ۵ بلوک × (۵۰ دقیقه کار عمیق + ۱۰ دقیقه استراحت) = دقیقاً ۳۰۰ دقیقه = ۵ ساعت */
/* ------------------------------------------------------------------ */
export const STUDY_BLOCKS = [
  {
    index: 0,
    title: 'بلوک ۱ — یادگیری مفهومی',
    workMinutes: 50,
    breakMinutes: 10,
    goal: 'مطالعه‌ی عمیق درس جدید + دیدن دیاگرام‌های بصری',
    focus: 'فهم، نه حفظ کردن. هر مفهوم را با مثال اجرا کن و پیش از دیدن خروجی، تایپ استنتاجی را حدس بزن.',
    icon: '📖',
    tone: 'blue',
  },
  {
    index: 1,
    title: 'بلوک ۲ — دست‌روی‌کیبورد (آزمایشگاه)',
    workMinutes: 50,
    breakMinutes: 10,
    goal: 'بازنویسی مثال‌ها از صفر + شکستن عمدی کد و خواندن خطاها',
    focus: 'کد را copy نکن؛ تایپ کن. سه حالت (معتبر/نامعتبر/مرزی) را آزمایش کن.',
    icon: '⌨️',
    tone: 'violet',
  },
  {
    index: 2,
    title: 'بلوک ۳ — بازیابی فعال + کوییز',
    workMinutes: 50,
    breakMinutes: 10,
    goal: 'کوییز درس‌ها، کارت‌های مرور فاصله‌دار، توضیح فاینمن در حاشیه',
    focus: 'کتاب را ببند و بازگو کن. هرچه سخت‌تر به یاد آوردی، ماندگارتر می‌شود.',
    icon: '🧠',
    tone: 'amber',
  },
  {
    index: 3,
    title: 'بلوک ۴ — پروژه و چالش',
    workMinutes: 50,
    breakMinutes: 10,
    goal: 'کار روی پروژه‌ی فصل یا یک چالش عملی در آزمایشگاه آزاد',
    focus: 'دانش را در یک مسئله‌ی جدید به کار ببر. این مرحله مهارت می‌سازد نه اطلاعات.',
    icon: '🏗️',
    tone: 'green',
  },
  {
    index: 4,
    title: 'بلوک ۵ — مرور و تثبیت',
    workMinutes: 50,
    breakMinutes: 10,
    goal: 'مرور سریع نکات دیروز + نوشتن خلاصه‌ی سه‌خطی + برنامه‌ریزی فردا',
    focus: 'تثبیت قبل از خواب. خلاصه را با زبان خودت بنویس نه با اصطلاح کتاب.',
    icon: '🌙',
    tone: 'rose',
  },
];

/** دقیقه‌های کار عمیق در هر بلوک (برای تایمر و کارت‌ها). */
export const blockWorkMinutes = (block) => block?.workMinutes ?? 50;
/** دقیقه‌های استراحت بدون صفحه‌نمایش پس از هر بلوک. */
export const blockBreakMinutes = (block) => block?.breakMinutes ?? 10;

const WORK_TOTAL = STUDY_BLOCKS.reduce((sum, b) => sum + b.workMinutes, 0);      // ۲۵۰
const BREAK_TOTAL = STUDY_BLOCKS.reduce((sum, b) => sum + b.breakMinutes, 0);   // ۵۰
const BLOCK_TOTAL = WORK_TOTAL + BREAK_TOTAL;                                    // ۳۰۰ = ۵ ساعت

/** ثانیه‌های بلوک با اندیس دلخواه (با محدودسازی امن). */
function blockSeconds(index) {
  const safe = Math.max(0, Math.min(STUDY_BLOCKS.length - 1, index));
  return blockWorkMinutes(STUDY_BLOCKS[safe]) * 60;
}

let tickTimer = null;

export function CoachView({ navigate }) {
  const root = el('div', { class: 'view coach-view' });
  const state = getState();

  /* ---------------- timer engine ---------------- */
  const timerState = state.timer ?? { blockIndex: 0, remaining: blockSeconds(0), running: false };
  setState({ timer: timerState });

  const clockEl = el('div', { class: 'timer-clock', dir: 'ltr', text: formatClock(timerState.remaining) });
  const ringEl = el('div', { class: 'timer-ring' });
  const blockLabel = el('div', { class: 'timer-block-label' });
  const startBtn = el('button', { class: 'btn primary lg', text: timerState.running ? '⏸ توقف' : '▶ شروع بلوک' });
  const resetBtn = el('button', { class: 'btn ghost', text: '↺ بازنشانی بلوک' });
  const skipBtn = el('button', { class: 'btn ghost', text: '⏭ بلوک بعدی' });

  function currentBlock() {
    return STUDY_BLOCKS[getState().timer.blockIndex] ?? STUDY_BLOCKS[0];
  }

  function paintTimer() {
    const { remaining, running, blockIndex } = getState().timer;
    const block = STUDY_BLOCKS[blockIndex] ?? STUDY_BLOCKS[0];
    const total = blockWorkMinutes(block) * 60;
    const pct = Math.max(0, Math.min(1, 1 - remaining / total));

    clockEl.textContent = formatClock(remaining);
    clockEl.classList.toggle('is-low', remaining <= 60 && remaining > 0);
    startBtn.textContent = running ? '⏸ توقف' : '▶ شروع بلوک';

    render(
      ringEl,
      el('svg', { class: 'ring-svg', viewBox: '0 0 120 120', innerHTML:
        `<circle class="ring-bg" cx="60" cy="60" r="52"></circle>
         <circle class="ring-fill tone-${block.tone}" cx="60" cy="60" r="52"
           stroke-dasharray="${(2 * Math.PI * 52).toFixed(1)}"
           stroke-dashoffset="${((2 * Math.PI * 52) * (1 - pct)).toFixed(1)}"></circle>` }),
    );

    render(blockLabel,
      el('strong', { text: block.title }),
      el('span', { class: 'timer-goal', text: block.goal }),
    );

    blockCards.querySelectorAll('.block-card').forEach((card, index) => {
      card.classList.toggle('is-active', index === blockIndex);
      card.classList.toggle('is-done', getState().studyLog[todayKey()]?.blocks?.includes(index) ?? false);
    });
  }

  function tick() {
    const timer = getState().timer;
    if (!timer.running) return;
    if (timer.remaining <= 1) {
      finishBlock();
      return;
    }
    setState({ timer: { ...timer, remaining: timer.remaining - 1 } });
    paintTimer();
  }

  function finishBlock() {
    const timer = getState().timer;
    const block = STUDY_BLOCKS[timer.blockIndex];
    const nextIndex = Math.min(STUDY_BLOCKS.length - 1, timer.blockIndex + 1);
    markBlockDone(timer.blockIndex);
    // دقیقه‌های همان بلوک یک‌بار و در پایان ثبت می‌شود (بدون شمارش دوباره در هر tick)
    logStudyMinutes(blockWorkMinutes(block));
    setState({ timer: { blockIndex: nextIndex, remaining: blockSeconds(nextIndex), running: false } });
    chime();
    paintTimer();
    renderDayStats();
    notify(`بلوک «${block.title}» تمام شد ✅ — ${toFa(blockBreakMinutes(block))} دقیقه بدون صفحه‌نمایش استراحت کن.`);
  }

  function chime() {
    if (!getState().prefs.sound) return;
    try {
      const Ctx = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.72);
    } catch { /* audio is optional */ }
  }

  function notify(text) {
    const toast = el('div', { class: 'toast', text });
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('is-out'), 4200);
    setTimeout(() => toast.remove(), 4800);
  }

  startBtn.onclick = () => {
    const timer = getState().timer;
    if (!timer.running && tickTimer === null) tickTimer = setInterval(tick, 1000);
    if (timer.running && tickTimer !== null) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    setState({ timer: { ...timer, running: !timer.running } });
    paintTimer();
  };

  resetBtn.onclick = () => {
    const timer = getState().timer;
    setState({ timer: { ...timer, remaining: blockSeconds(timer.blockIndex) } });
    paintTimer();
  };

  skipBtn.onclick = () => {
    const timer = getState().timer;
    const next = Math.min(STUDY_BLOCKS.length - 1, timer.blockIndex + 1);
    setState({ timer: { blockIndex: next, remaining: blockSeconds(next), running: timer.running } });
    paintTimer();
  };

  /* ---------------- day block cards ---------------- */
  const blockCards = el('div', { class: 'block-cards' }, STUDY_BLOCKS.map((block) =>
    el('button', {
      class: 'block-card',
      onclick: () => {
        setState({ timer: { blockIndex: block.index, remaining: blockSeconds(block.index), running: false } });
        paintTimer();
      },
    }, [
      el('div', { class: 'block-card-head' }, [
        el('span', { class: 'block-icon', text: block.icon }),
        el('span', { class: `block-minutes tone-${block.tone}`, text: `${toFa(blockWorkMinutes(block))} + ${toFa(blockBreakMinutes(block))} استراحت` }),
      ]),
      el('strong', { class: 'block-name', text: block.title.replace(/^بلوک \d+ — /, '') }),
      el('p', { class: 'block-goal', text: block.goal }),
      el('p', { class: 'block-focus', text: block.focus }),
    ])));

  /* ---------------- today stats ---------------- */
  const dayStats = el('div', { class: 'day-stats' });

  function renderDayStats() {
    const entry = todayEntry();
    const doneBlocks = entry.blocks?.length ?? 0;
    const minutesToday = entry.minutes ?? 0;
    render(
      dayStats,
      statBox('🔥', toFa(streakDays()), 'روز پیوسته'),
      statBox('⏱️', toFa(minutesToday), 'دقیقه امروز'),
      statBox('🧱', `${toFa(doneBlocks)}/${toFa(STUDY_BLOCKS.length)}`, 'بلوک امروز'),
      statBox('📚', toFa(getState().completedNodes.length), 'درس مسلط'),
      statBox('🎯', `${toFa(accuracy())}٪`, 'دقت کوییز'),
    );
  }

  function accuracy() {
    const { correct, wrong } = getState().quizStats;
    const total = correct + wrong;
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }

  function statBox(icon, value, label) {
    return el('div', { class: 'stat-box' }, [
      el('span', { class: 'stat-box-icon', text: icon }),
      el('strong', { class: 'stat-box-value', text: value }),
      el('span', { class: 'stat-box-label', text: label }),
    ]);
  }

  /* ---------------- plan / roadmap of days ---------------- */
  const planWrap = el('div', { class: 'plan-days' });

  function renderPlan() {
    const byDay = new Map();
    ALL_LESSONS.forEach((lesson) => {
      const day = DAY_OF_LESSON.get(lesson.id);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(lesson);
    });

    const days = [...byDay.entries()].sort((a, b) => a[0] - b[0]);
    const todayDay = days.find(([_, lessons]) => lessons.some((l) => statusOf(l.id) !== 'mastered'))?.[0] ?? 1;

    render(
      planWrap,
      ...days.map(([day, lessons]) => {
        const done = lessons.filter((l) => statusOf(l.id) === 'mastered').length;
        const minutes = lessons.reduce((sum, l) => sum + l.minutes, 0);
        const isToday = day === todayDay;
        return el('div', { class: `plan-day ${isToday ? 'is-today' : ''} ${done === lessons.length ? 'is-complete' : ''}` }, [
          el('div', { class: 'plan-day-head' }, [
            el('span', { class: 'plan-day-num', text: `روز ${toFa(day)}` }),
            el('span', { class: 'plan-day-meta', text: `${toFa(lessons.length)} درس · ${toFa(minutes)} دقیقه` }),
            isToday ? chip('امروز', 'warning') : done === lessons.length ? chip('تکمیل', 'success') : null,
          ]),
          progressBar(done, lessons.length),
          el('ul', { class: 'plan-day-list' }, lessons.map((lesson) =>
            el('li', {}, [
              el('button', {
                class: `plan-lesson is-${statusOf(lesson.id)}`,
                onclick: () => navigate('academy', { nodeId: lesson.id }),
                title: lesson.titleEn,
              }, [
                el('span', { class: 'plan-lesson-status', text: { mastered: '✓', learning: '◐', review: '↻', none: '○' }[statusOf(lesson.id)] }),
                lesson.titleFa,
              ]),
            ]))),
          el('span', { class: 'plan-day-chapters', text: [...new Set(lessons.map((l) => CHAPTER_BY_ID.get(l.chapter)?.title ?? ''))].join(' · ') }),
        ]);
      }),
    );
  }

  /* ---------------- flashcards (spaced repetition) ---------------- */
  const cardStage = el('div', { class: 'card-stage' });
  let cardIndex = 0;
  let revealed = false;
  let queue = [];

  function loadQueue() {
    const due = dueCards(FLASHCARDS.map((c) => c.id));
    queue = due.length > 0 ? due : FLASHCARDS.map((c) => c.id);
    cardIndex = 0;
    revealed = false;
  }

  function renderCard() {
    if (queue.length === 0) {
      render(cardStage, el('div', { class: 'card-empty', text: 'همه‌ی کارت‌ها مرور شدند 🎉' }));
      return;
    }
    const card = FLASHCARDS.find((c) => c.id === queue[cardIndex % queue.length]);
    const progress = cardProgress(card.id);

    if (!revealed) {
      render(
        cardStage,
        el('div', { class: 'flashcard is-front' }, [
          el('div', { class: 'flashcard-topics' }, [
            chip(card.topic, 'info'),
            chip(`جعبه‌ی ${toFa(progress.box + 1)} از ۵`, 'neutral'),
          ]),
          el('p', { class: 'flashcard-front', innerHTML: card.front.replace(/`([^`]+)`/g, '<code dir="ltr">$1</code>') }),
          el('button', { class: 'btn primary lg', text: '👁 نمایش پاسخ', onclick: () => { revealed = true; renderCard(); } }),
          el('p', { class: 'flashcard-hint', text: 'اول با صدای بلند پاسخ بده، بعد کارت را برگردان — این بازیابی فعال است.' }),
        ]),
      );
      return;
    }

    render(
      cardStage,
      el('div', { class: 'flashcard is-back' }, [
        el('div', { class: 'flashcard-topics' }, [chip(card.topic, 'info')]),
        el('p', { class: 'flashcard-front small', innerHTML: card.front.replace(/`([^`]+)`/g, '<code dir="ltr">$1</code>') }),
        el('p', { class: 'flashcard-back', innerHTML: card.back.replace(/`([^`]+)`/g, '<code dir="ltr">$1</code>') }),
        el('div', { class: 'flashcard-actions' }, [
          el('button', { class: 'btn danger', text: '✗ یادم نیامد', onclick: () => answer(false) }),
          el('button', { class: 'btn warn', text: '~ تقریباً', onclick: () => answer(false) }),
          el('button', { class: 'btn success', text: '✓ یادم بود', onclick: () => answer(true) }),
        ]),
      ]),
    );
  }

  function answer(remembered) {
    const card = FLASHCARDS.find((c) => c.id === queue[cardIndex % queue.length]);
    reviewCard(card.id, remembered);
    cardIndex++;
    revealed = false;
    renderCard();
    renderCardStats();
  }

  const cardStats = el('div', { class: 'card-stats' });
  function renderCardStats() {
    const progressMap = getState().flashcardProgress;
    const boxes = [0, 0, 0, 0, 0, 0];
    FLASHCARDS.forEach((c) => { boxes[(progressMap[c.id]?.box ?? 0)]++; });
    render(
      cardStats,
      el('span', { class: 'card-stat', text: `مرور امروز: ${toFa(dueCards(FLASHCARDS.map((c) => c.id)).length)} کارت` }),
      el('span', { class: 'card-stat', text: `مسلط (جعبه ۴-۵): ${toFa(boxes[4] + boxes[5])}` }),
      el('span', { class: 'card-stat', text: `در حال یادگیری: ${toFa(boxes[1] + boxes[2] + boxes[3])}` }),
      el('span', { class: 'card-stat', text: `دیده‌نشده: ${toFa(boxes[0])}` }),
    );
  }

  /* ---------------- KPIs ---------------- */
  const kpiWrap = el('div', { class: 'kpi-grid' });
  function renderKpis() {
    const s = getState();
    const actual = {
      lessons: s.completedNodes.filter((id) => ALL_LESSONS.some((l) => l.id === id)).length,
      minutes: Object.values(s.studyLog).reduce((sum, d) => sum + (d.minutes ?? 0), 0),
      quizAccuracy: accuracy(),
      labRuns: s.labRuns ?? 0,
      flashcards: Object.keys(s.flashcardProgress).length,
      errors: s.notes ? Object.keys(s.notes).length : 0,
    };
    render(
      kpiWrap,
      ...WEEKLY_KPIS.map((kpi) => el('div', { class: 'kpi-card' }, [
        el('div', { class: 'kpi-head' }, [
          el('strong', { text: kpi.label }),
          el('span', { class: 'kpi-unit', text: kpi.unit }),
        ]),
        progressBar(actual[kpi.key] ?? 0, kpi.target),
        el('span', { class: 'kpi-values', text: `${toFa(actual[kpi.key] ?? 0)} از ${toFa(kpi.target)}` }),
      ])),
    );
  }

  /* ---------------- methods ---------------- */
  const methodsGrid = el('div', { class: 'methods-grid' }, STUDY_METHODS.map((m) =>
    el('article', { class: 'method-card' }, [
      el('span', { class: 'method-icon', text: m.icon }),
      el('h4', { text: m.title }),
      el('p', { text: m.body }),
    ])));

  /* ---------------- assemble ---------------- */
  render(
    root,
    sectionTitle('مربی مطالعه — روز ۵ ساعته', 'معماری علمی یک روز یادگیری عمیق: پنج بلوک متمرکز با استراحت‌های تثبیت‌کننده', '⏱️'),
    el('div', { class: 'coach-grid' }, [
      el('section', { class: 'coach-timer-card' }, [
        ringEl,
        clockEl,
        blockLabel,
        el('div', { class: 'timer-controls' }, [startBtn, resetBtn, skipBtn]),
        el('div', { class: 'timer-prefs' }, [
          el('label', { class: 'switch' }, [
            el('input', {
              type: 'checkbox',
              checked: getState().prefs.sound,
              onchange: (e) => { getState().prefs.sound = e.target.checked; setState({}); },
            }),
            el('span', { text: 'صدای پایان بلوک' }),
          ]),
          el('span', {
            class: 'timer-total',
            text: `مجموع روزانه: ${toFa(WORK_TOTAL)} دقیقه کار عمیق + ${toFa(BREAK_TOTAL)} دقیقه استراحت = ${toFa(BLOCK_TOTAL)} دقیقه (۵ ساعت)`,
          }),
        ]),
      ]),
      el('div', { class: 'coach-right' }, [dayStats]),
    ]),
    el('section', { class: 'coach-section' }, [
      el('h3', { class: 'section-sub-title', text: '🧱 پنج بلوک روز — روی هرکدام کلیک کن تا تایمر تنظیم شود' }),
      blockCards,
    ]),
    el('section', { class: 'coach-split' }, [
      el('div', { class: 'coach-panel' }, [
        el('h3', { class: 'section-sub-title', text: '🗓️ برنامه‌ی روزانه‌ی مسیر (۵ ساعت در روز)' }),
        el('p', { class: 'panel-note', text: `مسیر کامل: ${toFa(ALL_LESSONS.length)} درس در ${toFa(TOTAL_DAYS)} روز. هر روز شامل مطالعه + آزمایشگاه + مرور است.` }),
        planWrap,
      ]),
      el('div', { class: 'coach-panel' }, [
        el('h3', { class: 'section-sub-title', text: '🃏 مرور فاصله‌دار (جعبه‌ی لایتنر)' }),
        el('p', { class: 'panel-note', text: 'فاصله‌ی مرور: ۱ → ۳ → ۷ → ۱۴ → ۳۰ روز. کارت‌هایی که درست پاسخ دهی به جعبه‌ی بعدی می‌روند.' }),
        cardStats,
        cardStage,
        el('button', { class: 'btn ghost', text: '↺ بازنشانی صف کارت‌ها', onclick: () => { loadQueue(); renderCard(); renderCardStats(); } }),
      ]),
    ]),
    el('section', { class: 'coach-section' }, [
      el('h3', { class: 'section-sub-title', text: '📊 شاخص‌های کلیدی هفتگی' }),
      kpiWrap,
    ]),
    el('section', { class: 'coach-section' }, [
      el('h3', { class: 'section-sub-title', text: '🧭 روش‌های مطالعه‌ی مؤثر' }),
      methodsGrid,
    ]),
    el('section', { class: 'coach-section' }, [
      el('h3', { class: 'section-sub-title', text: '🔬 چرا این ساختار کار می‌کند؟' }),
      diagram('inference-flow'),
      el('p', { class: 'panel-note', text: 'مغز در بازه‌های ~۵۰ دقیقه‌ای بیشترین تمرکز را دارد و تثبیت حافظه در استراحت‌های بدون صفحه‌نمایش اتفاق می‌افتد. پنج بلوک بالا دقیقاً بر همین اساس چیده شده‌اند.' }),
    ]),
  );

  loadQueue();
  renderCard();
  renderCardStats();
  renderDayStats();
  renderPlan();
  renderKpis();
  paintTimer();

  const unsubscribe = subscribe(() => {
    renderDayStats();
    renderPlan();
    renderKpis();
  });

  root.addEventListener('view:destroy', () => {
    unsubscribe();
    if (tickTimer !== null) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  });

  return root;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
