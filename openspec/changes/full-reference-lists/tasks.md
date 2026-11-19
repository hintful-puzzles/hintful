# Tasks

## 0. Before any design

- [x] 0.1 Read the owner's request in `proposal.md`, then Crossing's number list as it stands (`crossing/render.ts`, `layoutNumbers`, `runForNumber`; its spec and help page) and Wordtrail's dictionary (`wordtrail/dictionary.ts`). Record in `design.md` what Crossing's list marks automatically today, run in the app.
- [x] 0.2 Consult a ludologist before implementation, at the owner's request. No agent of that type is defined, so spawn a general-purpose agent briefed as a game designer and ludologist. Give it the proposal's open questions, the two games' rules and what each list shows now (screenshots in the scratchpad), and the project's doctrine on aids and help (`docs/doctrine.md`). Do not give it a preferred answer. Record its advice and what you take from it in `design.md`.
- [x] 0.3 Write the design and the spec deltas from 0.1–0.2. Where Crossing's change moves an aid every player sees today, or makes it count as help, take it to the owner with its cost before implementing (CLAUDE.md: "Ask before changing what a player … can see"). Asked: `proposal.md` § "Questions for the owner".

## 1. Groups in the reference panel

- [x] 1.1 `ReferenceSection.group: string | null`; Dominosa and Wordguess write `null`.
- [x] 1.2 `narrowReference` takes the pressed group, returns the group buttons, and counts each row under the other's choice; tests in `reference-filter.test.ts`. Each button says whether it is pressed, so a kept group index a new board lacks falls back to the first group with its button pressed.
- [x] 1.3 The panel draws the group row above the filters, keeps the pressed group while open, and resets it for another game.

## 2. Wordtrail's full dictionary

- [x] 2.1 `dictionary.ts` lists every common word of each asked length, under letter headings, a group a length; the dictionary tests cover a word no trail spells.
- [x] 2.2 Help page and `docs/mechanics.md` § "The reference aid" say what the list holds and how the rows compose.
- [x] 2.3 Run the app: both rows, the counts, a search across groups, a spotlight, an eight-letter group's render time, and a phone-sized window. Measured 2026-11-19 on the dev server, under load: 3,647 five-letter chips render in about 0.3 s and 7,281 eight-letter ones in about 0.5 s after the group press; a move with either showing raised no long task.

## 3. Crossing (waits on the owner's answer to `proposal.md` § "Questions for the owner")

- [ ] 3.1 Filled in from the owner's answer.
