import { fitsInI64, getAlgorithmWasmExports } from "@/common/wasm";

export function wasmPollardRhoIfAvailable(
  input: bigint,
  seed: bigint,
  c: bigint,
  maxIterations: number,
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("pollard-rho");
  if (
    !wasmExports?.pollard_rho_i64 ||
    !fitsInI64(input) ||
    !fitsInI64(seed) ||
    !fitsInI64(c) ||
    !Number.isInteger(maxIterations) ||
    maxIterations <= 0
  ) {
    return null;
  }

  try {
    return wasmExports.pollard_rho_i64(input, seed, c, maxIterations);
  } catch {
    return null;
  }
}