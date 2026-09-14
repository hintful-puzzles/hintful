# add-loopy-hint

**Readiness: stub, scaffolded 2026-09-14, not started.** The facts about Loopy
below were read against the code on 2026-09-14 to write this, and each is
dated for that reason: re-take them before building on one (task 0). Nothing
here chooses a design.

## Why Loopy, and why now

[`characterize-the-hint-assessment-corpus`](../archive/2026-09-09-characterize-the-hint-assessment-corpus/audit.md)
§ 3 set the assessment order: Tracks, Bridges, Seismic, and **Loopy** "should
follow the three rather than precede them". All three have shipped
(`add-tracks-hint`, `add-bridges-hint`, `add-seismic-hint`), so Loopy is next on
the audit's own list.

It is the right next hint, not the cheapest. The audit passed over Mathrax
because it would measure the Latin family a seventh time. Loopy measures three
things no hint so far has:

1. **A hint over a bespoke solver loop.** Loopy is off `runDeductionFixpoint`
   on purpose. Its `(thresholdDiff, thresholdIndex)` loop decides which rungs
   re-run, and the generator gates on the solver, so the loop order decides
   which boards exist (`solver.ts`'s header). `ts-engine`'s shared
   deduction-fixpoint requirement says a bespoke loop owes "every board it
   accepts remains walkable to completion by a hint projection", and records a
   vacuous obligation as **unmet**. `docs/games/solver-and-generator.md`
   § "What a bespoke loop still owes" records exactly that for Loopy. This
   change is what meets it. Lightup is the one met example, and it threads a
   recorder through its own `dosolve`.
2. **Marks on arbitrary planar geometry.** Loopy draws 18 tilings from
   `engine/grid/`: edges are `dot1→dot2` segments and faces are polygons of any
   order. Neither is a cell. Tracks and Bridges both concluded that where the
   decided element is not a cell, the mark is the game's own shape recolored
   (`docs/games/hints.md` § "Echo the move's shape in the hint color"). Loopy is
   the test of that rule on a board with no grid at all.
3. **A hint with no incremental redraw.** Loopy's `render.ts` clears and
   repaints every frame, with no tile cache and no diff key (a deliberate
   divergence, stated in its header). `OverlaySidecar` and the stale-overlay
   class that `add-seismic-hint` just closed exist for tile-cached games. What a
   hint needs on a whole-frame renderer has not been written down.

## What changes

- Loopy gains a `hint` meeting `AGENTS.md` § "Hint quality bar", written
  against today's machinery per [`docs/games/hints.md`](../../../docs/games/hints.md).
- The change reports the same numbers the last three did, in a `findings.md`:
  game production lines, how many of them are the deduction projection, the
  overlay, and engine lines. The Tracks, Bridges, Seismic and Galaxies columns
  are the comparison.
- `docs/games/solver-and-generator.md`'s bespoke-loop table moves Loopy's
  narratability row to met, or says why it cannot be. That row also calls a
  hintless Loopy "a gap against 'nothing may ship hintless'", which contradicts
  `AGENTS.md` § "Hint quality bar" ("a hintless game is not a defect"). Fix the
  sentence either way.

## Questions the hint has to answer (dated 2026-09-14)

- **Loopy has no `findMistakes`.** `index.ts` declares none. `state.ts`'s
  `checkCompletion` lights `lineErrors`, but those flag rule violations (a dot
  of degree above two, a stray component), not a line that contradicts the
  solution. That matters twice:
  - The shared refusal (`commonHintRefusal`) and the refusal overlay couple to
    `findMistakes` (`docs/games/hints.md` § "Refusal couples to the mistake
    overlay").
  - Seismic's shortcut, deducing from what the player has marked, is sound only
    when the mistake check vouches for every mark (`docs/games/hints.md`
    § "Deduce from the notes when the mistake check vouches for them").

  Adding a `findMistakes` is player-visible, because Check & Save would start
  highlighting Loopy. Decide it inside this change, per `AGENTS.md`
  § "Work management": ask the owner only if the right answer is genuinely
  unclear.
- **Rung versus premise.** The four rungs (`trivialDeductions`,
  `dlineDeductions`, `linedsfDeductions`, `loopDeductions`) sweep and apply
  many conclusions per call. Tricky is not a rung; it unlocks extra inferences
  inside `dlineDeductions`. `docs/games/hints.md` § "A rung is not a premise, so
  return per premise" is the rule. `linedsfDeductions` reasons over lines known
  equal or opposite, which a player cannot see on the board. Whether it
  narrates as a Check or a Tactic, or leaves Hard unhintable, is this change's
  version of Seismic's `attempt` question.
- **Cost on the largest boards.** Presets reach 10×10 on Penrose, Hats and
  Spectres. `hint-resume.test.ts` recomputes a hint after every move, so measure
  the hint on the largest preset of each tiling before deciding whether a plan
  cap is needed. Record the machine's load, free memory and swap alongside
  (`AGENTS.md` § "Test discipline").

## Engine refactoring: look for it, deliberately

This is the fourth hint in a row in the corpus. Seismic's came in at half the
cost of the three before it by reusing shared machinery whole, so the survey is
where the next halving comes from. Look before and while writing it, and take
what passes `AGENTS.md` § "Convention over configuration" and "Refactor as you
go". Places to start, all unverified suspicions rather than findings:

- **Recording through a bespoke loop.** Lightup and Loopy are the two games off
  the runner for a recorded reason. If both need the same "record a firing
  without changing the generator's path" arrangement, is that a layer below?
  Two copies are not the signal on their own; `add-seismic-hint` declined the
  single-firing driver at two.
- **Marks on `engine/grid/` geometry.** An edge-segment mark or a face-outline
  mark drawn from `GridEdge` and `GridFace` would serve any game built on
  `engine/grid/`. Take that population by reference (`npm run refs`) before
  extracting; a population of one is not a shared shape.
- **Clue-count narration.** Palisade (the exemplar) and Slant both narrate
  "this clue already has / still needs its lines". A face clue in Loopy is the
  same premise on a polygon. Apply the test in `AGENTS.md`: can a game
  legitimately want to word it differently? An exemplar hint never loses a word
  to an abstraction.
- **Loop-closure narration.** Loopy's `loopDeductions` forbids closing a loop
  early. Check whether Tracks' hint already says that, before writing it a
  second time.
- **A whole-frame renderer's hint plumbing.** If the answer is "nothing", say so
  in `docs/games/rendering.md`; that is a finding too.

The guardrails apply unchanged. Game-specific logic is never bent to fit a
contract. A declined refactoring gets its reason recorded. A refactoring large
enough to be its own coherent unit is scaffolded as its own change and landed
before or after the hint, never folded in silently.

## What this does not do

- It does not change which Loopy boards exist. The generator is solver-gated
  and its differential is frozen, so a hint that needs the solver loop to run
  differently must leave the generator's path byte-identical, or state the cost
  as a decision.
- It does not decide Mathrax, Rome, Ascent, Magnets or Slide. The audit's
  reasons for their order stand until someone re-takes them.
