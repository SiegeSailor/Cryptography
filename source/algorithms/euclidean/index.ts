import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";
import { createWASMInvoker, fitsInI64 } from "@/shared/wasm";

const runWASMGcd = createWASMInvoker<[bigint, bigint], bigint>(
  "euclidean",
  (wasmExports, left, right) => {
    if (
      !wasmExports.gcd_u64 ||
      left < 0n ||
      right < 0n ||
      !fitsInI64(left) ||
      !fitsInI64(right)
    ) {
      return null;
    }

    return wasmExports.gcd_u64(left, right);
  },
);

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

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
