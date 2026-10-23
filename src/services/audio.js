/* ==========================================================================
   Audio — صداهای ملایم استودیو (تنها منبع تولید صدا، DRY)

   اصل طراحی: هشدار باید «اطلاع» بدهد نه «اذیت».
   - موج سینوسی (بدون هارمونیک تیز)
   - پاکت نرم: حمله‌ی تدریجی و محو طولانی (بدون کلیک، بدون بوق)
   - فرکانس‌های بم و فاصله‌های خوش‌آهنگ (پنتاتونیک)
   - حجم بسیار کم و بدون تکرار خودکار
   ========================================================================== */

const MAX_GAIN = 0.06; // عمدتاً آرام؛ حتی در هدفون هم گوش را نمی‌زند
const ATTACK = 0.09;   // ثانیه؛ شروع تدریجی تا صدا «تق» نکند
const RELEASE = 1.45;  // ثانیه؛ محو طولانی و ملایم

function context() {
  try {
    const Ctx = globalThis.AudioContext ?? globalThis.window?.AudioContext ?? globalThis.window?.webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null; // صدا یک افزونه است، هرگز نباید اپ را بشکند
  }
}

/**
 * یک نُت سینوسی با پاکت نرم پخش می‌کند.
 * @param {AudioContext} ctx
 * @param {number} frequency هرتز
 * @param {number} startAt زمان شروع نسبت به currentTime
 * @param {number} peak حجم اوج (۰ تا ۱)
 * @param {number} release مدت محو شدن به ثانیه
 */
function playNote(ctx, frequency, startAt, peak, release) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, startAt);

  // پاکت: سکوت → اوج نرم → محو تدریجی (بدون هیچ قطع ناگهانی)
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + ATTACK);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + ATTACK + release);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + ATTACK + release + 0.05);
}

/**
 * پخش یک ملودی کوتاه و آرام؛ اگر صدا در دسترس یا مجاز نباشد، بی‌صدا برمی‌گردد.
 * @param {{f:number, at:number, gain?:number}[]} notes
 * @returns {boolean} آیا واقعاً پخش شد
 */
function playMelody(notes, { enabled = true } = {}) {
  if (!enabled) return false;
  const ctx = context();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    for (const note of notes) {
      playNote(ctx, note.f, t0 + note.at, Math.min(MAX_GAIN, note.gain ?? MAX_GAIN), RELEASE);
    }
    const lifetime = (t0 + Math.max(...notes.map((n) => n.at)) + ATTACK + RELEASE + 0.2) * 1000;
    setTimeout(() => { try { ctx.close(); } catch { /* مهم نیست */ } }, lifetime);
    return true;
  } catch {
    try { ctx.close(); } catch { /* مهم نیست */ }
    return false;
  }
}

/**
 * زنگ ملایم پایان تایمر — سه نُت صعودی آرام (پنتاتونیک، بدون تیزشدن).
 * عمداً فقط یک بار پخش می‌شود و تکرار خودکار ندارد.
 */
export function softChime(options) {
  return playMelody([
    { f: 392.0, at: 0.0 },   // G4
    { f: 523.25, at: 0.38 }, // C5
    { f: 659.25, at: 0.76 }, // E5
  ], options);
}

/** تأیید کوتاه و بسیار ظریف (پایان بلوک، ثبت پاسخ درست). */
export function softTick(options) {
  return playMelody([{ f: 523.25, at: 0 }], options);
}

/** آیا پخش صدا در این مرورگر ممکن است (برای غیرفعال‌کردن هوشمندانه‌ی کلیدها). */
export function audioAvailable() {
  return Boolean(
    globalThis.AudioContext ?? globalThis.window?.AudioContext ?? globalThis.window?.webkitAudioContext,
  );
}
