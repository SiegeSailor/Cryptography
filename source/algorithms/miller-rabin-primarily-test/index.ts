import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import { randomBigIntBetween } from "@/shared/algorithm/random";
import { createWASMInvoker, MAX_U64 } from "@/shared/algorithm/wasm";
import chalk from "@/shared/cli/chalk";
import {
  createAlgorithmPrompt,
  type IPromptOptions,
} from "@/shared/cli/prompt";

const runWASMMillerRabin = createWASMInvoker<[bigint, number], boolean>(
  "miller-rabin-primarily-test",
  (wasmExports, input, level) => {
    if (
      !wasmExports.miller_rabin_u64 ||
      input < 0n ||
      input > MAX_U64 ||
      !Number.isInteger(level) ||
      level <= 0
    ) {
      return null;
    }

    return wasmExports.miller_rabin_u64(input, level) === 1;
  },
);

export default function main(input: bigint, level: number) {
  if (input <= 1n || input === 4n) return false;
  if (input <= 3n) return true;
  if (level <= 0) {
    throw new Error("level must be a positive integer.");
  }

  const maybeWASMResult = runWASMMillerRabin(input, level);
  if (maybeWASMResult !== null) {
    return maybeWASMResult;
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

const runPrompt = createAlgorithmPrompt(
  "miller-rabin-primarily-test",
  async ({ ask, writeLine }) => {
    writeLine("\tisPrime(number, level) = result");
    writeLine(chalk.gray("\tisPrime(104729, 10) = true"));

    const { input, level } = await ask<{ input: number; level: number }>([
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
    writeLine(`\tisPrime(${input}, ${level}) = ${result}`);

    return {
      inputs: { input, level },
      result,
    };
  },
);

export async function prompt(options?: IPromptOptions) {
  return runPrompt(options);
}
