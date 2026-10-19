# show-what-a-hint-names

## Why

The owner (2026-10-18), from a phone screenshot of ABCD: the hint drawn as a
tab rising out of the panel under it "looks really weird with game-specific
buttons". On a phone the panel under the hint is the Game controls: separate
outlined keys on the page, with no surface for a tab to rise out of, so the
hint's open foot runs into the keys and reads as part of the keypad, not as
what the Hint button in the Bar said. Their requirements for the fix: opening a
hint does not move the board, and a player can apply the hint to the board by
hand while reading it.

They also asked that a hint's words lead to what they name: "how about if you
could click/tap any of the references in the hint, and have it highlight the
referred element on the board?" The sentence "the outlined cells fit only 2
apart … this cell must be A" asks the player to find which marks are "the
outlined cells" and which is "this cell" by elimination.

## What Changes

- **The hint stands on the Bar.** The words row goes under the Game controls
  where those are under the board, so the hint is the Bar's offshoot in every
  layout, or the window's edge where the Bar is at the side. Its room is kept
  as before, so a hint still moves neither the board nor a control, and the
  keys stay in reach while it shows.
- **Every reference in a hint's words is a pill.** Pressing one, or a mouse
  coming over it, blinks the marks that reference names three times while
  every other mark of the step stays drawn. A first cut drew the pressed
  reference's marks alone; the owner (2026-10-18): "I don't like that you made
  clicking on a reference remove the other referred elements … they should
  all stay up, but … the one … referring to would just get an additional
  temporary highlight effect." The words are drawn as the references the step
  was built from (`Narration`), so no game writes anything: every bound game
  paints its marks from the words (`stepMarks`), and the engine hands the
  renderer the step with the one reference's elements taken out, which the
  frontend alternates with the whole step. A glow would need each game to
  draw it; a blink is the highlight the engine can give every game.
- **The pressed reference's marks flash once, and the blink is gone.** The
  owner (2026-10-19): "the blinking is too much. How about just a short turn
  to white … and have it go back to itself in a second?" A recolor is still
  one no game should draw, so the worker draws the step with and without the
  reference in one task, never shown, and the pixels that differ are its
  marks in any game's shapes and colors; the app lays them over the board in
  white and fades them back over a second. On the light board white is lost
  on the pale tiles, so there they are black.
- **The hint's room is measured by the longest hint the engine allows.** The
  owner (2026-10-19): "I don't want any exceptions … all games' boards give
  sufficient berth to the hint element." Two lines, three where the window is
  not wide, let Untangle's three-line hint move the board at 1000 by 686. The
  room now holds an unseen hint of `NARRATION_LIMIT` characters and a fifth
  more, which a word breaking late on each line can take, with a journey line
  over it, at the window's own width.

Considered and declined: tinting each reference in the color of its mark. A
role has no one color across the collection: a game picks its own palette slot
for each role, some draw one role in several colors by the kind of move, and
some have spent the hint blue on something else. A tint would be false in
those games; pressing shows the marks themselves, which cannot be.

## Impact

- `app-shell`: the hint's place, and the references as controls.
  `src/puzzle/layout.ts`, `src/screens/puzzle-screen.ts`, `src/puzzle/puzzle.ts`.
- `engine-hints`: a displayed step's words go to the frontend as spans with
  their references, and the midend narrows the drawn step to one.
  `src/engine/hint-words.ts`, `src/engine/midend.ts`, `src/engine/types.ts`.
- No game changes; no save, ID or preference changes.
