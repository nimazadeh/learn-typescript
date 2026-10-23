/* ==========================================================================
   Roadmap View — بوم تعاملی نقشه‌ی راه رسمی roadmap.sh/typescript
   Pan / Zoom / فیلتر وضعیت / کلیک برای ورود به درس
   ========================================================================== */

import { el, svg, render, toFa } from '../core/dom.js';
import { getState, statusOf, cycleNodeStatus, subscribe } from '../core/store.js';
import { ALL_LESSONS, LESSON_BY_ID, CHAPTER_BY_ID, DAY_OF_LESSON, TOTAL_DAYS } from '../data/curriculum/index.js';
import { ROADMAP_GRAPH_NODES, ROADMAP_EDGES, ROADMAP_SECTIONS, ROADMAP_LABELS } from '../data/roadmapGraph.js';
import { progressBar, sectionTitle, chip } from '../components/ui.js';
import { diagram } from '../components/diagrams.js';

const PADDING = 90;
const STATUS_FILL = {
  none: 'var(--map-sub-bg)',
  learning: 'rgba(245,158,11,0.22)',
  mastered: 'rgba(16,185,129,0.28)',
  review: 'rgba(244,63,94,0.24)',
};
const STATUS_STROKE = {
  none: 'var(--border-default)',
  learning: 'var(--warning)',
  mastered: 'var(--success)',
  review: 'var(--danger)',
};

export function RoadmapView({ navigate }) {
  const root = el('div', { class: 'view roadmap-view' });
  const nodeById = new Map(ROADMAP_GRAPH_NODES.map((n) => [n.id, n]));

  /* --- viewBox bounds ---------------------------------------------------- */
  const xs = ROADMAP_GRAPH_NODES.map((n) => n.x);
  const ys = ROADMAP_GRAPH_NODES.map((n) => n.y);
  const xe = ROADMAP_GRAPH_NODES.map((n) => n.x + n.w);
  const ye = ROADMAP_GRAPH_NODES.map((n) => n.y + n.h);
  const bounds = {
    minX: Math.min(...xs, ...ROADMAP_SECTIONS.map((s) => s.x)) - PADDING,
    minY: Math.min(...ys, ...ROADMAP_SECTIONS.map((s) => s.y)) - PADDING,
    maxX: Math.max(...xe, ...ROADMAP_SECTIONS.map((s) => s.x + s.w)) + PADDING,
    maxY: Math.max(...ye, ...ROADMAP_SECTIONS.map((s) => s.y + s.h)) + PADDING,
  };
  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;

  let view = { x: bounds.minX, y: bounds.minY, w: worldW, h: worldH };

  /* --- canvas ------------------------------------------------------------ */
  const svgRoot = svg('svg', { class: 'roadmap-svg', xmlns: 'http://www.w3.org/2000/svg' });
  const viewport = el('div', { class: 'roadmap-viewport', tabindex: 0 }, [svgRoot]);

  function edgePath(source, target) {
    const s = nodeById.get(source);
    const t = nodeById.get(target);
    if (!s || !t) return null;

    const sCx = s.x + s.w / 2;
    const sCy = s.y + s.h / 2;
    const tCx = t.x + t.w / 2;
    const tCy = t.y + t.h / 2;

    const dx = tCx - sCx;
    const dy = tCy - sCy;

    // Horizontal-dominant connection
    if (Math.abs(dx) > Math.abs(dy) * 0.85) {
      const startX = dx > 0 ? s.x + s.w : s.x;
      const endX = dx > 0 ? t.x : t.x + t.w;
      const midX = (startX + endX) / 2;
      return `M ${startX} ${sCy} C ${midX} ${sCy}, ${midX} ${tCy}, ${endX} ${tCy}`;
    }

    // Vertical-dominant connection
    const startY = dy > 0 ? s.y + s.h : s.y;
    const endY = dy > 0 ? t.y : t.y + t.h;
    const midY = (startY + endY) / 2;
    return `M ${sCx} ${startY} C ${sCx} ${midY}, ${tCx} ${midY}, ${tCx} ${endY}`;
  }

  function draw(filter = 'all', selectedId = null) {
    const layers = [];

    // Grid dots
    const defs = svg('defs', {}, [
      svg('pattern', { id: 'mapdots', width: 26, height: 26, patternUnits: 'userSpaceOnUse' }, [
        svg('circle', { cx: 1.4, cy: 1.4, r: 1.4, fill: 'var(--map-grid-dot)' }),
      ]),
      svg('filter', { id: 'nodeshadow', x: '-20%', y: '-20%', width: '140%', height: '160%' }, [
        svg('feDropShadow', { dx: 0, dy: 3, stdDeviation: 4, 'flood-color': '#030712', 'flood-opacity': 0.45 }),
      ]),
    ]);
    layers.push(defs);
    layers.push(svg('rect', { x: bounds.minX, y: bounds.minY, width: worldW, height: worldH, fill: 'url(#mapdots)' }));

    // Section containers
    ROADMAP_SECTIONS.forEach((section) => {
      layers.push(svgRectGroup(section));
    });

    // Edges
    const edgeGroup = svg('g', { class: 'map-edges' });
    ROADMAP_EDGES.forEach(([source, target, style]) => {
      const d = edgePath(source, target);
      if (!d) return;
      const active = selectedId && (source === selectedId || target === selectedId);
      edgeGroup.appendChild(
        svg('path', {
          d,
          class: `map-edge ${style === 'dashed' ? 'is-dashed' : 'is-solid'} ${active ? 'is-active' : ''}`,
          fill: 'none',
          stroke: active ? 'var(--warning)' : 'var(--map-edge)',
          'stroke-width': active ? 3.4 : style === 'dashed' ? 2.4 : 3.1,
          'stroke-linecap': 'round',
          'stroke-dasharray': style === 'dashed' ? '1 9' : '0',
        }),
      );
    });
    layers.push(edgeGroup);

    // Free labels
    ROADMAP_LABELS.forEach((label) => {
      layers.push(svg('text', { x: label.x, y: label.y, class: 'map-free-label' }, [label.text]));
    });

    // Nodes
    const nodeGroup = svg('g', { class: 'map-nodes' });
    ROADMAP_GRAPH_NODES.forEach((node) => {
      const lesson = LESSON_BY_ID.get(node.id);
      const status = statusOf(node.id);
      const matches =
        filter === 'all' ||
        (filter === 'remaining' && status === 'none') ||
        status === filter;
      if (!matches) return;

      const g = svg('g', {
        class: `map-node kind-${node.kind} status-${status} ${selectedId === node.id ? 'is-selected' : ''}`,
        tabindex: 0,
        role: 'button',
        'aria-label': `${lesson?.titleFa ?? node.label} — ${node.label}`,
      });

      const isTopic = node.kind === 'topic';
      g.appendChild(
        svg('rect', {
          class: 'node-box',
          x: node.x, y: node.y, width: node.w, height: node.h, rx: isTopic ? 12 : 9,
          fill: isTopic ? 'var(--map-topic-bg)' : STATUS_FILL[status],
          stroke: isTopic ? '#b7791f' : STATUS_STROKE[status],
          'stroke-width': isTopic ? 2.4 : 2,
          filter: 'url(#nodeshadow)',
        }),
      );

      if (status !== 'none' && !isTopic) {
        g.appendChild(
          svg('circle', {
            cx: node.x + node.w - 13, cy: node.y + 13, r: 5,
            fill: STATUS_STROKE[status], stroke: 'var(--bg-surface-1)', 'stroke-width': 1.6,
          }),
        );
      }

      const label = node.label;
      const maxChars = Math.floor(node.w / 8.1);
      const lines = wrapLabel(label, maxChars);
      const lineH = isTopic ? 16 : 14;
      const startY = node.y + node.h / 2 - ((lines.length - 1) * lineH) / 2;

      lines.forEach((line, i) => {
        g.appendChild(
          svg('text', {
            x: node.x + node.w / 2,
            y: startY + i * lineH,
            class: `node-label ${isTopic ? 'is-topic' : ''}`,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: isTopic ? 'var(--map-topic-ink)' : 'var(--map-sub-ink)',
          }, [line]),
        );
      });

      g.addEventListener('click', (event) => {
        if (event.detail === 2) {
          cycleNodeStatus(node.id);
          refresh();
          return;
        }
        navigate('academy', { nodeId: node.id });
      });
      g.addEventListener('dblclick', () => {});
      g.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate('academy', { nodeId: node.id });
        }
      });

      nodeGroup.appendChild(g);
    });
    layers.push(nodeGroup);

    render(svgRoot, ...layers);
    applyViewBox();
  }

  function svgRectGroup(section) {
    const g = svg('g', { class: 'map-section' });
    g.appendChild(
      svg('rect', {
        x: section.x, y: section.y, width: section.w, height: section.h, rx: 14,
        fill: 'transparent', stroke: 'var(--border-default)', 'stroke-width': 2, 'stroke-dasharray': '7 7',
      }),
    );
    if (section.label) {
      g.appendChild(
        svg('text', { x: section.x + 14, y: section.y + 20, class: 'map-section-label' }, [section.label]),
      );
    }
    return g;
  }

  function applyViewBox() {
    svgRoot.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
  }

  /* --- pan & zoom -------------------------------------------------------- */
  let dragging = false;
  let lastPoint = { x: 0, y: 0 };

  viewport.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.map-node')) return;
    dragging = true;
    lastPoint = { x: event.clientX, y: event.clientY };
    viewport.classList.add('is-panning');
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const rect = viewport.getBoundingClientRect();
    const scaleX = view.w / rect.width;
    const scaleY = view.h / rect.height;
    view.x -= (event.clientX - lastPoint.x) * scaleX;
    view.y -= (event.clientY - lastPoint.y) * scaleY;
    lastPoint = { x: event.clientX, y: event.clientY };
    applyViewBox();
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-panning');
    try { viewport.releasePointerCapture(event.pointerId); } catch { /* ignore */ }
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  viewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 1.12 : 0.89;
    zoomAt(event.clientX, event.clientY, factor);
  }, { passive: false });

  function zoomAt(clientX, clientY, factor) {
    const rect = viewport.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const nextW = clamp(view.w * factor, worldW * 0.06, worldW * 1.8);
    const nextH = clamp(view.h * factor, worldH * 0.06, worldH * 1.8);
    view.x += (view.w - nextW) * px;
    view.y += (view.h - nextH) * py;
    view.w = nextW;
    view.h = nextH;
    applyViewBox();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function fit() {
    view = { x: bounds.minX, y: bounds.minY, w: worldW, h: worldH };
    applyViewBox();
  }

  /* --- header / stats ---------------------------------------------------- */
  const statsBar = el('div', { class: 'map-stats' });
  const legend = el('div', { class: 'map-legend' });
  const toolbar = el('div', { class: 'map-toolbar' });
  const filterRow = el('div', { class: 'filter-row' });

  function refreshStats() {
    const completed = getState().completedNodes.filter((id) => LESSON_BY_ID.has(id)).length;
    const learning = getState().inProgressNodes.filter((id) => LESSON_BY_ID.has(id)).length;
    const review = getState().reviewNodes.filter((id) => LESSON_BY_ID.has(id)).length;
    const total = ALL_LESSONS.length;

    render(
      statsBar,
      el('div', { class: 'stat-card' }, [
        el('span', { class: 'stat-value', text: `${toFa(completed)}/${toFa(total)}` }),
        el('span', { class: 'stat-label', text: 'درس‌های مسلط' }),
        progressBar(completed, total),
      ]),
      el('div', { class: 'stat-card mini' }, [el('span', { class: 'stat-value accent', text: toFa(learning) }), el('span', { class: 'stat-label', text: 'در حال یادگیری' })]),
      el('div', { class: 'stat-card mini' }, [el('span', { class: 'stat-value rose', text: toFa(review) }), el('span', { class: 'stat-label', text: 'نیازمند مرور' })]),
      el('div', { class: 'stat-card mini' }, [el('span', { class: 'stat-value', text: toFa(TOTAL_DAYS) }), el('span', { class: 'stat-label', text: 'روز تا تسلط (۵ ساعت/روز)' })]),
    );

    render(
      legend,
      legendItem('var(--success)', 'تسلط کامل'),
      legendItem('var(--warning)', 'در حال یادگیری'),
      legendItem('var(--danger)', 'نیاز به مرور'),
      legendItem('var(--map-topic-bg)', 'فصل اصلی (topic)'),
    );
  }

  function legendItem(color, label) {
    return el('span', { class: 'legend-item' }, [el('i', { style: { background: color } }), label]);
  }

  const FILTERS = [
    { id: 'all', label: 'همه' },
    { id: 'remaining', label: 'باقی‌مانده' },
    { id: 'learning', label: 'در حال یادگیری' },
    { id: 'mastered', label: 'مسلط' },
    { id: 'review', label: 'مرور' },
  ];
  let activeFilter = 'all';

  function refreshFilters() {
    render(
      filterRow,
      ...FILTERS.map((f) =>
        el('button', {
          class: `chip-btn ${activeFilter === f.id ? 'is-active' : ''}`,
          text: f.label,
          onclick: () => {
            activeFilter = f.id;
            refreshFilters();
            draw(activeFilter);
          },
        }),
      ),
      el('span', { class: 'filter-hint', text: 'کلیک = ورود به درس · دبل‌کلیک = تغییر وضعیت' }),
    );
  }

  function refreshToolbar() {
    render(
      toolbar,
      toolButton('+', 'بزرگ‌نمایی', () => zoomAtCenter(0.85)),
      toolButton('−', 'کوچک‌نمایی', () => zoomAtCenter(1.18)),
      toolButton('⤢', 'نمایش کامل نقشه', fit),
      toolButton('▦', 'نمای جدولی فصل‌ها', () => toggleMatrix()),
    );
  }

  function zoomAtCenter(factor) {
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  function toolButton(symbol, label, onclick) {
    return el('button', { class: 'tool-btn', title: label, 'aria-label': label, text: symbol, onclick });
  }

  /* --- matrix view ------------------------------------------------------- */
  const matrixWrap = el('div', { class: 'matrix-wrap', hidden: true });

  function toggleMatrix() {
    matrixWrap.hidden = !matrixWrap.hidden;
    viewport.parentElement.querySelector('.roadmap-canvas').classList.toggle('is-hidden', !matrixWrap.hidden);
    if (!matrixWrap.hidden) buildMatrix();
  }

  function buildMatrix() {
    const chapters = [...new Set(ALL_LESSONS.map((l) => l.chapter))];
    const rows = chapters.map((chapterId) => {
      const chapter = CHAPTER_BY_ID.get(chapterId);
      const lessons = ALL_LESSONS.filter((l) => l.chapter === chapterId);
      const done = lessons.filter((l) => statusOf(l.id) === 'mastered').length;
      const day = Math.min(...lessons.map((l) => DAY_OF_LESSON.get(l.id) ?? 1));

      return el('div', { class: 'matrix-row' }, [
        el('div', { class: 'matrix-head' }, [
          el('span', { class: 'matrix-icon', text: chapter?.icon ?? '•' }),
          el('div', { class: 'matrix-titles' }, [
            el('strong', { text: chapter?.title ?? chapterId }),
            el('span', { class: 'matrix-meta', text: `${toFa(lessons.length)} درس · از روز ${toFa(day)}` }),
          ]),
          progressBar(done, lessons.length),
        ]),
        el('div', { class: 'matrix-lessons' }, lessons.map((lesson) => {
          const status = statusOf(lesson.id);
          return el('button', {
            class: `matrix-chip is-${status}`,
            title: `${lesson.titleEn} — روز ${toFa(DAY_OF_LESSON.get(lesson.id))}`,
            onclick: () => navigate('academy', { nodeId: lesson.id }),
            oncontextmenu: (event) => { event.preventDefault(); cycleNodeStatus(lesson.id); buildMatrix(); refreshStats(); draw(activeFilter); },
          }, [
            el('span', { class: 'matrix-chip-status', text: { mastered: '✓', learning: '◐', review: '↻', none: '○' }[status] }),
            el('span', { class: 'matrix-chip-text' }, [lesson.titleFa]),
          ]);
        })),
      ]);
    });

    render(
      matrixWrap,
      el('p', { class: 'matrix-hint', text: 'کلیک روی هر درس = ورود · کلیک راست = تغییر وضعیت' }),
      ...rows,
    );
  }

  /* --- assemble ---------------------------------------------------------- */
  function refresh() {
    refreshStats();
    draw(activeFilter);
    if (!matrixWrap.hidden) buildMatrix();
  }

  const canvas = el('div', { class: 'roadmap-canvas' }, [
    el('div', { class: 'roadmap-floating-toolbar' }, toolbar),
    viewport,
  ]);

  render(
    root,
    sectionTitle('نقشه‌ی راه بصری TypeScript', 'بر اساس roadmap.sh/typescript — هر گره یک درس کامل با آزمایشگاه زنده است', '🗺️'),
    statsBar,
    el('div', { class: 'roadmap-grid' }, [
      el('div', { class: 'roadmap-left' }, [
        filterRow,
        canvas,
        legend,
      ]),
      el('aside', { class: 'roadmap-right' }, [
        el('div', { class: 'side-card' }, [
          el('h4', { text: '🧭 راهنمای رنگ‌ها' }),
          el('ul', { class: 'guide-list' }, [
            guideRow('گره‌ی زرد', 'فصل اصلی نقشه‌ی راه (topic) — نقطه‌ی عطف مسیر'),
            guideRow('گره‌ی تیره', 'زیرموضوع قابل یادگیری (subtopic)'),
            guideRow('خط توپر', 'مسیر اصلی یادگیری — ترتیب پیشنهادی'),
            guideRow('خط نقطه‌چین', 'شاخه‌ی فرعی یک فصل'),
          ]),
        ]),
        el('div', { class: 'side-card' }, [
          el('h4', { text: '📈 تصویر کلی مسیر' }),
          diagram('type-lattice'),
          el('p', { class: 'side-note', text: 'هر تایپ یک «مجموعه از مقادیر» است. کل سیستم تایپ TypeScript از همین یک تصویر ذهنی مشتق می‌شود.' }),
        ]),
        el('div', { class: 'side-card' }, [
          el('h4', { text: '⚡ شروع سریع' }),
          el('div', { class: 'quick-actions' }, [
            el('button', { class: 'btn primary block', text: '▶ ادامه از درس بعدی', onclick: () => navigate('academy', { nodeId: nextLessonId() }) }),
            el('button', { class: 'btn block', text: '🧪 آزمایشگاه آزاد TypeScript', onclick: () => navigate('playground') }),
            el('button', { class: 'btn block', text: '⏱️ شروع بلوک مطالعه‌ی امروز', onclick: () => navigate('coach') }),
            el('button', { class: 'btn block', text: '∑ فرمول‌های موفقیت', onclick: () => navigate('playbook') }),
          ]),
        ]),
      ]),
    ]),
    matrixWrap,
  );

  function guideRow(term, desc) {
    return el('li', {}, [el('strong', { text: `${term}: ` }), desc]);
  }

  function nextLessonId() {
    const firstIncomplete = ALL_LESSONS.find((l) => statusOf(l.id) !== 'mastered');
    return firstIncomplete?.id ?? ALL_LESSONS[0].id;
  }

  refreshToolbar();
  refreshFilters();
  refreshStats();
  draw();

  const unsubscribe = subscribe(() => refreshStats());
  root.addEventListener('view:destroy', unsubscribe);

  return root;
}

function wrapLabel(label, maxChars) {
  if (label.length <= maxChars) return [label];
  const words = label.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 3);
}
