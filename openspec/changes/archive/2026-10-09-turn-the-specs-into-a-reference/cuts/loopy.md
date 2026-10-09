# Cuts: loopy

Requirements: 52 before, 51 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Loopy game implements the Game interface": the sentence that `src/games/loopy/` implements `Game` and is registered. The rest stays, retitled "Loopy offers every tiling the geometry module provides". | type | The compiler and the registry say it of every game. |
| "Notes mode is the collection's pencil mode" (whole requirement and its scenario) | collection | `engine-notes` "One way into note-taking across the collection" (the shared toggle, no toggle of a game's own) and "The engine owns the pencil-mode indicator, not only its glyph". That input is unchanged with the mode off is what the "Outside notes mode" requirements say. That notes mode is `ui.pencilMode`, off on a new game, is kept as a sentence of "Loopy notes corners and pairs". |
| "Loopy pointer and keyboard input, and rendering": "Loopy SHALL be played with mouse, touch or keyboard", and that the keyboard reaches an edge through the cursor and both set it through the same code. The rest stays, retitled "A click sets the nearest edge to an absolute state". | duplicate | "Loopy is playable from the keyboard alone", "A plain arrow walks Loopy's cursor along an edge" and "The keyboard sets an edge through the code a click uses". |
| "Loopy pointer and keyboard input, and rendering": scenario "A keyboard select sets the chosen edge" | duplicate | "Enter, Space and the erase key act on Loopy's chosen edge" and the scenario of "The keyboard sets an edge through the code a click uses". |
| "Loopy's presets draw tall, read width first, and turn where the tiling allows": "Every Loopy preset SHALL draw no wider than tall." | collection | `engine-params` "Every default and preset draws no wider than tall". The title is unchanged. |
| "A tiling that cannot turn takes a preset size of its own": the list "Triangular 9×14, Kites 4×6, Dodecagonal 3×6 and Hats 9×11" | declared | The preset table in `src/games/loopy/params.ts`; the rule for choosing the sizes and the Triangular scenario stay. |
