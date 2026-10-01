## 0. Measure

- [x] 0.1 Re-take the populations (proposal § "Task 0") and check the
      falsifier. Fifteen, Sixteen and Netslide fire it and keep their own
      check; Guess and Flood called a lost board solved; Map's Solve left its
      status ongoing (`design.md`).

## 1. The finished board

- [x] 1.1 The midend refuses a hint on a solved board before calling `hint`
      (`midend.test.ts`, as for Solve), and on a board `findMistakes` flags,
      with the overlay set.
- [x] 1.2 Remove each game's own check; retire `commonHintRefusal`,
      `candidateHint`'s `findMistakes` parameter and the four games' `mistakes`
      parameters. Guess and Flood say `GAME_OVER` on a lost board.
- [x] 1.3 Map's solve move completes the board; Slide's redundant Solve check
      goes.
- [x] 1.4 `hint-resume.test.ts`'s walk asks `findMistakes` at every position.

## 2. The type

- [x] 2.1 `HintRefusal` in `hint-refusal.ts`; `HintResult`'s error is it.
- [x] 2.2 Every hint path returns a refusal; Inertia's two sentences go through
      the escape.
- [x] 2.3 `hint-refusal.test.ts` reads only the escape's sentences;
      `hint-refusal-opening.test.ts` retires.
- [x] 2.4 Per-game tests asserting the moved refusals assert what the midend's
      refusal rests on (status, `findMistakes`).
- [x] 2.5 The probe case on the deleted helper moves to `midend.ts`.

## 3. Record

- [x] 3.1 Spec deltas against "A hint refusal is worded once for the whole
      collection", "A deductive hint SHALL open with the shared refusal pair"
      and "A refused hint surfaces the board's mistakes", and the thirteen game
      requirements that said their own `hint` refuses.
- [x] 3.2 `docs/games/hints.md` and the engine catalog's `hint-refusal.ts`
      entry.
