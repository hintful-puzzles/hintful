# Tasks

## 1. The engine

- [ ] 1.1 Read `engine/line-drawing.ts` and its users (Path, Pearl, the edges skeleton); settle in `design.md` how a directed line is held (a `from` beside the mark, or two line values)
- [ ] 1.2 `LineRules.directed`: a release lays its lines in stroke order; one line in and one out a square; a drag ending on a word's first square joins its front; a drag from a first square outward stops; tests for each, seen failing; Path and Pearl unchanged (their tests and saves)
- [ ] 1.3 The keyboard path and Ctrl+arrow lay direction; the click near an edge as `design.md` recommends
- [ ] 1.4 Survey every game that draws a direction along a path or link (screenshots in the app); record in `design.md` which share one shape
- [ ] 1.5 The engine's arrow for a directed line, and a path's start mark, in a module of its own; a render-scenario test; legible at a phone's tile size, light and dark
- [ ] 1.6 Ascent onto the engine's arrow, compared side by side with today's in the app (the owner found it unclear); the other games the survey names, or a recorded reason each keeps its own

## 2. Wordtrail

- [ ] 2.1 State, moves, desc and save format with directions; the old format refused cleanly
- [ ] 2.2 Directed trails (a word both ways is two), and drop the interim common-word preference in `trails.ts`
- [ ] 2.3 The description's answer and techniques directed; soundness checked; `npm run hint-scan` re-pins; hint words read as drawn
- [ ] 2.4 The generator refuses an answer word whose reverse is a guess; the deal walk's census against today's
- [ ] 2.5 Rendering with the engine's arrows and start mark; the drag preview shows the direction; the list writes words as read
- [ ] 2.6 The help page's rules and controls; `add-wordtrail`'s spec delta (rules, controls, look, hint scenarios)

## 3. Close

- [ ] 3.1 Play it in the app: draw IGN from the I, then A-L-I onto it, and see ALIGN; mouse, touch, keyboard; light and dark; a phone
- [ ] 3.2 `npm run test:hint-sweeps`; commit, push; archive after `add-wordtrail` is archived (this change's Wordtrail requirements are edited in that change's delta)

## Open with the owner

- The click near an edge (`design.md` § "The drag").
- From the session that filed this: hints can now name rare and rude words of the full guess list (BITCHY came up); should such words be left unnamed?
