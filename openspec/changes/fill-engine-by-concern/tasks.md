## Next

2.2, the renderer, by design.md § 4. Open: none. Goes before
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
- [ ] 2.2 Painter layers (`render.ts`); `fillRender` a loop over them.
- [ ] 2.3 Deal steps (`deal.ts`).
- [ ] 2.4 The compiler's per-concept parts (`compile-fill.ts`).
- [ ] 2.5 Clue locations: each one module across all four, if task 1.1
      finds that is the cleaner cut than per-registry.

## 3. Close

- [ ] 3.1 The guides point at the registries; no file of the fill engine is
      over the size task 1.1 sets as its bound, and a check holds it.
- [ ] 3.2 `npm run test:hint-sweeps`, the app run on three born games.
- [ ] 3.3 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
