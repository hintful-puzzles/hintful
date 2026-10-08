# Design

Written 2026-10-08, before any spec was rewritten. Nothing here has been tried
yet; the pilot in "The order of work", 2, is where it first meets a real
capability.

## Context

See `proposal.md` § "Why" for the figures. Three things shape the approach:

- **There are three bodies of prose and they overlap.** The guides say how to
  work on a part of the tree and why; the specs say what must hold; the archive
  says what each change did. A spec requirement today often holds all three,
  and the guide for the same subject holds the first again
  (`docs/games/solver-and-generator.md` § "The difficulty contract" beside
  `engine-difficulty`).
- **No instrument can check that a rewrite kept its meaning.** The line-for-line
  check that carried the split of `ts-engine` does not apply to text that is
  reworded on purpose.
- **The tool merges a delta's words into the main spec as written**, and
  requires a `MODIFIED` delta to restate its whole requirement. Whatever shape
  the specs are given, the next changes will write into it by that route.

## What other teams do

Searched on 2026-10-08. The evidence is thin: one upstream document, a few
issue threads with little discussion, and two community skills. Nobody
reported a measured result.

- **OpenSpec's own guidance** is that a spec is "a behavior contract, not an
  implementation plan": observable behavior, inputs, outputs and constraints,
  with no internal names, and with rationale in the proposal and design, which
  the archive keeps. Its default is a "Lite spec" of "short, behavior-first
  requirements", and its test is that anything the implementation can change
  without changing visible behavior does not belong
  (<https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md>).
- **The journal effect is a known property of the tool.** Issue 678, open:
  archive copies a delta's change-worded text into the main spec, the
  command-line path "performs text-level block manipulation without semantic
  understanding", and cleaning the language is left as a manual step
  (<https://github.com/Fission-AI/OpenSpec/issues/678>).
- **Other teams hit the wall at a smaller size.** A team with 129 specs and 216
  requirements reported they could no longer understand the system from its
  specs and asked for a generated overview; a reply called merged specs "very
  raw" and missed a layer above them
  (<https://github.com/Fission-AI/OpenSpec/discussions/1579>). This repository
  has 924 requirements.
- **A periodic clean-up is the community's answer.** One skill sweeps the main
  specs for stale, dangling, contradictory and duplicate requirements every
  five to ten archived changes and removes what the user confirms
  (<https://skills.sh/fearovex/claude-config/sdd-spec-gc>). Another
  consolidates a spec that has grown: never during active work, with a map from
  what is implemented to the requirement that covers it, and with traceability
  from the new text to the old
  (<https://github.com/rhuss/cc-spex>, `spec-refactoring`).
- **The tool has a place for authoring rules.** `rules` in
  `openspec/config.yaml`, keyed by artifact, is shown to whoever writes that
  artifact. This repository sets none.

What this design takes: the upstream definition of a spec, the traceability
map, and the rule against rewriting during active work. What it does not take
is the periodic sweep: a bound the gate holds does the same job at the moment a
change would break it, and needs nobody to remember.

## Goals / Non-Goals

**Goals:**

- A session can read the whole spec for the part of the tree it is about to
  touch, and finds every rule that binds it there.
- A later change to one rule restates a short requirement.
- The specs cannot grow back to this without a commit that says so.

**Non-Goals:**

- Auditing every requirement against the code. A requirement found false
  during its rewrite is corrected or raised; the rest are taken as true.
- Changing what any requirement demands.
- Rewriting the guides. A guide gains a reason or a pointer and nothing else.
- An index of the specs kept by hand. `openspec list --specs` and each
  capability's Purpose are the index.

## Decisions

### Decision 1: what a requirement holds

A requirement holds the rule: what must be true, in the present tense, in
`SHALL` sentences a session could break.

- **One sentence of reason** where the rule would look arbitrary without it.
- **A name is kept when the name is the contract.** The engine's specs are a
  contract for whoever ports a game, so a `Game` hook or an exported helper is
  observable to their reader. A test file, a private function and a script are
  not.
- **Not held:** how the decision was reached, what it replaced, a count of
  games or any measured figure, a date, a change id, and the argument against
  a refused alternative. A refusal that still binds stays as one `SHALL NOT`.

Alternative considered: keep the reasons in the requirement and only split it
into shorter ones. That is the smaller change first proposed. It makes a
`MODIFIED` delta cheaper and leaves the line count where it is.

### Decision 2: where the rest goes

| What leaves a requirement | Where it goes |
| --- | --- |
| A reason that can be checked | A guard, or a declaration the engine consumes, in place of the prose |
| A reason, a trap or a worked case a session needs | The guide for that part of the tree, if it is not already there |
| How the decision was reached, and what was tried | Nowhere: the archive already has it |
| A count or a measured figure | Deleted. The query, if one exists, is in the guide |
| The case against a refused alternative | `docs/doctrine.md` or the guide, in a sentence |

### Decision 3: requirements are merged by subject

This and Decision 4 describe the reference form. Where the owner's answer
gives a group the other form, the table in "The two forms" replaces them.

- **A game's spec follows one skeleton**, the sections of the `Game` contract
  the game implements: its rules and description format, input, generation and
  tiers, the hint, rendering. Requirements titled for what one change did are
  folded into the section they belong to.
- **An engine capability** keeps its subject and merges requirements that
  state parts of one rule.
- **A requirement filed in the wrong capability moves**: the Untangle
  preferences and the reference panel out of `ts-engine`, and the rules for
  cross-game test sweeps into one place.

### Decision 4: a scenario stays where it adds a case

A scenario that restates its rule, or that says a named test fails, goes. One
that gives a boundary or an example the rule's sentence does not, stays. The
validator requires one scenario a requirement, so each keeps at least one.

### Decision 5: the specs are edited directly, with a ledger

No delta carries the rewrite. A delta states a change to what is required, and
restating 924 requirements as `MODIFIED` would write every spec twice.

In its place, one ledger file a capability, in this change's directory: a row
for every requirement the capability had, and for each rule in it, where the
rule is now (a requirement's title), or why it is gone (already held by
another requirement, moved to a named guide section, history, a figure, or no
longer true). The archive keeps the ledgers. Nothing maintains them afterwards.

A requirement removed as no longer true is a change to what is required. Where
it concerns what a player sees, it is raised with the owner and not removed
here.

### Decision 6: how a rewrite is checked

- **A script** checks each ledger against git: every requirement title in the
  capability before the rewrite has a row, and every destination named in a
  row exists in the spec or the guide after it.
- **The `SHALL`s are counted** before and after, per capability, and the
  ledger accounts for the difference.
- **A fresh-context reviewer** is given the old spec, the new one and the
  ledger, and looks for a rule that was lost or changed.
- **A second fresh reviewer** is given only the new spec and asked questions
  whose answers were in the old one. This is the test of the goal itself.
- **Citations are repointed and then checked.** `change-citations.mjs` learns
  to resolve a requirement cited by title, so a renamed one fails the gate.

### Decision 7: what keeps the specs this way

- **A size check in the gate**, over every `spec.md`: a bound on a
  requirement's body, a bound on a capability, and no date. The numbers are set
  from the pilot, and a capability not yet rewritten is exempt by a list that
  shrinks to nothing as the stages land.
- **The tool's own bound is 500 characters, and it is waiting.** From openspec
  1.14.1 a requirement whose text before its first scenario is over 500
  characters is a warning, and the gate validates with `--strict`, which fails
  on one. Run against this tree on 2026-10-08, 1.14.1 rejects all 80 specs
  over 779 of the 924 requirements; 1.14.0 passes. So the pin cannot move past
  1.14.0 until the rewrite is done, and the pilot's bound for a requirement
  starts from the tool's 500 and argues for any other figure.
- **Rules for the `specs` artifact** in `openspec/config.yaml`, stating
  Decision 1 to whoever writes a delta.
- **The archive step re-reads the merged requirement.** `docs/work-management.md`
  § "Before archiving" gains a line: the merged text reads as a rule, not as
  the change.

### Decision 8: a pilot, then stages

The pilot is `engine-difficulty` (eight requirements, already read) and
Ascent's spec. It yields the bounds, a measured ratio, and a before and after
the owner can read. Then the engine, the other capabilities, and the games in
batches. Each stage is a commit and leaves the tree valid.

## The question that decides the form: what are the specs used for

The owner's question (2026-10-08): are the specs a resource a session works
from, or a by-product of tracking the work? The cleanup helps either way, and
what is left in a spec differs by the answer. It is not answered yet.

**Settled in either case** (owner, 2026-10-08): the main reasoning moves out
of the specs into the guides, and where it can, into a form a machine checks.
Decisions 1 and 2 stand on that. What it adds to them: before a reason is
moved as prose, ask whether it can be a check, or a declaration the engine
consumes, and a requirement that a guard holds names the guard by a reference
the gate resolves.

### What the repository shows about use

Measured 2026-10-08, by a parse of every delta in the archive and a search of
`src/`, `docs/` and `scripts/` for the first 40 characters of each
requirement's title. The search misses a citation that paraphrases its title.

| | Requirements | Cited by title outside `openspec/` |
| --- | --- | --- |
| The engine | 222 | 25 |
| The games | 548 | 3 |
| The rest | 154 | 27 |

- **Nothing consumes a spec.** No test and no build step reads a requirement's
  text. Three checks read the directory, for a capability's name and for
  spelling.
- **A session does read a requirement in order to change it.** Of the
  requirements the archive's deltas carry, 1,075 were `ADDED`, 653 `MODIFIED`
  and 147 `REMOVED`. Until August nearly all were additions; in September and
  October modifications and additions run about level.
- **The guides lean on the engine's and the repository's specs** and almost
  never on a game's: `openspec/specs/` is named 44 times in `docs/` and once in
  `src/`.

Read together: the engine's and the repository's specs are used a little as a
reference and are written as one; a game's spec is used by nothing but the
next change to that game.

### The two forms

| | A reference | A by-product of the work |
| --- | --- | --- |
| What a spec is for | Read whole before touching that part of the tree | The delta says what a change set out to make true; the main spec is what is left when the changes are added up |
| What stays | Every rule, stated once, merged by subject | Only a rule nothing else holds: no type, no guard, no declaration and no guide states it |
| What goes | Reasons, history, figures | Those, and every rule a guard or a type already enforces, with the ledger naming which |
| Scenarios | Kept where they add a case | Kept only where no test is the case |
| How it is kept | A size bound, and the guides point to it | A size bound, and a change with no rule of that kind sets `skip_specs` |
| The work | A rewrite of 924 requirements | Mostly deletion against a ledger, and a far smaller result |
| What it risks | A second copy of what the guards say, which must be kept true by hand | A decision that lived only in a spec is cut as "held elsewhere" when it was not |

**Recommended: the answer differs by group.** The engine's and the
repository's specs become a reference, since a porter and a session changing
the shared layer have rules to learn that are spread over many guards. A
game's spec becomes the by-product form, since the game's code, its tests and
its help page already say what it does and nothing reads the spec. That is a
recommendation from the citation counts above and not from watching a session
work, which the repository cannot show.

The pilot is built to inform the answer: step 1.3 sorts each rule of the two
pilot capabilities by what already holds it, and Ascent is rewritten in both
forms.

## Decisions the owner is asked to confirm

1. **What the specs are for**, by group (the section above). It decides
   Decision 3 and 4 and the size of the work, so nothing past the pilot starts
   without it.
2. **The target.** From one sample, the first requirement of
   `engine-difficulty`, the rules are about a third of the lines in the
   reference form. That is an estimate from a single requirement and the pilot
   replaces it, for both forms.

## Risks / Trade-offs

- A rule is lost in a rewrite, and nothing fails → the ledger, the count and
  two reviewers, and the old text is in git and the archive.
- A reason moved to a guide swells the guide → a reason moves only where the
  guide lacks it, and the guides are already the larger part of what a session
  reads.
- The size bound is met by cutting a rule rather than a reason → the bound's
  failure message names Decision 1, and the reviewer of the change sees a
  `REMOVED` delta.
- The work is long, and a change that is open for many sessions goes stale →
  each stage stands by itself, and the exempt list says what is left.
- Another change edits a spec mid-rewrite → the ledger script reads the
  capability's requirements from the commit before its stage, so a requirement
  added since is reported.

## Open Questions

- Whether `repo-layout` and `build-pipeline` should divide by subject as
  `ts-engine` did. Decided when their stage is reached.

## The order of work

The change has no `tasks.md` while it waits, which is what makes it a draft
(`docs/work-management.md` § "The backlog is being drained"). The session that
takes it up writes `tasks.md` from this list, each step with its check.

**1. Measure, and get the owner's word**

- 1.1 Put the spec census in the tree as a script under `scripts/checks/`:
  per capability, its lines, requirements, body and scenario lines, and the
  shapes `proposal.md` § "Why" counts. Check: it reproduces that table, or the
  table is corrected.
- 1.2 Put the use measurements beside it: the archive's deltas by verb and
  month, and the requirements cited by title outside `openspec/`. Check: it
  reproduces "What the repository shows about use", or that section is
  corrected.
- 1.3 Sort every rule of `engine-difficulty` and of Ascent's spec by what
  already holds it: a type, a guard, a declaration the engine consumes, a
  guide, or nothing but the spec. The counts say how much the by-product form
  would cut, and what it would risk.
- 1.4 The owner's answers to "Decisions the owner is asked to confirm",
  recorded here, after 2.6. Nothing from 3 onward starts before them.

**2. The pilot**

- 2.1 Write the ledger checker (Decision 6). Check: it fails on a ledger with
  a row removed and on one naming a requirement that does not exist.
- 2.2 Rewrite `engine-difficulty` with its ledger. Check: the checker passes,
  the `SHALL` count is accounted for, and `openspec validate --specs --strict`
  passes.
- 2.3 Rewrite Ascent's spec twice, in the two forms, each with a ledger.
- 2.4 Two fresh-context reviews of each pilot spec (Decision 6), with what
  each found recorded here.
- 2.5 Set the bounds for a requirement and a capability from the pilot, and
  record the measured ratio in place of the estimate.
- 2.6 Show the owner the pilot: both capabilities before and after, opened in
  the preview, with the counts from 1.3.

**3. What keeps it**

- 3.1 The size check, in the gate's fast prefix, with the list of capabilities
  not yet rewritten. Check: a planted over-long requirement and a planted date
  each fail.
- 3.2 `rules` for the `specs` artifact in `openspec/config.yaml`. Check:
  `openspec instructions specs` returns them.
- 3.3 `change-citations.mjs` resolves a requirement cited by title. Check: a
  planted citation of a title that does not exist fails.
- 3.4 `docs/work-management.md` § "Before archiving" says to re-read the
  merged requirement.

**4. The engine**

- 4.1 `engine-hints` and `engine-candidate-hints`.
- 4.2 `ts-engine`, with its misfiled requirements moved (Decision 3).
- 4.3 `engine-input`, `engine-params`, `engine-colors`, `engine-notes`,
  `engine-drawing`, `engine-helpers`.
- 4.4 Repoint every citation of a renamed engine requirement. Check: the
  citation check passes and `git grep` finds no old title.

Each capability has a ledger and the two reviews, is checked as 2.2, and
leaves the exempt list.

**5. The other capabilities**

- 5.1 `repo-layout` and `build-pipeline`, divided by subject if their rewrite
  shows they should be.
- 5.2 `app-shell`, `ts-migration` and the nine small ones.

**6. The games**

- 6.1 The 57 game specs, in batches of about ten, in the form the owner chose
  for them. Each spec has a ledger and the first review; one spec a batch
  gets the second.
- 6.2 The guide for porting a game says what a game's spec holds, and the
  scaffolding script's spec skeleton matches.

**7. Close**

- 7.1 The exempt list is empty and removed, and the size check reads every
  capability.
- 7.2 `AGENTS.md`'s read-first table and each guide name the capability that
  binds the part of the tree, within the root brief's bound.
- 7.3 The pinned openspec moves past 1.14.0 (Decision 7).
- 7.4 Run the census again and record before and after here.
- 7.5 The owner's acceptance (`proposal.md` § "Acceptance").
