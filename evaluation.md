# Honest evaluation

These are the habits that made the email numbers believable. Most carry over to agent loops.

## Before a held-out run

- **Freeze and commit** the rubric and thresholds first. Anything tuned on a window makes that window in-sample.
- **Label every suppressed item.** Then misses are exact, not estimated.
- **Label a seeded random sample of escalated items** for precision and a recall estimate. Report recall with a Wilson interval.
- **Label blind.** Labelers never see model scores. Labels from the human override provisional ones.

## Reading the result

- Zero or a few misses in a few hundred items doesn't prove 99% recall. About 3/n is a rough 95% upper bound for zero misses in n.
- Windows are correlated (same senders, same habits), so a strong month is weaker evidence than it looks.
- Replaying logged scores under a new rule set is useful for debugging, but it's in-sample whenever those months shaped the rules.
- Always compare against baselines. Escalate-everything has 100% recall and filters nothing. Simple conservative rules gave 72% recall at 20% filtered.

## Over three held-out months (email first pass, hand thresholds)

| Month | Filtered (zero LLM tokens) | Misses | Estimated recall | Escalation precision |
| --- | --- | --- | --- | --- |
| 1 | 27.8% | 7 (all low-confidence labels) | ~97% | 42.5% |
| 2 | 28.6% | 23 | ~92% | 50.0% |
| 3 | 29.7% | 5 (all low-confidence labels) | ~98% | 55.8% |

Every change between runs came from a specific pattern of misses:
- Plainer questions.
- Rules demoted from overrides to facts.
- Context the small model couldn't have, such as which services belong to which projects.
- Charge history per vendor.

## An improvement loop for questions

| Step | Who |
| --- | --- |
| Find a failing concept (blind audit of each window's filed items) | LLM subagents |
| Propose a phrasing ladder and a contrastive Choice | LLM |
| Label concept gold: an enriched probe plus a seeded random slice, blind | LLM subagents, with human spot-checks |
| Grade each rung against its own concept; test sub-questions against one good question | Code |
| Decide the use (feature, gate or rule) and validate on a new window | Code, then LLM judgment |
| Rule on the gray zones the disagreement exposes | Human only |

Rounds of question tuning on a small local model weren't worth running. Concepts that depend on hidden consequences needed the hosted model or the LLM reader.

## For agent loops

- Log every tick's decision, checks and outcome, and every escalation with its detail and resolution. The escalation log is the dataset for the next round of push-downs.
- Measure the loop's real objective per resource. The Ranged training change was judged on XP per arrow, not on kills.
- Record the starting state before a run you want to measure. A missing starting value cost one comparison.
