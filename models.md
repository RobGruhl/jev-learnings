# Hosted Jev against other judges

All comparisons used the same tasks: concept AUCs on labeled mail and a "sorter" that files mail at a fixed number of missed actions.

| | Hosted Jev | Local open-weights Jev (4B) | 2B decider model | Small general LLM (low effort) |
| --- | --- | --- | --- | --- |
| Deadline (best question AUC) | **0.980** | — | 0.932 | 0.964 |
| Payment failed or ending | 0.997 | — | 0.984 | 0.995 |
| Waiting on a reply | 0.986 | — | 0.973 | 0.986 |
| Sorter filtered | **58.9%** at 1 miss | 46.8% at 0 misses | 44.1% at 1 miss | 57.1% at 2 misses |
| Routine-ness | 0.911 | 0.865 | | |
| Matching an open record | 0.980 | 0.955 | | |
| Resolution of a record | 0.933 | 0.873 | | |

## Notes

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
