/* ==========================================================================
   Curriculum Index — Single Source of Truth for the Whole Learning Path
   همه‌ی درس‌ها، فصل‌ها و برنامه‌ی روزانه از همین‌جا مشتق می‌شوند (DRY)
   ========================================================================== */

import { PART1_LESSONS } from './part1.js';
import { PART2_LESSONS } from './part2.js';
import { PART3_LESSONS } from './part3.js';
import { PART4_LESSONS } from './part4.js';
import { PART5_LESSONS } from './part5.js';
import { PART6_LESSONS } from './part6.js';
import { PART7_LESSONS } from './part7.js';
import { PART8_LESSONS } from './part8.js';
import { PART9_LESSONS } from './part9.js';
import { PART10_LESSONS } from './part10.js';

export const CHAPTERS = [
  { id: 'ch1', title: 'مبانی و ابزارها', icon: '⚙️', color: '#3178c6', phase: 'زیرساخت' },
  { id: 'ch2', title: 'انواع پایه و آبجکتی', icon: '🧱', color: '#0ea5e9', phase: 'هسته' },
  { id: 'ch3', title: 'انواع بالا/پایین و Assertion', icon: '🛡️', color: '#8b5cf6', phase: 'هسته' },
  { id: 'ch4', title: 'استنتاج و سازگاری تایپ', icon: '🧠', color: '#6366f1', phase: 'هسته' },
  { id: 'ch5', title: 'ترکیب تایپ‌ها', icon: '🧩', color: '#14b8a6', phase: 'هسته' },
  { id: 'ch6', title: 'گاردها و باریک‌سازی', icon: '🔍', color: '#22c55e', phase: 'هسته' },
  { id: 'ch7', title: 'توابع', icon: 'ƒ', color: '#eab308', phase: 'هسته' },
  { id: 'ch8', title: 'اینترفیس‌ها', icon: '📐', color: '#f97316', phase: 'هسته' },
  { id: 'ch9', title: 'کلاس‌ها', icon: '🏛️', color: '#ef4444', phase: 'شیءگرایی' },
  { id: 'ch10', title: 'Generics و Decorators', icon: '🧬', color: '#d946ef', phase: 'پیشرفته' },
  { id: 'ch11', title: 'Utility Types', icon: '🧰', color: '#06b6d4', phase: 'پیشرفته' },
  { id: 'ch12', title: 'انواع پیشرفته', icon: '🪄', color: '#a855f7', phase: 'پیشرفته' },
  { id: 'ch13', title: 'ماژول‌ها', icon: '📦', color: '#84cc16', phase: 'معماری' },
  { id: 'ch14', title: 'اکوسیستم و ابزارها', icon: '🌐', color: '#64748b', phase: 'معماری' },
];

export const ALL_LESSONS = [
  ...PART1_LESSONS,
  ...PART2_LESSONS,
  ...PART3_LESSONS,
  ...PART4_LESSONS,
  ...PART5_LESSONS,
  ...PART6_LESSONS,
  ...PART7_LESSONS,
  ...PART8_LESSONS,
  ...PART9_LESSONS,
  ...PART10_LESSONS,
];

export const LESSON_BY_ID = new Map(ALL_LESSONS.map((lesson) => [lesson.id, lesson]));
export const CHAPTER_BY_ID = new Map(CHAPTERS.map((chapter) => [chapter.id, chapter]));

export function getLesson(id) {
  return LESSON_BY_ID.get(id) ?? null;
}

export function getChapter(id) {
  return CHAPTER_BY_ID.get(id) ?? null;
}

export function lessonsOfChapter(chapterId) {
  return ALL_LESSONS.filter((lesson) => lesson.chapter === chapterId);
}

/* -------------------------------------------------------------------------- */
/* برنامه‌ی روزانه — مشتق‌شده از مجموع دقیقه‌ها با ظرفیت ۵ ساعت در روز         */
/* -------------------------------------------------------------------------- */
export const DAILY_MINUTES = 300; // ۵ ساعت مطالعه‌ی متمرکز در روز

export const TOTAL_MINUTES = ALL_LESSONS.reduce((sum, lesson) => sum + lesson.minutes, 0);

function buildSchedule() {
  let day = 1;
  let used = 0;
  const assignments = new Map();

  for (const lesson of ALL_LESSONS) {
    if (used + lesson.minutes > DAILY_MINUTES && used > 0) {
      day += 1;
      used = 0;
    }
    assignments.set(lesson.id, day);
    used += lesson.minutes;
  }
  return { assignments, totalDays: day };
}

const SCHEDULE = buildSchedule();

export const TOTAL_DAYS = SCHEDULE.totalDays;
export const DAY_OF_LESSON = SCHEDULE.assignments;

export function daysPlan() {
  const byDay = new Map();
  for (const lesson of ALL_LESSONS) {
    const day = DAY_OF_LESSON.get(lesson.id);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(lesson);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, lessons]) => ({
      day,
      lessons,
      minutes: lessons.reduce((sum, l) => sum + l.minutes, 0),
      chapters: [...new Set(lessons.map((l) => l.chapter))],
    }));
}

export const LEVEL_LABEL = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

export const CURRICULUM_STATS = {
  lessons: ALL_LESSONS.length,
  chapters: CHAPTERS.length,
  totalMinutes: TOTAL_MINUTES,
  totalDays: TOTAL_DAYS,
  quizzes: ALL_LESSONS.filter((l) => l.quiz).length,
  labs: ALL_LESSONS.filter((l) => l.lab).length,
  marginNotes: ALL_LESSONS.reduce((sum, l) => sum + (l.margins?.length ?? 0), 0),
  steps: ALL_LESSONS.reduce((sum, l) => sum + (l.steps?.length ?? 0), 0),
};
