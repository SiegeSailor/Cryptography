---
description: Test, CI, and release guardrails
applyTo: "package.json,.github/workflows/**/*.yml,source/**/*.test.ts,scripts/**/*.js"
---

# Script policy

[NPM scripts](./package.json) are organized with [ESLint Package.json Conventions](https://eslint.org/docs/latest/contribute/package-json-conventions):

# Validation flows

- Unit tests: `npm run test`.
- Local wasm confidence: `npm run build:wasm:strict && npm run build:wasm:check && npm run test -- --runInBand`.
- CI validation: `npm run test:coverage -- --ci --runInBand --verbose && npm run build`.

- Required environment: Node `>= 25.2.1`; local wasm compilation also expects LLVM clang and lld as described in [CONTRIBUTING.md](../CONTRIBUTING.md).
- Local iteration: `npm run test` and `npm run build`.
- Wasm confidence flow: `npm run build:wasm:strict && npm run build:wasm:check && npm run test -- --runInBand`.
- CI parity flow: `npm run test:coverage -- --ci --runInBand --verbose && npm run build`.

# CI and release expectations

- Preserve the semantic-release entry point: `release`.
- Keep workflow commands aligned with script names in `package.json`.
- If changing test/build behavior, verify both local and CI paths remain consistent.

# Risk checks before merge

- Confirm algorithm behavior changes include tests.
- Confirm wasm-related changes keep fallback behavior intact.
- Confirm no generated artifacts are being proposed for commit.
