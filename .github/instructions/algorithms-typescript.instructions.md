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
