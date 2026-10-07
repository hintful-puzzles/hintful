# move-puzzle-origins-below-the-rules

**Status: done (2026-10-07).** The owner asked for it on
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

What was built is in "What was decided" at the end; the three points below
are the scaffold's.

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

## What was decided

- **The twelve were the whole list.** All 57 openings were read; no page
  credits its puzzle in other words, and none does under a heading.
- **Two headings, read off the game.** "Where the puzzle comes from", and
  "Where the puzzles come from" for a game that declares rulesets. Salad's
  plural reads wrongly on a page with one puzzle, where "the puzzles" would be
  taken for the boards.
- **A ruleset does not carry its origin.** Tried on Salad, a generated list
  needs each credit recast as a "Name: …" line, which rewords it, and Ascent's
  main credit is to the whole game and belongs to neither ruleset. What
  generation would have bought, a renamed ruleset keeping its credit,
  `{{choice:ruleset:<index>}}` already gives.
- **A credit in the rules is told by its words**, because nothing else tells
  one from a rule: a link does not, since Group's rules link to Wikipedia.
  That makes the check a floor, and the test and the guide both say so.

## What would show it worked

No page has a credit between its rules and its controls, every credit a page
had is still on it, and a page that puts one back above the controls fails a
check.
