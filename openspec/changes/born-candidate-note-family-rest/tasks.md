## 1. Design

- [x] 1.1 Read the nine again with the query in design.md § "Context",
      against the engine at this change's baseline. Per game, the gap list:
      what its description states, what the fill board lacks to deal, draw
      and play it, each need marked met by what is built or new, and its ID
      grammar, starting from the predecessor's (its design.md § "The gap
      list (1.1)"). Write it and the order in design.md, with the
      Decisions it settles; say whether Map waits for the regions group.
- [x] 1.2 Split again if the order has a natural break: this change keeps
      the first part, and its successor is filed when it is archived.
      Split (design.md § "Decisions" 1): Solo, ABCD, Salad and Group here;
      Undead, Rome, Magnets, Crossing and Map in the successor.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added, each with its concept, and the differences a player sees; lowers
the `game-lines` ceiling; moves the game's tests to its `cases.yaml`;
writes its spec deltas; and runs `npm run test:hint-sweeps` before its
commit. In the order task 1.1 sets; a task a game, written there.
Each capability is built first on a fixture description of its own, as
the predecessor's were, in a commit before the flip.

- [ ] 2.1 Solo born (design.md § "The gap list", Solo):
  - [x] 2.1a The walk of the notes over any unit: blocks and diagonals,
        and a partition a rule holds distinct beside them
        (`checkWalkSteps`, `engine/fill/candidates.ts`). Built on the
        `boxing` fixture: the walk reads `sp.units` in the description's
        order; `blocks(a, b)` compiles to `boxes`, cut by `spaceOf` from the
        board's sizes; a unit a modifier adds is `unitVariations`, so
        `spaceOf` takes the board's variations (`paramSpaceOf` before a
        deal); a modifier is a flag term of the walk's steps by its name;
        the wing's `alongside` reaches the walk. Left for 2.1c: Solo's box
        under Jigsaw is a ruleset's dealt partition among the units, which
        the compiler has no `Dealt` field for and `spaceOf` does not read.
  - [x] 2.1b Grading on a second scale: a board dealt at the asked tier
        on each (`scales:`). Read 2026-11-23 for this: the player never
        asks Solo's killer tier; every board carries `kdiff` Region, which
        the ID does not write (`games/solo/index.ts`'s `plainBoard`), and
        the generator merges cages until the grade is exactly the asked
        tier on both scales (`generator.ts`, the loop after
        `genKillerCages`). The ladder runtime already caps and grades by
        scale (`ladder-runtime.ts`); the fill engine passes only `TIERS`.
        Built on the `grading` fixture: every ladder run on a fill board
        takes `capsOf`, each other scale at its top; the deal holds a
        board to need that top where its ladder has an entry on the
        scale, as it holds it to need the asked tier (the tier below does
        not finish it, the engine's test, where upstream's is the grade).
        For the flip: Solo's killer techniques move under `Killer`'s
        `add`, or a plain board is held on the killer scale and never
        deals; and with the answer searched under the cages, each reads
        only a cage with a total (`where clue(total, r) != none`,
        docs/descriptions.md § "The file").
  - [x] 2.1c A partition divided into equal parts (jigsaw blocks); the
        diagonals drawn; a second partition drawn inset inside the first.
        The partition among the units may be dealt, a `Dealt` field
        `spaceOf` reads (optional where a ruleset deals what blocks cut
        otherwise, Solo's Jigsaw); `deal.divide`'s `equal` tiles by
        `divvyRectangle`; `divide` may list several, divided in turn; the
        `blocks` ID segment takes `before`; the soundness checker builds a
        dealt box as blocks. Drawn: the partition among the units is the
        walled one, blocks or dealt (so `boxing`'s blocks are drawn, its
        areas inset); a dealt partition beside it is dashed and inset
        (`drawInsetWalls`), its parts holding the part clues; diagonals
        units are stroked corner to corner (`fitting` fixture). For the
        flip, a player sees: Standard and Jigsaw blocks tinted with the
        region fills as Keen's cages are; cage outlines dashed in ink
        rather than upstream's khaki solid lines; the X diagonals in the
        grid's color.
  - [x] 2.1d The symmetry option of seven, written as upstream's suffixes;
        the `{c}x{r}` and `{n}j` sizes. Read 2026-11-23 for this: Solo's
        symmetry is eight choices (`SYMM_*` in `games/solo/state.ts`, the
        default 2-way rotation unwritten, the rest `a`, `r4`, `m2`, `md2`,
        `m4`, `md4`, `m8`), where `deal.symmetric` and a `first` sample's
        option know five (`symmetric-blacks.ts`); `params-codec.ts`'s own
        header names a field written as several-letter strings (Solo's
        symmetry) as one it does not express, so this is a new segment
        kind. The fill codec writes options before the modifiers' flags,
        and upstream writes `x`, `k`, then the symmetry, then `d`; and
        Solo's decoder reads its flags in any order. The jigsaw is `r = 1`
        (`{n}j`, `c` the order), the Jigsaw ruleset, whose `box` the deal
        divides (`equal: w`, built in 2.1c) where every other board's is
        `blocks(r, c)`.
        Built, the symmetry, on the `turning` fixture: the symmetries are
        named by what they keep (`engine/generate/symmetry.ts`, nine), a
        choice names its `symmetry` (Light Up's and Sticks' too, whose
        `first` sample now maps a name to `set_blacks`' number), and
        `deal.symmetric` takes a name or such an option, hiding a clue with
        its orbit; an option with no letter writes each choice's `code`,
        the default's never; options are written after the modifiers'
        letters (no game had both); and the search sample runs where no
        partition is divided, on the board's units alone (Solo's Standard
        and X boards). Built, the sizes, on the `blocking` fixture:
        `play.blocks` sizes a board by the two sizes of its `blocks(a, b)`,
        the ID's `{b}x{a}`, `{b}j`, a bare `n`, and the Custom dialog's
        columns, rows and game mode (folding to the squarest, as Solo's
        does); the variation that replaces the blocks with a dealt
        partition is found by the compiler (`boxes.dealtBy`), is on exactly
        where `a` is 1, and alone divides, cuts and writes that partition
        (`FillDivide.variation`, the blocks segment's `after`); the blocks'
        sizes are in `Dealt`, which the space reads; a preset variant now
        keeps its board's sizes. For the flip: Solo's sizes need other
        names, since `given:` reads `c` in the domain as its cell (the
        loader now refuses a size named `c`); the fill codec writes the
        default tier's `dt`, which upstream omits and reads either way.
  - [x] 2.1e What a draft of Solo's born description refused, read
        2026-11-24 by compiling it and dealing each board: Killer's cages
        and totals were dealt and written on every board; a total, a clue
        at a part, could not be written as upstream's digits at the cage's
        first cell; the blocks were written with Keen's repeat counts, which
        upstream Solo neither writes nor reads; the givens were not hidden
        whole under Killer; a part's clue needed a sign; and X's and
        Killer's size bounds had no place. Built on the `killing` fixture:
        a partition a variation adds is divided, written, read and drawn,
        and its clues derived, only under it (`FillDivide.variation` for
        `add` too); a kind at parts names its partition
        (`FillDeal.partsOf`, where `partitions[0]` was assumed); `digits`
        writes a part's clue at its first cell and reads it anywhere in the
        part, one a part; `blocks` takes `counts: false` (and `blocking`'s
        and `fitting`'s, which claim Solo's form, now write it); `hideWhole`
        takes `with:` a variation, its tier optional; a part's clue with no
        sign is drawn as its number; a modifier takes `bounds`.
  - [x] 2.1f The flip: `solo.description.yaml` is the draft, every
        technique checked sound, its tests `solo.cases.yaml` (upstream's
        IDs read and written back, the refusals the old tests held, the
        live errors, a pin for every rung). Run in the app: a deal, input,
        a hint walk solved to the end, live errors, X, Killer and Jigsaw,
        dark mode. What the flip added to the engine, each for any game:
        a partition or technique a variation adds is absent, undrawn and
        no rung on a board without it (a Standard board crashed drawing
        Killer's cages, and its hint asked for Killer's rungs); the live
        errors and the answer check read the board's own space, its
        variations' units and its blocks (they read the module's units on
        a bare grid: an X diagonal broke a Standard board, and a repeat in
        a cut block broke nothing); the text format walls the partition
        the board draws (`walledParts`, shared with the renderer); a
        stated `{unit}` names the board's unit holding the cells; a
        strike's `long:` reaches its step, as a placement's did (the walk
        dropped it). What a
        player sees differ: saves break (pre-approved); the full params
        write Easy's `dt`; `kx`, an order upstream never writes, is not
        read; two runs of blanks in a row read as one, as upstream reads
        them, where the port refused them; the blocks are tinted with the
        region fills and the cages dashed in ink inside them; a label
        reads "3x3 Normal, X" for "3x3 X Normal"; the hint's words are
        the description's `says` and the walk's `steps`; a 4 Jigsaw has
        no Normal or Tricky and a 2x2 Killer nothing above Easy, as
        upstream's generator deals none; the text of a Killer board
        prints its blocks and each row's totals, not its cages; the
        Killer preset's full form is `3x3kdt`, the default symmetry, where
        it was `3x3ka` (Killer hides every given, so no board differs).
        Found on the way: `npm run game` walked a born game's directory,
        YAML alone, and so ran 19 test files where the commit runs some
        130; it now reaches the compiled module, as the commit does.
- [ ] 2.2 ABCD born: the number size, letters, the walk with no region, a
      clue per value derived, written and drawn in a margin, corner
      crosses, `D` and `R`.
- [ ] 2.3 Salad born: a ruleset that chooses kinds and segments, the
      folded Latin square, the empty value and `O`, the ball weakened
      before it goes, the ID's slot order.
- [ ] 2.4 Group born, after the owner's answer (design.md § "Open
      Questions"): the letters relabeled about the identity, `i` after the
      tier, the hide's keep-set, an answer from shipped data.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost` against
      a worktree of this change's baseline, recorded in design.md; each
      deal measured bundled, never under vitest.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done, or file
      the next part beneath it.
