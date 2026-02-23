import { fitsInI64, getAlgorithmWasmExports } from "@/common/wasm";

export function wasmBabyStepGiantStepIfAvailable(
  generator: bigint,
  base: bigint,
  modulo: bigint,
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("baby-step-giant-step");
  if (
    !wasmExports?.baby_step_giant_step_i64 ||
    modulo <= 1n ||
    generator < 0n ||
    base < 0n ||
    !fitsInI64(generator) ||
    !fitsInI64(base) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  const limit = modulo > 2_000_000n ? 2_000_000n : modulo;

  try {
    const result = wasmExports.baby_step_giant_step_i64(
      generator,
      base,
      modulo,
      limit,
    );
    if (result < 0n) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}