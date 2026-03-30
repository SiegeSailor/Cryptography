# Wasm Parity Triage

Use this skill to diagnose and fix mismatches between TypeScript and WebAssembly behavior for an algorithm.

## When To Use

- Runtime mismatch between TypeScript and wasm results
- Fallback behavior differences
- Strict/non-strict wasm build discrepancies

## Required Inputs

- Algorithm name
- Observed mismatch or failure
- Repro inputs
- Environment details (OS, compiler availability, strict vs non-strict build)

## Triage Checklist

1. Reproduce failure with focused inputs.
2. Verify compiler detection and build-mode behavior in `scripts/compile-wasm.js`.
3. Inspect algorithm `index.ts`, shared wasm helpers in `source/shared/wasm.ts`, and optional `main.c` for ABI and value-range differences.
4. Validate expected export mapping and smoke checks in `scripts/verify-wasm.js`.
5. Confirm TypeScript fallback remains safe and deterministic.

## Fix Expectations

- Prefer the smallest change that restores parity.
- Add or strengthen tests in `index.test.ts` using failing repro inputs.
- Keep strict/non-strict wasm build semantics unchanged.

## Verification

- Run targeted tests first.
- Run `npm run test`.
- Run `npm run build:wasm:strict && npm run build:wasm:check && npm run test -- --runInBand` for final confidence.
- Summarize root cause, fix, and residual risk.
