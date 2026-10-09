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
  The promise runs one way (owner, 2026-10-07): what a player holds today
  opens in every later version of the app. That an older copy of the app
  cannot read what a newer one writes is not a cost and is never asked about;
  the app is served, and there is one current version.

A new visual direction for the chrome is the first of the three and is never
a call to make alone: the owner chooses it on sight, from drawn alternatives,
before any implementation begins. A visual direction is a decision made by
looking, and code written ahead of it is work spent on a guess. This is about
a direction (a palette, a type scale, the layout of a surface) where none is
recorded for the surface being changed; a change inside the recorded direction
cites it and goes ahead (`app-shell`, "The chrome follows a recorded design
direction of this project's own"; the head of `src/css/theme.css` names the
one in force).

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

- **A session ends one of two ways.** Its change is archived and it hands an
  existing change to a fresh session; or it found a distinct new issue, and it
  asks the owner. It takes as long as the change needs.
- **An issue the change gave you the context for is taken on at once** (owner,
  2026-10-08): the defect just fixed, found again in another game or in the
  shared layer. The session that fixed the first holds everything the second
  needs, and a fresh session would rebuild it. File a change of its own, after
  the first is archived, and do it without asking.
- **A session files no other change on its own.** For a distinct issue, the ask
  says what it is and what it costs a player, and offers three answers with a
  recommendation: take it on in this session, in a new session (the owner's
  yes is what files the change), or not at all.
- **The ask carries what an informed answer needs** (owner, 2026-10-08): the
  defect seen in the running app, how often it occurs, what the fix would
  touch. An ask that says what the session did not check is not ready.
- **Only an issue whose benefit is unambiguously strong is worth the ask**: a
  player hits the defect, or data is at risk. That several games write the
  same thing is not such a benefit while the backlog drains, however true.
  What is small and needed by the change's own goal is fixed there, unasked.
- **Finish the change before asking.** The ask comes with the change
  archived, unless the issue blocks it.
- **A change does not grow to hold what would have been filed.** It absorbs
  what its goal requires and no more.
- **Game ports and hints wait.** `add-*-ts-port`, a game's hint and
  `hintless-games-in-reserve` are not part of the drain, and a session picking
  its next change passes over them.
- **A change filed for later is a draft: it has no `tasks.md`.** The tool
  reports it apart from the changes in progress (`openspec view`, and
  `no-tasks` in `openspec list --json`), and a session picking its next change
  passes over it. Its plan is in its `design.md`, and writing `tasks.md` from
  that is how a session takes it up, on the owner's word.

Retire this section when the owner says the drain is over.

## Before archiving

- Re-read every spec delta against the code. A delta written mid-change
  states what the code was that morning, and the validator checks a delta's
  shape, never its truth.
- Re-read each merged requirement after archiving. Archive copies the delta's
  words into the main spec, so the requirement has to read as the rule that
  holds, with no mention of the change that made it
  (`openspec/config.yaml`, the rules for `specs`).
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
