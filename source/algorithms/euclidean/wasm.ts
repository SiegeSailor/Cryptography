import { fitsInI64, getAlgorithmWasmExports } from "@/common/wasm";

export function wasmGcdIfAvailable(left: bigint, right: bigint): bigint | null {
  const wasmExports = getAlgorithmWasmExports("euclidean");
  if (
    !wasmExports?.gcd_u64 ||
    left < 0n ||
    right < 0n ||
    !fitsInI64(left) ||
    !fitsInI64(right)
  ) {
    return null;
  }

  try {
    return wasmExports.gcd_u64(left, right);
  } catch {
    return null;
  }
}
