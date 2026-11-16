# Tasks

## 1. The pairing

- [x] 1.1 Count the plain pairings against the rest (proposal § "Before it starts").
  2026-11-16, over every `describedLadder`/`latinLadder` map: 50 maps (a
  regex census found 49; Ascent's, called with type arguments, surfaced at
  the typecheck). About 240 entries were plain pairings, counting Pearl's
  and Tracks' local `rung()` helpers, which were plain pairings behind a
  type cast, and about 75 supplied a reason. 30 maps were plain throughout
  and now name nothing.
- [x] 1.2 The compiler declares which techniques read `Dealt` (the module's
  `techniques`); `describedLadder(module, dealt, own?)` pairs every technique
  the game does not name, rungs and those run on placing and striking alike.
  `dealt`'s type comes from the module: `null` where nothing reads it.
- [x] 1.3 Move one game (Norinori, whose map is all plain) and compare its hint pins
- [x] 1.4 Move the rest; `npm run test:hint-sweeps`; the guide's section on
  ladders (`docs/descriptions.md`, step 4 of the route)
