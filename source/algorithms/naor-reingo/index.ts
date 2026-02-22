import chalk from "chalk";
import inquirer from "inquirer";

import { randomBigIntBetween } from "../../common/random";

export function _(count: number, digits: number) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("count must be a positive integer.");
  }
  if (!Number.isInteger(digits) || digits < 1) {
    throw new Error("digits must be a positive integer.");
  }

  const lowerBound = 10n ** BigInt(Math.max(0, digits - 1));
  const upperBound = 10n ** BigInt(digits) - 1n;

  const arrayOfResult: number[] = [];
  for (let i = 0; i < count; i++) {
    arrayOfResult.push(Number(randomBigIntBetween(lowerBound, upperBound)));
  }

  return arrayOfResult;
}

export async function prompt() {
  console.log(
    "\tGenerate pseudo-random decimal numbers with fixed digit length.",
  );
  console.log(chalk.gray("\tcount = 3, digits = 2 -> [.., .., ..]"));

  const { count, digits } = await inquirer.prompt([
    {
      type: "number",
      name: "count",
      message: `Enter ${chalk.italic("count")}:`,
      default: 3,
    },
    {
      type: "number",
      name: "digits",
      message: `Enter ${chalk.italic("digits")}:`,
      default: 2,
    },
  ]);

  const result = _(Number(count), Number(digits));
  console.log(`\tResult = ${result}`);
}
