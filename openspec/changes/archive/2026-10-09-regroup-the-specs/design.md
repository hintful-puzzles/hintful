# Design

Written 2026-10-09 when the change was filed. Nothing here has been tried.

## Context

The record to work from is the archived change
`2026-10-09-turn-the-specs-into-a-reference`: its `design.md` (what was
decided and why), `prune-brief.md` (the criteria for a cut, which stand),
`rewrite-report.md` and `prune-report.md` (the lists), and
`cuts/<capability>.md` (what has already gone and why).

Three things that change learned, which bind this one:

- **A move or a cut is not checkable by a script.** The ledger checker of the
  rewrite showed that a destination exists and never that it says the same.
  What caught a lost rule was a second agent reading old against new. Every
  stage here has one.
- **A table of what a test holds is right about half the time at a strict
  reading.** Do not cut a rule because a test is said to hold it; a test says
  what happens and not that it was meant.
- **Parallel agents may each own one file and nothing else.** A move touches
  two capabilities, so moves are planned whole before any is made, and made by
  one agent a destination.

## Decisions

### Decision 1: the plan of moves is one document, agreed before any edit

The two lists are merged and deduplicated into a table: the requirement, where
it is, where it would go, and why a session would look there. Where two agents
proposed different homes, one is chosen. A requirement moves only when the
destination is where a session reads before the work the rule binds; "it would
sit more naturally" is not that.

### Decision 2: a capability is divided only along a subject a guide already has

`repo-layout` divides where `docs/` already has a guide for the part: help
pages (`docs/help-pages.md`), testing (`docs/games/testing.md`), the workflow
(`docs/work-management.md`, which may mean those rules leave the specs
altogether). A new capability is named for its subject, and its guide's
pointer is updated in the same commit.

### Decision 3: a move is a delta

Unlike the rewrite, a move changes what a capability requires, so it is
carried by `REMOVED` in one capability and `ADDED` in the other, and
`openspec validate` holds the pair. A cut is a `REMOVED` with its reason.

### Decision 4: the doubtful requirements are settled in three piles

Answerable from the tree (is the thing gone, does a guide say it), which an
agent settles and a second reviews; the owner's, which are asked in one batch
with a recommendation each; and the rest, which stay. The owner is not asked
442 questions.

## How it was carried out

Written 2026-10-09 by the session that took the change up. Where this and a
decision above disagree, this is the later word.

- **The moves and the cuts are tables, and the deltas are derived from
  them.** `moves.md` lists every move, `rewrites.md` the few requirements
  that are reworded, `verdicts/<capability>.md` what was decided of each
  doubtful requirement, and `purposes.md` the Purposes. The regrouped specs
  are built from those outside the tree, and each capability's delta is the
  difference between its spec in the tree and its regrouped spec: a
  requirement gone is a `REMOVED` whose reason is its move or its cut, one
  that arrived an `ADDED`, one whose words changed a `MODIFIED`. Decision 3
  stands, and nobody writes a delta by hand, so a delta cannot disagree with
  the plan it carries.
- **A move is checkable by a script after all, where it keeps its words.**
  What Context says no script can check is a rewording. A moved block is
  compared as text, every requirement is accounted for by count, and a
  reviewer's reading is spent on where a requirement went and on the
  requirements that were reworded.
- **The moves come before the doubts.** The order filed has them so, and it
  matters: an agent settling a capability reads the regrouped specs, so a
  game's restatement is judged against the shared requirement where it now
  is.
- **A game restating the engine's rule is a cut and not a move.** About
  seventy entries of the two lists say that a game's requirement repeats what
  `engine-hints`, `engine-notes` or `ts-engine` states for every game. Those
  are settled with the game's doubtful requirements, by the same agent and
  the same reviewer (`doubts-brief.md`).
- **A reference from one requirement to another follows the move.** Where a
  requirement names another by capability and title, the capability is
  rewritten by the build; the two that name one in prose are `edit` entries
  of `rewrites.md`.

- **Eleven rewordings are not deltas.** From 1.14.1 the validator refuses a
  `MODIFIED` requirement that leaves out a scenario the requirement has, and
  refuses one title in both `REMOVED` and `ADDED`, so a rewording that drops
  or renames a scenario has no delta form under its own title. Those eleven
  (two in `loopy`, one each in `ascent`, `bricks`, `fifteen`, `licensing`,
  `project-identity`, `salad`, `seismic`, `subsets` and `untangle`) were put
  into the specs from their `reword` entries after the archive ran, and the
  verdict file of each is the record of what changed and why.
- **The Purposes and the order of a capability's requirements are not deltas
  either.** After the archive merged the deltas, each spec was written from
  the build: the same requirements, a new capability's own requirement
  first, and the Purposes of `purposes.md`.
- **The script that built the specs is not in the tree.** It read the four
  tables and wrote the specs and the deltas, and was used once. The tables
  are what a reader needs; the check that the tree matches them was
  requirement for requirement, by text, after the archive.

## Where it ended

By `node scripts/checks/spec-census.mjs`, on 2026-10-09:

| | Capabilities | Lines | Requirements |
| --- | --- | --- | --- |
| Before | 80 | 40,470 | 2,546 |
| After | 85 | 40,230 | 2,519 |

- **164 requirements changed capability**, and five capabilities are new:
  `help-pages`, `testing`, `dealing`, `error-reporting` and `border-grid`.
  `repo-layout` went from 149 requirements to 76 and `ts-migration` from 31
  to 7. A fresh reviewer's reading of the plan changed seven of its rows
  (`moves.md` § "What the review changed").
- **The 442 doubts became 30 cuts, 63 rewordings and 22 edits**, and 367
  requirements kept with the reason the doubt does not hold. Most doubts
  asked whether a rule was held elsewhere, and on looking, most were not:
  the guide named told the incident and not the rule, or the shared
  requirement stated less than the game's. The reviewers turned 6 cuts and
  rewordings back into keeps and corrected 5 rewordings that said something
  the code does not do.
- **No doubt was the owner's.** Each "does the owner want" turned out to be a
  question about internal form or one the tree answered.
- **Three requirements were added**: the two that `border-grid` merges from
  its games, and "The chrome does not overflow at a phone width", which the
  pruning had cut as a duplicate of two requirements that do not cover the
  Game controls.
- **`engine-hints` is still 138 requirements.** It was not divided
  (`moves.md` § "The divisions"), and it is where the specs are longest.
- **What was found and not acted on is `found.md`**: one defect a player can
  reach, about ten rules that several games each state and no shared
  capability does, and about twenty things a game's spec has never stated
  (a description format, a control, a hint). The second and third are where
  the specs get simpler or more complete from here, and neither is a move or
  a doubt.

Also corrected on the way: `scripts/checks/spec-citations.mjs` did not read a
citation whose capability name is a markdown link, which hid two stale
citations in `docs/games/hints.md`; and the stale guide lines and comments the
settling agents named.

## Risks

- A requirement cited by title moves, and the citation breaks → the citation
  check fails the gate, and the citation names the capability, so it is
  repointed in the same commit.
- A division leaves a capability nobody is told to read → the guide's pointer
  moves with it.

## The order of work

1. Merge the two "belongs elsewhere" lists into the plan of moves. Check: its
   row count against the two sections' entries, less the duplicates named.
2. Decide the divisions, `repo-layout` first.
3. Make the moves, one destination at a time, each reviewed old against new.
4. Sort the 442 into the three piles; settle the first; ask the owner the
   second in one message.
5. Run `node scripts/checks/spec-census.mjs` and record before and after.
