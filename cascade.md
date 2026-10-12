# Jev inside a tiered cascade

Evidence: an agent playing Melvor Idle through a browser over four sessions. That's several hundred logged Jev ticks and about 60 logged escalations, each with its detail and resolution. Jev cost under $0.10 per overnight session. The game is the testbed; the lessons apply to any system where cheap judgments sit between code and an LLM.

## 1. Jev's escalation checks

Jev answers two checks every tick: `novel_situation` (asked inside the decide call) and `doubt_action` (a separate verifier call on the chosen action). Either one above 0.7 escalates to the LLM.

- **High doubt is usually right.** Every firing above about 0.75 pointed at a real problem:
  - A plan to farm a 2%-per-kill drop for a bow (about 1,000 arrows on average).
  - A sell-every-tick churn.
  - A planner choice to fight a level-27 monster for a 4.5% drop to train an unrelated skill, at 0.84.
- **The separate verifier earns its call; the in-call novelty check rarely does.** Novelty sat in a 0.3–0.5 band almost all the time.
- **Bugs sit in the 0.5–0.7 band, under the gate.** A purchase loop crept up to 0.64 over repeats. A fight with zero arrows sat at 0.60. A fixed gate tuned to stay quiet hides exactly these. Worth trying: a watch band reviewed at the next LLM wake, and escalating on doubt that rises across repeated identical decisions.
- **Repeated sub-threshold doubt on the same pick points to a context conflict.** Jev picked the same training target three times at 0.60–0.63 doubt and never escalated. The cause was a playbook line ("prefer magic monsters") that conflicted with the only safe option. Adding the safety condition to that line brought doubt down to 0.51, then 0.46.

## 2. What Jev cannot see: planner gaps

The biggest single lesson from the fourth session: **most bad plans reached the LLM with Jev at low doubt (0.27–0.35).** Jev judges the options it is given. When the planner offers only bad options, Jev confidently picks the best bad one. Examples, each fixed in code:

- **Checked one craft, not the whole run.** 36 Feathers passed a "can craft at least once" test, so the restock rule never ran, and the plan made 30 arrows instead of 300.
- **Short input, batch skipped.** 90 Arrowtips for a 300-arrow batch: the planner crafted 90 and started a short fight, instead of making the short input first.
- **Off-by-one threshold.** 51 Feathers sat one above a restock threshold of 50 and missed the restock.
- **Fixed buy size.** Restocks bought a fixed 300 when the run needed 1,000, which meant buy → craft → buy cycles.
- **Leftovers as a run.** Training took the "best makeable" recipe even when the leftovers covered one craft: 4 helmets, then 1 arrowtip batch, each a full tick.
- **Wrong metric.** The planner ranked training recipes by XP per material and ignored gathering time. It chose about 100 minutes of mining when 30,000 ore for an almost-as-good recipe sat in the bank.
- **Wasted damage.** The Ranged training target was hardcoded. With better gear, most of each hit was lost to overkill on an 80-HP monster: 41 damage per arrow, against 51 on a 250-HP monster at the same safety level.

So the LLM tier has to **audit the plans, not only the doubt scores.** Each finding goes into the planner as a rule with a comment naming the case that motivated it.

## 3. Lower-tier verification is the weak joint

- **Check outcomes, not starts.** `verify()` once checked that an action started. With a full bank, the game silently discarded every product, and verify called it ok.
- **Accept deliberate stops.** Later, `verify()` treated every planned stop of a fight (the target count reached) as a failure, because a fight has no product to count. Each tier can only escalate what the tier below reports, and false failures train you to ignore it.
- **Make interfaces fail loudly.** A gold-versus-cost gate in the decision layer read a field the observation layer never sent, so the cost read 0 and the gate always passed.
- **Watch for stale copies.** The page cached the milestone file. When the LLM appended a new chapter, the status view reported "no milestone" until the next refresh. Refetch whenever an empty answer is implausible.

## 4. Promote questions to code when the answer is computable

- Jev rated "equip a free upgrade into an empty slot" under 0.7 every time. The answer is never worse than nothing, so it became a code policy.
- Jev rated spare copies of worn gear as "possibly useful", so the bank filled up. "Surplus gear under bank pressure" became a code policy.
- Picking the training monster is arithmetic once you can compute damage per arrow against monster HP, with a safety cutoff. It moved to code.

Rule of thumb: **Jev for judgments without a computable answer. Code the moment a question has one, or Jev's error has a fixed sign.** Code policies ended up running roughly a fifth of ticks.

## 5. Every escalation ends with a lower-tier change

When the LLM resolves an escalation, the resolution is a change that stops the same escalation from recurring:

| Escalation | Push-down | Effect |
| --- | --- | --- |
| Selling XP-crafted gear (doubt 0.74) | Playbook: "gear crafted only for XP is surplus" | Next time 0.35 |
| Selling an obsolete ammo tier (novelty 0.71) | Playbook: "older tiers are surplus once the better one is worn and the standing goal names it" | Selling old armor next time: novelty 0.35, no escalation |
| Doubt 0.63 on the same safe pick, three times | Playbook safety condition | 0.51, then 0.46 |
| Rare-drop training plan (doubt 0.84) | Code: training never relies on rare drops | Next pick 0.41 doubt, no escalation |

Concrete milestones are also a strong lever. Against a paragraph-long goal, Jev's picks scored 0.3–0.5. Along a named milestone's recipe chain, they scored 0.85–0.96.

## 6. LLM wakes are the scarce resource

In a long-running loop the expensive thing is the LLM waking up, not Jev or game time. Each "do a small thing, then stop" cycle costs a Jev tick and an LLM wake. What reduced wakes:

- **Size batches to the remaining need.** A fixed batch of 120 inputs meant about 12 rounds for one level target. Sizing the batch to the remaining XP (capped at 400) cut it to about 4.
- **Size restocks to the whole run.** One purchase of 800 instead of three of 300.
- **Size standing stock to the grind.** Raising standing ammo from 300 to 1,000 cut about 16 cycles to about 5.
- **Don't make trips for nothing.** Selling 1–2 gold of junk after every round cost a full bank trip. Junk now waits until the bank is nearly full, and the agent buys bank slots when gold is plentiful.
- **Wake on events, not timers.** A watcher prints one line per state change (idle, escalate, milestone, low HP, stale, hidden tab), and a 20–30 minute timer is only the fallback.

## 7. Safety goes in the fastest tier, and it must cover the gaps

- A 1-second in-page guard eats below an HP floor, flees on an empty quiver, stops recipes at target counts and collects loot. Before it existed, HP fell from 102 to 6 between two LLM wakes.
- **Guards need their own audit.** The eat guard ate only from the current food slot. With that slot empty under the floor it did nothing, and in this game a death destroys an equipped item. The fix: switch to the next slot with food, and flee only when every slot is empty.
- **Prevention belongs in the planner.** Before a long fight, equip enough food. Jev had chosen the fight with 34 food equipped for a round that needed about 60, while 200 sat in the bank.

## 8. Rules interact; state invariants per goal

- Independent policies, each correct alone, formed loops:
  - Buying feathers when arrows ran low, when the real block was arrowtips.
  - Selling surplus chaps while crafting chaps.
  Each fix narrowed a precondition.
- A global gate written for one goal ("a banked melee weapon counts as armed") later sent a ranged character into a fight with zero arrows. The invariant moved to the goal that needs it. **State invariants per goal, not globally.**
- A fix can break the next case. A batching rule rejected every purchase, including the one routine restock it needed. That was caught one cycle after shipping. **Ship small, then watch the next cycle**; the next tick usually shows the mistake.

## 9. The environment is its own failure class

No judgment tier catches these, so each needs its own signal in code:
- A background tab pauses the game.
- Clicks don't land when another tab is in front.
- The browser extension disconnects.
- An OS automation API reports no windows.

The page reports `hidden`, the watcher wakes the LLM on it, and the human is asked only when automation can't fix it. Over a long session the human tier was needed once.

## 10. The tier boundaries, as practice

- **Code:** anything computable, every safety reflex, and verifying outcomes.
- **Jev:** priorities among options and worth-it judgments, phrased narrowly and scored per option; code combines the scores with explicit weights. One flat Choice over 8+ activities came back flat (top ≈ 0.2). One narrow Score per option gave a stable ranking.
- **LLM:**
  - Audits plans as well as doubt.
  - Writes the milestones and playbook (the context Jev judges against).
  - Turns each escalation into a lower-tier change.
- **Human:** preferences and rulings, and environment failures that automation can't reach.
