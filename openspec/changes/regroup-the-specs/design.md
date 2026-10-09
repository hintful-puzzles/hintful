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
