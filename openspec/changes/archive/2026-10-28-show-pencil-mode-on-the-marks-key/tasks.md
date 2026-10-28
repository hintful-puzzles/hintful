# Tasks

## 1. Measure

- [x] 1.1 Reproduce (the proposal's steps), and list the games with `pencilModeKey` and every path that flips `ui.pencilMode`
  - Reproduced in Chrome, Keen 4x4 (2026-10-28). Every game the key is given to
    holds the mode as `ui.pencilMode`; all four paths (the key, `p`, a right
    press, a tap in Right-click mode) reach it through `Midend.processInput`,
    and each UI-only change is announced by `afterTransition`. So the engine
    reports `pencilMode` on `game-state-change`, next to `hasPencilMarks`.
- [x] 1.2 Show the owner the Marks key's on and off looks, both schemes, desktop and phone, and take their choice
  - Built to the bar's convention for a mode in force (`bar.ts`, Right-click
    mode): the caption and icon never change, and the key is filled in the
    brand color while the mode is on. Accepted by the owner 2026-10-28.

## 2. Build

- [x] 2.1 The frontend reads pencil mode from the game and draws the key's state; no second copy of the flag
  - `wa-button` passes no `aria-pressed` to its own `<button>` (Web Awesome
    3.11; seen in Chrome's accessibility tree), so the state is a visually
    hidden word in the key's name: "Marks on", "Marks off".
- [x] 2.2 A test: each path that flips the mode leaves the key showing it, seen to fail at HEAD
  - `pencil-mode-key.test.ts`: in every note-taking game, a walk of blind
    gestures, Marks presses and Undo, with the reported mode compared to the
    `Ui` after each; an input other than the key flipped it in 13 of 17 games.
    `keys.test.ts`: the key follows `puzzle.pencilMode`. Both failed at HEAD.

## 3. Finish

- [x] 3.1 The app run with mouse, keyboard and touch; the sticky-pencil help sentence, `engine-notes`, the gate, green
  - Run in Chrome: right-click, Marks, `p` and a left-click (desktop, light
    and dark); a touch tap on Marks at phone width; Keen's help page shows the
    new sentence.
