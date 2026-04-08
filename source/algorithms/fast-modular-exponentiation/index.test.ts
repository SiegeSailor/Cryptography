import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import chalk from "@/shared/cli/chalk";
import { SYMBOLS } from "@/shared/constants";
import {
  expectSameErrorWithAndWithoutWASM,
  expectSameResultWithAndWithoutWASM,
} from "@/shared/testing/wasm";

describe("Calculating the remainder from doing modulus for a number with exponentiation", () => {
  test.each([
    [2, 100, 71, 20],
    [394948, 615192, 1093427, 1089500],
    [11, 2, 2, 1],
    [985019284, 118293113, 13, 6],
    [1314520, 17, 11, 4],
  ])(
    `%p^%p % %p ${SYMBOLS.CONGRUENT} x.\n\tx = ${chalk.greenBright("%p")}`,
    (base, exponent, modulo, result) => {
      const execute = () => {
        return fastModularExponentiation(
          BigInt(base),
          BigInt(exponent),
          BigInt(modulo),
        );
      };

      expect(execute()).toEqual(BigInt(result));
      expectSameResultWithAndWithoutWASM(execute);
    },
  );

  test.each([
    [2n, -1n, 5n, "exponent must be non-negative."],
    [2n, 3n, 0n, "modulo must be greater than 0."],
  ])(
    "keeps the same error with and without WASM for %p^%p mod %p",
    (base, exponent, modulo, errorMessage) => {
      expectSameErrorWithAndWithoutWASM(
        () => fastModularExponentiation(base, exponent, modulo),
        errorMessage,
      );
    },
  );
});
