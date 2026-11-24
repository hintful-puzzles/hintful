/**
 * The letters a fill game's params are written by (`engine/fill/params/`),
 * each held by one field: `d` by the tier, then each setting's in the
 * settings' order, then the tier flag's. One compile holds one registry, so
 * a field cannot take a letter another already holds.
 */

import { CompileError } from "../compile-sorts.ts";

export class Letters {
  private readonly held = new Set<string>(["d"]);

  /** Holds `letter` for the field `where` names, refused where another
   * field holds it. */
  claim(letter: string, where: string): void {
    if (this.held.has(letter))
      throw new CompileError(`${where}: the letter ${letter} is taken`);
    this.held.add(letter);
  }

  /** Whether a field holds `letter`. */
  has(letter: string): boolean {
    return this.held.has(letter);
  }
}
