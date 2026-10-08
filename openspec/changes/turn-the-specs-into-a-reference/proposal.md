# turn-the-specs-into-a-reference

**Status: scaffolded, not started (2026-10-08).** Filed on the owner's word the
same day: the specs have "too many lines, many of which could possibly be
combined or otherwise integrated, to make it more useful as a resource, rather
than just being a write-only journal". The owner asked for it to be filed and
not yet done: it waits for their word to start, and a session choosing its
next change passes over it.

**The open question, which decides the form** (owner, 2026-10-08): are the
specs a resource a session works from, or a by-product of tracking the work?
Reasons leave the specs for the guides in either case, into a checkable form
where they can. What stays in a spec depends on the answer: every rule, stated
once, or only a rule nothing else holds. The evidence, the two forms and a
recommendation that differs by group are in `design.md` § "The question that
decides the form". "What Changes" below describes the reference form.

## Why

`openspec/specs/` is written by every change and read by almost none. Measured
on 2026-10-08 (a parse of every `spec.md` into requirements, bodies and
scenarios; task 1.1 puts that parse in the tree):

| | Capabilities | Lines | Requirements |
| --- | --- | --- | --- |
| The engine (`ts-engine`, `engine-*`) | 10 | 9,007 | 222 |
| The games | 57 | 18,152 | 548 |
| The rest (`repo-layout`, `build-pipeline`, `app-shell` and ten more) | 13 | 6,799 | 154 |
| All | 80 | 33,958 | 924 |

The guides under `docs/` that a session is told to read first come to about
15,000 lines (`wc -l docs/*.md docs/games/*.md`). The specs are more than twice
that, and nothing tells a session to read one.

- **A requirement is an essay.** 194 of the engine's 222 have more than 500
  characters before their first scenario and 35 have more than 2,000. The
  longest runs 244 lines. A requirement carries about six `SHALL`s on average,
  in all three groups.
- **A requirement holds more than its rule.** Read whole, the first four
  requirements of `engine-difficulty` each mix the rule with the reason for the
  design, what the design replaced, a count of games taken on some earlier day,
  the proposals that were refused, and the names of functions and test files.
  By shape, across the engine: 32% of requirement bodies speak of a decision in
  the past tense, 31% name a source file and 11% cite a change id or a date.
  In the 13 other capabilities the same three figures are 50%, 31% and 25%.
- **A game's spec grows by one requirement a change.** Ascent has nineteen,
  eight of them about its hint, each titled for what one change did. The 57
  game specs are over half of all the lines.
- **Changing a long requirement is dear and unsafe.** A `MODIFIED` delta
  restates the whole requirement, and what the copy drops is deleted at
  archive with no check.

This is the tool's known behavior, not carelessness here. Archive merges a
delta's text into the main spec as written, so the main spec accumulates the
language of each change (OpenSpec issue 678, open). The tool's own guidance for
a spec, which it shows whenever a delta is written, is "a behavior contract,
not an implementation plan", with no internal names. What other teams do about
it is in `design.md` § "What other teams do".

It is filed now because nothing in flight touches these files: the open
changes carry deltas for their own games' specs only
(`ls openspec/changes/*/specs`).

## What Changes

- **Every spec is rewritten to be read whole.** A requirement states what must
  hold, in the present tense, with one sentence of reason where the rule would
  otherwise look arbitrary. Requirements about one subject become one
  requirement. A scenario stays where it states a case the rule does not.
- **What leaves a requirement goes to its one home, or goes.** A reason a
  session needs is in the guide for that part of the tree, which mostly holds
  it already. How a decision was reached is in the archive, which already has
  it. A count of games is deleted.
- **Nothing a spec requires is lost without a line saying so.** Each
  capability's rewrite is carried by a ledger in this change: every old
  requirement, and where each of its rules went. A script checks the ledger is
  complete, and a fresh-context reviewer hunts for a rule the ledger missed.
- **The specs are held to a size afterwards.** A check in the gate bounds a
  requirement and a capability, and refuses a date in a spec. The delta rules
  in `openspec/config.yaml` say the same when a delta is written.
- **A session is told to read the spec.** The table in `AGENTS.md` and each
  guide name the capability that binds the part of the tree, once it is short
  enough to be read.
- Nothing a player sees changes, and no code changes outside `scripts/`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repo-layout`: two requirements are added, on what a requirement holds and on
  the bound a spec is kept to. Every other capability is rewritten without a
  delta, because the rewrite aims to change nothing that is required
  (`design.md` § "Decision 5").

## Impact

- `openspec/specs/**`: all 80 capabilities, rewritten in stages.
- `docs/`: guide sections that take a reason from a spec, and each guide's
  pointer to its capability. `AGENTS.md`: the read-first table.
- `scripts/checks/`: a spec census and a size check, wired into
  `scripts/gate.sh`. `openspec/config.yaml`: rules for the `specs` artifact.
- Citations of a requirement by its title, in 29 source files, 10 guides and 7
  scripts (`git grep -lE` on a capability's backticked name), are repointed
  where a title changes.

## Acceptance

The owner's, since they asked for it by name: a capability of their choosing,
read whole, and a session's answer to a question about that part of the tree
taken from the spec alone.
