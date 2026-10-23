/* ==========================================================================
   Store — وضعیت مرکزی، ذخیره‌سازی پایدار، و سیستم رویداد (Publish/Subscribe)
   ========================================================================== */

const STORAGE_KEY = 'ts-visual-studio/v1';

const DEFAULT_STATE = {
  activeNodeId: 'intro-ts',
  completedNodes: [],          // تسلط کامل (mastered)
  inProgressNodes: [],         // در حال یادگیری
  reviewNodes: [],             // نیازمند مرور
  quizStats: { correct: 0, wrong: 0 },
  notes: {},                   // { [nodeId]: string }
  labSaves: {},                // { [nodeId]: string }  آخرین کد آزمایشگاه
  playgroundCode: null,        // آخرین کد Playground سراسری
  flashcardProgress: {},       // { [cardId]: { box: 0..5, due: 'YYYY-MM-DD' } }
  solvedChallenges: {},
  labRuns: 0,
  quizSolved: {},              // { [nodeId]: true } کوییزهایی که پاسخ داده شده‌اند
  pomodorosDone: 0,            // تعداد شمارش‌های معکوسی که امروز شروع شده‌اند
  pomodoro: {                  // تایمر سراسری (پومودورو و بلوک‌های مربی)
    running: false,
    endsAt: null,              // مهر زمانی پایان — باعث می‌شود رفرش صفحه تایمر را نکُشد
    remainingMs: 0,
    totalMs: 0,
    label: '',
    kind: '',
    silent: false,
    finished: 0,
  },
  studyLog: {},                // { 'YYYY-MM-DD': { minutes, sessions, blocks: [0..4] } }
  timer: { blockIndex: 0, remaining: 3000, running: false },
  prefs: { sound: true, density: 'comfortable', showMarginNotes: true, theme: 'dark' },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable — progress stays in memory */
    }
  }, 200);
}

export function getState() {
  return state;
}

export function setState(updater) {
  const patch = typeof updater === 'function' ? updater(state) : updater;
  state = { ...state, ...patch };
  persist();
  listeners.forEach((fn) => fn(state));
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* -------------------------------------------------------------------------- */
/* دامنه‌های تخصصی وضعیت (Domain Slices)                                       */
/* -------------------------------------------------------------------------- */

export function todayKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function setNodeStatus(nodeId, status) {
  setState((s) => {
    const next = {
      completedNodes: s.completedNodes.filter((id) => id !== nodeId),
      inProgressNodes: s.inProgressNodes.filter((id) => id !== nodeId),
      reviewNodes: s.reviewNodes.filter((id) => id !== nodeId),
    };
    const bucket = { mastered: 'completedNodes', learning: 'inProgressNodes', review: 'reviewNodes' }[status];
    if (bucket) next[bucket] = [...next[bucket], nodeId];
    return next;
  });
}

export function cycleNodeStatus(nodeId) {
  const order = ['none', 'learning', 'mastered', 'review'];
  const s = getState();
  const current = s.completedNodes.includes(nodeId)
    ? 'mastered'
    : s.inProgressNodes.includes(nodeId)
      ? 'learning'
      : s.reviewNodes.includes(nodeId)
        ? 'review'
        : 'none';
  const next = order[(order.indexOf(current) + 1) % order.length];
  if (next === 'none') setNodeStatus(nodeId, null);
  else setNodeStatus(nodeId, next);
  return next;
}

export function statusOf(nodeId) {
  const s = getState();
  if (s.completedNodes.includes(nodeId)) return 'mastered';
  if (s.inProgressNodes.includes(nodeId)) return 'learning';
  if (s.reviewNodes.includes(nodeId)) return 'review';
  return 'none';
}

export function saveNote(nodeId, text) {
  setState((s) => ({ notes: { ...s.notes, [nodeId]: text } }));
}

export function saveLab(nodeId, code) {
  setState((s) => ({ labSaves: { ...s.labSaves, [nodeId]: code } }));
}

export function recordQuiz(correct) {
  setState((s) => ({
    quizStats: {
      correct: s.quizStats.correct + (correct ? 1 : 0),
      wrong: s.quizStats.wrong + (correct ? 0 : 1),
    },
  }));
}

/**
 * نتیجه‌ی کوییز یک درس را نگه می‌دارد تا بعداً هم دیده شود
 * (کدام درس‌ها پاسخ داده شده‌اند و آیا درست بوده‌اند).
 */
export function recordLessonQuiz(nodeId, correct) {
  if (!nodeId) return;
  setState((s) => ({ quizSolved: { ...s.quizSolved, [nodeId]: correct } }));
}

/** نتیجه‌ی ذخیره‌شده‌ی کوییز یک درس: true/false یا undefined اگر پاسخ نداده باشد. */
export function quizSolvedOf(nodeId) {
  return getState().quizSolved?.[nodeId];
}

export function logStudyMinutes(minutes) {
  const key = todayKey();
  setState((s) => {
    const day = s.studyLog[key] ?? { minutes: 0, sessions: 0, blocks: [] };
    return {
      studyLog: {
        ...s.studyLog,
        [key]: { ...day, minutes: day.minutes + minutes, sessions: day.sessions + 1 },
      },
    };
  });
}

export function markBlockDone(blockIndex) {
  const key = todayKey();
  setState((s) => {
    const day = s.studyLog[key] ?? { minutes: 0, sessions: 0, blocks: [] };
    if (day.blocks.includes(blockIndex)) return {};
    return {
      studyLog: { ...s.studyLog, [key]: { ...day, blocks: [...day.blocks, blockIndex] } },
    };
  });
}

export function todayEntry() {
  return getState().studyLog[todayKey()] ?? { minutes: 0, sessions: 0, blocks: [] };
}

export function streakDays() {
  const log = getState().studyLog;
  let streak = 0;
  for (let offset = 0; offset < 400; offset++) {
    const entry = log[todayKey(-offset)];
    if (entry && entry.minutes >= 30) streak++;
    else if (offset > 0) break;
  }
  return streak;
}

/* -------------------------------------------------------------------------- */
/* مرور فاصله‌دار — جعبه‌های لایتنر (۱ → ۳ → ۷ → ۱۴ → ۳۰ روز)                  */
/* -------------------------------------------------------------------------- */
const BOX_INTERVALS = [1, 3, 7, 14, 30];

export function cardProgress(cardId) {
  return getState().flashcardProgress[cardId] ?? { box: 0, due: todayKey() };
}

export function reviewCard(cardId, remembered) {
  setState((s) => {
    const current = s.flashcardProgress[cardId] ?? { box: 0, due: todayKey() };
    const box = remembered
      ? Math.min(BOX_INTERVALS.length, current.box + 1)
      : Math.max(0, current.box - 1);
    const due = todayKey(BOX_INTERVALS[Math.max(0, box - 1)] ?? 30);
    return { flashcardProgress: { ...s.flashcardProgress, [cardId]: { box, due } } };
  });
}

export function dueCards(cardIds) {
  const today = todayKey();
  return cardIds.filter((id) => {
    const progress = getState().flashcardProgress[id];
    return !progress || progress.due <= today;
  });
}

export function resetAllProgress() {
  state = structuredClone(DEFAULT_STATE);
  persist();
  listeners.forEach((fn) => fn(state));
}
