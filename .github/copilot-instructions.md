# Copilot Instructions

Cryptography is a TypeScript cryptography library with per-algorithm WebAssembly acceleration, and a CLI for educational encryption flows and algorithm usage.

## Project Structure

The project is structured as follows:

```plaintext
├── 📁 source
│   ├── 📁 algorithms
│   │   └── 📁 [algorithm]
│   ├── 📁 shared
│   │   └── [file]
│   ├── 📁 key-encryption
│   │   └── [flow]
│   ├── command.ts # entrypoint for CLI
│   └── entry-point.ts # package public exports only
├── 📁 scripts # build and utility scripts
└── 📁 build # compiled output
```

| File(s)        | Purpose                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| command.ts     | CLI entry point, orchestrating user prompts and algorithm calls.         |
| entry-point.ts | Public exports for the package, re-exporting from algorithms and shared. |
| scripts/\*     | Build and utility scripts, used in NPM scripts.                          |
| build/\*       | Compiled output, ignored in source control.                              |

## Coding Standards

- Use UPPERCASE or UPPER_SNAKE_CASE for acronyms in function and variable names, e.g., `compileWASM` or `SEMANTIC_VERSION`
- Remove unused imports and variables

## Framework-Specific Guidance

- Ensure prerequisites described in [CONTRIBUTING.md](../CONTRIBUTING.md#prerequisites) are met for local development and testing
- Ensure CLI prompts and flows in `source/command.ts` are updated when adding new algorithms or key encryption flows
- Ensure CLI prompts and flows `source/command.ts` and helper functions in `source/shared/*` are automation-and-agent-friendly, e.g., by accepting parameters to avoid interactive-only logic, and adjust result and error outputs formatting

## Architecture Decisions

- Treat `source/` as the source of truth
- Keep algorithm work co-located in `source/algorithms/*/`
- Public exports wired through `source/entry-point.ts`
- CLI orchestration lives in `source/command.ts`

## Compliance Requirements

- Algorithm implementations must be atomic and deterministic, and should not have side effects outside of their defined inputs and outputs
- WASM implementations must have a TypeScript fallback that preserves behavior and error handling when WASM loading or execution fails
- Tests must cover both nominal and edge-case behavior, and should be deterministic
