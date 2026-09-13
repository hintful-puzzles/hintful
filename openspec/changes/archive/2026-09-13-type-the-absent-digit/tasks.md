# type-the-absent-digit — tasks

Read `design.md` first: D1 records why the opposite change was scaffolded and
withdrawn, and D4 is the per-site guidance.

- [x] 1.1 Change `digitValue` in `src/engine/decimal.ts` to return
      `number | undefined`, and state in the header that the absent case is
      outside the return type **because** a value inside it is one nobody has to
      check.
- [x] 1.2 The same for `c2n` and `c2nUpper` in `src/engine/desc-alphabet.ts`.
      Their `-1` is also quoted in the module header and in
      `docs/games/engine-catalog.md`; repoint both. (The header's `-1` was
      Magnets' own clue sentinel, not the codec's; it now says so. Singles'
      `MAX_DIM` comment quoted the codec's `-1` too, and is repointed.)
- [x] 1.3 Fix the two round-trip tests that assert `-1` for a rejected
      character (`desc-alphabet.test.ts`, `decimal.test.ts`), keeping what they
      assert: that exactly the alphabet's own characters are accepted, and the
      count of them. Two of the five were `=== -1` filters, which the compiler
      does not flag against `number | undefined` because `-1` is a number: they
      would have gone dead rather than red.

- [x] 2.1 Work the call sites the compiler names, **reading each** (`npm run
      refs` found 24 game sites plus the codec's own; `design.md` D4 has the
      shapes). Lower-bound sites bind and test; typed-array writes state the
      array's own absent constant.
- [x] 2.2 Filling first, as the exemplar: its array's absent value is `0`, not
      `-1`, so today a non-digit would store `255`. The write now reads
      `?? EMPTY`.
- [x] 2.3 Where a write is safe only because `validateDesc` screened the
      character, say so at the write: Filling, Slant and Map name their
      array's absent constant; Singles and Flood have no absent value (every
      cell holds a number) and throw with their `validateDesc` message; Palisade
      and Bridges already said so and keep their explicit test.

- [x] 3.1 Every frozen differential passes **unedited**; `params-stability`
      moves no line; no snapshot is re-baselined. A fixture that moves is a
      finding, not a re-baseline. No fixture or `.snap` file is in the diff; the
      codec tests plus all 24 affected games' directories passed (91 files,
      2095 tests), and the commit's gate runs the rest.
- [x] 3.2 Verify by shape, not by a green suite: every changed line either
      binds a value that was already computed or names an absent constant. Read
      the exceptions. Four, each deliberate: Crossing narrows its digit run with
      a type guard and throws on a broken scan; Keen's aux read returns Pearl's
      `invalid char in aux` refusal; Singles' and Flood's `newState` throw.
- [x] 3.3 Run the app. The codecs sit under every desc, so a mistake reaches
      the board rather than a test: Crossing, Salad in both modes, Slant,
      Filling, Palisade, Bridges, Tracks, Loopy. All render with no console
      error, as do Flood, Singles and Magnets; Great-Dodecagonal Loopy shows
      clues 10 and 11 read through `c2nUpper`, and Keen's Show solution fills
      the grid from its aux.

- [x] 4.1 Update `docs/games/mechanics.md` § "Digits and numbers in a desc are
      one fact, and it is not yours" with the rule and the reason.
- [x] 4.2 Check whether the `decimal.test.ts` digit scan needs widening: it
      does not — no `DIGIT_SHAPES` pattern matches `-1`. A planted
      `?? -1` write now sits among the shapes the scan must stay quiet on.
