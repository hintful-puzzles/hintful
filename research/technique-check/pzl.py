"""Compile the language's forms to z3, and check techniques and entailment.

The forms of `language.md` § "Expressions" are built as a small tree of nodes
and compiled for a polarity: a node asserted (+1) or denied (-1). Polarity is
what lets a fixed point be stated either way, exactly: asserted, a member of a
least fixed point carries a derivation rank; denied, a closed set witnesses
that it is not reached. Entailment needs both, since it denies the rules of
one game while asserting the other's.

Elements are Python values (cells, units, digits). A technique's bound
variables are symbolic: each is a one-hot choice among its set's elements
inside the one query, so a technique is checked by one solver call however
many bindings it has. A term over a symbolic element (`value(c)` with `c`
bound) is the sum over its possible elements, each under its guard.

Sets are dictionaries from element to membership, a Python bool or a z3
formula. A membership that is a formula comes from a bound variable or from
dealt regions, never from an answer-dependent predicate: those are written
with the fixed-point nodes below.
"""

import itertools

import z3

_fresh = itertools.count()


def fresh(prefix):
    return f"{prefix}#{next(_fresh)}"


def as_z3(x):
    if isinstance(x, bool):
        return z3.BoolVal(x)
    if isinstance(x, int):
        return z3.IntVal(x)
    return x


# ------------------------------------------------------------------ elements


class Sym:
    """A symbolic element: exactly one of `guards` holds in any model."""

    def __init__(self, guards):
        self.guards = guards  # element -> z3 Bool

    def __repr__(self):
        return f"Sym({list(self.guards)})"


def guards(x):
    """An element, concrete or symbolic, as element -> guard."""
    return x.guards if isinstance(x, Sym) else {x: z3.BoolVal(True)}


def lift(f, *args):
    """Apply a Python function of concrete elements to concrete or symbolic
    arguments. A z3 Bool result is joined by `or`, an Int by a guarded sum, a
    node by `Or` of guarded nodes."""
    if not any(isinstance(a, Sym) for a in args):
        return f(*args)
    combos = itertools.product(*[list(guards(a).items()) for a in args])
    parts = []
    for combo in combos:
        g = z3.And([gd for _, gd in combo])
        parts.append((g, f(*[e for e, _ in combo])))
    first = parts[0][1]
    if isinstance(first, Node):
        return Or(*[And(Atom(g), n) for g, n in parts])
    if isinstance(first, (bool,)) or z3.is_bool(as_z3(first)):
        return z3.Or([z3.And(g, as_z3(v)) for g, v in parts])
    total = z3.IntVal(0)
    for g, v in parts:
        total = total + z3.If(g, as_z3(v), 0)
    return total


def same(a, b):
    """Two elements are the same element."""
    ga, gb = guards(a), guards(b)
    return z3.Or([z3.And(ga[e], gb[e]) for e in ga if e in gb]) if any(e in gb for e in ga) else z3.BoolVal(False)


# ---------------------------------------------------------------------- sets


def members(s):
    """A set as element -> membership."""
    if isinstance(s, dict):
        return s
    return {e: True for e in s}


def minus(s, *xs):
    out: dict = dict(members(s))
    for x in xs:
        for e, g in guards(x).items():
            if e in out:
                out[e] = z3.And(as_z3(out[e]), z3.Not(g))
    return out


def union_over(x, f):
    """The set f(e) for the element x, concrete or symbolic."""
    out = {}
    for e, g in guards(x).items():
        for m, mg in members(f(e)).items():
            term = z3.And(g, as_z3(mg))
            out[m] = z3.Or(as_z3(out[m]), term) if m in out else term
    return out


def where(s, cond):
    """Elements of s with cond, a Python predicate of a concrete element
    returning a z3 Bool that does not depend on polarity."""
    return {e: z3.And(as_z3(g), as_z3(cond(e))) for e, g in members(s).items()}


# --------------------------------------------------------------------- nodes


class Node:
    def z(self, pol):
        raise NotImplementedError

    def __and__(self, other):
        return And(self, other)

    def __or__(self, other):
        return Or(self, other)

    def __invert__(self):
        return Not(self)


def node(x):
    return x if isinstance(x, Node) else Atom(as_z3(x))


class Atom(Node):
    """A formula with no fixed point in it: the same either way."""

    def __init__(self, f):
        self.f = as_z3(f)

    def z(self, pol):
        return self.f if pol > 0 else z3.Not(self.f)


class And(Node):
    def __init__(self, *xs):
        self.xs = [node(x) for x in xs]

    def z(self, pol):
        parts = [x.z(pol) for x in self.xs]
        return z3.And(parts) if pol > 0 else z3.Or(parts)


class Or(Node):
    def __init__(self, *xs):
        self.xs = [node(x) for x in xs]

    def z(self, pol):
        parts = [x.z(pol) for x in self.xs]
        return z3.Or(parts) if pol > 0 else z3.And(parts)


class Not(Node):
    def __init__(self, x):
        self.x = node(x)

    def z(self, pol):
        return self.x.z(-pol)


def Implies(a, b):
    return Or(Not(a), b)


class Forall(Node):
    def __init__(self, s, body):
        self.s, self.body = members(s), body

    def z(self, pol):
        if pol > 0:
            return z3.And([z3.Implies(as_z3(g), node(self.body(e)).z(1)) for e, g in self.s.items()])
        return z3.Or([z3.And(as_z3(g), node(self.body(e)).z(-1)) for e, g in self.s.items()])


class Exists(Node):
    def __init__(self, s, body):
        self.s, self.body = members(s), body

    def z(self, pol):
        if pol > 0:
            return z3.Or([z3.And(as_z3(g), node(self.body(e)).z(1)) for e, g in self.s.items()])
        return z3.And([z3.Implies(as_z3(g), node(self.body(e)).z(-1)) for e, g in self.s.items()])


def count(s, cond):
    """How many elements of s satisfy cond (a z3 Bool of a concrete element)."""
    return z3.Sum([z3.If(z3.And(as_z3(g), as_z3(cond(e))), 1, 0) for e, g in members(s).items()] or [z3.IntVal(0)])


# ------------------------------------------------------------ fixed points


def steps_of(adj, e):
    """e's neighbors as (neighbor, guard): `adj[e]` lists a neighbor alone, or
    with a z3 guard when the step depends on the answer (a drawn edge)."""
    out = []
    for y in adj[e]:
        out.append(y if isinstance(y, tuple) and len(y) == 2 and z3.is_expr(y[1]) else (y, z3.BoolVal(True)))
    return out


class Reach(Node):
    """`target` is in the least set holding `sources` and closed under steps
    from a member to a neighbor in `within`: the chain of language.md, and the
    commonest least fixed point. `adj` maps an element to its neighbors;
    `within` and `sources` are sets with z3 memberships; `target` an element.
    """

    def __init__(self, sources, target, within, adj):
        self.sources, self.target = members(sources), target
        self.within, self.adj = members(within), adj

    def z(self, pol):
        inn = {e: as_z3(g) for e, g in self.within.items()}
        src = {e: as_z3(g) for e, g in self.sources.items()}
        tag = fresh("reach")
        tg = guards(self.target)
        if pol > 0:
            # A derivation: each reached element has a rank, a source at 0 and
            # every other one step past a reached neighbor of lower rank.
            got = {e: z3.Bool(f"{tag}_in_{e}") for e in inn}
            rank = {e: z3.Int(f"{tag}_rk_{e}") for e in inn}
            cs = []
            for e in inn:
                base = z3.And(inn[e], src.get(e, z3.BoolVal(False)), rank[e] == 0)
                steps = [z3.And(got[y], inn[e], lk, rank[y] < rank[e]) for y, lk in steps_of(self.adj, e) if y in inn]
                cs.append(z3.Implies(got[e], z3.Or([base] + steps)))
                cs.append(rank[e] >= 0)
            cs.append(z3.Or([z3.And(g, got[e]) for e, g in tg.items() if e in got] or [z3.BoolVal(False)]))
            return z3.And(cs)
        # Not reached: a set holding every source and closed under steps, that
        # does not hold the target. The least fixed point is inside any such set.
        closed = {e: z3.Bool(f"{tag}_cl_{e}") for e in inn}
        cs = []
        for e in inn:
            cs.append(z3.Implies(z3.And(inn[e], src.get(e, z3.BoolVal(False))), closed[e]))
            for y, lk in steps_of(self.adj, e):
                if y in inn:
                    cs.append(z3.Implies(z3.And(closed[e], inn[y], lk), closed[y]))
        cs.append(z3.And([z3.Implies(g, z3.Or(z3.Not(inn[e]), z3.Not(closed[e]))) for e, g in tg.items() if e in inn]))
        return z3.And(cs)


def reaches(a, b, within, adj):
    """b is reached from a by steps inside `within` (a and b inside it)."""
    return Reach(dict(guards(a)), b, within, adj)


class Connected(Node):
    """The members of `s` form one component under `adj`: language.md's
    `connected`. Asserted, a root and distances; denied, two members and a
    closed set that holds one and not the other."""

    def __init__(self, s, adj):
        self.s, self.adj = members(s), adj

    def z(self, pol):
        inn = {e: as_z3(g) for e, g in self.s.items()}
        tag = fresh("conn")
        if pol > 0:
            dist = {e: z3.Int(f"{tag}_d_{e}") for e in inn}
            root = {e: z3.Bool(f"{tag}_r_{e}") for e in inn}
            n = len(inn)
            cs = [z3.AtMost(*root.values(), 1),
                  z3.Implies(z3.Or(list(inn.values())), z3.Or(list(root.values())))]
            for e in inn:
                cs.append(z3.Implies(root[e], z3.And(inn[e], dist[e] == 0)))
                nbrs = [(y, lk) for y, lk in steps_of(self.adj, e) if y in inn]
                step = z3.Or([z3.And(inn[y], lk, dist[y] == dist[e] - 1) for y, lk in nbrs]) if nbrs else z3.BoolVal(False)
                cs.append(z3.Implies(z3.And(inn[e], z3.Not(root[e])), z3.And(dist[e] >= 1, dist[e] <= n, step)))
            return z3.And(cs)
        p = choose(self.s, f"{tag}_p")
        q = choose(self.s, f"{tag}_q")
        return z3.And(p.constraint, q.constraint, Reach(dict(p.sym.guards), q.sym, self.s, self.adj).z(-1))


# ------------------------------------------------------------------ fillings


class ExistsFill(Node):
    """`exists fill f of S: P(f)`: some assignment of a value from `domain(e)`
    to each element of S makes P hold. Asserted, the assignment is fresh
    variables; denied, every assignment is enumerated (the sets a board bounds
    are small), and the check gives up past `cap` assignments."""

    cap = 20000

    def __init__(self, s, domain, body):
        self.s, self.domain, self.body = members(s), domain, body

    def z(self, pol):
        elems = list(self.s)
        if pol > 0:
            tag = fresh("fill")
            f = {e: z3.Int(f"{tag}_{e}") for e in elems}
            dom = [z3.Implies(as_z3(self.s[e]), z3.Or([f[e] == v for v in self.domain(e)])) for e in elems]
            return z3.And(dom + [node(self.body(f)).z(1)])
        doms = [self.domain(e) for e in elems]
        total = 1
        for d in doms:
            total *= len(d)
        if total > self.cap:
            raise Undecided(f"a denied filling of {total} assignments")
        out = []
        for vals in itertools.product(*doms):
            f = {e: z3.IntVal(v) for e, v in zip(elems, vals)}
            out.append(node(self.body(f)).z(-1))
        return z3.And(out)


def ForallFill(s, domain, body):
    return Not(ExistsFill(s, domain, lambda f: Not(body(f))))


class Undecided(Exception):
    pass


# ------------------------------------------------------------------ bindings


class Choice:
    def __init__(self, sym, constraint):
        self.sym, self.constraint = sym, constraint


def choose(s, name):
    """A symbolic element of s, constrained to be exactly one member."""
    ms = members(s)
    gs = {e: z3.Bool(f"{name}={e}") for e in ms}
    c = z3.And(z3.PbEq([(g, 1) for g in gs.values()], 1),
               z3.And([z3.Implies(gs[e], as_z3(m)) for e, m in ms.items()]))
    return Choice(Sym(gs), c)


# ------------------------------------------------------------------- queries


class Technique:
    """A technique: bound variables, each over a set that may name an earlier
    one, a premise and a conclusion, both functions of the bound elements."""

    def __init__(self, name, binds, premise, conclusion):
        self.name, self.binds = name, binds
        self.premise, self.conclusion = premise, conclusion


def solve(constraints, timeout_s=None):
    s = z3.Solver()
    if timeout_s:
        s.set("timeout", int(timeout_s * 1000))
    s.add(constraints)
    r = s.check()
    return r, (s.model() if r == z3.sat else None)


def check_technique(rules, consistent, technique, timeout_s=None, split=0,
                    answer_vars=None, verify=None, rounds=200):
    """Is the technique sound on this board? Returns (verdict, model, env):
    'sound', 'unsound' with the counterexample, or 'unknown' on timeout.

    The rules are compiled into one incremental solver once. The first `split`
    bound variables are enumerated, each prefix one push of the solver; the
    rest are symbolic inside that query. split=0 is one query for the whole
    technique, split=len(binds) is experiment C's one query a binding.

    With `verify`, every counterexample is read back as concrete values of
    `answer_vars` (name -> dict of z3 terms) and judged by `verify`, a plain
    Python evaluation of the rules written apart from the z3 encoding. The
    encoded `rules` may then be a consequence of the game's rules, with more
    answers: a counterexample `verify` rejects is blocked and the search goes
    on. So 'unsound' rests on an answer the independent reading accepts, and
    'sound' on an encoding that may only be weaker than the game."""
    s = z3.Solver()
    if timeout_s:
        s.set("timeout", int(timeout_s * 1000))
    s.add([node(r).z(1) for r in rules])
    s.add(node(consistent).z(1))
    rejected = 0

    def prefixes(i, env):
        if i == split:
            yield env
            return
        name, setf = technique.binds[i]
        for e, g in members(setf(env)).items():
            if z3.is_false(z3.simplify(as_z3(g))):
                continue
            yield from prefixes(i + 1, {**env, name: e, f"_{name}_guard": as_z3(g)})

    for prefix in prefixes(0, {}):
        env = {k: v for k, v in prefix.items() if not k.startswith("_")}
        cs = [v for k, v in prefix.items() if k.startswith("_")]
        for name, setf in technique.binds[split:]:
            ch = choose(setf(env), f"bind_{name}")
            env[name] = ch.sym
            cs.append(ch.constraint)
        cs.append(node(technique.premise(env)).z(1))
        cs.append(node(technique.conclusion(env)).z(-1))
        s.push()
        s.add(cs)
        try:
            while True:
                r = s.check()
                if r == z3.unsat:
                    break
                if r != z3.sat:
                    return "unknown", None, env
                m = s.model()
                if verify is None:
                    return "unsound", m, env
                values = {k: {e: m.eval(t, model_completion=True) for e, t in d.items()} for k, d in answer_vars.items()}
                concrete = {k: {e: (z3.is_true(v) if z3.is_bool(v) else v.as_long()) for e, v in d.items()}
                            for k, d in values.items()}
                if verify(concrete):
                    return "unsound", m, env
                rejected += 1
                if rejected > rounds:
                    return "unknown", None, env
                s.add(z3.Or([t != values[k][e] for k, d in answer_vars.items() for e, t in d.items()]))
        finally:
            s.pop()
    return ("sound" if rejected == 0 else f"sound ({rejected} rejected)"), None, {}


def check_entails(rules_y, rules_x, timeout_s=None):
    """Does every answer of Y's rules satisfy X's? 'entails', 'not' with a
    counterexample, or 'unknown'."""
    cs = [node(r).z(1) for r in rules_y] + [And(*rules_x).z(-1)]
    r, m = solve(cs, timeout_s)
    return ("entails" if r == z3.unsat else "not" if r == z3.sat else "unknown"), m


def write_results(path, results):
    """Merge this run's lines into a results table, one line a check, keyed by
    pair: a pair run again replaces its lines, and the others stay."""
    table = {}
    try:
        with open(path) as f:
            for line in f:
                if line.strip():
                    table.setdefault(line.split()[0], []).append(line.rstrip("\n"))
    except FileNotFoundError:
        pass
    for pair, rows in results.items():
        table[pair] = [f"{pair:4} {r['check']:58} {r['verdict']:28} {r['seconds']:7}s"
                       + (f"   at {r['binding']}" if r.get("binding") else "") for r in rows]
    order = lambda k: (k[0], int("".join(ch for ch in k[1:] if ch.isdigit()) or 0))
    with open(path, "w") as f:
        for pair in sorted(table, key=order):
            f.write("\n".join(table[pair]) + "\n")


def binding_of(model, env):
    out = {}
    for k, sym in env.items():
        if not isinstance(sym, Sym):
            out[k] = sym
            continue
        for e, g in sym.guards.items():
            if z3.is_true(model.eval(g, model_completion=True)):
                out[k] = e
    return out
