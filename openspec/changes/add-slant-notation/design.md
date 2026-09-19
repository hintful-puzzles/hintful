# add-slant-notation — design

Every fact a Slant hint step rests on must be something the player can see or mark
(`AGENTS.md` § "Hint quality bar", rule 6). Slant's solver keeps one kind of fact the
board cannot show: that two squares are *equivalent*, so they slant the same way.
This change gives players a mark for that fact and has the hint place it.

## D1. What the measurement found (task 1.1)

`SlantTrace` records why each equivalence merge holds, and why each v-shape was ruled
out. Measured on opening plans, 20 seeds per preset, with a throwaway walk:

| Preset | boards citing a merge | equivalence firings | clue firings counting a pair | cited merges | clue / v-shape | v-shape depth 1 / 2+ |
|---|---|---|---|---|---|---|
| 5x5 Easy | 9 | 7 | 6 | 15 | 15 / 0 | 0 / 0 |
| 5x5 Hard | 20 | 2 | 59 | 58 | 50 / 8 | 4 / 1 |
| 8x8 Easy | 14 | 26 | 16 | 37 | 37 / 0 | 0 / 0 |
| 8x8 Hard | 20 | 31 | 140 | 143 | 105 / 38 | 17 / 5 |
| 12x10 Easy | 20 | 38 | 49 | 89 | 89 / 0 | 0 / 0 |
| 12x10 Hard | 20 | 64 | 315 | 286 | 188 / 98 | 41 / 7 |

(The hint always runs the full solver, which is why Easy boards cite merges too.)

Four things follow.

- **Every merge joins two edge-adjacent squares, and every one means "the same
  slant".** A clue pair is two squares adjacent around a point, and a v-shape pair
  shares a side. The solver never derives "opposite slants", so the notation has no
  opposite mark.
- **The audit missed an arm.** A clue firing that counts an equivalent pair as one
  line (`meq` in `slantSolve`) rests on the equivalence as much as the equivalence
  step does. It fires about five times as often, and its sentence was false as well:
  "every empty square left around it" left the pair's two squares empty. It now
  names the mark.
- **Chains are short.** The path from a cited square to its partner through the
  recorded merges is one link in all but 11 of 700 citations, and at most 4.
- **A v-shape merge rests on two ruled-out v-shapes**, each ruled out by a 1 or 3
  clue, by a diagonal already in the pair, or by the same v-shape ruled out across a
  2. The last is the only chain inside a premise, and it runs straight along a line
  of 2s. It is a sixth of the merges and two or three a board at 12x10 Hard. Every
  link is a clue or a diagonal on the board, so it needs no second note kind. The
  step names the clues it went through (D7).

## D2. The mark

A **same-slant mark** joins two squares that share a side: an `=` drawn across the
middle of that side, in the pencil color. The middle of a side is the one place a
diagonal never passes and a clue circle never reaches, so the mark never hides
anything. A chain of marks reads as a chain, which is the same kind of reading as
following diagonals to a loop.

## D3. State and moves

- `SlantState.alike: Uint8Array`, per square: bit 1 marks the square and its right
  neighbor, bit 2 the square and the one below.
- Move `{ type: "alike", x, y, dir: "right" | "down", on }` is an **absolute set**,
  so replaying it is idempotent, which keep-track relies on.
- Saves: the move union only grows, and a save replays its log, so every existing
  save loads unchanged. `slant-notes.test.ts` replays a log of diagonals alone.
- Undo covers marks because they are ordinary moves.

## D4. The mode

- `ui.pencilMode`, toggled by the collection's Marks key (`pencilModeKey`, the only
  key on Slant's keypad) and the app's bare `P`, exactly as in Loopy. Slant's right
  button and held finger already cycle a square the other way, so they cannot be the
  toggle.
- The pencil glyph sits at `pencilIndicatorBox`. The top-right corner of the canvas
  holds a clue circle, so Slant's border grows by `pencilIndicatorReach` on every
  side, keeping the board centered. The corner ring tile repaints over the glyph's box
  when it redraws, so a redraw of that tile resets the indicator's cache.

## D5. Input in notes mode

With the mode off, input is exactly as before.

- **A tap toggles the mark on the side of the square nearest the tap.** The four
  triangles the diagonals cut a square into map to its four sides, so a tap anywhere
  hits something, and a tap on either side of a shared side hits the same mark. Every
  button toggles, since the mark has two states; a tap nearest the board's outer edge
  does nothing.
- **Keyboard.** Enter or Space pins the cursor square (outlined in the pencil color).
  On a square beside the pin it toggles the mark between them and lets go of the pin.
  On the pinned square it lets go, and on any other square it moves the pin there.
  Escape lets go of a pin. The arrows move the cursor as before, and `\`, `/` and
  Backspace still set the square. Every shared side has two squares the cursor can
  reach, so every mark can be reached.

## D6. Mistakes

A mark between two squares whose solution slants differ is a mistake, drawn in the
mistake color. `findMistakes` returns it with the side it sits on, so the hint may
read the player's marks as facts, as it reads diagonals.

## D7. The hint

- The solver is seeded from the player's diagonals **and marks**: a mark merges its two
  squares' classes and is recorded as a merge whose premise is "on the board".
- A firing that uses an equivalence cites **the marks on the path** between the two
  squares in the recorded merges: the path from the forced square to the nearest
  placed one, or between the two squares a clue counts as one line. Every merge on a
  cited path that the board does not already show becomes a step placing that mark,
  narrated by its own premise. So does every merge a clue-pair premise cites in turn.
  Merges no firing uses are never placed.
- A mark is placed **just before the firing that first cites it** if its sentence
  still holds on that board, and otherwise where it was found. A v-shape premise
  (clues and placed diagonals) only stays true as the board fills. A clue-pair
  premise ("only these two squares around it are empty") can expire, so it is
  re-checked against the board it would be shown on.
- A v-shape step names both ruled-out v-shapes and where each end is: *"These two
  can't both touch the 1 above, or both slant away from the 3 below, so they must
  slant the same way."* A placed diagonal reads *"touch the corner above, as one
  already slants away from it"*, and a 1 (or 3) at both ends reads *"touch either
  1"*. Across a 2 the clause says what limits the pair on the far side: *"touch
  the 2 below, as the pair across it can't both touch the 1"*. A line of 2s holds
  one kind of limit all the way along (`lineReason` checks it, and never saw it
  fail on 27,009 steps), so it is said once: *"as along the 2s beyond it, the last
  pair can't both touch the 1"*.
- Those across-a-2 sentences are the only ones over the 120-character limit: 210
  of 27,009 steps over 60 boards per preset, 275 at the longest. They are one
  ledgered template in `hint-quality.test.ts`. Every other step is within 120.
- Keep-track: a mark step completes when the player sets that mark.
- The honest chain tier, and the anchor with no reason given, are removed.

**The fallback, if the notation proves unmanageable in play**, is the tier: Hard's
hint would refuse where it needs an unmarkable fact. Nothing measured points there,
since every merge is one mark.
