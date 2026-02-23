import chalk from "chalk";
import inquirer from "inquirer";

import euclidean from "@/algorithms/euclidean";
import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import pollardRho from "@/algorithms/pollard-rho";
import { wasmPollardP1IfAvailable } from "@/wasm/algorithms";

export default function _(input: bigint) {
  const pollardPMinusOne = (n: bigint) => {
    const maybeWasmFactor = wasmPollardP1IfAvailable(n, 2500);
    if (maybeWasmFactor !== null && maybeWasmFactor > 1n && maybeWasmFactor < n) {
      return maybeWasmFactor;
    }

    let base = 2n;

    for (let exponent = 2n; exponent < 2500n; exponent++) {
      base = fastModularExponentiation(base, exponent, n);
      const factor = euclidean(base - 1n, n);
      if (factor > 1n && factor < n) {
        return factor;
      }
    }

    return -1n;
  };

  if (input <= 1n) {
    throw new Error("input must be greater than 1.");
  }
  if (millerRabinPrimarilyTest(input, 10)) {
    throw new Error(`${input} is prime.`);
  }

  const factors: bigint[] = [];
  const factorize = (n: bigint) => {
    if (n === 1n) {
      return;
    }
    if (millerRabinPrimarilyTest(n, 10)) {
      factors.push(n);
      return;
    }

    let factor = pollardPMinusOne(n);
    if (factor === -1n) {
      factor = pollardRho(n);
    }
    if (factor <= 1n || factor === n) {
      throw new Error(`${n} from ${input} doesn't have prime factors.`);
    }

    factorize(factor);
    factorize(n / factor);
  };

  factorize(input);

  return factors.map((factor) => Number(factor));
}

export async function prompt() {
  console.log(
    "\tFactorize a composite number using Pollard p-1 (with fallback). ",
  );
  console.log(chalk.gray("\tinput = 8051 -> factors = [83, 97]"));

  const { input } = await inquirer.prompt([
    {
      type: "number",
      name: "input",
      message: `Enter ${chalk.italic("composite number")}:`,
      default: 8051,
    },
  ]);

  const result = _(BigInt(input));
  console.log(`\tFactors = ${result}`);
}
