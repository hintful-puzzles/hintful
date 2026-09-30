# Input affordance inventory (2026-09-30)

A record of one measurement, taken once, and what was done about each
finding. It is not maintained: the guarantees that replace it are in
`design.md`, and a later reader should re-measure rather than trust these rows.

## How it was measured

A throwaway probe drove every registered game's default board through a real
`Midend` with each input alone:

- **Pointer**: left and right clicks at every quarter-tile point, drags between
  points up to two tiles apart, every on-screen keypad key, and a keypad key or
  a click that changed only the `Ui` (a mode, a selection) followed by any of
  those.
- **Keyboard**: every code the frontend delivers (arrows, Enter, Space,
  Escape, Delete, printable characters, each with Shift, Ctrl or the keypad
  bit), pressed at every position the keyboard can walk to: the arrow closure,
  then up to two plain keys and two arrows beyond it.

Each resulting board was classified by the **kind** of change it made (the
state leaves changed, indices wildcarded, with their old and new values). A
kind one input made and the other never did in one action was then searched
for as a sequence of the other input's actions, up to three deep, comparing
boards **as painted** (a fresh `Ui` and draw state), so bookkeeping the player
cannot see did not count as a difference. Up to twelve boards per game were
used as starting points, each a new kind reached from an earlier one.

Three things the probe could not see, each read by hand instead:
app controls outside the board (the mark-all command sends `M`), keys the
frontend never delivers, and randomness (Net's jumble gives a different board
on every replay, so it was reported, not searched).

**Why it is not a standing guard.** A full run took over two hours across two
processes; Galaxies alone took fifty minutes before the per-tile target cap,
and a game whose `Ui` records the press position (Map) made every probe point
look distinct. More to the point, a behavioral sweep finds a gap after someone
writes it. The owner's aim (2026-09-30) is that a gap cannot be written: see
`design.md`.

## Findings and their answers

| Game | Finding | Answer |
| --- | --- | --- |
| Net | Ctrl+arrow (move the source), J (jumble) and, on a wrapping grid, Shift+arrow (scroll) have no pointer route | Owner's choice: a **Source** keypad key arming a tap, a **Jumble** keypad key, and a drag in the margin of a wrapping grid (D3) |
| Ascent | A number goes into an arbitrary empty square only by typing, and there is no keypad; the hint's "within reach" steps place such numbers, so a touch player cannot follow them | A number keypad, `1`–`9`, `0` and Clear (D4) |
| Group | Reordering the table (drag a heading) and toggling a subgroup line (click between headings) have no keyboard route | Shift+arrow reorders; `\|` and `-` toggle the lines after the cursor's column and below its row (D5) |
| Net, Slant, Unruly, Loopy, Subsets | `keyOnly` verbs: each has a pointer route, but only in prose | Declared and tested (D1, D2) |
| Loopy | Help still said a tap cycles an edge through three states, which `one-pointer-for-mouse-and-touch` removed | Sentence deleted |

## Reported, and not gaps

- **Mark-all (`M`)** in Keen, Solo, Towers, Unequal and Group: the rail and the
  phone bar offer it as a control, which sends `M`.
- **Untangle**: a drag lands a vertex on any pixel and the keyboard nudges it by
  half a tile, so neither reproduces the other's exact coordinates. Both move
  any vertex anywhere to within half a tile; this is a difference of resolution,
  not a missing action.
- **Mosaic**: the pointer paints up to five squares in one drag. The keyboard
  paints one square a key, and the search, three actions deep, found 13 of the
  16 such kinds; the rest were longer paints.
- **Ascent's `path` kind**: a cached derived field on the state, not a move.

## Measured only in part

These ran out of their time budget or keyboard-position cap, so their clean
rows mean "nothing found in what was walked", not "nothing there":
Galaxies, Loopy, Map, Pearl (opening board only); Keen, Rome, Seismic, Slant,
Solo, Spokes, Towers (budget ran out partway through the searches). Loopy's
notes are the largest unwalked part, and its keyboard notes (Enter for a
corner, Space to pin a pair) are covered by `loopy-notes.test.ts` § "notes
mode by keyboard", which holds each to the tap that makes it; the
others' input is in the target-verb model, whose keys `target-verb.test.ts`
holds to its buttons.

## Every other game

The two inputs made the same kinds, or the other input's sequence was found:
Abcd, Black Box, Boats, Bricks, Bridges, Clusters, Crossing, Cube, Dominosa,
Fifteen, Filling, Flip, Flood, Guess, Inertia, Light Up, Magnets, Mathrax,
Mines, Netslide, Palisade, Pattern, Pegs, Range, Rect, Salad, Samegame,
Separate, Signpost, Singles, Sixteen, Sokoban, Sticks, Tents, Tracks, Twiddle,
Undead.
