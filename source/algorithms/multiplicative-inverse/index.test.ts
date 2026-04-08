import multiplicativeInverse from "@/algorithms/multiplicative-inverse";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  expectSameResultWithAndWithoutWASM,
} from "@/shared/testing/wasm";

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
      const execute = () =>
        multiplicativeInverse(BigInt(base), BigInt(modulo), 5);

      expect(execute()).toEqual(result.map((item) => BigInt(item)));
      expectSameResultWithAndWithoutWASM(execute);
    },
  );

  test.each([
    [23n, 1n, 5, "modulo must be greater than 1."],
    [23n, 41n, 0, "number must be a positive integer."],
    [2n, 4n, 1, "base and modulo must be coprime."],
    [(1n << 63n) + 1n, 3n, 1, "base and modulo must be coprime."],
  ])(
    "keeps the same error with and without WASM for %p mod %p",
    (base, modulo, count, errorMessage) => {
      expectSameErrorWithAndWithoutWASM(
        () => multiplicativeInverse(base, modulo, count),
        errorMessage,
      );
    },
  );
});
