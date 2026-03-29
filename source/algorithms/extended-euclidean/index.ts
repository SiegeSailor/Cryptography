import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";
import {
  createI64Allocator,
  createOptionalWasmInvoker,
  fitsInI64,
  I64_BYTES,
  normalizeI64,
} from "@/shared/wasm";

const runWasmExtendedEuclidean = createOptionalWasmInvoker<
  [bigint, bigint],
  [bigint, bigint, bigint]
>("extended-euclidean", (wasmExports, left, right) => {
  if (
    !wasmExports.extended_euclidean_i64 ||
    !fitsInI64(left) ||
    !fitsInI64(right)
  ) {
    return null;
  }

  const allocator = createI64Allocator(wasmExports);
  allocator.reset();

  const gcdPtr = allocator.allocate(I64_BYTES);
  const xPtr = allocator.allocate(I64_BYTES);
  const yPtr = allocator.allocate(I64_BYTES);
  const view = allocator.view();

  if (gcdPtr === null || xPtr === null || yPtr === null || !view) {
    return null;
  }

  wasmExports.extended_euclidean_i64(
    normalizeI64(left),
    normalizeI64(right),
    gcdPtr,
    xPtr,
    yPtr,
  );

  return [
    view[gcdPtr / I64_BYTES],
    view[xPtr / I64_BYTES],
    view[yPtr / I64_BYTES],
  ];
});

export default function main(left: bigint, right: bigint) {
  const wasmResult = runWasmExtendedEuclidean(left, right);
  if (wasmResult !== null) {
    return wasmResult;
  }

  const recursion = (left: bigint, right: bigint) => {
    if (right == BigInt(0)) return [left, BigInt(1), BigInt(0)];

    const arrayOfResult = main(right, left % right);
    return [
      arrayOfResult[0],
      arrayOfResult[2],
      arrayOfResult[1] - (left / right) * arrayOfResult[2],
    ];
  };

  return recursion(left, right);
}

const runPrompt = createAlgorithmPrompt(
  "extended-euclidean",
  async ({ ask, writeLine }) => {
    writeLine("\tGCD(left, right) = result");
    writeLine(chalk.gray("\tGCD(106, 112) = -19 * 106 + 18 * 112 = 2"));

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

    const [result, x, y] = main(BigInt(left), BigInt(right));
    writeLine(
      `GCD(${left}, ${right}) = ${x} * ${left} + ${y} * ${right} = ${result}`,
    );

    return {
      inputs: { left, right },
      result: [result, x, y],
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
