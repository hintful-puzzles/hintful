# triage-what-the-spec-rewrite-found-in-the-code

**Status: in progress, on the owner's word (2026-10-09)**, who asked for it to
be taken up in a fresh session ahead of `regroup-the-specs`.

## Why

Rewriting the specs (`2026-10-09-turn-the-specs-into-a-reference`, archived)
had 156 agents read every requirement against the code. Where a rule was false
of the code they corrected the spec. Where the spec looked right and the code
wrong they changed nothing and said so, and the reviewers left a second list
of what they could not settle. Both lists are in that change's
`rewrite-report.md`:

- § "Where the code looks wrong and the spec right": 172 entries
  (`awk '/^## Where the code looks wrong/,/^## Left unresolved/' rewrite-report.md | grep -c "^- "`,
  taken 2026-10-09). About 70 of them mention a comment, and several are the
  same finding reported by a capability's rewriter and again by its reviewer.
- § "Left unresolved by a reviewer": 300 entries. Many say only that nothing
  was left unresolved; the rest are places where the old spec, the new spec
  and the code do not all agree.

**None of it was reproduced.** Every entry is a reading of the code by an
agent that was doing something else. Some read as defects a player could
meet:

- Galaxies: a canceled press on an arrowed tile appears to pick the arrow up
  and drop it, and a bare right click on a dot that sits on an edge or a
  vertex appears to commit the tile beside it.
- Guess: a right-click or a long press on an answer slot appears to select the
  slot and switch notes mode on, where the spec says it does nothing; and with
  every peg held in notes mode, Submit appears to leave the cursor on the
  submit position.
- App shell: Share is offered in the solved notification and in the Menu,
  against "reachable from exactly one place".
- Netslide: `solve` can return a refusal on a board with no aux, which the
  spec says it does not.

And some as holes in what holds the tree:

- The gate's documentation-only shortcut skips the suite for `README.md`,
  `LICENSE.md` and `CREDITS.md`. A test reads the first and the build imports
  the second, and the guard over the shortcut's list does not name them.
- `scripts/metrics.sh` still runs `npx knip`, which is no longer installed.
- `scripts/deal-walk.ts` is in no TypeScript project.
- The hint-emphasis guard measures five of the ten pairs its requirement
  names, and three guards pin the count of games as a literal.
- `metrics/2026-08-05/` is a finished round's snapshot at the top level of
  `metrics/`, against two requirements.

Also from that change and not in the lists: `help/games/ascent.md` says
"Every step places one number" two paragraphs before it describes the step
that places a whole run.

## What Changes

- Every entry of the two lists is read and sorted: a duplicate of another
  entry, a stale comment, a guard weaker than its rule, a place where the spec
  should change and not the code, a suspected defect, or nothing.
- **A stale comment is corrected**, in one commit a group of files.
- **A suspected defect is reproduced before anything else**: in the running
  app where a player would meet it, or by a failing test where it is the
  engine's or the gate's. One that does not reproduce is recorded as such,
  with what was tried.
- **A reproduced defect that is small is fixed here**, with its test. One that
  needs a decision about what a player sees is put to the owner with what was
  seen, how often it occurs and what the fix would touch
  (`docs/work-management.md` § "The backlog is being drained").
- **A guard weaker than its rule is strengthened**, and seen to fail on a
  planted defect first.
- Where the spec is what is wrong, its requirement is corrected by a delta.
- **Every finding ends with its requirement saying what was found** (owner,
  2026-10-09: "so that we don't investigate the same thing twice"). The lists
  exist because a reader of a requirement beside the code saw them disagree,
  and the next reader will see the same unless one of the two moves. So when
  a finding is investigated, the requirement it was raised against is brought
  to agree with the code as it then stands: corrected where the spec was
  wrong, left as it is where the code was fixed to it, and, where the
  difference is real and deliberate, stated in the requirement as the rule
  (the exception, the case it does not cover, the bound of what a guard
  measures). A finding that did not reproduce and needed no edit is the one
  kind recorded only in `triage.md`.

## Capabilities

### Modified Capabilities

The capabilities with a delta under `specs/`: one for each whose requirement
was found wrong, silent where its silence disagreed with the code, or changed
by a fix. `triage.md` names, row by row, the requirement that carries each
finding. A corrected comment carries no delta.

## Impact

- `src/` and `scripts/`: comments, and the fixes the triage arrives at.
- `openspec/specs/`: the requirements found wrong.
- Nothing a player holds: no save or ID format is in the lists.
