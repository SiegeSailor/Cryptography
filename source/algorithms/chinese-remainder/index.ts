import euclidean from "@/algorithms/euclidean";
import extendedEuclidean from "@/algorithms/extended-euclidean";
import {
  createI64Allocator,
  createWASMInvoker,
  fitsInI64,
  I64_BYTES,
  MIN_I64,
  normalizeI64,
} from "@/shared/algorithm/wasm";
import chalk from "@/shared/cli/chalk";
import {
  createAlgorithmPrompt,
  type IPromptOptions,
} from "@/shared/cli/prompt";

const runWASMChineseRemainder = createWASMInvoker<[bigint[], bigint[]], bigint>(
  "chinese-remainder",
  (wasmExports, remainders, modulos) => {
    if (
      !wasmExports.chinese_remainder_i64 ||
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

    const result = wasmExports.chinese_remainder_i64(
      remaindersPtr,
      modulosPtr,
      remainders.length,
    );
    return result === MIN_I64 ? null : result;
  },
);

/**
 * Solves a system of simultaneous congruences `x ≡ r_i (mod m_i)` with the
 * Chinese Remainder Theorem.
 *
 * When the moduli are pairwise coprime, the system has a unique solution
 * modulo `M = ∏ m_i`, and this function returns its least non-negative
 * representative. The implementation checks pairwise coprimality with the
 * Euclidean algorithm and computes each modular inverse for `M_i = M / m_i`
 * with the Extended Euclidean algorithm.
 *
 * @param arrayOfBase Remainders `r_i` in congruences of the form
 * `x ≡ r_i (mod m_i)`.
 * @param arrayOfModulo Moduli `m_i` that define each congruence.
 * @returns The least non-negative solution `x` modulo `M` as a JavaScript
 * number.
 * @throws {Error} When the remainder and modulus arrays have different lengths.
 * @throws {Error} When the moduli are not pairwise coprime.
 * @throws {Error} When a required modular inverse cannot be computed.
 * @throws {Error} When the result exceeds Number.MAX_SAFE_INTEGER.
 */
export default function main(arrayOfBase: number[], arrayOfModulo: number[]) {
  if (arrayOfBase.length !== arrayOfModulo.length)
    throw new Error("The length for the two given arrays should be the same.");

  const base = arrayOfBase.map((item) => BigInt(item));
  const modulo = arrayOfModulo.map((item) => BigInt(item));

  const maybeWASMResult = runWASMChineseRemainder(base, modulo);
  if (maybeWASMResult !== null) {
    if (maybeWASMResult > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("CRT result exceeds Number.MAX_SAFE_INTEGER.");
    }
    return Number(maybeWASMResult);
  }

  for (let i = 0; i < modulo.length; i++) {
    for (let j = i + 1; j < modulo.length; j++) {
      if (euclidean(modulo[i], modulo[j]) !== 1n) {
        throw new Error("All modulo values must be pairwise coprime.");
      }
    }
  }

  let modular = 1n;
  modulo.forEach((item) => {
    modular *= item;
  });

  let x = 0n;

  for (let i = 0; i < base.length; i++) {
    const partialModulo = modular / modulo[i];
    const [gcd, inverse] = extendedEuclidean(partialModulo, modulo[i]);

    if (gcd !== 1n) {
      throw new Error("Unable to compute modular inverse for CRT.");
    }

    const normalizedInverse = ((inverse % modulo[i]) + modulo[i]) % modulo[i];
    x += base[i] * partialModulo * normalizedInverse;
  }

  const result = ((x % modular) + modular) % modular;

  if (result > Number.MAX_SAFE_INTEGER) {
    throw new Error("CRT result exceeds Number.MAX_SAFE_INTEGER.");
  }

  return Number(result);
}

const runPrompt = createAlgorithmPrompt(
  "chinese-remainder",
  async ({ ask, writeLine }) => {
    writeLine("\tx % m1 = r1, x % m2 = r2 ... x = result");
    writeLine(chalk.gray("\tx % 11 = 2, x % 19 = 1, x % 37 = 2. x = 2851"));

    const { base, modulo } = await ask<{ base: string; modulo: string }>([
      {
        type: "input",
        name: "base",
        message: `Enter ${chalk.italic("remainders")} (comma-separated):`,
        default: "2,1,2",
      },
      {
        type: "input",
        name: "modulo",
        message: `Enter ${chalk.italic("modulos")} (comma-separated):`,
        default: "11,19,37",
      },
    ]);

    const remainders = String(base)
      .split(",")
      .map((item) => Number(item.trim()));
    const modulos = String(modulo)
      .split(",")
      .map((item) => Number(item.trim()));

    const result = main(remainders, modulos);
    writeLine(`\tResult x = ${result}`);

    return {
      inputs: { remainders, modulos },
      result,
    };
  },
);

export async function prompt(options?: IPromptOptions) {
  return runPrompt(options);
}
