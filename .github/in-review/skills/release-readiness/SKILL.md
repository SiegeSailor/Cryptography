# Release Readiness

Use this skill to perform a release-readiness review for test, build, exports, and packaging risk.

## When To Use

- Before merge to `main`
- Before manual release verification
- When validating CI parity and semantic-release safety

## Checklist

1. Confirm no generated artifacts are included unexpectedly (`build/`, `.wasm`).
2. Validate package scripts still align with workflow expectations.
3. Run and report:
   - `npm run test:coverage -- --ci --runInBand --verbose`
   - `npm run build`
4. Confirm public exports in `source/entry-point.ts` are intentional.
5. Confirm algorithm/test changes are deterministic and covered.
6. Confirm wasm verification mappings are aligned with algorithm set.
7. Flag potential semantic-release risks (script drift, commit intent ambiguity).

## Output Format

- Findings by severity: high, medium, low
- Concrete file references for each finding
- Pass/fail recommendation for merge to `main`
