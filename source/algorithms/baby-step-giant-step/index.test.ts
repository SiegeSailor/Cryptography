import babyStepGiantStep from "@/algorithms/baby-step-giant-step";
import chalk from "@/shared/cli/chalk";
import { SYMBOLS } from "@/shared/constants";
import {
  expectSameErrorWithAndWithoutWASM,
  expectSameResultWithAndWithoutWASM,
} from "@/shared/testing/wasm";

describe("Finding the Discrete Log for the given numbers", () => {
  test.each([
    [394948, 615192, 1093427, 246298],
    [92, 13, 5, 3],
    [87694, 86324, 114041, 72211],
    [227801, 155104, 291563, 74399],
    [62712, 30084, 83437, 68793],
  ])(
    `%p^x ${SYMBOLS.CONGRUENT} %p % %p.\n\tx = ${chalk.greenBright("%p")}`,
    (generator, base, modulo, result) => {
      const execute = () => {
        return babyStepGiantStep(
          BigInt(generator),
          BigInt(base),
          BigInt(modulo),
        );
      };

      expect(execute()).toEqual(BigInt(result));
      expectSameResultWithAndWithoutWASM(execute);
    },
  );

  test.each([
    [1n, 1n, 1n, "Given modulo must be higher than 1"],
    [4n, 1n, 8n, "Given generator must satisfy GCD(generator, modulo) = 1"],
    [3n, 4n, 8n, "Given base must satisfy GCD(base, modulo) = 1"],
  ])(
    "keeps the same error with and without WASM for %p, %p, %p",
    (generator, base, modulo, errorMessage) => {
      expectSameErrorWithAndWithoutWASM(
        () => babyStepGiantStep(generator, base, modulo),
        errorMessage,
      );
    },
  );
});
