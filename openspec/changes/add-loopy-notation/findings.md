# add-loopy-notation — findings

## Plan length with the hint placing notes (2026-09-15)

Measured with the shipped planner: `hint()` on a fresh board, three seeds per
configuration, on the development machine. "Lines" are steps setting edges, which
is the plan length before this change; "corners" and "pairs" are steps placing a
note; "chain" counts the pair steps that join two pairs sharing an edge; "run" is the
most notes placed before one line.

| board | lines | corners | pairs (chain) | run | longest sentence | plan time |
| --- | --- | --- | --- | --- | --- | --- |
| 7×7 squares, Normal | 86–91 | 1–2 | 0 | 1 | 118 | ≤ 4 ms |
| 7×7 squares, Tricky | 87–96 | 19–30 | 0 | 6–11 | 118 | ≤ 4 ms |
| 7×7 squares, Hard | 92–96 | 14–41 | 5–22 (2–10) | 6–19 | 118 | ≤ 6 ms |
| 10×10 squares, Hard | 167–184 | 52–96 | 15–49 (4–22) | 20–23 | 118 | ≤ 7 ms |
| 12×10 triangular, Hard | 288–294 | 54–78 | 14–35 (5–12) | 32–35 | 118 | ≤ 13 ms |
| 10×10 Penrose kite/dart, Hard | 109–113 | 22–45 | 1–10 (0–4) | 7–14 | 118 | ≤ 3 ms |
| 10×10 hats, Hard | 315–334 | 18–23 | 25 (12) | 25 | 119 | ≤ 14 ms |

- **Normal boards place a corner or two.** A clue count at Normal can lean on a
  corner its dot's own line decides. `design.md`'s first table counted those apart,
  as corners a sentence could cite by the dot; the shipped plan places them as notes
  like any other fact, so every line step cites notes the same way.
- **Runs are longer than the first measurement's "most notes before one line"**
  (up to 35 against 25 there), because a note is now placed where its fact was
  found rather than just before the line that uses it (`design.md` D8). The count
  of notes is the same; they arrive earlier, interleaved with the lines found in
  the meantime.
- **Every sentence fits the collection's 120 characters**, so Loopy's entry in
  `hint-quality.test.ts`'s long-narration ledger, which covered the numbered corner
  sentences, is gone.

## A dot's edge order is not a direction

`notes.ts` first assumed a dot's edges run clockwise on screen, as `cursor.ts` and
`dlines.ts` said. Summing each dot's corner angles came to one turn on most tilings
and to `degree − 1` turns on floret and both Penrose tilings, whose edge order runs
the other way; and a hat's corners can be wider than a half turn, which fooled a
probe towards the face's incenter. A corner's angle is now chosen by the face the
corner belongs to, and the two comments are corrected.

## The rule's guards were seen to fail

- Placing no corner note for a fact (`placeCorner` returning before its step):
  `loopy-hint.test.ts`'s "every note a step cites is there when the step is shown"
  fails.
- Taking a corner's angle the way the edge order turns, ignoring the face:
  `loopy-notes.test.ts` fails on floret and both Penrose tilings.
- Dropping `pencilModeKey` from one game's keypad (Keen), and offering the key but
  never acting on it (Solo): `pencil-mode-key.test.ts` fails on that game's case —
  *"keen must offer exactly one Marks key"*, *"solo must consume the Marks key"* —
  and its census case fails beside them.
- Keeping a corner of one's own (Keen returning its old top-left box), and drawing
  no indicator at all (Group's repaint call removed):
  `pencil-indicator-placement.test.ts` fails on those two cases alone, the other
  eleven staying green — *"keen paints polygon at (17, 3) for pencil mode, outside
  the engine's box {"x":315,"y":3,"size":18}"*, *"group draws nothing when pencil
  mode goes on"*. The first is the case the guard exists for: Keen still called
  the engine's helper for its size, so a guard keyed on the import would have
  passed it.

## What the shared toggle costs each game (2026-09-15)

The owner refused a Loopy-only Notes key, so the toggle is now the collection's.
Measured against the eleven cell games as the change found them:

- **Per game: one keypad entry and one call.** `requestKeys` gains
  `pencilModeKey`; `interpretMove` gains `toggleNoteTakingMode(ui, button)`, which
  **replaces** each game's own four-line Enter toggle — eleven identical copies,
  now one. Loopy loses `KEY_NOTES` and `isNotesKey` outright.
- **The keyboard costs nothing per game.** The bare `P` is a shortcut-table row,
  fired only once the game has declined `p`; no registered game claims that letter,
  so `shortcuts.test.ts`'s ledger stays empty.
- **In the browser** (Chrome, dev server): Loopy's keypad is that one key, drawn
  with the inherited `key-marks` icon, and pressing it raises the pencil glyph;
  `P` on the focused board turns it off again. Towers' keypad is `1`–`5`, Clear,
  Marks, and Marks raises its glyph too.

## Where the indicator ended up, in the browser (2026-09-16)

Re-checked in Chrome against the dev server once the engine owned the position,
because the note above described the placement this change replaced — Loopy's
glyph below the board, Towers' inside a clue-ring tile — which was true when it
was written and false the moment the position stopped being each game's own.

In Loopy, Towers, Mathrax, Seismic and Undead the glyph is the same size, in the
same corner of the canvas, at the same inset. The margin the four games grew is
painted rather than bare — Undead's would not have been, since its first frame
filled a board-sized rectangle rather than `computeSize`'s — and Mathrax and
Seismic no longer carry a band below the board. Loopy's widened gutter shows as a
visible margin between the grid and the canvas edge, which is what stops a corner
note on a rim dot being clipped.

## The capability surface moved (2026-09-16)

`capability-surface.test.ts` records each game's draw-state vocabulary, and the
gate caught the two additions this change makes: Towers and Group gained
`pencilModeShown` — Towers because it gave up the tile-cache bit that carried the
mode, Group because it had no indicator at all. Re-baselined deliberately, which
is what that test's own comment asks a change to say out loud.
