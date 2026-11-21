## MODIFIED Requirements

### Requirement: Params: A Slide board of more than 48 squares is refused, dealt or loaded

Slide's width SHALL declare an `area` of 48 times its height, so the engine
refuses a larger board whether it is to be dealt or arrives with its
description: the solver runs an exhaustive breadth-first search whose memory
grows explosively with board area and, past the bound, exhausts the heap
rather than merely running slowly. The measurements that set the bound SHALL
be recorded with it.

#### Scenario: A board too large to generate is rejected with a reason

- **WHEN** parameters whose cell count exceeds the documented bound are validated
- **THEN** they are rejected with a message the custom-parameters dialog can show,
  rather than being accepted and then exhausting memory during generation

#### Scenario: A 7 by 7 board is refused with its description in hand

- **WHEN** a game ID opens with `7x7m25`, which is `6x7m25` one column wider,
  and carries a description
- **THEN** it is refused with "Width times height must be at most 48."
