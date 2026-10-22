/* ==========================================================================
   Core DOM Helpers — تنها نقطه‌ی ساخت المان در کل اپلیکیشن (DRY)
   ========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an element declaratively.
 * @param {string} tag
 * @param {Record<string, any>} [props] — class, style{}, on*{}, data*{}, text, html, attrs
 * @param {Array<Node|string|number|null|false>} [children]
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  applyProps(node, props);
  appendChildren(node, children);
  return node;
}

/** Creates an SVG element with the same declarative API as `el`. */
export function svg(tag, props = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  applyProps(node, props, true);
  appendChildren(node, children);
  return node;
}

/** DOM properties that are live, read-only collections — they must be merged, never assigned. */
function isMergeableDomCollection(node, key, value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const current = node[key];
  if (!current || typeof current !== 'object') return false;
  // `dataset`، `style` و `attributes` در مرورگر فقط getter دارند
  const descriptor = getPropertyDescriptor(node, key);
  return descriptor ? descriptor.set === undefined : key === 'dataset' || key === 'style';
}

function getPropertyDescriptor(object, key) {
  let target = object;
  while (target) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor) return descriptor;
    target = Object.getPrototypeOf(target);
  }
  return undefined;
}

function applyProps(node, props, isSvg = false) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      node.setAttribute('class', value);
    } else if (key === 'text') {
      node.textContent = String(value);
    } else if (key === 'html' || key === 'innerHTML') {
      node.innerHTML = value;
    } else if (isMergeableDomCollection(node, key, value)) {
      Object.assign(node[key], value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (isSvg) {
      node.setAttribute(key, String(value));
    } else {
      node[key] = value;
    }
  }
}

function appendChildren(node, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) appendChildren(node, child);
    else if (child instanceof Node) node.appendChild(child);
    else node.appendChild(document.createTextNode(String(child)));
  }
}

/** Escapes untrusted text before injecting into innerHTML. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}

/** Replaces the whole content of a node (keeps the API in one place). */
export function render(target, ...children) {
  target.replaceChildren(...children.flat().filter(Boolean));
  return target;
}

/** Debounce for input-driven work (compiler calls, search). */
export function debounce(fn, wait = 350) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Persian digits for display-only numbers. */
export function toFa(value) {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

/** mm:ss formatter used by the study timer. */
export function formatClock(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
