import { getAlgorithmWasmExports, MAX_U64 } from "@/common/wasm";

export function wasmMillerRabinIfAvailable(
  input: bigint,
  level: number,
): boolean | null {
  const wasmExports = getAlgorithmWasmExports("miller-rabin-primarily-test");
  if (
    !wasmExports?.miller_rabin_u64 ||
    input < 0n ||
    input > MAX_U64 ||
    !Number.isInteger(level) ||
    level <= 0
  ) {
    return null;
  }

  try {
    return wasmExports.miller_rabin_u64(input, level) === 1;
  } catch {
    return null;
  }
}
