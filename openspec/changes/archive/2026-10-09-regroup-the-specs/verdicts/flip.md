# Verdicts: flip

## keep `flip`: Flip names no hue for either state

The two points are Flip's own and not what the shared rule produces.
`engine-colors` "A game that uses the pair names no hue or shape of its own"
says a game takes the pair's words by index; "lit" and "unlit" are not the
pair's words but Flip's, written in `src/games/flip/hint-text.ts` and in the
`hintMarks` legends of `index.ts`, and they are the hint's vocabulary. That
the help page names each piece by placeholder and by a shape word
(`help/games/flip.md`: "a {{pair:0}} square", "a {{pair:1}} disc") is how
Flip's page meets the shared rule, and the scenario holds it.

## reword `flip`: Flip's rulesets are Crosses and Random

Naming the two rulesets and what sets them apart is the decision, and it is
enough. The three consequences go as `collection`: the Type menu's sections
and the name in front of a params label are `engine-params` "A game declares
its rulesets with rulesetItem" and "The preset menu gives each ruleset a
section", and the help page stating each rule in its opening list is
`help-pages` "A game page's list of rulesets is generated". Each covers Flip
with no departure (`help/games/flip.md` writes `{{rulesets}}`). The scenario
stays as the requirement's one.

### Requirement: Flip's rulesets are Crosses and Random

Flip SHALL declare Crosses and Random as its two rulesets, each with the rule
for which squares a press flips.

#### Scenario: The help says what Random changes

- **WHEN** a player reads Flip's help page
- **THEN** its rules say which squares a press flips in Crosses and which in
  Random

## reword `flip`: Flip's solver finds a shortest set of presses

"Gaussian elimination over GF(2)" goes as `how`. What Solve and the hint rest
on is that the answer is a shortest set of presses, or that
none exists; another exact method would be a change with no spec edit, and
that is the right answer. Nothing else is changed. The spec's Purpose still
says "by elimination over GF(2)"; see the note.

### Requirement: Flip's solver finds a shortest set of presses

The Flip solver SHALL return a shortest set of presses, or report that no
solution exists for a hand-entered position. Solve SHALL press every square of
the solution in one move.

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no solution
- **THEN** it reports that no solution exists rather than returning a
  move

#### Scenario: Solve is one move

- **WHEN** the player uses Solve on a board that takes several presses
- **THEN** every square is lit after one move, and one undo restores the board
  as it was

## reword `flip`: Flip's status bar counts the moves, and the board has a text format

The text-format half goes as `type`, and the title with it. It said only that
a text format exists, which is the presence of `textFormat` on the game
(`ts-engine` "Solve, the status bar and text export follow from the game's
methods"); the layout of the export is stated nowhere and is a promise to no
one, since nothing saved or shared holds it. What the status bar says is
player-visible and stays.

### Requirement: Flip's status bar counts the moves

Flip SHALL provide a status bar string reporting the move count.

#### Scenario: The status bar after a press

- **WHEN** the player presses a square on a fresh board
- **THEN** the status bar reports one move

## note Flip's description format has no requirement

Saved games and shared links depend on it and the spec has never stated it.
From `parseDesc` in `src/games/flip/index.ts`: two hexadecimal bitmaps
separated by a comma, first the toggle matrix (`(w*h)` squared bits, row `i`
being the squares a press on square `i` flips) and then the starting lights
(`w*h` bits), read by the engine's `readBitmap`, with nothing after. It needs
a requirement beside "Flip's params encoding", written from the code and
`readBitmap`'s bit order; this pass adds none.

## note Flip's Purpose names the solver's method

With "Flip's solver finds a shortest set of presses" reworded, the Purpose's
"its solver finds a shortest set of presses by elimination over GF(2)" should
lose "by elimination over GF(2)" when the spec is assembled.
