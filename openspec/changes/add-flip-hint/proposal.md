# add-flip-hint

**Status: built, awaiting the owner's play (2026-10-04).** What was decided is
`design.md`. Owner, after accepting Flip's
dark-scheme fix: *"please scaffold a change for us to add a hint to it soon."*

## Why

Flip has no hint, so the home screen labels it a draft. Since
`let-the-engine-own-what-solve-shows`, Solve shows the finished board and no
longer the squares to press, which leaves Flip with no step-by-step aid at all.

## What is already there (read 2026-10-04, `src/games/flip/index.ts`)

- **`solve` knows a shortest answer.** It eliminates over GF(2), walks every
  assignment of the free variables, and keeps the set of squares with the
  fewest presses. It returns that set as a mask.
- **No press is wrong.** Pressing a square twice undoes it and the order never
  matters, which is the reason `findMistakes` is excused in `notApplicable`.
- **The state's words run the other way from the player's.** `grid` holds 1
  for a square the code calls lit and "wrong", and `status` is solved when
  every one is 0; on screen the solved board is all white, and the help page
  says "light up all the squares". A hint speaks in the player's words.

## What the hint has to settle

Flip is not deductive: nothing on the board forces a press, so there is no
"because" of the Palisade kind. The bar still applies
(`docs/games/hints.md` § "Non-deductive (heuristic) hints"): find what the game
can check, and say that.

1. **What a step claims.** Candidates, each a thing the code can verify: this
   square is one of the N presses a shortest answer needs; pressing it lights
   these squares and darkens those; after it, N-1 remain. Whether any of that
   teaches the player to solve the next board alone is the real question, and
   the honest answer may be a technique (chase the lights down, row by row)
   rather than the solver's set.
2. **Stability across recomputes** (§ "Recompute-stable plans"). Pressing a
   square of the shortest set leaves the rest of the set as the new shortest
   answer, and pressing one outside it adds that square back, so the count of
   presses remaining is a candidate monotone potential. Where free variables
   give several shortest sets, the choice among them has to be deterministic.
   Both are to be checked, not assumed.
3. **Which square first**, since order does not matter to the board and does
   matter to a player following along.
4. **The marks and their words** (§ "Bind the words to the marks") and the
   gesture (§ "Every step is a gesture"): a press is one tap.

## What Changes

`hint()`, `hintGesture` and `hintMarks` for Flip, a `## Hints` section on its
help page, and its hint tests. The hint presses the shortest answer in reading
order and says of each press whether the order forces it (it is a dark
square's last chance) or the answer supplies it. The solver moves out of
`solve` into `solver.ts`, which both read. Flip leaves
`hintless-games-in-reserve`.

## What it assesses

`share-the-hint-position-scan` names Flip as its hint to pull in: Flip's hint
test finds the board each sentence fires on through that harness and writes no
scan of its own, which is how the harness gets judged.

## Acceptance

The owner's: whether the hint explains anything.
