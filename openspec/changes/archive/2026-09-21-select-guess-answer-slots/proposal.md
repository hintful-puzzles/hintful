# select-guess-answer-slots

## Why

The owner tried the answer row's color blocks on a phone (2026-09-21): *"the
small squares are still too small to directly touch, and it confuses my touch
on a note cell with a touch on a particular color."* A block is a fifth of a peg
across, and the answer row let a tap enter a block's color and a held finger
rule it out, so every aim that missed by a few pixels acted on the neighbor.

## What Changes

The owner's proposal, for mouse and touch alike (their call left to me; one
model for both is simpler to learn and to state):

- **A tap selects an answer slot as a whole** and switches notes mode on; the
  color buttons then rule their color out of that slot, or back in. A tap on a
  working-row peg selects it and switches notes mode off. So *where the frame
  is* says what a color button will do.
- The pointer no longer acts on one color: tapping a block entered its color,
  and a right-click or held finger toggled it. Both are gone.

**The cost:** a player who turns the on-screen keypad off enters pegs and marks
with the physical keyboard's digits only, as in Solo, Keen and Filling. With the
keypad on — the default — nothing is lost, since the color buttons do both.

## Impact

`guess` spec: the key-per-color and row-composition requirements lose their
pointer-on-a-color clauses; the answer-row requirement is replaced by one whose
pointer rule is slot selection. Code: `index.ts`, `render.ts` (`answerSlotAt`).
Help and `docs/games/input.md` updated.
