# Design: add-word-list-puzzles

Findings of 2026-11-18. The questions for the owner are § "Asked of the
owner"; everything else here is the session's call, with its reason.

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
