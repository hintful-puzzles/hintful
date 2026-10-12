# Tasks

## 0. Before writing

- [x] 0.1 Start `findings.md` with the log's three headings (questions not
      about the puzzle; tokens by phase; what was left) and add to it as the
      work goes, never afterwards.
- [x] 0.2 Stamp the skeleton. Decide in `design.md`: the desc's encoding of
      regions (read what `engine/wall-runs.ts` already encodes), the params
      letters, the presets, the click cycle, and the family in the catalog.

## 1. Rules, state and solver

- [x] 1.1 State, desc codec, `status`, `executeMove`.
- [x] 1.2 The deduction rungs on the shared runner, each with a board that
      needs it; a search tier only if dealt boards show the rungs leave a
      size or star count undealt. No search tier: every star count deals at
      every tier somewhere in its range (`design.md` has the table).
- [x] 1.3 `findMistakes` against the answer.

## 2. Generator

- [x] 2.1 Place stars, take the regions around them from the engine's
      division, and keep a board the solver finishes at exactly its tier.
      The division alone almost never has one answer, so the board is
      mended a cell at a time (`design.md` § "The generator").
- [x] 2.2 Measure the deal at every preset and at the edges of the Custom
      dialog, and refuse what cannot be dealt.

## 3. Input and drawing

- [x] 3.1 Target verbs for the star and the cross, a drag that crosses, the
      keyboard cursor.
- [x] 3.2 `render.ts`: thick region borders, the star, the cross, a unit
      with too many stars or two stars touching shown live.
- [x] 3.3 Run it in the browser, with touch, keyboard and mouse, light and
      dark, at phone width. Done 2026-10-13 in Chrome with mouse clicks, a
      drag, the keyboard cursor, both schemes and a 412 px viewport. A real
      finger was not put on it: the touch hold is the engine's and reaches
      the game as the right button, which was clicked.

## 4. Hint

- [x] 4.1 One step per deduction, saying why the star or cross is forced,
      from marks the player can make; the sentences in `hint-text.ts`.
- [x] 4.2 Its pins, and the one command green.
- [x] 4.3 Read every sentence on a real board in the browser. A subagent
      that has not seen the code reads ten steps cold and says what it
      could not follow. It read four frames and twelve sentences, found
      every pictured claim true, and asked for five rewordings and a
      heavier outline, all made.

## 5. Spec, help, registration

- [x] 5.1 The spec, the help page, the catalog entry and the icons.
- [x] 5.2 Gate, commit, push. `findings.md` finished, with what the engine
      should have answered filed as the engine's
      (`own-what-starbattle-wrote-for-the-engine`).

## 6. Acceptance

- [ ] 6.1 The owner plays it. Archive on their word, together with
      `fit-a-new-game-in-one-session`. The spec is already synced to
      `openspec/specs/starbattle/spec.md`, because the gate asks a registered
      game for its spec, so the archive skips the spec merge
      (`openspec archive add-starbattle --skip-specs`); a requirement
      changed on the owner's word is changed in both files first.
