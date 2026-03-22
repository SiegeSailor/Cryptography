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

| Branch           | Release           | Created From | Merge To             |
| ---------------- | ----------------- | ------------ | -------------------- |
| `develop`        |                   |              | `release`            |
| `feature-<name>` |                   | `develop`    | `develop`            |
| `main`           | `#.#.#`           |              |                      |
| `release`        | `#.#.#-release.#` | `develop`    | `main` and `develop` |

## Project Structure

The project is structured as follows:

```plaintext
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

| Command                      | Purpose                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `build-typescript-output`    | Compile TypeScript and rewrite path aliases.                    |
| `build-webassembly-assets`   | Copy generated wasm binaries to build output tree.              |
| `build-webassembly-binaries` | Compile algorithm `main.c` files to `main.wasm` when available. |
| `build-webassembly-strict`   | Compile wasm and fail when wasm compilation is unavailable.     |
| `clean-workspace-files`      | Remove generated build directories.                             |
| `run-cli-compiled`           | Run CLI from compiled build output.                             |
| `run-cli-typescript`         | Run CLI directly from TypeScript sources.                       |
| `test-unit-suite`            | Run Jest test suite with default config.                        |
| `verify-webassembly-runtime` | Validate wasm artifacts and execute wasm smoke checks.          |
| `ci:build`                   | Build artifacts for CI validation.                              |
| `ci:install`                 | Install dependencies for workflow jobs.                         |
| `ci:publish`                 | Publish package to npm with provenance.                         |
| `ci:test`                    | Run CI-mode tests with verbose coverage output.                 |
| `ci:verify`                  | Execute CI test then CI build.                                  |
| `dev:build`                  | Build wasm binaries, TypeScript output, and wasm assets.        |
| `dev:clean`                  | Clean workspace outputs during local work.                      |
| `dev:run-compiled`           | Start compiled CLI flow.                                        |
| `dev:run`                    | Start local TypeScript CLI flow.                                |
| `dev:test-wasm`              | Strict wasm build + wasm runtime verify + unit tests.           |
| `dev:test`                   | Run local unit tests.                                           |

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
