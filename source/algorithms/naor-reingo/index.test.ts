import naorReingo from "@/algorithms/naor-reingo";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  runWithoutWASM,
} from "@/shared/testing/wasm";

describe("Generate pseudo random numbers", () => {
  test.each([1, 2, 5, 10, 15])(
    `${chalk.greenBright(
      "%p",
    )}-digit random number\n\tis smaller or equal to its base-10 value * 10`,
    (digits) => {
      const lowerBound = digits === 1 ? 1 : Math.pow(10, digits - 1);
      const upperBound = Math.pow(10, digits) - 1;

      const actualResult = naorReingo(1, digits)[0];
      const fallbackResult = runWithoutWASM(() => naorReingo(1, digits)[0]);

      expect(actualResult).toBeGreaterThanOrEqual(lowerBound);
      expect(actualResult).toBeLessThanOrEqual(upperBound);
      expect(fallbackResult).toBeGreaterThanOrEqual(lowerBound);
      expect(fallbackResult).toBeLessThanOrEqual(upperBound);
    },
  );

  test.each([
    [0, 1, "count must be a positive integer."],
    [1, 0, "digits must be a positive integer."],
  ])(
    "keeps the same error with and without WASM for count %p and digits %p",
    (count, digits, errorMessage) => {
      expectSameErrorWithAndWithoutWASM(
        () => naorReingo(count, digits),
        errorMessage,
      );
    },
  );
});
