# Ledger: mines

Base: bb004490

Where every rule of Mines' spec went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Mines game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `mines` game implements `Game`, and what the puzzle asks: a grid concealing mines, uncovered, deduced and flagged | spec: Mines game implements the Game interface |
| The five type arguments the game gives `Game` | untrue: `minesGame` in `src/games/mines/index.ts` gives eight, adding the target, the hint's highlights and its rungs, and the requirement now names `Game` alone |
| Params are `w`, `h` and `n`, encoded `{w}x{h}n{n}`, with the Custom `n%` form meaning a percentage of the area | spec: Mines' parameters |
| Decoding skips upstream's `a` and encoding never writes it, and a preliminary description is read whether it says `u` or `a` | spec: Mines never asks for a board that may need a guess |
| The presets, with the expert board taller than wide | spec: Mines' presets |
| The presets are "upstream's", turned, and there are six of them | history; figure |
| `validateParams` requires `n ≤ w·h − 9`, and `w > 2 && h > 2` for a board about to be generated | spec: Mines' parameters leave room for a safe first click |
| `validateParams` requires `n ≥ 1` | untrue: `validateParams` in `src/games/mines/state.ts` has no such test. The minimum is `bounds: { min: 1 }` on the `mines` item of `paramConfig` in `src/games/mines/index.ts`, which `paramsError` in `src/engine/params.ts` checks before it calls the game |
| The game provides `solve`, `textFormat` and `statusbarText` | spec: Mines game implements the Game interface |
| `finishesByDeduction` is the hint's plan played from the first click, and a board not laid out yet passes | spec: Mines finishes by deduction as its hint's plan |
| A description with a layout and no first square reads as a board not laid out yet, its layout the one an older save's replayed first open takes, and a square the player opens lays out afresh | spec: A layout with no first square is a board not laid out yet |
| The layout "moved into the first move" | history |
| Scenario: params round-trip | spec: Mines' parameters |
| Scenario: upstream's may-need-a-guess letter | spec: Mines never asks for a board that may need a guess |
| Scenario: a layout with no first square is typed as a game ID | spec: A layout with no first square is a board not laid out yet |
| Scenario: a save written before the layout moved into the first move | spec: A layout with no first square is a board not laid out yet |

## Generated boards are solvable without guessing

| Rule | Where it went |
| --- | --- |
| The generator perturbs every board until its solver completes it by deduction, and no parameter lays out a board that needs a guess | spec: Generated boards are solvable without guessing |
| Scenario: every preset board is deducible | spec: Generated boards are solvable without guessing |

## Death is recoverable and is not a loss

| Rule | Where it went |
| --- | --- |
| A death exposes only the mine that killed, and blocks moves until an undo, Solve aside, which shows the finished board over the opened mine | spec: Death is recoverable and is not a loss |
| The status reports no loss on death, and only a win taken with Solve reports solved-with-help | spec: Death is recoverable and is not a loss |
| The count of deaths persists in the status bar for the rest of the game and survives a save | spec: The count of deaths persists |
| Scenario: a player dies, undoes, and carries on | spec: Death is recoverable and is not a loss |

## Chording never reveals more than it must

| Rule | Where it went |
| --- | --- |
| A chord on a satisfied number with misplaced flags uncovers only the mined squares among those it would have opened | spec: Chording never reveals more than it must |
| Scenario: a chord on wrongly-flagged squares | spec: Chording never reveals more than it must |

## A plain left-click chords without a false-uncover preview

| Rule | Where it went |
| --- | --- |
| A left-click on a number chords, and there is no separate chord button, for a mouse and a finger alike | spec: A plain left-click chords without a false-uncover preview |
| The 3×3 preview shows exactly where the release will chord: held on a number with all its flags, having been pressed on a number | spec: A plain left-click chords without a false-uncover preview |
| The preview is drawn like opened cells, so it is not shown on a not-yet-satisfied number, nor while a press that opens a covered square is dragged over a number | spec: The pressed preview never shows where the release will not chord |
| A left-press over a covered square keeps its single-cell highlight | spec: The pressed preview never shows where the release will not chord |
| Scenario: clicking a not-yet-satisfied number | spec: The pressed preview never shows where the release will not chord |
| Scenario: pressing a number with all its flags previews the chord | spec: A plain left-click chords without a false-uncover preview |

## The clock reflects the state of play

| Rule | Where it went |
| --- | --- |
| Mines leaves the timer to the engine's rule, stating only that a dead board holds it, so it does not run before the first click, runs during play, stops on death and completion, and runs again after an undo out of either | spec: The clock reflects the state of play |
| Solve completes the board, dead or alive, so the game reports solved-with-help and the timer stops | spec: Solve stops the clock, and elapsed time survives a save |
| Elapsed time survives a save and restore | spec: Solve stops the clock, and elapsed time survives a save |
| Scenario: the clock starts on the first click | spec: The clock reflects the state of play |

## Mines checks flags against its mines

| Rule | Where it went |
| --- | --- |
| `findMistakes` reports every flag with no mine under it, nothing before the first click, and never an opened mine | spec: Mines checks flags against its mines |
| The mistake is a frame in the error color, held in the tile's cache key | spec: Mines checks flags against its mines |
| Scenario: Check & Save on Mines | spec: Mines checks flags against its mines |
| Scenario: a right flag passes | spec: Mines checks flags against its mines |

## Mines ships an explained deductive hint from proved facts

| Rule | Where it went |
| --- | --- |
| The hint reasons only from what the board proves and never from the player's flags, though the midend asks only about a board whose flags all sit on mines | spec: Mines ships an explained deductive hint from proved facts |
| Each step names its number or numbers and why the ringed squares are safe or mines, by one of four kinds of reason | spec: Each Mines hint step names its numbers and its reason |
| Before the first click the hint opens a square and says why it is safe | spec: The Mines hint opens the first square, and refuses a dead or exhausted board |
| The hint refuses a dead board, telling the player to undo, and a board deduction cannot advance, with the collection's words | spec: The Mines hint opens the first square, and refuses a dead or exhausted board |
| Scenario: a satisfied number frees its other squares | spec: Each Mines hint step names its numbers and its reason |
| Scenario: a lucky flag is not a premise | spec: Mines ships an explained deductive hint from proved facts |
| Scenario: a dead board | spec: The Mines hint opens the first square, and refuses a dead or exhausted board |

## The first click is never a mine, and undoing it un-lays the board

| Rule | Where it went |
| --- | --- |
| No layout exists until the first click, and it is generated with the clicked square and its eight neighbors free of mines | spec: The first click is never a mine, and undoing it un-lays the board |
| The game answers `Game.supersededDesc` with the board and its first square, so the game ID, a restart and a save name the board being played | spec: The board laid out supersedes the description it started from |
| The layout belongs to the position the first click made, and undoing the click returns to the board not laid out yet, with its starting game ID | spec: The first click is never a mine, and undoing it un-lays the board |
| The square opened next lays out from the same seed, the same board for the same square, so a player can choose among one seed's boards | spec: One seed lays out the same board for the same first square |
| Nothing in the app counts or rewards a board | reason |
| What the alternative left a player on after undoing the first click | spec: One seed lays out the same board for the same first square; history |
| The first move carries its layout, and replaying it generates nothing | spec: The first move carries the layout it laid out |
| An open that brings no layout is refused on a board not laid out yet, an older save aside | spec: The first move carries the layout it laid out |
| A first move whose layout holds a mine in its square or beside it is refused | spec: The first move carries the layout it laid out |
| Scenario: the first click generates the board | spec: The first click is never a mine, and undoing it un-lays the board |
| Scenario: undoing the first click un-lays the board | spec: One seed lays out the same board for the same first square |
| Scenario: the same square lays out the same board | spec: One seed lays out the same board for the same first square |
| Scenario: a save with the first click undone | spec: The first move carries the layout it laid out |

## Mines tells a covered square from an opened one by two flat surfaces

| Rule | Where it went |
| --- | --- |
| No bevel: an opened square is the cell surface and a covered one the lifted surface, with the grid line between and a frame no heavier, in both schemes | spec: Mines tells a covered square from an opened one by two flat surfaces |
| The game declares no palette swap for the dark scheme | spec: Mines tells a covered square from an opened one by two flat surfaces |
| A pressed square takes the opened surface, the digits keep their colors, and the flag, the mine and the tint are drawn on these surfaces | spec: What Mines draws on its two surfaces |
| The flag, the mine and the tint are "unchanged" from the beveled drawing | history |
| The cursor is drawn at the square's edge and does not fill it, and a hint's ring and outline and a mistake's frame sit at the edge of the surface | spec: The Mines cursor and marks sit at the square's edge |
| A win's flash lifts every square to the covered surface, a death's fills every square in the error color, and the trodden mine keeps the error color throughout | spec: Mines' flashes fill every square on their lit beats |
| Scenario: two surfaces and no bevel | spec: Mines tells a covered square from an opened one by two flat surfaces |
| Scenario: the cursor leaves the square readable | spec: The Mines cursor and marks sit at the square's edge |
| Scenario: a pressed square previews the opened surface | spec: What Mines draws on its two surfaces |
