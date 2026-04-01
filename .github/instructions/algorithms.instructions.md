---
description: Algorithm implementation coding standards and integration rules
applyTo: "source/algorithms/**/*"
---

# Algorithm

Each algorithm folder under `source/algorithms/*/` contains at least:

```plaintext
├── index.ts
├── index.test.ts
└── main.c
```

| File          | Purpose                                             |
| ------------- | --------------------------------------------------- |
| index.ts      | Algorithm and CLI implementation in TypeScript.     |
| index.test.ts | Tests for the algorithm.                            |
| main.c        | Algorithm implementation in C for WASM compilation. |

## Implementation Conventions

- `index.ts` exports a default function for the main algorithm implementation and a named `prompt` function for CLI interaction
  - `export default function main` for the main algorithm implementation, and follow the flow:
    - Check if WASM (`main.wasm` compiled from `main.c`) is available with a generic wrapper in `@/shared`
      - If available, proceed with WASM implementation (`main.c`), which should:
        1. Check input prerequisites in C
        2. Errors thrown in C should be propagated and handled in TypeScript
           - Friendly error messages are provided in C already
        3. If checks or implementation require another implemented algorithm, include it as a C dependency and use it, and compile it to WASM as well
      - If not available, fall back to TypeScript implementation (`index.ts` default export), which should:
        1. Check input prerequisites in TypeScript
        2. Errors thrown in TypeScript should be consistent with C error messages when the same input is given
        3. If checks or implementation require another implemented algorithm, import it as a TypeScript module and use it
  - `export async function prompt` for the CLI interaction
  - Use `bigint`-safe behavior consistently when expected by existing APIs
- `main.c` implements the same algorithm in C, compiled to `main.wasm` for accelerated path when available

## Naming Conventions

- Keep algorithm folders in kebab-case under `source/algorithms/`, e.g. `pollard-p1-factorization`

## Integration Rules

- Keep algorithm APIs and return types stable, deterministic, and testable
- Preserve function names and parameter semantics unless explicitly requested

## Testing Rules

- Validate both nominal and edge-case behavior
- Do not remove assertions unless replacing them with stronger coverage
