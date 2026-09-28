# add-separate-hint — design

## D1. The ladder: three rungs, one engine, no board moved

`solverAttempt` runs on `runDeductionFixpoint` as three tier-0 rungs:
`shared-letter`, `walled-apart`, `only-way`. The hand-written loop stays as
`solverAttemptLegacy`, the oracle `separate-ladder.test.ts` proves the ladder
against (partition, sizes, disconnect matrix, locked letters and verdict, over
generator runs that keep one scratch across letter refills, as the generator
does).

**The sweep resolved itself.** Upstream's disconnect pass walls apart every
eligible pair before extending, which the proposal feared was "not one
deduction". It is order-independent: a disconnect changes no component, and
`genLock` is a set union, so which pairs a sweep disconnects and which letters it
locks cannot depend on their order. The rung therefore returns after its first
firing on the recording path only (docs/games/hints.md § "A rung is not a
premise, so return per premise") and sweeps on the generator path, and the
frozen differential passes untouched.

**Extension order is load-bearing and kept.** `only-way` is not monotone (a
component that grows can gain choices), so merging the lowest-rooted single-choice
component first, over the same `Dsf` merges, is what decides which boards
generate. Planting a reversed order turned 5 differential fixtures and 5 ladder
cases red.

**`walled-apart` is the one new rung, and it is the notation's.** Upstream ORs
disconnect rows on a merge, so a grown region inherits "separate from B"
silently. On the player's board that inheritance is visible work: the new
boundary still needs walls, or the black DSF joins the two regions and the board
is never solved. The rung writes only `borders`, which the generator never reads,
so it moves no board; only the firing census sees it (a silenced plant left every
comparison green and the census red, as it should).

The scratch now carries `borders`, the same facts in the border-grid byte, so
generator and hint run the same rungs on the same state. Cost, measured under
load (average 9.6) as a ratio: generation runs 1.2–1.3× the legacy loop (the
runner's no-op re-sweep after each firing, plus wall bookkeeping); tens of
milliseconds at the shipped presets. Accepted for one engine instead of two.

## D2. The hint seeds the scratch from the player's marks

`separateRecordingPass` merges across every no-wall mark, then disconnects across
every wall, then drives the ladder with `singleFirings`; the scratch's `borders`
is the working board `deduceHintPlan` advances. Hint refuses on mistakes (so no
seeded merge joins two squares of a letter) and on a board the solver cannot
finish from empty (`PUZZLE_NOT_REASONABLE`, a typed-in desc), since nothing can
vouch for its marks.

Because `only-way` is not monotone, a player's own correct marks could in
principle leave the ladder with less to say than a fresh board. Measured: 909
random correct partial boards (every preset, 20 shares of revealed solution edges
each), no stall. `separate-hint.test.ts` keeps a slice of that corpus as a
property.

## D3. The border grid's hint layer moves to the engine

Palisade was the only border-grid game with a hint, so its highlight type, its
per-edge journey builder, its keep-track verdict, its render fold and its
evidence drawing were Palisade's. With a second game they are the notation's, by
the test `border-grid.ts` states: they would have to change in both games at once.

- `engine/border-grid-hint.ts`: `BorderHint`, `borderHintJourney` (a leg per
  edge, each two-sided, the rest `continuesPrevious`), `borderHintKeepTrack`.
  The game wraps the edits in its own `Move` (`toMove`), keeping the input
  layer's rule that save formats do not couple through shared code.
- `engine/border-grid-render.ts`: `hintTileBits` and the two evidence flags,
  drawn by `drawBorderTile` under the game's content when the palette names
  `hintEdge` and `hintEvidence`.
- `engine/hint-text.ts`: `edgeContinuation`, the later-leg sentence both speak.

Palisade's render snapshots, including its hint frames, are byte-identical after
the move. The flag-collision test listed four of the module's seven flag
families; it now lists every one, asserts the list against the module's exports,
and checks pairwise disjointness as well as the floor.

## D4. Narration: two regions are told apart by mark shape

A sentence about two regions cannot outline both: per-square outlines on two
touching regions read as one blob. So the first region is hatched and the
second outlined, and the sentence names them by those shapes ("the hatched and
outlined regions"), docs/games/hints.md § "Two marks on the board, one 'this
cell'". A lone square is named by its letter ("These two Ds", "the outlined C"),
since "region" for one letter reads as if the player had missed something.

| Rung | Sentence (first leg) |
| --- | --- |
| shared-letter, two squares | These two Ds can't share a region, so the edge between them must be a wall. |
| shared-letter, region and square | The hatched region already holds a C, so the outlined C can't join it: … |
| shared-letter, two regions | The hatched and outlined regions both hold an A, so they can't join: … |
| walled-apart | A wall already separates the hatched and outlined regions, so … must be a wall too. |
| only-way, square | This B is walled in on every side but one, so this edge can't be a wall. |
| only-way, region | The hatched region has 2 of its 4 squares and one square left to grow into, … |

Every premise is on the board: letters, walls, and regions joined by the
player's own no-wall marks (AGENTS.md hint rule 6). "Walled in on every side but
one" is exact because `walled-apart` runs before `only-way`, so every
disconnected neighbor is walled by then. The longest sentence is 117 characters.

The arm census found one arm no generated or partial board reached in 909: an
`only-way` firing that sets two edges (a region wrapped round its notch). It is
ledgered in the census and pinned by a constructed board at the recording-pass
level; its sentence is the shared continuation Palisade already speaks.

## Declined

- **A per-component (rather than per-square) `only-way`.** Stronger and still
  sound, but it would change which boards generate, and the measured stall count
  gives no player-visible reason to.
- **Dropping wall bookkeeping from the generator path** to recover the 1.2×.
  It would make `walled-apart` a hint-only rung that the generator census can
  never reach, two engines in all but name.
