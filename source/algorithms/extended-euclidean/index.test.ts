import chalk from "@/common/chalk";

import extendedEuclidean from "@/algorithms/extended-euclidean";

describe("Finding the Greatest Common Divisor of the given numbers in smallest integers form", () => {
  test.each([
    { left: 106, right: 112, x: -19, y: 18, result: 2 },
    { left: 640, right: 531, x: 190, y: -229, result: 1 },
    { left: 9123879, right: 421891, x: -19310, y: 417601, result: 1 },
    { left: 102039129492, right: 13, x: 1, y: -7849163807, result: 1 },
    { left: 13, right: 26, x: 1, y: 0, result: 13 },
  ])(
    `GCD($left, $right) = x.\n\tx = ${chalk.greenBright(
      "$x * $left + $y * $right",
    )}`,
    ({ left, right, x, y, result }) => {
      expect(extendedEuclidean(BigInt(left), BigInt(right))).toEqual([
        BigInt(result),
        BigInt(x),
        BigInt(y),
      ]);
    },
  );
});
