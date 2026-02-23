import chalk from "chalk";

import babyStepGiantStep from "@/algorithms/baby-step-giant-step";
import { ESymbols } from "@/common/constants";

describe("Finding the Discrete Log for the given numbers", () => {
  test.each([
    [394948, 615192, 1093427, 246298],
    [92, 13, 5, 3],
    [87694, 86324, 114041, 72211],
    [227801, 155104, 291563, 74399],
    [62712, 30084, 83437, 68793],
  ])(
    `%p^x ${ESymbols.Congruent} %p % %p.\n\tx = ${chalk.greenBright("%p")}`,
    (generator, base, modulo, result) => {
      expect(
        babyStepGiantStep(BigInt(generator), BigInt(base), BigInt(modulo))
      ).toEqual(BigInt(result));
    }
  );
});
