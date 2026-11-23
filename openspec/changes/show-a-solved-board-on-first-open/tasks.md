## 1. Choose the approach

The owner leans toward solving the board already dealt behind the card and
dealing another on Play; the approach is this session's to choose. Weigh
it against these, read from the code on 2026-11-23:

- The card is a modal over the board, light-dismissed; on a phone it sits
  at the bottom with the board above, and on a wide screen it covers the
  board's middle. A solved board behind it is half hidden on a wide
  screen, so the card may need to move aside, or hold the picture itself.
- The card also opens over a shared link's board and a remembered one
  (`app-shell` § "A game shows its first-open card once, whoever opens
  it"). Solving the board behind the card would spend that board; the
  lean fits only a board freshly dealt for this open.
- The screen remembers the current board as it changes
  (`handlePuzzleGameStateChange`), so a solved board must not be what is
  remembered; and "Show solution" marks the game solved with help, flashes
  and stops the timer, none of which is the player's.
- A picture drawn apart from the live board (a second midend drawing a
  solved copy into the card, as the engine's SVG drawing in
  `src/engine/testing/svg-drawing.ts` already does for tests) avoids all
  three, at the cost of a second drawing path.
- Every game has a `solve`, but a solved board teaches less in some kinds:
  a moving-pieces game's solved position (Slide, Sokoban), or a hidden
  information game's (Mines, Guess). Show those too, as consistency, unless
  the app shows one is misleading; say which in the choice.

- [ ] 1.1 Choose, try it in the app on a phone width and a wide screen,
      and record the choice and why in a design.md for this change.
      Where the choice is a close call a player would see differently,
      bring both to the owner with screenshots; otherwise go on.

## 2. Build

- [ ] 2.1 The card shows a solved board, by the choice in 1.1. Verified
      by a component or screen test that opens a game for the first time
      and finds a solved board shown, and the board in front of the player
      after Play unsolved, with no win, status or timer from the solve,
      failing first against HEAD.
- [ ] 2.2 A shared link's board and a remembered one survive the card:
      a test for each, after the spec's scenarios.
- [ ] 2.3 In the app (`playwright-cli`, Chrome): three games of different
      kinds (a fill game, a lines game, a moving-pieces game), first open
      at a phone width and a wide one, light and dark mode, by mouse,
      touch and keyboard (Play has the focus; Escape closes). The help
      page's words on the first open, if any, match.
