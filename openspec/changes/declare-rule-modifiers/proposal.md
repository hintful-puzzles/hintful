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
their `doc`, with the help page opened for the candidates. **Whether each
combines freely with the others in its game has not been checked**, and that
is task 1: the tell is a refusal in `validateParams` naming two of them, or a
generator that ignores one when another is set.

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

To be designed after task 1. The questions, in order:

- **Which of these are modifiers, and which are rulesets in disguise.** Two
  fields that cannot both be set are one ruleset field with more choices.
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
