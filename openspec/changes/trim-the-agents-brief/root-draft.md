# Notes for All Agents (also symlinked as CLAUDE.md)

**Do not make this file longer unless there really is no better way.** It is
read into every session, and every line added makes the others less likely to
be followed. Before adding one, try each of these: write nothing, because the
source already says it; put it in the `docs/` guide for the part of the tree it
binds; turn it into a check; or replace a line that is here. The gate holds
this file to 200 lines and 20,000 bytes.

## What this is

Hintful Puzzles: a PWA of logic puzzles with hints that explain why, all of it
TypeScript. `README.md` says what the project is and whose work it stands on.

**For a fact about the tree, read the tree.** Which directories exist, what a
command runs (`package.json`), what the gate's steps are and why
(`scripts/gate.sh`), what a file holds: the source answers these and cannot be
out of date. This file and the guides hold only what the source cannot say: a
rule, a decision, a reason, or a trap the code does not warn about. How a
third-party tool behaves is in that tool's own documentation.

`openspec/specs/` is what is normatively true. The record of what was built is
`openspec/changes/archive/` and the git log; do not write a summary of it
anywhere, and do not write history into this file or a guide. Keep from an
incident only what a later session acts on: the rule, and the shape to look for.

## Rules for every session

- **Never bypass the gate**, in whole or in part, however small the change and
  however sure you are that it is not needed. No `--no-verify`, no disabled
  step.
- **Game-facing work is done when the owner says it plays correctly**, not when
  the suite is green. Run the app before calling UI work done. A shortfall is
  never called "cosmetic" or "out of scope", and never deferred, without the
  owner's approval.
- **Ask before changing what a player or their data can see**: save and game-ID
  formats, preference keys, shared links, how a control behaves. State the
  cost. Breaking compatibility is allowed, and it is the owner's call. An
  internal design decision is yours: change it and record the reason.
- **Own everything in the repo.** Never call a problem "pre-existing",
  "unrelated" or "out of scope". Fix it, file it as a change, or raise it with
  a recommendation.
- **Continue by default.** Do not ask whether to continue, commit or move on.
  Ask only for a real decision: a trade-off with no clear winner, two readings
  that produce different work, or something irreversible.
- **Finish your own work.** There is no approval step between proposing a
  change and implementing it, and a change you scoped and decided is yours to
  verify, commit and archive. The owner accepts three things: player-visible
  work where you are genuinely unsure which answer is better, anything they
  asked for by name, and a compatibility break (asked before).
- **A decision or a follow-up is persisted by a commit, or it did not happen.**
  A follow-up becomes a change under `openspec/changes/`, verified before it is
  filed. A rule goes in the guide for the part of the tree it binds, and here
  only when it binds every session. Never cite an agent-private note to the
  owner.
- **Push to `main` when a task is done.** A push deploys, and the
  deployment is how the owner sees player-visible work. Do not ask first or
  watch the deploy. Hold a push, and say why, only for a specific concern.
- **Update the guide in the change that taught you something.** The guides
  under `docs/` are a live wiki: when one was missing something or wrong, fix
  it then. Cite a guide section by file and heading name, never by number.

## What the project is for

The long form of each of these is `docs/doctrine.md`.

- **User-facing value comes first, and diverging from upstream is the point**:
  explained hints, mistake checking, quick-save and play aids are why the fork
  exists. A divergence needs a stated player-visible benefit, and tidiness is
  not one. Where it drops an assurance, the change says what replaces it.
- **Weigh every shared-layer decision at dozens to hundreds of games.** A
  game's directory holds what is essential to that puzzle. For everything else
  there is one obvious way, and the porter makes no decision that is not about
  the puzzle.
- **A game that does not fit a convention is first a question about the
  convention.** Only when the shape cannot be made more flexible does the game
  take an override, and it says why. Game logic is never bent to fit a contract.
- **Where several games write the same thing, the framework should own it.**
  Refactor as you go: "noticeably cleaner" is reason enough. Record a decline
  with its reason.
- **Declare what the engine consumes; refuse a second copy.** A declaration the
  engine runs or builds from cannot disagree with it. A statement about a game
  that only a check reads will rot.
- **Nothing is sacred.** When keeping an earlier decision makes something
  needlessly complex, reconsider the decision. Ask who reads the promise and
  what they would do without it.
- **Every game has a hint, and a game without one is a draft.** A hint explains
  why the move is forced, and relies only on marks the player can make.
- **No progression features**: no best times, streaks, statistics, achievements
  or unlocks, and no proposals for them.
- **Upstream is not tracked and nothing is merged from it.** Its C is read, in
  the sibling clone `../puzzles/` or git history, and never run. The app hands
  out boards, never seeds, so changing which board a seed deals breaks nothing.
  A change that would refuse a desc upstream's generator writes is a
  compatibility break. The notices in `licenses/` stay verbatim.

## Method

The long form, with the shapes to search for, is `docs/method.md`.

- A guard measures the thing it claims to guard. Ask what would have to break
  for it to fail.
- See a new guard fail before trusting it, and plant the defect again before
  leaning on an old one.
- Count what a check looked at. A census that finds none says how many it would
  have taken to see one.
- Verify a bulk edit by the shape of its diff, not by a green suite.
- Check the instrument before the finding, against something outside the tool.
  When you find yourself working around a dependency, check its version first.
- Key a scan on shape, and code on a reference, a type or an id. A name misses
  the renamed copy, and a regex over our own prose empties without a sound.
- Write the query, not its answer. A count or a fact about the code in prose
  goes stale, and this file holds no census of the tree.
- Take a proposal's headline number yourself before designing against it.
- Retire a dead instruction; do not repoint the one part you noticed.

## Code

- TypeScript strict, no `any`. Absence is `T | null`. American spelling. Biome
  formats and lints; `npm run check` fixes.
- A comment says what the code cannot: a reason, a constraint, a provenance. It
  describes the lines it sits on and never another file's behavior
  (`docs/games/README.md` § "Comments, and what earns one").
- Port to idiomatic TypeScript. The C is a reference for the logic, never a
  template for control flow.
- Keep Baseline 2023 compatibility. Weigh bundle size and offline use before
  adding a dependency.
- Let an unrecoverable error propagate; do not catch it only to log it.
- UI changes work with touch, keyboard and mouse, at varying screen sizes,
  offline, and with accessibility considered.
- A test earns its runtime: the bar is what it would catch that no cheaper test
  would. Reach for the lowest tier that fits, and keep a browser for real-canvas
  smoke.

## Read the guide before you touch

| Working on | Read first |
| --- | --- |
| Any game: the lifecycle, the definition of done | `docs/games/README.md` |
| Params, state, moves, capability hooks, affordances | `docs/games/mechanics.md` |
| Pointer, keyboard, touch, the keypad | `docs/games/input.md` |
| Redraw, tile cache, palette, animation | `docs/games/rendering.md` |
| Solver, generator, difficulty tiers, `findMistakes` | `docs/games/solver-and-generator.md` |
| A hint: its words, marks, rungs, pins | `docs/games/hints.md` |
| A test, a render scenario, a cross-game guard | `docs/games/testing.md` |
| A shared engine helper | `docs/games/engine-catalog.md` |
| Judging tests, or quoting a measurement | `docs/test-strength.md` |
| A check, a census, a bulk edit, a number in a proposal | `docs/method.md` |
| An openspec change, acceptance, pushing, a deploy | `docs/work-management.md` |
| A help page | `docs/help-pages.md` |
| A framework or cross-game design decision | `docs/doctrine.md` |

Work is tracked with openspec, through the skills it installs; one change per
coherent unit of work.

## Specific to a coding agent

- **Browser checks are Chrome only, through the `playwright-cli` skill.** Do
  not install a standalone Playwright or another engine, and do not report
  other browsers as an untested gap.
- **The LSP tool's diagnostics are not the gate's.** It runs
  `typescript-language-server`; the gate runs `tsgo`. It also answers short,
  with no error, while its server loads, so give it a known positive first, or
  take a symbol's population with `npm run refs -- <file> <Name>`.
- **When a change is archived and another is ready, hand it to a fresh
  session.** Commit, push and leave the tree clean, then call
  `mcp__continue-session__continueInNewSession` with the prompt
  `Hi, please take on openspec/changes/<id>` as the last action of the turn.
  Nothing carries over but the repo. A change is ready when it can start
  without an answer from the owner; a session that still owes the owner a
  question or a result ends the ordinary way, as does one without the tool.
