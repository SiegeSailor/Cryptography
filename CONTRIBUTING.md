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
WASM_CLANG=/opt/homebrew/opt/llvm/bin/clang npm run build-webassembly-strict
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

### NPM script rules (condensed)

1. `ci:<command>` is reserved for GitHub workflows only.
2. `dev:<command>` is reserved for local development workflows.
3. Unprefixed commands are atomic internal building blocks and use hyphenated names.
4. Workflow files call only `ci:*` scripts.
5. Scripts that only print echo messages are removed.
6. `pre*` and `post*` hooks are not used for orchestration.

### Command reference

| Command | Scope | Purpose |
| --- | --- | --- |
| `npm run clean-workspace-files` | internal | Remove generated build directories. |
| `npm run run-cli-typescript` | internal | Run CLI directly from TypeScript sources. |
| `npm run run-cli-compiled` | internal | Run CLI from compiled build output. |
| `npm run test-unit-suite` | internal | Run Jest test suite with default config. |
| `npm run build-webassembly-binaries` | internal | Compile algorithm `main.c` files to `main.wasm` when available. |
| `npm run build-webassembly-strict` | internal | Compile wasm and fail when wasm compilation is unavailable. |
| `npm run verify-webassembly-runtime` | internal | Validate wasm artifacts and execute wasm smoke checks. |
| `npm run build-typescript-output` | internal | Compile TypeScript and rewrite path aliases. |
| `npm run build-webassembly-assets` | internal | Copy generated wasm binaries to build output tree. |
| `npm run dev:clean` | local dev | Clean workspace outputs during local work. |
| `npm run dev:run` | local dev | Start local TypeScript CLI flow. |
| `npm run dev:run-compiled` | local dev | Start compiled CLI flow. |
| `npm run dev:test` | local dev | Run local unit tests. |
| `npm run dev:test-wasm` | local dev | Strict wasm build + wasm runtime verify + unit tests. |
| `npm run dev:build` | local dev | Build wasm binaries, TypeScript output, and wasm assets. |
| `npm run ci:install` | CI/workflow | Install dependencies for workflow jobs. |
| `npm run ci:test` | CI/workflow | Run CI-mode tests with verbose coverage output. |
| `npm run ci:build` | CI/workflow | Build artifacts for CI validation. |
| `npm run ci:verify` | CI/workflow | Execute CI test then CI build. |
| `npm run ci:publish` | CI/workflow | Publish package to npm with provenance. |

## WASM notes

- Generated `.wasm` files are ignored by git and should not be committed.
- If no wasm32-capable compiler is detected, `npm run build-webassembly-binaries` prints a warning and skips wasm generation.
- Use `npm run build-webassembly-strict` to fail immediately when wasm compilation is unavailable.
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
