import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";

import { ESymbols } from "@/shared/constants";
import { createOptionalWasmInvoker, fitsInI64 } from "@/shared/wasm";

const runWasmPowMod = createOptionalWasmInvoker<
  [bigint, bigint, bigint],
  bigint
>("fast-modular-exponentiation", (wasmExports, base, exponent, modulo) => {
  if (
    !wasmExports.powmod_u64 ||
    base < 0n ||
    exponent < 0n ||
    modulo <= 0n ||
    !fitsInI64(base) ||
    !fitsInI64(exponent) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  return wasmExports.powmod_u64(base, exponent, modulo);
});

export default function main(
  base: bigint,
  exponent: bigint,
  modulo: bigint,
): bigint {
  if (modulo <= 0n) {
    throw new Error("modulo must be greater than 0.");
  }
  if (exponent < 0n) {
    throw new Error("exponent must be non-negative.");
  }

  const maybeWasmResult = runWasmPowMod(base, exponent, modulo);
  if (maybeWasmResult !== null) {
    return maybeWasmResult;
  }

  let result = 1n;
  let currentBase = ((base % modulo) + modulo) % modulo;
  let currentExponent = exponent;

  while (currentExponent > 0n) {
    if ((currentExponent & 1n) === 1n) {
      result = (result * currentBase) % modulo;
    }
    currentBase = (currentBase * currentBase) % modulo;
    currentExponent >>= 1n;
  }

  return result;
}

const runPrompt = createAlgorithmPrompt(
  "fast-modular-exponentiation",
  async ({ ask, writeLine }) => {
    writeLine(`\tbase^exponent % modulo ${ESymbols.Congruent} x. x = result`);
    writeLine(chalk.gray(`\t2^100 % 71 ${ESymbols.Congruent} 20. x = 20`));

    const { base, exponent, modulo } = await ask<{
      base: number;
      exponent: number;
      modulo: number;
    }>([
      {
        type: "number",
        name: "base",
        message: `Enter ${chalk.italic("base")}:`,
        default: 2,
      },
      {
        type: "number",
        name: "exponent",
        message: `Enter ${chalk.italic("exponent")}:`,
        default: 100,
      },
      {
        type: "number",
        name: "modulo",
        message: `Enter ${chalk.italic("modulo")}:`,
        default: 71,
      },
    ]);

    const result = main(BigInt(base), BigInt(exponent), BigInt(modulo));
    writeLine(
      `\t${base}^${exponent} % ${modulo} ${ESymbols.Congruent} ${result}. x = ${result}`,
    );

    return {
      inputs: { base, exponent, modulo },
      result,
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
