# name-a-color-in-each-scheme

**Status: implemented 2026-10-15**; `design.md` holds what was measured
and decided.

## Why

`one-region-color-in-every-game` (archived 2026-10-15) put Map on the region
palette's first four in both schemes. In the dark scheme its yellow and pink
read as an ochre and a maroon, and Map's hint still names them "yellow" and
"pink". The owner reviewed the result the same day: it looks really nice in
Map, but the names no longer fit the dark scheme, and they asked for a
follow-up that gives some colors a separate name in each scheme, owned by the
engine.

`engine/color/colors.ts` says a name has to be *truthful*: no word a player
would call something else. Every name there today has one word for both
schemes, so a color whose dark value has drifted to another hue breaks that
rule in one scheme.

## What Changes

- **A color's name is authored per scheme, beside its value**, in the engine
  (`colors.ts`), where the fills already are. A color whose two values a
  player would call by one word keeps one word.
- **The words a game puts in a sentence come from the scheme in force**:
  `FOUR_NAMES`, `TEN_NAMES` and `TWO_NAMES`, and anything else that names a
  color to a player, read the name for the scheme being drawn.
- **Every named color is looked at in both schemes** and given the word a
  player would use, not only Map's yellow and pink. Flood (`TEN_NAMES`),
  Clusters and Unruly (`TWO_NAMES`) are in the population.

## Open questions for the session that takes this up

- **How a hint learns the scheme.** Hint text is built off the canvas;
  today only `color-scheme-init.ts` and `color-scheme.ts` know which scheme
  is in force. The scheme can change while a hint is on screen, so the hint
  either re-reads the name when the scheme flips or names the color in a way
  that holds in both. Measure which the hint plumbing allows before choosing.
- **Snapshots.** Hint-text snapshots are taken in one scheme; the dark words
  need a test that would fail if a dark name were left as the light one.
- **Help pages.** Any help page that names a color either names both or
  avoids the word.
- **Whether a player sees one board's color called two names** is a
  player-visible wording choice. Where one word fits both values, prefer it
  over two. Where it is genuinely unclear which reads better, ask the owner
  with screenshots of both schemes.

## Capabilities

### Modified Capabilities

- `engine-colors`: a named color carries its name for each scheme.
- `map`, and any other game whose hint names a color: the hint names the
  color as it is drawn in the scheme in force.

## Impact

`src/engine/color/colors.ts` and its tests; the hint text of Map, Flood,
Clusters and Unruly; the plumbing that tells hint text the scheme.
