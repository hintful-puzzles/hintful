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

## One guide a concern, and the hints guide is three

The guides stay one a concern, because a session looks things up by concern.
`hints.md` is the exception to its size and not to the rule: 100 KB of it is
for a game with candidate notes and 47 KB for a game whose hint is a search,
and a game is one or the other or neither. So it becomes three guides, and
the split is the route by kind of game for the hint:

| Guide | Holds | Who opens it |
| --- | --- | --- |
| `docs/hints.md` | the quality bar, the narration, the plan mechanics, the marks, refusals, the guards | every game |
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

Set after the guides are restructured, from what the openings measure; see
"What was done" below.

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

(Filled in as the work lands.)
