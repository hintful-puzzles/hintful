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
before new product work starts, and a session adds to them only what its own
work found. Changes were being opened as fast as they were closed, about ten
a day each way, and a well-scoped change goes stale when the code moves under
it.

- **A session ends by handing a change to a fresh session**, once its own is
  archived. It stops, with its questions, only when no open change can start
  without the owner's answer. It takes as long as the change needs.
- **An issue the change gave you the context for is taken on at once** (owner,
  2026-10-08): the defect just fixed, found again in another game or in the
  shared layer. The session that fixed the first holds everything the second
  needs, and a fresh session would rebuild it. File a change of its own, after
  the first is archived, and do it without asking.
- **A bug the work found is filed, unasked, and handed on** (owner,
  2026-10-09): one a player can meet, where you can say what to do about it.
  Scaffold its change with its `tasks.md`, after your own is archived, and
  hand it to a fresh session. The proposal carries what an informed reader
  needs: the defect seen in the running app, how it is reached, what the fix
  would touch. A finding you would not spend a session on is not filed; say
  that you looked.
- **Before filing, ask what the engine could do so that no game has the
  finding** (owner, 2026-10-10), and file that. A finding with the same shape
  in two games is one change to the shared layer, never a change a game.
  Twelve games gained a tier in a day, each session measured its own game
  and filed what it saw, and those changes filed their own: the open changes
  grew, nearly all of it in one game at a time. A board dealt already solved
  was found in Rectangles, and the fix was one loop in the engine's deal,
  which mended Netslide unasked.
- **An improvement to one game that is not a bug is a draft for the owner to
  pick**: a new deduction, a faster generator, a refusal for a corner of the
  Custom dialog. It is filed without `tasks.md` (below), or not at all.
- **A change that was filed by a change files nothing of its own kind.** If
  its work finds the same thing again, the finding is the engine's, and the
  session says so to the owner and does not scaffold a third.
- **The three-way ask is for new optional work only**: something nobody's
  change found, that the product does not need. The ask says what it is and
  what it costs a player, and offers three answers with a recommendation:
  take it on in this session, in a new session, or not at all.
- **A question for the owner is written into the change it blocks**, and that
  change waits as a draft while the session takes another. An ask that says
  what the session did not check is not ready (owner, 2026-10-08).
- **What is small and needed by the change's own goal is fixed there**,
  unasked.
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
