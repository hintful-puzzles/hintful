# rome-hint-survives-a-restored-note

Found by the random-play sweep
`assert-deduction-runs-out-only-on-unreasonable` ran to check whether a
player's own entries can drive a hint into `DEDUCTION_EXHAUSTED`. None did, but
Rome's hint **threw** on 16 of its calls, all from one board.

## Why

The player presses Hint and gets the crash dialog. `classifyPlacementInRegions`
(`src/engine/latin-hint.ts`) throws "placing 4 at cell 8 is neither a naked nor
a hidden single in the notes, so the plan skipped a strike it rests on". That
throw guards the plan against a real defect, and here it found a board where
the plan rests on a strike it never takes.

## What the cause was (2026-09-22)

**Not a restored note.** The scaffold's hypothesis was that the plan fails to
re-strike a note the player puts back after the hint struck it. A sweep
restoring on-grid notes at random, 2,689 of them across 240 boards and 12,459
hint calls, never threw: the recorder re-records any strike whose note is back.

**An off-grid note.** The reproducer's last move pencils *left* on square
(0, 2), which is in column 0. Upstream's `execute_move` accepts it, but
Rome's Mark-all fills `legalDirs` and the solver's cube starts there, so no
rung ever strikes that note, and the square's placement (right) is then
neither a naked nor a hidden single. Positive control: the same sweep
restoring off-grid notes instead threw 234 times in 2,046 calls.

## Is it Rome only?

Taken from the code rather than from the sweep's four boards per preset. The
defect shape is **a note on the board that no firing can strike**. That arises
two ways, and each has one member:

- **A note outside the game's Mark-all fill.** Only the games whose fill varies
  by square can have one: Rome (grid edge), Seismic (area size) and Salad (no
  "might be empty" on a circled square). Seismic already refuses at input.
  Salad's case is the next bullet.
- **A strike that exists only as a later leg of another firing.** A read of
  every game's legs found one: Salad's circle firing strikes its squares'
  "might be empty" notes as a second leg. A circle the player places, or one
  the hint places before the player goes their own way, kept its note for good.
  A sweep injecting circles found it throwing on two boards, one of them from
  hint moves alone.

## What changes

- **Rome refuses an off-grid note** on every way into notes, previews none on a
  drag, and masks one in `executeMove` so an old move log replays without it.
  Placing an off-grid arrow stays a move, which the board flags as an error.
  This follows Seismic's precedent of refusing a note its region could never
  hold, and costs a player nothing: the note meant nothing.
- **Salad's hint offers the tidy strike as its own rung** (`circledEmptyNotes`)
  whenever a circled square still notes "might be empty", with the sentence the
  leg already had. A wrong circle is a mistake the hint refuses on, so "now
  known to hold" is still a checked claim.
- Guides: `docs/games/mechanics.md` § "Pencil marks: the full note-taking UX"
  and `docs/games/hints.md` (the Rome `NoteEncoding.all` bullet, and a bullet on
  later-leg strikes under "Candidate-elimination games").

## What replaces the evidence

Both reproducers are pinned as the input the plan consumes, as moves on a desc,
never as seeds: `rome-hint.test.ts` and `salad-hint.test.ts`, each proved red
without its fix. The Salad sweep threw 2 times in 17,409 calls before and 0 in
17,828 after. That rate is too low for the count alone to argue the fix; the
argument is the code's: every circled square that still notes "might be empty"
now has a strike on offer.
