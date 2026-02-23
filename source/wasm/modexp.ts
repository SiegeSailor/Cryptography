import { wasmPowModIfAvailable as wasmPowModIfAvailableFromAlgorithms } from "@/wasm/algorithms";

export function wasmPowModIfAvailable(
  base: bigint,
  exponent: bigint,
  modulo: bigint,
): bigint | null {
  return wasmPowModIfAvailableFromAlgorithms(base, exponent, modulo);
}
