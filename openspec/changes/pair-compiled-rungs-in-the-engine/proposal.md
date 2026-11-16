# pair-compiled-rungs-in-the-engine

Filed 2026-11-16 from `add-norinori` (design.md § "Where the engine made the
game say something not about Norinori"), as the engine's finding.

## What the work found

A described game's `solver.ts` builds its ladder with `describedLadder`,
naming every technique of its compiled module once more and pairing it by
hand with the clues it reads:

```ts
domino: uncluedRung(norinori.domino),
claimed: compiledRung(norinori.claimed, dealt),
```

Norinori writes eleven such lines, and they say only which techniques read
the dealt clues, which the compiled module already knows (a technique that
reads no `Dealt` compiles to a function without the parameter, and that is
why `compiledRung` with one argument does not type-check). Every described
game writes the same: `compiledRung` appears in 45 games' sources and
`uncluedRung` in 23 (`grep -rl` over `src/games`, 2026-11-16).

## What this change does

`describedLadder` pairs every technique of the module with the dealt clues
itself, from a declaration the compiler writes (which techniques read
`Dealt`), and a game names only a rung it supplies something for: a
`reason`, a `keptRung`, a variation. The pairing a game writes today becomes
the exception, and a new game writes none.

## Before it starts

- Count the games whose map holds only plain pairings, against those with a
  `reason` or another rung shape, from the tree: the change is worth it if
  most are plain.
- The ladder's order and firings must not move: run `npm run
  test:hint-sweeps` and the hint pins of every game it touches.
