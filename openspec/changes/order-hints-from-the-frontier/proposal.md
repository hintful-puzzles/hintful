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

So the rule is **contribution, not distance**: every step must expand a front,
advance a chain that a later step turns into an expansion, or open a new one. What is
banned is an **orphan** — a step nothing builds on that determines nothing itself.
Among the steps that qualify, expansions come before chains and the cheapest reasoning
wins among equals, which is where a chain of easy deductions replaces a single hard
one.

## What changes

- **The engine orders the plan.** `deduceHintPlan` gains an optional
  candidate-enumeration step: where a game can offer the firings available at the
  current difficulty band, the engine picks among them rather than taking the first.
  Games that do not offer one keep today's order exactly.
- **A step must contribute, and then be cheap** — it expands a front, advances a chain
  that later expands one, or opens a new front; among those, expansions first and the
  cheapest reasoning among equals. The frontier is the boundary between what the board
  already determines and what it does not, measured from the **board**, never from the
  player's move history or from what the app last displayed, so the plan stays a pure
  function of the position. For Loopy this inverts the tier sweep's role: it escalates
  when nothing cheaper is contributing, rather than when nothing cheaper fires
  anywhere.
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
- **Not a general premise graph.** No shared read-set exists — `DeductionRecord.reason`
  is `unknown` so each game can attach its own, and `CandidateHighlights.area` is a
  paint list, not a fact set. "Advances a chain" is therefore exact only where a game
  already records premises (Loopy's note-fact `closure`) and a proxy over a firing's
  *writes* elsewhere, which is what task 1.4 measures before the proxy is trusted.
  Retrofitting read-sets across the collection is a separate change.
- **Not the generator.** Which boards exist is untouched; the solve path keeps
  first-firing-wins.
