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

## 4. Report and accept

- [x] 4.1 Run the app on squares, triangular and an aperiodic tiling, by pointer,
      touch emulation and keyboard: pointer tap, drag and an auto-solved Hard plan
      on 7×7 squares; Enter, Space pin and pair on 8×8 triangular; a touch tap and a
      held-then-dragged finger on 10×10 hats.
- [ ] 4.2 Owner acceptance of the input design.
