## Decisions

**The skeleton is a small game that plays,** as the other two are
(`src/skeleton/README.md`): a hidden code of a few symbols, guessed in rows,
each row scored. It is Guess cut down to what every game of the kind
shares, written on `code-rows.ts` and the engine helpers Guess and Wordguess
both use, so a porter starts from the shared way.

**What it leaves out is a decision to record.** No solver ladder and no
soundness entry, because the answer is the desc. A hint, because every
game has one: the skeleton's is the smallest that teaches (a symbol ruled
out by a scored row), in the description language, so the porter extends
it rather than writing one from nothing.

**The kinds table.** Add the row; check each "Every game" section still
applies to this kind, and say which do not. Wordtrail-shaped games (paths
through letters) fit the `edges` skeleton with directed lines; the session
said its copied tests were built around a loop board and were rewritten
whole. Whether `edges` needs a word-path variant is a question for this
change to answer with the Wordtrail diff in hand, not to assume.

**Catalog wording.** `new-game.sh` writes the kind's own family and a
placeholder description; the first verdict already lists what is owed, so a
placeholder is caught.

## What was decided in the work (2026-11-20)

- **What both games share, and so the skeleton has**: the working row in the
  `Ui` through `code-rows.ts`, Submit as a key and a full row refused with a
  frame and the status line's reason, the desc as the obfuscated answer, a
  win or a loss read off the last row, `nothingToDeduce`, Solve as the answer
  played as a guess, the working row kept in `encodeUi`, and a hint whose
  last step is a counted guess, kept on track by the guess sent whole. **What
  is Guess's alone**: holds, color keys and labels, black-and-white scoring.
  **What is Wordguess's alone**: the word list, hard mode, the key statuses.
  The skeleton takes Guess's answer row of rule-outs (notes mode, the mistake
  check) and its described ladder, because a deduction hint needs a mark to
  place, and Wordguess's per-slot scores and reference panel.
- **The puzzle**: a code of different digits, and guesses of different
  digits, so a score is per slot with no copies to count. The row a guess
  repeats a digit in is the refused row, which exercises that path.
- **One technique, `absent`, and its soundness verdict.** "No soundness
  entry" in the decision above meant no generator ladder; a stated technique
  is checked as any is, and the copy inherits the verdict as the other
  skeletons' copies do.
- **The probe reads the description's rules** (`isAnswer`), so the walk over
  every code also tests the clue's `means`. Measured: a followed plan finds
  every code within 4 guesses on 3 and 4 digits from 6, and within 5 on 4
  from 8 (presets give 7, 7 and 8 rows); the whole walk of all three presets
  takes under a second once the opening is cached, so the skeleton's own test
  walks every code.
- **The catalog family**: a description's `family` is the description
  language's vocabulary (`code`), not the catalog's (`hidden`). The register
  script took one for the other, which held for `grid` and `edges` because
  their names agree, and the first stamp of `code` failed the typecheck. Each
  kind now names its catalog family beside its catalog wording.
- **Wordtrail and `edges` (task 2.2): no word-path variant.** Of Wordtrail's
  first commit, the lines shared with the `edges` copy were most of
  `index.ts` (106 of 123 distinct lines), `moves.ts` (25 of 35), `hint.ts`
  (63 of 78) and `solver.ts` (131 of 223), and half of `render.ts`; it
  replaced the generator, the board state and the tests. Those are the loop
  puzzle, which every copy replaces whatever its answer, and the script's
  checklist already says the generator's loop is the skeleton's own. A
  variant would be a second loop-shaped thing to keep compiling for no part
  a word game keeps.

- **What a stamp's first verdict lists** (task 1.3): its spec and icons,
  the two kept snapshots, a pinned wrong board for `warm-repaint.test.ts`,
  and four ledgers whose exemption is the kind's
  (keypad without a pencil array, `judgeMove`, a solved board no input
  breaks, no wrong entry by gesture). Those are what Guess carries, so they
  are what a real game of the kind owes today; deriving them from the kind is
  filed as `derive-hidden-answer-exemptions`. The first stamp also found two
  of the skeleton's own defects, both fixed here: a ring on a narrow digit at
  the slot's top edge, which threw, and an unused export. The skeleton's hint
  test now asks `bindingDefects` of every step of every walk on the smallest
  preset, which fails on the first of them when it is planted back.

## Risks

- A third skeleton is a third thing to keep compiling against `Game`. It is
  source and the gate holds it, as the other two are.
