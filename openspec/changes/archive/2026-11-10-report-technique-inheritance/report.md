# Report: Solo's inheritance, against its port

Task 2, run 2026-11-10. The report is
`research/technique-check/results-inherit-solo.txt`, written by
`CANDIDATE=solo` (`docs/descriptions.md` § "What a candidate inherits"):
Solo's rules against the Latin library and the seven other Latin games'
own techniques, 23 in all, in 20 seconds. Solo's Jigsaw world is not built
by the checker (its boxes are dealt), so it is checked in the Killer world,
with and without X, at orders 3 and 4.

## The prediction

- **Inherited, sound**: the library's six, `placed`, `hiddenSingle`,
  `single`, `set`, `fish` and `wing`.
- **In Solo's words and unsound**: Group's `associativity`, `identity` and
  `notIdentity`. They read only the grid, as a multiplication table, so the
  compiler builds them for Solo, and the checker finds a 3×3 board each.
- **Not in Solo's words**: the other fourteen, each reading a clue kind
  Solo does not deal (`bar`, `sum`, `parity`, `border`, `sees`, `greater`).
- **Rules no inherited technique reads**: Killer's cages and their
  `total` clue. Boxes, lines and diagonals are read, through `units` and
  `peers`.

## Against the port

Solo's ladder, as its description states it:

| The port's technique | Predicted |
| --- | --- |
| `latin.placed`, `hiddenSingle`, `single`, `set`, `wing` | yes, inherited |
| `digitSet` | yes: the library's `fish` with rows and columns swapped, upstream's scan order |
| `cageSingle`, `regionRule`, `cageMinMax`, `partMinMax`, `cageSums`, `partSums` | yes, as techniques for the unread cages and totals |
| `boxSingle` | no new reasoning: `hiddenSingle` on boxes alone, placed a tier lower, as upstream grades |
| `intersect` | **no**: a box against a line, two rules each read alone |

Every technique the report called inherited is one the port runs, and none
it called unsound is. Of the nine the port wrote itself, six are for the
rules it named unread, and two restate an inherited one at another place in
the ladder. One, `intersect`, it did not predict: the report marks a rule
read when some inherited technique reads it, and the interplay of two read
rules needs a technique of its own. `docs/descriptions.md` § "What a
candidate inherits" records this as what the report does not see.

## Open, answered

Whether the report runs before every port: every family in the catalog but
the planning games now states its techniques, so it can, and it costs
seconds where the techniques are local. The new-game guide asks for it
(`docs/new-game.md` § "A game with no upstream to check against"). Whether a
port then writes a technique the report could not name, as `intersect` is
here, is what a minimal unsatisfiable subset on a stalled board would
answer (`proposal.md` § "Prior art"); untried, and not filed: the first new
game ported with the report in hand is the test of whether it is needed.
