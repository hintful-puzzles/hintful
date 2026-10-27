# Tasks

## 1. The shape

- [x] 1.1 Read every hand-built menu (the query is in the proposal) and sort them: a plain grid, a grid with tiers cut (`opts.tiers`), a grid with variants, and anything else. For anything else, say whether the builder needs an option or the game needs a reason
- [x] 1.2 Decide between a `Game` declaration the midend builds from and every game calling `presetGrid`; record the reason in `design.md`

## 2. The migration

- [x] 2.1 Move the engine and the skeleton to the chosen shape
- [x] 2.2 Move each game; the `params-stability` snapshot's menu lines stay exactly where they were
- [x] 2.3 See the guard bite: plant one game's menu out of order and watch the snapshot fail

## 3. Docs

- [x] 3.1 `docs/mechanics.md` § "The preset menu is a grid" and the `engine-params` spec delta

## 4. Verification

- [x] 4.1 Open three migrated games' menus in the app, one of them with rulesets
- [x] 4.2 The gate, green
