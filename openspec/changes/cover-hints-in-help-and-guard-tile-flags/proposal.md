# cover-hints-in-help-and-guard-tile-flags

**Status: scaffolded, not started.** Owner-requested 2026-09-28, during
`add-separate-hint`, for a separate session.

## 1. Every game with a hint has a Hints section in its help

**Why.** A hint's sentence names its marks ("the hatched and outlined regions",
"the ringed dot", "the shaded squares"), and a player who has never been told
what those marks mean has to decode them on the spot. Some help pages teach
them (Bridges' is the fullest: what each hint color and mark means, and where
its marks are the player's own notation); most say nothing. Measured
2026-09-28, 11 of 57 pages under `help/games/` had a `## Hints` heading;
re-take the number with the query in the guard below rather than trusting it.
`add-separate-hint` added Separate's.

**What.**

- A guard that every game in `HINT_GAMES` (`engine/testing/hint-games.ts`,
  derived from the `hint()` declaration, never a roster) has a `## Hints`
  section in `help/games/<id>.md`. It belongs beside `src/help-coverage.test.ts`
  and reads the pages the way that test does. Decide whether it is a vitest
  file or a `scripts/checks/` node script: a doc-only commit skips vitest, and
  a help edit that deletes the section is exactly a doc-only commit, so a
  vitest guard would not see it until CI (AGENTS.md § "Git", steps 5–7 and why
  they are node scripts). Carry a vacuity count and prove it red before
  trusting it.
- Write the missing sections, each in this project's own voice (AGENTS.md
  § "Project at a glance"): what the hint colors mean in *that* game, which
  marks are the player's own notation, and the words its sentences use for
  its marks. Read each game's `hint-text.ts` and render the hint once per game
  rather than describing from memory; a help page that disagrees with the
  hint is worse than none (docs/games/hints.md § "Name elements by what the
  player can see").
- **The guard checks presence, not content.** A heading-sweep cannot tell
  whether a section teaches the marks, as the preset-vocabulary sweep in
  AGENTS.md § "Documentation" found for modes. Say so at the guard.

## 2. Every game's packed tile flags are held free of collisions

**Why.** Each game packs its per-tile draw state into one integer, the diff
key its render cache compares (docs/games/rendering.md § "The tile cache and
the diff key"). Two flags sharing a bit make a tile that silently fails to
redraw, and no snapshot or behavioral test notices. `border-grid-render.ts`
had a collision test that listed four of its seven flag families; during
`add-separate-hint` it was widened to list every exported flag, assert that
list against the module's exports, and check pairwise disjointness as well as
the floor for game bits. Measured 2026-09-28: 21 files under `src/games/`
declare `const X = 1 << n` flags, and none has a collision check.

**Do not build a per-module `SHARED_FLAG_BITS` constant.** It was tried and
withdrawn in `add-separate-hint`: a module listing its own flags cannot catch
the flag it forgot to list, which is the only failure worth catching. Derive
the population from what the module *is*: its exported (or, for module-private
flags, its comment-stripped source's) `1 << n` / `x << n` declarations, the
`enrollment.ts` shape (docs/games/testing.md § "How a cross-game guard finds
its population").

**What to find out first.**

- How the 21 declare their flags: exported constants, module-private ones, a
  field-width helper like `CONTAINS_CURSOR(x) = x << 14`, or bits computed
  inline. A source scan keyed on `1 << ` alone will miss the shifted-width
  helpers, so key on the shape and classify what it catches (AGENTS.md
  § "A scan that keys on a name finds only what was named that way").
- Whether a game's flags can be read at test time at all, or whether some need
  exporting. Exporting a constant only a test reads is production surface a
  test supplies; weigh it the way the ladder census channel was
  (docs/games/solver-and-generator.md § "Proving an adoption").
- Whether a shared helper for the check (a `describeFlagLayout({ flags, floor })`
  in `engine/testing/`) earns its place over one cross-game test that walks
  every game's renderer, as `hint-mark.test.ts` does.
