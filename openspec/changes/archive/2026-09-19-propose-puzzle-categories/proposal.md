# propose-puzzle-categories

Raised by the owner during acceptance of `implement-front-page-and-chrome`
(2026-09-07): now that the collection has a lot more games, it is time to start
thinking about categorizing or tagging them. The change was parked on four
questions for the owner, which were answered on 2026-09-19 (below), and then
implemented.

## Why

The home screen lists the catalog alphabetically, and every existing narrowing
(search, Favorites, In progress) works from something the player already knows.
**There was no way to ask "what else is like this one?"**, which is the question
somebody with 57 options actually has.

The obvious ready-made taxonomy, `PuzzleData.description` ("Letter placement
puzzle", "Loop-drawing puzzle"), is not one: it had **53 distinct values across
57 games** (measured 2026-09-07). It is a per-game subtitle, so grouping by it
yields groups of one.

**The categories also serve the maintainers** (owner, 2026-09-19: *"while the
focus of this change is on the user-facing discoverability, I want us to be able
to use these same categories for our internal maintenance"*). Work that aims at
a group of games (`sequence-hints-in-cell-games` measuring "the cell games", an
audit of the shading puzzles) needs a name for that group that is written down
once and does not drift. Before this change nothing in the tree said which games
were which, and every campaign typed its own list.

## What was decided (owner, 2026-09-19)

1. **One family per game**, rather than several tags or several axes. A single
   family answers "what else is like this one?", renders as one row of chips,
   and is easy to learn.
2. **Nine families**, drafted and accepted as follows:

   | family | games |
   |---|---|
   | Latin squares | group keen mathrax salad solo towers unequal |
   | Numbers & letters | abcd crossing seismic subsets |
   | Placing objects | boats lightup magnets tents undead |
   | Shading | bricks clusters mosaic pattern range singles unruly |
   | Lines & paths | ascent bridges loopy pearl rome signpost slant spokes sticks tracks |
   | Regions | dominosa filling galaxies map palisade rect separate |
   | Rearranging | fifteen net netslide sixteen slide twiddle untangle |
   | Moves & planning | cube flip flood inertia pegs samegame sokoban |
   | Hidden information | blackbox guess mines |

   Latin squares stays separate from the other number puzzles because "like
   sudoku" is the family players recognize.
3. **No derived "what it asks of you" axis for now.** The family already
   separates the sliding and moving games from the logic ones. A split on
   "has a hint" would sort the deliberately hintless logic games as a different
   *kind* of game.
4. **It surfaces in two places**: as filter chips on the home screen, and as
   "more like this" on the puzzle screen.

## What changes

- `PuzzleData.family`, a required field typed by `puzzleFamilies`, so a new
  game cannot skip it. Beside it in `catalog.ts`: `familyLabel` and
  `puzzlesInFamily`, the query every piece of maintenance work uses in place of
  a typed-out list.
- **Home screen**: a row of family chips under the search box. The chips work
  independently of the All / Favorites / In progress filter, and pressing a
  pressed chip releases it.
- **Search**: a family's label joins the haystack, so typing "shading" or
  "latin" finds the family.
- **Quick-switch, from a puzzle**: with nothing typed, it opens with the rest of
  the current game's family ("More Latin squares") above everything else. This
  is the puzzle screen's existing "go to another game" surface, and it is
  reached from `More… → Switch puzzle…` as well as `Ctrl/Cmd+K`.
- **A defect fixed on the way**: the switcher's `current` was an `@state`
  field, which Lit does not bind to attributes. The puzzle screen sets it as an
  attribute, so the "Playing" mark had never appeared. It is now a
  `@property`.
- **The guard** (`catalog-families.test.ts`): every game is in exactly one
  family, no family has fewer than two games, and labels are distinct. Where
  code can vouch for a family, the tag is held to the code. For Latin squares,
  every game that imports the shared Latin hint vocabulary must be tagged Latin
  squares, and every game tagged Latin squares must use the shared Latin engine.

## Impact

- Affected specs: `app-shell`.
- Affected code: `src/puzzle/catalog-data.ts`, `src/puzzle/catalog.ts`,
  `src/puzzle/catalog-search.ts`, `src/screens/home-screen.ts`,
  `src/css/home-screen.css`, `src/components/puzzle-switcher.ts`.
- Affected docs: `docs/games/README.md` (registering a game names its family),
  `AGENTS.md` § "Special files", `scripts/new-game-port.sh`.
- Not a compatibility break: the chip state is not persisted, and no saved or
  shared data mentions a family.

## Explicitly not in this change

- **Difficulty.** A game's tiers are already named, guarded and visible to
  players. Folding them into a browse taxonomy would tie the tier-name
  convention to a UI decision it has no stake in.
- **Grouping the help index (`help/puzzles.md`) by family.** Possible later,
  but the help viewer loads every same-origin link inside its own drawer, so
  help pages are the wrong place for "play this next" links.
