# Cuts: pegs

Requirements: 14 before, 13 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Pegs game implements the Game interface": that the engine provides a registered `pegs` game implementing `Game<PegsParams, PegsState, PegsMove, PegsUi, PegsDrawState>`. Its four scenarios stay, under two requirements that state their rules: "Pegs is won when one peg remains" (the jump, the win, the three board types, what a Random board promises) and "A peg jumps by a drag, or from the keyboard". | type | The compiler and `registerGame` say it of every game. |
| "Pegs game implements the Game interface": "per-tile render cache, blitter-based drag sprite". | how | How the frame is built; that the dragged peg follows the pointer stays in the drag scenario. |
| "Pegs game implements the Game interface": "and win flash". | duplicate | "The completion flash lifts every cell". |
| "An empty hole is a ring, never a fill", as a requirement of its own, with its scenario "A hole beside a peg". Its rule is now the last sentence of "Pegs draws its pegs as pieces on a quiet board". | duplicate | The scenario "A peg and a hole on one surface" of "Pegs draws its pegs as pieces on a quiet board" already drew the hole as an unfilled ring on the same surface. |
| "Pegs draws its pegs as pieces on a quiet board": "`redraw` SHALL draw the board", now "The board SHALL be drawn". | how | Which hook paints the frame; what is drawn is unchanged. |
| "Pegs names no hue and swaps no palette": "its hint sentences and help page SHALL name no hue", with the scenario "A hint sentence names no hue". | collection | `engine-colors` "A game that uses the pair names no hue or shape of its own" (a peg is the pair's disc), and `engine-hints` "A narration never identifies an element by its color". |
| "Pegs names no hue and swaps no palette": "The game SHALL declare no palette swap for the dark scheme". | declared | `colors()` in `src/games/pegs/render.ts` declares no `darkSwaps`; the rule behind it, that the board has no bevel, stays in "Pegs draws its pegs as pieces on a quiet board", and `engine-colors` "A bevel a game draws is lit from one side in both schemes" says a swap is owed only by a bevel. |
