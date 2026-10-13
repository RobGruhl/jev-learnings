#!/usr/bin/env python3
"""Build the Decision Tier site: wrap each page fragment in site/pages/ with the shared
template and write it to docs/, which GitHub Pages serves. Standard library only.

    python3 site/build.py
"""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "docs"
SITE_URL = "https://robgruhl.github.io/jev-learnings/"

# (file, nav label, level tag, page title, description)
PAGES = [
    ("index.html", "Start", "", "Decision Tier", "A field guide to decision models, from explain-like-I'm-five to engineering a cascade."),
    ("eli5.html", "Explain like I'm five", "L0", "Explain like I'm five", "Decision models explained with a mailroom, three bins and a grown-up upstairs."),
    ("101.html", "101 · What it is", "L1", "Decision models 101", "What a decision model returns, how it differs from an LLM, and what calibrated confidence buys you."),
    ("201.html", "201 · Asking well", "L2", "Decision models 201", "How to phrase questions, use answers as features and set thresholds that mean something."),
    ("301.html", "301 · Engineering", "L3", "Decision models 301", "Engineering a decision tier: evaluation, thresholds per model, drift, adapters and operations."),
    ("cascade.html", "The cascade", "Arch", "The cascade", "Code, decision model, LLM, human: what each tier does, what escalates and how fixes flow down."),
    ("novelty-and-doubt.html", "Novelty & doubt", "Arch", "Novelty and doubt", "A decision model's own escalation signals: what each catches, the watch band and what doubt can't see."),
    ("melvor.html", "1 · The testbed", "Case", "Melvor Idle, the testbed", "The case study's testbed: what an idle game is, Melvor's skills and production chains, the ranger character and how the agent is wired."),
    ("melvor-why.html", "2 · Why a game?", "Case", "Why a game is a good teacher", "Why Melvor Idle is a good place to learn the code, decision model, LLM, human cascade, and how it compares with the email project."),
    ("melvor-cascade.html", "3 · The cascade, built", "Case", "The Melvor cascade, built", "The Melvor agent's cascade: per-tick flow, the one-second guard, color-coded pseudo-code, the questions Jev answers and measured rates."),
    ("melvor-pushdowns.html", "4 · Push-downs", "Case", "Push-downs: how the cascade learned", "Fifty-one resolved escalations from the Melvor agent: who caught each one, where the fix landed, and the case studies behind the code."),
    ("compare.html", "Four ways compared", "Data", "Four ways compared", "Jev, OpenAI's Decisions API, open-weight decision models and Claude Haiku 5.5 on the same benchmarks."),
    ("cost.html", "Cost ladder", "Data", "The cost ladder", "Normalized cost from Jev to the Decisions API, Haiku, Sonnet, Opus, Fable and a human, with a calculator."),
    ("landscape.html", "Landscape · Oct 2026", "Data", "Landscape, October 2026", "A refresh of the decision-model landscape: latest Claude releases, OpenAI Decisions and open weights."),
    ("build.html", "Build your own", "Build", "Build your own decision skeleton", "A facilitated, module-by-module tutorial for building your own decision cascade with Claude Code."),
]

NAV_GROUPS = [
    ("Learn", ["eli5.html", "101.html", "201.html", "301.html"]),
    ("Architecture", ["cascade.html", "novelty-and-doubt.html"]),
    ("Case study: Melvor", ["melvor.html", "melvor-why.html", "melvor-cascade.html", "melvor-pushdowns.html"]),
    ("Evidence", ["compare.html", "cost.html", "landscape.html"]),
    ("Build", ["build.html"]),
]

TEMPLATE = (ROOT / "template.html").read_text()


def nav_html(current: str) -> str:
    by_file = {p[0]: p for p in PAGES}
    parts = []
    for group, files in NAV_GROUPS:
        items = []
        for f in files:
            _, label, _, _, _ = by_file[f]
            cur = ' aria-current="page"' if f == current else ""
            items.append(f'<li><a href="{f}"{cur}>{html.escape(label)}</a></li>')
        parts.append(f'<div class="nav-group"><p class="nav-head">{group}</p><ul>{"".join(items)}</ul></div>')
    return "".join(parts)


def pager_html(current: str) -> str:
    order = [p[0] for p in PAGES]
    i = order.index(current)
    by_file = {p[0]: p for p in PAGES}
    prev_link = next_link = ""
    if i > 0:
        f = order[i - 1]
        prev_link = f'<a class="pager-prev" href="{f}"><span>Previous</span>{html.escape(by_file[f][3])}</a>'
    if i < len(order) - 1:
        f = order[i + 1]
        next_link = f'<a class="pager-next" href="{f}"><span>Next</span>{html.escape(by_file[f][3])}</a>'
    return f'<nav class="pager" aria-label="Page navigation">{prev_link}{next_link}</nav>'


def build() -> None:
    OUT.mkdir(exist_ok=True)
    for f, _, _, title, desc in PAGES:
        body = (ROOT / "pages" / f).read_text()
        full_title = title if f == "index.html" else f"{title} · Decision Tier"
        page = (
            TEMPLATE.replace("{{title}}", html.escape(full_title))
            .replace("{{description}}", html.escape(desc))
            .replace("{{url}}", SITE_URL + ("" if f == "index.html" else f))
            .replace("{{nav}}", nav_html(f))
            .replace("{{pager}}", "" if f == "index.html" else pager_html(f))
            .replace("{{bodyclass}}", "home" if f == "index.html" else "inner")
            .replace("{{content}}", body)
        )
        (OUT / f).write_text(page)
        print(f"wrote docs/{f}")
    # GitHub Pages: serve files as-is, no Jekyll processing.
    (OUT / ".nojekyll").write_text("")
    check_links()


def check_links() -> None:
    """Fail loudly on a relative link to a page or asset that doesn't exist."""
    bad = []
    for page in OUT.glob("*.html"):
        for ref in re.findall(r'(?:href|src)="([^"#:]+)(?:#[^"]*)?"', page.read_text()):
            if ref.startswith(("//", "mailto")) or not ref:
                continue
            if not (OUT / ref).exists():
                bad.append(f"{page.name} -> {ref}")
    if bad:
        raise SystemExit("broken links:\n  " + "\n  ".join(bad))
    print("links ok")


if __name__ == "__main__":
    build()
