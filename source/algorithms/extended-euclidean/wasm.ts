import {
  createI64Allocator,
  fitsInI64,
  getAlgorithmWasmExports,
  I64_BYTES,
  normalizeI64,
} from "@/common/wasm";

export function wasmExtendedEuclideanIfAvailable(
  left: bigint,
  right: bigint,
): [bigint, bigint, bigint] | null {
  const wasmExports = getAlgorithmWasmExports("extended-euclidean");
  if (
    !wasmExports?.extended_euclidean_i64 ||
    !fitsInI64(left) ||
    !fitsInI64(right)
  ) {
    return null;
  }

  const allocator = createI64Allocator(wasmExports);
  allocator.reset();

  const gcdPtr = allocator.allocate(I64_BYTES);
  const xPtr = allocator.allocate(I64_BYTES);
  const yPtr = allocator.allocate(I64_BYTES);
  const view = allocator.view();

  if (gcdPtr === null || xPtr === null || yPtr === null || !view) {
    return null;
  }

  try {
    wasmExports.extended_euclidean_i64(
      normalizeI64(left),
      normalizeI64(right),
      gcdPtr,
      xPtr,
      yPtr,
    );

    const gcd = view[gcdPtr / I64_BYTES];
    const x = view[xPtr / I64_BYTES];
    const y = view[yPtr / I64_BYTES];
    return [gcd, x, y];
  } catch {
    return null;
  }
}