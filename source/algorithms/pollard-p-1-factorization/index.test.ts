import pollardP1Factorization from "@/algorithms/pollard-p-1-factorization";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  expectSameResultWithAndWithoutWASM,
} from "@/shared/testing/wasm";

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
      const execute = () => {
        return pollardP1Factorization(BigInt(input)).sort((left, right) => {
          return left - right;
        });
      };

      expect(execute()).toEqual([...result].sort((left, right) => left - right));
      expectSameResultWithAndWithoutWASM(execute);
    },
  );

  test.each([
    [1n, "input must be greater than 1."],
    [101n, "101 is prime."],
  ])(
    "keeps the same error with and without WASM for %p",
    (input, errorMessage) => {
      expectSameErrorWithAndWithoutWASM(
        () => pollardP1Factorization(input),
        errorMessage,
      );
    },
  );
});
