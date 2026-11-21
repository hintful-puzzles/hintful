# Doctrine: what the project is for, and how that decides things

The long form of the rules in `AGENTS.md` § "What the project is for". Read it
before a framework or cross-game design decision.

## The goal

A puzzle collection where user-facing value comes first and new games and
cross-game features are cheap to build. Quick-save, mistake checking,
explained hints and per-game play aids are why the fork exists. Order work so
that value lands early, and judge a game by whether it plays correctly.

- **The scale is dozens to hundreds of games**: a free, ad-free, offline
  reimplementation of the micropayment puzzle games on the app stores. At two
  games a shared layer's fixed cost dominates; at dozens the marginal cost per
  game does, and every concern turned from hand-built into derived compounds.
  So weigh a framework investment at dozens of games.
- **The measure of "cheap" is one session.** A new game whose rules are well
  understood is written whole (logic, solver, generator, hint, presentation,
  tests, spec and help page) in one long session of under a million tokens.
  What the session reads counts against that as much as what it writes, so a
  guide is weighed by what a new game's author needs from it, and a shape
  every game repeats is the engine's to own.
- **No progression features**: no best times, streaks, statistics,
  achievements or unlocks, and no nudges built on them. A solve is complete in
  itself: the timer shows this board's time and keeps no record of it. Do not
  propose or scaffold these.

## Where the engine is heading: a game is its description

The end state (owner, 2026-11-21): **no imperative code addressed to one
game**. A game is its description, which invokes kinds of rule, input,
painting, dealing and encoding that the engine provides, with their
parameters. Code that only one game uses today still exists, but it is a
capability in the engine, written so that the next game uses it by writing
a description. The review that set this course is
`openspec/changes/archive/2026-11-21-architectural-review-blue-sky/design.md`.

- **Code is addressed to a concept, never to a game.** The test of a
  capability is that it reads only the engine's vocabulary: the board's
  elements, values, clues and marks, never a game's own types. That is why
  the board itself is the engine's first: without one model there is no
  shared vocabulary to write a capability in.
- **A description says what; a capability says how.** A description names
  capabilities, their parameters and the elements they act on. When it
  starts to need branching or a loop, a capability is missing; the
  description language does not grow into a programming language.
- **A capability's first user does not guess its generality.** It is
  general in the data it reads and specific in what it does, and the second
  game that wants it reshapes it, once, in the engine.
- **Declarative is compiled, not interpreted.** Descriptions compile to
  TypeScript, so a capability pays no interpretation cost; a step toward
  this end state still measures frame time and hint-walk time, since the
  scene-graph contract withdrawn in 2026-05 lost on frame time.
- **The compiler's refusals are the porter's interface.** A description that
  does not compile says which line is wrong and why, in the puzzle's terms.
- **A game not yet moved is not a second way.** Once the engine can carry a
  kind of game wholly from its description, a new game of that kind is born
  so, and an older one is work not yet done, never a form to copy.

Open, for a later conversation (owner, 2026-11-21): the game's art from the
engine too, the description declaring the kinds of piece it needs, each
instance and its properties, and the engine drawing them.

## Convention over configuration

A game's directory holds what is essential to that puzzle: its rules, its
deductions, its look. Everything that is "how this codebase does things" is
accidental complexity, and reducing it is a standing goal of every change
that touches the framework. For most of what a game involves there is one
obvious way, and the porter makes no decision that is not about the puzzle.

- **A decision is real only if a game could legitimately want it different.**
  If two games could reasonably answer differently, it stays with the game. If
  not, it is a convention nobody has made yet, and every game pays to
  re-answer it. N games sharing a defect means the layer below them is wrong.
- **A game that does not fit a convention is first a question about the
  convention.** The catalog is to grow, so today's exception is likely the
  first of a category: ask whether the shape can be made more flexible (a
  parameter, a variant, a family of shapes). Only when it cannot does the game
  take the override, which is first-class: the game writes the explicit form
  and its change says why.
- **Game-specific logic is never bent to fit a contract.**
- **A hint's words are standardized**: the same deduction reads the same in
  every game, and a game keeps wording of its own only where it needs it. A
  hint may be reworded for that and is never made significantly less clear,
  judged in the running app: a little clarity in one game is a fair price
  for consistency across the catalog, which itself lowers what a player has
  to hold (owner, 2026-11-10).
- **Swap a guard for the exception; do not skip it.** A skipped game is an
  untested game wearing a comment.
- **Derive the exception from a declaration the game already makes.** An
  exemption roster rots as quietly as a membership roster.
- **Ask first whether the exception should exist.** An override can excuse a
  defect indefinitely: a solver declared non-monotone excuses the wrong read
  that makes it so ([`solver-and-generator.md`](./solver-and-generator.md) §
  "A capped solver must be monotone in its cap").
- **The framework owns a shared idiom.** When several games write the same
  loop, sequence of helper calls or bookkeeping, even identically and well, it
  belongs in the engine, with each game supplying only what is its own. Re-read
  any recorded "deliberately not shared" in that light before inheriting it.
- **Refactor as you go; "noticeably cleaner" is reason enough.** When you work
  near code similar to something elsewhere, unify it if the shared shape will
  stay stable or evolve the same way across games. Simplifying by breaking an
  assumption counts. Record a decline with its reason. A framework-scale pivot
  still needs a real game pressing on it.

## One source of truth

A declaration is healthy when the engine runs it or builds from it: the
Custom dialog, the params codec and the tier names are built from
`paramConfig`, so they cannot disagree with it. A statement about a game that
sits beside the code and is read only by a check is a second copy: a new game
forgets it, a changed game leaves it behind, and nothing notices. Refuse it.

- **The direction is more declaration of the consumed kind.** The engine is
  to hold a detailed contract of what a game provides, checked by types and
  validation, with a game that lacks part of it shown as a draft. Where a
  guard derives a population because nothing declared it, a consumed contract
  supersedes the derivation. Sections are built only where two channels must
  agree: a hint's words and its marks, params and their labels and help, input
  and its controls text. What exists today is `src/engine/contract/sections.ts` and
  [`mechanics.md`](./mechanics.md) § "Contract sections, and what makes a
  draft".
- **Until a section lands, a game joins a shared mechanic by having it.** A
  cross-game guard finds its population by reading what the game is
  (`src/engine/testing/enrollment.ts`). A catalog family may be read as a
  population, but it is never the only thing that enrolls a game in a mechanic
  the game could simply have.
- **Before designing a declaration, ask what consumes it**, then what the
  consumer is already sent: the declaration may already cross the boundary.
- **Where intent cannot be observed**, or production needs a flag it cannot
  derive at run time, see [`testing.md`](./testing.md) § "How a cross-game
  guard finds its population".

## Nothing is sacred

When abiding by the current design makes something needlessly complex and
breaking an earlier assumption would simplify it, consider that actively.
"That is how it works today" is not an argument.

- **An internal design assumption is yours to change**, with the reason
  recorded: a contract between engine and games, a helper's shape, an
  invariant nothing outside the repo depends on.
- **Anything a player or their data can see is proposed first**, with the
  cost stated: save and game-ID formats, preference keys, shared links, a
  control that behaves differently. Breaking compatibility is on the table,
  and it is the owner's call.
- **A change that makes games consistent with each other needs no ask**,
  even where a player sees it (owner, 2026-11-21). The change states what
  a player will see differently; a compatibility break is still named.

A simplification states its benefit, and a significant simplification that
makes the code easier to maintain is a benefit in its own right (owner,
2026-10-31). This is a judgment, not dogma: what falls short is a change that
is only tidier, with no gain to show.

**The smell is complexity spent preserving a promise nothing consumes.** A
change pushes against the grain when it duplicates source lines the probe
corpus anchors on, or when the careful path it preserves is one no caller
reads. Ask of an inherited invariant who reads it and what they would do
without it; if nobody does, its cost is pure.

## Upstream

Nothing is merged from upstream and nothing tracks it. Its C is read, in
`../puzzles/` or with `git show pre-ts-pivot:puzzles/<game>.c`, and never
run, so a new question about upstream behavior is answered behaviorally.

- **Matching the C is not a reason to leave a game unimproved.** "It would
  change every board" is a cost to weigh. A divergence needs a stated
  player-visible benefit, and tidiness is not one; where it drops an
  assurance the change says what replaces it. Reading a solver or generator
  quirk before diverging is
  [`solver-and-generator.md`](./solver-and-generator.md) § "Divergence and
  what it costs".
- **Display code is not held to upstream**: rendering, layout, geometry,
  animation and colors aim at neat visuals and clean code.
- **Game IDs from upstream keep loading where that is easy.** A desc
  upstream's generator writes is accepted (`src/guards/upstream-descs.test.ts`
  holds it); a spelling upstream merely tolerated is not kept. A change that
  would refuse what upstream's generator writes is a compatibility break.
- **The app hands out boards, never seeds.** Anything a player keeps or
  shares names the board itself, as `params:desc`, so changing which board a
  seed deals is no compatibility break, and a generator fix needs no ask on
  that account.
- **Do not recreate a directory named for a source tree that no longer
  exists.** The name misleads the next reader even when the contents are
  legitimate.

## Open questions

- Whether any one game warrants a stricter, corpus-like differential. It
  would be a per-game option, never a default.
