# edge-adapters-declare-their-evidence

Filed 2026-11-13 from `build-hint-steps-in-the-engine` (its task 2.1b), as the
engine's finding: the edge games' hint adapters each write four things the
description could declare.

## What the work found

The 13 edge games average about 450 lines of `hint.ts`; the 9 firing games
about 55. Read from Pearl, Tracks and Magnets (tree at `8ecc915a4`), each edge
adapter writes by hand:

- one `sentence` per technique, where Pearl's and Tracks' tables map every
  technique to the same function;
- a `premise` of the marks it reads and outlines, where the description can
  declare `marks.reads` and `outline` (Pearl declares `marks: {}` everywhere);
- a keep-track (`pearlKeepTrack`, `tracksKeepTrack`, `magnetsKeepTrack`, 40 to 90
  lines each) from a fact-to-move codec;
- a `PLAN_CAP` (12, 20, 24, 24 in four games, 40 in the rest).

## What this change does

Two stages, the hint-walk fingerprint holding the words and marks fixed:

1. **The shell, no word changes**: one `sentence` for all techniques;
   `marks.reads` and `outline` declared in the description; the keep-track from
   a declared codec (`moveOf`, `opsOf`/`applyOps`, `changesOf`); `PLAN_CAP` as the
   engine's default, its four exceptions declared with a reason or dropped (it
   changes how many steps a player reads: ask the owner first). Start on Pearl.
2. **Declare the evidence**: Tracks' `shut`, `lineSquares`, `holds` and `empty`
   copy predicates its yaml already states, and Pearl's `pieceOf` copies
   `through(...)`; as declared terms, `reasonOf` reads the terms, not the board.
   Tracks first, then Pearl; stop where the fingerprint shows another reason
   order. Magnets keeps its own board reading (`whyNot`, a two-board snapshot),
   recorded as the one exception.

What stays the game's: Pearl's `carryOn` and `narrateSquare`, Tracks' `strand`,
`finishEarly` and `parity` evidence, Magnets' `tellCount`.
