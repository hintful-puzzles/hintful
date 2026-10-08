# Game mechanics and affordances

How a game's *mechanism* is expressed here: params, descriptions, state, moves,
status, capability hooks, and the player affordances this fork adds on top of
upstream's model. The authoritative contract is
[`src/engine/game.ts`](../../src/engine/game.ts) — its doc comments are
normative-adjacent and kept current; this guide is the tour with the traps
marked. Normative requirements live in the
[`ts-engine`](../../openspec/specs/ts-engine/spec.md) spec and the `engine-*` specs beside
it, one per subject.

Sibling guides: [input](./input.md) · [rendering](./rendering.md) ·
[solver & generator](./solver-and-generator.md) · [hints](./hints.md) ·
[testing](./testing.md) · [engine catalog](./engine-catalog.md). Exemplar to
read end-to-end: [`src/games/galaxies/`](../../src/games/galaxies/).

## The Game contract at a glance

A game is one object implementing
`Game<Params, State, Move, Ui, DrawState, Mistake>`
([`game.ts`](../../src/engine/game.ts)): immutable state transitions, GC
instead of `dup`/`free`, discriminated unions instead of integer sentinels. A
game depends on this interface only — never on the `Midend` — so the interface
is the sole seam between a game and the engine. **An absent optional member
means "this game does not have that capability"** — that is correct behavior,
not a stub: a game with no solver omits `solve`, a permutation game with no
notion of a wrong-but-legal position omits `findMistakes`.

The converse is a rule too, and it is checked:
[`contract-surface.test.ts`](../../src/contract-surface.test.ts) requires every
optional member to have at least one implementer **and** at least one consumer.
The two are counted separately because they fail differently — no implementer is
dead weight in the interface, no consumer means every implementer wrote code
that never runs. So don't add an optional member speculatively (the
`PointerAction` mistake), and don't leave one whose consumer has gone: if a
capability is worth keeping unread, it needs an entry naming the change that
owns the decision.

**When every game implements an optional member, ask what the optionality
costs — and whose code pays.** It is not automatically a mistake:
`preferredTileSize` and `paramConfig` are fine as they are, because their
optionality is absorbed by the engine and never appears in a game. `newDrawState` and `redraw` were the
opposite case: their optionality *leaked into the game-facing signature* as
`ds: DrawState | null`, so 112 game files carried a guard against a null the
engine could not produce, and 57 of them a `ds?.tilesize ?? PREFERRED_TILE_SIZE`
that would have clicked the wrong cell had it ever fired. **The cost that
decides is the cost borne by game code**, so both are required now.

The same question is worth asking of `PuzzleStaticAttributes`, the sibling
contract that relays a game's capability flags to the app shell — two of its
original nine fields turned out to have no reader, and it is swept by the same
test.

The five type parameters are yours to shape idiomatically; the file layout that
has held across all 57 games is `index.ts` (the `Game` object + glue),
`state.ts` (types + codecs), `solver.ts`, `generator.ts`, `render.ts` — see
[README](./README.md) § "File anatomy".

### Absence is `null`

One spelling of "nothing here", in the engine, the games, the app and the build
([`ts-engine`](../../openspec/specs/ts-engine/spec.md), "Absence has one
spelling"):

- **A value that may be absent is `T | null`.** `undefined` is never written as
  a member of a union — not in a return, a parameter, a member or a variable.
  What the language means by `undefined`, *not supplied*, is written `?` on an
  optional parameter or member; a value the language produced that way
  (`step?.highlights`, `Map.get`, `Array.find`) takes `?? null` where it enters
  a declared type. A cast describes a value rather than declaring one, so
  `hint?.highlights as MyHint | undefined` is fine.
- **Two kinds of nothing get names.** Crossing's `keyDigit` returns a digit,
  `"clear"` or `null`, and the settings store reads a key nobody stored as
  `UNSET`, because some settings store `null` on purpose. A `??` written against
  the result cannot merge one kind into the other.
- **A failure with nothing to return on success is its reason or `null`**
  (`validateParams`, `setParams`). **A failure beside a value is a result**,
  `{ ok: true, … } | { ok: false, error }`, so a refusal cannot hide inside the
  value: `solve`, `hint`, `encodeCustomParams`.

Why `null` rather than the word the language produces by itself:

- **Every path has to say it.** A declared `T | null` return that falls off the
  end is a compile error (TS2366); a `T | undefined` return accepts the missing
  `return` in silence.
- **It is checkable with no exceptions.**
  [`absence-spelling.mjs`](../../scripts/checks/absence-spelling.mjs) fails any
  union naming `undefined`. The rule the other way round would have to exempt
  every `null` a move or a save carries, and nothing marks which types those are.
- **It was already this tree's word**, about 750 declared positions against 160
  when `spell-absence-one-way` measured it.

**A respelling is the one edit the compiler will not check.** `x === null`
compiles against `number | undefined` and is always false. Moving the digit
codecs and the key map to `null` left Loopy's and Mosaic's `validateDesc`
accepting any character and an unmapped key reaching the game, with the typechecker
and the suite green; the same guard fails a strict comparison against a word the value's
type cannot hold. **Assertions move with it**: `toBeDefined()` passes on `null`,
so assert a present answer with `not.toBeNull()`.

## Idiomatic state, not a C transliteration

**Use upstream's C (in git history) as a reference for the logic, never as a
control-flow template.** Classes over handle-passing, iterators over
`while (next())`, `boolean` and unions over `0|1`, modern containers over
C-array mirrors. **Comments and names pass one reading test**: a comment says
what the code cannot, and a name changes only when a reader has to ask what it
stands for — [`repo-layout`](../../openspec/specs/repo-layout/spec.md), "A
comment says what the code cannot, and a name answers its own question". The C is a reference for the logic, never a template for control flow; the
payoff is measured
(Galaxies, 2026-09-11: 4,398 lines against upstream's 4,485, while also
carrying an explained hint, mistake checking and a second drag gesture).

**Watch for logic that is correct only because of what `memmove` leaves
behind.** C's `memmove` copies without clearing the source, so code that opens
a gap in an array may quietly read the "moved-away" values back out of the
vacated slots. A JS `splice`/`concat` destroys those leftovers, and the bug
surfaces only on the narrow case that read them (Inertia's tour splice failed
on the round-trip-out-of-one-vertex case only). The narrow fix is capturing
values before the splice; the real fix is building the new array out of the
pieces you mean (`[...before, ...detour, ...after]`), which makes the bug
unwritable. Exemplar: [`inertia/solver.ts`](../../src/games/inertia/solver.ts)
(`spliceDetour`). **Tell:** any transcribed in-place array surgery — an
overlapping `memmove`, a buffer read past its logical end.

**Share the parts of state that never change — by reference, typed
`readonly`.** A component fixed at `newState` (Flip's matrix, Netslide's
barrier grid) is shared across every cloned state so a move copies only what
moves. `Object.freeze` **throws** on a populated typed array, so the `readonly`
type is the whole guarantee — don't reach for a runtime freeze, and don't
downgrade to a plain `Array` to get one; just don't write to it. Exemplar:
[`netslide/state.ts`](../../src/games/netslide/state.ts).

## Params

### Codecs and validation

`encodeParams(p, full)` / `decodeParams(s)` / `validateParams(p, full)` are the
game-ID surface: `params:desc` and `params#seed` ids are built from them, so an
encoding is **frozen into shared ids** — changing one changes which boards
every existing link names. Decode leniently (garbage in a param string is user
input), validate with a human-readable reason (`null` = valid).

**Declare the codec, don't write it twice.** Both halves are derived from one
ordered segment list in
[`engine/params-codec.ts`](../../src/engine/params-codec.ts), so a game states
its encoding once instead of hand-maintaining an encoder and a decoder that
must be exact inverses:

```ts
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
  flag(paramConfig, "S", "strip-clues", { full: true }),
]);
```

Six segment kinds cover the grammar the collection actually uses: `dims`
(`WxH`, with upstream's square fallback), `size` (one untagged leading
integer, for square-board games), `num` (`n12`), `choice` (`d` + a letter from
a table), and `flag` (a bare boolean letter). `full: true` marks a
generator-only field the brief encoding omits; `invalid` declares the
out-of-range value an unrecognized difficulty letter should leave behind;
`means: false` says the letter is written when the field is *off*; `omitWhen`
and `whenAbsent` cover a field written only when non-zero and a default
computed from other params.

**Segments name a `paramConfig` field by its `kw` and reuse that item's
accessors.** That is the point rather than a convenience: the Custom dialog and
the codec stop being two hand-synced copies of one field list, so a field
cannot appear in one and be dropped from the other. It also keeps a field's
representation the game's own business — Singles and Undead store a tier as a
string union and Spokes as its own type, and none of them changed to be
encodable.

**Not everything fits, and a bespoke codec stays first-class.** Float params
(Rectangles, Net, Netslide), a leading letter before the dimensions (Cube), a
`switch` over multi-character strings (Solo), a `while` loop over the tail
(Dominosa) and a boolean encoded as an integer (Mosaic) are hand-written, and
should stay that way — a grammar that grew an option per game would be two
ways plus a seam rather than one obvious way.

**Whatever you write, the encodings are asserted.**
[`params-stability.test.ts`](../../src/engine/params-stability.test.ts) holds
every game's encoded params against a recorded table and checks that encode and
decode are mutual inverses over 612 derived cases. Re-baselining that snapshot
is a **compatibility decision** — every line that moves is a shared game ID
that stops resolving to the board it named — so it needs the owner's say-so,
not a `vitest -u`.

### Float params round-trip through %g

**A `float` param must reproduce C's `%g`, `atof`, and single precision — all
three change the *board*, not the label.** Netslide places
`(int)(barrier_probability × candidateCount)` barriers, so one ulp is one wall.
Three rules: encode with a `formatG` (six significant digits, trailing zeros
stripped — `String(x)` renders 1/3 as sixteen digits and changes what decodes
back); decode with `atof` semantics (garbage → **0**, which bounds checks then
reject — `Number.parseFloat` yields `NaN`, which slips past every `<`/`>`
check); and store what C stores by `Math.fround`-ing at every boundary that
admits a value. `formatG`/`atof` live in
[`engine/params.ts`](../../src/engine/params.ts); exemplar
[`netslide/state.ts`](../../src/games/netslide/state.ts).

### Presets

`presets()` returns the preset/difficulty menu tree; `defaultParams()` the
start-up choice. Presets must encode **full** params (including difficulty) —
the midend builds the game id, and the type-menu label read from it, from
`encodeParams(_, true)`, and a preset that omits the suffix shows the default
difficulty in the header even though the board generated correctly. If a new
game's header ignores a suffix, check that first (it cost a dev-verify cycle
before the fix landed in `Midend.emitIdChange`).

### Portrait boards, and turning them to fit

**Every default and preset draws no wider than tall**, because a phone held
upright is the main way this app is played. "Draws" means the game's own
`computeSize`, never its params: a clue margin, a panel along one side or a
tiling's cell shape all decide the aspect, and a count of `w > h` gets them
wrong. So choose a new game's sizes by what `computeSize` returns, and for a
tiling that cannot turn (below), pick sizes of its own that draw tall rather
than transposing a landscape one. A board whose shape is the puzzle's own (a
Cube solid, Ascent's hexagon) goes in the `WIDE_BY_NATURE` ledger of
[`orientation.test.ts`](../../src/engine/orientation.test.ts) with its reason.

**`transposeParams` lets a new board be dealt either way round.** The midend's
`newGame` takes the board area the view measured and deals the chosen params
turned whenever that gives a larger tile; the chosen params themselves stay as
chosen, the type menu names a turned board after its preset, and nothing
already on screen is ever turned. A plain grid declares it the way it declares
its Custom fields:
`transposeParams: transposeDimensions()`, or with the field pair
(`transposeDimensions<UnrulyParams>({ w: "w2", h: "h2" })`). Swap anything
else that is laid out on the grid too (Mines' forced first click), return
`null` for a mode that must not turn (Ascent's hexagonal modes, Loopy's
`LOOPY_GRIDS[].turns`), and give a game whose size is not two fields a flag
of its own (Dominosa's `tall`, which decodes absent as the old wide board so
existing ids keep loading). A bound that holds on width or height alone needs
nothing here: the midend never turns to a size `validateParams` refuses to
deal (Loopy's Penrose kite/dart deals 4x3 and has no 3x4).

**Leave it out only when a tall board is a different game**, gravity (Same
Game, Bricks) or a goal on a fixed side (Slide), **or the same one**, a square
grid (the Latin games: `SQUARE_GRID`). Say which in
`notApplicable.transposeParams` (see "Contract sections, and what makes a
draft" below); a game that neither turns nor says why is a draft.
`orientation.test.ts` holds a `SQUARE_GRID` reason to every menu board drawing
square, and holds each implementation to turning back exactly and to drawing the
turned board with width and height exchanged, on non-square boards it builds
through the game's own width item; a game that draws something along one side
only records it in `UNEVEN_FRAME`.

### Params are declared once, on `paramConfig`

**Every fact about a params field lives on its `paramConfig` item**, and the
engine builds everything else from it: the Custom dialog, the preset titles and
the type header of a custom board
([`engine/param-label.ts`](../../src/engine/param-label.ts)), the bounds check
(`paramsError` in [`engine/params.ts`](../../src/engine/params.ts)), the help's
Parameters section ([`engine/param-help.ts`](../../src/engine/param-help.ts),
expanded from the page's `{{parameters}}` by `vite-plugins/parameters.ts`), the
tier accessors and the codec. Each item carries:

- **`doc`** — what the field means, HTML inside the help's `<dd>`. It is
  required, and a choices field's doc names every word choice (Unequal's
  Adjacent went unexplained when it lived on the page instead). `{ with: kw }`
  documents an item together with the one before it; `dimensionParamConfig`
  does that for Height.
- **`bounds`** on a numeric text field — `{ min?, max? }`, checked before the
  game's own `validateParams` with a message naming the field by its dialog
  label, and stated by the help. **Only an unconditional range belongs here.** A
  limit that depends on another field, or that holds only when generating
  (`full`), stays in `validateParams`: moving a generation-only bound into
  `bounds` would refuse a shared `:desc` id that loads today. A choice outside
  its list is refused by the engine for every choices field.
- **A `validateParams` refusal is one sentence with its full stop**, saying
  what to change in the dialog's own words ("Width times height must be at
  most 54.", not "Grid is too big"). Both dialogs show it as it comes, and
  `params-refusal.test.ts` reads every string a `validateParams` can return,
  through constants (`AREA_TOO_LARGE`) and helper calls.
- **`label`** — which slot of the params label the field's words fill. A label
  reads `[ruleset: ]size[ kind…][ tier][, tail…]`: "Seismic: 7x7 Easy", "10x10
  Normal, strip clues". The slot order is the collection's; the words are the
  game's, and `words` returning `null` leaves a default unsaid. A checkbox must
  give words; a choices field says its choice's name by default.

**A game that plays different puzzles on one board declares its rulesets**,
with `rulesetItem(rulesets, field)` in `paramConfig`
([`engine/ruleset.ts`](../../src/engine/ruleset.ts)), the way a tiered game
calls `difficultyItem`. Each ruleset is a `name` and its `rule`, the sentence
that sets it apart (Seismic's Tectonic: "Two equal numbers cannot be
horizontally, vertically or diagonally adjacent."). The engine builds the rest:
the dialog's "Game mode" field and its help entry, the name in front of a
params label ("Tectonic: 7x7 Easy"), **a section of the Type menu for each
ruleset**, and the list of rules where the help page writes `{{rulesets}}`. So
the game lists its presets flat, two puzzles' boards never share a list, and a
ruleset game that writes a section of its own is refused. No label slot puts a
word in front of a title; only a ruleset does. **A line under a ruleset's
heading leaves the ruleset's name off** ("7x7 Easy" under "Tectonic"), and the
type header, shown with no heading over it, keeps it: a leaf of
`presetMenu(game)` has a `title`, the menu's line, and a `label`, the board's
name anywhere else. A test naming a preset reads the `label`, which is what
`leafPresets` returns. A field that only changes the
board's shape or look (Loopy's tilings, Cube's solids) is a `kind`, not a
ruleset. **A field that changes which squares are neighbors is a ruleset, not
a kind** (owner, 2026-10-08): Ascent's Orthogonal, Hex and Classic are told
apart by four, six and eight neighbors, and its Honeycomb and Hexagon are two
kinds of Hex board. **Rulesets are declared easiest to learn first**, which is
the order of the menu's sections, and the game's default is the first line.
**A ruleset need not be a params field of its own**: Ascent keeps one `mode`,
and its ruleset and board-shape items read and write that one value between
them.

**A ruleset that does not take every value of another setting says so, with
`only`**: by the field's `kw`, the choice indices it offers or the one value
of a checkbox (Edges: the Rectangle alone, symmetrical clues off, Normal and
up). The engine builds the rest: the dialog disables what the chosen ruleset
does not offer and submits each narrowed field at a value it does, `paramsError`
refuses a deal that asks for anything else, and the field's help entry says it.
So write no `validateParams` branch, no `doc` sentence and no params value for
such a pair. A limit on a typed number (Seismic's area by ruleset) is not this:
a text box cannot show it before OK, and it stays in `validateParams`.

**A setting that adds, removes or bounds one rule is a modifier**, declared
with `modifierItem` ([`engine/modifier.ts`](../../src/engine/modifier.ts)):
Net's wrapping, Solo's X, Jigsaw and Killer, Bridges' "no loops". It differs
from a ruleset in that modifiers hold together, and the test is a deal: if
every combination of a game's candidates is a board, they are modifiers, and
if two exclude each other they are one ruleset field. A modifier is a
checkbox, the value `when` its rule applies, the `words` a title says then
("wrapping", "no loops"), and the `rule` as a sentence that starts lower-case.
The engine builds the field's help entry ("When on, …", plus the game's
`note` for a size or limit the rule brings), the label words, and the list
where the help page writes `{{modifiers}}`, each line headed by those same
words, so the word a player reads in the Type menu is the word the help
explains. The rule is HTML where it needs markup, since it is read in both
places. A setting that only tunes the generator or the look is neither.

**A modifier that takes a tier away says so with the same `only`** (Group's
hidden identity has no Easy, Bridges at one bridge a line no Tricky): a
checkbox's applies while its rule does, and a choice's is keyed by the
choice's index. The tier gives way to the modifier, as it does to a ruleset,
and the same three things are built. A field that decides others is narrowed
by none, and the declaration throws if it is.

**A choice's name is typed once, in `choices`.** A sentence in the game's code
reads it from the array, and a help page writes `{{choice:<kw>:<index>}}`,
which the help build expands (`expandChoices`) and refuses when it names no
choice. `help-coverage.test.ts` fails a page that types the name instead. The
game's own name and the tier names are outside that check.

**Presets are params, not titles.** A leaf is `{ params }` and its title is its
label, so the menu and the header of the same board cannot disagree. A leaf
keeps a `title` only when upstream gave it a name no field says (Guess's
"Standard", Flood's allowance names); `params-declared.test.ts` refuses a name
that merely repeats the label, and two presets with one label. **Read a
preset's name as the `label` of its leaf in `presetMenu(game)`**, never from
`game.presets()`, which leaves it unset.

### The preset menu is a grid

**A menu is the game's boards, each at every tier, and then one board for each
thing that is neither a size nor a tier.** A player who wants a small hard
board or a large easy one finds it in the list, and the menu of one game reads
like the menu of the next. `presetGrid(paramConfig, boards, opts)`
([`engine/preset-grid.ts`](../../src/engine/preset-grid.ts)) builds it: the
game names its boards, smallest first, and the builder writes each one's tiers
in order. A game without tiers lists its boards. What the game decides is which
boards, and that is about the puzzle; the shape is not.

[`preset-menu-shape.test.ts`](../../src/engine/preset-menu-shape.test.ts) reads
the shape off every game's menu, whether or not the game calls the builder:

- **A whole menu holds at most eighteen lines** (`MENU_LINES`; owner,
  2026-10-08), however many rulesets share it. Four sections of two boards
  each read as a wall, so a game with several rulesets offers one board of
  each and leaves the other sizes to the Custom dialog (Ascent). The games
  over the cap when it was set are in the test's `MENUS_OVER`.
- **A section holds at most twelve lines** (`MENU_SECTION_LINES`). A game
  trades sizes against tiers to fit: three sizes at four tiers, or four at
  three. A section with one line for each kind of board (Loopy's tilings,
  Cube's solids) is as long as the kinds are many.
- **A board's tiers are one run of lines, easiest first, with no gap.** A board
  may stop short of the hard tiers or start above the easy ones
  (`opts.tiers`), for a deal that takes seconds, a tier that means nothing at
  that size, or the twelve lines. Write which at the menu.
- **Every tier is on the menu somewhere, in each ruleset**, unless every board
  refuses it. A tier left off for another reason goes in the test's
  `TIERS_NOT_OFFERED` with that reason.
- **A rule modifier has exactly one line**, after the grid
  (`opts.variants`), so a player can see that it exists; every other board it
  applies to is reached through the Custom dialog. The same goes for a second
  kind of board, as Loopy's tilings; Ascent's Hexagon, the second shape of
  its Hex, has a short run of tiers.
- **A game with a size offers at least three boards.**

**Measure a deal before offering it.** A preset that takes seconds to deal is
a worse offer than none, and a tier's cost follows the size: Group's 12x12
deals in a blink at Normal and takes eleven seconds at Hard. Time three deals
of each new cell, on the machine as it is, and cut the row where the tail
leaves a second. **Then ask whether the board needs its tier**, because a
fast deal is not an honest one: a Group 6x6 dealt at Tricky comes back in
under a millisecond and needs only Normal. `difficulty-contract.test.ts`
asks it of every preset (`lowestSolvingCap`), on the gate for the first
preset of each tier and on the slow tier for all of them, so run it with the
slow tier on for a game whose menu you change.

**Three sizes written as `[4, 5, 6]` read as a color** to
`palette-source.test.ts`, which takes any three-number array in a game's
source for an RGB triple. Add the line to its `NOT_COLORS` with the reason.

**The first line is where a new player starts** (`puzzle-screen.ts` deals the
first preset to a player who has never chosen), so the smallest board at the
easiest tier goes first.

**A test that needs a particular board names its params**, not an index into
the menu: Boats' hint tests keep their own list, so the menu can change
without moving a pinned board.

### The Custom dialog

**The editable "Custom type…" form is `Game.paramConfig` — declarative, like
`prefs` but over `Params`.** An ordered `ParamConfigItem<Params>[]`; the midend
builds the app's form from it and parses a submission back onto a **copy** of
the params, validated by `paramsError`, so the dialog rejects exactly what a
game ID would. A game that omits it ships a blank Custom dialog — wire it or
your game has no custom sizes. **This is now asserted rather than advised**
([`custom-params.test.ts`](../../src/engine/custom-params.test.ts)): every
registered game must declare a non-empty `paramConfig`. Sokoban shipped without
one from its port until `audit-vestigial-contract-surface`, and nothing
objected, because the sweep over `paramConfig` opened by skipping any game that
had none and the menu entry was gated on a flag the midend answered `true`
unconditionally. Conventions that keep it correct:

- **Keys match the C config slug**, so the form is stable across eras; `get`
  returns an index for a choice and a string for a text field, and `set` is its
  inverse.
- **Numeric `set` goes through `parseConfigInt`, never `Number.parseInt`** —
  atoi semantics turn garbage into 0, which the bounds reject; `NaN` slips a
  hand-written bound check. `numberItem` is that shape for a plain integer
  field.
- **Never hand-write the width/height pair.** Every two-dimension game calls
  `dimensionParamConfig({ doc, bounds })`
  ([`engine/params.ts`](../../src/engine/params.ts)); a game that spells its
  fields differently passes the field map (`fields: { w: "w2", h: "h2" }`)
  rather than being renamed to fit — a game contorted to satisfy a shared
  contract is the failure the refactoring guardrails exist to prevent. A square
  game declares one `numberItem` labeled with `squareSize(field)`.
- **Cross-field folds run in array order** — the midend applies each `set` in
  sequence, so Solo's jigsaw fold (`c *= r; r = 1`) comes after its column/row
  items.
- **The round-trip guard has known blind spots.** `custom-params.test.ts`
  drives every registered game's presets through `get`∘`set` and asserts
  identity — which catches a wrong inverse for free but *not* a wrong label or
  choice list (eyeball those), and is **blind to a swapped field map**, because
  `get` and `set` name the same field either way. A game passing a field map
  asserts the mapping directly, where the fact lives (see the "drives w2/h2"
  test in [`unruly.test.ts`](../../src/games/unruly/unruly.test.ts)). The
  general lesson: *a test whose only observer is the thing under test cannot
  establish ground truth.*

Exemplars: [`pattern/index.ts`](../../src/games/pattern/index.ts) (pure w/h),
[`towers/index.ts`](../../src/games/towers/index.ts) (size + difficulty),
[`solo/index.ts`](../../src/games/solo/index.ts) (the jigsaw fold).

### Difficulty is a declared contract

**A tiered game declares its difficulty item and `Game.difficulty`
([`engine/difficulty.ts`](../../src/engine/difficulty.ts)).** The item is
`difficultyItem(TIERS, "diff")` in its `paramConfig` — or, for a game storing a
word or an enum, `difficultyItem(TIERS, { get, set })` — and nobody writes
`kw: "difficulty"` by hand. The engine's `tierOf(game, p)` and
`withTier(game, p, tier)` read and move a tier through that item, because eight
games type their difficulty as a string union or enum and no cross-game caller
can write `{ ...p, diff: cap }`. The contract is only the capped solve and its
declared exceptions. The point is that properties *about* tiers — above all
cap-monotonicity, whose absence silently broke Check & Save on every Boats Easy
board — are asserted for all tiered games at once by
`difficulty-contract.test.ts`; declaring the contract enrolls the game in those
guards automatically.

**You do not write the tier names — you call `tierNames(n)`.** The collection has
one scale, **Easy · Normal · Tricky · Hard · Extreme**, and a game takes the
first `n` of it; `tierNames(n, { search: true })` replaces the last with
`Unreasonable`, which the spec reserves for a tier whose boards can require
Search and forbids anywhere else. So a game declares *how many* tiers it has and
*whether its top rung searches*, and the words follow:

```ts
export const DIFF_NAMES = tierNames(3);                    // Easy · Normal · Tricky
export const DIFF_NAMES = tierNames(3, { search: true });  // Easy · Normal · Unreasonable
```

That makes position and name a bijection across the collection — "Tricky" is the
third rung in every game that has one — which is the whole point: before
`adopt-conventional-tier-names` the 29 tiered games had picked twelve different
words, and the six three-tier games used six different vocabularies. Override by
writing the array, and say why in the change; `difficulty-contract.test.ts`
fails a game that drifts back, naming the fix. No game overrides today.

**`DIFF_*` constant names are solver rung labels, not tier names.** They were
never reliably the same — Solo declares eight and offers six — and since the
convention they routinely differ: Unruly's `DIFF_TRIVIAL` is its first tier, so a
player sees "Easy". Read `tierNames`, not the identifier.

**Where the list comes from at runtime**: `difficultyTiers(game)` reads the
game's difficulty item, so the names have exactly one definition per game. Never
derive tier names from the technique
ladder, which declares tier *numbers* and is built inside a solve
([solver & generator](./solver-and-generator.md) § "The difficulty contract").
What a tier *means*, and the grading that enforces it, is
[solver & generator](./solver-and-generator.md) § "A tier means exactly its rung".

## Descriptions and state

`newDesc(p, rng)` generates a board (see
[solver & generator](./solver-and-generator.md)); `newState` builds state 0
from a desc, and its parse is also what refuses a malformed one (it guards the
game-ID surface — descs arrive from URLs). You write no validator; the engine
derives the verdict (§ "Read a desc once"). **The reason is the engine's
words, not yours**: a parse fails with a `DescError`, and the only ways to make
one are [`desc-error.ts`](../../src/engine/desc-error.ts)'s kinds and its
`puzzleDescError` escape for a rule of your puzzle's own (engine catalog §
"`desc-error.ts` — why a game ID will not load"). Fail the parse, never throw
your own error: a malformed ID is a player's typo, not a bug. The desc codec is
frozen into shared ids, same as params. State is **immutable**: `executeMove`
returns a new state and `cloneState` is cheap by construction (parallel typed
arrays clone well; see Galaxies'
[`state.ts`](../../src/games/galaxies/state.ts)).

### Read a desc once

Write **one** parser, `parseDesc(p, desc): DescParse<T>`, and have `newState`
build from `descValue(parseDesc(p, desc))` (`engine/desc-error.ts`). That is
the whole of it: a failed parse makes `descValue` throw a `DescRejection`, and
the engine's `loadDesc` turns that one throw into the verdict the Enter Game ID
dialog shows, and builds state 0 from the same call. Put every check that needs
the parsed board — a count, a region, a rule of your puzzle — inside that
parse; anything `newState` throws after `descValue` is treated as a bug.
Exemplar: [`fifteen/state.ts`](../../src/games/fifteen/state.ts).

The reason is that two loops disagree in silence. A validator and a parser that
each read the grammar can differ about a character without any test noticing:
the accepted desc builds a board with its clues shifted, and **a typed array
swallows the out-of-range write**, so nothing throws. Bricks shipped exactly
that, its validator counting `A`–`Z` as blank runs its parser ignored; Rect's
and Sticks' unbounded clues wrapped in their arrays, so the parser read a
different board from the one the validator accepted. When every game was read
for `read-descs-through-one-cursor`, about half the collection's validators
accepted something their parser skipped. Each game then read its desc once but
still wrote the validator line by hand, which only a convention kept honest;
`let-the-engine-own-the-desc-parse` took the line away, so there is no second
reading left to write.

**Read with the cursor** ([`engine/desc-reader.ts`](../../src/engine/desc-reader.ts),
engine catalog § "`desc-reader.ts` — the cursor a desc parser drives") unless
your grammar is one character per token. It decides *too short* against *bad
character* for you, and its `int` takes bounds, so a stray or oversized value
is refused rather than stored. **Accept what your encoder writes and refuse
what your grammar has no place for**: a parser that skips a character it does
not recognize is a second spelling of every board, and a player's typo loads.

[`desc-error-games.test.ts`](../../src/engine/desc-error-games.test.ts) checks
what it can from outside: every desc your generator writes must load, every
one-edit near miss ([`testing/desc-mutants.ts`](../../src/engine/testing/desc-mutants.ts))
that loads must draw, and junk must be refused at least once — the last is
what catches a `newState` that never reads through `descValue` and so refuses
nothing.

Where the desc is the shared run-length grammar — a value character, or a
letter standing for a run of blanks — use
[`engine/run-length.ts`](../../src/engine/run-length.ts) inside that one parse.
`keepTrailingBlanks` is the one real decision it hands back and it is not a
style knob: it decides whether the desc ends with the run reaching the last
cell, and your own parser depends on the answer.

**A letter-run is not enough to make it that grammar.** What decides is the
*other* token: Bricks' is a multi-digit clue with `_` separators over a padded
grid, and Crossing has no value character at all — its decimal numbers are a
second kind of run. Both were misfiled as adopters by a scan keyed on the
character arithmetic the two families share.

### Digits and numbers in a desc are one fact, and it is not yours

Whatever the grammar, the digits in it are read and written one way, from
[`engine/decimal.ts`](../../src/engine/decimal.ts): `isDigit(c)`,
`digitValue(c)` (`0`–`9` or `null`) and `parseLeadingInt(s, pos)` for a run of
them (`{ value, next }`, with `next === pos` meaning "no number here"). A
single digit is *written* as `String(n)`. A value above nine takes one of the
two alphabets in [`engine/desc-alphabet.ts`](../../src/engine/desc-alphabet.ts)
— `n2c`/`c2n` (62 values) where every character is a value, and
`n2cUpper`/`c2nUpper` (`0`–`9`, `A`–`Z`) where the desc is run-length and has
spent the lowercase on blanks. Hex that is hex (a nibble bitmap) is
`Number.parseInt(c, 16)`.

**Convert at the codec, and keep numbers as numbers past it.** A desc, a params
string and a Solve aux are text by contract; a rendered glyph is text. Nothing
between those two edges should hold a digit as a character. Crossing kept its
clue numbers as digit strings and paid for it with eleven `charCodeAt(k) - 48`
sites across its solver, hint solver and renderer; its `readDesc` now turns
each into a digit array once, and the string is rebuilt only where the desc,
the number panel or a hint sentence needs one.

What is yours is the **bound** and what an out-of-range value means, written
beside the call — `const v = digitValue(tok.value); if (v === null || v > 4)
return "Invalid …"` — because Slant's clues stop at `4`, Bricks' at `7` and Bridges'
at `G`, and those are facts about the puzzle.

**"Not a digit" is outside the type, and a write names its own absent value.**
`digitValue`, `c2n` and `c2nUpper` return `number | null`, so the compiler
refuses a site until it says what a stray character means: test `null`
explicitly beside your bound rather than trusting the bound to catch it (the
spelling is § "Absence is `null`"). A
write into a typed array names *that array's* absent constant — Filling's
`?? EMPTY`, Slant's `?? -1` — because a borrowed `-1` in a `Uint8Array` is
`255`. Inside one parse (§ "Read a desc once") the character is screened where
it is read, so a write never relies on another loop having checked it; an array with no absent value, where every cell holds a number,
throws instead. The reason is scale: a `-1` inside the return type passed every
`>= 0` test by a coincidence of ordering and would have failed silently under
`!== 0`, and a fact every new author must be told loses to one the compiler
enforces.

Never write `c >= "0" && c <=
"9"`, `c.charCodeAt(0) - 48`, `String.fromCharCode(48 + n)` or a private
`isDigit`: [`decimal.test.ts`](../../src/engine/decimal.test.ts) scans every
game source for the shapes and fails the build, and `emittable-keys.test.ts`
fails a declaration of any name the fact modules export. Twelve files had
their own `isDigit` and some forty loops read a number by hand before this
was one place; every one of those was a copy waiting to drift.

## Moves

### interpretMove and UI_UPDATE

`interpretMove(state, ui, ds, point, button)` translates one input event into a
`Move`, `null` ("nothing happened"), or `UI_UPDATE` ("UI/cursor changed in
place; redraw, no history entry"). **Suppress no-op moves locally here — never
by comparing states.** Every game upstream suppresses no-ops in
`interpret_move` (out-of-grid, gutter, already-in-that-state); no game in the
entire C tree ever compared stringified states for undo, and a port that
reaches for `Object.is`/deep-compare is re-deriving a mechanism that does not
exist. The shared predicate that decides "would this change anything?" should
be the same one `executeMove` filters with, so the two cannot drift (see
[input](./input.md) § "A line-fill drag picks a transformation" for the Boats
worked example). Input-device traps — touch, stylus, keypad, drag classes —
are [input](./input.md)'s whole subject; read it before writing this hook.

**`ds` is non-null and built at the tile size on screen, so read `ds.tileSize`
directly.** The midend builds the draw state with `newDrawState(state,
tileSize)`, builds a fresh one whenever the tile size changes, and declines
input before a board exists. Do **not**
write `ds?.tileSize ?? PREFERRED_TILE_SIZE`: that fallback cannot fire, and if
it ever did it would map the click at the preferred tile size rather than the
one on screen — the wrong cell, silently. Fifty-seven games had one, from back
when `newDrawState` was optional; `audit-vestigial-contract-surface` made both
it and `redraw` required and removed the lot. A test that calls `interpretMove`
or `redraw` directly builds the drawstate with `game.newDrawState(state,
tileSize)`, or with
[`preferredDrawState`](../../src/engine/testing/preferred-draw-state.ts) at the
game's preferred size, rather than passing `null`.

### executeMove is pure

`executeMove(state, move)` returns a **new** state and throws on an illegal
move. Purity is load-bearing three ways: saves replay the move log through it
(never through `interpretMove`), hints simulate with it, and the desc-supersede
pull below depends on it. A move that would otherwise have to draw at random
carries what it drew: Mines' first click holds its layout (below).

### Moves are discriminated unions

A move is a typed discriminated union the compiler covers exhaustively — not a
`sscanf` string. (Galaxies' 140-line C `execute_move` with `goto badmove`
became a union the type-checker fully covers.) For the save file a move must be
structured-clone-safe as-is, or the game supplies `serializeMove`/
`deserializeMove`.

### A move you do not recognize is refused, never guessed

`executeMove`'s signature says `(state, move) => State` and *lies*: a save is
untrusted input. `SaveEnvelope.moves` is `unknown[]` and is **cast** to `Move` on
replay, never parsed, so a move written by another build arrives looking
perfectly well typed. Your dispatch must refuse it — normative rule in the
[`ts-engine` spec](../../openspec/specs/ts-engine/spec.md) § "A game rejects a
move it cannot play, rather than guessing".

End the dispatch with [`assertNever`](../../src/engine/assert-never.ts):

```ts
default:
  return assertNever(move, "abcd: executeMove");
```

Bind the value to `never` rather than writing `default: throw`. The two are not
equivalent: a bare `default` makes the function total *for the type checker*
whatever the union says, so adding a move type and forgetting an arm compiles
cleanly and fails at runtime — you would be trading the compile-time guarantee
for the runtime one. `assertNever` keeps both, and the `never` binding works the
same through an `if / else if / else` chain, so a game with a shared prologue
does not have to become a `switch` to get it.

Two shapes need care, and both are common here:

- **Where the discriminant is a field on a single interface** rather than a union
  of shapes (`LightupOp.kind: "light" | "impossible"`), it is `op.kind` that
  narrows to `never`, not `op`. Assert on the field and put the op in the
  context string: ``assertNever(op.kind, `lightup: executeMove op at (${op.x},${op.y})`)``.
- **Where the move is one object shape with no discriminant at all**
  (`{ ops: Op[] }`, `{ dir }`), there is nothing to narrow. Use
  [`rejectMove`](../../src/engine/assert-never.ts) on the fields the dispatch
  reads — and **never** `assertNever(move as never, …)`, which silences the
  error the helper exists to raise.

Put the guard **before** any bounds check it might hide behind. A missing
coordinate makes `x < 0` and `x >= w` *both* false, so range tests wave a foreign
move straight through — that is how Subsets and Crossing came to return a board
the player never made.

The collection-wide guard is `engine/save-round-trip.test.ts`, which pushes a
foreign move into every game's saved move log and requires the refusal to name
the game.

## Status

`status(state)` reports won/ongoing/lost **of the board alone, never of how it
was reached** (`ts-engine` § "A game's status is judged from the board alone").
It is the game's existing completion check, called on the state; it must not
write into the state, so a check that marks errors as it goes is split into the
marking the move does and a pure predicate `status` asks. **Store no
`completed` or `cheated`**: the midend asks `status` once per position, and
derives the rest from the history it owns. That is why a game ID typed in
already solved is solved at move 0, why a Solve move needs no special case (the
board it leaves is solved, so its status says so), and why a solved board the
player breaks reads ongoing again everywhere: the status bar, the hint, the
end-of-game dialog and the clock (owner, 2026-10-01).

Keep in the state only what the board *shows*: Black Box's reveal, a dead ball
or a killed Mines cell are positions, and status reads them. A count the status bar shows (moves, guesses) is the state's own
and does not freeze at a solve. `changedState` reacting to "became solved"
asks `status` of the old and new state.

The solver side of Solve is [solver & generator](./solver-and-generator.md)
§ "Solve and the generator's aux".

**What a player reads is the engine's.** A refused Solve returns a
`SolveFailure` ([`solve-failure.ts`](../../src/engine/solve-failure.ts)), and
the status bar's completion words (`COMPLETED!`, `Auto-solved.`,
`Auto-solver used.`) are prefixed by the midend to whatever `statusbarText`
returns ([`completion-status.ts`](../../src/engine/completion-status.ts)), so
`statusbarText` returns only the game's own phrase. Neither leaves you a word
to choose; the engine catalog's entries for them say which failure a solver's
verdict entitles it to.

## Capability flags

Printing has no implementation here. A "print this puzzle" feature would be
written from scratch, so do not promise one without designing it.

**A game offers a capability by having its method, never by declaring a flag
beside it.** `Midend.getStaticProperties` derives the app's flags from the
methods, so a game cannot claim a Solve button it has no `solve` behind:

| App flag | Derived from | Trap |
| --- | --- | --- |
| `wantsStatusbar` | `statusbarText` | the timer is not in it; it has its own chrome |
| `canSolve` | `solve` | test through a real `Midend` when `aux` matters |
| `canHint` | `hint` | see [hints](./hints.md) |
| `canCheck` | `findMistakes` or `hint` | a hint alone checks only for a dead end |
| `hasReference` | `reference` | |

Text export follows the same rule: `textFormat` present means a text panel,
and it may still return `null` for params with no rendering (Loopy: square
grid only).

What a game still declares is what the midend needs synchronously and cannot
read off a method:

| Flag | Means | Trap |
| --- | --- | --- |
| `canMarkAll` | game handles the `M`/`m` key; shell shows the button | see "Pencil marks" |
| `ignoresSecondaryButton` | the secondary button means nothing in this game | a touch hold then stays a left press — [input](./input.md) § "A touch hold arrives as the right button" |

**A param-dependent capability the static flag can't express: widen the
return, don't add a hook.** Loopy's text format works on the square lattice
and none of its other seventeen tilings; the resolution was widening
`textFormat` to return `string | null` — the midend and share dialog
already treat an absent rendering as "no text panel". A
`canFormatAsTextNow?(params)` hook would have been a wider surface for one
adopter, which is the `PointerAction` mistake: a hook shipped speculatively,
adopted by nobody, later deleted as phantom API. When one game needs a
refinement, prefer the narrowest change the existing consumers already
tolerate.

### Contract sections, and what makes a draft

Four members are **sections** ([`sections.ts`](../../src/engine/sections.ts)):
`hint`, `findMistakes`, `solve` and `transposeParams`. Each is implemented, not
applicable, or absent, and **an absent one makes the game a draft**: still
playable, labeled "Draft" on the home screen, never hidden. Nothing sets draft
by hand; the build computes it (`vite-plugins/draft-puzzles.ts`).

When the puzzle has no such thing, say why in `notApplicable`, keyed by
section:

```ts
notApplicable: {
  findMistakes: "Every arrangement of the tiles is a step on the way to the answer, so no move can be wrong, only longer.",
},
```

- **A reason is a fact about the puzzle** a player could check against its
  rules, written as a sentence: it is printed on the game's help page under
  "Not in this game". "Upstream never wrote one" is history, not a reason; that
  game is a draft until someone writes the section.
- **A hint is never not applicable.** The type refuses the key.
- **Implemented and excused at once is refused** wherever a section state is
  read, the production build included.
- **A guard that would excuse a game for lacking a section reads the reason**
  (`sectionState`) instead of keeping a ledger: `orientation.test.ts` does.

`difficulty`, `textFormat` and the affordances (`hover`, `reference`, `prefs`,
the keypad) are not sections: nothing tells a puzzle that has no such thing
from an unfinished one, so their absence says nothing. The measurement behind
that line is `derive-the-draft-label`'s design.

## Ui

`Ui` is the ephemeral interaction state (cursor, drag anchors, typing buffers,
preferences) — never persisted with the board, rebuilt by `newUi` and move-log
replay on load. Entry-method state lives here, not on `State`, however many
gestures feed it (Ascent's three entry methods plus path drawing all collapse
to one small `Ui` + a four-armed move union).

### changedState

`changedState(ui, oldState, newState)` reconciles a `Ui` that tracks state
after every real move/undo/redo/solve/restart (never on a bare `UI_UPDATE` —
the user is mid-edit then). **The two states need not be one move apart.** A
restart is a step of the history, so Undo hands this hook the starting board
and the board as it was played, in either order, as Solve hands it a board and
its solution. Derive the `Ui` from `newState` alone; do not diff the pair. The
engine plays no move animation across a restart, so `animLength` is not asked
about that pair. **A drag-preview game must cancel a dangling drag
here**: the board can change under a held pointer (an undo mid-drag), and
a preview that then simulates its move against the new board throws where
upstream asserted. See [rendering](./rendering.md) § "Drag previews and blitters" for the
render half.

**A `Ui` rebuilt from state must ask whether this transition touched what it
rebuilds.** Guess rebuilt its working row from the holds after every
transition, which was harmless while the only moves were guesses; the day marks
became moves, each one would have wiped the row the player was marking against.
It now rebuilds only when the row being played changes. Adding a move type to a
game with a rebuilding `changedState` is the moment to check.

### Ui that must survive a save

**A `Ui` field set in `interpretMove` that lives outside the undo history
cannot be rebuilt by replay** — replay runs `executeMove`, never
`interpretMove`. Mines' death counter is the case: dying then undoing removes
the death from the log; Guess's half-composed row and its live holds are
another, since a row reaches the log only when it is submitted. Serialize
exactly those fields with `encodeUi`/`decodeUi`; the midend restores them after
the replay. A game whose `Ui` is fully derivable omits both hooks.

**Writing the hooks is only half of it — check that something still takes a
save.** The app autosaves when `puzzle-context` sees one of the values it
watches change, and a `Ui` edit is not a move: it moves no move index, no game
id and no checkpoint. So Guess shipped a perfectly correct `encodeUi` whose
output nothing ever asked for, and the composed row came back empty from a real
reload while every test passed. The fix carries the encoding itself in the
`game-state-change` notification (`NotifyGameStateChange.uiState`), so the value
the app compares **is** the part of the save that would differ — and a game with
no `encodeUi` sends nothing and costs nothing. `midend-ui-state.test.ts` holds
the derivation; the reload is the half only a browser can tell you about, which
is why `AGENTS.md` says to run the app.

### Preferences

**Per-game preferences are the declarative `Game.prefs` hook; the values live
on the `Ui`.** Each item maps a labeled boolean/choices control to
`get(ui)`/`set(ui, v)` accessors; `newUi` sets the defaults (the place to ship
a deliberate divergence — Untangle's crossed-edge highlight defaults on). The
midend builds the dialog, persists per-puzzle, and re-applies choices after
every `newUi`. Choice values are zero-based indices; booleans are real
booleans. Two verify-cycle gotchas:

- A render-only pref moves nothing a game's redraw early-out watches, so the
  midend drops the drawstate on `setPreferences` to force a full repaint —
  expect the full repaint, add nothing.
- **The app overrides `newUi` defaults per-puzzle**:
  `src/store/settings.ts` `getPuzzlePreferences` carries a small hardcoded
  defaults map applied on every load. A checkbox that comes up "wrong" on a
  smoke-test may be the app's intended default — check that map before chasing
  your hook.

Exemplar: [`untangle/index.ts`](../../src/games/untangle/index.ts). Pencil
games declare the shared prefs from
[`engine/pencil-prefs.ts`](../../src/engine/pencil-prefs.ts) — see below.

## Timed games

**Every game has the solve timer; a game writes nothing to get it.** The midend
offers a `show-timer` preference in every game, on by default, and decides
when it counts: from the first move, while the status is `ongoing`,
never while the page is hidden, and never again once the board has been solved
(`Midend.timerRunning`). So a game's `status` is what stops its clock: a Solve
that leaves the board `ongoing` keeps the clock running, and that is a
bookkeeping bug to fix (Mines had it).

The one thing a game may add is `timerHolds(state)`: a board nobody can play on
that `status` still calls `ongoing`, because the player is meant to undo out of
it. Mines' death is the case. It states a fact about the board, never a clock
policy; if you want the clock to behave differently, the rule is the engine's
to change. **Browser-verify** the tick, the hold and the resume: the frame loop
and the page-visibility pause are real-frontend behavior that no unit tier
exercises.

## A board decided at first click

**A game whose board isn't determined until play begins implements
`supersededDesc(state)`** — the engine *pulls* the desc of the board in play
from the state, so `executeMove` stays pure and no game holds a midend
back-reference. Mines lays out its mines on the first click (which is
therefore never a mine). The engine guarantees, so don't re-derive them
(normative: [`engine-params`](../../openspec/specs/engine-params/spec.md), "A game
can supersede its game description mid-play"):

- The answer is a function of the state, and `null` means the desc the board
  started from. The game ID **follows the position**: undoing past the move
  that settled the board is back on the unsettled one, under its own ID.
- A save is rebuilt from the desc the board *started* from, with the move log
  replayed onto it. The answer here names the board as a shared ID opens it
  (Mines': the layout *and* its first click, already opened), which would
  re-play a click the log is about to make.
- Restart rebuilds from the desc in play — the player restarts to just after
  the settling move, not to a blank board. That board is entered as the next
  step of the history, so Undo returns the board as played.

**The settled board belongs to the state the settling move made, and the move
carries it.** Mines' first click is a move of its own (`begin`) holding the
layout laid out around it: `interpretMove` builds it from the seed in the
state, and `executeMove` generates nothing. So undo un-settles the board with
no bookkeeping, and a save's move log restores its board whatever the
generator has since become, which a seed and a click alone would not. Do not
keep the settled board in a holder shared across states:
upstream's did, it outlived the undo of the move that filled it, and a player
could then open a different square of a layout made for another. Exemplars:
[`mines/index.ts`](../../src/games/mines/index.ts) +
[`mines/state.ts`](../../src/games/mines/state.ts) (`MinesMove`'s `begin`);
[`desc-supersede.test.ts`](../../src/engine/desc-supersede.test.ts) is the
shape in miniature.

## Affordances

The deliberate-divergence features every game is measured against. Each is an
optional `Game` hook; presence drives the shell's controls automatically
through `Midend.getStaticProperties`.

| Affordance | Hook | Guide |
| --- | --- | --- |
| Explained hints | `hint` (+ plan hooks) | [hints](./hints.md) — **every game is expected to ship one** (coverage incomplete; see that guide's opening) |
| Mistake checking | `findMistakes` | computing: [solver & generator](./solver-and-generator.md); rendering: [rendering](./rendering.md) § "Overlay sidecars" |
| Check & save / Check without saving | free once `findMistakes` exists | shell-owned |
| Pencil marks | `canMarkAll` + moves + prefs | below |
| Reference aid | `reference`/`selectReference` | below |

**A deduction's notation is an affordance, and a hint may use only what the
game offers.** If solving a tier needs a kind of mark (pencil candidates, an
association arrow, a no-line cross, Loopy's corners and pairs of edges), the game
gives the player that mark with every input it supports, and the hint's steps
place it as a move. A hint that draws facts the player cannot record teaches
nothing the player can reuse ([`hints.md`](./hints.md) § "The quality bar", rule 6). Decide
the notation when a game's deductions first need it, not when its hint is found
to be drawing around the gap. Loopy's notes mode is the worked example: its
corner and pair notes are state and moves beside the lines (`LoopyState.corners`
and `pairs`), entered through `ui.pencilMode` by tap, drag and keyboard
(`games/loopy/notes.ts`), and the hint places them before it cites them. **Give a
new notation the collection's mode, not a mode of its own** — `ui.pencilMode` and
the Marks key below, whatever the marks themselves look like.

### Mistake checking is part of "done"

**A game with a unique solution MUST ship `findMistakes` — Check & Save
depends on it.** The midend's `check` blocks a save on a wrong entry only
through `game.findMistakes`; the hint behind it catches only a position it
calls a dead end, so without the hook the control **blesses a wrong board**
(shipped in Unruly's first cut, caught on owner smoke-test). A game with no
mistake to check (rearranging pieces, many solutions, a hidden answer) says so
in `notApplicable.findMistakes`; see "Contract sections, and what makes a
draft". The four
computation shapes (re-solve, edge-contradiction, both-layers, rule-checker)
are [solver & generator](./solver-and-generator.md) § "findMistakes";
the overlay-repaint trap is [rendering](./rendering.md) § "Overlay sidecars";
the refusal-to-hint coupling is [hints](./hints.md) § "Refusal couples to the
mistake overlay".

### Pencil marks: the full note-taking UX

Any game with candidate pencil marks carries all of the following — deliberate
default-on divergences that make note-taking usable with mouse and touch, not
just keyboard. Exemplar: [`towers/index.ts`](../../src/games/towers/index.ts).

**Put the marks in `pencil`.** A game's provisional per-cell candidates live in
a typed array of that name on its state — the noun the engine already uses
everywhere else it speaks about notes (`Ui.pencilMode`, the `pencilSticky` and
`pencilKeepHighlight` prefs, `pencilAll` / `pencilStrike`). The element type and
the slot arity stay yours: one bitmask per cell, or ABCD's candidate *cube* of
`n` contiguous slots, are both fine. Two things are outside the convention and
keep their own words — a field that is not a candidate set (Pearl's `marks` are
no-line marks on a cell's four edges), and a **solver's** own working candidate
scratch, which is a different object with a different lifetime. Guarded by
[`note-vocabulary.test.ts`](../../src/engine/note-vocabulary.test.ts); the
normative rule is the `engine-notes` spec, "One note-taking vocabulary across
games". *What the disagreement cost while it lasted*: `mark-all.test.ts` carried
a hand-written row per game whose whole job was to say where that game's notes
were — the last per-game roster in the cross-game guards.

- **Mark-all — `canMarkAll: true`.** The game handles `M`/`m` in
  `interpretMove`; the flag surfaces the *Fill all pencil marks* row that
  injects it.
  A *candidate-elimination* game (one with a `regionsOf` — see
  [hints](./hints.md) § "Candidate-elimination games") routes `M` through
  `adaptiveMarkAllMove`
  ([`engine/candidate-hint.ts`](../../src/engine/candidate-hint.ts)): fill
  note-less empty cells, or — on an already-fully-noted board — strike each
  cell's *obvious* candidates (values already placed in one of its uniqueness
  regions) as one atomic move. It returns `null` when there is nothing to do,
  so a redundant press adds no undo entry. The cleanup is idempotent, defined
  off the *placed* grid only, and never empties a cell's last note. Use the
  same `regionsOf` the hint's plan declares (a Keen cage is **not** a region;
  a Solo Killer cage forbids repeats, so it is one, flagged `holdsEvery: false`);
  games without a row/column model keep plain fill-only. **The mark-all trap:**
  a guard on this path must *narrow* a cell's notes or the bug hides — the
  mark-all-resets-notes defect shipped in ten games at once; mutation-check
  the guard (see [testing](./testing.md)).
- **Refuse a note Mark-all would never make.** Where a cell's full note set
  varies by cell, as Rome's arrows are bounded by the grid edge and Seismic's
  numbers by the area's size, input refuses a note outside it. No solver
  considers that candidate, so no hint has a strike for it, and a hint meeting
  one could not explain the placement it hides. Rome's crashed exactly that
  way (`rome-hint-survives-a-restored-note`). Refuse it on every way into notes
  (typed key, keypad, drag; the drag's preview too), and mask it in
  `executeMove` as well, because a saved move log from before the refusal
  replays through `executeMove`.
- **Declare the pencil preferences from
  [`engine/pencil-prefs.ts`](../../src/engine/pencil-prefs.ts), never by
  hand.** `stickyPencilPref()` and `pencilKeepHighlightPref()` carry wording
  ten and five games share; `autoPencilPref(name)` takes its label as an
  argument *because* the sentence names the regions the game clears. Sharing
  only the keyword and plumbing is the honest amount to share — a copied
  player-visible label is a label that drifts, and `pencil-prefs.test.ts`
  fails on a divergent copy.
- **Do not write the pointer arm by hand** — call
  [`engine/note-taking-cell.ts`](../../src/engine/note-taking-cell.ts)'s
  `pressNoteTakingCell`, which is the mechanic itself, shared by all eleven
  games that carry it. You supply two predicates about the cell (`canEnter`,
  `canMark`) and your own coordinates; it resolves the press and reports
  `"moved"` / `"unmoved"` / `null` so a game layering something on the
  selection (Crossing's across/down snap, Group's multifill anchors) can hang
  it off the result. `releaseHighlightAfterEntry` and `noOpEntryResult` are the
  matching rules for what a symbol *entry* does to the highlight — the
  keystroke decoding and the no-op predicate stay yours, because they read your
  grid. A game carrying `ui.pencilMode` and `ui.cursorFromKeyboard` without
  calling `pressNoteTakingCell` fails `note-taking-cell.test.ts`; this used to
  be eleven copies, and it is one now.
- **If your press starts a drag, the gesture is the engine's.** Rome and Map
  spend the press (and the right button) on drags, so the selection cannot
  happen at the press — it is not yet known to be one. **Your press changes
  nothing about the highlight**; the release resolves the gesture through
  `tapNoteTakingCell` (it committed nothing, so it was a tap, and a tap is a
  press — hand it the release button and it maps it back) or
  `dragEnteredNoteTakingCell` (it committed a move, so the highlight follows
  the pointer to what it acted on and goes away). The drag keeps its buttons,
  the tap gets the mechanic's, and no game needs an exemption for a right
  button that is "already spoken for".

  Two things to get right, both of which cost Rome and Map a player-visible
  quirk apiece before `own-the-select-or-drag-gesture`. **Do not hide or move
  the highlight at the press** — the release needs to know what it was on, for
  the repeat tap and for the sticky mode switch that must leave it exactly
  where it was; keep your grabbed cell in the drag's own fields, not in the
  cursor. And **if your selection is not a cell**, answer
  `TapTarget.onSelection` yourself: Map selects a region, and the cell under
  the finger would make two taps on one region read as two selections. When it
  is a cell, leave it out and the arm answers for itself.
- **Do not draw the highlight by hand either** — paint the cell's background
  through `drawCellBackground` and pack `cellHighlight` into the tile key
  ([rendering](./rendering.md) § "The note-taking cell's picture"). A member
  that does not fails `note-taking-cell-render.test.ts`.
- **The Marks key** — `pencilModeKey` last on the keypad, which every game
  carrying `ui.pencilMode` offers, whether or not its notes are candidate marks.
  It is the one way into the mode that costs the game no button, so a player
  learns note-taking once for the collection rather than once per game, and it is
  what a touch player has instead of a held finger. A note-taking cell game routes
  it, with Enter on the highlight, through `toggleNoteTakingMode`; the app's bare
  `P` sends the same code. Guarded, in both directions and by derivation from
  `newUi`, by `pencil-mode-key.test.ts`.
- **Sticky pencil mode** — a `pencilSticky` `Ui` boolean (default true) via
  `prefs`: right-click toggles a persistent pencil mode; left-click only moves
  the highlight. The keyboard is already mode-persistent; this unifies the
  mouse with it. A right-click on a filled/given cell toggles the mode but
  must **not** select or restyle that cell — it can't take a mark, so
  highlighting it only confuses. All of that is the shared arm's, not yours.
- **A CapsLock-style mode indicator** — a fixed pencil glyph whenever the mode
  is on, and **the engine says where it goes**: `pencilIndicatorBox` puts it at
  the canvas's top-right in every game, so the cue does not move when a player
  changes puzzle. What stays yours is finding the room for it (a margin you
  already have, a wider border, or a grown canvas) and how you repaint it; see
  [engine catalog](./engine-catalog.md) § "`pencil-indicator.ts` — the
  pencil-mode indicator".
- **Notes are first-class in `findMistakes`.** An empty cell whose non-empty
  notes have crossed out the solution value is a mistake (`kind: "note"`),
  rendered like a wrong placement and blocking Check & Save through the
  existing gate. Extra, non-solution candidates are ordinary mid-solve state —
  not flagged. Derive the solution from placed givens only, never from notes
  (a note can be wrong; that is what is being checked). Normative: the
  `findMistakes` requirement in
  [`ts-engine`](../../openspec/specs/ts-engine/spec.md). **Carve-out:** this
  holds only where notes *are* candidates. Rome's marks are documented as
  free-purpose (a player as likely marks what they ruled out), so with no
  agreed meaning no reading of a note can be called wrong — Rome checks placed
  arrows only. Read the game's help page before applying the rule; record a
  decline in the change's `design.md`.

The explained pencil-notes hint these games want is its own change — see
[hints](./hints.md) § "Candidate-elimination games".

### The reference aid

**A game whose core bookkeeping is "which pieces have I used?" can offer a
reference aid** — a non-blocking checklist panel of the fixed piece inventory
with found status, where clicking a piece spotlights its candidate placements.
A deliberate learning-aid divergence, gated behind a rail row like
*Show solution…*. The seam is generic (Dominosa implements it today):

- **Two optional hooks.** `reference(state, ui): ReferenceModel` returns the
  checklist, derived **purely from the player's own placements**, never the
  solution — zero leak; it is the paper accounting. `selectReference(ui, key)`
  spotlights by mutating `Ui` and reports whether anything changed (false
  skips the repaint). It is the first clean app→`Ui` push channel — shaped
  like a `UI_UPDATE`, no move, no history, not serialized.
- **Presence flows the `canMarkAll` chain** (`hasReference` →
  `PuzzleStaticAttributes` → a *Reference* row in the rail). The panel is the generic
  [`components/reference-panel.ts`](../../src/components/reference-panel.ts):
  side-docked with room, a bottom sheet on narrow viewports *and* in the
  short-landscape orientation (a side dock there shoves the board off-center —
  the panel and the padding rule share the orientation media condition).
- **The board highlight is a per-game `Ui` field + render bit** (Dominosa's
  `highlightPair` drives `COL_REFERENCE` boxes; the bit folds into the packed
  cache key — [rendering](./rendering.md) § "The tile cache and the diff key"). Drive the frame
  in-process with `renderScenario({ …, selectReference: key })` and assert the
  boxes appear only with a selection.

Normative: the reference-aid requirement in
[`ts-engine`](../../openspec/specs/ts-engine/spec.md); exemplar
[`dominosa/`](../../src/games/dominosa/index.ts).

**When the inventory is already drawn on the board, make it an input surface
instead of a panel.** Crossing's clue list was already painted, so the port
made it clickable — pick a clue up, see it ghosted into every run that can
still take it, click to write it in as one move. No new engine seam: it is
`interpretMove` hit-testing pixels the game paints. Two rules make it safe:
share the layout function between `redraw` and `interpretMove` (a private copy
in the input path is a drift bug waiting to happen — see "One function, both
callers" below), and decide what "available" means *short of solving* —
Crossing offers a clue on length/digit/unused pattern-matching over the
player's own entries; testing crossing-run satisfiability is constraint
propagation, i.e. the puzzle, and belongs to `hint()`. The stronger version is
barely more code, which is exactly why the line needs stating.

**Check what a gesture already means before borrowing an interaction from
another game.** Ascent's ghost grammar (left accepts a preview, right cycles
alternatives) does not transplant to Crossing, where both gestures were
already spent — the visible inventory replaced cycling altogether.

## Bespoke geometry

### Padded rectangles and sheared draws

Some games store an odd-shaped board in a padded rectangle and shear it on
draw (Bricks: a hexagon whose backing array is wider than the user size, the
two triangular corners masked to a bound sentinel, each row drawn offset by
half a tile per row). Three rules keep it cheap and correct:

- **The mask + neighbor table are logic, not display.** They decide how many
  playable cells the desc encodes and drive validity — a bug there desyncs the
  codec and the solver. Everything visual (shear offset, bevels, origin) is
  display: match the look, keep it clean.
- **`interpretMove` must invert the exact draw transform, in the same
  order** — undo the origin, floor to a row, *then* subtract that row's shear
  before flooring to a column. Share the offset helper between `render.ts` and
  `index.ts` (Bricks exports `offsets(h, ts)`) so pointer mapping and drawing
  cannot drift. Force the tile size even in **both** `computeSize` and
  `newDrawState` so the half-tile is exact.
- **Verify the shear from an SVG dump before touching a browser** — a wrong
  offset shows instantly as a staircase; see
  [testing](./testing.md) § "Render scenarios".

Exemplars: [`bricks/render.ts`](../../src/games/bricks/render.ts) +
[`bricks/index.ts`](../../src/games/bricks/index.ts).

### One function, both callers

**Any rule the input and the display both need is one function, called by
both.** Coordinates are only the obvious case. Crossing's clue list *colors*
each clue by which run a click would send it to, and that rule was written
twice — an inline loop in `redraw` and `runForNumber` for the click. They
agreed until the rule gained a tie-break, at which point the list said "down"
while the click placed "across" (owner-reported). The fix is not to fix both
copies but to delete one: `redraw` now asks `runForNumber`. **Tell:** a
predicate in `redraw` that answers what a *move would do* — that belongs to
the move code; render should be asking, not deciding. Exemplar:
[`crossing/render.ts`](../../src/games/crossing/render.ts) (`layoutNumbers`,
`runForNumber`).

**The rule's most common concrete instance is the board's pixel origin**, and it
was violated in eight games until `unify-the-board-origin` swept for it: the
border was computed once in the module hosting `interpretMove` and again in the
module hosting `redraw`. All eight agreed, which is exactly why nobody looked —
the failure mode is that they agree until one gains a reason to change, and then
the click lands on a different cell than the one the player sees highlighted,
with the whole suite green because nothing drives paint and input against each
other.

- **Put the origin in `render.ts`, export it, and import it from the input
  path.** One function cannot drift from itself, so this needs no test at all —
  which is stronger than a guard asserting the two agree. Exemplars:
  [`mines/render.ts`](../../src/games/mines/render.ts) (`borderFor`) and
  [`bricks/render.ts`](../../src/games/bricks/render.ts) (`offsets`, whose doc
  comment says *"Shared with `interpretMove` so pointer mapping and drawing
  agree"*).
- **Tell: an input path that *cites* the render module in a comment instead of
  importing from it.** Slant's read `const b = Math.floor(ts / 3) + 1; //
  render.ts border (NARROW_BORDERS)` — a copy naming its own original, spelling
  the same number a second way (`render.ts` said `clueRadius(ts) + 1`). A
  comment pointing at the source of truth is the shape of an import that was
  not written.
- **Do not reach for a scan here.** One was considered and declined: it would
  have to key on a name (`border`, `BORDER`, `margin`, `TLBORDER`), and Slant's
  copy was an unnamed inline expression — so the scan would have reported the
  worst instance in the set as clean. See [`method.md`](../method.md), "A scan that
  keys on a name finds only the games that were named that way".
- **And a scan keyed on *where* a thing is defined misses the copies that share
  a file.** The sweep that found the eight games above keyed on "defines the
  origin in more than one file", and reported Flip clean. Flip had **four**
  copies of `tileSize >> 1` — for `interpretMove`, `computeSize`, `redraw` and
  `drawTile` — all inside `index.ts`, so the key could not see them; they came
  out only when the renderer moved to `render.ts`
  (`move-renderers-into-render-ts`). The name-keyed miss and the location-keyed
  miss are the same error: **the key was a proxy for the defect, not the
  defect.** The defect is *more than one expression for one number*, and reading
  the game is what finds it.

### Grid modes are a movement table

**A game with several grid shapes is usually one substrate plus a per-mode
movement table — not N geometries.** Ascent's five modes (rectangle,
no-diagonals, hexagon, honeycomb, edges) are one square-grid substrate with a
`{dircount, dirs}` table per mode; adjacency, the solver, the codec and the
completion check read the table and are otherwise geometry-free. Hexagonal
modes are square grids with wall padding at the border; the half-tile visual
offset is a render concern, so the renderer has no per-mode board code at all.
Keep the *physical* grid size (state) and *user-facing* size (params) explicit
and separate; the physical size is frozen into ids. The table's inverse
structure (`dirs[n]` inverse of `dirs[dircount−1−n]`) is load-bearing for the
solver — port it verbatim.

Two adjacent Ascent patterns worth reaching for:

- **Multi-method entry reduces to a small discriminated move + an ephemeral
  `Ui`.** However many gestures exist, they emit one of a few move arms; the
  entry state lives on `Ui`, never `State`. C `switch` fallthroughs become an
  extracted arm called from the end of the prior case (a literal fallthrough
  trips `noFallthroughCasesInSwitch`).
- **A path-resolution post-pass that iterates.** When a drawn line can force
  placements, `executeMove` runs the clean/update/apply cycle **to a
  fixpoint** after the edit, then the completion check — a single pass misses
  the fully-drawn segment between two known numbers.

Exemplars: [`ascent/state.ts`](../../src/games/ascent/state.ts),
[`ascent/ui.ts`](../../src/games/ascent/ui.ts),
[`ascent/moves.ts`](../../src/games/ascent/moves.ts),
[`ascent/solver.ts`](../../src/games/ascent/solver.ts) (a scratch flag that
persists across solves — a generation-critical quirk; see that change's
design F1).
