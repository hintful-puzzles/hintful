# Design

Written 2026-10-15 by the session that took the change up.

## The declaration

A game declares `rulesOut` on its `Game`:

```ts
interface RulesOut<State, Move> {
  name: string;                                   // the preference's words
  bring(before: State, after: State): Move | null;
}
```

`bring` is asked of every move the player makes, with the board before it and
the board after it, and answers with the marks the move's placements rule out
at a glance, as a move in the game's own vocabulary, or `null`. It reads what
the move did to the board and not the move, so a click, a drag, a key and
Tents' joining of a tree to an open square all bring the same marks, and a
move that takes a placement away brings none.

## What the engine owns

- **The preference.** One key, `auto-cross` (Star Battle's, kept so a
  player's saved choice still reads), offered beside the game's own `prefs`
  in every game that declares `rulesOut`, off until the player turns it on.
  Its value lives on the midend, as the timer's does, so no game's `Ui`
  carries it and no game's `prefs` lists it.
- **The move it extends.** After a player's move is made and judged, the
  midend asks `bring` and makes the brought move as a second history entry
  joined to the first, as a drag's later marks are. One Undo takes both
  back. The game's move type does not change, and no game writes a merge.
- **The keep-track's allowance.** `hintKeepTrack` is asked of the player's
  move alone, so the brought marks are never judged against the step. The
  plan is then refreshed against the board after both.
- **The plan's end.** With the preference on, the midend cuts a plan after
  its first step whose move brings anything. It plays the steps forward from
  the board to find that step. The next hint is planned from the board the
  brought marks leave (`docs/hints-marks.md` § "A move with side effects ends
  the plan").

### Why a joined entry, and the save that keeps it

Folding the brought marks into the game's own move would mean each game
writing a merge. Tents' `link` move, which places a tent when it joins a tree
to an open square, would also need a new field. A joined entry needs neither.
The midend did not save its joins, so after a reload a drag came off one mark
at a time, and a star would have come off before its crosses. The save gains
an optional `joined` list of the entries that join the one before. A save
without it loads as before, and an older build ignores it. The owner agreed to
this on 2026-10-15, when asked with that cost stated.

## Whether `auto-pencil` is the same declaration

Measured 2026-10-15 by reading Keen, Mathrax, Solo, Towers and Unequal (the
five that offer it), `candidate-plan.ts`, `candidate-hint.ts`,
`rome/hint.ts` and `seismic/hint.ts`.

**It is not, and it stays as it is.** The two differ at the plan.

- A candidate plan **models** the cull. `candidate-plan.ts`'s placement
  strikes the duplicates from its own notes and, with the preference on,
  goes on planning in silence (`plan.autoClean`). A placement is nearly every
  other step of a Latin plan, so ending the plan there, as a declared
  rule-out must, would turn a plan of many steps into one placement a press.
- What a star, a tent or a bulb rules out is a matter of the game's own
  solver board. The step after it is planned by a ladder that would have to be
  taught each brought mark, so ending the plan is the honest amount for the
  engine to own.

What `auto-pencil` leaves per game is one line in `interpretMove`
(`autoElim: ui.autoPencil`), the `Ui` field, and the cull in `executeMove`,
which reads the game's own regions. Its preference is already
`pencil-prefs.ts`'s, and its hint's handling is already `candidateHint`'s.
Moving it onto `rulesOut` would add a declaration to each of the five games,
remove about as much, and lose the plan that runs on. Rome and Seismic offer
no `auto-pencil`. Their hints teach the cull as a step of its own, and that
is no part of this.

## Each game's declaration

- **Star Battle**: a new star rules out the blank squares touching it, and
  the blank squares of its row, column or region where it is the last that
  one holds. It is the `ruledOutBy` the game already had, now read off the
  board.
- **Tents**: a new tent rules out the blank squares round it, and the blank
  squares of its row or column where it is the last tent the clue asks for.
  They become grass.
- **Light Up**: a new bulb rules out, by a cross, the free squares round each
  numbered wall beside it that the bulb fills. These are the squares the
  hint's "a clue that is full" step crosses out.

## The guard

`src/engine/rules-out.test.ts` takes its population from the registry: every
game that declares `rulesOut`. With the preference on, it plays each game's
hint through a real `Midend` to the end of a gate preset's board. It holds
that the board finishes, that no mark is ever a mistake (the brought marks
are sound), and that at least one move brought marks.
