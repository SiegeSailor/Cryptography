import extendedEuclidean from "@/algorithms/extended-euclidean";
import {
  createWASMInvoker,
  fitsInI64,
  MIN_I64,
  normalizeI64,
} from "@/shared/algorithm/wasm";
import chalk from "@/shared/cli/chalk";
import {
  createAlgorithmPrompt,
  type IPromptOptions,
} from "@/shared/cli/prompt";

const runWASMMultiplicativeInverse = createWASMInvoker<
  [bigint, bigint],
  bigint
>("multiplicative-inverse", (wasmExports, base, modulo) => {
  if (
    !wasmExports.multiplicative_inverse_i64 ||
    modulo <= 1n ||
    !fitsInI64(base) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  const value = wasmExports.multiplicative_inverse_i64(
    normalizeI64(base),
    normalizeI64(modulo),
  );
  if (value === MIN_I64) {
    return null;
  }

  return value;
});

export default function main(base: bigint, modulo: bigint, number: number) {
  if (modulo <= 1n) {
    throw new Error("modulo must be greater than 1.");
  }
  if (number <= 0) {
    throw new Error("number must be a positive integer.");
  }

  const maybeWASMInverse = runWASMMultiplicativeInverse(base, modulo);
  let inverse: bigint;

  if (maybeWASMInverse !== null) {
    inverse = maybeWASMInverse;
  } else {
    const [gcd, x] = extendedEuclidean(base, modulo);
    if (gcd !== 1n) {
      throw new Error("base and modulo must be coprime.");
    }

    inverse = ((x % modulo) + modulo) % modulo;
  }

  const arrayOfInverse: bigint[] = [];
  for (let count = BigInt(1); count <= number; count++) {
    arrayOfInverse.push(inverse * count);
  }

  return arrayOfInverse;
}

const runPrompt = createAlgorithmPrompt(
  "multiplicative-inverse",
  async ({ ask, writeLine }) => {
    writeLine("\tmultiplicativeInverse(base, modulo, count) = [values]");
    writeLine(
      chalk.gray("\tmultiplicativeInverse(23, 41, 5) = [25,50,75,100,125]"),
    );

    const { base, modulo, number } = await ask<{
      base: number;
      modulo: number;
      number: number;
    }>([
      {
        type: "number",
        name: "base",
        message: `Enter ${chalk.italic("base")}:`,
        default: 23,
      },
      {
        type: "number",
        name: "modulo",
        message: `Enter ${chalk.italic("modulo")}:`,
        default: 41,
      },
      {
        type: "number",
        name: "number",
        message: `Enter ${chalk.italic("count")}:`,
        default: 5,
      },
    ]);

    const result = main(BigInt(base), BigInt(modulo), Number(number));
    writeLine(`\tResult = ${result}`);

    return {
      inputs: { base, modulo, count: number },
      result,
    };
  },
);

export async function prompt(options?: IPromptOptions) {
  return runPrompt(options);
}
