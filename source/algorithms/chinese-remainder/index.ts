import chalk from "chalk";
import inquirer from "inquirer";

import euclidean from "@/algorithms/euclidean";
import extendedEuclidean from "@/algorithms/extended-euclidean";
import { wasmChineseRemainderIfAvailable } from "@/wasm/algorithms";

export default function _(arrayOfBase: number[], arrayOfModulo: number[]) {
  if (arrayOfBase.length !== arrayOfModulo.length)
    throw new Error("The length for the two given arrays should be the same.");

  const base = arrayOfBase.map((item) => BigInt(item));
  const modulo = arrayOfModulo.map((item) => BigInt(item));

  const maybeWasmResult = wasmChineseRemainderIfAvailable(base, modulo);
  if (maybeWasmResult !== null) {
    if (maybeWasmResult > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("CRT result exceeds Number.MAX_SAFE_INTEGER.");
    }
    return Number(maybeWasmResult);
  }

  for (let i = 0; i < modulo.length; i++) {
    for (let j = i + 1; j < modulo.length; j++) {
      if (euclidean(modulo[i], modulo[j]) !== 1n) {
        throw new Error("All modulo values must be pairwise coprime.");
      }
    }
  }

  let modular = 1n;
  modulo.forEach((item) => {
    modular *= item;
  });

  let x = 0n;

  for (let i = 0; i < base.length; i++) {
    const partialModulo = modular / modulo[i];
    const [gcd, inverse] = extendedEuclidean(partialModulo, modulo[i]);

    if (gcd !== 1n) {
      throw new Error("Unable to compute modular inverse for CRT.");
    }

    const normalizedInverse = ((inverse % modulo[i]) + modulo[i]) % modulo[i];
    x += base[i] * partialModulo * normalizedInverse;
  }

  const result = ((x % modular) + modular) % modular;

  if (result > Number.MAX_SAFE_INTEGER) {
    throw new Error("CRT result exceeds Number.MAX_SAFE_INTEGER.");
  }

  return Number(result);
}

export async function prompt() {
  console.log("\tx % m1 = r1, x % m2 = r2 ... x = result");
  console.log(chalk.gray("\tx % 11 = 2, x % 19 = 1, x % 37 = 2. x = 2851"));

  const { base, modulo } = await inquirer.prompt([
    {
      type: "input",
      name: "base",
      message: `Enter ${chalk.italic("remainders")} (comma-separated):`,
      default: "2,1,2",
    },
    {
      type: "input",
      name: "modulo",
      message: `Enter ${chalk.italic("modulos")} (comma-separated):`,
      default: "11,19,37",
    },
  ]);

  const remainders = String(base)
    .split(",")
    .map((item) => Number(item.trim()));
  const modulos = String(modulo)
    .split(",")
    .map((item) => Number(item.trim()));

  const result = _(remainders, modulos);
  console.log(`\tResult x = ${result}`);
}
