## REMOVED Requirements

### Requirement: A Pearl input that changes nothing makes no move

**Reason**: `ts-engine`, "A move that leaves the board as it was is no step of the history", holds it for every game: a drag or click that changes no segment and no mark costs no step of Undo. The requirement and its one scenario said nothing else, and Pearl's `interpretMove` does answer a drag out and back with a move, which the midend does not record.
