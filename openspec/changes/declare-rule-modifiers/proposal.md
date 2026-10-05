# declare-rule-modifiers

**Status: scaffolded, not started (2026-10-05).** Asked for by the owner on
the survey `declare-ascent-and-flip-rulesets` ran: *"If they really can be
combined orthogonally, then let's mark them as modifiers, but if they are
contradictory in some way, then they should be separate rulesets."*

## Why

A ruleset is one of several puzzles a game plays, and a board has exactly one
(`engine/ruleset.ts`). The survey found a second kind of field that also
changes what the player must do: one that **adds or removes a single rule**
and may hold together with others. Solo's X, Jigsaw and Killer are the clear
case: any of the eight combinations is a board. Nothing declares these. Each
is a checkbox or a choices field like any other, with label words the game
composed, and several sit mixed through a flat preset list.

## What the survey found

Read 2026-10-05 from every game's `paramConfig`; the fields were judged from
their `doc`, with the help page opened for the candidates.

**They combine freely, so none is a ruleset in disguise** (measured
2026-10-05). For each game, every combination of its candidate fields was
written onto the first preset `paramsError` accepts it on, dealt through
`Midend.newGameFromId`, and its params encoded and decoded to see that each
field read back as set: 34 combinations in nine games, all dealt, none lost.
The eight of Solo's X, Jigsaw and Killer are among them. No `validateParams`
names two of these fields together. What each is coupled to is a size or a
tier: Killer needs a grid under 10 and X one over 3, Group cannot hide its
identity at Easy or on 3x3, ABCD's rule against diagonal touching needs five
letters, a wrapping Net cannot have a side of 2, and Unruly's unique rows
bound the board's proportions. The deals were of small boards, so this shows
each combination is a board, and nothing about whether it is a good one.

| Game | Field | Presets mix its values |
|---|---|---|
| Solo | X, Jigsaw, Killer | yes |
| Twiddle | Orientation matters, One number per row | yes |
| Net, Netslide | Walls wrap around | yes |
| ABCD | Allow diagonal touching | yes, one preset |
| Group | Show identity | yes |
| Unruly | Unique rows and columns | no |
| Bridges | Allow loops, Max. bridges per direction | no |
| Guess | Allow duplicates, Allow blanks | no |

The survey's own doubts: Bridges' maximum and Guess's blanks are limits inside
a rule more than rules; Group's identity withholds a given and changes no
axiom; Solo's Jigsaw is partly the board's shape.

Left out as generator settings that add no rule: Keen's multiplication only,
Mathrax's clue kinds, Signpost's corners, Tracks' consecutive 1s, Ascent's
hidden ends, Same Game's scoring.

## What Changes

To be designed. Every label in the table already has one shape, which is the
declaration's to take over: the field says its words when its rule departs
from the plain game ("wrapping", "no loops", "identity hidden") and nothing
otherwise. So a modifier is a checkbox, the value at which its rule applies,
the words for a title, and the rule's sentence. The questions:

- **What consumes the declaration.** A mark nothing reads is a second copy
  (AGENTS.md § "One source of truth"). Candidates: the help's rules, which
  could list each modifier and its rule as `{{rulesets}}` lists rulesets, so a
  rule a checkbox adds is never explained only in the parameters section
  (ABCD's diagonal rule and Twiddle's rows-only win are, today); the params
  label, where a modifier's words now go in `kind` or `tail` as each game
  chose; and the menu, where a modifier might order or group presets.
- **What a preset list may mix.** The owner's rule for rulesets is that their
  boards never share a list. Whether a modifier's do is this change's to
  propose and `review-preset-counts-across-the-catalog`'s to settle.

## Hints to pull in

None.
