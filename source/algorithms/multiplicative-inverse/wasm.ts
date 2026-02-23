import {
  fitsInI64,
  getAlgorithmWasmExports,
  MIN_I64,
  normalizeI64,
} from "@/common/wasm";

export function wasmMultiplicativeInverseIfAvailable(
  base: bigint,
  modulo: bigint,
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("multiplicative-inverse");
  if (
    !wasmExports?.multiplicative_inverse_i64 ||
    modulo <= 1n ||
    !fitsInI64(base) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  try {
    const value = wasmExports.multiplicative_inverse_i64(
      normalizeI64(base),
      normalizeI64(modulo),
    );
    if (value === MIN_I64) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}