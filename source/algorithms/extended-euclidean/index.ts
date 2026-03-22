import chalk from "@/common/chalk";
import { getInquirer } from "@/common/inquirer";

import { wasmExtendedEuclideanIfAvailable } from "./wasm";

export default function main(left: bigint, right: bigint) {
  const wasmResult = wasmExtendedEuclideanIfAvailable(left, right);
  if (wasmResult !== null) {
    return wasmResult;
  }

  const recursion = (left: bigint, right: bigint) => {
    if (right == BigInt(0)) return [left, BigInt(1), BigInt(0)];

    const arrayOfResult = main(right, left % right);
    return [
      arrayOfResult[0],
      arrayOfResult[2],
      arrayOfResult[1] - (left / right) * arrayOfResult[2],
    ];
  };

  return recursion(left, right);
}

export async function prompt() {
  const inquirer = await getInquirer();
  console.log("\tGCD(left, right) = result");
  console.log(chalk.gray("\tGCD(106, 112) = -19 * 106 + 18 * 112 = 2"));

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

  const [result, x, y] = main(BigInt(left), BigInt(right));
  console.log(
    `GCD(${left}, ${right}) = ${x} * ${left} + ${y} * ${right} = ${result}`,
  );
}
