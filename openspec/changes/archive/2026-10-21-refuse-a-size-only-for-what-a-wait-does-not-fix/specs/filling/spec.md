## REMOVED Requirements

### Requirement: Params: Filling rejects board sizes it cannot generate

**Reason**: The maximum was drawn from the share of fills that survive and
the time a board takes, not from a board that cannot exist, and a size is no
longer refused for its rarity (`engine-difficulty`, "A rare tier is dealt
under the deadline").

**Migration**: None. A larger board is dealt, and the deadline answers one
that finds no board in time.
