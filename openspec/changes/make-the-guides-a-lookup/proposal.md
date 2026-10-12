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
- **A heading does not always say when to read its section**, and the only
  index, `docs/games/README.md`, lists seven files and not their sections.

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
- **One index is read at the start, and it is the only thing read whole**:
  `docs/games/README.md`, holding the lifecycle and a table of every section
  of every guide with the condition under which a game needs it, and a
  route for each kind of game. It carries a byte budget the gate holds.
- **A guard's insides live in the guard's header**, and a guide says only
  what a game owes the guard and the command that runs it.
- **One session writes a game.** Its solver, hint and renderer share one
  state and one set of marks, so the writing is not divided among agents.
  Subagents read for it and review it: a question across sections, and a
  fresh pair of eyes on the hint's words and the running app.

## What Changes

- Every guide under `docs/games/` is restructured to that form, a guide at a
  time, moving text and cutting stories without changing a rule.
- `docs/games/README.md` becomes the index.
- A gate check holds the index to its budget and to naming every section.

Not in this change: any change to what a rule says.

## Capabilities

None at filing; see `.openspec.yaml`.

## Impact

`docs/games/`, `AGENTS.md`'s table, source comments that cite a moved
heading, `scripts/gate.sh`.
