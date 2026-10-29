"""Experiment C: check a technique stated in the language sound against the rules.

The language's expression forms (language.md § "Expressions") are written here as
nested tuples, one form per tuple, and compiled to z3 by grounding: every
quantifier runs over a finite set of the board, so an instance is a finite
formula. A technique is sound on a board when no answer satisfying the rules,
with marks consistent with it, makes the premise true and the conclusion false.

Forms:
  ('forall'|'exists', var, set, body)    quantifier over a finite set
  ('and'|'or', a, b, ...), ('not', a), ('implies', a, b)
  ('=', a, b), ('!=', a, b), ('<=', a, b), ('+', a, b), ('-', a, b)
  ('count', var, set, cond)              how many elements of set satisfy cond
  ('fn', name, arg, ...)                 an answer or marks function
  ('var', name)                          a bound variable; a bare int is a constant
  ('connected', var, set, cond)          the elements of set with cond are connected
                                         under the board's adjacency (positive only)
  ('separated', p, q, var, set, cond)    p and q lie in no common component of the
                                         elements with cond (positive only)
Sets:
  a name the board defines ('cells', 'units', 'digits', ...)
  ('members', x)                         the elements of unit x
  ('minus', S, x, ...)                   S without the elements x
  ('adj', x)                             x's neighbors

`connected` is asserted with a distance labeling and `separated` with a closed
set as witness, which is exact for these polarities: rules assert `connected`,
premises assert `separated`, and neither appears under a negation.
"""

import z3


class Board:
    def __init__(self, sets, members, adj, functions):
        self.sets = sets          # name -> list of elements
        self.members = members    # unit -> list of cells
        self.adj = adj            # cell -> list of cells
        self.functions = functions  # name -> (arity-1 dict or 2-arg dict) of z3 terms

    def setof(self, s, env):
        if isinstance(s, str):
            return self.sets[s]
        op = s[0]
        if op == "members":
            return self.members[self.val(s[1], env)]
        if op == "adj":
            return self.adj[self.val(s[1], env)]
        if op == "minus":
            drop = {self.val(x, env) for x in s[2:]}
            return [e for e in self.setof(s[1], env) if e not in drop]
        raise ValueError(f"unknown set {s}")

    def val(self, t, env):
        """A ground element or number (no z3), for set and function arguments."""
        if isinstance(t, tuple) and t[0] == "var":
            return env[t[1]]
        if isinstance(t, (int, str)):
            return t
        if isinstance(t, tuple) and t[0] == "pick":
            return self.val(t[1], env)[t[2]]
        if isinstance(t, tuple) and t[0] in ("+", "-"):
            a, b = self.val(t[1], env), self.val(t[2], env)
            return a + b if t[0] == "+" else a - b
        raise ValueError(f"not ground: {t}")

    def ev(self, f, env):
        if isinstance(f, (int, str)):
            return f
        op = f[0]
        if op == "var":
            return env[f[1]]
        if op in ("forall", "exists", "count"):
            _, v, s, body = f
            parts = [self.ev(body, {**env, v: e}) for e in self.setof(s, env)]
            if op == "count":
                return z3.Sum([z3.If(p, 1, 0) for p in parts]) if parts else z3.IntVal(0)
            if not parts:
                return z3.BoolVal(op == "forall")
            return z3.And(parts) if op == "forall" else z3.Or(parts)
        if op == "and":
            return z3.And([self.ev(x, env) for x in f[1:]])
        if op == "or":
            return z3.Or([self.ev(x, env) for x in f[1:]])
        if op == "not":
            return z3.Not(self.ev(f[1], env))
        if op == "implies":
            return z3.Implies(self.ev(f[1], env), self.ev(f[2], env))
        if op in ("=", "!=", "<=", "+", "-"):
            a, b = self.ev(f[1], env), self.ev(f[2], env)
            return {"=": lambda: a == b, "!=": lambda: a != b, "<=": lambda: a <= b,
                    "+": lambda: a + b, "-": lambda: a - b}[op]()
        if op == "fn":
            args = tuple(self.val(a, env) for a in f[2:])
            return self.functions[f[1]][args if len(args) > 1 else args[0]]
        if op == "connected":
            _, v, s, cond = f
            return self.connected([(e, self.ev(cond, {**env, v: e})) for e in self.setof(s, env)])
        if op == "separated":
            _, p, q, v, s, cond = f
            members = [(e, self.ev(cond, {**env, v: e})) for e in self.setof(s, env)]
            return self.separated(self.val(p, env), self.val(q, env), members)
        raise ValueError(f"unknown form {op}")

    def connected(self, members):
        """The elements whose condition holds form one component: one of them is a
        root at distance 0, and each other has a member neighbor one step nearer."""
        inn = dict(members)
        tag = id(members)
        dist = {e: z3.Int(f"d{tag}_{e}") for e in inn}
        root = {e: z3.Bool(f"r{tag}_{e}") for e in inn}
        n = len(inn)
        cs = [z3.AtMost(*root.values(), 1)]
        cs.append(z3.Implies(z3.Or(list(inn.values())), z3.Or(list(root.values()))))
        for e, ine in inn.items():
            cs.append(z3.Implies(root[e], z3.And(ine, dist[e] == 0)))
            nbrs = [y for y in self.adj[e] if y in inn]
            step = z3.Or([z3.And(inn[y], dist[y] == dist[e] - 1) for y in nbrs]) if nbrs else z3.BoolVal(False)
            cs.append(z3.Implies(z3.And(ine, z3.Not(root[e])), z3.And(dist[e] >= 1, dist[e] <= n, step)))
        return z3.And(cs)

    def separated(self, p, q, members):
        """A set holding p and not q, closed under adjacency among the members:
        no path of members joins them."""
        inn = dict(members)
        tag = id(members)
        r = {e: z3.Bool(f"R{tag}_{e}") for e in inn}
        cs = [r[p], z3.Not(r[q])] if p in r and q in r else [z3.BoolVal(False)]
        for e in inn:
            cs.append(z3.Implies(r[e], inn[e]))
            for y in self.adj[e]:
                if y in inn:
                    cs.append(z3.Implies(z3.And(r[e], inn[y]), r[y]))
        return z3.And(cs)


def check(board, rules, consistent, technique):
    """Search every binding of the technique's variables on the board for an
    answer that breaks it. Returns (bindings checked, counterexample or None)."""
    binds, premise, conclusion = technique
    checked = 0

    def envs(i, env):
        # A binding's set may name an earlier variable ("cell c in u").
        if i == len(binds):
            yield env
            return
        name, s = binds[i]
        for e in board.setof(s, env):
            yield from envs(i + 1, {**env, name: e})

    for env in envs(0, {}):
        s = z3.Solver()
        s.add([board.ev(r, {}) for r in rules])
        s.add(board.ev(consistent, {}))
        s.add(board.ev(premise, env))
        s.add(z3.Not(board.ev(conclusion, env)))
        checked += 1
        if s.check() == z3.sat:
            return checked, (env, s.model())
    return checked, None
