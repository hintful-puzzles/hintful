/** The switches that make a kept structure and a binding's reads check
 * themselves against fresh ones, for the tests (`describe-runtime.ts`). */

/** Whether every kept structure is checked against one made afresh at each
 * read, and how many reads have been: a guard's switch, never set in play. */
export let keptCheck = false;
let keptChecked = 0;

/** Turn the check of kept structures against fresh ones on or off, and say
 * how many reads it checked since it was last turned. */
export function setKeptCheck(on: boolean): number {
  keptCheck = on;
  const n = keptChecked;
  keptChecked = 0;
  return n;
}

/** Count one read of a kept structure checked against a fresh one: a
 * function, since a module that imports the count cannot assign it. */
export function keptReadChecked(): void {
  keptChecked++;
}

/** Whether a compiled binding, before it fires, reads all its binders afresh
 * from the marks and fails where one no longer holds, as the compiler's
 * reads made again should have passed it over: a guard's switch, never set
 * in play. Compiled code reads it as it stands, through the import. */
export let staleChecking = false;
let freshChecked = 0;

/** Turn the stale-read guard on or off, and say how many bindings it
 * checked since it was last turned. */
export function setStaleCheck(on: boolean): number {
  staleChecking = on;
  const n = freshChecked;
  freshChecked = 0;
  return n;
}

/** A binding about to fire, with its reads made afresh: each `holds[i]` is
 * whether the read `what[i]` names is true of the marks now. */
export function freshBinding(
  technique: string,
  holds: readonly boolean[],
  what: readonly string[],
): void {
  const i = holds.indexOf(false);
  if (i >= 0)
    throw new Error(`${technique} fired on a stale read: ${what[i]} no longer holds`);
  freshChecked++;
}
