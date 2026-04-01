import chalk from "@/shared/chalk";
import { createAlgorithmPrompt, type PromptOptions } from "@/shared/prompt";
import euclidean from "@/algorithms/euclidean";
import { SYMBOLS } from "@/shared/constants";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import { createWASMInvoker, fitsInI64 } from "@/shared/wasm";

const runWASMBabyStepGiantStep = createWASMInvoker<
  [bigint, bigint, bigint],
  bigint
>("baby-step-giant-step", (wasmExports, generator, base, modulo) => {
  if (
    !wasmExports.baby_step_giant_step_i64 ||
    modulo <= 1n ||
    generator < 0n ||
    base < 0n ||
    !fitsInI64(generator) ||
    !fitsInI64(base) ||
    !fitsInI64(modulo)
  ) {
    return null;
  }

  const limit = modulo > 2_000_000n ? 2_000_000n : modulo;
  const result = wasmExports.baby_step_giant_step_i64(
    generator,
    base,
    modulo,
    limit,
  );

  return result < 0n ? null : result;
});

export default function main(generator: bigint, base: bigint, modulo: bigint) {
  if (modulo <= 1) throw new Error("Given modulo must be higher than 1");
  if (euclidean(generator, modulo) != BigInt(1))
    throw new Error("Given generator must satisfy GCD(generator, modulo) = 1");
  if (euclidean(base, modulo) != BigInt(1))
    throw new Error("Given base must satisfy GCD(base, modulo) = 1");

  const maybeWASMResult = runWASMBabyStepGiantStep(generator, base, modulo);
  if (maybeWASMResult !== null) {
    return maybeWASMResult;
  }

  const numberOfSteps = BigInt(Math.ceil(Math.sqrt(Number(modulo)))) + 1n;

  const collision = new Map<bigint, bigint>();
  for (let i = numberOfSteps; i >= 1n; i--) {
    const remainder = fastModularExponentiation(
      generator,
      i * numberOfSteps,
      modulo,
    );
    collision.set(remainder, i);
  }

  for (let j = 0n; j < numberOfSteps; j++) {
    const indexCurrent =
      (fastModularExponentiation(generator, j, modulo) * base) % modulo;
    const step = collision.get(indexCurrent);

    if (step && step > 0n) {
      const result = step * numberOfSteps - j;
      if (result < modulo) return result;
    }
  }

  return BigInt(-1);
}

const runPrompt = createAlgorithmPrompt(
  "baby-step-giant-step",
  async ({ ask, writeLine }) => {
    writeLine(`\tgenerator^x ${SYMBOLS.CONGRUENT} base % modulo. x = result`);
    writeLine(chalk.gray(`\t92^x ${SYMBOLS.CONGRUENT} 13 % 5. x = 3`));

    const { generator, base, modulo } = await ask<{
      generator: number;
      base: number;
      modulo: number;
    }>([
      {
        type: "number",
        name: "generator",
        message: `Enter ${chalk.italic("generator")}:`,
        default: 1,
      },
      {
        type: "number",
        name: "base",
        message: `Enter ${chalk.italic("base")}:`,
        default: 1,
      },
      {
        type: "number",
        name: "modulo",
        message: `Enter ${chalk.italic("modulo")}:`,
        default: 2,
      },
    ]);

    const result = main(BigInt(generator), BigInt(base), BigInt(modulo));
    writeLine(
      `\t${generator}^x ${SYMBOLS.CONGRUENT} ${base} % ${modulo}. x = ${result}`,
    );

    return {
      inputs: { generator, base, modulo },
      result,
    };
  },
);

export async function prompt(options?: PromptOptions) {
  return runPrompt(options);
}
