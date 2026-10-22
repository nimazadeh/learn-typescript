/* ==========================================================================
   Playbook View — فرمول‌های موفقیت، روش‌های یادگیری، بانک مصاحبه و منابع
   ========================================================================== */

import { el, render, toFa, escapeHtml } from '../core/dom.js';
import { sectionTitle, chip, codeBlock, richText, marginNote } from '../components/ui.js';
import {
  SUCCESS_FORMULAS, STUDY_METHODS, INTERVIEW_BANK, RESOURCES, FLASHCARDS,
} from '../data/playbook.js';
import { ALL_LESSONS, CHAPTERS, CURRICULUM_STATS, TOTAL_DAYS } from '../data/curriculum/index.js';
import { getState, statusOf } from '../core/store.js';
import { diagram } from '../components/diagrams.js';

/* فرمول‌های جمع‌بندی‌شده از دل همه‌ی درس‌ها (حاشیه‌نویسی‌های سراسری) */
const ALL_MARGIN_FORMULAS = ALL_LESSONS.flatMap((lesson) =>
  (lesson.margins ?? [])
    .filter((m) => m.kind === 'formula')
    .map((m) => ({ ...m, lessonId: lesson.id, lessonTitle: lesson.titleFa })),
);

export function PlaybookView({ navigate }) {
  const root = el('div', { class: 'view playbook-view' });

  /* ---------------- hero stats ---------------- */
  const hero = el('section', { class: 'playbook-hero' }, [
    el('div', { class: 'hero-text' }, [
      el('h2', { text: '∑ فرمول‌های موفقیت یادگیری TypeScript' }),
      el('p', { class: 'hero-lead', text: 'این صفحه چکیده‌ی همه‌ی «حاشیه‌نویسی‌های موفقیت» استودیو است: ۱۲ قانون طلایی، ۸ روش مطالعه‌ی علمی، بانک سؤالات مصاحبه و منابع معتبر. هر درس هم حاشیه‌نویسی اختصاصی خودش را در ستون کنارش دارد.' }),
      el('div', { class: 'hero-stats' }, [
        heroStat(toFa(CURRICULUM_STATS.lessons), 'درس کامل'),
        heroStat(toFa(CURRICULUM_STATS.marginNotes), 'حاشیه‌نویسی'),
        heroStat(toFa(ALL_MARGIN_FORMULAS.length), 'فرمول موفقیت'),
        heroStat(toFa(INTERVIEW_BANK.length), 'سؤال مصاحبه'),
        heroStat(toFa(FLASHCARDS.length), 'کارت مرور'),
        heroStat(toFa(TOTAL_DAYS), 'روز تا تسلط'),
      ]),
    ]),
    el('div', { class: 'hero-visual' }, [diagram('type-lattice')]),
  ]);

  /* ---------------- formulas ---------------- */
  const formulaGrid = el('div', { class: 'formula-grid' }, SUCCESS_FORMULAS.map((formula, i) =>
    el('article', { class: 'formula-card' }, [
      el('div', { class: 'formula-head' }, [
        el('span', { class: 'formula-icon', text: formula.icon }),
        el('span', { class: 'formula-index', text: toFa(i + 1) }),
      ]),
      el('h3', { text: formula.title }),
      el('div', { class: 'formula-eq', dir: 'ltr', text: formula.equation }),
      el('p', { text: formula.body }),
      el('p', { class: 'formula-impact' }, [el('strong', { text: 'اثر: ' }), formula.impact]),
    ])));

  /* ---------------- methods ---------------- */
  const methodsList = el('div', { class: 'methods-list' }, STUDY_METHODS.map((method) =>
    el('article', { class: 'method-row' }, [
      el('span', { class: 'method-row-icon', text: method.icon }),
      el('div', {}, [
        el('h4', { text: method.title }),
        el('p', { text: method.body }),
      ]),
    ])));

  /* ---------------- interview bank ---------------- */
  const LEVEL_META = {
    junior: { label: 'Junior', tone: 'success' },
    mid: { label: 'Mid-Level', tone: 'warning' },
    senior: { label: 'Senior', tone: 'danger' },
  };

  const interviewWrap = el('div', { class: 'interview-list' }, INTERVIEW_BANK.map((item) =>
    el('details', { class: 'interview-item' }, [
      el('summary', {}, [
        chip(LEVEL_META[item.level].label, LEVEL_META[item.level].tone),
        el('strong', { text: item.q }),
      ]),
      el('div', { class: 'interview-answer' }, [
        el('span', { class: 'answer-label', text: 'پاسخ حرفه‌ای:' }),
        el('p', { innerHTML: richText(item.a) }),
      ]),
    ])));

  /* ---------------- margin formulas index ---------------- */
  const formulaIndex = el('div', { class: 'margin-index' }, ALL_MARGIN_FORMULAS.map((item) =>
    el('button', {
      class: 'margin-index-item',
      onclick: () => navigate('academy', { nodeId: item.lessonId }),
    }, [
      el('span', { class: 'margin-index-lesson', text: item.lessonTitle }),
      el('span', { class: 'margin-index-title', text: item.title }),
      el('span', { class: 'margin-index-kicker', text: item.kicker }),
    ])));

  /* ---------------- resources ---------------- */
  const resourcesWrap = el('div', { class: 'resources-grid' }, RESOURCES.map((group) =>
    el('div', { class: 'resource-group' }, [
      el('h4', { text: group.group }),
      el('ul', {}, group.items.map((item) =>
        el('li', {}, [
          el('a', { href: item.href, target: '_blank', rel: 'noopener noreferrer', text: item.label }),
          el('span', { class: 'resource-note', text: item.note }),
        ]))),
    ])));

  /* ---------------- cheat sheet ---------------- */
  const cheat = el('div', { class: 'cheat-grid' }, [
    cheatCard('Utility Types ضروری', [
      ['Partial<T>', 'همه‌ی فیلدها اختیاری'],
      ['Required<T>', 'همه‌ی فیلدها اجباری'],
      ['Readonly<T>', 'همه‌ی فیلدها تغییرناپذیر'],
      ['Pick<T, K>', 'زیرمجموعه‌ی کلیدها'],
      ['Omit<T, K>', 'حذف کلیدها'],
      ['Record<K, V>', 'نگاشت کلید→مقدار'],
      ['Exclude<T, U>', 'تفریق اعضای Union'],
      ['Extract<T, U>', 'اشتراک اعضای Union'],
      ['NonNullable<T>', 'حذف null/undefined'],
      ['Parameters<T>', 'Tuple پارامترها'],
      ['ReturnType<T>', 'تایپ بازگشتی'],
      ['Awaited<T>', 'بازکردن Promise'],
      ['InstanceType<T>', 'نمونه‌ی یک سازنده'],
    ]),
    cheatCard('الگوهای پرتکرار', [
      ['type X = (typeof ARR)[number]', 'Union از یک آرایه‌ی as const'],
      ['K extends keyof T', 'کلید معتبر + دسترسی تایپ‌امن'],
      ['T extends U ? X : Y', 'منطق شرطی در سطح تایپ'],
      ['[K in keyof T as ...]: ...', 'Mapped با تغییرنام/حذف کلید'],
      ['T extends (…a: never) => infer R', 'استخراج تایپ بازگشتی'],
      ['x is T', 'Type Predicate (گارد سفارشی)'],
      ['asserts x is T', 'گارد بدون بازگشت مقدار'],
      ['as const satisfies T', 'لیترال دقیق + اعتبارسنجی'],
      ['value === undefined ? … : …', 'مدیریت تهی بدون !'],
    ]),
    cheatCard('پرچم‌های tsconfig', [
      ['strict', 'چتر هفت بررسی سخت‌گیرانه'],
      ['noUncheckedIndexedAccess', 'arr[i] → T | undefined'],
      ['exactOptionalPropertyTypes', 'تفکیک نبود کلید از undefined'],
      ['noImplicitOverride', 'الزام override'],
      ['noUnusedLocals', 'حذف کد مرده'],
      ['noFallthroughCasesInSwitch', 'case بدون break'],
      ['declaration', 'تولید .d.ts برای کتابخانه'],
      ['verbatimModuleSyntax', 'الزام import type'],
      ['erasableSyntaxOnly', 'ممنوعیت enum/namespace'],
    ]),
    cheatCard('کدهای خطای پرکاربرد', [
      ['TS2322', 'انتساب تایپ ناسازگار'],
      ['TS2345', 'آرگومان تابع ناسازگار'],
      ['TS2339', 'پراپرتی روی تایپ وجود ندارد'],
      ['TS2551', 'پراپرتی وجود ندارد (پیشنهاد املایی)'],
      ['TS18048', 'مقدار ممکن است undefined باشد'],
      ['TS2531', 'مقدار ممکن است null باشد'],
      ['TS7006', 'پارامتر به‌طور ضمنی any شده'],
      ['TS2304', 'نام پیدا نشد'],
      ['TS2589', 'بازگشت تایپ بیش از حد عمیق'],
    ]),
  ]);

  /* ---------------- assemble ---------------- */
  render(
    root,
    hero,
    sectionTitle('۱۲ قانون طلایی موفقیت', 'این‌ها را جایی بگذار که هر روز ببینی — تکرار، مادر مهارت است', '🏆'),
    formulaGrid,
    sectionTitle('روش‌های مطالعه‌ی علمی', 'چطور بخوانی که فراموش نکنی', '🧭'),
    methodsList,
    sectionTitle('چیت‌شیت مرجع سریع', 'چهار جدولی که روی میز کارت لازم داری', '📋'),
    cheat,
    sectionTitle('بانک سؤالات مصاحبه', `${toFa(INTERVIEW_BANK.length)} سؤال سطح‌بندی‌شده با پاسخ حرفه‌ای — روی هرکدام کلیک کن`, '❝'),
    interviewWrap,
    sectionTitle('فهرست همه‌ی فرمول‌های حاشیه‌نویسی در درس‌ها', 'هر فرمول در دل همان درس قرار دارد؛ کلیک کن تا به درس بروی', '∑'),
    formulaIndex,
    sectionTitle('منابع معتبر برای عمق‌بخشی', 'فقط منابع دست‌اول — پراکندن توجه، دشمن یادگیری عمیق است', '🔗'),
    resourcesWrap,
    buildChapterSummary(navigate),
  );

  return root;
}

/* ------------------------------------------------------------------ */
function heroStat(value, label) {
  return el('div', { class: 'hero-stat' }, [
    el('strong', { text: value }),
    el('span', { text: label }),
  ]);
}

function cheatCard(title, rows) {
  return el('div', { class: 'cheat-card' }, [
    el('h4', { text: title }),
    el('dl', { class: 'cheat-list' }, rows.flatMap(([term, desc]) => [
      el('dt', { dir: 'ltr', text: term }),
      el('dd', { text: desc }),
    ])),
  ]);
}

function buildChapterSummary(navigate) {
  const rows = CHAPTERS.map((chapter) => {
    const lessons = ALL_LESSONS.filter((l) => l.chapter === chapter.id);
    const done = lessons.filter((l) => statusOf(l.id) === 'mastered').length;
    return el('tr', {}, [
      el('td', {}, [el('span', { text: chapter.icon }), ` ${chapter.title}`]),
      el('td', { class: 'num', text: toFa(lessons.length) }),
      el('td', { class: 'num', text: toFa(lessons.reduce((s, l) => s + l.minutes, 0)) }),
      el('td', { class: 'num', text: `${toFa(done)}/${toFa(lessons.length)}` }),
      el('td', {}, [
        el('button', {
          class: 'mini-btn',
          text: 'شروع فصل',
          onclick: () => navigate('academy', { nodeId: lessons[0].id }),
        }),
      ]),
    ]);
  });

  return el('section', { class: 'playbook-section' }, [
    el('h3', { class: 'section-title', text: '📚 خلاصه‌ی فصل‌ها و پیشرفت تو' }),
    el('div', { class: 'table-scroll' }, [
      el('table', { class: 'data-table' }, [
        el('thead', {}, [el('tr', {}, [
          el('th', { text: 'فصل' }), el('th', { text: 'درس‌ها' }), el('th', { text: 'دقیقه' }),
          el('th', { text: 'پیشرفت' }), el('th', { text: '' }),
        ])]),
        el('tbody', {}, rows),
      ]),
    ]),
  ]);
}
