# Ledger: net

Base: bb004490

Where every rule of Net's spec went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Net game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `net` game implements `Game`, a grid of 4-bit wire tiles solved as a spanning tree from a source, turned until every tile is powered | spec: Net game implements the Game interface |
| The type parameters of the `Game` it implements | held: src/games/net/index.ts "export const netGame: Game<" |
| Params are `w`, `h`, `wrapping` and `barrierProbability`, encoded `{w}x{h}[w][b{prob}]` with `b` only in full | spec: Net's params and their encoding |
| Decoding skips the letter `a` and encoding never writes it | spec: Net's params and their encoding |
| The `a` is upstream's | history |
| The five bounded sizes and one wrapping board are offered, none wider than tall | spec: No Net preset draws wider than tall |
| The sizes are upstream's, its 13×11 turned to 11×13 | history |
| `validateParams` rejects a wrapping board with a side of length 2 | spec: Net's params and their encoding |
| The game provides `solve` and `statusbarText` and no `textFormat` | spec: Net loads only a board its hint finishes |
| `finishesByDeduction` is the solver settling every tile and the hint's engine finishing the board | spec: Net loads only a board its hint finishes |
| Scenario: params round-trip | spec: Net's params and their encoding |
| Scenario: upstream's unchecked-board letter | spec: Net's params and their encoding |

## Generated boards are uniquely solvable without guessing

| Rule | Where it went |
| --- | --- |
| The generator gates every board through its solver and then through the hint's engine, dealing another otherwise, at every parameter | spec: Generated boards are uniquely solvable without guessing |
| Scenario: a generated board has one deducible solution | spec: Generated boards are uniquely solvable without guessing |
| Scenario: a generated board is hinted to the end | spec: Generated boards are uniquely solvable without guessing |

## Tiles rotate and lock; no-op inputs are suppressed locally

| Rule | Where it went |
| --- | --- |
| Left-click turns anticlockwise, right-click clockwise, `f` by a half turn | spec: Tiles rotate and lock |
| `s` toggles the lock, and so does a tap in the middle third of a tile in notes mode, where the pointer reaches the lock | spec: Tiles rotate and lock |
| A locked tile does not rotate | spec: Tiles rotate and lock |
| A click outside the grid and a rotate on a locked tile return no move, with no comparison of serialized states | spec: No-op inputs are suppressed locally |
| A click in the gutter between tiles returns no move | untrue: in notes mode a press on the gutter notes the nearest side (`noteSpotAt` in `src/games/net/index.ts`), so the rule is stated of a rotating click, which `geometry.pointerTarget` does drop |
| Scenario: rotating a locked tile does nothing | spec: No-op inputs are suppressed locally |
| Scenario: a tile rotated full circle leaves ordinary undo history | spec: No-op inputs are suppressed locally |
| Scenario: a tap in the middle of a tile in notes mode locks it | spec: Tiles rotate and lock |

## Jumble is deterministic on replay

| Rule | Where it went |
| --- | --- |
| `j` turns every unlocked tile a random amount and records an explicit per-tile list, and the RNG is not part of the Ui | spec: Jumble is deterministic on replay |
| Scenario: a jumbled board restores exactly on load | spec: Jumble is deterministic on replay |

## The source and origin are movable Ui state

| Rule | Where it went |
| --- | --- |
| Ctrl+arrow moves the source, and Shift+arrow shifts the origin of a wrapping grid | spec: The source and origin are movable Ui state |
| Both are Ui state and survive a save | spec: The source and origin are movable Ui state |
| The origin shift is not offered on a grid whose every border edge is walled, which is treated as non-wrapping | spec: The source and origin are movable Ui state |
| Moving the source is not offered on such a grid either | untrue: `interpretMove` in `src/games/net/index.ts` moves the source on Ctrl+arrow whatever `s.wrapping` is, and only the Shift branch returns early on a bounded grid |
| Scenario: the source moves and re-powers the board | spec: The source and origin are movable Ui state |

## Net takes side notes

| Rule | Where it went |
| --- | --- |
| The player notes a wire or none on the side two tiles share, as a move that is an absolute set named from the tile left of the side or above it | spec: Net takes side notes |
| A save with no notes loads unchanged, and a walled side takes no note | spec: Net takes side notes |
| That save is one "written before notes existed" | history |
| Notes are taken in notes mode, toggled by the Marks key and `P` and shown by the pencil at the top-right | spec: The pointer notes the side a tap lands nearest |
| A left-click notes a wire across the nearest side and a right-click or held finger none, each toggling off a note it would repeat | spec: The pointer notes the side a tap lands nearest |
| A select picks a tile, a select on a neighbor notes the side between them, Enter a wire and Space none, and Escape lets go | spec: The keyboard notes the side between two tiles |
| Across a wrapping edge the tiles are neighbors | spec: The keyboard notes the side between two tiles |
| Scenario: a tap notes the nearest side | spec: The pointer notes the side a tap lands nearest |
| Scenario: a note from the keyboard | spec: The keyboard notes the side between two tiles |
| Scenario: a wall takes no note | spec: Net takes side notes |

## Net flags wrong locks and notes

| Rule | Where it went |
| --- | --- |
| `findMistakes` flags a wrong lock and a contradicted note, not an unlocked tile or a note on an unsettled side, and draws each in the error color | spec: Net flags wrong locks and notes |
| Scenario: a wrong note is flagged | spec: Net flags wrong locks and notes |

## Net's hint reasons from notes, locks and walls

| Rule | Where it went |
| --- | --- |
| The hint reasons only from notes, locks and walls, an unlocked tile unknown, and each step adds one fact | spec: Net's hint reasons from notes, locks and walls |
| A turning is ruled out only by a known side, a loop through known wires or a sealed group, and the words name each reason | spec: A way of turning is ruled out for three reasons only |
| A lock whose tile must turn is one journey, and every move is one the declared verbs make | spec: A hint's lock is one journey of the turn and the lock |
| No hint while `findMistakes` reports a wrong lock or note | spec: Net gives no hint while a lock or note is wrong |
| It is the hint that refuses | untrue: the midend refuses before asking the game (`FIX_MISTAKES_FIRST` in `src/engine/midend.ts`), and `netHint` in `src/games/net/hint.ts` never reads `findMistakes`, so the rule is stated of the hint the player gets |
| Scenario: a tile against the wall | spec: A way of turning is ruled out for three reasons only |
| Scenario: a wrong note stops the hint | spec: Net gives no hint while a lock or note is wrong |

## Net's view controls and jumble have pointer routes

| Rule | Where it went |
| --- | --- |
| Every keyboard action outside the verbs is reachable by a pointer alone | spec: Net's view controls and jumble have pointer routes |
| The Source key, also `C`, arms Source mode, and Escape, the status line and Ctrl+arrow behave as stated | spec: The Source key arms a tap that moves the source |
| The keypad's Jumble key makes the move `J` makes | spec: The keypad offers a Jumble key |
| A margin drag scrolls a wrapping grid by whole squares, and starts nothing on a grid that does not wrap | spec: A margin drag scrolls a wrapping grid |
| Source mode and a scroll in progress are transient Ui state a save does not carry | spec: Net's view controls and jumble have pointer routes |
| Scenario: the Source key and a tap move the source | spec: The Source key arms a tap that moves the source |
| Scenario: a margin drag scrolls as the keys do | spec: A margin drag scrolls a wrapping grid |

## Net's hint follows a wire through tiles not settled yet

| Rule | Where it went |
| --- | --- |
| A turning seals a group when each wire stops within a bounded run and together they reach fewer tiles than the grid holds | spec: Net's hint follows a wire through tiles not settled yet |
| The run is bounded over every way the entered tiles can turn that contradicts no known side and closes no known loop, and a wire that could lead on or come back bounds nothing | spec: Net's hint follows a wire through tiles not settled yet |
| The words say the turning leads only into the striped squares where its wire must stop, adding "without closing a loop" when a loop keeps a tile from leading on | spec: A hint says when a wire only leads into open tiles |
| Those words are said wherever the group is reached across a side not yet known to be wired | untrue: `trapped` in `src/games/net/hint-text.ts` says them only for a single sealing turning with no loop cited, and names several turnings in other words, so the rule carries those two conditions |
| The words name "the striped tiles" | untrue: `trapped` in `src/games/net/hint-text.ts` writes "the striped squares", so the rule says squares |
| A step whose group is reached across such a side ranks harder than one whose group the known wires join, whatever its words (`difficulty` in `src/games/net/deduce.ts`) | spec: A hint says when a wire only leads into open tiles |
| Scenario: two dead ends and two straights in one column | spec: Net's hint follows a wire through tiles not settled yet |
| Scenario: a tile on the way could lead on only round a loop | spec: A hint says when a wire only leads into open tiles |
| Scenario: upstream's boards are hinted to the end | spec: Net's hint follows a wire through tiles not settled yet |

## Net draws its tiles on a quiet surface and lifts a locked one

| Rule | Where it went |
| --- | --- |
| A tile still to turn is drawn on the cell surface with the surface's grid line and no heavier frame, a wall keeps its color and weight, and the strip outside the grid stays the board | spec: Net draws its tiles on a quiet surface and lifts a locked one |
| A locked tile sits on the lifted surface, told by a surface the collection names and never by a gray of the game's own | spec: A locked tile sits on the lifted surface |
| The cursor, the note pin and a hint's ring stay rings inside the tile's edge over either surface | spec: The completion flash ripples through the lifted surface |
| The flash lifts each tile in turn as its ripple passes | untrue: `redraw` in `src/games/net/render.ts` toggles the locked bit of the tile under the ripple, so a locked tile drops to the cell surface while an unlocked one lifts, and the rule now says the two surfaces swap |
| Scenario: a locked tile is the lifted one | spec: A locked tile sits on the lifted surface |
| Scenario: an untouched board has no lifted tile | spec: Net draws its tiles on a quiet surface and lifts a locked one |
