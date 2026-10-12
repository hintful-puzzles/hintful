# fit-a-new-game-in-one-session

**Status: a draft, filed 2026-10-12. It waits for the owner's word on the
order of work below.** It has no `tasks.md`; each piece taken up becomes a
change of its own.

## Why

The owner's goal, stated 2026-10-12 and now in `docs/doctrine.md` § "The
goal": a new, well-understood game is written whole (logic, solver, generator,
hint, presentation, tests, spec, help page) in one session of under a million
tokens. A pass over the guides and the tree that day measured what stands in
the way. Every figure below was taken on 2026-10-12; re-take it before
designing against it.

## What was measured

**1. What a session is told to read is about half the budget.** `AGENTS.md`
routes a game's work to seven guides and the specs they name.

| Reading | Bytes | Query |
| --- | --- | --- |
| The guides under `docs/` | 919 KB | `wc -c docs/*.md` |
| The shared specs they name | 641 KB | `wc -c openspec/specs/{ts-engine,engine-*,testing,help-pages,repo-layout}/spec.md` |
| The exemplar read "end to end", Galaxies, with tests | 288 KB | `find src/games/galaxies -name '*.ts' \| xargs cat \| wc -c` |

At about four bytes a token that is some 460,000 tokens before a line is
written. Five readers, one per guide, each judged what a new game's author
needs: about 30% of `hints.md`, a third of `solver-and-generator.md`, 45% of
`mechanics.md`, 35% of `input.md`, 40% of `rendering.md`, 25% of `testing.md`.
The rest is the story of a named game (a third of `hints.md`, 118 KB), the
insides of a guard, or what only one kind of game needs. No guide routes a
reader by kind of game.

**2. There is no skeleton that is the obvious way.**
`scripts/new-game-port.sh` (`scripts/new-game.sh` since
`hold-the-game-skeleton-to-the-compiler`) did not compile against `Game` from 2026-09-15
(`newDrawState` became required) until this pass mended it, and no check ran
it, though `repo-layout` requires that its output type-checks. It stamps a
hand-written params codec, bare `throw` stubs for the solver and generator,
and nothing for a hint, in a collection where a game ships with its hint.

**3. The conventions are half adopted, so the exemplars disagree.** Of 57
games (53 with a hint), by `git grep -l` over `src/games`:

| Concern | The shared way | By hand |
| --- | --- | --- |
| Params codec | `paramsCodec` 34 | 23, of which the guide gives a reason for 7 |
| Preset menu | `presetGrid` 15 | 42 |
| Input | `interpretTargetVerbs` 27 (median 42 lines of `interpretMove` left) | 30 (median 90 lines); no note-taking game is on target verbs |
| Solver loop | `runDeductionFixpoint` 20, `latinSolver` 6 | 16, of which the guide explains 2 |
| Dealing an ordinary tier | none exists | 51 retry loops, the tier test spelled differently in nearly all |
| The search tier's adapter | `dealUnreasonable` 12 | 60 to 70 lines copied around it in each of the 12 |
| `findMistakes` | `entryMistakes` 14 | 30 |
| Hint plan | `deduceHintPlan` 18, candidate walk 11 | about 22 |
| `hintKeepTrack` | 18 | 35 |
| `hintGesture` | 35 | 18 |
| Where the hint lives | `hint.ts` 27 | `index.ts` or `solver.ts` 26 |

**4. The verdict on a game arrives late.** A game's own tests run in 4 to 6
seconds. The cross-game guards that refuse the commit run in the gate, and
`testing.md` gives three instructions in three places for running them
against one game and no single command. A hint needs a pinned board for
every rung, a ledger entry for a long sentence and a chain pin, none of it
scaffolded. A hint landing wrote 1,400 to 9,700 lines of render snapshot
(`git show --numstat` on the commits that added each `hint-text.ts`), which a
session must read to trust.

**5. A game's spec is a second statement of the game, and nothing holds its
coverage.** The median game spec is 24 KB, 33 requirements and 44 scenarios;
all 57 total 1.39 MB. `state-what-a-games-spec-never-did` took a census from
the registry of what each spec owes (description, params, preferences,
controls, hint techniques and their order, status words) and closed 449 gaps,
but the census ran in a throwaway test, so the 58th game's spec is held to
nothing. The specs cover the same subjects and share no order: requirements
sit in the order they were added, and the hint's are split by other subjects
in 51 of 57 specs. A session working on a hint reads the whole file.

## What the pass did not find

- **An engine-owned tile loop is not the answer to the repeated `redraw`
  shape.** One reader put the common shape of a `render.ts` near half its
  lines. The withdrawal of 2026-09-09 measured the bookkeeping a framework
  could own at a median of 20 lines, and it stands. A skeleton a game starts
  from carries a repeated shape without owning it.
- **The help pages are in good order.** They are 2 to 3 KB each and their
  controls, parameters and hint marks are built from the game.

## The proposed order

Each of the first four is argued from the 57 games already here and needs no
new game to say what to build. The fifth is the measurement.

1. **A skeleton the compiler holds.** The scaffold's files become source that
   the gate's typecheck reads, so it cannot fall behind `Game` again. It
   stamps the shared way for each row above that has one, a hint with its
   rung list, legend, `say` and pin test, and the tests a game ships. One
   skeleton for the commonest kind first: a square grid of cells the player
   marks, solved by deduction, which is 20 of the 57.
2. **One path through the guides for a new game.** A page that routes by
   kind of game to the sections that kind needs, with a stated budget of
   bytes; the story of a named game moves to that game's spec or directory
   or is deleted; a guard's insides move to the guard's header. The exemplar
   becomes a game of median size per kind.
3. **One command that gives a game its whole verdict**: its own tests and
   every cross-game guard, narrowed to it.
4. **A game spec with one order, held by a check.** The subjects of
   `docs/new-game.md` § "What a game's spec holds" become the order of
   every game spec; the 57 are reordered without changing a word; and the
   census becomes a gate check that derives what a spec owes from the `Game`
   object. A spec stops restating what the game declares (params letters,
   preference keys, rung order) and states what the code cannot.
5. **Then a game, written whole in one session, with a log.** The session
   records every question it had to answer that was not about the puzzle,
   and its token count by phase. That log orders the engine work after it:
   the dealing loop, the search-tier adapter, the hint hooks written by
   hand, and the input of a game with a drag or with notes are the
   candidates, and a game says which costs most.

## The owner's answers (2026-10-12)

- **The order is accepted**, and the pieces are filed as changes of their
  own, to be taken in this order: `hold-the-game-skeleton-to-the-compiler`,
  `make-the-guides-a-lookup`, `give-a-game-its-verdict-in-one-command`,
  `order-and-shrink-the-game-specs`, `own-region-division-in-the-engine`,
  `add-starbattle`. This change is the record of why, and is archived with
  the last of them.
- **Dividing a grid into unequal regions is the engine's**, which the first
  scoping of Star Battle had left to the game. Six games each write one.
- **The guides need no directory of their own and no index file.** The
  table in the root `README.md` is the one index, `AGENTS.md` holding only
  how an agent works, and each guide opens with its own
  sections.
- **The measurement is Star Battle**, a game the owner wants in the
  collection, with its one-star form (known as Queens) as a parameter.
- **On a spec restating what the game declares: "if we can simplify it, we
  should."** So a spec states what the code cannot.
- **The guides were never meant to be read through.** They are a wiki a
  session looks things up in, and how they are organized for that, and how a
  session is told to use them, is this work's to decide.
  `make-the-guides-a-lookup` holds the decision.
- **The engine refactoring that was open is done**, so the rule that ports
  and hints wait is gone from `docs/work-management.md`.

## Capabilities

None yet. The change sets `skip_specs`.

## Impact

Nothing until a piece is taken up.
