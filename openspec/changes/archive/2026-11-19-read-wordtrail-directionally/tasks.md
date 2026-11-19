# Tasks

## 1. The engine

- [x] 1.1 Read `engine/line-drawing.ts` and its users (Path, Pearl, the edges skeleton); settle in `design.md` how a directed line is held (a `from` beside the mark, or two line values)
- [x] 1.2 `LineRules.directed`: a release lays its lines in stroke order; one line in and one out a square; a drag ending on a word's first square joins its front; a drag from a first square outward stops; tests for each, seen failing; Path and Pearl unchanged (their tests and saves)
- [x] 1.3 The keyboard path and Ctrl+arrow lay direction; the click near an edge as `design.md` recommends
- [x] 1.4 Survey every game that draws a direction along a path or link (screenshots in the app); record in `design.md` which share one shape
- [x] 1.5 The engine's arrow for a directed line, and a path's start mark, in a module of its own (`engine/path-arrow.ts`, its test); legible at a phone's tile size, light and dark (seen in Wordtrail at 390 px wide, dark)
- [x] 1.6 Ascent onto the engine's arrow, compared side by side with today's in the app (the owner found it unclear): its path today is undirected bars, its direction only in the numbers (`design.md` § "The survey"), so this is adding an arrow on each link of its path from the lower number to the higher, and a start mark on 1 in place of the ring 1 and the last share. Pegs' and Sokoban's hint arrows already wear the engine's head; Galaxies is recorded as a later candidate. As built: the whole arrow filling the gap between the numbers' discs, drawn over the grid line, after the owner found heads alone odd on hex (`design.md` § "Ascent on the engine's arrow"); the help says so, and the `ascent` spec delta

## 2. Wordtrail

- [x] 2.1 State, moves, desc and save format with directions; the old format refused cleanly (a line change with no `from` throws; the solve move is now `answer`)
- [x] 2.2 Directed trails (a word both ways is two), and drop the interim common-word preference in `trails.ts`
- [x] 2.3 The description's answer and techniques directed; soundness checked; `npm run hint-scan` re-pins; hint words read as drawn (`oneWay` removed: `design.md` § "As built")
- [x] 2.4 The generator refuses an answer word whose reverse is a guess; the deal walk's census against today's (`design.md` § "As built")
- [x] 2.5 Rendering with the engine's arrows and start mark; the drag preview shows the direction; the list writes words as read
- [x] 2.6 The help page's rules and controls; `add-wordtrail`'s spec delta (rules, controls, look, hint scenarios)

## 3. Close

- [x] 3.1 Play it in the app: draw IGN from the I, then A-L-I onto it, and see ALIGN; mouse, touch, keyboard; light and dark; a phone. Played on `4x3n2de:45,namedlgo3p`: by mouse A-N-D, then G-L-A onto it, read GLAND (the preview shows the arrows mid-drag; a hint's asked lines carry theirs); by touch P-O-E-M; by keyboard a run whose arrows follow the cursor; a click's three states (right, turned, lifted); the board at phone width in dark. Ascent is checked again with 1.6
- [x] 3.2 `npm run test:hint-sweeps` (628 passed with the engine and Wordtrail parts); commit, push; archive after `add-wordtrail` is archived (this change's Wordtrail requirements are edited in that change's delta)

## Open with the owner

- ~~The click near an edge~~: built as recommended, and accepted with the rest of Wordtrail by the owner (2026-11-19).
- ~~Hints naming rare and rude words~~: answered 2026-11-19. Wordtrail judges by the common words, and BITCHY and words like it are excluded (`add-wordtrail` `design.md` § "Decisions made in the build").
