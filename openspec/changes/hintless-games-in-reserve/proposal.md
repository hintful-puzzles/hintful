# hintless-games-in-reserve

**Status: scaffolded, not started (2026-09-29).** Each game gets its own change
when it is taken up; this one holds the reserve and the decision point.

## Why

The owner's approach (2026-09-29) is framework first, with hintless games
pulled in **one at a time** as a check on the framework's ergonomics, and most
kept in reserve. Three open framework changes each name the one game that
checks them best:

- `sweep-target-verb-input`: Net. It was `derive-target-verb-input`'s, which
  found Net not yet expressible in the model and passed it to the sweep. The
  sweep made Net a member, measured that locks alone cannot carry its hint,
  and passed it to `add-net-notation` and `add-net-hint` (owner, 2026-09-30),
  which wrote it.
- `own-the-player-facing-messages`: Pegs. The change found the kinds already
  say what a Pegs hint must refuse with, and passed the hint to
  `add-pegs-hint` (2026-09-30).
- `draw-hint-marks-from-roles`: Rect.
- `derive-verb-gestures-from-the-declaration`: Mosaic, which it wrote
  (2026-09-30).

`declare-params-in-one-place` and `derive-the-draft-label` pull in none.

## The reserve

Every other hintless game: Black Box, Cube, Flip, Mines, Same Game,
Slide, Sokoban and Twiddle. No phase claims them. A game leaves the reserve
when a framework change (open or yet to be proposed) turns out to press on it
harder than its named game does, or when the decision point below says so.
Rect has left: `draw-hint-marks-from-roles` wrote its hint (archived
2026-09-29).
Re-take the population from the registry (games without `hint`, as
`HINT_GAMES` derives the hinted ones) rather than trusting this list.

## The decision point

A game without a hint is a draft, and the goal is every game hinted by the end
of October 2026 (AGENTS.md § "Hint quality bar"). **By mid-October, compare the
hintless games left against the weeks left.** If the reserve cannot be cleared
one at a time in what remains, the owner decides between writing reserve hints
for the target (each change then says it was written for the target, not as a
check) and moving the target.

The search games in it (Cube, Same Game, Slide, Sokoban) start with a short
design pass on what the hint can *prove* (docs/games/hints.md §
"Non-deductive (heuristic) hints": Inertia's unreachable gem is the shape),
because a search may certify a position but never teach one.
