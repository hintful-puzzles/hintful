# Hint vocabulary: the page for the owner

**ANSWERED 2026-11-13.** (1) Noun: follow the help page, but use one noun,
"square", everywhere it can be used; a game keeps "cell" only where its theme
needs it, with the reason stated (this replaces §1's "help majority" rule as the
default). (2) Every drop / keep / reword verdict in §3 holds as listed.
(3) Two closings: "must be {off-mark}" and "must go"; "is out" and "rule out"
retire. §§1-3 below are the proposal as drawn; these answers override them.

Drawn 2026-11-13 from `census/raw-1.md` to `raw-5.md` (tree at `8ecc915a4`) and
two measurements made today. **Nothing is applied.** Each row asks for your word.
Netslide's sentence is not here (`reword-the-netslide-hint`).

## 1. The element noun ("square" or "cell")

Measured: for each of the 61 games, the noun its help text (`*.description.yaml`)
uses most, against the noun its `hint-text.ts` string literals use most.
Of the 49 games whose hint text names the element at all, **19 disagree with
their own help page** (boats, clusters, filling, galaxies, magnets, map,
netslide, palisade, pattern, range, rome, separate, singles, slant, sixteen,
starbattle, sticks, tents, undead); six of those mix both nouns in one file
(rome, filling, tents, separate, singles, slant). The engine default is "cell",
so a game that forgot to override it speaks a word its help never uses.
(Counts are word counts, a rough instrument: the engine's own arms' words are
not in them.)

| | Today | Proposed |
|---|---|---|
| Rule | per game, by whoever wrote it | **A game's hint noun is the one its help page uses most**, declared once in the game and consumed by the engine's arms and by `describe`. No game writes "cell"/"square" in a sentence by hand. |
| Exception | none stated | none. A game whose help page and players say "cell" but whose help counts say "square" fixes the help. |

Effect: about 19 games change a word, none changes meaning. Your call: is
"follow the help page" the right rule, or one noun for the whole catalog?

## 2. By kind of deduction

"Now" is the census's sentences; the proposed wording is the engine's `compose`
frame with the shared words. Slots in braces.

| Kind | Now (spread) | Proposed |
|---|---|---|
| **Count met** | "already holds its one A" / "both its As" / "all k of its As" (abcd); "already has the k boat squares its number allows" (boats); "is touched by no diagonals" (slant); "already has its tent" (tents); "has its V lines" (sticks) | "{This row} already has {its one / both / all k} {thing}, so {rest} must be {ruled-out word}." The count word is the engine's; "its number allows" and the per-game restatements of the clue go. |
| **Count starved / last place** | "needs one A and no other cell in it can take one" (abcd); "is the last empty one" (ascent); "needs a + or - in every one of its empty squares" (magnets) | "{This row} needs {k} more {thing} and only {these} can take one, so {this} must be {thing}." |
| **Last candidate** | "Every other letter has been ruled out in this cell" (engine); "Every other number is already beside..." (abcd); "...row and column already hold every other number" | One form: "Every other {value} is ruled out in {this}, so it can only be {v}." The second, positional form stays only where the reason is the board's neighbor, not the rule. |
| **Value ruled out / mark** | "is out", "ruled out", "must be blocked", "must be empty", "must be crossed out", "must be grass", "must be water", "must go", "can't be a wall", "rule out" | Two closings only: a mark the player makes is "must be {the game's off-mark}" (the game declares it: grass, water, blocked, empty; one word per game, not per sentence); a value or note struck is "must go". "is out" and "rule out" retire. |
| **Neighbor ruled out** | "The A just placed rules out A in every cell beside, above or below it" (abcd); "can't repeat in its row and column" (engine; Group, Keen, Mathrax, Solo, Towers, Adjacent) | One form: "The {v} just placed can't repeat in {its row and column}." Geometry phrases ("beside, above or below"; "touching, even at a corner") go to a declared region noun. |
| **Would break** | 33 per-game forms: "would make three in a row", "would close a loop", "would break a rule" (Path; names nothing) | "{X} here would {breach}" with the breach word the game's rule names; Path's "break a rule" is dropped as empty. |
| **Pointing** | "this", "the ringed", "the outlined", "the striped", "the framed" (Mastermind), "the circled" (Inertia) | The engine's three marks only; "framed" and "circled" are Mastermind's and Inertia's own marks and stay (the mark itself differs). |

## 3. Clauses, by column

"Drop" fails the test of the proposal ("drop the clause: can a player who knows
the rules still see why this board forces the move?"); "keep" passes it;
"reword" is a reason that is kept but said in the standard form.

| Clause | Where | Verdict |
|---|---|---|
| ", so there is something to cross out" | engine `hint-text.ts:113`; copies in Undead, Map, Salad, Group, Keen, Seismic, Rome | **Drop.** The notes are on the board; the clause says why the move exists. One engine line, and the copies are deleted. |
| "to check your answer" | Blackbox | **Drop.** The button is labeled. |
| "Undo until it..." / "Undo until they can." | Numgame, Pegs, Samegame | **Drop**: an interface instruction. (Check each against the doctrine's "tell the player what to do" first.) |
| "A galaxy covers the cells its dot sits on" | Galaxies | **Drop.** Definition, not reason. |
| "In any group, (A·B)·C = A·(B·C)" ; "The grid shows" | Group | **Keep the law as the reason** (the step is not deducible without it), **drop "The grid shows"**. |
| "Every tent sits beside a tree, and"; "Tents never touch, even diagonally" (basis of a later leg) | Tents | **Drop** the opener "Every tent sits beside a tree". **Keep "tents never touch" where the ringed squares touch the tent** (a reason). |
| "A wall can't stop in mid-air at this corner" | Palisade | **Reword** to "a wall must continue at this corner" (names the corner). |
| "every region holds {k}" | Palisade | **Drop** (the size is in the status bar and the title). |
| "and no two shaded squares may touch" | Range | **Drop**; the touched outlined square is the reason. |
| "which must turn" (black pearl), "runs straight through it" (white) | Pearl | **Keep** where it names the next square; **drop** as an opener. |
| "which have no other wire, closing the two off from the rest" | Net | **Keep.** It is why a dead-end pair is a loop-off. |
| "the stop square at the end catches you"; "but you can't pick where you stop" | Inertia | **Drop** both. The first restates the core slide, the second the same mechanic. |
| ", counting marked magnets" | Magnets | **Drop**; the count is on the board. |
| "so the board can never be cleared"; "keep the board clearable" | Samegame | **Keep** (it is the verdict that tells the player their move was a dead end). |
| "A bar joins X to Y, and they must differ by exactly 1" | Adjacent | **Keep, reword** to "{A bar} joins {this} to {that}: they differ by 1". |
| "no mine is ever laid in the first square you open or beside it" | Mines | **Keep**; it is the whole first-click hint. |
| "a plain face picks up its paint..." ; "no paint changes" | Cube | **Drop** (the player watches the roll). |
| ", with {its water}" | Boats | **Reword** to one standard "and the water around it" (22 sentences, one clause). |
| "touches, even at a corner" geometry | Abcd, Seismic, Boats, Tents | **Keep as the reason** where the square touches; **drop** from setup lines. |
| "so one of them must be {B}" ; "a duplicate"; "so it must come next" | Singles, Dominosa, Signpost | **Keep**: each is a conclusion, not a rule. |

The census flags about 130 candidate clauses. This page lists the ones that
carry a decision; the rest (the census's "fine" and "board-specific" notes) are
**keep** and are not repeated.

## 4. What each game keeps

- Mastermind: "framed", "is out" (its own mark and its own verb).
- Inertia, Cube, Fifteen, Sixteen, Slide, Sokoban, Untangle, Flood, Pegs,
  Twiddle: plan games with no deductions; they take the pointing and
  count words only.
- Galaxies "partner"/"dot", Subsets "horseshoe", Salad "sees A first",
  Spokes "hub/spoke", Blackbox "ray/laser": nouns of the puzzle, kept.
- Boats "fleet", Bricks "brick": nouns of the puzzle, kept.

## 5. For the owner

1. Is "follow the help page" the rule for square/cell (section 1), or one noun?
2. Do the "drop" rows in section 3 hold? Any "keep" to flip?
3. Are the two closings in section 2 ("must be {off-mark}" / "must go") what you
   want, with "is out" and "rule out" retired?

When these are answered, tasks 2.x are written (after
`build-hint-steps-in-the-engine` is archived).
