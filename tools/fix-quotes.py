import re, subprocess, sys, os

FILES = [f"src/data/curriculum/part{i}.js" for i in range(1, 11)] + [
    "src/data/curriculum/index.js", "src/data/playbook.js", "src/data/roadmapGraph.js",
    "src/core/dom.js", "src/core/store.js", "src/core/highlight.js",
    "src/services/compiler.js", "src/services/studyEngine.js",
    "src/components/ui.js", "src/components/liveLab.js", "src/components/diagrams.js",
    "src/views/roadmapView.js", "src/views/lessonView.js", "src/views/playgroundView.js",
    "src/views/coachView.js", "src/views/playbookView.js", "src/app.js", "server.mjs",
]

# a whole-line single-quoted string literal, optionally `key: '...'` or `'...'` with trailing comma
LINE_RE = re.compile(r"^(\s*(?:[A-Za-z_$][\w$]*\s*:\s*)?)'([\s\S]*)'(,?)\s*$")

def check(path):
    r = subprocess.run(["node", "--check", path], capture_output=True, text=True)
    if r.returncode == 0:
        return None
    first = (r.stderr or r.stdout).splitlines()
    for line in first:
        m = re.match(r"^(.+?):(\d+)\s*$", line.strip())
        if m:
            return int(m.group(2)), "\n".join(first[:12])
    return -1, "\n".join(first[:12])

def fix_line(text):
    m = LINE_RE.match(text)
    if not m:
        return None
    prefix, body, comma = m.groups()
    if "'" not in body:
        return None  # not a nested-quote problem; skip
    new_body = body.replace('\\', '\\\\').replace('"', '\\"')
    return f'{prefix}"{new_body}"{comma}'

total = 0
for path in FILES:
    if not os.path.exists(path):
        print("MISSING", path); continue
    for _ in range(200):
        res = check(path)
        if res is None:
            break
        lineno, err = res
        if lineno == -1:
            print("!! cannot parse line for", path); print(err); break
        with open(path, encoding="utf-8") as f:
            lines = f.read().split("\n")
        idx = lineno - 1
        if idx >= len(lines):
            print("!! line out of range", path, lineno); print(err); break
        new = fix_line(lines[idx])
        if new is None:
            print("!! cannot auto-fix", path, lineno); print(lines[idx][:200]); print(err); break
        lines[idx] = new
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        total += 1
        print(f"fixed {path}:{lineno}")
print("TOTAL FIXED:", total)
