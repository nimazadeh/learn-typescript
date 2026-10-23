/* ==========================================================================
   Header Timer — شمارش معکوس پومودورو در سربرگ

   چرا در سربرگ؟ چون تایمر باید هنگام درس‌خواندن در هر نمایی دیده شود و با
   جابه‌جایی بین نماها از کار نیفتد. موتور واقعی در services/timer.js است؛
   این فایل فقط «نمایش» است (جداسازی وضعیت از نما).
   ========================================================================== */

import { el, svg, toFa } from '../core/dom.js';
import { getState, setState } from '../core/store.js';
import {
  TIMER_PRESETS, startTimer, pauseTimer, resumeTimer, stopTimer,
  msToClock, remainingOf, progressOf, onTimerChange, onTimerFinish, hasActiveTimer,
} from '../services/timer.js';
import { showToast } from './ui.js';

const RING_R = 13;
const RING_C = 2 * Math.PI * RING_R;

export function HeaderTimer() {
  const clockEl = el('span', {
    class: 'htimer-clock',
    dir: 'ltr',
    'aria-live': 'off', // هر ۲۰۰ms تغییر می‌کند؛ aria-live آن را پر سروصدا می‌کرد
    text: msToClock(remainingOf()),
  });

  const labelEl = el('span', { class: 'htimer-label', text: '' });
  const ringFill = svg('circle', {
    class: 'htimer-ring-fill',
    cx: '16',
    cy: '16',
    r: String(RING_R),
    'stroke-dasharray': RING_C.toFixed(1),
    'stroke-dashoffset': RING_C.toFixed(1),
  });
  const ring = svg('svg', { class: 'htimer-ring', viewBox: '0 0 32 32', 'aria-hidden': 'true' }, [
    svg('circle', { class: 'htimer-ring-bg', cx: '16', cy: '16', r: String(RING_R) }),
    ringFill,
  ]);

  /* --- کنترل‌ها -------------------------------------------------------- */
  const toggleBtn = el('button', {
    class: 'icon-btn htimer-toggle',
    title: 'توقف / ادامه',
    'aria-label': 'توقف یا ادامه‌ی تایمر',
    text: '⏸',
    onclick: () => (getState().pomodoro?.running ? pauseTimer() : resumeTimer()),
  });

  const soundBtn = el('button', {
    class: 'icon-btn htimer-sound',
    title: 'صدا روشن/خاموش',
    'aria-label': 'روشن یا خاموش کردن صدای هشدار',
    'aria-pressed': 'true',
    text: '🔔',
    onclick: () => {
      const next = !(getState().prefs?.sound !== false);
      setState((s) => ({ prefs: { ...s.prefs, sound: next } }));
      paintSound();
    },
  });

  const cancelBtn = el('button', {
    class: 'icon-btn htimer-cancel',
    title: 'لغو تایمر',
    'aria-label': 'لغو تایمر',
    text: '✕',
    onclick: () => { stopTimer(); closePopover(); },
  });

  /* --- popover انتخاب مدت ---------------------------------------------- */
  const customInput = el('input', {
    class: 'htimer-custom-input',
    type: 'number',
    min: '1',
    max: '240',
    step: '1',
    placeholder: '۲۵',
    dir: 'ltr',
    'aria-label': 'مدت دلخواه به دقیقه',
  });

  const presetRow = el('div', { class: 'htimer-presets', role: 'group', 'aria-label': 'مدت‌های آماده' },
    TIMER_PRESETS.map((minutes) => el('button', {
      class: 'htimer-preset',
      dir: 'ltr',
      text: toFa(minutes),
      title: `${toFa(minutes)} دقیقه`,
      dataset: { minutes: String(minutes) },
      'aria-pressed': 'false',
      onclick: () => { customInput.value = String(minutes); paintPresets(minutes); },
    })));

  const startBtn = el('button', {
    class: 'btn primary htimer-start',
    text: '▶ شروع شمارش معکوس',
    onclick: () => {
      const minutes = Number(customInput.value);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        showToast('⏱ اول یک مدت معتبر به دقیقه وارد کن (مثلاً ۲۵).');
        customInput.focus();
        return;
      }
      startTimer(minutes, { label: minutes === 25 ? 'پومودورو' : 'تمرکز' });
      closePopover();
    },
  });

  const popover = el('div', {
    class: 'htimer-popover',
    role: 'dialog',
    'aria-label': 'تنظیم مدت تایمر',
    hidden: true,
  }, [
    el('p', { class: 'htimer-popover-hint', text: 'یک مدت آماده انتخاب کن یا هر عدد دلخواهی بنویس — تایمر معکوس می‌شمارد و در پایان با صدای ملایم خبر می‌دهد.' }),
    presetRow,
    el('div', { class: 'htimer-custom-row' }, [
      el('span', { class: 'htimer-custom-label', text: 'دلخواه:' }),
      customInput,
      el('span', { class: 'htimer-custom-unit', text: 'دقیقه' }),
    ]),
    startBtn,
  ]);

  const openBtn = el('button', {
    class: 'icon-btn htimer-open',
    title: 'تنظیم تایمر پومودورو',
    'aria-label': 'تنظیم تایمر پومودورو',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false',
    text: '⏱',
    onclick: (event) => {
      event.stopPropagation();
      popover.hidden ? openPopover() : closePopover();
    },
  });

  const activeWrap = el('div', { class: 'htimer-active' }, [ring, labelEl, clockEl, toggleBtn, soundBtn, cancelBtn]);
  const root = el('div', { class: 'htimer' }, [openBtn, activeWrap, popover]);

  /* --- رفتار popover ---------------------------------------------------- */
  function openPopover() {
    popover.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    if (!customInput.value) customInput.value = '25';
    paintPresets(Number(customInput.value));
    customInput.focus();
  }

  function closePopover() {
    popover.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('click', (event) => {
    if (popover.hidden) return;
    if (root.contains(event.target)) return;
    closePopover();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !popover.hidden) closePopover();
  });
  popover.addEventListener('click', (event) => event.stopPropagation());
  customInput.addEventListener('input', () => paintPresets(Number(customInput.value)));
  customInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') startBtn.click();
  });

  /* --- نقاشی ------------------------------------------------------------ */
  function paintPresets(selected) {
    presetRow.querySelectorAll('.htimer-preset').forEach((btn) => {
      const isSelected = Number(btn.dataset.minutes) === selected;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function paintSound() {
    const sound = getState().prefs?.sound !== false;
    soundBtn.textContent = sound ? '🔔' : '🔕';
    soundBtn.setAttribute('aria-pressed', String(sound));
    soundBtn.title = sound ? 'صدا روشن است — برای خاموش‌کردن بزن' : 'صدا خاموش است — برای روشن‌کردن بزن';
  }

  function paint() {
    const state = getState().pomodoro ?? {};
    const active = hasActiveTimer();
    root.classList.toggle('is-active', active);
    root.classList.toggle('is-running', Boolean(state.running));
    root.classList.toggle('is-done', !state.running && (state.finished ?? 0) > 0 && remainingOf(state) === 0 && state.totalMs > 0);
    activeWrap.hidden = !active;

    if (!active) {
      paintSound();
      return;
    }

    const remaining = remainingOf(state);
    clockEl.textContent = msToClock(remaining);
    labelEl.textContent = state.label || 'تایمر';
    ringFill.setAttribute('stroke-dashoffset', (RING_C * (1 - progressOf(state))).toFixed(1));

    toggleBtn.textContent = state.running ? '⏸' : '▶';
    toggleBtn.setAttribute('aria-label', state.running ? 'توقف موقت تایمر' : 'ادامه‌ی تایمر');
    toggleBtn.title = state.running ? 'توقف موقت' : 'ادامه';
    root.classList.toggle('is-low', remaining > 0 && remaining <= 60_000);
    paintSound();
  }

  /* --- اشتراک ------------------------------------------------------------ */
  onTimerChange(paint);
  onTimerFinish((state) => {
    showToast(`⏱ ${state.label || 'تایمر'} تمام شد — چند دقیقه از صفحه دور شو و به چشمانت استراحت بده.`);
    paint();
  });
  paint();

  return root;
}
