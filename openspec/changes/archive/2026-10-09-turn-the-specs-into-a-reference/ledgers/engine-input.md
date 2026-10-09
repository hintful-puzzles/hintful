# Ledger: engine-input

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The engine provides shared pointer button constants

| Rule | Where it went |
| --- | --- |
| The button codes are exported from `pointer.ts`, equal to `PuzzleButton` in `types.ts`, as plain `const` values and not an enum | spec: The engine provides shared pointer button constants |
| The constants are plain so advisory diff scripts can import them under Node's strip-only loader | reason |
| Scenario: a game compares against the shared constants and declares no button code of its own | spec: The engine provides shared pointer button constants |

## The engine provides a shared cursor button-to-delta helper

| Rule | Where it went |
| --- | --- |
| `cursorDelta` returns the unit delta for the four cursor buttons and `null` otherwise, and `isCursorMove` is true for those four | spec: The engine provides a shared cursor button-to-delta helper |
| `gridCursorMove` clamps or wraps, returns `null` for a non-cursor button or a no-op at a clamped edge, and is position-only | spec: gridCursorMove moves a position on a bounded grid |
| A game with an ordinary bounded-grid cursor drives it through `moveCursor`, and `cursorDelta` and `gridCursorMove` remain for other traversals and for what a game does while moving | spec: A bounded-grid cursor is driven through moveCursor |
| Scenarios: a cursor key yields its delta, and a non-cursor button yields null | spec: The engine provides a shared cursor button-to-delta helper |
| Scenarios: a clamped move at the edge, and a toroidal wrap | spec: gridCursorMove moves a position on a bounded grid |
| Scenario: Fifteen's and Sixteen's local clamp helpers were deleted when the helper shipped | history |
| Scenario: no positional-cursor game carries its own bounded or toroidal clamp | spec: A bounded-grid cursor is driven through moveCursor |

## The engine provides shared keyboard modifier-mask constants

| Rule | Where it went |
| --- | --- |
| `MOD_NUM_KEYPAD`, `MOD_SHFT`, `MOD_CTRL` and `stripModifiers` are exported from `pointer.ts` as plain constants, and a game imports them | spec: The engine provides shared keyboard modifier-mask constants |
| `MOD_MASK` is `0x7800` | untrue: `MOD_MASK` is `0x7000` in `src/engine/pointer.ts` and in `PuzzleButton` (`src/engine/types.ts`), the stylus bit `0x0800` being left unused, and the requirement now states `0x7000` |
| The masks match upstream's `puzzles.h` modifier bits | untrue: upstream's mask includes the stylus bit, which `src/engine/pointer.ts` leaves out of `MOD_MASK` |
| Scenario: stripping clears the mask bits and keeps the rest, and no game redeclares a mask | spec: The engine provides shared keyboard modifier-mask constants |

## Games may expose on-screen key labels

| Rule | Where it went |
| --- | --- |
| `Game.requestKeys(params)` is optional, depends on params only, and each `button` is processed as the physical key | spec: Games may expose on-screen key labels |
| The hook is faithful to upstream `game_request_keys` | history |
| `label` is the resolved text, `"Clear"` for the clear key, and the engine does not re-derive labels | spec: A key label carries its resolved text |
| `EngineCore` exposes `requestKeys`, the midend returns the game's list for the current params, and the worker adapter forwards it | spec: The midend serves a game's key labels |
| A game without the hook shows an empty list, unchanged from prior behavior | untrue: `Midend.requestKeys` in `src/engine/midend.ts` appends the Marks key for a note-taking game whether or not it has the hook, so the list is empty only for a game that takes no notes, and the requirement now says so |
| Scenario: a keypad game's labels are served and rendered one button a label | spec: The midend serves a game's key labels |
| Scenario: a game without the hook shows no keypad | spec: The midend serves a game's key labels |

## Touch equivalence is guarded for every registered game

| Rule | Where it went |
| --- | --- |
| A touch press does what the same mouse press does, in every registered game | spec: No bit marks a press as a finger's; spec: A game reads one pointer with two buttons |
| The suite sweeps every registered game's board with a touch press and a mouse press | untrue: no such sweep exists, since a finger's press arrives as the mouse's own codes with nothing marking it, which the frontend's "one pointer, two buttons" tests in `src/puzzle/components/view-interactive.test.ts` assert, as the header of `src/engine/input-parity.test.ts` says |
| The sweep is dense enough to land on live targets, and fails when no probe reaches one | spec: A probe sweeps what could differ |
| A newly ported game is covered on the day it is registered | reason |
| An early cut of the guard missed Untangle's vertices | history |
| Scenario: a game comparing an unstripped button fails once the midend's stripping is removed | untrue: the midend strips nothing from a pointer press, because no stylus bit exists (`src/engine/pointer.ts`), so the scenario's defect cannot be planted |

## A game with no secondary meaning is not given a synthetic one

| Rule | Where it went |
| --- | --- |
| A game whose secondary button means nothing observable declares `ignoresSecondaryButton`, and the view then promotes nothing and delivers the press at once | spec: A game with no secondary meaning is not given a synthetic one |
| Without the flag a held press is lost, only on touch and only for the player who paused | spec: A game with no secondary meaning is not given a synthetic one |
| Seven games were in that state when the collection was swept | history |
| The guard asserts the biconditional | spec: The secondary-button declaration is held to the behavior |
| A meaning is derived and never declared, and commits a move, changes the next input, or folds onto the primary | spec: A secondary meaning is derived from what the player can perceive |
| The counts of games under each of the three answers, and the games named under the second | figure |
| Consumption alone does not satisfy the biconditional | spec: A secondary meaning is derived from what the player can perceive |
| Consumption was the previous question, and sixteen games consumed without committing | history |
| The observation is the painted frame together with the save | spec: The secondary-button probe observes the frame and the save |
| Guess's peg holds are UI state never serialized | untrue: Guess's peg holds reach the save since it grew an `encodeUi`, as the comment on `observable` in `src/engine/testing/input-probe.ts` records, so the rule is stated without the example |
| A change is only a sufficient sign, and "did the board change" is not reinstated as a conviction | spec: The secondary-button probe observes the frame and the save |
| An incidental effect shared with the primary press is credited, and that bound stands until a derivation exists that does not convict Slide | spec: An incidental secondary effect is the guard's stated bound |
| How many credited games change the save and how many the frame, and which were read | figure |
| The priming includes a two-press and a drag setup | spec: The secondary-button probe observes the frame and the save |
| The flag is not `REQUIRE_RBUTTON` inverted and is not derived from it | spec: The secondary-button declaration is held to the behavior |
| Scenario: a held touch press still plays a drag game | spec: A game with no secondary meaning is not given a synthetic one |
| Scenario: the declaration cannot drift from the behavior | spec: The secondary-button declaration is held to the behavior |
| Scenarios: a repaint is not a meaning, and a meaning through a shared helper counts | spec: A secondary meaning is derived from what the player can perceive |

## The gesture layer's own decisions are tested

| Rule | Where it went |
| --- | --- |
| `detectSecondaryButton` has direct tests apart from the per-game sweeps, covering the hold window, the threshold and a wobble, a non-touch pointer, both affordances off, the two-finger tap from either release, and the timer reset | spec: The gesture layer's own decisions are tested |
| The tests cover `unhandledEvent`, which the view replays | spec: The gesture layer's replayed event is tested |
| Scenario: a stationary finger past the hold window is secondary | spec: The gesture layer's own decisions are tested |
| Scenario: a finger that moves is primary, and the move event is handed back | spec: The gesture layer's replayed event is tested |

## Keyboard reachability is a recorded decision for every game

| Rule | Where it went |
| --- | --- |
| Every game handles cursor input or is on an exemption list stating why, with the reason also in its spec | spec: Keyboard reachability is a recorded decision for every game |
| Some keyboard-only sequence commits a move, and the probe allows multi-step sequences | spec: A keyboard commits a move |
| The seven games named as picking up with one select and putting down with a second | reason |
| Coverage is derived through the registry and the shared helpers, not by reading one `index.ts` | spec: Keyboard coverage is derived through the registry |
| A check that reads one file convicts games that are fine, and Palisade and Separate are the border-grid games named | reason |
| Scenario: a game with no keyboard handling must be on the list | spec: Keyboard reachability is a recorded decision for every game |
| Scenario: cursor handling through a shared helper counts | spec: Keyboard coverage is derived through the registry |
| Scenario: a cursor that cannot act is not a keyboard | spec: A keyboard commits a move |

## Every on-screen key a game offers reaches that game

| Rule | Where it went |
| --- | --- |
| Each button a game's `requestKeys` returns is one its `interpretMove` consumes on a real board, and this is the reverse of the emittable-key scan | spec: Every on-screen key a game offers reaches that game |
| The probe primes the board before convicting a key, and an unreachable key is recorded as a finding under management | spec: The on-screen key probe primes the board |
| The count of games with a panel carries a floor that only moves up | untrue: `src/engine/input-parity.test.ts` holds no floor under the panel games and gives every game a case of its own instead, which is the later requirement's rule and is stated there; spec: The keypad rule is checked per game |
| Scenario: a panel key the game ignores fails the suite | spec: Every on-screen key a game offers reaches that game |
| Scenario: a clear key on an empty board is not a finding | spec: The on-screen key probe primes the board |

## The on-screen key panel is a second key emitter

| Rule | Where it went |
| --- | --- |
| A guard about deliverable codes accounts for `puzzleKeyMap` and the game's own panel, per game and not as a union | spec: The on-screen key panel is a second key emitter |
| The scan covers `switch (button)` case labels as well as comparisons | spec: The unsendable-code scan reads switch cases |
| Unruly's `case 8` survived the erase-key sweep | history |
| A union over the collection would excuse the dead bindings the scan exists to find | reason |
| Scenario: a dead binding inside a switch is caught | spec: The unsendable-code scan reads switch cases |
| Scenario: the clear key is emittable only where it is offered | spec: The on-screen key panel is a second key emitter |

## One keyboard-cursor vocabulary across games

| Rule | Where it went |
| --- | --- |
| A cursor is held in the engine's shared shape under one canonical `Ui` field, and the engine provides the shape and its verbs | spec: One keyboard-cursor vocabulary across games |
| A plain arrow reveals and moves, a pointer press hides, and an arrow that acts on the board need not act on a first press on a hidden cursor | spec: One arrow press reveals the cursor and moves it |
| What a game does while moving, a different traversal and an extra flag beside the cursor stay the game's | spec: What a game does while its cursor moves stays its own |
| The build fails for a cursor outside the canonical field, found structurally, and a game does not re-declare a cursor helper | spec: A cursor outside the canonical field fails the build |
| An eleventh spelling is caught as surely as the ten before it | figure |
| Scenarios: one arrow press reveals and moves, and an acting arrow reveals first | spec: One arrow press reveals the cursor and moves it |
| Scenario: a game keeps what it does while moving | spec: What a game does while its cursor moves stays its own |
| Scenario: a cursor under any other field fails the build | spec: A cursor outside the canonical field fails the build |

## A game declines a button it did not act on

| Rule | Where it went |
| --- | --- |
| `interpretMove` returns `null` for a button it did not act on, asserted across every game with codes nothing can mean | spec: A game declines a button it did not act on |
| The guards and the bare-letter shortcuts read that return value, so a game answering everything blinds them | spec: A game declines a button it did not act on |
| The probe codes are asserted unactionable against the vocabulary, and the private-use area is not used | spec: The unactionable probe codes are asserted, not assumed |
| `MOD_MASK` is `0x7800` | untrue: it is `0x7000` in `src/engine/pointer.ts`, and the decoding of `0xE000` the requirement keeps holds under either mask |
| The private-use choice convicted Sixteen and put a second game into the finding | history |
| The probe is sent at the keyboard origin as well as across the board | spec: The unactionable probe is sent at the keyboard origin |
| A claiming game is on a ledger stating why, asserted exactly equal to what the sweep finds | spec: A game claiming an unactionable code is on an exact ledger |
| The guard does not reopen "did the board change", and a meaningless code leaving the board untouched is the one sound direction | spec: The unactionable probe is sent at the keyboard origin |
| "Did the board change" falsely convicted four games | figure |
| Scenario: a game answering a meaningless code is caught | spec: A game declines a button it did not act on |
| Scenario: the probe codes are checked before the games are | spec: The unactionable probe codes are asserted, not assumed |
| Scenario: a fixed game cannot stay on the ledger | spec: A game claiming an unactionable code is on an exact ledger |
| Scenario: the keyboard-reachability guard fails for a game whose cursor handling is removed | spec: A game declines a button it did not act on |

## The collection's input guards share one behavioral probe

| Rule | Where it went |
| --- | --- |
| The guards' questions live in one shared module and each guard asks through it | spec: The collection's input guards share one behavioral probe |
| Two guards had drifted apart, and Tents' `n` made the finding depend on the deal | history |
| Every probe is behavioral, reads no source and no declaration | spec: The collection's input guards share one behavioral probe |
| A probe whose answer depends on where the cursor lands walks the cursor | spec: A probe sweeps what could differ |
| Scenario: a new guard inherits the probes | spec: The collection's input guards share one behavioral probe |
| Scenario: a probe does not depend on the deal | spec: A probe sweeps what could differ |

## The engine answers which key is a digit, once

| Rule | Where it went |
| --- | --- |
| `digitOf` returns the digit a button stands for or `null`, looking through the modifier bits | spec: The engine answers which key is a digit, once |
| A game does not spell the digit range itself, in any of three shapes | spec: A game does not spell the digit keys itself |
| A guard finds every such site by its codes in any operand position, proves itself on planted copies, and states its one blind spot | spec: The digit-code guard keys on the codes |
| The bound and the meaning of `0` stay with the game, and a numpad direction pad is resolved before asking | spec: The meaning of a digit key stays with the game |
| Scenario: a numpad digit enters the same value as the bare key | spec: The engine answers which key is a digit, once |
| Scenario: a hand-parsed digit fails the build | spec: A game does not spell the digit keys itself |
| Scenario: the bound and the meaning of zero stay with the game | spec: The meaning of a digit key stays with the game |

## A pointer drag over a grid has one name across the collection

| Rule | Where it went |
| --- | --- |
| A drag's start and current position are held in `GridDrag`, and the engine owns the anchor, the position, whether it runs and the helpers | spec: A pointer drag over a grid has one name across the collection |
| The game keeps its coordinate space and everything its drag means | spec: A drag's coordinate space and meaning stay with the game |
| Scenario: a game asks whether a drag is running | spec: A pointer drag over a grid has one name across the collection |
| Scenario: two games with different coordinate spaces | spec: A drag's coordinate space and meaning stay with the game |

## The engine cancels a drag the board changed under

| Rule | Where it went |
| --- | --- |
| The midend ends every `GridDrag` when it replaces the state, membership is derived, and a game needing a drag to survive says so in `changedState` | spec: The engine cancels a drag the board changed under |
| Every committing path, including a click path a release falls through to, is gated on `drag.live` | spec: Every committing path of a drag is gated on drag.live |
| Scenario: a release arriving after the board changed commits nothing | spec: Every committing path of a drag is gated on drag.live |
| Scenario: an undo lands while a drag is live | spec: The engine cancels a drag the board changed under |

## The engine answers which character is a digit, once

| Rule | Where it went |
| --- | --- |
| `isDigit` and `digitValue` are in `decimal.ts`, the absent case sits outside the number domain, and the three spellings of the fact agree under a test | spec: The engine answers which character is a digit, once |
| A sentinel inside the domain passes a lower-bound test by coincidence and is stored as a wrapped byte | reason; held: src/engine/decimal.ts "The absent case sits outside the return type" |
| Both take a character, and the caller holding the index carries the bounds check | spec: The digit helpers take a character, and the caller checks the bounds |
| A game reads through the helpers, writes a digit as `String(n)`, and declares no copy or hand-written comparison | spec: A game reads and writes a digit character through the engine |
| A hex nibble is read with `Number.parseInt(c, 16)` | spec: A game reads and writes a digit character through the engine |
| The meaning of the value stays with the game, a typed-array write names the array's own absent constant, and a screened write says so | spec: The meaning of a digit character stays with the game |
| Scenario: Slant reads a bounded clue | spec: The meaning of a digit character stays with the game |
| Scenario: a private copy fails the build | spec: A game reads and writes a digit character through the engine |
| The scenario names the test file that reports a private copy | history |
| Scenario: Filling's write names `EMPTY` | spec: The meaning of a digit character stays with the game |

## An on-screen key may name a palette color

| Rule | Where it went |
| --- | --- |
| A `KeyLabel` can carry a `swatch`, painted from the same palette as the canvas, and a key without one is plain | spec: An on-screen key may name a palette color |
| The `label` still carries the character the key sends | spec: An on-screen key may name a palette color |
| A bare `"1"` asks the player to learn which color one is | reason; held: src/engine/types.ts "asks the player to learn which color one means" |
| The palette is published from the single point that hands it to the drawing, and the ink is chosen from the fill's lightness | spec: A swatch key is painted from the published palette |
| A color keypad is built by a shared builder beside `digitKeys` | spec: A color keypad is built by the shared builder |
| Scenario: a color key is painted from the board's palette and follows the scheme | spec: An on-screen key may name a palette color |
| Scenario: an ordinary key is untouched | spec: An on-screen key may name a palette color |

## A color keypad may spell its tenth value zero

| Rule | Where it went |
| --- | --- |
| The engine offers a keypad whose tenth key is `'0'` beside the one whose tenth is `'a'`, and a game chooses and spells neither | spec: A color keypad may spell its tenth value zero |
| Offering one alone would ship an inert key, which the inert-key sweep cannot see at default params | reason; held: src/engine/key-labels.ts "would ship an `'a'` key it refuses" |
| The builder is keyed on there being a tenth value, not on the tenth entry | spec: A color keypad may spell its tenth value zero |
| Scenarios: ten values put zero last and keep Clear, and nine values are the ordinary keypad | spec: A color keypad may spell its tenth value zero |

## The engine owns the select-or-drag gesture, and the game supplies only what is about its puzzle

| Rule | Where it went |
| --- | --- |
| The note-taking cell provides the tap arm and the drag-entry arm | spec: The engine owns the select-or-drag gesture, and the game supplies only what is about its puzzle |
| The identity of the selection comes from the game, a region is no special case, and whether a gesture committed stays the game's | spec: The identity of a selection comes from the game |
| Rome decides by direction and Map by effect | spec: The identity of a selection comes from the game |
| Scenario: a region selection is compared as a region | spec: The identity of a selection comes from the game |
| Scenario: every member answers one gesture one way, and the sweep counts the taps that reached the sticky branch | spec: The engine owns the select-or-drag gesture, and the game supplies only what is about its puzzle |

## A game offers a keypad exactly when touch play needs one to type

| Rule | Where it went |
| --- | --- |
| A game with a `pencil` array offers a non-empty `requestKeys`, and a keypad without one is ledgered with its reason | spec: A game offers a keypad exactly when touch play needs one to type |
| The ledger is named `KEYPAD_WITHOUT_PENCIL` | held: src/engine/input-parity.test.ts "const KEYPAD_WITHOUT_PENCIL" |
| The guard checks per game as a biconditional and relies on no floor | spec: The keypad rule is checked per game |
| Where a keypad offers Clear, Backspace also reaches the game | spec: Backspace clears wherever the panel's Clear does |
| Scenario: a note-taking game that loses its keypad fails its own case | spec: The keypad rule is checked per game |
| Scenario: a keypad without a pencil array must be ledgered | spec: A game offers a keypad exactly when touch play needs one to type |
| Scenario: Backspace clears wherever the panel's Clear does | spec: Backspace clears wherever the panel's Clear does |

## Click-game input is declared as targets and verbs

| Rule | Where it went |
| --- | --- |
| A game declares `targetVerbs` as a geometry and a verb per button | spec: Click-game input is declared as targets and verbs |
| It hands its other buttons to `interpretTargetVerbs`, and its help carries the generated Controls paragraph | spec: A declaring game hands its buttons to the engine |
| A target is whatever the game aims at, the cursor belongs to the geometry, and a verb can be key-only | spec: A target and its cursor belong to the geometry |
| The engine owns the parked cursor, the first select, the repaint rule, and Enter, Space and a verb's own keys | spec: The engine owns a declaring game's press and select keys |
| A verb is the game's function, other input is the game's own arm tried first, and a release arm calls the same verb functions | spec: A verb is the game's function, and other input is the game's own arm |
| A cross-game guard holds the select keys to the buttons, walking through positions on no target | spec: A declared verb is held to what its buttons and keys do |
| Scenario: Enter does what the click does | spec: A declared verb is held to what its buttons and keys do |
| Scenario: an arm that disagrees with its verb fails | spec: A verb is the game's function, and other input is the game's own arm |
| Scenario: the help cannot describe a key the game does not bind | spec: A declaring game hands its buttons to the engine |
| Scenario: each of a key-only verb's keys reaches some board | spec: A declared verb is held to what its buttons and keys do |

## A game reads one pointer with two buttons

| Rule | Where it went |
| --- | --- |
| A pointer arrives as a left and a right button only, the same from every device, and nothing says which device pressed | spec: A game reads one pointer with two buttons |
| The engine exports no middle-button codes and the frontend drops the press | spec: The engine has no middle button |
| A press carries no modifier bits and a held key turns it into no other button | spec: A key held with a press changes nothing |
| Upstream's Shift-click as middle and Ctrl-click as the other button | history |
| A player moves between a mouse and a finger without learning a game twice | reason; guide: docs/games/input.md § "One pointer, two buttons" |
| No bit marks a finger or a pen, and `Game` carries no flag asking for one | spec: No bit marks a press as a finger's |
| The defect once left nine ports deaf to touch | history |
| Every action is reachable with the two buttons alone, an extra action goes into a mode or onto the keypad, and a clear a cycle passes through needs no control | spec: Every action is reachable with the two buttons alone |
| The frontend's tests assert this on the codes a game receives | spec: A game reads one pointer with two buttons |
| The requirement names the test file | history |
| Scenario: a tap sends what a click sends | spec: A game reads one pointer with two buttons |
| Scenario: a held key changes nothing | spec: A key held with a press changes nothing |
| Scenario: the middle button does nothing | spec: The engine has no middle button |

## A key-only verb declares the pointer's route to it

| Rule | Where it went |
| --- | --- |
| A key-only verb cannot be declared without a `pointer` route | spec: A key-only verb declares the pointer's route to it |
| A route is `repeat`, `cycle` or `notes` | spec: A pointer route is a repeat, a cycle or a notes-mode press |
| The generated paragraph states each route beside its keys | spec: The Controls paragraph states a key-only verb's route |
| A guard holds each route to its keys by what the player sees, with equality for `repeat` and containment for `cycle` and `notes` | spec: A declared route is held to its keys |
| Net records which way its last turn went | reason; held: src/engine/testing/input-probe.ts "Net records which way its last" |
| The requirement and its scenario name the test file that holds the routes | history |
| An arm of a game's own is not covered | spec: A declared route is held to its keys |
| The input guide says an arm is not covered | guide: docs/games/input.md § "One pointer, two buttons" |
| Scenario: a key-only verb without a route does not compile | spec: A key-only verb declares the pointer's route to it |
| Scenario: a route that does not make the key's move fails | spec: A declared route is held to its keys |
| Scenario: the paragraph names the route | spec: The Controls paragraph states a key-only verb's route |

## A target geometry can say where to press for a target

| Rule | Where it went |
| --- | --- |
| Every geometry provides `pointAt`, and a guard holds a press there to its target | spec: A target geometry can say where to press for a target |
| The requirement names the test file | history |
| Scenario: a point that presses a neighbor fails | spec: A target geometry can say where to press for a target |

## A drag on from a press repeats the press

| Rule | Where it went |
| --- | --- |
| A declared sweep makes a drag repeat the press on like targets, and a press that made no move opens no drag | spec: A drag on from a press repeats the press |
| The declaration can limit the drag by button, by target and by distance, and a fast drag skips no target | spec: A sweep honors its declared limits and skips no target |
| A game whose own arm takes the press reaches the same drag, applying the pressed verb at the second target where its click acts on the release | spec: A game whose own arm takes the press reaches the same drag |
| The midend treats one drag as one step, and the grouping is not saved | spec: One drag is one step of Undo |
| The Controls paragraph says the drag, and a cross-game guard holds the declaration to the behavior | spec: A declared sweep is held to what a drag does |
| Scenario: a drag paints and does not toggle | spec: A drag on from a press repeats the press |
| Scenario: one Undo takes a drag back | spec: One drag is one step of Undo |
| Scenario: a game that drops its drags fails | spec: A declared sweep is held to what a drag does |

## A mark a player wants on several targets can be dragged

| Rule | Where it went |
| --- | --- |
| A mark is repeated by a drag wherever a drag is not already another gesture, and the game declares it and writes no drag of its own | spec: A mark a player wants on several targets can be dragged |
| The declaration is the sweep or the engine's drag-mark verbs, and a drag opened on one is not carried on with another | spec: A draggable mark is declared as a sweep or as drag-mark verbs |
| A drag does not repeat a move or a mark never wanted in a row, and a click stays one mark where the drag is the game's own gesture | spec: A drag does not repeat a move |
| Each mark declared outside `targetVerbs` is held to the same check as a sweep | spec: A mark declared outside targetVerbs is held to the same check |
| Scenario: a flag is dragged and a square is not opened | spec: A mark a player wants on several targets can be dragged |
| Scenario: a clue marked done is dragged | spec: A draggable mark is declared as a sweep or as drag-mark verbs |
