/**
 * What a cases file's `holds` reads of a board (`game-cases.ts`,
 * `input-cases.ts`): a field by its path.
 *
 * Dev/test-only; never imported by production code.
 */

/** The field at `path` (`dealt.number.at`) of `state`, arrays read whole,
 * and a list of them (a line's runs) each as a list. */
function fieldOf(state: unknown, path: string): unknown {
  let at: unknown = state;
  for (const key of path.split(".")) {
    if (at === null || typeof at !== "object") return undefined;
    at = (at as Record<string, unknown>)[key];
  }
  const plain = (v: unknown): unknown =>
    ArrayBuffer.isView(v)
      ? Array.from(v as unknown as ArrayLike<number>)
      : Array.isArray(v)
        ? v.map(plain)
        : v;
  return plain(at);
}

/** What of `holds` `state` does not hold, one line a field. */
export function holdsDiffers(
  holds: Readonly<Record<string, unknown>>,
  state: unknown,
): string[] {
  return Object.entries(holds).flatMap(([path, want]) => {
    const got = fieldOf(state, path);
    return JSON.stringify(got) === JSON.stringify(want)
      ? []
      : [`${path} is ${JSON.stringify(got)}, not ${JSON.stringify(want)}`];
  });
}
