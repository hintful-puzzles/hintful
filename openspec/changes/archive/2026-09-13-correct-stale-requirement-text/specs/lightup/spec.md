## MODIFIED Requirements

### Requirement: Light Up game implements the Game interface

The engine SHALL provide a registered `lightup` game implementing
`Game<LightupParams, LightupState, LightupMove, LightupUi, LightupDrawState>`:
place light bulbs on open squares of a `w × h` grid so that every open square
is lit (bulbs shine along rows and columns until blocked by a black square),
no bulb is lit by another bulb, and every numbered black square has exactly
that many orthogonally-adjacent bulbs. Params SHALL be `w`, `h`, `blackpc`
(percentage of black squares), `symm` (none / 2-way mirror / 2-way rotational /
4-way mirror / 4-way rotational) and `difficulty` (Easy / Normal / Unreasonable),
encoded `{w}x{h}b{blackpc}s{symm}d{difficulty}` (short form `{w}x{h}`). All 9
upstream presets SHALL be offered. Decoding SHALL keep upstream's lenient
quirks: a bare `WxH` id demotes 4-way-rotational symmetry to 2-way-rotational
when `w ≠ h`, and the legacy `r` flag decodes as difficulty 2. `validateParams`
SHALL enforce minimum size 2×2, blackpc 5–100, 4-way symmetry only on
square grids of at least 3×3, and known symmetry/difficulty values. The game
SHALL report `canSolve = true` and `canFormatAsText = true` and SHALL drive a
solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, blackpc: 20, symm: ROT2, difficulty: 1 }`
  are encoded in full
- **THEN** the result is `10x10b20s2d1` and decoding it round-trips the params

#### Scenario: Lenient decode quirks

- **WHEN** `18x10` is decoded with defaults carrying 4-way-rotational symmetry
- **THEN** the symmetry demotes to 2-way rotational
- **AND** a params string using the legacy `r` suffix decodes as difficulty 2

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1-wide grid, a blackpc outside 5–100,
  or 4-way symmetry on a non-square grid
- **THEN** it returns a non-null error string

### Requirement: Light Up ports the graded solver faithfully

The port SHALL implement the upstream solver with its exact deductive power at
each difficulty: at Easy, forced-light ("this unlit square has exactly one
remaining way to be lit") and clue deductions (a satisfied clue marks its
remaining neighbors impossible; a clue whose remaining lights equal its
remaining spaces fills them); at Normal, additionally the overlapping-set
discount (every MAKESLIGHT set — from an unlit square or a `C(n, n−m+1)`
combination of a clue's free neighbors enumerated via the ported `Combi`
module — is tested against candidate MAKESDARK squares chosen by the upstream
minimum-rule-out heuristic, marking squares impossible), restarting the cheap
deduction sweep after the first successful discount; at Unreasonable, additionally
recursion on the most-illuminating candidate square, depth-capped at 5, with
upstream's unique-solution bookkeeping (recursion-limit hits propagate
"unknown" under force-unique; solution counts sum across branches). The solver
SHALL track which clue numbers it used, for generator stripping. The solver
SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at difficulty `d > 0` is solved
- **THEN** the solver succeeds with the difficulty-`d` technique set and fails
  (or needs recursion it is denied) with the difficulty-`d−1` set

#### Scenario: Solve recovers a solution from a dirty board

- **WHEN** `solve()` is invoked on a mid-game state containing wrong bulbs
- **THEN** it returns a move that leaves the board correctly and completely
  lit (solving from the current position when possible, else from the clean
  clues)

### Requirement: Light Up ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position
(honoring placed bulbs and impossible-marks), refusing on a solved board and
on a board with detectable mistakes (coupling to the `findMistakes` overlay
and the banner). Each step SHALL name its technique and meet the Palisade
quality bar: lead with the recognizable indication, state why the move is
forced, conclude in the necessity voice, one deduction firing = one step (a
clue firing that forces several squares is one grouped multi-cell step). The
narrated techniques SHALL cover at minimum: forced-light (an unlit square
with one remaining way to be lit), clue-satisfied (a full clue crossing out
its remaining neighbors), clue-saturated (remaining bulbs = remaining
spaces), and the overlapping-set discount (a candidate square that would
extinguish every way to satisfy an unlit square or a clue). Steps that rule
squares out SHALL emit the game's impossible-mark move, so the accumulated
marks externalize the deduction state on the board. `hintKeepTrack` SHALL
classify a player's partial completion of a multi-cell step as on-track and
shrink the step in place. No displayed step may be a generic, un-narrated
fallback.

**A discount narration SHALL describe the set it is discounting as the
deduction counts it.** The set of squares one of which must hold a bulb
includes, for an unlit square, **that square itself** wherever a bulb could
still be placed there — it lights itself. Because the display rings that square
rather than shading it, a narration that says only "the shaded squares" can
light it names fewer candidates than the deduction rests on, and is false on
the boards where the ringed square is a member. The sentence SHALL therefore
say which of the two shapes it means, and SHALL state the premise its
conclusion needs — that one of those squares must hold the bulb — rather than
leaving the reader to supply it.

#### Scenario: A forced bulb is explained

- **WHEN** the plan reaches a square with exactly one remaining way to be lit
- **THEN** the step's move places that bulb, and its narration names the
  unlit square and why every other candidate is gone, concluding with a
  necessity modal

#### Scenario: A satisfied clue groups its marks

- **WHEN** a clue already adjacent to its full bulb count has k > 1 free
  neighbors
- **THEN** one step emits one move marking all k squares impossible, narrated
  as a single deduction

#### Scenario: A discounted square's narration counts every candidate

- **WHEN** a discount step's rule-out set contains the ringed unlit square
  itself, so that only the *remaining* members are shaded
- **THEN** the narration names the ringed square alongside the shaded ones as
  a place the bulb could go, rather than attributing the whole set to the
  shaded squares

#### Scenario: Refusal on a wrong board

- **WHEN** `hint()` is invoked on a board where `findMistakes` is non-empty
- **THEN** it refuses with an error, and the mistake overlay is displayed

#### Scenario: The plan completes deductive boards

- **WHEN** the plan is computed on any generated Easy or Normal board
- **THEN** following it step-by-step solves the board with no un-narrated step

### Requirement: No non-Unreasonable Light Up tier requires guessing

Light Up SHALL comply with the `ts-migration` narratable-deduction generation
policy: every difficulty tier offered under a name other than `Unreasonable`
SHALL generate only boards solvable by the narrated deductive techniques with
no recursion. The recursion-requiring top tier SHALL be offered as `Unreasonable`: it is
upstream's Hard tier under an honest name, renamed by `add-lightup-hint` as a
label change that left its generation untouched.
On boards of an `Unreasonable` tier the hint MAY narrate the deductive prefix
and then refuse honestly at the guess point.

#### Scenario: Deductive tiers are hint-complete

- **WHEN** a board is generated at a non-`Unreasonable` tier
- **THEN** the hint's narrated techniques solve it to completion

#### Scenario: The guess tier is honestly named

- **WHEN** a tier's boards require recursion to solve
- **THEN** that tier is offered only under the name `Unreasonable`
