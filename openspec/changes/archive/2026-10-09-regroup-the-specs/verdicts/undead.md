# Verdicts: undead

## keep `undead`: Undead's Mark-all fills the cells that have no notes

`engine-notes` "A game with no obvious-candidate rule keeps a fill-only Mark-all" names Undead but says only that the action "only ever fills missing candidates", which can be read as topping up a narrowed cell. That a narrowed cell is left as it is appears nowhere in `engine-notes` for a fill-only game (the one use of "narrowed" there is in "Repeated Mark-all presses converge", about games with regions), so this requirement is its home.

## keep `undead`: Undead's pencilStrike clears candidate bits atomically

A game's move vocabulary is save format: a save holds its move log, and `ts-engine` "A game rejects a move it cannot play, rather than guessing" says a save's moves are cast on replay and not parsed. The move's name, that applying it twice is harmless, and that `pencil` and `markAll` stay beside it are promises to saved games.

## keep `undead`: Undead's hint conclusions use the necessity voice

A hint's words stay. The two phrasings are what `src/games/undead/hint-text.ts` says ("we must cross out", "can only be a"), and `engine-hints` "The necessity-voice rule applies to every hinting game not ledgered as narrating moves" gives the rule without the words.

## keep `undead`: An Unreasonable board's hint stops where deduction stops

`engine-hints` "Deduction running out on a sound board SHALL have one wording" and "Deduction runs out only where the tier permits search" cover the sentence and where it may be reached. Neither says the plan is not empty from the first move nor that it never finishes the board, and those two bounds are the reason the game's test exists, so the sentence that names them stays.

## keep `undead`: Undead solves and generates uniquely-solvable graded boards

The clause is what the generator promises of a board at a tier, and it is in the code as stated: `src/games/undead/generator.ts` rejects a grid with a sightline of more monsters than a length that rises with the tier (`maxLength`), and one too sparse or too dense. A player meets it as how long a line an Easy board asks them to follow.

## edit `undead`: Undead paints a flagged count and a flagged clue red

"Tracked for repaint" is how the cache is kept and tells a reader nothing. "Not recolored" is what a player sees and is decided: the head comment of `src/games/undead/render.ts` records that upstream computes the cell flag and never draws it, and that the port does the same. The sentence now says that.

from: A flagged cell is tracked for repaint and is not recolored.
to: A flagged cell is not recolored: upstream computes that flag and never draws it, and neither does Undead.

## keep `undead`: Undead supports monster, pencil, and clue moves with a cursor

The scenario "Pencil-mark UX" stays, because it is what a control does and nothing shared says it of Undead. `engine-notes` "The sticky pencil toggle is a mode switch, not a selection" and "A sticky notes mode is visible on the board" presuppose a sticky mode: neither says that a note leaves the mode on, and no shared requirement says which games offer the sticky preference ("The members that offer the sticky pencil preference", in `engine-notes`, leaves that to each game). This scenario is the one place the spec says Undead offers it (`stickyPencilPref` in `src/games/undead/index.ts`) and what it does.

## keep `undead`: Undead's findMistakes compares the board with its unique solution

It says which solution Undead checks against (the description's clues alone) and what it reports, and nothing shared says either of Undead. See the note on `ts-engine` below for the wording the two do not share.

## note ts-engine: "from the committed placements only" is not what the games do

`ts-engine` "A candidate note that excludes the answer is a mistake" says the solution "SHALL be derived from the committed placements only, never from the notes themselves". Undead derives it "from the description clues only", and Rome "from the fixed clues alone, never from anything the player has entered". Read literally the shared wording admits the player's own placed values as a source, which neither game uses and which would make a wrong placement its own evidence. The shared sentence wants "from the puzzle's givens only".

## note engine-notes: a fill-only Mark-all and a narrowed cell

`engine-notes` "A game with no obvious-candidate rule keeps a fill-only Mark-all" does not say that the fill leaves a narrowed cell alone. Undead's own requirement says it; a second fill-only game would have nowhere shared to read it.

## note undead: two entries name requirements that are no longer in the spec

"An Undead hint is refused on a solved or contradictory board" and "Undead flashes on solving" are not in the regrouped `undead` spec, so there is nothing to settle. The first is `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game"; Undead's `hint` writes only `DEDUCTION_EXHAUSTED` (`src/games/undead/index.ts`).
