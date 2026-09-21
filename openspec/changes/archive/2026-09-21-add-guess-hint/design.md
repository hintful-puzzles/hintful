# add-guess-hint — design

The proposal left five questions open (tasks §1). This records how each was
answered, and the two input limitations `compose-guess-rows-without-dragging`
shipped with, which the owner asked to have fixed in the same change
(2026-09-21):

1. With the keypad turned off there was no pointer-only way to enter a peg.
2. `CURSOR_SELECT` (Enter) only submitted; on a peg it was declined.

Both turn out to be answered by the notation, which is why they belong here.

## D1. The notation is per-slot rule-outs, kept in an **answer row**

The proposal's table settled the *kind* of mark: the facts a single row proves
are overwhelmingly "not this color, in this slot", and a per-color strike cannot
hold them. What was left was where the marks live.

**They live in the answer row** — the strip below the guess rows where upstream
drew a blank box over the hidden combination. Each of its `npegs` slots shows a
dot for every color: filled while the color could still be there, hollow (drawn
in its own color, on the slot's background) once ruled out. The box was already
the thing being deduced, one slot per peg of the answer; it now shows what the
player knows about each slot, and the reveal still replaces it at the end.

- **Not on the working row's empty slots**, the other obvious home. The working
  row moves down a line on every submit and its slots fill as the player types,
  so the marks would be hidden exactly when a row is being composed against
  them.
- **Hollow rather than removed.** A removed dot leaves a gap whose color the
  player has to remember; a hollow one keeps every color where it was learned,
  and keeps each dot a tap target (D3).
- **State, not `Ui`.** A mark is a move (`{ type: "mark", marks, ruledOut }`),
  so it undoes, replays from the log, and a hint step can place it. The move
  *sets* each mark rather than toggling it, so a hint's step is idempotent and
  the player's toggle is decided in `interpretMove`, which knows the current
  mark.
- **Named `ruledOut`, not `pencil`.** `pencil` is the collection's word for a
  candidate set, and a slot with no marks here means "every color possible" — the
  complement. `note-vocabulary.test.ts` forbids only the retired spellings, and
  the Marks key is derived from `ui.pencilMode`, so nothing keys on the name.

`changedState` had to change with it. It rebuilt the working row from the holds
after **every** transition, which would have thrown the half-composed row away
on every mark; it now rebuilds only when the row being played changes (`nextGo`
or `solved` differs).

**No mistake check.** The answer is hidden information, and flagging a mark that
contradicts it would tell the player something the rows have not. A mark the
rows do not justify is a hypothesis, not an error. So Guess still declares no
`findMistakes`, and the hint does not read the player's marks as premises (D4).

## D2. The input model around it

- **Notes mode** is `ui.pencilMode`, which is all it takes for the engine to add
  the Marks key and the pencil indicator (`takesNotes`). In notes mode a color
  key rules that color out of the cursor's answer slot, Clear puts every color
  back in it, and the cursor ring moves to the answer row — the place the next
  keypress will change. The submit position drops out of the cursor's range in
  notes mode, because it is not a slot.
- **Enter on a slot toggles notes mode.** That is what Enter on the highlight
  does in every note-taking cell game (`toggleNoteTakingMode`), so the key gets
  its meaning back from the collection rather than from a new invention. Enter
  on the submit position still submits. *This answers limitation 2.*
- **The indicator fits in the existing border.** Guess's border is half a tile,
  which is the reach `pencilIndicatorBox` needs;
  `pencil-indicator-placement.test.ts` passes with no geometry change.

## D3. A tap on a dot enters that color, in that column

In normal mode a tap on an answer-row dot **enters that color in the same column
of the working row**. With notes mode on, the same tap rules it out. A
right-click or held finger on a dot rules it out in either mode, which is the
way to mark with no keypad and no mode to switch into; its release does nothing
more.

*This answers limitation 1*: with the keypad off, the pointer can compose a row
(tap dots), hold a peg (long-press it), mark (long-press a dot) and submit (tap
the feedback). And it resolves the fault line `docs/games/input.md` recorded
when the palette column was deleted — that a second color surface would become
"a palette that cannot show what has been ruled out". This one *is* the
notation, so it cannot disagree with it, and each dot sits in the column it
enters, which the old column could not do.

**Why this is not the palette column come back.** The column was a second
spelling of the keypad, a quarter of the board's width, and bought no
capability. The answer row costs no width (it was already there), shows state
nothing else shows, and gives the keypad-off player the entry they had lost.

**The price is target size.** A dot's hit area is its whole grid cell — at six
colors a third of a tile across and half a tile high. Verified in the browser
(tasks §3.3); the keypad remains the primary way in, and nothing that worked
before now needs a small target.

## D4. The hint: what the rows prove, then a probe

The two halves have different standards of proof, and the plan keeps them apart.

### The deductions are marks

Seven readings, each brute-forced against every answer the rows allow
(`guess-hint.test.ts`, six parameter sets × 300 random games): a mark is sound
iff no answer that fits every row has that color in that slot. Six read one
scored row plus the marks the hint itself proved earlier, and `noRepeats` reads
one fixed slot; they are tried easiest first:

| Reason | Reads | Proves |
| --- | --- | --- |
| `scoredNothing` | a row scoring 0 | its colors are nowhere |
| `noBlack` | a row with no blacks | each color is not where it stood |
| `everyPegScored` | a row scoring every peg | no other color is anywhere |
| `noRepeats` | a slot fixed to one color, repeats off | that color is in no other slot |
| `blacksForced` | as many open pegs as blacks | each open peg is right |
| `blacksAccounted` | fixed slots already match every black | the other pegs are all misplaced |
| `totalAccounted` | fixed slots already account for the whole score | the row's colors are nowhere else |

(`open`: the slot can still hold the color the row put there. `fixed`: the slot
can hold one color only.) The last two generalize `noBlack` and
`scoredNothing` to a board with fixed slots; the proofs are in `hint.ts`.

**One reading was written and deleted.** A row of one color scoring `t` says the
answer holds exactly `t` of it, so if only `t` slots can hold it, they all do.
The census found it never fired, and the reason is arithmetic: a one-color row's
blacks *are* that count, so `blacksForced` (earlier in the order) is the same
rule. The census is kept as a `Record<kind, true>` so a new reason cannot be
added without being counted.

**Every rule is shown to a player in real play, measured** (2026-09-21): the
steps a hint shows, recomputed after each one, over 1,296 hint-followed games of
Standard and 1,296 of Standard without repeats — `noBlack` 1,139 / 1,738,
`scoredNothing` 379 / 0, `everyPegScored` 295 / 625, `noRepeats` — / 557,
`blacksForced` 221 / 266, `totalAccounted` 158 / 16, `blacksAccounted` 105 / 77,
against 5,847 / 5,273 probes. So roughly one hint in four teaches a mark.

**The hint does not read the player's marks as premises.** It re-derives its own
from the rows, places what the board lacks, and skips what the player has
already marked (`docs/games/hints.md` § "Show only what the board does not
already say"). That is the Dominosa shape rather than Seismic's, and for the
reason D1 gives: nothing can vouch for a Guess mark without leaking the answer.

### The probe is counted, not argued

When nothing more follows, the plan ends with a guess. The sentence claims only
what `chooseProbe` counted, and `guess-hint.test.ts` recounts both numbers from
scratch:

- the guess **fits every score so far** — so it could win outright;
- **how many answers still fit**, and **the most the guess can leave**, whatever
  it scores.

The guess is the one leaving the fewest behind when at most 1,500 answers fit
(a square-cost choice), else the first that fits; the first guess of a game with
repeats is a fixed spread (`1122`, `11223`), since every answer fits and
unguessed colors are interchangeable. Measured before choosing
(2026-09-21, a scratch harness over every Standard answer and 2,048 Super ones),
the rows a hint-following player needs:

| Strategy | Standard (limit 10) | Super (limit 12) |
| --- | --- | --- |
| first answer that fits (upstream's `computeHint`) | max 9, mean 5.76 | max 11, mean 7.12 |
| fewest-left among ≤ 1,500, spread opening | max 6, mean 4.50 | max 8, mean 5.83 |

Upstream's row-filler came within one row of losing on both presets; the chosen
strategy has four spare. `guess-hint.test.ts` walks every Standard answer to
hold it.

**It is a pure function of the scored rows**, so recomputing after a mark, a
toggle or anything but a guess names the same guess — the recompute-stability
property `hint-resume.test.ts` walks.

### No refusal on a sound board

Guess has no difficulty contract, so the tier escape (§1.2) does not exist and
`hint-resume.test.ts` accepts no refusal at all. None is needed: the probe
always exists, because the hidden answer fits. The only refusal is the shared
"already solved" once the game is over. A huge Custom board could exhaust the
enumeration's node budget before finding an answer; that returns the marks alone,
or `SEARCH_OUT_OF_REACH` when there are none, and is unreachable on the presets.

## D5. The `'h'` key and upstream's `computeHint`

**Retired.** Guess consumed `'h'`, `'H'` and `'?'` for upstream's row-filler,
which with `Game.hint()` declared would have been a second thing called "hint"
answering the app's bare `h` first (`shortcuts.test.ts` ledgered it). The probe
step does the row-filler's job better — a consistent guess, chosen, with its
counts — and a player who wants the row filled for them presses Hint and then
Apply. `ui.hint`, the filler's cursor, is gone with it.

## D6. The corpus audit's verdict

Unchanged and not overturned: Guess is class ∅ and a poor assessment of the
framework's deduction contract (tasks §1.5). This change was taken for the
owner's UX question, and what it assessed was different: that rule 6 ("a hint
relies only on marks the player can make") can drive an input redesign, and
that a hint can be honest about the half of itself that is not deduction.

## What replaces the absent oracle

There is no solver, so there was nothing to project from and no byte-parity to
lose. The assurances are the three brute-force properties in
`guess-hint.test.ts` (mark soundness over the whole answer space, the probe's
counts, the hint-followed win over every Standard answer) and the cross-game
hint guards the declaration enrolls Guess in.
