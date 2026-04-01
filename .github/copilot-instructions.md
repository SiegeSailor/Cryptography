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
│   ├── 📁 key-encryptions
│   │   └── [flow]
│   ├── command.ts
│   └── entry-point.ts
├── 📁 scripts
└── 📁 build
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

- Algorithm implementations must be atomic and deterministic, and should not have side effects
- C (WASM) implementations are mandatory and must have a TypeScript fallback
- Implementations in C and TypeScript must have consistent behavior and error handling
- Tests must cover both nominal and edge-case behavior, and should be deterministic
