# guard-recorded-firing-premises — design

The proposal asked three things: whether a premise check can be generic, what
it costs and where it runs, and whether a solver that narrows its search by
what it has found reports false failures. Measured 2026-09-28; the load average
sat at 8–11 with the box short of free memory, so the timings are upper bounds.

## D1. Only one firing can be the oracle

The proposal's candidate was "rebuild the cube with every cell outside the
premise widened, and ask whether the solver still records the strike". Run to
its fixpoint, that passes every firing: the clues and givens the solver started
from are what derived the widened cells, so it derives them again. The same is
true one ladder rung at a time, since the lower rungs put the cells back before
the firing's own rung is reached. The first cut ran the whole ladder and put
back 95% of the cells it widened before reaching the firing (Towers, 2,329 of
2,450).

So the replay runs the firing's **own technique**, alone, from the solver's
state at the firing with every cell outside the premise back at the
recording's start. Back at the start, not "all candidates": the start keeps
the givens and what a game seeds from its clues (Salad's markers), and a
context that mirrors the cube re-derives itself from it (Mathrax).

## D2. The technique finds an earlier firing first, and that is sound to use

A cell returned to the start shows again what an earlier firing of the same
technique struck, and the technique scans to that first. A deduction reading
fewer candidates concludes no more, so on the returned state such a firing
changes only returned cells. The audit makes exactly those changes and asks
again, rather than restoring the cells whole (which returned Salad's every
cell and tested none). Anything else first, or nothing at all, is the finding.

The price is a blind spot, stated in the module and counted: a cell the
technique itself puts back on the way is not tested. Measured per technique on
the guard's boards (one per leaf preset, the default reading): the lowest Latin
rung, a clue rung whose lines are each their own, tests no cell in Towers (172
checks) or Keen (199), and Salad, all of whose firings are that rung's, none;
the higher rungs test 324 and 932. A cut premise can still turn a check red
there, since the finding comes before any counting (`lineFull`, below). The
guard asserts each game tested a cell, except Salad, held at exactly none.

**Power, shown by planting**, each against the committed guard: Group's old
`evidence`, the fish without `reads`, Keen's cage without its cells, Towers'
`arrangement` without its line and `lineFull` without its line all turn it
red. `lineFull` did so only once a board that offers one while a line tower is
pending was added to the sweep (`EXTRA_BOARDS`), because the presets' own
boards never do. Solo's hidden single without its region does **not** (D5).

## D3. A gate is not a read, and the replay cannot tell them apart

Two techniques read more to decide *whether* to fire than their conclusion
rests on. Mathrax at Easy and Normal commits a cell's strikes only once every
clue at its corners leaves it one digit; each strike rests on the one clue and
its partner, which the step names. Switching the gate off took Mathrax from 28
findings to none. Rome's `expand` fires only while exactly one mark on the
whole board points into any goal's group. Both sentences speak of what they
rest on, so both are honest.

They are ledgered (`GATED`), each pinned to a board that shows it, as an input
rather than a seed. A ledger key hides a regression of the same kind, and one
plant proved it: Rome's `reach` without its `reads` went from 6 findings to 10,
all under the gated key. So Rome's reads are held by a test of their own
(`rome-hint.test.ts`).

## D4. The instrument checks itself first

Before judging a firing, the audit replays it from the recorded state with
nothing returned, and a replay that does not make it again is reported as
**unreproduced**, not as a finding. That check caught Solo's first adapter,
whose seven "findings" were all Killer firings it could not reproduce. A
recording that offers no replay is reported too, so a new bespoke solver is
not skipped in silence. Both are ledgers held exactly.

## D5. Solo: a whole-loop replay, and none on a Killer board

Solo's techniques live in one hand-written loop, so its replay runs the whole
loop for one pass: sound, since every rung before the firing found nothing on
the recorded state, but weak, since a lower rung puts back a returned cell
first. Measured on the guard's boards, Killer aside: 61 cells tested against
782 put back, and a hidden single without its region goes unnoticed.
Scaffolded as
`solo-ladder-as-declared-techniques`.

On a Killer board the replay cannot work at all. The solver splits and shrinks
cages as it deduces, which is state a replay's cells do not carry, and which
cage counts as inside a region turns on which cells are filled, so a returned
cell can let a rung conclude *more*. So Solo offers no replay on a Killer
board, the guard ledgers that, and the cage reasons' `reads` are held by a
solver test (`solo-hint.test.ts`). The splits also make a narration false,
which is `teach-solo-cage-splits`.

## D6. What a reason reads is the solver's to say

Where the game's words cannot name what a deduction read, the solver does,
since it is the one place that knows. `DeductionRecord` documents an optional
`reads` on a reason, and the walk adds it to the step's premise, which also
puts the cells' notes on the board first under the implicit reading. That is
consumed by the walk, not only by the guard: it is an input, not a manifest.
The fish computes it generically in both set implementations: every cell of
each matrix row in the subset, across all its columns, which is nothing new for
a naked set and the rest of the line for a hidden set or a fish.

Considered and declined: a `gate` field on a reason for the audit to keep,
which would retire the `GATED` ledger. Only the guard would read it, which
makes it a manifest.

## D7. Cost, and where it runs

`firing-replay.test.ts` runs in ~9 s: every walk game's leaf presets under
each reading, one board each, generated once per file. Most of it is
generation (Solo's 2×3 Hard alone), not the audit. It is per-commit, one case
per game, so the hook narrows it to the games a commit reaches. A premise is
what the author of a hint writes, which is the case the gate keeps per-commit.

The production path pays one `auditingPremises()` check per recording run.
