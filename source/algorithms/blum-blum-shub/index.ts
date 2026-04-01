import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";

import euclidean from "@/algorithms/euclidean";
import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import { randomBigIntBits, randomBigIntBetween } from "@/shared/random";
import { createWASMInvoker, fitsInI64 } from "@/shared/wasm";

const runWASMBlumBlumShubNext = createWASMInvoker<[bigint, bigint], bigint>(
  "blum-blum-shub",
  (wasmExports, state, modulus) => {
    if (
      !wasmExports.blum_blum_shub_next_u64 ||
      state < 0n ||
      modulus <= 0n ||
      !fitsInI64(state) ||
      !fitsInI64(modulus)
    ) {
      return null;
    }

    return wasmExports.blum_blum_shub_next_u64(state, modulus);
  },
);

export default function main(bits: number) {
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
    const maybeWASMResult = runWASMBlumBlumShubNext(result, m);
    if (maybeWASMResult !== null) {
      result = maybeWASMResult;
      return result;
    }

    result = (result * result) % m;
    return result;
  };
}

const runPrompt = createAlgorithmPrompt(
  "blum-blum-shub",
  async ({ ask, writeLine }) => {
    writeLine(`\tgenerate a 8-bit pseudo-random number x. x = result`);
    writeLine(
      chalk.gray(
        `\tx is smaller or equal to ${Math.pow(2, 8) * Math.pow(2, 8)}`,
      ),
    );

    const { bits } = await ask<{ bits: number }>([
      {
        type: "number",
        name: "bits",
        message: `Enter ${chalk.italic("bits")}:`,
        default: 8,
      },
    ]);

    const result = main(bits)();
    writeLine(`\t${bits}-bit x = ${result}`);

    return {
      inputs: { bits },
      result,
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
