# trim-the-agents-brief

**Status: done (2026-10-05).** `AGENTS.md` is 175 lines. The owner handed the
read of the draft to fresh-context subagents; `tasks.md` 2.2 quotes that, and
`directives.md` lists seven cuts the owner has not confirmed. Asked for by the
owner:
*"AGENTS.md is almost 900 lines long! I don't think that really works well."*

## Why

`AGENTS.md` loads into every session, and Claude Code's documentation gives a
size for such a file: *"target under 200 lines per CLAUDE.md file. Longer files
consume more context and reduce adherence."* Its best-practices page is
blunter: *"Bloated CLAUDE.md files cause Claude to ignore your actual
instructions!"* (both read 2026-10-05, at code.claude.com/docs/en/memory and
/best-practices).

Measured the same day, `wc` on `AGENTS.md`: 893 lines, 15,824 words, 101,476
bytes. The line count flatters it, because the file does not wrap: its longest
line is 1,888 characters. Two hundred lines at this repository's 88 columns is
under 18 KB, so the file is between five and six times the recommendation.

Three sections are 36% of the words: "Method" (2,145), "Work management"
(1,795) and "Test discipline" (1,715). Most of that is the incident that
taught each rule, which a session fixing a hint's wording pays for and does
not use.

The file grows by rule. The `repo-layout` requirement "Agent-facing
documentation is one AGENTS.md and no tool generates a second" says that where
a completed change established a rule, the rule SHALL appear in `AGENTS.md`.
Every change that learns something adds a paragraph here and nothing removes
one, so a trim that leaves that sentence alone is undone in a month.

## What Changes

The owner set two constraints on how (2026-10-05): *"I do want to avoid
over-claudifying it to the extent possible, and would suggest that we use the
readme and docs/ for anything that isn't inherently Claude-Specific"*, and
*"particularly for factual information that can be derived by looking at the
codebase directly, I'd prefer to just delete it rather than relocate it, and
encourage future agents to look at the source."* And a third, on one subject:
*"we should avoid all detail about Openspec, as that changes across Openspec
versions, and is better documented in its own docs."* And a fourth: *"let's
get rid of any and all historical discussion, except where it is directly
actionable for future work."*

- `AGENTS.md` comes down to what a session needs whatever it is working on,
  inside a bound of 200 lines and 20,000 bytes.
- **A fact the tree states is deleted, not moved.** Which directories exist,
  what a script runs, what the gate's steps are, what a file contains: the
  source answers each of these and cannot be out of date. `AGENTS.md` says to
  read the source for facts, and names where to start.
- **How openspec behaves is deleted too.** The delta verbs, what `validate`
  and `archive` accept, and the hazards observed on one version are the
  tool's to document, and they change with it. What stays from "Work
  management" is this project's own decisions about its workflow: no approval
  gate, archiving your own change, what the owner accepts, one change per
  unit of work, and that a decision is persisted by a commit.
- **History is deleted, not moved to a guide.** The incident that taught a
  rule, the date it was learned, what a file used to say and which change
  removed what all go. What is kept from an incident is the part a later
  session acts on: the rule, and where there is one, the concrete shape to
  look for. The archive and the git log remain the record.
- **A rule, a decision or a reason the tree cannot state is kept**, in a file
  that is not addressed to one tool: `README.md` for what the project is, a
  guide under `docs/` for how work is done here. Several sections of
  `AGENTS.md` restate a guide that exists (`docs/games/hints.md`,
  `docs/games/testing.md`), so part of this is removing a duplicate.
- What is inherently specific to Claude Code stays in `AGENTS.md`, in one
  short section. No Claude-only directory holds a rule of this project.
- Every line that leaves `AGENTS.md` is accounted for: it is in a
  destination, or it is in a cut ledger in this change saying which source
  answers it or why it is not needed. Every owner directive in the file today
  survives as a rule, or is in that ledger for the owner to see; the
  quotation and its date are kept only where the wording is the rule.
- The rule about where a new rule goes is rewritten: in the guide for the
  part of the tree it binds, and in `AGENTS.md` only when it binds every
  session.
- The file opens by saying that a change which would lengthen it is made
  only when there is no better way. The owner asked for that sentence, and it
  is already in place.
- A check in the gate's fast prefix holds the bound, so the file cannot
  regrow quietly.
- Every citation of an `AGENTS.md` section elsewhere in the tree is repointed
  in the same change. Outside the archive, 79 files cite the file, most often
  § "Method", § "Hint quality bar" and § "A scan that keys on a name".

Nothing a player sees changes. **The owner judges the result**: which
directives stay in the root file is their call, and at under 200 lines the new
file is short enough to read in one sitting.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repo-layout`: a new requirement bounds the root brief, says what it holds,
  and says where everything else lives or that it is not written at all. The
  existing requirement "Agent-facing documentation is one AGENTS.md and no
  tool generates a second" also has to change, and its delta is written
  during the work, once the layout is settled (tasks.md 4.1 says why it is
  not written now).

## Impact

- `AGENTS.md` (and `CLAUDE.md`, its symlink): rewritten.
- `docs/games/*.md`, `docs/test-strength.md`, and new guides under `docs/`
  for the material that has no home today.
- `README.md`: small, since most of what could move there is a fact the tree
  states and is deleted under the rule above.
- `scripts/gate.sh`: one new fast-prefix check.
- `openspec/config.yaml`: its `context:` block tells openspec to read
  `AGENTS.md`, and has to keep sending a planner to the rules that govern
  planning.
- Every file that cites an `AGENTS.md` section by name.
