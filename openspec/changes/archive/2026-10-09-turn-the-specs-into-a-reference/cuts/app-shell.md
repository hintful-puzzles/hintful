# Cuts: app-shell

Requirements: 81 before, 70 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| A cancel arm that tests 8 also tests 127 | process | `docs/games/input.md` § "The numeric keypad never arrives": a game tests `isEraseKey` / `isCancelKey` and never writes the codes. The rule is about a game's arm, not the shell |
| A summary check asserts the rendered word, not merely that a token was replaced | process | `docs/method.md` § "A guard measures the thing it claims to guard". The rule itself is `engine-params` "One describer labels every params set", scenario "A tier renders as its declared name" |
| The chrome does not overflow at a phone width | duplicate | "The readouts are one row, and the chips give way first" (no overflow at 320) and "Only the Menu scrolls" (the Bar at 360, no caption over a neighbor) |
| The key panel suppresses focus on the press, not the pointer event | how | Which DOM event carries the suppression; `keepFocusOnTheBoard` in `src/puzzle/components/keys.ts` says why. Its scenario is kept under "The on-screen key panel never takes keyboard focus" |
| The key panel's guard says that it is a proxy | particular | Only its own test consults it; the test's comment in `src/puzzle/components/keys.test.ts` says it is a proxy and where the consequence was seen |
| The game-ID notification carries no seed | type | `NotifyGameIdChange` in `src/engine/types.ts` has one field, `currentGameId`. "The app hands out boards, never seeds" keeps the rule |
| The engine's board methods are reached only through the wait | type | `BoardSurface` in `src/puzzle/engine-surface.ts`, held apart in `Puzzle` so the compiler refuses a call around the wait. "A command that acts on the board waits for the first board" keeps the rule |
| "Focus SHALL be handed over asynchronously, because the dropdown and the button each focus themselves synchronously first" (Pressing a control gives the keyboard back to the board) | how | `focusBoard` in `src/screens/puzzle-screen.ts` and its comment |
| "The Undo and Redo controls, their shortcuts and the timeline SHALL need nothing of their own for it: the engine's `canUndo` and `canRedo` count a restart and a kept board" (Undo reaches back across a Restart and a replaced board) | how | Which side does the counting; the behavior is the sentence kept |
| "as Tents binds `n` to "not a tent" whenever its cursor is visible…" (A ledger entry records a collision, not a defect) | declared | The ledger `BINDS_A_SHORTCUT_LETTER` in `src/puzzle/shortcuts.test.ts` carries the entry and its reason |
| "because several games accept letters only once the cursor is visible, and asking in one state alone misses them" (The sweep asks on a fresh board and with the cursor revealed) | how | The reason for the two states; the rule to ask in both is kept, and the sweep's comment in `src/puzzle/shortcuts.test.ts` gives the reason |
| "An entry on the sweep's ledger SHALL record a collision and not a defect: a game keeping its own meaning for a letter is the derivation working" (A ledger entry records a collision, not a defect) | declared | The comment on `BINDS_A_SHORTCUT_LETTER` in `src/puzzle/shortcuts.test.ts` says so; the merged requirement keeps "a game that keeps its own meaning for a letter SHALL be on a ledger" |
| "Offering the key to the game first needs no declaration, and it does not notice" and "the matchers and the labels" (Every bare shortcut letter is swept against every game) | duplicate | "A bare letter is an app command only when the game declines it" states the derivation and that no game declares anything |
| Scenarios "A recorded collision keeps the game's meaning" and "A panel is drawn in two window shapes" | duplicate | Each restates its rule, which the requirement it merged into keeps with a scenario of its own |
| "(`virtual:draft-puzzles`)" and "The home screen never loads game code" (The drafts are computed at build time, not kept in the catalog) | how | The module's name; the rule is kept |

Merged, with the rule kept:

- "The sweep asks on a fresh board and with the cursor revealed" and "A ledger
  entry records a collision, not a defect" into "Every bare shortcut letter is
  swept against every game".
- "The drafts are computed at build time, not kept in the catalog" into "The
  catalog labels a draft, and the help gives a section's reason".
- "Where a panel docks is decided in one place" into "The window's shape
  chooses the layout".
