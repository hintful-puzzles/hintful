## MODIFIED Requirements

### Requirement: Sokoban's hint offers one push, set against the barrel's other pushes

Sokoban's hint SHALL search for a line of pushes that finishes and offer one push, its step's
move being that push with the walk to it, played by a gesture that drags the barrel the way it
goes.
Walking SHALL keep the step; the push SHALL complete it; any other push SHALL drop it. The
offered push SHALL be one after which the line the search finds is shorter than the plan,
wherever some push is, and the plan SHALL be the search's line from the position, or the
remainder of the line it finds after that line's first push where that line comes straight back
through the position and its remainder is the shorter.

A step SHALL lead with another push of the same barrel that would leave a barrel stuck for good
(in a corner, where no push can bring it to a target, or unable ever to move), striped. Otherwise
it SHALL judge the barrel's other pushes through `judgeRivals` and say only what the judging
settled: that no other push of the barrel can finish, or that it can finish only along the
arrows drawn on it, or along them but not every way. Otherwise it SHALL say what the push does
to the order the barrels go home in, as the requirement on order sets out. Otherwise it SHALL
say whether the push
puts the barrel on a target, or else whether it lets the player out, which it SHALL say only
where the push opens at least four times as many squares to the player as they could walk to. The hint SHALL refuse, outlining the barrel, when a barrel off its
target is already stuck for good, and SHALL refuse with `NO_SOLUTION_FROM_HERE` when the search
proves no line finishes and with `SEARCH_OUT_OF_REACH` past its reach.

#### Scenario: A push that would corner the barrel is striped

- **WHEN** another push of the barrel the hint offers would wedge it in a corner off every target
- **THEN** the step stripes that push, says it would wedge the barrel in a corner it can never
  leave, and offers its push as one way to avoid that

#### Scenario: Following the hint never returns to a position

- **WHEN** the hint is asked, its push made, and the hint asked again, until the board is solved
- **THEN** no position repeats, on a board where offering the plan's first push alone cycles

#### Scenario: A line that comes straight back does not send the barrel back

- **WHEN** the hint is asked on a position where the line the search finds after its own first
  push is longer and opens by undoing that push
- **THEN** following the hint from there reaches the solved board without repeating a position

#### Scenario: A stuck barrel is outlined as the reason to undo

- **WHEN** the hint is asked with a barrel off its target in a corner
- **THEN** it refuses as a dead end, outlining that barrel

## ADDED Requirements

### Requirement: Sokoban's hint says what a push does to the order the barrels go home in

Where no trap leads and the judging settled nothing to say, a step SHALL say one of two things
about order, each only where the hint has checked it, the first before the second:

- that a barrel on another empty target, which the step outlines, would wall off the target this
  push fills: with a barrel standing there, no barrel could be pushed onto this target from any
  square, on a board with no other barrel. It SHALL say so only on a board where every target
  has to be filled.
- that this barrel keeps another, which the step outlines, from reaching a target: pushing only
  that barrel, with every other barrel where it stands, brings it to no empty target; with this
  barrel lifted off the board it would; and after this push it does. It SHALL NOT say so where
  the push lets the player out.

Where a step has nothing else to say of its push and the plan goes on pushing the same barrel
until it stands on a target, in two to five pushes each of which shortens the line the search
finds, the hint SHALL give those pushes as one journey: its first step counting the pushes, the
later steps continuing it, and the last saying that it puts the barrel on a target.

#### Scenario: The far target of a corridor is filled first

- **WHEN** the hint's push fills a target that can only be pushed onto from one side, and the
  square a barrel or the player would need for that is another empty target
- **THEN** the step outlines that other target, says a barrel on it would wall off the ringed
  one, and offers the push as filling that one first

#### Scenario: A barrel in another's way is pushed aside

- **WHEN** the hint's push moves a barrel that alone keeps another barrel from being pushed to
  any empty target
- **THEN** the step outlines the other barrel and says the push opens a way, and pushing only
  the outlined barrel from the board the push leaves can bring it to a target

#### Scenario: A barrel's run to a target is one journey

- **WHEN** the plan opens with two or more pushes of one barrel that end with it on a target,
  and nothing else is said of the first
- **THEN** the hint returns those pushes as one journey whose first step counts them and whose
  last step puts the barrel on a target
