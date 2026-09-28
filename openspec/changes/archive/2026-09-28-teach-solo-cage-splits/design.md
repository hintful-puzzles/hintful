# Design: teach-solo-cage-splits

## D1. A split is not taught — it is not kept

The proposal asked how a split should be taught. Measuring the splits first
changed the question. Upstream's KINTERSECT rung keeps a split **for good**: the
part of the cage inside the region becomes a working cage, so a later pass can
split a piece of a piece, or count a piece as a "whole cage" of another region.
A sum resting on that rests on another derived sum, which the board never shows
and the player has no way to write down. AGENTS.md rule 6 gives the answer: a
deduction needing a fact the player cannot record belongs to a tier the hint
does not teach, not in a hint-only narration.

So the rung now derives its partial cages **afresh each pass** from the real
cages (reduced only by their filled cells), and keeps nothing:

- the region's leftover cells, with the rest of its total (as before; they may
  span cages);
- where those cells all lie in one cage, that cage's other open cells, with its
  clue less that and its placed digits. One such cell is placed at once (the
  "outie"), graded `DIFF_KINTERSECT`, where upstream placed it next pass as a
  plain killer single.

Every sum a killer deduction uses is then one step from the board, and fits one
sentence.

## D2. What it costs

Measured 2026-09-28 on the 3x3 Killer preset, before the change:

- **22 of 1,500** generated boards (1.5%) needed a chained split; the shallow
  solver cannot finish them at the Killer tier. The generator grades against
  the shallow solver, so it now simply does not produce them.
- **294 of 300** seeds generate the same board as before. Six give a different
  board. Saves and shared links carry the desc, which is unaffected, so no
  player's data changes; only a seed-form ID (`3x3ka#seed`) can now name a
  different board.
- The frozen C differential's one Killer fixture still matches byte-for-byte
  and grades as C did.

The assurance the differential gave the rung's upstream order is kept in its
place by the recording test in D4, and by the generator's own requirement that
every board grades exactly at its tier.

## D3. The words

One reason field, `origin`, says where a sum came from (`cage`, `region`,
`outside`); `cageIntersect` folds into `cageSingle` with a `region` origin. The
sentences lean on the picture (hints.md, "one sentence, not three"): the region
is hatched, the cells a sum is left to are outlined, and a cage's clue and
placed digits are on the board, so a sentence gives the sum and not the sums it
came from.

- Cage single: "This killer cage must total 20 and its other cells already make
  15, so its last cell must be 5." (was "The rest of this killer cage is filled
  in…", which was false whenever the cage had been split).
- Region single, unchanged, the one sentence spelling out the 45.
- Outside single: "This block's whole cages and digits leave 10 for this killer
  cage's cells in the block, so its last cell must be 8."
- Strikes on a partly filled cage: "This killer cage's open cells make 11; the
  others leave no room for 2" (was "This killer cage must total 11", naming
  the remainder as though it were the clue).
- Strikes on a region's sum: "This row's whole cages and digits leave 15 for
  the highlighted cells; the others leave no room for 9…". These are two
  premises and run past the 120-character limit, so they have one
  `LONG_NARRATIONS` listing (hints.md, the two-premise category).

"Whole" cages distinguishes the cages the region rule takes out from the one
it leaves cells of.

## D4. What holds the premise

Upstream's persistent splits were the reason the premise audit could not replay
a Killer board. Without them, the replay now runs on Killer too, and the
`UNREPLAYED` ledger is empty. But planting a missing read showed the audit
cannot hold these reads: Solo replays its whole ladder, whose lower rungs fill a
returned cell again before a cage rung is reached (`solo-ladder-as-declared-
techniques`). So `solo-hint.test.ts` checks every recorded killer reason against
the board it was recorded on, recomputing each sum from its origin using only
the filled cells its `reads` name. Each of three plants (a region's outside
cells, an outside sum's cage cells, a cage's filled cell) turns it red.
