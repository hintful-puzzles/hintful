# Design

Written 2026-10-12 by the session that took the change up. Every figure was
measured that day; the query is given where there is one.

## Where this stands

- **The order is done and held.** Every requirement of the 57 game specs has
  its subject in its title, the specs are sorted into one order, and the gate
  refuses a spec that is not (`scripts/checks/spec-subjects.mjs`).
- **The cut is made** (2026-10-12), by the owner's choice of option C,
  amended: § "The owner's answer" is the rule it followed and § "What the
  cut measured" is what it came to. § "The question for the owner" is kept
  as what was asked, and its recommendation of A is superseded.
- **What is left** is in `tasks.md`: the findings the readers made (3.4a),
  a last whole read of the specs the guide names as the ones to copy, and
  the archive.

## The order

Ten subjects, in the order a spec is read: what the puzzle is, how a board is
named, how one is made and solved, how it is played, what helps the player,
what it shows.

`Rules`, `Params`, `Description`, `Generation`, `Solver`, `Controls`,
`Preferences`, `Hint`, `Status bar`, `Look`.

`docs/new-game.md` § "What a game's spec holds" says what each holds and how a
requirement about two subjects is filed. Three things about the list were
decided by the sample (§ "The sample") and by the eight readers who filed the
1,943 requirements:

- **`Generation` and not "Difficulty", and before `Controls`.** Sixteen games
  have no tiers and still promise something of a dealt board, and a tier's
  meaning is what the hint's requirements then build on.
- **`Solver` has a subject.** The first list had "Solve", the command. Six
  of the eight readers reported the same gap unasked: a search that counts a
  board's answers, or a solver's verdict that a position is impossible, is
  read by the generator, the mistake check, Solve and the hint, and belonged
  to none. They had filed it both ways. A second pass over the 235
  requirements near that line (two readers, one written rule) moved 53 from
  `Generation` to `Solver` and 12 "a pasted board opens at the difficulty it
  needs" from `Description` to `Generation`.
- **`Status bar` and not "Status"**, which collided with a game's won and
  lost status (that is `Rules`). What a preset's title means is `Params`.

No "Mistakes" subject: what is flagged is `Rules` and how it is drawn is
`Look`, by a tie rule. Two readers asked for one. It would take a sentence
from each of three requirements in most games, and a requirement's body was
not to change.

What it bought, by subject (`readSpec` over each game, bytes of each
requirement):

| Subject | Requirements | Bytes | Games |
| --- | --- | --- | --- |
| Rules | 202 | 128,291 | 57 |
| Params | 238 | 165,996 | 57 |
| Description | 140 | 109,244 | 57 |
| Generation | 143 | 102,613 | 52 |
| Solver | 92 | 73,401 | 41 |
| Controls | 271 | 197,057 | 57 |
| Preferences | 34 | 22,342 | 19 |
| Hint | 540 | 400,511 | 53 |
| Status bar | 24 | 13,441 | 20 |
| Look | 260 | 164,247 | 57 |

A session working on a game's hint reads its `Hint` requirements, a mean of
7.6 KB, where it read the file, a median of 24 KB.

## The form of a title, and how the order is held

`### Requirement: <Subject>: <the title it had>`. The subject is a key from a
closed list, read up to the first colon and space; the old title follows
unchanged.

- **Why the title and not a heading over each group.** openspec's archiver
  rebuilds a spec as an ordered list of requirement blocks
  (`buildUpdatedSpec`, `extractRequirementsSection` in the pinned tool). A
  `###` heading that is not a requirement is carried as the tail of the block
  before it, so it moves or vanishes with that requirement, and a requirement
  a delta adds is appended after the last. Only the title travels with the
  requirement.
- **What the check holds**: every game directory has a spec; every title
  leads with a subject of the list; the subjects are in order; the spec
  rebuilds byte for byte from its heading and its requirements, so `--fix`
  can sort it; and the spec holds what its game owes.
- **What a game owes is read from the game.** `Rules`, `Params`,
  `Description` and `Controls` always; `Hint` with `hint`; `Status bar` with
  `statusbarText`; `Generation` with `difficulty`. No test may read
  `openspec/` (`src/gate-scope.test.ts`, which is what lets a spec-only commit
  skip the suite), so the check cannot load a `Game`. It reads the snapshot of
  `src/capability-surface.test.ts`, which records each game's optional members
  and fails when the record and the object differ.
- **What makes it fail silently.** A requirement filed under the wrong
  subject passes: the check reads the title. A game whose spec has one thin
  `Hint` requirement passes: it holds that a subject is present, not that
  each technique is stated, which the census of
  `state-what-a-games-spec-never-did` held by reading. `Preferences` is not
  owed by the check: the record says a game has `prefs`, and not whether one
  is its own and not the engine's pencil preferences. A game missing from the
  snapshot fails loudly, as does a snapshot read that comes back short.
- **What it found on its first run**: Rectangles has a status bar and had no
  `Status bar` requirement. The sentence was the last of "Rectangles input".
  It is now a requirement of its own, the one place this change altered a
  body.
- **Seen to fail** on Flood's status-bar requirement retitled `Look:` (a
  subject owed and absent), a `Rules:` requirement retitled `Hint:` (out of
  order, and `--fix` moved it), and a title led by `Mistakes:` (no subject).

## How the 1,943 were filed

- **Eight readers, seven or eight specs each**, given the subject table and
  the tie rules, wrote one subject per requirement. A script refused a file
  whose titles were not the spec's, in order.
- **The instrument was checked against a second reading.** The six sample
  specs had been given subjects by other readers for another purpose. The two
  agreed on 186 of 208. Of the 22, 11 follow from the list having changed
  between the two readings (a preset title, a validation refusal, the
  solver). The other 11, about 5%, are requirements on a line between two
  subjects, most of them a preference filed with the control it changes.
- **Twelve were settled by hand**: nine that fit no subject (Dominosa's
  reference panel and Guess's saved half-row to `Controls`, the Mines clock
  to `Rules`, Light Up's vocabulary to `Params`, Untangle's replayed layout
  to `Description`, Palisade's and Separate's "clue layer stays its own" to
  `Hint` and `Look`) and three a reader said its tie rule had decided badly.
- **The edit was verified by its shape**, not by a green gate: for each spec,
  the multiset of requirement bodies and scenarios equals the commit
  before's, each title is a subject and the old title, the order inside a
  subject is the old order, and the text above the first requirement is
  unchanged. `git show --stat 13a4d7e4` is 13,814 lines each way.
- **The specs were edited in place**, with no delta. A delta cannot say order,
  and 1,943 `RENAMED` pairs would have left every spec out of order from the
  archive until a sort. No citation of a game's requirement by title exists
  outside `openspec/` (`node scripts/checks/spec-citations.mjs --list`: 109
  citations, none of a game capability), so task 2.2 had nothing to repoint.

## The sample

Six specs, one reader each, every requirement read against the game's code
and the engine capabilities and put in one of three classes:

| Spec | Kind | Requirements | Bytes | States what the code cannot | A second copy, removable whole | A second copy but for one sentence |
| --- | --- | --- | --- | --- | --- | --- |
| flood | smallest | 16 | 9,284 | 12 | 2 (798) | 2 (1,251) |
| clusters | cell states | 21 | 17,078 | 15 | 1 (430) | 5 (4,005) |
| keen | Latin | 30 | 19,366 | 21 | 6 (2,979) | 3 (1,974) |
| inertia | search | 33 | 22,704 | 29 | 0 | 4 (2,366) |
| palisade | edges | 40 | 30,546 | 23 | 11 (7,424) | 6 (4,788) |
| loopy | largest | 68 | 53,797 | 56 | 6 (4,314) | 6 (4,742) |
| **All** | | **208** | **152,775** | **156 (77% of bytes)** | **26 (10%)** | **26 (13%)** |

The 52 second copies are of two kinds, in nearly equal measure:

- **27 restate a declaration** (17,872 bytes, 12%): the field list of
  `paramsCodec` or `paramConfig`, the preset table, `prefs`, `targetVerbs`,
  `requestKeys`, the hint's legend (`hintMarks`), the palette.
- **25 restate a rule of the collection** (17,199 bytes, 11%) that an engine
  capability states once, with the game's name in it: "provides an explained
  deduction hint", "flags mistakes against its unique solution", "generates
  boards uniquely solvable at the requested difficulty".

What the sample showed that the proposal did not expect:

- **The share is a quarter, not "much".** A search game hands the engine few
  declarations (Inertia: 4 of 33 removable); a border-grid game shares the
  most with the engine (Palisade: 17 of 40).
- **A hint's rung list is not the order its techniques are tried in.** The
  proposal named "the order of the hint's rungs" as a restated declaration.
  In Palisade and Loopy nothing reads `hintRungs` for order: the round is the
  solver's hand-written loop, and Loopy's list has its loop-closing rungs in
  the middle while the spec tries them last. Those requirements stay.
- **A hand-written codec is not a declaration.** Flood's and Keen's params
  encodings are functions, so their requirements stay; where a game uses
  `paramsCodec`, the letters are the field list and
  `params-stability.test.ts` holds every string.
- **Half the copying is inside requirements that stay.** Four readers
  reported that a third to a half of the requirements they kept carry one
  sentence or scenario an engine requirement already states (Clusters: 9 of
  its 15, about 2.5 KB more). A cut by whole requirements misses it; a cut by
  sentence rewrites requirements.
- **Three sentences have no other home.** Each was the one thing a removable
  requirement said that nothing else does, and belongs in an engine
  capability: that a hint step never sets the solver-used record
  (`ts-engine`), that a wrong-button click on a hinted edge does not complete
  the step (`border-grid`), and the dot-run description grammar Clusters and
  Unruly share letter for letter (`engine-params`).

## The rule for what goes

A game's spec does not hold a second copy of something stated elsewhere.
`docs/new-game.md` § "What a game's spec holds" now names the three kinds
(what the game declares to the engine, a rule of the collection the game
merely follows, what the `Game` type says of every game) and what stays (what
a hand-written function does, and the promise a declaration cannot make: what
a missing field decodes to, why a size is refused). **The guide binds the
next spec written from today**, Star Battle's first. Whether the 57 are cut to
it is the question below.

## The question for the owner

**Should the 57 existing specs be cut to the rule, and how deep?** The sample
says what each depth costs and buys. `sample/` in this change holds Clusters
and Palisade as they would stand after the deepest cut, each with a ledger of
what was removed and where it is stated instead; the "before" of each is
`openspec/specs/<game>/spec.md`.

| Spec | Before | After the deepest cut | |
| --- | --- | --- | --- |
| clusters | 17,754 bytes, 21 requirements, 34 scenarios | 13,582 bytes, 17 requirements, 25 scenarios | −23% |
| palisade | 31,602 bytes, 40 requirements, 61 scenarios | 21,596 bytes, 28 requirements, 43 scenarios | −32% |

**What the two writers said the cut did badly**, in their ledgers' last
section and worth reading before the specs:

- **A kept sentence loses its qualifier when its requirement goes.**
  Clusters' "refuses Normal on fewer than 12 squares" now reads as
  unconditional; that it binds generation only is in `engine-difficulty`.
- **A subject is left hollow.** Palisade's `Controls` is one sentence about a
  corner case, and no spec then says what its buttons do: `border-grid`'s
  Purpose sends the reader to `palisade` for that. Its `Hint` no longer says
  when the hint refuses or what its marks are.
- **Several cuts are honest only if an engine capability gains a sentence
  first**: `border-grid` states the under-size reddening and the keep-track
  verdict only by a parenthesis or by a scenario set in Separate.
- **One "restatement" was load-bearing.** `engine-params` says a missing
  difficulty decodes to "the tier the game's spec gives", so Clusters' "an ID
  that carries no difficulty is Easy" stays, under a title written for it.
- **Most of Clusters' copying is a clause inside a sentence that also says
  something of the game's own**, which only rewording removes.

| | What is done | Size of the 57 | The work |
| --- | --- | --- | --- |
| **A. Leave the 57** | The rule binds new specs only; an old one is cut when a change next touches it | 1.39 MB | none |
| **B. Remove the whole copies** | The requirements a declaration or an engine requirement states entirely, about 26 in 208 | about −10% | each of some 240 removals read against the thing said to state it, then reviewed, as the census was: twenty agent runs |
| **C. B, and cut to the kept sentence** | Also the requirements that are a copy but for one sentence, and the copied sentences inside kept ones | about −25% to −30% | as B, and some 500 requirements rewritten, each a `MODIFIED` delta restated whole; the three homeless sentences first become engine requirements |

**My recommendation is A, with B for a spec when a change is already in
it.** The reasons:

- **The goal this series serves gets its gain from the rule and the order,
  both already in.** A new game's spec is written to the rule, so it owes
  about a quarter less than the 24 KB the proposal measured. A session on one
  concern of an old game reads one subject. Cutting the 57 changes neither.
- **B and C buy 2.4 KB to 10 KB a spec** on a file a session now reads a part
  of, and C's rewrite is of the specs "a change is checked against", by the
  same kind of reading that the census's reviewers corrected in every batch.
  The two samples show what it costs a reader: a spec that sends them to an
  engine capability for half of what a subject is said to hold.
- **A third of what C would cut was written on 2026-10-11** by
  `state-what-a-games-spec-never-did`, whose brief asked for "the encoding,
  letter by letter". Clusters' "writes its difficulty as `de` or `dt`" is one.
  Removing them is right by the rule, and it is the owner's rule to turn.

If the answer is B or C, the work is this change's task 3, and it starts by
adding the three engine requirements. If it is A, task 3 is struck, the
`sample/` directory is deleted, and the change is archived as it stands.

## The owner's answer: C, amended

The owner's word (2026-10-12): "I want consistency across the catalog, with
the existing games being exemplars of how to implement new ones." The
skeleton stamps no spec, so the 57 are the only examples a new game's author
has, and a guide that says "do not restate" beside 57 specs that do is the
half-adopted convention this series exists to end. A leaves that; B leaves
the commoner kind of copy, the requirement that is one but for a sentence.

So the 57 are cut to the rule of `docs/new-game.md` § "What a game's spec
holds". The two samples showed a cut that only deletes makes a worse
example in places, so the cut is made under three rules of its own:

1. **The engine capability says it first.** A game's requirement, sentence or
   scenario is removed as a copy only when the declaration or the shared
   requirement named in the ledger states all of it. Where the shared
   requirement states it by a parenthesis, by another game's scenario, or not
   at all, the engine capability is amended first, in this change: the three
   homeless sentences of § "The sample", `border-grid`'s account of what the
   buttons do and of the under-size reddening, and whatever else the batches
   find. A sentence several games each state of themselves in the same words
   is the sign.
2. **No subject is left hollow.** Where a game owes a subject
   (`spec-subjects.mjs`) and everything it would say there is the
   collection's, the subject keeps one requirement that says the game follows
   the shared rule, names the capability and the requirement, and states any
   departure. A reader of the spec alone then knows where to look. The check
   holds the subject present, so this is also what keeps it green.
3. **A requirement is reworded, not only cut.** A kept sentence keeps its
   qualifier (Clusters' Normal refusal binds generation only), a title is
   rewritten when its body no longer matches it, and a copied clause inside a
   sentence that also says something of the game's own is reworded out.
   Every such requirement is a `MODIFIED` entry restated whole.

**How it is carried out**, as the census of
`state-what-a-games-spec-never-did` was: batches of games, a writer and then
a reviewer who has not seen the writer's reasoning, each removal read against
the thing said to state it and each quoted string run through the game. A
game's delta is `REMOVED`, `MODIFIED` and `RENAMED` entries under
`specs/<game>/spec.md`, and a ledger row for each says where the thing is
stated instead. The engine amendments of rule 1 are written and reviewed
before the batches that lean on them. `sample/` is the first draft of two
games and is redone under these rules, then deleted when the deltas exist.

**The specs are edited in place, with no delta** (decided 2026-10-12 by the
session that began the cut; it overrides "a `MODIFIED` entry restated whole"
above and the delta files of the paragraph before this one). The pinned
openspec refuses a `MODIFIED` block that omits a scenario the spec still has
(`findScenarioLossIssues` in its validator, and the archive throws on the
same comparison), and dropping a copied scenario from a kept requirement is
the commonest thing the cut does. By delta each such requirement would be
`REMOVED` and `ADDED` under a different title, retitled for the tool's sake
and moved to the end of its spec. So the cut is made as the reorder was: the
writer edits `openspec/specs/<game>/spec.md`, the engine amendments are
edited into their capabilities the same way, and the record is the git diff
and a ledger per game under `ledger/` in this change. What replaces the
validator's reading of a delta:

- **`tools/cut-check.mjs`** holds each ledger to the diff of its spec against
  `c86372f4`: a row for every requirement removed or changed, by the title it
  had; every new title named; the 500 characters and a scenario each. Seen to
  fail on a changed requirement with no row and on a row for an untouched
  one. It reads the shape and cannot tell that a row's "where it is stated
  instead" is true, which is the reviewer's reading.
- **`brief.md`** is what a batch's writer and reviewer are given.
- `openspec validate --all --strict`, `spec-subjects.mjs` and `spec-form.mjs`
  read the specs themselves on every commit.

`tools/` and `sample/` are deleted before the archive; the ledgers stay.

**What is not cut**: what a hand-written function does; a hint technique by
what it concludes and from what; the order techniques are tried in where a
loop and not `hintRungs` fixes it; a promise a save or a shared link depends
on that a declaration does not make (what a missing field decodes to).

## What the cut measured

Measured 2026-10-12 against `c86372f4`, the specs as the reorder left them
(`tools/cut-check.mjs` with no argument; by subject, `parseSpec` over each
spec before and after).

**The 57 specs lost 10%, not the 25% to 30% the question to the owner
estimated**: 1,412,226 to 1,265,023 bytes, 1,948 to 1,793 requirements, 2,654
to 2,370 scenarios. 1,245 requirements are untouched, 324 are changed under
the title they had, and 379 are removed or retitled. The engine capabilities
gained 47 requirements and 54,533 bytes to state once what the games had each
stated, so the specs as a whole are 92 KB smaller.

| Subject | Requirements | Bytes | After | Bytes | |
| --- | --- | --- | --- | --- | --- |
| Rules | 206 | 132,597 | 202 | 121,973 | −8% |
| Params | 238 | 165,996 | 196 | 130,765 | −21% |
| Description | 141 | 110,717 | 135 | 106,286 | −4% |
| Generation | 143 | 102,613 | 131 | 86,074 | −16% |
| Solver | 92 | 73,401 | 91 | 65,299 | −11% |
| Controls | 271 | 197,250 | 265 | 191,640 | −3% |
| Preferences | 33 | 21,959 | 29 | 18,426 | −16% |
| Hint | 540 | 400,511 | 467 | 345,230 | −14% |
| Status bar | 24 | 13,441 | 23 | 13,057 | −3% |
| Look | 260 | 164,157 | 254 | 155,805 | −5% |

By game the cut runs from Palisade's 29% and Clusters' 28% to a hundred
bytes either way in Cube, Flood and Black Box; the median is 9%.

**Why the estimate was high.** It came from two specs written to the deepest
cut with deletion only, and both were of the kind that shares most with the
engine. Three things the rules then kept:

- **A hand-written function is not a declaration**, and 23 games write their
  params codec by hand, 30 their input. Most of `Controls`, the largest
  subject after `Hint`, states what `interpretMove` does.
- **Rule 2 gives back some of what rule 1 takes.** A subject emptied of
  copies keeps a pointer requirement.
- **A promise to a player's data stays.** What a string that leaves a field
  out decodes to, and a preference's key where no test pins it, are declared
  and are kept, because a link or a stored preference depends on them.

**What was learned in the making**, each now in `brief.md` or the guide:

- **A copy swapped for a citation is still the copy.** The first batches
  replaced a restated rule by a sentence saying the rule is the collection's
  and where. A spec cut that way lost nothing (Light Up and Magnets came
  back at 0%, Pegs grew). A pointer is for an owed subject that would
  otherwise say nothing of its ordinary case, and for that only. The 27
  specs reviewed before this was written had a second pass for it.
- **The sample specs carried the fault and the writers copied it.** Clusters
  and Palisade stood at 20% and 21% as first accepted and at 28% and 29%
  after the second and third passes.
- **Most of what several games each said of themselves had no engine home.**
  Three engine rounds added 47 requirements: `ledger/_engine.md`, each round
  with its review. The reviews corrected 23 of them against the code, and
  found seven requests that are the games' own, with no shared code or guard
  behind them, which stay in the games.
- **The readers found the code's bugs and the specs' falsehoods**, as the
  guide says a requirement written from the code does: tasks 3.4a.

## Found by the readers, and fixed at the owner's word

- **Clusters and Ascent refused a grid too large in a sentence of their
  own**, against `engine-params`, "A grid too large for a game is refused in
  one sentence". Both return `AREA_TOO_LARGE`, ceilings unchanged. No guard
  caught it because `params-refusal.test.ts` asks only that a refusal is a
  sentence. Slide's "must be at most 48; the solver runs out of memory beyond
  that." is left: its spec states that sentence, and it is the refusal of a
  board the solver cannot work, as Filling's, Sokoban's and Net's
  generation-only ceilings are, each with its reason. A guard keyed on the
  comparison would have to tell those from a hold limit, and was not written.
- **Loopy had no requirement stating the puzzle or what solved means.** It
  has four more under `Rules`: the loop and the clues, when a board is
  solved, and the two ways the board flags lines as drawn. The last replaced
  a clause of a `Look` requirement that the code contradicted ("every closed
  loop but the largest": a stray line beside a loop is flagged, and a loop
  closed beside longer paths is itself flagged). The help page's "every
  numbered square" now reads true of every tiling.
- **Keen's preferences requirement named two of four preferences, none of
  them Keen's own.** Removed: `engine-notes` and `engine-candidate-hints`
  state each for every note-taking game.
- **Flood's spec said nothing of `hasNoSolution`.** It has a `Description`
  requirement for which boards are refused and why. Its
  `ignoresSecondaryButton` gets none: Flood only follows `engine-input`, "A
  game with no secondary meaning is not given a synthetic one".
- **Inertia and Sokoban each kept a copy of the number pad's layout.** Both
  read it from the engine's `numpadDirection`, with every button code
  compared before and after and none differing. The bare top-row digits stay
  bound, which `docs/input.md` § "The numeric keypad never arrives" asks for.

## Found, and the owner's to decide

- **Inertia and Slide fold the secondary button onto the primary by hand**,
  where seven games declare `ignoresSecondaryButton`. The fold is one of the
  ways `docs/input.md` § "A touch hold arrives as the right button" gives, so
  it is not a defect, and Inertia's spec now says so. Taking the flag would
  change three things a player meets in Inertia: a mouse's right click on a
  square would stop sending the ball there; the bar's "Right click" toggle,
  which does nothing in this game, would go; and a held finger would act at
  once and not after the hold is detected. A census of all 57 then found
  Untangle to be a third such game, and the owner asked for the engine to
  manage it: `own-the-secondary-button-in-the-engine` holds the census and
  the one question left.
- **Three preference keys are stated in no spec**: `auto-pencil`,
  `sticky-pencil-mode` and `pencil-keep-highlight` are strings in
  `src/engine/pencil-prefs.ts` alone, and a saved preference depends on them.
  A requirement in `engine-notes` would state them once.
- **The Controls text the engine writes for Loopy speaks of "the edge under"
  a cursor that sits on a dot.** The sentence is `target-verb.ts`'s, the same
  for every game with a cursor, and Loopy's own paragraph two below it says
  where the cursor is and which edge a key acts on, so the keyboard is
  introduced twice and the first time loosely. A fix is the engine's: the
  sentence takes what the cursor rests on from the game's geometry.
- **How Loopy colors a clue's number** (too many lines, too many edges ruled
  out, and too few lines once the lines are one loop) is stated nowhere in
  its spec.
