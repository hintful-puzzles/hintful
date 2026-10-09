## ADDED Requirements

### Requirement: Encoded params are byte-stable, and the guard is derived

A game's params encoding appears inside every shared game ID, so it SHALL be
held byte-stable by an assertion rather than by policy alone, and the corpus
that assertion runs over SHALL be derived from each game's own declarations
rather than authored. The corpus SHALL carry a vacuity guard on both the
number of games and the number of cases.

#### Scenario: A changed encoding is reported before it ships

- **WHEN** a change alters the string any game encodes for reachable params
- **THEN** the byte-stability snapshot fails, naming the game and the case

#### Scenario: The guard cannot pass over an empty corpus

- **WHEN** the registry is unpopulated, or a game contributes no cases
- **THEN** the vacuity guard fails rather than every downstream assertion
  passing over nothing

### Requirement: Encode and decode are mutual inverses over the corpus

Encode and decode SHALL be mutual inverses for every case in the corpus,
compared through the encoded string. This SHALL be asserted as a property and
not a fixture, for every registered game with no exemption roster: it survives
a preset being added and cannot be re-baselined.

#### Scenario: A codec that stops being invertible is reported

- **WHEN** a decoder stops recovering a field its encoder writes
- **THEN** the mutual-inverse assertion fails for that game, independently of
  the snapshot

### Requirement: The recorded params encodings do not move

The recorded encodings SHALL NOT move, held as a per-game snapshot.
Re-baselining the snapshot is a compatibility decision that SHALL go to the
owner beforehand with the cost stated, and SHALL NOT be applied as a
formatting fix with `vitest -u`.

#### Scenario: A change would move a recorded encoding

- **WHEN** a change makes a game encode a recorded case as a different string
- **THEN** the snapshot is not re-baselined until the owner has agreed to the
  break with its cost stated

### Requirement: A preset title that names a difficulty names its own tier

A preset title that uses one of the collection's difficulty words SHALL use the
word for that preset's own tier, and SHALL derive it from the game's tier list
rather than restate it. A title that names no difficulty is permitted.

#### Scenario: A preset named for something else

- **WHEN** a preset's title names a symbol range or a mode and no difficulty,
  as Salad's and Solo's Killer preset do
- **THEN** it passes, with no exemption list

## MODIFIED Requirements

### Requirement: A params refusal is a sentence

Every refusal `paramsError` returns SHALL be one sentence with its full stop:
the bounds and choice messages it generates, and every string a game's
`validateParams` can return. The Custom dialog and the Enter Game ID dialog
SHALL show a refusal as it comes, adding no punctuation of their own. Which
refusals a game has SHALL stay the game's own; only the form is the
collection's, and a guard SHALL read, and fail where it cannot read, every string a `validateParams` can
return.

#### Scenario: A game's refusal reaches the Enter Game ID dialog

- **WHEN** a player opens a game ID whose params the game refuses
- **THEN** the dialog shows the game's sentence after "That game won’t open.",
  with the full stop the game wrote

#### Scenario: A fragment is refused at commit

- **WHEN** a game's `validateParams` returns "Too many mines for grid size"
- **THEN** the guard fails, naming the file and line

## REMOVED Requirements

### Requirement: A mistake check compares with the one answer, hidden or not

**Reason**: Moved to `ts-engine`, with its words.

### Requirement: No parameter or tier switches a generator's checks off

**Reason**: Moved to `engine-difficulty`, with its words.
