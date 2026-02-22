import { _ as pollardRho } from "./index";

describe("Finding the factor for the given input", () => {
  test.each([
    361187n,
    29996224275867n,
    7n ** 5n,
    732564058083n * 605789375811n,
  ])(`%p has a non-trivial factor`, (input) => {
    const factor = pollardRho(input);
    expect(factor > 0n).toBeTruthy();
    expect(input % factor).toEqual(0n);
  });
});
