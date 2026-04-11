import { SYMBOLS } from "@/shared/constants";
import { createWASMInvoker, fitsInU64 } from "@/shared/algorithm/wasm";
import chalk from "@/shared/cli/chalk";
import {
  createAlgorithmPrompt,
  type IPromptOptions,
} from "@/shared/cli/prompt";

const runWASMPowMod = createWASMInvoker<[bigint, bigint, bigint], bigint>(
  "fast-modular-exponentiation",
  (wasmExports, base, exponent, modulo) => {
    if (
      !wasmExports.powmod_u64 ||
      base < 0n ||
      exponent < 0n ||
      modulo <= 0n ||
      !fitsInU64(base) ||
      !fitsInU64(exponent) ||
      !fitsInU64(modulo)
    ) {
      return null;
    }

    return wasmExports.powmod_u64(base, exponent, modulo);
  },
);

/**
 * Computes modular exponentiation by evaluating base^exponent modulo modulo.
 *
 * The result is calculated with binary exponentiation, which keeps the intermediate values inside the residue class ring modulo modulo.
 *
 * @param base Base value whose power is computed.
 * @param exponent Non-negative exponent applied to the base.
 * @param modulo Positive modulus that defines the residue class ring.
 * @returns The least non-negative residue of base^exponent modulo modulo.
 * @throws {Error} When modulo is not greater than 0.
 * @throws {Error} When exponent is negative.
 */
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

  const maybeWASMResult = runWASMPowMod(base, exponent, modulo);
  if (maybeWASMResult !== null) {
    return maybeWASMResult;
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
    writeLine(`\tbase^exponent % modulo ${SYMBOLS.CONGRUENT} x. x = result`);
    writeLine(chalk.gray(`\t2^100 % 71 ${SYMBOLS.CONGRUENT} 20. x = 20`));

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
      `\t${base}^${exponent} % ${modulo} ${SYMBOLS.CONGRUENT} ${result}. x = ${result}`,
    );

    return {
      inputs: { base, exponent, modulo },
      result,
    };
  },
);

export async function prompt(options?: IPromptOptions) {
  return runPrompt(options);
}
