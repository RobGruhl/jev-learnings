# Hosted Jev against other judges

All comparisons used the same tasks: concept AUCs on labeled mail and a "sorter" that files mail at a fixed number of missed actions.

| | Hosted Jev | Local open-weights Jev (4B) | 2B decider model | Open 27B decision model (Kev-27B, one H100) | Small general LLM (low effort) |
| --- | --- | --- | --- | --- | --- |
| Deadline (best question AUC) | 0.980 | — | 0.932 | **0.987** | 0.964 |
| Payment failed or ending | 0.997 | — | 0.984 | **0.998** | 0.995 |
| Waiting on a reply | 0.986 | — | 0.973 | **0.989** | 0.986 |
| Sorter filtered | **58.9%** at 1 miss | 46.8% at 0 misses | 44.1% at 1 miss | 56.4% at 0 misses | 57.1% at 2 misses |
| Routine-ness | 0.911 | 0.865 | | | |
| Matching an open record | 0.980 | 0.955 | | | |
| Resolution of a record | 0.933 | 0.873 | | | |

## Notes

- **Open weights caught up (October 14).** Six 26–27B open decision models ran on the same harnesses on a rented H100. The five fine-tuned ones (Kev-27B, d3, pplx-decider v1.1, JEV-27B-VL, GEV-26B) screened at hosted Jev's level on the mail concepts, went 12/12 on the page chooser and scored 198–207 of 231 on JevBench (Jev 200).
  - Kev-27B, run in full, ties Jev on the sorter's ceiling (63.3% against 63.6%) and on wine with 38 questions (1.83 against 1.86), and beats it asking for the wine score directly (2.13 against 2.31).
  - The open models name the exact deadline class far more often: 59–66% against Jev's 43%.
  - The costs that remain: an 80 GB GPU per model, and speed that depends on the serving path (0.2–0.4 s per mail message for OpenJev, GEV-26B and Kev; 4–5 s for d3 and pplx-decider on their published NVIDIA path).
  - The one model without decision training (OpenJev, a frozen DiffusionGemma) trailed all of them.
  - Details: the site's [Open weights caught up](https://robgruhl.github.io/jev-learnings/open-weights.html).

- **Hosted is stronger on judgment.** Some failures are shared across models, which means the phrasing is at fault, not the model.
- **The local model is free but slow:**
  - 5–18 s per message, serial.
  - About 5.4 GB peak memory on a 24 GB laptop.
  - Uncalibrated probabilities.
  - Unbiased, but 16–28% more spread out than hosted.
  
  A combiner fit on one backend degrades on the other.
- **Hosted is fast and cheap:** about 20 messages per second with 8 requests in flight, and a few cents for hundreds of messages × several question sets.
- **A small general LLM was level with hosted Jev on mail and better on some single-ranker tasks.** It scored 0.941 against 0.799 when "obligation" was used alone as the act ranker. But:
  - Its probabilities are numbers it writes, not log-probabilities.
  - It isn't deterministic: on re-asks, a third of answers were identical, and yes-probabilities moved 0.10 at p90.
  - A frozen threshold near a decision boundary will flip.
- **Phrasing tuned on one model doesn't transfer reliably.** Re-grade per model.
- **Thresholds and features belong to a (model, runtime, rubric) triple.** Refit when any of them changes.
