/* ==========================================================================
   Content Integrity Checker — یکپارچگی داده‌های آموزشی را بررسی می‌کند
   اجرا: npm run validate
   ========================================================================== */

import { ROADMAP_GRAPH_NODES, ROADMAP_EDGES } from '../src/data/roadmapGraph.js';
import {
  ALL_LESSONS, CHAPTERS, LESSON_BY_ID, CURRICULUM_STATS,
  TOTAL_DAYS, TOTAL_MINUTES, daysPlan, DAY_OF_LESSON, DAILY_MINUTES,
} from '../src/data/curriculum/index.js';
import { STUDY_BLOCKS } from '../src/views/coachView.js';
import { FLASHCARDS, SUCCESS_FORMULAS, INTERVIEW_BANK, PROJECTS, STUDY_METHODS } from '../src/data/playbook.js';

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

console.log(`\n${failures === 0 ? '✅ همه‌ی بررسی‌ها موفق بود.' : `❌ ${failures} بررسی ناموفق.`}`);
process.exit(failures === 0 ? 0 : 1);
