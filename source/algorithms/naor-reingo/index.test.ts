import chalk from "@/common/chalk";

import naorReingo from "@/algorithms/naor-reingo";

describe("Generate pseudo random numbers", () => {
  test.each([1, 2, 5, 10, 15])(
    `${chalk.greenBright(
      "%p",
    )}-digit random number\n\tis smaller or equal to its base-10 value * 10`,
    (digits) => {
      expect(naorReingo(1, digits)[0]).toBeLessThanOrEqual(
        Math.pow(10, digits),
      );
    },
  );
});
