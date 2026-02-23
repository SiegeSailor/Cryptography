import { fitsInI64, getAlgorithmWasmExports } from "@/common/wasm";

export function wasmPollardP1IfAvailable(
  input: bigint,
  maxExponent: number,
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("pollard-p-1-factorization");
  if (
    !wasmExports?.pollard_p1_i64 ||
    !fitsInI64(input) ||
    !Number.isInteger(maxExponent) ||
    maxExponent <= 0
  ) {
    return null;
  }

  try {
    const result = wasmExports.pollard_p1_i64(input, maxExponent);
    return result > 1n ? result : null;
  } catch {
    return null;
  }
}
