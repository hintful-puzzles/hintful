# add-guess-hint — tasks

Implemented 2026-09-21, together with the two input limitations
`compose-guess-rows-without-dragging` shipped with (owner, same day). The
decisions are `design.md`'s.

## 1. Decide, before building anything

- [x] 1.1 **Does Guess get a notation, and which one?** Per-slot rule-outs,
      kept in an answer row below the guess rows (design D1). The proposal's
      table pointed there and the brute force still agreed: the high-frequency
      reading is positional.
- [x] 1.2 **The usual escape is closed.** It was never needed: the probe always
      exists because the hidden answer fits, so the hint refuses only on a
      finished game (design D4, "No refusal on a sound board").
- [x] 1.3 **What the hint says when nothing is forced**: a probe whose sentence
      claims only what was counted — it fits every score, how many answers fit,
      the most it can leave (design D4).
- [x] 1.4 **`computeHint` and the `'h'` key.** Retired; the probe step does its
      job (design D5). `shortcuts.test.ts` no longer ledgers Guess.
- [x] 1.5 **The corpus audit.** Read; its verdict stands (design D6).

## 2. Build

- [x] 2.1 Notation: `GuessState.ruledOut`, a set-not-toggle mark move,
      `ui.pencilMode` (Marks key and indicator derived), color keys and Clear
      in notes mode, and `changedState` rebuilding the row only when the row
      being played changes.
- [x] 2.2 The pencil-mode indicator fits Guess's half-tile border as it stands;
      `pencil-indicator-placement.test.ts` passes unchanged.
- [x] 2.3 The deduction: seven readings in `hint.ts`, plus the counted
      probe. An eighth ("a one-color row") was written and deleted when the
      census showed it is `blacksForced` in disguise.
- [x] 2.4 Drawing the marks: a dot per color per answer slot, hollow once
      ruled out, a fraction of a peg's size.
- [x] 2.5 The two limitations: a tap on an answer-row dot enters that color in
      its column (pointer-only entry with the keypad off), and Enter on a slot
      toggles notes mode (design D2, D3).

## 3. Verify

- [x] 3.1 Every mark rule brute-forced against the whole answer space
      (`guess-hint.test.ts`, six parameter sets); every probe count recounted.
- [x] 3.2 Cross-game hint guards green: `hint-resume`, `hint-quality` (after
      an em-dash in the status line was rewritten), `hint-overlay`,
      `hint-mark` (count 33 → 34), `hint-refusal`, the input and note-taking
      guards.
- [x] 3.3 Ran the app in Chrome: the answer row, the hint's outline and rings,
      a mark step applied and surviving a reload, notes mode by Enter, a digit
      and a right-click, dot taps entering colors, and Auto-solve winning in
      five rows. The browser found one defect no test had: the current row's
      hit region ran `nguesses` rows down and swallowed the answer row from the
      third guess on. Fixed, with a regression test.

## 4. Record

- [x] 4.1 `docs/games/hints.md` § "Two standards of proof in one plan (Guess)";
      `docs/games/input.md` on the notation restoring pointer entry;
      `docs/games/mechanics.md` § "changedState" on rebuilding across a new move
      type. Help: `help/games/guess.md` rewritten, `help/features.md` §Hints.
- [x] 4.2 Spec delta: `guess` only; nothing was extracted to the engine.
