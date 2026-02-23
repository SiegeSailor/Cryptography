import { readFileSync } from "fs";
import { join } from "path";

type WasmExports = WebAssembly.Exports & {
  memory?: WebAssembly.Memory;
  gcd_u64?: (left: bigint, right: bigint) => bigint;
  powmod_u64?: (base: bigint, exponent: bigint, modulo: bigint) => bigint;
  extended_euclidean_i64?: (
    left: bigint,
    right: bigint,
    gcdPtr: number,
    xPtr: number,
    yPtr: number,
  ) => void;
  multiplicative_inverse_i64?: (base: bigint, modulo: bigint) => bigint;
  chinese_remainder_i64?: (
    remaindersPtr: number,
    modulosPtr: number,
    length: number,
  ) => bigint;
  baby_step_giant_step_i64?: (
    generator: bigint,
    base: bigint,
    modulo: bigint,
    limit: bigint,
  ) => bigint;
  miller_rabin_u64?: (input: bigint, level: number) => number;
  pollard_rho_i64?: (
    input: bigint,
    seed: bigint,
    c: bigint,
    maxIterations: number,
  ) => bigint;
  pollard_p1_i64?: (input: bigint, maxExponent: number) => bigint;
  primitive_root_search_i64?: (
    prime: bigint,
    outRootsPtr: number,
    maxRoots: number,
  ) => number;
  blum_blum_shub_next_u64?: (state: bigint, modulus: bigint) => bigint;
  naor_reingo_fill_i64?: (
    count: number,
    digits: number,
    seed: bigint,
    outValuesPtr: number,
  ) => number;
};

let heapOffset = 4096;

type AlgorithmWasmKey =
  | "baby-step-giant-step"
  | "blum-blum-shub"
  | "chinese-remainder"
  | "euclidean"
  | "extended-euclidean"
  | "fast-modular-exponentiation"
  | "miller-rabin-primarily-test"
  | "multiplicative-inverse"
  | "naor-reingo"
  | "pollard-p-1-factorization"
  | "pollard-rho"
  | "primitive-root-search";

const wasmExportsByAlgorithm = new Map<AlgorithmWasmKey, WasmExports | null>();

const I64_BYTES = 8;
const MIN_I64 = -(1n << 63n);
const MAX_U64 = (1n << 64n) - 1n;

function getExports(key: AlgorithmWasmKey): WasmExports | null {
  if (wasmExportsByAlgorithm.has(key)) {
    return wasmExportsByAlgorithm.get(key) ?? null;
  }

  try {
    const wasmPath = join(__dirname, "..", "algorithms", key, "main.wasm");
    const wasmBytes = readFileSync(wasmPath);
    const module = new WebAssembly.Module(wasmBytes);
    const instance = new WebAssembly.Instance(module, {});
    const exports = instance.exports as WasmExports;

    if (!exports.memory) {
      wasmExportsByAlgorithm.set(key, null);
      return null;
    }

    wasmExportsByAlgorithm.set(key, exports);
    return exports;
  } catch {
    wasmExportsByAlgorithm.set(key, null);
    return null;
  }
}

function ensureMemorySize(exports: WasmExports, bytesNeeded: number) {
  if (!exports?.memory) {
    return false;
  }

  const totalNeeded = heapOffset + bytesNeeded;
  const currentBytes = exports.memory.buffer.byteLength;
  if (totalNeeded <= currentBytes) {
    return true;
  }

  const pageSize = 64 * 1024;
  const missing = totalNeeded - currentBytes;
  const pages = Math.ceil(missing / pageSize);
  exports.memory.grow(pages);
  return true;
}

function allocateBytes(exports: WasmExports, bytes: number): number | null {
  const aligned = (heapOffset + 7) & ~7;
  heapOffset = aligned;

  if (!ensureMemorySize(exports, bytes)) {
    return null;
  }

  const ptr = heapOffset;
  heapOffset += bytes;
  return ptr;
}

function resetAllocator() {
  heapOffset = 4096;
}

function getBigInt64View(exports: WasmExports) {
  if (!exports?.memory) {
    return null;
  }
  return new BigInt64Array(exports.memory.buffer);
}

function fitsInI64(value: bigint) {
  return value >= MIN_I64 && value <= MAX_U64;
}

function normalizeI64(value: bigint) {
  return BigInt.asIntN(64, value);
}

export function wasmGcdIfAvailable(left: bigint, right: bigint): bigint | null {
  const exports = getExports("euclidean");
  if (
    !exports?.gcd_u64 ||
    left < 0n ||
    right < 0n ||
    !fitsInI64(left) ||
    !fitsInI64(right)
  ) {
    return null;
  }

  try {
    return exports.gcd_u64(left, right);
  } catch {
    return null;
  }
}

export function wasmPowModIfAvailable(
  base: bigint,
  exponent: bigint,
  modulo: bigint,
): bigint | null {
  const exports = getExports("fast-modular-exponentiation");
  if (
    !exports?.powmod_u64 ||
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
    return exports.powmod_u64(base, exponent, modulo);
  } catch {
    return null;
  }
}

export function wasmExtendedEuclideanIfAvailable(
  left: bigint,
  right: bigint,
): [bigint, bigint, bigint] | null {
  const exports = getExports("extended-euclidean");
  if (
    !exports?.extended_euclidean_i64 ||
    !fitsInI64(left) ||
    !fitsInI64(right)
  ) {
    return null;
  }

  resetAllocator();
  const gcdPtr = allocateBytes(exports, I64_BYTES);
  const xPtr = allocateBytes(exports, I64_BYTES);
  const yPtr = allocateBytes(exports, I64_BYTES);
  const view = getBigInt64View(exports);

  if (gcdPtr === null || xPtr === null || yPtr === null || !view) {
    return null;
  }

  try {
    exports.extended_euclidean_i64(
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

export function wasmMultiplicativeInverseIfAvailable(
  base: bigint,
  modulo: bigint,
): bigint | null {
  const exports = getExports("multiplicative-inverse");
  if (
    !exports?.multiplicative_inverse_i64 ||
    modulo <= 1n ||
    !fitsInI64(base) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  try {
    const value = exports.multiplicative_inverse_i64(
      normalizeI64(base),
      normalizeI64(modulo),
    );
    if (value === -(1n << 63n)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function wasmChineseRemainderIfAvailable(
  remainders: bigint[],
  modulos: bigint[],
): bigint | null {
  const exports = getExports("chinese-remainder");
  if (
    !exports?.chinese_remainder_i64 ||
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

  resetAllocator();
  const bytes = remainders.length * I64_BYTES;
  const remaindersPtr = allocateBytes(exports, bytes);
  const modulosPtr = allocateBytes(exports, bytes);
  const view = getBigInt64View(exports);

  if (remaindersPtr === null || modulosPtr === null || !view) {
    return null;
  }

  for (let index = 0; index < remainders.length; index++) {
    view[remaindersPtr / I64_BYTES + index] = normalizeI64(remainders[index]);
    view[modulosPtr / I64_BYTES + index] = normalizeI64(modulos[index]);
  }

  try {
    const result = exports.chinese_remainder_i64(
      remaindersPtr,
      modulosPtr,
      remainders.length,
    );
    if (result === -(1n << 63n)) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}

export function wasmBabyStepGiantStepIfAvailable(
  generator: bigint,
  base: bigint,
  modulo: bigint,
): bigint | null {
  const exports = getExports("baby-step-giant-step");
  if (
    !exports?.baby_step_giant_step_i64 ||
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
    const result = exports.baby_step_giant_step_i64(
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

export function wasmMillerRabinIfAvailable(
  input: bigint,
  level: number,
): boolean | null {
  const exports = getExports("miller-rabin-primarily-test");
  if (
    !exports?.miller_rabin_u64 ||
    input < 0n ||
    input > MAX_U64 ||
    !Number.isInteger(level) ||
    level <= 0
  ) {
    return null;
  }

  try {
    return exports.miller_rabin_u64(input, level) === 1;
  } catch {
    return null;
  }
}

export function wasmPollardRhoIfAvailable(
  input: bigint,
  seed: bigint,
  c: bigint,
  maxIterations: number,
): bigint | null {
  const exports = getExports("pollard-rho");
  if (
    !exports?.pollard_rho_i64 ||
    !fitsInI64(input) ||
    !fitsInI64(seed) ||
    !fitsInI64(c) ||
    !Number.isInteger(maxIterations) ||
    maxIterations <= 0
  ) {
    return null;
  }

  try {
    return exports.pollard_rho_i64(input, seed, c, maxIterations);
  } catch {
    return null;
  }
}

export function wasmPollardP1IfAvailable(
  input: bigint,
  maxExponent: number,
): bigint | null {
  const exports = getExports("pollard-p-1-factorization");
  if (
    !exports?.pollard_p1_i64 ||
    !fitsInI64(input) ||
    !Number.isInteger(maxExponent) ||
    maxExponent <= 0
  ) {
    return null;
  }

  try {
    const result = exports.pollard_p1_i64(input, maxExponent);
    return result > 1n ? result : null;
  } catch {
    return null;
  }
}

export function wasmPrimitiveRootsIfAvailable(prime: bigint): bigint[] | null {
  const exports = getExports("primitive-root-search");
  if (!exports?.primitive_root_search_i64 || prime <= 2n || !fitsInI64(prime)) {
    return null;
  }

  const maxRoots = Number(prime - 1n);
  if (!Number.isFinite(maxRoots) || maxRoots <= 0 || maxRoots > 10_000) {
    return null;
  }

  resetAllocator();
  const rootsPtr = allocateBytes(exports, maxRoots * I64_BYTES);
  const view = getBigInt64View(exports);

  if (rootsPtr === null || !view) {
    return null;
  }

  try {
    const count = exports.primitive_root_search_i64(prime, rootsPtr, maxRoots);
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

export function wasmBlumBlumShubNextIfAvailable(
  state: bigint,
  modulus: bigint,
): bigint | null {
  const exports = getExports("blum-blum-shub");
  if (
    !exports?.blum_blum_shub_next_u64 ||
    state < 0n ||
    modulus <= 0n ||
    !fitsInI64(state) ||
    !fitsInI64(modulus)
  ) {
    return null;
  }

  try {
    return exports.blum_blum_shub_next_u64(state, modulus);
  } catch {
    return null;
  }
}

export function wasmNaorReingoIfAvailable(
  count: number,
  digits: number,
  seed: bigint,
): bigint[] | null {
  const exports = getExports("naor-reingo");
  if (
    !exports?.naor_reingo_fill_i64 ||
    !Number.isInteger(count) ||
    count <= 0 ||
    !Number.isInteger(digits) ||
    digits <= 0 ||
    digits > 18 ||
    !fitsInI64(seed)
  ) {
    return null;
  }

  resetAllocator();
  const outPtr = allocateBytes(exports, count * I64_BYTES);
  const view = getBigInt64View(exports);
  if (outPtr === null || !view) {
    return null;
  }

  try {
    const written = exports.naor_reingo_fill_i64(count, digits, seed, outPtr);
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
