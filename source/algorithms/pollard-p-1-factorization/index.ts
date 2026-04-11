import euclidean from "@/algorithms/euclidean";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import pollardRho from "@/algorithms/pollard-rho";
import { createWASMInvoker, fitsInI64 } from "@/shared/algorithm/wasm";
import chalk from "@/shared/cli/chalk";
import {
  createAlgorithmPrompt,
  type IPromptOptions,
} from "@/shared/cli/prompt";

const runWASMPollardP1 = createWASMInvoker<[bigint, number], bigint>(
  "pollard-p-1-factorization",
  (wasmExports, input, maxExponent) => {
    if (
      !wasmExports.pollard_p1_i64 ||
      !fitsInI64(input) ||
      !Number.isInteger(maxExponent) ||
      maxExponent <= 0
    ) {
      return null;
    }

    const result = wasmExports.pollard_p1_i64(input, maxExponent);
    return result > 1n ? result : null;
  },
);

/**
 * Factors a composite integer by recursively applying Pollard's `p - 1`
 * method.
 *
 * The search succeeds quickly when a prime divisor `p` of the input has a
 * smooth `p - 1`, and the implementation falls back to Pollard rho when that
 * condition does not yield a non-trivial split. The routine combines fast
 * modular exponentiation for the powering steps, the Euclidean algorithm for
 * `gcd(a - 1, n)`, Miller-Rabin to stop recursion on primes, and Pollard rho
 * as a fallback splitter.
 *
 * @param input Composite integer `n` to factor.
 * @returns An array of prime factors of `n`, including repeated factors, as
 * JavaScript numbers.
 * @throws {Error} When input is not greater than 1.
 * @throws {Error} When input is prime.
 * @throws {Error} When recursive factorization fails to produce non-trivial prime factors.
 */
export default function main(input: bigint) {
  const pollardPMinusOne = (n: bigint) => {
    const maybeWASMFactor = runWASMPollardP1(n, 2500);
    if (
      maybeWASMFactor !== null &&
      maybeWASMFactor > 1n &&
      maybeWASMFactor < n
    ) {
      return maybeWASMFactor;
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

const runPrompt = createAlgorithmPrompt(
  "pollard-p-1-factorization",
  async ({ ask, writeLine }) => {
    writeLine(
      "\tFactorize a composite number using Pollard p-1 (with fallback). ",
    );
    writeLine(chalk.gray("\tinput = 8051 -> factors = [83, 97]"));

    const { input } = await ask<{ input: number }>([
      {
        type: "number",
        name: "input",
        message: `Enter ${chalk.italic("composite number")}:`,
        default: 8051,
      },
    ]);

    const result = main(BigInt(input));
    writeLine(`\tFactors = ${result}`);

    return {
      inputs: { input },
      result,
    };
  },
);

export async function prompt(options?: IPromptOptions) {
  return runPrompt(options);
}
