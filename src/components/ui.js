/* ==========================================================================
   Shared UI Components — اجزای مشترک همه‌ی نماها (یک‌بار بنویس، همه‌جا استفاده کن)
   ========================================================================== */

import { el, svg, render, toFa } from '../core/dom.js';
import { highlightedLines, CODE_LANGS } from '../core/highlight.js';
import { cycleNodeStatus, saveNote, getState, recordQuiz, recordLessonQuiz, quizSolvedOf } from '../core/store.js';

/* -------------------------------------------------------------------------- */
/* Section heading + chips                                                     */
/* -------------------------------------------------------------------------- */

export function sectionTitle(text, subtitle = '', icon = '') {
  return el('div', { class: 'section-head' }, [
    el('h2', { class: 'section-title' }, [icon && el('span', { class: 'section-icon', text: icon }), text]),
    subtitle && el('p', { class: 'section-subtitle', text: subtitle }),
  ]);
}

/**
 * پیام کوتاه و موقت در پایین صفحه (تنها پیاده‌سازی toast در کل اپ).
 * @param {string} text
 * @param {object} [options]
 * @param {number} [options.duration] چند میلی‌ثانیه دیده شود
 * @param {'status'|'alert'} [options.role] برای صفحه‌خوان‌ها
 */
export function showToast(text, { duration = 4200, role = 'status' } = {}) {
  const toast = el('div', {
    class: 'toast',
    text,
    role,
    'aria-live': role === 'alert' ? 'assertive' : 'polite',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('is-out'), duration);
  setTimeout(() => toast.remove(), duration + 600);
  return toast;
}

export function chip(text, variant = 'neutral', title = '') {
  return el('span', { class: `chip chip-${variant}`, title, text });
}

export function statusChip(status) {
  const map = {
    mastered: ['تسلط کامل', 'success'],
    learning: ['در حال یادگیری', 'warning'],
    review: ['نیاز به مرور', 'danger'],
    none: ['شروع نشده', 'neutral'],
  };
  const [label, variant] = map[status] ?? map.none;
  return chip(label, variant);
}

export function levelChip(level) {
  const map = { beginner: ['مقدماتی', 'info'], intermediate: ['متوسط', 'warning'], advanced: ['پیشرفته', 'danger'] };
  const [label, variant] = map[level] ?? ['—', 'neutral'];
  return chip(label, variant);
}

/* -------------------------------------------------------------------------- */
/* Code block (single implementation for the entire app)                       */
/* -------------------------------------------------------------------------- */

/**
 * @param {{title?:string, code:string, onRun?: (code:string)=>void, caption?:string}} opts
 */
/**
 * بلوک کد. `lang` زبان واقعی محتواست ('ts' | 'bash' | 'json').
 * برای زبان‌های غیر TypeScript دکمه‌ی «اجرا در آزمایشگاه» نمایش داده نمی‌شود،
 * چون کامپایلر TypeScript روی `npm i -D typescript` فقط خطا تولید می‌کند.
 */
export function codeBlock({ title, code, onRun = null, caption = '', lang = 'ts' }) {
  const language = CODE_LANGS[lang] ? lang : 'ts';
  title = title ?? CODE_LANGS[language].label;
  const toolbar = el('div', { class: 'code-toolbar' }, [
    el('div', { class: 'code-dots' }, [el('i'), el('i'), el('i')]),
    el('span', { class: 'code-title', text: title }),
    el('div', { class: 'code-actions' }, [
      el('button', {
        class: 'mini-btn',
        text: 'کپی',
        title: 'کپی کد',
        onclick: async (e) => {
          try {
            await navigator.clipboard.writeText(code);
            e.currentTarget.textContent = 'کپی شد ✓';
            setTimeout(() => (e.currentTarget.textContent = 'کپی'), 1400);
          } catch {
            e.currentTarget.textContent = 'ناموفق';
          }
        },
      }),
      onRun &&
        language === 'ts' &&
        el('button', {
          class: 'mini-btn primary',
          text: '▶ اجرا در آزمایشگاه',
          onclick: () => onRun(code),
        }),
    ]),
  ]);

  return el('figure', { class: 'code-block' }, [
    toolbar,
    el('pre', {
      class: 'code-pre',
      dir: 'ltr',
      'data-lang': language,
      innerHTML: highlightedLines(code.replace(/\s+$/, ''), language),
    }),
    caption && el('figcaption', { class: 'code-caption', text: caption }),
  ]);
}

/* -------------------------------------------------------------------------- */
/* حاشیه‌نویسی (Margin Annotations) — فرمول‌های موفقیت و روش‌های یادگیری        */
/* -------------------------------------------------------------------------- */

const MARGIN_KIND_META = {
  formula: { icon: '∑', label: 'فرمول موفقیت', tone: 'formula' },
  method: { icon: '◎', label: 'روش یادگیری', tone: 'method' },
  cleancode: { icon: '✦', label: 'بهترین رویه / Clean Code', tone: 'clean' },
  trap: { icon: '⚠', label: 'تله‌ی رایج', tone: 'trap' },
  interview: { icon: '❝', label: 'سؤال مصاحبه', tone: 'interview' },
};

export function marginNote(note) {
  const meta = MARGIN_KIND_META[note.kind] ?? MARGIN_KIND_META.formula;
  return el('aside', { class: `margin-note tone-${meta.tone}` }, [
    el('header', { class: 'margin-head' }, [
      el('span', { class: 'margin-icon', text: meta.icon }),
      el('span', { class: 'margin-kind', text: note.kicker || meta.label }),
    ]),
    el('h3', { class: 'margin-title', text: note.title }),
    el('div', { class: 'margin-body', innerHTML: richText(note.body) }),
    note.equation && el('div', { class: 'margin-equation', dir: 'ltr', text: note.equation }),
  ]);
}

/** Inline markdown-lite: `code`, **bold** — everything else escaped. */
export function richText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code dir="ltr">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function paragraph(text) {
  return el('p', { class: 'prose', innerHTML: richText(text) });
}

/* -------------------------------------------------------------------------- */
/* Kوییز — بازیابی فعال با بازخورد فوری                                         */
/* -------------------------------------------------------------------------- */

export function quizCard(quiz, nodeId) {
  const root = el('div', { class: 'quiz-card' });
  const feedback = el('div', { class: 'quiz-feedback', hidden: true });

  const options = el('div', { class: 'quiz-options' });

  /** علامت‌گذاری گزینه‌ها و نمایش توضیح (هم برای کلیک تازه، هم برای بازگردانی). */
  function reveal(chosenIndex, { alreadyAnswered = false } = {}) {
    const correct = chosenIndex === quiz.answer;
    options.querySelectorAll('.quiz-option').forEach((btn, i) => {
      btn.disabled = true;
      btn.classList.toggle('is-correct', i === quiz.answer);
      btn.classList.toggle('is-wrong', i === chosenIndex && !correct);
    });
    feedback.hidden = false;
    feedback.className = `quiz-feedback ${correct ? 'is-good' : 'is-bad'}`;
    render(
      feedback,
      el('strong', { text: correct ? '✓ درست — آفرین!' : '✗ نادرست' }),
      el('div', { innerHTML: richText(quiz.explain) }),
      alreadyAnswered && el('p', {
        class: 'quiz-answered-note',
        text: 'قبلاً به این کوییز پاسخ داده‌ای — نتیجه‌اش در فهرست درس‌ها هم دیده می‌شود.',
      }),
    );
    return correct;
  }

  quiz.options.forEach((option, index) => {
    const btn = el('button', {
      class: 'quiz-option',
      onclick: () => {
        const correct = reveal(index);
        recordQuiz(correct);
        recordLessonQuiz(nodeId, correct);
      },
    }, [
      el('span', { class: 'quiz-marker', text: ['A', 'B', 'C', 'D'][index] }),
      el('span', { class: 'quiz-text', innerHTML: richText(option) }),
    ]);
    options.appendChild(btn);
  });

  render(root, el('h3', { class: 'quiz-q' }, [el('span', { text: '؟' }), quiz.q]), options, feedback);

  // اگر قبلاً پاسخ داده بودی، همان نتیجه را بازمی‌گردانیم (نه یک کوییز خاموش)
  const previous = quizSolvedOf(nodeId);
  if (previous !== undefined) {
    const chosen = previous === true ? quiz.answer : (quiz.answer + 1) % quiz.options.length;
    reveal(chosen, { alreadyAnswered: true });
    root.classList.add('is-answered');
  }

  return root;
}

/* -------------------------------------------------------------------------- */
/* نوار پیشرفت                                                                 */
/* -------------------------------------------------------------------------- */

export function progressBar(value, max, label = '') {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return el('div', { class: 'progress-wrap', title: label || `${value} از ${max}` }, [
    el('div', { class: 'progress-track' }, [el('div', { class: 'progress-fill', style: { width: `${pct}%` } })]),
    el('span', { class: 'progress-label', text: `${toFa(pct)}٪` }),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Status toggle برای هر گره‌ی نقشه/درس                                        */
/* -------------------------------------------------------------------------- */

export function statusToggle(nodeId, onChange = null) {
  const btn = el('button', { class: 'status-toggle' });

  const paint = () => {
    const s = getState();
    const status = s.completedNodes.includes(nodeId)
      ? 'mastered'
      : s.inProgressNodes.includes(nodeId)
        ? 'learning'
        : s.reviewNodes.includes(nodeId)
          ? 'review'
          : 'none';
    btn.className = `status-toggle is-${status}`;
    btn.textContent = { mastered: '✓ تسلط دارم', learning: '◐ در حال یادگیری', review: '↻ نیاز به مرور', none: '○ شروع نشده' }[status];
  };

  btn.onclick = () => {
    const next = cycleNodeStatus(nodeId);
    paint();
    onChange?.(next);
  };

  paint();
  return btn;
}

/* -------------------------------------------------------------------------- */
/* دفترچه‌ی یادداشت شخصی (تکنیک فاینمن)                                         */
/* -------------------------------------------------------------------------- */

export function noteBox(nodeId, placeholder = 'با زبان خودت توضیح بده چه یاد گرفتی (تکنیک فاینمن)…') {
  const initial = getState().notes[nodeId] ?? '';
  const area = el('textarea', {
    class: 'note-area',
    rows: 4,
    placeholder,
    value: initial,
  });
  const saved = el('span', { class: 'note-saved', text: '' });

  area.addEventListener('input', () => {
    saveNote(nodeId, area.value);
    saved.textContent = 'ذخیره شد ✓';
    clearTimeout(area._t);
    area._t = setTimeout(() => (saved.textContent = ''), 1500);
  });

  return el('div', { class: 'note-box' }, [
    el('div', { class: 'note-head' }, [
      el('span', { text: '✍️ حاشیه‌نویسی شخصی من' }),
      saved,
    ]),
    area,
  ]);
}

/* -------------------------------------------------------------------------- */
/* SVG helpers for diagrams                                                    */
/* -------------------------------------------------------------------------- */

export function svgText(x, y, text, extra = {}) {
  return svg('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', ...extra }, [text]);
}

export function svgRect(x, y, w, h, extra = {}) {
  return svg('rect', { x, y, width: w, height: h, rx: 8, ...extra });
}
