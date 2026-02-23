import { fitsInI64, getAlgorithmWasmExports } from "@/common/wasm";

export function wasmPowModIfAvailable(
  base: bigint,
  exponent: bigint,
  modulo: bigint,
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("fast-modular-exponentiation");
  if (
    !wasmExports?.powmod_u64 ||
    base < 0n ||
    exponent < 0n ||
    modulo <= 0n ||
    !fitsInI64(base) ||
    !fitsInI64(exponent) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  try {
    return wasmExports.powmod_u64(base, exponent, modulo);
  } catch {
    return null;
  }
}
