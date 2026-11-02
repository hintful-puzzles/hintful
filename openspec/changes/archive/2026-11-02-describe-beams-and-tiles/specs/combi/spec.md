## REMOVED Requirements

### Requirement: TypeScript combi module enumerates subsets in lexicographic order

**Reason**: `src/engine/combi/` is retired with its last caller, Light Up's discount over a clue's free neighbors, which a description states as a `subsets` binder.
**Migration**: A loop over every r-subset of a set is a technique's `T in subsets(S) where |T| = r` (`docs/descriptions.md` § "What a technique compiles to").

### Requirement: reset rewinds the enumeration to its start

**Reason**: `src/engine/combi/` is retired with its last caller.
**Migration**: None; a `subsets` binder has no iterator to rewind.

### Requirement: Advancing past exhaustion returns false and does not throw

**Reason**: `src/engine/combi/` is retired with its last caller.
**Migration**: None; a `subsets` binder has no iterator to advance.

### Requirement: Combi refuses an invalid (r, n) at construction

**Reason**: `src/engine/combi/` is retired with its last caller.
**Migration**: None; a `subsets` binder's size is pinned in its `where`.
