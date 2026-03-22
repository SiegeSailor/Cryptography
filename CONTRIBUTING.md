# CONTRIBUTING

Thank you for contributing to Cryptography. Please read through the following guideline before making any contributions.

## Prerequisites

Required software for the client module:

- [Node.js](https://nodejs.org/): `>= 25.2.1`
- [LLVM Clang](https://clang.llvm.org/) with `wasm32` target support
- [LLVM LLD](https://lld.llvm.org/) (`wasm-ld` linker)

macOS setup for WASM builds:

```bash
brew install llvm
brew install lld
```

The build script auto-detects compilers in this order:

1. `WASM_CLANG` environment variable (if set)
2. `/opt/homebrew/opt/llvm/bin/clang`
3. `clang` from your `PATH`

If you want to use a specific compiler explicitly:

```bash
WASM_CLANG=/opt/homebrew/opt/llvm/bin/clang npm run build:wasm:strict
```

## Branching Strategy

This is basically a Git Flow with some adjustment to fit the NPM release process:

| Branch           | Git Tags                          | NPM Package      | Created From | Merge To             |
| ---------------- | --------------------------------- | ---------------- | ------------ | -------------------- |
| `develop`        |                                   |                  |              | `release`            |
| `feature-<name>` |                                   |                  | `develop`    | `develop`            |
| `main`           | `#.#.#`                           | Same as Git Tags |              |                      |
| `release`        | `#.#.#-release.#` for prereleases | Same as Git Tags | `develop`    | `main` and `develop` |

## Project Structure

The project is structured as follows:

```shell
├── 📁 source
│   ├── 📁 algorithms
│   │   └── 📁 [algorithm]
│   │       ├── index.ts      # algorithm implementation
│   │       ├── index.test.ts # tests
│   │       ├── wasm.ts       # algorithm-local WASM availability wrapper
│   │       └── main.c        # algorithm implementation in C for WASM compilation
│   ├── 📁 common
│   ├── 📁 illustration       # key encryption flows
│   ├── command.ts
│   └── entry-point.ts        # package public exports only
├── 📁 scripts
└── 📁 build
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

Run tests with strict local WASM verification:

```bash
npm run test:wasm
```

Run local CI test step:

```bash
npm run ci:test
```

Build package artifacts:

```bash
npm run build
```

Build and verify WASM artifacts only:

```bash
npm run verify:wasm
```

Run built CLI:

```bash
npm run start:build
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

1. `npm run prebuild` → `npm run build:wasm` (compile each algorithm `main.c` to `main.wasm` when toolchain supports it)
2. `npm run build:wasm:strict` (fails fast when no wasm32-capable clang is available)
3. `npm run build` → `npm run build:ts` + `npm run build:assets`
4. `npm run postbuild` (build completion summary)

CI internals:

1. `npm run preci` → `npm run clean`
2. `npm run ci` → `npm run ci:test` + `npm run ci:build`
3. `npm run postci` (CI completion summary)

Verify internals:

1. `npm run preverify` → `npm run test`
2. `npm run verify` → `npm run build`
3. `npm run postverify` (verification completion summary)

## WASM notes

- Generated `.wasm` files are ignored by git and should not be committed.
- If no wasm32-capable compiler is detected, `npm run build:wasm` prints a warning and skips wasm generation.
- Use `npm run build:wasm:strict` to fail immediately when wasm compilation is unavailable.
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
