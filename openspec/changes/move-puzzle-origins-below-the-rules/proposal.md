# move-puzzle-origins-below-the-rules

**Status: scaffolded, not started (2026-10-05).** The owner asked for it on
Salad's page: who invented a puzzle and what else it is called *"really isn't
of interest to readers just looking to understand the game"*, and belongs in
a footnote-like paragraph below. Salad's moved in
`declare-ascent-and-flip-rulesets`, into a section "Where the puzzles come
from" after its controls. This is the same for every other page.

## Why

A page opens with the rules, and a reader there wants to know how to play.
On some pages the rules are followed, before the controls, by the puzzle's
inventor, its other names and a link to more of it. That is a credit worth
keeping and a poor thing to read past on the way to the controls.

## What is known and what is not

**Twelve pages, as a floor.** A scan of each page's unheaded opening for
"invent", "designer", "known as", "also known", "nikoli" and "janko.at", taken
2026-10-05, matched ABCD, Ascent, Boats, Bricks, Clusters, Crossing, Mathrax,
Rome, Seismic, Spokes, Sticks and Subsets. The scan keys on words, so a page
that credits its puzzle in other words is not in it: read the opening of
every page before trusting the list. The pages adopted from upstream's short
fragments mostly carry no credit at all.

**Two of the twelve are ruleset games**, Ascent and Seismic, and credit each
ruleset separately ("Edges mode is an implementation of 1to25 invented by
Jeff Widderich"; "The inventor of Tectonic is unknown"), as Salad did.

## What Changes

To be designed; small.

- **One place and one heading** for a page's origins, after the controls and
  any section of the game's own and before the hints, as Salad's is now.
  `help-coverage.test.ts` holds the skeleton and would hold the heading's
  name and position.
- **For a ruleset game, the origin may belong on the ruleset.** A `Ruleset`
  (`engine/ruleset.ts`) is a name and a rule; an optional origin beside them
  would let the section be generated as the list of rules is, so a renamed
  ruleset cannot leave its credit behind. Worth it only if the three pages
  read better generated than written; decide by trying it on Salad.
- **The words stay.** These are credits to the people who designed the
  puzzles, so the move rewords nothing but the sentence openings a new
  position needs.

## Hints to pull in

None.

## What would show it worked

No page has a credit between its rules and its controls, every credit a page
had is still on it, and a page that puts one back above the controls fails a
check.
