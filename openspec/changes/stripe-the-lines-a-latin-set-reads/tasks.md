## 1. Measure

- [x] 1.1 Which games show the step, and how often: hint-guided play on every
      preset's board, three deals each (2026-10-08). Unequal 61 steps on 69
      boards, Salad 13 on 45, Keen 7 on 27, Towers 6 on 36, Group 3 on 27,
      Mathrax 3 on 51. All hatched nothing and carried 6 to 17 `reads`.
- [x] 1.2 Whether the recorded reading is the smaller: it was not. Keen
      outlined eleven cells in four columns of a 6x6 where two rows do.

## 2. Build

- [x] 2.1 `latin.ts`: a set over one value's places records `lines`
      (`ConfinedLines`), the fewer of its two readings in `set`
      (`confinedSet`), the subset found in `setGeneral`.
- [x] 2.2 `hint-text.ts`: `confinedPremise` stripes the lines and outlines the
      cells; `latinPremise`'s set arm calls it when the reason has lines.
- [x] 2.3 Solo and Towers call it from their sentence files; Solo's own copy
      of the words is removed. Towers says the height bare, since "height 5"
      twice ran to 122 characters.
- [x] 2.4 Salad: a confined empty-square mark speaks the same sentence, and
      `setHoles` keeps only its one-line form.
- [x] 2.5 `set` records no `reads`: across lines it has `lines`, and within a
      line its reading is always the naked set, which reads only its own
      cells. `setGeneral` keeps `reads` for a hidden set within one line
      (Salad), which this change does not draw.
- [x] 2.6 Each of the six games' help legend says what several striped lines
      mean.

## 3. Hold it

- [x] 3.1 `latin.test.ts`: the reason names the fewer lines, each way round.
      Planted (always the column reading): the rows case fails.
- [x] 3.2 The premise audit passes every game's sweep with the lines as the
      step's premise and no `reads`.
- [x] 3.3 The narration length limit holds on every tier and preset
      (`hint-quality.test.ts`).
- [x] 3.4 The pinned sentences of Keen, Salad and Towers are re-baselined, and
      read.

## 4. Close

- [x] 4.1 Run the app: the step in Towers, Keen, Unequal, Mathrax, Group and
      Salad in light at desktop width; Towers and Group in dark at phone
      width.
- [x] 4.2 `docs/games/hints.md` and `docs/games/engine-catalog.md`.
