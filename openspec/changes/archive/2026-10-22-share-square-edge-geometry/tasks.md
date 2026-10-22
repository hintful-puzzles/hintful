# Tasks — share-square-edge-geometry

## 1. The module

- [x] 1.1 `src/engine/square-edges.ts` from Path's `Geometry` (design D1, D3),
      with its tests and an `engine-catalog.md` entry.
- [x] 1.2 Path onto it whole; its own `Geometry`, `across`, `edgeBetween`,
      `edgeAt`, `pointAtEdge` and `SIDES` deleted.

## 2. The games already on square edges

- [x] 2.1 Pearl: traversal, `sideAt` and the hint's direction helpers onto the
      module; its move ops and saves unchanged (design D2).
- [x] 2.2 Tracks: the direction algebra; `spotAt` and the `sE*` helpers kept,
      with the reason in design D2.
- [x] 2.3 The border grid (`border-grid*.ts`), and through it Palisade and
      Separate: the pointer; its own index kept (design D1).
- [x] 2.4 Dominosa, Rect, Galaxies, Net, Slant: measured, each taken on or
      declined with its reason in `design.md` (D4).

## 3. Close-out

- [x] 3.1 Every touched game's frozen differentials, narration and render
      snapshots unmoved; a save from before loads after.
- [x] 3.2 `docs/new-game.md` § "The route by kind of game" (Edges and loops)
      and `engine-catalog.md` point at the module.
- [x] 3.3 `npm run game -- <id>` green for every touched game; commit, push,
      archive.
