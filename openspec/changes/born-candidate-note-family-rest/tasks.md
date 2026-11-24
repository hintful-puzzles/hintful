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
  - [ ] 2.1e The flip: its words as `says`, its tests to `cases.yaml`.
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
