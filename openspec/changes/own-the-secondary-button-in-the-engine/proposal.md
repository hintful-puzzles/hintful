# own-the-secondary-button-in-the-engine

**Status: filed 2026-10-12 at the owner's word ("I really want this to be
consistently managed in the engine"). It waits on one answer, § "The question
for the owner". Every figure was measured 2026-10-12.**

## Why

Ten games have no use for the right button, and they say so in three
different ways, with three different results for the player.

**The census.** For each registered game, on a board dealt from its default
params, a secondary gesture (a click, a drag, a press held) was compared with
the primary gesture at the same place, at every probe point the input guards
use, alone, after a primary click, after a primary drag, and followed by a
primary click, a click on the next cell and a `1`. The observation is the
guards': the painted frame and the save.

| | Games | A mouse's right button | The bar's "Right click" toggle | A finger pressed on the board |
| --- | --- | --- | --- | --- |
| Declares `ignoresSecondaryButton` | Cube, Fifteen, Filling, Flip, Flood, Pegs, Sokoban | does nothing | absent | acts at once |
| Folds right onto left by hand (`asPrimary`) | Inertia, Slide | does what the left does | shown, and changes nothing | waits out the hold detection (350 ms or 8 px of movement); a hold then plays the secondary-press feedback for a press that is not one |
| Accepts any button (`isMouseDown`) | Untangle | does what the left does | shown, and changes nothing | as the row above |
| The secondary gesture differs from the primary somewhere | the other 47 | has a meaning of its own | shown | waits out the detection, as it must |

Inertia, Slide and Untangle came out the same as the primary in all 25,776,
20,448 and 18,720 comparisons. Each of the 47 differed at a point the census
names, which is proof for those; for the three it is every point sampled on
one board, and their code says the same (`asPrimary` in both, and Untangle
tests the button's class and never the button).

**Why the guard did not see it.** `input-parity.test.ts` holds the flag to
"declared exactly when the secondary gesture changes nothing a player can
perceive" (`secondaryMeaning`, `engine/testing/input-probe.ts`). A right
click that does what a left click does changes something, so the three count
as using the button, and `docs/input.md` § "A touch hold arrives as the right
button" gives the fold as one of four sanctioned ways. The question a player
would ask is the other one: does the right button do anything the left does
not? Inertia's and Slide's folds were written before the flag existed
(`asPrimary` 2026-08-26 and earlier; the flag in e18d7928 the same day, for
seven other games), and nothing has asked since.

## What Changes

- **One declared fact, consumed by the engine**: a game with no secondary
  action says so, and the engine does the rest in every such game the same
  way: no hold detection, no toggle in the bar, and one answer for a mouse's
  right button (the question below).
- **The games stop handling it.** `asPrimary` leaves Inertia and Slide, and
  Untangle tests the primary button like any other game. The second and
  fourth ways of `docs/input.md` § "A touch hold arrives as the right button"
  are reread against that: a fold by hand is no longer one of them.
- **The guard asks the player's question**: a game declares the fact exactly
  when no secondary gesture differs from the primary one. The census above is
  that probe; it ran over all 57 games in 69 seconds without stopping early
  for the ten, and is to be seen failing on Untangle before the fix.
- **The flag is renamed if its meaning moves** (it would read "has no
  secondary action", not "ignores the button").

## The question for the owner

**In a game with no secondary action, what does a mouse's right button do?**
Today it does nothing in seven and the primary action in three. Managed in
one place it is one or the other:

| | A right click | What a player notices |
| --- | --- | --- |
| **Fold (recommended)** | does the primary action, in all ten | In Cube, Fifteen, Filling, Flip, Flood, Pegs and Sokoban a right click starts doing what a left click does. Nothing changes on a mouse in Inertia, Slide and Untangle. |
| **Drop** | does nothing, in all ten | In Inertia, Slide and Untangle a right click and a right-button drag stop working. Nothing changes in the seven. |

Either way, Inertia, Slide and Untangle lose a toggle that did nothing and a
finger's press acts at once, which is the gain.

The recommendation is the fold: no player loses a gesture they have, a game
with one action has no reason to refuse it on the other button, and the
engine can fold before the game is asked, so a game with no secondary action
never sees a right button and cannot grow a branch for one unnoticed. The
cost is that a stray right click in Flood or Fifteen makes a move where it
made none; Undo takes it back.

## Also: the right button is the cross

Moved here 2026-10-15 from `own-what-starbattle-wrote-for-the-engine`, item
5, since it is a second fact about the same button. Star Battle shipped with
the cross on the left button and was turned round on the owner's first play.
The rule is in `docs/input.md` § "Targets and verbs", and nothing holds a
game to it. The engine could: a `ruledOut` verb a game declares in place of
`secondary`, which the model puts on the right button and Space, whose
`does` phrase and cross it supplies, and which a guard can then find.

Counted 2026-10-15 from each registered game's `targetVerbs.secondary.does`:
of the 28 games that declare target verbs, the right button marks a square
as ruled out in 12 (Black Box, Boats, Dominosa, Light Up, Loopy, Palisade,
Range, Separate, Spokes, Star Battle, Tents, Tracks), in their own words and
with their own mark: a cross, water, grass, a faint line, "unused". In 4 it
starts the left button's cycle from its other end (Bricks, Clusters, Mosaic,
Pattern), and in the rest it is a move of its own: a flag (Mines), a circle
(Singles), a turn (Net, Twiddle), a value (Magnets, Slant, Sticks, Subsets,
Unruly). Galaxies and Flip and Flood have none. Whether the 12 should share
one declared verb, and its words, is this change's to settle after the
question above.

## Capabilities

None at filing; see `.openspec.yaml`. The work modifies `engine-input` ("A
game with no secondary meaning is not given a synthetic one", "The
secondary-button declaration is held to the behavior", "A secondary meaning
is derived from what the player can perceive") and `ts-engine`, and the specs
of Inertia, Slide and Untangle where they state the fold.

## Impact

`src/engine/game.ts`, `src/engine/midend.ts`, `src/engine/testing/input-probe.ts`,
`src/engine/input-parity.test.ts`, `src/puzzle/components/view-interactive.ts`
and `bar.ts`; `src/games/{inertia,slide,untangle}/`; `docs/input.md`; the help
pages where one mentions the right button.
