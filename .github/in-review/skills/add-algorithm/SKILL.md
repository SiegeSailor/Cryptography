---
name: add-algorithm
description: "Add or update a cryptography algorithm in this repo, including source/algorithms layout, deterministic tests, optional WebAssembly support, and source/entry-point export wiring. Use when scaffolding a new algorithm, extending an existing one, or deciding whether main.c and verify-wasm updates are required."
argument-hint: "Algorithm name, API shape, examples, and whether wasm is required"
---

# Add Algorithm

Use this skill to add a new algorithm or extend an existing one without breaking the repository's deterministic API, TypeScript fallback behavior, or package export surface.

## When To Use

- Add a brand-new algorithm under `source/algorithms/<name>/`.
- Update an existing algorithm while preserving public behavior.
- Decide whether a change needs wasm support now or should stay TypeScript-only.
- Wire a new algorithm into `source/entry-point.ts`.

## Required Inputs

- Algorithm folder name in kebab-case.
- Exported function name and signature.
- Expected inputs, outputs, and at least one concrete example.
- Whether wasm support is required, optional, or explicitly out of scope.
- Any constraints on bigint behavior, determinism, or educational CLI usage.

## Success Criteria

- The algorithm lives under `source/algorithms/<name>/` with the expected repo folder shape.
- `index.ts` remains the source of truth and default export.
- `index.test.ts` covers deterministic nominal and edge-case behavior.
- `source/entry-point.ts` exports the algorithm intentionally.
- If wasm is added, TypeScript fallback still works safely and `scripts/verify-wasm.js` stays in sync.
- No generated `.wasm` artifacts are committed.

## Procedure

1. Clarify scope before writing code.
   Confirm the algorithm name, function signature, expected examples, and whether the request is for library code only or also affects prompt-driven CLI flows.

2. Inspect nearby algorithm folders for a matching pattern.
   Reuse the existing shape: `index.ts` for implementation, `index.test.ts` for tests, and optional `main.c` for wasm.

3. Implement the TypeScript path first.
   Keep the algorithm deterministic, preserve stable parameter semantics, and use `@/` imports for shared utilities. Do not route internal imports through `@/entry-point`.

4. Add or update tests beside the implementation.
   Cover representative inputs, edge conditions, and any regression cases from the request. Prefer stronger assertions over weaker or broader snapshots.

5. Decide on wasm support explicitly.
   If wasm is not required or would complicate correctness, keep the implementation in TypeScript only.
   If wasm is required, add `main.c`, integrate it through the shared helpers in `source/shared/wasm.ts`, and keep the TypeScript path as a safe fallback when loading or ABI expectations fail.

6. Update repository integration points.
   Add the named export in `source/entry-point.ts`.
   If wasm was added, update the expected export mapping in `scripts/verify-wasm.js` in the same change.

7. Validate with the smallest correct command set.
   Run `npm run test` for all algorithm changes.
   If wasm behavior changed, run `npm run build:wasm:strict && npm run build:wasm:check && npm run test -- --runInBand`.
   Use `npm run build` when the change affects package exports or build integration.

8. Report the change clearly.
   Summarize what changed, why wasm was or was not included, how fallback behavior is preserved, and what commands were run.

## Decision Points

### When To Add `main.c`

- Add it when the request explicitly needs wasm acceleration now.
- Add it when an existing algorithm already has a wasm path that must stay parity-checked.
- Skip it when correctness, determinism, or delivery speed would be better served by a TypeScript-only implementation.

### When To Touch CLI Code

- Update CLI or prompt-layer code only if the user asks for interactive exposure or the algorithm must be reachable through existing command flows.
- Otherwise keep the change limited to `source/algorithms/` and `source/entry-point.ts`.

## Guardrails

- Keep behavior deterministic for every public algorithm API.
- Treat `build/` as generated output, not source.
- Keep changes minimal and co-located in the algorithm folder whenever possible.
- Do not change public API names unless explicitly requested.
- Do not commit generated `.wasm` files.

## Output Expectations

- `source/algorithms/<name>/index.ts`
- `source/algorithms/<name>/index.test.ts`
- Optional `source/algorithms/<name>/main.c`
- `source/entry-point.ts`
- Optional `scripts/verify-wasm.js`

## Completion Checklist

- Function name, signature, and export are intentional.
- Tests cover nominal behavior and edge cases.
- Wasm decision is explicit and justified.
- Fallback behavior remains valid if wasm is unavailable.
- Verification commands were run and reported.
