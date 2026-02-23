# CONTRIBUTING

Thank you for contributing to Formulas. Please read through the following guideline to ensure that we don't spend unnecessary time reviewing your contributions.

## Prerequisites

Required software for the client module:

- [Node.js](https://nodejs.org/): `25.2.1`
- [Clang](https://clang.llvm.org/): `17.0.0` with `wasm32` target support (optional, for local WASM compilation)

## Branching Strategy

This is basically a Git Flow with some adjustment to fit the NPM release process:

| Branch           | Git Tags                                | NPM Package      | Created From | Merge To             |
| ---------------- | --------------------------------------- | ---------------- | ------------ | -------------------- |
| `main`           | `#.#.#`                                 | Same as Git Tags |              |                      |
| `develop`        |                                         |                  |              | `release`            |
| `feature-<name>` |                                         |                  | `develop`    | `develop`            |
| `release`        | `#.#.#-release.#` for prereleases       | Same as Git Tags | `develop`    | `main` and `develop` |
| `hotfix-<name>`  | `#.#.#-hotfix-<name>.#` for prereleases | Same as Git Tags | `main`       | `main` and `develop` |

## Project Structure

The project is structured as follows:

```shell
├── source/
│   ├── algorithms/
│   │   └── <algorithm>/
│   │       ├── index.ts       # algorithm implementation
│   │       ├── index.test.ts  # tests
│   │       ├── wasm.ts        # algorithm-local WASM availability wrapper
│   │       └── main.c         # C source used to compile per-algorithm WASM
│   ├── common/
│   │   ├── constants.ts
│   │   ├── random.ts
│   │   ├── utilities.ts
│   │   └── wasm.ts            # shared low-level WASM utilities
│   ├── illustration/
│   ├── command.ts
│   └── entry-point.ts         # package public exports only
├── scripts/
│   ├── compile-wasm.js
│   ├── copy-wasm.js
│   └── cli-smoke.exp
└── build/
```

## Commands

Run local development CLI (TypeScript):

```bash
npm run dev
```

Run unit tests:

```bash
npm test
```

Run CI test mode:

```bash
npm run test:ci
```

Build package artifacts:

```bash
npm run build
```

Run full verification (tests + build):

```bash
npm run verify
```

Run CI pipeline locally:

```bash
npm run ci
```

Build internals:

1. `npm run build:wasm` (compile each algorithm `main.c` to `main.wasm` when toolchain supports it)
2. `npm run build:ts` (`tsc` + `tsc-alias`)
3. `npm run build:assets` (copy generated wasm files into build output)

## WASM notes

- Generated `.wasm` files are ignored by git and should not be committed.
- If your local `clang` does not support `wasm32`, the compile script prints a warning and skips wasm generation.
- Runtime still works because all algorithms preserve TypeScript fallback paths.

## WebAssembly behavior

- Each algorithm folder contains:
  - `index.ts` (TypeScript implementation)
  - `index.test.ts` (tests)
  - `main.c` (WASM source)
- At runtime, each algorithm attempts to use its own compiled `main.wasm` when available.
- If WASM is unavailable, input is unsupported by the WASM ABI, or loading fails, code falls back to TypeScript automatically.

## Coding conventions

- Use default export for each algorithm function in `index.ts`.
- Use `@/` imports for code under `source/` (configured in `tsconfig.json`).
- Do not import internal code from `@/entry-point`; import directly from `@/<folder>` (e.g., `@/algorithms/...`).
- Keep algorithm APIs stable and deterministic for tests.
