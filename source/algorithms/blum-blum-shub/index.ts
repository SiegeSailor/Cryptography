import chalk from "chalk";
import inquirer from "inquirer";

import euclidean from "@/algorithms/euclidean";
import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import { randomBigIntBits, randomBigIntBetween } from "@/common/random";
import { wasmBlumBlumShubNextIfAvailable } from "@/wasm/algorithms";

export default function _(bits: number) {
  if (!Number.isInteger(bits) || bits < 8) {
    throw new Error("Given bits must be an integer and at least 8.");
  }

  const certainty = Math.max(5, Math.ceil(Math.log2(bits)));

  const randomOddWithBits = (size: number) => {
    let candidate = randomBigIntBits(size);
    if ((candidate & 1n) === 0n) candidate += 1n;
    return candidate;
  };

  const generateBlumPrime = (size: number) => {
    while (true) {
      let candidate = randomOddWithBits(size);
      if (candidate % 4n !== 3n) {
        candidate += (3n - (candidate % 4n) + 4n) % 4n;
      }
      if (millerRabinPrimarilyTest(candidate, certainty)) {
        return candidate;
      }
    }
  };

  const p = generateBlumPrime(bits);
  let q = generateBlumPrime(bits);
  while (q === p) {
    q = generateBlumPrime(bits);
  }

  const m = p * q;

  let seed = randomBigIntBetween(2n, m - 2n);
  while (euclidean(seed, m) !== 1n) {
    seed = randomBigIntBetween(2n, m - 2n);
  }

  let result = (seed * seed) % m;

  return () => {
    const maybeWasmResult = wasmBlumBlumShubNextIfAvailable(result, m);
    if (maybeWasmResult !== null) {
      result = maybeWasmResult;
      return result;
    }

    result = (result * result) % m;
    return result;
  };
}

export async function prompt() {
  console.log(`\tgenerate a 8-bit pseudo-random number x. x = result`);
  console.log(
    chalk.gray(`\tx is smaller or equal to ${Math.pow(2, 8) * Math.pow(2, 8)}`),
  );

  const { bits } = await inquirer.prompt([
    {
      type: "number",
      name: "bits",
      message: `Enter ${chalk.italic("bits")}:`,
      default: 1,
    },
  ]);

  const x = _(bits)();
  console.log(`\t${bits}-bit x = ${x}`);
}
