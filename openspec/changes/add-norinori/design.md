# add-norinori: design

## Before you start

- **Rules, confirmed** against janko.at's Norinori page (2026-11-16): every
  region holds exactly two shaded squares; shaded squares form dominoes,
  regardless of region borders; two dominoes do not touch along a side,
  only at a corner. "Each shaded square touches exactly one other along a
  side" is the same rule stated per square, and is how the description
  states it (`shape`). puzz.link's rules page serves no text to a fetch.
- **No upstream.** Nothing to triage, no `encode_params` forms to keep, no
  editor letters. The desc is new: the regions as `engine/wall-runs.ts`
  writes them, Star Battle's form. What stands in for an oracle is the
  generation property test: every dealt board needs exactly its tier, and
  the ladder finishing a board proves one answer.
- **Interface risks** (`docs/new-game.md` § "Before you start"): the board
  is fixed at the deal, so no `supersededDesc`; no move comparison of the
  game's own; nothing printable.

## Decisions

- **Written description-first.** The description was written before any
  TypeScript, and its compiled module is the ladder, the answer check and
  every word the hint says (`STATED`). The game has no `hint-text.ts`.
- **Star Battle's shape for the board, the deal and the hint; the
  skeleton's for input and the shaded piece.** Regions on the four region
  fills inside heavy walls; the left button shades, the right crosses out,
  each cycling through the other; no "rules out" play aid (Star Battle's is
  its own, and the proposal's input model is a shading game's).
- **Tiers Easy, Normal, Tricky**, the collection's names. Easy: one domino,
  one square or one region at a time. Normal: a region whose other open
  squares cannot take its shaded squares (`fits`, a bounded filling over
  the region). Tricky: a square tried shaded, with the squares that
  immediately rules out (`ruled`), leaving a region without room.
- **The deal**: dominoes at random, one for every five squares. Some are
  *closed*, dealt as a region of their own two squares (one in two at Easy,
  three at Normal, four at Tricky, and never more than a third of the
  regions, or the Easy boards that come right are mostly givens); a region
  is grown round each other
  shaded square (`growFromSeeds`, with the closed squares set `aside`) and
  joined in twos (`mergeToCount`, no region past 1.6 times the mean); then
  `mendDivision` with the dominoes fixed, Star Battle's judge. Every other
  region is at least three squares. Measured 2026-11-16, each step against
  the one before:
  - Smallest region three, no closed dominoes: no Easy rung has a first
    step on an empty board; 0 of 6,291 mends on 6x6 Easy succeeded.
  - Smallest region two: the mend makes the two-square regions itself, and
    an 8x8 Easy board took 3,000 draws, a Normal 8,000.
  - Closed dominoes merged from single squares: fast, but one region took
    every clear square left over, and 7 of 12 regions were two squares.
  - Grown regions round the closed dominoes, then the size cap: the boards
    the mend gave up on had stalled with more than 20 of 64 squares open
    under the whole ladder, in regions of twelve and more.
  A two-square region is how a Norinori board opens; a large one says
  nothing.
- **`growFromSeeds` takes cells set `aside`** (`engine/divide.ts`), which no
  region grows into and are left a region each for the game to join. The
  alternative was a growth of Norinori's own, and the doc's table says a
  game keeps a division of its own only where its rule cannot be said in
  the engine's.
- **No trial that strands a lone shaded square.** `orphan`, a Tricky trial
  that rules out every partner a lone shaded square has, was stated, sound,
  and dropped: the hint reached it at none of 1,746 positions on 96 boards,
  `crowded` and `claimed` deciding its square first, and the solver needed
  it on about one deal in a hundred.
- **The ladder grew from the boards.** `claimed` (Easy) and `blocked`
  (Normal, the converse of `neededRegion`) were added where measured
  boards stalled, and `fits` was made to ask that each shaded square keep a
  square it can pair with, without which `neededRegion` read a lone shaded
  square in a corner as room.
- **Region walls are the engine's** (`engine/region-walls.ts`), moved out of
  Star Battle's renderer, which Norinori would otherwise have copied.
- **Star Battle's "first click on the way to the other mark" keep-track
  override is not taken.** It is Star Battle's alone; Norinori uses the
  engine's `hintKeepTrack`, as the skeleton does.
- **The menu is 6x6 at every tier, and 6x8 and 8x8 at Easy** (`state.ts`,
  with the times). The 6x8 is there because a game that takes rectangles
  offers them (`engine-params`). The larger sizes and harder tiers are Custom's wait, and making
  them quick is `norinori-larger-boards`.

## What the session records

### Hand-written lines, against Star Battle's (2026-11-16, non-blank)

| File | Norinori | Star Battle |
| --- | ---: | ---: |
| description | 204 | 352 |
| `state.ts` | 173 | 227 |
| `solver.ts` | 134 | 237 |
| `hint.ts` | 61 | 89 |
| `generator.ts` | 282 | 240 |
| `render.ts` | 285 | 297 |
| `index.ts` | 224 | 268 |
| `hint-text.ts` | none | none |

Star Battle's `render.ts` is counted after the walls moved out of it (34
lines fewer). What Norinori writes in TypeScript besides the description is
the board's shape (state, render, input) and the deal; the deduction, the
answer check and every hint word are the description's. The generator is
the one file longer than Star Battle's, and it is where the session's time
went.

### Where the engine made the game say something not about Norinori

- **Region walls** were Star Battle's renderer's own; mended, moved to
  `engine/region-walls.ts`, Star Battle's frames byte for byte unchanged.
- **`growFromSeeds` could not leave cells out**; mended, it takes cells
  set `aside`.
- **Each technique is paired with the dealt clues by hand** in
  `solver.ts`: `compiledRung(norinori.x, dealt)` or `uncluedRung(norinori.x)`,
  eleven lines saying only which techniques read the regions, which the
  compiled module knows. Every described game writes the same (45 games,
  2026-11-16); filed as the engine's, `pair-compiled-rungs-in-the-engine`.
- **A hint word naming a place must be a mark** (the hint-words lint
  refused "there"); that is the engine holding its rule, not a defect.

### Techniques that follow from one rule alone

The rules are two: *a region holds exactly two shaded squares* (count) and
*a shaded square has exactly one shaded neighbor* (domino). Read from each
statement, not its name:

| Technique | Tier | Reads |
| --- | --- | --- |
| `domino` | Easy | domino alone: a full domino's open neighbors are clear |
| `partner` | Easy | domino alone: a lone shaded square's last open neighbor is shaded |
| `between` | Easy | domino alone: a square beside two shaded is clear |
| `alone` | Easy | domino alone: a square with every neighbor clear is clear |
| `fullRegion` | Easy | count alone: a region with its two has the rest clear |
| `exactRegion` | Easy | count alone: a region with as many open as it needs has them shaded |
| `claimed` | Easy | both: a lone square's partners all in one region needing one |
| `neededRegion` | Normal | both: `fits` is the count with domino placement |
| `blocked` | Normal | both, as `neededRegion` |
| `crowded` | Tricky | both: a trial shade and what it rules out at once |

Six of ten follow from one rule (eleven were stated; `orphan`, dropped, read
both). The domino rule's four are "no two of
these touch" and "each has exactly one" over the grid's sides, the kinds
`supply-techniques-by-kind-of-rule` names; the count rule's two are
"exactly k of these hold v". `fits` is the one statement the two-rule
techniques share: an exists-fill of a set under both rules, which a library
could hold as "the rest of a count can still be met".

### How long each part took

From the session's transcript (2026-11-16, UTC): the description's first
form 03:32 to 03:37; the scaffold, solver, hint, render and index 03:37 to
03:41; registration and the wall move 03:39 to 03:46; the generator 03:47
to 04:35, with the ladder edits it drove (`claimed`, `blocked`, `fits`); the
tests, pins and soundness from 03:44, mostly after 04:35; the app in the
browser, the icons, the game's verdict and a reader's pass over the hint's
words 04:35 to 05:30. The deal took about half the time, the checks after
it most of the rest, and the description, which was the game's logic, about
a tenth. The verdict's refusals were all of the kind a ported game meets
too (an icon, a ledger, a sentence over 120 characters, a menu without a
rectangle), none of them about writing description-first.
