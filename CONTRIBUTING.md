# CONTRIBUTION

## Prerequisites

- Node.js >= 20
- npm >= 10
- Optional for local WASM compilation: `clang` with `wasm32` target support

## Setup

```bash
git clone https://github.com/SiegeSailor/formulas.git
cd formulas
npm install
```

## Project structure

- `source/algorithms/<algorithm>/index.ts`: TypeScript implementation
- `source/algorithms/<algorithm>/index.test.ts`: tests
- `source/algorithms/<algorithm>/main.c`: C source used to compile per-algorithm WASM
- `source/entry-point.ts`: library exports
- `source/command.ts`: CLI entry

## Commands

Run tests:

```bash
npm test
```

Run CLI in TS (dev mode):

```bash
npm run start
```

Build package:

```bash
npm run build
```

This build runs:

1. `npm run wasm:compile` (compile each algorithm `main.c` to `main.wasm` when toolchain supports it)
2. `npm test`
3. `tsc`
4. `tsc-alias`
5. `npm run wasm:copy` (copy generated wasm files into build output)

## WASM notes

- Generated `.wasm` files are ignored by git and should not be committed.
- If your local `clang` does not support `wasm32`, the compile script prints a warning and skips wasm generation.
- Runtime still works because all algorithms preserve TypeScript fallback paths.

## Coding conventions

- Use default export for each algorithm function in `index.ts`.
- Use `@/` imports for code under `source/` (configured in `tsconfig.json`).
- Keep algorithm APIs stable and deterministic for tests.
