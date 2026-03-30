---
description: WebAssembly compile and runtime fallback rules
applyTo: "source/algorithms/**/{index.ts,main.c},scripts/{compile-wasm.js,copy-wasm.js,verify-wasm.js},source/shared/wasm.ts"
---

# WASM contract

- WASM is an optimization path, not the only execution path.
- TypeScript implementations must remain valid fallback behavior.
- Runtime must fail safely to TypeScript when wasm loading or ABI constraints fail.

# Build behavior

- Preserve compiler discovery order from `scripts/compile-wasm.js`:
  1. `WASM_CLANG`
  2. `/opt/homebrew/opt/llvm/bin/clang`
  3. `clang` in `PATH`
- Keep non-strict flow warning-only when wasm toolchain is unavailable.
- Keep strict flow (`WASM_STRICT=1`) fail-fast when wasm cannot compile.

# Verification behavior

- Keep expected export mapping in `scripts/verify-wasm.js` synchronized with algorithm folders.
- Preserve smoke checks for core runtime confidence.
- If adding algorithm wasm exports, add verification entries in the same change.

# Artifact hygiene

- Do not commit generated `.wasm` binaries.
- Keep copy and verification scripts aligned with current algorithm set.
