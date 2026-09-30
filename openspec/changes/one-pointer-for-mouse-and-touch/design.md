# Design: one pointer for mouse and touch

## D1. Remove the vocabulary, not only the producer

The frontend no longer sends middle-button codes or `MOD_STYLUS`, and the
engine no longer exports them: `MIDDLE_BUTTON`/`_DRAG`/`_RELEASE`, `MOD_STYLUS`
and `Game.wantsStylusModifier` are gone from `pointer.ts`, `types.ts` and
`game.ts`. So a game that tries to bind the middle button fails to compile,
rather than a guard noticing afterwards. The numeric codes (0x0201, 0x0204,
0x0207, 0x0800) are left unused rather than reused, and `isMouseDown` and its
siblings test the two buttons exactly instead of a range that would take in the
unused codes (`pointer.test.ts` pins that).

`MOD_MASK` becomes `0x7000`, the three key modifiers exactly.

## D2. Where the guarantee is checked moved to the frontend

`touch-input.test.ts` and the finger-vs-mouse gesture sweep in
`input-parity.test.ts` compared a game's answer to `LEFT_BUTTON` with its
answer to `LEFT_BUTTON | MOD_STYLUS`. With the bit gone the two inputs are the
same, and those sweeps would compare a sequence with itself, so they are
retired. The property they protected, that a finger does what a mouse does,
now depends entirely on `view-interactive.ts`'s mapping, and
`view-interactive.test.ts` § "one pointer, two buttons" checks the codes a game
receives: a touch tap, a pen tap and a click send `LEFT_BUTTON`/`LEFT_RELEASE`
exactly; Shift, Ctrl or Command held changes nothing; the middle button sends
nothing. I planted a pen `| 0x0800` and a Shift remap to prove it fails.

Nothing else in the retired files was lost. Their vacuity counts guarded the
sweeps themselves, and the long-press trap stays guarded by the
`ignoresSecondaryButton` biconditional.

## D3. Each game, and why its route is enough

Population by reference (`npm run refs` on the three middle constants and
`MOD_STYLUS`, plus the verb model's `middle` slot), then read, since the Mines
test spelled the codes out as `0x0201`/`0x0207`, which references cannot see.

| Game | Middle / stylus did | Route now |
| --- | --- | --- |
| Ascent | middle: clear a number or line | right-click and right-drag already clear; right cycles a two-candidate cell through empty |
| Boats | middle-drag: clear a line whatever it holds | left cycles B → W → empty and right toggles water, so every square reaches empty |
| Loopy | middle: clear an edge; stylus 3-cycle | left and right each clear a decided edge; Backspace/Delete become a `keyOnly` verb; the notes' clear is reached by cycling |
| Mines | middle: chord, with a 3×3 preview | the left click already chords a satisfied number; the preview now shows on a left press exactly where the release will chord |
| Net | middle: lock | `S` (`keyOnly`), and a tap in the middle third of a tile in notes mode (D4) |
| Pattern | middle-drag: clear a rectangle; stylus 3-cycle | the mouse cycles as Enter/Space and touch did (D5), so a drag whose first square cycles to gray erases the rectangle |
| Pearl | middle: a third copy of the press | nothing to replace |
| Salad | middle: cycle ball → cross → blank | select the square, then the on-screen `O`, `X`, clear keys (`salad.test.ts`) |
| Sticks | middle-drag: clear | a drag starting along a matching line clears; a click cycles through blank |
| Subsets | middle: reset to unknown | the right cycle reaches unknown; Backspace a `keyOnly` verb |
| Unruly | middle: empty | both cycles pass through empty; Backspace a `keyOnly` verb |

A clear that a button cycle already reaches is a convention now written in
`docs/games/input.md` § "One pointer, two buttons": it needs no control of its
own, and a game may keep the key as a keyboard convenience.

## D4. Net's lock is a notes-mode tap in the middle of a tile

Outside notes mode both buttons rotate, and three things need the pointer:
anticlockwise, clockwise, lock. I considered three places for the lock:

- **Right button = lock**, clockwise by three left taps. It costs every mouse
  player the clockwise click they have had since upstream.
- **A separate Lock mode key.** Unambiguous, but a second mode beside notes
  mode, and so a second thing to turn off.
- **In notes mode, a tap in the middle of a tile** (chosen). A lock is the
  player's mark of certainty, the same kind of thing as a side note, and Net's
  hint already treats locks, notes and walls as the player's notation. Notes-mode
  taps were already position-sensitive (the nearest side). Loopy's notes mode
  sets the precedent: where a tap lands decides which note it makes.

The zone is the middle third (`LOCK_ZONE`), leaving each side a band a third of
a tile deep, and either button locks there. It was run in the app: two locks
and a side note from three taps.

The hint builds its moves from the verbs (`add-net-hint` D5), so the lock verb
moved from `middle` to `keyOnly[1]` and `verbMove` takes the two key-only verbs
by position, as it already took the half turn.

## D5. Pattern: the mouse joins the keyboard and touch

Pattern had three schemes: a mouse press set black (left) or white (right)
outright, touch cycled three states, and Enter/Space cycled three states. Two of
the three already agreed, so the mouse moved to them: a press cycles the pressed
cell (`Unknown → Full → Empty` left, the reverse right), and the drag paints
that new value. It reuses the existing rules unchanged: a multi-cell paint fills
only blank cells, and an `Unknown` drag erases a rectangle. Run in the app: a
right-drag painted five cells white in one move, and single clicks cycled white
→ gray → black → white.

Loopy went the other way for the same reason: its keyboard is the mouse's two
buttons, so touch moved to them.

## D6. Mines: the preview follows the release

Upstream shows the 3×3 "pressed" preview only on the middle-button chord, and
the left click shows none because on an unsatisfied number it would flash a false
uncover. With the middle button gone the preview would have disappeared. It now
shows exactly where the release will chord: a left press on a number whose flags
are all placed, and never for a press that opens a covered square and is dragged
over a number (`mines.test.ts`).

## D7. The right-drag advice was false

`help/features.md` told mouse players that browsers hide a right-button drag
and to Ctrl-drag instead, which was inherited from the parent project's help. A real
right-button drag in Chrome (playwright, CDP input) reached Pattern as a
`RIGHT_DRAG` and painted a row. Chrome is this phase's only target (AGENTS.md),
so the section is replaced by one saying a mouse and a finger play the same way.
