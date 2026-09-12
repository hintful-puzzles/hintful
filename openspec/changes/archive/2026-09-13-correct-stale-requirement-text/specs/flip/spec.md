## ADDED Requirements

### Requirement: Flip is registered in the engine registry

The `flip` puzzle SHALL be implemented as a native TS `Game` registered in the
engine registry, so the worker serves `flip` via the TS midend.

#### Scenario: Flip loads on the TS engine

- **WHEN** the app opens `flip`
- **THEN** it is constructed by the TS-midend-backed puzzle

## REMOVED Requirements

### Requirement: Flip is served by the native TS engine

**Reason**: It required every other catalog game to keep loading through the
C/WASM path and `puzzles/flip.c` to be deleted — the per-game hybrid that
`retire-c-engine` ended. No game loads through C/WASM and there is no
`puzzles/` directory, so the requirement described a tree that no longer exists.

**Migration**: Replaced by "Flip is registered in the engine registry", which
keeps the part that is still true. That every game is served by the TS engine is
`ts-migration` "The C engine is fully retired once every game is ported".
