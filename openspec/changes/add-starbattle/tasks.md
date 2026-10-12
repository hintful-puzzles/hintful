# Tasks

The spec delta here holds only the rules. The session writes the rest of it
as it builds, to the form `order-and-shrink-the-game-specs` leaves.

## 0. Before writing

- [ ] 0.1 Start `findings.md` with the log's three headings (questions not
      about the puzzle; tokens by phase; what was left) and add to it as the
      work goes, never afterwards.
- [ ] 0.2 Stamp the skeleton. Decide in `design.md`: the desc's encoding of
      regions (read what `engine/wall-runs.ts` already encodes), the params
      letters, the presets, the click cycle, and the family in the catalog.

## 1. Rules, state and solver

- [ ] 1.1 State, desc codec, `status`, `executeMove`.
- [ ] 1.2 The deduction rungs on the shared runner, each with a board that
      needs it; a search tier only if dealt boards show the rungs leave a
      size or star count undealt.
- [ ] 1.3 `findMistakes` against the answer.

## 2. Generator

- [ ] 2.1 Place stars, take the regions around them from the engine's
      division, and keep a board the solver finishes at exactly its tier.
- [ ] 2.2 Measure the deal at every preset and at the edges of the Custom
      dialog, and refuse what cannot be dealt.

## 3. Input and drawing

- [ ] 3.1 Target verbs for the star and the cross, a drag that crosses, the
      keyboard cursor.
- [ ] 3.2 `render.ts`: thick region borders, the star, the cross, a unit
      with too many stars or two stars touching shown live.
- [ ] 3.3 Run it in the browser, with touch, keyboard and mouse, light and
      dark, at phone width.

## 4. Hint

- [ ] 4.1 One step per deduction, saying why the star or cross is forced,
      from marks the player can make; the sentences in `hint-text.ts`.
- [ ] 4.2 Its pins, and the one command green.
- [ ] 4.3 Read every sentence on a real board in the browser. A subagent
      that has not seen the code reads ten steps cold and says what it
      could not follow.

## 5. Spec, help, registration

- [ ] 5.1 The spec, the help page, the catalog entry and the icons.
- [ ] 5.2 Gate, commit, push. `findings.md` finished, with what the engine
      should have answered filed as the engine's.

## 6. Acceptance

- [ ] 6.1 The owner plays it. Archive on their word, together with
      `fit-a-new-game-in-one-session`.
