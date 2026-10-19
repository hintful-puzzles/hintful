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
- [x] 1.4b Pressing a reference blinks its marks with the rest drawn, not
      draws them alone (the owner, 2026-10-18, on the deploy); the guard
      that a hiding ends with its step now sees the stale read it once let
      through.
- [x] 1.4c One flash for a pressed reference, not a blink (the owner,
      2026-10-19): the worker finds its marks' pixels by drawing the step
      with and without them (`markPixels`), and the view fades them from
      white (black on the light board) back over a second. Seen in Twiddle
      and Solo, light and dark.
- [x] 1.4d The hint's room measured by an unseen hint of `NARRATION_LIMIT`
      characters and a fifth (`longest-hint.ts`), not a count of lines (the
      owner, 2026-10-19: no exceptions). The 210 snapshot sentences of 100
      to 120 characters fit it at 360, 412, 900, 1000 and 1400 wide; six
      hints each in Untangle, Magnets, Net, Pearl and Rect at 412x915 and
      1000x686 moved no board.
- [x] 1.4e A pressed pill lights its marks where another reference names the
      same ones ("No track here … so this must carry track"; the owner,
      2026-10-19: "clicking the 'here' and 'this' don't seem to highlight
      anything"): `Narration.withoutMarksOf`.
- [x] 1.4f A leader line from the pressed pill to its marks, fading with the
      flash (the owner, 2026-10-19: "a faint line from the pill to the
      referred element … the pill, line and outline the same color"). A
      standing line was declined: across a board made of lines it reads as a
      wire or an edge.
- [x] 1.4g Each reference in a color of its own from its role's pool, its
      marks repainted in it and its pill tinted with it (the owner: "'pools'
      of hint colors for the same semantic group … the engine asks a color
      from it"; and, of a trial behind an address flag, "I can't imagine any
      situation when we'd not want the colors to be distinct"). A first cut
      tinted each pill in its marks' own color, which two references in one
      role share.
- [x] 1.4h Moved to `give-map-colors-clear-of-the-hint-pools`: the owner
      (2026-10-19) would rather Map's own colors moved than a game choose
      a pool, so that no game needs an exception.
- [x] 1.8 The owner's acceptance (2026-10-19: "Fabulous, accepted"); archive.
