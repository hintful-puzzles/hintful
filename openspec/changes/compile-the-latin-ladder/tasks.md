# Tasks

The session that takes this up revises these as it designs.

## 1. Design

- [ ] 1.1 Decide where descriptions and the compiler live in `src/`, and how a build step emits the compiled techniques (a Vite plugin, or generated files the typechecker sees)
- [ ] 1.2 Decide how a compiled firing records for the hint, and how Unequal's words read its bindings

## 2. The checker

- [ ] 2.1 Port `research/technique-check/` to TypeScript with `z3-solver`; its validate and planted cases pass
- [ ] 2.2 Check every technique of `library/latin.json` and Unequal's descriptions sound against their rules on small boards

## 3. Compile

- [ ] 3.1 Compile the Latin library and Unequal's techniques; compare against the interpreter and the hand-written solver on dealt boards (closures, grades, firings)
- [ ] 3.2 Replace the hand-written layer; every existing test and hint guard passes unchanged
- [ ] 3.3 Measure the generator's time per deal against today's, and run the app

## 4. Next

- [ ] 4.1 File the next Latin game in the order of fit, and archive
