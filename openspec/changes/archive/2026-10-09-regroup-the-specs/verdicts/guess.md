# Verdicts: guess

## keep `guess`: Guess refuses params no board can be dealt for

The ten-color ceiling is a rule and not only declared data: the board has ten peg colors ("Guess draws an empty hole as quiet surface") and the keypad ten digit keys, the tenth being `0` ("A color key wears its color and its digit"). A session raising the bound would check it here.

## keep `guess`: The hint's readings are sound

"Checked by brute force over the whole answer space" states how strong the guard must be, exhaustive and not sampled, which is a decision a session speeding up `src/games/guess/guess-hint.test.ts` would otherwise revisit. The rule is the reason for the guard.

## keep `guess`: Every plan ends with a probe that could win

The recount is the same case: the sentence a player reads gives two counts, and the requirement says they are held by counting again and not by trusting the search that produced them.

## keep `guess`: Notes mode is the engine's pencil mode

The first sentence is how Guess joins the mechanic: `engine-notes`, "Whether a game takes notes is derived from what the game is", reads the pencil-mode flag on the `Ui`, and Guess has no `pencil` array to be found by. The rest of the requirement reads correctly with it, and less clearly without: it is why the Marks key moves the frame between the rows.

## keep `guess`: A hint's marks on the answer row sit beside the content

`engine-hints`, "A hint marks beside the content, never behind it", speaks of a ring on a cell's border. A color's block in a slot's well has no border of its own, so the frame in the gap beside the block and the outline in the margin outside the well are Guess's own answer to the shared rule.

## reword `guess`: Guess remembers a half-composed row across a save

A save field is a promise to saved games, and the requirement named the hooks without the format. The format is added from `encodeUi` and `decodeUi` in `src/games/guess/index.ts`. To stay within the length, the clause explaining why the move log cannot recover the row (a row is recorded only once submitted, a hold only with its guess) is shortened to the fact; no rule is dropped.

### Requirement: Guess remembers a half-composed row across a save

Guess SHALL provide `encodeUi` and `decodeUi`, carrying the working row and the
live holds, which replaying the move log cannot recover. The encoding SHALL be
one field per slot, comma-separated: the peg's color number, `0` for an empty
slot, followed by `_` when the slot is held (`3_,0,5,2`). `decodeUi` SHALL
treat a peg the params have no color for as an empty slot, and SHALL leave the
cursor where the next color will go.

#### Scenario: A half-composed row survives a save

- **WHEN** a working row is partly filled with a hold set, encoded through
  `encodeUi`, and decoded into a freshly built `Ui`
- **THEN** the restored row and holds equal the originals and the restored
  cursor rests on the first empty slot

#### Scenario: A peg no color exists for is dropped

- **WHEN** `decodeUi` is given a peg outside `1..ncolors`
- **THEN** that slot is left empty and the rest of the row still decodes

## note guess: no text export was upstream's, not a decision

The pruning cut "SHALL NOT provide textFormat" with the Game-interface requirement. It stays cut: text export is not a contract section (`src/engine/sections.ts` names `hint`, `findMistakes`, `solve` and `transposeParams`), `src/games/guess/index.ts` records no reason for its absence, and nothing in the tree marks it as refused. It is what upstream did and not a refusal that binds.

## note guess: the label toggle is in no requirement

`l` and `L` toggle the digit labels on the pegs and blocks, and do so after the game ends (`interpretMove` in `src/games/guess/index.ts`). "The answer row's blocks stay legible" says what labels show and no requirement says what turns them on. What a key does stays in a spec, so a later change should add it. The `d`/`D` keys the same entry missed are now in "Guess's rub-out keys act on the row the frame is on".
