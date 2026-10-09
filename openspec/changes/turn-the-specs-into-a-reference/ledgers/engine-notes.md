# Ledger: engine-notes

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The note-taking cell is one shared mechanic, not eleven copies

| Rule | Where it went |
| --- | --- |
| A game with the highlight, type and pencil mechanic obtains it from the engine, as a mechanic module holding only what would change in every copy at once | spec: The note-taking cell is one shared mechanic |
| The count of copies in the title | figure |
| The engine owns what a pointer press does to the highlight, and what a symbol entry does to it | spec: The engine owns what a press and an entry do to the highlight |
| A game keeps its coordinate mapping, symbol vocabulary, no-op predicate and `Move` type, and the shared code reports and never constructs a move | spec: A game in the mechanic keeps its puzzle and its own move |
| The two questions a game answers are exactly may it take a value and may it carry marks | spec: A game in the mechanic keeps its puzzle and its own move |
| A given, a wall, a clue square and a filled square are each some game's answer | spec: A game in the mechanic keeps its puzzle and its own move |
| The two rules replace disagreements no game could explain by its puzzle | history |
| A pointer press moves the highlight to the pressed cell, and the position is observable while hidden | spec: A pointer press moves the highlight to the pressed cell |
| The highlight is shown only where the mode it is in could write | spec: The highlight is shown only where its mode could write |
| The sticky toggle is exempt from the first rule and leaves the highlight where it is on a cell that takes no mark | spec: The sticky pencil toggle is a mode switch, not a selection; spec: A pointer press moves the highlight to the pressed cell |
| Neither the press nor the entry changes pencil mode by putting the highlight away, and a latched mode stays latched | spec: Putting the highlight away never changes pencil mode |
| The `Ui` fields have one spelling and one polarity, including in a game with only the provenance flag | spec: The mechanic's Ui fields have one spelling and one polarity |
| A game that does not offer a pencil preference has its behavior derived from the absent declaration, not a roster | spec: An unoffered pencil preference is read from its absence |
| Every game in the mechanic offers the keep-highlight preference defaulted the same way, guarded for the default and for being offered | spec: Every member offers the keep-highlight preference, defaulted the same way |
| Every game in the mechanic offers both pencil preferences | untrue: Group offers no sticky preference (`src/games/group/index.ts` lists only `pencilKeepHighlightPref`, and `NoteTakingUi.pencilSticky` in `src/engine/note-taking-cell.ts` is optional for that reason), and the guard over the derived population holds only keep-highlight, so the requirement states keep-highlight for every member and one sticky default among the members that offer it |
| Five games kept the highlight with no preference and six defaulted it off | history; figure |
| Enrollment is derived from the `Ui` fields `newUi` returns, and a carrier that does not route its press through the shared arm fails the build by a source scan | spec: Enrollment in the mechanic is derived from the Ui |
| Scenario: a press onto a cell that cannot take a value | spec: A pointer press moves the highlight to the pressed cell |
| Scenario: the sticky toggle does not double as a selection key | spec: The sticky pencil toggle is a mode switch, not a selection |
| Scenario: a latched pencil mode survives a mouse-driven mark | spec: Putting the highlight away never changes pencil mode |
| Scenario: the family answers a preference question once | spec: Every member offers the keep-highlight preference, defaulted the same way |
| Scenario: a game carrying the fields must use the mechanic | spec: Enrollment in the mechanic is derived from the Ui |

## One note-taking vocabulary across games

| Rule | Where it went |
| --- | --- |
| Candidate marks live in a typed array named `pencil`, and the element type and slot arity stay the game's own | spec: One note-taking vocabulary across games |
| The list of places the engine already says `pencil` | reason; guide: docs/games/mechanics.md § "Pencil marks: the full note-taking UX" |
| A field that is not a candidate set, and a solver's working scratch, are outside the convention and not convicted | spec: A field that is not the player's candidate set is outside the vocabulary |
| Pearl's `marks` are Loopy's `LINE_NO` rather than candidates | reason; held: src/engine/note-vocabulary.test.ts "which is Loopy's `LINE_NO` rather than a candidate set" |
| A solver's scratch is a different object with a different lifetime, and in a game with no note-taking it is the only candidate array | reason; held: src/engine/note-vocabulary.test.ts "candidate set is a different object with a different lifetime" |
| The array's width is a fact about the puzzle | reason |
| The population of games with notes is not derivable and only the violation is | reason; held: src/engine/note-vocabulary.test.ts "is not derivable, only the violation is" |
| The guard scans for the retired spellings as a typed-array field declaration, and a bare name scan is not used | spec: The vocabulary guard scans for a retired spelling as a typed-array field |
| Scenario: a game declares its notes under a retired spelling | spec: The vocabulary guard scans for a retired spelling as a typed-array field |
| Scenario: a solver's candidate scratch is left alone | spec: A field that is not the player's candidate set is outside the vocabulary |
| Scenario: a ledgered exception that stops being true fails | spec: The vocabulary guard scans for a retired spelling as a typed-array field |

## The Mark-all guard derives its roster from the capability

| Rule | Where it went |
| --- | --- |
| The guard derives its games from `Game.canMarkAll` and reads notes through the shared field name | spec: The Mark-all guard derives its roster from the capability |
| The only per-game datum it admits is the slot arity, and a ledger of it names only games offering the press | spec: The Mark-all guard derives its roster from the capability |
| A roster-against-flag check is not kept once the roster is the flag, and the flag is held to what the game does separately | spec: The Mark-all flag is held to what the game does |
| Scenario: a newly ported game shipping Mark-all is guarded immediately | spec: The Mark-all guard derives its roster from the capability |
| Scenario: a slot-arity entry for a game without the press fails | untrue: the guard holds no arity ledger to fail on, since `src/engine/mark-all.test.ts` reads every member's `pencil` as one candidate word per cell, so the scenario is dropped and the rule on such a ledger is kept |

## The engine owns the pencil-mode indicator, not only its glyph

| Rule | Where it went |
| --- | --- |
| The engine provides the box, the glyph and the invalidation, and a game does not write the paint-and-invalidate sequence | spec: The engine owns the pencil-mode indicator, not only its glyph |
| A game supplies its palette indices | spec: The engine owns the pencil-mode indicator, not only its glyph |
| A game supplies where the indicator sits, reconciled with the later rule that the position is the engine's, so what the game names is the engine's box | spec: The engine owns the pencil-mode indicator, not only its glyph; spec: The pencil-mode indicator sits where the engine computes |
| The engine owns the repaint decision so the cache is written once | spec: The engine decides when the indicator repaints |
| The repaint decision takes the game's own first-frame flag as an input | untrue: `repaintPencilIndicator` in `src/engine/pencil-indicator.ts` takes no such flag and reads `PencilIndicatorCache.pencilModeShown`, whose `null` means the draw state has never painted it |
| Scenario: a game places the indicator and says nothing else about it | spec: The engine owns the pencil-mode indicator, not only its glyph |
| Scenario: the mode changes on a draw state that has already painted | spec: The engine decides when the indicator repaints |

## The engine surface exposes an opt-in "fill all pencil marks" capability

| Rule | Where it went |
| --- | --- |
| The surface exposes `canMarkAll`, `Game` defines the optional flag and the `Midend` surfaces it defaulted false | spec: The engine surface exposes an opt-in "fill all pencil marks" capability |
| The action is upstream's `M`/`m` key | history |
| The action reuses the keyboard path, the game handles `M`/`m` in `interpretMove`, and the control injects `M` via `processKey` only when `canMarkAll` is true | spec: The Mark-all action is the M key |
| The control sits in the toolbar `wa-button-group` with Hint and Check & Save | untrue: the control is a `wa-button` with `data-command="mark-all"` in the `others` part of `src/puzzle/components/game-controls.ts`, beside the Marks key, and no `wa-button-group` is left in the app |
| For a game with a region provider, the press fills note-less cells if any empty cell has no notes, and otherwise removes values placed in the cell's uniqueness regions | spec: Mark-all is adaptive in a game with uniqueness regions |
| The uniqueness regions are the row and column, plus the sub-block and X-diagonal | untrue: Solo's `regionsOf` in `src/games/solo/index.ts`, which its Mark-all press passes to `adaptiveMarkAllMove`, also returns a Killer cage, which forbids repeats, so the requirement lists it with the others |
| The fill is as it was before | history |
| Obvious is judged only against placed values, and a Keen cage is not a uniqueness region | spec: An obvious candidate is judged only against placed values |
| The cleanup is the atomic `pencilStrike` computed at `interpretMove` time, and nothing to do is no move at all | spec: The Mark-all cleanup is one pencilStrike, or no move |
| The cleanup is idempotent and a pure function of the placed grid, with no toggle, no silent re-fill and no cell emptied of its last note | spec: Repeated Mark-all presses converge |
| Repeated presses converge to all candidates minus the placed values in every empty cell | untrue: a cell the player narrowed keeps its narrower notes, by the additive rule in `src/engine/candidate-hint.ts` and the never-resets property of `src/engine/mark-all.test.ts`, so the requirement states that end state for a board the player has not narrowed |
| A cell whose every candidate is eliminated occurs only on a mistaken board | spec: Repeated Mark-all presses converge |
| A game without a row/column uniqueness model keeps fill-only | untrue: Map and Abcd have no such model and clean by a rule of their own (`markAll` in `src/games/map/hint.ts`, `abcdObviousMarks` in `src/games/abcd/index.ts`), so the requirement names the games that supply neither a region provider nor a rule of their own, which is what Undead is |
| Undead keeps fill-only | spec: A game with no obvious-candidate rule keeps a fill-only Mark-all |
| Scenario: a pencil-mark game shows the control and fills candidates | spec: The Mark-all action is the M key |
| Scenario: a second press on a fully-noted board removes obvious candidates | spec: Mark-all is adaptive in a game with uniqueness regions; spec: The Mark-all cleanup is one pencilStrike, or no move |
| Scenario: repeated presses are idempotent | spec: Repeated Mark-all presses converge |
| Scenario: an arithmetic cage is not a uniqueness region | spec: An obvious candidate is judged only against placed values |
| Scenario: a non-uniqueness game keeps fill-only | spec: A game with no obvious-candidate rule keeps a fill-only Mark-all |
| Scenario: a game without pencil marks shows no control | spec: The engine surface exposes an opt-in "fill all pencil marks" capability |

## One way into note-taking across the collection

| Rule | Where it went |
| --- | --- |
| A game with the mode offers the shared toggle, the Marks key last on its keypad, sending the code the bare `P` shortcut sends | spec: One way into note-taking across the collection |
| A game invents no toggle of its own, and a game without the mode does not offer the key | spec: One way into note-taking across the collection |
| The population is derived from what each game is rather than from a roster | spec: Whether a game takes notes is derived from what the game is |
| The population is what `newUi` returns as `pencilMode` | untrue: `takesNotes` in `src/engine/key-labels.ts` also counts a board with a `pencil` array, which is the later requirement's rule, so the requirements speak of a game that takes notes |
| How note-taking reached the player in each game before the key | history |
| The key costs no button and is the only route a touch player can see | reason; held: src/engine/midend.ts "game whose keypad lacks this key has no visible way into its own notes" |
| A gesture a game already has toggles the mode as well | spec: One way into note-taking across the collection |
| The indicator is the shared glyph at the engine's position in every game with the mode, and a game reserves the room | spec: The pencil-mode indicator sits where the engine computes |
| The figure reserved is the engine's reach, the glyph plus the gap at each edge | spec: A game reserves the indicator's reach at every tile size |
| A board that occupies the corner grows a margin on every side so it stays centered | spec: A board that occupies the indicator's corner grows a margin on every side |
| Scenario: the indicator is in the same place in every game | spec: The pencil-mode indicator sits where the engine computes |
| Scenario: a game with a pencil mode is reachable the same way as the rest | spec: One way into note-taking across the collection |
| Scenario: a game without the mode does not offer the key | spec: One way into note-taking across the collection |

## A note encoding states a cell's full candidate set

| Rule | Where it went |
| --- | --- |
| `NoteEncoding` states a cell's full set, defaults to `1..values`, and every shared filling helper reads it | spec: A note encoding states a cell's full candidate set |
| The member went unstated until a game needed a different one | history |
| A game whose set varies supplies it, and it agrees with the game's own fill-all | spec: A per-cell candidate set agrees with the game's own fill-all |
| Scenario: a per-cell candidate set reaches the plan's populate | spec: A per-cell candidate set agrees with the game's own fill-all |
| Scenario: a game that says nothing is unaffected | spec: A note encoding states a cell's full candidate set |

## A move dialect writes the fill-all as well as reading it

| Rule | Where it went |
| --- | --- |
| `CandidateMoveAdapter` builds the fill-all, defaulting to the canonical shape, and every shared helper that emits one builds it through the dialect | spec: A move dialect writes the fill-all as well as reading it |
| This closes an asymmetry with the reading half | history |
| A game does not rename its move discriminator, because the save format replays the move log | spec: A move dialect writes the fill-all as well as reading it |
| Scenario: a game whose moves are keyed differently is emitted correctly | spec: A move dialect writes the fill-all as well as reading it |

## The engine gives every note-taking game its Marks key

| Rule | Where it went |
| --- | --- |
| The engine appends the key at the keypad the app renders, and a game does not list it | spec: The engine gives every note-taking game its Marks key |
| Taking notes is derived from a `pencil` array or the mode flag, never a declared boolean, by one definition read by engine and guard | spec: Whether a game takes notes is derived from what the game is |
| Two games came to carry notes with no key | history; held: src/engine/key-labels.ts "Rome and Map carried notes with no key for their whole lives" |
| Scenario: a note-taking game gets the key without asking for it | spec: The engine gives every note-taking game its Marks key |
| Scenario: a game that takes no notes is not given one | spec: The engine gives every note-taking game its Marks key |

## An offered Marks key is never inert

| Rule | Where it went |
| --- | --- |
| A game offered the key consumes the press and toggles its mode, and an exception is ledgered per game with its reason and held exactly right | spec: An offered Marks key is never inert |
| The engine can put a key on the panel and only the game can make it act, and an inert key is a worse failure than no key | reason; held: src/engine/pencil-mode-key.test.ts "only the game can make it act. A key that is offered and inert is a" |
| Scenario: a game that ignores the key fails | spec: An offered Marks key is never inert |

## A sticky notes mode is visible on the board

| Rule | Where it went |
| --- | --- |
| A game with the mode flag shows the indicator in the engine's corner, reserving the room by a border or a grown canvas | spec: A sticky notes mode is visible on the board |
| Scenario: a game whose board has no margin grows one | spec: A board that occupies the indicator's corner grows a margin on every side |

## The note-taking cell's highlight has one picture, drawn by the engine

| Rule | Where it went |
| --- | --- |
| The engine draws the highlight, a whole-cell wash for entry and a corner triangle for notes, the same for pointer and keyboard | spec: The note-taking cell's highlight has one picture, drawn by the engine |
| The wash is the palette's "you are here" wash at the game's own index, for cell and triangle | spec: The highlight's wash is the palette's "you are here" wash |
| The picture is part of the cell's background, and the game folds its state into the repaint key | spec: The highlight is part of the cell's background |
| A game keeps its rect, background, completion flash and a square the picture cannot sit on, and a Crossing wall keeps the corner brackets | spec: A game keeps what is its puzzle's in the highlight's picture |
| Membership is derived from the `Ui` fields, and a member not painting through the engine fails the build by a source scan | spec: Membership in the highlight's picture is derived as the mechanic's is |
| Scenario: entry and notes, in every member | spec: The note-taking cell's highlight has one picture, drawn by the engine |
| Scenario: the highlight leaves | spec: The highlight is part of the cell's background |
| Scenario: a member whose selection is not a cell | spec: Membership in the highlight's picture is derived as the mechanic's is |
| Scenario: a game that kept its own copy | spec: Membership in the highlight's picture is derived as the mechanic's is |

## A game whose press starts a drag joins the note-taking cell through its tap

| Rule | Where it went |
| --- | --- |
| A release that commits nothing resolves through the press arm with the gesture's button, the drags keep their buttons, and no roster of spoken-for right buttons exists | spec: A game whose press starts a drag joins the note-taking cell through its tap |
| Such a game carries the fields and both preferences and is held by every guard, the repeat tap and the sticky toggle included | spec: A game that joins through its tap is a full member of the mechanic |
| Its press does not move, hide or change the selection, and the rules run at the release | spec: A press that may become a drag changes nothing in the selection |
| A press that changed the selection would destroy the two facts the release needs | reason; held: src/engine/note-taking-cell.ts "highlight the mode switch must not move" |
| Scenario: the right tap and the right drag in one game | spec: A game whose press starts a drag joins the note-taking cell through its tap |
| Scenario: a repeat tap puts the highlight away | spec: A game that joins through its tap is a full member of the mechanic |
| Scenario: a sticky right tap leaves the highlight where it was | spec: A game that joins through its tap is a full member of the mechanic |

## The pencil-mode indicator is legible against the canvas and never covers the board

| Rule | Where it went |
| --- | --- |
| The glyph is sized as half a tile less its insets, clamped between 20 and 48 CSS pixels | spec: The pencil-mode indicator is legible against the canvas and never covers the board |
| Every game that takes notes reserves at least the reach at the top-right corner at every tile size, by a margin or a grown canvas, and does not rely on half a tile | spec: A game reserves the indicator's reach at every tile size |
| The test file that asserts both halves | history |
| Scenario: a fine-grained board shows a glyph that reads | spec: The pencil-mode indicator is legible against the canvas and never covers the board |
| Scenario: nothing of the board is under or over the glyph | spec: A game reserves the indicator's reach at every tile size |

## The engine owns the candidate encoding

| Rule | Where it went |
| --- | --- |
| Value `n` is bit `n` through `valueBit` and `valuesOneTo`, which refuse a value the mask cannot hold, and a game's largest value is at most `MAX_CANDIDATE_VALUE` | spec: The engine owns the candidate encoding |
| An `OverlaySidecar` keeps struck marks in a lane of their own, covered by its stale test | spec: The engine owns the candidate encoding |
| Scenario: the highest values of a 31-value game | spec: The engine owns the candidate encoding |
| Scenario: a value past the mask | spec: The engine owns the candidate encoding |
