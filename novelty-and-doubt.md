# Novelty and doubt: a decision model's own escalation signals

A decision model that acts in a loop needs a way to say "this one isn't mine". In the Melvor Idle agent, Jev answers two extra questions on every tick, and either one can send the decision up to the LLM:

| Check | Asked how | Question | Escalates when |
| --- | --- | --- | --- |
| `novel_situation` | Inside the decide call, alongside the option scores | Is this state unlike what the goal, playbook and milestones describe? | > 0.7 |
| `doubt_action` | A **separate verifier call**, after the action is chosen and with the chosen action in view | Would a careful player doubt this specific action here? | > 0.7 |

They ask different things and point to different fixes:

- **Novelty is about the situation.** High novelty means the context Jev judges against doesn't cover this state. The fix is more context: a playbook line, a milestone, a standing rule.
- **Doubt is about the action.** High doubt means the chosen action looks wrong for this state. The fix is in the options or in the plan: a planner rule, a code policy, or the LLM overriding this one action.

## What we observed

Over four sessions (several hundred ticks, about 60 logged escalations):

**1. In-call novelty is a weak signal; the separate doubt verifier is a strong one.** Asked inside the decide call, novelty sat in a narrow band (p10/p50/p90 = 0.32/0.40/0.50) and rarely fired. Doubt, asked as its own call on the chosen action, ranged widely (about 0.1–0.85) and tracked real problems. A model grading its own pick in the same breath is less useful than a second look at a concrete action.

**2. When doubt fires high, it is usually right.** Every firing above about 0.75 pointed at a real problem:
- 0.79: farm a bow from a 2%-per-kill drop (about 1,000 arrows on average).
- 0.78: sell an item every tick while also crafting it (churn).
- 0.84: fight a level-27 monster with a weak melee setup, for a 4.5% drop, to train an unrelated skill.

The one false alarm (0.74, a large sale that was fine) went away after one line of playbook context. The same kind of sale scored 0.35 next time.

**3. Novelty fires on first occurrences, and context retires it.** Novelty fired at 0.71 twice in one session, both genuinely new for the character: selling an obsolete ammo tier for the first time, and swapping to a melee weapon for material farming. After one playbook line ("older tiers are surplus once the better tier is worn"), selling an old armor piece went through at novelty 0.35 with no escalation. Firings do their job when they're rare, and when each one leaves behind context that prevents the next.

**4. Doubt measures how well the context fits.** Doubt falls when the context names the goal concretely:
- Equipping the milestone's target item: 0.08–0.19.
- Steps along a named milestone chain: 0.15–0.35.
- Ambiguous picks against a vague goal: 0.5–0.65.

That makes doubt a cheap **metric for context changes**. When a playbook line conflicted with the only safe option, doubt sat at 0.60–0.63 on three identical picks. After the line gained a safety condition, the same pick scored 0.51, then 0.46.

**5. The patterns under the threshold carry information too.** A fixed 0.7 gate tuned to stay quiet hides these:
- **Rising doubt across repeated identical decisions** points to a loop. A purchase loop's doubt climbed to 0.64 over repeats.
- **Flat, persistent mid-band doubt on the same pick** (0.6 ± 0.03, several times) points to a context conflict.
- **A single mid-band reading on a new kind of action** is usually fine. Let it run and look at the outcome.

Treat 0.5–0.7 as a watch band: log it, and have the LLM review it at its next scheduled wake rather than waking it on purpose.

**6. Doubt can't see problems in the options it was given.** This is the most important limit. Several bad plans arrived with doubt at only 0.27–0.35:
- Crafting 30 arrows when the run needed 300.
- Making a short batch instead of first making the scarce input.
- Training on leftovers that covered one craft.
- Mining for 100 minutes when equivalent stock sat in the bank.

Jev's verifier judges whether the chosen action is reasonable *among the options it was shown, in the state it was shown*. When the planner offers only bad options, the best bad option looks fine. Doubt is a check on the **choice**, not on the **option generator**. Planner gaps have to be caught another way:
- The LLM reads the plan's stated reasons.
- Outcome checks run after each step.
- Efficiency signals, such as "this run will last only 4 crafts".

## How to use the two signals

| Signal | Reading | Who acts | Typical fix |
| --- | --- | --- | --- |
| Doubt > 0.7 | This action looks wrong | LLM, now | Override; then fix the planner or add a code policy so the option isn't offered again |
| Novelty > 0.7 | This state is outside the context | LLM, now | Approve or redirect; add a playbook line or milestone so the next occurrence is routine |
| Doubt 0.5–0.7, flat over repeats | Context conflict | LLM, next wake | Find the conflicting line and add the missing condition |
| Doubt rising over repeats | Possible loop | LLM, next wake | Check whether the outcomes are changing state at all |
| Doubt low, plan inefficient | Planner gap; neither check can see it | LLM audit, outcome checks | Fix the option generator |
| Doubt after a context change | Did the fix work? | Measurement | Compare the same kind of decision before and after |

## Design notes

- **Use a separate verifier call for doubt.** Showing the model one concrete chosen action gives a sharper reading than asking for self-assessment inside the scoring call. It costs one extra call per decision, which is cheap at decision-model prices.
- **Keep the two questions separate.** They answer different questions and lead to different fixes. Merging them into one "uncertain?" signal loses the routing.
- **Log every reading, not just firings.** The useful patterns (flat, rising, falling after a fix) only show up across ticks.
- **Close the loop.** Every escalation should leave behind a change (context, a rule or code) that makes the same situation routine next time. If the same check keeps firing on the same kind of case, the lower tier hasn't learned yet.
- **Don't expect the decision model to audit its inputs.** It can say "this choice looks wrong". It can't say "you forgot to offer the right choice". That audit belongs to the LLM and to outcome checks in code.
