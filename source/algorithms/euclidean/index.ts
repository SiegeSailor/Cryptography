import { createWASMInvoker, fitsInU64 } from "@/shared/algorithm/wasm";
import chalk from "@/shared/cli/chalk";
import {
  createAlgorithmPrompt,
  type IPromptOptions,
} from "@/shared/cli/prompt";

const runWASMGcd = createWASMInvoker<[bigint, bigint], bigint>(
  "euclidean",
  (wasmExports, left, right) => {
    if (
      !wasmExports.gcd_u64 ||
      left < 0n ||
      right < 0n ||
      !fitsInU64(left) ||
      !fitsInU64(right)
    ) {
      return null;
    }

    return wasmExports.gcd_u64(left, right);
  },
);

/**
 * Computes `gcd(left, right)` with the Euclidean algorithm.
 *
 * The result is the largest integer dividing both inputs, and it is `0n` only
 * when both inputs are `0n`. The fallback implementation repeatedly replaces
 * the pair `(a, b)` with `(b, a mod b)` until the remainder becomes `0`.
 *
 * @param left First integer `a` in the `gcd(a, b)` computation.
 * @param right Second integer `b` in the `gcd(a, b)` computation.
 * @returns The greatest common divisor of `left` and `right`.
 */
export default function main(left: bigint, right: bigint): bigint {
  const wasmResult = runWASMGcd(left, right);
  if (wasmResult !== null) {
    return wasmResult;
  }

  while (right !== BigInt(0)) {
    const cache = right;
    right = left % right;
    left = cache;
  }
  return left;
}

const runPrompt = createAlgorithmPrompt(
  "euclidean",
  async ({ ask, writeLine }) => {
    writeLine("\tGCD(left, right) = result");
    writeLine(chalk.gray("\tGCD(614, 513) = 1"));

    const { left, right } = await ask<{ left: number; right: number }>([
      {
        type: "number",
        name: "left",
        message: `Enter ${chalk.italic("left")}:`,
        default: 1,
      },
      {
        type: "number",
        name: "right",
        message: `Enter ${chalk.italic("right")}:`,
        default: 1,
      },
    ]);

    const result = main(BigInt(left), BigInt(right));
    writeLine(`\tGCD(${left}, ${right}) = ${result}`);

    return {
      inputs: { left, right },
      result,
    };
  },
);

export async function prompt(options?: IPromptOptions) {
  return runPrompt(options);
}
