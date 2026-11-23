## 1. Design

- [x] 1.1 Read the family again with the query in design.md § "Context".
      Per game, the gap list: what its description already states, what
      the fill board lacks to deal, draw and play it (notes, mark-all, the
      keypad, its clues), each need marked met by what is built or new,
      and its ID grammar. Place ABCD, Ascent, Crossing, Seismic and Rome
      here or in a later group, and record the placement in the route's
      design.md. Write the gap list and the order in design.md, and the
      Decisions it settles; restate the filing's spec delta (notes on
      the fill board) by what they decide. Written 2026-11-23 at
      `153e4cf43`: ABCD, Crossing, Seismic and Rome are of this family,
      Ascent goes to lines and loops; Map needs a space whose cells are a
      partition's parts.
- [x] 1.2 Split the family if the order has a natural break: this change
      keeps the first part, and its successor is filed when it is archived.
      This change keeps Unequal, Adjacent, Keen, Towers, Mathrax and
      Seismic (design.md § "Decisions" 7); the successor takes the rest.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added, each with its concept, and the differences a player sees; lowers
the `game-lines` ceiling; moves the game's tests to its `cases.yaml`;
writes its spec deltas; and runs `npm run test:hint-sweeps` before its
commit. In design.md § "Decisions" 7's order.

- [x] 2.1 The notes layer on the fill board, before any game flips, tested
      on a fixture description of its own, `squaring` (a small Latin square
      with givens, and then notes). No game moves in it. Three commits, each
      whole on its own:
  - [x] 2.1a A board of numbers: `play.numbers` with its select-then-type
        input (`engine/fill/numbers.ts`, the note-taking cell's highlight),
        its keypad, its numerals and the selected cell's wash (§ 3);
        `given: [value]` compiled as the `given` kind (§ 6, in `load.ts`'s
        `withGivens`); `deal.sample: { latin: true }`. Pairing, Playing,
        Sizing and Unruly now say `given: [value]` (their modules
        unchanged but Playing's `play` key order); Mirroring and Pattern
        keep their own, which sit last among their kinds. A compiler bug
        fixed on the way: a domain a size states named `sp` `_sp`.
        `squaring` states its own two techniques: the fill walk cannot word
        a library firing (`use: latin.*`, whose words are the library's), so
        the Latin library on the ladder goes with the candidate walk, 2.1c.
        The right button and the Marks key do nothing until 2.1b.
  - [x] 2.1b Notes on `FillBoard` and the note edits (§ 1): the note grid
        drawn in an open cell, the right press and the Marks key, pencil
        and sticky pencil, auto-pencil on a placement, Mark-all, and the
        note half of the mistake check. Built as `engine/fill/notes.ts`
        (`FillMove`, `applyMove`, `markAll`), `board.pencil`, the notes-mode
        corner and the pencil-mode indicator; `applyNoteMove` takes a
        `NoteEncoding` for a fill-all that is not `1..w`. `squaring` keeps
        `cand`. The Ui's note fields start as every note game's (sticky on,
        keep-highlight on, auto-pencil off); their prefs are 2.1c's.
  - [x] 2.1c The candidate walk built from the compiled module (§ 2), the
        Latin library on the fill ladder (`ladderOf` passes
        `LATIN_LIBRARY`), and the four prefs with the reading's default
        declared; `squaring` then places `latin.*`. The walk's reach
        replaces `notes.ts`'s `reachOf` (the units' peers) for auto-pencil
        and Mark-all's clean (design.md § "Decisions" 1). A step's struck
        notes are drawn struck in the cell (`render.ts`'s note grid).
        Built as `engine/fill/candidates.ts` (`candidateFill`): the
        row/column preset, the library's strikes a leg a cell, worded by the
        library; `play.hintNotes` declares the reading (`squaring` says
        `implicit`); `notes.ts`'s `reachOf` is the one reach the walk,
        auto-pencil and Mark-all read; the struck lane is an
        `OverlaySidecar` on the tiles. The walk refuses units other than
        rows and columns: 2.7 gives it Seismic's areas and its `cull`
        reach.
- [ ] 2.2 Unequal born (design.md § "Decisions" 2 and 5), in three commits:
  - [x] 2.2a Clues at edges (`at: edge`, `ends(at)`), the `records`/`sides`
        segment, `play.gaps` with the chevron painter (a gapped grid, a
        sign red where it breaks, printed in the text), and the walk's
        rungs for the description's own techniques, worded by
        `statedParts` a leg a cell; tested on the `ordering` fixture
        (`engine/fill/edges.test.ts`). A born board of numbers whose
        ladder strikes needs notes: without them the fill walk's strike
        step is an empty move. The hide keeps a kind the lowest tier reads
        none of whole until the asked tier's pass, or a Normal board's
        signs all went at Easy and no Normal board was dealt.
  - [x] 2.2b Done marks on an edge clue (a press in its gap, or an arrow
        with Shift or Ctrl), drawn gray. Built as the shared capability
        "done marks on any clue" (design.md § "Shared": Adjacent, Towers,
        Keen, Undead and Magnets follow), so its board state is keyed by a
        clue kind and its clue's index, not by edges. A flipped Unequal may
        drop the old `spent` move from saves (docs/descriptions.md: approved
        for the initiative, 2026-11-22). Built as `play.done` (a kind and
        what one is called, which the help's `{{done-clues}}` sentence
        says), `engine/fill/done.ts` (`DoneMove`, `FillBoard.done`, the
        gap's press and drag as a `Game.doneClues`, the Shift or Ctrl
        arrow), drawn in `clueDoneColor`, red over it where the clue
        breaks; tested on `ordering` (`edges.test.ts`, the drag by the
        `drag-marks` probe). The compiler refuses a kind not drawn in a
        gap, or on a board of buttons: a later game adds the press its
        place needs (a slot, a part's label). The fixture is not in the
        app, so 2.2c's run looks at the gray in both schemes.
  - [ ] 2.2c The flip: `order` renamed `w`, the alphabet past 9, the
        deal hiding from every clue, Unequal's tests to `cases.yaml`, its
        TypeScript deleted, the `game-lines` ceiling lowered and its spec
        deltas written; its rungs (upstream's greater/lesser beside the
        fixture's `sign`) settled there. Its run in the app includes a sign
        marked done, by press, drag and Shift-arrow, in light and dark.
- [ ] 2.3 Adjacent born: records flagged from both cells, the legacy `a`,
      the bar painter and a missing bar's breach; `engine/edge-clue-latin/`
      deleted (§ 4).
- [ ] 2.4 Keen born: clues at a partition's parts labeled at the first
      cell, the block-structure segment, a small-part partition sampled on
      the answer, one kind an element chosen in the deal, the bare flag `m`;
      difference and quotient stated to sit on two cells; done marks on a
      cage clue.
- [ ] 2.5 Towers born: clues at both ends of a line, `numbers` with its
      separator and the optional givens after `,`, a hide from a tier up,
      `fullLine` and `tallestNearest` stated as techniques, the tower
      painter drawing past its tile with its hit test and 2D/3D preference.
- [ ] 2.6 Mathrax born: clues at corners, a kind precedence switched by
      option letters, a hide of givens before clues, the board word the
      hint reads stated in the description.
- [ ] 2.7 Seismic born: a partition grown to drawn sizes before the answer,
      the answer searched under it, `T` a ruleset by a bare letter, its
      reach from the compiled `cull` (`notes.ts`'s `reachOf`), and the
      walk's regions from units beyond rows and columns, its areas.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost` against
      a worktree of this change's baseline, recorded in design.md.
- [ ] 3.2 Update `docs/descriptions.md`, `docs/hints-candidates.md` and
      `docs/new-game.md` for what the family added.
- [ ] 3.3 Commit, push, archive; file the successor with the rest of the
      family and its open question (design.md § "Open Questions"); mark the
      route's task 1.2 with the figures' place and add the successor
      beneath it.
