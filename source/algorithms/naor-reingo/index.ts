import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";

import { randomBigIntBetween } from "@/shared/random";
import {
  createI64Allocator,
  createWASMInvoker,
  fitsInI64,
  I64_BYTES,
} from "@/shared/wasm";

const runWASMNaorReingo = createWASMInvoker<[number, number, bigint], bigint[]>(
  "naor-reingo",
  (wasmExports, count, digits, seed) => {
    if (
      !wasmExports.naor_reingo_fill_i64 ||
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
  },
);

export default function main(count: number, digits: number) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("count must be a positive integer.");
  }
  if (!Number.isInteger(digits) || digits < 1) {
    throw new Error("digits must be a positive integer.");
  }

  const lowerBound = 10n ** BigInt(Math.max(0, digits - 1));
  const upperBound = 10n ** BigInt(digits) - 1n;

  const maybeWASMValues = runWASMNaorReingo(count, digits, BigInt(Date.now()));
  if (maybeWASMValues !== null) {
    return maybeWASMValues.map((value) => Number(value));
  }

  const arrayOfResult: number[] = [];
  for (let i = 0; i < count; i++) {
    arrayOfResult.push(Number(randomBigIntBetween(lowerBound, upperBound)));
  }

  return arrayOfResult;
}

const runPrompt = createAlgorithmPrompt(
  "naor-reingo",
  async ({ ask, writeLine }) => {
    writeLine(
      "\tGenerate pseudo-random decimal numbers with fixed digit length.",
    );
    writeLine(chalk.gray("\tcount = 3, digits = 2 -> [.., .., ..]"));

    const { count, digits } = await ask<{ count: number; digits: number }>([
      {
        type: "number",
        name: "count",
        message: `Enter ${chalk.italic("count")}:`,
        default: 3,
      },
      {
        type: "number",
        name: "digits",
        message: `Enter ${chalk.italic("digits")}:`,
        default: 2,
      },
    ]);

    const result = main(Number(count), Number(digits));
    writeLine(`\tResult = ${result}`);

    return {
      inputs: { count, digits },
      result,
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
