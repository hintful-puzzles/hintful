## 0. Measure

- [ ] 0.1 Re-take the populations (proposal § "Task 0") and check the
      falsifier.

## 1. The finished board

- [ ] 1.1 The midend refuses a hint on a solved board before calling `hint`
      (`midend.test.ts`, as for Solve).
- [ ] 1.2 Remove each game's own check; shrink or retire `commonHintRefusal`.

## 2. The type

- [ ] 2.1 `HintRefusal` in `hint-refusal.ts`; `HintResult`'s error is it.
- [ ] 2.2 Every hint path returns a refusal; Inertia's two sentences go through
      the escape.
- [ ] 2.3 `hint-refusal.test.ts` reads only the escape's sentences.

## 3. Record

- [ ] 3.1 Spec deltas against "A hint refusal is worded once for the whole
      collection" and "A deductive hint SHALL open with the shared refusal
      pair" (grep both for the sentence you change first).
- [ ] 3.2 `docs/games/hints.md` and the engine catalog's `hint-refusal.ts`
      entry.
