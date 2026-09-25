# fold-notes-into-conclusions — design

## D1. The conclusion is the walk's (task 1.1, 2.1)

Every strike sentence on the candidate walk was read, across the eight games
that walk it (Group, Keen, Mathrax, Rome, Salad, Solo, Towers, Unequal). Most
split cleanly at their last ", so". Four shapes needed their premise reworded to
stand before an engine-owned ", so …":

| Shape | Arms | Rewrite |
|---|---|---|
| a premise already ending in "so …" | Unequal's signs and bars, Towers' `lowerBound`, Solo's `dup`, Salad's `borderNear`/`borderFar`, Rome's `opposite` | the inner "so" became "and", "which", or "leaving" |
| a conclusion in its own sentence | Towers' `lineFull`, Group's `identityElim`, Salad's `borderFar`, the forcing chain ("Either way, cross out 5 here") | the last sentence became the premise's final clause ("Either way, 5 is ruled out here") |
| a conclusion that says where | every placement cull, Solo's intersection, Rome's pair, Salad's far border | `where` ("from the other cells they pass through") |
| a conclusion that names the notes by a word | Group's identity marks, Salad's empty-square mark, Rome's reach ("the rest") | `struck` |

So a strike's words are a `Premise` (`engine/hint-text.ts`) and the plan carries
`conclude: Conclusions`, one clause per move kind. The row/column preset builds
it from the `notes` vocabulary it already took, which is now required of every
preset caller (Salad passes it beside its own setup); Solo takes
`candidateConclusions` in its digits; Rome writes its own in the ways a square
points, the one game whose values are not spoken as values.

**`named`** came from the length ledger, not the design: with the ending the
engine's, "No way to make this cage multiply to 7 puts 2, 3, 4, 5, 6, 8 or 9 in
this cell, so we must cross out 2, 3, 4, 5, 6, 8 and 9" said its list twice and
ran to 124 characters. The old sentences had said "so they must be crossed
out"; a premise that names its values now says so, and the ending refers back.

`narrateLatinReason` splits along the same line: it narrates the three single
arms, and `latinPremise` the three strike arms, each refusing the other half.
`narrateForcingChain` is `forcingChainPremise`.

## D2. The fold (task 2.2)

Under the implicit reading a strike folds when its marks lie in one blank,
note-less cell, its premise has no `where`, and no earlier leg of the firing
reads or strikes the cell. The step then places the one value left, or writes
the several as the cell's notes (`pencilAdd`, the move note legs already used,
so `keepCandidateHintTrack` and `refreshCandidateHintStep` needed nothing new).
Its `marks` stay empty, since nothing is struck on the board.

`where` blocks the fold because it is exactly the statement "this strike speaks
for cells other than the one it is about". `struck` and `named` do not: they
change how a strike names what it removes, and a fold names what is left.

**Found while measuring, and pinned:** the walk's view of the candidates is
taken before a firing, so when a firing's first leg folds into a placement, a
later leg's fold in the same region still saw the placed value. A Rome 4x4
Tricky board threw ("neither a naked nor a hidden single") two plans later.
`fold` now takes out values an earlier fold placed in the cell's regions, and
`settled` drops a later leg's marks that a fold already dealt with. The unit
test was seen failing with the fix disabled.

## D3. What the populate reading kept (task 3.1)

Every cell a strike reaches has notes under the populate reading, so nothing
folds. Compared before and after over every leaf preset of the eight games at
six seeds: 516 plans, **identical in every move, highlight and journey flag**.
Only the words moved, which is the conclusion contract applying to both
readings.

`candidate-reading.test.ts` had skipped the premise check for any step that adds
notes to one cell, since a note leg rests on nothing. A folded note step does
rest on its evidence, so the check now reads a note step's outline and `reads`
too, minus the targets a writing step fills. Seen failing with the evidence
note legs disabled (on folded steps among others), and green without.

## D4. Defaults, re-measured (task 3.2)

Every leaf preset at six seeds, a plan from a fresh board under each reading
(a scratch walk, deleted after use). Whole-plan steps:

| Game | Implicit before | After | ÷ populate before | After |
|---|---|---|---|---|
| Mathrax | 4,656 | 3,442 | 0.91 | 0.67 |
| Rome | 6,552 | 3,967 | 1.16 | 0.70 |
| Solo | 8,075 | 7,870 | 0.73 | 0.71 |
| Unequal | 7,321 | 6,189 | 1.12 | 0.95 |
| Towers | 3,299 | 3,013 | 1.13 | 1.03 |
| Group | 2,758 | 2,756 | 1.04 | 1.04 |
| Keen | 7,535 | 6,571 | 1.22 | 1.07 |

(The "before" ratios differ slightly from `examine-implicit-candidates`' table,
which sampled other seeds; the same walk took both columns here.)

The guide's rule is that a game whose plan is shorter under the implicit reading
overrides the `populate` convention. **Rome and Unequal now meet it.**

**Unequal switches** its `newUi` default to `implicit`. This is a player-visible
default, but no stored data changes: the preferences dialog saves every value it
shows, so a player who has saved Unequal's preferences since the reading shipped
keeps whichever reading was stored, and everyone else gets the new default.

**Rome does not.** Switching it put Rome's default plan under
`hint-frontier.test.ts`'s continuity guard for the first time, and its implicit
plan passes over a continuing firing on 13.7% of its jumps against a bound of
10%. With the fold disabled the figure is 14.1%, so the fold is not the cause:
Rome's implicit plan was never walked by that guard, which reads each game's
default only. A plan that hops across the board is the cost the guard exists to
bound, so Rome keeps `populate`, with the reason at its `newUi`, and the
question is `rome-implicit-continuity`. Keen
(1.07) and Towers (1.03) stay on `populate`: most of their cells still need
notes, and the plans remain longer. Group stays implicit for the reason it
already gave.

## D5. Wording chosen without asking

The `keep` ending was first "so this cell can only be 1, 2, 3, 4 or 6: pencil
them in". It pushed six sentences past the 120-character limit, and a list as
long as the values left is the worst place to spend characters, so it is "so
pencil in only 1, 2, 3, 4 and 6", the proposal's own shape, with "only" carrying
the necessity. The owner reads the sentences in the app (task 3.3).
