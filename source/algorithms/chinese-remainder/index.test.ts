import chineseRemainder from "@/algorithms/chinese-remainder";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  expectSameResultWithAndWithoutWASM,
} from "@/shared/testing/wasm";

describe("Finding a number by the product of different remainders", () => {
  test.each([
    [[2, 1, 2], [11, 19, 37], 2851],
    [[2, 1], [11, 19], 134],
    [[50, 40, 30], [3, 5, 7], 65],
    [[128, 87, 921], [13, 17, 127], 14129],
    [[981237, 1238891], [218, 12839], 1469993],
  ])(
    `%p as integers and %p as modulo\n\tnumber is ${chalk.greenBright("%p")}`,
    (arrayOfBase, arrayOfModulo, result) => {
      const execute = () => chineseRemainder(arrayOfBase, arrayOfModulo);

      expect(execute()).toEqual(result);
      expectSameResultWithAndWithoutWASM(execute);
    },
  );

  test.each([
    [
      [1, 2],
      [3],
      "The length for the two given arrays should be the same.",
    ],
    [[1, 2], [4, 6], "All modulo values must be pairwise coprime."],
  ])(
    "keeps the same error with and without WASM for %p and %p",
    (remainders, modulos, errorMessage) => {
      expectSameErrorWithAndWithoutWASM(
        () => chineseRemainder(remainders, modulos),
        errorMessage,
      );
    },
  );
});
