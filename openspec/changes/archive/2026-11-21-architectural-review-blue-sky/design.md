## Context

Read at `717626277` (2026-11-21). "Fill games" are the 46 whose description
says `freedom: { kind: fill }`
(`grep -lE '^freedom: \{ ?kind: fill' src/games/*/*.description.yaml`): the
player fills in an answer, cell or edge by element. They hold 119,398 of the
159,095 lines of non-test game source. The other 19 are transition (12),
permutation (3) and query (4) games, and are out of this review's main line.

Counts marked "name-keyed" match function names and are lower bounds: an
inline copy is missed. Each count gives its query or the script that took it;
the scripts are throwaway and were not committed, so a count is re-taken
before a change relies on it.

## The finding in one paragraph

**Every fill game holds two models of its board.** One is upstream's, in
hand-written TypeScript: the `State`, its value constants, its `Move` union,
its `Ui`. The other is the description's: a space, an answer domain, clues
with their `means`, marks, rules, tiers. The description was added to drive
the deductions, the answer check, the help and the hint's words, and it
does. But nothing else is built from it, so the two models meet through
adapters, and every fact both need is held twice. Most of the redundancy the
owner feels at the game level comes from that split rather than from missing
helpers:

- the adapters that translate between the two models;
- the rules restated in code for live errors;
- the narration code that turns a firing back into game terms;
- the hand-kept facts that have already drifted from the description.

Above the split, the per-game furniture (input wiring, mistake hooks,
render scaffolding) repeats because each game owns its own `Move` and `Ui`
types, so the engine cannot write those hooks once.

## What a fill game writes today

Measured over the 46 fill games:

| File | Lines | Avg |
| --- | --- | --- |
| `render.ts` | 27,336 | 594 |
| `index.ts` | 24,573 | 534 |
| `state.ts` | 18,780 | 408 |
| `solver.ts` | 16,497 | 358 |
| `hint.ts` (32 games) | 13,095 | 409 |
| `generator.ts` (42 games) | 10,139 | 241 |

(`git ls-files "src/games/$g/*.ts" | grep -v test`, summed by file name.)

### 1. Two models, joined by adapters

- **Value encodings differ.** Tents stores `BLANK/TREE/TENT/NONTENT = 0/1/2/3`
  (`tents/state.ts:29`); its description says a tent is 1, grass 2, a tree 3.
  `GAME_VALUE` and `DESC_VALUE` (`tents/solver.ts:62-64`) map between the
  two. The same shape recurs in Light Up, Pattern, Slant, Magnets, Rect,
  Signpost and Unequal.
- **Index orders differ.** The space lists rows before columns, the game
  columns before rows: `clueLine` (`tents/solver.ts:106`), copied in Tracks.
- **Adapters.** `dealtOf|boardOf|marksOf|gameOf|namesOf|readsOf|...`: 118
  functions, 1,131 lines; `reasonOf` (compiled terms back into the game's
  reason) 10 games, 369 lines. Name-keyed. Up to about 1,070 more lines of
  firing-to-move glue, partly narration.
- **Marks the description models, stored in each game's own layout.** Tents'
  `links` are the description's `link` mark; the latin family's `pencil`
  bitmasks are `cand`, told to the engine again per game by `NoteEncoding`;
  Slant's `alike` is `vee`.

### 2. Declared facts, restated by hand

- **Live errors.** The compiled module has only `isAnswer(...): boolean`
  (`src/describe/compile.ts:716`): whether the whole board is right, not
  which rule fails where. So each game re-derives its rules for the red
  marks: Tents' `findErrors` (`tents/render.ts:192`, 83 lines) restates the
  description's `shape`, its `count` clue and its `pairs` rule. 965 lines in
  23 games, name-keyed (`(Errors?|InError|lineHasError)`-style names); about
  300 of them in `render.ts`.
- **Tier names have drifted.** All fill games read tier names from the
  description, and 31 still keep `DIFF_*` index constants
  (`grep -cE '^(export )?const DIFF_[A-Z_]+ *='`, 147 lines). In about 17
  games they name other tiers than the description: Tents' `DIFF_TRICKY` is
  "Normal"; Towers' `DIFF_HARD`/`DIFF_EXTREME` are "Normal"/"Tricky"; Bricks
  has a `DIFF_TRICKY = 2` beside tiers `[Easy, Unreasonable]`.
- **`sizes` reaches no runtime code.** The description's `sizes` is read only
  by the compiler and the soundness tools; `paramConfig` states its own
  bounds, and they disagree: Wordtrail's description says 1–12, its code 2–8;
  Crossing 1 against 2; 21 descriptions write a placeholder `max: 99999`.
  `name` is held by both the description and `catalog.ts`, and `family` by
  both under two different taxonomies (Tents: `shading` and `objects`).
- **The generator derives clues the description defines.** Tents' generator
  counts each line's tents by hand; the `count` clue's `means` already says
  `count(c in cells(at) where value(c) = 1) = v`.

### 3. Narration said twice

40 descriptions state their hint's words in `steps`, and 33 of those games
still have a `hint.ts`, 17,505 lines in all (the 25 without `steps`: 2,588).
In Tents (`hint.ts`, 595 lines) the YAML says each step's marks and terms;
`say` restates each step as a typed function, and `stepsOf` recomputes
from the game's `TentsReason` the terms the technique's binding already held
(`taken`, `area`, the direction `to`). A technique's binding, its reason, the
step's terms and the sentence's arguments are four forms of one thing.

### 4. Wiring that cannot be shared because each game owns its types

- **Move.** 45 distinct `Move` types, 421 lines. About 21 are only "write
  these values at these elements, or solve"; 4 add one variant; 13 are the
  candidate family, and Keen's `KeenMove` (`keen/state.ts:489`) re-spells the
  engine's `CandidateMove` (`engine/hint/candidate-hint.ts:94`) field for
  field. About 8 are genuinely their own (Net, Rect, Signpost, Galaxies,
  Dominosa, Bridges, Ascent, Subsets).
- **Ui.** 45 distinct types, 687 lines. `cursor` in all 46; the
  note-taking fields re-declared one by one in 13 games rather than
  extending `NoteTakingUi`.
- **Hooks that compare with the answer.** Hand-written beside an engine
  helper that does it: `findMistakes` 20 games/447 lines, `clearMistakes`
  28/301, `revealOne` 15/144, `solve` 28/370.
- **Input.** The 12 candidate games paste one `interpretMove` (Keen
  `index.ts:171` ≈ Solo `index.ts:198`) and one hint block (35–45 lines
  each). Six games' `interpretMove` only calls `interpretTargetVerbs`,
  though the game already declares `targetVerbs`. Shift/Ctrl-arrow painting
  is written 7 times, about 170 lines.
- **The literal.** The 46 `Game` literals are 3,485 lines, 921 of 1,320
  properties pass a name straight through; 34 games write
  `animLength: () => 0`.

`src/engine/edge-clue-latin/play.ts`, which Adjacent and Unequal share
whole, is the one place a family's input, solve, mistakes and mark-all are
already written once: the precedent for what follows.

### 5. Render: furniture outweighs the art

Over 18 fill games read line by line (10,480 lines, ±10% a category):

- **Puzzle's own art**: 11%, and 8% without Bridges. Light Up's is 14 lines,
  Pattern's 5.
- **Hint marks**: 14%. `markBand` is defined in 19 renderers, 7 of them
  identically.
- **Furniture**: imports, palette, geometry, draw state, key bit-packing and
  walk control together are 39%.
- **Mistake outline**: copied verbatim three times (Towers, Keen, Solo),
  drawn another way in eight more games.
- **Note loop**: written in 11 games.
- **The skeleton**: `src/skeleton/grid/render.ts` is 301 lines, of which
  about 10 are the puzzle. Every new game stamps the rest.

The engine owns the tile test but not the walk, by the decision in
`archive/2026-11-20-engine-owns-the-redraw-loop`: the walk "differs in every
way that matters". That holds for about a third of the fill games:

- Towers' 3D faces;
- Slant's vertex clues;
- Galaxies' half grid;
- Rect's edge content;
- Bridges' spans;
- Signpost's sprite;
- Loopy, Net, Ascent and Spokes, which are not tiles at all.

It does not hold for about half: Light Up, Range, Star Battle, Norinori,
Filling, Mosaic, Magnets, the edge-clue Latin cells, and Tents' and
Pattern's cells. There the walk is the skeleton's, verbatim. That decision
weighed one design for every game, not an opt-in path beside the explicit
walk.

### What is genuinely the game's

- The game-ID codec, 1,960 lines in 43 games: upstream's descs must load, so
  the byte grammar stays each game's own, though it can lean more on the
  shared readers.
- The answer sampler in the generator.
- The art.
- Techniques and wordings the description cannot state.
- Odd input: Bridges, Rect, Signpost, Ascent and Filling's drags.

## Prior art

A subagent surveyed these on 2026-11-21. Sizes are estimates from the
public trees.

- **pzprjs (puzz.link)**, 188 variety files, median about 300 lines.
  - One universal board of cells, crosses, borders and outside cells, each
    with the same typed slots: given, answer and player mark.
  - A variety subclasses shared input, encode, graphic and check classes and
    overrides what differs.
  - The answer check is a declared `checklist` of named checks over about 74
    shared checkers. Each check carries the error it highlights.
  - Rendering is a declared list of layers.
- **cspuz, noqx, grilops**: solvers covering 175, 188 and 38 genres, at about
  100, 90 and 70 lines a genre. All three converge on a small shared set of
  hard primitives: connectivity, single loop, region division, polyomino
  placement, sightlines, all-different. Everything else is a short list of
  parameterized rule templates.
- **Step-wise explanation** (Bogaerts, Gamba, Guns, AIJ 2021; CPMpy
  `tools.explain`): a hint step is the smallest set of constraints and facts
  that forces a new fact. It names constraint instances, not human
  techniques, so prose still needs a template per kind of rule.
- **PuzzleScript, Penpa+**: declared rewrite rules for movement games; a
  universal mark vocabulary that renders any pencil puzzle.

**The lesson.** Where per-genre code is a page, three things hold. The board
model is the engine's, not the genre's. The rules are declared once and are
the checker as well as the solver. Rendering and input key off the model's
slot types. This project already has the hard part (a description language
that compiles to sound, narratable techniques). What it lacks is the first
of those three: the board model is still each game's.

## The target

**A fill game is its description, plus the few things only it can say.**

1. **The description's model is the state.** The engine keeps a fill
   game's board in one generic store, laid out from the description:
   - the answer values on the elements the answer's `sort` names;
   - the `marks` (notes, links, done marks);
   - the dealt clues.

   One engine `Edit` move sets values and marks at elements, and a `solve`
   is an `Edit` too. One engine `Ui` holds the cursor, the note mode and the
   drag. The game declares the value names it needs in code (`TENT`,
   `GRASS`) once, in the description.
2. **Built from it, by the engine**, with no game code:
   - `executeMove`;
   - `status`, from `isAnswer`;
   - `findMistakes`, `clearMistakes`, `revealOne` and `solve`, from the
     answer;
   - `markAll`;
   - `newUi` and `changedState`;
   - `textFormat` from a glyph per value;
   - the `dealt` adapter, which disappears because the store already is
     what the ladder reads;
   - the hint's targets and its tracking, because a step's move is an
     `Edit` on elements.
3. **Rules compile to violations, not only a verdict.** Beside `isAnswer`,
   each rule, shape constraint and clue `means` compiles to "where it is
   broken" on a partial board: the clue that is overfull, the two tents that
   touch. That is pzprjs' checklist, from statements we already have. Live
   errors are drawn from it, and every `findErrors`/`markErrors` goes.
4. **A step's words come from its binding.** The terms and marks a `steps`
   entry names become expressions over the technique's binding, evaluated
   by the runtime. `say`, `stepsOf` and `reasonOf` go, and a game's
   `hint.ts` holds only what the description cannot state.
5. **One declaration per parameter fact.** The difficulty item and the size
   bounds are built from the description's `tiers` and `sizes`, or those
   fields leave the description. No `DIFF_*` constant and no second `name`
   remain. The codec's letters stay in code, since game IDs hold them.
6. **Input by archetype.** The game names its archetype, and the engine
   supplies `interpretMove`:
   - target verbs with a sweep;
   - the note-taking cell (the candidate family, as `edge-clue-latin/play.ts`
     already does for two games);
   - line drawing.

   Drag-a-shape games keep their own.
7. **Render by layers, opt in.** A plain-cell game supplies a painter per
   value and, optionally, a clue-margin painter. The engine draws the rest,
   in z-order layers so a game can still put a mark under its content:
   - the surface, grid and frame;
   - the notes and the cursor;
   - the error outline;
   - the hint marks;
   - the flash and the cache.

   The explicit walk stays, as it is, for the third that do not fit.
8. **Clues derive from `means`.** The generator samples an answer; the
   engine evaluates each clue's `means` on it to write the clues, and runs
   the tier gate. The game writes the sampler and, where it reduces clues,
   which to try removing.

What stays in `Game`: the full contract, unchanged, is the low-level form.
Transition, permutation and query games, and any fill game that overrides a
part, use it as today. A fill game reaches it through one
`fillGame(description, { codec, sample, paint, ...overrides })`, as
`edge-clue-latin` reaches it for two games now. An override says why, as the
doctrine asks.

## What it would remove, roughly

Upper bounds, from the counts above; a pilot measures the real figure.

| Part | Lines, fill games | Goes with |
| --- | --- | --- |
| Adapters and reason translation | 1,500–2,600 | 1 |
| Hand-written answer-compare hooks | about 1,260 | 2 |
| Candidate input and hint wiring | about 2,000 | 2, 6 |
| `Game` literal pass-through | about 2,500 | 2 |
| Live error checkers | about 965 | 3 |
| Narration said twice | a large share of 17,505 | 4 |
| Render furniture in plain-cell games | 60–70% of their render, about 8,000 | 7 |

Every new fill game is spared the same, which is the payoff that matters at
dozens to hundreds of games. On today's evidence a plain fill game would be
its description, a codec, a sampler and its art: a few hundred lines rather
than the median 2,150.

## What it costs, and what is the owner's

- **Saves (owner's call).** Saves store moves as JSON (`SaveEnvelope.moves`
  in `engine/midend/save.ts`), so moving a game onto the engine's `Edit`
  changes its save format. Two ways through:
  - **A legacy reader.** Each migrated game keeps a decoder from its old
    move to an `Edit` for loading old saves. It is about 10–30 lines a game,
    and it is the cheaper way.
  - **A clean break.** A save written before the move stops loading.

  Game IDs and shared links do not change: the codec stays each game's.
  Save compatibility runs one way only: an older app need not read a newer
  save.
- **The frozen generator fixtures.** 46 games have a differential test
  (`git ls-files 'src/games/*/*-differential.test.ts'`), most pinning the
  generator byte for byte against C traces that cannot be regenerated
  (`tents-differential.test.ts`). A generator moved onto derived clues deals
  other boards from the same seed. The doctrine allows that, since the app
  hands out boards, not seeds, but the fixture goes with it. This is a loss
  of a regression net for that generator, and its replacement is the
  description's soundness and tier checks.
- **The compiler gets bigger.** `src/describe/` is already 16,702 lines.
  Violations and binding-evaluated terms add to it. This moves cost from 46
  games to one place, which is the doctrine's direction. But the compiler
  becomes a harder thing to change, and the soundness checker must cover
  violations too.
- **Performance.** A generic store and a layered painter cost indirection.
  The scene-graph contract withdrawn on 2026-05-21 lost on frame time and
  was piloted on a game too simple to test it. The pilot here measures frame
  time and hint-walk time on a game that pressures the design.
- **Two paths.** `fillGame` beside the raw `Game` is two ways in. That is
  defensible only if the kit is the one obvious way for a fill game and an
  override is rare and justified.

## The route

The owner, 2026-11-21, set the end state this route serves: no imperative
code addressed to one game, a game being its description alone
(`docs/doctrine.md` § "Where the engine is heading: a game is its
description"). Under it the shared board (target 1) is not one option among
several but the foundation: the next game's description can reuse a
capability only if the capability speaks the engine's vocabulary rather
than one game's own types. Stages, each its own change:

0. **`state-each-game-fact-once`**: corrections, whatever else happens.
   - The `DIFF_*` constants named by the description's tiers.
   - `sizes` consumed by `paramConfig`'s bounds, or deleted from the
     description, with Wordtrail's and Crossing's drift settled.
   - One `name`, and one meaning of `family`.
   - The engine's `interpretMove` for a game whose `targetVerbs` say it all.
   - `animLength` absent rather than `() => 0`.
1. **`retire-the-c-reference-ties`** (§ "Ties to the C version").
2. **`rules-say-where-they-break`**: compiled violations (target 3), and
   live errors drawn from them. Needed under any future, and the first
   capability the description drives beyond the answer check.
3. **`a-game-from-its-description-alone`**, the pilot (targets 1, 2, 4, 7,
   8):
   - the engine's board, `Edit` and `Ui`;
   - a new fill game written with no TypeScript of its own, each gap closed
     by an engine capability;
   - Tents moved to the same standard, as the stress test.

   It measures lines, frame time, hint-walk time and hint quality, and
   whether the second game needed fewer new capabilities than the first,
   which is the vision's real test. It ends with a guard on the lines of
   TypeScript under `src/games/`, a ratchet that only goes down.
4. **Migrate by family**, each batch its own change once the pilot holds:
   - the candidate family (the former "kit" stage, now an input capability
     on the engine's board, since saves may break);
   - the plain-cell games;
   - the poor-fit third, with the explicit render walk kept where it must
     be.

Filed now: 0 to 3, in that order. Stage 1 frees the generators the pilot
rewrites, and stage 2 is a capability the pilot uses.

## Ties to the C version

The owner, 2026-11-21: "I'd probably at this stage get rid of anything that
we have that is tying us specifically to the C version and doesn't have any
other benefit to us." Census at `017e0b32c`:

| Tie | Other benefit | Verdict |
| --- | --- | --- |
| Byte-match differentials: 56 `*differential*` files, 4,349 lines; 49 frozen `__fixtures__/*c-reference.json`, 1.1 MB; 30 call `describeDescDifferential` | A change detector under refactoring, but one that can never be re-recorded, so it also blocks every intended generator change | Retire |
| Solver-agreement differentials: a C board must grade at C's tier | Ties our tiers to C's definitions, which the descriptions now own | Retire |
| The RNG-draw-order discipline: `docs/testing.md` § "Byte-match: fidelity where there is a right answer", and "byte-match critical" headers in 20 generators | None | Retire; generators become free to take derived clues (target 8) |
| `engine/random` reproducing `random.c`, with its C-recorded `corpus.json` | Determinism, which any seeded generator gives | Keep the code; drop the constraint and the corpus test |
| Upstream's game IDs and params strings load (`guards/upstream-descs.test.ts`, `puzzle/upstream-params.test.ts`) | A player's link from Simon Tatham's site opens here (`docs/doctrine.md` § "Upstream", best-effort) | Keep, on a slim corpus of params and descs drawn from the retired fixtures |
| Upstream links, `licenses/`, provenance comments | Credit and license | Keep |

Queries: `git ls-files '*differential*' | xargs cat | wc -l`;
`git ls-files '*__fixtures__*' | grep -i c-ref`;
`git grep -l describeDescDifferential -- 'src/games/*'`;
`git grep -liE 'byte-match' -- 'src/games/*/generator.ts'`.

This becomes stage 1 of the route, independent of the rest: retire the
first four rows, re-found the upstream-ID guard on a slim corpus, and
rewrite the guides' byte-match passages as what replaces them (the
description's soundness check and the deal's tier gate).

## Open questions for the owner

1. **Saves.** Answered 2026-11-21: "Happy to break compatibility with old
   saves too." A game moved onto the engine's `Edit` writes no legacy
   reader; a save from before its move stops loading.
2. **The frozen C generator fixtures.** Answered 2026-11-21: retire every tie
   to the C version with no other benefit (§ "Ties to the C version").
   Upstream's game IDs keep loading, since that serves players, unless the
   owner says otherwise.
3. **Which stages to file.** Answered 2026-11-21: the owner took the end
   state of a game being its description alone ("that does sound good.
   Please write it up"), with the game's art from the engine left for a
   later conversation. Stages 0 to 3 of § "The route" are filed.
