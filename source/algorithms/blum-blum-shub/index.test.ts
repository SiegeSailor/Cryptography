import chalk from "chalk";

import { _ as blumBlumShub } from "./index";

describe("Generate pseudo random numbers", () => {
  test.each([8, 12, 16])(
    `${chalk.greenBright(
      "%p",
    )}-bit random number\n\tis smaller or equal to its base-10 value`,
    (bits) => {
      const result = blumBlumShub(bits)();
      expect(result > 0n).toBeTruthy();
    },
  );
});
