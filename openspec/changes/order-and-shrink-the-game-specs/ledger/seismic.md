# seismic

The Purpose is unchanged: each thing it names the spec still holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: A region holds each number once and equal numbers keep apart | gains the sentence that says when the game is solved, and the scenario "Completing the grid wins" without "and flashes", both from "Controls: Seismic input, note-taking and completion" | the flash: `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Params: Seismic's parameters | removed. That a bare number decodes as a square grid joins "Params: A Seismic params string with no mode is Seismic, and with no difficulty Easy", which also names the three fields in a clause. The bound of 4, the unknown difficulty and the round trip cut, with scenario "A game ID round-trips through the parameters" | `paramConfig`, `src/games/seismic/state.ts:133` (`bounds: { min: 4 }` at `:136`, `difficultyItem`, `rulesetItem`); `engine-params`, "Params validity is the engine's check" (a bound and a choice outside its list) and "Encode and decode are mutual inverses over the corpus"; `src/engine/__snapshots__/params-stability.test.ts.snap` holds `6x6de`/`6x6` and every preset |
| Params: Seismic's game ID writes Tectonic as T and the difficulty as de or dh | retitled "Params: A Seismic params string with no mode is Seismic, and with no difficulty Easy" (the pointer, rule 2). The letters (`T` or nothing, `de`/`dh` in the full form only) and the refusal of a `d` with another letter or none cut; the three missing-field sentences kept. The pointer names `presets` for the menu (added in review). Scenarios "A Tectonic preset" and "A letter that names no difficulty" dropped; "A Seismic preset" kept | the `paramsCodec` field list, `src/games/seismic/state.ts:146` (`dims`, `letters(…, ["", "T"])`, `choice(…, "d", …, "eh", { full: true })`, `DIFF_CHARS` at `:55`); `engine-params`, "A params string is read whole or refused" (a letter the tag does not list, a tag with nothing after it) and "The engine makes the one refusal of a params string" (the sentence the dropped scenario quoted); the snapshot holds `4x4Tde`/`4x4T` and `4x4dh`/`4x4` |
| Generation: The generator strips clues and accepts only a board of its tier | retitled "Generation: The generator strips clues while the board stays soluble at its tier". The second half of its sentence (accepted only when soluble at the difficulty and not below) cut whole (second pass: the pointer that stood for it went too). Scenario kept | `engine-difficulty`, "A difficulty tier binds the board it generates"; the gate is `src/games/seismic/generator.ts:342`-`:347` |
| Controls: Seismic input, note-taking and completion | retitled "Controls: Seismic is played by the note-taking cell's rules" (the pointer, rule 2): gains the capability and title, that the game departs nowhere, and its two answers to the mechanic. "SHALL offer a sticky pencil mode preference" cut. The solved sentence and scenario "Completing the grid wins" move to "Rules: A region holds each number once and equal numbers keep apart"; scenario "A press on a given" written in words from `interpretMove` | `prefs`, `src/games/seismic/index.ts:346` (`stickyPencilPref`); `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on". The new scenario is `canEnter: !(flags & FM_FIXED)` and `canMark: grid === 0`, `src/games/seismic/index.ts:135`, with `engine-notes`, "The highlight is shown only where its mode could write" |
| Controls: Seismic's Mark-all fills, then strikes what a placed number rules out | title kept. The two phases, "never strike a cell's last note" and "no move when nothing is left to strike" cut for a citation; kept as the game's own: what a note-less cell is filled with and what an obvious candidate is. Scenario "Mark-all leaves a narrowed cell alone" dropped; "A second press on a filled board" kept | `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule" (its scenario "A narrowed cell beside a note-less one"), "Repeated Mark-all presses converge" ("A clean SHALL NOT empty a cell of its last note") and "The Mark-all cleanup is one move, or none"; `markAll`, `src/games/seismic/hint.ts:157`, is `adaptiveMarkAll` |
| Hint: Seismic explains the next deduction | removed, with its scenario | `engine-hints`, "A hint is deduced from the board in play" (the plan from the player's own board), "A hint step always names a technique, with no un-narrated fallback" and "Requesting a hint never mutates the board" (`Game.hint` pure on its state, "byte-for-byte unchanged") |
| Look: Seismic draws its numbers, its notes and a broken rule | "There SHALL be no move animation." cut | `animLength: () => 0`, `src/games/seismic/index.ts:358` |
| Look: The completion flash lights each cell's surface | title and scenario kept. "SHALL sweep the board's cells", "filled with a flash color" and "SHALL keep its digit and its notes" cut for a citation; kept: a given's cell is lit as a player's, the fill stays inside the region's walls, the highlight is hidden | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`, `src/games/seismic/render.ts:443`); `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground filled, what it holds kept; scenario "A board that lifts its cells") |

## Kept, and why

- **Params, the three missing-field sentences.** `dims`, `letters` and
  `choice` say each; kept as what a missing field decodes to. The Easy of a
  string with no `d` is `defaultParams`' tier
  (`src/games/seismic/state.ts:128`), which no reader of the codec's field
  list sees.
- **Params: The size bound is measured…, Tectonic's bound…, Seismic's
  bound…, A preset is never a long wait.** Why a size is refused, per mode,
  which a `validateParams` sentence and a preset table do not say.
- **Generation: Seismic solves by candidate elimination, graded Easy or
  Normal.** What each tier means.
- **Controls: The on-screen keypad offers only digits a board can accept.**
  `requestKeys` is a function of the mode, and the requirement is the rule it
  follows (the generator's largest region, not the format's nine).
- **Controls: A Seismic digit enters or pencils…** `interpretMove`,
  `src/games/seismic/index.ts:115`, is hand-written.
- **Hint: The hint starts on the implicit reading.**
  `engine-candidate-hints`, "A game states the reading it starts on", has a
  game that leaves the convention say why; this is where Seismic does.
- **Hint: The deductions the hint makes**, "The last SHALL be taken only when
  no other applies". The order of a plan on the shared walk is the walk's,
  and this is the one place it is said of the starved-area rung.
- **Look: A flagged cell carries its own mistake overlay.** `ts-engine`, "The
  midend shows mistakes until the next transition", schedules the repaint;
  that Seismic's cached tile is repainted when only the flag changed is the
  game's renderer.

## Engine requests

None.

## Found

- **Seismic's size bound refuses a loaded board too** (verified in review,
  from the code). `validateParams` names its second parameter `_full` and
  never reads it (`src/games/seismic/state.ts:210`), and the midend checks a
  `<params>:<desc>` ID's params before it reads the description
  (`paramsError(this.game, params, generating)`, `src/engine/midend.ts:592`).
  So refused at load, whatever the description holds and whether or not it is
  a sound board: every ID, and so every shared link, whose params are Seismic
  mode with `w·h` above 64 (`9x8:…`, `10x10:…`), and every one in Tectonic
  mode with `w·h` above 100 (`11x10T:…`). The refusal is the generator's
  sentence ("Width times height must be at most 64 in Seismic mode; the
  generator cannot reliably build a larger board."), which is false of a
  board that arrives built.
  - **What the comment says the cost is** (above `MAX_CELLS_SEISMIC`,
    `src/games/seismic/state.ts:197`-`:199`): "Its cost: a hand-authored
    Seismic `10x10:⟨desc⟩` game ID is refused too, since params are validated
    the same way for a `:desc` id as for a `#seed` one." It names the Seismic
    10×10 alone, calls it hand-authored, and says nothing of Tectonic's bound.
  - **The comment's reason no longer holds.** The midend passes `full: false`
    for a `:desc` ID (`engine-params`, "Param validation distinguishes
    generating a board from loading one"), so the two are validated the same
    way only because this `validateParams` ignores the flag.
  - **The cost is wider than "hand-authored".** Upstream's `validate_params`
    has no upper bound (`../puzzles-web/puzzles/unreleased/seismic.c:229`), so
    an upstream build deals and shares a board past either bound wherever its
    generator succeeds; the comment itself records this generator passing a
    sweep up to 72 cells in Seismic mode and reaching every Tectonic size to
    100. By `AGENTS.md`, refusing a description upstream's generator writes
    is a compatibility break.
  - **The specs disagree with the code.** The spec's four bound requirements
    speak only of a board "requested" and of the generator, and
    `engine-params`, "A generation-only bound is gated on full", says such a
    bound is gated and "would refuse a description-carrying game ID that
    loads today" otherwise. Gating the two bounds on `full` would make the
    code agree with both; nothing was changed.
- **"Params: A preset is never a long wait" says "a test SHALL assert
  this"**, which names no test but is a statement about one; the form rule
  keeps tests out of a spec. Left as it stood.
- **The spec never stated Seismic's preset menu** (4×4, 6×6, 7×7 and 8×8,
  each mode at both tiers, `src/games/seismic/state.ts:104`) beyond its 8×8
  ceiling. A preset table is a declaration and not the spec's to hold; the
  `Params` pointer now names `presets` as where it is.
- **The `Rules` subject never says what Check & Save reports** (found in
  review). The game has `findMistakes` (`src/games/seismic/index.ts:265`),
  and the spec names it only as the reason the hint may trust the notes
  ("Hint: The hint deduces from the player's notes") and for its overlay
  ("Look: A flagged cell carries its own mistake overlay").

## Review

9 rows read, each against the declaration or the requirement it names, read
whole; 1 row's requirement given a clause in the spec, no sentence restored,
no further sentence cut.

Changed:

- **"Params: A Seismic params string with no mode is Seismic, and with no
  difficulty Easy"**, the pointer, now names `presets` for the menu, as the
  other games' pointers do. The menu is listed by hand in `PRESETS` and
  handed over by `presets`; the spec never held it.
- **`## Found`**: the first item rewritten from the code and the comment, as
  asked; the preset item corrected (a declaration is not owed); one item
  added.

Checked and found sound:

- The 5 engine titles the spec cites resolve, each exactly, and each
  requirement states what its row removed. The removed difficulty-letter
  sentence and its scenario are `engine-params`, "A params string is read
  whole or refused" (a letter the tag does not list, a tag with nothing
  after it), and the dropped scenario's sentence is the one "The engine makes
  the one refusal of a params string" quotes. The three Mark-all clauses that
  went are `engine-notes`' "change no other", "A clean SHALL NOT empty a cell
  of its last note" and "no move at all" where nothing is left.
  `engine-difficulty`, "A difficulty tier binds the board it generates",
  states both directions of `genDiff`.
- The removed "Hint: Seismic explains the next deduction": the plan from the
  board in play, a step that explains why its move is forced, and
  `Game.hint` pure on its state, "byte-for-byte unchanged", are each a shared
  requirement's. Its "from premises the sentence itself states" was read as
  part of the second and has no clause of its own there.
- The declarations: `bounds: { min: 4 }`, `letters(…, ["", "T"])`,
  `choice(…, "d", …, "eh", { full: true })`, `stickyPencilPref`,
  `animLength: () => 0`. Every line citation lands on the line named; the
  snapshot holds `4x4Tde` with `4x4T` and `4x4dh` with `4x4`.
- The new sentences against the code: `pressNoteTakingCell` is handed
  `canEnter` false on a given and `canMark` false on any cell with a number,
  so a press on a given shows no highlight in either mode, and a digit is
  entered only "while the highlight shows"; `markAll` is `adaptiveMarkAll`.
- No kept requirement holds a further copy by the three classes. The digit
  and clearing keys are `interpretMove` written out; the four bound
  requirements say why a size is refused; the hint requirements each give a
  technique, Seismic's reach, or the reading it starts on, which
  `engine-candidate-hints`, "A game states the reading it starts on", has the
  game say. A cut of 5% is what is left once the mechanic's rules were
  already a one-line pointer before the cut.
- Each subject read alone: none hollow but `Rules` on mistakes (above), which
  the cut did not cause; no dangling antecedent, every title fits its body.

## Second pass

The brief's "A pointer is for that case only" and its line on a preference's
key, applied. 7 citing sentences read; 1 removed, 2 kept as the one pointer
of a subject, 4 kept as what the game hands a shared rule.

Removed:

- **Generation**, "That it accepts a puzzle only when it is soluble at that
  difficulty and not at the difficulty below is the collection's
  (`engine-difficulty`, "A difficulty tier binds the board it generates"),
  and Seismic SHALL NOT depart from it": a copy with a citation, in a subject
  whose three requirements say what each tier's solver does, how the clues
  are stripped and what every dealt board is held to. The requirement is
  retitled, since its body no longer says what is accepted.

Kept as a pointer: the `Params` pointer (`paramConfig`, the codec and
`presets`, with the three missing-field sentences); "Seismic SHALL be played
by the note-taking cell's rules (`engine-notes`, "The note-taking cell is
one shared mechanic") … and SHALL depart from them nowhere", the one place
Controls says how a cell is selected, with the game's two answers to the
mechanic.

Kept otherwise: "Seismic's `markAll` SHALL be the adaptive press of
`engine-notes`, "…", by a rule of its own: …" (what a cell is filled with
and what an obvious candidate is); "The plan SHALL be walked by the shared
candidate walk (`runCandidatePlan`), with Seismic's keep-apart rule as the
walk's `reach`"; "Seismic SHALL offer the player the "Hints pencil in" choice
and start on the implicit reading, because …" (the shared rule has the game
say why); the flash's "by its place in the grid (`ts-engine`, "A game gives
each element a position, and the route is which position it gives")", which
is the position Seismic gives. The surfaces of "Look: Seismic draws its
cells on a quiet surface and keeps its walls" say which cell takes which and
cite nothing.

Preferences: the cut removed "SHALL offer a sticky pencil mode preference",
which names no key. The preference is the engine's, not one of the game's
own, and its key is stated by `engine-notes`, "The pencil preferences have
one key each, which a saved preference depends on"; Seismic's `prefs`
(`src/games/seismic/index.ts:346`) holds three items, each the engine's, and
no key of the game's.

Each subject read alone after the edits: no fragment, no dangling "it",
every owed subject says what the game does there or where to look, but
`Rules` on mistakes, as `## Found` records; every title fits its body.
