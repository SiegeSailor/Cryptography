import chalk from "chalk";
import inquirer from "inquirer";

import { _ as euclidean } from "../euclidean";
import { math } from "../../common/utilities";
import { randomBigIntBetween } from "../../common/random";

export function _(input: bigint) {
  if (input <= 1n) {
    throw new Error("input must be greater than 1.");
  }
  if ((input & 1n) === 0n) {
    return 2n;
  }

  const f = (x: bigint, c: bigint) => (x * x + c) % input;

  for (let attempt = 0; attempt < 10; attempt++) {
    const c = randomBigIntBetween(1n, input - 1n);
    let x = randomBigIntBetween(2n, input - 1n);
    let y = x;
    let divisor = 1n;
    let iterations = 0;

    while (divisor === 1n) {
      x = f(x, c);
      y = f(f(y, c), c);
      divisor = euclidean(math.absolute(x - y), input);
      iterations += 1;

      if (iterations > 100_000) {
        divisor = input;
      }
    }

    if (divisor !== input) {
      return divisor;
    }
  }

  return 1n;
}

export async function prompt() {}
