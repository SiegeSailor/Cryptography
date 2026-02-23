import chalk from "chalk";
import inquirer from "inquirer";

import { ESymbols } from "@/common/constants";
import { wasmPowModIfAvailable } from "@/wasm/algorithms";

export default function _(
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

  const maybeWasmResult = wasmPowModIfAvailable(base, exponent, modulo);
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

export async function prompt() {
  console.log(`\tbase^exponent % modulo ${ESymbols.Congruent} x. x = result`);
  console.log(chalk.gray(`\t2^100 % 71 ${ESymbols.Congruent} 20. x = 20`));
}
