# engine-params Specification

## Purpose
A game's params and the boards they describe: the declared fields the Custom
dialog is built from, the presets menu, the params codec and its labels, and
what happens when a game ID or description will not load.

## Requirements

### Requirement: The engine provides a shared dimension param parser

The engine SHALL provide `parseDimensions(s: string, start?: number): { w:
number; h: number; next: number }` in `src/engine/params.ts`, built on
`parseLeadingInt`: it reads a width, then an optional `"x"` followed by a height,
falling back to a **square** (`h = w`) when no `"x"` is present; `next` is the
index of the first character after the consumed dimensions. Games whose
`decodeParams` opens with an upstream `WxH`-or-square dimension prefix SHALL use
this instead of re-implementing the parse (whether via a `parseLeadingInt` pair,
a hand-rolled digit loop, or `indexOf("x")` + slice). Each game assigns the
returned `w`/`h` into its own typed params (whose field names may differ) and
continues parsing any trailing suffix from `next`.

#### Scenario: A rectangular param decodes

- **WHEN** a game calls `parseDimensions("10x7")`
- **THEN** it receives `{ w: 10, h: 7, next: 4 }`

#### Scenario: A bare square param decodes via the fallback

- **WHEN** a game calls `parseDimensions("4")` (no `"x"`)
- **THEN** it receives `{ w: 4, h: 4, next: 1 }` — the square fallback, fixing the
  prior `indexOf("x")`-based decoders (sixteen, pegs) that mis-sliced a bare
  square form
- **AND** parsing continues correctly for a trailing suffix (e.g.
  `parseDimensions("4x4m10")` yields `next` pointing at the `"m"`)

### Requirement: The engine exposes each game's custom-params configuration UI

The engine SHALL let a game describe its **custom-params** configuration form so
the app's "Custom type…" dialog can edit the game's parameters, mirroring the
per-game preferences surface. The `Game` interface SHALL define an optional
declarative `paramConfig`: an ordered list of field descriptors, each with a
stable keyword, a display name, a type (`string` for a text field — e.g. a numeric
width/height — `choices` for a select, or `boolean` for a checkbox), and
`get`/`set` accessors over the game's `Params`. A shared width/height helper SHALL
supply the common dimension fields so a plain w/h game declares them in one line.

The `Midend` SHALL build the app's `ConfigDescription` and initial `ConfigValues`
from `paramConfig` and the current params, and SHALL apply a submitted form by
mapping the values back onto a copy of the params, validating them with
`paramsError`, and — on success — adopting the new params (so the app generates
a new game) or — on failure — returning the validation error string without
applying. The worker-side adapter SHALL forward these to the midend rather than
return an empty configuration. A game that declares no `paramConfig` keeps an
empty custom dialog (correct for a preset-only game).

#### Scenario: A width/height game's custom dialog is populated and applied

- **WHEN** the "Custom type…" dialog is opened for a TS game that declares
  `paramConfig` (e.g. width/height)
- **THEN** the form shows a field per descriptor initialized from the current
  params
- **AND** submitting valid values validates them with the game's `validateParams`
  and generates a new game at those params

#### Scenario: An invalid custom value is rejected with the game's message

- **WHEN** the submitted values fail the game's `validateParams`
- **THEN** the engine returns the validation error string and does not change the
  current params

#### Scenario: A game without paramConfig keeps an empty dialog

- **WHEN** a TS game declares no `paramConfig`
- **THEN** its custom dialog is empty and no fields are shown (unchanged behavior)

### Requirement: A game can supersede its game description mid-play

The engine SHALL let a game whose board is not settled until play begins say
which description names the board a state is on (`Game.supersededDesc`,
upstream `midend_supersede_game_desc`), without games holding a midend
back-reference and without `executeMove` losing purity. The answer SHALL be a
function of the state alone, and `null` SHALL mean the description the board
started from.

The description SHALL follow the position. The midend SHALL ask it of the state
in play, and SHALL emit its id-change notification whenever a step, forward or
back, moves the board onto another description, so that the shareable game ID
always names the board on screen. Undoing past the move that settled the board
SHALL return the starting description.

Restart SHALL enter the board the description in play opens, which for a
settled board is not the state its history began from.

A save SHALL carry the description in play, and beside it, as its private
description, the one the board started from wherever the two differ. Restoring
SHALL build the first state from the private description when there is one and
replay the move log onto it, and SHALL ask the description in play, not the
private one, whether its board can be finished. The move that settles a board
SHALL carry what it settled, so that a replay derives nothing again.

#### Scenario: Mines' first click generates the real layout

- **WHEN** a game's first move lays out the actual board (first-click-never-a-mine)
- **THEN** the id-change notification fires, and the shareable game ID names the
  real board

#### Scenario: Undoing the settling move

- **WHEN** the player undoes the move that settled the board
- **THEN** the id-change notification fires with the description the board
  started from
- **AND** Redo fires it again with the settled board's

#### Scenario: Restart after supersession

- **WHEN** the player restarts on a board whose description was superseded
- **THEN** the game restarts as the superseded description opens, not on the
  pre-supersession placeholder

#### Scenario: Save and restore mid-game

- **WHEN** the player saves after supersession and later restores
- **THEN** the restored game is built from the description the board started
  from, replays cleanly to the saved position, and names the settled board

#### Scenario: A replay settles nothing again

- **WHEN** a save's settling move carries a board other than the one the game
  would settle today
- **THEN** the restored game is on the board the move carries

### Requirement: Param validation distinguishes generating a board from loading one

The midend SHALL pass `full: true` to `Game.validateParams` only when the params
are about to be used to **generate** a board, and `full: false` when a
description is already in hand. A `<params>#<seed>` game id regenerates and is
therefore validated with `full: true`; a `<params>:<desc>` game id carries its
finished board and SHALL be validated with `full: false`, so a bound that only
generation is subject to — a size whose generator succeeds too rarely to wait
for, a difficulty that no longer produces distinct boards — never retires a game
id that was shared before the bound existed. This mirrors upstream
`midend.c`'s `validate_params(params, desc == NULL)`.

A game MAY express a generation-only bound by gating it on `full`. The engine
SHALL NOT make that gate vacuous by passing a constant.

#### Scenario: A generation-only bound refuses the seed form

- **WHEN** a `<params>#<seed>` id names params outside a game's generation-only
  bound
- **THEN** the midend refuses it with the game's reason, because the board would
  have to be generated

#### Scenario: A generation-only bound does not refuse the descriptive form

- **WHEN** a `<params>:<desc>` id names the same params, with its description
  present
- **THEN** the midend accepts it and the board loads, because nothing is
  generated

#### Scenario: A bound that is not generation-only still applies to both

- **WHEN** params fail a check the game applies regardless of `full`
- **THEN** the midend refuses them on the descriptive form as well as the
  seed form

### Requirement: No game ships an empty custom-params dialog

The app offers "Custom type…" for every game, so every registered game SHALL
declare a non-empty `paramConfig`, and a check SHALL assert it across the
registry.

Sokoban shipped without one from its port until this was asserted, so choosing
"Custom type…" opened a dialog with no fields in it. Two silent skips hid it: the
sweep over `paramConfig` began by skipping any game that had none, and the menu
entry was gated on a `canConfigure` flag the midend answered `true`
unconditionally. A genuinely preset-only game is a decision about what its menu
should say, to be taken deliberately rather than by omission.

#### Scenario: A game with no custom-params form is reported

- **WHEN** a registered game declares no `paramConfig`, or an empty one
- **THEN** the check reports it by name, rather than skipping it

### Requirement: A game declares its params encoding once, and both codec halves are derived

A game whose params encoding fits the collection's grammar SHALL declare it as
an ordered list of segments and obtain `encodeParams` and `decodeParams` from
`paramsCodec` in `engine/params-codec.ts`, rather than hand-writing two
functions that must be exact inverses of each other.

The grammar is what the 57 hand-written codecs turned out to spell, and no
more: a `dims` prefix (`WxH`, with upstream's square fallback) or a `size`
(one untagged leading integer), followed by tagged segments — `num` (`n12`),
`choice` (a tag plus one letter from a table) — bare `flag` letters, and
`letters`, a choices field written as one bare letter per choice (Salad's `L`
and `B`, Seismic's `T` or nothing). The options are the variations those
codecs actually contained: `full` for a generator-only field the brief encoding
omits, `invalid` for the out-of-range value an unrecognized difficulty letter
leaves behind, `means` for a letter written when its field is *off*,
`omitWhen` for a field written only when non-zero, and `whenAbsent` for a
default computed from params already decoded.

**A segment SHALL name a `paramConfig` field by its `kw` and reuse that item's
`get`/`set`.** This is the requirement's substance rather than an
implementation note: the params form and the codec were two hand-synced copies
of one field list, and naming the field through the form makes it impossible
for a field to appear in the Custom dialog and be dropped from the game ID, or
the reverse. It also keeps a field's representation the game's own business —
three of the converted games store a difficulty tier as something other than an
index, and none of them changed to become encodable. An integer that is not a
text field's value — a choices field upstream writes as its stored number
(Bridges' `i30`, Loopy's `t4`), or a field the dialog does not offer — SHALL be
encoded by handing `num` an accessor pair in place of the `kw`.

A game's codec SHALL move from hand-written to declared only when decoding is
identical on every string the old codec accepted — shown by a differential over
the recorded corpus, each entry truncated and with junk appended, and the
legacy forms the old decoder handles — and encoding is identical for every
record the engine's params check accepts.

**A segment naming a `kw` no item declares SHALL throw**, rather than encoding
nothing. A silently skipped segment would drop a field from every game ID the
game issues.

#### Scenario: A declared codec round-trips

- **WHEN** a game declares its encoding as a segment list
- **THEN** `decodeParams(encodeParams(p, true))` re-encodes to the same string,
  for every params object the game can reach

#### Scenario: A segment naming an undeclared field is refused

- **WHEN** a segment names a `kw` that the game's `paramConfig` does not declare
- **THEN** building the codec throws, naming the missing `kw`

### Requirement: A params encoding the grammar does not fit stays hand-written

A game whose encoding the segment grammar cannot express SHALL keep a
hand-written codec, and that codec SHALL remain first-class rather than being
treated as debt.

Measured over all 57 games at the time the grammar was written, the shapes it
does not express are: a float-valued param (Rectangles' expansion factor, Net's
and Netslide's barrier probability), a leading letter before the dimensions
(Cube), a `switch` mapping a field to multi-character strings with defaults
omitted (Solo's symmetry and difficulty), a `while` loop over the tail
accepting letters in any order (Dominosa, Mines), and a boolean encoded as an
integer (Mosaic).

**The grammar SHALL NOT grow an option to absorb a single game.** A shared form
escaped by more games than it serves is not a win, and a form that swallows
every game by accreting a per-game hatch is two ways plus a seam rather than
one obvious way — which is the outcome this whole direction exists to avoid.
An option earns its place by serving several games, as `whenAbsent` does.

#### Scenario: A bespoke codec is held to the same guarantee

- **WHEN** a game keeps a hand-written codec
- **THEN** its encodings are asserted by the same byte-stability guard as every
  declared one, so the two shapes differ in how they are written and not in
  what is promised

### Requirement: The engine provides the two desc value alphabets

The engine SHALL provide, in `src/engine/desc-alphabet.ts`, two frozen value alphabets: `n2c`/`c2n` over `0`–`9`, `a`–`z`, `A`–`Z` (62 values, for a desc in which every character is a value) and `n2cUpper`/`c2nUpper` over `0`–`9`, `A`–`Z` (36 values, for a run-length desc, which has spent the lowercase letters on blank runs). Each writer SHALL throw on a value it cannot write rather than walk into punctuation; each reader SHALL return `null` for a character outside its alphabet, a lowercase letter included for the run-length alphabet, and its return type SHALL say so. Neither order SHALL change, because both are baked into shipped game IDs. A game whose desc writes a value above nine SHALL use the alphabet its grammar implies and SHALL keep its own bound beside the call.

#### Scenario: A run-length desc writes and reads a value above nine

- **WHEN** Loopy encodes a clue of 12 and Bridges an island of 16
- **THEN** the desc carries `C` and `G` respectively, `c2nUpper` reads them back, and Bridges' own `validateDesc` still rejects `H`

#### Scenario: The two alphabets agree where they overlap and nowhere else

- **WHEN** a digit `0`–`9` is written through either alphabet
- **THEN** both write the same character
- **AND** `c2nUpper("a")` is `null` while `c2n("a")` is `10`

### Requirement: Choosing params changes the next board, not the one on screen

The midend SHALL keep the params of the board on screen apart from the params the next new game is dealt at. `setParams` and `setCustomParams` SHALL change only the latter. The save envelope, a restart, the emitted game ids, the hint's tier check, the requested keys and the computed size SHALL read the params of the board on screen, which SHALL change only when a board is started.

The app sets the params and then deals, and anything that reads the board in
between would otherwise record it at a tier or size it was never dealt at.

#### Scenario: A save taken between choosing a type and dealing keeps the board's tier

- **WHEN** a board is on screen, params at a different tier are set, and the game
  is saved before a new game is dealt
- **THEN** the save records the tier of the board on screen
- **AND** the next new game is dealt at the params that were set

### Requirement: Every default and preset draws no wider than tall

Every registered game's default params and every preset leaf SHALL draw no wider than tall (within 2%), judged by the game's own `computeSize` and never by its params' field names. A board whose shape is the puzzle's own SHALL be recorded, with its reason, in a ledger the guard holds exactly right, so an entry nothing needs also fails.

A phone held upright is the main way this app is played, and a landscape board on it is drawn at the width of the screen with most of its height wasted. A census of `w > h` counts a clue margin, a panel along one side or a tiling's cell shape wrong, which is why the measure is the drawn size.

#### Scenario: A landscape preset is refused

- **WHEN** a game offers a preset whose `computeSize` is wider than tall by more than 2%
- **AND** the ledger does not name that game and encoding
- **THEN** `orientation.test.ts` fails, naming it

#### Scenario: A board wide by nature is excused by name

- **WHEN** Cube's non-cube solids or Ascent's hexagon mode draw wider than tall
- **THEN** the guard accepts them because the ledger names each with its reason

### Requirement: A params field declares what it means, its range and its words

Every `paramConfig` item SHALL carry a `doc` saying what the field means, as the
help's Parameters section states it; an item documented together with the one
before it (Height with Width) SHALL say so with `{ with: kw }` naming that item.
A numeric text field SHALL declare its unconditional range as `bounds`, and a
field MAY declare a `label` saying which slot of a params label its words fill.

These are the facts the Custom dialog, the preset titles, the type header, the
bounds check and the help were each keeping a copy of, and the item is the one
place all of them are consumed from. A choices field's `doc` SHALL name each of
its word choices, because a mode the dialog offers and the help never explains
is the gap Unequal's Adjacent sat in.

A tiered game SHALL declare its difficulty field with the engine's
`difficultyItem(tiers, field)` rather than writing the item, and the tier
accessors `tierOf(game, p)` and `withTier(game, p, tier)` SHALL be derived from
that item.

#### Scenario: A field without a doc

- **WHEN** a registered game declares an item with an empty `doc`, or a
  `{ with }` doc not naming the item before it
- **THEN** `params-declared.test.ts` fails, naming the game and the field

#### Scenario: A mode the help never names

- **WHEN** a choices field offers a word its doc does not mention
- **THEN** `params-declared.test.ts` fails, listing the missing words

#### Scenario: A tiered game writes its own difficulty item

- **WHEN** a game's difficulty field is not labeled as the tier slot the engine's
  item fills
- **THEN** `params-declared.test.ts` fails, so the field is built by
  `difficultyItem` and the accessors read the one declaration

### Requirement: One describer labels every params set

A set of params SHALL be named for a player by one engine function,
`describeParams(game, p)`, composing the items' label words in the order
`[ruleset: ]size[ kind…][ tier][, tail…]`, the ruleset being the name of the
game's declared ruleset when it has them. The preset menu's titles, the type
header of a board matching no preset, and every test reading a title SHALL go
through it — a preset leaf is its params, and its name is their label.

A leaf of `presetMenu(game)` SHALL carry that name as its `label`, and the
menu's line as its `title`. The two SHALL be the same except under a ruleset's
heading, where the title SHALL be the label without the ruleset's name. The
type header of a board dealt from a preset SHALL read the label.

A leaf MAY keep a declared title only for a name upstream gave it that no field
says (Guess's "Standard"). Such a name SHALL differ from the leaf's label, no
two presets of a game SHALL share a label, and no two lines under one heading
SHALL read the same.

The slot order is the collection's convention and the words are each game's:
two games could want different words for a field, but not the tier in a
different place.

#### Scenario: A tier renders as its declared name

- **WHEN** a label is composed for params at any tier of any tiered game
- **THEN** the text contains that tier's declared name

#### Scenario: Two presets read the same

- **WHEN** two leaves of a game's preset menu get one label, or a named leaf's
  title is its label
- **THEN** `params-declared.test.ts` fails, naming the game and the title

#### Scenario: The menu and the header name one board one way

- **WHEN** a player opens a preset, and later reaches the same params through
  the Custom dialog
- **THEN** the type header reads the same both times, because both are the one
  label

#### Scenario: A line under a ruleset's heading

- **WHEN** a game's presets hold more than one ruleset
- **THEN** each line under a ruleset's heading reads as its label without that
  ruleset's name, and the header of a board dealt from it reads the whole label

#### Scenario: A menu of one ruleset

- **WHEN** every preset of a game with rulesets belongs to one of them
- **THEN** the menu has no headings and each line reads as its whole label

### Requirement: Params validity is the engine's check

Whether params can be played SHALL be decided by the engine's `paramsError(game,
p, full)`: each item's `bounds`, each choice inside its list, then the game's own
`validateParams`, which is optional and holds only what the items cannot state —
a limit depending on another field, or one that applies only when generating.
The midend, and every test asking whether params are valid, SHALL call it.

A bound's refusal SHALL name the field by the label its Custom dialog shows.
Where a requirement elsewhere in the specs says a game's `validateParams` SHALL
reject some params, that requirement is met by this check.

A generation-only limit SHALL NOT move into `bounds`, because a bound applies
whatever the `full` flag says and would refuse a description-carrying game ID
that loads today.

#### Scenario: A value outside its range

- **WHEN** the Custom dialog submits a width below its declared minimum
- **THEN** the engine refuses it with "Width must be at least N.", and the game's
  own `validateParams` is not asked

#### Scenario: A choice outside its list

- **WHEN** a decoded game ID carries a difficulty index past the tier list
- **THEN** the engine refuses it, naming the field and its choices

### Requirement: A game may turn its params, says why not, or is a draft

A game MAY declare `transposeParams(p)`, returning the same board turned on its side (width and height exchanged, together with anything laid out on the grid) or `null` for params that cannot turn. When it does, the midend's `newGame(fitTo)` SHALL deal the chosen params turned whenever the turned board draws at a strictly larger tile size in `fitTo`, the board area, and as chosen otherwise, so a square board and a tie keep the chosen orientation. Without `fitTo`, the chosen params SHALL be dealt as they stand.

The decision SHALL be made at deal time only. The params chosen for the next game SHALL stay as chosen, so the next deal on a screen held the other way round turns back, and a board started from an id, a save or an autosave SHALL never be turned. The Custom dialog SHALL show the chosen params turned the way the board on screen was dealt.

`transposeParams` SHALL be a contract section: a game that leaves it out SHALL give the reason in `notApplicable` — a tall board of it is a different game, or the board is the same shape either way round — or be a draft. A game whose reason is that its grid is square (`SQUARE_GRID`) SHALL draw every default and preset board square. Every implementation SHALL turn valid params into valid params, turn them back exactly, and draw the turned board with its width and height exchanged, checked on non-square boards built through the game's own width item; a game that draws something along one side only SHALL be named in `UNEVEN_FRAME` instead of meeting the last.

#### Scenario: A portrait preset is dealt turned on a wide screen

- **WHEN** Magnets' 5×6 preset is chosen and a new game is dealt to fit a 1200×700 area
- **THEN** the board on screen is 6×5
- **AND** `getParams` still reports 5×6, and a deal to fit a 390×640 area is 5×6

#### Scenario: A game that cannot turn is dealt as chosen

- **WHEN** a Same Game board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen

#### Scenario: A board loaded from an id is never turned

- **WHEN** a game id is loaded after a deal to fit a wide area
- **THEN** the board has exactly the id's params

#### Scenario: A game that neither turns nor says why is a draft

- **WHEN** a game declares no `transposeParams` and gives no `transposeParams` reason
- **THEN** it is a draft, and the catalog labels it so

#### Scenario: A square-grid reason is held to the drawn board

- **WHEN** a game gives `SQUARE_GRID` as its reason and a preset of it draws wider than tall
- **THEN** `orientation.test.ts` fails, naming the game and the preset

### Requirement: A game ID that will not load says why in the collection's words

The engine's verdict on a description (`validateDesc(game, p, desc)`, derived from the game's own parse) SHALL be a description error made by the engine's
description-error module: a kind (too short, too long, a number out of range, a
value repeated, clues that contradict each other, a layout this puzzle's IDs do
not have, or a character that cannot appear, naming it where the parser has it),
or a sentence about the puzzle's own rules passed through the module's named
escape. Its type SHALL admit no other string.

A sentence passed through the escape SHALL be used by one game only, since a
reason two games give is a situation the collection has and SHALL be a kind; it
SHALL not repeat a kind's words; and it SHALL be one sentence about "this game
ID". These SHALL be asserted by reading every call of the escape by its shape,
in the games and the engine alike.

`validateDesc` SHALL refuse a malformed description by returning, never by
throwing.

#### Scenario: A truncated ID says it may have been cut off

- **WHEN** a player enters a game ID whose description ends early, in any game
- **THEN** the dialog says the ID is too short for its board and may have been
  cut off when it was copied

#### Scenario: A bad character is named

- **WHEN** a description contains a character its game never writes
- **THEN** the message names that character

#### Scenario: A reason two games share becomes a kind

- **WHEN** two games pass the same sentence to the escape
- **THEN** the guard fails, naming the sentence and both games

#### Scenario: Garbage is refused, not thrown

- **WHEN** any game's `validateDesc` is given an empty string, punctuation, or
  an overlong run of one character
- **THEN** it returns without throwing, and refuses at least one of them

### Requirement: A game reads its description once

Every game SHALL read its description with one parser returning a
`DescParse` (`engine/desc-error.ts`), and `newState` SHALL build from that
parse's value through `descValue`. A game SHALL declare no validator: the
engine SHALL derive the verdict from `newState` itself (`loadDesc`), taking
the refusal `descValue` raises for a failed parse as the verdict and letting
any other throw propagate as a bug, so the verdict and the board are one
reading. The midend SHALL build state 0 from the same load that judged a
pasted or saved description. A check that needs the parsed board (a count, a
region, a rule of the puzzle's own) SHALL run inside that parse. A parser
SHALL accept what the game's own encoder writes and SHALL refuse what the
grammar has no place for, rather than skip it.

The engine SHALL provide a cursor over a description (`engine/desc-reader.ts`)
whose reads fail with the collection's `DescError` kinds: a character or
number missing because the description ended is too short, one with another
character in its place names that character, a number outside the bounds its
caller states is out of range, and text after the board is too long. The
cursor SHALL offer no way to read a number without bounds.

#### Scenario: A description the generator wrote

- **WHEN** a game's own generator writes a description for any preset the
  near-miss test reaches
- **THEN** `validateDesc` accepts it

#### Scenario: A description that ends early

- **WHEN** a description ends where the cursor expected a separator or a
  number
- **THEN** the parse fails as too short, never as a bad character or as
  malformed

#### Scenario: A number too large for its board

- **WHEN** a description gives a number larger than its caller's bound,
  however many digits it has
- **THEN** the parse fails as out of range, rather than storing a value a
  typed array wraps

#### Scenario: A save whose board no longer loads

- **WHEN** a player restores a save whose description the game's parser now
  refuses
- **THEN** the save is refused with the parse's reason, and nothing throws

### Requirement: A params refusal is a sentence

Every refusal `paramsError` returns SHALL be one sentence with its full stop:
the bounds and choice messages it generates, and every string a game's
`validateParams` can return. The Custom dialog and the Enter Game ID dialog
SHALL show a refusal as it comes, adding no punctuation of their own. Which
refusals a game has stays the game's own, because most are rules about one
puzzle; only the form is the collection's.

`params-refusal.test.ts` SHALL hold the games' half by reading every function
named `validateParams` and following each `return` through conditionals,
templates, top-level constants and the functions it calls, failing a string it
cannot read as well as one that is not a sentence.

#### Scenario: A game's refusal reaches the Enter Game ID dialog

- **WHEN** a player opens a game ID whose params the game refuses
- **THEN** the dialog shows the game's sentence after "That game won't open.",
  with the full stop the game wrote

#### Scenario: A fragment is refused at commit

- **WHEN** a game's `validateParams` returns "Too many mines for grid size"
- **THEN** `params-refusal.test.ts` fails, naming the file and line

#### Scenario: A constant shared by games is read once

- **WHEN** several games return `AREA_TOO_LARGE`
- **THEN** the guard reads the constant's own text and names it once, where it
  is written

### Requirement: A pasted game ID is refused or opened, never thrown

Every game SHALL answer a description a player enters with a refusal or a
board that builds and draws; neither loading the description nor the first
`redraw` SHALL throw. This is held by a cross-game test over two populations:
descriptions no generator writes, and near misses made by breaking each game's
real descriptions with one edit (truncated, a character dropped, doubled, or
replaced by a neighbor). The near misses come from one board per value of each
preset axis, generated from a fixed seed, so a failure names the same game ID
every run.

The test can see only a `newState` or `redraw` that throws something other than
a refusal. It SHALL say so where it is defined, with the measured split of
games for which that holds, so that a green run is not read as proof that a
parser refuses what it does not recognize.

#### Scenario: A parse that accepts what its board cannot hold

- **WHEN** a game's parse accepts a near miss and its `newState` or first
  `redraw` then throws
- **THEN** the test fails, naming the game ID that threw

#### Scenario: A mutator that stopped producing near misses

- **WHEN** the mutants reaching `newState` across the collection fall below
  the floor the test states
- **THEN** the test fails rather than passing over nothing

#### Scenario: Junk is refused by every game

- **WHEN** a game is given each of the malformed descriptions
- **THEN** it refuses at least one of them and throws on none

### Requirement: A board with a mistake check loads only with exactly one answer

The engine SHALL refuse to load a description, whoever wrote it, when the game
implements `findMistakes` and the game's own `solve`, asked about the board it
builds, proves the board has more than one solution (refused with
`DESC_NOT_UNIQUE`) or none (refused with `DESC_CONTRADICTORY`). The verdict
SHALL be part of `loadDesc`, so a pasted game ID, a shared link and a save are
judged alike. A solver that gives up without proving either SHALL leave this
verdict passing. A game's `findMistakes` SHALL compare the player's marks with
that one answer, including where the answer is hidden from the player; a hidden
answer SHALL NOT be a reason in `notApplicable.findMistakes`.

#### Scenario: A game ID with two answers

- **WHEN** a player opens a Black Box game ID whose lasers allow two layouts
- **THEN** it is refused with `DESC_NOT_UNIQUE`, and nothing throws

#### Scenario: A game ID upstream's generator wrote

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states, every field of which is placed or known to describe the
  fixture
- **THEN** it loads

#### Scenario: A hidden answer is checked

- **WHEN** the player runs Check & Save in Mines with a flag on a square that
  has no mine
- **THEN** the flag is highlighted as a mistake and the board is not saved

### Requirement: A board loads only if the game's own solver solves it

The engine SHALL refuse to load a description, whoever wrote it, when the
game's own solver does not solve its board. The verdict SHALL be part of
`loadDesc`. For a game with a difficulty contract, the board SHALL load
exactly when the contract's solver solves it at some cap, whatever tier its
params state; a tier named Unreasonable is a cap like any other. A board no
cap solves SHALL be refused with `DESC_NO_SINGLE_ANSWER` in a game that has a
tier named Unreasonable, and with `DESC_NOT_DEDUCIBLE` in a game that has
none. For a game without a difficulty contract, the board SHALL load unless
the game implements `finishesByDeduction` and that returns false for the
board's opening state, which is refused with `DESC_NOT_DEDUCIBLE`. Where a
save carries a private description, the midend SHALL ask the public one.

No game SHALL offer a parameter or a tier that switches its generator's checks
off: a board that needs trial and error is dealt only at a tier named
Unreasonable, and every board dealt has one solution.

#### Scenario: A board no tier solves

- **WHEN** a Pearl game ID names a board neither tier's rules finish
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE` under either tier's params,
  and nothing throws

#### Scenario: A board harder than its ID says

- **WHEN** a board that solves only at a tiered game's third cap is loaded under
  params stating its first tier
- **THEN** it loads

#### Scenario: A board with several solutions under an Unreasonable ID

- **WHEN** the board upstream's Dominosa dealt at its Ambiguous tier is loaded
  under params stating Unreasonable
- **THEN** it is refused with `DESC_NO_SINGLE_ANSWER`

#### Scenario: An untiered game's board that needs a guess

- **WHEN** a Mines game ID names a layout and first click from which the
  numbers do not determine every square
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, as is a save of that board

#### Scenario: A game ID upstream wrote with its checks on

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states
- **THEN** it loads, unless the fixture records that upstream's own solver
  found several answers on it, and a fixture naming an option that switches a
  generator's checks off names it at the value that leaves them on

### Requirement: A game declares its rulesets with rulesetItem

A game whose params choose between different puzzles on the same board SHALL declare them with `rulesetItem(rulesets, field)` in its `paramConfig` (`engine/ruleset.ts`), each ruleset a `name` and the `rule` that sets it apart. The item SHALL be a `"choices"` field with the keyword `ruleset`, labeled "Game mode" in every game, offering each ruleset by its name. No label slot SHALL put a word in front of a params label: only a declared ruleset does.

From the declaration the engine SHALL build the name in front of a params label and the sections of the preset menu. `presetMenu` SHALL place the presets of each ruleset in a section of their own, titled with the ruleset's name and ordered as declared, keeping each ruleset's presets in the order the game wrote them. A game with rulesets SHALL list its presets flat, and a menu whose presets all hold one ruleset SHALL stay flat.

Three games spelled this field three ways, and two of them interleaved two puzzles' boards in one list.

#### Scenario: A game gains a ruleset

- **WHEN** a game adds an entry to the list it passes `rulesetItem`
- **THEN** the Custom dialog offers it, a params label holding it starts with
  its name, and its presets get a section of the Type menu

#### Scenario: Presets of two rulesets are written interleaved

- **WHEN** a game's flat preset list alternates between two rulesets
- **THEN** its Type menu shows one section per ruleset, each holding only that
  ruleset's presets

#### Scenario: A ruleset game writes a section of its own

- **WHEN** a game with rulesets returns a preset menu containing a submenu
- **THEN** `presetMenu` throws

#### Scenario: A field asks to lead a label

- **WHEN** a `paramConfig` item declares the label slot `lead`
- **THEN** the typechecker refuses it

### Requirement: A game declares its rule modifiers with modifierItem

A params field that adds, removes or bounds one rule of the game, and that holds together with the game's other such fields, SHALL be declared with `modifierItem` in `paramConfig` (`engine/modifier.ts`): the value at which its rule applies, the words a params label says for a board the rule applies to, and the rule as a sentence. From the declaration the engine SHALL build the field's entry in the help's Parameters section, stating the value the rule applies at, and the field's label words, said exactly when the rule applies.

Fields of one game that cannot all be set together are not modifiers: they SHALL be one ruleset field. Whether a game's candidates combine SHALL be settled by dealing a board for every combination of them.

Each game had written these as ordinary fields, with a doc, label words and help prose composed separately, and two games' rules were stated only in the Parameters section.

#### Scenario: A modifier's rule applies

- **WHEN** a params label is composed for a board at the value a checkbox
  modifier's rule applies
- **THEN** the label carries the modifier's words, and at the other value it
  does not

#### Scenario: A rule is reworded

- **WHEN** a game changes a modifier's `rule`
- **THEN** the field's entry in the Parameters section and its line of the
  page's list of modifiers both say the new words

#### Scenario: Two candidates exclude each other

- **WHEN** some combination of a game's candidate fields is refused or cannot
  be dealt
- **THEN** those fields are declared as rulesets and not as modifiers

### Requirement: The preset menu is a grid

A game's preset menu SHALL list its boards in the game's order, each at the tiers it is offered at, and after them one board for each thing that is neither a size nor a tier. The engine SHALL provide `presetGrid(paramConfig, boards, opts)` to build that menu from the boards a game names, and `preset-menu-shape.test.ts` SHALL hold every registered game's menu to the shape below, read off the menu itself.

- A whole menu SHALL hold at most `MENU_LINES` (eighteen) lines, whatever its sections, unless the test's ledger names the game and what fills its menu; the ledger SHALL be exact.
- A section SHALL hold at most `MENU_SECTION_LINES` (twelve) lines, except a section with one line for each choice of a kind of board.
- The lines of one board SHALL be consecutive and run from its first tier to its last with none left out.
- Every tier of a tiered game SHALL be on the menu in each of its rulesets, unless every board of that ruleset's menu refuses the tier, or the test's ledger gives the game's reason for leaving it off.
- A checkbox rule modifier SHALL apply on exactly one line of the menu, unless the test's ledger says the game offers it as a level of every size, in which case it SHALL apply on one line a size.
- A game whose params have a size SHALL offer at least three boards.

#### Scenario: A menu past twelve lines

- **WHEN** a game lists thirteen boards under one heading, and they are not one line for each kind of board
- **THEN** `preset-menu-shape.test.ts` fails, naming the game and the count

#### Scenario: A menu of many short sections

- **WHEN** a game's menu holds four sections of five lines each, and the ledger does not name the game
- **THEN** the test fails, as it does for a ledger entry whose game is back under the cap

#### Scenario: A board with a tier missing from its run

- **WHEN** a board is offered at Easy, Normal and Hard and not at Tricky, or its Hard line stands apart from its other lines
- **THEN** the test fails, naming the board and the tiers it is offered at

#### Scenario: A tier no line offers

- **WHEN** a tiered game's menu holds no board at one of its tiers, and some board of the menu would accept that tier
- **THEN** the test fails unless its ledger names the game and the tier, and it fails for a ledger entry the menu does offer

#### Scenario: A modifier on several lines

- **WHEN** a game's menu holds two boards with one checkbox modifier applied, or none
- **THEN** the test fails, naming the modifier by its words

#### Scenario: A game builds its menu from its boards

- **WHEN** a tiered game calls `presetGrid` with three boards and no options
- **THEN** its menu is those three boards, each at every tier of its difficulty item, easiest first

### Requirement: A ruleset declares what it offers of the other settings

A ruleset that does not take every value of another setting SHALL say so in its declaration (`Ruleset.only`, `engine/ruleset.ts`), by the setting's keyword: the choices it offers of a choices field, or the one value a checkbox has in it. A rule modifier that takes values of another setting away SHALL say so the same way (`modifierItem`'s `only`, `engine/modifier.ts`): a checkbox for the value at which its rule applies, a choice by the index of each choice that narrows. A setting left out is taken whole. A declaration that names no other field of the game, names one of the wrong kind, offers none of its choices, narrows a field that itself decides others, or leaves nothing of a field between two deciding fields SHALL throw wherever the declaration is read.

From the declaration the engine SHALL build three things (`engine/only.ts`), and no game SHALL write any of them:

- the refusal of a params set about to deal a board that holds a value the deciding field does not leave, in `paramsError`, naming the field by its dialog label, what it must be, and the ruleset by name or the modifier by its label and value. A board that arrives already written (a `:desc` game ID, a save) SHALL NOT be held to it;
- what the Custom dialog offers: while a deciding value is chosen, a choice it does not leave and a checkbox it fixes SHALL be disabled, a choices field left one choice SHALL be disabled whole, and each SHALL show a value it is offered. A field two deciding fields narrow SHALL offer what both leave. The form SHALL submit a narrowed field at the value it shows, and SHALL keep the value the player set, so that leaving the deciding value returns to it. A deciding field MAY be a choices field or a checkbox;
- a sentence in the narrowed field's entry of the help's Parameters section.

The engine SHALL also refuse a submission of the dialog's values that holds what a deciding field does not leave, with the same sentence, whether or not the game's params can hold the pair.

A limit on a typed number (an area, a size a tier needs) is not declared this way and stays in `validateParams`: a text field cannot show it before OK is pressed, so there is no second copy for a declaration to remove.

#### Scenario: A ruleset is chosen that fixes a setting the player had changed

- **WHEN** the player ticks a checkbox, then chooses a ruleset whose `only` holds that checkbox off, and presses OK
- **THEN** the checkbox is shown disabled and unticked, and the board is dealt with no refusal

#### Scenario: The player goes back to the first ruleset

- **WHEN** the player then chooses the first ruleset again, before pressing OK
- **THEN** the checkbox is enabled and ticked as they left it

#### Scenario: A game ID asks a ruleset for what it does not offer

- **WHEN** a `#seed` game ID names a ruleset and a tier that ruleset's `only` leaves out
- **THEN** it is refused with a sentence naming the field, the tiers it may be, and the ruleset

#### Scenario: A checkbox modifier takes the chosen tier away

- **WHEN** the player changes a checkbox to the value at which its modifier's `only` leaves out the tier that is chosen
- **THEN** that tier is disabled and the difficulty shows the nearest tier left, and changing the checkbox back returns the tier the player chose

#### Scenario: A form stops moving a narrowed field

- **WHEN** the function that moves a form's values to what is offered leaves a choice where the player put it, or ignores a deciding field that is a checkbox
- **THEN** `only.test.ts` fails for every game that declares an `only` of that kind
