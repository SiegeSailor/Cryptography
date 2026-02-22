import chalk from "chalk";
import inquirer from "inquirer";

import { _ as extendedEuclidean } from "../extended-euclidean";

export function _(base: bigint, modulo: bigint, number: number) {
  if (modulo <= 1n) {
    throw new Error("modulo must be greater than 1.");
  }
  if (number <= 0) {
    throw new Error("number must be a positive integer.");
  }

  const [gcd, x] = extendedEuclidean(base, modulo);
  if (gcd !== 1n) {
    throw new Error("base and modulo must be coprime.");
  }

  const inverse = ((x % modulo) + modulo) % modulo;
  const arrayOfInverse: bigint[] = [];
  for (let count = BigInt(1); count <= number; count++) {
    arrayOfInverse.push(inverse * count);
  }

  return arrayOfInverse;
}

export async function prompt() {
  console.log("\tmultiplicativeInverse(base, modulo, count) = [values]");
  console.log(
    chalk.gray("\tmultiplicativeInverse(23, 41, 5) = [25,50,75,100,125]"),
  );

  const { base, modulo, number } = await inquirer.prompt([
    {
      type: "number",
      name: "base",
      message: `Enter ${chalk.italic("base")}:`,
      default: 23,
    },
    {
      type: "number",
      name: "modulo",
      message: `Enter ${chalk.italic("modulo")}:`,
      default: 41,
    },
    {
      type: "number",
      name: "number",
      message: `Enter ${chalk.italic("count")}:`,
      default: 5,
    },
  ]);

  const result = _(BigInt(base), BigInt(modulo), Number(number));
  console.log(`\tResult = ${result}`);
}
