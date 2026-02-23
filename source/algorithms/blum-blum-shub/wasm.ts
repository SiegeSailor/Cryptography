import { fitsInI64, getAlgorithmWasmExports } from "@/common/wasm";

export function wasmBlumBlumShubNextIfAvailable(
  state: bigint,
  modulus: bigint,
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("blum-blum-shub");
  if (
    !wasmExports?.blum_blum_shub_next_u64 ||
    state < 0n ||
    modulus <= 0n ||
    !fitsInI64(state) ||
    !fitsInI64(modulus)
  ) {
    return null;
  }

  try {
    return wasmExports.blum_blum_shub_next_u64(state, modulus);
  } catch {
    return null;
  }
}
