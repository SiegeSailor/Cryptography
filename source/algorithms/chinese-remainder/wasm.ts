import {
  createI64Allocator,
  fitsInI64,
  getAlgorithmWasmExports,
  I64_BYTES,
  MIN_I64,
  normalizeI64,
} from "@/common/wasm";

export function wasmChineseRemainderIfAvailable(
  remainders: bigint[],
  modulos: bigint[],
): bigint | null {
  const wasmExports = getAlgorithmWasmExports("chinese-remainder");
  if (
    !wasmExports?.chinese_remainder_i64 ||
    remainders.length !== modulos.length ||
    remainders.length === 0
  ) {
    return null;
  }
  if (
    remainders.some((value) => !fitsInI64(value)) ||
    modulos.some((value) => value <= 0n || !fitsInI64(value))
  ) {
    return null;
  }

  const allocator = createI64Allocator(wasmExports);
  allocator.reset();

  const bytes = remainders.length * I64_BYTES;
  const remaindersPtr = allocator.allocate(bytes);
  const modulosPtr = allocator.allocate(bytes);
  const view = allocator.view();

  if (remaindersPtr === null || modulosPtr === null || !view) {
    return null;
  }

  for (let index = 0; index < remainders.length; index++) {
    view[remaindersPtr / I64_BYTES + index] = normalizeI64(remainders[index]);
    view[modulosPtr / I64_BYTES + index] = normalizeI64(modulos[index]);
  }

  try {
    const result = wasmExports.chinese_remainder_i64(
      remaindersPtr,
      modulosPtr,
      remainders.length,
    );
    if (result === MIN_I64) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}