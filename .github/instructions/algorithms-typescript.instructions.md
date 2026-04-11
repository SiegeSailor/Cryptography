---
description: Algorithm TypeScript implementation coding standards and integration rules
applyTo: "source/algorithms/**/index.ts"
---

# Algorithm in TypeScript

- `export default function main` for the main algorithm implementation, and follow the flow:
  - Check if WASM (`main.wasm` compiled from `main.c`) is available with a generic wrapper `createWASMInvoker` in `@/shared`
    - If available, proceed with WASM implementation (`main.c`)
    - If not available, fall back to TypeScript implementation (`index.ts` default export), which should:
      1. Check input prerequisites in TypeScript
      2. Errors thrown in TypeScript should be consistent with C error messages when the same input is given
      3. If checks or implementation require another implemented algorithm, import it as a TypeScript module and use it
- `export async function prompt` for the CLI interaction
- Use `bigint`-safe behavior consistently when expected by existing APIs

## Documentation Rules

- Add a JSDoc block above every `export default function main`
- The summary must explain the mathematical problem, theorem, or relation being computed instead of restating the function name
- Add a second sentence when the algebraic setting, existence conditions, or result interpretation are needed to understand the contract
- Use `@param` tags to describe parameter meaning and mathematical constraints instead of repeating the TypeScript types
- Use `@returns` to describe the semantic result, including tuple ordering, array meaning, generator behavior, or sentinel values when relevant
- Add `@throws {Error}` only for validations that are explicitly enforced in the TypeScript implementation
- Keep this documentation scope limited to the default export `main`; do not add JSDoc to `prompt`, `runWASM*`, or nested helpers unless a task explicitly asks for that

Example:

```ts
/**
 * Solves the discrete logarithm problem by finding an exponent x such that
 * generator^x is congruent to base modulo modulo.
 *
 * The congruence is evaluated in the multiplicative group modulo modulo, so the
 * generator and base must both be coprime with the modulus.
 *
 * @param generator Base whose powers are searched in the congruence relation.
 * @param base Target residue in the congruence relation.
 * @param modulo Modulus of the congruence; must be greater than 1.
 * @returns The exponent x when a solution is found, or -1n when no solution is found.
 * @throws {Error} When modulo is not greater than 1.
 * @throws {Error} When generator and modulo are not coprime.
 * @throws {Error} When base and modulo are not coprime.
 */
export default function main(generator: bigint, base: bigint, modulo: bigint) {
  // ...
}
```

## Naming Conventions

- Use `run*` for internal helper functions that execute the core logic for the exported functions, e.g. `runWASMPollardP1Factorization` or `runPrompt`

## Integration Rules

- Use the shared helpers in `source/shared/*` instead of algorithm-local files for any common logic or utilities that may be used across multiple algorithms, e.g. input validation, WASM loading, or error handling
- Include or import another algorithm as a dependency when possible, rather than re-implementing shared or local logic
- If a new algorithm is added, also update `source/entry-point.ts` exports
- When a WASM support is added, ensure `scripts/verify-wasm.js` expected export mapping includes the new algorithm

## Testing Rules

- Add or update tests in `index.test.ts`
- Test both the TypeScript and WASM paths, ensuring consistent behavior and error handling
