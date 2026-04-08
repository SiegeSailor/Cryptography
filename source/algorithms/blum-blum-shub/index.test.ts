import blumBlumShub from "@/algorithms/blum-blum-shub";
import * as random from "@/shared/algorithm/random";
import chalk from "@/shared/cli/chalk";
import {
  expectSameErrorWithAndWithoutWASM,
  runWithoutWASM,
} from "@/shared/testing/wasm";

describe("Generate pseudo random numbers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([8, 12, 16])(
    `${chalk.greenBright(
      "%p",
    )}-bit random number\n\tis smaller or equal to its base-10 value`,
    (bits) => {
      const actualResult = blumBlumShub(bits)();
      const fallbackResult = runWithoutWASM(() => blumBlumShub(bits)());

      expect(actualResult > 0n).toBeTruthy();
      expect(fallbackResult > 0n).toBeTruthy();
    },
  );

  test("produces the same next value with and without WASM when entropy is fixed", () => {
    const candidateValues = [11n, 19n];
    let candidateIndex = 0;

    jest.spyOn(random, "randomBigIntBits").mockImplementation(() => {
      const value = candidateValues[candidateIndex % candidateValues.length];
      candidateIndex += 1;
      return value;
    });
    jest.spyOn(random, "randomBigIntBetween").mockReturnValue(3n);

    const execute = () => {
      candidateIndex = 0;
      return blumBlumShub(8)();
    };

    const actualResult = execute();

    expect(actualResult).toEqual(81n);
    expect(runWithoutWASM(execute)).toEqual(actualResult);
  });

  test.each([0, 7])(
    "keeps the same error with and without WASM for %p bits",
    (bits) => {
      expectSameErrorWithAndWithoutWASM(
        () => blumBlumShub(bits),
        "Given bits must be an integer and at least 8.",
      );
    },
  );
});
