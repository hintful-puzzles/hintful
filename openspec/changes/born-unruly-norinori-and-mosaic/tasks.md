## 1. Design

- [x] 1.1 Read `a-game-from-its-description-alone` in the archive (its
      design.md § 9 and its tasks' as-built notes) and `docs/new-game.md`
      § "A game born from its description".
- [x] 1.2 Per game, the gap list: what its description already states, what
      `fillGame` lacks (Unruly's optional unique-lines rule and its params,
      Norinori's regions in the desc and the render, Mosaic's clue on a
      cell and its counting marks), its ID grammar, and its saves. Ask the
      owner about breaking these games' saves, with the cost. Write
      `design.md`. Written 2026-11-22 (§ "The gap list", § 4: sixteen
      capabilities named before any is built). Asked the owner the saves
      question and, since the list already shows more engine work than
      Tents needed, whether to go on. The owner (2026-11-22): break the
      three games' saves; go on with all three, in § 1's order.

## 2. The games

Each its own commit, the hand-written game playing on until its flip. Each
runs in the app before it is done (deal, input, hints, live errors, dark
mode, a solve to the end).

In design.md § 1's order: Mosaic shares most of Unruly's capabilities, and
Norinori's partition is its own.

- [x] 2.1 Unruly born; its capabilities added listed here. Done
      2026-11-22, 1,160 hand-written lines gone. Added, each the engine's:
      `play.click: cycle` and a value's list of keys; `play.dealt`, a clue
      kind dealt as fixed cells, and the `dots` ID segment (upstream's dot
      runs); `play.modifiers`, a variation in the params by its letter,
      with `most` and `sizes.step` refusing a board; the menu's `default`,
      `boardTiers` and `variants`; `deal.sample: {build: true}` and
      `deal.hide`; the pair's `block` and `disc` painters, the hint naming
      a pair piece by its word, and the given's lifted surface; live errors
      drawn by their cells' shape (a run's bar, a strike across lines
      alike, a badge on a pair piece); and the placement's grow, for a
      painter that `grows`. The fill Ui holds the line stroke's drag only
      where the stroke is a line. The hint walks shorten (a firing that
      settles several cells is one step), and the help says so.
- [x] 2.2 Mosaic born; its capabilities added listed here. Done
      2026-11-22, 1,617 hand-written lines gone. Added, each the engine's:
      - [x] the `digits` ID segment (a digit a shown clue, a letter a run
            of hidden ones, the trailing run kept), and a deal setting as a
            param flag (`deal.thorough`, Mosaic's `h`: on below a width on
            the menu, and on where absent, as upstream reads it);
      - [x] a clue's cells (`clueCells`, the sets its `means` ranges
            over), read by the render and the search;
      - [x] `deal.hide` tier by tier from the lowest, first dropping the
            clues no firing's bindings read (`techniques`' `reads`);
            unthorough, none at the lowest and as many as the board's
            shorter side above. Hiding one at a time at the asked tier was
            3-5x the hand-written deal's time; tier by tier it is on par
            at Easy and Normal (20x25: 285 and 863 ms against 300 and 783);
      - [x] a search tier: the last tier named Unreasonable is the answer
            search's (`engine/fill/search.ts`): its deal, contract, Solve
            and Check, the search assuming in the cells of the number with
            fewest open. Its deal is 1.3-2x the hand-written one (20x25
            3.9 s against 2.1 s), and as hard: the median left undecided
            on 30 boards, 49 of 100 at 10x10 against 43 (a miscounted
            every-clue try had made it 65);
      - [x] a cell clue drawn as a number on its cell, faded where met and
            its cells decided, a badge where broken; an outlined number's
            cells outlined as one block and the number circled; "Clues
            left: N" in the status bar; the number in the text format;
      - [x] the `clear` painter (its own surface and a faint cross, none
            under a number), and `scatter.each`, a value at each cell's
            own odds, so a small board draws from every picture.
      Mosaic alone of every game froze its input once solved; the born game
      does not (consistency, pre-approved 2026-11-21). The default board
      is the menu's 8x10, where it was a 10x10 off the menu: a born game's
      default is one of its boards. Hint-applied squares are one move
      each, as in every game whose hint plays its targets' clicks.
- [ ] 2.3 Norinori born; its capabilities added listed here.

## 3. Finish

- [ ] 3.1 Figures against the change's first commit's parent: lines,
      frame time, hint-walk time, capabilities added per game. The pilot
      holds if they fall from game to game and time is within 10%.
- [ ] 3.2 Spec deltas; lower the `game-lines` ceiling with each flip.
- [ ] 3.3 Commit, push, archive. File the plain-cell family's migration if
      it holds; if not, record why in the doctrine.
