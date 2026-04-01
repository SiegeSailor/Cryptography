---
description: Algorithm C implementation coding standards and integration rules
applyTo: "source/algorithms/**/main.c"
---

# Algorithm in C

- `main.c` implements the algorithm in C, compiled to `main.wasm` for accelerated path when available
- Check input prerequisites in C
- Errors thrown in C should be consistent with TypeScript error messages when the same input is given
- Errors thrown in C should be propagated and handled in the TypeScript layer
- If checks or implementation require another implemented algorithm, include it from another algorithm folder as a C dependency and use it, and compile it to WASM as well
