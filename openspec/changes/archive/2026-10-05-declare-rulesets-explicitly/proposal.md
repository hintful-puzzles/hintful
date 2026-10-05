# declare-rulesets-explicitly

**Status: implemented 2026-10-05.** Asked for by the owner on reading
`name-a-games-modes-from-one-place`, which had the engine find a game's
ruleset by the label slot its field asked for: *"'lead' sounds a bit strange,
and I really do think that it would be worthwhile making these rulesets … be
more structurally explicit."*

## Why

`lead` said where a word sits in a title. The engine read "this game has
rulesets" out of that position, which is a derivation standing where a
declaration should be: nothing in a game's code said the field was a ruleset,
and three games spelled the same field three ways (`game-mode` "Game Mode",
`game-mode` "Game mode", `mode` "Mode"), each with a hand-written "Switch
between X and Y" doc and a hand-written list of the rules on its help page.

## What Changes

- **`rulesetItem(rulesets, field)`** (`engine/ruleset.ts`), the sibling of
  `difficultyItem`: a game with more than one puzzle on its board declares
  them, each a `name` and its `rule`. The field is `kw: "ruleset"`, labeled
  "Game mode", in every game.
- **Built from it**: the dialog's choices and the field's help entry, the name
  in front of a params label, the Type menu's sections, and the help page's
  list of rules, where the page writes `{{rulesets}}`.
- **The `lead` label slot is gone.** Nothing but a ruleset puts a word in
  front of a title, so no field can ask to.
- Salad, Seismic and Unequal declare theirs. Their three hand-written lists
  and three field docs go.

Player-visible: Salad's and Unequal's dialog field reads "Game mode", as
Seismic's did. Unequal's list reads "Unequal: The clues are…" where it read
"Unequal mode: the clues are…". No params encoding moved: the stability
snapshot is unchanged.

**The term.** "Ruleset" in code. "Mode" is taken several times over (notes
mode, pencil mode), and "variant" fits Solo's X, Jigsaw and Killer, which
combine where rulesets exclude each other. Players read "Game mode".

**Not in this change: Ascent's Edges.** It is a different puzzle, but it is
one choice of a field whose other four are grid shapes, so declaring it means
splitting that field. `declare-ascent-and-flip-rulesets` does.

## Hints to pull in

None.
