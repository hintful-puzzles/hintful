# Guess input model — remainder of the UX report

Sections §3, Q2, §4, §5. Written to a file because the message channel was
truncating. Nothing here repeats the drag verdict, conditions 1–3, Q1, or
verdict 2 on auto-submit, all of which you have in full.

**Reading conventions used throughout:**

- **Reporting** — verified against code in this session, with a `file:line`
  citation. Safe to state as a finding in an openspec change.
- **Reasoning** — a conclusion I derived rather than observed. Marked inline
  with *(reasoning)*. Do not write these as findings without saying whose
  reasoning they are.
- **Memory** — any statement about NYT Wordle. I did not fetch or read a
  source; a fetch would return markup, not behavior. Every such statement is
  marked *(Wordle, from memory)*. My confidence is high on all of them, but
  they should be confirmed on a device before a spec leans on one.

---

## §3 — What the owner's premise gets right and wrong

The premise was: *"the drag approach never felt right to me, as it's not
something players would encounter in other games."*

### Wrong as stated

**Drag is common in this collection — 27 of the 57 games.**

Measured by `grep -rlE "LEFT_DRAG|isMouseDrag" src/games/`, deduplicated to one
entry per game directory: ascent (in `ui.ts`), boats, bricks, bridges, clusters,
filling, galaxies, group, guess, inertia, loopy, map, mines, mosaic, pattern,
pearl, pegs, rect, rome, signpost, sixteen, slide, spokes, sticks, tents,
tracks, untangle. `ls src/games` lists 58 entries, one of which is `index.ts`,
so the denominator is 57.

A player moving through this collection will encounter dragging constantly. The
sentence as written is not supportable, and a change proposal that repeats it
will be contradicted by the first person who greps.

### Right in substance, and sharper than the wording

**The *palette-to-slot token drag* is unique to Guess.** The distinction that
actually holds is not "drag vs no drag" but *what the gesture carries*:

- **Path drags** — the gesture's meaning *is* the path, extent or axis, and no
  single tap could express it. Clusters and Bricks accrete a set of cells
  (`docs/games/input.md` § "The accreting-paint drag"); Boats fills a row or
  column with a `from → to` transformation; Pattern and Rect rubber-band a
  rectangle; Tents paints as it traverses; Inertia's swipe picks an octant.
- **Piece drags** — the thing being dragged is already on the board and its
  *position is the state*. Pegs jumps a peg, Signpost links a cell, Untangle
  moves a vertex, Slide and Sixteen push a block or a row.
- **Token transport** — pick a *value* out of a legend and carry it to a slot.
  Only two games carry a `dragColor` at all: Guess and Map
  (`grep -rln "dragColor" src/games/`). **Map has no palette** — its drag source
  is a region that already wears the color, so the gesture is "copy this
  region's color to that one" (`src/games/map/index.ts:94-98`).

So Guess is the only game in the collection where a player picks a value out of
a legend and carries it to a destination. *(Reasoning: the three-way
classification is mine; the two-game `dragColor` population and Map's source
semantics are reported.)*

**And Guess's drag carries exactly one bit of information — which color.** That
is the crux. A drag whose entire payload is reproducible by a button press is
the one kind of drag that is pure cost, because the panel now delivers the same
bit in one tap. *(Reasoning.)*

### Also right, and mechanically caused — it is not only a touch problem

The owner's instinct that it "never felt right" has a cause visible on a mouse:

**A tap on the palette column hides the keyboard cursor.** Press over the
column arms `ui.dragColor` and returns `UI_UPDATE`
(`src/games/guess/index.ts:227-250`). The release does not land on a current-row
peg, so it falls through to the drop-away arm, which clears nothing (there is no
source peg) and sets `ui.cursor.visible = false`
(`src/games/guess/index.ts:275-282`).

The consequence is that the most natural touch model — *tap a color, then tap a
slot* — not only fails to place anything, it takes away the very thing the new
panel acts on. The board's palette column and the on-screen panel are two input
models pointed at each other. *(Reported from the code path; I did not drive it
through a Midend. It is cheap to confirm and it is argument (b) of the drag
verdict, so confirm it before the proposal states it.)*

### What Wordle adds to the premise

*(Wordle, from memory.)* Wordle has no drag, no on-board palette, and nothing to
aim at: entry is an on-screen keyboard plus the physical one.

This strengthens the premise's *spirit* well past what its wording claimed.
Guess is the one game in this collection where players arrive with a **trained
expectation** for the mechanic, because Wordle is Mastermind with letters and is
the most widely played instance of the mechanic in the world. Guess currently
violates that expectation in the one place it exists. *(Reasoning, resting on
the memory claim above.)*

---

## Q2 — Should the panel keys carry accumulated feedback?

**Headline: only the player may put feedback on the keys. It must never be
derived by the game.**

*(Wordle, from memory: its keyboard keys accumulate a per-letter color —
correct / present-elsewhere / absent — so the keyboard doubles as the player's
ruled-out notation with no marks to place. The one detail I am least sure of is
how NYT colors a key when the same letter is simultaneously correct in one
position and a surplus duplicate elsewhere in the same guess; I believe the key
takes the best status. Nothing below rests on that detail.)*

### The one-sentence statement of the gap

**Wordle gives `npegs` addressed verdicts per row. Guess gives two integers.**

Wordle's feedback is *addressed*: each tile carries its own verdict, so its
keyboard coloring is a pure **transcription** of something the player was
already shown. Guess's feedback is a pair of counts over the whole row, and the
black and white pegs are **unordered and unattached** — the row says "two are in
the right place" and never which two. A Guess equivalent of the Wordle keyboard
would therefore not be a transcription; it would be an **inference engine**.
*(Reasoning; the unordered-and-unattached property is reported — see the
feedback construction below.)*

### The scoring, as this port implements it

Reported from `src/games/guess/state.ts:203-230` (`markPegs`, mirroring
upstream's `mark_pegs`):

- `ncPlace = #{ i : pegs[i] === solution[i] }` — the black count.
- `ncColor = Σ_{c=1..ncolors} min(#guess_c, #solution_c) − ncPlace` — the white
  count.
- The returned `feedback` row is filled with `ncPlace` copies of
  `FEEDBACK_CORRECTPLACE` followed by `ncColor` copies of
  `FEEDBACK_CORRECTCOLOR`, **from index 0**, rest zero.

That last line is the structural fact that matters: **the feedback array's
indices have nothing to do with peg positions.** Blacks are packed at the front
regardless of which positions produced them. The renderer draws them as two
short rows of small circles (`src/games/guess/render.ts`, `hintRedraw`), which
is the correct presentation of an unordered multiset. There is no channel,
anywhere, by which a verdict reaches a particular peg or a particular color.

### Notation for the derivation

Write, for a guess row `G` and the hidden solution `S`, both of length `npegs`:

- `#G_c` = the number of pegs of color `c` in `G`; `#S_c` likewise in `S`.
- `black(G) = #{ i : G_i = S_i }`
- `white(G) = Σ_c min(#G_c, #S_c) − black(G)`
- **`total(G) = black(G) + white(G) = Σ_c min(#G_c, #S_c)`**

The last identity is the whole toolkit: the only aggregate the player is handed
is a sum of per-color *minima*, plus the black count. *(Reporting — it is
`markPegs` rearranged.)*

Two standing identities used below:

- `Σ_c #S_c = npegs` (the solution fills every peg; `allowBlank` affects only
  what the *player* may submit, not the solution — `newDesc` always draws a
  color in `1..ncolors` for every peg, `src/games/guess/state.ts:234-247`).
- `min(#G_c, #S_c) ≤ #S_c` for every `c`, termwise.

### What Guess CAN honestly prove about a color, from a single row

*(The three rules are reasoning — my derivations — but each is a two-line proof
from the identities above, and rule A1 is independently corroborated by upstream
having implemented exactly its zero case.)*

**Rule A1 — a zero row proves absence.**
If `total(G) = 0` then `Σ_c min(#G_c, #S_c) = 0`, so every term is zero, so for
every color `c` appearing in `G` (where `#G_c > 0`) we have `#S_c = 0`.

> **Every color in a row that scores nothing at all is absent from the
> solution.**

Sound, single-row, and a player can read it straight off the board without
enumeration. **It is not a rare case at the default params:** standard Guess is
6 colors and 4 pegs (`src/games/guess/state.ts:111-120`), so an opening guess of
four distinct colors scoring nothing eliminates four of the six at once.

Upstream implements the special case of this where the row is monochrome:
`provenAbsent` in `computeHint` tests `!g.feedback[0] && g.pegs.every(v => v === c)`
(`src/games/guess/index.ts:121-122`). **The general form above is strictly
stronger and equally sound** — upstream's version only fires on a row made
entirely of one color, which a player would rarely play. *(Reasoning: that
upstream's test is a strict special case of rule A1.)*

**Rule A2 — a full-scoring row proves absence of everything outside it.**
If `total(G) = npegs`, then since `Σ_c #S_c = npegs` and
`min(#G_c, #S_c) ≤ #S_c` termwise, equality of the sums forces equality of every
term: `min(#G_c, #S_c) = #S_c` for all `c`, i.e. **`#S_c ≤ #G_c` for every
color**. In particular, for any color `c` *not* in `G`, `#G_c = 0` so
`#S_c = 0`.

> **If a row scores the maximum, the solution is built only from that row's
> colors, and no color appears in the solution more often than it appeared in
> the row.**

Sound, single-row.

**Rule A3 — a monochrome row counts a color exactly.**
For a row that is entirely color `c`, `total = min(npegs, #S_c) = #S_c` (since
`#S_c ≤ npegs`).

> **A row of all one color reports exactly how many of that color the solution
> contains.**

Sound, single-row. Rarely worth a guess in play, but it is the rule upstream
leaned on.

### What Guess CANNOT prove about a color

**Everything else attributes nothing to any individual color.**

- A four-peg row scoring `black = 1, white = 1` says something about four pegs
  *jointly* and pins nothing to any of them. There is no color in that row about
  which you may state a fact.
- **The white count never attributes.** It is a sum of minima minus a sum of
  matches; no term of it is observable separately.
- **There is no analog of Wordle's yellow** — "this color is present but
  misplaced" is a per-item claim, and Guess's whites are a count over the row.
- **There is no analog of Wordle's green at all.** "This color is in this
  position" is a positional claim about a color, and the black count never says
  which positions produced it (see the `markPegs` packing above).

> **The clean part of the Wordle mapping is one third of it, and it is the
> gray — and even the gray only fires on rules A1 and A2.**

*(Reasoning; rests on the reported `markPegs` structure.)*

### Slot-level facts, which the Wordle analogy hides and which matter more

This did not come up in your questions, but it is the single most useful thing I
found for `add-guess-hint`, so it belongs here.

**Rule B — a row with no blacks eliminates each color from its own position.**
If `black(G) = 0` then by definition `#{ i : G_i = S_i } = 0`, so for **every**
position `i`, `S_i ≠ G_i`.

> **A row that scores no black pegs proves, for each position, that the color
> you put there is not the color that belongs there.**

Sound, single-row, trivially verifiable by the player — and it yields **`npegs`
positional eliminations from one guess**. Any row scoring only whites, or
scoring nothing at all, is this case. *(Reasoning.)*

Three consequences, all reasoning:

1. **Per-slot marks subsume per-color marks; the converse is false.** "Color `c`
   is absent" is expressible as "eliminated from every position" — `npegs` marks
   instead of one. But a per-color strike cannot hold *"red is not in position
   2"*, which is the entire content of Mastermind reasoning, and which
   `add-guess-hint` already identifies as the thing a player can currently not
   record at all.
2. **The stronger notation has the cheaper deduction behind it.** Rule B needs no
   enumeration and no solver — it is a single comparison against zero. I did not
   expect this before working the algebra, and I think it **inverts the "do the
   cheap Wordle half first" instinct**: the per-color strike is the weak
   notation *and* the one whose honest rules (A1/A2) fire less often.
3. **One mechanism serves both scopes, and it needs the cursor I argued to
   keep.** In Marks mode: a color key **with a slot selected** eliminates that
   color *from that slot*; **with no slot selected** it strikes the color
   *globally*. One key, two scopes, both explicit, no hidden state — and the
   global strike is exactly the Wordle-keyboard ergonomic, reached without any
   derived claim.

Costs to budget for, flagged rather than costed: rendering up to `ncolors`
eliminations inside a one-tile circular peg (the digit games draw up to nine
pencil marks per cell so it is feasible, but Guess's peg is a circle and the
layout is tight — `src/games/guess/render.ts`, `drawPeg`), and the fact that
acquiring a `pencilMode` enrolls Guess in the Marks key automatically and brings
the pencil-indicator geometry obligation (`docs/games/input.md` § "Put a game's
markable elements on the panel"; `add-guess-hint`'s proposal already lists
this).

### What a panel showing more than the above would be claiming

Anything richer is obtainable. The machinery already exists: `computeHint`
enumerates candidate combinations odometer-style and tests each against every
prior row's recorded feedback (`src/games/guess/index.ts:109-160`, with the
consistency test at `:127-135`). Running that to exhaustion answers "does any
consistent combination use red?" exactly.

But a key grayed on that basis is claiming something categorically different
from a key grayed on rule A1:

- **Rule A1's claim is a reading.** "You played these four colors, the row
  scored nothing, therefore none of them is in the answer." The player can
  perform it, check it, and — crucially — *learn it*.
- **The propagation claim is a solver's verdict.** "Across all 1,296 (standard)
  or 32,768 (Super) combinations, none that fits your feedback contains red."
  The player cannot perform it, cannot check it, and learns nothing from it
  except to trust the machine.

**Why that breaks quality-bar rule 5.** Rule 5 is *"claim only what you have
checked"*, and the derived gray does not fail it on soundness — the propagation
is correct. It fails it on the second half, the part about a hint being a
**claim the player is entitled to interrogate**: the panel would be asserting a
fact whose justification is nowhere on the board and nowhere in anything the
player can reproduce. A claim the player cannot audit is exactly the shape rule
5 exists to catch, and AGENTS.md's framing of it — *"if it isn't verified in
code, it is a lie waiting to be read by a player who trusts it"* — has a mirror
image here: a claim that *is* verified in code but unverifiable by the player is
a truth the player can only take on faith. *(Reasoning about which rule bites;
the rule text is reported from AGENTS.md § "Hint quality bar".)*

**It also breaks rule 6 outright, which is the cleaner objection.** Rule 6: *a
hint relies only on marks the player can make*, and *never ship a hint-only
overlay of facts the player has no way to record, however clearly it draws
them.* A derived gray on the panel is precisely such an overlay — it is a
permanent, always-on one rather than a hint-time one, which makes it worse
rather than better. This is the `add-loopy-notation` case exactly: the answer
there was to **give the player the notation**, not to draw the conclusion.

**Three further objections, in descending force:**

1. **It is a free solver.** Auto-graying on propagation hands the player most of
   the elimination work of Mastermind, continuously, unasked, with no way to
   decline it. That is not an aid, it is a difficulty change applied to every
   board. *(Reasoning.)*
2. **It contradicts the only aid doctrine written down in the tree.** The
   collection's one existing aid panel defines its own status field as *"derived
   purely from the player's own placements"* (`src/engine/types.ts:227-236`,
   the `ReferenceItem` doc comment). That sentence is already the answer to this
   question; I did not have to invent a principle. *(Reported.)*
3. **It is unbounded in Custom params.** `validateParams` caps `ncolors` at 10
   and requires `npegs >= 2`, but sets **no upper bound on `npegs`**
   (`src/games/guess/state.ts:161-169`). So `ncolors^npegs` has no bound, and a
   propagation-backed panel would need a cap and a "we could not decide"
   rendering — which is itself a fact the player cannot interpret.
   *(Reported: the missing ceiling. Reasoning: the consequence.)*

### Why "only the player may put it there" follows

Put the three together and the conclusion is forced rather than chosen
*(reasoning)*:

- The **honest** derivations (A1, A2, A3, B) are all single-row readings the
  player can perform. If the panel showed only those, it would be doing the
  player's arithmetic for them — a smaller sin, but still the game noticing
  things on the player's behalf, and still unasked.
- The **useful** derivation is propagation, and that one the player cannot
  perform at all, so displaying it is rule 6's prohibited overlay.
- The collection's own doctrine for an aid panel is already
  "the player's own placements".

So the notation must be **player-placed**. The player strikes a key when *they*
have concluded the color is out. The game records it, renders it, saves it, and
— this is the payoff — a future `hint()` may then **narrate a deduction that
rests on it**, because the mark is a fact the player put there and can
reproduce.

**What that implies for a player-placed per-color strike-out, concretely:**

- **It delivers the Wordle ergonomic honestly.** The keyboard doubles as the
  ruled-out list; what changes is only *who decides*. *(Wordle comparison from
  memory.)*
- **It is a `Ui` array, and it must be saved.** Guess implements no `encodeUi` /
  `decodeUi` today (the hooks are `src/engine/game.ts:594-595`; neither appears
  anywhere in `src/games/guess/`). A notation that vanishes on save/restore is
  worse than none, so the strike-out **forces** the `encodeUi` work — which is
  already owed for the half-composed row (see §4). Those two should land in one
  change. *(Reported: the absent hooks. Reasoning: that the notation forces the
  work.)*
- **It should not be the only notation.** Per rule B's consequence (1) above,
  per-slot marks subsume it. If only one ships, ship per-slot; if both, the
  two-scope key mechanism above gives them one control.
- **It changes the panel's nature**, which has a knock-on — see the revised
  condition 2 immediately below. `add-guess-hint`'s proposal already spotted
  this: *"the panel acquires state the board does not have, and the two surfaces
  stop being two spellings of one keypress."*

### Revised condition 2 — when to delete the palette column instead of converting it

My original condition 2 was: keep the board's palette column but convert it from
a drag source to **tap-to-place** (a tap on column color `c` does exactly what
panel key `c` does — `setPeg` at the cursor, then advance). That is *not*
tap-to-**arm**, which the `give-guess-element-keys` spec rejected for good
reason: arming would give a slot tap two meanings depending on state the player
cannot see. Tap-to-place has no armed state and leaves a slot tap meaning
"select".

**The condition that flips this is the notation.**

> **If a player-placed strike-out (or any player notation) ships on the panel,
> delete the board's palette column. If no notation ships, keep the column and
> convert it to tap-to-place.**

The reasoning *(reasoning throughout)*:

- Tap-to-place works only because the column and the panel are then **two
  spellings of one keypress** — the same action, available in two places, with
  no state of their own. That equivalence is what makes having both harmless.
- A notation breaks the equivalence. The moment a panel key can be struck
  through, the panel carries the player's marks and the column does not. You
  then have **two palettes, only one of which shows what the player has ruled
  out** — a player glancing at the column sees an unstruck red and a panel that
  says red is out.
- Duplicating the strike onto the column is not a fix: it doubles the marking
  surface, needs its own gesture (there is no Marks mode on the board), and
  re-opens exactly the two-meanings-per-tap problem the spec closed.
- So the column would become a *worse* inconsistency than the one this whole
  exercise exists to remove. Deleting it is the coherent answer.

**What deleting costs, and what it buys:**

- **Cost — the `showPuzzleKeyboard: false` player.** That is a real player
  setting, default true (`src/store/settings.ts:295-296`), and with both the
  column and the drag gone a touch player who turned the panel off has no way to
  enter a peg at all. *(Reported: the setting and its default. The mitigation —
  that the five digit games are already in this position because they have no
  pointer entry either — is **reasoning I did not verify**; drive one of Solo /
  Keen / Towers / Unequal / Filling with the panel off before the proposal
  states it.)*
- **Cost — the legend.** The column is also where a player reads
  color ↔ digit, especially with `'l'` labels on. The panel keys are painted in
  the colors (`KeyLabel.swatch`) *and* labeled with the digit they send, so the
  panel is arguably the better legend; this cost is small. *(Reported: the
  swatch+label design, from `requestKeys` and its doc comment,
  `src/games/guess/index.ts:164-177`.)*
- **Buy — board width.** `computeSize`'s horizontal multiplier is
  `BORDER*2 + 2 + npegs + PEG_GAP*npegs + PEG_HINT*hintw + PEG_GAP*(hintw-1)`
  (`src/games/guess/render.ts:78-90`). The literal `2` is the palette column
  plus its gap. At standard params that total is ≈ 8.15 tile-widths, so the
  column is ≈ 25% of the board's width — on a phone, meaningfully larger pegs.
  *(Reported: the formula. Reasoning: the arithmetic and the "larger pegs"
  conclusion; it is a calculation, not a browser measurement.)*
- **Buy — one palette, one place, one set of marks.** Which is the actual goal.

---

## §4 — Migration cost and risks

### What a player with a saved game notices: nothing

**Guess implements no `encodeUi` / `decodeUi`.** The hooks exist on the `Game`
interface (`src/engine/game.ts:594-595`) and neither name appears anywhere in
`src/games/guess/`. A Guess save therefore carries only the move log; the state
that is replayed from it is `guesses`, `holds`, `solution`, `nextGo`, `solved`
(`src/games/guess/state.ts:41-55`), and the working row is rebuilt from the
holds by `changedState` on load (`src/games/guess/index.ts:80-91`).

Every drag field — `dragColor`, `dragX`, `dragY`, `dragOpeg`
(`src/games/guess/state.ts:76-81`) — is purely transient. **Removing them is
invisible to every existing save.** There is no format change here, nothing to
raise with the owner as a compatibility break, and nothing that needs a
migration. *(Reported.)*

Note the flip side, which is a defect rather than a risk: because there is no
`encodeUi`, **a half-composed row is already lost on save/restore today**, along
with any hold the player set but has not yet submitted. See the shortfalls
below.

### Code to remove

- Four `Ui` fields (`src/games/guess/state.ts:76-81`).
- Three press arms and two release arms in `interpretMove`
  (`src/games/guess/index.ts:227-282`): the palette-column press, the
  current-row-peg pick-up, the past-row-peg pick-up, the `LEFT_DRAG` tracker,
  and the drop-away-clears release. The tap-to-select release arm
  (`:256-274`) **stays** and becomes the only pointer arm on a slot.
- The blitter sprite in `src/games/guess/render.ts`: the `blitPeg` /
  `dragColor` / `blitOx` / `blitOy` draw-state fields, the `blitterNew` /
  `blitterSave` / `blitterLoad` calls in `redraw`, and the `moving` branch of
  `drawPeg`.
- Guess then stops being a `blitterNew` caller, leaving Pegs, Signpost, Map,
  Inertia and Spokes (`grep -rln "blitterNew" src/games/`, excluding test
  files). *(Reported.)*

### Spec work

Drag is named in three places in `openspec/specs/guess/spec.md`:

1. the capability **Purpose** ("…and drag, hold, keyboard and hint input");
2. the requirement heading **"Guess accepts drag, hold, keyboard, and hint
   input"**, whose body mandates the gesture in its first sentence;
3. a paragraph inside the newest requirement ("Guess offers one key per color,
   and a tap selects a peg") saying drag "SHALL continue to work unchanged and
   SHALL leave no keyboard cursor behind".

Per AGENTS.md § "Retiring a scenario takes `REMOVED` plus `ADDED`, never a
`MODIFIED` that quietly keeps its heading": (2) must be a `REMOVED` of the whole
requirement with its reason and migration, plus an `ADDED` of a replacement
under a **new name** carrying the scenarios that survive — "Submit is only
offered for a markable row", "The hint key fills a consistent row" and "Holds
carry pegs to the next guess" all survive unchanged. (3) is an ordinary
`MODIFIED` of a requirement whose other scenarios must be reproduced in full.

Two traps from AGENTS.md that apply directly here: **check every `REMOVED` and
`MODIFIED` heading against the live spec as a whole line (`rg -F -x`)** — a
heading that matches nothing is not an error, it warns and publishes the old
requirement alongside its replacement; and **grep the live spec for the sentence
you mean to change** before writing a `MODIFIED`, because drag is asserted in
two different requirements and a delta faithful to the wrong one passes every
check. *(Reported: the three spec locations and the AGENTS.md rules.)*

### Tests to retire or rewrite

- `src/games/guess/guess.test.ts:381` — "dragging a color onto a slot still
  places it".
- `src/games/guess/guess.test.ts:396` — "dragging a peg out of the row still
  clears it".

Both are direct assertions of the retired gesture. The second one's *behavior*
needs a replacement test against whatever clears a peg instead (select + Clear,
or Backspace-last). *(Reported.)*

### Risks

- **No touch evidence exists for either model.** Nobody has held this game in a
  hand; `openspec/changes/test-touch-on-a-real-device` is open and blocked on
  deployment. Every touch argument in this report — mine and the archived
  change's — is reasoning from the frontend's promotion logic, not observation.
- **The long-press trap is real but the drag is fixable**, which weakens the
  strongest-sounding argument for retirement. Guess handles no `RIGHT_DRAG` /
  `RIGHT_RELEASE` anywhere, and its `RIGHT_BUTTON` arm returns `null` unless the
  press is over a current-row peg (`src/games/guess/index.ts:283-289`). Keying
  the drag off the button class — the third resolution in
  `docs/games/input.md` § "A touch hold arrives as the right button", as Boats
  and Map do — would make the palette and past-row drags survive a 350 ms hold
  while leaving the hold toggle on the current row untouched. Roughly ten lines.
  **So retire the drag for redundancy and inconsistency, not for
  unfixability** — a proposal resting on "it cannot be made to work on touch"
  will not survive review. *(Reported: the absent arms and the doc's
  resolution. Reasoning: the ten-line estimate and that it would work.)*
- **A 350 ms hold over the feedback strip also drops the submit.** Same cause:
  the press returns `null`, the release arrives as `RIGHT_RELEASE`, and the
  submit arm tests `LEFT_RELEASE` (`src/games/guess/index.ts:290-294`). A panel
  Submit key sidesteps this entirely. *(Reported from the code plus the view's
  promotion mapping at `src/puzzle/components/view-interactive.ts:283-290`; not
  driven.)*

### Two shortfalls I own regardless of which way the decision goes

1. **`help/games/guess.md` documents only the drag.** Its text is still
   "Drag from the colors on the left into the topmost unfilled row … then click
   on the small circles to submit that guess." No keypad, no keyboard entry, no
   holds, no `'l'` label toggle — one day after `give-guess-element-keys`
   shipped the panel. It is wrong today and will be wrong a second way if drag
   goes. AGENTS.md § "Documentation" makes this page ours to correct whoever
   originally wrote the words. *(Reported.)*
2. **A half-composed row is lost on save/restore.** Upstream persists the
   working row and the live holds deliberately — its `encode_ui` carries the
   comment *"For this game it's worth storing the contents of the current guess,
   and the current set of holds"* (`../puzzles/guess.c:467-508`, in the sibling
   read-only clone). This port has no `encodeUi`, so a player who saves
   mid-guess loses the pegs they typed **and** any hold they set but have not
   submitted. This gets materially worse if composing becomes the only
   interaction, and it is a hard prerequisite for any player-placed notation
   (see Q2). *(Reported.)*

Both deserve their own scaffolded changes rather than a mention in a transcript
— AGENTS.md § "Work management": *"If it is not worth a commit, it was not worth
reporting as a finding."*

---

## §5 — The third option, after folding Wordle in

It survives, and it absorbed the Wordle input rather than being displaced by it.

**Retire drag; adopt Wordle's default entry path; add a Submit key and an honest
refusal; fix the cursor advance; skip auto-submit.** Concretely, in the order
I would build them:

1. **Next-empty advance.** A color key places at the next *empty* slot rather
   than at `cursor.x + 1`. This is the keystone, and it is the fix for the
   confirmed defect: today the digit arm advances by index
   (`src/games/guess/index.ts:318`) and `changedState` resets the cursor to peg
   0 after a submit (`:90`), so with holds on pegs 0 and 2 the first key a
   player presses overwrites a held peg. On a keyboard that was survivable
   (the ring is visible on peg 0, and arrows exist); with the panel as the
   primary touch path and no arrows, it is not. **Holds are an argument for the
   next-empty rule, not an obstacle to it** — next-empty handles a row
   pre-filled out of order exactly right, which index-advance structurally
   cannot. *(Behavior reported; you reproduced it against a real Midend.)*
2. **Clear becomes Backspace when nothing is selected** — remove the last
   filled, unheld slot. If every filled slot is held, there is nothing the
   player typed and it does nothing. *(Wordle's Backspace-removes-the-last, from
   memory; the held-slot carve-out is reasoning.)*
3. **Keep the cursor available, not required.** Hidden by default with entry at
   the next empty slot; a slot tap reveals it and entry goes there. The two
   reasons are in Q1 and I will not repeat them, except to note that the
   two-scope Marks key in Q2 is a *third* reason: a per-slot elimination needs a
   selected slot to attach to.
4. **A faint marker on the next-empty slot when no cursor is shown**, so "where
   will this color land" is always answerable by looking. Wordle needs no such
   marker because its row is always a clean prefix; Guess with holds is not.
   *(Reasoning.)*
5. **Submit as a panel key**, disabled unless `ui.markable`. Large, fixed
   position, and immune to the long-press promotion because panel buttons are
   not board pointer events. Clear is already precedent for a command key on the
   panel. *(Wordle's explicit Enter, from memory; the promotion-immunity is
   reported from how the panel dispatches.)*
6. **Refuse and explain.** `Game.statusbarText?(state, ui)` takes the `Ui` and
   refreshes on `UI_UPDATE` (`src/engine/game.ts:499`); Guess sets
   `wantsStatusbar: false` (`src/games/guess/index.ts:383`). Flip it and say
   why a full row cannot be submitted — "This game allows no repeated colors" —
   instead of today's silent `null` (`:290-294`). Mosaic, Samegame, Galaxies,
   Net and Slide already use the hook. This mirrors Wordle's *refuse, explain,
   keep the row* answer to an invalid word. *(Hook and consumers reported; the
   Wordle behavior from memory, and it is the memory claim carrying the most
   argumentative weight in this report after the explicit Enter — confirm both
   on a device.)*
7. **Then the column, per revised condition 2** — convert to tap-to-place, or
   delete if a notation ships.

**Not** auto-submit. If the owner wants to try it regardless, the honest vehicle
is a per-game preference — `Game.preferences` is declarative and maps an entry
to a `Ui` field (`src/engine/game.ts:501-503`) — shipped **off** by default. I
would say plainly that a preference for a rule this consequential is a tax
rather than a resolution *(reasoning)*, and note that a `Ui`-backed preference
in a game with no `encodeUi` needs its persistence checked before it is offered.

---

## Appendix — claim status, for the scaffold

**Verified against code this session; safe to cite as findings.** The
holds/index-advance defect and `changedState`'s rebuild-from-holds
(`src/games/guess/index.ts:80-91`, `:318`); `isMarkable`
(`state.ts:176-194`); both presets being `allowBlank: false, allowMultiple: true`
(`state.ts:122-131`); the submit gate (`index.ts:290-294`); `markPegs`'s
front-packed feedback (`state.ts:203-230`); the `RIGHT_BUTTON` arm and the
absence of `RIGHT_DRAG`/`RIGHT_RELEASE` (`index.ts:283-289`); the
`statusbarText` hook and its five game consumers (`src/engine/game.ts:499`);
`wantsStatusbar: false` (`index.ts:383`); the absence of
`encodeUi`/`decodeUi`; the `overHint` band (`index.ts:218-220`);
`validateParams`'s missing `npegs` ceiling (`state.ts:161-169`);
`computeHint`'s enumeration and `provenAbsent` (`index.ts:109-160`, `:121-122`);
the `ReferenceItem.status` doctrine (`src/engine/types.ts:227-236`);
`showPuzzleKeyboard`'s default and player-toggleability
(`src/store/settings.ts:295-296`); upstream's `encode_ui` comment
(`../puzzles/guess.c:467-508`); the stale help page; the 27-of-57 drag count;
the `computeSize` formula (`render.ts:78-90`).

**Read from code but not driven — worth a Midend run before the change leans on
them.** The palette tap hiding the cursor (`index.ts:275-282`); a 350 ms hold
over the feedback strip dropping the submit.

**Reasoning, not measurement.** The three-way drag classification; that Guess's
drag carries one bit; every derivation in Q2 (rules A1, A2, A3, B and their
consequences); the ~25% board-width figure and the ~1.3 × 1.1-tile submit target
(arithmetic off `computeSize`, not browser measurements); the ten-line estimate
for a button-class drag fix; that a preference is a tax.

**Reasoning I did not verify and that is load-bearing — check before stating.**
That the five digit games (Solo, Keen, Towers, Unequal, Filling) are already
unplayable on touch with `showPuzzleKeyboard` off. This is the mitigation for
the only real capability loss in the whole proposal, so drive one of them.

**NYT Wordle, from memory, no source read.** No drag anywhere; on-screen
keyboard plus physical; letters land in the next empty cell; Backspace removes
the last letter; **Enter is explicit**; **an invalid word shakes the row, shows a
toast, does not consume the guess, and keeps every letter in place**; the
keyboard keys accumulate a per-letter color. High confidence on all seven. The
two bolded ones carry real argumentative weight — the first against auto-submit,
the second for the refuse-and-explain alternative — so confirm them on a device.
The single item I am least sure of is how a key is colored when a letter is both
correct in one position and a surplus duplicate elsewhere in the same guess (I
believe the key takes the best status); **nothing in this report rests on it.**
