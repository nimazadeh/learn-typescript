/* ==========================================================================
   Timer Engine — تنها موتور شمارش معکوس استودیو (پومودورو + بلوک‌های مربی)

   چرا endsAt و نه «ثانیه‌های باقی‌مانده»؟
   چون تایمر باید از جابه‌جایی بین نماها و حتی «رفرش صفحه» جان سالم به در
   ببرد. زمانِ پایان یک واقعیت مطلق است؛ هر لحظه باقی‌مانده از آن مشتق می‌شود،
   پس هیچ drift و هیچ وضعیت گم‌شده‌ای وجود ندارد.

   معماری: store = منبع حقیقت (پایدار) · این ماژول = نبض و محاسبه
   ========================================================================== */

import { getState, setState } from '../core/store.js';
import { formatClock } from '../core/dom.js';
import { softChime } from './audio.js';

const TICK_MS = 200;      // دقت نمایش؛ چون از endsAt مشتق می‌شود، دقیق می‌ماند
const MAX_CUSTOM_MINUTES = 240;

/** دقیقه‌های آماده برای انتخاب سریع (پومودورو کلاسیک: ۲۵). */
export const TIMER_PRESETS = [5, 10, 15, 20, 25, 30, 45, 50, 60, 90];

/** وضعیت اولیه‌ی تایمر سراسری. */
export const IDLE_POMODORO = {
  running: false,
  endsAt: null,
  remainingMs: 0,
  totalMs: 0,
  label: '',
  kind: '',       // 'block' برای بلوک‌های مربی، 'custom' برای پومودوروی دلخواه
  silent: false,  // بدون زنگ پایان (وقتی خودِ نما پیام اختصاصی می‌دهد)
  finished: 0,
};

let intervalId = null;
const listeners = new Set();
const finishListeners = new Set();

const read = () => ({ ...IDLE_POMODORO, ...(getState().pomodoro ?? {}) });

/* -------------------------------------------------------------------------- */
/* محاسبات خالص (بدون وضعیت) — برای تست و استفاده‌ی مجدد                       */
/* -------------------------------------------------------------------------- */

/** دقیقه را به میلی‌ثانیه‌ی معتبر تبدیل می‌کند (برای ورودی دلخواه کاربر). */
export function minutesToMs(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(Math.min(value, MAX_CUSTOM_MINUTES) * 60 * 1000);
}

/** میلی‌ثانیه → «mm:ss» با ارقام فارسی. */
export function msToClock(ms) {
  return formatClock(Math.max(0, Math.ceil(ms / 1000)));
}

/**
 * باقی‌مانده‌ی فعلی را از وضعیت محاسبه می‌کند.
 * در حالت اجرا از `endsAt` مشتق می‌شود؛ در حالت توقف، مقدار ذخیره‌شده.
 */
export function remainingOf(state = read(), now = Date.now()) {
  if (!state) return 0;
  return state.running && state.endsAt ? Math.max(0, state.endsAt - now) : Math.max(0, state.remainingMs ?? 0);
}

/** نسبت پیشرفت بین ۰ و ۱ (برای حلقه‌ی پیشرفت). */
export function progressOf(state = read(), now = Date.now()) {
  const total = state?.totalMs || 0;
  if (!total) return 0;
  return Math.max(0, Math.min(1, 1 - remainingOf(state, now) / total));
}

/* -------------------------------------------------------------------------- */
/* چرخه‌ی حیات                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * شروع (یا شروع دوباره) یک شمارش معکوس.
 * @param {number} minutes دقیقه — هر عددی، نه فقط presetها
 * @param {object} [options]
 * @param {string} [options.label] برچسب فارسی، مثال: «پومودورو»
 * @param {string} [options.kind] «block» برای بلوک مربی، وگرنه «custom»
 * @param {boolean} [options.silent] بدون زنگ پایان (وقتی نما پیام اختصاصی می‌دهد)
 */
export function startTimer(minutes, { label = 'پومودورو', kind = 'custom', silent = false } = {}) {
  const totalMs = minutesToMs(minutes);
  if (!totalMs) return false;

  const now = Date.now();
  const next = {
    ...read(), running: true, endsAt: now + totalMs, remainingMs: totalMs,
    totalMs, label, kind, silent,
  };
  // «تعداد پومودوروهای امروز» همین‌جا ثبت می‌شود تا هیچ KPI هرگز صفر نماند
  setState({ pomodoro: next, pomodorosDone: (getState().pomodorosDone ?? 0) + 1 });
  ensureTick();
  emit();
  return true;
}

/** توقف موقت — باقی‌مانده ذخیره می‌شود تا بعداً دقیقاً از همان‌جا ادامه یابد. */
export function pauseTimer() {
  const state = read();
  if (!state.running) return false;
  stopTick();
  setState({ pomodoro: { ...state, running: false, endsAt: null, remainingMs: remainingOf(state) } });
  emit();
  return true;
}

/** ادامه از نقطه‌ی توقف. */
export function resumeTimer() {
  const state = read();
  if (state.running || !(state.remainingMs > 0)) return false;
  setState({ pomodoro: { ...state, running: true, endsAt: Date.now() + state.remainingMs } });
  ensureTick();
  emit();
  return true;
}

/** جابه‌جایی بین شروع/توقف (برای یک دکمه). */
export function toggleTimer() {
  return read().running ? pauseTimer() : resumeTimer();
}

/** لغو کامل و بازگشت به حالت بی‌کار (شمارنده‌ی پومودورو دست‌نخورده می‌ماند). */
export function stopTimer() {
  stopTick();
  const state = read();
  setState({ pomodoro: { ...IDLE_POMODORO, finished: state.finished ?? 0 } });
  emit();
}

/**
 * اگر تایمر تمام شده باشد، یک‌بار زنگ ملایم می‌زند و وضعیت را ثبت می‌کند.
 * چون مبتنی بر `endsAt` است، حتی اگر صفحه مخفی بوده یا رفرش شده باشد، درست کار می‌کند.
 */
export function reconcile(now = Date.now()) {
  const state = read();
  if (!state.running || !state.endsAt) return false;
  if (state.endsAt > now) return false;

  stopTick();
  const finished = (state.finished ?? 0) + 1;
  setState({
    pomodoro: {
      ...state, running: false, endsAt: null, remainingMs: 0, finished,
    },
  });

  if (!state.silent && getState().prefs?.sound !== false) softChime();
  for (const fn of finishListeners) {
    try { fn(state); } catch { /* یک شنونده‌ی خراب نباید تایمر را از کار بیندازد */ }
  }
  emit();
  return true;
}

/* -------------------------------------------------------------------------- */
/* نبض و اشتراک                                                                 */
/* -------------------------------------------------------------------------- */

function tick() {
  if (reconcile()) return;
  emit();
}

function ensureTick() {
  if (intervalId !== null) return;
  intervalId = setInterval(tick, TICK_MS);
}

function stopTick() {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

function emit() {
  for (const fn of listeners) {
    try { fn(read()); } catch { /* یک شنونده‌ی خراب نباید تایمر را از کار بیندازد */ }
  }
}

/** اشتراک در تغییرات تایمر (برای هدر و مربی). تابع لغو برمی‌گرداند. */
export function onTimerChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** اشتراک در رویداد «تایمر تمام شد» (برای toast). تابع لغو برمی‌گرداند. */
export function onTimerFinish(fn) {
  finishListeners.add(fn);
  return () => finishListeners.delete(fn);
}

/**
 * آیا تایمری برای نمایش روی سربرگ وجود دارد؟
 * تایمرِ «تمام‌شده» هم فعال حساب می‌شود تا کاربر `00:00` و وضعیت پایان را ببیند
 * (نه آخرین زمان مانده‌ی کهنه).
 */
export function hasActiveTimer() {
  const state = read();
  return Boolean(state.running || state.remainingMs > 0 || (state.finished > 0 && state.totalMs > 0));
}

/** هنگام بالا آمدن اپ: اگر تایمری از قبل در جریان بود، نبض را برگردان. */
export function reviveTimer() {
  const state = read();
  if (state.running && state.endsAt) {
    if (!reconcile()) ensureTick();
    emit();
    return true;
  }
  return false;
}
