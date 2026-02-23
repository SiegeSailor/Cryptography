import {
  createI64Allocator,
  fitsInI64,
  getAlgorithmWasmExports,
  I64_BYTES,
} from "@/common/wasm";

export function wasmPrimitiveRootsIfAvailable(prime: bigint): bigint[] | null {
  const wasmExports = getAlgorithmWasmExports("primitive-root-search");
  if (
    !wasmExports?.primitive_root_search_i64 ||
    prime <= 2n ||
    !fitsInI64(prime)
  ) {
    return null;
  }

  const maxRoots = Number(prime - 1n);
  if (!Number.isFinite(maxRoots) || maxRoots <= 0 || maxRoots > 10_000) {
    return null;
  }

  const allocator = createI64Allocator(wasmExports);
  allocator.reset();

  const rootsPtr = allocator.allocate(maxRoots * I64_BYTES);
  const view = allocator.view();

  if (rootsPtr === null || !view) {
    return null;
  }

  try {
    const count = wasmExports.primitive_root_search_i64(prime, rootsPtr, maxRoots);
    const result: bigint[] = [];
    const limit = Math.min(count, maxRoots);
    for (let index = 0; index < limit; index++) {
      result.push(view[rootsPtr / I64_BYTES + index]);
    }
    return result;
  } catch {
    return null;
  }
}