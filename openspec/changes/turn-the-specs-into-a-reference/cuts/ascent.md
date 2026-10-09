# Cuts: ascent

Requirements: 42 before, 41 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Ascent is solved by one path through every number": "`src/games/ascent/` SHALL implement `Game` for it and be registered." | type | The compiler and the registry say it of every game. |
| Same requirement: "Because a board has one solution, the game SHALL implement `findMistakes` and an explained hint." | duplicate | "findMistakes compares the board with its one solution" and "Ascent explains the next number". |
| "Ascent's square grids turn and its hexagonal grids do not": "Ascent's Orthogonal and Classic presets SHALL draw taller than wide (6×7), and its Honeycomb preset SHALL be 6×8." | collection | `engine-params`, "Every default and preset draws no wider than tall"; the sizes are the preset table in `src/games/ascent/index.ts`. The Hexagon ledger entry, Ascent's departure, stays. |
| "Ascent's moves are a union, and entry state is the UI's": "A move SHALL be a discriminated union of place, places (a hint's whole run, which no gesture makes), line, clear and solve" | type | `AscentMove` in `src/games/ascent/state.ts`. The requirement stays as "A number cannot be placed on a given". |
| Same requirement: "and not an upstream move string" | port | The port is finished; the union is the only move there is. |
| Same requirement: "Entry state that is not yet a move SHALL live on the UI and never on the game state" | how | Where a half-typed number is held; what typing does is in "Ascent places a number three ways" and "Ascent offers a number keypad". |
| Same requirement: "an input that changes nothing SHALL add no history entry" | collection | `ts-engine`, "A UI-only input redraws without a history entry". |
| "Ascent acts on a pointer button, not on a pointer coordinate" | collection | `engine-input`, "A game declines a button it did not act on", whose guard sends every game codes that mean nothing; the coordinate trap is `docs/games/input.md`, "The trap, concretely". "The UI_UPDATE tail of interpretMove is kept" stays. |
| "Ascent's generator keeps every board soluble at its tier": "SHALL build a Hamiltonian path by the backbite algorithm" | how | Which algorithm lays the path; the promise of the board stays. |
| Same requirement: "by a maximal bipartite matching" | how | Which algorithm assigns numbers to arrows; that Edges moves numbers out to arrows and retries stays. |
| "What Ascent draws": "Rendering SHALL draw numbers, walls, drawn path segments and, in Edges mode, border arrows" | duplicate | "Ascent draws its cells on a quiet surface and lifts a given" (numbers, walls, the arrow's margin) and "The board's own path stands off both surfaces" (path segments). |
| Same requirement: "and SHALL flash on completion" | collection | `ts-engine`, "The win flash plays on a forward move that solves the board"; the scenario of "Ascent is solved by one path through every number" also says it. |
