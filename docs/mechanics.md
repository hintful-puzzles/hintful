# Game mechanics and affordances

How a game states its mechanism: params, presets and the Custom dialog,
descriptions, state, moves, status, the capability hooks, and the player
affordances (pencil marks, the reference aid). The contract is
[`src/engine/game.ts`](../src/engine/game.ts), whose doc comments say what
each member is for. The requirements are in the
[`ts-engine`](../openspec/specs/ts-engine/spec.md) spec and the `engine-*`
specs beside it, above all
[`engine-params`](../openspec/specs/engine-params/spec.md),
[`engine-difficulty`](../openspec/specs/engine-difficulty/spec.md) and
[`engine-notes`](../openspec/specs/engine-notes/spec.md).

## What every game does

Each step names the file of the skeleton
([`src/skeleton/grid/`](../src/skeleton/grid/)) that already does it, and
the section that says more.

1. **Types**, in `state.ts`: `Params`, a `State` of typed arrays, a `Move`
   that is a discriminated union, and a `Ui`. See "Idiomatic state, not a C
   transliteration", "Moves are discriminated unions" and "Entry state lives
   on the `Ui`".
2. **`paramConfig`**, in `state.ts`: `dimensionParamConfig` for the size and
   `difficultyItem(tierNames(n), field)` for the tier, each with its `doc`.
   See "Params are declared once, on `paramConfig`" and "Difficulty is a
   declared contract".
3. **The boards**: at least three, smallest first. `defaultParams` returns
   the first and `presets` returns `presetGrid(paramConfig, BOARDS)`. See
   "The preset menu is a grid".
4. **The params codec**: `paramsCodec(defaultParams, [...segments])` gives
   `encodeParams` and `decodeParams`, and `validateParams` returns a sentence
   or `null`. See "The params codec and validation".
5. **`transposeParams: transposeDimensions()`**, in `index.ts`. See "Portrait
   boards, and turning them to fit".

   A board sized by one number differs from the skeleton in three places: the
   size is `numberItem` with `label: { slot: "size", words: squareSize(field) }`,
   its codec segment is `size(paramConfig, kw)`, and `index.ts` writes
   `notApplicable: { transposeParams: SQUARE_GRID }`. Exemplar:
   [`starbattle/state.ts`](../src/games/starbattle/state.ts).
6. **The desc**: one `parseDesc` built on `readDesc`, and a `newState` that
   builds from `descValue(parseDesc(p, desc))`. See "Read a desc once".
7. **`executeMove`**: clone the state, apply the move, and end the dispatch
   with `assertNever`. See "executeMove is pure" and "A move you do not
   recognize is refused, never guessed".
8. **`status`**, in `index.ts`: the completion check, asked of the board. See
   "Status".
9. **`difficulty`**, in `index.ts`: `solveAtCap` over the game's solver. See
   "Difficulty is a declared contract".
10. **The `Game` object**, in `index.ts`: a capability is offered by having
    its method, and a section the puzzle has no use for is excused in
    `notApplicable`. See "Capability flags" and "Contract sections, and what
    makes a draft".

## Sections

| Section | Read it when |
| --- | --- |
| The Game contract at a glance | you add, drop or make required a member of `Game` |
| Absence is `null` | a value, a return or a test result may be missing |
| Idiomatic state, not a C transliteration | you port state or array surgery from upstream's C |
| The params codec and validation | your game encodes params into a game ID or refuses some |
| Float params round-trip through %g | a params field is a fraction |
| Portrait boards, and turning them to fit | you choose preset sizes, or the board cannot turn |
| Params are declared once, on `paramConfig` | you add a params field, its help, bounds or label words |
| – A game that plays different puzzles on one board declares its rulesets | a setting changes the rules or which squares are neighbors |
| – A setting that adds, removes or bounds one rule is a modifier | a checkbox turns one rule on or off |
| – A choice's name is typed once | code or a help page names a choice |
| The preset menu is a grid | you write or change `presets()` |
| The Custom dialog | you write `paramConfig` accessors, or one field folds into another |
| Difficulty is a declared contract | your game has tiers, or deduces and has none |
| Descriptions and state | your game builds a board from a desc |
| – Read a desc once | you write `parseDesc` and `newState` |
| – Digits and numbers in a desc are one fact, and it is not yours | a desc holds a digit, a number or a value above nine |
| interpretMove and UI_UPDATE | you choose between a move, `null` and `UI_UPDATE` |
| executeMove is pure | a move would draw at random, or forces more placements |
| Moves are discriminated unions | you define the `Move` type |
| A move you do not recognize is refused, never guessed | you write `executeMove`'s dispatch |
| Status | you write `status`, or want a "completed" field |
| Capability flags | a capability depends on the params, or you want a flag |
| – Contract sections, and what makes a draft | your game lacks a hint, mistake check, solver or turned board |
| Entry state lives on the `Ui` | your game has a cursor, a drag or several entry methods |
| changedState | your `Ui` tracks the board across undo, solve and restart |
| Ui that must survive a save | a `Ui` field is set in `interpretMove` and is in no move |
| Preferences | your game has a setting of its own |
| Timed games | a board nobody can play on still reads `ongoing` |
| A board decided at first click | the board is not determined until the first move |
| A deduction's notation is a mark the player can make | a tier needs a kind of mark the game lacks |
| Mistake checking is part of done | your game has one answer |
| Pencil marks: the full note-taking UX | your game has notes or a pencil mode |
| The reference aid | the player tracks which of a fixed set of pieces is used |
| – An inventory already drawn on the board is an input surface | the piece list is already painted on the canvas |
| Bespoke geometry | the board is not a plain rectangle of squares |
| – Padded rectangles and sheared draws | an odd-shaped board is stored in a rectangle |
| – One function, both callers | input and drawing both need an origin, a layout or a rule |
| – Grid modes are a movement table | your game has several grid shapes |

## The Game contract at a glance

A game is one object implementing `Game<Params, State, Move, Ui, DrawState,
Mistake, …>` ([`game.ts`](../src/engine/game.ts)), and it depends on that
interface only, never on the `Midend`. The file layout is
[`new-game.md`](./new-game.md) § "File anatomy".

- **Leave out an optional member the game has no use for.** Absence means
  "this game does not have that capability" and is no stub: a game with no
  solver omits `solve`.
- **Do not add an optional member speculatively, or leave one whose consumer
  has gone.** [`contract-surface.test.ts`](../src/contract-surface.test.ts)
  requires every optional member of `Game` and of `PuzzleStaticAttributes`
  to have an implementer and a consumer. A capability kept unread needs an
  entry in that test naming the change that owns the decision.
- **When every game implements an optional member, ask what the optionality
  costs game code.** `preferredTileSize` stays optional because the engine
  absorbs its absence. `newDrawState` and `redraw` are required because an
  optional one would reach every game as `ds: DrawState | null`.

## Absence is `null`

Write a value that may be absent as `T | null`, in the engine, the games,
the app and the build ([`ts-engine`](../openspec/specs/ts-engine/spec.md),
"Absence has one spelling").
[`absence-spelling.mjs`](../scripts/checks/absence-spelling.mjs) fails any
union naming `undefined`.

- **`undefined` is never a member of a union.** "Not supplied" is `?` on an
  optional parameter or member. A value the language produced as `undefined`
  (`step?.highlights`, `Map.get`, `Array.find`) takes `?? null` where it
  enters a declared type. A cast declares nothing, so `x as T | undefined`
  passes.
- **Two kinds of nothing get names**, so a `??` cannot merge them: a digit,
  `"clear"` or `null`; the settings store's `UNSET` beside a stored `null`.
- **A failure with nothing to return on success is its reason or `null`**
  (`validateParams`). **A failure beside a value is a result**,
  `{ ok: true, … } | { ok: false, error }` (`solve`, `hint`).
- **Re-read every comparison when you respell an absence.** `x === null`
  compiles against `number | undefined` and is always false, so the check
  accepts everything with the typechecker and the suite green.
- **Assert a present answer with `not.toBeNull()`.** `toBeDefined()` passes
  on `null`.

The reason for `null`: a declared `T | null` return that falls off the end is
a compile error, and a `T | undefined` return accepts the missing `return`.

## Idiomatic state, not a C transliteration

Use upstream's C (in git history) as a reference for the logic, never as a
template for control flow: classes over handle-passing, iterators over
`while (next())`, `boolean` and unions over `0|1`, modern containers over
mirrors of C arrays. Comments and names follow
[`repo-layout`](../openspec/specs/repo-layout/spec.md), "A comment says what
the code cannot, and a name answers its own question".

- **Build a new array from the pieces you mean**
  (`[...before, ...detour, ...after]`); do not transcribe in-place array
  surgery. C's `memmove` leaves the moved-away values in the vacated slots
  and upstream may read them back, while `splice` and `concat` destroy them,
  so the port fails only on the narrow case that read them. The tell is an
  overlapping `memmove` or a buffer read past its logical end. Exemplar:
  `spliceDetour` in [`inertia/solver.ts`](../src/games/inertia/solver.ts).
- **Share the parts of state that never change, by reference, typed
  `readonly`.** A component fixed at `newState` is shared by every cloned
  state, so a move copies only what moves. The type is the whole guarantee:
  `Object.freeze` throws on a populated typed array, so do not freeze at
  runtime and do not downgrade to a plain `Array` to get a freeze. Exemplar:
  [`netslide/state.ts`](../src/games/netslide/state.ts).

## The params codec and validation

`encodeParams(p, full)`, `decodeParams(s)` and `validateParams(p, full)` are
the game-ID surface: `params:desc` and `params#seed` ids are built from
them. **An encoding is frozen into shared ids**, so changing one is a
compatibility decision for the owner.

- **Declare the codec once.** `paramsCodec(defaultParams, segments)`
  ([`engine/params-codec.ts`](../src/engine/params-codec.ts)) derives both
  halves from one ordered list of `dims`, `size`, `num`, `letters`,
  `choice`, `flag` and `unusedLetter` (`engine-params`, "The codec grammar
  is a prefix, tagged segments, flags and letters"). `full: true` marks a
  field only the generator needs, which the brief encoding omits;
  `means: false` writes the letter when the field is off; `omitWhen` and
  `whenAbsent` cover a field written only when non-zero and a default
  computed from other params. Exemplar: the skeleton's
  [`state.ts`](../src/skeleton/grid/state.ts).
- **A segment names a `paramConfig` field by its `kw`** and uses that item's
  accessors, whatever representation the game gave the field.
- **Hand-write a grammar the segments do not fit**, and add no segment
  option for one game (`engine-params`, "A params encoding the grammar does
  not fit stays hand-written"). Exemplars: a float (Netslide), a letter
  before the dimensions (Cube), a loop over the tail (Mines).
- **A params string is read whole or refused** (`engine-params`, "A params
  string is read whole or refused"): a letter the game does not read where
  it stands is never defaulted and never skipped. A declared codec does
  this itself. A hand-written `decodeParams` throws the engine's refusal
  from
  [`engine/params.ts`](../src/engine/params.ts): `paramsLetter(s, i,
  letters)` for the letter after a tag, `unreadParams(s, i)` in the last arm
  of a scanning loop, `endParams(s, i)` before a decoder that reads in order
  returns.
- **A letter upstream's encoder writes for a setting this game has no field
  for is read by name**, with `unusedLetter` or an arm of its own. Add a new
  port's upstream strings, from its `encode_params`, to `UPSTREAM` in
  [`upstream-params.test.ts`](../src/puzzle/upstream-params.test.ts), which
  requires an entry of every game whose catalog `collection` is not `own`.
- **`validateParams` returns the reason, or `null` for valid**: one
  sentence with its full stop, saying what to change in the dialog's own
  words ("Width times height must be at most 54.", not "Grid is too big")
  (`engine-params`, "A params refusal is a sentence").
  `params-refusal.test.ts` reads every string one can return, through
  constants (`AREA_TOO_LARGE`) and helper calls.
- **Do not re-baseline
  [`params-stability.test.ts`](../src/engine/params-stability.test.ts) with
  `vitest -u`.** Every line of its table that moves is a shared game ID
  that stops naming its board, so it needs the owner's say-so. A new game
  adds its own lines and moves none: run with `--update` and read the diff.

## Float params round-trip through %g

A `float` param reproduces C's `%g`, `atof` and single precision, because
each changes the board and not only the label: a count computed from a
probability moves by one for one ulp.

- **Encode with `formatG`**: six significant digits, trailing zeros stripped.
  `String(x)` renders 1/3 as sixteen digits and changes what decodes back.
- **Decode with `parseLeadingFloat` in `decodeParams`, and with `atof` in a
  dialog field's `set`**: garbage reads as 0, which the bounds then refuse,
  and the exponent `%g` writes (`1e-05`) is read (`engine-params`, "A letter
  upstream writes is read by name"). `Number.parseFloat` gives `NaN`, which
  passes every `<` and `>` check.
- **`Math.fround` at every boundary that admits a value**, to store what C
  stores.

The three functions are in [`engine/params.ts`](../src/engine/params.ts).
Exemplar: [`netslide/state.ts`](../src/games/netslide/state.ts).

## Portrait boards, and turning them to fit

**Every default and preset draws no wider than tall** (`engine-params`,
"Every default and preset draws no wider than tall"). Choose sizes by what
the game's `computeSize` returns, never by its params: a clue margin, a side
panel or a tiling's cell shape decides the aspect. A tiling that cannot turn
takes sizes of its own that draw tall, not a landscape size transposed. A
board whose shape is the puzzle's own (a solid's net, a hexagon) goes in the
`WIDE_BY_NATURE` ledger of
[`orientation.test.ts`](../src/engine/orientation.test.ts) with its reason.

**Declare `transposeParams` so the midend can deal a new board turned** when
that gives a larger tile (`engine-params`, "A deal turns the chosen params
when the turned board fits better"). The chosen params stay as chosen, the
type menu names a turned board after its preset, and nothing already on
screen is turned.

- A plain grid declares `transposeParams: transposeDimensions()`, or passes
  its field pair (`transposeDimensions<UnrulyParams>({ w: "w2", h: "h2" })`).
- Swap anything else laid out on the grid too (a forced first click).
- Return `null` for a mode that must not turn (Loopy's
  `LOOPY_GRIDS[].turns`).
- A game whose size is not two fields takes a flag of its own (Dominosa's
  `tall`).
- A bound on width or height alone needs nothing: the midend never turns to
  a size `validateParams` refuses.

**Leave it out only when a tall board is a different game** (gravity, a goal
on a fixed side) **or the same one** (a square grid: `SQUARE_GRID`), and say
which in `notApplicable.transposeParams`. A game that neither turns nor says
why is a draft ("Contract sections, and what makes a draft").
`orientation.test.ts` holds every implementation to turning back exactly and
to drawing the turned board with width and height exchanged, and a
`SQUARE_GRID` reason to every menu board drawing square. A game that draws
something along one side only records it in `UNEVEN_FRAME`.

## Params are declared once, on `paramConfig`

Put every fact about a params field on its `paramConfig` item. The engine
builds the rest from it: the Custom dialog, the preset titles and the type
header ([`engine/param-label.ts`](../src/engine/param-label.ts)), the bounds
check (`paramsError` in [`engine/params.ts`](../src/engine/params.ts)), the
Parameters section where a help page writes `{{parameters}}`
([`engine/param-help.ts`](../src/engine/param-help.ts)), the tier accessors
and the codec (`engine-params`, "A params field declares what it means, its
range and its words" and "Params validity is the engine's check"). An item
carries:

- **`doc`**: what the field means, as HTML inside the help's `<dd>`, naming
  every word choice of a choices field. `{ with: kw }` documents an item
  with the one before it, as `dimensionParamConfig` does for Height.
- **`bounds`** on a numeric text field: `{ min?, max? }`, an unconditional
  range only. A limit that depends on another field, or that holds only
  when generating (`full`), stays in `validateParams` (`engine-params`, "A
  generation-only bound is gated on full").
- **`label`**: which slot of the params label the field's words fill, of
  `[ruleset: ]size[ kind…][ tier][, tail…]` (`engine-params`, "One describer
  labels every params set"). `words` returning `null` leaves a default
  unsaid. A checkbox must give words; a choices field says its choice's
  name by default.

**A preset leaf is `{ params }`, and its name is their label.** Give it a
`title` only when upstream gave the board a name no field says
(`engine-params`, "A preset keeps a declared title only for a name no field
says"; `params-declared.test.ts`). Read a preset's name as the `label` of
its leaf in `presetMenu(game)`, never from `game.presets()`, which leaves it
unset.

### A game that plays different puzzles on one board declares its rulesets

Declare them with `rulesetItem(rulesets, field)` in `paramConfig`
([`engine/ruleset.ts`](../src/engine/ruleset.ts)): each a `name` and its
`rule`, the sentence that sets it apart, easiest to learn first. The engine
builds the dialog's "Game mode" field and its help entry, the name in front
of a params label ("Tectonic: 7x7 Easy"), a section of the Type menu for
each ruleset, and the list where a help page writes `{{rulesets}}`
(`engine-params`, "A game declares its rulesets with rulesetItem" and "The
preset menu gives each ruleset a section"). Exemplars:
`git grep -l rulesetItem src/games`.

- **List the presets flat.** A ruleset game that writes a menu section of
  its own is refused.
- **A test naming a preset reads its `label`**, which is what `leafPresets`
  returns. A menu line under a ruleset's heading, the leaf's `title`, leaves
  the ruleset's name off (`engine-params`, "A preset leaf carries a label
  and a title").
- **A field that changes which squares are neighbors is a ruleset.** A field
  that changes only the board's shape or look (a tiling, a solid) is a
  `kind`. Only a ruleset puts a word in front of a title.
- **A ruleset need not be a params field of its own.** Ascent keeps one
  `mode`, which its ruleset item and its board-shape item both read and
  write.
- **A ruleset that does not take every value of another setting says so with
  `only`**: the field's `kw`, with the choice indices it offers or the one
  value of a checkbox (`engine-params`, "A ruleset declares what it offers
  of the other settings"). The engine narrows the dialog, refuses any other
  deal and writes the help entry, so write no `validateParams` branch, no
  `doc` sentence and no params value for such a pair. A limit on a typed
  number stays in `validateParams`, since a text box cannot show it before
  OK.

### A setting that adds, removes or bounds one rule is a modifier

Declare it with `modifierItem`
([`engine/modifier.ts`](../src/engine/modifier.ts)): a checkbox, the value
`when` its rule applies, the `words` a title says then ("wrapping", "no
loops"), and the `rule` as a sentence that starts lower-case, in HTML where
it needs markup. The engine builds the field's help entry ("When on, …",
with the game's `note` for a size or limit the rule brings), the label
words, and the list where a help page writes `{{modifiers}}`, each line
headed by those words. Exemplars: `git grep -l modifierItem src/games`.

- **The test against a ruleset is a deal.** If every combination of a game's
  candidates is a board, they are modifiers; if two exclude each other they
  are one ruleset field. A setting that only tunes the generator or the look
  is neither.
- **A modifier that takes a tier away says so with `only`**: a checkbox's
  applies while its rule does, and a choice's is keyed by the choice's
  index. The tier gives way to the modifier, and the engine builds what it
  builds for a ruleset's `only`. A field that decides others is narrowed by
  none, and the declaration throws if it is.

### A choice's name is typed once

Type a choice's name in the item's `choices` and nowhere else. Code reads it
from the array. A help page writes `{{choice:<kw>:<index>}}`, which the help
build expands (`expandChoices`) and refuses when it names no choice.
`help-coverage.test.ts` fails a page that types the name. The game's own
name and the tier names are outside that check.

## The preset menu is a grid

Build `presets()` with `presetGrid(paramConfig, boards, opts)`
([`engine/preset-grid.ts`](../src/engine/preset-grid.ts)): name the boards,
at least three and smallest first, and the builder writes each at every tier
in order, then one board for each thing that is neither a size nor a tier
(`opts.variants`). A game without tiers lists its boards. `defaultParams()`
is the start-up choice. Exemplar: the skeleton's
[`state.ts`](../src/skeleton/grid/state.ts).

[`preset-menu-shape.test.ts`](../src/engine/preset-menu-shape.test.ts) holds
every game's menu to the shape, whether or not it calls the builder
(`engine-params`, "The preset menu is a grid", "A preset menu is short
enough to choose from", "A board's tiers are one run of lines, and every
tier is offered" and "A checkbox rule modifier has one line of the menu").
What a game does to fit it:

- **Eighteen lines a menu (`MENU_LINES`)**: a game with several rulesets
  offers one board of each, and a game with many kinds of board one of each
  family. The Custom dialog reaches the rest.
- **Twelve lines a section (`MENU_SECTION_LINES`)**: trade sizes against
  tiers.
- **A board that stops short of the hard tiers or starts above the easy
  ones says so with `opts.tiers`**, for a deal that takes seconds, a tier
  that means nothing at that size, or the twelve lines. Write which at the
  menu.
- **A tier left off every board of a ruleset, for a reason other than every
  board refusing it, goes in the test's `TIERS_NOT_OFFERED`** with the
  reason, under the ruleset's name, so that each ruleset's reason is its
  own.
- **A rule modifier, or a second kind of board, has one line after the
  grid.** A second kind of board may instead have a short run of tiers.
- **The smallest board at the easiest tier goes first.** `puzzle-screen.ts`
  deals the first preset to a player who has never chosen.

Also:

- **A preset encodes full params, difficulty included.** The midend builds
  the game ID, and the type-menu label read from it, from
  `encodeParams(_, true)`. When a new game's header shows the default
  difficulty over a board that generated correctly, check that first.
- **Time a deal before offering it.** Time three deals of each new cell, on
  the machine as it is, and cut the row where the tail leaves a second.
- **Then ask whether the board needs its tier**: a small board dealt at a
  hard tier can come back at once and need only an easier one.
  `difficulty-contract.test.ts` asks it of every preset (`lowestSolvingCap`),
  on the gate for the first preset of each tier and on the slow tier for
  all. Run it with the slow tier on when you change a menu.
- **Three sizes written as `[4, 5, 6]` read as a color** to
  `palette-source.test.ts`. Add the line to its `NOT_COLORS` with the
  reason.
- **A test that needs a particular board names its params**, never an index
  into the menu.

## The Custom dialog

`Game.paramConfig` is the "Custom type…" form: an ordered
`ParamConfigItem<Params>[]`. The midend builds the form from it, parses a
submission onto a copy of the params and validates with `paramsError`, so
the dialog rejects exactly what a game ID would. Every registered game
declares a non-empty one
([`custom-params.test.ts`](../src/engine/custom-params.test.ts)).
Exemplars: [`pattern/index.ts`](../src/games/pattern/index.ts) (width and
height), [`towers/index.ts`](../src/games/towers/index.ts) (size and
difficulty), [`solo/index.ts`](../src/games/solo/index.ts) (a fold).

- **A key matches the C config slug.** `get` returns an index for a choice
  and a string for a text field, and `set` is its inverse.
- **A numeric `set` goes through `parseConfigInt`, never
  `Number.parseInt`.** Garbage becomes 0, which the bounds reject; `NaN`
  slips a hand-written bound check. `numberItem` is that shape for a plain
  integer field.
- **Never hand-write the width and height pair.** Call
  `dimensionParamConfig({ doc, bounds })`
  ([`engine/params.ts`](../src/engine/params.ts)). A game that spells its
  fields differently passes the field map (`fields: { w: "w2", h: "h2" }`)
  and is not renamed to fit. A square game declares one `numberItem` labeled
  with `squareSize(field)`.
- **A cross-field fold comes after the items it reads.** The midend applies
  each `set` in array order.
- **Check labels and choice lists by eye, and assert a field map in the
  game's own test.** `custom-params.test.ts` drives every preset through
  `get` and `set` and asserts identity. That catches a wrong inverse and
  cannot see a wrong label, a wrong choice list or a swapped field map,
  since `get` and `set` name the same field either way. Exemplar: the
  "drives w2/h2" test in
  [`unruly.test.ts`](../src/games/unruly/unruly.test.ts).

## Difficulty is a declared contract

A tiered game declares its difficulty item in `paramConfig` and
`Game.difficulty` ([`engine/difficulty.ts`](../src/engine/difficulty.ts)),
which holds only the capped solve, `solveAtCap` (`engine-difficulty`, "A
tiered game declares a difficulty contract on its Game"). Declaring both
enrolls the game in `difficulty-contract.test.ts`, above all in
cap-monotonicity, which Check & Save depends on. Exemplar: the skeleton's
[`state.ts`](../src/skeleton/grid/state.ts) and
[`index.ts`](../src/skeleton/grid/index.ts).

- **The item is `difficultyItem(TIERS, "diff")`**, or
  `difficultyItem(TIERS, { get, set })` for a game that stores a word or an
  enum (`engine-params`, "A tiered game declares its difficulty field with
  difficultyItem").
- **A cross-game caller reads and moves a tier with `tierOf(game, p)` and
  `withTier(game, p, tier)`**, never `{ ...p, diff: cap }`: a game may type
  its tier as a string union or an enum.
- **`TIERS` is `tierNames(n)`**, or `tierNames(n, { search: true })` where
  the top tier's boards can require Search (`engine-difficulty`, "Tier names
  come from one collection-wide scale" and "Unreasonable is declared and
  never issued by position").
- **A `DIFF_*` constant names a solver rung, not a tier.** A `DIFF_TRIVIAL`
  that is the first tier is shown as "Easy". At runtime the names come from
  `difficultyTiers(game)`, never from the constants or the technique ladder
  (`engine-difficulty`, "A game's tiers are read from its difficulty item";
  [`solver-and-generator.md`](./solver-and-generator.md) § "The difficulty
  contract"). What a tier means is
  [`solver-and-generator.md`](./solver-and-generator.md) § "A tier means
  exactly its rung".
- **A game that deduces has tiers** (`engine-params`, "A deductive game has
  tiers"): at the least Easy, which its deductions and its hint finish, and
  Unreasonable, a board with one answer that they do not reach
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Giving a
  deductive game an Unreasonable tier").
- **A game with no tiers declares `finishesByDeduction`** (`engine-params`,
  "An untiered game says whether deduction finishes a board"):
  `nothingToDeduce` where the board is moved, searched or guessed. A game
  that deduces and has no tiers because its answer is hidden writes its own
  test ([`solver-and-generator.md`](./solver-and-generator.md) § "No option
  switches the generator's checks off").
- **A game with no mistake check declares `hasNoSolution` where it has a
  cheap proof**, answering with a `markedDeadEnd` where the game can be lost
  and the proof has a cause to outline, and pins a board with no solution
  either way (`engine-params`, "A game with no mistake check is held to a
  board with no solution";
  [`solver-and-generator.md`](./solver-and-generator.md) § "One answer, even
  when it is hidden").

## Descriptions and state

`newDesc(p, rng)` generates a board
([`solver-and-generator.md`](./solver-and-generator.md)) and `newState(p,
desc)` builds state 0 from a desc. A desc arrives from a URL, so the parse
in `newState` is what refuses a malformed one, and the desc codec is frozen
into shared ids as the params codec is.

- **Write no validator.** The engine derives the verdict from the one parse
  ("Read a desc once").
- **Fail the parse; never throw an error of your own.** A malformed ID is a
  player's typo. The reason is a `DescError`, made only from the kinds in
  [`desc-error.ts`](../src/engine/desc-error.ts) or its `puzzleDescError`
  for a rule of the puzzle's own
  ([`engine-catalog.md`](./engine-catalog.md) § "`desc-error.ts` — why a
  game ID will not load").
- **State is immutable.** `executeMove` returns a new state, and a state of
  parallel typed arrays clones cheaply. Exemplar:
  [`galaxies/state.ts`](../src/games/galaxies/state.ts).

### Read a desc once

Write one parser, `parseDesc(p, desc): DescParse<T>`, and build `newState`
from `descValue(parseDesc(p, desc))`
([`engine/desc-error.ts`](../src/engine/desc-error.ts)). A failed parse makes
`descValue` throw a `DescRejection`, which the engine's `loadDesc` turns
into the verdict the Enter Game ID dialog shows; the same call builds
state 0. Exemplars: the skeleton's
[`state.ts`](../src/skeleton/grid/state.ts) and
[`fifteen/state.ts`](../src/games/fifteen/state.ts).

- **Put every check that needs the parsed board inside the parse**: a count,
  a region, a rule of the puzzle. Anything `newState` throws after
  `descValue` is treated as a bug.
- **One parse, because a validator and a parser can disagree in silence.**
  The accepted desc builds a board with its clues shifted, and a typed array
  swallows the out-of-range write.
- **Read with the cursor**, `readDesc` in
  [`engine/desc-reader.ts`](../src/engine/desc-reader.ts)
  ([`engine-catalog.md`](./engine-catalog.md) § "`desc-reader.ts` — the
  cursor a desc parser drives"), unless the grammar is one character a
  token. It tells *too short* from *bad character*, and its `int` takes
  bounds, so a stray or oversized value is refused and not stored.
- **Accept what your encoder writes and refuse what the grammar has no place
  for.** A parser that skips a character it does not recognize is a second
  spelling of every board, and a player's typo loads.
- **For the shared run-length grammar** (a value character, or a letter for
  a run of blanks) use [`engine/run-length.ts`](../src/engine/run-length.ts)
  inside the one parse. `keepTrailingBlanks` decides whether the desc ends
  with the run that reaches the last cell, and your parser depends on the
  answer. A letter-run alone does not make it that grammar; the other token
  decides. A multi-digit clue with separators, or a desc with no value
  character, is a grammar of its own.

[`desc-error-games.test.ts`](../src/engine/desc-error-games.test.ts) checks
from outside: every desc the generator writes loads, every one-edit near
miss ([`testing/desc-mutants.ts`](../src/engine/testing/desc-mutants.ts))
that loads also draws, and junk is refused at least once, which catches a
`newState` that never reads through `descValue`.

### Digits and numbers in a desc are one fact, and it is not yours

Read and write digits through the engine, whatever the grammar:

- [`engine/decimal.ts`](../src/engine/decimal.ts): `isDigit(c)`,
  `digitValue(c)` (`0`–`9` or `null`) and `parseLeadingInt(s, pos)` for a
  run of digits (`{ value, next }`, where `next === pos` means no number
  here). Write a single digit as `String(n)`.
- [`engine/desc-alphabet.ts`](../src/engine/desc-alphabet.ts) for a value
  above nine: `n2c`/`c2n` (62 values) where every character is a value, and
  `n2cUpper`/`c2nUpper` (`0`–`9`, `A`–`Z`) where the desc is run-length and
  has spent the lowercase on blanks.
- Hex that is hex (a nibble bitmap) is `Number.parseInt(c, 16)`.

Never write `c >= "0" && c <= "9"`, `c.charCodeAt(0) - 48`,
`String.fromCharCode(48 + n)` or a private `isDigit`:
[`decimal.test.ts`](../src/engine/decimal.test.ts) scans every game source
for those shapes, and `emittable-keys.test.ts` fails a declaration of any
name the fact modules export.

- **Convert at the codec, and keep numbers as numbers past it.** A desc, a
  params string and a Solve aux are text by contract, and so is a rendered
  glyph. Nothing between those edges holds a digit as a character.
- **The bound is yours**, and so is what an out-of-range value means. Write
  both beside the call, as the skeleton's `parseDesc` does with `MAX_CLUE`.
- **Test `null` explicitly beside the bound.** `digitValue`, `c2n` and
  `c2nUpper` return `number | null`; do not trust the bound to catch a stray
  character.
- **A write into a typed array names that array's own absent constant**
  (`?? EMPTY`), because a borrowed `-1` in a `Uint8Array` is `255`. Screen a
  character where it is read, so no write relies on another loop having
  checked it. An array with no absent value, where every cell holds a
  number, throws.

## interpretMove and UI_UPDATE

`interpretMove(state, ui, ds, point, button)` turns one input event into a
`Move`, `null` ("nothing happened") or `UI_UPDATE` (the `Ui` changed in
place: redraw, no history entry). Devices, drags and keys are
[`input.md`](./input.md); read it before writing this hook.

**Return a move when the input asks for one, and leave "did it change
anything?" to the engine.** The midend compares the board the move leaves
with the board before it ([`same-value.ts`](../src/engine/same-value.ts)) and
keeps a move that changed nothing out of the history: no step of Undo, the
input answered as a UI-only change, `changedState` still run (`ts-engine`,
"A move that leaves the board as it was is no step of the history"). It
also claims the key such a move came from, so a letter typed where it
already stands is not handed to a shortcut.

- **Do not port upstream's no-op tests.** An erase key on an empty square,
  an entry of what the square holds and a drag out and back need none.
- **Return `null` where the input is not the game's**: a press out of the
  grid, or a key the game has no use for, which must fall through to the
  app.
- **Keep bookkeeping that changes on every move out of the state** (a
  counter, a last-move marker) unless a player can see it. The comparison
  reads the whole state, and with such a field no move is ever "the same
  board".

**An input that changed what the `Ui` shows is claimed, whatever you
answered.** The midend compares the `Ui` before and after, and a `null` over
a change is a UI-only change all the same: claimed, announced, painted
(`ts-engine`, "An input that changes what the `Ui` shows is a UI-only
change"). So a press that hides the cursor and then finds nothing to do, or
a key that puts down what was held, may return `null`.

- **Return `UI_UPDATE` to claim an input that changed nothing shown**: a
  drag over squares that take nothing, a key that is yours on a square it
  does nothing to. Without it the key falls through to the app's shortcuts
  and the press gets no drag.
- **A part of the `Ui` hidden before and after counts as unchanged**
  wherever it sits, read off `visible: false`: a press that parks the hidden
  cursor on what it pressed changes nothing. So keep the flag's name, and
  never paint from a part while its `visible` is off.

[`input-answers.test.ts`](../src/engine/input-answers.test.ts) sweeps every
registered game for an unclaimed input that changed the frame.

**Read `ds.tileSize` directly.** `ds` is non-null and built at the tile size
on screen: the midend builds it with `newDrawState(state, tileSize)`,
rebuilds it when the tile size changes and declines input before a board
exists. Do not write `ds?.tileSize ?? PREFERRED_TILE_SIZE`: the fallback
cannot fire, and if it did it would map the click at the wrong tile size. A
test that calls `interpretMove` or `redraw` directly builds the draw state
with `game.newDrawState(state, tileSize)` or
[`preferredDrawState`](../src/engine/testing/preferred-draw-state.ts), and
never passes `null`.

## executeMove is pure

`executeMove(state, move)` returns a new state and throws on an illegal
move. Keep it pure: a save replays the move log through it (never through
`interpretMove`), a hint simulates with it, and a superseded desc is pulled
from the state it returns.

- **A move that would have to draw at random carries what it drew.**
  Exemplar: the `begin` arm of `MinesMove` ("A board decided at first
  click").
- **Where an edit can force further placements, run the follow-up to a
  fixpoint**, then the completion check. A single pass misses what its own
  placements force. Exemplar:
  [`ascent/moves.ts`](../src/games/ascent/moves.ts).

## Moves are discriminated unions

Type a move as a discriminated union the compiler covers exhaustively, not a
string to scan. A move must be structured-clone-safe as it is, for the save
file, or the game supplies `serializeMove` and `deserializeMove`. Exemplar:
`SkeletonMove` in the skeleton's [`state.ts`](../src/skeleton/grid/state.ts).

## A move you do not recognize is refused, never guessed

End `executeMove`'s dispatch with
[`assertNever`](../src/engine/assert-never.ts), as
`assertNever(move, "abcd: executeMove")` in the last `default` or `else`. A
save is untrusted: `SaveEnvelope.moves` is `unknown[]` and is cast to
`Move` on replay, never parsed, so a move another build wrote arrives
looking well typed ([`ts-engine`](../openspec/specs/ts-engine/spec.md), "A
game rejects a move it cannot play, rather than guessing"). Exemplar: the
skeleton's `executeMove`, an `if / else if / else` chain.

- **Bind the value to `never`; do not write `default: throw`.** A bare
  `default` makes the function total for the type checker whatever the
  union says, so a new move type with a forgotten arm compiles and fails at
  runtime. `assertNever` keeps the compile-time check and the runtime one.
- **Where the discriminant is a field of one interface** and not a union of
  shapes (`op.kind: "light" | "impossible"`), assert on the field and put
  the op in the context string: `assertNever(op.kind, …)`.
- **Where the move is one shape with no discriminant** (`{ ops: Op[] }`,
  `{ dir }`), call [`rejectMove`](../src/engine/assert-never.ts) on the
  fields the dispatch reads. Never write `assertNever(move as never, …)`,
  which silences the error the helper exists to raise.
- **Put the guard before any bounds check.** A missing coordinate makes
  `x < 0` and `x >= w` both false, so range tests pass a foreign move
  through.

`engine/save-round-trip.test.ts` pushes a foreign move into every game's
saved move log and requires the refusal to name the game.

## Status

`status(state)` reports solved, ongoing or lost **of the board alone, never
of how it was reached** (`ts-engine`, "A game's status is judged from the
board alone"). It is the game's completion check, called on the state.
Exemplar: `status` in the skeleton's
[`index.ts`](../src/skeleton/grid/index.ts).

- **`status` writes nothing into the state.** Split a check that marks
  errors as it goes into the marking, which the move does, and a pure
  predicate, which `status` asks.
- **Store no `completed` and no `cheated`.** The midend asks `status` once a
  position and derives the rest from the history it owns, so a Solve move
  needs no special case and a solved board the player breaks reads ongoing
  again.
- **Keep in the state only what the board shows.** A reveal, a dead piece or
  an opened mine is a position, and `status` reads it. A count the status
  bar shows (moves, guesses) is the state's own and does not freeze at a
  solve.
- **`changedState` reacting to "became solved" asks `status` of the old
  state and the new.**
- **The words a player reads are the engine's.** A refused Solve returns a
  `SolveFailure` ([`solve-failure.ts`](../src/engine/solve-failure.ts)). The
  midend prefixes the completion words (`COMPLETED!`, `Auto-solved.`,
  `Auto-solver used.`) to whatever `statusbarText` returns
  ([`completion-status.ts`](../src/engine/completion-status.ts)), so
  `statusbarText` returns only the game's own phrase. The engine catalog's
  entries for both say which failure a solver's verdict entitles it to.

The solver's side of Solve is
[`solver-and-generator.md`](./solver-and-generator.md) § "Solve and the
generator's aux".

## Capability flags

**Offer a capability by having its method, never by declaring a flag beside
it.** `Midend.getStaticProperties` derives the app's flags from the methods,
and the shell's controls follow them:

| App flag | Derived from | Note |
| --- | --- | --- |
| `wantsStatusbar` | `statusbarText` | the timer is not in it and has its own chrome |
| `canSolve` | `solve` | test through a real `Midend` when `aux` matters |
| `canHint` | `hint` | [`hints.md`](./hints.md) |
| `canCheck` | `findMistakes` or `hint` | a hint alone checks only for a dead end |
| `hasReference` | `reference` | "The reference aid" |

- **`textFormat` present means a text panel.**
- **Where a capability depends on the params, widen the method's return; do
  not add a hook.** `textFormat` returns `string | null`, and the midend and
  the share dialog treat `null` as no text panel for this board. For a
  refinement one game needs, prefer the narrowest change the existing
  consumers already tolerate. Exemplar: `textFormat` in
  [`abcd/state.ts`](../src/games/abcd/state.ts).
- **A game declares only what the midend needs synchronously and cannot read
  off a method**: `ignoresSecondaryButton`, where the secondary button has
  no action of its own. A touch hold then stays a left press, and a right
  click arrives as a left one ([`input.md`](./input.md) § "A touch hold
  arrives as the right button").
- **Printing has no implementation.** A print feature would be written from
  scratch, so do not promise one without designing it.

### Contract sections, and what makes a draft

Four members are sections ([`sections.ts`](../src/engine/sections.ts)):
`hint`, `findMistakes`, `solve` and `transposeParams`. Each is implemented,
not applicable, or absent, and **an absent one makes the game a draft**:
still playable, labeled "Draft" on the home screen, never hidden
(`ts-engine`, "A game's contract sections are implemented, not applicable,
or absent, and an absent one makes it a draft"). The build
computes it (`vite-plugins/draft-puzzles.ts`); nothing sets it by hand.

When the puzzle has no such thing, give the reason in `Game.notApplicable`,
an object keyed by section. Exemplars:
`git grep -n -A3 'notApplicable:' src/games`.

- **A reason is a fact about the puzzle** that a player could check against
  its rules, written as a sentence: it is printed on the game's help page
  under "Not in this game". "Upstream never wrote one" is no reason
  (`ts-engine`, "A not-applicable reason is a fact about the puzzle").
- **A hint is never not applicable**, and a section implemented and excused
  at once is refused, the production build included.
- **A guard that excuses a game for lacking a section reads the reason**
  with `sectionState` and keeps no ledger, as `orientation.test.ts` does.

`difficulty`, `textFormat` and the affordances (`hover`, `reference`,
`prefs`, the keypad) are not sections, and their absence says nothing.

## Entry state lives on the `Ui`

Keep interaction state on the `Ui`, never on the `State`: the cursor, drag
anchors, typing buffers, preferences, and whatever an entry method holds
between inputs. The `Ui` is not persisted with the board; `newUi` and the
replay of the move log rebuild it on load.

**However many gestures a game has, they emit one of a few move arms**, from
one small `Ui`. A C `switch` fallthrough becomes an extracted arm called
from the end of the case before it, since a literal fallthrough trips
`noFallthroughCasesInSwitch`. Exemplars:
[`ascent/ui.ts`](../src/games/ascent/ui.ts) and
[`ascent/moves.ts`](../src/games/ascent/moves.ts).

## changedState

`changedState(ui, oldState, newState)` reconciles a `Ui` that tracks the
board, after every real move, undo, redo, solve and restart, and never on a
bare `UI_UPDATE`, when the player is mid-edit.

- **Derive the `Ui` from `newState` alone; do not diff the pair.** The two
  states need not be one move apart: a restart is a step of the history, so
  Undo hands this hook the starting board and the board as played, in
  either order, as Solve hands it a board and its solution.
- **`animLength` is not asked about a restart's pair.** The engine plays no
  move animation across one.
- **A `Ui` rebuilt from the state asks whether this transition touched what
  it rebuilds.** A working row is rebuilt only when the row being played
  changes, because a mark is a move too and must not wipe the row the player
  is marking against. Check this when you add a move type to a game with a
  rebuilding `changedState`. Exemplar:
  [`guess/index.ts`](../src/games/guess/index.ts).
- **The engine ends a pointer drag the board changes under**, for an undo, a
  redo, a hint or Solve ([`input.md`](./input.md) § "A board change under a
  gesture is the engine's"). What is left to this hook is a move a key makes
  while a drag is held in fields of the game's own, and a gesture armed from
  the keyboard ([`rendering.md`](./rendering.md) § "`changedState` cancels a
  dangling drag").

## Ui that must survive a save

Serialize with `encodeUi` and `decodeUi` exactly the `Ui` fields that are
set in `interpretMove` and live outside the undo history. Replay runs
`executeMove`, never `interpretMove`, so it cannot rebuild them: a count of
deaths that outlasts undoing the death, or a half-composed row that reaches
the log only when submitted. The midend restores them after the replay. A
game whose `Ui` is fully derivable omits both hooks. Exemplars:
`git grep -l encodeUi src/games`.

A `Ui` edit is not a move and still takes a save: the encoding rides the
`game-state-change` notification (`NotifyGameStateChange.uiState`), which is
what the app watches for autosave; a game with no `encodeUi` sends nothing.
`midend-ui-state.test.ts` holds the
derivation. Check the reload in a browser.

## Preferences

Declare per-game preferences in `Game.prefs` and keep the values on the
`Ui`. Each item maps a labeled boolean or choices control to `get(ui)` and
`set(ui, v)`, and `newUi` sets the defaults. The midend builds the dialog,
persists the choices per puzzle and re-applies them after every `newUi`.
Choice values are zero-based indices and booleans are real booleans.
Exemplar: [`untangle/index.ts`](../src/games/untangle/index.ts). A game with
notes declares the shared ones ("Pencil marks: the full note-taking UX").

- **Add nothing to repaint for a render-only preference.** The midend drops
  the draw state on `setPreferences`, which forces a full repaint.
- **The app overrides `newUi` defaults per puzzle.** `getPuzzlePreferences`
  in `src/store/settings.ts` applies a small map of defaults on every load.
  When a checkbox comes up "wrong" in the app, read that map before your
  hook.
- **What a placement rules out at a glance is declared, not a preference.**
  Where placing a thing rules out squares the player would otherwise cross
  out by hand (the squares round a star or a tent), declare `rulesOut` on the
  `Game`: its words, and a `bring(before, after)` that answers with those
  marks as a move of the game's own. The engine offers the `auto-cross`
  preference and makes the marks one step of Undo with the move. The hint
  judges the move alone and ends a plan where marks are brought.
  `rules-out.test.ts` plays every declaring game's hint with it on. Exemplar:
  [`starbattle/index.ts`](../src/games/starbattle/index.ts). Notes culled by a
  placed value are the candidate engine's `auto-pencil` instead, whose plan
  models the cull and runs on.

## Timed games

Write nothing to get the solve timer. The midend offers it in every game
and counts from the first move while the status is `ongoing`
(`Midend.timerRunning`; `ts-engine`, "Every game has a solve timer, and it
runs while the board is undecided").

- **`status` is what stops the clock.** A Solve that leaves the board
  `ongoing` keeps it running, and that is a bookkeeping bug to fix.
- **Add `timerHolds(state)` only for a board nobody can play on that
  `status` still calls `ongoing`**, because the player is meant to undo out
  of it. It states a fact about the board, never a clock policy; a
  different clock behavior is the engine's rule to change. Exemplar:
  [`mines/index.ts`](../src/games/mines/index.ts).
- **Verify the tick, the hold and the resume in a browser.** The frame loop
  and the page-visibility pause run in no unit tier.

## A board decided at first click

Implement `supersededDesc(state)` in a game whose board is not determined
until play begins. The engine pulls the desc of the board in play from the
state, so `executeMove` stays pure and no game holds a reference to the
midend. The answer is a function of the state, and `null` means the desc
the board started from. It names the board as a shared ID opens it, the
settling move already made. The engine does the rest; do not re-derive it
([`engine-params`](../openspec/specs/engine-params/spec.md), "A game can
supersede its game description mid-play", "The description in play follows
the position", "Restart enters the board the description in play opens" and
"A save carries the description in play and the one the board started
from"): the game ID follows the position through undo, a save is rebuilt
from the starting desc with the move log replayed, and Restart returns to
just after the settling move.

**The settling move carries the settled board.** It is a move of its own,
holding the layout: `interpretMove` builds the layout from the seed in the
state, and `executeMove` generates nothing. Undo then un-settles the board
with no bookkeeping, and a save's move log restores its board whatever the
generator has since become. **Do not keep the settled board in a holder
shared across states**: it outlives the undo of the move that filled it,
and the player then acts on a layout made for another move.

Exemplars: [`mines/index.ts`](../src/games/mines/index.ts) and the `begin`
arm of `MinesMove` in [`mines/state.ts`](../src/games/mines/state.ts);
[`desc-supersede.test.ts`](../src/engine/desc-supersede.test.ts) is the
shape in miniature.

## A deduction's notation is a mark the player can make

If solving a tier needs a kind of mark (pencil candidates, an association
arrow, a no-line cross, notes on corners or pairs of edges), give the player
that mark with every input the game supports, and have the hint's steps
place it as a move. A hint may use only what the game offers: one that draws
facts the player cannot record teaches nothing the player can reuse
([`hints.md`](./hints.md) § "The quality bar", rule 6).

- **Decide the notation when the game's deductions first need it**, not when
  its hint is found drawing around the gap.
- **Give a new notation the collection's mode, not a mode of its own**:
  `ui.pencilMode` and the Marks key ("Pencil marks: the full note-taking
  UX"), whatever the marks look like.

Exemplar: Loopy's corner and pair notes, which are state and moves beside
the lines (`LoopyState.corners` and `pairs`), entered through
`ui.pencilMode` by tap, drag and keyboard
([`loopy/notes.ts`](../src/games/loopy/notes.ts)); its hint places them
before it cites them.

## Mistake checking is part of done

**A game with one answer ships `findMistakes`.** The midend's `check` blocks
a save on a wrong entry only through `game.findMistakes`. The hint behind it
catches only a position it calls a dead end, so without the hook Check &
Save blesses a wrong board. With the hook, "Check & save" and "Check without
saving" are the shell's and cost the game nothing. A game with no mistake to
check (rearranging pieces, many solutions, a hidden answer) says so in
`notApplicable.findMistakes` ("Contract sections, and what makes a draft").
Exemplar: `findMistakes` in the skeleton's
[`index.ts`](../src/skeleton/grid/index.ts).

- How to compute it:
  [`solver-and-generator.md`](./solver-and-generator.md) § "findMistakes".
- How it is drawn, and the repaint trap:
  [`rendering.md`](./rendering.md) § "Overlay sidecars".
- How a refused hint couples to it: [`hints.md`](./hints.md) § "Refusal
  couples to the mistake overlay".

## Pencil marks: the full note-taking UX

A game with candidate pencil marks carries all of the following, so that
notes work with mouse and touch as well as the keyboard. The requirements
are the `engine-notes` spec's. Exemplar:
[`towers/index.ts`](../src/games/towers/index.ts). The hint such a game
wants is [`hints-candidates.md`](./hints-candidates.md) § "What every game
does".

- **Put the marks in `pencil`**: a typed array of that name on the state,
  holding each cell's provisional candidates (`engine-notes`, "One
  note-taking vocabulary and one layout across games"). The element type and
  the unit are the game's: one candidate bitmask a cell, or a region where
  regions are what the player fills. The shared guards read the field by
  that name
  ([`note-vocabulary.test.ts`](../src/engine/note-vocabulary.test.ts)). Two
  things keep their own words: a field that is not a candidate set (no-line
  marks on a cell's edges), and a solver's working candidates.
- **Mark-all is the `markAll(state)` hook.** It returns the press's move,
  and having it is having the *Fill marks* control. A game never reads a key
  for the press (`engine-notes`, "The Mark-all press is the engine's, from
  the game's hook").
- **A candidate-elimination game builds that move with
  `adaptiveMarkAllMove`**
  ([`engine/candidate-hint.ts`](../src/engine/candidate-hint.ts)), which
  fills, or on a fully noted board strikes the obvious candidates, and is
  `null` when there is nothing to do (`engine-notes`, "Mark-all is adaptive
  in a game with an obvious-candidate rule"). Such a game is one with a
  `regionsOf` ([`hints-candidates.md`](./hints-candidates.md) § "What every
  game does").
  Pass the `regionsOf` the hint's plan declares: a Keen cage is not a
  region, and a Solo Killer cage, which forbids repeats, is one, flagged
  `holdsEvery: false`. A game without a row and column model keeps a plain
  fill.
- **A guard on Mark-all narrows a cell's notes first**, or a Mark-all that
  resets them passes. Mutation-check the guard
  ([`testing.md`](./testing.md)).
- **Refuse a note Mark-all would never make.** Where a cell's full note set
  varies by cell (bounded by the grid edge, or by the size of its area),
  input refuses a note outside it: no solver considers that candidate, so
  no hint has a strike for it. Refuse it on every way into notes (typed
  key, keypad, drag, and the drag's preview), and mask it in `executeMove`
  too, because a saved move log from before the refusal replays through
  `executeMove`.
- **Declare the pencil preferences from
  [`engine/pencil-prefs.ts`](../src/engine/pencil-prefs.ts), never by
  hand**: `stickyPencilPref()`, `pencilKeepHighlightPref()`, and
  `autoPencilPref(name)`, which takes its label because the sentence names
  the regions the game clears. `pencil-prefs.test.ts` fails a divergent copy
  of a shared label.
- **Do not write the pointer arm by hand.** Call `pressNoteTakingCell`
  ([`engine/note-taking-cell.ts`](../src/engine/note-taking-cell.ts)) with
  two predicates about the cell (`canEnter`, `canMark`) and your
  coordinates. It resolves the press and reports `"moved"`, `"unmoved"` or
  `null`, so a game that layers something on the selection hangs it off the
  result. `releaseHighlightAfterEntry` and `noOpEntryResult` are the rules
  for what a symbol entry does to the highlight; decoding the keystroke and
  the no-op predicate stay the game's. A game with `ui.pencilMode` and
  `ui.cursorFromKeyboard` that does not call `pressNoteTakingCell` fails
  `note-taking-cell.test.ts`.
- **Where a press starts a drag, the press changes nothing about the
  highlight and the release resolves the gesture** (`engine-notes`, "A press
  that may become a drag changes nothing in the selection"). Call
  `tapNoteTakingCell` with the release button when the gesture committed
  nothing, and `dragEnteredNoteTakingCell` when it committed a move. Do not
  hide or move the highlight at the press: the release needs to know what
  it was on. Keep the grabbed cell in the drag's own fields, not in the
  cursor. Where the selection is not a cell (a region), answer
  `TapTarget.onSelection` yourself; where it is, leave it out. Exemplars:
  `git grep -l tapNoteTakingCell src/games`.
- **Do not draw the highlight by hand.** Paint the cell's background through
  `drawCellBackground` and pack `cellHighlight` into the tile key
  ([`rendering.md`](./rendering.md) § "The note-taking cell's picture"). A
  member that does not fails `note-taking-cell-render.test.ts`.
- **Do not list the Marks key.** The midend appends `pencilModeKey` to the
  keypad of every game that takes notes, which it reads off a `pencil`
  array on the state or `ui.pencilMode`, whether or not the notes are
  candidate marks (`engine-notes`, "The engine gives every note-taking game
  its Marks key"). The game answers the code: a note-taking cell game
  routes it, and Enter on the highlight, through `toggleNoteTakingMode`,
  and the app's bare `P` sends the same code. `pencil-mode-key.test.ts`
  holds the key to being there and to acting.
- **Sticky pencil mode is a `pencilSticky` boolean on the `Ui`, default
  true, offered through `prefs`.** The shared arm does the rest
  (`engine-notes`, "The sticky pencil toggle is a mode switch, not a
  selection").
- **The mode indicator goes where `pencilIndicatorBox` puts it**, the
  canvas's top-right in every game. The game finds the room (a margin it
  has, a wider border or a grown canvas) and repaints it
  ([`engine-catalog.md`](./engine-catalog.md) § "`pencil-indicator.ts` —
  the pencil-mode indicator").
- **Notes are first-class in `findMistakes`.** An empty cell whose non-empty
  notes have crossed out the solution value is a mistake (`kind: "note"`),
  drawn as a wrong placement is, and extra candidates are not
  ([`ts-engine`](../openspec/specs/ts-engine/spec.md), "A candidate note
  that excludes the answer is a mistake"). Derive the solution from the
  placed givens only, never from notes. This holds only where notes are
  candidates: where the help page documents marks as free-purpose, no
  reading of a note can be called wrong, and the game checks placements
  only (Rome). Read the game's help page before applying the rule, and
  record a decline in the change's `design.md`.

## The reference aid

A game whose core bookkeeping is "which pieces have I used?" can offer a
checklist panel of the fixed piece inventory with found status, where
clicking a piece spotlights its candidate placements. It is opened from the
Game controls panel and does not block play. The requirement is the
reference-aid one in [`ts-engine`](../openspec/specs/ts-engine/spec.md).
Exemplar: [`dominosa/index.ts`](../src/games/dominosa/index.ts).

- **`reference(state, ui): ReferenceModel` returns the checklist, derived
  only from the player's own placements**, never from the solution.
- **`selectReference(ui, key)` spotlights by mutating the `Ui`** and reports
  whether anything changed; `false` skips the repaint.
- **Having `reference` is having the control.** The panel is the generic
  [`components/reference-panel.ts`](../src/components/reference-panel.ts),
  beside the board in a landscape window and under it in a tall one
  (`gridLayout` in [`puzzle/layout.ts`](../src/puzzle/layout.ts)).
- **The board highlight is a `Ui` field of the game's and a render bit**
  folded into the packed cache key ([`rendering.md`](./rendering.md) § "The
  tile cache and the diff key"). Test the frame with
  `renderScenario({ …, selectReference: key })` and assert the highlight
  appears only with a selection.

### An inventory already drawn on the board is an input surface

When the piece list is already painted on the canvas, make it clickable and
add no panel: pick a piece up, see it ghosted into every place that can
still take it, click to write it in as one move. It needs no engine seam;
`interpretMove` hit-tests pixels the game paints. Exemplar:
[`crossing/render.ts`](../src/games/crossing/render.ts) (`layoutNumbers`,
`runForNumber`).

- **Share the layout function between `redraw` and `interpretMove`** ("One
  function, both callers").
- **Decide what "available" means short of solving.** Offer a piece by
  matching its pattern against the player's own entries (length, digits,
  unused). Testing whether crossing entries can be satisfied is constraint
  propagation, which is the puzzle, and belongs to `hint()`.
- **Check what a gesture already means before borrowing an interaction from
  another game.** A grammar where left accepts a preview and right cycles
  alternatives does not move to a game where both buttons are spent.

## Bespoke geometry

For a board that is not a plain rectangle of squares: an odd shape stored in
a rectangle, coordinates and rules that input and drawing share, and several
grid shapes in one game. The draw side is [`rendering.md`](./rendering.md).

### Padded rectangles and sheared draws

A game may store an odd-shaped board in a padded rectangle and shear it on
draw: the backing array is wider than the user's size, the unused corners
hold an out-of-bounds sentinel, and each row is drawn offset by half a tile
a row. Exemplars: [`bricks/render.ts`](../src/games/bricks/render.ts) and
[`bricks/index.ts`](../src/games/bricks/index.ts).

- **The mask and the neighbor table are logic, not display.** They decide
  how many playable cells the desc encodes and drive validity, so a bug
  there desyncs the codec and the solver. The shear offset, bevels and
  origin are display.
- **`interpretMove` inverts the exact draw transform, in the same order**:
  undo the origin, floor to a row, then subtract that row's shear before
  flooring to a column. Share the offset helper between `render.ts` and
  `index.ts` (`offsets(h, ts)`).
- **Force the tile size even in both `computeSize` and `newDrawState`**, so
  the half tile is exact.
- **Check the shear in an SVG dump before opening a browser.** A wrong
  offset shows as a staircase ([`testing.md`](./testing.md) § "Render
  scenarios").

### One function, both callers

**Any rule the input and the display both need is one function, called by
both**: a coordinate, a layout, or what a click would do. Where `redraw`
colors an item by where a click would send it, it calls the function the
click calls. The tell is a predicate in `redraw` that answers what a move
would do. Exemplar: `layoutNumbers` and `runForNumber` in
[`crossing/render.ts`](../src/games/crossing/render.ts).

- **Put the board's pixel origin in `render.ts`, export it, and import it
  in the input path.** Two copies agree until one gains a reason to change,
  and then a click lands on a cell other than the one highlighted, with the
  suite green because nothing drives paint and input against each other.
  One function needs no test. Exemplars: `borderFor` in
  [`mines/render.ts`](../src/games/mines/render.ts) and `offsets` in
  [`bricks/render.ts`](../src/games/bricks/render.ts).
- **Read the game for the two tells; no scan finds them**
  ([`method.md`](./method.md) § "A scan that keys on a name"): an input
  path that cites the render module in a comment and does not import from
  it, and one number spelled by more than one expression (`tileSize >> 1`
  in `interpretMove`, `computeSize` and `redraw`).

### Grid modes are a movement table

Write a game with several grid shapes as one substrate and a movement table
for each mode, not as one geometry a mode. Adjacency, the solver, the codec
and the completion check read the table (`{dircount, dirs}`) and know no
geometry. A hexagonal mode is a square grid with wall padding at the border,
and its half-tile offset is the renderer's alone. Exemplars:
[`ascent/state.ts`](../src/games/ascent/state.ts) and
[`ascent/solver.ts`](../src/games/ascent/solver.ts).

- **Keep the physical grid size (state) and the user-facing size (params)
  explicit and separate.** The physical size is frozen into ids.
- **Port the table's order as it is where the solver relies on it.**
  Ascent's `dirs[n]` is the inverse of `dirs[dircount−1−n]`.
