/* ==========================================================================
   App Shell — مسیریابی، سربرگ، پالت فرمان (Ctrl+K)، تم و دسترسی‌پذیری
   ========================================================================== */

import { el, render, toFa } from './core/dom.js';
import { getState, setState, subscribe, statusOf, resetAllProgress } from './core/store.js';
import { RoadmapView } from './views/roadmapView.js';
import { LessonView } from './views/lessonView.js';
import { PlaygroundView } from './views/playgroundView.js';
import { CoachView } from './views/coachView.js';
import { PlaybookView } from './views/playbookView.js';
import { ALL_LESSONS, CHAPTER_BY_ID, CURRICULUM_STATS, TOTAL_DAYS } from './data/curriculum/index.js';
import { SUCCESS_FORMULAS, INTERVIEW_BANK, FLASHCARDS } from './data/playbook.js';
import { engineLabel } from './services/compiler.js';

const VIEWS = {
  roadmap: { label: 'نقشه‌ی راه', icon: '🗺️', factory: RoadmapView },
  academy: { label: 'درس‌ها', icon: '📖', factory: LessonView },
  playground: { label: 'آزمایشگاه', icon: '⚡', factory: PlaygroundView },
  coach: { label: 'مربی روزانه', icon: '⏱️', factory: CoachView },
  playbook: { label: 'فرمول‌های موفقیت', icon: '∑', factory: PlaybookView },
};

const main = document.getElementById('view-root');
const navBar = document.getElementById('nav-tabs');
const progressFill = document.getElementById('header-progress-fill');
const progressText = document.getElementById('header-progress-text');
const engineBadge = document.getElementById('engine-badge');
const themeToggle = document.getElementById('theme-toggle');

let currentView = null;
let currentName = null;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
export function navigate(name, params = {}) {
  const view = VIEWS[name];
  if (!view) return;

  // destroy previous view (cleanup timers/listeners)
  if (currentView) currentView.dispatchEvent(new CustomEvent('view:destroy'));

  currentName = name;
  main.classList.remove('is-loading');
  main.classList.add('is-loading');

  const node = view.factory({ navigate, params });
  currentView = node;

  render(main, node);
  requestAnimationFrame(() => main.classList.remove('is-loading'));

  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.view === name);
    tab.setAttribute('aria-selected', String(tab.dataset.view === name));
  });

  if (name === 'academy' && params.nodeId) {
    setState({ activeNodeId: params.nodeId });
  }

  history.replaceState(null, '', `#${name}${params.nodeId ? `/${params.nodeId}` : ''}`);
}

function buildNav() {
  render(
    navBar,
    ...Object.entries(VIEWS).map(([key, view]) =>
      el('button', {
        class: 'nav-tab',
        dataset: { view: key },
        role: 'tab',
        onclick: () => navigate(key),
        title: view.label,
      }, [
        el('span', { class: 'nav-icon', text: view.icon }),
        el('span', { class: 'nav-label', text: view.label }),
      ])),
    el('div', { class: 'nav-spacer' }),
    el('button', { class: 'nav-tab ghost-tab', onclick: openPalette, title: 'جست‌وجوی سریع (Ctrl+K)' }, [
      el('span', { class: 'nav-icon', text: '🔎' }),
      el('span', { class: 'nav-label', text: 'جست‌وجو' }),
      el('kbd', { text: 'Ctrl K' }),
    ]),
  );
}

/* ------------------------------------------------------------------ */
/* Header progress                                                     */
/* ------------------------------------------------------------------ */
function refreshHeader() {
  const done = ALL_LESSONS.filter((l) => statusOf(l.id) === 'mastered').length;
  const pct = Math.round((done / ALL_LESSONS.length) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${toFa(done)}/${toFa(ALL_LESSONS.length)} درس · ${toFa(pct)}٪`;
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  themeToggle.title = theme === 'dark' ? 'تم تیره (فعال)' : 'تم روشن (فعال)';
}

themeToggle.onclick = () => {
  const next = getState().prefs.theme === 'dark' ? 'light' : 'dark';
  setState({ prefs: { ...getState().prefs, theme: next } });
  applyTheme(next);
};

/* ------------------------------------------------------------------ */
/* Command palette (Ctrl+K)                                            */
/* ------------------------------------------------------------------ */
const palette = document.getElementById('palette');
const paletteInput = document.getElementById('palette-input');
const paletteResults = document.getElementById('palette-results');
let paletteItems = [];

function buildSearchIndex() {
  const lessons = ALL_LESSONS.map((lesson) => ({
    id: `lesson:${lesson.id}`,
    label: lesson.titleFa,
    sub: `${lesson.titleEn} · ${CHAPTER_BY_ID.get(lesson.chapter)?.title ?? ''}`,
    keywords: `${lesson.titleFa} ${lesson.titleEn} ${lesson.goal ?? ''}`,
    icon: '📖',
    action: () => navigate('academy', { nodeId: lesson.id }),
  }));

  const formulas = SUCCESS_FORMULAS.map((f) => ({
    id: `formula:${f.id}`,
    label: f.title,
    sub: 'فرمول موفقیت',
    keywords: `${f.title} ${f.body} ${f.equation}`,
    icon: '∑',
    action: () => navigate('playbook'),
  }));

  const interviews = INTERVIEW_BANK.map((q, i) => ({
    id: `interview:${i}`,
    label: q.q,
    sub: `سؤال مصاحبه · ${q.level}`,
    keywords: `${q.q} ${q.a}`,
    icon: '❝',
    action: () => navigate('playbook'),
  }));

  const cards = FLASHCARDS.map((c) => ({
    id: `card:${c.id}`,
    label: c.front,
    sub: `کارت مرور · ${c.topic}`,
    keywords: `${c.front} ${c.back}`,
    icon: '🃏',
    action: () => navigate('coach'),
  }));

  const views = Object.entries(VIEWS).map(([key, view]) => ({
    id: `view:${key}`,
    label: view.label,
    sub: 'نما',
    keywords: view.label,
    icon: view.icon,
    action: () => navigate(key),
  }));

  paletteItems = [...lessons, ...views, ...formulas, ...interviews, ...cards];
}

function openPalette() {
  palette.hidden = false;
  paletteInput.value = '';
  renderResults('');
  setTimeout(() => paletteInput.focus(), 20);
}

function closePalette() {
  palette.hidden = true;
}

function scoreItem(item, query) {
  const label = item.label.toLowerCase();
  const keywords = item.keywords.toLowerCase();
  if (label.startsWith(query)) return 100;
  if (label.includes(query)) return 70;
  if (keywords.includes(query)) return 40;
  return 0;
}

function renderResults(query) {
  const q = query.trim().toLowerCase();
  const results = q
    ? paletteItems
        .map((item) => ({ item, score: scoreItem(item, q) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map((r) => r.item)
    : paletteItems.slice(0, 10);

  if (results.length === 0) {
    render(paletteResults, el('p', { class: 'palette-empty', text: 'نتیجه‌ای پیدا نشد. عبارت انگلیسی یا فارسی را امتحان کن.' }));
    return;
  }

  render(
    paletteResults,
    ...results.map((item) =>
      el('button', {
        class: 'palette-item',
        onclick: () => { item.action(); closePalette(); },
      }, [
        el('span', { class: 'palette-icon', text: item.icon }),
        el('span', { class: 'palette-text' }, [
          el('span', { class: 'palette-label', text: item.label }),
          el('span', { class: 'palette-sub', text: item.sub }),
        ]),
      ])),
  );
}

paletteInput.addEventListener('input', (e) => renderResults(e.target.value));
palette.addEventListener('click', (e) => { if (e.target === palette) closePalette(); });

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    palette.hidden ? openPalette() : closePalette();
  }
  if (e.key === 'Escape' && !palette.hidden) closePalette();
  if (!palette.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    const items = [...paletteResults.querySelectorAll('.palette-item')];
    if (items.length === 0) return;
    const active = items.findIndex((i) => i.classList.contains('is-cursor'));
    const next = e.key === 'ArrowDown'
      ? Math.min(items.length - 1, active + 1)
      : Math.max(0, active - 1);
    items.forEach((i, idx) => i.classList.toggle('is-cursor', idx === next));
    items[next].scrollIntoView({ block: 'nearest' });
  }
  if (!palette.hidden && e.key === 'Enter') {
    const target = paletteResults.querySelector('.palette-item.is-cursor') ?? paletteResults.querySelector('.palette-item');
    target?.click();
  }
});

/* ------------------------------------------------------------------ */
/* Settings menu                                                       */
/* ------------------------------------------------------------------ */
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');

settingsBtn.onclick = (e) => {
  e.stopPropagation();
  settingsMenu.hidden = !settingsMenu.hidden;
};
document.addEventListener('click', () => { settingsMenu.hidden = true; });
settingsMenu.addEventListener('click', (e) => e.stopPropagation());

document.getElementById('reset-progress').onclick = () => {
  if (confirm('همه‌ی پیشرفت، یادداشت‌ها و آمار مطالعه پاک شود؟ این عمل برگشت‌پذیر نیست.')) {
    resetAllProgress();
    settingsMenu.hidden = true;
    navigate('roadmap');
  }
};

document.getElementById('export-progress').onclick = () => {
  const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `ts-studio-progress-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

document.getElementById('import-progress').onclick = () => {
  const input = el('input', { type: 'file', accept: 'application/json' });
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setState(JSON.parse(String(reader.result)));
        navigate(currentName ?? 'roadmap');
        alert('پیشرفت با موفقیت بازیابی شد ✓');
      } catch {
        alert('فایل معتبر نیست.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
function bootFromHash() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return { name: 'roadmap', params: {} };
  const [name, nodeId] = hash.split('/');
  if (!VIEWS[name]) return { name: 'roadmap', params: {} };
  return { name, params: nodeId ? { nodeId } : {} };
}

async function boot() {
  const prefs = getState().prefs;
  applyTheme(prefs.theme ?? 'dark');
  buildNav();
  buildSearchIndex();
  refreshHeader();
  subscribe(refreshHeader);

  const { name, params } = bootFromHash();
  navigate(name, params);

  engineBadge.textContent = await engineLabel();
  engineBadge.title = 'موتور کامپایل فعال در استودیو';
}

boot();
