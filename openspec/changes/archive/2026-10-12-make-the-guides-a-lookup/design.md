# Design

Every figure here was taken on 2026-10-12, with the query beside it.

## What was measured before deciding

- **The guides are 922 KB in eight files** (`wc -c docs/games/*.md`), and
  `hints.md` is 363 KB of it.
- **A section is found by its heading, and the headings are cheap.** The text
  of every `##` to `####` heading of a guide is 0.8 to 4.4 KB (`hints.md`
  3.6 KB for 106 headings, `engine-catalog.md` 4.4 KB for 92). A row that adds
  when a game needs the section costs about 90 bytes more, so a table of every
  section is 3 to 13 KB a guide.
- **722 citations name a guide and a heading** (`<guide>.md § "Heading"`,
  counted over every tracked file outside the archive, with a comment's line
  break folded), 302 of them into `hints.md`. Nothing checks that one
  resolves, and 20 did not: a heading reworded since, or a section deleted.
  So the check this change adds holds citations as well as openings, and it
  is what verifies the repointing below.
- **615 citations in 324 files name a `docs/games/` path**
  (`git grep -o 'docs/games/' -- ':!openspec/changes/archive' | wc -l`), 431
  of them in `src/games`.
- **The kinds of game**, from which engine modules a game's own files import
  (a scratch script over `from "…/engine/<module>"` in `src/games/*`):

  | Kind | What marks it | Games |
  | --- | --- | --- |
  | Cells with notes | imports `note-taking-cell` | 13 |
  | Cells marked by state | declares a difficulty contract, no notes, the state is per cell | about 22 |
  | Edges and loops | the state is on the edges between cells; `findloop` or `dsf` connectivity | about 10 |
  | Moves and search | no difficulty contract (10), `rival-judging` (5) or `slide-planner` (2) | 17 |

  The first and last are read off an import. The middle two are told apart by
  what the state is, which no import says, so the route asks the author the
  question and does not try to derive it.

## The outline of a guide

Every guide under `docs/` that is about writing a game has this shape, in
this order, and the check holds the parts a machine can read.

```
# <Concern>

One paragraph: what the guide covers and the specs it rests on.

## What every game does

The how-to. What a game does for this concern, in the order it is done, the
one way, each step pointing at the skeleton file that already does it and at
the section below that says more. No reasons, no exceptions, no named games.
At most about 2 KB.

## Sections

| Section | Read it when |
| --- | --- |
| Heading text, exactly | a clause that starts from the game or the task |
| – A `###` heading, exactly | … |

## <a reference section>
…
```

- **The opening is everything above the first reference section**: the
  paragraph, the how-to and the table. It is what a session reads of a guide
  before deciding which section it needs.
- **The table has two columns.** The first is the heading's text, exactly,
  with `– ` before a `###` heading so the nesting shows. The second says when
  a game or a task needs the section, and starts from the game ("your game
  has notes", "a drag commits on release") or the task ("a generator retries
  without bound"), never from the section ("explains how…"). Every `##` and
  `###` heading has a row and every row names a heading. A `####` heading is
  a part of its section and has no row.
- **A reference section is one contract, hook, helper or rule, readable
  alone.** It opens with the rule in one or two sentences, in the imperative.
  Then what the engine gives for it, by identifier and file. Then the
  exemplar, a file to read. A reason is one sentence beside its rule, or a
  pointer to `docs/doctrine.md`. It does not say "as above" or lean on the
  section before it.
- **A heading says when to read its section**, in a few words a reader would
  search for. A heading that is cited and already does that is kept as it is,
  because every rename is a repointing.

## What leaves a guide, and where it goes

The rule for a passage, applied a passage at a time:

1. **A rule every game follows stays**, cut to the rule, its one-sentence
   reason, the engine identifier and the exemplar.
2. **The story of how a named game came to teach the rule is deleted.** What
   was tried first, what a measurement showed on the day, which change did
   it, the count of games converted. The archive and the git log hold it. A
   named game stays only as the exemplar to read ("Towers' `hint.ts`"), with
   no narrative.
3. **A rule of one game goes to that game**, and nowhere else. If its spec
   already states it (`openspec/specs/<game>/spec.md`), it is deleted from
   the guide. If the spec does not, and it is a behavior a player or a save
   could observe, it is listed for a spec delta in this change. If it
   explains particular lines, it becomes a comment on those lines, written
   to the comment rule in the new-game guide (present tense, local, no
   history).
4. **A section about one game that holds a general rule keeps the rule under
   a heading that names the situation** and not the game: "A graph, not a
   grid (Map)" is a section a game on a graph needs, and Map is its exemplar.
   A section with no rule beyond its one game goes by step 3.
5. **A guard's insides go to the guard's header**: how it finds its
   population, what it once missed, its ledger's reasons. The guide keeps
   what a game owes the guard, in one or two sentences, and the command that
   runs it.
6. **A measurement stays only where a reader acts on the number**, with its
   date. A census of the tree is replaced by its query.
7. **Nothing normative is restated from a spec**: the guide states the rule
   briefly and names the requirement, as `repo-layout` already requires.

No rule changes. A rewriter that thinks a rule is wrong, or finds two guides
disagreeing, reports it and leaves both as they are.

## One guide a concern, and the hints guide is four

The guides stay one a concern, because a session looks things up by concern.
`hints.md` is the exception to its size and not to the rule. Of its 363 KB,
112 KB is how a step is drawn on the board, 94 KB is for a game with
candidate notes and 46 KB for a game whose hint is a search, and a game is
one of those last two or neither (the bytes under each `##` heading). So it
becomes four guides, and the split is the route by kind of game for the hint:

| Guide | Holds | Who opens it |
| --- | --- | --- |
| `docs/hints.md` | the quality bar, the narration, the plan mechanics, refusals, the guards | every game |
| `docs/hints-marks.md` | how a step is shown on the board: the marks, the legend, evidence, chains | every game, when it draws the hint |
| `docs/hints-candidates.md` | the candidate-elimination machinery and what a game with notes owes it | a game with notes |
| `docs/hints-search.md` | the hint of a game solved by search or by a heuristic | a game with no deduction ladder |

A citation of a section that moved names its new guide.

## Where the guides live

- Every guide moves from `docs/games/` to `docs/`, and `docs/games/` goes.
- `docs/games/README.md` becomes `docs/new-game.md`: the route by kind of
  game, the lifecycle of a new game, the file anatomy, what a game's spec
  holds, the comment rule, the definition of done, the acceptance gate. Its
  table of the guides is deleted, the root `README.md` § "Documentation"
  being the one index. Its account of where the C went is the README's and
  the doctrine's already.
- `AGENTS.md` loses whatever is not about how an agent works, to the guide
  for its subject.

## The check

`scripts/checks/guide-sections.mjs`, in the gate's fast prefix beside the
other guards that read `docs/`, because a guide edit is a documentation-only
commit. For every guide that has a `## Sections` table:

1. every `##` and `###` heading below the table has a row, and every row
   names a heading;
2. the opening is within its budget of bytes;
3. no two headings of a guide have the same text, a citation being by text.

And over every tracked file outside the archive:

4. a citation `<guide>.md § "Heading"` names a guide under `docs/` and a
   heading it has.

It counts what it read and fails on a count of zero, so moving the guides
out from under it is a failure and not a pass. A guide under `docs/` without
a `## Sections` table is named in the check with its reason (the repo-wide
guides that are short enough to be read whole), so a new guide is held by
default.

## The budget

**An opening is at most 12,000 bytes**, `OPENING_BYTES` in the check. The
openings measured 4.2 to 7.5 KB after the rewrite, and the engine catalog's
11.0 KB, its table being a row for each of 81 modules. The number is the
catalog's with room for a few more modules, and it is three thousand tokens:
a session that opens every guide a game touches reads about 62 KB of
openings. A guide whose opening passes it has more sections than one table
can route, and is split as `hints.md` was.

There is no budget on a whole guide. A section is read alone, so what a
guide's length costs is the length of its table, which the opening's budget
already holds.

## Decisions about the work

- **The move is the first commit**, so that every later edit is made at the
  final path and the 324 files are repointed once for the path. It is
  mechanical: `git mv`, and one substitution of the path prefix.
- **A guide is rewritten by one reader with this document as its brief**,
  several in parallel, `hints.md` in parts. Each reports the headings it
  renamed or removed, every rule it removed and where that went, and what
  it could not place.
- **The heading citations are repointed by a script from those reports**,
  and the check's fourth clause is what says none was missed.
- **A second reader, who did not write it, compares each guide with what it
  replaced** (`git show <move commit>:docs/<guide>.md`) and lists rules that
  are in neither the guide nor a destination. That is task 2.4.

## What was done

Measured 2026-10-12, at the commit that rewrote the guides.

**The sizes** (`wc -c`):

| Guide | Before | After |
| --- | --- | --- |
| `hints.md` | 362,744 | 69,141 |
| `hints-marks.md` | in `hints.md` | 72,747 |
| `hints-candidates.md` | in `hints.md` | 62,960 |
| `hints-search.md` | in `hints.md` | 29,768 |
| `solver-and-generator.md` | 143,482 | 92,538 |
| `engine-catalog.md` | 89,397 | 74,342 |
| `testing.md` | 79,559 | 55,437 |
| `input.md` | 76,939 | 56,198 |
| `mechanics.md` | 74,715 | 64,281 |
| `rendering.md` | 71,511 | 53,919 |
| `games/README.md`, now `new-game.md` | 24,003 | 21,977 |
| All | 922,350 | 653,308 |

The guides are 71% of what they were, and each rewriter was told to expect
40 to 60. The second readers were asked to cut further and could not without
cutting rules: what the first pass removed was story, and what is left is a
rule a sentence. The two that shrank least were already reference
(`engine-catalog.md` at 83%, `mechanics.md` at 86%), and each gained a 6 to
11 KB opening it did not have.

**What a game reads is the number that moved.** By the route in
`docs/new-game.md` § "The route by kind of game", summing the nine openings
(62 KB) and the bytes of each section the route names (a scratch script
over the route's citations):

| Kind | Bytes by the route | And of its own hint guide, as its table sends it |
| --- | --- | --- |
| Cells with notes | 212 KB | up to 57 KB of `hints-candidates.md` |
| Cells marked by state | 208 KB | none |
| Edges and loops | 211 KB | none |
| Moves and search | 183 KB | up to 26 KB of `hints-search.md` |

Against 919 KB that a session was told to read before, that is under a
quarter, about 52,000 tokens. It is a ceiling on the route and not on a
session, which also reads the sections whose "Read it when" turns out true
of its game.

**What the rewrite removed, and where it went.** Each rewriter listed every
rule it removed with a destination, and a second reader who had not written
the guide read the source against the guide and opened the destinations.
Across the ten guides:

- 28 rules were in neither the guide nor a destination, and were restored.
  The largest: Crossing's step that stripes both runs through a square, the
  absent-candidate half of the pencil-toggle rule, and why a deductive game
  may be untiered.
- Of about 290 removed rules said to be stated by a spec, a comment at the
  site or a guard's header, 10 were not, and each was restored, written as a
  comment, or drafted as a delta. (The readers' own counts, summed from
  their reports; each opened the destinations it counted.)
- 26 statements the old guides made were untrue of the tree and are now
  true: which presets the hint-resume walk takes, where the Marks key is
  appended, how an erase key reaches a game, what runs at a commit and at a
  push.
- 7 rules of one game went to its spec, as this change's deltas: Untangle's
  tie-break, Salad's populate-only hint and its markers, Boats' catch-all
  refutation and its journeys, Crossing's two striped runs, Galaxies' two
  ring weights.
- One rule was dropped as superseded and not lost: "adding a hint to an
  existing game is its own change", which `docs/work-management.md` now
  decides otherwise.
- What the readers found that is not a guide's to mend is filed as
  `mend-what-the-guide-rewrite-found`.

**The citations.** 55 headings were renamed and 154 citations moved to one
of the three new hints guides, by a script from the rewriters' maps, in 109
files. The check then held 1,010 citations in 353 files, none dead. The 20
that were dead before the change were among those mended. Three headings
lost a double quote, since a citation is the text between two.

**The check failing.** A heading renamed and a section added in
`docs/input.md` gave three failures (two sections with no row, one row with
no section). And before the three new guides were tracked, the check read
eight guides and passed: it lists files with `git ls-files`, as
`unused-exports.mjs` does, so a new guide is unseen until it is added to
the index. It fails on a count of zero, and not on a count that is short.

## The route test

A reader with no knowledge of the repository was given `AGENTS.md` and
`README.md` and ten questions the author of Star Battle would have, and told
to go where the documentation sent it and count the bytes of every range it
read. All ten were answered by the route, for 111,846 bytes, 15% of the
guides, and no "Read it when" sent it to a wrong section.

| Question | Bytes | Route |
| --- | --- | --- |
| Which sections to read, which guides to skip | 10,043 | direct |
| The scaffold command, and what it leaves | 10,403 | the list was only in the script's output |
| Params for a size and a count | 12,395 | the square-size rule was in a section the route left out |
| A drag that marks several cells | 8,780 | direct |
| A mistake highlight, the cache, the test owed | 12,071 | direct |
| A board of exactly its tier, bounded retries | 15,760 | direct; one routed section was for a port |
| Marking a row and binding the words | 21,553 | direct, through two openings |
| Six forced cells: one step or six | 3,457 | direct |
| The tests a game ships, pinning a rung | 10,720 | direct |
| Done, and what to run | 6,664 | "what to run" took three places |

What it showed, and what was done with each:

- **The openings are half of what a lookup costs**: 57,812 of the 111,846
  bytes, most of it section tables of 40 to 50 rows of which about one in
  six applied. The table is what makes the lookup direct, so it stays; what
  it argues for is that the route in `new-game.md` name sections outright,
  which it does, so that a session following the route can skip a table.
- **The scaffold's list of what is left was in no guide.** The how-to now
  names it, and § "Registering a game" says that records kept by hand refuse
  a registered game and that the script prints them.
- **Two routed sections were wrong for a new game**: "Solver-gated
  generation" left the route, and "The Custom dialog" joined it.
- **`params-stability.test.ts`**: the guide forbade `-u` and the script
  asks for it. Both are right, of different lines, and the guide now says a
  new game adds its lines and moves none.
- **Left to the next change in the series**: "Definition of done" names no
  one command to run, which `give-a-game-its-verdict-in-one-command` is to
  build and then name there.
- **Left as found**: the four records a registered game must be added to by
  hand are a hand-kept list of games, which `docs/doctrine.md` § "One source
  of truth" says will rot. The first new game will pay it once and say what
  it cost.
