## ADDED Requirements

### Requirement: A cross-game sweep SHALL deal every choice the Custom dialog offers

The shared preset enumeration a cross-game sweep takes its boards from SHALL deal, beside the slice of the menu, a board for every value of a `"boolean"` or `"choices"` param that no preset holds. A game is dealt on everything its dialog offers by having a `paramConfig`, with no list of games or values kept anywhere.

The slice walks one preset per value the presets vary, so a value the dialog
offers and no preset holds was dealt by no cross-game guard. Salad's hint threw
on 71 of 1,195 Normal boards while all eleven of its presets were Easy. Taken
2026-10-05 over the registry, 54 such values stood in 27 fields of 16 games: a
whole tier in Loopy, Mathrax, Unequal and Group, a rule or mode in ten games,
and the generator's choices of symmetry and density in four.

**Each value SHALL be written onto the first preset, in menu order, that the
params check accepts it on**, so a value costs what the game's cheapest board
costs. That is one field written onto a preset, the form a sweep SHALL NOT use
*instead of* reading the menu; here it is dealt beside the slice, for a value
the menu has no board to read. A tier written onto a small grid is a board the
dialog deals and may not be a hard one, so it is no substitute for a preset at
that tier.

**Every value is dealt, the generator's choices included.** A ledger excusing
the values a hint is unlikely to read was weighed and not built: Bridges, with
22 of the 54, cost 0.7 s across the nine guards that walk the slice before its
values were dealt and 0.9 s after, so the ledger would have saved nothing and
would have been a second copy to keep true.

**A value no preset accepts has no board, and SHALL be held to a ledger** with a
reason an entry, asserted equal to what the derivation finds. The ledger is
empty: ABCD's rule against diagonal touching needs five letters, no ABCD preset
had them, and its menu gained one. A free scalar (`"string"`) is not walked
this way: it has no list of values to hold a menu against, and its ends are the
slice's.

**Whether every value is dealt SHALL be asserted from `paramConfig` and the
dealt boards alone**, not through the derivation that deals them, and SHALL
name known boards by the params they carry.

#### Scenario: A game's dialog offers a tier its menu stops short of

- **WHEN** a game's difficulty item lists a tier and none of its presets is at
  that tier
- **THEN** every cross-game sweep that takes its boards from the shared
  enumeration deals a board at that tier, on the first preset that accepts it,
  per commit and in the slow tier
- **AND** a throw planted in a hint arm only that tier reaches turns those
  sweeps red

#### Scenario: A game gains a choice

- **WHEN** a game's `paramConfig` gains a checkbox or a choice, or a list of
  choices gains a member, and no preset is changed
- **THEN** the new value is dealt from that commit, with no line added anywhere
  to enroll it

#### Scenario: A value depends on another field

- **WHEN** every preset refuses a value, because the field is valid only with
  another field at a value no preset holds
- **THEN** the census fails naming the game, the field and the value, and the
  author gives the menu a board that carries it, or writes a ledger entry
  saying what does deal it

#### Scenario: A sweep reads the menu by itself

- **WHEN** a cross-game sweep slices or lists a game's presets directly
- **THEN** it deals nothing the menu leaves out, which is right only for a
  sweep whose subject is the menu or the slicing rule
