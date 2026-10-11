# read-an-unknown-params-letter-one-way

**Status: answered by the owner, 2026-10-11: refuse, in every game, with
the compatibility cost stated under "The question" accepted, and built that
day ("What the answer became", below). Filed that day by the session that
archived `state-what-a-games-spec-never-did`, whose census found these. What
it says of the code was true that day; re-check before relying on it.**

## Why

Writing each game's params encoding as a requirement showed that a params
string with a letter the game does not know is read three ways. The strings
are in
`openspec/changes/archive/2026-10-11-state-what-a-games-spec-never-did/found.md`,
§ "A params string read oddly":

- **An unknown difficulty letter** is read as the default tier in Sticks,
  Tents, Tracks, Towers, Magnets, Slant, Pearl, Keen, Undead and Unequal,
  and refused ("Difficulty must be one of ...") in Ascent, Clusters,
  Dominosa, Spokes, Subsets, Unruly, Rome and Salad. Each game chooses: the
  codec's choice segment leaves the default in place unless the game passes
  it an `invalid` value to set (`src/engine/params-codec.ts`), and on
  2026-10-11 seven games pass one (`git grep -n 'invalid:' -- src/games`).
  A retired tier is not this case: it is a declared choice and still loads
  (`engine-difficulty`, "A tier with no boards is retired and still loads").
- **Ascent's mode letter**: `6x7mXde` opens a Classic board and is written
  back as `6x7mundefinedde`, which reopens at Easy. A player meets it by a
  typo or a lowercase letter in a pasted ID.
- **Written back wrong**: Dominosa writes `6tdundefined`; Clusters, Rome and
  Salad write `d?`.
- **Read by position**: Keen's `6d` is Easy and not the default; Mathrax
  drops a clue letter out of order (`6dnDS` loads as division only); Unruly
  passes over a `u` after the difficulty; Pegs reads any unknown word as
  Cross.

None of these is met by a string the app writes. Each is met by a string a
person typed, or one an older or a foreign build wrote.

## The question

**What should a params string with a letter the game does not know do: open
at the default, or be refused?**

- **Refuse, in every game** (recommended). A refusal says what was wrong;
  a default opens a board the sender did not send, under a label that hides
  it. The engine's codec refuses once, and no game writes `undefined`. The
  cost is a compatibility break of a narrow kind: an ID with an unknown
  difficulty letter that opens today in the ten games above would stop
  opening. No generator writes one: ours write only a game's declared
  letters, and for the nine of those ten that upstream has, the letters of
  upstream's `DIFFLIST` in `../puzzles/<game>.c` are exactly the letters our
  presets write (read 2026-10-11; Sticks is not upstream's).
- **Default, in every game.** No ID stops opening; eight games that refuse
  today start opening such an ID at a tier it did not name.
- **Leave it.** Each game's spec now states which it does.

The owner's answer picks one, and the change is then the engine's codec and
no game's.

## What the answer became

**A params string is read whole or refused**, by one refusal the engine
makes (`unreadParams`, `paramsLetter` and `endParams` in
`src/engine/params.ts`). The declared codec refuses a letter its tag does not
list and any remainder; each hand-written decoder refuses through the same
three functions where it skipped, defaulted or stopped reading. A piece left
out still takes its default.

Two things the question did not state, found while building it:

- **A string upstream's encoder writes must still open**, so every game's C
  `encode_params` was read (2026-10-11) and its strings are held in
  `src/engine/params-read-whole.test.ts`. Four letters were being read only
  by a skip and are now read by name: Pearl's `n`, Same Game's `r`, Mines'
  and Net's `a`. A `%g` exponent (`b1e-05`, which upstream writes for a
  probability below 1e-4) was read as 1 with the rest skipped, in Net,
  Netslide and Rectangles; it is now read as the number it is.
- **One save would have stopped opening, and does not.** An Ascent game
  entered from an ID with an unknown mode letter (`6x7mXde`) played as
  Classic and was saved with the params `6x7mundefinedde`. The cost the
  owner accepted named IDs with an unknown difficulty letter, not a save, so
  Ascent's decoder reads the word `mundefined` as Classic, the board that
  save was played on. Nothing writes the word any more.
