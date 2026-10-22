# build-pipeline Specification Delta — keep-games-out-of-the-vite-config

## ADDED Requirements

### Requirement: The build configuration imports no game or engine code

The Vite configuration and its plugins SHALL NOT import a module under `src/games/` or `src/engine/` when the configuration loads. A plugin that needs the games SHALL load them when it renders, through a loader the dev server or the build provides, so that an edit to a game or the engine hot-reloads without restarting the dev server.

#### Scenario: An engine edit is a hot reload

- **WHEN** a file under `src/engine/` changes while the dev server runs
- **THEN** the server does not restart

#### Scenario: A help page in dev shows the current game code

- **WHEN** a game's controls change while the dev server runs and its help page is reloaded
- **THEN** the page shows the new controls
