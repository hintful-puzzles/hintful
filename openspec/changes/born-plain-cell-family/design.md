## Context

The pilots built `engine/fill/` game by game. Kakurasu and Tents came first
(`a-game-from-its-description-alone`), then Unruly, Mosaic and Norinori
(`born-unruly-norinori-and-mosaic`). The engine now has:
- clue lists and a dealt partition;
- the `dots`, `digits` and `walls` ID segments;
- the click cycle, dealt cells and modifiers;
- `build`, `scatter`, `dominoes` and `grow` deals, with `hide`;
- a search tier;
- numbers on cells, region walls and fills, and the `domino` painter.

The second pilot's figures and the owner's judgment are in its archive
(`design.md` § "The figures (3.1)").

This change moves the rest of the plain-cell family. Each game's
description already holds its rules, clues, techniques and hint words,
since every game's ladder is described. What a flip adds is the part a born
game declares: `catalog:`, `play:`, `deal:` and `id:`, plus whatever the
engine lacks to draw and deal the game.

## The gap list (1.1)

Read at `294a20616` (2026-11-22): each game's description, `index.ts`,
`state.ts`, generator and render, against `engine/fill/` and
`describe/compile-fill.ts`. No description of the eleven listed first has `catalog:`,
`play:`, `id:` or `tierLetters:` yet, and every `deal:` is prose. Every
solver already builds the compiled module's `Dealt` and runs its ladder.

**Two games are not of this family.** Undead and Magnets declare
`marks.cand`, candidate notes their techniques read (Undead's `room`, and
its `|cand(x)| > 1`; Magnets' `?`, a tile marked a magnet either way round,
which its hint seeds as a fact). The proposal leaves out every game with
candidate notes, so both move to the candidate family's change. They are
also the two largest games and the two that fit worst. Undead's `sees` sits
at a slot and is derived through the mirrors, its monster totals are
scalars, and it has pencil modes and a counts row. Magnets has a whole-tile
input, `per: value` counts on four margins, clues the player marks done,
and a hint spoken through `steps:`.

What each of the other nine lacks, beyond the four declarations:

**Range** (upstream, not pinned; 1,381 lines):
- *Description*: `number`'s `means` reads only values, so it derives, but it
  needs `value(at) = 2 and` so no number lands on a shaded square. A
  numbered square is fixed clear by its domain, as Tents' tree is.
- *ID*: `WxH`, a bare `W` square, `d<e|u>`. The desc is a run code with
  multi-digit numbers, `_` between two numbers side by side: a new segment
  (`digits` reads one digit a clue).
- *Deal*: shaded squares apart, the rest kept connected (a `scatter`
  option); every number shown, then hidden in rotationally symmetric pairs
  (a `deal.hide` option). Unreasonable is the search tier, as Mosaic's.
- *Params*: refusals by size (w+h ≤ 128; not both sides ≤ 2; Unreasonable
  not on a 1-wide strip).
- *Render and play*: the cycle, sweep and Shift-arrow are the engine's. The
  number never fades and there is no "Clues left": a born cell number fades
  and counts, which Range would take as Mosaic's (consistency).

**Star Battle** (the fork's own, not pinned; 1,429 lines):
- *Description*: regions a dealt partition, as Norinori's; every rule reads
  `sizes.stars`, which the compiler refuses in a sampled deal.
- *ID*: `<n>s<stars>d<e|n|t>`, a bare square size and a number setting;
  the desc is wall runs (`walls`), refusing a board whose region count is
  not its size.
- *Deal*: stars, a set number per row and column and none touching even at
  a corner (a new sample); regions grown round them by `deal.grow` with
  `holds` and `smallest` read from `stars`, closing none.
- *Menu*: boards differ by stars too, and so do their tiers.
- *Render*: a `star` painter. Walls, fills, the cycle and `rulesOut` are
  Norinori's.

**Clusters** (upstream's unreleased folder, pinned; 1,506 lines):
- *Description*: the dot means `value(at) = v and` a count, so `play.dealt`
  (which wants `value(at) = v` exactly) refuses it.
- *ID*: `dots`, as Unruly's. Tier letters `etu`.
- *Deal*: a coloring whose squares each touch one of their own, dots on
  every square with exactly one like neighbor, then two like dots side by
  side both dropped, so the sampled picture need not be the answer. Graded
  by a hill climb, and Unreasonable by the search with no clue hidden: the
  search tier today strips clues.
- *Params*: refusals by area and by tier.
- *Render and play*: a dot drawn on its given; the pair's block and disc,
  as Unruly's. A drag paints the pressed value on every square it passes,
  and Shift/Ctrl-arrow each place a value: both new.

**Light Up** (upstream, pinned; 1,684 lines):
- *Deal*: walls first, symmetric at a share (`b`, `s`), then the bulbs,
  then a number on each wall, numbers hidden by turning them into plain
  walls. Answer-first sampling derives a wall on every unlit square: it
  needs a kind dealt before the answer, an answer built on it, and a hide
  that turns one kind into another.
- *ID*: `WxH[b<pc>][s<symm>][r]d<digit>`: number settings, a digit tier, a
  legacy `r`. The desc is `digits` with a second, one-valued kind (`B`) in
  the stream.
- *Render*: walls dark with white numbers (a fixed cell's look by its
  kind), the lit squares' yellow wash (an overlay read off a definition),
  the bulb, and the `show-lit-blobs` preference.
- *Play*: a toggle that will not overwrite the other button's mark, `I` to
  cross, a right-button-only sweep.

**Singles** (upstream, pinned; 1,166 lines):
- *Deal*: clues first. A Latin square, cells covered in a random order
  with the ladder after each, then each covered number replaced by a
  repeated one, graded by upstream's "sneaky circles" check. `number`'s
  `means` reads clues, which a derive refuses; this does not fit
  answer-first.
- *ID*: one desc-alphabet character a cell (a new segment). Tier letters
  `ek`; Normal refused below 4x4.
- *Render and play*: a number on every cell, shaded over or ringed; the
  ring a painter round the number. A click outside the board toggles a
  preference; the cursor wraps.

**Pattern** (upstream, pinned; 2,066 lines):
- *Clues*: `runs` is a list kind (`ListClues`), which the board, derive and
  margins all refuse; lists drawn stacked before each line's start, in a
  margin that grows with the board, with a doubled line every fifth.
- *Hint*: worded through `steps:` by a TypeScript planner from runs' least
  and greatest starts (the description says no formula states them).
- *ID*: `lists` columns then rows, and an optional `,` suffix of fixed
  squares. Tier letters `eu`.
- *Deal*: a smoothed noise picture cut at its median, every clue shown;
  Unreasonable redraws until the search proves one answer.
- *Play*: a drag that paints its first square's new value onto open
  squares of one line, or erases a rectangle; Ctrl/Shift-arrow by value.
- *Errors*: upstream's weak line check, not `violations`.

**Sticks** (the fork's own port of upstream's unreleased game, pinned;
1,642 lines):
- *Description*: `length`'s `means` reads clues and its squares depend on
  the values (no static `clueCells`); a block means `value(at) = 3`.
- *ID*: `b<pc>s<symm>` settings; one interleaved desc of blocks, `joins`
  digits and multi-digit lengths.
- *Deal*: symmetric blocks, a random fill, one `length` a line at a random
  square, then `length` and `joins` hidden in one order.
- *Render and play*: bars across and up-and-down, neither a ruling out; a
  drag that draws in the pointer's direction; Shift/Ctrl-arrow by
  direction.

**Bricks** (upstream's unreleased folder, pinned; 1,838 lines):
- *Space*: a hexagon stored as a sheared parallelogram wider than the
  params' width, its corners masked as holes. The render shears rows and
  clips; the pointer and the numpad cursor undo it.
- *ID*: runs over playable cells only, multi-digit numbers with `_`, 7 an
  unknown number; a retired tier letter that loads.
- *Deal*: a gravity build, then the ladder's own answer; a minimum share.
- *Play*: the paint drag and Shift/Ctrl-arrow by value, as Clusters'.

**Boats** (Lennard Sprong's unreleased port, pinned; 2,949 lines):
- *Clues*: `fleet` sits at the board and comes from the params
  (`f<n>…,<counts>`), which neither the board's clues nor the params hold.
  A derived `seg` would always take its vaguest value.
- *Deal*: the fleet placed largest first; `seg` added until Easy runs, then
  removed; `n` hidden by a flag, a lone hidden one put back.
- *Render*: segments shaped by their neighbors (a `hull` painter), water
  waves, and the fleet beneath the board, struck as found.
- *ID*: `numbers` columns first with a hidden `-` and a closing comma; a
  `letters` segment for the given shapes.
- *Play*: a line drag with sweep's "what the first held"; Ctrl/Shift-arrow
  by value.

**Shared by several**, so each is built once, for its first game:
- Params refusals a description states, by size and by tier (Range,
  Clusters, Light Up, Singles, Pattern, Bricks).
- Number settings in the params (Star Battle's stars, Light Up's and
  Sticks' `b`/`s`, Boats' fleet).
- Multi-digit run codes with `_` (Range, Bricks, Sticks).
- A paint drag and Shift/Ctrl-arrow by value (Clusters, Bricks, Pattern,
  Boats).
- A search tier that redraws instead of hiding (Clusters, Pattern).
- A kind dealt before the answer, symmetric at a share (Light Up, Sticks).
- A dealt kind whose meaning implies its cell's value (Clusters, Light Up,
  Sticks).

**Saves.** Every game writes its own moves (`{sets:[…]}`, `{kind:"mark"}`,
`{kind:"paint"}`, `{type:"fill"}`, `{ops:[…]}`, `{kind:"fill",x0…}`),
which `editOf` refuses. Keeping them would take a translation of old moves
into `Edit`s per game: trivial where the values match (Star Battle,
Clusters), a remap elsewhere, and for Light Up's toggles the state they
were played on. About 30-60 lines a game, read only by old saves.

## Goals / Non-Goals

**Goals:**
- The nine games of the proposal born from their descriptions, each its
  own commit, the hand-written game playing on until its flip.
- Each gap closed in the engine or the compiler, addressed to a concept and
  never to a game.
- Upstream game IDs keep loading.

**Non-Goals:**
- Map, the candidate family, and edge or link answers.
- A new figures pass as a gate. The owner judged the pilot a success; each
  flip still records its lines and capabilities, and a deal or walk
  regression a player could feel is fixed in its flip.

## Decisions

### 1. The gap list first, then the order

The gap list is § "The gap list (1.1)". The order puts the games that need
least first, and those whose needs another shares next to it, so each
later game finds more of its needs built:

1. Range: Mosaic's shape, with a multi-digit run code, a connected rest,
   symmetric hiding and params refusals.
2. Star Battle: Norinori's, with a number setting and a new sample.
3. Clusters: `dots`, and the paint drag, the arrows by value and the
   search tier without hiding, which Bricks and Pattern then reuse.
4. Light Up: a kind dealt first and symmetric, which Sticks reuses.
5. Sticks.
6. Bricks: the hexagon is its own; its drag and codes are built by then.
7. Pattern: list clues and the planner's words.
8. Singles: a deal by clues first.
9. Boats: a clue at the board from the params, and the fleet display.

Undead and Magnets go to the candidate family's change (§ "The gap
list (1.1)"; the owner, 2026-11-22).

### 2. A game keeps how it plays

As in the pilots, a born game plays as the hand-written one does, except
where making it consistent with the other born games is better. That
consistency was pre-approved on 2026-11-21. Each such difference is listed
in its flip's task.

### 3. IDs keep loading; saves break

A change that would refuse a desc upstream's generator writes is a
compatibility break, so every game's `id:` must read upstream's grammar.
Saves of the hand-written games hold their own moves, which a born game
does not read. Asked with the cost (§ "The gap list (1.1)", "Saves"), the
owner chose on 2026-11-22 to break them for all nine games, as for the
pilots, and approved the same for every later game moved onto its
description, so later changes in this initiative do not ask
(`docs/descriptions.md`).

## Risks / Trade-offs

- **Some games may not fit the shape.** Pattern's list clues and planned
  words, Singles' clues-first deal, Bricks' hexagon and Boats' fleet may
  each need a capability bigger than any so far. The doctrine says to
  question the convention first. Where a game truly cannot fit, its task
  records why and the game stays hand-written, rather than bending its
  logic.
- **Size.** Nine games is one change by family, as the owner asked. A
  session that ends part-way records the open flips in tasks.md, and the
  next session continues them.

## Open Questions

None: 1.2's saves and the two games with candidate notes were answered by
the owner on 2026-11-22.
