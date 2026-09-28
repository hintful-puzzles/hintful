# towers-implicit-strike-window

Found by `rome-implicit-continuity`, 2026-09-28. Taken on and finished
2026-09-28.

## Why

Towers' plan under the implicit reading ("Only as needed") passed over a
continuing firing on **12.9%** of its jumps, measured over every leaf preset at
six seeds, against the 10% bound in `hint-frontier.test.ts`, which held it in its
`OVER_BOUND` ledger. A player can choose that reading, so the plan ships.

Read out loud, the typical jump was Towers' clue rung chaining "Clue 1 sees just
one tower… height 5 can only sit here" from one line to another, passing over a
clue strike on the line it had just placed in (5x5 Easy: a 5 at the top of column
3, then the clue 4 at its foot striking the 4 from the two squares nearest it,
taken eleven steps later).

## What it found

**Two rules held the strike back, and neither was needed for soundness.**

- **The strike window.** `availableStrikes` offered only strikes recorded before
  the solver's first placement the board had not made. The solver records
  singles elsewhere on the board ahead of Towers' clue rungs, so a clue strike on
  the line just placed waited behind a single nowhere near it. What the window
  guarded is narrower than what it withheld: a strike recorded after an unmade
  placement may rest on that placement's cell or on its culls, and those are
  exactly the marks the existing pending-mark rule already knows how to check —
  the solver records the culls as `dup` strikes beside the placement.
- **The implicit reading's note-free opening.** Under the implicit reading the
  setup is the obvious clean alone, but the walk still ran the singles and the
  game's own rungs in an opening until they ran out, with no strike competing.
  On a board with no stale note there is nothing for the opening to go ahead of.

These are why "lifting the window" alone measured no change in the scaffold's
table: lifted without treating the unmade placement's cell as pending, the
pending-mark rule still withheld most of the same strikes through the
placement's culls, and the opening withheld the rest.

## What changes

- `availableStrikes` reads the whole recording. A placement the board has not
  made adds its cell to the pending marks (its culls are already there) and ends
  the "first firing is always offered" exemption; a later strike is offered when
  its premise reads none of them.
- Under the implicit reading the walk's setup is done while no note is stale, so
  a fresh board has no note-free opening. A board with stale notes keeps it, so a
  naked single still goes before the clean.
- `hint-frontier.test.ts`'s `OVER_BOUND` ledger is empty.

Measured at six seeds, every leaf preset (implicit / populate):

| game | before | after |
|---|---|---|
| towers | 12.9% / 7.2% | 5.3% / 0.5% |
| unequal | — | 4.3% / 0.3% |
| keen | — | 2.9% / 1.1% |
| mathrax | — | 3.4% / 0.0% |
| group | — | 1.2% / 6.7% |
| abcd | — | 7.1% / 7.6% |
| rome | — | 1.1% / 0.1% |
| seismic | — | 7.0% / 4.3% |
| solo | — | 2.7% / 3.7% |

At the guard's own two seeds no game got worse under either reading and most
improved (design.md has both tables).
