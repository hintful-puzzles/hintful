# read-the-widened-deixis-report

## Why

`scripts/checks/hint-deixis.test.ts` is the advisory sweep that asks **which
hint steps point at a square with a bare word while a second mark is on the
board**. It is a report rather than a gate because most of its rows are
legitimate ties no lexical rule recognizes, and its own header names the four
classes. The last full read of it — 230 sentence shapes across 20 games — found
**nothing further to change**, and that conclusion is what the header records.

`slice-the-first-leaf-hint-guards-by-axis` pointed the sweep at the presets menu
instead of at tiers written onto the first preset. Measured 2026-09-20 on the
live registry, the report went **230 shapes / 20 games → 505 shapes / 27 games**,
over 25,670 plan steps. Seven games appear that had never had a board in it at
all — Loopy (29 rows, from twenty tilings it previously never saw), Mathrax (28),
Tracks (21), Seismic, Bridges, Galaxies and Light Up — and every game already in
it grew, Salad from 27 to 74 and Group from 6 to 38.

**The new rows were sampled, not read.** The sample — Loopy's dead-end, closed
loop and corner rungs, Bridges' island group, Galaxies' owner dot — fell squarely
in the fourth class the header names: *the two marks are different kinds of
thing*, so the noun in "this edge" already picks the target out. That is a
reason to expect the previous conclusion to survive, and it is not evidence that
it does.

One row from the sample is worth naming as the first to look at, because it is
the one where the two marks are the **same kind**: Light Up's *"The ringed
square is still dark and only this square can still light it, so this one must
hold a bulb."* Light Up is one of the four games whose sentences that earlier
read did fix, and `RELATIONAL` carries `could light it are marked` — the sibling
phrasing — but not this one. So the question is whether the tie is real and the
filter is short a phrase, or whether the sentence is genuinely bare.

## What changes

The report is read in full, the way the 230 were. Per row: **are the two marks
the same kind of thing?** A row that ties its deictic by value, by line or region
context, by a continuation leg's antecedent, or by the marks being different
kinds is a false positive and stays. A row that marks a cell against another cell
and points at one of them with a bare word is a narration fix in that game's own
file, beside the vocabulary that can judge it.

The outcome is recorded in the sweep's header the way the previous read's was: the
figure, and what reading it found.

## What this does not do

- **Not a tuning of `DEICTIC` or `RELATIONAL` to shrink the report.** The header
  is explicit that the false positives are not noise to be tuned away. A phrase
  added to `RELATIONAL` has to be a tie the project actually uses, and the Light
  Up row above is the one candidate the sample turned up.
- **Not a promotion to a gate.** The per-game tests remain where the judgment
  lives.
