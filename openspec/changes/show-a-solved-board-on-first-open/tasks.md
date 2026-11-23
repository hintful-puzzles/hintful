## 1. Design

Read from the code on 2026-11-23:

- The card is a light-dismissed modal over the board
  (`src/components/first-open-card.ts`, shown by `showFirstOpenCard` in
  `src/screens/puzzle-screen.ts` after the first deal). The example view
  takes the board's place instead, so the card need not hold a picture.
- The card also opens over a shared link's board and a remembered one
  (`app-shell` § "A game shows its first-open card once, whoever opens
  it"): the example is its own board, and the player's comes back.
- The screen remembers the current board as it changes
  (`handlePuzzleGameStateChange`); "Show solution" marks a game solved
  with help, flashes and stops the timer. None of that is the example's.
- The owner's first lean was to solve the board dealt behind the card and
  deal another on Play. That fits a board dealt for this visit only; the
  session may still use it there.

- [x] 1.1 How the example board is made and shown, and returned from:
      a second midend in the view's place, or the live one with the
      player's board set aside. Where the example comes from: dealt at
      the opened size and solved, or a fixed board the description names
      (needed if a callout's target must be guaranteed, such as a Guess
      game that took several questions). Record the choice and why in a
      design.md for this change.
- [ ] 1.2 The callouts' form in the description: under `help:`, each a
      sentence and the part it names, in the description's own terms (a
      clue kind, a value, a given, a unit), which the engine resolves to
      one instance on the example board and marks with the hint marks
      (`ring`, `outline`, `stripes`). A game whose parts the description
      does not name (a hand-written game's art) names them by the marks'
      targets its hint already uses. Record the form, and which
      capability's spec owns it.
- [ ] 1.3 The example view's layout at a phone width and a wide screen,
      how callouts are listed and picked by touch, mouse and keyboard,
      and what a screen reader hears. Where a choice is a close call a
      player would see differently, bring the options to the owner with
      screenshots; otherwise go on.

## 2. Build

- [ ] 2.1 The card's three buttons, Play focused. Test first against
      HEAD.
- [ ] 2.2 The example view: shown in the board's place, solved, counted
      for nothing, and left by Play to the right board. Tests after the
      spec's scenarios, the shared link and the reopening included.
- [ ] 2.3 Callouts: the description's form, its compiler check (a
      callout naming a part the game does not have is refused), the
      engine's resolution to an instance, the marks, and the help page
      showing the same words.
- [ ] 2.4 Callouts written for every game, in batches of a kind at a
      time; a cross-game guard that every game has at least one, reading
      its population from the descriptions. Mines and Guess first, as the
      owner named them.

## 3. In the app

- [ ] 3.1 `playwright-cli`, Chrome: a fill game, a lines game, a
      moving-pieces game, Mines and Guess: first open, the example, each
      callout picked, Play, at a phone width and a wide one, light and
      dark mode, by mouse, touch and keyboard; a shared link's board
      survives. For each kind, judge whether its example teaches what is
      expected, and record it here.
