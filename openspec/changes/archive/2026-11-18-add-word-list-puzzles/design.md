# Design: add-word-list-puzzles

Findings of 2026-11-18. The questions for the owner are § "Asked of the
owner"; everything else here is the session's call, with its reason.
Wordtrail was split into `add-wordtrail` on the owner's word, its findings
carried there; this change ships the word list and Wordguess.

## Wend's rules, confirmed

From LinkedIn's own game (linkedin.com/games/wend, puzzle No. 163, played in
Chrome on 2026-11-18). Its "How to play" reads, in full: "Find the 4 hidden
words — 3, 4, 5, and 6 letters long. Use every letter tile exactly once."
What the board showed beyond that:

- A rectangle of letter tiles with some squares blocked (gray, no letter).
  The day's board was 5×5 with 7 blocked squares and 18 letters.
- **Steps are orthogonal**: a drag from a letter straight to its diagonal
  neighbor is refused (the word stays one letter long). A tile already in a
  word cannot be entered by another.
- The lengths are listed, not the words; the lengths sum to the letters.
- A word that matches the hidden answer is ticked at once.

So the proposal's reading of the screenshot stands: a division of the open
squares into paths of orthogonally adjacent letters, each spelling a word,
with the word lengths given.

## The word list

Measured by a research subagent on 2026-11-18 from the downloaded lists
(counts are lowercase, letters only, so proper nouns, abbreviations and
possessives are out). Licenses checked from each source's own text.

| Source | License | Use |
| --- | --- | --- |
| SCOWL (Kevin Atkinson; github.com/en-wl/wordlist, rel-2026.02.25) | MIT-like; its notice ships verbatim. Sizes above 80 add the UKACD notice | Both tiers: graded by size (10 common … 95 rare) |
| 12dicts 2of12 (Alan Beale) | Public domain, acknowledgment requested | Answers: headwords only, so no plurals or inflections |
| ENABLE | Public domain | Optional extra guesses (+2.7k five-letter words) |
| LDNOOBW | CC BY 4.0 (attribution) | Offensive-word filter, with gaps |
| wordfreq, Wiktionary, FrequencyWords | CC BY-SA | Not used: share-alike |
| Norvig count_1w, dwyl/english-words | No clear data license | Not used |
| NYT's answer list and its copies | Not ours | Never used |

**Answers**: SCOWL up to size 40 ∩ 2of12, less the filter: 486 / 1,631 /
2,287 / 3,067 / 3,129 / 2,997 words of 3 to 8 letters, 97 KB raw, 38 KB
gzipped, before filtering. **Guesses**: SCOWL up to 70 (53,859 words, 138 KB
gzipped) or up to 80 (102,960, 257 KB). **The filter** is the union of
SCOWL's own offensive and vulgar tags, LDNOOBW and a short list we keep: each
alone misses common slurs (measured: SCOWL tags 77 words, LDNOOBW misses ten
listed in the subagent's report). A sample of the unfiltered answers still
held words a player should not be dealt.

**Offline**: the lists ship as a precached asset. The precache glob takes
`js` and `json` and not `txt` (`vite.config.ts`, `globPatterns`), and an
asset outside it ships unprecached without a sound, so the list is a module
or JSON, and a test asserts it is in the precache manifest.

**Uniqueness is checked against the guess list.** Check & save is an answer
check, so a word-path board must have one division into words of the guess
list, not only of the answers: otherwise a player who finds a real word the
answer did not use is told it is wrong. The generator deals answers' words
and proves uniqueness against every accepted word.

## The word list, as built

`scripts/word-list.ts`, 2026-11-18. Its header is the full statement; what
changed from the plan above, and why:

- **SCOWL's data is read, not its build run.** SCOWLv2 ships a Python build
  into SQLite; running code from a download was refused on this machine, and
  a build script that needs Python and SQLite is a second toolchain. The
  script reads `scowl-pre.txt` and the files SCOWL merges into it by the
  format its README documents, and skips its adjustment files, which act on
  a few hundred entries far from where either list is cut.
- **Answers are lemmas in their preferred spelling, and not informal.** The
  first build dealt plurals 2of12 keeps as headwords ("books", "hours") and
  "dunno", "sorta": an answer SCOWL lists as another word's inflection, or
  under an informal usage note, or at a variant level past 1, is out. That
  left 425 / 1,401 / 1,952 / 2,531 / 2,508 / 2,414 answers of 3 to 8
  letters, against 1,214 / 4,214 / 8,976 / 15,459 / 23,301 / 28,745
  guesses.
- **Our own filter** is `scripts/word-list-exclude.txt`: checking a list of
  candidate slurs and charged words against the answers found 33 that
  SCOWL's notes and LDNOOBW both let through.

## What each inherits (task 1.3)

Each game's rules are stated in `candidates/` and reported on by
`research/technique-check/inherit.ts` (the reports are
`research/technique-check/results-inherit-wordguess.txt` and
`results-inherit-wordpaths.txt`, run before the game was named, under the
id `wordpaths`; a rerun under the new id timed out at ten minutes on a
loaded machine, and the id changes nothing the check computes). Neither description can state "is a word
of the list": the language has no table yet, and the corpus ruling counts a
word list as a library table. A technique sound without the list stays sound
with it, since the list only removes answers.

**Wordguess** (family `code`, Guess's): its clue is named `score`
with `peg` as Guess's, and `black` and `total` are defined from its per-slot
marks. Six of Guess's seven techniques are sound under its rules
(`scoredNothing`, `noBlack`, `everyPegScored`, `blacksForced`,
`blacksAccounted`, `totalAccounted`), on boards of 3 and 4 letters over
alphabets of 2 to 5. `noRepeats` is unsound, rightly: a word repeats
letters. What the report cannot see (`docs/descriptions.md`, the same
section): the score is per slot here, and Guess's techniques read only its
counts. The game's own rungs read the slots: a right letter settles its
slot; a letter scored elsewhere or not at all is out of its slot; a letter
scored nowhere is out of every slot but those that scored it; a letter
scored elsewhere with one slot left that can hold it is there. Past those,
the hint is Guess's probe over the answers that still fit, which needs the
list.

**Wordtrail** (family `regions`): stated on Palisade's wall model,
each word a path (no square with three joins, n − 1 joins for n squares),
the lengths a board clue. Sound: Palisade's `noDanglingEdges` and `inside`,
Separate's `walledApart`; unsound: Dominosa's `squareOnly` and `parity`,
Separate's `sharedLetter`; the rest read clue kinds or sizes it does not
have. **No inherited technique reads the lengths or the letters**: its
ladder is its own, as the proposal expected (a letter with one way to
continue, a pocket of open squares no listed length fits, a word that fits
one place only).

`inherit.ts` had stopped compiling any technique since the compiler began
requiring a name for each (`606ee6199`), and its own guard failed on Towers.
It now carries the source's names, and a library's id stands in.

## Kinds, and what each game takes

- **Wordguess is Guess's shape**: a query game whose answer is
  hidden, with an answer row of candidates the player rules letters out of,
  which Check & save checks (`docs/new-game.md` § "The route by kind of game", its moves and search;
  `solver-and-generator.md` § "One answer, even when it is hidden"). Its
  frontend is taken from Guess: rows of guesses, a keypad of letters, the
  answer row. The look is the collection's palette and Guess's, not another
  game's colored tiles.
- **Wordtrail is an edges game**: the player joins letters into
  words, as Palisade's border model divides squares, so it starts from the
  `edges` skeleton, with Separate on Palisade's wall model as the exemplar.
  Blocked squares are part of the board.

## What Wordguess shares with Guess (task 3.0)

Decided 2026-11-18. **The row-and-answer-row mechanic is an engine module,
`src/engine/code-rows.ts`, and Guess moves onto it before Wordguess is
written.** The test from `docs/engine-catalog.md` § "What decides whether
something is shared": a change to how a rule-out is toggled, cleared,
judged by Check & save or undone, or to where the next entry lands, which
slot Backspace rubs out and where the cursor rests, would have to happen in
both games at once. None of it is about colors or letters. A code-breaking
game is a family (Bulls and Cows and an equation guesser have the same
shape), so it is weighed at more than two.

What the module owns: the answer row's rule-out bitmasks, their move, its
application, toggle and clear, and the slots Check & save names; the
working row's editing, entering a value at the selected or first open slot,
rubbing one out, and resting the cursor where the next goes.

What stays each game's, because a game would want it different: the score
and its picture, the keys (Guess's color swatches, Wordguess's letters), the
answer row's picture (ten color blocks against 26 letters), holds (Guess
only), a guess refused as no word (Wordguess only), the hint's ladder, and
`interpretMove`'s routing of taps and keys onto the module's operations,
which hit-tests each game's own layout.

Extracted from Guess first, so Guess's own tests show the extraction keeps
its behavior; Wordguess is then the module's second consumer. Where writing
Wordguess's `interpretMove` repeats Guess's routing line for line, that
part is lifted too, from the two copies.

## The keypad (task 3.4a)

Decided 2026-11-18, after seeing the 26-key panel run off both sides of a
390-pixel phone in two unwrapped groups of fourteen.

- **A keypad may declare rows** (`KeyLabel.row`), and the panel draws it as a
  keyboard whose keys share the width, rather than a layout per game. A
  keyboard is a fact about letters, not about Wordguess, so `letterKeyboard()`
  is the engine's; a later word game takes it as is.
- **Each letter key shows the letter's best score**, through a new
  `Game.keyStatus(state)` sent with every move. `requestKeys` stays a function
  of params, because the panel reloads keys only on a params change. The key
  uses the board's own picture (filled, disc, faint) and palette, so it does
  not rely on color alone and cannot drift from the board. It tells nothing
  the rows do not already show. It summarizes them, as Wordle's keyboard does,
  and leaves the answer row as the player's own deductions.
- **A letter typed onto a full row that is no word is declined**, as Wordle
  does, unless the player tapped a slot to change it. Rewriting the last
  letter made the result of a key depend on whether the row happened to be a
  word, and changed a letter the player had not named. Guess keeps rewriting
  the peg last typed, because its refusal is about that peg, a repeated
  color, so `enterValue` takes the choice as `FullRow`.
- **`decodeUi` is given the restored state.** Wordguess judges "this row may
  go" against the word list and the rows already scored. Without the state, a
  whole word restored from a save read as not ready, and Submit framed it as
  refused while the status line said it was ready.

## The hint (task 3.5)

Decided 2026-11-18, on Guess's two halves.

- **The deductions are six techniques of the description**, each read off the
  per-slot marks: a letter in place (`inPlace`), a letter scored nowhere in a
  guess (`absent`), a letter not in place is not where it was guessed
  (`notHere`), a letter found with as many slots left as copies
  (`onlyPlace`), a letter whose count a faint copy fixes, once that many
  slots hold it (`copiesPlaced`), and the letters found filling every slot
  (`lettersFill`). All six checked sound, each plant caught. **Guess's six
  inherited techniques add no step**: each is one of these read through
  Guess's counts (`scoredNothing` and `absent`, `noBlack` and
  `blacksAccounted` and `notHere`, `blacksForced` and `inPlace`,
  `everyPegScored` and `lettersFill`, `totalAccounted` and `copiesPlaced`),
  so the ladder states the per-slot forms alone.
- **The guess is any common word the board accepts, not only one that
  fits.** Following words that fit took up to twelve guesses over every
  three-letter answer and lost six four-letter ones in six rows, in clusters
  such as _ILL; a word that cannot win can split them. Its sentence says so
  (`split`). Common words only, not the whole guess list, so a suggestion is
  a word a player knows: without the search below, the whole list left six
  four-letter words needing a seventh guess against the common words'
  eleven, and the search closes both.
- **Where at most 300 words fit, the guess is the best split from which a
  short search finds every one of them in the rows left.** The search's
  guesses at each step are a function of the words fitting there alone, so
  the hint asked again continues what the last one found; trying the first
  hint's own candidates at every depth lost more words than no search (the
  next hint could not find the continuation). The search is budgeted in
  words scored, never time; below the first step it tries the fifteen best
  splits, and every word that fits where thirty or fewer do (a word that
  fits may win outright, and only a few are left to try).
- **A guess is said as the word** (`{word}`, a term kind the language gained
  for it): the letters are data, not prose, and `THIS` would otherwise trip
  the lint against an unbound "this".
- **"Is out" is kept by the `code` family**, as Guess kept it alone: the
  letter is out of the hidden answer, and no mark of the player's is. The
  exemption reads the description's family, so a later code-breaking game
  takes it without a list.
- **A letter ruled out is struck; a suggested guess rings the working row's
  squares.** An answer slot's letters are a grid of notes, and a ring round
  one crossed its neighbours (the frame test caught it, and none fitted clear
  of them): the engine's rule is that a struck note is not ringed. A
  planner's step could not name a strike, so the language gained
  `marks: { strike: [...] }` for one, and the role-to-mark map the lint and
  the renderer each kept became one (`stated-clauses.ts`'s `DRAWN`). The
  guess is said as the word and ringed where it goes, "guess it in the
  ringed squares".
- **The opening leaves the fewest words on average, not at worst.** The best
  worst case on four letters, AEON, left an 80-word _A_E cluster that no
  common word could finish in the rows (HAZE and PAVE were lost); TALE, the
  best on average, loses none, and the look-ahead takes the worst cases
  from the second guess on. Measured 2026-11-18, following the hint over
  every common word of each preset: all won, the slowest hint 696 ms (six
  letters), within four guesses for most (four letters: 61 of 1401 took a
  sixth).
- **The wording, after a fresh reader's pass**: a letter not in place is
  "did not score A in place", not "off a filled square", a phrase the board
  never teaches; a count fixed by a faint copy names that copy; letters are
  listed in the striped row's order; a guess that fits "may win, or leave at
  most N"; and once no common word fits, the sentence says so, since a game
  ID may hide a rarer word (SHARD is none) and "the only common word" would
  otherwise be followed by a count of all words with no reason given.
- **Where no common word is sure to finish, a word of the whole list with a
  vowel may be suggested.** No preset reaches it now; it is kept for the
  custom sizes and guess counts, where the walk was not run. The vowel keeps
  out BLDG and TSK, which the search found first.

## Asked of the owner

Asked together on 2026-11-18, and answered the same day:

1. **The guess list is SCOWL up to size 80**, about 103k words; the answers
   are as above. Staying at 80 keeps the UKACD notice out.
2. **The offensive filter applies to answers only**: such a word is never
   dealt or laid in a board, but a player who types one has it accepted.
3. **The guess bound is a setting**, six in the five-letter presets, as
   Guess's rows are.
4. **The names are Wordguess and Wordtrail**: not Wordle or Wend, which are
   their owners' trademarks; Wordguess sits beside Guess, and Wordtrail does
   not clash with Path.
