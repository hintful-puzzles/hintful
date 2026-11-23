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
- [x] 2.2 Unequal born (design.md § "Decisions" 2 and 5), in three commits:
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
  - [x] 2.2c The flip: `order` renamed `w`, the alphabet past 9, the
        deal hiding from every clue, Unequal's tests to `cases.yaml`, its
        TypeScript deleted, the `game-lines` ceiling lowered and its spec
        deltas written; its rungs (upstream's greater/lesser beside the
        fixture's `sign`) settled there. Its run in the app includes a sign
        marked done, by press, drag and Shift-arrow, in light and dark.
        Added: the default board is dealt at the first tier its menu
        offers it (`fill/game.ts`); the guards that read a note board's
        entries as `grid` read a fill board's `values` too. The rungs are
        one, `sign`, recorded under the technique's id as every
        description's own is; Check & save calls it "a greater-than sign".
        Differences a player sees: the menu offers 4x4 at Normal, not at
        Easy, whose boards show no sign (the default stays 4x4 Normal,
        upstream's); a deal hides givens and signs in one random order, so
        the mix shifts; past 9 a value is a letter from `a` (10), as in
        Solo, where it was upstream's `0`-based digits; `0` clears at every
        size; an ID with more than one answer is refused; the hint rings a
        cell's number or notes with a circle, as every born game does,
        where it drew a square in the gap; saves break (approved).
        Run in the app 2026-11-23: a 5x5 Tricky deal, typing, notes, a
        broken sign in red, signs marked done by press, drag and
        Shift-arrow, the hint walked to the solve, light and dark.
- [x] 2.3 Adjacent born: records flagged from both cells, the legacy `a`,
      the bar painter and a missing bar's breach; `engine/edge-clue-latin/`
      deleted (§ 4). Adjacent's spec reads its board off Unequal's ("Rules:
      Adjacent shares Unequal's board and controls"), and Unequal's Purpose
      still names the edge-clue square: both are rewritten here, and the
      guides' exemplars that 2.2c repointed to Adjacent move on.
      Capabilities added: a `complete` kind valued 0 or 1 at every edge,
      dealt whole and never hidden, its records written from both ends
      and refused from one; a painter says whether it draws an end or a
      number (`bar`, its outline where a 0 breaks), the compiler holding
      each `play.gaps` kind to it; a press marks done only a clue its
      painter draws; `unusedLetters` (read, never written);
      `play.defaultTier`; an own rung's `{ring}` and `{struck}`. A board of
      numbers keeps no buttons' drag on its Ui, which the drag-cancel guard
      read as a drag no press arms (Unequal's since 2.2c). `research/
      describe/`'s ladder and measure tools retired with their only
      subject, Adjacent's own ladder. Differences a player sees: a deal
      hides givens alone, from a Latin square, so the mix shifts; past 9
      a value is a letter from `a`; sizes run to 31 (were 16); an ID with
      more than one answer is refused; the hint rings a cell's number or
      notes; a gap with no bar takes no done mark; saves break (approved).
      The menu, its first board 5x5 Easy, and `5` reading as 5x5 Normal
      are kept. Run in the app 2026-11-23: a 5x5 Easy and a 5x5 Tricky
      deal, typing, notes, a broken bar and a missing bar's breach in red,
      bars marked done by press, drag and Shift-arrow, a press on no bar
      doing nothing, the hint walked to the solve on both, light and dark.
- [x] 2.4 Keen born: clues at a partition's parts labeled at the first
      cell, the block-structure segment, a small-part partition sampled on
      the answer, one kind an element chosen in the deal, the bare flag `m`;
      difference and quotient stated to sit on two cells; done marks on a
      cage clue. In three commits, read at `346c783e0` (2026-11-23):
  - [x] 2.4a Clues at a dealt partition's parts, tested on a fixture of its
        own, `caging` (a Latin square in cages, each with a sum or a
        product): the partition dealt in small parts at random
        (`deal.divide`, upstream keen.c's dominoes at odds and singles
        folded in under a most), beside `deal.grow`'s; a kind at a part
        derived where its meaning holds, a meaning `E = v` solved for `v`
        rather than tried a value at a time (a product of six cells has
        9^6 values); one kind a part (`deal.oneKind`: kinds dealt in turn,
        a poor clue only where no other kind suits, a kind never where its
        formula refuses); a bare flag after the tier that deals some kinds
        alone (`deal.onlyFlag`, Keen's `m`); the `blocks` segment
        (upstream's block structure, moved from Keen to
        `engine/game-id/block-structure.ts`) and a `parts` segment (a letter
        of the kind and its number a part, in the order of their first
        cells); each clue drawn at its part's first cell as its number and
        sign (`play.signs`), the notes below the label band, red where it
        breaks; the walk's stripes on a part.
  - [x] 2.4b Done marks on a clue at a part: the press, the key and the
        gray, on `caging`. The owner chose (2026-11-23) a press on the
        clue's drawn text, with a little slack, marking it, and a press
        elsewhere in the square selecting it as before; Shift or Ctrl with
        an arrow marks the clue of the cage the cursor is in. The renderer
        says where it drew a clue (`FillRender.partClueBox`), so the press
        and the drawing share one box.
  - [x] 2.4c The flip: Keen's tests to `keen.cases.yaml`, its TypeScript
        deleted, the `game-lines` ceiling lowered, its spec deltas; the
        menu, the `m` variant board, the tier bounds at 3x3. Learned in
        2.4a: a clue's number in a wording is `{numeral sum}`, as a bare
        `{sum}` is said as a value's glyph (a product of 30 read "u");
        difference and quotient each state `|cells(at)| = 2` in their
        meaning; the sign is drawn on every clue, a products-only board's
        too (upstream draws none there): a difference the player sees.
        Keen has no text format today; the engine's prints the cages'
        walls and the numbers, and the flip gives it each cage's clue too
        (a cell is three characters, so a clue such as `720×` goes beside
        the grid, not in it).
        Done: the engine gained a menu variant naming a deal's setting
        (`with: [multiplication-only]`, the `onlyFlag`'s or a hide's kw),
        each part's clue in the text format beside its row
        (`reading.partClues`), a typed value drawn below a clue's line in
        every cell of a board with clues at parts, as its notes are, and
        `numeral` refusing a value no key draws, so a bare `{sum}` past 35
        throws where it printed "¢". A clue is set at the largest size a
        hint's ring on its cell still steps round (`ringFits`, now
        exported): the hint sweeps found a cell under `120×` that no round
        ring fits at a 32 px tile, as a ring is centered on the cell inside
        its cage walls. Measured 2026-11-23: four characters fit from a
        40 px tile up, five at none (a clue enclosed, or a ring centered
        below the clue's line, fit no better). The compiler's `x in range(lo, hi)`
        on a number compiles to a comparison: its mask held 0 to 31 alone,
        so every clue of 32 or more was dropped from derivation, which
        biased every Keen deal and left 9dnm, 8dhm and 7dxm undealt in
        120 s (guarded in `caging.test.ts`, seen to fail planted). The
        cases' params check reads an unreadable params string as a refusal.
        Keen is the first board of typed numbers with region fills, and in
        the dark scheme the cursor's deep amber was the yellow fill's own
        color (0.04 apart): the owner chose (2026-11-23) to keep the fills
        and give such a board its own dark wash (`regionHighlightWash`),
        rather than draw Keen's cages plain as upstream does.
        Differences from the hand-written Keen, each player-visible: cages
        in the region fills, with that wash on the selected cell; the
        sign on a products-only board's clues, and a clue of five characters
        (four on a small tile) set smaller; a typed digit at half a tile below the clue's
        line; done marks on cage clues;
        an ID with no answer or more than one is refused; the hint rings
        the notes it reasons from; large clues dealt as their parts make
        them; saves break (approved). Rare cells timed after the fix
        (2026-11-23, 120 s deadline): 3dnm 0.3 s, 4dxm 0.4 s, 6dum 0.2 s,
        9dnm 0.2 s, 9dhm 0.9 s, 8dhm 1.0 s, 6dxm 2.6 s, 4dum 3.0 s, 5dxm
        4.2 s, 7dxm 12.6 s; 9dxm is not dealt on three seeds (70% of tries
        stop short of Hard, 30% finish below it), as the old port's test
        only checked its params were accepted. Run in the app 2026-11-23:
        a 6x6 Normal and a 6x6 Tricky dealt, typing, notes, a row
        duplicate and its broken cage clue in red, a clue marked done by
        press and by Shift-arrow, the hint walked to the solve on both
        (its wording "multiply to 120", once "¢" and fixed here), the
        "6x6 Normal, multiplication only" entry, light and dark.
- [ ] 2.5 Towers born: clues at both ends of a line, `numbers` with its
      separator and the optional givens after `,`, a hide from a tier up,
      `fullLine` and `tallestNearest` stated as techniques, the tower
      painter drawing past its tile with its hit test and 2D/3D preference.
      In three commits, read at `973039781` (2026-11-23):
  - [x] 2.5a Clues at slots (`at: slot`, a clue at each end of every
        line), tested on a fixture of its own, `flanking` (a Latin square
        with, at some line ends, the sum of the two squares nearest it):
        derived over `sp.slots`; written by `numbers` with a separator of
        its own (named `between: "/"`, as `apart` is `digits`' own), and a `digits` segment after a `before`
        that is written only where a clue is dealt (Towers' `,` givens);
        drawn in a tile's margin at both ends of each line, red where
        broken, hatched where a step stripes its line, gray where marked
        done (a press or drag on it, Shift or Ctrl with an arrow); printed
        in the text format's rims; and a technique's term of sort slot
        outlined in its margin by the walk (`STATED`'s term sorts).
        Done: the term sorts reach the walk as `techniques`' `slotTerms`,
        only the slot ones, which is all it reads. `numbers` now honors
        its kind's least value (it read from 0). The compiler refuses a
        `before` segment holding another kind. A fixture is not in the
        app, so the browser look is 2.5c's, on Towers.
  - [x] 2.5b The walk's own placements: a technique of the description's
        own that places (Towers' `facing`), one tried before the walk sets
        up its notes where it reads none (`fullLine`, `tallestNearest`), a
        firing whose legs are a value each (`byHeight`), a rung chosen by a
        term (`bounds`' `near`), and a journey's later legs worded by
        `again`; on `flanking`.
        Done: leading is derived (places, strikes nothing, reads no
        `cand`), not declared; a value a leg is `says: shown: value`; a
        rung chosen by a term is an arm named for one of the technique's
        rungs, so at the flip `bounds` becomes arms `lineFull` (when
        `near`) and `lowerBound`, and `fullLine`/`tallestNearest` become
        placing techniques with `fact:` words. A step with one rung other
        than its id is now recorded under that rung: Keen's `cageEasy`
        steps had been named by an id `names:` lacks, so Check & save could
        not name them; they are `cage` steps now, and the walk refuses a
        rung `names:` does not cover.
  - [x] 2.5c A hide in turn and from a tier up, on `flanking`:
        `deal.hideInTurn` hides every clue of `hide`'s first kind that may
        go before any of the next (upstream towers.c's givens, then its
        clues), and `deal.hideFrom` keeps a kind whole below a tier
        (Towers' clues at Easy). Done: the order is the shuffle stably
        sorted by kind, at each tier's pass and in a search tier's strip.
        Measured on six 5x5 Normal `flanking` deals (2026-11-23): 1 given
        and 41 sums left in turn, 30 and 16 in one order.
  - [x] 2.5d The tower painter: a value drawn as a solid that reaches into
        the tiles up and right of its own, repainted with them, a press on
        its drawn top retargeted to its cell, and the 2D/3D preference;
        on `flanking` (render and input tests: the fixture is not in the
        app, so the browser look is 2.5e's). Built as
        `play.numbers.raised` and `engine/render/raised.ts`: the tile loop
        now takes every cell's words first and then paints, each tile with
        the raised values of its left, lower and lower-left neighbors over
        it in its clip; the slots above and right of the board are drawn
        again by `drawSlots` with them over, and another margin square
        cleared first. The preference keeps Towers' `appearance` key and
        its 2D/3D choices. Tested on a raised `flanking`
        (`fill/raised.test.ts`, its three repaint and press tests seen to
        fail planted). The compiler refuses `raised` with gaps or clues at
        parts.
  - [x] 2.5e The flip: `facing`, `fullLine` and `tallestNearest` as
        placing techniques and `bounds` as arms (2.5b); Towers' tests to
        `towers.cases.yaml`, its TypeScript deleted, the `game-lines`
        ceiling lowered, its spec deltas, and the run in the app.
        Built: `fullLine` and `tallestNearest` place and read no note, so
        they lead, as `facing` now does (its conclusion reads `value`, not
        `cand`); `bounds` is `clueBounds`, its `near` and plain readings
        the arms `lineFull` and `lowerBound`. The compiler refuses a
        technique id the module exports (`bounds` clashed with
        `play.bounds`' table). The menu keeps the old port's every size
        at every tier (the plan's "Easy only" would have taken boards
        away; params-stability is unchanged), 5x5 Easy the default.
        Measured 2026-11-23, 200 deals each: the hide in turn left givens
        on 65 4x4 and 169 5x5 Easy boards, where upstream shows none;
        `deal.hideWhole` (built here, waiting on a fixture in
        `capability-fixtures.test.ts`, since no fixture's Easy finishes
        without its givens) brings both to 0. `words.value` names the
        value a height for the library's and the walk's sentences. The
        stale-hint test moved to `engine/fill/stale-hint.test.ts` on
        `flanking`, seen to fail only with both the Midend's clear on a
        preference change and `refreshStep` planted. Run in Chrome: 4x4
        Easy and 5x5 Normal deals, typing, notes and fill marks, a repeat
        and two clues red live, done by press, drag and Shift-arrow, a
        hint walked to the solve, light and dark, 2D and 3D, the wash on
        a tower's faces, a tower top over a clue and the corner, and the
        pencil-mode indicator through a top-right tower's undo and redo.
        The right and bottom frame lines were missing beside the slots (a
        slot cleared over `coord(w)`), fixed in the engine for every board
        with slots there, its test seen to fail planted. The hint sweeps
        found the implicit-notes walk passing over a continuing firing on
        21 of 182 jumps (the old port, 8 of 153): `clueBounds` shares the
        singles' tier, and a technique of that tier waited outright. A
        waiting technique now offers a continuing firing whatever its tier
        (`techniqueRung`), 15 of 184; Abcd's, Solo's and Towers' walks
        moved, every one still solved and none longer.
        Differences a player sees: the text format is the engine's framed
        grid; the auto-pencil preference says "number"; the single and set
        sentences are the library's, saying "height"; the numeral is three
        fifths of a tile, where Towers drew half; above Easy the deal hides
        givens before clues, so the mix shifts; an ID with no answer or
        several is refused; the hint rings notes; done clues are gray; a
        repeat is the engine's marker, not red numerals; saves break
        (approved).
- [ ] 2.6 Mathrax born: clues at corners, a kind precedence switched by
      option letters, a hide of givens before clues, the board word the
      hint reads stated in the description. In four commits, read at
      `8d7f5200b` (2026-11-23):
  - [x] 2.6a Clues at corners (`at: corner`), tested on a fixture of its
        own, `cornering` (a Latin square with, at some corners, the sum or
        difference both diagonal pairs make, or the same pairs): derived
        over `sp.corners`; written by a `codes` segment (upstream Mathrax's:
        a kind's code and its number, or a code that is a kind and a value
        whole, `S0`, between runs `a`-`z`, the last written, the longest
        code read first); drawn on a disc a third of a tile across where
        the four squares meet, by `play.signs` (now a list too, a word a
        value, and a kind of one value its sign alone), after the hint's
        marks, red where it breaks; printed after the text format's wall
        line. `digits` writes a kind a size bounds to at most 9 (Mathrax's
        givens, to `w`). Decided: no done marks on a corner's clue, which
        neither upstream nor the hand-written Mathrax has and no arrow
        names (a square has four corners); the compiler refuses them. A
        broken clue's whole disc is red, where the hand-written one reddens
        the quarter at each square it breaks at: a difference the flip
        lists.
  - [x] 2.6b One clue a corner, the first kind in a precedence the answer
        makes there (upstream's cascade, `deal.firstKind`), and the kinds
        switched on by letters after the tier, every kind where none is
        written (`ASMDEO`), with a check box each in Custom, the board's
        name saying which ("only addition/…" or "no …", the shorter) and
        a refusal where none is on; on `cornering`, given a parity kind
        that meets a sum (codes `E` and `O`). Mathrax's equality is a kind
        of its own (`equal`, written `S0`), so each letter is one kind and
        the precedence is upstream's order. Built as
        `engine/fill/first-kind.ts`, run on the clues derived in the main
        deal and in the climb; the params carry `kinds`, the kinds on.
        Upstream's precedence A S = M D then parity only matters for a
        parity: the other kinds never meet at a Latin square's corner.
        Tested on two answers whose corner 0 is all odd, one also the
        same (seen to fail with the precedence planted away).
        A `cornering` Easy deal keeps some 8 givens and no clue but a rare
        parity (20 5x5 deals, 2026-11-23): its Easy reads a parity and no
        other corner clue, so the givens are what finish it, and taking
        the thorough run from the other end of the hide order or keeping
        the waiting kinds out of the read-prune moved nothing. Mathrax
        reads its arithmetic clues at Easy (`clueEasy`); 2.6d measures its
        deals against the hand-written port's.
  - [x] 2.6c A hide of some kinds first and the rest in one random order
        (`deal.hideFirst`, upstream mathrax.c's givens, then its clues),
        replacing `hideInTurn: true`, which Towers and `flanking` state as
        `hideFirst: [given]`. With two kinds the two orders are the same
        sort over the same shuffle, so no deal of Towers' moved.
  - [x] 2.6d The flip: `o` renamed `w`, `entr` the tier letters, the
        supplied `placed` and `v` stated (`known` and `value` across the
        corner), every clue number said `{numeral …}`, the menu (5 to 9 at
        Easy, 7 to 9 at Normal alone), Size 3's tiers bounded, Mathrax's
        tests to `mathrax.cases.yaml`, its TypeScript deleted, the
        `game-lines` ceiling lowered, its spec deltas and the run in the
        app. Equality is a kind of its own (`equal`, a range of 0), so a
        difference is 1 up. Two capabilities came with it:
        - The deal's thorough hide keeps the shortest run from the **end**
          of its order, not the start: under `hideFirst` the start is the
          givens alone, and a Mathrax Easy deal kept 8 givens and no clue.
          Now 5de keeps 2.0 givens and 4.8 clues (the port 2.3 and 4.6),
          6de 2.1 and 8.3 (2.1 and 8.0); above Easy nothing moved. Every
          born game's Easy walk fingerprint moved with it (new boards,
          each solved). Guarded in `fill/slots.test.ts`, seen to fail with
          the run kept from the start. This is what 2.6b's `cornering`
          note tried: there it moved nothing, since that Easy reads no sum.
        - A cases file's wording takes `struck`, and is read with the
          module's nouns, as the walk reads it.
        - Check & save's judge calls the clean step's strike by `dup`'s
          name. Mathrax's new default deal showed it: a fresh walk from
          the player's notes takes the clean first, which had no name, so
          a strike of a placed number's row read "a few steps on" in every
          candidate game. Guarded in `candidate-judge.test.ts`, seen to fail
          with the name planted away.
        What a player sees differ: a broken clue's whole ring red; a wing
        hint (98 of 2442 positions walked; the port's never fired); an ID
        with no answer or several refused (upstream's `4dr:p,i` among
        them); old saves break. The 25 upstream generator descs tried all
        load and write back byte for byte. Measured on 44 boards against the port
        (2026-11-23): walk instructions +25.3% (cycles within noise),
        deal +7.8%, steps 2528 / 2522, unsolved 8 / 8. Run in Chrome: a
        5x5 Easy deal, typing, notes, a broken clue in red, a hint walked
        to the solve, a 6x6 Normal upstream board in dark.
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
