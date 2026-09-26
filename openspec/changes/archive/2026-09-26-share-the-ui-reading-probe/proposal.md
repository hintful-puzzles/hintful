# share-the-ui-reading-probe

**Status: done, 2026-09-26.** Found while writing
`select-or-drag.test.ts` (2026-09-22, `own-the-select-or-drag-gesture`): the new
guard hit two sweep hazards in a row, and both were already solved — in a helper
it could not use.

## Why

`engine/testing/input-probe.ts`'s `probeBoard` answers the two questions every
cross-game behavioral sweep has to answer, and answers them right:

- **the board is dealt from a fixed seed**, so a failure names the same board
  every run;
- **`reset()` deals the id again** rather than calling `restartGame`, which
  replaces the board but **keeps the `Ui`**.

What it does not offer is the `Ui`, and a sweep that asks about a `Ui` field —
a highlight, a mode, a drag — has to read one. So the two sweeps that do have
each built their own midend instead, and neither inherits either answer:

| sweep | harness | board | reset |
| --- | --- | --- | --- |
| `input-parity.test.ts` | `probeBoard` | fixed seed | deals the id |
| `puzzle/shortcuts.test.ts` | `probeBoard` | fixed seed | deals the id |
| `engine/drag-cancel.test.ts` | its own `midendAndUi` | **`m.newGame()`** | **`restartGame` ×4** |
| `engine/select-or-drag.test.ts` | its own `member` | fixed seed | deals the id |

That is `AGENTS.md` § "Convention over configuration" exactly: two files
re-implementing one piece of bookkeeping, and the one written without having
been bitten got it wrong. *"A consistent idiom is not the finish line; the
framework owning it is."*

## The one live defect, and the one latent hazard

**Live: `drag-cancel.test.ts` deals a random board on every run.**
`docs/games/testing.md` § "Seed-deterministic, never clock-gated" says *"Drive
generation from a fixed seed (`randomNew("…")`) so the work and the verdict are
load-independent."* A cross-game guard that can pass on one deal and fail on
the next is the intermittent-failure shape, and its failure message names a
board nobody can reproduce.

**Latent: its `restartGame` loop.** Stated precisely so the next reader does not
inherit an overclaim — this is **not** a bug today. The only `Ui` field that
file reads is `GridDrag.live`, and the engine cancels every drag on a state
replacement, which is the behavior the test exists to assert. So the leak is
neutralized by the mechanism under test. It bites the day someone reads a
cursor, a mode or a held selection there, which is what happened in
`select-or-drag.test.ts`: a highlight left showing by one probe point answered
for the next and reported 20 inert repeat taps in Crossing, a game with no such
defect.

## Recommended fix

Give `probeBoard` a lazy `ui()` reader — wrap the game in a `redraw` spy and
return the `Ui` the midend actually handed out, which is the pattern both files
already use and the only way to read it without opening the midend up. Then move
`drag-cancel.test.ts` and `select-or-drag.test.ts` onto it and delete both
private copies.

Reading the `Ui` off the `redraw` the probe already does costs nothing, and the
spy is the honest reader: it sees the state the frontend would have painted
from, rather than a field a test reached in and took.

## What to check while doing it

- **Prove the new determinism.** Run `drag-cancel.test.ts` twice and diff the
  failure output after planting a defect — a fixed seed is only worth having if
  the *message* is stable too.
- **`drag-cancel`'s `moveCount`** comes from its `setCallbacks` notification, so
  the shared probe needs to expose it or the file keeps that much of its own.
- **Do not widen `probeBoard`'s cost.** `ui()` must stay lazy: `input-parity`
  and `shortcuts` sweep hundreds of points and must not gain a redraw each.
- **Check whether anything normative moves.** This may be purely a helper's
  shape, in which case it stays out of the specs and `docs/games/testing.md` §
  "How a cross-game guard finds its population" gains the sentence instead.

## Tasks

- [x] 1.1 Decide whether this is spec-visible or a helper's shape; `.openspec.yaml`
      assumes the latter until checked. *A helper's shape: no spec names
      `probeBoard`, either private copy, or how a sweep resets (2026-09-26).*
- [x] 1.2 Add the lazy `ui()` reader to `probeBoard`. *Also `moves()`, from the
      notification `drag-cancel` counted with, and a `preferences` option, which
      `select-or-drag` needs applied before the deal.*
- [x] 1.3 Move both sweeps onto it; delete `midendAndUi` and `member`.
      *`member` survives as a four-line reader of the highlight over
      `probeBoard`, not as a second midend. `select-or-drag` now deals from the
      shared `parity-` seed instead of its own, and still reaches the sticky
      carve-out on every member. `drag-cancel` keeps `restartGame` where the
      replacement is the thing under test, and resets between probe points by
      dealing the id.*
- [x] 1.4 Plant a defect in each moved sweep and watch it still name the right
      game — a harness swap that silently narrows a sweep is the failure this
      change would otherwise introduce. *Dropping `cancelDrags` in
      `stateReplaced` failed both drag tests naming Boats. Dropping the
      repeat-tap deselect in `note-taking-cell.ts` failed rule 1 naming all
      thirteen members. Two runs of the planted suite gave byte-identical
      failure output.*
- [x] 1.5 Say in `docs/games/testing.md` that a sweep resets by dealing the id,
      never by `restartGame`, and why. *§ "How a cross-game guard finds its
      population", rule 8.*
