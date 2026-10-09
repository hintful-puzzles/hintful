# Verdicts: rect

## reword `rect`: Rectangles flags a drawn edge the solution lacks

The last sentence, that Check & Save refuses to save while a mistake is present, is the app's rule for every game that can check: `quick-save`, "Check & save gates the checkpoint on a clean board" and "A refused Check & save leaves the slot intact and says why". Rectangles has `findMistakes`, so it is covered with no departure, and the sentence goes. The rest is unchanged.

### Requirement: Rectangles flags a drawn edge the solution lacks

Because boards are uniquely solvable, the game SHALL implement `findMistakes`:
re-solve from the numbers to the unique solution's edges and return every edge
the player has drawn that the unique solution does not contain. A missing edge
SHALL NOT be a mistake, and a board that is not uniquely solvable SHALL yield
no mistakes.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

## keep `rect`: Rectangles rendering

The scenario "A flagged edge is redrawn" has no shared home. A wrong edge is not a per-cell overlay, so Rectangles carries it in its own tile bits (`src/games/rect/render.ts`) and not through the sidecar that `engine-drawing`, "A per-cell overlay reaches the render cache through the shared sidecar", holds. The warm-frame comparison counts mistake frames and does not require one (`engine-drawing`, "The warm-frame comparison answers for what it reached"). So this scenario is the statement that a mistake found on an already-drawn square shows, which is the defect Check & Save had in Towers.

## edit `rect`: Rectangles generates by tiling, stretching and solving

It is a promise about the board and was worded as a step. `src/games/rect/generator.ts` merges every one-square rectangle of the base tiling into a neighbor before it stretches and numbers, so no dealt board holds a rectangle of one square, or a clue of 1. The words now say what is left and not what is done.

from: remove singletons,
to: leave no rectangle of one square,

## keep `rect`: Rectangles loads only a board its hint finishes

Load and deal are two promises, read by two sessions: this one is the `finishesByDeduction` hook the loader asks (`engine-params`, "An untiered game's board loads unless finishesByDeduction refuses it"), and the other is the generator's gate, with the departure from upstream's desc. One requirement would hold both scenarios and say no more, so they stay two.

## keep `rect`: Rectangles deals only boards its hint can finish

See "Rectangles loads only a board its hint finishes": the generator's gate and the difference from upstream's board for a seed are their own promise.

## reword `rect`: Rectangles input

The entry found two things a control does that no requirement said, and what a control does belongs in the spec. Both are added from `src/games/rect/index.ts`: Escape, Backspace or Delete (`isCancelKey` in `interpretMove`, which is Escape and the two erase keys) cancels a keyboard drag, or hides the cursor when there is none, and `statusbarText` shows the dragged rectangle's size. To stay within the length "toggling that single edge" is "toggling it", "be allocated to" is "resolve to" and "when it is close to one, and otherwise" is "when close to one, else"; no rule is dropped.

### Requirement: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling it,
and a half-grid keyboard cursor with press-to-drag. Escape, Backspace or
Delete SHALL cancel that drag, or else hide the cursor. A pointer position
SHALL resolve to a grid corner or a square's center when close to one, else
to the nearer edge. A drag or click that changes no edge SHALL produce no
move. The status bar SHALL show a dragged rectangle's size.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks in a way that would change no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

#### Scenario: The status bar gives the dragged size

- **WHEN** a drag spans a rectangle three squares wide and two tall
- **THEN** the status bar reads `3x2`, and it is empty once the drag ends

## keep `rect`: Rectangles offers an explained hint that reads only the board

The sentence "The hint SHALL refuse on a board with a wrong line" is already cut, and the cut is right: `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game", gives that refusal for every game and forbids a game to write it, and `src/games/rect/hint.ts` makes no such check. A game's spec keeps the refusals its own `hint` gives, and Rectangles' hint gives none.

## note rect: the win flash after Solve is settled

"The completion flash does not play after Solve" went with "Rectangles game implements the Game interface" in the pruning, and no requirement of the regrouped spec carries it. The cut is right: it is `ts-engine`, "The win flash plays on a forward move that solves the board", and Rectangles supplies only `solvedFlash`.
