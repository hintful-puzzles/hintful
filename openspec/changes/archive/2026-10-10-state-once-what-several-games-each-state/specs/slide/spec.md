## MODIFIED Requirements

### Requirement: A Slide board too large to generate is rejected

`validateParams` SHALL reject a board whose cell count exceeds a documented
bound, because generation runs an exhaustive breadth-first search whose memory
grows explosively with board area and, past the bound, exhausts the heap rather
than merely running slowly. The measurements that set the bound SHALL be
recorded with it.

#### Scenario: A board too large to generate is rejected with a reason

- **WHEN** parameters whose cell count exceeds the documented bound are validated
- **THEN** they are rejected with a message the custom-parameters dialog can show,
  rather than being accepted and then exhausting memory during generation
