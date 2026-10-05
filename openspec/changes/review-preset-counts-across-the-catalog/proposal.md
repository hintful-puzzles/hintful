# review-preset-counts-across-the-catalog

**Status: scaffolded, not started (2026-10-05).** Asked for by the owner on
seeing Salad's menu after `offer-salad-normal-presets`: *"it has really a lot
now. Can you please scaffold a change for us to review the number of presets
across all games, and to arrive at something more consistent catalog-wide?"*

## Why

How many presets a game offers was never decided here. Each list is the one
its upstream author wrote, plus whatever a later change added, and nobody has
looked at them side by side.

Taken 2026-10-05 from each registered game's `leafPresets` (57 games): the
median is 7, the least 1 (Fifteen) and the most 23 (Loopy).

- **15 or more**: Loopy 23, Solo 18, Ascent 17, Seismic 16, Salad 15.
- **10 to 12**: Boats, Dominosa, Rome, Tracks and Unequal at 12; Keen, Net and
  Singles at 10.
- **3 or fewer**: Filling, Inertia, Slide and Sokoban at 3; Guess, Sticks and
  Subsets at 2; Fifteen at 1.

The query is `leafPresets(game).length` over the registry, and it should be
re-taken rather than read from here.

Three things besides the count differ from game to game, and each is a
question a player meets in the picker:

- **Sections.** Loopy folds its tilings under "More...". **Decided
  2026-10-05 for rulesets** (`declare-rulesets-explicitly`,
  `declare-ascent-and-flip-rulesets`): a game declares its rulesets with
  `rulesetItem` and the engine gives each one a section, so the games that
  call it are sectioned by construction. Still open: a field that is not a
  ruleset (Loopy's tilings, Ascent's grids, whose "Hex" heading went when
  Edges became a ruleset and left 14 presets in one section), and a rule
  modifier (`declare-rule-modifiers`).
- **Which tiers a menu offers.** `walk-every-choice-the-dialog-offers` found
  a tier no preset holds in Loopy, Mathrax, Unequal and Group. A menu that
  stops short of a tier and a menu with every size at every tier are the two
  ends of one decision.
- **A leaf's title inside a section.** Salad's entries read "Letters: 5x5 A~C
  Easy" under a section already titled "Letters", because a title is the
  params label (`engine/param-label.ts`) and the label does not know where it
  is shown.

## What Changes

To be decided with the owner; this proposal claims only the measurements.
The shape it should arrive at is a **convention** (AGENTS.md § "Convention
over configuration"): a rule a new game follows without choosing, with a
game that needs otherwise saying why. Candidates to weigh:

- a target range for a menu's length, and what a game past it does (sections,
  or fewer sizes);
- when a mode is a section, when it is a word in each title, and whether a
  title drops the word its section already says;
- whether a menu is a grid of sizes by tiers, a ladder (each step up is
  larger *and* harder), or the author's pick, and which of those the catalog
  wants by default;
- whether the menu is derived from a smaller declaration (sizes, tiers,
  modes) instead of written out, which is what would make the rule hold by
  construction.

**The deal's cost bounds the answer.** A preset that takes seconds to deal is
a worse offer than none (`offer-salad-normal-presets` chose its four that
way; `bound-custom-sizes-by-their-deal` has the method), so a rule that says
"every tier at every size" is not available to every game.

**The guards read the menu, and since 2026-10-05 not only the menu.** Every
cross-game sweep deals from presets (`engine/testing/presets.ts`), so trimming
a menu removes boards from the suite and adding to one adds them. What a trim
can no longer remove is a *value*: `walk-every-choice-the-dialog-offers` made
the sweeps deal every tier, rule and mode the Custom dialog offers, on the
first preset that accepts it, whether or not a preset holds it. So a menu does
not need a tier or a mode for the guards' sake, and whether it offers one is a
question about the player alone. What a trim still removes is a size, and a
combination: a tier at the size where it is hard. Say what covers those.

One menu changed there, because nothing else could reach the value: ABCD
gained "6x6 Easy, 5 letters, no diagonal", its one board under the rule
against diagonal touching, which needs five letters and no other preset has
them. It is this review's to keep, move or reword.

## Compatibility

Presets are a menu; no saved game or shared ID names one. A player's habit
of finding a board at a place in the list is the only thing a reshuffle
costs.

## Hints to pull in

None.

## What would show it worked

A rule in `docs/games/mechanics.md` a new game's menu follows, the catalog's
menus following it or saying why not, and a test that holds the rule.
