/* ==========================================================================
   Content Integrity Checker — یکپارچگی داده‌های آموزشی را بررسی می‌کند
   اجرا: npm run validate
   ========================================================================== */

import { ROADMAP_GRAPH_NODES, ROADMAP_EDGES } from '../src/data/roadmapGraph.js';
import {
  ALL_LESSONS, CHAPTERS, LESSON_BY_ID, CURRICULUM_STATS,
  TOTAL_DAYS, TOTAL_MINUTES, daysPlan, DAY_OF_LESSON, DAILY_MINUTES,
} from '../src/data/curriculum/index.js';
import { STUDY_BLOCKS, WORK_TOTAL, BREAK_TOTAL, BLOCK_TOTAL } from '../src/views/coachView.js';
import { FLASHCARDS, SUCCESS_FORMULAS, INTERVIEW_BANK, PROJECTS, STUDY_METHODS, WEEKLY_KPIS, kpiActual } from '../src/data/playbook.js';
// توجه: فقط diagramKeys (داده‌ی خالص) اینجا می‌آید. رندر واقعی دیاگرام به DOM
// نیاز دارد و در tools/smoke.mjs بررسی می‌شود.
import { diagramKeys } from '../src/components/diagrams.js';
import { detectLang } from '../src/core/highlight.js';

let failures = 0;

function check(label, condition, detail = '') {
  const ok = Boolean(condition);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
}

const nodeIds = new Set(ROADMAP_GRAPH_NODES.map((n) => n.id));
const lessonIds = new Set(ALL_LESSONS.map((l) => l.id));

check(
  'هر گره‌ی نقشه‌ی راه یک درس دارد',
  [...nodeIds].every((id) => lessonIds.has(id)),
  [...nodeIds].filter((id) => !lessonIds.has(id)).join(', ') || 'همه پوشش داده شدند',
);

check(
  'هر درس یک گره‌ی نقشه دارد',
  [...lessonIds].every((id) => nodeIds.has(id)),
  [...lessonIds].filter((id) => !nodeIds.has(id)).join(', ') || 'بدون درس بی‌گره',
);

check('شناسه‌ی تکراری درس وجود ندارد', ALL_LESSONS.length === lessonIds.size);

check(
  'همه‌ی یال‌های نقشه به گره‌های معتبر اشاره می‌کنند',
  ROADMAP_EDGES.every(([a, b]) => nodeIds.has(a) && nodeIds.has(b)),
);

const chapterIds = new Set(CHAPTERS.map((c) => c.id));
check(
  'همه‌ی فصل‌های درس‌ها تعریف شده‌اند',
  ALL_LESSONS.every((l) => chapterIds.has(l.chapter)),
);

const incomplete = ALL_LESSONS.filter(
  (l) => !l.titleFa || !l.titleEn || !l.goal || !l.steps?.length || !l.margins?.length || !l.quiz || !l.lab,
);
check('همه‌ی درس‌ها کامل‌اند (هدف، گام‌ها، حاشیه، کوییز، آزمایشگاه)', incomplete.length === 0, incomplete.map((l) => l.id).join(', '));

check(
  'همه‌ی کوییزها پاسخ معتبر دارند',
  ALL_LESSONS.every((l) => Number.isInteger(l.quiz?.answer) && l.quiz.answer < l.quiz.options.length),
);

check(
  'هر درس حداقل یک حاشیه‌نویسی «فرمول موفقیت» یا «روش یادگیری» دارد',
  ALL_LESSONS.every((l) => l.margins.some((m) => m.kind === 'formula' || m.kind === 'method')),
);

check('همه‌ی درس‌ها یک روز از برنامه دارند', ALL_LESSONS.every((l) => DAY_OF_LESSON.has(l.id)));

/* ---------------- معماری روز ۵ ساعته (بلوک‌های مربی) ---------------- */
const dayMinutes = STUDY_BLOCKS.reduce((sum, b) => sum + b.workMinutes + b.breakMinutes, 0);
check(
  'بودجه‌ی روزانه‌ی بلوک‌های مربی دقیقاً ۵ ساعت است',
  dayMinutes === DAILY_MINUTES && dayMinutes === 300,
  `${dayMinutes} دقیقه در برابر DAILY_MINUTES=${DAILY_MINUTES}`,
);
check(
  'هر بلوک مطالعه هم «کار عمیق» دارد و هم «استراحت»',
  STUDY_BLOCKS.every((b) => b.workMinutes > 0 && b.breakMinutes > 0 && b.title && b.goal && b.focus),
);

console.log('\n— آمار محتوا —');
console.log(`درس‌ها: ${CURRICULUM_STATS.lessons} | فصل‌ها: ${CURRICULUM_STATS.chapters} | گام‌ها: ${CURRICULUM_STATS.steps}`);
console.log(`حاشیه‌نویسی: ${CURRICULUM_STATS.marginNotes} | کوییز: ${CURRICULUM_STATS.quizzes} | آزمایشگاه: ${CURRICULUM_STATS.labs}`);
console.log(`کارت مرور: ${FLASHCARDS.length} | فرمول موفقیت: ${SUCCESS_FORMULAS.length} | سؤال مصاحبه: ${INTERVIEW_BANK.length}`);
console.log(`روش مطالعه: ${STUDY_METHODS.length} | پروژه: ${PROJECTS.length}`);
console.log(`مجموع دقیقه‌ها: ${TOTAL_MINUTES} (${Math.round(TOTAL_MINUTES / 60)} ساعت) | روزهای برنامه (۵ ساعت/روز): ${TOTAL_DAYS}`);

const plan = daysPlan();
const overloaded = plan.filter((d) => d.minutes > 330);
check('هیچ روزی بیش از ۵.۵ ساعت بار ندارد', overloaded.length === 0, overloaded.map((d) => `روز ${d.day}: ${d.minutes}′`).join(', '));

check(
  'LESSON_BY_ID همه‌ی درس‌ها را با شناسه‌ی یکتا پوشش می‌دهد',
  LESSON_BY_ID.size === ALL_LESSONS.length,
  `${LESSON_BY_ID.size}/${ALL_LESSONS.length}`,
);

/* ---------------- بازنمایی بصری درس‌ها ---------------- */

const visualLessons = ALL_LESSONS.filter((l) => l.visual !== undefined);
const knownDiagrams = new Set(diagramKeys());

check(
  'کلید visual هر درس واقعاً در diagrams.js وجود دارد',
  visualLessons.every((l) => knownDiagrams.has(l.visual)),
  visualLessons.filter((l) => !knownDiagrams.has(l.visual)).map((l) => `${l.id}→${l.visual}`).join(', '),
);

const unusedDiagrams = [...knownDiagrams].filter((k) => !visualLessons.some((l) => l.visual === k));
check(
  'هر دیاگرام دست‌کم در یک درس استفاده شده است',
  unusedDiagrams.length === 0,
  unusedDiagrams.join(', '),
);

/* ---------------- KPIهای هفتگی ---------------- */

const kpiKeys = WEEKLY_KPIS.map((k) => k.key);
const actual = kpiActual({}, () => false);
check(
  'هر KPI هفتگی یک منبع محاسبه‌شده‌ی واقعی در kpiActual دارد',
  kpiKeys.every((k) => k in actual),
  kpiKeys.filter((k) => !(k in actual)).join(', '),
);
check(
  'هیچ KPI محاسبه‌شده‌ای بدون نمایش در کتابچه نمانده است',
  Object.keys(actual).every((k) => kpiKeys.includes(k)),
  Object.keys(actual).filter((k) => !kpiKeys.includes(k)).join(', '),
);
check(
  'هر KPI هدف عددیِ مثبت و برچسب و یکا دارد',
  WEEKLY_KPIS.every((k) => Number.isFinite(k.target) && k.target > 0 && k.label && k.unit),
);

/* ---------------- زبان بلوک‌های کد ---------------- */

const codeBlocks = [];
for (const l of ALL_LESSONS) {
  l.steps?.forEach((st, i) => st.code && codeBlocks.push({ where: `${l.id}#step${i + 1}`, ...st }));
}
const nonTs = codeBlocks.filter((b) => detectLang(b) !== 'ts');
const mislabeled = nonTs.filter((b) => !b.lang && detectLang(b) === 'ts');
check(
  'همه‌ی بلوک‌های کد غیرTypeScript به‌درستی تشخیص داده می‌شوند',
  mislabeled.length === 0,
  mislabeled.map((b) => b.where).join(', '),
);
check(
  'هر بلوکی که lang صریح دارد، مقدار معتبر است',
  codeBlocks.every((b) => !b.lang || ['ts', 'js', 'bash', 'json'].includes(b.lang)),
  codeBlocks.filter((b) => b.lang && !['ts', 'js', 'bash', 'json'].includes(b.lang)).map((b) => b.where).join(', '),
);

/* ---------------- معماری پومودورو ---------------- */

/* این جمع‌ها از خودِ coachView می‌آیند (نه بازمحاسبه‌ی محلی)، پس اگر مربی و
   اعتبارسنج روزی از هم جدا شوند، همین‌جا لو می‌رود. */
check(
  'کار عمیق + استراحتِ بلوک‌ها دقیقاً برابر بودجه‌ی روزانه‌ی ۵ ساعت است',
  BLOCK_TOTAL === DAILY_MINUTES,
  `${WORK_TOTAL} + ${BREAK_TOTAL} = ${BLOCK_TOTAL} در برابر DAILY_MINUTES=${DAILY_MINUTES}`,
);
check(
  'هر بلوک مطالعه هم «کار عمیق» دارد و هم «استراحت»',
  STUDY_BLOCKS.every((b) => b.workMinutes > 0 && b.breakMinutes > 0),
);
check(
  'بلوک‌های روزانه همان ۵ بلوک ۵۰+۱۰ دقیقه‌ای پومودورو هستند',
  STUDY_BLOCKS.length === 5 && WORK_TOTAL === 250 && BREAK_TOTAL === 50,
  `${STUDY_BLOCKS.length} بلوک، کار=${WORK_TOTAL}، استراحت=${BREAK_TOTAL}`,
);

console.log(`\n${failures === 0 ? '✅ همه‌ی بررسی‌ها موفق بود.' : `❌ ${failures} بررسی ناموفق.`}`);
process.exit(failures === 0 ? 0 : 1);
