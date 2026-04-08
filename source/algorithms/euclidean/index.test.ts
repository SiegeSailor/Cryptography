import euclidean from "@/algorithms/euclidean";
import chalk from "@/shared/cli/chalk";
import { expectSameResultWithAndWithoutWASM } from "@/shared/testing/wasm";

describe("Finding the Greatest Common Divisor of the given numbers", () => {
  test.each([
    [2, 4, 2],
    [816, 2260, 4],
    [30513, 40242, 3],
    [614, 513, 1],
    [5102048903, 307803219, 1],
  ])(
    `GCD(%p, %p) = x.\n\tx = ${chalk.greenBright("%p")}`,
    (left, right, result) => {
      const execute = () => euclidean(BigInt(left), BigInt(right));

      expect(execute()).toEqual(BigInt(result));
      expectSameResultWithAndWithoutWASM(execute);
    },
  );
});
