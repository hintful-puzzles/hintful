# add-net-notation

## Why

Net's hint must rest only on facts a player can record (AGENTS.md § "Hint
quality bar", rule 6), and a Net player can record one: a lock. Measured
2026-09-30 (`sweep-target-verb-input`'s design, § "Net's hint"), deduction
from locks and walls alone finishes 25 of 30 5×5 boards, 5 of 30 at 11×11,
and never takes a first step on a wrapping grid. With one more kind of fact —
**what crosses the side between two tiles**, a wire or none — the same
reasoning finishes every non-wrapping board measured and 15 to 19 of 20
wrapping ones. The owner chose the notation (2026-09-30).

## What changes

- Net gains **side notes**: on the side two tiles share, "a wire crosses
  here" or "no wire crosses here". They are moves, so undo covers them and a
  save carries them.
- **Notes mode**, the collection's (`ui.pencilMode`, the Marks key and `P`,
  the pencil at the top right), with Slant's gestures for a mark between two
  squares: a tap marks the side nearest it (left: a wire; right or a held
  finger: no wire; again to take it off), and from the keyboard Enter or Space
  picks a tile and then, on a neighbor, Enter notes a wire between them and
  Space notes none. Escape lets go of the first tile.
- **Mistakes**: Net gains `findMistakes` — a note or a lock the solution
  contradicts.
- The help page's Notes section.

The hint that uses the notes is `add-net-hint`.
