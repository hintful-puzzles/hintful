# sequence-hints-in-cell-games — findings

Section 1's measurement, taken 2026-09-19. The stopping condition was stated in
`tasks.md` before the instrument existed: *if a plan position usually offers one
firing, ordering buys nothing and this change stops.* **It does not fire.** A
position in this family offers a median of three firings, and fewer than half
offer one even under the strictest reading.

## Corpus

`puzzlesInFamily("latin")` ∩ `HINT_GAMES`: Group, Keen, Salad, Solo, Towers,
Unequal. Mathrax is in the family and has no hint, so it has no plan to measure.
Each game at its harder presets, three seeds each (`seq-<id>-<preset>-<n>`), one
plan per board, asked for from the fresh board and walked to its end:

| game | presets |
|---|---|
| Group | 8x8 Tricky, 12x12 Normal |
| Keen | 6x6 Hard, 9x9 Normal |
| Salad | Letters 8x8 A~E, Numbers 8x8 1~5 |
| Solo | 3x3 Hard, 3x3 Extreme, 9 Jigsaw Hard, 3x3 Killer |
| Towers | 6x6 Tricky, 5x5 Normal |
| Unequal | Unequal 7x7 Hard, Adjacent 7x7 Tricky |

Every plan ran to a solved board. 3,445 positions, after 44 bookkeeping
firings (populate, the obvious-clean opening) were set aside as reading the
whole board.

## The instrument, and why it is not D2's

D2 planned to derive read-sets from the shared Latin reason union. Reading the
plans showed that would have measured the minority: in Towers, Keen and Unequal
most strikes carry **game-local** reasons (a clue's visibility, a cage's
arithmetic, an inequality) that the shared union does not contain, so D2's
read-set would have called most firings unknown.

What every one of these games does share is the step's highlight,
`CandidateHighlights`: `area` is the evidence the hint shades, `targets` the cells
it acts on. That *is* the premise the hint claims to rest on, and it is present on
every step of every game here. So:

- **A firing** is a journey: an unflagged step and its `continuesPrevious` legs.
- **Its write-set** is what applying it changes, diffed off the state (grid and
  notes), never read off the move, so it cannot disagree with the board.
- **Its read-set** is `area ∪ targets`, at three precisions:
  - *tight* reads every digit of every cell, an over-read, so candidate counts
    are a **lower bound**;
  - *mid* narrows a placement's evidence to the placed digit (a hidden 7 in a row
    reads only the row's 7s) and is the closest to exact;
  - *loose* narrows every firing to the digits it writes, a deliberate under-read
    and an **upper bound**.
- **A candidate** at position *k* is Loopy's definition: a later firing of the
  same plan whose read-set meets nothing written by the firings from *k* up to it.
  This misses a firing the plan never takes because a later step preempted it, so
  it under-counts too, in the same direction as *tight*.
- **Continuity**: a firing continues from the previous one when it reads a cell
  the previous one wrote. D3's shared-unit relation, not distance: a hidden
  single continues from a strike in its line however far apart the cells sit.

### Checked before being believed

- **Known positive and negative (task 1.2).** Two hidden singles in disjoint rows
  report two candidates at every precision; a hidden single that exists only
  because the first placement struck its cell reports one; and *mid* separates a
  strike of a different digit from a hidden single where *tight* does not.
- **Against the board, outside the instrument.** Every placement the instrument
  called available was checked against that position's own notes: is it a naked
  or hidden single there, in the rows, columns and (Solo) blocks? 3,863 checked.
  248 were not, and **all 248 are placements forced by a clue rather than by
  notes**: Solo Killer cage sums (149), Group associativity (69), Killer cage
  intersections (29) and one Towers facing-clue pair. None is a single the notes
  failed to support. So the read-sets do not under-read singles, and the
  candidates are real.

## 1.3 — candidates per position

*mid* precision, with *tight* and *loose* as the bounds:

| game | positions | candidates p50/p90/max | exactly one | same technique: p50, exactly one |
|---|---|---|---|---|
| Group | 462 | 22 / 35 / 43 | 9.5% | 3, 26.8% |
| Keen | 692 | 3 / 8 / 26 | 18.8% | 2, 39.5% |
| Salad | 421 | 2 / 5 / 8 | 27.8% | 1, 75.1% |
| Solo | 966 | 3 / 7 / 26 | 22.5% | 2, 47.5% |
| Towers | 291 | 2 / 3 / 5 | 35.1% | 1, 54.0% |
| Unequal | 613 | 3 / 6 / 13 | 17.0% | 2, 48.5% |
| **total, mid** | **3,445** | **3 / 12 / 43** | **20.7%** | **2, 47.2%** |
| total, tight (lower) | | 3 / 12 / 43 | 20.9% | 2, 47.4% |
| total, loose (upper) | | 28 / 68 / 128 | 2.1% | 7, 22.3% |

"Same technique" groups firings by their sentence's opening words with numbers
and symbols folded, so it is a subset of "same tier" and its counts are lower
still. Loopy, for comparison, was p50 1 with 63.8% of positions offering one.

## 1.3 — jumps, and whether they were avoidable

| | tight | **mid** | loose |
|---|---|---|---|
| steps not continuing the previous step | 48.0% | **48.4%** | 81.9% |
| …of which a continuing candidate existed | 22.8% | **23.0%** | 16.7% |
| …of which one of the same technique existed | 12.0% | **12.1%** | 6.3% |
| steps continuing none of the last three | 29.7% | **29.8%** | 72.8% |
| …of which a candidate continuing one of them existed | 39.8% | **40.4%** | 31.4% |

So about **one hint in nine** (48.4% × 23.0%) leaves the ground the previous hint
worked on while a firing that continued it was available. Loopy's figure was one in
fifty. Salad (32.5% of its jumps avoidable), Unequal (25.2%), Towers (26.2%) and
Solo (24.4%) sit above the total; Keen is lowest at 14.6%.

**The loose column is not the upper bound here, and that is expected.** Under-
reading inflates candidates but *also* makes nearly every step look like a jump,
because a step that reads only its own digits rarely reads what its predecessor
wrote. Its avoidable share is diluted across jumps that are not jumps. The
decision rests on *tight* and *mid*, which agree to within a point everywhere.

## 1.4 — which way the bias runs

*Tight* over-reads and the plan-tail definition misses preempted candidates, and
both push the candidate count **down**. So *tight*'s figures are lower bounds on
the choice a position offers, and a **proceed** read off them is earned rather
than inflated. That is the opposite of Loopy's position, where the stop was
conservative. Here the choice is at least what the table says.

## 1.5 — the decision: proceed

The condition was "if a position usually offers one firing, stop." At the
strictest reading (tight, same technique) 47.4% of positions offer one, and on
any other reading far fewer do. **§2 goes ahead.**

Two things the numbers say about *how* §2 should work:

- **Most of the win is across techniques.** Continuing candidates of the same
  technique cover about half of the avoidable jumps (12.1% of 23.0%). The rest
  are, say, a naked single far away taken while a strike in the line just worked
  was available. D1's rule, "leave the neighborhood only when nothing there
  fires", is frontier first and tier second, and it is that ordering, not a
  tiebreak within one rung, that reaches them.
- **Recency matters.** Continuing any of the last three steps is available for
  40.4% of the steps that continue none of them, so the frontier is the recent
  steps, most recent first, and not only the last one.

## §2 — the frontier, measured the same way

Same corpus, seeds and instrument, *mid* precision, after every game took its
next firing through `HintFrontier`:

| game | steps not continuing the last | …avoidable, before | …avoidable, after |
|---|---|---|---|
| Group | 49.4% | 22.5% | 8.8% |
| Keen | 41.3% | 14.6% | 1.1% |
| Salad | 21.7% | 32.5% | 5.7% |
| Solo | 33.6% | 24.4% | 6.7% |
| Towers | 25.6% | 26.2% | 2.7% |
| Unequal | 37.6% | 25.2% | 8.4% |
| **total** | **35.9%** (was 48.4%) | **23.0%** | **5.8%** |

Avoidable jumps fell from about one hint in nine to one in fifty. The residual is
firings the frontier is deliberately not offered: strikes recorded past the
solver's next unmade placement (their premise may include that placement's
culls), and singles the solver has not yet recorded (a single is trusted only
when the solver placed it). Offering either would mean narrating a premise the
code has not checked.

The guard (`hint-frontier.test.ts`) measures a different corpus, every leaf
preset with two seeds, where the old order measured 14.8–32.1% per game and the
frontier 3.9–8.3%. It bounds each game below 10%.

## Found on the way

**Solo's hint threw on one fresh 3x3 Killer board in six** ("placing 8 at cell 16
is neither a naked nor a hidden single in the notes"). The notes culls ignored the
cage, which forbids repeats, while the solver struck cage-mates silently. Fixed in
`8057720b`, which splits Solo's regions into "holds every digit" (the classifier)
and "forbids repeats" (the culls), and records the lesson in
`docs/games/hints.md` § "Candidate-elimination games". The cross-game walks had
never drawn a failing seed. This measurement asks every game for a plan from a
fresh board at its hardest presets, and that is what found it.
