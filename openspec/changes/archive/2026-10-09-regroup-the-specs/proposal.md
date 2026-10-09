# regroup-the-specs

**Status: filed on the owner's word (2026-10-09), to be taken up after
`triage-what-the-spec-rewrite-found-in-the-code`.** It has no `tasks.md` yet;
`design.md` § "The order of work" is what the session that takes it up writes
one from.

## Why

`2026-10-09-turn-the-specs-into-a-reference` (archived) rewrote every
capability into short requirements and then cut what was not worth reading.
It left two things undone, and said so in its `design.md` § "Where it ended":

- **No requirement moved between capabilities and no capability was
  divided.** The rewrite and the cuts ran as eighty agents at once, each in
  its own file. `repo-layout` is 2,375 lines and holds, beside where things
  live, the rules for help pages, the hint-position test harness, the bounds
  on generator loops and rules of process. Both of that change's reports list
  what the agents would move: `rewrite-report.md` § "Requirements that look
  misfiled" (104 entries) and `prune-report.md` § "Belongs in another
  capability" (84).
- **The cuts were cautious.** `prune-report.md` § "Kept only for doubt" lists
  442 requirements an agent kept because it was unsure, each with the question
  that would settle it. Many of the questions are the owner's ("does the owner
  expect another vision document?") and many are answerable from the tree.

The owner's test (2026-10-09): simplicity and use to us, and a rule kept only
if a session would read it before working on that part or check a change
against it.

## What Changes

- A requirement that is in the wrong capability moves to the one a session
  would look in, and the citations of it follow.
- A capability too long to be read whole is divided by subject, where its
  subjects are separable.
- Each of the 442 doubtful requirements is settled: cut with a reason, kept,
  or put to the owner in one batch of questions.
- Nothing a player sees, and no code outside comments that cite a requirement.

## Capabilities

### New Capabilities

- `help-pages`: the help the app serves, divided out of `repo-layout`.
- `testing`: how behavior is tested, divided out of `repo-layout`.
- `dealing`: how the app gets a board to play.
- `error-reporting`: what a crash sends, and when.
- `border-grid`: the edge-marking mechanic Palisade and Separate share.

`moves.md` says what each holds and why.

### Modified Capabilities

Every capability a requirement leaves or arrives in.

## Impact

- `openspec/specs/**`, and the citations of a requirement by title in `src/`,
  `docs/` and `scripts/`, which `scripts/checks/spec-citations.mjs` holds.
- The guides' pointers to their capability, where a capability is divided.
