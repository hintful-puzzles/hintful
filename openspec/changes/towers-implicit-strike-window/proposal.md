# towers-implicit-strike-window

**Status: scaffolded, not started.** Found by `rome-implicit-continuity`,
2026-09-28.

## Why

Towers' plan under the implicit reading ("Only as needed") passes over a
continuing firing on **12.9%** of its jumps, measured over every leaf preset at
six seeds; the bound in `hint-frontier.test.ts` is 10%, and Towers' populate
plan, its default, measures 7.2%. A player can choose the implicit reading, so
the plan ships. `hint-frontier.test.ts` holds it in its `OVER_BOUND` ledger and
asserts it is still over, so the entry has to go when this is fixed.

## What is known (2026-09-28)

Read out loud, the typical jump is Towers' clue rung chaining "Clue 1 sees just
one tower… height 5 can only sit here" from one line to another, passing over a
clue strike on the line it just placed in (on 5x5 Easy: 5 at the top of column 3,
then the clue 4 at its foot striking the 4 from the two squares nearest it, taken
eleven steps later).

Three availability rules hold the continuing strike back, and none does alone.
Measured with each lifted for measurement only (every one is a soundness rule, so
lifting is not the fix):

| lifted | Towers implicit |
|---|---|
| none | 12.9% |
| the strike window (`firstUnreflectedPlaceIndex`) | 12.9% |
| the pending-mark rule in `availableStrikes` | 12.8% |
| the implicit opening's note-free phase | 11.4% |
| window and pending | 7.0% |
| all three | 2.7% |

Under the populate reading the same shape is invisible to the instrument, because
the populate step stands between the clue placements and every later strike.

## What to find out

- Why window and pending bind only together. A lead: under the implicit reading a
  note-less cell's candidates are what its regions leave it, so a recorded strike
  on such a cell that the plan never takes stays "live" and can mark every later
  firing reading that cell as pending. A whole-line premise (a clue's line) meets
  one easily.
- Whether the implicit reading needs the note-free opening at all: its only setup
  is the obvious clean, which a fresh board does not need.
- Whatever vouches more finely must keep the rules' guarantee: a firing is
  offered only when the board the player has supports its premise.
