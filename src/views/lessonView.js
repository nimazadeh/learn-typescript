/* ==========================================================================
   Lesson View — نمای آموزش گام‌به‌گام: سرفصل + درس + حاشیه‌نویسی + آزمایشگاه
   ========================================================================== */

import { el, render, toFa } from '../core/dom.js';
import {
  ALL_LESSONS, CHAPTERS, CHAPTER_BY_ID, LESSON_BY_ID, LEVEL_LABEL,
  DAY_OF_LESSON, TOTAL_DAYS, lessonsOfChapter,
} from '../data/curriculum/index.js';
import {
  getState, statusOf, setNodeStatus, cycleNodeStatus, subscribe, saveNote,
} from '../core/store.js';
import {
  codeBlock, marginNote, quizCard, statusToggle, levelChip, chip, noteBox,
  paragraph, sectionTitle, progressBar, richText,
} from '../components/ui.js';
import { diagram } from '../components/diagrams.js';
import { LiveLab } from '../components/liveLab.js';

export function LessonView({ navigate, params }) {
  const root = el('div', { class: 'view lesson-view' });
  const sidebar = el('nav', { class: 'lesson-sidebar', 'aria-label': 'فهرست درس‌ها' });
  const article = el('article', { class: 'lesson-article' });
  const marginPane = el('aside', { class: 'lesson-margin', 'aria-label': 'حاشیه‌نویسی‌ها' });

  let activeLab = null;
  let currentId = params?.nodeId && LESSON_BY_ID.has(params.nodeId) ? params.nodeId : getState().activeNodeId;
  if (!LESSON_BY_ID.has(currentId)) currentId = ALL_LESSONS[0].id;

  const grid = el('div', { class: 'lesson-grid' }, [sidebar, article, marginPane]);
  render(root, grid);

  /* ------------------------------------------------------------------ */
  /* Sidebar: فصل‌ها + درس‌ها با وضعیت                                     */
  /* ------------------------------------------------------------------ */
  function renderSidebar() {
    const activeChapter = LESSON_BY_ID.get(currentId)?.chapter;

    const chapterBlocks = CHAPTERS.map((chapter) => {
      const lessons = lessonsOfChapter(chapter.id);
      const done = lessons.filter((l) => statusOf(l.id) === 'mastered').length;
      const isOpen = chapter.id === activeChapter;

      return el('details', { class: `chapter ${isOpen ? 'is-open' : ''}`, open: isOpen }, [
        el('summary', { class: 'chapter-summary' }, [
          el('span', { class: 'chapter-icon', text: chapter.icon }),
          el('div', { class: 'chapter-text' }, [
            el('strong', { text: chapter.title }),
            el('span', { class: 'chapter-meta', text: `${toFa(lessons.length)} درس · روز ${toFa(DAY_OF_LESSON.get(lessons[0].id))}` }),
          ]),
          el('span', { class: 'chapter-count', text: `${toFa(done)}/${toFa(lessons.length)}` }),
        ]),
        el('ul', { class: 'chapter-list' }, lessons.map((lesson) => {
          const status = statusOf(lesson.id);
          return el('li', {}, [
            el('button', {
              class: `lesson-link is-${status} ${lesson.id === currentId ? 'is-current' : ''}`,
              onclick: () => selectLesson(lesson.id),
            }, [
              el('span', { class: 'lesson-status-dot', text: { mastered: '✓', learning: '◐', review: '↻', none: '○' }[status] }),
              el('span', { class: 'lesson-link-text' }, [
                el('span', { class: 'lesson-link-fa', text: lesson.titleFa }),
                el('span', { class: 'lesson-link-en', dir: 'ltr', text: lesson.titleEn }),
              ]),
              el('span', { class: 'lesson-minutes', text: `${toFa(lesson.minutes)}′` }),
            ]),
          ]);
        })),
      ]);
    });

    render(sidebar, el('div', { class: 'sidebar-head' }, [
      el('h3', { text: '📚 سرفصل دوره' }),
      el('span', { class: 'sidebar-count', text: `${toFa(ALL_LESSONS.length)} درس` }),
    ]), ...chapterBlocks);
  }

  /* ------------------------------------------------------------------ */
  /* Article: محتوای درس                                                 */
  /* ------------------------------------------------------------------ */
  function renderLesson() {
    const lesson = LESSON_BY_ID.get(currentId);
    if (!lesson) return;
    const chapter = CHAPTER_BY_ID.get(lesson.chapter);
    const siblings = lessonsOfChapter(lesson.chapter);
    const indexInAll = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
    const prev = ALL_LESSONS[indexInAll - 1];
    const next = ALL_LESSONS[indexInAll + 1];

    /* header */
    const header = el('header', { class: 'lesson-header' }, [
      el('div', { class: 'lesson-crumb' }, [
        el('button', { class: 'crumb-link', text: '🗺️ نقشه‌ی راه', onclick: () => navigate('roadmap') }),
        el('span', { text: ' / ' }),
        el('span', { text: `${chapter?.icon ?? ''} ${chapter?.title ?? ''}` }),
        el('span', { text: ' / ' }),
        el('span', { class: 'crumb-current', text: lesson.titleFa }),
      ]),
      el('h2', { class: 'lesson-title' }, [
        lesson.titleFa,
        el('span', { class: 'lesson-title-en', dir: 'ltr', text: lesson.titleEn }),
      ]),
      el('div', { class: 'lesson-meta-row' }, [
        levelChip(lesson.level),
        chip(`${toFa(lesson.minutes)} دقیقه مطالعه`, 'info'),
        chip(`روز ${toFa(DAY_OF_LESSON.get(lesson.id))}`, 'neutral'),
        chip(lesson.steps?.length ? `${toFa(lesson.steps.length)} گام آموزشی` : '', 'neutral'),
        lesson.quiz ? chip('دارای کوییز', 'success') : null,
        lesson.lab ? chip('دارای آزمایشگاه', 'violet') : null,
      ]),
      el('p', { class: 'lesson-goal' }, [el('strong', { text: '🎯 هدف یادگیری: ' }), lesson.goal]),
      el('div', { class: 'lesson-status-row' }, [statusToggle(lesson.id, () => { renderSidebar(); renderMargin(); })]),
    ]);

    /* steps */
    const steps = el('ol', { class: 'lesson-steps' }, (lesson.steps ?? []).map((step, i) => {
      const body = el('div', { class: 'step-body' }, [
        el('h3', { class: 'step-title' }, [el('span', { class: 'step-index', text: toFa(i + 1) }), step.h]),
        paragraph(step.p),
        step.code ? codeBlock({
          title: step.codeTitle ?? `${lesson.titleEn} — مثال ${toFa(i + 1)}`,
          code: step.code,
          onRun: (code) => {
            if (activeLab) {
              activeLab.setCode(code);
              activeLab.getElement().scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (lesson.lab) {
              selectLesson(lesson.id, code);
            }
          },
        }) : null,
      ]);
      return el('li', { class: 'step' }, [body]);
    }));

    /* visual diagram */
    const visual = lesson.visual ? el('section', { class: 'lesson-visual' }, [
      el('h3', { class: 'block-title', text: '🎨 بازنمایی بصری' }),
      diagram(lesson.visual),
    ]) : null;

    /* quiz */
    const quiz = lesson.quiz ? el('section', { class: 'lesson-quiz' }, [
      el('h3', { class: 'block-title', text: '🧠 بازیابی فعال — خودت را بسنج' }),
      quizCard(lesson.quiz, lesson.id),
    ]) : null;

    /* lab */
    // LiveLab خودش کد ذخیره‌شده‌ی کاربر را بر این مقدار اولویت می‌دهد
    const labSeed = params?.labCode ?? lesson.lab?.starter ?? lesson.steps?.[0]?.code ?? '';
    if (lesson.lab) {
      activeLab = new LiveLab({
        nodeId: lesson.id,
        initialCode: labSeed,
        title: `آزمایشگاه زنده — ${lesson.titleEn}`,
      });
    } else {
      activeLab = new LiveLab({ initialCode: labSeed, title: 'آزمایشگاه زنده' });
    }

    const labSection = el('section', { class: 'lesson-lab' }, [
      el('h3', { class: 'block-title', text: '⚡ آزمایشگاه زنده (TypeScript واقعی)' }),
      lesson.lab?.task ? el('div', { class: 'lab-task' }, [
        el('strong', { text: '📋 تمرین: ' }),
        paragraph(lesson.lab.task),
      ]) : null,
      activeLab.getElement(),
      lesson.lab?.solution
        ? el('details', { class: 'solution-box' }, [
            el('summary', { text: '👁 نمایش راه‌حل پیشنهادی (اول خودت تلاش کن!)' }),
            codeBlock({ title: 'راه‌حل', code: lesson.lab.solution }),
          ])
        : null,
    ]);

    /* pitfalls / best practices / drills */
    const extras = el('section', { class: 'lesson-extras' }, [
      lesson.pitfalls?.length
        ? el('div', { class: 'extra-block warn' }, [
            el('h4', { text: '⚠️ دام‌های رایج' }),
            el('ul', {}, lesson.pitfalls.map((p) => el('li', { innerHTML: richText(p) }))),
          ])
        : null,
      lesson.best?.length
        ? el('div', { class: 'extra-block good' }, [
            el('h4', { text: '✅ بهترین رویه‌ها' }),
            el('ul', {}, lesson.best.map((p) => el('li', { innerHTML: richText(p) }))),
          ])
        : null,
      lesson.drills?.length
        ? el('div', { class: 'extra-block drill' }, [
            el('h4', { text: '🏋️ تمرین‌های دستی' }),
            el('ol', {}, lesson.drills.map((d) => el('li', {}, [
              el('div', { innerHTML: richText(d.prompt) }),
              d.solution
                ? el('details', {}, [
                    el('summary', { text: 'راهنما' }),
                    el('div', { class: 'drill-answer', dir: 'ltr', innerHTML: richText(d.solution) }),
                  ])
                : null,
            ]))),
          ])
        : null,
    ]);

    /* navigation */
    const nav = el('nav', { class: 'lesson-nav' }, [
      prev
        ? el('button', { class: 'btn ghost nav-btn', onclick: () => selectLesson(prev.id) }, [
            el('span', { text: '→ درس قبلی' }),
            el('strong', { text: prev.titleFa }),
          ])
        : el('span'),
      el('button', {
        class: 'btn primary nav-btn center',
        onclick: () => {
          setNodeStatus(lesson.id, 'mastered');
          if (next) selectLesson(next.id);
          else navigate('coach');
        },
      }, [el('span', { text: '✓ تسلط دارم، برو درس بعد' })]),
      next
        ? el('button', { class: 'btn ghost nav-btn reverse', onclick: () => selectLesson(next.id) }, [
            el('span', { text: '← درس بعدی' }),
            el('strong', { text: next.titleFa }),
          ])
        : el('span'),
    ]);

    render(
      article,
      header,
      steps,
      visual,
      quiz,
      labSection,
      extras,
      nav,
    );

    renderMargin(lesson);
    article.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------ */
  /* Margin pane: حاشیه‌نویسی فرمول‌های موفقیت                             */
  /* ------------------------------------------------------------------ */
  function renderMargin(lesson = LESSON_BY_ID.get(currentId)) {
    if (!lesson) return;
    const prefs = getState().prefs;

    const notes = (lesson.margins ?? []).map(marginNote);

    const dayMeta = el('div', { class: 'margin-day' }, [
      el('h4', { text: '📅 جای این درس در برنامه' }),
      el('p', {}, [
        'روز ', el('strong', { text: toFa(DAY_OF_LESSON.get(lesson.id)) }),
        ` از ${toFa(TOTAL_DAYS)} · فصل «${CHAPTER_BY_ID.get(lesson.chapter)?.title ?? ''}»`,
      ]),
      el('p', { class: 'margin-hint', text: `تخمین زمان: ${toFa(lesson.minutes)} دقیقه مطالعه + ۲۰ دقیقه تمرین در آزمایشگاه` }),
    ]);

    const personal = noteBox(lesson.id);

    const nextUp = (() => {
      const idx = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
      const upcoming = ALL_LESSONS.slice(idx + 1, idx + 4);
      if (upcoming.length === 0) return null;
      return el('div', { class: 'margin-next' }, [
        el('h4', { text: '⏭ پیش‌نمایش مسیر' }),
        el('ol', {}, upcoming.map((l) => el('li', {}, [
          el('button', { class: 'linkish', text: l.titleFa, onclick: () => selectLesson(l.id) }),
          el('span', { class: 'next-en', dir: 'ltr', text: l.titleEn }),
        ]))),
      ]);
    })();

    render(
      marginPane,
      el('div', { class: 'margin-head' }, [
        el('h3', { text: '∑ حاشیه‌نویسی' }),
        el('button', {
          class: 'mini-btn',
          text: prefs.showMarginNotes ? 'پنهان کردن' : 'نمایش',
          onclick: () => {
            getState().prefs.showMarginNotes = !prefs.showMarginNotes;
            renderMargin();
          },
        }),
      ]),
      el('p', { class: 'margin-intro', text: 'فرمول‌های موفقیت، روش‌های یادگیری علمی، بهترین رویه‌های Clean Code و سؤالات مصاحبه — همه کنار درس.' }),
      prefs.showMarginNotes ? el('div', { class: 'margin-notes' }, notes) : null,
      dayMeta,
      personal,
      nextUp,
    );
  }

  /* ------------------------------------------------------------------ */
  function selectLesson(id, labCode = null) {
    currentId = id;
    getState().activeNodeId = id;
    if (statusOf(id) === 'none') setNodeStatus(id, 'learning');
    renderSidebar();
    renderLesson();
    if (labCode && activeLab) activeLab.setCode(labCode);
  }

  renderSidebar();
  renderLesson();

  const unsubscribe = subscribe(() => renderSidebar());
  root.addEventListener('view:destroy', unsubscribe);

  return root;
}
