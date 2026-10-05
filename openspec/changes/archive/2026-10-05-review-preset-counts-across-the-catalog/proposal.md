# review-preset-counts-across-the-catalog

**Status: decided and applied (2026-10-05).** The measurements are
`census.md` and what each menu became is `menus.md`. Asked for by the owner on
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
  - **If a ruleset's section wants groups of its own**, the rule to relax is
    `presetMenu`'s "a game with a ruleset lists its presets flat", to "a
    section the game writes holds one ruleset". Ascent's hexagonal presets
    are the case.
  - **Whether a modifier orders or groups a menu** is open, and the owner
    chose to leave menus alone when the modifiers were declared. Read from
    the presets 2026-10-05: Solo, Twiddle, Net, Netslide, Group and ABCD mix
    a modifier's values through one flat list; Unruly, Bridges and Guess
    offer theirs from Custom alone. A game with one modifier could put its
    boards under a heading; Solo's three combine, so its menu needs a rule
    of its own.
- **Which tiers a menu offers.** `walk-every-choice-the-dialog-offers` found
  a tier no preset holds in Loopy, Mathrax, Unequal and Group. A menu that
  stops short of a tier and a menu with every size at every tier are the two
  ends of one decision.
- **A leaf's title inside a section. Done 2026-10-05**
  (`leave-the-headings-word-off-a-preset`): a line under a ruleset's heading
  leaves the ruleset's name off, and the type header keeps it.

## What Changes

Decided with the owner, 2026-10-05, from `census.md`:

- **A menu is a grid**: each board at every tier, in the order the game lists
  its boards. Twenty-six of the tiered games were already that or that with
  corners cut.
- **A section holds at most twelve lines.** The cap is on lines, not on
  sizes: a game trades sizes against tiers to fit, and a board may stop short
  of a tier to do it.
- **A rule modifier has one line**, after the grid, so a player can see it
  exists. A second kind of board (Ascent's hexagonal grids) is treated the
  same way.
- **A game with a size offers at least three boards.**
- Asked for in the same sitting: Unruly gains 6x6 boards.

The convention is `docs/games/mechanics.md` § "The preset menu is a grid",
`presetGrid` (`engine/preset-grid.ts`) builds it, and
`preset-menu-shape.test.ts` holds every menu to it by its shape. What each
menu became is `menus.md`.

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
