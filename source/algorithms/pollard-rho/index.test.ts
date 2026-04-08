import pollardRho from "@/algorithms/pollard-rho";
import {
  expectSameErrorWithAndWithoutWASM,
  runWithoutWASM,
} from "@/shared/testing/wasm";

describe("Finding the factor for the given input", () => {
  test.each([
    361187n,
    29996224275867n,
    7n ** 5n,
    732564058083n * 605789375811n,
  ])(`%p has a non-trivial factor`, (input) => {
    const actualFactor = pollardRho(input);
    const fallbackFactor = runWithoutWASM(() => pollardRho(input));

    expect(actualFactor > 1n).toBeTruthy();
    expect(input % actualFactor).toEqual(0n);
    expect(fallbackFactor > 1n).toBeTruthy();
    expect(input % fallbackFactor).toEqual(0n);
  });

  test("keeps the same error with and without WASM for invalid input", () => {
    expectSameErrorWithAndWithoutWASM(
      () => pollardRho(1n),
      "input must be greater than 1.",
    );
  });
});
