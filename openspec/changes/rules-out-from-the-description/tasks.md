# Tasks

## 1. The engine

- [x] 1.1 Design: a description's `rulesOut: { name, placing, techniques }` names what a placement brings; a firing is a move's when its premise (`premiseOf`) holds a square the move set to `placing`, and the move's own squares are never brought. A technique that finds the marks inconsistent brings nothing (Star Battle no longer crosses round a star placed beside another).
- [x] 1.2 The describe compiler emits `RULES_OUT`; `describedFiringHint` builds `Game.rulesOut` from it (`engine/described-rules-out.ts`)
- [x] 1.3 The descriptions guide's section, and `docs/mechanics.md` § "Preferences"

## 2. The games

- [x] 2.1 Norinori and Star Battle move over; their `bring` and helpers go. Tents and Light Up keep theirs, each with the reason in its comment: their rule is inside a technique that also places (`lineCount`, `square`).
- [x] 2.2 `rules-out.test.ts` green, with a planted difference seen failing; the new bring matched the old on 749 consistent partial boards of the two games before the old went
- [ ] 2.3 Each moved game checked in the browser
