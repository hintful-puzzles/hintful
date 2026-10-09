# Ledger: engine-params

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The engine provides a shared dimension param parser

| Rule | Where it went |
| --- | --- |
| The engine provides `parseDimensions` in `src/engine/params.ts`, with the square fallback and `next` | spec: The engine provides a shared dimension param parser |
| It is built on `parseLeadingInt` | held: src/engine/params.ts "parseLeadingInt(s, start)" |
| A game whose `decodeParams` opens with a dimension prefix uses it and does not parse the prefix itself, assigning into its own fields and continuing from `next` | spec: The engine provides a shared dimension param parser |
| The three ways a game re-implemented the parse | history |
| Scenario: a rectangular param decodes | spec: The engine provides a shared dimension param parser |
| Scenario: a bare square decodes, and a suffix is reached through `next` | spec: The engine provides a shared dimension param parser |
| The fallback fixed the decoders of Sixteen and Pegs | history |

## The engine exposes each game's custom-params configuration UI

| Rule | Where it went |
| --- | --- |
| `Game` defines a declarative `paramConfig`, an ordered list of descriptors with keyword, name, type and accessors | spec: The engine exposes each game's custom-params configuration UI |
| A shared width/height helper supplies the dimension fields | spec: The engine exposes each game's custom-params configuration UI |
| The form mirrors the per-game preferences surface | reason |
| The midend builds `ConfigDescription` and `ConfigValues` from `paramConfig` and the current params | spec: The midend builds the Custom form from paramConfig and applies it |
| A submission is mapped onto a copy, checked with `paramsError`, adopted on success and refused with the error unchanged on failure | spec: The midend builds the Custom form from paramConfig and applies it |
| The worker-side adapter forwards to the midend and returns no empty configuration of its own | spec: The worker-side adapter forwards the Custom form to the midend |
| A game with no `paramConfig` has an empty form | spec: The midend builds the Custom form from paramConfig and applies it |
| An empty dialog is correct for a preset-only game | spec: No game ships an empty custom-params dialog |
| Scenario: a width/height game's dialog is populated and applied | spec: The engine exposes each game's custom-params configuration UI; spec: The midend builds the Custom form from paramConfig and applies it |
| Scenario: an invalid custom value is rejected with the game's message | spec: The midend builds the Custom form from paramConfig and applies it |
| Scenario: a game without `paramConfig` keeps an empty dialog | spec: The midend builds the Custom form from paramConfig and applies it |

## A game can supersede its game description mid-play

| Rule | Where it went |
| --- | --- |
| A game says which description names a state's board through `Game.supersededDesc`, with no midend back-reference and a pure `executeMove` | spec: A game can supersede its game description mid-play |
| The answer is a function of the state alone, and `null` means the starting description | spec: A game can supersede its game description mid-play |
| The hook is upstream's `midend_supersede_game_desc` | history |
| The midend asks the state in play and emits the id change on any step onto another description, and undoing past the settling move returns the starting description | spec: The description in play follows the position |
| Restart enters the board the description in play opens | spec: Restart enters the board the description in play opens |
| A save carries the description in play and the starting one as its private description, and restoring builds from the private one, replays, and asks the description in play whether the board can be finished | spec: A save carries the description in play and the one the board started from |
| The settling move carries what it settled | spec: A save carries the description in play and the one the board started from |
| Scenario: Mines' first click generates the real layout | spec: The description in play follows the position |
| Scenario: undoing the settling move | spec: The description in play follows the position |
| Scenario: restart after supersession | spec: Restart enters the board the description in play opens |
| Scenario: save and restore mid-game | spec: A save carries the description in play and the one the board started from |
| Scenario: a replay settles nothing again | spec: A save carries the description in play and the one the board started from |

## Param validation distinguishes generating a board from loading one

| Rule | Where it went |
| --- | --- |
| The midend passes `full: true` only when params are about to generate a board, so a seed id is checked with it and a descriptive id without | spec: Param validation distinguishes generating a board from loading one |
| A generation-only bound never retires a game ID shared before the bound existed | spec: Param validation distinguishes generating a board from loading one |
| This mirrors upstream's `validate_params(params, desc == NULL)` | history; held: src/engine/midend.ts "Upstream midend.c:1956 passes exactly" |
| A game may gate a generation-only bound on `full` | spec: A generation-only bound is gated on full |
| The engine does not make the gate vacuous by passing a constant | spec: A generation-only bound is gated on full |
| Scenario: a generation-only bound refuses the seed form | spec: Param validation distinguishes generating a board from loading one |
| Scenario: a generation-only bound does not refuse the descriptive form | spec: Param validation distinguishes generating a board from loading one |
| Scenario: a bound that is not generation-only applies to both | spec: Param validation distinguishes generating a board from loading one |

## No game ships an empty custom-params dialog

| Rule | Where it went |
| --- | --- |
| Every registered game declares a non-empty `paramConfig`, and a check asserts it across the registry | spec: No game ships an empty custom-params dialog |
| Sokoban shipped without one, hidden by a sweep that skipped it and a `canConfigure` flag answered `true` | history; guide: docs/games/mechanics.md § "The Custom dialog" |
| A preset-only game is a deliberate decision, not an omission | spec: No game ships an empty custom-params dialog |
| Scenario: a game with no form is reported by name and not skipped | spec: No game ships an empty custom-params dialog |

## A game declares its params encoding once, and both codec halves are derived

| Rule | Where it went |
| --- | --- |
| A game whose encoding fits the grammar declares segments and takes both halves from `paramsCodec` | spec: A game declares its params encoding once, and both codec halves are derived |
| The grammar's segments: `dims`, `size`, `num`, `choice`, `flag`, `letters` | spec: The codec grammar is a prefix, tagged segments, flags and letters |
| The options: `full`, `invalid`, `means`, `omitWhen`, `whenAbsent` | spec: The codec's options are the variations several games share |
| The grammar is what the 57 hand-written codecs spelled | figure |
| A segment names a `paramConfig` field by its `kw` and reuses its accessors, so a field cannot be in the dialog and out of the game ID | spec: A codec segment names a paramConfig field by its kw |
| A field's representation stays the game's own | spec: A codec segment names a paramConfig field by its kw |
| Three converted games store a tier as something other than an index | figure; guide: docs/games/mechanics.md § "Codecs and validation" |
| The form and the codec were two hand-synced copies | history |
| An integer that is not a text field's value is encoded by handing `num` an accessor pair | spec: A codec segment names a paramConfig field by its kw |
| A codec moves to declared only when the differential shows decoding and encoding identical | spec: A codec moves to declared only when it reads and writes the same |
| A segment naming an undeclared `kw` throws | spec: A segment naming an undeclared field throws |
| A silently skipped segment would drop a field from every game ID | reason; held: src/engine/params-codec.ts "silently skipped segment would drop the field from every game ID" |
| Scenario: a declared codec round-trips | spec: A game declares its params encoding once, and both codec halves are derived |
| Scenario: a segment naming an undeclared field is refused | spec: A segment naming an undeclared field throws |

## A params encoding the grammar does not fit stays hand-written

| Rule | Where it went |
| --- | --- |
| A game the grammar cannot express keeps a hand-written codec, which stays first-class | spec: A params encoding the grammar does not fit stays hand-written |
| The shapes the grammar does not express | spec: A params encoding the grammar does not fit stays hand-written |
| Which games have each shape, measured over all 57 games | figure; guide: docs/games/mechanics.md § "Codecs and validation" |
| The grammar does not grow an option to absorb one game, and an option serves several games | spec: A params encoding the grammar does not fit stays hand-written |
| A form escaped by more games than it serves is two ways plus a seam | reason; held: src/engine/params-codec.ts "two ways plus a seam" |
| Scenario: a bespoke codec is held to the same byte-stability guard | spec: A params encoding the grammar does not fit stays hand-written |

## The engine provides the two desc value alphabets

| Rule | Where it went |
| --- | --- |
| Two frozen alphabets in `src/engine/desc-alphabet.ts`, with their ranges and uses, whose orders never change | spec: The engine provides the two desc value alphabets |
| A writer throws on a value it cannot write, and a reader returns `null` outside its alphabet and says so in its type | spec: An alphabet's writer throws and its reader returns null |
| A game writing a value above nine uses the alphabet its grammar implies and keeps its own bound | spec: An alphabet's writer throws and its reader returns null |
| Scenario: a run-length desc writes and reads a value above nine | spec: An alphabet's writer throws and its reader returns null |
| Bridges' own `validateDesc` rejects `H` | untrue: a game declares no validator (`src/engine/desc-error.ts`, "a game writes no validator"), so the scenario now says Bridges' own parse rejects it |
| Scenario: the two alphabets agree where they overlap and nowhere else | spec: The engine provides the two desc value alphabets |

## Choosing params changes the next board, not the one on screen

| Rule | Where it went |
| --- | --- |
| The midend keeps the board's params apart from the next deal's, `setParams` and `setCustomParams` change only the latter, and the listed readers read the board's | spec: Choosing params changes the next board, not the one on screen |
| The board's params change only when a board is started | spec: Choosing params changes the next board, not the one on screen |
| The app sets the params and then deals, so a reader in between would record a tier the board was never dealt at | reason; held: src/engine/midend.ts "paired the old desc with the new difficulty" |
| Scenario: a save taken between choosing a type and dealing keeps the board's tier | spec: Choosing params changes the next board, not the one on screen |

## Every default and preset draws no wider than tall

| Rule | Where it went |
| --- | --- |
| Every default and preset leaf draws no wider than tall within 2%, judged by `computeSize` and never by field names | spec: Every default and preset draws no wider than tall |
| A board whose shape is the puzzle's own is in a ledger with its reason, held exactly | spec: Every default and preset draws no wider than tall |
| A phone held upright is the main way the app is played | spec: Every default and preset draws no wider than tall |
| A census of `w > h` counts a margin, a panel or a cell shape wrong | reason; guide: docs/games/mechanics.md § "Portrait boards, and turning them to fit" |
| Scenario: a landscape preset is refused | spec: Every default and preset draws no wider than tall |
| The guard is `orientation.test.ts` | held: src/engine/orientation.test.ts "draws no default or preset wider than tall, outside the ledger" |
| Scenario: a board wide by nature is excused by name | spec: Every default and preset draws no wider than tall |

## A params field declares what it means, its range and its words

| Rule | Where it went |
| --- | --- |
| Every item carries a `doc`, or `{ with: kw }` naming the item before it | spec: A params field declares what it means, its range and its words |
| A numeric text field declares its unconditional range as `bounds` | spec: A params field declares what it means, its range and its words |
| A field may declare a `label` saying which slot its words fill | spec: A params field declares what it means, its range and its words |
| The dialog, the preset titles, the type header, the bounds check and the help consume these from the item | spec: The paramConfig item is the one place a field's facts are read from |
| Each of them was keeping a copy | history |
| A choices field's `doc` names each of its word choices | spec: A params field declares what it means, its range and its words |
| Unequal's Adjacent was offered and never explained | history; guide: docs/games/mechanics.md § "Params are declared once, on `paramConfig`" |
| A tiered game declares its difficulty field with `difficultyItem`, and `tierOf` and `withTier` are derived from it | spec: A tiered game declares its difficulty field with difficultyItem |
| Scenario: a field without a doc | spec: A params field declares what it means, its range and its words |
| Scenario: a mode the help never names | spec: A params field declares what it means, its range and its words |
| Scenario: a tiered game writes its own difficulty item | spec: A tiered game declares its difficulty field with difficultyItem |
| The guard is `params-declared.test.ts` | held: src/engine/params-declared.test.ts "every paramConfig item says what it means" |

## One describer labels every params set

| Rule | Where it went |
| --- | --- |
| `describeParams(game, p)` names a params set, composing label words in the slot order, behind the ruleset's name | spec: One describer labels every params set |
| The preset titles, the header of a board matching no preset, and every test reading a title go through it | spec: One describer labels every params set |
| A preset leaf is its params and its name is their label | spec: A preset leaf carries a label and a title |
| A leaf carries its name as `label` and the menu's line as `title`, the same except under a ruleset's heading | spec: A preset leaf carries a label and a title |
| The type header of a board dealt from a preset reads the label | spec: A preset leaf carries a label and a title |
| A leaf may keep a declared title only for a name upstream gave it that no field says | spec: A preset keeps a declared title only for a name no field says |
| Such a name differs from the leaf's label, no two presets share a label, and no two lines under one heading read the same | spec: A preset keeps a declared title only for a name no field says |
| A named leaf's label is its composed params label, which its name must differ from | untrue: `presetMenu` gives a leaf with a declared title that title as its `label` (`src/engine/param-label.ts`, `menu.title ?? describeParams(game, params)`), so the requirement now compares the name with the label its params compose |
| The slot order is the collection's and the words each game's | spec: One describer labels every params set |
| Two games could want different words but not the tier in a different place | reason |
| Scenario: a tier renders as its declared name | spec: One describer labels every params set |
| Scenario: two presets read the same | spec: A preset keeps a declared title only for a name no field says |
| Scenario: the menu and the header name one board one way | spec: One describer labels every params set |
| Scenario: a line under a ruleset's heading | spec: A preset leaf carries a label and a title |
| Scenario: a menu of one ruleset | spec: A preset leaf carries a label and a title |

## Params validity is the engine's check

| Rule | Where it went |
| --- | --- |
| `paramsError(game, p, full)` decides: bounds, choices, then the game's optional `validateParams`, which holds only what the items cannot state | spec: Params validity is the engine's check |
| The midend and every test asking about validity call it | spec: Params validity is the engine's check |
| A bound's refusal names the field by its dialog label | spec: Params validity is the engine's check |
| A requirement elsewhere that a game's `validateParams` rejects some params is met by this check | spec: A rule that a game rejects params is met by the engine's check |
| A generation-only limit does not move into `bounds` | spec: A generation-only bound is gated on full |
| Scenario: a value outside its range | spec: Params validity is the engine's check |
| Scenario: a choice outside its list | spec: Params validity is the engine's check |

## A game may turn its params, says why not, or is a draft

| Rule | Where it went |
| --- | --- |
| A game may declare `transposeParams(p)`, which returns the turned board or `null` | spec: A game may turn its params, says why not, or is a draft |
| `newGame(fitTo)` deals the params turned when the turned board draws at a strictly larger tile, and as chosen otherwise and without `fitTo` | spec: A deal turns the chosen params when the turned board fits better |
| The params are dealt turned whenever the turned board draws larger | untrue: the midend also keeps the chosen params when the turned ones fail `paramsError` for a deal (`src/engine/midend.ts`, `paramsToFit`), which the requirement and a new scenario now say |
| The decision is made at deal time only, the chosen params stay, and a board from an id, a save or an autosave is never turned | spec: A turn is decided at deal time only |
| The Custom dialog shows the chosen params turned the way the board on screen was dealt | spec: A turn is decided at deal time only |
| `transposeParams` is a contract section: a reason in `notApplicable`, or a draft | spec: A game may turn its params, says why not, or is a draft |
| A `SQUARE_GRID` game draws every default and preset board square | spec: Every transposeParams turns back exactly and exchanges the drawn size |
| Every implementation turns valid params into valid params, turns back exactly, and exchanges the drawn size, on non-square boards built through the width item | spec: Every transposeParams turns back exactly and exchanges the drawn size |
| A game that draws along one side only is named in `UNEVEN_FRAME` | spec: Every transposeParams turns back exactly and exchanges the drawn size; held: src/engine/orientation.test.ts "UNEVEN_FRAME" |
| Scenario: a portrait preset is dealt turned on a wide screen | spec: A deal turns the chosen params when the turned board fits better |
| Scenario: a game that cannot turn is dealt as chosen | spec: A deal turns the chosen params when the turned board fits better |
| Scenario: a board loaded from an id is never turned | spec: A turn is decided at deal time only |
| Scenario: a game that neither turns nor says why is a draft | spec: A game may turn its params, says why not, or is a draft |
| Scenario: a square-grid reason is held to the drawn board | spec: Every transposeParams turns back exactly and exchanges the drawn size |

## A game ID that will not load says why in the collection's words

| Rule | Where it went |
| --- | --- |
| The verdict of `validateDesc` is a description error made by the description-error module, a kind or a sentence through the named escape, and its type admits no other string | spec: A game ID that will not load says why in the collection's words |
| The kinds are the seven listed | spec: A description error kind says what went wrong for the player; untrue: the module has one more, a board with none or several of a thing it must have exactly one of (`descNeedsOne` in `src/engine/desc-error.ts`), which the list now names |
| An escape sentence is used by one game, repeats no kind's words, and is one sentence about "this game ID" | spec: A game's own description sentence belongs to one game |
| These are asserted by reading every call of the escape by its shape | spec: A game's own description sentence belongs to one game |
| `validateDesc` refuses a malformed description by returning | spec: A malformed description is refused by returning |
| Scenario: a truncated ID says it may have been cut off | spec: A game ID that will not load says why in the collection's words |
| Scenario: a bad character is named | spec: A description error kind says what went wrong for the player |
| Scenario: a reason two games share becomes a kind | spec: A game's own description sentence belongs to one game |
| Scenario: garbage is refused, not thrown | spec: A malformed description is refused by returning |

## A game reads its description once

| Rule | Where it went |
| --- | --- |
| One parser returns a `DescParse`, and `newState` builds from its value through `descValue` | spec: A game reads its description once |
| A game declares no validator, the engine derives the verdict from `newState` through `loadDesc`, and any other throw propagates | spec: The engine derives a description's verdict from newState |
| The midend builds state 0 from the load that judged the description | spec: The engine derives a description's verdict from newState |
| A check needing the parsed board runs inside the parse, and a parser accepts what its encoder writes and refuses what the grammar has no place for | spec: A game reads its description once |
| The cursor in `engine/desc-reader.ts` fails with the collection's kinds and reads no number without bounds | spec: The engine provides a cursor over a description |
| Scenario: a description the generator wrote | spec: A game reads its description once |
| That description is accepted by `validateDesc` | untrue: the guard asks `loadVerdict`, the whole load (`src/engine/desc-error-games.test.ts`), so the scenario now says the description loads |
| Scenario: a description that ends early | spec: The engine provides a cursor over a description |
| Scenario: a number too large for its board | spec: The engine provides a cursor over a description |
| Scenario: a save whose board no longer loads | spec: The engine derives a description's verdict from newState |

## A params refusal is a sentence

| Rule | Where it went |
| --- | --- |
| Every refusal `paramsError` returns is one sentence with its full stop, generated or the game's | spec: A params refusal is a sentence |
| Both dialogs show a refusal as it comes | spec: A params refusal is a sentence |
| Which refusals a game has stays the game's own | spec: A params refusal is a sentence |
| A guard reads every `validateParams` and follows each return, failing a string it cannot read | spec: A guard reads every string a validateParams can return |
| The guard is `params-refusal.test.ts` | held: src/engine/params-refusal.test.ts "is a sentence with its full stop" |
| Scenario: a game's refusal reaches the Enter Game ID dialog | spec: A params refusal is a sentence |
| The dialog's sentence is written with a straight apostrophe | untrue: the dialog writes "That game won’t open." with a typographic apostrophe (`src/dialogs/enter-gameid-dialog.ts`), and the scenario now quotes it so |
| Scenario: a fragment is refused at commit | spec: A guard reads every string a validateParams can return |
| Scenario: a constant shared by games is read once | spec: A guard reads every string a validateParams can return |

## A pasted game ID is refused or opened, never thrown

| Rule | Where it went |
| --- | --- |
| Every game answers an entered description with a refusal or a board that builds and draws, and neither the load nor the first `redraw` throws | spec: A pasted game ID is refused or opened, never thrown |
| A cross-game test holds it over junk and one-edit near misses | spec: A pasted game ID is refused or opened, never thrown |
| The near misses come from one board per value of each preset axis at a fixed seed, so a failure names the same game ID every run | spec: Near misses come from boards dealt at a fixed seed |
| The test can see only a throw that is not a refusal, and says so where it is defined with the measured split | spec: The near-miss test says what it cannot see |
| Scenario: a parse that accepts what its board cannot hold | spec: A pasted game ID is refused or opened, never thrown |
| Scenario: a mutator that stopped producing near misses | spec: The near-miss test says what it cannot see |
| Scenario: junk is refused by every game | spec: A malformed description is refused by returning |

## A board with a mistake check loads only with exactly one answer

| Rule | Where it went |
| --- | --- |
| A game with `findMistakes` whose `solve` proves several answers or none does not load, with `DESC_NOT_UNIQUE` or `DESC_CONTRADICTORY` | spec: A board with a mistake check loads only with exactly one answer |
| The verdict is part of `loadDesc`, and a solver that gives up leaves it passing | spec: A board with a mistake check loads only with exactly one answer |
| `findMistakes` compares with the one answer, hidden or not, and a hidden answer is no reason in `notApplicable.findMistakes` | spec: A mistake check compares with the one answer, hidden or not |
| Scenario: a game ID with two answers | spec: A board with a mistake check loads only with exactly one answer |
| Scenario: a game ID upstream's generator wrote | spec: A board with a mistake check loads only with exactly one answer |
| Scenario: a hidden answer is checked | spec: A mistake check compares with the one answer, hidden or not |

## A board loads only if the game's own solver solves it

| Rule | Where it went |
| --- | --- |
| A description does not load when the game's own solver does not solve its board, as part of `loadDesc` | spec: A board loads only if the game's own solver solves it |
| A tiered game's board loads exactly when some cap solves it, whatever tier its params state, Unreasonable being a cap like any other | spec: A board loads only if the game's own solver solves it |
| A board no cap solves is refused with `DESC_NO_SINGLE_ANSWER` or `DESC_NOT_DEDUCIBLE` by whether the game has an Unreasonable tier | spec: A board no cap solves is refused in the words its game's tiers allow |
| An untiered game's board loads unless `finishesByDeduction` returns false for its opening state | spec: An untiered game's board loads unless finishesByDeduction refuses it |
| Where a save carries a private description, the midend asks the public one | spec: A board loads only if the game's own solver solves it |
| No game offers a parameter or a tier that switches its generator's checks off | spec: No parameter or tier switches a generator's checks off |
| Scenario: a board no tier solves | spec: A board no cap solves is refused in the words its game's tiers allow |
| Scenario: a board harder than its ID says | spec: A board loads only if the game's own solver solves it |
| Scenario: a board with several solutions under an Unreasonable ID | spec: A board no cap solves is refused in the words its game's tiers allow |
| Scenario: an untiered game's board that needs a guess | spec: An untiered game's board loads unless finishesByDeduction refuses it |
| Scenario: a game ID upstream wrote with its checks on | spec: No parameter or tier switches a generator's checks off |

## A game declares its rulesets with rulesetItem

| Rule | Where it went |
| --- | --- |
| A game whose params choose between puzzles declares them with `rulesetItem`, each a `name` and a `rule` | spec: A game declares its rulesets with rulesetItem |
| The item is a choices field with the keyword `ruleset`, labeled "Game mode", and no label slot leads a label | spec: A game declares its rulesets with rulesetItem |
| The engine builds the name in front of a label and the menu's sections, in declared order, from a flat list | spec: The preset menu gives each ruleset a section |
| A menu whose presets all hold one ruleset stays flat | spec: The preset menu gives each ruleset a section |
| Three games spelled the field three ways and two interleaved their boards | history |
| Scenario: a game gains a ruleset | spec: A game declares its rulesets with rulesetItem |
| Scenario: presets of two rulesets are written interleaved | spec: The preset menu gives each ruleset a section |
| Scenario: a ruleset game writes a section of its own | spec: The preset menu gives each ruleset a section |
| Scenario: a field asks to lead a label | spec: A game declares its rulesets with rulesetItem |

## A game declares its rule modifiers with modifierItem

| Rule | Where it went |
| --- | --- |
| A field that adds, removes or bounds one rule and holds together with the others is declared with `modifierItem`: its words and its rule | spec: A game declares its rule modifiers with modifierItem |
| Every modifier declares the value at which its rule applies, and the engine states it and says the label words exactly then | untrue: only a checkbox modifier has such a value. A choices modifier "bounds its rule at every value and has none", gives a label of its own, and a checkbox with no slot says no words (`src/engine/modifier.ts`), which the two requirements now say |
| The engine builds the field's help entry and its label words from the declaration | spec: The engine builds a modifier's help entry and label words |
| Fields that cannot all be set together are one ruleset field, settled by dealing every combination | spec: Fields that cannot all be set together are one ruleset field |
| Each game had written these as ordinary fields, and two stated their rules only in the Parameters section | history |
| Scenario: a modifier's rule applies | spec: The engine builds a modifier's help entry and label words |
| Scenario: a rule is reworded | spec: A game declares its rule modifiers with modifierItem |
| Scenario: two candidates exclude each other | spec: Fields that cannot all be set together are one ruleset field |

## The preset menu is a grid

| Rule | Where it went |
| --- | --- |
| A menu lists its boards in the game's order, each at its tiers, then one board for each thing that is neither a size nor a tier | spec: The preset menu is a grid |
| The engine provides `presetGrid`, and a guard holds every game's menu to the shape, read off the menu | spec: The preset menu is a grid |
| The guard is `preset-menu-shape.test.ts` | held: src/engine/preset-menu-shape.test.ts "a tiered game's menu is a grid" |
| A whole menu holds at most `MENU_LINES` lines and a section at most `MENU_SECTION_LINES`, except one line for each kind of board | spec: A preset menu is short enough to choose from |
| A board's lines are consecutive from its first tier to its last, and every tier is on the menu in each ruleset unless refused or ledgered | spec: A board's tiers are one run of lines, and every tier is offered |
| A checkbox rule modifier applies on exactly one line, or one a size where the ledger says so | spec: A checkbox rule modifier has one line of the menu |
| A game whose params have a size offers at least three boards | spec: The preset menu is a grid |
| Scenario: a menu past twelve lines | spec: A preset menu is short enough to choose from |
| Scenario: a menu of many short sections | spec: A preset menu is short enough to choose from |
| Scenario: a board with a tier missing from its run | spec: A board's tiers are one run of lines, and every tier is offered |
| Scenario: a tier no line offers | spec: A board's tiers are one run of lines, and every tier is offered |
| Scenario: a modifier on several lines | spec: A checkbox rule modifier has one line of the menu |
| Scenario: a game builds its menu from its boards | spec: The preset menu is a grid |

## A ruleset declares what it offers of the other settings

| Rule | Where it went |
| --- | --- |
| A ruleset says what it offers of another setting in `Ruleset.only`, and a modifier in `modifierItem`'s `only`, and a setting left out is taken whole | spec: A ruleset declares what it offers of the other settings |
| A declaration that cannot hold throws wherever it is read | spec: A declaration of what a setting leaves throws when it cannot hold |
| The engine builds the refusal in `paramsError` of a deal, naming the field, what it must be and the deciding value, and a board already written is not held to it | spec: The engine refuses a deal that asks for what a deciding field does not leave |
| The engine builds what the Custom dialog offers: disabled choices and checkboxes, a field left one choice disabled whole, and what both of two deciding fields leave | spec: The Custom dialog offers only what the deciding fields leave |
| The form submits a narrowed field at the value it shows and keeps the value the player set | spec: A narrowed field keeps the value the player set |
| A deciding field may be a choices field or a checkbox | spec: The Custom dialog offers only what the deciding fields leave |
| The engine builds a sentence in the narrowed field's help entry | spec: A narrowed field's help entry says what is left of it |
| The three are built in `engine/only.ts` | spec: The engine refuses a deal that asks for what a deciding field does not leave |
| No game writes any of the three | spec: The engine refuses a deal that asks for what a deciding field does not leave; spec: The Custom dialog offers only what the deciding fields leave; spec: A narrowed field's help entry says what is left of it |
| The engine refuses a submission of the dialog's values with the same sentence, whether or not the params can hold the pair | spec: The engine refuses a submitted form that holds what a deciding field does not leave |
| A limit on a typed number is not declared this way and stays in `validateParams` | spec: A limit on a typed number stays in validateParams |
| Scenario: a ruleset is chosen that fixes a setting the player had changed | spec: The Custom dialog offers only what the deciding fields leave |
| Scenario: the player goes back to the first ruleset | spec: A narrowed field keeps the value the player set |
| Scenario: a game ID asks a ruleset for what it does not offer | spec: The engine refuses a deal that asks for what a deciding field does not leave |
| Scenario: a checkbox modifier takes the chosen tier away | spec: A narrowed field keeps the value the player set |
| Scenario: a form stops moving a narrowed field | spec: A narrowed field keeps the value the player set |
| The guard is `only.test.ts` | held: src/engine/only.test.ts "a form shows and submits a narrowed field at a value it is offered" |
