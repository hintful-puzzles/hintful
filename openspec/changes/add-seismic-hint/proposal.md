# add-seismic-hint

**Readiness: stub, scaffolded 2026-09-13, not started.** Nothing about Seismic
itself was researched to write this; every statement about the game below is
the audit's, from 2026-09-09, and is a claim to re-take before building on it
(task 0).

## Why Seismic, and why now

[`characterize-the-hint-assessment-corpus`](../archive/2026-09-09-characterize-the-hint-assessment-corpus/audit.md)
§ 3 picked the hint corpus's assessment order: **Tracks**, then **Bridges**,
then **Seismic** "only if the first two disagree", with Loopy to follow the
three. Tracks shipped as `add-tracks-hint` and Bridges as `add-bridges-hint`.

Bridges' [`findings.md`](../archive/2026-09-12-add-bridges-hint/findings.md) § 5
closed the condition: on the deduction end the first two did **not** disagree.
It also found that the question Seismic would settle — where the
Check/Tactic/Search line falls for a one-ply trial rung (Seismic's `attempt`:
place a candidate, roll back, strike it if a region starves) — has become
*cheaper* rather than more urgent, because Bridges answered it for a rung of
the same shape.

So Seismic is next on the audit's own list, and it is the right next hint
rather than a formality: it is the last pick that still settles a general
question (whether a trial rung narrates as a Tactic, or leaves a tier
unhintable), and the owner's bar is that a hintless game gets its hint as the
way the framework is assessed.

## What changes

- Seismic gains a `hint` meeting `AGENTS.md` § "Hint quality bar", written
  against today's machinery per [`docs/games/hints.md`](../../../docs/games/hints.md).
- The change reports the same numbers Tracks and Bridges did (game production
  lines, of which how many are the recording projection; engine lines), in a
  `findings.md`, and says on which side of the Check/Tactic/Search line
  `attempt` falls and why.

## Engine refactoring: look for it, deliberately

This is the **third** deductive hint in a row written against the same
machinery, which is the point at which a repeated shape stops being a guess.
Before and while writing it, look for engine refactorings that would make the
next hints cheaper to write and the existing ones cheaper to maintain — and
take the ones that pass `AGENTS.md` § "Convention over configuration" and the
"Refactor as you go" guardrails.

What the two previous changes recorded, as places to start (read their
`findings.md`, do not trust this summary):

- **The recording projection was per game both times** — Bridges' was +377
  lines, and it wired "the single-firing driver, exactly as in Tracks"
  (`settled` / `beforeTechnique` on `runDeductionFixpoint`). A third copy is
  the signal to ask whether the driver belongs in the engine.
- **Bridges reported zero engine lines, and that none of `hint-mark.ts`
  transferred** because its elements are not cells. Whether Seismic's marks
  are cell-shaped tells you whether that was Bridges being unusual or the mark
  vocabulary being narrow.
- **Recurring hint plumbing** — refusals, `hintKeepTrack`'s shrink-in-place,
  the census over reason kinds, the overlay sidecar. If Seismic writes one of
  these a third time the same way, that is the layer below being wrong.

The guardrails apply unchanged: an exemplar hint never loses a word to an
abstraction, game-specific logic is never bent to fit a contract, and a
refactoring declined gets its reason recorded. A refactoring large enough to be
its own coherent unit is its own change, scaffolded here and implemented
before or after the hint — not folded in silently.

## What this does not do

- It does not change which Seismic boards exist. If the hint needs the
  solver or generator to change, that is a cost to state, not a side effect.
- It does not decide Loopy, Mathrax or Slide; the audit's reasons for their
  order stand until someone re-takes them.
