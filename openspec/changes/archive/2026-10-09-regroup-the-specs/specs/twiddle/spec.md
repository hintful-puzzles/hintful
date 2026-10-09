## MODIFIED Requirements

### Requirement: A click rotates the block centered on it

`interpretMove` SHALL convert a left or right click to a rotation by offsetting
the click by `(n−1)/2` tiles, so that it selects the region centered on the
click, and mapping the result to grid coordinates. It SHALL reject a click
whose region falls outside `0 ≤ x ≤ w−n`, `0 ≤ y ≤ h−n`. A left-click SHALL
rotate anticlockwise (`dir +1`) and a right-click clockwise (`dir −1`).

#### Scenario: Click geometry constrains legal rotations

- **WHEN** a click selects a region that would extend past the grid edge
  (its top-left corner outside `0 ≤ x ≤ w−n`, `0 ≤ y ≤ h−n`)
- **THEN** no move is produced

### Requirement: Letter and numpad keys rotate fixed blocks

The letters `a`, `b`, `c` and `d` SHALL each rotate one corner block anticlockwise (`dir +1`),
and the shifted `A`, `B`, `C` and `D` SHALL rotate the same block `dir −1`. The
numpad digits SHALL also produce rotations: a corner digit rotates its corner
block, and an edge digit or the center digit rotates the block midway along
that edge or at the center only when the parity of `w−n` and `h−n` puts a block
exactly there.

#### Scenario: A capital turns the corner back

- **WHEN** `a` is pressed and then `A`
- **THEN** the top-left block rotates `dir +1` and then `dir −1`

#### Scenario: An edge digit needs a block midway

- **WHEN** `w−n` is even and numpad `8` is pressed
- **THEN** the block at `((w−n)/2, 0)` rotates `dir +1`

## REMOVED Requirements

### Requirement: Twiddle's presets hold one orientable board

**Reason**: collection: `engine-params`, "A checkbox rule modifier has one line
of the menu", says it of every game, and Twiddle declares `orientable` with
`modifierItem` as a checkbox (`src/games/twiddle/index.ts`) and is in no
per-size ledger, so it is covered with no departure. The rule was decided with
the owner for the whole catalog
(`openspec/changes/archive/2026-10-05-review-preset-counts-across-the-catalog/proposal.md`,
"A rule modifier has one line"; its `menus.md` row for Twiddle gives that as
the reason). Which board is the orientable one is the `presets` table in
`state.ts`.

### Requirement: Twiddle has no mistake check and no hint

**Reason**: declared: the mistake-check half is `notApplicable.findMistakes` in
`src/games/twiddle/index.ts`, a sentence the engine reads and the help page
shows (`ts-engine`, "A not-applicable reason is a fact about the puzzle"). The
hint half is not a decision but the present state: the same `ts-engine`
requirement says a hint is never not applicable, "A game's contract sections
are implemented, not applicable, or absent, and an absent one makes it a draft"
makes Twiddle a draft for lacking one, and
`openspec/changes/hintless-games-in-reserve/proposal.md` names Twiddle among
the games still owed a hint. A SHALL NOT here would forbid the work that change
holds. The scenario only inspects the game object.
