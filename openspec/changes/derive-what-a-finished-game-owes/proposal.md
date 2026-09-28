# derive-what-a-finished-game-owes

**Status: scaffolded, not started.** Owner-requested 2026-09-28, after
`cover-hints-in-help-and-guard-tile-flags` found defects in a dozen games that no
per-game test had seen. Two decisions below are the owner's; everything else is
for the implementing session.

## Why

The owner's question: *could the engine hold a much more detailed contract of
what a game must provide — functionality, parameters, text — and treat a game
that lacks any of it as a draft?*

What a finished game owes is real and is currently scattered: roughly twenty
cross-game guards, each deriving its own population (`engine/testing/
enrollment.ts`, `hint-games.ts`, `help-coverage.test.ts`, `warm-repaint.test.ts`,
`capability-surface.test.ts`, the input-parity and touch sweeps…), plus prose in
AGENTS.md and `docs/games/README.md` § "Definition of done". No single place
answers, per game, "what does this one meet, and what does it lack?" At the
scale the vision sets (dozens to hundreds of games) that question is asked for
every new game, and today it is answered by reading everything.

**What the question should not become**, and why the shape below differs from
it:

- **Not a larger `Game` interface.** None of the defects found on 2026-09-28 was
  a missing member: a sentence named a mark drawn otherwise, a tile failed to
  repaint, a help sentence contradicted the code, a hint mark looked finished.
  Types cannot express those. The guards that caught them read what a game
  *does*. Making optional members required would also break the deliberately
  hintless games.
- **Not a declared contract.** A statement *about* a game that only a check reads
  is a manifest (AGENTS.md § "Convention over configuration"); it can be
  forgotten, left behind or wrong, and nothing notices. This has been reversed
  four times (`audit-declared-versus-derived-capabilities`; the "WHY NOT A
  MANIFEST" note in `src/capability-surface.test.ts`).

## What

1. **One obligations ledger** (an engine-testing module): each cross-game
   obligation as an entry naming (a) how its population is derived from what the
   game is, (b) the check that decides whether a member meets it, and (c) where
   intent cannot be observed, a per-member reason for an exemption — the
   `NO_KEYBOARD` / `INERT_PANEL_KEYS` shape, where the ledger is asserted to be
   exactly right. The existing guards become consumers of the ledger (or
   register into it) rather than each carrying its own derivation; take the
   population of guards by reading them, it is small enough to read.
2. **Two kinds of obligation, kept distinct.** *Conditional* ones a game owes
   because it has a mechanic (a hint owes a Hints section and recompute-stable
   plans; a tile cache owes warm-repaint equality). *Bar* ones a finished game
   owes regardless (a help page in the skeleton, keyboard parity, `findMistakes`
   for a uniquely solvable game, a hint for a new game). A game can dodge a
   conditional obligation only by not having the mechanic — which is exactly
   what the bar ones catch.
3. **A derived per-game report**, generated rather than written: each game, each
   obligation, met / lacking / exempt-with-reason. **"Draft" is a value this
   report computes** — some bar obligation lacking without an exemption — never
   a field a game sets.
4. A guard that every obligation named in `docs/games/README.md` § "Definition
   of done" has a ledger entry, so the prose and the ledger cannot drift apart
   (the `engine-catalog.mjs` shape).

## Owner decisions (ask before building the parts they govern)

- **Is "draft" player-visible, and how?** Options: a developer-only report; a
  label in the catalog; the game hidden unless a setting shows drafts. Anything a
  player sees is the owner's call (AGENTS.md § "Work management").
- **Are the hintless games drafts?** AGENTS.md says a game `HINT_GAMES` leaves
  out is deliberately hintless and "not a defect to be swept up", because those
  games are the corpus for assessing framework work. Counting "has a hint" as a
  bar obligation contradicts that; exempting them all is a roster. The likely
  honest shape is that "ships a hint" binds games added after a date, or the
  corpus games carry one ledger reason each — but that is the owner's framing to
  choose.

## Before starting

- Re-derive the population of cross-game guards now; this proposal's "roughly
  twenty" is a count nobody will re-run (AGENTS.md § "A count written in prose").
- Check `src/capability-surface.test.ts` and `engine/testing/enrollment.ts` first:
  part of item 1 may already exist there, and the ledger should extend it rather
  than sit beside it.
- A framework-scale change needs real downstream pressure (the scene-graph
  postmortem). The pressure here is the next few new games: build the ledger
  against them, not against the 57 that already pass everything they are
  enrolled in.
