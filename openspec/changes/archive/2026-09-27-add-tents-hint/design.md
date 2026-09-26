# add-tents-hint — design

## D1. The link question: a notation, measured and chosen by the owner

The solver ties each tent to a tree as it goes (`links`), and three rungs read
the pairing: grass "beside no *unmatched* tree", a tree's candidates "blank or
an *unattached* tent", and the diagonal pair built on those candidates. The
player could draw no link. So rule 6 asked, as in Pearl's D1, whether any
conclusion ever needs a pairing the board does not show.

**Measured** (scratch census, 2026-09-26: 100 boards each at 8x8, 10x10 and
12x6 and 40 at 15x15, both tiers, each solved at its own tier by variants of
the ladder that rebuild the links before every rung):

| links kept | 8x8 | 10x10 | 15x15 | 12x6 |
|---|---|---|---|---|
| none | 92–93% | 84–88% | 45–63% | 85–86% |
| readable at a glance | 98–99% | 96–99% | 90% | 97–98% |
| glance, chained twice | 99–100% | 100% | 98–100% | 100% |
| chained to a fixpoint | 100% | 100% | 100% | 100% |

"At a glance" is one reading deep: a tent's tree when it is the only tree
beside the tent, and a tree's tent when the tent is the tree's only square that
is blank or a tent. Chaining re-reads with the links just found, which is what
the solver's `tent-link` rung does. No variant ever reached a wrong board.

So the pairing is needed, on up to one board in ten at 15x15, and needs only
short chains. The owner chose the notation over gating the generator on the
glance reading (2026-09-26), and during playtesting asked that joining a tree
to a blank square place the tent in the same action, and that the hint use it.

## D2. The notation

- **State.** `links`, per square the direction of its partner, only ever a tent
  and an orthogonal tree, always both ends. A `link` move *sets* (`on`) rather
  than toggles, so a replayed hint move is harmless. Joining a tree to a blank
  square places the tent. A square that stops being a tent lets go; a solve
  clears every link; the win condition never reads them. Old saves have no link
  moves and replay unchanged.
- **Input.** A left drag between a tree and the tent or blank square beside it,
  either way. Upstream's left drag meant only "a click at the start", so the
  gesture was free, and a wobble between two non-pairs keeps that meaning. `L`
  then an arrow is the keyboard's form, the Pegs shape (arm, then the arrow
  acts); `L` binds no app shortcut.
- **Rendering.** A thin ink line across the shared grid line. The first cut was
  a bar in the trunk's brown, which the owner found read as more trunk when the
  link ran up or down through a tree; a knot on the line was tried and dropped
  at their request. The hint's link is the same line in the action color, and a
  wrong one takes the mistake color.
- **`findMistakes`** vouches for links, since the hint reads them as facts. The
  solution's tents are unique but its pairing need not be (two trees and two
  tents round a square pair either way), so a link is wrong when no pairing
  holds it together with the links before it in reading order, found with the
  engine's bipartite `matching`. Judging links one at a time would pass two that
  exclude each other.

## D3. The recording projection: the solver's rungs, links read afresh

Threaded behind `if (rec)`, as Pearl and Magnets: the generator's path is
byte-identical, and `tents-ladder.test.ts` and the frozen differential pass
with one edit, listing the new rung.

- **One premise per firing.** Each sweep returns at its first premise on the
  hint path. The grass rungs group what one sentence covers: every square
  beside no tree at all, the squares beside one tree whose trees all have
  their tents, the open squares round one tent.
- **`tree-link` split out of `tree-single`.** Upstream ties a tree to a tent
  already beside it inside the sweep that places tents. As a rung of its own it
  can be narrated, and the ladder test proves the split concludes the same.
- **Before every firing the links are re-read** (`TentsBoard.readLinks`): the
  links drawn, plus those readable at a glance given them. So no firing rests on
  a pairing the solver tied and the board does not show.
  `tents-hint.test.ts` holds every firing's snapshot to that reading, and
  leaving the reading at the first firing turned it red while the
  finish-every-board test stayed green (Pearl's finding, again).
- **A link beyond the glance is a step that draws it, and only when a step
  rests on it.** The hint ladder is the solver's square-placing rungs in its
  order, with the two link rungs replaced by `drawLinkFor`: draw the first
  pending link after which a rung that stalled fires. First the near rungs,
  before the line counts are tried, then any. If no single link unlocks
  anything, the first is drawn anyway, since a two-link chain is still one the
  solver follows. The test holds the claim: the firing after a link-only step
  could not have fired before it. Drawing the first pending link turned it red.
- **A tree's single open square is placed joined** (D1's playtest request): the
  step's move is the link gesture's, and the working board draws the link.

## D4. The line counts: two cases, and a proof there is no third

`line-count` enumerates every placement of a line's remaining tents, and the
proposal expected a general "whichever way they fit" narration. There is none
to write. A run of `n` open squares holds at most `ceil(n/2)` tents that don't
touch, and while the line needs fewer than its runs hold, any run can go one
short, so no square is a tent in every placement and none is empty in every
one. The rung can therefore fire only with the count met, or with no spare
room, where each odd run is filled alternately and the squares between are
grass. (A tent already in the line has grass round it by then: that rung runs
first.) The general arm was written, never fired on 190 boards, and was then
replaced by a throw with this argument beside it.

Classification (`solver-and-generator.md` § "Check, Tactic, Search"): both
line rungs read one clue over one line, with no hypothesis and no fixpoint.
They are direct deductions, narrated directly. `line-neighbors` is the Tricky
one and keeps "wherever this row's tents go, one touches each of these squares
beside it".

`tree-diagonal-pair` keeps its place before the line counts: it is the more
local of the two, and its sentence is shorter than any count.

## D5. Narration and picture

Every sentence is in `hint-text.ts`, all at most 120 characters. The ringed
squares are what the step decides; the outlined ones what it reasons from (the
tree, a tent that belongs to another tree, a tree's tent); the counted line is
hatched with its clue in the action color, as in Magnets. Where a step outlines
squares and rings one, the sentence names the ringed one ("the ringed tent"),
never a bare "here".

A step that decides tents and grass together (no spare room) is one journey of
two legs, the grass leg continuing the tent leg.

## D6. Refactor as you go: `engine/hint-track.ts`

Tents' `hintKeepTrack` is the same algorithm as Pearl's and, with the changes
taken from the move rather than a board diff, Pattern's: every element the move
changed must be one the step asks for, set that way; nothing changed is off;
the step shrinks to the targets that do not yet hold. A survey of every game's
keep-track found only those two near-verbatim; Singles, Lightup, Filling and
Tracks do the same shrink from the move's ops and would fit the helper too, and
were left to adopt it when next touched. `trackTargets` owns the policy; each
game supplies the changes, the key, the wanted value, whether a target holds,
and rebuilds its own shrunk move. Pearl's and Pattern's tests pass unedited.

Declined: sharing the line enumeration with Pattern. Pattern's line solver
places runs of given lengths; Tents' places single tents that may not touch.
The two have only "enumerate and intersect" in common, and D4 showed Tents does
not even need the intersection to narrate.

## Cost

`src/games/tents/` runs in about 7 s; the hint tests in about 5 s.
