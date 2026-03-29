import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";

import euclidean from "@/algorithms/euclidean";
import { math } from "@/shared/utilities";
import { randomBigIntBetween } from "@/shared/random";
import { createOptionalWasmInvoker, fitsInI64 } from "@/shared/wasm";

const runWasmPollardRho = createOptionalWasmInvoker<
  [bigint, bigint, bigint, number],
  bigint
>("pollard-rho", (wasmExports, input, seed, c, maxIterations) => {
  if (
    !wasmExports.pollard_rho_i64 ||
    !fitsInI64(input) ||
    !fitsInI64(seed) ||
    !fitsInI64(c) ||
    !Number.isInteger(maxIterations) ||
    maxIterations <= 0
  ) {
    return null;
  }

  return wasmExports.pollard_rho_i64(input, seed, c, maxIterations);
});

export default function main(input: bigint) {
  if (input <= 1n) {
    throw new Error("input must be greater than 1.");
  }
  if ((input & 1n) === 0n) {
    return 2n;
  }

  const f = (x: bigint, c: bigint) => (x * x + c) % input;

  for (let attempt = 0; attempt < 10; attempt++) {
    const c = randomBigIntBetween(1n, input - 1n);
    let x = randomBigIntBetween(2n, input - 1n);

    const maybeWasmFactor = runWasmPollardRho(input, x, c, 100_000);
    if (
      maybeWasmFactor !== null &&
      maybeWasmFactor > 1n &&
      maybeWasmFactor < input &&
      input % maybeWasmFactor === 0n
    ) {
      return maybeWasmFactor;
    }

    let y = x;
    let divisor = 1n;
    let iterations = 0;

    while (divisor === 1n) {
      x = f(x, c);
      y = f(f(y, c), c);
      divisor = euclidean(math.absolute(x - y), input);
      iterations += 1;

      if (iterations > 100_000) {
        divisor = input;
      }
    }

    if (divisor !== input) {
      return divisor;
    }
  }

  return 1n;
}

const runPrompt = createAlgorithmPrompt(
  "pollard-rho",
  async ({ ask, writeLine }) => {
    writeLine("\tFactorize a composite number using Pollard rho.");
    writeLine(chalk.gray("\tinput = 8051 -> factor = 83 or 97"));

    const { input } = await ask<{ input: number }>([
      {
        type: "number",
        name: "input",
        message: `Enter ${chalk.italic("composite number")}:`,
        default: 8051,
      },
    ]);

    const result = main(BigInt(input));
    writeLine(`\tFactor = ${result}`);

    return {
      inputs: { input },
      result,
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
