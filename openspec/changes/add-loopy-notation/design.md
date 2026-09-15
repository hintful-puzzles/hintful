# add-loopy-notation — design

The owner chose a notes-mode toggle over direct hit zones and over face shading
(2026-09-15). Everything below serves one rule: every fact a Loopy hint step rests
on is something the player can see or mark (`AGENTS.md` § "Hint quality bar",
rule 6).

## D1. What the notation says

Two kinds of note, and nothing else, because they are the two kinds of fact the
solver derives beyond lines:

- **A corner** is a dline: two edges adjacent around a dot, which is also one angle
  of a face, or of the outside of the board. It carries *at least one line*, *at
  most one line*, or both (*exactly one*).
- **A pair** is any two distinct edges. It says the two *match* (both lines or
  neither) or are *opposites* (exactly one is a line). Every relation `record.ts`
  records joins two edges sharing a face or a dot, but a parity step can rest on a
  chain of up to 13 of them, and the chain's middle links join edges that are not
  neighbors. The owner chose (2026-09-15) to let a pair link any two edges, so a
  chain is built one link at a time: A–B and B–C are on the board, and the next
  step marks A–C in one sentence.

## D2. State and moves

- `corners: Uint8Array`, one entry per dline (`2 × numEdges`), indexed exactly as
  `dlines.ts` indexes the solver's dline bits and using the same two bits
  (1 at least one, 2 at most one). The hint seeds the solver straight from it.
  The name is deliberately not `pencil`: these are not candidate sets, and `marks`
  is a retired spelling for a typed array (`note-vocabulary.test.ts`).
- `pairs: readonly LoopyPair[]`, `{ a, b, opposite }` with `a < b`, kept sorted, so
  two states with the same notes compare equal.
- Moves are **absolute sets**, like `set`: `{ kind: "corner", dline, bits }` and
  `{ kind: "pair", a, b, relation: "none" | "match" | "opposite" }`. Re-applying
  one is idempotent, which the hint's keep-track relies on.
- **Saves:** the move union only grows, and a save replays its log, so every
  existing save loads unchanged. A test replays a pre-change move log.
- **Undo:** notes are ordinary moves, so undo covers them.

## D3. The mode

- **`ui.pencilMode`**, the collection's word for a note-taking mode. It is Ui
  state, not saved, and off on a new game.
- **Toggled by `P`**, and by an on-screen **Notes** key from `requestKeys`, which is
  how a touch player reaches it. Loopy's right button and a held finger already
  rule an edge out, so the pencil games' "secondary button toggles the mode" is
  not available here. `P` is not one of the app's bare shortcuts (`u`, `r`, `n`,
  `h`).
- **An indicator** whenever the mode is on: the shared pencil glyph
  (`pencil-indicator.ts`). Loopy's board has no spare cell and a border only as
  wide as the cursor disc, so the canvas grows a strip below the board, which is
  Mathrax's answer, without moving the grid.

## D4. Pointer and touch, in notes mode

With the mode off, input is exactly today's.

- **A tap cycles a corner.** The tap resolves to the nearest dot and to the angular
  sector around that dot it falls in, which is one dline. No face lookup is needed,
  so it works on every tiling and at the edge of the board. Left cycles
  none → at least one → at most one → exactly one → none; right, or a held finger,
  cycles the other way; middle clears.
- **A drag cycles a pair.** Pressing near an edge and releasing near a different
  edge cycles that pair: none → match → opposite → none, the other way for the
  right button. A release off the board does nothing. A press counts as a drag once it moves beyond half an edge's
  length from where it went down; below that, the release is a tap. While
  dragging, a connector follows the pointer from the first edge.
- The drag continues off the button class, so a finger that paused before dragging
  (and so arrived as the right button) still cycles a pair (`input.md` § "A touch
  hold arrives as the right button").

## D5. Keyboard, in notes mode

The cursor is unchanged: a dot and a chosen edge, walked and aimed as today.

- **Enter cycles the corner clockwise from the chosen edge** at the cursor's dot,
  and Backspace clears it. Every corner is clockwise from exactly one of its edges
  at its dot, and aiming reaches every edge at a dot, so every corner is reachable.
  The corner Enter would act on is previewed while the mode is on.
- **Space pins the chosen edge, and Space on a second edge cycles the pair** between
  them, then clears the pin. Walking and aiming reach every edge, so every pair is
  reachable. Escape clears a pin before it hides the cursor.
- `loopy-keyboard.test.ts`'s coverage sweep gains corners: every dline of every
  preset is reachable from the keyboard. Pairs need no sweep of their own, since a
  pair is two edges and every edge is already proven reachable.

## D6. Rendering

- A player's corner is a wedge in its angle, as the hint drew one, in the pencil
  color (`pencilColor`): filled for at least one line, outlined for at most one,
  both for exactly one.
- A player's pair is a connector between the two edges' midpoints, marked `=` or
  `≠`, in the pencil color.
- A hint step placing a note draws that note's shape in the hint's action color
  (`docs/games/hints.md` § "Echo the move's shape in the hint color"); the notes it
  reasons from are the player's own, already on the board.

## D7. Mistakes

A corner or pair note that contradicts the unique solution is a mistake: *at least
one* where the solution has neither edge, *at most one* where it has both, a match
where the solution differs, an opposite where it agrees. So the hint may read the
player's notes as facts, as it reads lines.

## D8. The hint

- The solver is seeded from the player's lines **and notes**: a corner note sets its
  dline bits and a pair note merges its relation, each recorded as a fact whose
  premise is "on the board".
- A line firing's closure is walked deepest first. Every fact in it the board does
  not already show becomes **a step placing that note**, narrated by the fact's own
  premise (one clue count, one dot, one corner across the dot, one parity), with
  its parents on the board by then. The line step comes last and cites the notes.
- Facts no line firing rests on are never shown, so a player is never asked to mark
  something no later step uses.
- A pair derived by chaining pairs is placed one link at a time: from A–B and B–C
  on the board, a step marks A–C, citing exactly those two.
- The drawn, numbered chains and their ledger entry are removed.

## Measured (2026-09-15, today's recorder, one plan per board)

Note steps are the facts in some line firing's closure, each counted once; corners
a dot's own lines show (a line arriving from outside, or one line with two ways on)
are counted apart, since a sentence can cite the dot without a note.

| board | line steps | note steps | dot-shown corners | most notes before one line | longest pair chain |
| --- | --- | --- | --- | --- | --- |
| 7×7 squares, Normal | 86 | 0 | 1 | 0 | – |
| 7×7 squares, Tricky | 92 | 21 | 4 | 6 | – |
| 7×7 squares, Hard | 91 | 39 | 8 | 16 | 7 |
| 10×10 squares, Hard | 176 | 71 | 18 | 25 | 7 |
| 12×10 triangular, Hard | 284 | 88 | 11 | 11 | 12 |
| 10×10 Penrose kite/dart, Hard | 110 | 32 | 3 | 4 | 1 |
| 10×10 hats, Hard | 352 | 43 | 17 | 13 | 13 |

**Plan length is affordable**: Tricky and Hard plans grow by roughly a quarter to
two fifths. A long run of notes before one line is the chain made walkable, which
is the point.

**The fallback, if the notation proves unmanageable in play** (owner, 2026-09-15):
the tier that needs it becomes `Unreasonable`, and its hint refuses rather than
teaching what the player cannot record. On today's numbers that would be Hard, whose
pair chains are the notation's heaviest use; Tricky needs corners only.

**Chained pairs** were the one open question the numbers raised: a step can rest
on up to 13 pairs, usually one or two. Settled by letting a pair link any two
edges (D1), so a chain of k pairs costs k − 1 more steps, each a single inference.
