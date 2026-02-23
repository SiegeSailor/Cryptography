import chalk from "chalk";
import inquirer from "inquirer";

import { wasmGcdIfAvailable } from "./wasm";

export default function main(left: bigint, right: bigint): bigint {
  const wasmResult = wasmGcdIfAvailable(left, right);
  if (wasmResult !== null) {
    return wasmResult;
  }

  while (right !== BigInt(0)) {
    const cache = right;
    right = left % right;
    left = cache;
  }
  return left;
}

export async function prompt() {
  console.log("\tGCD(left, right) = result");
  console.log(chalk.gray("\tGCD(614, 513) = 1"));

  const { left, right } = await inquirer.prompt([
    {
      type: "number",
      name: "left",
      message: `Enter ${chalk.italic("left")}:`,
      default: 1,
    },
    {
      type: "number",
      name: "right",
      message: `Enter ${chalk.italic("right")}:`,
      default: 1,
    },
  ]);

  const result = main(BigInt(left), BigInt(right));
  console.log(`GCD(${left}, ${right}) = ${result}`);
}
