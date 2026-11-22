## Census (2026-11-21, at `9d667e452`)

Every game whose description states rules, and its live-error code. The
query that started it, `git grep -nE "function [a-zA-Z]*(Error|InError|lineHasError)" -- src/games`,
found 19 of them; the rest were found by reading each `render.ts`, `state.ts`
and `solver.ts`. About 2,900 lines of checker, plus the State fields kept for
it. Galaxies and Rect have no live errors (only the mistake overlay).

| Form the checker restates | Games | Bound the compiler gives |
| --- | --- | --- |
| Pairwise exclusion (`forall a, b near: not both`) | abcd, boats, magnets, map, range, singles, lightup, seismic, starbattle, dominosa, tents | exact once both decided: every game's marks |
| Count or total = v, over and can-no-longer | abcd, boats, bricks, lightup, loopy, mosaic, palisade, slant, tents, tracks, undead, bridges, spokes, sticks, clusters, range, towers, mines | interval: both directions, at least what each drew (norinori, starbattle, unruly drew "over" only; magnets weaker) |
| Run of three | bricks, unruly | exact once decided |
| Latin / distinct | adjacent, unequal, group, keen, towers, solo, mathrax, salad, rome, seismic, signpost, ascent, subsets, crossing, boats | each repeating pair; Salad's repeated blank by count |
| Clue between two cells, a cage's arithmetic | adjacent, unequal, subsets, mathrax, group, salad, keen, solo killer | exact once decided; keen/solo drew a full cage only, the sum's interval says more |
| Matched | tents | Hall's condition per group: what Tents drew |
| Connected / joined | range, singles, spokes, bridges | broken where the sure members fall into two groups of the possible ones; named by the cut (`connected`) or the finished groups (through) |
| Acyclic / one loop / one path | net, slant, tracks, bridges, rome, path, wordtrail, loopy, pearl | the cycle form: each sure line on a cycle of sure lines (2026-11-22) |
| Regions of size k | palisade, separate, filling | **none yet** |
| Chain (n beside n+1) | signpost, ascent | exact once decided |

Marks beyond the rules, each a judgment the rules do not make: Loopy's and
Pearl's "every piece but the largest" (a closed loop with other lines is a
breach the loop rule makes certain; which piece is "wrong" is a guess),
Bridges' locked unfinished island, Net's locked-tile mismatch, Slant's
"grounded" dimming, Rome's goal-reaching tint, Undead's whole-path marks.
Presentation (dimming, tints) stays the game's; a guess is dropped when the
game moves, and the certain part is what the rules report.

## Decisions

- **Three-valued, with an exact fallback.** A statement is read true, false
  or undecided over every completion of the board. A term the compiler does
  not bound is compiled as the answer check compiles it, its reads through
  `heldIn`/`knownIn`, which stop it on an undecided element. Whatever it
  computed from decided reads alone holds on every completion, so a form
  nobody has bounded is sound and exact on a whole board from the day it is
  written, and bounding it earlier is an improvement in one place. Rejected:
  a full abstract interpreter for every form (most forms gain nothing over
  the fallback), and a per-game "can no longer" (that is what is retired).
- **Where = leading quantifiers.** The statement's own binders say where it
  breaks; a count names its sure members when over and its excluded ones when
  under; `matched` names the short group. A description author chooses the
  grain by how the rule is quantified.
- **The game declares `rules: { grid, violations }`.** The engine cannot map
  a game's state to the description's grid by itself until the board is the
  engine's (`one-model-for-moving-pieces` and the doctrine's end state); the
  two functions are the whole of that mapping, and both the guard and the
  marks read them. `liveErrors` turns violations into marks: pairs, elements,
  clues.
- **Soundness is checked by the guard, not proved per form.** Every enrolled
  game's answers are undecided at random (60 per preset board) and must
  report nothing; at least 90% of one-value changes to an answer must be
  caught, which also shows the guard can fail. Planted: the count's upper
  bound ignoring undecided squares fails it at once.
- **A connectivity rule is named by what is certain** (2026-11-21). Groups
  that can no longer meet are each as much to blame, so Range's and Singles'
  "largest group wins" goes with Loopy's. `connected(S)` names the squares
  surely out of S that touch two groups holding sure members: the shading
  that made the cut, shown the moment it is made. The through form names
  each group with no undecided edge left, as Spokes and Bridges drew a
  closed group; a group still open names nothing, since which one is wrong
  is not known. The cut does not carry over to edges: a Bridges line runs
  through empty squares, so two islands' groups need not share an edge. The
  through form is matched whole rather than restated as a new function,
  since a rule's text is in every technique's soundness fingerprint.
- **Cost.** Tents 15×15 with half its squares undecided: 0.15 ms a call
  under the machine's usual load, once a redraw.

## Batches

A game moves when the compiled marks cover what its checker drew that the
rules make certain; a form marked "none yet" above gets its bound in the
compiler first (one batch each: connected, acyclic/loop, region size), so no
game loses a mark it had. Each batch: declare `rules`, draw from
`liveErrors`, delete the checker and its State fields, look at it in the
app, explain moved render snapshots.

1. Exclusion, count, run and latin games with no connectivity rule: abcd,
   adjacent, unequal (shared `edge-clue-latin`), group, keen, towers, solo,
   mathrax, salad, seismic, starbattle, norinori, unruly, magnets, map,
   mosaic, lightup, dominosa, subsets, clusters, bricks, boats, crossing,
   undead, sticks, signpost, ascent, mines.
2. Connected bound, then range, singles, spokes.
3. Loop/acyclic bound, then loopy, pearl, tracks, net, slant, path, wordtrail,
   rome, and bridges (its "no loops", and a line it narrows without
   deciding: `tasks.md` 2.3d).
4. Region-size bound, then palisade, separate, filling.
