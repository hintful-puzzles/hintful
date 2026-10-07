# Doctrine: what the project is for, and how that decides things

The long form of the rules in `AGENTS.md` § "What the project is for". Read it
before a framework or cross-game design decision.

## The goal

A puzzle collection where user-facing value comes first and new games and
cross-game features are cheap to build. Quick-save, mistake checking,
explained hints and per-game play aids are why the fork exists. Order work so
that value lands early, and judge a game by whether it plays correctly.

**The scale is dozens to hundreds of games**: a free, ad-free, offline
reimplementation of the micropayment puzzle games on the app stores. At two
games a shared layer's fixed cost dominates. At dozens the marginal cost per
game dominates, and every concern turned from hand-built into derived
compounds. So a framework investment is weighed at dozens of games.

**No progression features.** No best times, streaks, statistics, achievements
or unlocks, and no nudges built on them. A solve is complete in itself: the
timer shows the time of this board and keeps no record of it. Do not propose
or scaffold these.

## Convention over configuration

A game's directory holds what is essential to that puzzle: its rules, its
deductions, its look. Everything that is "how this codebase does things" is
accidental complexity, and reducing it is a standing goal of every change
that touches the framework. For most of what implementing a game involves
there is one obvious way, and the porter makes no decision that is not about
the puzzle.

**The test for whether a decision is real**: can we say what a game would
legitimately want to do differently? If two games could reasonably answer
differently, the decision stays with the game. If they could not, it is a
convention nobody has made yet, and every game is paying to re-answer it. N
games sharing a defect means the layer below them is wrong.

**A game that does not fit a convention is first a question about the
convention.** The catalog is to grow, and today's exception is likely to be
the first of a category. Ask whether the shape can be made more flexible: a
parameter, a variant, a family of shapes. Only when it cannot does the game
take the override, which is then first-class: the game writes the explicit
form and its change says why.

- Game-specific logic is never bent to fit a contract, and an exemplar hint
  never loses a word to an abstraction.
- Swap a guard for the exception; do not skip it. A skipped game is an
  untested game wearing a comment.
- Derive the exception from a declaration the game already makes. An
  exemption roster rots as quietly as a membership roster.
- Ask first whether the exception should exist. An override can excuse a
  defect for a long time: Boats declared its solver non-monotone for as long
  as one wrong read went unlooked for
  ([`solver-and-generator.md`](./games/solver-and-generator.md) §
  "Cap-monotonicity, and the game that broke it").

**The framework owns a shared idiom.** When several games write the same
loop, the same sequence of helper calls or the same bookkeeping, even
identically and well, it belongs in the engine with each game supplying only
what is its own. Re-read any recorded "deliberately not shared" in that light
before inheriting it.

**Refactor as you go.** When you work near code similar to something
elsewhere, unify it if the shared shape will stay stable or will need to
evolve the same way across games. "Noticeably cleaner" is reason enough.
Simplifying by breaking an assumption counts as refactoring. When you
evaluate a candidate and decline, record the decline with its reason. A
framework-scale pivot still needs a real game pressing on it.

## One source of truth

A declaration is healthy when the engine runs it or builds from it: the
dialog, the codec and the tier names are built from `paramConfig`, so it
cannot disagree with them. A statement about a game that sits beside the code
it describes, read only by a check, is a second copy. A new game forgets it,
a changed game leaves it behind, and nothing notices. Refuse that one.

**The direction is more declaration of the consumed kind.** The engine is to
hold a detailed contract of what a game provides, checked by types and
validation, with a game that lacks part of it shown as a draft. Where a guard
derives a population because nothing declared it, a consumed contract
supersedes the derivation. Sections are built only where two channels must
agree: a hint's words and its marks, params and their labels and help, input
and its controls text. What exists today is `src/engine/sections.ts` and
[`games/mechanics.md`](./games/mechanics.md) § "Contract sections, and what
makes a draft".

Until a section lands, a game joins a shared mechanic by having it, and a
cross-game guard finds its population by reading what the game is
(`src/engine/testing/enrollment.ts`). A catalog family may be read as a
population, but it is never the only thing that enrolls a game in a mechanic
the game could simply have.

Before designing a declaration, ask what consumes it. Then ask what the
consumer is already being sent: the declaration may already be crossing the
boundary.

Where intent cannot be observed, and where production needs a flag it cannot
derive at run time, see [`games/testing.md`](./games/testing.md) § "How a
cross-game guard finds its population".

## Nothing is sacred

When abiding by the current design makes something needlessly complex and
breaking an earlier assumption would simplify it, consider that actively. "That
is how it works today" is not an argument.

- **An internal design assumption is yours to change**, with the reason
  recorded: a contract between engine and games, a helper's shape, an
  invariant nothing outside the repo depends on.
- **Anything a player or their data can see is proposed first**, with the
  cost stated: save and game-ID formats, preference keys, shared links, a
  control that behaves differently. Breaking compatibility is on the table,
  and it is the owner's call.

A simplification still needs a stated benefit, and tidiness alone is not one.

**The smell: complexity spent preserving a promise nothing consumes.** Two
signals that a change is pushing against the grain: it duplicates source
lines the probe corpus anchors on, and the careful path it preserves is one
no caller reads. Ask of an inherited invariant who reads it and what they
would do without it. If nobody does, its cost is pure.

## Upstream

There are no merges from upstream and nothing tracks it. Its C is read, in
`../puzzles/` or with `git show pre-ts-pivot:puzzles/<game>.c`, and never
run, so a new question about upstream behavior is answered behaviorally.

**Matching the C is not a reason to leave a game unimproved.** "It would
change every board" is a cost to weigh. A divergence needs a stated
player-visible benefit, and where it drops an assurance the change says what
replaces it. Display code was never in scope for fidelity: rendering, layout,
animation and colors aim at neat visuals and clean code. The rules for a
solver or generator divergence are
[`games/solver-and-generator.md`](./games/solver-and-generator.md)
§ "Divergence and what it costs".

**Game IDs from upstream keep loading where that is easy.** A desc upstream's
generator writes is accepted, and `src/engine/upstream-descs.test.ts` holds
that. A spelling upstream merely tolerated is not kept. A change that would
refuse what upstream's generator writes is a compatibility break.

**The app hands out boards, never seeds.** Anything a player keeps or shares
names the board itself, as `params:desc`. So changing which board a seed
deals is not a compatibility break, and a generator fix needs no ask on that
account.

Do not recreate a directory named for a source tree that no longer exists.
The name misleads the next reader even when the contents are legitimate.

## Open questions

- Whether the Web Worker still earns its place. It existed to keep heavy WASM
  off the main thread, and there is no WASM.
- Whether any one game warrants a stricter, corpus-like differential. It
  would be a per-game option, never a default.
