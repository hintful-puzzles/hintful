## Next

3.2: the hint sweeps, and the app on three born games. Open: none. Goes
before
`a-fill-board-of-any-slot` (`describe-the-whole-catalog` § "0. The
refactor first").

## 1. Design

- [x] 1.1 The concepts of the four files, and the registry each becomes,
      with what its runner keeps: design.md.

## 2. Move, a registry a commit

Each commit moves code without changing it where it can, and every born
game's cases, render snapshots, ID cases and fingerprints pass unchanged.

- [x] 2.1 ID segment kinds (`game-id.ts`): `segments/` and `desc.ts`, and
      the params' settings, `params/`. game-id.ts 2,231 → 429 lines.
- [x] 2.2 Painter layers (`render.ts`); `fillRender` a loop over them.
      render.ts 2,368 → 243 lines, with `render/`'s modules each under
      230.
- [x] 2.3 Deal steps (`deal.ts`). deal.ts 1,135 → 110 lines, with
      `deal/`'s modules each under 250.
- [x] 2.4 The compiler's per-concept parts (`compile-fill.ts`): 2,845 →
      under 320 lines, `fill/`'s modules each under 460; the letters'
      registry, and the segment kinds read by key.
- [x] 2.5 Clue locations: each one module across all four, if task 1.1
      finds that is the cleaner cut than per-registry. Per registry:
      `slots.ts`, `corners.ts` and `gaps.ts` name their site and the
      compiler's `fill/locations.ts`; a location has no segment of its own.

## 3. Close

- [x] 3.1 The guides point at the registries; no file of the fill engine is
      over the size task 1.1 sets as its bound, and a check holds it
      (`scripts/checks/fill-lines.mjs`, seen failing at a bound of 600).
- [x] 3.2 `npm run test:hint-sweeps`, the app run on three born games
      (665 passed; Mathrax, Solo and Adjacent play to solved in Chrome).
- [x] 3.3 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
