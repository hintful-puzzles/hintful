# review-rect-hints-and-tiers

**Status: filed on the owner's word (2026-10-31)**, at the end of
`add-patches`' playtest: "go over all of these hints and the difficulty
level". Rectangles and its Patches ruleset share one hint and one tier
contract, so both are in scope.

## Why

Playing Patches 7×7 Easy on a phone, the owner was shown this step:

> Only the outlined ? can cross this edge, leaving the outlined square
> uncovered, so it must be a line.

They found it "really strangely phrased", and judged that "in any case it
doesn't seem to belong in Easy". The step is the `line` rung's "misses" case
(`rect/hint.ts`, `firingsOn`; words in `rect/hint-text.ts`, `crossings`): a
plain clue with no number, named "the outlined ?", is the only clue with
fits across an edge, and each of them leaves out a square only that clue
reaches.

## What to look at

- **The words of every rung on Patches' clues.** `clueName` names a clue by
  what it shows: "the 6", "the square 4", "the tall clue", "the ?". "The
  outlined ?" reads as a stray symbol in a sentence, and "leaving the
  outlined square uncovered" does not say why that matters (no other clue
  reaches it). The `fit` rung's "leave out some of its drawn rectangle" is
  new in `add-patches` too. Every rung's sentence on a Patches board is
  re-read against `docs/hints.md` and the hint quality bar.
- **What Easy is.** Easy is a board the rungs finish (`rungsFinish`), all
  five of them, cheapest first: `fit`, `reach`, `overlap`, `starve`, `line`.
  Upstream's Rectangles had no tiers past it. Patches hides sizes and widens
  shapes until the rungs barely finish (`stripClues` in `rect/generator.ts`),
  so an Easy Patches board leans on the dearer rungs more than Rectangles'
  does. Measured 2026-10-31 over eight Easy deals at each of 6×6, 7×7, 8×8
  and 10×10 (417 steps), the rungs' shares were fit 34%, reach 35%, starve
  17%, line 7%, overlap 6%. Whether Easy should be the first two or three
  rungs, with a middle tier for the rest, is the question; how a tier is
  decided is the engine's (`docs/solver-and-generator.md` § "A middle tier
  below Unreasonable", § "Difficulty tiers"), so a new tier is weighed there
  first.
- **The strip itself.** It hides every size and shape the tier allows, so a
  board shows few numbers and many plain `?` clues. The owner has not
  objected, but a tier change moves what the strip leaves; measure the clue
  mix again with it.

## What Changes

Whatever the review finds: rewordings in `rect/hint-text.ts`, a tier
contract for Rectangles and Patches with the rungs each tier allows, and the
generator dealing to it, with the spec, help page and tier tests to match.
Player-visible, so the session brings the owner the proposed tiers and the
reworded sentences before implementing.

## Acceptance

The owner's, in the running app.
