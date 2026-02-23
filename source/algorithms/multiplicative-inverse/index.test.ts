import chalk from "chalk";

import multiplicativeInverse from "@/algorithms/multiplicative-inverse";

describe("Finding the Multiplicative Inverses of the given numbers", () => {
  test.each([
    { base: 87, modulo: 131, result: [128, 256, 384, 512, 640] },
    { base: 23, modulo: 41, result: [25, 50, 75, 100, 125] },
    { base: 11, modulo: 13, result: [6, 12, 18, 24, 30] },
    { base: 2, modulo: 7, result: [4, 8, 12, 16, 20] },
    { base: 1011, modulo: 913, result: [736, 1472, 2208, 2944, 3680] },
  ])(
    `y is the multiplicative inverse of $base $ $modulo ($base * y % $modulo = 1)\n\ty = ${chalk.greenBright(
      "$result",
    )}`,
    ({ base, modulo, result }) => {
      expect(
        multiplicativeInverse(BigInt(base), BigInt(modulo), 5).sort(),
      ).toEqual(
        result
          .map((item) => {
            return BigInt(item);
          })
          .sort(),
      );
    },
  );
});
