import chalk from "@/shared/chalk";

import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";

describe("Determining if the given number is Prime", () => {
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
});
