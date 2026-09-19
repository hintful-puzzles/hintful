# note-crossing-deep-eliminations

## Why

`apply-markable-facts-rule`'s audit found Crossing's deep tier breaking `AGENTS.md`
§ "Hint quality bar" rule 6. A `deep` firing (*"Once the crossing numbers rule the
others out, …"*) rests on the narrowing fixpoint in `crossing/hint-solver.ts`, where
a number dies because a crossing run ruled a digit out of one of its squares. Those
digit rule-outs are exactly what Crossing's pencil notes record, and the plan never
places them. It is rare: 4 steps on 3 of 40 generated boards, at 9x9, 13x13
symmetric and 15x15 symmetric.

## What changes

- Before a deep firing, place the notes it rests on as steps: in each square a
  crossing run constrains, the digits that run leaves. The firing then cites notes
  on the board, and its sentence becomes the shallow one read against them.
- The `deep` flag and its two sentence arms then have no remaining reader; delete
  them if so.

## What this does not do

No new notation: the notes exist.

## Acceptance

A hint's steps change, so the owner sees it. It is rarer than expected but not
small where it happens: on the largest symmetric presets a placement can need up
to ten note steps, some of six to eight digits (`tasks.md` § "Measured cost").
