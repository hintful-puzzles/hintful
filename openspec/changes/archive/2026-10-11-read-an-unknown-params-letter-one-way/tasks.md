# Tasks

The rule being built: **a params string is read whole or refused.** Every
character is read by a piece of the game's grammar; a letter after a tag that
the tag does not list, a tag at the end of the string with its letter missing,
and anything left once the grammar is done are each refused, by the engine's
one refusal, in a sentence that quotes the character.

## 1. The engine

- [x] 1.1 `engine/params.ts`: `UnreadableParams`, `unreadParams(s, i)` and
      `endParams(s, i)`, the one refusal and its sentence.
- [x] 1.2 `engine/params-codec.ts`: `choice` refuses a letter outside its
      table and a tag with no letter; `paramsCodec` refuses a remainder. The
      `invalid` option goes, and the seven games that pass it stop.
- [x] 1.3 The midend shows the refusal's own sentence for a game ID and for
      `setParams`.

## 2. The hand-written decoders

- [x] 2.1 Each of the 23 hand-written `decodeParams` refuses through
      `unreadParams` where it skipped or defaulted, and ends on `endParams`.
- [x] 2.2 A letter upstream's encoder writes and this app has no field for is
      read by name, not by a skip: audit `encode_params` for every game with a
      C source and run its strings through the new decoders.

## 3. The guard

- [x] 3.1 A cross-game test over the derived params corpus: a character no
      game's encoding uses, appended, inserted at every index and written over
      every character, is refused by every game. Seen failing first.

## 4. Specs, guides, verification

- [x] 4.1 `engine-params`: the requirement, and the codec requirements that
      state leniency. Each game spec that states a default or a skip.
- [x] 4.2 `docs/games/mechanics.md` § "Codecs and validation".
- [x] 4.3 Run the app: a typed ID with an unknown letter shows the sentence.
- [x] 4.4 Gate, commit, push, archive.
