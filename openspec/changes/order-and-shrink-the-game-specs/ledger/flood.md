# flood

The Purpose is unchanged.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Flood refuses params it cannot deal | title kept. Sentence 2 ("A `colors` outside 3–10 and a negative `leniency` SHALL be refused too.") cut. Scenario "Too many colors are refused" dropped; "A one-square grid is refused" kept | `bounds: { min: 3, max: MAXCOLORS }` on `colors` and `bounds: { min: 0 }` on `extra-moves-permitted`, in `paramConfig`, `src/games/flood/index.ts:221` and `:230`; `engine-params`, "Params validity is the engine's check" (a bound's refusal names the field by its label; scenario "A value outside its range"). `src/games/flood/flood.test.ts:69` holds "Colors must be at most 10." |
| Hint: Flood offers a solver-backed hint plan | "and highlighting the squares that fill will absorb" cut, the sentence ending at "narrated by its color"; the scenario untouched | `hintMarks.roles.ring` ("a black dot on every square the named color's fill would join to your region"), `index.ts:269` |
| Controls: Flood input fills with the chosen square's color | gains a first sentence that names `targetVerbs` and `engine-input`, "The engine owns a declaring game's press and select keys", for the click, the cursor and the select keys (rule 2); the rest and the scenario untouched | |

## Kept, and why

- **Params: Flood params are a size, a color count and a leniency.** The
  codec is written out (`encodeParams`, `decodeParams`,
  `src/games/flood/state.ts:65` and `:71`): `c` and `m` in the full form
  only, read in either order, a bare `W` square.
- **Params: Flood's Easy, Medium and Hard name the extra moves.** The titles
  are in `presets` (`state.ts:102`), but what the three words mean, and that
  they are no tier, is said by no field and no shared requirement
  (`engine-params`, "A preset keeps a declared title only for a name no field
  says" says only when a leaf may carry one).
- **Controls: Flood input fills with the chosen square's color.** The `does`
  string says a fill takes the square's color; that a square of the corner's
  own color makes no move is `fillWith` (`index.ts:98`), written by hand.
- **Generation**, "SHALL NOT already be one color". `engine-difficulty`, "A
  board that comes solved is dealt again" is the engine's net under every
  game; Flood's generator has its own loop (`state.ts:213`), and the limit's
  arithmetic hangs on the grid it keeps.
- **Hint: Flood's hint plan follows the player's fills.** `engine-hints`, "A
  player move is classified against the stored plan" says what the midend
  does with a verdict; which fill earns which verdict is `hintKeepTrack`
  (`index.ts:167`).
- **Hint: Flood's hint refuses a grid flooded after the limit**, last
  sentence. `engine-hints`, "The midend does not refuse a hint on a lost
  board" gives Flood as its reason and its scenario; that the hint then gives
  the solver's remaining fills is the game's half.
- **Look: A mark on a Flood tile is black in both schemes.** It holds the
  only word the spec has of the defeat blink, which is the game's own flash
  (`flashLength`, `index.ts:179`).

## Engine requests

None.

## Found

- **The `Controls` subject said nothing of how a square is chosen.** The
  click, the cursor and the select keys are `targetVerbs` with one verb
  (`index.ts:103`), under `engine-input`, "The engine owns a declaring game's
  press and select keys"; the one requirement spoke of "the clicked or
  cursor-selected cell" and named neither. The review added the sentence that
  does (rule 2).
- **No requirement states the defeat blink.** `flashLength` answers three
  beats on the move that loses (`index.ts:179`), and `Look: A mark on a Flood
  tile…` mentions "the blink of a lost board" only for its color.
- **"Status bar: Flood's status bar counts moves against the limit" does not
  give the words.** They are `{moves} / {limit} moves`, with `FAILED! `
  before them on a lost board (`statusbarText`, `index.ts:125`); the
  description requirement's scenario quotes `0 / 23 moves`.

## Review

2 rows read, each against the declaration and the requirement it names; 2
corrected, 1 row added, no sentence restored.

Changed:

- **"Params: Flood refuses params it cannot deal"**: the writer had swapped
  the bounds sentence for "Beside the bounds its fields declare in
  `paramConfig`". The `Params` subject says plenty of its own, so that is the
  copy with a citation; the clause is removed and the requirement states the
  one refusal `validateParams` makes (`state.ts:95`).
- **"Hint: Flood offers a solver-backed hint plan"**: "and marked as the
  legend says (`hintMarks`)" removed for the same reason. The dot is still
  named, for its color, in "Look: A mark on a Flood tile is black in both
  schemes".
- **"Controls: Flood input fills with the chosen square's color"**: gains the
  sentence that says where the click, the cursor and the select keys are
  stated (rule 2). `interpretMove` is `interpretTargetVerbs` and nothing else
  (`index.ts:112`), and the declaration has one verb.

Checked and found sound:

- The bounds (`index.ts:221`, `:230`, `MAXCOLORS` is 10) and `engine-params`,
  "Params validity is the engine's check", which states that a declared bound
  refuses and names the field; `flood.test.ts:69` holds the eleventh color.
- The legend's ring (`index.ts:269`) states which squares a step marks.
- Every title under "Kept, and why" exists, and every line citation was
  opened.
- The 14 requirements the writer left: none holds a sentence that a
  declaration or a shared requirement states whole. The params codec and the
  preset titles are functions; the generator, `hintKeepTrack`, `hasNoSolution`
  and the status bar are the game's.
