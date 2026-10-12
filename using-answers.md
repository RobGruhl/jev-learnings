# Using Jev's answers

## As features, not judges

A learned combiner (gradient-boosted trees) over the question answers plus rule facts filtered about twice as much mail as hand-set thresholds, at the same safety:

| Setup | Mail filtered with zero LLM tokens | Missed actions |
| --- | --- | --- |
| Frozen hand thresholds | 29% | 0 |
| Local model, learned combiner (leave-one-month-out) | 47% | 0 |
| Hosted model, learned combiner (leave-one-month-out) | 58% | 1 |

The same held on an unrelated public dataset (wine reviews). A small local model nearly matched hosted Jev when many questions were combined, and trailed badly as a single judge.

## Validate on a new time window, not only cross-validation

- On a fresh two-week window with a frozen threshold, the sorter filed 68% instead of the 58% seen in cross-validation and missed 2 of 55 actions (both debatable).
- Adding more Jev concept answers as features looked like +2.4 points in leave-one-month-out, but missed 6 actions on the new window.
- **The score threshold transfers; the filter rate doesn't.** Guard for drift in each window.

## As a gate, modestly

Escalating a filed message whenever any concept Choice had P ≥ 0.5 caught 1 of 2 filed actions, at a cost of 2.8 points of filtering.

## Facts beat more questions for the remaining misses

- "A known person is never filed" caught 3 of 3 filed known-person messages, at a cost of 3 messages.
- The human's rulings and the list of open matters explain most of the rest. Those are facts code can supply. Jev can't infer them from one message.

## Rules are facts, not overrides

In the email pipeline, rules run in parallel with the model and contribute facts. They don't override:
- Only bad input and embedded instructions (prompt injection) force a review.
- Other rules may only keep mail *out of* the zero-token buckets.
- The model's category never suppresses mail on its own.

An earlier "not bulk-looking" override saved zero important messages over three evaluation sets and cost filtering.

## Thresholds belong to a (model, rubric) pair

Changing the model, the runtime or the rubric means refitting thresholds:
- **Runtime:** a faster prefill step shifted probabilities by up to 0.043, enough to flip 1 decision in 282.
- **Tokenizer:** token counts differed about 2.5× between two runtimes of the same model family.
