# give-map-element-keys

## Why

**Map was the last game whose elements were enumerable and off the panel.**
`give-rome-its-element-keypad` established the rule — a game's markable
elements belong on the on-screen panel wherever its notes are an enumerable
per-cell set — and left Map as an open question, because Map's mark is set by
dragging *from* a region already wearing the color. Giving Map element keys
therefore meant giving it key entry for colors too, which is a change to how
the game is *played* and not only to how its notes are reached.

The owner settled it (2026-09-21): *"my goal is to make the UX as consistent and
unsurprising as we can make it, across games."* So Map joins the rule, colors
and all. Dragging still works and is unchanged; the panel is a second way in.

## What the scaffold got wrong, and why that made this cheap

The open question said selection *"has to be carved out of behavior that already
does something"*, because Map's taps begin a drag. **They don't commit
anything.** A tap is a press and a release on one region: the press picks that
region's own color up, and the release drops it back, which `drop` answers with
"nothing changed" before it reaches any move. Map's tap was as bare a no-op as
Rome's, so selecting on it is additive — exactly the check
`docs/games/input.md` tells you to make before adding a keypad to a drag game.

The other half is that **`drop` already was the whole vocabulary**: it takes a
held color and a notes flag, turns a held color into a pencil toggle when the
flag is on, refuses a clue, refuses penciling a colored region, and yields no
move where nothing changes. A key is a pick-up, so key entry is *set what the
key holds, then drop it at the cursor* — no second input path.

## What changes

- **Four color keys and Clear**, with the engine appending Marks as it does for
  every note-taking game. `1`–`4` color the region at the cursor; in notes mode
  the same keys toggle that color as a mark; Clear empties the region.
- **A tap selects the region under it**, quadrant and all — the cursor is a cell
  *plus a direction*, and a tap knows its triangle directly, so the two are
  translated rather than approximated. Without this every panel key is dead on
  touch, which is the trap `input-parity.test.ts` structurally cannot see: it
  walks the cursor with arrow keys first.
- **`KeyLabel.swatch`**, a palette index the panel paints the key in. Map's
  element is a color and no character names it; a bare `"1"` would make the
  player learn which color one *is*. The index resolves against the game's own
  palette, published as `Puzzle.palette` from the array the canvas is painted
  from — so the keys follow the board into dark mode rather than being authored
  twice. The label stays the character the key sends.

## The bug this found, which was not Map's

Driving the real app turned up a **collection-wide** defect. The board listens
for `keydown` on itself, and `puzzle-screen`'s window-level redirect only fires
when `document.activeElement` is the body — so a `mousedown` on an on-screen key
focused that button and left the physical keyboard dead in **every** keypad game
until the player clicked the board again. The rail already had an answer to the
same hole (`focusBoard`); the panel, which is not a `data-command` control and
sits outside the chrome, never got one. The panel now prevents the `mousedown`
default, so focus never moves at all.

**No behavioral tier could have caught it.** Tiers 1–2.5 call `processInput`
directly, so the panel and the keyboard both work in a suite that is green over
a game nobody can type into. Checked in Chrome against Map *and* Solo.

## What replaces the assurance

Nothing here is gated by a fixture: Map's generator, solver and codec are
untouched. What is new is input, and it is held by

- the pinned `KeyLabel[]` (a fifth key or a renumbered swatch fails);
- a sweep asserting the tap→cursor translation is lossless over the whole board,
  with a vacuity guard that it reached a split cell at all;
- a Midend-level test that a key reaches a region after **a tap alone, with no
  drag anywhere** — the question `input-parity.test.ts` cannot ask;
- `input-parity.test.ts`'s existing "no on-screen key is inert", which Map
  enrolled in by acquiring `requestKeys` and now passes for all five keys.

Each was watched to fail with the behavior deliberately broken.
