import chalk from "chalk";

import chineseRemainder from "@/algorithms/chinese-remainder";

describe("Finding a number by the product of different remainders", () => {
  test.each([
    [[2, 1, 2], [11, 19, 37], 2851],
    [[2, 1], [11, 19], 134],
    [[50, 40, 30], [3, 5, 7], 65],
    [[128, 87, 921], [13, 17, 127], 14129],
    [[981237, 1238891], [218, 12839], 1469993],
  ])(
    `%p as integers and %p as modulo\n\tnumber is ${chalk.greenBright("%p")}`,
    (arrayOfBase, arrayOfModulo, result) => {
      expect(chineseRemainder(arrayOfBase, arrayOfModulo)).toEqual(result);
    }
  );
});
