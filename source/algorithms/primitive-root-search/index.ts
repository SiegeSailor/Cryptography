import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";

import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import {
  createI64Allocator,
  createOptionalWasmInvoker,
  fitsInI64,
  I64_BYTES,
} from "@/shared/wasm";

const runWasmPrimitiveRoots = createOptionalWasmInvoker<[bigint], bigint[]>(
  "primitive-root-search",
  (wasmExports, prime) => {
    if (
      !wasmExports.primitive_root_search_i64 ||
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

    const count = wasmExports.primitive_root_search_i64(
      prime,
      rootsPtr,
      maxRoots,
    );
    const result: bigint[] = [];
    const limit = Math.min(count, maxRoots);
    for (let index = 0; index < limit; index++) {
      result.push(view[rootsPtr / I64_BYTES + index]);
    }

    return result;
  },
);

export default function main(prime: number): [number[][], number[]] {
  if (!millerRabinPrimarilyTest(BigInt(prime), 10))
    throw new Error("The Given number must be prime.");

  const phi = prime - 1;
  const table: number[][] = Array.from({ length: phi }, () =>
    Array.from({ length: phi }, () => 0),
  );

  const arrayOfResult: number[] = [];

  const maybeWasmRoots = runWasmPrimitiveRoots(BigInt(prime));
  if (maybeWasmRoots !== null) {
    for (const root of maybeWasmRoots) {
      arrayOfResult.push(Number(root));
    }

    for (let indexRow = 0; indexRow < table.length; indexRow++) {
      for (let indexColumn = 0; indexColumn < table[0].length; indexColumn++) {
        const exponent = fastModularExponentiation(
          BigInt(indexRow + 1),
          BigInt(indexColumn + 1),
          BigInt(prime),
        );
        table[indexRow][indexColumn] = Number(exponent);
      }
    }

    return [table, arrayOfResult];
  }

  for (let indexRow = 0; indexRow < table.length; indexRow++) {
    const set = new Set<number>();
    let isPrimitiveRoot = true;
    for (let indexColumn = 0; indexColumn < table[0].length; indexColumn++) {
      const exponent = fastModularExponentiation(
        BigInt(indexRow + 1),
        BigInt(indexColumn + 1),
        BigInt(prime),
      );
      const index = Number(exponent);
      table[indexRow][indexColumn] = index;

      if (set.has(index)) {
        isPrimitiveRoot = false;
      }
      set.add(index);
    }

    if (isPrimitiveRoot) arrayOfResult.push(indexRow + 1);
  }

  return [table, arrayOfResult];
}

const runPrompt = createAlgorithmPrompt(
  "primitive-root-search",
  async ({ ask, writeLine }) => {
    writeLine("\tprimitive roots for x = y1, y2, y3...");
    writeLine(
      chalk.gray(
        "\tprimitive roots for 23 = 5, 7, 10, 11, 14, 15, 17, 19, 20, 21",
      ),
    );

    const { prime } = await ask<{ prime: number }>([
      {
        type: "number",
        name: "prime",
        message: `Enter ${chalk.italic("prime")}:`,
        default: 7,
      },
    ]);

    const result = main(prime);
    writeLine(`primitive roots for ${prime} = ${result[1].sort()}`);

    return {
      inputs: { prime },
      result,
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
