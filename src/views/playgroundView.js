/* ==========================================================================
   Playground View — آزمایشگاه آزاد TypeScript + چالش‌های عملی
   ========================================================================== */

import { el, render, toFa } from '../core/dom.js';
import { LiveLab } from '../components/liveLab.js';
import { sectionTitle, chip, codeBlock } from '../components/ui.js';
import { getState, setState } from '../core/store.js';
import { PROJECTS } from '../data/playbook.js';
import { SNIPPETS, CHALLENGES } from '../data/playground.js';

export function PlaygroundView() {
  const root = el('div', { class: 'view playground-view' });

  const saved = getState().playgroundCode ?? SNIPPETS[0].code;
  const lab = new LiveLab({ initialCode: saved, title: 'آزمایشگاه آزاد TypeScript', autoRun: true });

  const snippetRow = el('div', { class: 'snippet-row' }, SNIPPETS.map((snippet) =>
    el('button', {
      class: 'snippet-btn',
      title: snippet.label,
      text: snippet.label,
      onclick: () => lab.setCode(snippet.code),
    })));

  const challengeList = el('div', { class: 'challenge-list' });

  function renderChallenges() {
    render(
      challengeList,
      ...CHALLENGES.map((challenge) => {
        const solved = getState().solvedChallenges?.[challenge.id] ?? false;
        return el('details', { class: `challenge ${solved ? 'is-solved' : ''}` }, [
          el('summary', {}, [
            chip(challenge.level, challenge.level === 'آسان' ? 'success' : challenge.level === 'متوسط' ? 'warning' : 'danger'),
            el('strong', { text: challenge.title }),
            solved ? chip('حل شد ✓', 'success') : null,
          ]),
          el('div', { class: 'challenge-body' }, [
            el('p', { class: 'challenge-prompt', text: challenge.prompt }),
            codeBlock({ title: 'کد اولیه', code: challenge.starter, onRun: (code) => lab.setCode(code) }),
            el('div', { class: 'challenge-actions' }, [
              el('button', { class: 'btn ghost', text: '📥 بارگذاری در ویرایشگر', onclick: () => lab.setCode(challenge.starter) }),
              el('button', {
                class: 'btn',
                text: solved ? '✓ حل‌شده' : 'علامت‌گذاری به‌عنوان حل‌شده',
                onclick: () => {
                  const next = { ...(getState().solvedChallenges ?? {}), [challenge.id]: !solved };
                  setState({ solvedChallenges: next });
                  renderChallenges();
                },
              }),
            ]),
            el('details', { class: 'solution-box' }, [
              el('summary', { text: '👁 راه‌حل مرجع' }),
              codeBlock({ title: 'راه‌حل', code: challenge.solution, onRun: (code) => lab.setCode(code) }),
            ]),
          ]),
        ]);
      }),
    );
  }

  const projectCards = el('div', { class: 'project-grid' }, PROJECTS.map((project) =>
    el('article', { class: `project-card level-${project.level}` }, [
      el('header', {}, [
        chip(project.level === 'beginner' ? 'مقدماتی' : project.level === 'intermediate' ? 'متوسط' : 'پیشرفته', project.level === 'beginner' ? 'success' : project.level === 'intermediate' ? 'warning' : 'danger'),
        el('h3', { text: project.title }),
      ]),
      el('p', { class: 'project-spec', text: project.spec }),
      el('div', { class: 'project-skills' }, project.skills.map((skill) => chip(skill, 'info'))),
      el('details', {}, [
        el('summary', { text: 'معیارهای پذیرش' }),
        el('ul', { class: 'acceptance-list' }, project.acceptance.map((a) => el('li', { text: a }))),
      ]),
      el('button', {
        class: 'btn ghost block',
        text: '🚀 شروع در آزمایشگاه (ساختار اولیه)',
        onclick: () => lab.setCode(buildProjectStarter(project)),
      }),
    ])));

  render(
    root,
    sectionTitle('آزمایشگاه آزاد TypeScript', 'کد دلخواهت را بنویس؛ کامپایلر واقعی 5.9 خطاها، تایپ‌های استنتاج‌شده و خروجی JS را نشان می‌دهد', '⚡'),
    el('div', { class: 'playground-grid' }, [
      el('div', { class: 'playground-main' }, [
        el('div', { class: 'snippet-panel' }, [
          el('h3', { text: '📚 الگوهای آماده — کلیک کن تا در ویرایشگر بارگذاری شود' }),
          snippetRow,
        ]),
        lab.getElement(),
        el('div', { class: 'playground-tools' }, [
          el('button', {
            class: 'btn',
            text: '💾 ذخیره‌ی کد فعلی',
            onclick: () => {
              setState({ playgroundCode: lab.getCode?.() ?? null });
            },
          }),
          el('span', { class: 'hint', text: 'نکته: زیر هر عبارت `// ^?` بگذار تا تایپ استنتاج‌شده را در ستون Type X-Ray ببینی.' }),
        ]),
      ]),
      el('aside', { class: 'playground-side' }, [
        el('div', { class: 'side-card' }, [
          el('h3', { text: '🏋️ چالش‌های عملی' }),
          el('p', { class: 'side-note', text: `${toFa(CHALLENGES.length)} چالش از آسان تا سطح تایپ‌پیشرفته. اول خودت تلاش کن، بعد راه‌حل را ببین.` }),
          challengeList,
        ]),
      ]),
    ]),
    el('section', { class: 'projects-section' }, [
      sectionTitle('پروژه‌های عملی مسیر', 'دانش بدون کاربرد فراموش می‌شود — بعد از هر فصل یکی از این‌ها را بساز', '🏗️'),
      projectCards,
    ]),
  );

  renderChallenges();
  return root;
}

function buildProjectStarter(project) {
  return `// پروژه: ${project.title}
// مهارت‌های هدف: ${project.skills.join(' · ')}
//
// صورت پروژه:
// ${project.spec}
//
// معیارهای پذیرش:
${project.acceptance.map((a) => `// - ${a}`).join('\n')}

// ⬇️ از اینجا شروع کن — strict: true فعال است

type TODO = 'اول تایپ‌ها را طراحی کن، بعد پیاده‌سازی';

const firstStep: TODO = 'اول تایپ‌ها را طراحی کن، بعد پیاده‌سازی';
console.log(firstStep);
`;
}
