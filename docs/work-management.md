# Work management

How a piece of work is scoped, finished, accepted and shipped here. Work is
tracked with openspec, and how that tool behaves is in its own documentation
and the skills it installs. This guide holds only what this project has
decided about its own workflow.

## One change per coherent unit of work

A game is one change. A cross-game feature is one change. A game's explained
hint is normally its own. Bundle only when several items share identical
design reasoning; keep an item separate when it has its own non-obvious
decisions.

Keep a change's tasks current as you implement, and conclude the change in the
session that finishes the work.

## No approval step, and you archive your own work

Scaffold a change and keep going into the implementation in the same session.
The tool's generic workflow has an approval step between proposal and
implementation, and its propose skill says to stop after planning; in this
project neither applies.

A change you scoped, decided and implemented is yours to finish: implement,
verify, commit, push and archive, without a checkpoint. An internal contract,
a helper's shape, a test harness, a doc restructure, or a spec requirement
recording a decision you made and can defend is an implementation detail.
Asking the owner to accept one turns a decision you own into an item on
someone else's desk.

## What the owner accepts

Three things, and no others:

- **Player-visible work where you are genuinely unsure which answer is
  better.** Player-visible does not by itself mean stop and ask. Where one
  answer is plainly better, make the call, say what you decided and why, and
  run the app yourself. Never call a shortfall cosmetic.
- **Anything the owner asked for by name.** They described the outcome, so
  they decide whether you hit it.
- **Anything that breaks compatibility with data a player already has**: save
  formats, preference keys, shared game IDs. Ask before, with the cost stated.

During a run of framework refactoring the owner may defer testing to the end
of the arc. Take that as said only when it is said.

Stop and ask only for a difficult decision: a real trade-off with no clear
winner, two readings that produce materially different work, or something
irreversible. A design decision the evidence already determines is written
down and implemented, not asked.

## A decision is persisted by a commit

Saying something in a reply, or filing it in an agent's own memory, persists
nothing. The next session starts from the repo.

- A follow-up that clears the bar below becomes a scaffolded change under
  `openspec/changes/`. Verify the defect is real before filing: an audit
  proposed on an unchecked suspicion costs the next reader an investigation.
- A rule goes in the guide for the part of the tree it binds, and in
  `AGENTS.md` only when it binds every session.
- If it is not worth a commit, say plainly that you looked and found nothing.
- Never cite an agent-private note to the owner. They cannot read it.

## The backlog is being drained

The owner's decision (2026-10-07): the open changes are worked down to none
before new product work starts, and a session does not add to them. Changes
were being opened as fast as they were closed, about ten a day each way, and a
well-scoped change goes stale when the code moves under it.

- **A session ends with its change archived and nothing new filed.** It takes
  as long as the change needs.
- **A new change is filed only where the benefit is unambiguously strong**: a
  player hits the defect, or data is at risk. That several games write the
  same thing is not such a benefit while the backlog drains, however true.
- **What does not clear that bar is not filed.** If it is small and the
  change's own goal needs it, fix it there. Otherwise raise it to the owner in
  the closing message, with a recommendation, and leave it.
- **A change does not grow to hold what would have been filed.** It absorbs
  what its goal requires and no more.
- **Game ports and hints wait.** `add-*-ts-port`, a game's hint and
  `hintless-games-in-reserve` are not part of the drain, and a session picking
  its next change passes over them.

Retire this section when the owner says the drain is over.

## Before archiving

- Re-read every spec delta against the code. A delta written mid-change
  states what the code was that morning, and the validator checks a delta's
  shape, never its truth.
- No script of ours writes into a change directory. Archiving renames it.

## Which hintless game comes next

Every game is to have a hint, and a new game ships with its hint. The
remaining hintless games are also how framework work is assessed: a target
contract is tested by writing a real hint against it.

- The framework leads. A hintless game is pulled in beside the framework
  change it checks, at most one per change.
- An open framework change names its game in a "Hints to pull in" section.
  The others wait in the change `hintless-games-in-reserve`.
- Choose the game that presses hardest on what is being built, not the next
  one alphabetically. The cheapest hint is the worst assessment.

## Pushing and deploying

Push to `main` when a task is done and you have no particular concern. The
push deploys, and the deployment is how the owner looks at player-visible
work. `.github/workflows/ci.yml` is the definition of what a push does.

**Verify a deploy against the deployed origin, never against `dist/`.**
Headers, clean URLs and service-worker scope are host behavior, and each
fails invisibly. A browser tab registers no service worker by design, so an
offline check must enable offline use in the settings first, or it measures
nothing and reports health.
