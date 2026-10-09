# engine-params Specification

## Purpose
A game's params and the boards they describe: the declared fields the Custom
dialog, the validity check, the codec, the labels and the help are built from;
rulesets, modifiers and what one setting leaves of another; the shape of the
preset menu; which way round a board is dealt; the description in play; and
which game IDs and descriptions load, and what a refusal says.

## Requirements

### Requirement: The engine provides a shared dimension param parser

The engine SHALL provide `parseDimensions(s, start?)` in
`src/engine/params.ts`, returning `{ w, h, next }`: it reads a width, then an
optional `"x"` followed by a height, and falls back to a square (`h = w`) when
no `"x"` is present; `next` is the index of the first character after the
dimensions. A game whose `decodeParams` opens with a `WxH`-or-square prefix
SHALL use it and SHALL NOT parse the prefix itself, assigning `w` and `h` into
its own params fields and parsing any suffix from `next`.

#### Scenario: A rectangular param decodes

- **WHEN** a game calls `parseDimensions("10x7")`
- **THEN** it receives `{ w: 10, h: 7, next: 4 }`

#### Scenario: A bare square param decodes via the fallback

- **WHEN** a game calls `parseDimensions("4")` (no `"x"`)
- **THEN** it receives `{ w: 4, h: 4, next: 1 }`
- **AND** `parseDimensions("4x4m10")` yields `next` pointing at the `"m"`

### Requirement: The engine exposes each game's custom-params configuration UI

The `Game` interface SHALL define a declarative `paramConfig` from which the
app's "Custom type…" dialog is built: an ordered list of field descriptors
over the game's `Params`. A shared width/height helper SHALL supply the
dimension fields, so a plain width-by-height game declares them in one line.

#### Scenario: A width/height game's custom dialog is populated

- **WHEN** the "Custom type…" dialog is opened for a game that declares
  `paramConfig` (for example width and height)
- **THEN** the form shows a field per descriptor, initialized from the current
  params

### Requirement: The midend builds the Custom form from paramConfig and applies it

The `Midend` SHALL build the app's `ConfigDescription` and initial
`ConfigValues` from `paramConfig` and the current params. It SHALL apply a
submitted form by mapping the values onto a copy of the params and checking
them with `paramsError`: on success it adopts the new params, so the app
generates a new game at them, and on failure it returns the refusal and
applies nothing. For a game with no `paramConfig` the form SHALL be empty.

#### Scenario: Valid values are applied

- **WHEN** the dialog submits values that pass `paramsError`
- **THEN** a new game is generated at those params

#### Scenario: An invalid custom value is rejected with the game's message

- **WHEN** the submitted values fail the game's `validateParams`
- **THEN** the engine returns the refusal and does not change the current
  params

#### Scenario: A game without paramConfig has an empty form

- **WHEN** a game declares no `paramConfig`
- **THEN** its form has no fields and a submission changes nothing

### Requirement: No game ships an empty custom-params dialog

The app offers "Custom type…" for every game, so every registered game SHALL
declare a non-empty `paramConfig`, and a check SHALL assert it across the
registry. A preset-only game SHALL be a deliberate decision about what its
menu says, never an omission.

#### Scenario: A game with no custom-params form is reported

- **WHEN** a registered game declares no `paramConfig`, or an empty one
- **THEN** the check reports it by name, and does not skip it

### Requirement: A game can supersede its game description mid-play

The engine SHALL let a game whose board is not settled until play begins say
which description names the board a state is on, through
`Game.supersededDesc`, without games holding a midend back-reference and
without `executeMove` losing purity. The answer SHALL be a function of the
state alone, and `null` SHALL mean the description the board started from.

#### Scenario: A board not settled yet

- **WHEN** Mines' `supersededDesc` is asked of a state before the first click
- **THEN** it returns `null`, and the game ID names the description the board
  started from

### Requirement: The description in play follows the position

The midend SHALL ask `supersededDesc` of the state in play, and SHALL emit its
id-change notification whenever a step, forward or back, moves the board onto
another description, so that the shareable game ID always names the board on
screen. Undoing past the move that settled the board SHALL return the starting
description.

#### Scenario: Mines' first click generates the real layout

- **WHEN** a game's first move lays out the actual board
- **THEN** the id-change notification fires, and the shareable game ID names
  the real board

#### Scenario: Undoing the settling move

- **WHEN** the player undoes the move that settled the board
- **THEN** the id-change notification fires with the description the board
  started from
- **AND** Redo fires it again with the settled board's

### Requirement: Restart enters the board the description in play opens

Restart SHALL enter the board the description in play opens, which for a
settled board is not the state its history began from.

#### Scenario: Restart after supersession

- **WHEN** the player restarts on a board whose description was superseded
- **THEN** the game restarts as the superseded description opens, not on the
  placeholder the board started from

### Requirement: A save carries the description in play and the one the board started from

A save SHALL carry the description in play and, beside it as its private
description, the one the board started from wherever the two differ. Restoring
SHALL build the first state from the private description when there is one and
replay the move log onto it, and SHALL ask the description in play, not the
private one, whether its board can be finished. The move that settles a board
SHALL carry what it settled, so that a replay derives nothing again.

#### Scenario: Save and restore mid-game

- **WHEN** the player saves after supersession and later restores
- **THEN** the restored game is built from the description the board started
  from, replays cleanly to the saved position, and names the settled board

#### Scenario: A replay settles nothing again

- **WHEN** a save's settling move carries a board other than the one the game
  would settle today
- **THEN** the restored game is on the board the move carries

### Requirement: Param validation distinguishes generating a board from loading one

The midend SHALL pass `full: true` to `paramsError`, and through it to
`Game.validateParams`, only when the params are about to generate a board, and
`full: false` when a description is already in hand. A `<params>#<seed>` game
ID regenerates and SHALL be checked with `full: true`; a `<params>:<desc>` game
ID carries its finished board and SHALL be checked with `full: false`, so a
bound only generation is subject to never retires a game ID shared before the
bound existed.

#### Scenario: A generation-only bound refuses the seed form

- **WHEN** a `<params>#<seed>` id names params outside a game's
  generation-only bound
- **THEN** the midend refuses it with the game's reason, because the board
  would have to be generated

#### Scenario: A generation-only bound does not refuse the descriptive form

- **WHEN** a `<params>:<desc>` id names the same params, with its description
  present
- **THEN** the midend accepts it and the board loads, because nothing is
  generated

#### Scenario: A bound that is not generation-only still applies to both

- **WHEN** params fail a check the game applies regardless of `full`
- **THEN** the midend refuses them on the descriptive form as well as the
  seed form

### Requirement: A generation-only bound is gated on full

A game SHALL express a bound that holds only when generating, such as a size
whose generator succeeds too rarely to wait for or a difficulty that produces
no distinct boards, by gating it on `full` in its `validateParams`. The engine
SHALL NOT make that gate vacuous by passing a constant. A generation-only
limit SHALL NOT move into `bounds`, because a bound applies whatever the `full`
flag says and would refuse a description-carrying game ID that loads today.

#### Scenario: A size only generation refuses

- **WHEN** a game refuses a size only because its generator cannot deal it
- **THEN** the refusal is in `validateParams` behind `full`, the field's
  `bounds` admit the size, and a `<params>:<desc>` id at that size loads

### Requirement: Params validity is the engine's check

Whether params can be played SHALL be decided by the engine's
`paramsError(game, p, full)`: each item's `bounds`, each choice inside its
list, then the game's own `validateParams`, which is optional and holds only
what the items cannot state: a limit depending on another field, or one that
applies only when generating. The midend, and every test asking whether params
are valid, SHALL call it. A bound's refusal SHALL name the field by the label
its Custom dialog shows.

#### Scenario: A value outside its range

- **WHEN** the Custom dialog submits a width below its declared minimum
- **THEN** the engine refuses it with "Width must be at least N.", and the
  game's own `validateParams` is not asked

#### Scenario: A choice outside its list

- **WHEN** a decoded game ID carries a difficulty index past the tier list
- **THEN** the engine refuses it, naming the field and its choices

### Requirement: A rule that a game rejects params is met by the engine's check

Where a requirement elsewhere in the specs says a game's `validateParams`
SHALL reject some params, that requirement SHALL be read as met by
`paramsError`, whether the refusal comes from an item's `bounds`, from a
choice's list or from the game's own `validateParams`.

#### Scenario: A minimum width a game's spec states

- **WHEN** a game's spec says its `validateParams` rejects a width below a
  minimum, and the game declares that minimum as the width item's `bounds`
- **THEN** the requirement is met, because `paramsError` refuses the width

### Requirement: A params refusal is a sentence

Every refusal `paramsError` returns SHALL be one sentence with its full stop:
the bounds and choice messages it generates, and every string a game's
`validateParams` can return. The Custom dialog and the Enter Game ID dialog
SHALL show a refusal as it comes, adding no punctuation of their own. Which
refusals a game has SHALL stay the game's own; only the form is the
collection's, and a guard SHALL read, and fail where it cannot read, every string a `validateParams` can
return.

#### Scenario: A game's refusal reaches the Enter Game ID dialog

- **WHEN** a player opens a game ID whose params the game refuses
- **THEN** the dialog shows the game's sentence after "That game won’t open.",
  with the full stop the game wrote

#### Scenario: A fragment is refused at commit

- **WHEN** a game's `validateParams` returns "Too many mines for grid size"
- **THEN** the guard fails, naming the file and line

### Requirement: A game declares its params encoding once, and both codec halves are derived

A game whose params encoding fits the collection's grammar SHALL declare it as
an ordered list of segments and obtain `encodeParams` and `decodeParams` from
`paramsCodec` in `engine/params-codec.ts`, and SHALL NOT hand-write two
functions that must be exact inverses of each other.

#### Scenario: A declared codec round-trips

- **WHEN** a game declares its encoding as a segment list
- **THEN** `decodeParams(encodeParams(p, true))` re-encodes to the same string,
  for every params object the game can reach

### Requirement: The codec grammar is a prefix, tagged segments, flags and letters

The grammar of a declared codec SHALL be a `dims` prefix (`WxH`, with the
square fallback when decoding) or a `size` (one untagged leading integer),
followed by tagged segments, `num` (`n12`) and `choice` (a tag plus one letter
from a table), bare `flag` letters, and `letters`, a choices field written as
one bare letter per choice (Salad's `L` and `B`, Seismic's `T` or nothing).

#### Scenario: A square board's params

- **WHEN** a codec with a `dims` prefix decodes `9`
- **THEN** the width and the height are both 9
- **AND** encoding those params writes `9x9`

### Requirement: A codec segment names a paramConfig field by its kw

A segment SHALL name a `paramConfig` field by its `kw` and reuse its `get` and
`set`, so a field cannot be in the Custom dialog and dropped from the game ID,
or the reverse, and a field's stored representation stays the game's own. A
segment naming a `kw` no item declares SHALL throw. An integer that is not a
text field's value, a choices field written as its stored number (Bridges'
`i30`) or a field the dialog does not offer, SHALL be encoded by a `num` given
an accessor pair, not a `kw`.

#### Scenario: A choices field written as its stored number

- **WHEN** a game ID writes a choices field as the number the game stores
- **THEN** its segment is a `num` given an accessor pair, and the Custom dialog
  still offers the field as choices

#### Scenario: A segment naming an undeclared field is refused

- **WHEN** a segment names a `kw` that the game's `paramConfig` does not
  declare
- **THEN** building the codec throws, naming the missing `kw`

### Requirement: A params encoding the grammar does not fit stays hand-written

A game whose encoding the segment grammar cannot express SHALL keep a
hand-written codec, which SHALL remain first-class and not be treated as debt.
The grammar does not express a float-valued param, a leading letter before the
dimensions, a field mapped to multi-character strings with defaults omitted,
tail letters accepted in any order, or a boolean encoded as an integer. The
grammar SHALL NOT grow an option to absorb a single game: an option SHALL
serve several games, as `whenAbsent` does.

#### Scenario: A bespoke codec is held to the same guarantee

- **WHEN** a game keeps a hand-written codec
- **THEN** its encodings are asserted by the same byte-stability guard as every
  declared one, so the two shapes differ in how they are written and not in
  what is promised

### Requirement: The engine provides the two desc value alphabets

The engine SHALL provide, in `src/engine/desc-alphabet.ts`, two frozen value
alphabets: `n2c`/`c2n` over `0`–`9`, `a`–`z`, `A`–`Z` (62 values), for a desc
in which every character is a value, and `n2cUpper`/`c2nUpper` over `0`–`9`,
`A`–`Z` (36 values), for a run-length desc, which has spent the lowercase
letters on blank runs. Neither order SHALL change, because both are baked into
shipped game IDs.

#### Scenario: The two alphabets agree where they overlap and nowhere else

- **WHEN** a digit `0`–`9` is written through either alphabet
- **THEN** both write the same character
- **AND** `c2nUpper("a")` is `null` while `c2n("a")` is `10`

### Requirement: An alphabet's writer throws and its reader returns null

Each writer of a desc value alphabet SHALL throw on a value it cannot write
and SHALL NOT walk into punctuation. Each reader SHALL return `null` for a
character outside its alphabet, a lowercase letter included for the run-length
alphabet. A game whose desc writes a value
above nine SHALL use the alphabet its grammar implies and SHALL keep its own
bound beside the call.

#### Scenario: A run-length desc writes and reads a value above nine

- **WHEN** Loopy encodes a clue of 12 and Bridges an island of 16
- **THEN** the desc carries `C` and `G` respectively, `c2nUpper` reads them
  back, and Bridges' own parse still rejects `H`

### Requirement: Choosing params changes the next board, not the one on screen

The midend SHALL keep the params of the board on screen apart from the params
the next new game is dealt at. `setParams` and `setCustomParams` SHALL change
only the latter. The save envelope, a restart, the emitted game ids, the
hint's tier check, the requested keys and the computed size SHALL read the
params of the board on screen, which SHALL change only when a board is
started, because the app sets the params and then deals.

#### Scenario: A save taken between choosing a type and dealing keeps the board's tier

- **WHEN** a board is on screen, params at a different tier are set, and the
  game is saved before a new game is dealt
- **THEN** the save records the tier of the board on screen
- **AND** the next new game is dealt at the params that were set

### Requirement: Every default and preset draws no wider than tall

Every registered game's default params and every preset leaf SHALL draw no
wider than tall (within 2%), judged by the game's own `computeSize` and never
by its params' field names, because a phone held upright is the main way the
app is played. A board whose shape is the puzzle's own SHALL be recorded, with
its reason, in a ledger the guard holds exactly right, so an entry nothing
needs also fails.

#### Scenario: A landscape preset is refused

- **WHEN** a game offers a preset whose `computeSize` is wider than tall by
  more than 2%
- **AND** the ledger does not name that game and encoding
- **THEN** the guard fails, naming it

#### Scenario: A board wide by nature is excused by name

- **WHEN** Cube's non-cube solids or Ascent's hexagon mode draw wider than tall
- **THEN** the guard accepts them because the ledger names each with its reason

### Requirement: A game may turn its params, says why not, or is a draft

A game turns its board by declaring `transposeParams(p)`, which SHALL return
the same board turned on its side (width and height exchanged, together with
anything laid out on the grid) or `null` for params that cannot turn.
`transposeParams` SHALL be a contract section: a game that leaves it out SHALL
give the reason in `notApplicable`, that a tall board of it is a different
game or that the board is the same shape either way round, or be a draft.

#### Scenario: A game that neither turns nor says why is a draft

- **WHEN** a game declares no `transposeParams` and gives no `transposeParams`
  reason
- **THEN** it is a draft, and the catalog labels it so

### Requirement: A deal turns the chosen params when the turned board fits better

When a game declares `transposeParams`, the midend's `newGame(fitTo)` SHALL
deal the chosen params turned whenever the turned board draws at a strictly
larger tile size in `fitTo`, the board area, and the turned params are ones
the game deals; otherwise it SHALL deal them as chosen, so a square board and
a tie keep the chosen orientation. Without `fitTo`, the chosen params SHALL be
dealt as they stand.

#### Scenario: A portrait preset is dealt turned on a wide screen

- **WHEN** Magnets' 5×6 preset is chosen and a new game is dealt to fit a
  1200×700 area
- **THEN** the board on screen is 6×5
- **AND** `getParams` still reports 5×6, and a deal to fit a 390×640 area is
  5×6

#### Scenario: A game that cannot turn is dealt as chosen

- **WHEN** a Same Game board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen

#### Scenario: A size the game refuses is never turned to

- **WHEN** the turned params fail `paramsError` for a deal
- **THEN** the board is dealt as chosen, however wide the area

### Requirement: A turn is decided at deal time only

The decision to turn a board SHALL be made at deal time only. The params
chosen for the next game SHALL stay as chosen, so the next deal on a screen
held the other way round turns back, and a board started from an id, a save or
an autosave SHALL never be turned. The Custom dialog SHALL show the chosen
params turned the way the board on screen was dealt.

#### Scenario: A board loaded from an id is never turned

- **WHEN** a game id is loaded after a deal to fit a wide area
- **THEN** the board has exactly the id's params

### Requirement: Every transposeParams turns back exactly and exchanges the drawn size

Every `transposeParams` SHALL turn valid params into valid params, turn them
back exactly, and draw the turned board with its width and height exchanged,
checked on non-square boards built through the game's own width item. A game
that draws something along one side only SHALL be named in the guard's ledger
of uneven frames and is not held to the last of the three. A game whose reason
for not turning is that its grid is square (`SQUARE_GRID`) SHALL draw every
default and preset board square.

#### Scenario: A square-grid reason is held to the drawn board

- **WHEN** a game gives `SQUARE_GRID` as its reason and a preset of it draws
  wider than tall
- **THEN** the guard fails, naming the game and the preset

### Requirement: A params field declares what it means, its range and its words

Every `paramConfig` item SHALL carry a `doc` saying what the field means, as
the help's Parameters section states it; an item documented together with the
one before it (Height with Width) SHALL say so with `{ with: kw }` naming that
item. A choices field's `doc` SHALL name each of its word choices. A numeric
text field SHALL declare its unconditional range as `bounds`. A field whose
words a params label says SHALL declare a `label` saying which slot of the
label they fill.

#### Scenario: A field without a doc

- **WHEN** a registered game declares an item with an empty `doc`, or a
  `{ with }` doc not naming the item before it
- **THEN** the guard fails, naming the game and the field

#### Scenario: A mode the help never names

- **WHEN** a choices field offers a word its doc does not mention
- **THEN** the guard fails, listing the missing words

### Requirement: The paramConfig item is the one place a field's facts are read from

The Custom dialog, the preset titles, the type header, the bounds check and
the help SHALL each consume a field's meaning, range and label words from its
`paramConfig` item, and none SHALL keep a copy of its own.

#### Scenario: A field's minimum is changed

- **WHEN** a game changes the `bounds` of a width item
- **THEN** the refusal the Custom dialog shows and the range the help states
  both say the new minimum

### Requirement: A tiered game declares its difficulty field with difficultyItem

A tiered game SHALL declare its difficulty field with the engine's
`difficultyItem(tiers, field)` and SHALL NOT write the item itself, and the
tier accessors `tierOf(game, p)` and `withTier(game, p, tier)` SHALL be derived
from that item.

#### Scenario: A tiered game writes its own difficulty item

- **WHEN** a game's difficulty field is not labeled as the tier slot the
  engine's item fills
- **THEN** the guard fails, so the field is built by `difficultyItem` and the
  accessors read the one declaration

### Requirement: One describer labels every params set

A set of params SHALL be named for a player by one engine function,
`describeParams(game, p)`, composing the items' label words in the order
`[ruleset: ]size[ kind…][ tier][, tail…]`, the ruleset being the name of the
game's declared ruleset when it has them. The slot order SHALL be the same in
every game, and the words SHALL be each game's own. The preset menu's titles,
the type header of a board matching no preset, and every test reading a title
SHALL go through it.

#### Scenario: A tier renders as its declared name

- **WHEN** a label is composed for params at any tier of any tiered game
- **THEN** the text contains that tier's declared name

#### Scenario: The menu and the header name one board one way

- **WHEN** a player opens a preset, and later reaches the same params through
  the Custom dialog
- **THEN** the type header reads the same both times, because both are the one
  label

### Requirement: A preset leaf carries a label and a title

A preset leaf is its params, and its name is their label. A leaf of
`presetMenu(game)` SHALL carry that name as its `label`, and the menu's line
as its `title`. The two SHALL be the same except under a ruleset's heading,
where the title SHALL be the label without the ruleset's name. The type header
of a board dealt from a preset SHALL read the label.

#### Scenario: A line under a ruleset's heading

- **WHEN** a game's presets hold more than one ruleset
- **THEN** each line under a ruleset's heading reads as its label without that
  ruleset's name, and the header of a board dealt from it reads the whole label

#### Scenario: A menu of one ruleset

- **WHEN** every preset of a game with rulesets belongs to one of them
- **THEN** the menu has no headings and each line reads as its whole label

### Requirement: A preset keeps a declared title only for a name no field says

A leaf SHALL keep a declared title only for a name upstream gave it that no
field says (Guess's "Standard"), and that title SHALL then be its label and
its line. Such a name SHALL differ from the label its params compose, no two
presets of a game SHALL share a label, and no two lines under one heading
SHALL read the same.

#### Scenario: Two presets read the same

- **WHEN** two leaves of a game's preset menu get one label, or a named leaf's
  title is the label its params compose
- **THEN** the guard fails, naming the game and the title

### Requirement: The preset menu is a grid

A game's preset menu SHALL list its boards in the game's order, each at the
tiers it is offered at, and after them one board for each thing that is
neither a size nor a tier. The engine SHALL provide
`presetGrid(paramConfig, boards, opts)` to build that menu from the boards a
game names, and a guard SHALL hold every registered game's menu to this shape,
read off the menu itself. A game whose params have a size SHALL offer at least
three boards.

#### Scenario: A game builds its menu from its boards

- **WHEN** a tiered game calls `presetGrid` with three boards and no options
- **THEN** its menu is those three boards, each at every tier of its difficulty
  item, easiest first

### Requirement: A preset menu is short enough to choose from

A whole menu SHALL hold at most `MENU_LINES` (eighteen) lines, whatever its
sections, in every game. A section SHALL hold at most `MENU_SECTION_LINES`
(twelve) lines, except a section with one line for each choice of a kind of
board.

#### Scenario: A menu past twelve lines

- **WHEN** a game lists thirteen boards under one heading, and they are not one
  line for each kind of board
- **THEN** the guard fails, naming the game and the count

#### Scenario: A menu of many short sections

- **WHEN** a game's menu holds four sections of five lines each
- **THEN** the guard fails, naming the game

### Requirement: A board's tiers are one run of lines, and every tier is offered

The lines of one board SHALL be consecutive and run from its first tier to its
last with none left out. Every tier of a tiered game SHALL be on the menu in
each of its rulesets, unless every board of that ruleset's menu refuses the
tier, or the guard's ledger gives the game's reason for leaving it off.

#### Scenario: A board with a tier missing from its run

- **WHEN** a board is offered at Easy, Normal and Hard and not at Tricky, or
  its Hard line stands apart from its other lines
- **THEN** the guard fails, naming the board and the tiers it is offered at

#### Scenario: A tier no line offers

- **WHEN** a tiered game's menu holds no board at one of its tiers, and some
  board of the menu would accept that tier
- **THEN** the guard fails unless its ledger names the game and the tier, and
  it fails for a ledger entry the menu does offer

### Requirement: A checkbox rule modifier has one line of the menu

A checkbox rule modifier SHALL apply on exactly one line of the menu, unless
the guard's ledger says the game offers it as a level of every size, in which
case it SHALL apply on one line a size.

#### Scenario: A modifier on several lines

- **WHEN** a game's menu holds two boards with one checkbox modifier applied,
  or none
- **THEN** the guard fails, naming the modifier by its words

### Requirement: A game declares its rulesets with rulesetItem

A game whose params choose between different puzzles on the same board SHALL
declare them with `rulesetItem(rulesets, field)` in its `paramConfig`
(`engine/ruleset.ts`), each ruleset a `name` and the `rule` that sets it apart.
The item SHALL be a `"choices"` field with the keyword `ruleset`, labeled
"Game mode" in every game, offering each ruleset by its name. No label slot
SHALL put a word in front of a params label: only a declared ruleset does.

#### Scenario: A game gains a ruleset

- **WHEN** a game adds an entry to the list it passes `rulesetItem`
- **THEN** the Custom dialog offers it, a params label holding it starts with
  its name, and its presets get a section of the Type menu

#### Scenario: A field asks to lead a label

- **WHEN** a `paramConfig` item declares the label slot `lead`
- **THEN** the typechecker refuses it

### Requirement: The preset menu gives each ruleset a section

From a game's ruleset declaration the engine SHALL build the name in front of
a params label and the sections of the preset menu. `presetMenu` SHALL place
the presets of each ruleset in a section of their own, titled with the
ruleset's name and ordered as declared, keeping each ruleset's presets in the
order the game wrote them. A game with rulesets SHALL list its presets flat,
and a menu whose presets all hold one ruleset SHALL stay flat.

#### Scenario: Presets of two rulesets are written interleaved

- **WHEN** a game's flat preset list alternates between two rulesets
- **THEN** its Type menu shows one section per ruleset, each holding only that
  ruleset's presets

#### Scenario: A ruleset game writes a section of its own

- **WHEN** a game with rulesets returns a preset menu containing a submenu
- **THEN** `presetMenu` throws

### Requirement: A game declares its rule modifiers with modifierItem

A params field that adds, removes or bounds one rule of the game, and that
holds together with the game's other such fields, SHALL be declared with
`modifierItem` in `paramConfig` (`engine/modifier.ts`): the words a params
label says for a board the rule applies to, the rule as a sentence, and, for a
checkbox, the value at which its rule applies. A choices modifier bounds its
rule at every value, and SHALL declare label words of its own.

#### Scenario: A rule is reworded

- **WHEN** a game changes a modifier's `rule`
- **THEN** the field's entry in the Parameters section and its line of the
  page's list of modifiers both say the new words

### Requirement: The engine builds a modifier's help entry and label words

From a modifier's declaration the engine SHALL build the field's entry in the
help's Parameters section, which for a checkbox SHALL state the value the rule
applies at, and a checkbox's label words, said exactly when the rule applies
and left out where the declaration gives them no slot because another field's
words already say them.

#### Scenario: A modifier's rule applies

- **WHEN** a params label is composed for a board at the value a checkbox
  modifier's rule applies
- **THEN** the label carries the modifier's words, and at the other value it
  does not

### Requirement: Fields that cannot all be set together are one ruleset field

Fields of one game that cannot all be set together are not modifiers: they
SHALL be one ruleset field. Whether a game's candidates combine SHALL be
settled by dealing a board for every combination of them.

#### Scenario: Two candidates exclude each other

- **WHEN** some combination of a game's candidate fields is refused or cannot
  be dealt
- **THEN** those fields are declared as rulesets and not as modifiers

### Requirement: A ruleset declares what it offers of the other settings

A ruleset that does not take every value of another setting SHALL say so in
`Ruleset.only` (`engine/ruleset.ts`), by the setting's keyword: the choices it
offers of a choices field, or the one value a checkbox has in it. A rule
modifier that takes values of another setting away SHALL say so the same way
(`modifierItem`'s `only`, `engine/modifier.ts`): a checkbox for
the value at which its rule applies, a choice by the index of each choice that
narrows. A setting left out SHALL be taken whole.

#### Scenario: A ruleset names one setting

- **WHEN** a ruleset's `only` names the difficulty field and no other
- **THEN** every other setting of the game is offered whole in that ruleset

### Requirement: A declaration of what a setting leaves throws when it cannot hold

An `only` declaration that names no other field of the game, names one of the
wrong kind, offers none of its choices, narrows a field that itself decides
others, or leaves nothing of a field between two deciding fields SHALL throw
wherever the declaration is read.

#### Scenario: A declaration names a field the game does not have

- **WHEN** a ruleset's `only` names a keyword no item of the game's
  `paramConfig` has
- **THEN** reading the declaration throws

### Requirement: The engine refuses a deal that asks for what a deciding field does not leave

From an `only` declaration the engine SHALL build (`engine/only.ts`), and no
game SHALL write, the
refusal in `paramsError` of a params set about to deal a board that holds a
value the deciding field does not leave, naming the field by its dialog label,
what it must be, and the ruleset by name or the modifier by its label and
value. A board that arrives already written (a `:desc` game ID, a save) SHALL
NOT be held to it.

#### Scenario: A game ID asks a ruleset for what it does not offer

- **WHEN** a `#seed` game ID names a ruleset and a tier that ruleset's `only`
  leaves out
- **THEN** it is refused with a sentence naming the field, the tiers it may be,
  and the ruleset

### Requirement: The engine refuses a submitted form that holds what a deciding field does not leave

The engine SHALL refuse a submission of the Custom dialog's values that holds
what a deciding field does not leave, with the same sentence as the params
refusal, whether or not the game's params can hold the pair.

#### Scenario: A pair the game's params cannot hold

- **WHEN** a form is submitted with a ruleset and a value its `only` leaves
  out, in a game that stores both fields in one param
- **THEN** the submission is refused with the sentence a deal at that pair
  would be refused with

### Requirement: The Custom dialog offers only what the deciding fields leave

From an `only` declaration the engine SHALL build, and no game SHALL write,
what the Custom dialog offers: while a deciding value is chosen, a choice it
does not leave and a checkbox it fixes SHALL be disabled, a choices field left
one choice SHALL be disabled whole, and each SHALL show a value it is offered.
A field two deciding fields narrow SHALL offer what both leave. The engine
SHALL take a choices field or a checkbox as a deciding field.

#### Scenario: A ruleset is chosen that fixes a setting the player had changed

- **WHEN** the player ticks a checkbox, then chooses a ruleset whose `only`
  holds that checkbox off, and presses OK
- **THEN** the checkbox is shown disabled and unticked, and the board is dealt
  with no refusal

### Requirement: A narrowed field keeps the value the player set

While a deciding value narrows a field, the Custom form SHALL submit the field
at the value it shows, and SHALL keep the value the player set, so that
leaving the deciding value returns to it.

#### Scenario: The player goes back to the first ruleset

- **WHEN** the player, having chosen a ruleset that holds a ticked checkbox
  off, chooses the first ruleset again before pressing OK
- **THEN** the checkbox is enabled and ticked as they left it

#### Scenario: A checkbox modifier takes the chosen tier away

- **WHEN** the player changes a checkbox to the value at which its modifier's
  `only` leaves out the tier that is chosen
- **THEN** that tier is disabled and the difficulty shows the nearest tier
  left, and changing the checkbox back returns the tier the player chose

#### Scenario: A form stops moving a narrowed field

- **WHEN** the function that moves a form's values to what is offered leaves a
  choice where the player put it, or ignores a deciding field that is a
  checkbox
- **THEN** the guard fails for every game that declares an `only` of that kind

### Requirement: A narrowed field's help entry says what is left of it

From an `only` declaration the engine SHALL build, and no game SHALL write, a
sentence in the narrowed field's entry of the help's Parameters section.

#### Scenario: A ruleset offers some tiers

- **WHEN** a ruleset's `only` leaves some of the difficulty field's tiers
- **THEN** the difficulty field's entry in the Parameters section says which
  tiers that ruleset offers

### Requirement: A limit on a typed number stays in validateParams

A limit on a typed number (an area, a size a tier needs) SHALL NOT be declared
with `only` and SHALL stay in the game's `validateParams`: a text field cannot
show it before OK is pressed, so there is no second copy for a declaration to
remove.

#### Scenario: A ruleset allows a smaller area

- **WHEN** one ruleset of a game allows a smaller board area than another
- **THEN** the game's `validateParams` refuses the larger area in that ruleset,
  and the Custom dialog disables nothing for it

### Requirement: A game ID that will not load says why in the collection's words

The engine's verdict on a description (`validateDesc(game, p, desc)`, derived
from the game's own parse) SHALL be a description error made by the engine's
description-error module: a kind, or a sentence about the puzzle's own rules
passed through the module's named escape. Its type SHALL admit no other
string.

#### Scenario: A truncated ID says it may have been cut off

- **WHEN** a player enters a game ID whose description ends early, in any game
- **THEN** the dialog says the ID is too short for its board and may have been
  cut off when it was copied

### Requirement: A description error kind says what went wrong for the player

A description error kind SHALL be one of: too short, too long, a number out of
range, a value repeated, clues that contradict each other, a layout this
puzzle's IDs do not have, none or several of a thing a board has exactly one
of, or a character that cannot appear, naming the character where the parser
has it.

#### Scenario: A bad character is named

- **WHEN** a description contains a character its game never writes
- **THEN** the message names that character

### Requirement: A game's own description sentence belongs to one game

A sentence passed through the description-error module's escape SHALL be used
by one game only, since a reason two games give is a situation the collection
has and SHALL be a kind. It SHALL NOT repeat a kind's words, and it SHALL be
one sentence about "this game ID". A guard SHALL assert these by reading every
call of the escape by its shape, in the games and the engine alike.

#### Scenario: A reason two games share becomes a kind

- **WHEN** two games pass the same sentence to the escape
- **THEN** the guard fails, naming the sentence and both games

### Requirement: A game reads its description once

Every game SHALL read its description with one parser returning a `DescParse`
(`engine/desc-error.ts`), and `newState` SHALL build from that parse's value
through `descValue`. A check that needs the parsed board (a count, a region, a
rule of the puzzle's own) SHALL run inside that parse. A parser SHALL accept
what the game's own encoder writes, and SHALL refuse what the grammar has no
place for and SHALL NOT skip it.

#### Scenario: A description the generator wrote

- **WHEN** a game's own generator writes a description for any preset the
  near-miss test reaches
- **THEN** the description loads

### Requirement: The engine derives a description's verdict from newState

A game SHALL declare no validator: the engine SHALL derive the verdict from
`newState` itself (`loadDesc`), taking the refusal `descValue` raises for a
failed parse as the verdict and letting any other throw propagate as a bug, so
the verdict and the board are one reading. The midend SHALL build state 0 from
the same load that judged a pasted or saved description.

#### Scenario: A save whose board no longer loads

- **WHEN** a player restores a save whose description the game's parser now
  refuses
- **THEN** the save is refused with the parse's reason, and nothing throws

### Requirement: The engine provides a cursor over a description

The engine SHALL provide a cursor over a description
(`engine/desc-reader.ts`) whose reads fail with the collection's `DescError`
kinds: a character or number missing because the description ended is too
short, one with another character in its place names that character, a number
outside the bounds its caller states is out of range, and text after the board
is too long. The cursor SHALL offer no way to read a number without bounds.

#### Scenario: A description that ends early

- **WHEN** a description ends where the cursor expected a separator or a
  number
- **THEN** the parse fails as too short, never as a bad character or as
  malformed

#### Scenario: A number too large for its board

- **WHEN** a description gives a number larger than its caller's bound,
  however many digits it has
- **THEN** the parse fails as out of range, and no value a typed array would
  wrap is stored

### Requirement: A pasted game ID is refused or opened, never thrown

Every game SHALL answer a description a player enters with a refusal or a
board that builds and draws; neither loading the description nor the first
`redraw` SHALL throw. A cross-game test SHALL hold this over two populations:
descriptions no generator writes, and near misses made by breaking each game's
real descriptions with one edit (truncated, a character dropped, doubled, or
replaced by a neighbor).

#### Scenario: A parse that accepts what its board cannot hold

- **WHEN** a game's parse accepts a near miss and its `newState` or first
  `redraw` then throws
- **THEN** the test fails, naming the game ID that threw

#### Scenario: Garbage is refused, not thrown

- **WHEN** any game is given an empty string, punctuation, or an overlong run
  of one character as its description
- **THEN** nothing throws, and the game refuses at least one of them

### Requirement: A board with a mistake check loads only with exactly one answer

The engine SHALL refuse to load a description, whoever wrote it, when the game
implements `findMistakes` and the game's own `solve`, asked about the board it
builds, proves the board has more than one solution (refused with
`DESC_NOT_UNIQUE`) or none (refused with `DESC_CONTRADICTORY`). The verdict
SHALL be part of `loadDesc`, so a pasted game ID, a shared link and a save are
judged alike. A solver that gives up without proving either SHALL leave this
verdict passing.

#### Scenario: A game ID with two answers

- **WHEN** a player opens a Black Box game ID whose lasers allow two layouts
- **THEN** it is refused with `DESC_NOT_UNIQUE`, and nothing throws

#### Scenario: A game ID upstream's generator wrote

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states, every field of which is placed or known to describe the
  fixture
- **THEN** it loads

### Requirement: A board loads only if the game's own solver solves it

The engine SHALL refuse to load a description, whoever wrote it, when the
game's own solver does not solve its board, and the verdict SHALL be part of
`loadDesc`. For a game with a difficulty contract, the board SHALL load exactly
when the contract's solver solves it at some cap, whatever tier its params
state; a tier named Unreasonable is a cap like any other. Where a save carries
a private description, the midend SHALL ask the public one.

#### Scenario: A board harder than its ID says

- **WHEN** a board that solves only at a tiered game's third cap is loaded
  under params stating its first tier
- **THEN** it loads

### Requirement: A board no cap solves is refused in the words its game's tiers allow

A board of a game with a difficulty contract that no cap solves SHALL be
refused with `DESC_NO_SINGLE_ANSWER` in a game that has a tier named
Unreasonable, and with `DESC_NOT_DEDUCIBLE` in a game that has none.

#### Scenario: A board no tier solves

- **WHEN** a Pearl game ID names a board neither tier's rules finish
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE` under either tier's params,
  and nothing throws

#### Scenario: A board with several solutions under an Unreasonable ID

- **WHEN** the board upstream's Dominosa dealt at its Ambiguous tier is loaded
  under params stating Unreasonable
- **THEN** it is refused with `DESC_NO_SINGLE_ANSWER`

### Requirement: An untiered game's board loads unless finishesByDeduction refuses it

For a game without a difficulty contract, a description SHALL load unless the
game implements `finishesByDeduction` and that returns false for the board's
opening state, which SHALL be refused with `DESC_NOT_DEDUCIBLE`.

#### Scenario: An untiered game's board that needs a guess

- **WHEN** a Mines game ID names a layout and first click from which the
  numbers do not determine every square
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, as is a save of that board

### Requirement: Encoded params are byte-stable, and the guard is derived

A game's params encoding appears inside every shared game ID, so it SHALL be
held byte-stable by an assertion rather than by policy alone, and the corpus
that assertion runs over SHALL be derived from each game's own declarations
rather than authored. The corpus SHALL carry a vacuity guard on both the
number of games and the number of cases.

#### Scenario: A changed encoding is reported before it ships

- **WHEN** a change alters the string any game encodes for reachable params
- **THEN** the byte-stability snapshot fails, naming the game and the case

#### Scenario: The guard cannot pass over an empty corpus

- **WHEN** the registry is unpopulated, or a game contributes no cases
- **THEN** the vacuity guard fails rather than every downstream assertion
  passing over nothing

### Requirement: Encode and decode are mutual inverses over the corpus

Encode and decode SHALL be mutual inverses for every case in the corpus,
compared through the encoded string. This SHALL be asserted as a property and
not a fixture, for every registered game with no exemption roster: it survives
a preset being added and cannot be re-baselined.

#### Scenario: A codec that stops being invertible is reported

- **WHEN** a decoder stops recovering a field its encoder writes
- **THEN** the mutual-inverse assertion fails for that game, independently of
  the snapshot

### Requirement: The recorded params encodings do not move

The recorded encodings SHALL NOT move, held as a per-game snapshot.
Re-baselining the snapshot is a compatibility decision that SHALL go to the
owner beforehand with the cost stated, and SHALL NOT be applied as a
formatting fix with `vitest -u`.

#### Scenario: A change would move a recorded encoding

- **WHEN** a change makes a game encode a recorded case as a different string
- **THEN** the snapshot is not re-baselined until the owner has agreed to the
  break with its cost stated

### Requirement: A preset title that names a difficulty names its own tier

A preset title that uses one of the collection's difficulty words SHALL use the
word for that preset's own tier, and SHALL derive it from the game's tier list
rather than restate it. A title that names no difficulty is permitted.

#### Scenario: A preset named for something else

- **WHEN** a preset's title names a symbol range or a mode and no difficulty,
  as Salad's and Solo's Killer preset do
- **THEN** it passes, with no exemption list
