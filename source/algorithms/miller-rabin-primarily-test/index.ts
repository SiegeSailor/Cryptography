import chalk from "@/common/chalk";
import { getInquirer } from "@/common/inquirer";

import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import { randomBigIntBetween } from "@/common/random";
import { wasmMillerRabinIfAvailable } from "./wasm";

export default function main(input: bigint, level: number) {
  if (input <= 1n || input === 4n) return false;
  if (input <= 3n) return true;
  if (level <= 0) {
    throw new Error("level must be a positive integer.");
  }

  const maybeWasmResult = wasmMillerRabinIfAvailable(input, level);
  if (maybeWasmResult !== null) {
    return maybeWasmResult;
  }

  let odd = input - 1n;
  while ((odd & 1n) === 0n) odd >>= 1n;

  const witnessRound = (n: bigint, d: bigint) => {
    const a = randomBigIntBetween(2n, n - 2n);
    let remainder = fastModularExponentiation(a, d, n);
    if (remainder === 1n || remainder === n - 1n) return true;

    let dCache = d;
    while (dCache !== n - 1n) {
      remainder = (remainder * remainder) % n;
      dCache <<= 1n;

      if (remainder === 1n) return false;
      if (remainder === n - 1n) return true;
    }

    return false;
  };

  for (let count = 0; count < level; count++) {
    if (!witnessRound(input, odd)) return false;
  }

  return true;
}

export async function prompt() {
  const inquirer = await getInquirer();
  console.log("\tisPrime(number, level) = result");
  console.log(chalk.gray("\tisPrime(104729, 10) = true"));

  const { input, level } = await inquirer.prompt([
    {
      type: "number",
      name: "input",
      message: `Enter ${chalk.italic("number")}:`,
      default: 104729,
    },
    {
      type: "number",
      name: "level",
      message: `Enter ${chalk.italic("level")}:`,
      default: 10,
    },
  ]);

  const result = main(BigInt(input), Number(level));
  console.log(`\tisPrime(${input}, ${level}) = ${result}`);
}
