/**
 * Where a cataloged game's description is, from the repository's root. Its
 * own module, importing nothing, so the help build's configuration can name a
 * page's source without importing the engine.
 */
export const descriptionPath = (id: string): string =>
  `src/games/${id}/${id}.description.yaml`;
