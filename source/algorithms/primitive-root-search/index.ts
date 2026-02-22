import chalk from "chalk";
import inquirer from "inquirer";

import { _ as fastModularExponentiation } from "./../fast-modular-exponentiation";
import { _ as millerRabinPrimarilyTest } from "./../miller-rabin-primarily-test";

export function _(prime: number): [number[][], number[]] {
  if (!millerRabinPrimarilyTest(BigInt(prime), 10))
    throw new Error("The Given number must be prime.");

  const phi = prime - 1;
  const table: number[][] = Array.from({ length: phi }, () =>
    Array.from({ length: phi }, () => 0),
  );

  const arrayOfResult: number[] = [];

  for (let indexRow = 0; indexRow < table.length; indexRow++) {
    const set = new Set<number>();
    let isPrimitiveRoot = true;
    for (let indexColumn = 0; indexColumn < table[0].length; indexColumn++) {
      const exponent = fastModularExponentiation(
        BigInt(indexRow + 1),
        BigInt(indexColumn + 1),
        BigInt(prime),
      );
      const index = Number(exponent);
      table[indexRow][indexColumn] = index;

      if (set.has(index)) {
        isPrimitiveRoot = false;
      }
      set.add(index);
    }

    if (isPrimitiveRoot) arrayOfResult.push(indexRow + 1);
  }

  return [table, arrayOfResult];
}

export async function prompt() {
  console.log("\tprimitive roots for x = y1, y2, y3...");
  console.log(
    chalk.gray(
      "\tprimitive roots for 23 = 5, 7, 10, 11, 14, 15, 17, 19, 20, 21",
    ),
  );

  const { prime } = await inquirer.prompt([
    {
      type: "number",
      name: "prime",
      message: `Enter ${chalk.italic("prime")}:`,
      default: 7,
    },
  ]);

  const result = _(prime);
  console.log(`primitive roots for ${prime} = ${result[1].sort()}`);
}
