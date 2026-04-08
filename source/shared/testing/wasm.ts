import * as wasm from "@/shared/algorithm/wasm";

type TResultComparator<TResult> = (
  actualResult: TResult,
  fallbackResult: TResult,
) => void;

function captureError(execute: () => unknown) {
  try {
    execute();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function runWithoutWASM<TResult>(execute: () => TResult): TResult {
  const getAlgorithmWASMExportsSpy = jest
    .spyOn(wasm, "getAlgorithmWASMExports")
    .mockReturnValue(null);

  try {
    return execute();
  } finally {
    getAlgorithmWASMExportsSpy.mockRestore();
  }
}

export function expectSameResultWithAndWithoutWASM<TResult>(
  execute: () => TResult,
  compare?: TResultComparator<TResult>,
) {
  const actualResult = execute();
  const fallbackResult = runWithoutWASM(execute);

  if (compare) {
    compare(actualResult, fallbackResult);
    return;
  }

  expect(fallbackResult).toEqual(actualResult);
}

export function expectSameErrorWithAndWithoutWASM(
  execute: () => unknown,
  expectedMessage?: string,
) {
  const actualError = captureError(execute);
  const fallbackError = runWithoutWASM(() => captureError(execute));

  expect(actualError).not.toBeNull();

  if (expectedMessage !== undefined) {
    expect(actualError).toEqual(expectedMessage);
  }

  expect(fallbackError).toEqual(actualError);
}