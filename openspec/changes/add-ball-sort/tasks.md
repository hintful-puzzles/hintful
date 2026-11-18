# Tasks

Kind: **moves and search** (`docs/new-game.md` § "The route by kind of
game"), exemplar Pegs. Read the sections that row names before each concern.

## 1. Decisions

- [x] 1.1 Measure what a dealt board's dead ends look like, and what an added tube and undo each do for them; bring the owner the two questions in `proposal.md` with that
- [x] 1.2 The owner's answers recorded, and the rest of this list written from `docs/new-game.md` § "The route by kind of game"
- [ ] 1.3 `design.md`: settle `docs/new-game.md` § "Before you start"; the game id (`ballsort`?), its desc and save format; params (colors, capacity, empty tubes) and the preset grid; the tier measure (empty tubes, and a measure from the search: solution length, or traps on the shortest line)

## 2. The game

- [ ] 2.1 Scaffold with `scripts/new-game.sh <id> moves`, and run `npm run game -- <id>` at once
- [ ] 2.2 The board, params codec and validation, and the pour move: legal only onto an empty tube or a matching top with room; `interpretMove` refuses anything else
- [ ] 2.3 The description: its moves, its finish (every tube empty or full of one color) and its dead ends, on the position runtime (`describe-guarded-moves`)
- [ ] 2.4 Input: tap a tube, then a tube (a tap on the same tube cancels); drag a tube's top run onto another; keyboard cursor over tubes with select and drop
- [ ] 2.5 Rendering: tubes and balls on a quiet surface, colors from the palette and told apart by more than hue (a shape or symbol per color), the lifted run shown, pour animation, win flash, sizing from phone to desktop
- [ ] 2.6 The search in `solver.ts`, budgeted in positions, returning a `SearchOutcome`; Solve through `solveBySearch`, from the player's position and else the deal
- [ ] 2.7 The generator: deals the search finishes from the opening, at tiers on the measure 1.3 chose; bounded retries
- [ ] 2.8 The hint: a stable subgoal (the color a run of pours gathers) and the next pour serving it; rivals judged; a dead end refused through the engine with the rewind; `hint-resume.test.ts` on the game
- [ ] 2.9 Check & save names a dead end the same way
- [ ] 2.10 Help page and the game's spec; the catalog entry's words
- [ ] 2.11 Icons from `?screenshot`

## 3. Done

- [ ] 3.1 `npm run game -- <id>` clean; the game's tests and the hint sweeps
- [ ] 3.2 Run the app in Chrome: play a board with pointer, keyboard and touch at desktop and phone width; ask for a hint at every stage, into and out of a dead end; a subagent that did not write the game reads the hint's words against the board
- [ ] 3.3 `docs/new-game.md` § "Definition of done"; commit, push, and bring the game to the owner for acceptance
