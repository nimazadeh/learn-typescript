/* ==========================================================================
   Shared UI Components — اجزای مشترک همه‌ی نماها (یک‌بار بنویس، همه‌جا استفاده کن)
   ========================================================================== */

import { el, svg, render, toFa } from '../core/dom.js';
import { highlightedLines } from '../core/highlight.js';
import { cycleNodeStatus, saveNote, getState, recordQuiz, saveLab } from '../core/store.js';

/* -------------------------------------------------------------------------- */
/* Section heading + chips                                                     */
/* -------------------------------------------------------------------------- */

export function sectionTitle(text, subtitle = '', icon = '') {
  return el('div', { class: 'section-head' }, [
    el('h2', { class: 'section-title' }, [icon && el('span', { class: 'section-icon', text: icon }), text]),
    subtitle && el('p', { class: 'section-subtitle', text: subtitle }),
  ]);
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
export function codeBlock({ title = 'TypeScript', code, onRun = null, caption = '' }) {
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
        el('button', {
          class: 'mini-btn primary',
          text: '▶ اجرا در آزمایشگاه',
          onclick: () => onRun(code),
        }),
    ]),
  ]);

  return el('figure', { class: 'code-block' }, [
    toolbar,
    el('pre', { class: 'code-pre', dir: 'ltr', innerHTML: highlightedLines(code.replace(/\s+$/, '')) }),
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
    el('h4', { class: 'margin-title', text: note.title }),
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

  quiz.options.forEach((option, index) => {
    const btn = el('button', {
      class: 'quiz-option',
      onclick: () => {
        const correct = index === quiz.answer;
        recordQuiz(correct);
        options.querySelectorAll('.quiz-option').forEach((b, i) => {
          b.disabled = true;
          b.classList.toggle('is-correct', i === quiz.answer);
          b.classList.toggle('is-wrong', i === index && !correct);
        });
        feedback.hidden = false;
        feedback.className = `quiz-feedback ${correct ? 'is-good' : 'is-bad'}`;
        render(
          feedback,
          el('strong', { text: correct ? '✓ درست — آفرین!' : '✗ نادرست' }),
          el('div', { innerHTML: richText(quiz.explain) }),
        );
      },
    }, [
      el('span', { class: 'quiz-marker', text: ['A', 'B', 'C', 'D'][index] }),
      el('span', { class: 'quiz-text', innerHTML: richText(option) }),
    ]);
    options.appendChild(btn);
  });

  render(root, el('h4', { class: 'quiz-q' }, [el('span', { text: '؟' }), quiz.q]), options, feedback);
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
/* Tabs (used by margin pane, output pane, playground)                         */
/* -------------------------------------------------------------------------- */

export function tabs(items, { onSelect = null, initial = 0 } = {}) {
  const nav = el('div', { class: 'tab-nav', role: 'tablist' });
  const panel = el('div', { class: 'tab-panel' });
  const buttons = [];

  const activate = (index) => {
    buttons.forEach((b, i) => b.classList.toggle('is-active', i === index));
    render(panel, items[index].render());
    onSelect?.(items[index].id);
  };

  items.forEach((item, index) => {
    const btn = el('button', {
      class: 'tab-btn',
      role: 'tab',
      text: item.label,
      onclick: () => activate(index),
    });
    if (item.badge) btn.appendChild(el('span', { class: 'tab-badge', text: String(item.badge) }));
    buttons.push(btn);
    nav.appendChild(btn);
  });

  activate(initial);
  return { root: el('div', { class: 'tabs' }, [nav, panel]), activate };
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
