# Tasks

## 1. The rule

- [ ] 1.1 Re-run the census (games with width and height, distinct sizes, rectangles among them, whether `validateParams` takes one or two wider) and compare it with the proposal's; record the date
- [ ] 1.2 Add the requirement's check to `preset-menu-shape.test.ts`, population derived as the design says; see it fail on the census's games, and pass on Path

## 2. The games

- [ ] 2.1 For each game the check refuses, choose upright rectangles in place of some squares, time three deals per tier, and run `difficulty-contract` with the slow tier on; the game's tests pass and its menu reads well in the app
- [ ] 2.2 The skeletons' menus offer rectangles; `skeleton.test.ts` passes
- [ ] 2.3 Read each moved params-stability and capability snapshot: only menu lines move, no params string

## 3. Verification

- [ ] 3.1 The menu-shape check passes for the whole collection
- [ ] 3.2 Open the Type menu of three changed games in the app, on a phone-sized window, and deal a rectangle of each
- [ ] 3.3 The gate, green

## Workflow follow-up

- Commit a few games at a time, push, archive
