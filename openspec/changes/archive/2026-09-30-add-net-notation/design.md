# add-net-notation — design

The owner chose a notation (2026-09-30) over a hint that stalls. Everything
below serves one rule: every fact a Net hint step rests on is something the
player can see or record (AGENTS.md § "Hint quality bar", rule 6).

## D1. What the notation says

One kind of note, on the side two tiles share: **a wire crosses here** or
**no wire crosses here**. It is the one fact Net's reasoning derives beyond a
lock — measured in `sweep-target-verb-input`'s design: with side facts and
locks, the engine `add-net-hint` builds finishes every non-wrapping board and
most wrapping ones, where locks alone stall early. A tile's narrowed set of
turnings is not given a notation: the engine rederives it from the sides and
locks each step, so it is never a fact a step rests on without saying.

## D2. State and moves

- `sides: Uint8Array`, two entries per tile (`sideIndex`): the side right of
  the tile and the side below it, so each side is kept once. On a wrapping grid
  the side off the right edge is the one left of column 0.
- `{ type: "note", x, y, dir, note }`, an **absolute set** named from the tile
  left of the side (`R`) or above it (`D`). Re-applying it changes nothing,
  which keep-track will rely on.
- **Saves**: the move union only grows and a save replays its log, so a save
  written before notes loads unchanged.

## D3. The mode, and the gestures: Slant's

Net takes the collection's notes mode (`ui.pencilMode`, the Marks key and `P`,
the engine's pencil at the canvas's top-right), and Slant's gestures for a mark
between two squares, because Slant is the collection's other game whose notes
sit on a shared side:

- a **tap** notes the side of the tile it lands nearest — left a wire, right
  (or a held finger) none, the same again takes it off;
- from the **keyboard**, a select picks a tile, and a select on a neighbor notes
  the side between them — Enter a wire, Space none — so the keys mean what the
  buttons mean; Escape lets go.

A half-cell cursor (the border-grid games') was the alternative. It would have
given Net two cursors in two coordinate systems for one board, where the
pick-then-neighbor gesture keeps the one cursor and is already how a keyboard
player notes a side in Slant.

Notes-mode input is an arm above the target-verb hand-off. Loopy, Slant and
now Net each have a notes mode whose verbs act on a different target from the
main verbs; whether the model should declare a second verb set per mode is a
question those three raise together, not one Net answers alone.

## D4. The margin

Net drew with no margin (upstream's `NARROW_BORDERS`), so the pencil had no
corner. It grows `pencilIndicatorReach` on every side (`pencilIndicatorCanvas`),
as the other pencil games did, which shrinks Net's tiles slightly on a given
screen. The margin is painted once, on the first frame.

## D5. Rendering

- A wire note is a pencil stub across the side; a no-wire note a pencil ×. The
  first cut drew "no wire" as a bar along the side, which on a horizontal side
  looked exactly like a wire stub across a vertical one (seen in the app,
  2026-09-30).
- Notes are drawn over the wires, since a note is about the solution, whatever
  the tile shows now; each tile draws the half of a note inside its clip.
- The picked tile has a pencil ring inside the cursor's.
- Notes and mistakes live in a word beside the tile's cache word, which has
  three bits free.

## D6. Mistakes

`findMistakes`, which Net's spec used to rule out: every configuration can be
rotated to the solution, so no state was wrong-but-legal. With notes, and with
a lock read as a claim — the facts the hint reasons from — a wrong lock or a
wrong note is such a state. A tile turned wrong but unlocked is not a mistake.
The solution is the solver's, kept per board (every state shares `barriers`);
on a board dealt without "Ensure unique solution" only what the solver settles
is judged.
