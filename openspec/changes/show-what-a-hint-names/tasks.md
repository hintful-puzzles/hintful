# Tasks

- [x] 1.1 `Narration.spansIn` and `Narration.only`; the midend sends spans and
      a focused index, and draws the step narrowed to the focus.
- [x] 1.2 `Puzzle` carries the spans, the pressed reference and the hovered
      one, and tells the engine which to draw.
- [x] 1.3 The words row under the Game controls (`layout.ts`); the board stands
      on what is under it.
- [x] 1.4 References drawn as pills (the owner, 2026-10-18: "proper pill
      elements for the reference texts"): press toggles, a mouse over one
      shows it, keyboard reachable, focus handed back to the board after a
      pointer press, the punctuation after a pill kept on its line.
- [x] 1.4a The hint as tall as its words, with less padding (the owner,
      2026-10-18: "smaller vertical padding in the hint element"); the room
      a short hint leaves is above it.
- [x] 1.5 Tests: the midend narrows and ends the focus (each seen failing
      against a planted defect); the hint's words stand on the Bar in every
      layout.
- [x] 1.6 Ran the app: board and keys measured still on showing a hint in
      ABCD, Solo, Loopy and Mines at 412x915, 1000x686 and 900x420; pressing,
      unpressing and hovering looked at in ABCD, Solo and Loopy, light and
      dark, by mouse, touch and keyboard.
- [x] 1.7 Docs: `hints.md`, `input.md`; the help page's Hints section, which
      also misplaced the Hint button and misnamed Auto-solve and its stop.
- [ ] 1.8 The owner's acceptance; archive.
