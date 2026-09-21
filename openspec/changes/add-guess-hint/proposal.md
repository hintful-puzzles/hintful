# add-guess-hint

**Status: scaffolded, not started.** Opened 2026-09-21 out of
`give-guess-element-keys`, with the code read that day. The first task is a
decision about **notation**, not code.

## Why

Guess is hintless, and the owner asked for this one to be opened now for a
reason that is not the usual one: the hint is expected to **pressure the input
model**, which is under review in the same breath (the drag-versus-keypad
question below). A deduction you cannot record is a deduction the player cannot
reproduce, and what Guess lets a player record is the shortest list in the
collection.

## Read the corpus audit's verdict first, and know why this is opened anyway

`characterize-the-hint-assessment-corpus` (2026-09-09) classifies Guess in
class **∅ — no solver at all**, alongside blackbox and flip, and says of that
class: *"A hint for any of them is the Inertia problem … **None of them tests
the framework's deduction contract**, which is what makes them the wrong picks
however cheap they look."*

**That verdict stands on its own terms and is not being overturned.** It answers
"which hintless game best assesses the framework?" — and the answer is still not
Guess. This change is opened against a *different* question, asked by the owner
on 2026-09-21: what the hint would have to teach may tell us what notation the
game needs, and that is an input to a live UX decision. Anyone picking a game to
press the framework with should still pick from the audit's table, not from
here.

## What was verified in the code (2026-09-21)

- **Guess declares no `hint()`**, so it is in none of the cross-game hint
  guards — enrollment is derived from the declaration
  (`src/engine/testing/hint-games.ts`), and that module already names *"Guess's
  unrelated `ui.hint`"* as the false positive a name-keyed scan would trip on.
- **It does have an upstream hint**, on `'h'`/`'H'`/`'?'`: `computeHint` in
  `src/games/guess/index.ts` fills the working row with the
  lexicographically-first combination consistent with every prior scored guess.
  In the Check/Tactic/Search vocabulary that is a **Search** — an odometer over
  the whole combination space, filtered by consistency. It can certify a row; it
  cannot teach one.
- **`'h'` is already spoken for, and that becomes a defect the day this ships.**
  The app's Hint command has the bare letter `h`, fired *only after the game
  declines the key* (`src/puzzle/shortcuts.ts`). Guess consumes `'h'` for
  `computeHint`, so today that costs nothing — there is no app hint to reach.
  Declare `Game.hint()` and there are two things called "hint" in one game, one
  of which fills the row by search, and the letter reaches the wrong one.
- **Guess has no difficulty tiers** (no `difficulty` contract), so the standard
  escape hatch — demote the tier that needs an unmanageable notation to
  `Unreasonable` and refuse there — **does not exist here**. That is the
  structural reason the notation question cannot be deferred.

## The shape of the problem: Guess is neither Palisade nor Inertia

The two exemplars bracket a spectrum this game sits off to one side of.

- Palisade: the board determines the answer, and the hint narrates a forced
  move.
- Inertia: nothing is deducible, and the hint plans.
- **Guess: the answer is hidden, and the two halves have different standards of
  proof.** Some facts *are* forced — an elimination follows from feedback with
  full rigor. The next *move* usually is not: a guess is a probe, and choosing a
  good one is an information question, not a deduction. A hint here has to be
  honest about which half it is speaking from, and the quality bar's rule 5
  ("claim only what you have checked") bites on the probe half.

## The question this exists to settle: what can a Guess player write down?

**Nothing, today.** A player can place a color in a slot, toggle a hold, and
toggle the digit labels. There is no way to record *"red is not in position 2"*
— which is the entire content of Mastermind reasoning. Under quality-bar rule 6
(**a hint relies only on marks the player can make**), a hint that narrates an
elimination is drawing a fact the player has no way to keep, which is precisely
what `add-loopy-notation` was made to stop
([`docs/games/hints.md`](../../docs/games/hints.md) § "Give the facts a
notation (Loopy)").

So the change is a notation change first and a hint second, and the notation is
the thing to design.

## What a single row honestly proves — derived, then checked exhaustively

Let `black(G)` be the correctly-placed count, `white(G)` the
right-color-wrong-place count, and `total(G) = black + white = Σ_c min(#G_c,
#S_c)`. Four one-step readings are sound, and **all four were brute-forced
against the real `markPegs` over every (solution, guess) pair at 4 colors × 4
pegs — 65,536 pairs, zero counterexamples** (2026-09-21). None is vacuous; the
fire counts are below.

| | Reading | Why | Fires |
| --- | --- | --- | --- |
| **A1** | `total = 0` ⇒ every color in `G` is absent | each term of `Σ_c min(#G_c,#S_c)` is 0, and `#G_c > 0` | 1,812 |
| **A2** | `total = npegs` ⇒ every color **not** in `G` is absent, and `#S_c ≤ #G_c` | `Σ_c #S_c = npegs` too, so the termwise `≤` is equality | 2,716 |
| **A3** | a monochrome row of `c` ⇒ `#S_c = total`, exactly | `min(npegs, #S_c) = #S_c` | 1,024 |
| **B** | `black = 0` ⇒ `S_i ≠ G_i` for **every** `i` | the definition of `black` | **20,736** |

**Rule B is the workhorse and it is the one with no Wordle analog.** It is
*positional*: one row scoring no blacks yields `npegs` eliminations at once, and
it fired on about a third of the pair space — an order of magnitude more often
than the three color-level rules together. (That rate is over the **uniform**
pair space, not over positions real play reaches; a player guesses
informatively, so treat it as evidence of which rule matters, not as an in-play
frequency.)

**Everything else attributes nothing.** A four-peg row scoring one black and one
white constrains four pegs *jointly* and pins nothing to any one of them. A
white count alone never attributes to a color or a position, and a black count
strictly between `0` and `npegs` never attributes to a position.

**This is the argument for per-slot marks over a per-color panel mark.** The
facts worth recording are overwhelmingly of the form *"not this color, here"*,
which a per-color strike cannot hold.

## Wordle is a live reference here, and its keyboard is the cheap half

The owner (2026-09-21) invited borrowing from NYT Wordle, which is this game
with letters. Wordle's on-screen keyboard **accumulates feedback color per
letter**, so the player's ruled-out notation is free and needs no marks placed.

**The mapping is not clean, and the table above says exactly where it breaks.**
Wordle's feedback is **addressed** — each tile carries its own verdict, so its
keyboard coloring is a pure transcription of something the player was already
shown. Guess's black and white pegs are **unordered and unattached**: the row
says "two are in the right place" and never which two.

So **there is no analog of green and none of yellow.** A per-color "correct
position" claim and a per-color "present but misplaced" claim are both
unobtainable from Mastermind scoring. The only part of the mapping that
survives is the *gray*, and even the gray fires only on rules A1–A3 — the three
that fired least. Upstream's `computeHint` already derives the narrowest of
them (`provenAbsent`, the A1 special case of a monochrome row scoring nothing).

Whatever the panel shows must be a fact the game has proven, or it is the
quality bar's rule 5 broken on the most visible surface in the app. **The safe
form of the idea is a strike the *player* places**, which is a notation, not a
derivation — and it is then subject to the same question as any other notation:
can it hold the facts the hint actually needs? Per the table, mostly it cannot.

## What a proposal here would have to settle

- **The notation.** Per-slot ruled-out colors (pencil marks, the collection's
  usual shape), a per-color "proven absent" mark on the panel (the Wordle
  shape), or both. They record different facts and only the first is strong
  enough for positional reasoning.
- **What acquiring notes drags in.** A `pencilMode` on the `Ui` enrolls Guess in
  the Marks key automatically (`takesNotes` reads the shape, and the engine
  appends the key), the new color keys would toggle marks in notes mode exactly
  as Map's do, and the pencil-mode indicator brings a geometry obligation
  (`pencil-indicator-placement.test.ts`;
  [`docs/games/input.md`](../../docs/games/input.md) § "Put a game's markable
  elements on the panel"). None of that is free, and all of it is already
  conventional.
- **What the hint says when nothing is forced**, which will be most of the game.
  Refusing is honest but nearly always; narrating a probe means claiming
  something about a move that is not forced. Inertia is the precedent for
  leading with the one thing the game *can* prove.
- **What happens to `computeHint` and to `'h'`.** Keep it as a separate "fill a
  consistent row" affordance under another key, fold it into the hint's last
  resort, or retire it.
- **Whether the deduction wants an engine.** The collection's doctrine is one
  narratable deduction engine per logic game, with solver and hint as two
  projections. Guess has no solver at all, so this would be built rather than
  projected — which is the audit's point, and the cost to go in with eyes open.

## Its bearing on the input model, which is the reason for the timing

The UX question in flight — whether to retire drag entry, and whether a full row
should auto-submit — touches this directly:

- If the answer to notation is **per-slot marks**, Guess gains a notes mode, and
  the keypad becomes the primary surface for two jobs rather than one. That
  strengthens the case for the panel and weakens the drag further.
- **Auto-submit and hints are in tension.** A hint is taken against the row you
  are building; a row that submits itself on its last peg removes the moment
  the hint would be read.
- If the answer is the **Wordle-style panel mark**, the panel acquires state the
  board does not have, and the two surfaces stop being two spellings of one
  keypress — which is the property the panel's focus rule rests on.

Settle the input model first, or settle it knowing this is coming.
