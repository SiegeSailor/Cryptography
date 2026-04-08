import primitiveRootSearch from "@/algorithms/primitive-root-search";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  expectSameResultWithAndWithoutWASM,
} from "@/shared/testing/wasm";

describe("Finding the Primitive Roots of the given numbers", () => {
  test.each([
    [23, [5, 7, 10, 11, 14, 15, 17, 19, 20, 21]],
    [
      131,
      [
        2, 6, 8, 10, 14, 17, 22, 23, 26, 29, 30, 31, 37, 40, 50, 54, 56, 57, 66,
        67, 72, 76, 82, 83, 85, 87, 88, 90, 93, 95, 96, 97, 98, 103, 104, 106,
        110, 111, 115, 116, 118, 119, 120, 122, 124, 126, 127, 128,
      ],
    ],
    [
      47,
      [
        5, 10, 11, 13, 15, 19, 20, 22, 23, 26, 29, 30, 31, 33, 35, 38, 39, 40,
        41, 43, 44, 45,
      ],
    ],
    [13, [2, 6, 7, 11]],
    [
      71,
      [
        7, 11, 13, 21, 22, 28, 31, 33, 35, 42, 44, 47, 52, 53, 55, 56, 59, 61,
        62, 63, 65, 67, 68, 69,
      ],
    ],
  ])(
    `%p has some primitive roots.\n\tprimitive roots = ${chalk.greenBright(
      "%p",
    )}`,
    (input, result) => {
      const execute = () => {
        return primitiveRootSearch(input)[1].sort(
          (left, right) => left - right,
        );
      };

      expect(execute()).toEqual(
        [...result].sort((left, right) => left - right),
      );
      expectSameResultWithAndWithoutWASM(execute);
    },
  );

  test("keeps the same error with and without WASM for non-prime input", () => {
    expectSameErrorWithAndWithoutWASM(
      () => primitiveRootSearch(21),
      "The Given number must be prime.",
    );
  });
});
