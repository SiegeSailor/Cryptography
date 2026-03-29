import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";

import euclidean from "@/algorithms/euclidean";
import extendedEuclidean from "@/algorithms/extended-euclidean";
import {
  createI64Allocator,
  createOptionalWasmInvoker,
  fitsInI64,
  I64_BYTES,
  MIN_I64,
  normalizeI64,
} from "@/shared/wasm";

const runWasmChineseRemainder = createOptionalWasmInvoker<
  [bigint[], bigint[]],
  bigint
>("chinese-remainder", (wasmExports, remainders, modulos) => {
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
});

export default function main(arrayOfBase: number[], arrayOfModulo: number[]) {
  if (arrayOfBase.length !== arrayOfModulo.length)
    throw new Error("The length for the two given arrays should be the same.");

  const base = arrayOfBase.map((item) => BigInt(item));
  const modulo = arrayOfModulo.map((item) => BigInt(item));

  const maybeWasmResult = runWasmChineseRemainder(base, modulo);
  if (maybeWasmResult !== null) {
    if (maybeWasmResult > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("CRT result exceeds Number.MAX_SAFE_INTEGER.");
    }
    return Number(maybeWasmResult);
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

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
