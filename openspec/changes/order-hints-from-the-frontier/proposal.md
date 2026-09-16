# order-hints-from-the-frontier

## Why

Playtesting Loopy 10×10 Hard at move 53 (owner, 2026-09-16), two consecutive hints
were a corner note on a `1` near the top of the board and then a deduction about a
`3` eight rows away: *"I'm somewhat confused at the hint phrasings, and their
sequencing … which again seems like the sort of thing that would apply to any 3."*

Two defects are stacked there, and only one of them is this change:

- **Sequencing, which is engine-wide.** A game's `hint()` takes the *first* firing
  of a fixed rung ladder and applies it immediately (`src/games/loopy/solver.ts`
  `nextFiring`; Keen, Solo, Salad and Seismic each hand-roll the same shape). The
  ladder has no notion of where the player is working, so consecutive steps
  teleport across the board. `src/engine/hint-plan.ts` `deduceHintPlan` never sees
  a candidate set, so nothing above the game can reorder.
- **Phrasing**, which is downstream and not in scope here. A sentence that states
  the technique rather than the fact that made it bite reads as boilerplate
  whatever order it arrives in.

The owner's first criterion (2026-09-16) was an image — deductions near *"the edge of
the fog of war"* — with one preference that survives the rest: *"if we really need to
apply a difficult deduction, let's do that sooner rather than later, but if we can
replace a single difficult deduction with a chain of easier ones, let's do that
instead."*

And, on being shown difficulty read as the primary key: *"No, that's not what I
meant. I don't want seemingly useless easy ones away from the action. What I want is
for you to prioritize work that directly expands the horizon."*

Asked to settle the opening of a board and whether a plan must stay on one front, the
owner gave the governing criterion: *"I want deductions to 'tell a story', where each
deduction either directly expands the front, or acts to advance a chain of deductions
that would eventually expand the front, or start a new front."* Jumping between
fronts is fine — *"I do that often myself"* — and the opening needs no special
handling, because with nothing determined *"everything is the horizon"*.

That states the intent, but it does not by itself discriminate between firings, and
section 1 measured why: every line firing settles an edge, so "expands something" is
true of all of them. A first instrument built on that reading reported 92.5% healthy
and would have concluded there was no defect (`findings.md`).

What the measurement does see is the symptom reported: **14.4% of steps land four or
more hops from the previous step**, tail 14–17 hops, which on a 10×10 board is a
traverse — about one hint in seven. And a note waits a **median of 15 firings**, worst
case **143**, between where the solver found the fact and the first step that cites
it.

So the rule is **continuity with an availability caveat**: offer the next step within
reach of what the plan just determined, leave that neighborhood only when nothing
there fires rather than because something elsewhere was found first, and take the
cheapest reasoning among the steps at hand. A step that continues from the last one is
advancing the same chain; a step that leaves while work remained beside it is the
jumping-around being complained of.

## What changes

- **The engine orders the plan.** `deduceHintPlan` gains an optional
  candidate-enumeration step: where a game can offer the firings available at the
  current difficulty band, the engine picks among them rather than taking the first.
  Games that do not offer one keep today's order exactly.
- **A step continues from the last one, unless nothing there fires** — and among the
  steps within reach, the cheapest reasoning wins. Reach is measured from the **board**
  and from the plan's own earlier steps, never from the player's move history or from
  what the app last displayed, so the plan stays a pure function of the position.
  Opening a new region stays allowed, and so does alternating between regions; what is
  not allowed is passing over an available step beside the last one. For Loopy this
  inverts the tier sweep's role: it escalates when nothing cheaper fires *where the
  player is working*, rather than when nothing cheaper fires anywhere.
- **Loopy adopts it** as the exemplar, since the tier sweep it already has supplies
  the band and the scattering is what the owner hit.
- **A note step sits beside the firing that cites it.** Loopy's `planSteps` groups
  notes by `tickOf`, the plan position where the solver *discovered* the fact, so a
  note can precede its consumer by many steps — which is why a corner note on a `1`
  reads as a disconnected triviality. Grouping moves to the earliest firing whose
  `closure` contains the fact, and the note joins that firing's journey.
- **A guard for sequencing.** `hint-resume.test.ts` asserts *progress* and would stay
  green through a completely incoherent order; ordering needs its own guard, seen to
  fail under a plant.

## Design questions to settle in `design.md`

- **What "near" means** in a game whose board is not a grid of cells — Loopy reasons
  over edges and dots, the Latin family over units rather than distance. Whether one
  engine-side notion covers both, or the game supplies the metric and the engine
  supplies the ordering.
- **Enumeration must not reach the generator.** The rungs' early return is
  load-bearing for generation cost (`docs/games/hints.md` § "A rung is not a premise,
  so return per premise"), so the enumerating mode has to be confined to the hint
  path, and that has to be measured rather than asserted.
- **Whether ordering can starve a technique**, leaving a rung that never fires
  because something nearer always wins, and whether that matters for teaching.
- **Where the band comes from** in games whose ladder has no explicit tier, as
  against Loopy's, which sweeps a tier to exhaustion before escalating.

## What this does not do

- **Not the phrasing.** Naming the fact that made a technique bite is a separate
  change, downstream of this one.
- **Not a general premise graph.** No *shared* read-set exists —
  `DeductionRecord.reason` is `unknown` so each game attaches its own, and
  `CandidateHighlights.area` is a paint list, not a fact set. Loopy's own premises are
  structured enough to yield an exact read-set (D1), so it adopts the rule in full;
  a game whose premises are not machine-readable supplies no metric and keeps today's
  order. Retrofitting read-sets across the collection is a separate change.
- **Not the generator.** Which boards exist is untouched; the solve path keeps
  first-firing-wins.
