# Design

The measurements are `report.md`'s; this is what was decided, and why.

## 1. A value's multiplicity is the library's

Salad's empty square is the cube's last value, placed `order − nums` times a
line, and every other value once. Today the engine runs two ladders for it:
where `order − nums` is 1 the hole is an ordinary value and the library's
techniques run, and otherwise the engine's own multiplicity code
(`diffSimple`, `setGeneral`, its wing), which scans in another order.

The library takes the multiplicity instead. A description may say that one
value of its domain repeats (`answer.value.repeat: { value, times }`), and a
formula reads a value's multiplicity as `times(d)`: that count for the
repeated value, 1 for every other, and 1 for every value of a game that
declares none. The compiled code reads it off the marks
(`Marks.multiplicity`), which the Latin cube already knows.

`placed`, `hiddenSingle`, `set`, `fish` and `wing` are stated with it, each
written so that where every value's multiplicity is 1 it reads exactly as it
did: the same bindings in the same order, the same facts, and no count the
old statement did not make, guarded by `times(d) = 1 or ...` where a count
would cost. So every other Latin game compiles to the same behavior, which
the trace of every Latin game's deals and hint walks checks byte for byte.
`single` reads no multiplicity. A second copy of the library in Salad's
description, stated with the multiplicity, would have left the library
unsound for any game that repeats a value and given Salad two ladders again.

What each statement reads of a repeated value:

- **placed**: a placed value leaves its line only once the line holds
  `times(d)` of it, which is what the engine's `strikeRepeatFromLine` did.
- **hiddenSingle**: a repeated value is never among a unit's placed values,
  and fires where its open places number what the unit still owes; the
  engine's positional elimination, which counted the placed cells too.
- **set**: the open cells avoiding `T` hold the values `V − T`, and those
  need as many cells as each still owes, the repeated value its surplus
  (`|open| − |V|`) more than one.
- **fish**: for a repeated value the columns `X` owe their copies to the
  rows `Y0 − T`, and where those rows owe as many, no other column may hold
  it there.
- **wing**: the middle cell and its ends hold once-a-line values, as the
  engine's wing asked of its middle; an end's value then is too.

## 2. Salad's rules

The answer is `range(1, nums + 1)`, `nums + 1` the empty square, repeated
`order − nums` times. The shape says each value appears `times(d)` times in
each line. ABC End View deals border letters: the first square from the
clue that is not empty holds it (`border`, at a slot). Number Ball deals
balls: a square that is not empty (`ball`, at a cell, its value the empty
square it is not). A given letter, number or cross is a given of `value`.
The two modes are rulesets, each adding its clue kind and, for ABC End View,
the border technique.

## 3. The border technique

Upstream's `salad_letters_solver_dir`, one clue a binding: near the clue,
the squares up to and including the first that is not a known empty hold no
other letter; and past the clue's reach the clue's letter cannot sit. The
reach is the line's empties less those already known beyond any place the
letter could take, cut short at the first square known to hold a letter.
Each square's two readings are one conclusion, near before far, so a
firing's strikes come square by square as the hand-written scan made them.

## 4. What stays Salad's

The Number Ball generator's quality gate (`DIFF_HOLESONLY`), whether the
empties fall out with no number entered, is not a tier: it stays a
hand-written fixpoint over the empty square. Seeding a ball as a strike and
a cross as a placement stays the game's, before the solve, as it was: a
hint does not narrate a given.
