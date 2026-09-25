# give-map-mark-all-and-the-reading — tasks

## 1. The press

- [x] 1.1 Adaptive Mark-all in Map's `interpretMove` (fill, then clean against
      neighbors, then no-op), `canMarkAll: true`, `M`. One function, `markAll` in
      `map/hint.ts`, is both the press and the populate plan's setup.
- [x] 1.2 `mark-all.test.ts` passes for Map; a plant that resets a narrowed
      region's dots goes red (the "never resets" case, and only it).

## 2. The reading

- [x] 2.1 `candidateReading` in `MapUi` (default implicit, reason measured and
      stated) and `candidateReadingPref` in its prefs.
- [x] 2.2 Map's plan: under populate, fill + clean as one journey, then as now.
      `hintKeepTrack` / `refreshHintStep` follow a multi-region dots step toggle
      by toggle, and a refresh the board has not moved under returns the step
      itself.
- [x] 2.3 `candidate-reading.test.ts`: a step's effect is read off the board
      (fill / note / strike), not off the move's `type`; Map's premise is read by
      region from `targets`/`evidence`. Plants: the implicit plan running the
      setup fails all four Map implicit cases on the setup check; skipping the
      premise dots fails Normal and Tricky on the premise check, naming the
      undotted pair.

## 3. Finish

- [x] 3.1 Help (Map's page, `help/features.md`), spec delta for Map, `hints.md`.
- [x] 3.2 Run the app, both readings, both schemes. Two findings, both fixed:
      - Switching the preference mid-game changed nothing: the midend went on
        with the plan it had stored under the old reading. `setPreferences` now
        drops a stored plan (every reading game had this), held by
        `midend-prefs.test.ts`, which fails with the drop disabled.
      - The clean step ringed every region it struck, which on a fresh board is
        nearly all of them, and the bands ran together over the whole map. Both
        setup steps now ring nothing; the sentence names every blank region.
