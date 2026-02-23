import {
  createI64Allocator,
  fitsInI64,
  getAlgorithmWasmExports,
  I64_BYTES,
} from "@/common/wasm";

export function wasmNaorReingoIfAvailable(
  count: number,
  digits: number,
  seed: bigint,
): bigint[] | null {
  const wasmExports = getAlgorithmWasmExports("naor-reingo");
  if (
    !wasmExports?.naor_reingo_fill_i64 ||
    !Number.isInteger(count) ||
    count <= 0 ||
    !Number.isInteger(digits) ||
    digits <= 0 ||
    digits > 18 ||
    !fitsInI64(seed)
  ) {
    return null;
  }

  const allocator = createI64Allocator(wasmExports);
  allocator.reset();

  const outPtr = allocator.allocate(count * I64_BYTES);
  const view = allocator.view();
  if (outPtr === null || !view) {
    return null;
  }

  try {
    const written = wasmExports.naor_reingo_fill_i64(
      count,
      digits,
      seed,
      outPtr,
    );
    if (written !== count) {
      return null;
    }
    const values: bigint[] = [];
    for (let index = 0; index < count; index++) {
      values.push(view[outPtr / I64_BYTES + index]);
    }
    return values;
  } catch {
    return null;
  }
}
