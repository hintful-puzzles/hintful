# Verdicts: rome

## keep `rome`: Marks that rule out the answer are a mistake

`ts-engine` "A candidate note that excludes the answer is a mistake" is conditional ("Where a game ... reports them as mistakes") and obliges no game to check its notes. That Rome does, against upstream's "marks can be used for any purpose", and that the mistake is of its own kind `note`, is said only here.

## keep `rome`: An input that changes nothing adds no history

No shared requirement says which of a game's inputs are nothing. `ts-engine` "A UI-only input redraws without a history entry" says what the midend does once a game reports nothing, and `engine-notes` "The engine owns what a press and an entry do to the highlight" covers the typed repeat alone. The fixed clue, the repeated arrow, the empty clear and where the margin begins are Rome's own answers.

## keep `rome`: A tap that commits no move selects the square

`engine-notes` "A game whose press starts a drag joins the note-taking cell through its tap" states the mechanism. This holds what that one does not: a tap on the player's own arrow clears it and selects nothing, a notes-mode tap on an arrow moves the cursor unshown, and the reason the tap must select at all.

## keep `rome`: A walk in a Rome hint is numbered square by square

A hint's marks stay. `engine-candidate-hints` "A premise that asserts a walk is computed and numbered" gives the general rule; this says what a walk is in Rome (an arrow chain leading back to the square being struck) and what the sentence then claims.

## keep `rome`: Rome explains its next deduction

The sentence already cut was rightly cut and is not restored: `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game" gives both refusals for every game, and Rome's `hint` writes neither (`src/games/rome/hint.ts` goes through `candidateHint`). What is left is Rome's own.

## reword `rome`: Rome's parameters

The requirement said a game ID encodes the three fields without saying how, and the encoding is a promise to shared links. Added from `src/games/rome/state.ts` (`paramsCodec` with `dims` and `choice(..., "d", ..., "ent", { full: true })`): the `WxH` form, the `d` segment, its letters, and that the difficulty is written in the full form only. The scenario now says "in the full form", since the brief form carries no difficulty to recover. No rule is dropped.

### Requirement: Rome's parameters

Parameters SHALL be a width, a height, and a difficulty (Easy, Normal or
Tricky). Validation SHALL require a width of at least 3, a height of at least
3, and a difficulty within range. The encoding SHALL be `WxH`, an absent `x`
meaning a square board, followed in the full form only by `d` and the
difficulty's letter: `e`, `n` or `t`. It SHALL round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in the full form and decoded
- **THEN** the same width, height and difficulty are recovered

## reword `rome`: Rome's two highlight preferences

A stored preference is found by its key, and the requirement named neither. Added from the `prefs` of `src/games/rome/index.ts`: the keys `goal` and `loop`, which are upstream's. No rule is dropped.

### Requirement: Rome's two highlight preferences

Rome SHALL offer two highlight preferences: one highlighting the squares whose
arrows reach a goal, on by default, under the key `goal`, and one highlighting
the squares of a loop, off by default, under the key `loop`.

#### Scenario: A new game starts with the defaults

- **WHEN** a game is started with no stored preference
- **THEN** the squares whose arrows reach a goal are highlighted and the
  squares of a loop are not

## keep `rome`: Rome's generator keeps every board soluble at its tier

The seed sentence stays. A `<params>#<seed>` id is still loadable (`ts-engine` "The midend retains generator aux info for Solve", `engine-difficulty` scenario "A seed that finds no board is refused like any other id"), so one seed giving one board within a build is something the app relies on, and no shared requirement says it of a generator: `testing` "The test suite is deterministic under parallel load" asks it only of tests.

## note a seed deals one board, stated game by game

No shared capability says that a generator given the same seed and params writes the same description. Each game's spec repeats it (grep `reproducible` under the regrouped specs), and `testing` "The test suite is deterministic under parallel load" is about the suite. One requirement in `ts-engine` or `dealing` would let every game's copy go; until it exists each game keeps its sentence.
