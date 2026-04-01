import { readFileSync } from "fs";
import { join } from "path";

export type WASMExports = WebAssembly.Exports & {
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

export type AlgorithmWASMKey =
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

const wasmExportsByAlgorithm = new Map<AlgorithmWASMKey, WASMExports | null>();

export const I64_BYTES = 8;
export const MIN_I64 = -(1n << 63n);
export const MAX_U64 = (1n << 64n) - 1n;

export function getAlgorithmWASMExports(
  key: AlgorithmWASMKey,
): WASMExports | null {
  if (wasmExportsByAlgorithm.has(key)) {
    return wasmExportsByAlgorithm.get(key) ?? null;
  }

  try {
    const wasmPath = join(__dirname, "..", "algorithms", key, "main.wasm");
    const wasmBytes = readFileSync(wasmPath);
    const module = new WebAssembly.Module(wasmBytes);
    const instance = new WebAssembly.Instance(module, {});
    const wasmExports = instance.exports as WASMExports;

    if (!wasmExports.memory) {
      wasmExportsByAlgorithm.set(key, null);
      return null;
    }

    wasmExportsByAlgorithm.set(key, wasmExports);
    return wasmExports;
  } catch {
    wasmExportsByAlgorithm.set(key, null);
    return null;
  }
}

export function withAlgorithmWASM<TResult>(
  key: AlgorithmWASMKey,
  execute: (wasmExports: WASMExports) => TResult | null,
): TResult | null {
  const wasmExports = getAlgorithmWASMExports(key);
  if (!wasmExports) {
    return null;
  }

  try {
    return execute(wasmExports);
  } catch {
    return null;
  }
}

export function createWASMInvoker<TArgs extends unknown[], TResult>(
  key: AlgorithmWASMKey,
  execute: (wasmExports: WASMExports, ...args: TArgs) => TResult | null,
) {
  return (...args: TArgs): TResult | null => {
    return withAlgorithmWASM(key, (wasmExports) =>
      execute(wasmExports, ...args),
    );
  };
}

export function fitsInI64(value: bigint) {
  return value >= MIN_I64 && value <= MAX_U64;
}

export function normalizeI64(value: bigint) {
  return BigInt.asIntN(64, value);
}

export function createI64Allocator(wasmExports: WASMExports) {
  let heapOffset = 4096;

  const ensureMemorySize = (bytesNeeded: number) => {
    if (!wasmExports?.memory) {
      return false;
    }

    const totalNeeded = heapOffset + bytesNeeded;
    const currentBytes = wasmExports.memory.buffer.byteLength;
    if (totalNeeded <= currentBytes) {
      return true;
    }

    const pageSize = 64 * 1024;
    const missing = totalNeeded - currentBytes;
    const pages = Math.ceil(missing / pageSize);
    wasmExports.memory.grow(pages);
    return true;
  };

  return {
    reset() {
      heapOffset = 4096;
    },
    allocate(bytes: number): number | null {
      const aligned = (heapOffset + 7) & ~7;
      heapOffset = aligned;

      if (!ensureMemorySize(bytes)) {
        return null;
      }

      const ptr = heapOffset;
      heapOffset += bytes;
      return ptr;
    },
    view(): BigInt64Array | null {
      if (!wasmExports?.memory) {
        return null;
      }
      return new BigInt64Array(wasmExports.memory.buffer);
    },
  };
}
