import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import * as random from "@/shared/algorithm/random";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  runWithoutWASM,
} from "@/shared/testing/wasm";

describe("Determining if the given number is Prime", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [7984925229121, 10, false],
    [742621738636840244392549n, 5, true],
    [38270906631533, 5, false],
    [436885159382056146719494010011n, 10, true],
    [1268969304953789, 5, false],
  ])(
    `%p at level %p is prime.\n\tis ${chalk.greenBright("%p")}`,
    (input, level, result) => {
      expect(millerRabinPrimarilyTest(BigInt(input), level)).toEqual(result);
    },
  );

  test.each([
    [101n, 5, true],
    [221n, 5, false],
    [104729n, 5, true],
    [341n, 5, false],
  ])(
    "keeps the same classification with deterministic fallback witnesses for %p",
    (input, level, result) => {
      const witnesses = [2n, 3n, 5n, 7n, 11n];
      let witnessIndex = 0;

      jest.spyOn(random, "randomBigIntBetween").mockImplementation(() => {
        const witness = witnesses[witnessIndex % witnesses.length];
        witnessIndex += 1;
        return witness;
      });

      const actualResult = millerRabinPrimarilyTest(input, level);

      expect(actualResult).toEqual(result);

      witnessIndex = 0;
      expect(
        runWithoutWASM(() => millerRabinPrimarilyTest(input, level)),
      ).toEqual(actualResult);
    },
  );

  test.each([0, -1])(
    "keeps the same error with and without WASM for level %p",
    (level) => {
      expectSameErrorWithAndWithoutWASM(
        () => millerRabinPrimarilyTest(7n, level),
        "level must be a positive integer.",
      );
    },
  );
});
