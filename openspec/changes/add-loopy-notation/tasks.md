# add-loopy-notation — tasks

Read `AGENTS.md` § "Hint quality bar" (rule 6) and `docs/games/hints.md`
§ "Give the facts a notation (Loopy)" first.

## 0. Record the rule

- [x] 0.1 `AGENTS.md` rule 6, `hints.md` (quality bar, § "Cognitive load", the Loopy
      section), `mechanics.md` § "Affordances", `solver-and-generator.md`'s Tactic
      note.
- [x] 0.2 `ts-engine` spec delta: a hint relies only on marks the player can make.

## 1. Design

- [x] 1.1 `design.md`: corner and pair input on every tiling (pointer, touch, held
      finger, keyboard), rendering, save compatibility.
- [x] 1.2 Measure what the hint needs from the notation: the facts a line
      conclusion actually rests on, and the Hard plan length with one fact per step
      (`findings.md`).

## 2. The notation

- [x] 2.1 State and moves for corner and pair marks; `executeMove`; saves replay.
- [x] 2.2 Input and rendering; keyboard reachability on every tiling
      (`loopy-notes.test.ts`).
- [x] 2.3 `findMistakes` flags a note that contradicts the solution.

## 3. The hint

- [x] 3.1 Steps place notes as moves; premises read the player's notes; remove the
      drawn and numbered chains.
- [x] 3.2 Loopy spec delta replacing "Loopy explains the next deduction".
- [x] 3.3 Update `loopy-hint.test.ts`, the guides and `help/games/loopy.md`.

## 4. One notes UX, not Loopy's own

Owner, 2026-09-15: *"I'm not ok with this game being unique — to the extent
possible, I want you to use the exact same notes UX as all the other games use,
and extend/standardize it as needed."*

- [x] 4.1 `pencilModeKey` (the Marks key) and `PENCIL_MODE_BUTTON`; every game
      carrying `ui.pencilMode` offers it last, Loopy's `P` key and Notes key go.
- [x] 4.2 `toggleNoteTakingMode` replaces the eleven copies of the Enter toggle.
- [x] 4.3 The app's bare `P` sends the same code, after the game declines `p`.
- [x] 4.4 `pencil-mode-key.test.ts`: both directions, population derived from
      `newUi`, seen to fail under a plant (`findings.md`).
- [x] 4.5 `ts-engine` delta, the guides and `help/features.md`.

## 5. One place for the indicator, and room for a rim note

Owner, 2026-09-15: *"for the pencil marks here (and in other games using them), I
want the pencil icon to be managed by the engine and appear in the same place
(it's in the top right in other games, no?). Also, marks on the outside of the
board are clipping."*

- [x] 5.1 `pencilIndicatorBox` decides the position (the canvas's top-right), and
      `pencilIndicatorReach` says what room a game reserves for it.
- [x] 5.2 Every game with the mode draws it there: five already had the corner,
      four grow a margin for it on every side (so the board stays centered in its
      canvas), Towers gives up its tile-cache bit, and Group gains the indicator
      it never had.
- [x] 5.3 `pencil-indicator-placement.test.ts`: population derived from `newUi`,
      judged on where the pixels land rather than on which helper was called, seen
      to fail under a plant (`findings.md`).
- [x] 5.4 Loopy's gutter is widened to a corner note's reach, so a note on a rim
      dot is drawn whole instead of clipped at the canvas edge.

## 6. Report and accept

- [x] 6.1 Run the app on squares, triangular and an aperiodic tiling, by pointer,
      touch emulation and keyboard: pointer tap, drag and an auto-solved Hard plan
      on 7×7 squares; Enter, Space pin and pair on 8×8 triangular; a touch tap and a
      held-then-dragged finger on 10×10 hats.
- [x] 6.2 Re-run the app on the shared Marks key, in Loopy and in one cell game
      (`findings.md`).
- [ ] 6.3 Owner acceptance of the input design, the indicator's new home, and the
      widened Loopy gutter.
