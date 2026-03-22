import chalk from "@/common/chalk";

import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import { ESymbols } from "@/common/constants";

describe("Calculating the remainder from doing modulus for a number with exponentiation", () => {
  test.each([
    [2, 100, 71, 20],
    [394948, 615192, 1093427, 1089500],
    [11, 2, 2, 1],
    [985019284, 118293113, 13, 6],
    [1314520, 17, 11, 4],
  ])(
    `%p^%p % %p ${ESymbols.Congruent} x.\n\tx = ${chalk.greenBright("%p")}`,
    (base, exponent, modulo, result) => {
      expect(
        fastModularExponentiation(
          BigInt(base),
          BigInt(exponent),
          BigInt(modulo),
        ),
      ).toEqual(BigInt(result));
    },
  );
});
