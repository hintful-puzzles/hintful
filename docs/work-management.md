# Work management

How a piece of work is scoped, finished, accepted and shipped here. Work is
tracked with openspec; how the tool behaves is in its own documentation and
the skills it installs. This guide holds only what this project has decided
about its own workflow.

## One change per coherent unit of work

A game is one change, a cross-game feature is one change, and a game's
explained hint is normally its own. Bundle items only when they share
identical design reasoning; an item with its own non-obvious decisions stays
separate. Keep a change's tasks current as you implement, and conclude the
change in the session that finishes the work.

## No approval step, and you archive your own work

Scaffold a change and go on into its implementation in the same session. The
tool's generic workflow has an approval step between proposal and
implementation, and its propose skill says to stop after planning; neither
applies here. A change you scoped, decided and implemented is yours to
finish: implement, verify, commit, push and archive, with no checkpoint. An
internal contract, a helper's shape, a test harness, a doc restructure, or a
spec requirement recording a decision you made and can defend is an
implementation detail. Asking the owner to accept one turns a decision you
own into an item on someone else's desk.

## What the owner accepts

Three things, and no others:

- **Player-visible work where you are genuinely unsure which answer is
  better.** Player-visible does not by itself mean stop and ask: where one
  answer is plainly better, make the call, say what you decided and why, and
  run the app yourself. Never call a shortfall cosmetic.
- **Anything the owner asked for by name.** They described the outcome, so
  they decide whether you hit it.
- **Anything that breaks compatibility with data a player already has**:
  save formats, preference keys, shared game IDs. Ask before, with the cost
  stated. The promise runs one way (owner, 2026-10-07): what a player holds
  today opens in every later version of the app. That an older copy cannot
  read what a newer one writes is not a cost and is never asked about; the
  app is served, and there is one current version.

**A new visual direction for the chrome is the first of the three, and never
a call to make alone.** The owner chooses it on sight, from drawn
alternatives, before any implementation begins: it is decided by looking, and
code written ahead of it is work spent on a guess. This covers a direction (a
palette, a type scale, the layout of a surface) where none is recorded for
the surface being changed. A change inside the recorded direction cites it
and goes ahead (`app-shell`, "The chrome follows a recorded design direction
of this project's own"; the head of `src/css/theme.css` names the one in
force).

**During a run of framework refactoring the owner may defer testing to the
end of the arc.** Take that as said only when it is said.

**Stop and ask only for a difficult decision**: a real trade-off with no
clear winner, two readings that produce materially different work, or
something irreversible. A design decision the evidence already determines is
written down and implemented, not asked.

## A decision is persisted by a commit

Saying something in a reply, or filing it in an agent's own memory, persists
nothing: the next session starts from the repo.

- **A follow-up that clears the bar in § "What a session files" becomes a
  scaffolded change** under `openspec/changes/`. Verify the defect is real
  first: an audit proposed on an unchecked suspicion costs the next reader an
  investigation.
- **A rule goes in the guide for the part of the tree it binds**, and in
  `AGENTS.md` only when it binds every session.
- **If it is not worth a commit, say plainly that you looked and found
  nothing.**
- **Never cite an agent-private note to the owner.** They cannot read it.

## What a session files

The open changes are kept few, because a well-scoped change goes stale when
the code moves under it, so a session adds only what its own work found.
What is open is `openspec list`.

- **A session ends by handing a change to a fresh session**, once its own is
  archived. It stops, with its questions, only when no open change can start
  without the owner's answer, and it takes as long as the change needs.
- **An issue the change gave you the context for is taken on at once**
  (owner, 2026-10-08): the defect just fixed, found again in another game or
  in the shared layer. The session that fixed the first holds everything the
  second needs, and a fresh session would rebuild it; file it as a change of
  its own after the first is archived, without asking.
- **A new change is filed for one game's issue only under one of four
  heads** (owner, 2026-10-11). The rule limits new work items, never a fix
  (see the quick-fix bullet below):
  1. The owner asked for it by name.
  2. It is a significant bug on a typical board: the game crashes, or a
     player cannot finish or enjoy it. A bug only a pathologically large
     board reaches does not count for now.
  3. The game is inconsistent with the engine and with how other games use
     it, and the change makes it consistent, so that it stops being a
     per-game concern.
  4. It is one face of an engine defect or lack, which the engine can mend
     for many games.

  Ask the third and fourth before deciding a finding is only the game's. Two
  games' improvements can be one engine defect: Seismic's Mark-all stopping
  at the fill and Group's refusing a small `m` were each a game reading a
  letter for a control, and the engine's fix also caught a control typing 22
  into a Solo square.
- **A finding that qualifies is filed, unasked, and handed on** (owner,
  2026-10-09). After your own change is archived, scaffold its change with
  its `tasks.md` and hand it to a fresh session. The proposal carries what an
  informed reader needs: the defect seen in the running app, how it is
  reached, and what the fix would touch.
- **Before filing, ask what the engine could do so that no game has the
  finding** (owner, 2026-10-10), and file that. A finding with the same shape
  in two games is one change to the shared layer, never a change a game: a
  board dealt already solved, found in Rectangles, was one loop in the
  engine's deal, which mended Netslide unasked.
- **A quick, low-risk fix is always made in passing**, whatever game it is in
  and whatever the session came for: a help page that says what the game does
  not do, a wrong label, a stale comment. It goes in with the work in hand or
  as a commit of its own, and needs no change. What is not quick or not
  low-risk, and comes under none of the four heads, gets a line in the
  session's report and no change.
- **An improvement to one game is not filed, as a draft or otherwise**: a new
  deduction, a faster generator, a refusal for a corner of the Custom dialog.
- **What your own change touches is still yours to leave right.** A
  shortfall in its own game-facing work is fixed there, and so is what is
  small and needed by its goal, unasked.
- **A change does not grow to hold what would have been filed.**
- **A change that was filed by a change files nothing of its own kind.** If
  its work finds the same thing again, the finding is the engine's: the
  session says so to the owner and does not scaffold a third.
- **The three-way ask is for new optional work only**: something nobody's
  change found, that the product does not need. The ask says what it is and
  what it costs a player, and offers three answers with a recommendation:
  take it on in this session, in a new session, or not at all.
- **A question for the owner is written into the change it blocks**, and that
  change waits as a draft while the session takes another. An ask that says
  what the session did not check is not ready (owner, 2026-10-08).
- **A change filed for later is a draft: it has no `tasks.md`.** The tool
  reports it apart from the changes in progress (`openspec view`, and
  `no-tasks` in `openspec list --json`), and a session picking its next change
  passes over it. Its plan is in its `design.md`; writing `tasks.md` from that
  is how a session takes it up, on the owner's word.

## New work is the engine's

The owner's decision (2026-10-10): from here on the work is on the engine,
for consistency across the games and ease of keeping them.

- **A game is edited only by the least that fixes something already wrong in
  it.** No new deduction, control or refusal for one game is proposed.
- **Where the engine can do a thing, the engine does it, even against an
  earlier decision.** Where several games share a defect and a guide line says
  each game handles it, put the engine's fix to the owner with a
  recommendation; do not settle for the per-game fix because the guide line
  stands in the way.
- **A session working in one game says what the engine would have had to
  offer for the work not to be needed**, and files that.

## A cross-game refactor moves no bytes a player owns

A change that re-expresses many games at once (a helper adopted across the
collection, a vocabulary unified, a loop moved onto the shared runner) is held
to four invariants, and a diff that moves one of them is wrong until the
owner says otherwise:

- **Game IDs and descs are player promises.** Hand-written codecs stay,
  `src/engine/random/` stays bit-identical, and no byte of any `params:desc`
  or `params#seed` id changes. The frozen differentials are the net for this
  ([`testing.md`](./testing.md) § "The frozen differentials").
- **Narration is frozen through a re-expression.** Every hint suite's wording
  assertions pass unedited, or the re-expression is wrong.
- **Render output is stable where behavior is.** Tier-2.5 snapshots move only
  where a change is intended, and every changed snapshot line is explained by
  the declared change.
- **A framework-scale pivot is never approval-free.** It needs real
  downstream pressure, measured, and the owner's acceptance.

Two rules make a sweep across the collection affordable:

- **Two lanes.** A re-expression whose whole guard set passes unchanged
  (differentials, narration and snapshots all byte-clean) is provably
  invisible and takes spot acceptance for its batch; one that re-baselines a
  single snapshot takes the full acceptance gate.
- **A capability diff per game.** A sweep's risk is silent capability loss:
  a game stops having hints, mistakes, preferences, a keypad, a reference aid
  or tiers. The set is derived from what the game is, its optional `Game`
  members and the `Ui` its `newUi` returns, and never declared;
  [`contract-surface.test.ts`](../src/contract-surface.test.ts) reads the
  optional surface off the interface.

## Before archiving

- **Re-read every spec delta against the code.** A delta written mid-change
  states what the code was that morning, and the validator checks a delta's
  shape, never its truth.
- **Re-read each merged requirement after archiving.** Archive copies the
  delta's words into the main spec, so the requirement has to read as the
  rule that holds, with no mention of the change that made it
  (`openspec/config.yaml`, the rules for `specs`).
- **Put a game's spec back in order before committing the archive.**
  Archiving appends an added requirement to the end of the spec, after
  `Look`, and the gate refuses the commit until
  `node scripts/checks/spec-subjects.mjs --fix` has restored the order of its
  subjects ([`new-game.md`](./new-game.md) § "What a game's spec holds").
- **No script of ours writes into a change directory.** Archiving renames it.

## Pushing and deploying

Push to `main` once, when the session's work is done and you have no
particular concern, or earlier when the owner asks to see it. The push
deploys, and the deployment is how the owner looks at player-visible work, so
work the owner is waiting to look at is a reason to end the session's commits
there and push.

- **Once, because the push is where the suite is paid for whole.** A commit
  tests the games it stages; the push hook runs what the session's commits
  left out, which for a change to shared code is every game's boards, and a
  second push pays that again ([`testing.md`](./testing.md) § "What runs
  when"). `.github/workflows/ci.yml` defines what a push publishes, and
  `gate.yml` beside it runs the whole gate.
- **Verify a deploy against the deployed origin, never against `dist/`.**
  Headers, clean URLs and service-worker scope are host behavior, and each
  fails invisibly. A browser tab registers no service worker by design, so an
  offline check must enable offline use in the settings first, or it measures
  nothing and reports health.
