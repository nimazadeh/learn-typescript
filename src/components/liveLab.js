/* ==========================================================================
   Live Lab — آزمایشگاه زنده‌ی TypeScript (کامپایلر واقعی + Type X-Ray)
   همین یک کامپوننت هم در درس‌ها و هم در Playground استفاده می‌شود (DRY)
   ========================================================================== */

import { el, render, debounce, toFa } from '../core/dom.js';
import { highlightedLines } from '../core/highlight.js';
import { compile, runJavaScript, engineLabel } from '../services/compiler.js';
import { saveLab, getState } from '../core/store.js';
import { codeBlock, richText } from './ui.js';

const DEFAULT_FLAGS = {
  strict: true,
  noUncheckedIndexedAccess: false,
  exactOptionalPropertyTypes: false,
  noImplicitOverride: true,
};

const FLAG_META = [
  { key: 'strict', label: 'strict', hint: 'هفت بررسی سخت‌گیرانه‌ی پایه' },
  { key: 'noUncheckedIndexedAccess', label: 'noUncheckedIndexedAccess', hint: 'arr[0] می‌شود T | undefined' },
  { key: 'exactOptionalPropertyTypes', label: 'exactOptionalPropertyTypes', hint: 'تفکیک «نبود کلید» از «کلید با مقدار undefined»' },
  { key: 'noImplicitOverride', label: 'noImplicitOverride', hint: 'الزام override در کلاس فرزند' },
];

export class LiveLab {
  /**
   * @param {{nodeId?:string, initialCode:string, title?:string, autoRun?:boolean, onSave?:()=>void}} opts
   */
  constructor({ nodeId = null, initialCode, title = 'آزمایشگاه زنده', autoRun = true }) {
    this.nodeId = nodeId;
    this.title = title;
    this.flags = { ...DEFAULT_FLAGS };
    this.busy = false;
    this.pendingRun = false;

    const saved = nodeId ? getState().labSaves[nodeId] : null;
    this.code = saved ?? initialCode;

    this.consolePane = el('div', { class: 'pane-body' });
    this.diagPane = el('div', { class: 'pane-body' });
    this.xrayPane = el('div', { class: 'pane-body' });
    this.jsPane = el('div', { class: 'pane-body' });
    this.metaBar = el('div', { class: 'lab-meta' });

    this.buildDom();
    if (autoRun) setTimeout(() => this.run(), 120);
  }

  buildDom() {
    /* --- editor -------------------------------------------------------- */
    this.gutter = el('div', { class: 'editor-gutter', dir: 'ltr', 'aria-hidden': 'true' });
    this.preview = el('pre', { class: 'editor-preview', dir: 'ltr', 'aria-hidden': 'true' });
    this.textarea = el('textarea', {
      class: 'editor-input',
      dir: 'ltr',
      spellcheck: 'false',
      value: this.code,
      'aria-label': 'ویرایشگر کد TypeScript',
    });

    this.textarea.addEventListener('input', () => {
      this.code = this.textarea.value;
      this.syncEditor();
      this.debouncedRun();
      if (this.nodeId) saveLab(this.nodeId, this.code);
    });

    this.textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const { selectionStart: start, selectionEnd: end, value } = this.textarea;
        this.textarea.value = `${value.slice(0, start)}  ${value.slice(end)}`;
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.textarea.dispatchEvent(new Event('input'));
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        this.run();
      }
    });

    this.textarea.addEventListener('scroll', () => {
      this.preview.scrollTop = this.textarea.scrollTop;
      this.preview.scrollLeft = this.textarea.scrollLeft;
      this.gutter.scrollTop = this.textarea.scrollTop;
    });

    /* --- flags --------------------------------------------------------- */
    this.flagRow = el('div', { class: 'flag-row' }, FLAG_META.map((flag) => {
      const input = el('input', {
        type: 'checkbox',
        checked: this.flags[flag.key],
        onchange: (e) => {
          this.flags[flag.key] = e.target.checked;
          this.run();
        },
      });
      return el('label', { class: 'flag-chip', title: flag.hint }, [input, el('span', { dir: 'ltr', text: flag.label })]);
    }));

    /* --- tabs ---------------------------------------------------------- */
    this.tabButtons = [];
    const panes = [
      { id: 'console', label: '🖥️ کنسول', node: this.consolePane },
      { id: 'diag', label: '🩺 خطاها و مربی', node: this.diagPane, badgeEl: true },
      { id: 'xray', label: '🔬 Type X-Ray', node: this.xrayPane },
      { id: 'js', label: '📦 خروجی JS', node: this.jsPane },
    ];

    this.tabNav = el('div', { class: 'lab-tabs' });
    this.tabBody = el('div', { class: 'lab-tab-body' });

    panes.forEach((pane, index) => {
      const btn = el('button', {
        class: 'lab-tab',
        text: pane.label,
        onclick: () => this.activateTab(pane.id),
      });
      if (pane.badgeEl) {
        this.badge = el('span', { class: 'lab-tab-badge', text: '' });
        btn.appendChild(this.badge);
      }
      this.tabButtons.push([pane.id, btn]);
      this.tabNav.appendChild(btn);
      pane.node.hidden = index !== 0;
      this.tabBody.appendChild(pane.node);
    });

    /* --- actions ------------------------------------------------------- */
    const runBtn = el('button', { class: 'btn primary', text: '▶ اجرا و کالبدشکافی', onclick: () => this.run() });
    const resetBtn = el('button', { class: 'btn ghost', text: '↺ بازنشانی', onclick: () => this.reset() });
    this.statusDot = el('span', { class: 'lab-status', text: '…' });

    /* --- root ---------------------------------------------------------- */
    this.root = el('section', { class: 'live-lab' }, [
      el('header', { class: 'lab-head' }, [
        el('div', { class: 'lab-title-wrap' }, [
          el('h3', { class: 'lab-title', text: this.title }),
          this.statusDot,
        ]),
        el('div', { class: 'lab-actions' }, [runBtn, resetBtn]),
      ]),
      el('div', { class: 'editor-shell' }, [
        this.gutter,
        el('div', { class: 'editor-stack' }, [this.preview, this.textarea]),
      ]),
      el('div', { class: 'lab-controls' }, [
        el('span', { class: 'lab-controls-label', text: 'پرچم‌های کامپایلر:' }),
        this.flagRow,
      ]),
      this.metaBar,
      this.tabNav,
      this.tabBody,
      el('p', { class: 'lab-hint' }, [
        'میان‌بر: ', el('kbd', { text: 'Ctrl' }), ' + ', el('kbd', { text: 'Enter' }),
        ' — برای دیدن تایپ هر عبارت، در خط بعد `// ^?` بنویس.',
      ]),
    ]);

    this.activateTab('console');
    this.syncEditor();
    this.debouncedRun = debounce(() => this.run(), 700);
  }

  activateTab(id) {
    this.tabButtons.forEach(([paneId, btn]) => {
      btn.classList.toggle('is-active', paneId === id);
      const pane = { console: this.consolePane, diag: this.diagPane, xray: this.xrayPane, js: this.jsPane }[paneId];
      if (pane) pane.hidden = paneId !== id;
    });
  }

  syncEditor() {
    const lines = this.code.split('\n');
    render(this.preview, el('code', { innerHTML: highlightedLines(this.code) + '\n' }));
    render(
      this.gutter,
      ...lines.map((_, i) => el('div', { class: 'gutter-line', text: String(i + 1) })),
    );
    this.textarea.style.height = 'auto';
    const height = Math.max(240, Math.min(560, this.textarea.scrollHeight));
    this.textarea.style.height = `${height}px`;
    this.preview.style.height = `${height}px`;
    this.gutter.style.height = `${height}px`;
  }

  getCode() {
    return this.code;
  }

  setCode(code, { run = true } = {}) {
    this.code = code;
    this.textarea.value = code;
    this.syncEditor();
    if (this.nodeId) saveLab(this.nodeId, code);
    if (run) this.run();
  }

  reset() {
    if (this.nodeId) {
      const saved = getState().labSaves[this.nodeId];
      if (saved) this.setCode(saved);
      return;
    }
    this.run();
  }

  async run() {
    // اگر کامپایل قبلی هنوز در جریان است، این درخواست را نگه می‌داریم تا
    // کلیک دانش‌آموز بی‌پاسخ نماند (و نتیجه‌ی کد قدیم روی صفحه نماند).
    if (this.busy) {
      this.pendingRun = true;
      return;
    }
    this.busy = true;
    this.pendingRun = false;
    this.statusDot.textContent = 'در حال کامپایل…';
    this.statusDot.className = 'lab-status is-busy';

    try {
      const result = await compile(this.code, this.flags);
      this.renderDiagnostics(result);
      this.renderXRay(result);
      this.renderJs(result);
      this.renderMeta(result);

      if (result.ok) {
        const runResult = await runJavaScript(result.jsCode);
        this.renderConsole(runResult);
        this.statusDot.textContent = runResult.ok ? '✓ اجرا شد' : '✗ خطای زمان اجرا';
        this.statusDot.className = `lab-status ${runResult.ok ? 'is-ok' : 'is-bad'}`;
      } else {
        this.renderConsole({ ok: false, logs: [], error: null, skipped: true });
        this.statusDot.textContent = `✗ ${toFa(result.diagnostics.length)} خطای تایپ`;
        this.statusDot.className = 'lab-status is-bad';
      }
    } catch (err) {
      this.statusDot.textContent = 'خطای غیرمنتظره';
      this.statusDot.className = 'lab-status is-bad';
      render(this.consolePane, el('div', { class: 'console-line error', text: err.message }));
    } finally {
      this.busy = false;
      if (this.pendingRun) {
        this.pendingRun = false;
        void this.run();
      }
    }
  }

  renderMeta(result) {
    const erased = result.erasedStats ?? { tsBytes: 0, jsBytes: 0, erasedNodes: 0 };
    const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;
    render(
      this.metaBar,
      el('span', { class: 'meta-item', text: `⚙️ موتور: ${result.engine ?? '—'}` }),
      el('span', { class: 'meta-item', text: `⏱ کامپایل: ${toFa(result.durationMs ?? 0)}ms` }),
      el('span', {
        class: 'meta-item',
        text: `🧹 گره‌های تایپ پاک‌شده: ${toFa(erased.erasedNodes ?? 0)}`,
        title: 'تعداد گره‌های AST که فقط در TypeScript معنا دارند و در خروجی JavaScript حذف می‌شوند.',
      }),
      el('span', { class: 'meta-item', text: `📏 ${kb(erased.tsBytes)} → ${kb(erased.jsBytes)}` }),
    );
  }

  renderConsole(result) {
    if (result.skipped) {
      render(
        this.consolePane,
        el('div', { class: 'console-empty' }, [
          el('strong', { text: 'اجرا متوقف شد — اول خطاهای تایپ را برطرف کن.' }),
          el('p', { text: 'به تب «خطاها و مربی» برو؛ هر خطا با توضیح فارسی و راه‌حل آمده است.' }),
        ]),
      );
      return;
    }

    const lines = (result.logs ?? []).map((log) =>
      el('div', { class: `console-line ${log.kind}`, dir: 'ltr' }, [
        el('span', { class: 'console-tag', text: log.kind }),
        el('span', { class: 'console-text', text: log.text }),
      ]),
    );

    if (result.error) {
      lines.push(
        el('div', { class: 'console-line error', dir: 'ltr' }, [
          el('span', { class: 'console-tag', text: 'throw' }),
          el('span', { class: 'console-text', text: result.error }),
        ]),
      );
    }

    if (lines.length === 0) {
      lines.push(el('div', { class: 'console-empty', text: 'کد اجرا شد ولی چیزی چاپ نکرد. یک `console.log(...)` اضافه کن.' }));
    } else {
      lines.push(el('div', { class: 'console-runtime', text: `زمان اجرا: ${result.runtimeMs ?? 0}ms` }));
    }

    render(this.consolePane, ...lines);
  }

  renderDiagnostics(result) {
    const diags = result.diagnostics ?? [];
    this.badge.textContent = diags.length ? String(diags.length) : '';
    this.badge.hidden = diags.length === 0;

    if (diags.length === 0) {
      render(
        this.diagPane,
        el('div', { class: 'diag-ok' }, [
          el('span', { class: 'diag-ok-icon', text: '✓' }),
          el('div', {}, [
            el('strong', { text: 'بدون خطای تایپ — کد تو سالم است.' }),
            el('p', { text: 'حالا یک حالت مرزی (null، آرایه‌ی خالی، تایپ اشتباه) اضافه کن و ببین کامپایلر چه می‌گوید. یادگیری خطا-محور، سریع‌ترین مسیر تسلط است.' }),
          ]),
        ]),
      );
      return;
    }

    render(
      this.diagPane,
      ...diags.map((d) =>
        el('article', { class: `diag-card ${d.category}` }, [
          el('header', { class: 'diag-head' }, [
            el('span', { class: `diag-badge ${d.category}`, text: d.category === 'error' ? 'خطا' : 'هشدار' }),
            el('span', { class: 'diag-code', dir: 'ltr', text: d.code ? `TS${d.code}` : '—' }),
            el('span', { class: 'diag-pos', dir: 'ltr', text: `line ${d.line}:${d.column}` }),
          ]),
          el('p', { class: 'diag-message', dir: 'ltr', text: d.message }),
          d.coach &&
            el('div', { class: 'diag-coach' }, [
              el('strong', { text: `مربی خطا — ${d.coach.title}` }),
              el('p', { innerHTML: richText(d.coach.advice) }),
            ]),
        ]),
      ),
    );
  }

  renderXRay(result) {
    const xrays = result.xrays ?? [];
    if (xrays.length === 0) {
      render(
        this.xrayPane,
        el('div', { class: 'console-empty' }, [
          el('strong', { text: 'چیزی برای کالبدشکافی پیدا نشد.' }),
          el('p', { text: 'یک `const`، `type`، `interface`، `class` یا `function` تعریف کن — یا زیر یک عبارت `// ^?` بگذار تا تایپ واقعی‌اش را ببینی.' }),
        ]),
      );
      return;
    }

    const KIND_ICON = {
      const: '🔒', let: '🔓', var: '🔓', function: 'ƒ', class: '🏛', enum: '🔢',
      type: '🧬', interface: '📐', query: '🔬', errors: '🩺',
    };

    render(
      this.xrayPane,
      ...xrays.map((x) =>
        el('div', { class: `xray-row ${x.kind === 'query' ? 'is-query' : x.kind === 'errors' ? 'is-errors' : ''}` }, [
          el('div', { class: 'xray-head' }, [
            el('span', { class: 'xray-icon', text: KIND_ICON[x.kind] ?? '•' }),
            el('span', { class: 'xray-name', dir: 'ltr', text: x.name }),
            el('span', { class: 'xray-kind', text: x.kind }),
          ]),
          el('div', { class: 'xray-type', dir: 'ltr', text: x.type }),
        ]),
      ),
    );
  }

  renderJs(result) {
    const js = (result.jsCode ?? '').trim();
    if (!js) {
      render(this.jsPane, el('div', { class: 'console-empty', text: 'خروجی JavaScript تولید نشد.' }));
      return;
    }
    render(
      this.jsPane,
      el('p', { class: 'js-note' }, [
        'این دقیقاً همان چیزی است که مرورگر/Node اجرا می‌کند. دقت کن که ',
        el('strong', { text: 'هیچ اثری از تایپ‌ها نمانده' }),
        ' — این یعنی TypeScript هیچ سربار اجرایی ندارد.',
      ]),
      codeBlock({ title: 'خروجی کامپایل (JavaScript)', code: js }),
    );
  }

  /** برای استفاده‌ی نمای بیرونی (مثلاً دکمه‌ی «اجرا در آزمایشگاه» درس‌ها) */
  getElement() {
    return this.root;
  }
}

/** Helper used by lesson view: opens the lab with a snippet from the lesson. */
export function pushSnippetToLab(lab, code) {
  lab?.setCode(code);
  lab?.root?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export async function describeEngine() {
  return engineLabel();
}
