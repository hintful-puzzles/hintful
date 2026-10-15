# Tasks

Written 2026-10-15 by the session that took the change up.

## 1. The engine

- [x] 1.1 `RulesOut` on `Game` (`engine/game.ts`).
- [x] 1.2 The midend: the `auto-cross` preference beside the game's own, the
      brought move as a joined entry after a player's move and a hint's
      gesture, the keep-track asked of the placement alone, and the plan cut
      after its first step that brings marks.
- [x] 1.3 The save keeps the joins (`engine/save.ts`), and a reloaded drag
      comes off in one Undo.
- [x] 1.4 Midend tests on the fake game (`engine/rules-out.test.ts`): the
      preference and its words, one Undo, the save round trip (seen to fail
      with the joins dropped on load), and the plan's end.

## 2. The games

- [x] 2.1 Star Battle onto it: `markWith`'s append, `ruledOutBy` as `bring`,
      `trackMade`'s allowance, the hint's cut and `autoCross` go.
- [x] 2.2 Tents declares it.
- [x] 2.3 Light Up declares it.
- [x] 2.4 The guard (`engine/rules-out.test.ts`). Seen to fail with an
      unsound Star Battle `bring` planted, and in Star Battle and Tents with
      the midend's plan cut taken out. Light Up passed without the cut,
      because its `refreshHintStep` drops what the crosses settled.

## 3. Words and records

- [x] 3.1 Help pages of the three games: each says what its placement rules
      out, and `{{rules-out}}` writes the sentence on the preference from its
      words (`engine/rules-out.ts`, `vite-plugins/note-controls.ts`). A
      `features.md` section, `#rules-out`.
- [x] 3.2 Guides: `docs/hints-marks.md` § "A move with side effects ends the
      plan", `docs/input.md`, `docs/mechanics.md` § "Preferences".
- [x] 3.3 Spec deltas: `engine-input`, `engine-hints`, `starbattle`, `tents`,
      `lightup`.
- [x] 3.4 Run the app (2026-10-15): each game's preference and its words in
      the dialog. A placement brings its marks and one Undo takes both. A
      hint-played placement brings them, and the next step reads them. The
      help pages show the generated sentence.
- [x] 3.5 Show the owner (proposal § "For the owner"), with the question of
      the move counter: a brought set shows as a move of its own in the
      timeline, as a drag's marks already do. The owner approved both
      preferences' words and the recommendation to leave the counter as it
      is, 2026-10-15.
