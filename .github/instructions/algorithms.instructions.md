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
- `main.c` implements the same algorithm in C, compiled to `main.wasm` for accelerated path when available

## Naming Conventions

- Keep algorithm folders in kebab-case under `source/algorithms/`, e.g. `pollard-p1-factorization`

## Integration Rules

- Keep algorithm APIs and return types stable, deterministic, and testable
- Preserve function names and parameter semantics unless explicitly requested

## Testing Rules

- Validate both nominal and edge-case behavior
- Do not remove assertions unless replacing them with stronger coverage
