# A new game

How a game is written here from nothing to done, and which sections of the
other guides a game of its kind needs. It rests on
[`repo-layout`](../openspec/specs/repo-layout/spec.md) (where things live, the
scaffold), [`ts-engine`](../openspec/specs/ts-engine/spec.md) and the
`engine-*` specs beside it (the `Game` contract, one spec a subject),
[`testing`](../openspec/specs/testing/spec.md) and
[`help-pages`](../openspec/specs/help-pages/spec.md). A game's own rules are
`openspec/specs/<game>/spec.md`. The other guides are listed in
[`README.md`](../README.md) § "Documentation".

## What every game does

One session writes a game whole. Its solver, hint and renderer share one
state and one set of marks, so the writing is not divided among agents.

1. **Open the change**, `add-<game>`, and settle § "Before you start" in its
   `design.md`.
2. **Find the game's kind** in § "The route by kind of game". It names the
   sections of each guide the game needs, and the rest are skipped.
3. **Scaffold.** `scripts/new-game.sh <gameId>` copies the skeleton,
   [`src/skeleton/`](../src/skeleton/README.md), to `src/games/<gameId>/` and
   `help/games/<gameId>.md`, renamed for the game. It checks that the copy
   compiles, lints and passes its tests, and prints what the copy leaves
   undone, which is the list to work through: the puzzle, the registration,
   the hint's pins, the help page, the icons, the spec. No existing game is required reading: the skeleton is a small game
   that plays, on the shared way for every concern that has one, and § "File
   anatomy" says what each of its files holds.
4. **Replace the skeleton's puzzle with yours, a concern at a time**, keeping
   its tests green: the board and the moves (`state.ts`), the rules
   (`solver.ts`), the generator, the picture, the hint's sentences. Before
   each concern, read the opening of its guide and the sections the route
   names. Where your puzzle fits the shared way, change the puzzle's part and
   leave the shape. Where it does not, the guide for the concern says what
   else a game may do.
5. **Register the game**: § "Registering a game".
6. **Write the help page and the spec**: [`help-pages.md`](./help-pages.md),
   and § "What a game's spec holds".
7. **Capture the icons**: two committed PNGs,
   `src/assets/icons/<gameId>-{64,128}d8.png`, taken from the running game in
   the dev-only `?screenshot` mode
   ([`puzzle-icons`](../openspec/specs/puzzle-icons/spec.md)).
8. **Run the app and play it**, with pointer, keyboard and touch, and ask for
   a hint at every stage of a board. Have a subagent that did not write the
   game read the hint's words against the running board.
9. **Check § "Definition of done"**, commit, and bring the game to the owner:
   § "The acceptance gate".

## Sections

| Section | Read it when |
| --- | --- |
| The route by kind of game | you are starting a game, or a concern of one, and want only the sections its kind needs |
| Before you start | the game comes from upstream or from an unfinished port, or its board is not fixed until the first move |
| File anatomy | you are deciding which file a thing goes in |
| Registering a game | the game plays in its tests and is not yet in the app |
| What a game's spec holds | you are writing or changing `openspec/specs/<game>/spec.md` |
| Comments, and what earns one | you are about to write a comment, or to cite a guide from one |
| A game with no upstream to check against | the game is new to the collection and nothing says what a right board is |
| Definition of done | you think the game is finished |
| The acceptance gate | the suite is green and you are about to call game-facing work done |

## The route by kind of game

Read the opening of each guide when you reach its concern: its `## What
every game does` and its `## Sections` table. Then read the sections below
for your kind, and any other whose "Read it when" is true of your game. A
`##` section named here is read with its `###` parts. Everything else in the
guides is for a game that is not yours.

**Which kind.** Ask what the player marks and how the board is solved:

| Kind | The player | Solved by | Exemplar |
| --- | --- | --- | --- |
| Cells with notes | types a value into a cell and pencils candidates | deduction | Unequal |
| Cells marked by state | sets each cell to one of a few states | deduction | the skeleton, Unruly |
| Edges and loops | marks the edges between cells, or joins things | deduction, with connectivity | Tracks |
| Moves and search | makes moves toward a goal, and no single move is forced | a search or a heuristic | Pegs |

**Every game.**

- [`mechanics.md`](./mechanics.md) § "The params codec and validation";
  `mechanics.md` § "Params are declared once, on `paramConfig`";
  `mechanics.md` § "The preset menu is a grid"; `mechanics.md` § "The Custom
  dialog"; `mechanics.md` § "interpretMove and UI_UPDATE"; `mechanics.md` § "A move you do not
  recognize is refused, never guessed"; `mechanics.md` § "Status".
- [`input.md`](./input.md) § "Targets and verbs"; `input.md` § "Button codes
  and a key held with Shift"; `input.md` § "A touch hold arrives as the right
  button"; `input.md` § "Keyboard cursors".
- [`rendering.md`](./rendering.md) § "The first frame and a fresh draw
  state"; `rendering.md` § "The tile cache and the diff key", without its
  parts; `rendering.md` § "Overlay sidecars"; `rendering.md` § "The win
  flash"; `rendering.md` § "Sizing"; `rendering.md` § "The palette: three
  layers, meaning first", without its parts; `rendering.md` § "What a board
  looks like: pieces on a quiet surface".
- [`solver-and-generator.md`](./solver-and-generator.md) § "Every retry loop
  is bounded".
- [`hints.md`](./hints.md) § "The quality bar"; `hints.md` § "Writing the
  narration", without its parts; `hints.md` § "A sentence has parts";
  `hints.md` § "Bind the words to the marks"; `hints.md` § "The sentences
  live in one file per game"; `hints.md` § "The hooks a hinted game
  implements", without its parts; `hints.md` § "Name the rung a step speaks";
  `hints.md` § "Every step is a gesture"; `hints.md` § "Refusal wording comes
  from one module". The other parts of the narration are read when a
  sentence meets the case its row names.
- [`hints-marks.md`](./hints-marks.md) § "Highlight, never perform";
  `hints-marks.md` § "Shade vs ring", without its parts; `hints-marks.md` §
  "Show the evidence as an area", without its parts.
- [`testing.md`](./testing.md) § "What a new game ships"; `testing.md` §
  "Pinning a hint's positions"; `testing.md` § "Running the cross-game guards
  for one game"; `testing.md` § "What a game owes the cross-game guards",
  without its parts, which are for the author of a guard.
- [`engine-catalog.md`](./engine-catalog.md): its table, before writing any
  helper of your own.

**A game solved by deduction** (the first three kinds) adds:

- `solver-and-generator.md` § "One engine, two projections";
  `solver-and-generator.md` § "The deduction fixpoint", without its parts;
  `solver-and-generator.md` § "Guess-free generation", without its parts;
  `solver-and-generator.md` § "The difficulty contract";
  `solver-and-generator.md` § "A tier means exactly its rung";
  `solver-and-generator.md` § "The solvable-game contract".
- `mechanics.md` § "Difficulty is a declared contract"; `mechanics.md` §
  "Mistake checking is part of done".
- `hints.md` § "Cognitive load: one step per hint"; `hints-marks.md` § "Group
  one firing into one step".
- It skips [`hints-search.md`](./hints-search.md) whole.

**Cells with notes** adds:

- [`hints-candidates.md`](./hints-candidates.md): its opening, and the
  sections its table sends your game to. No other kind opens it.
- `mechanics.md` § "Pencil marks: the full note-taking UX".
- `input.md` § "The on-screen keypad"; `input.md` § "The numeric keypad never
  arrives".
- `rendering.md` § "The note-taking cell's picture".
- `solver-and-generator.md` § "Marks are checked like entries", and
  `solver-and-generator.md` § "The Latin family" where the board is a Latin
  square.

**Cells marked by state** adds:

- `input.md` § "A mark that drags is a sweep".
- `hints-marks.md` § "Hatch the line the sentence names"; `hints-marks.md` §
  "Give the facts a notation", where a deduction rests on something the
  board does not show.
- `solver-and-generator.md` § "Giving a deductive game an Unreasonable tier",
  only where the game is to deal boards its deductions do not finish.
- It skips `hints-candidates.md`, the keypad and the drag models.

**Edges and loops** adds:

- `input.md` § "A target that is not a grid square".
- `rendering.md` § "A mark that crosses tiles".
- `solver-and-generator.md` § "Edge games flag set edges only".
- `hints-marks.md` § "A mark on something that is not a cell";
  `hints-marks.md` § "Evidence for a connectivity deduction"; `hints-marks.md`
  § "Give the facts a notation".
- `engine-catalog.md` § "`dsf.ts` — union-find"; `engine-catalog.md` §
  "`findloop.ts` — loop/bridge finding"; `engine-catalog.md` §
  "`border-grid.ts` — the shared border-marking mechanic" where the player
  draws walls between regions.
- `mechanics.md` § "Bespoke geometry" and `input.md` § "Giving a geometric
  game a keyboard", only where the board is not a grid of squares.
- It skips `hints-candidates.md` and the keypad.

**Moves and search** adds:

- [`hints-search.md`](./hints-search.md): its opening, and the sections its
  table sends your game to.
- `input.md` § "Drag models" and `input.md` § "Giving a drag game a
  keyboard", where pieces are dragged.
- `rendering.md` § "Animation and flash"; `rendering.md` § "Drag previews and
  blitters", where pieces are dragged.
- `hints-marks.md` § "Marks on tiles vs marks on cells".
- `solver-and-generator.md` § "Solve and the generator's aux";
  `solver-and-generator.md` § "One answer, even when it is hidden", where the
  answer is hidden.
- It skips `hints-candidates.md`, the deduction sections above, and
  difficulty tiers unless the game has them.

## Before you start

**Triage what the game's author already knew was wrong with it**, where the
game came from upstream or from an unfinished port. The authors' status notes
and their triage are in `audit-author-known-issues`'s `audit.md` under
`openspec/changes/archive/`, and every deleted `.c`'s `TODO` block is in git
history (`git log --diff-filter=D`). The two disagree in both directions, so
read both. Put each point in the change's `design.md` as fix now, ask the
owner, or record and decline. A documented problem the game silently
reproduces is the one outcome to avoid.

**Check these interface risks before starting, not mid-change.**

| Risk | Stance |
| --- | --- |
| A board not fully determined until play starts (upstream `midend_supersede_game_desc`) | Implement `supersededDesc`: [`mechanics.md`](./mechanics.md) § "A board decided at first click". |
| "Did this move change anything?" by comparing states | The engine's: the midend keeps a move that left the board as it was out of the history. Write no comparison of your own: [`mechanics.md`](./mechanics.md) § "interpretMove and UI_UPDATE". |
| Editor-only move letters (upstream `#ifdef EDITOR`) | Do not map them, and say so in `design.md`. |
| "Print this puzzle" | No printing exists. Do not promise it. |

## File anatomy

The file shape a new game has is the skeleton's
([`src/skeleton/grid/`](../src/skeleton/grid/)). A game with no deduction or
no dealt board has no `solver.ts` or `generator.ts`, and a large game splits
further. The games written before the skeleton hold to it less evenly: take
the population of any row with `ls src/games/*/<file>`.

| File | Holds |
| --- | --- |
| `index.ts` | The `Game<…>` object and its glue: the target verbs, `status`, `solve`, `findMistakes`, the difficulty contract, `hintGesture`, `registerGame(...)`. |
| `state.ts` | The state, params, move and `Ui` types; `paramConfig`, the presets and the params codec; the desc codec, `newState`, `cloneState`; and `executeMove`, here so that `hint.ts` can run a move without importing `index.ts`. |
| `solver.ts` | The deduction ladder, declared once and run two ways: to a fixpoint (the generator's gate, `solve`, `findMistakes`) and one firing at a time (the hint). The rung list, as the kinds of reason a firing carries. |
| `generator.ts` | `newDesc`: a board, and the retry until it needs exactly the tier asked for. |
| `render.ts` | `redraw`, the palette indices, `computeSize`, the per-tile cache, the hint's marks. |
| `hint.ts` | The hint's plan: the solver's firings turned into steps, and `hintKeepTrack`. Always its own file, however short. |
| `hint-text.ts` | Every sentence the hint speaks, exported as `say` ([`hints.md`](./hints.md) § "The sentences live in one file per game"). |
| `<game>.test.ts` | The game's own behavior: codecs, moves, completion, the mistake check, a save, the frame. |
| `<game>-generation.test.ts` | Every board dealt needs its tier, and every rung fires on dealt boards. |
| `<game>-hint.test.ts` | A pinned position and sentence for every rung, and what holds of any plan. |

A game with a drag preview adds a small `moves.ts`, so that `render.ts` can
simulate the release move without an import cycle
([`rendering.md`](./rendering.md) § "A simulated-release preview lives in `moves.ts`").

## Registering a game

Two edits, made together because `catalog-registry.test.ts` holds them to
each other: import the game in [`src/games/index.ts`](../src/games/index.ts)
and add its catalog entry to
[`src/puzzle/catalog-data.ts`](../src/puzzle/catalog-data.ts). A game absent
from the registry cannot be played, and one that is registered is visible to
every player at once, so the entry goes in with the first registration.

Until it is registered no cross-game guard reads the game. Once it is, a few
records kept by hand refuse it until each has it: its row in
`help/puzzles.md`, and entries or snapshots in the guards that pin every
game's params and capabilities. `scripts/new-game.sh` prints the list when
it finishes, and the failing guard names each.

The entry names the game's family, one of `puzzleFamilies`, which a player
browses by. Choose the family whose other members a player of the new game
would most want to try next. If none fits, add a family, but only once it has
a second member: `catalog-families.test.ts` refuses a family of one. Work
that needs a family as its population writes `puzzlesInFamily("latin")` and
never types the list.

## What a game's spec holds

`openspec/specs/<game>/spec.md` is read before working on the game and checked
against when changing it. It holds what a session could not get right from the
code alone, because the code says what happens and not what was meant:

- the rules of the puzzle and what counts as solved;
- the description and params encodings as the parser reads them, what each
  refuses, each preference of the game's own by its key, and anything else a
  save or a shared link depends on;
- what each control does: every button, drag, key and keypad key;
- what the hint does and says: each technique by what it concludes and from
  what, the order they are tried in, its wording rules, its marks, when it
  refuses;
- the words of its status bar, and what a preset title of its own means;
- what each difficulty tier means, and what the generator promises of a board;
- a decision about how the game looks that is the game's own, and a
  deliberate difference from upstream.

It does not hold what the `Game` type or the registry says of every game, a
copy in prose of a preset table or a palette, a rule of the collection that
the game merely follows (that is the engine capability's to state, once), or
how a thing is built.

A requirement is one behavior in `SHALL` sentences, within the 500 characters
the validator allows before the first scenario, with no date, no change id and
no account of how it was decided. The gate holds those; the rest is in
`openspec/config.yaml`, which the tool shows whoever writes a delta. A change
to something the spec already covers modifies that requirement, so the spec
keeps reading as the game and not as its history.

Writing a requirement from the code finds the code's bugs, and a requirement
never states one as the rule: it states what the help page and the rest of the
spec intend, its scenarios keep off the broken case, and the bug is filed. Run
every string and sentence a scenario quotes through the game. A scenario that
says what a hint's first step is names the board it was seen on, because an
earlier line firing first makes the general claim false.

## Comments, and what earns one

Write the comment the code cannot. Nothing in the gate notices when a comment
goes stale.

**Keep it local.** A comment describes the lines it sits above. It does not
describe what `state.ts` holds, how the midend will call you, or what another
game decided: those sentences are true when written and wrong within weeks.

**Point, don't paraphrase.** When the reader needs the neighbor, name it and
stop. `see runDeductionFixpoint` beats three sentences on what it does,
because the function is one jump away and is never out of date. Cite a guide
by file and heading name, never by a section number.

**An assertion about behavior is a claim.** If a test checks it, say which:
"every generated board is uniquely solvable at its tier, the generation test
asserts it" survives the next change. "Draws the clue in its run's color" is
a description the next render change falsifies.

**Keep, always:** provenance (which upstream behavior this derives from), a
constraint that still binds together with the reason it binds, and why
something is deliberately absent. A reader cannot reconstruct those from the
code.

**Delete on sight:** a restatement of the line below it, a narration of how
the code used to be, a bare change id or design tag standing in for an
explanation, and a count written in prose. Write the query, not its answer:
"the games that call `latinSolver`" cannot go stale.

## A game with no upstream to check against

A game new to the collection has no second implementation to compare with.
Its change says what stands in for one, normally "every generated board is
uniquely solvable at exactly its stated difficulty" as a property test
([`testing.md`](./testing.md) § "What a new game ships").

- **Reuse the frontend of a shipped game whose task matches.** Take its data
  model, input and render shape, and change only the cell content and the win
  rule. Separate on Palisade's wall model is the exemplar.
- **Flag only provably wrong state.** A live error check that fires on every
  cell of an untouched board is noise: gate it on the region or line being
  complete.
- **Probe the edges of the parameter space before advertising a range.** Deal
  at the smallest and largest sizes `validateParams` accepts. Where a size
  provably cannot generate, refuse it in `validateParams` and cover the
  boundary with a behavioral test
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Unlucky, impossible, and load-bearing validation").

## Definition of done

A game, or a change to one, is done when all of these hold:

- [ ] The interface risks were checked before starting (§ "Before you start").
- [ ] Idiomatic TypeScript, not a transliteration
      ([`mechanics.md`](./mechanics.md) § "Idiomatic state, not a C transliteration").
- [ ] The render cache is keyed on an `Int32Array`, every overlay is in the
      diff key, and the first frame paints over the midend's color-0 ground
      and never repeats it ([`rendering.md`](./rendering.md)).
- [ ] The config-summary header renders, preferences go through the `prefs`
      hook, and the Custom dialog is wired ([`mechanics.md`](./mechanics.md)).
- [ ] A uniquely solvable game ships `findMistakes`, which Check & Save
      depends on ([`solver-and-generator.md`](./solver-and-generator.md)
      § "The solvable-game contract").
- [ ] A game with pencil marks ships the full note-taking UX
      ([`mechanics.md`](./mechanics.md) § "Pencil marks: the full note-taking UX").
- [ ] Input was read against the frontend's traps, and the collection-wide
      touch guard is green ([`input.md`](./input.md)).
- [ ] A game with difficulty tiers declares `Game.difficulty` and passes the
      cross-game contract guards ([`mechanics.md`](./mechanics.md)
      § "Difficulty is a declared contract").
- [ ] Behavioral tests sit at the lowest tier that fits, new render code
      ships a tier-2.5 test, and heavy tests are seed-deterministic and never
      clock-gated ([`testing.md`](./testing.md)).
- [ ] An explained hint that meets the quality bar ([`hints.md`](./hints.md)).
      A new game ships with its hint, and a game without one is a draft.
- [ ] A help page in the standard shape: rules, `## Controls`, `## Hints`
      when there is a hint, `## <Name> parameters` last, which
      `src/help-coverage.test.ts` holds to the game's `hint()` and
      `paramConfig` ([`hints.md`](./hints.md) § "The help teaches the marks").
      Where the page names a mode it writes `{{choice:<kw>:<index>}}`
      ([`mechanics.md`](./mechanics.md) § "Params are declared once, on `paramConfig`").
- [ ] The app was run and the game played, and the owner has accepted its
      rendering, animation and input (§ "The acceptance gate").
- [ ] The openspec change was kept current and is archived on acceptance
      ([`work-management.md`](./work-management.md) § "Before archiving").

## The acceptance gate

A game-facing change ships on behavioral quality the owner has accepted:
rendering, animation and input, never a green suite alone. A suite that
asserts only state transitions can be green while the game does not render.
The rule of record is in
[`ts-migration`](../openspec/specs/ts-migration/spec.md). A shortfall is
never called "cosmetic" or "out of scope", and never deferred, without the
owner's approval.

1. **Land it behind a green suite**, make it reachable (`npm run dev`), and
   commit. Finished work is not held back for acceptance.
2. **The owner's acceptance closes the change.** Iterate on top if it is
   rejected. [`work-management.md`](./work-management.md) § "What the owner
   accepts" says which work needs it.
