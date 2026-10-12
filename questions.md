# How to phrase questions for Jev

Evidence: a personal inbox, studied over several months of held-out windows. Concept labels were made blind and graded per question with AUC against each question's own concept. Jev's answer shapes: **Choice** (a distribution over named options), **Noul** (a yes-probability for a proposition) and **Score** (a position on a scale).

## What Jev judged well

| Concept | Best question shape | AUC (hosted) |
| --- | --- | --- |
| An action with a deadline | Contrastive Choice: deadline / event / offer / informational / none | 0.980 |
| A payment failed or a service is ending | Contrastive Choice (an exact Noul was nearly as good, 0.993) | 0.997 |
| Someone is waiting on a reply | Contrastive Choice | 0.986 |
| An unexpected future charge | Surprise framing | 0.96 |
| This message concerns the same matter as an open record | Noul on the pair | 0.980 |
| The new message resolves the open record | Noul on the pair | 0.933 |

## What it can't do

- **Measure.** Score ranks but doesn't size: Spearman 0.28 on amounts, 0.15 on time-to-deadline. Extract the parts and do the arithmetic in code.
- **Know what isn't in the message:** who is known, what is open, what the human has ruled. The worst misses were all of this kind. Code has to supply those facts.
- **Route over a weak taxonomy.** A 9-way area Choice was 60–65% top-1 on every model tried, so the taxonomy was the problem, not the model.

## Phrasing rules

1. **Prefer a Choice whose options name the near misses.** It was the best single question on every concept tested. Describe `none` well: with a vague `none`, accuracy on true negatives was 50%.
2. **Exact Nouls are the best calibrated.** One exact payment Noul had 88% precision at 0.5. Use them where a threshold has to mean something.
3. **Abstract wording ranks but over-fires.** "Involves a deadline" averaged 0.31 on negatives. It fails outright when the abstraction changes the concept: "personal" isn't "someone is waiting" (0.744).
4. **Consequence and surprise framing depends on the concept.** It won for hidden charges and waiting-on-reply, and lost for deadlines and payment failures.
5. **Don't decompose a concept the model already grasps.** Surface-fact sub-questions lost by 0.03–0.08 AUC. Decomposition fits conjunctions of checkable facts, such as spam signals.
6. **Grade every question against its own concept first.** One question looked like chance against the target label but scored 0.89 against its own concept. It was a good question pointed at the wrong target.
7. **Plain propositions beat custom true/false criteria.** Custom criteria made one Noul fire at about 0.9 on noise and another read about 0 on invitations.
8. **Batching is free.** Send every question in one request and the shared state once. With a shared-prefix cache on a local model, six questions over about 10k tokens took 4.8 s instead of 16.9 s.
9. **Phrasing doesn't transfer between models.** Framings tuned on hosted Jev fell by up to 0.20 AUC on another model. Re-grade any phrasing ladder per model.

## In an agent loop

- One flat Choice over many activities came back flat (top probability ≈ 0.2), with nothing to act on. One narrow Score per option, combined in code with explicit weights, gave a stable ranking.
- Let Jev judge *which target matters* and let code derive the step from data. Jev never plans a chain.
- Jev can be a step-chooser for web pages. Given an accessibility snapshot, one request per page picked the page state and the next control: 25 of 25 fixtures, against a keyword baseline's 18, and 8 of 8 pages built to break keywords (baseline: 1). Code kept perception, execution and verification.
