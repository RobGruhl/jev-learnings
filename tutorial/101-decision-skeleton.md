# The Decision Skeleton 101: A Guided Build

> A Claude Code-ready interactive tutorial for building your own decision cascade (code → decision model → LLM → human) one small, measured layer at a time.
>
> **Tutorial version 1.0 — October 2026.** Claude: state this version when starting or resuming a session, so learners notice if the tutorial changed under them.

---

## Tutorial Purpose

This tutorial teaches you to build a **decision skeleton**: the smallest end-to-end version of a system that makes judgment calls the right way. It is the decision-making cousin of a [walking skeleton](https://walkingskeleton.org/). Not a demo that calls a model and prints the answer, but a thin slice of the real shape:

```text
Item → Code (rules, facts) → Decision model (typed answers + doubt) → LLM (escalations) → Human (rulings)
                ↑_________________ every escalation pushes a fix back down _________________|
```

The goal is to build the instincts that should feel like oxygen whenever software makes a judgment:

- decide what each error costs **before** choosing a model
- label honestly, blind, and freeze before measuring
- put everything computable in code
- ask narrow, contrastive questions and grade each against its own concept
- set thresholds on dev data only, and key them to (model, rubric)
- escalate on the model's own signals (doubt, novelty), and watch the band under the line
- turn every escalation into a lower-tier fix
- validate on data you have never looked at
- know what every tier costs

The companion site explains the ideas: start at the [Decision Tier](https://robgruhl.github.io/jev-learnings/) home page, especially [101](https://robgruhl.github.io/jev-learnings/101.html), [the cascade](https://robgruhl.github.io/jev-learnings/cascade.html) and [novelty and doubt](https://robgruhl.github.io/jev-learnings/novelty-and-doubt.html). This document is the facilitator script that Claude Code follows on your behalf.

---

## How to Begin (For You, the Learner)

You do not need to read this whole document. Open the `tutorial/` folder in Claude Code and it greets you.

### Before you start

You'll need these now:

- **Claude Code**, installed and working.
- **git**, with your identity set (`git config --global user.name` and `user.email`).
- **Node.js LTS** (check with `node --version`). The default stack needs nothing else: Node has `fetch` and a test runner built in. (Bun or Python are fine if you prefer; say so in Module 0.)

You'll need this **by Module 5**, and Claude will help you choose:

- **One decision backend.** Any of these works, because the code talks to one contract and an adapter per backend:
  - **Jev** (TypeSafe, hosted): a `TYPESAFE_API_KEY`. The reference decision model.
  - **OpenAI Decisions API**: an `OPENAI_API_KEY`. Needs a small adapter (Module 4 shows the shape).
  - **Claude Haiku 5.5** as a judge: an `ANTHROPIC_API_KEY`. Uses structured outputs; probabilities are numbers it writes down.
  - **Local open weights**: free and private, e.g. a decision model served on `/v1/systemone` by Ollama, llama.cpp or the Strands Decider. Slower on a laptop.
- **Optionally, an LLM key** for the escalation tier (Module 9). Without one, escalations go to a human queue, and that's an honest, complete path.

**Time:** 15–30 minutes per module; plan for 5–7 hours across several sittings. Your git history is the bookmark.

**Cost:** the decision-model calls in this tutorial cost cents (hundreds of items × a few questions at fractions of a cent each). The facilitation itself uses Claude Code usage. Module 14 has you compute the real numbers.

### Starting

Open the `tutorial/` folder in Claude Code. If Claude doesn't start on its own, say:

> Walk me through the Decision Skeleton 101 one module at a time, following the Facilitator Contract in 101-decision-skeleton.md.

### Coming back later?

Say: *"We're partway through the Decision Skeleton 101. Read the git log in my project, work out which module we finished last, and continue from the next one."*

---

## The Facilitator Contract

Claude Code: this section is your binding operating contract for every module. If you are resuming in a fresh session, re-read it before continuing.

Prioritize the habit and the mental model over syntax.

### The module loop

For each module:

1. Explain the intuition in 3–6 plain sentences. Link the matching page on the companion site when one exists.
2. Inspect the current project state.
3. Propose the smallest implementation step.
4. Make the change.
5. **Ask the learner to predict what the check will show, then end your message and wait.** This matters most in this tutorial: predictions about AUC, filter rates, doubt readings and costs are concrete and falsifiable, and being wrong about them is where the learning lives.
6. Run the check for real and compare it with their prediction.
7. Show what changed.
8. Commit with the message convention **`module <number>: <short title>`**.
9. Ask the reflection question, **then end your message.** No Expected intuition, no preview of the next module.
10. After they answer: name what's right, add what's missing, then show the Expected intuition. Wait before starting the next module unless they ask you to proceed automatically.

### Reflection questions are questions, not answers

Never show or paraphrase the Expected intuition before the learner answers. If the answer is thin, point to the right part and ask at most one probe. If they say "I don't know," re-teach from a different angle and ask again.

### Calibrate to the learner

Before Module 0 ends, ask: Have they written code? Used an LLM API? Done any statistics or ML? Calibrate: for tech-adjacent learners, explain AUC, precision and recall with the mailroom picture from the site's ELI5 page. For engineers and data people, compress the mechanics and go deeper on the evaluation traps.

### Honest measurement is the non-negotiable

This tutorial is about measurement, so you must model it:

- **Never peek at held-out data.** The held-out split is created in Module 2 and not opened, scored or summarized until Module 12. If you need examples, use dev.
- **Labels come before scores.** Never show the learner model scores while they label.
- **Never claim a number you didn't compute.** Every AUC, rate, latency and cost in this tutorial comes from a script that ran in front of the learner.
- **Spend is announced.** Before any step that calls a paid API, state roughly how many calls and the estimated cost, and get a yes. Keep a running total in `runs/spend.jsonl` (counts and token usage only).
- **Keys never touch git.** Keys live in `.env` (git-ignored) or the OS keychain.
- **Private data stays private.** If the learner uses their own data (their email, tickets) instead of synthetic data, it lives only in `data/private/` (git-ignored), and you must ask before sending it to any hosted backend, naming the vendor.

### Keep changes small, verify, and use the circuit breaker

One module, one small diff, one commit. After roughly three failed attempts at the same check, stop: explain the blocker plainly (a missing key, a network wall, a rate limit is not the learner's fault), then offer to simplify, skip with a written reason, or pause.

### Choosing the stack

If the project folder is empty, use: **Node.js LTS, ES modules, plain JavaScript, `node:test`, built-in `fetch`, zero dependencies** (a backend adapter may add its vendor's official SDK, such as `@anthropic-ai/sdk` for Claude). Announce this in Module 0.5 and proceed only after the learner accepts. If they prefer Bun, TypeScript or Python, adapt every module and restate the stack in one line when resuming.

### Make AI collaboration explicit

At each layer, say how it helps an agent like you, not just future humans: the decision card gives you the spec; the frozen labels give you an objective referee; the eval script gives you a feedback loop; the thresholds file stops you from "improving" numbers by moving the goalposts; the escalation log is your to-do list; the runbook and CLAUDE.md are your front door.

### Avoid fake completeness

If something is simplified, say so. Example: "This skeleton uses 60 synthetic items. Real thresholds need hundreds of real, blind-labeled items and a new time window."

---

## Module Index

| # | Module |
|---|---|
| 0 | Orient and Calibrate |
| 0.5 | Version Control and Secret Hygiene |
| 1 | Write the Decision Card |
| 2 | Build and Freeze a Labeled Set |
| 3 | The Code Tier and the Baselines |
| 4 | The Decision Contract and a Fake Backend |
| 5 | Ask Your First Real Question |
| 6 | Grade It Honestly |
| 7 | A Phrasing Ladder |
| 8 | Thresholds and Bands |
| 9 | The Escalation Tier |
| 10 | Novelty and Doubt |
| 11 | Close the Loop: Push a Fix Down |
| 12 | Held-Out Validation |
| 13 | Swap the Backend |
| 14 | What It Costs |
| 15 | Runbook and CLAUDE.md |
| 16 | Final Review: Is This a Cascade? |

---

## What the Learner Should Understand by the End

- why a decision model is a different tool from an LLM, not a cheaper one
- why the cost of each kind of error decides the design before any model does
- how to label, freeze and evaluate so the numbers can be believed
- why contrastive questions that name near misses beat abstract ones, and why phrasing must be re-graded per model
- how thresholds, bands and the model's own doubt route work between tiers
- why every escalation should end with a fix in a cheaper tier
- what each tier costs, and why escalation rate, not the per-call price, drives the bill

The key mental shift:

> A good decision system is not the smartest model on every item.
> It is the cheapest tier that is right for each item, measured honestly, getting cheaper every week.

---

# Module 0: Orient and Calibrate

## Goal

Know who you're teaching, what they'll judge, and which backends they can reach.

## Intuition

Before building a decision system, you need three answers: what is being decided, what each mistake costs, and what tools are available. Most failed AI projects skip the first two and start with the third. This module gathers context only; nothing is built yet.

## Claude Code Instructions

**Guard:** if the working directory contains this tutorial's own files (`101-decision-skeleton.md`), do not build here. The learner's project goes in `my-decisions/` (or wherever they prefer), which Module 0.5 makes its own git repository.

1. Calibrate the learner (see the contract).
2. Check the toolchain: `git --version`, git identity, `node --version`.
3. Ask which **domain** they want to judge. Offer a default and two alternatives:
   - **Default: an inbox first pass.** "Does this email need a human, or can it be filed?" Synthetic emails, so nothing private.
   - **Support-ticket triage.** "Which team, and is it urgent?"
   - **Their own data**, with the privacy rules from the contract.
4. Ask which **backend keys** they have or can get (see "Before you start"). Check only whether the environment variables exist; never print a key.
5. Give the cost expectation: cents for decision-model calls, a little more if they use an LLM tier.

## Implementation Task

No code. Write a short orientation note (in the conversation or as `docs/orientation.md`, which rides into Module 0.5's commit):

```text
Learner: (background, calibration)
Domain: (what is being decided)
Backends available: (decision model candidates; LLM tier or human queue)
Stack: (default or the learner's choice)
```

## Check

Confirm that each backend listed actually has its key or local server available (existence only).

## Done When

- The domain, the backends and the stack are written down.
- No code exists yet.

## Reflection Prompt

> In your domain, which mistake is worse: filing something that needed attention, or bothering a person with something that didn't? Roughly how much worse?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Almost always, the two errors are wildly asymmetric. Filing a bill that's due costs far more than glancing at one extra newsletter. That ratio is the single most important design input: it decides where thresholds go, how much escalation you can afford, and whether a cheap model is good enough. Teams that never write it down end up optimizing "accuracy," which treats both errors as equal, and that's almost never true.

</details>

---

# Module 0.5: Version Control and Secret Hygiene

## Goal

Make the project safe to commit before any key, label or data exists.

## Intuition

A decision system accumulates three kinds of material that must never be committed carelessly: **keys**, **private data**, and **raw model outputs** that may echo that data. Setting up `.gitignore` before any of them exist is far easier than scrubbing history later. Git also gives the learner, and you, a safe undo for every experiment.

## Claude Code Instructions

Collect standing consent once: (a) commit after every module, (b) commit directly to `main` (a deliberate solo simplification; teams use branches and PRs), (c) honor the learner's own commit conventions. Then initialize `my-decisions/` as its own repository.

## Implementation Task

- `git init` in `my-decisions/`.
- `.gitignore` covering: `.env`, `node_modules/`, `data/private/`, `runs/` (raw outputs; summaries get committed deliberately later), OS junk.
- `.env.example` listing the variable names for the chosen backends, with no values.
- A one-paragraph `README.md` stub: what this project decides.

## Check

Create a throwaway `.env` with a fake value and run `git status`. It must not appear. Delete the throwaway file.

## Done When

- The repo exists, and its first commit is `module 0.5: version control and secret hygiene`.
- `git status` proves `.env` and `data/private/` are ignored.

## Reflection Prompt

> Why ignore `runs/` (the raw model answers) and not just the keys?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Raw outputs can carry the input with them: logged states, item text, and model ids tied to your account. With real data they are as private as the data itself. They're also bulky and reproducible. The habit is to commit **summaries** you chose to publish (AUCs, rates, costs) and keep raw logs local. The email project this tutorial is based on kept mail, labels and run logs out of git entirely, and published only counts, rates and AUCs.

</details>

---

# Module 1: Write the Decision Card

## Goal

Specify the decision in one page before touching a model.

## Intuition

A decision model answers the question you write, literally. So the question has to exist, precisely, before any code. The decision card names the input, the possible answers, who acts on each answer, what each error costs, and which parts are **computable** (and therefore belong to code, not a model). Writing it often reveals that half the "judgment" is really rules.

## Claude Code Instructions

Interview the learner and draft `docs/decision-card.md` together. Push on two things: every answer option should have a "near miss" neighbor named explicitly, and every computable sub-decision should be moved to the code column.

## Implementation Task

`docs/decision-card.md`:

```markdown
# Decision card
- Item: (what one unit of input is)
- Question: (one sentence)
- Answers: (named options; for each, what action follows and who takes it)
- Near misses: (which options get confused, and the line between them)
- Error costs: (false "file" vs false "needs me", as a rough ratio)
- Computable parts → code: (e.g., sender is in my contacts; amount > $X; date is past)
- Judgment parts → decision model: (what no rule can settle)
- Escalate when: (stakes, novelty, low confidence)
- Never automated: (what always goes to a human)
```

## Check

Read the card back and ask the learner to classify three made-up items using only the card. If they hesitate, the card has a gap; fix it.

## Done When

- The card exists and three test items can be classified from it alone.

## Reflection Prompt

> Which parts of your decision did you move to the "computable → code" line, and why shouldn't a model do them even though it could?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Anything with a computable answer is cheaper, faster, deterministic and testable in code, and decision models are measurably weak at arithmetic, dates and facts that aren't in the item (who you know, what's already open). In the game agent, "equip a free upgrade into an empty slot" kept getting uncertain scores from the model, though the answer is never worse than nothing; it became a code policy. In the email project, "a known person is never filed" caught 3 of 3 misses that more model questions couldn't. Rule of thumb: model for judgment without a computable answer; code the moment there is one.

</details>

---

# Module 2: Build and Freeze a Labeled Set

## Goal

Create labeled data, blind, and split it into dev and held-out before any model sees it.

## Intuition

You can't know whether a decision system works without examples whose right answers were decided **without looking at the model**. If labels are made after seeing scores, they drift toward the model. And anything you tune on stops being a fair test, so a held-out slice must be locked away now, before temptation exists.

## Claude Code Instructions

- **Synthetic path (default):** generate about 60 items from the decision card with a fixed seed. Make them realistic and include hard cases: near misses for every option, a few items whose right answer depends on a computable fact, and a few genuinely ambiguous ones. Write them to `data/items.jsonl` (`{id, text, facts?}`).
- **Labeling:** have the learner label at least 15 items themselves, blind (show only the text). You may draft labels for the rest from the card, but mark them `source: "claude"`, and the learner's labels win wherever they exist. Record a `confidence: high|low` per label.
- **Split** with a fixed seed: about 40 dev, 20 held-out. Write `data/dev.jsonl` and `data/heldout.jsonl` (labels inside). **Do not open, print or summarize `heldout.jsonl` again until Module 12.**
- **Own data path:** same steps, in `data/private/`.

## Implementation Task

- `data/items.jsonl`, `data/dev.jsonl`, `data/heldout.jsonl`, and `docs/labeling-guide.md` (how ambiguous cases were ruled).
- A tiny `scripts/split.js` so the split is reproducible.

## Check

Run the split script twice and confirm the two splits are identical (same ids in each), with label counts per class for **dev only**.

## Done When

- Labels exist, the learner labeled at least 15 blind, and the held-out file is committed and untouched.

## Reflection Prompt

> Why does the learner's own labeling matter if Claude could label everything faster?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

The labels define what "right" means, and that's a human's call, especially in the gray zones. In the email project, the human's rulings overrode provisional labels, and the cases where labelers disagreed exposed exactly the decisions only the human could make. Model-drafted labels also share blind spots with model-based judges, which inflates agreement. Fast labels you can't trust make every later number meaningless.

</details>

---

# Module 3: The Code Tier and the Baselines

## Goal

Build the rules tier and an evaluation script, and record the baselines any model must beat.

## Intuition

Before asking a model anything, find out how far plain code gets you, and what "doing nothing clever" scores. Two baselines anchor everything: **escalate everything** (perfect recall, zero automation) and **simple rules**. If a model can't beat the rules on dev, you don't need a model, and that's a win. Rules here produce **facts**, not verdicts: they can keep an item out of the automated bucket, but they don't force decisions on their own.

## Claude Code Instructions

Implement the computable parts of the decision card as pure functions returning facts. Build `scripts/eval.js` around a simple contract: given predictions (`act` / `escalate`, or a score) and labels, report recall on items that need attention, the share handled without escalation ("filter rate"), the exact list of misses, and precision of escalations.

## Implementation Task

- `src/rules.js`: facts from each item (e.g., `knownSender`, `mentionsMoney`, `hasDate`) plus a conservative rules-only policy.
- `scripts/eval.js`: recall, filter rate, misses (ids), escalation precision.
- `test/rules.test.js`: one test per rule, on hand-made items.
- `docs/results.md`: a results table started with two rows, "escalate everything" and "rules only" (dev).

## Check

Predict first: what filter rate and recall will "rules only" get on dev? Then run `node --test` and `node scripts/eval.js --policy rules --split dev`.

## Done When

- Tests pass; the two baselines are recorded in `docs/results.md` from real runs.

## Reflection Prompt

> "Escalate everything" has 100% recall. Why isn't that the answer?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Because it automates nothing: every item costs the most expensive tier's attention, and the people or LLM upstairs drown. Recall alone is meaningless; it has to be read with how much work was saved. In the email project, simple conservative rules gave 72% recall at 20% filtered, a real baseline, and the model-based system had to beat both numbers at once to earn its place.

</details>

---

# Module 4: The Decision Contract and a Fake Backend

## Goal

Write your code against one decision contract, with a deterministic fake backend and a contract test.

## Intuition

Decision models come from several vendors with slightly different wire formats. If your code talks to one contract and each vendor gets a thin adapter, you can swap backends with a config change (Module 13 does exactly that). A **fake** backend gives you fast, free, deterministic tests, and it lets you build every later layer before spending a cent.

## Claude Code Instructions

Use the `/v1/systemone` request shape as the contract (Jev's, and increasingly a de facto standard). Explain the three question types: Choice (named options → probabilities), Noul (yes/no → probability), Score (2–10 ordered levels → expected level). Implement:

```js
// src/decide.js
// ask(state, questions, {backend}) → { model, answers: { [id]: {type, choice?, probabilities?, noul?, score?} }, usage }
```

- `src/backends/fake.js`: deterministic answers from simple keyword heuristics, reporting `model: "fake-1"`.
- `src/backends/<chosen>.js`: a stub for the real backend, implemented next module.
- Every response is validated: probabilities in [0, 1], each distribution sums to ~1, every asked id is answered. **Fail loudly** on a missing field; never default it to 0.

## Implementation Task

- `src/decide.js`, `src/backends/fake.js`, `test/contract.test.js` (shape validation, errors on malformed answers).

## Check

Predict: what should happen if a backend returns a Choice whose probabilities sum to 0.7? Then run the tests.

## Done When

- The contract test passes against the fake backend, including the malformed-answer cases.

## Reflection Prompt

> Why should a missing field crash loudly instead of defaulting to zero?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Because a silent default turns a bug into a wrong decision that looks normal. In the game agent, a gold-versus-cost gate read a field the observation layer never sent; cost read as 0, so the gate always passed, and nothing complained. Each tier can only escalate what the tier below reports honestly. Loud failures are cheap; quiet ones compound.

</details>

---

# Module 5: Ask Your First Real Question

## Goal

Call a real decision backend with one contrastive Choice, and log every raw answer.

## Intuition

One good question beats ten vague ones. The best single question in the email project was a **contrastive Choice whose options name the near misses**: not "is there a deadline?" but "deadline / event / offer / informational / none," so every wrong answer has somewhere to go. Logging the raw answer with the reported model id is what makes later analysis possible.

## Claude Code Instructions

1. Implement the real adapter for the learner's backend:
   - **Jev:** `POST https://api.typesafe.ai/v1/systemone`, `Authorization: Bearer $TYPESAFE_API_KEY`, pin `model: "jev-1.13.0"` (not an alias).
   - **OpenAI Decisions:** map to `POST /v1/decisions` (`noul` → `predicate`, criteria maps → `[{value, description}]`, no `null` descriptions, JSON state pretty-printed to text, minimum 2 options).
   - **Claude Haiku 5.5:** use the official `@anthropic-ai/sdk`, structured outputs with one probability per option/Noul, effort `low`; clamp and normalize; note that these probabilities are written, not measured.
   - **Local:** point at the local server's `/v1/systemone`; serialize requests if the server isn't concurrency-safe.
2. Write the contrastive Choice from the decision card's answers and near misses. Describe `none` (or its equivalent) carefully; a vague `none` gets about 50% accuracy on true negatives.
3. Announce the spend (40 dev items × 1 request) and get a yes.
4. Run on **dev only**. Log one line per item to `runs/<stamp>.jsonl`: id, reported model, answers, usage, latency. Log usage to `runs/spend.jsonl`.

## Implementation Task

- `src/backends/<chosen>.js`, `src/questions.js` (the question, versioned as rubric `v1`), `scripts/ask.js --split dev`.

## Check

Predict: for how many of the 40 dev items will the top choice match the label? Then run it and count.

## Done When

- A logged run exists with the real model id on every line, and the spend is recorded.

## Reflection Prompt

> Why pin a versioned model id instead of an alias like `jev-latest`?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

An alias moves when the vendor ships, so the model answering your questions can change under you without any change on your side, and every threshold you tuned silently means something different. Pinning makes model changes deliberate events you re-evaluate. (Some backends, such as OpenAI's Decisions API today, offer no pinned id at all; then logging the reported model and re-checking thresholds after vendor changes is the fallback.)

</details>

---

# Module 6: Grade It Honestly

## Goal

Measure the question with AUC against its own concept, beside the baselines.

## Intuition

"How often was the top choice right" hides how useful the probabilities are. **AUC** asks a better question: if you pick one item that truly needs attention and one that doesn't, how often does the model score the first higher? 0.5 is a coin, 1.0 is perfect ranking. Grade each question against **the concept it actually asks about** first; a question can look like chance against your final label and still be excellent at its own job.

## Claude Code Instructions

Add AUC (rank-based, no dependencies) to `scripts/eval.js`. From the Choice, derive a score (for example, the summed probability of the options that need attention). Report AUC on dev, accuracy per class, and a confusion table. Add a row to `docs/results.md`. Explain that 40 items give a wide interval; this is a skeleton, not a verdict.

## Implementation Task

- AUC + confusion table in `scripts/eval.js`; a results row for rubric `v1` on dev.

## Check

Predict the AUC before running. Then run `node scripts/eval.js --run <stamp> --split dev`.

## Done When

- AUC, confusion table and a results row exist, computed from the logged run (no new API calls).

## Reflection Prompt

> Your eval re-used the logged answers instead of calling the model again. Why is that a habit worth keeping?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Logged answers make analysis free, fast and repeatable: you can try ten scoring rules in seconds without spending or waiting, and everyone gets the same numbers. In the email project, rule changes were checked in seconds by replaying logged scores. The caution: replaying is in-sample whenever those same items shaped the rules, which is why held-out validation (Module 12) still has to call the model on unseen items.

</details>

---

# Module 7: A Phrasing Ladder

## Goal

Try three phrasings of the same concept in one batched request and grade each.

## Intuition

Phrasing moves results more than most people expect, and in predictable ways: contrastive Choices usually win; exact propositions (Nouls) are the best calibrated; abstract wording ranks but over-fires; splitting a concept the model already grasps into sub-questions usually loses. Batching is free: send all the questions with the shared state once.

## Claude Code Instructions

Build a ladder for the concept: (a) the Module 5 contrastive Choice, (b) an exact Noul ("Does this email ask the reader to do something by a stated date?"), (c) an abstract Noul ("Does this involve a deadline?"). Optionally (d) a consequence framing ("Would ignoring this cost the reader something?"). Send all in one request per item (rubric `v2`). Announce spend first. Grade each rung by AUC on dev.

## Implementation Task

- Rubric `v2` in `src/questions.js`, a run on dev, and a ladder table in `docs/results.md`.

## Check

Predict the ranking of the rungs before running.

## Done When

- Every rung has a dev AUC from one batched run; the best rung is identified.

## Reflection Prompt

> If you switched to a different backend tomorrow, would the same rung win?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Not reliably. Phrasing tuned on one model fell by up to 0.20 AUC on another in the email project: consequence framings that worked on Jev collapsed on a smaller open model, while Claude Haiku 5.5 was far more robust to rough phrasings than Jev. The ladder is a property of a (model, question) pair, so re-grade it whenever the model changes. Module 13 tests exactly this.

</details>

---

# Module 8: Thresholds and Bands

## Goal

Turn scores into routes (act, watch, escalate), fit on dev only, and freeze the result.

## Intuition

A probability is not a decision. Code needs lines: above this, act alone; below that, escalate; in between, a **watch band** that's logged for later review. Where the lines go follows from the error costs in your decision card. Thresholds belong to one (model, rubric) pair: change either and you refit. Freezing them in a committed file is what stops anyone, human or agent, from quietly moving the goalposts after seeing results.

## Claude Code Instructions

Write `scripts/fit-thresholds.js`: on **dev only**, find the most automation that keeps misses at the level the decision card allows (often zero on dev). Write `thresholds/<model>__<rubric>.json` with the lines, the dev numbers they produced, and the date. Wire `src/route.js` to read the file matching the active (model, rubric) and **refuse to run** when none exists. Combine with rule facts: rules may keep an item out of the automated bucket, never force it in.

## Implementation Task

- `scripts/fit-thresholds.js`, `thresholds/<model>__<rubric>.json`, `src/route.js`, and a test that routing refuses an unknown (model, rubric).

## Check

Predict the dev filter rate at your chosen lines. Then run the fit and the router on dev.

## Done When

- A frozen thresholds file is committed, and the router refuses an unknown pair.

## Reflection Prompt

> Why key the thresholds file by model *and* rubric, not just model?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Because the numbers mean different things whenever either changes. Adding a question changes the score you threshold; a new model shifts every probability. Even a runtime setting moved probabilities by up to 0.043 in the email project, enough to flip 1 decision in 282, and swapping backends under a trained combiner raised the error from 1.86 to 2.12. The file name makes the dependency impossible to forget.

</details>

---

# Module 9: The Escalation Tier

## Goal

Send escalated items up to an LLM (or a human queue) and record what it decided.

## Intuition

Escalated items go to a slower, more capable reader: an LLM that can read the item, reason, and explain. In a real system it gets more context than the decision model had: the item, the rule facts, the decision model's answers, and why it escalated. Its verdict is recorded so every escalation becomes a data point for the next improvement. Without an LLM key, a human queue is the honest equivalent.

## Claude Code Instructions

Implement `src/escalate.js`: build a packet (item, facts, answers, reason) and either call the LLM tier with a structured verdict (`{decision, reason, suggested_fix}`), using the official SDK for that vendor (for Claude, `@anthropic-ai/sdk`; Claude Sonnet 5.5 or Opus 5.5 are sensible defaults), or append the packet to `queue/human.jsonl`. Log every escalation with its resolution to `runs/escalations.jsonl`. Announce the spend first.

## Implementation Task

- `src/escalate.js`, `scripts/run-cascade.js --split dev` (rules → decision model → route → escalate), and the escalation log.

## Check

Predict how many dev items escalate and what share the LLM will rule "needed attention." Then run it.

## Done When

- A full dev cascade run exists, with every escalation and its resolution logged.

## Reflection Prompt

> The LLM tier is far more capable. Why not route everything there?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Cost and speed. Per decision, Claude Sonnet 5.5 is roughly 140× Jev and Opus 5.5 roughly 290×, before counting that real escalations are bigger requests. LLMs are also slower and less repeatable. The cascade spends the expensive reader only where cheaper tiers can't be right. In a long-running agent, LLM wakes were the scarce resource, more than money or time.

</details>

---

# Module 10: Novelty and Doubt

## Goal

Give the decision tier its own escalation signals and a watch band.

## Intuition

A confidence threshold catches uncertain answers. Two more checks catch different trouble. **Novelty** asks whether the situation is outside what the context describes; the fix is more context. **Doubt** is a separate verifier call that shows the model the chosen action and asks whether a careful person would doubt it; the fix is in the options or the plan. In the game agent, doubt above about 0.75 pointed at a real problem every time, while bugs often sat just under the line, in the 0.5–0.7 band.

## Claude Code Instructions

Add a Noul `novel_situation` to the decide request, and a second request after routing: `doubt_action` on the chosen route ("Would a careful assistant doubt filing this item without showing anyone?"). Escalate when either is over 0.7. Log every reading. Put 0.5–0.7 doubt in `runs/watch.jsonl` for the next review instead of escalating. Announce spend (one extra request per item).

## Implementation Task

- Novelty + doubt in `src/decide.js` / `src/route.js`, the watch log, and a dev run.

## Check

Predict whether doubt or novelty will spread more widely across dev items. Then run it and print each one's p10/p50/p90.

## Done When

- Both signals are logged on every dev item, and escalations by reason are counted.

## Reflection Prompt

> Doubt was low on an item whose route was still wrong. How can that happen?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Doubt judges the chosen action among the options it was shown, in the state it was shown. If the state is missing a fact (the sender is your landlord) or the options are wrong (no route existed for "forward to my accountant"), the best available option looks fine. In the game agent, most bad plans reached the LLM with doubt at only 0.27–0.35: planner gaps where every option offered was bad. Doubt checks the choice, not the option generator. Outcome checks and LLM audits catch the rest.

</details>

---

# Module 11: Close the Loop: Push a Fix Down

## Goal

Turn one escalation into a lower-tier change and measure that it worked.

## Intuition

This is what makes a cascade get cheaper over time instead of just routing. Every time the expensive tier resolves something, leave a change in a cheaper tier so the same case doesn't climb again: a **rule** (if the answer is computable), a **context line** (if the model lacked a fact), or a **better option** (if the choice was missing). In the game agent, one playbook line moved the same kind of decision from doubt 0.74 to 0.35.

## Claude Code Instructions

Review `runs/escalations.jsonl` and `runs/watch.jsonl` with the learner. Pick the most common pattern. Classify the fix (rule / context / option) with the learner, then implement it with a comment naming the case that motivated it. Re-run **only the affected dev items** and compare doubt, novelty and route before and after. If the fix changes the rubric, bump the rubric version and refit thresholds on dev.

## Implementation Task

- One push-down change, a before/after table in `docs/results.md`, and a refit if the rubric changed.

## Check

Predict the after-readings. Then re-run the affected items.

## Done When

- The pattern no longer escalates on dev, and nothing else regressed (re-run the full dev eval from logs or a fresh run).

## Reflection Prompt

> Why re-check the whole dev set after fixing one pattern?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Rules interact, and a fix can break the next case. In the game agent, a batching rule fixed one loop and then rejected every purchase, including the one routine restock it needed; it was caught one cycle later. Independent policies that are each correct alone formed loops. Ship small, then watch the next cycle: re-running dev is that next cycle.

</details>

---

# Module 12: Held-Out Validation

## Goal

Freeze everything, then run the held-out set exactly once and report honestly.

## Intuition

Everything so far was tuned on dev, so dev numbers flatter you. The held-out set has been locked since Module 2. Now you freeze the rubric and thresholds in a commit, run it once, and report what happened, including misses, with an honest bound. Zero misses in 20 items does not mean perfect: about 3/n (here 15%) is a rough 95% upper bound on the miss rate.

## Claude Code Instructions

1. Commit the frozen state first (`module 12: freeze before held-out`, then the results commit).
2. Announce spend, then run the full cascade on `data/heldout.jsonl`.
3. Report: filter rate, recall, exact misses (with their label confidence), escalation precision, and the same numbers for both baselines on held-out.
4. Do **not** change anything in response. Write findings as next steps.

## Implementation Task

- A held-out results section in `docs/results.md`, with the rule-of-three bound and the baselines beside it.

## Check

Predict held-out vs dev: higher, lower or the same filter rate? Then run it.

## Done When

- Held-out was run once on a frozen commit, and misses are listed exactly.

## Reflection Prompt

> You found a pattern in the held-out misses. If you fix it now, what happens to your held-out numbers?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

They stop being held-out. Anything tuned on a window makes that window in-sample, so after a fix you need **new** unseen data to measure again: a new month, a new batch. In the email project, a fresh two-week window filed 68% against 58% in cross-validation, and a change that looked like +2.4 points in cross-validation missed 6 actions on new data. The threshold transferred; the filter rate didn't.

</details>

---

# Module 13: Swap the Backend

## Goal

Run the same frozen eval against a second backend and compare quality, latency, cost and repeatability.

## Intuition

Because your code talks to one contract, a second backend is an adapter and a config change. What you learn is rarely "better or worse" overall: it's a profile. In our four-way comparison, OpenAI's Decisions API tied Jev on wine and was faster; Claude Haiku 5.5 led on quality but cost 5–7× more, was slower, and gave identical answers on only a third of re-asks; small open models were free and private but a step behind (with larger October releases still to test).

## Claude Code Instructions

Add a second adapter (any backend from "Before you start"). Run rubric `v2` (or your latest) on dev with it, announcing spend. Report: AUC per rung (does the same rung win?), latency p50/p95, cost per request from usage, and **repeatability**: re-ask 10 items and count identical answers and the largest probability change. Do not reuse the first backend's thresholds: fit a new file for the new (model, rubric) pair.

## Implementation Task

- A second adapter, a comparison table in `docs/results.md`, and a new thresholds file.

## Check

Predict the cost ratio and whether answers will be identical on re-ask. Then run it.

## Done When

- The table compares both backends on the same items, including the re-ask test.

## Reflection Prompt

> The second backend was slightly better on AUC but not repeatable. Where in the cascade could you still use it?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Anywhere a frozen threshold doesn't gate an action directly: as the reviewer for the watch band, as a second opinion that feeds the LLM tier, as a feature beside the main model's answers (Jev plus Luna answers together beat either alone on wine), or averaged over two or three calls at two or three times the cost. A non-repeatable judge near a decision line will flip; away from the line, its quality can still pay.

</details>

---

# Module 14: What It Costs

## Goal

Compute the real cost of each tier and project a month.

## Intuition

Per-call prices are tiny, so people ignore cost until the bill arrives. The bill is driven less by the decision model's price than by **how many items escalate**, and by people's time once they're in the loop. Knowing your cost per 1,000 decisions per tier turns "should we add a question?" into arithmetic.

## Claude Code Instructions

Write `scripts/cost.js` from `runs/spend.jsonl` and the cascade runs: cost per 1,000 decisions for each tier actually used (from logged usage × current prices; state the price date), the escalation rate, and a monthly projection at the learner's expected volume. Add a row normalizing to the decision model (1×), and compare against the site's [cost ladder](https://robgruhl.github.io/jev-learnings/cost.html).

## Implementation Task

- `scripts/cost.js` and a cost section in `docs/results.md`.

## Check

Predict which tier dominates the monthly cost. Then run it.

## Done When

- Costs are computed from logged usage, not estimates, with prices dated.

## Reflection Prompt

> What single change would cut your monthly cost the most?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Usually lowering the escalation rate, not switching to a cheaper decision model: one LLM escalation can cost as much as thousands of decision-model calls, and one person-minute as much as many thousands. That's why the push-down loop from Module 11 is the real cost lever. Each escalation that becomes a rule or a context line removes a recurring expensive call. In an agent loop the same logic applies to LLM wakes.

</details>

---

# Module 15: Runbook and CLAUDE.md

## Goal

Write down how to operate, refit and extend the system, for the next human and the next agent.

## Intuition

A decision system has procedures that are easy to get wrong: adding a question changes the rubric, which invalidates thresholds; a vendor update can move answers; held-out data gets used up. A runbook makes those procedures explicit. A `CLAUDE.md` gives an agent the same front door, plus the invariants it must never break.

## Claude Code Instructions

Write `docs/runbook.md` and `CLAUDE.md` with the learner. Keep them short and specific to this project.

## Implementation Task

- `docs/runbook.md`: how to run the cascade; how to add a question (new rubric version → dev run → refit → held-out on new data); how to switch backends; how to read the escalation and watch logs; what to do when the filter rate drifts.
- `CLAUDE.md`: what the project decides, the commands, and the invariants: labels before scores; never tune on held-out; thresholds keyed by (model, rubric); pinned model ids; keys and private data never committed; announce spend; every escalation ends with a push-down.

## Check

Ask a fresh Claude Code session (or role-play one) to explain, from `CLAUDE.md` alone, how to add a new question. Fix whatever it gets wrong.

## Done When

- Both files exist and a fresh reader can follow the add-a-question procedure.

## Reflection Prompt

> Which invariant in your CLAUDE.md would an eager agent be most tempted to break, and why?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Usually "never tune on held-out" or "don't move thresholds after seeing results." Both feel like progress: the number goes up. But they destroy the meaning of the measurement. Agents are especially prone to it because they're asked to "make it better" and can see every file. Writing the invariant down, keying thresholds to a committed file, and freezing before held-out runs turn a temptation into a visible rule-break.

</details>

---

# Module 16: Final Review: Is This a Cascade?

## Goal

Review the system against the shape it was meant to have, list skips honestly, and plan the next step.

## Intuition

The test of a decision skeleton isn't its accuracy on 60 items. It's whether every tier is real, every number is honest, and the path to a production system is visible: more data, a new window, more push-downs.

## Claude Code Instructions

Walk the checklist with the learner, marking each item done, skipped (with reason) or simplified. Summarize `docs/results.md` in five lines. Then offer next directions.

## Implementation Task

`docs/review.md`:

```text
[ ] Decision card names answers, near misses, error costs, computable parts
[ ] Labels made blind; held-out frozen and used once
[ ] Rules produce facts; baselines recorded
[ ] One contract, a fake backend, loud validation
[ ] Questions graded against their own concepts; best rung chosen
[ ] Thresholds fit on dev only, keyed by (model, rubric), frozen
[ ] Escalation tier logs every resolution
[ ] Novelty and doubt logged on every item; watch band reviewed
[ ] At least one push-down measured before/after
[ ] Held-out results reported with misses and a bound
[ ] Second backend compared, including repeatability
[ ] Costs computed from logged usage
[ ] Runbook and CLAUDE.md
```

## Check

Every checked box points to a file or commit; every unchecked box has a written reason.

## Done When

- `docs/review.md` is committed. Congratulate the learner.

## Reflection Prompt

> If this ran on real data for a month, what would you expect to change first: the questions, the thresholds, the rules, or the mix of tiers?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

The mix of tiers, through the push-down loop: as escalations turn into rules and context lines, more items settle in code and the decision tier, and fewer climb. Thresholds drift too (refit per window and watch the filter rate), and questions change when blind audits of filed items reveal a failing concept. The system you built is designed to change in exactly those ways, measured each time.

</details>

---

## Where to Go Next

- **Answers as features.** Ask 10–40 narrow questions and combine them with a small learned model (logistic regression or gradient-boosted trees) instead of hand thresholds. In the email project this doubled filtering at the same safety; validate on a new time window.
- **An agent loop.** Use the same tiers for an agent: code plans and verifies, the decision model judges priorities per tick, the LLM wakes on escalations and fixes causes. Guards go in the fastest loop.
- **Re-test open weights.** Run the October 2026 releases (Strands Decider Gemma 4 sizes, APUS 9B/35B) through Module 13.
- **More data, new windows.** Label a real month blind, run once, repeat next month.

*© Rob Gruhl. Licensed under CC BY 4.0. Format adapted from the [Walking Skeleton Tutorial](https://walkingskeleton.org/).*
