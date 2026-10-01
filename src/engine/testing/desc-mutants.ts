/**
 * Near-miss game descriptions: a real desc, broken by one small edit.
 *
 * `validateDesc` and `newState` read the same grammar twice, and junk input
 * cannot show where they disagree, because junk is refused before `newState` is
 * reached. A near miss is the input that can: it is mostly well formed, so a
 * validator that is loose about one character lets it through to a parser that
 * is strict about it.
 *
 * Every mutant is derived from the desc and the alphabet alone, with no RNG, so
 * a failure names the same input every run.
 *
 * Dev/test-only; never imported by production code.
 */

/** The distinct characters of `descs`, in code-point order — the alphabet a
 * "neighbor" is taken in. */
export function descAlphabet(descs: readonly string[]): string[] {
  const chars = new Set<string>();
  for (const d of descs) for (const c of d) chars.add(c);
  return [...chars].sort();
}

/**
 * Every one-edit mutant of `desc`, deduplicated, never `desc` itself:
 * each truncation, each character dropped, each doubled, and each replaced by
 * its neighbors in `alphabet` and by its neighbors in code-point order. The last
 * is what reaches a character the generator never writes (a `9` becoming `:`,
 * a `z` becoming `{`), and the alphabet neighbor is what changes a run letter
 * or a clue to one the generator does write.
 */
export function descMutants(desc: string, alphabet: readonly string[]): string[] {
  const out = new Set<string>();
  const at = new Map(alphabet.map((c, i) => [c, i]));
  for (let i = 0; i < desc.length; i++) {
    const head = desc.slice(0, i);
    const c = desc[i] as string;
    const tail = desc.slice(i + 1);
    out.add(head);
    out.add(head + tail);
    out.add(head + c + c + tail);
    const k = at.get(c);
    const swaps = [
      k !== undefined && k > 0 ? alphabet[k - 1] : undefined,
      k !== undefined ? alphabet[k + 1] : undefined,
      String.fromCodePoint((c.codePointAt(0) as number) - 1),
      String.fromCodePoint((c.codePointAt(0) as number) + 1),
    ];
    for (const s of swaps) if (s !== undefined) out.add(head + s + tail);
  }
  out.delete(desc);
  return [...out];
}
