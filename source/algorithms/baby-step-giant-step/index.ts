import chalk from "chalk";
import inquirer from "inquirer";

import euclidean from "@/algorithms/euclidean";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import { ESymbols } from "@/common/constants";
import { wasmBabyStepGiantStepIfAvailable } from "@/wasm/algorithms";

export default function _(generator: bigint, base: bigint, modulo: bigint) {
  if (modulo <= 1) throw new Error("Given modulo must be higher than 1");
  if (euclidean(generator, modulo) != BigInt(1))
    throw new Error("Given generator must satisfy GCD(generator, modulo) = 1");
  if (euclidean(base, modulo) != BigInt(1))
    throw new Error("Given base must satisfy GCD(base, modulo) = 1");

  const maybeWasmResult = wasmBabyStepGiantStepIfAvailable(
    generator,
    base,
    modulo,
  );
  if (maybeWasmResult !== null) {
    return maybeWasmResult;
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

export async function prompt() {
  console.log(`\tgenerator^x ${ESymbols.Congruent} base % modulo. x = result`);
  console.log(chalk.gray(`\t92^x ${ESymbols.Congruent} 13 % 5. x = 3`));

  const { generator, base, modulo } = await inquirer.prompt([
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

  const x = _(BigInt(generator), BigInt(base), BigInt(modulo));
  console.log(
    `\t${generator}^x ${ESymbols.Congruent} ${base} % ${modulo}. x = ${x}`,
  );
}
