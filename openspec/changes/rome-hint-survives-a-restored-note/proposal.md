# rome-hint-survives-a-restored-note

**Status: scaffolded 2026-09-21, not started.** Found by the random-play sweep
`assert-deduction-runs-out-only-on-unreasonable` ran to check whether a
player's own entries can drive a hint into `DEDUCTION_EXHAUSTED`. None did, but
Rome's hint **threw** on 16 of its calls, all from one board.

## Why

The player presses Hint and gets the crash dialog. `classifyPlacementInRegions`
(`src/engine/latin-hint.ts`) throws "placing 4 at cell 8 is neither a naked nor
a hidden single in the notes, so the plan skipped a strike it rests on". That
throw guards the plan against a real defect, and here it has found a board
where the plan rests on a strike it never takes.

## Reproducer (verified 2026-09-21)

Id `4x4de:aa5a2aca1a,bRaDaXcLbRaL`. Replay these moves with `Midend.playMoves`,
then call `rome.hint`:

```json
[{"kind":"pencilAll"},
 {"kind":"pencilStrike","marks":[{"x":0,"y":2,"n":2},{"x":0,"y":3,"n":4},{"x":2,"y":3,"n":3}]},
 {"kind":"place","x":0,"y":3,"dir":4},
 {"kind":"pencilStrike","marks":[{"x":3,"y":0,"n":3}]},
 {"kind":"place","x":3,"y":0,"dir":8},
 {"kind":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":3,"y":2,"n":2}]},
 {"kind":"pencilStrike","marks":[{"x":3,"y":1,"n":1}]},
 {"kind":"place","x":3,"y":1,"dir":16},
 {"kind":"pencilStrike","marks":[{"x":3,"y":2,"n":3}]},
 {"kind":"pencil","x":0,"y":2,"dir":16}]
```

All but the last move are hint steps. The last is the player's: a pencil toggle
on cell (0,2), which is cell 8, the cell the plan then tries to fill. It
suggests the plan does not strike a note the player put back after the hint had
already struck it. That is a hypothesis, not a finding: confirm it before
designing the fix.

## Open questions

- Is it Rome only? The same sweep put the other candidate games (Solo, Keen,
  Towers, Unequal, Group, Mathrax, Salad, Seismic) through the same random play
  and none threw. That was four boards per preset, which is weak evidence, so
  take the shape of the cause from the code before calling it Rome-only.
- Pin the reproducer as moves (the input the plan consumes), never as a seed.
