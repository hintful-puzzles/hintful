/**
 * Source read as a syntax tree: what a guard that asks about our own code
 * keys on, so that it finds a reference, a type or an id rather than a
 * spelling (`docs/method.md` § "A scan that keys on a name").
 *
 * One parse per file per worker, whoever asks: the trees are cached by path,
 * so a second guard over the same sources pays nothing. Parsing is several
 * times cheaper than the comment stripping a text scan needs
 * (`code-lines.ts`), and a tree has no comments to strip: a comment is
 * trivia, never a node.
 *
 * This module holds no glob. Each source a guard can read stays in a module
 * of its own (`code-lines.ts` says why), and hands its text here.
 *
 * Dev/test-only; never imported by production code.
 */
import ts from "typescript";

const trees = new Map<string, ts.SourceFile>();

/** `text`'s syntax tree, parsed once per `path` and kept. */
export function parsed(path: string, text: string): ts.SourceFile {
  const hit = trees.get(path);
  if (hit !== undefined && hit.text === text) return hit;
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
  trees.set(path, sf);
  return sf;
}

/** Every node under `root`, itself included, parents before children. */
export function* nodesOf(root: ts.Node): Generator<ts.Node> {
  const stack: ts.Node[] = [root];
  while (stack.length > 0) {
    const n = stack.pop() as ts.Node;
    yield n;
    const kids: ts.Node[] = [];
    ts.forEachChild(n, (k) => {
      kids.push(k);
    });
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i] as ts.Node);
  }
}

/** `path:line` of a node, for a failure message. */
export function where(node: ts.Node): string {
  const sf = node.getSourceFile();
  return `${sf.fileName}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
}

/** A node's source as written, trimmed to one line for a failure message. */
export function shown(node: ts.Node): string {
  return node.getText().replace(/\s+/g, " ").slice(0, 160);
}

/** The name a call is made through: `f` for `f(…)` and `a.b.f(…)` alike,
 * `null` for a computed callee. Type arguments do not change it, so
 * `f<T>(…)` is a call to `f`. */
function calleeName(call: ts.CallExpression | ts.NewExpression): string | null {
  const e = call.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  return null;
}

/** Every call under `root` made through the name `name`. */
export function callsTo(root: ts.Node, name: string): ts.CallExpression[] {
  return [...nodesOf(root)].filter(
    (n): n is ts.CallExpression => ts.isCallExpression(n) && calleeName(n) === name,
  );
}

/** Where a relative specifier written in the file at `from` points, as a
 * repo-relative path; a package specifier is returned as written. Both paths
 * are repo-relative (`src/engine/x.ts`), which is what every tree parsed for a
 * guard is named by. */
export function resolveSpecifier(from: string, spec: string): string {
  if (!spec.startsWith(".")) return spec;
  const parts = from.split("/").slice(0, -1);
  for (const seg of spec.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

/** Whether an import or re-export survives compilation under
 * `verbatimModuleSyntax`: it is not `import type`, and does not bind types
 * alone. A side-effect import, and an empty `{}`, are kept. */
function isValueImport(st: ts.ImportDeclaration | ts.ExportDeclaration): boolean {
  const someValue = (els: readonly { isTypeOnly: boolean }[]): boolean =>
    els.length === 0 || els.some((e) => !e.isTypeOnly);
  if (ts.isExportDeclaration(st)) {
    if (st.isTypeOnly) return false;
    const c = st.exportClause;
    return c === undefined || !ts.isNamedExports(c) || someValue(c.elements);
  }
  const clause = st.importClause;
  if (clause === undefined) return true;
  if (clause.phaseModifier === ts.SyntaxKind.TypeKeyword) return false;
  if (clause.name !== undefined) return true;
  const b = clause.namedBindings;
  return b === undefined || ts.isNamespaceImport(b) || someValue(b.elements);
}

/** One module a file reaches for: `value` survives compilation, `type` is
 * erased, `dynamic` is an `import()` evaluated when called. */
export interface ImportEdge {
  /** The specifier as written. */
  readonly spec: string;
  /** Resolved ({@link resolveSpecifier}). */
  readonly module: string;
  readonly kind: "value" | "type" | "dynamic";
}

/** Every import, re-export and literal `import()` in `sf`. */
export function importsOf(sf: ts.SourceFile): ImportEdge[] {
  const edge = (spec: string, kind: ImportEdge["kind"]): ImportEdge => ({
    spec,
    module: resolveSpecifier(sf.fileName, spec),
    kind,
  });
  const out: ImportEdge[] = [];
  for (const st of sf.statements)
    if (
      (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) &&
      st.moduleSpecifier !== undefined &&
      ts.isStringLiteral(st.moduleSpecifier)
    )
      out.push(edge(st.moduleSpecifier.text, isValueImport(st) ? "value" : "type"));
  for (const n of nodesOf(sf)) {
    if (!ts.isCallExpression(n) || n.expression.kind !== ts.SyntaxKind.ImportKeyword)
      continue;
    const [arg] = n.arguments;
    if (arg !== undefined && ts.isStringLiteralLike(arg))
      out.push(edge(arg.text, "dynamic"));
  }
  return out;
}

/** The modules `sf` imports from or re-exports, resolved; with `values`,
 * only the imports that survive compilation. */
export function importedModules(sf: ts.SourceFile, values = false): string[] {
  return importsOf(sf)
    .filter((e) => (values ? e.kind === "value" : e.kind !== "dynamic"))
    .map((e) => e.module);
}

/** The names `sf` imports by name from `module` (a repo-relative path), each
 * by the name the module exports it under, however it is bound here. */
export function importedNames(sf: ts.SourceFile, module: string): string[] {
  const out: string[] = [];
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier))
      continue;
    if (resolveSpecifier(sf.fileName, st.moduleSpecifier.text) !== module) continue;
    const bindings = st.importClause?.namedBindings;
    if (bindings !== undefined && ts.isNamedImports(bindings))
      for (const el of bindings.elements) out.push((el.propertyName ?? el.name).text);
  }
  return out;
}

/** A function or a constant a name is bound to. */
export type Binding =
  | { readonly kind: "function"; readonly fn: ts.FunctionLikeDeclaration }
  | { readonly kind: "const"; readonly init: ts.Expression };

/** What `name` is declared as in `sf` itself: a function declared anywhere
 * in it, or a constant at its top level. */
function ownDeclaration(sf: ts.SourceFile, name: string): Binding | null {
  for (const n of nodesOf(sf))
    if (ts.isFunctionDeclaration(n) && n.name?.text === name && n.body !== undefined)
      return { kind: "function", fn: n };
  for (const st of sf.statements)
    if (ts.isVariableStatement(st))
      for (const d of st.declarationList.declarations)
        if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer)
          return ts.isArrowFunction(d.initializer) ||
            ts.isFunctionExpression(d.initializer)
            ? { kind: "function", fn: d.initializer }
            : { kind: "const", init: d.initializer };
  return null;
}

/** The declaration the module at `path` exports as `name`: its own, or one
 * it re-exports, by name or through `export *`. */
function exportedDeclaration(
  path: string,
  name: string,
  treeAt: (path: string) => ts.SourceFile | null,
  seen: ReadonlySet<string>,
): Binding | null {
  const sf = treeAt(path);
  if (sf === null || seen.has(path)) return null;
  const own = ownDeclaration(sf, name);
  if (own) return own;
  const next = new Set([...seen, path]);
  for (const st of sf.statements) {
    if (
      !ts.isExportDeclaration(st) ||
      st.moduleSpecifier === undefined ||
      !ts.isStringLiteral(st.moduleSpecifier)
    )
      continue;
    const from = resolveSpecifier(sf.fileName, st.moduleSpecifier.text);
    const clause = st.exportClause;
    if (clause === undefined) {
      const found = exportedDeclaration(from, name, treeAt, next);
      if (found) return found;
    } else if (ts.isNamedExports(clause)) {
      const el = clause.elements.find((e) => e.name.text === name);
      if (el)
        return exportedDeclaration(
          from,
          (el.propertyName ?? el.name).text,
          treeAt,
          next,
        );
    }
  }
  return null;
}

/**
 * What `name`, as written in `sf`, is bound to: its declaration in `sf`, or
 * else the declaration its named import leads to, through any re-exports, in
 * the trees `treeAt` gives by repo-relative path. `null` where neither
 * reaches a function or a constant: a parameter, a package.
 */
export function declarationOf(
  sf: ts.SourceFile,
  name: string,
  treeAt: (path: string) => ts.SourceFile | null,
): Binding | null {
  const own = ownDeclaration(sf, name);
  if (own) return own;
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier))
      continue;
    const b = st.importClause?.namedBindings;
    if (b === undefined || !ts.isNamedImports(b)) continue;
    const el = b.elements.find((e) => e.name.text === name);
    if (el === undefined) continue;
    return exportedDeclaration(
      resolveSpecifier(sf.fileName, st.moduleSpecifier.text),
      (el.propertyName ?? el.name).text,
      treeAt,
      new Set(),
    );
  }
  return null;
}

/** One export of one module, by repo-relative path: what a guard asks after,
 * rather than a spelling of its name. */
export interface ExportRef {
  readonly module: string;
  readonly name: string;
}

/** How a reference is used: called, constructed with `new`, or anything else
 * (passed, read, spread). */
export type UseKind = "call" | "new" | "reference";

/** One place `sf` refers to an export. */
export interface Use {
  /** The expression that stands for the export: the identifier, or `ns.name`
   * through a namespace import. */
  readonly node: ts.Identifier | ts.PropertyAccessExpression;
  readonly kind: UseKind;
}

function use(node: Use["node"]): Use {
  const p = node.parent;
  if (ts.isCallExpression(p) && p.expression === node) return { node, kind: "call" };
  if (ts.isNewExpression(p) && p.expression === node) return { node, kind: "new" };
  return { node, kind: "reference" };
}

/**
 * Every place `sf` refers to `ref`: through a named import of it (renamed or
 * not), through a namespace import as `ns.name`, or by its own name inside
 * the module that declares it. An import clause is not a use.
 *
 * Bound by the import, not by the spelling: a local of the same name bound
 * from elsewhere is not counted, and an import under another name is. A name
 * a function declares for itself shadowing the import is not told apart.
 */
export function usesOf(sf: ts.SourceFile, ref: ExportRef): Use[] {
  const locals = new Set<string>();
  const namespaces = new Set<string>();
  if (sf.fileName === ref.module) locals.add(ref.name);
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier))
      continue;
    if (resolveSpecifier(sf.fileName, st.moduleSpecifier.text) !== ref.module) continue;
    const bindings = st.importClause?.namedBindings;
    if (bindings === undefined) continue;
    if (ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
    else
      for (const el of bindings.elements)
        if ((el.propertyName ?? el.name).text === ref.name) locals.add(el.name.text);
  }
  if (locals.size === 0 && namespaces.size === 0) return [];
  const uses: Use[] = [];
  for (const n of nodesOf(sf)) {
    if (!ts.isIdentifier(n)) continue;
    if (ts.findAncestor(n, ts.isImportDeclaration) !== undefined) continue;
    const p = n.parent;
    // `x.name` and `{ name: … }` spell the name without referring to it.
    if (ts.isPropertyAccessExpression(p) && p.name === n) {
      if (
        n.text === ref.name &&
        ts.isIdentifier(p.expression) &&
        namespaces.has(p.expression.text)
      )
        uses.push(use(p));
      continue;
    }
    if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p)) && p.name === n)
      continue;
    if (locals.has(n.text)) uses.push(use(n));
  }
  return uses;
}
