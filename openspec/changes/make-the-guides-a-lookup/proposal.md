# make-the-guides-a-lookup

**Status: scaffolded 2026-10-12, not started.** Second of the five pieces of
`fit-a-new-game-in-one-session`, whose proposal holds the measurements.

## Why

The guides under `docs/games/` are 919 KB. The owner's intent (2026-10-12)
was always that a session reads an overview and looks the rest up, alone or
through a subagent, and `AGENTS.md` now says so. The guides are not yet
written to be used that way:

- **A section mixes four kinds of text.** What to do, the reference for a
  contract or helper, why the collection decided it, and the story of the
  game that taught it. A reader who lands on a section by its heading has to
  read all four to find the first. Five readers judged that a new game's
  author needs a quarter to a half of each guide, and that a third of
  `hints.md` is the story of named games.
- **Nothing routes by kind of game.** A game with no notes still meets the
  11 KB on the keypad and the 49 KB on candidate hints.
- **A heading does not always say when to read its section**, and no guide
  opens with a list of its own. The guides sit a directory deeper than they
  need to, behind a `README.md` that is a second index of files beside the
  table in the root `README.md`.

## The decision on form

Read on 2026-10-12: what is published on organizing a repository's
documentation for a coding agent, and on Diátaxis for that use. It is blog
posts and skills, with no measurement behind any of it, so this is a
judgment and the first new game is its test.

- **Take from Diátaxis its one rule, that a passage is of one kind, and not
  its four folders.** A session looks things up by concern (input, the
  hint), so the guides stay one per concern. Within a guide the kinds are
  separated:
  - **How-to comes first and is short**: what every game does for this
    concern, in the order it is done, the one way, pointing at the skeleton.
  - **Reference follows, one section per contract, hook or helper**, each
    readable alone, under a heading that says when a game needs it.
  - **A reason is one sentence beside its rule**, or it is in
    `docs/doctrine.md`.
  - **The story of a named game is not a guide's.** What that game's next
    author needs goes to its spec or a comment at the site, and the rest is
    deleted; the archive and the git log keep it. Diátaxis has no place for
    it either.
  - **There is no tutorial.** The skeleton and its stamped tests are what an
    agent learns the shape from.
- **There is one index, and it is the table in the root `README.md`,
  § "Documentation".** The owner's rule (2026-10-12): `AGENTS.md` holds how
  an agent works in this repository, and anything a person would also use
  lives outside it. So the table moved there that day, and `AGENTS.md`
  tells a session to read it. The owner also asked whether the depth of
  `docs/games/` and an index file in it are needed, the whole repository
  being about games. They are not:
  - **The guides move up into `docs/`**, and `docs/games/` goes. About 590
    citations in 316 files outside the archive name the old paths
    (`git grep -c 'docs/games/'`), and each is repointed.
  - **`docs/games/README.md` stops being an index.** What it holds that a
    new game's author needs (the lifecycle, the definition of done, the
    route by kind of game) becomes one guide, `docs/new-game.md`, that the
    table names first. The rest goes to the guide for its subject.
  - **A guide's own opening is the index of its sections**: after the
    how-to, a table of its headings with when a game needs each. So the
    lookup is two steps, the table and then the guide's opening, with no
    third file to keep true.
  - **The root `README.md` holds the table of guides and no table of
    sections**: one row a guide, so the public page stays short.
  - **Read `AGENTS.md` for anything else that is not about how an agent
    works**, and move it to the guide for its subject.
- **A guard's insides live in the guard's header**, and a guide says only
  what a game owes the guard and the command that runs it.
- **One session writes a game.** Its solver, hint and renderer share one
  state and one set of marks, so the writing is not divided among agents.
  Subagents read for it and review it: a question across sections, and a
  fresh pair of eyes on the hint's words and the running app.

## What Changes

- Every guide under `docs/games/` is restructured to that form, a guide at a
  time, moving text and cutting stories without changing a rule, and moves
  up into `docs/`.
- `docs/games/README.md` becomes `docs/new-game.md` and loses what is not a
  new game's.
- A gate check holds each guide's opening to naming every one of its
  sections, and to a budget of bytes.

Not in this change: any change to what a rule says.

## Capabilities

None at filing; see `.openspec.yaml`.

## Impact

`docs/games/`, `README.md`'s table, `AGENTS.md`, source comments that cite a moved
heading, `scripts/gate.sh`.
