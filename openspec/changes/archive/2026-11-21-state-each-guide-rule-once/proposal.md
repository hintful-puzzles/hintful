## Why

`architectural-review` item 9 (owner accepted every item, 2026-11-20).
Measured at `9faabdf61`: the guides total 16,075 lines (about 235K tokens),
and one kind of game routes its author through about 4,400 lines before any
source. Rules are restated in full in two or three places: bounding retry
loops (`engine-catalog.md`, `solver-and-generator.md`), the difficulty
contract (`mechanics.md`, `solver-and-generator.md`), the note-taking cell
(`engine-catalog.md`, `mechanics.md`, `rendering.md`), one step per hint
(`hints.md`, `hints-marks.md`), fixed seeds (twice in `testing.md`). The
next edit updates one copy and leaves the other.

Last in the owner's order: 8, 1, 6, 10, 7, 11, 9, since each earlier change
rewrites guide passages.

## What Changes

- Each rule has one home; every other place points at it by file and
  heading.
- "How every game does X" passages the earlier changes made obsolete go.
- The route by kind of game is re-measured and recorded with its query.
- Docs only; no player-visible change.

## Impact

`docs/`, `README.md` § "Documentation".
