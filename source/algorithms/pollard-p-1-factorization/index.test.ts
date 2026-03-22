import chalk from "@/common/chalk";

import pollardP1Factorization from "@/algorithms/pollard-p-1-factorization";

describe("Factor the given number", () => {
  test.each([
    [273, [3, 7, 13]],
    [9123, [3, 3041]],
    [1403, [23, 61]],
    [8051, [83, 97]],
    [10403, [101, 103]],
  ])(
    `%p is consist with some factors.\n\tfactors = ${chalk.greenBright("%p")}`,
    (input, result) => {
      expect(pollardP1Factorization(BigInt(input)).sort()).toEqual(
        result.sort(),
      );
    },
  );
});
