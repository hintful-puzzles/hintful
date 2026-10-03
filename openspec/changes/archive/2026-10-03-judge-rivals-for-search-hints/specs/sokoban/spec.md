## MODIFIED Requirements

### Requirement: Sokoban game implements the Game interface

The engine SHALL provide `src/games/sokoban/` implementing the `Game`
interface for Sokoban, registered so the puzzle is served by the TypeScript engine.

Sokoban SHALL support rectangular boards parameterized by width and height (both at
least 4), with presets 10×12, 12×16 and 16×20 (upstream's sizes, turned to draw taller
than wide). Sokoban SHALL implement `solve` and `hint`, both by searching within a budget.
Because every reachable position is legal and any line of pushes that fills the targets
wins, it SHALL NOT implement `findMistakes`; Check & Save SHALL ask the hint whether the
position is a dead end instead.

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

#### Scenario: Parameters round-trip

- **WHEN** a parameter string naming a width and height is encoded and decoded
- **THEN** the same width and height are recovered, and a bare single number is read
  as a square board

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG,
so that a given seed always produces the same board
and shared game IDs remain reproducible. A level SHALL be generated exactly as upstream
generates it, and the board dealt SHALL be the first such level from the seed's stream that
the hint's search finishes from its opening within a fixed budget, so that the hint never
refuses a board as dealt.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

## ADDED Requirements

### Requirement: Sokoban's hint offers one push, set against the barrel's other pushes

Sokoban's hint SHALL search for a line of pushes that finishes and offer one push, its step's
move being that push with the walk to it, played by a gesture that taps each square of the walk
and then the barrel. Walking SHALL keep the step; the push SHALL complete it; any other push
SHALL drop it. The offered push SHALL be one after which the line the search finds is shorter
than the one it finds before it, so following the hint cannot return to a position.

A step SHALL lead with another push of the same barrel that would leave a barrel stuck for good
(in a corner, where no push can bring it to a target, or unable ever to move), striped. Otherwise
it SHALL judge the barrel's other pushes through `judgeRivals` and say only what the judging
settled: that no other push of the barrel can finish, or that it can finish only along the
arrows drawn on it, or along them but not every way. Otherwise it SHALL say whether the push
puts the barrel on a target. The hint SHALL refuse, outlining the barrel, when a barrel off its
target is already stuck for good, and SHALL refuse with `NO_SOLUTION_FROM_HERE` when the search
proves no line finishes and with `SEARCH_OUT_OF_REACH` past its reach.

#### Scenario: A push that would corner the barrel is striped

- **WHEN** another push of the barrel the hint offers would wedge it in a corner off every target
- **THEN** the step stripes that push, says it would wedge the barrel in a corner it can never
  leave, and offers its push as one way to avoid that

#### Scenario: Following the hint never returns to a position

- **WHEN** the hint is asked, its push made, and the hint asked again, until the board is solved
- **THEN** no position repeats, on a board where offering the plan's first push alone cycles

#### Scenario: A stuck barrel is outlined as the reason to undo

- **WHEN** the hint is asked with a barrel off its target in a corner
- **THEN** it refuses as a dead end, outlining that barrel

### Requirement: Sokoban's Solve finishes from the player's position, or else from the dealt board

Sokoban's Solve SHALL search for a line from the player's position and, failing that, from the
board as dealt, and SHALL leave the finished board that line reaches. Its move SHALL carry the
finished board as a game ID writes it, and SHALL be refused on a board whose walls differ.

#### Scenario: A lost position is solved from the dealt board

- **WHEN** Solve is asked on a position a pushed-in barrel has lost
- **THEN** it leaves a solved board, found from the board as dealt
