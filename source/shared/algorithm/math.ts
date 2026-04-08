export const math = {
  absolute: (input: bigint) => {
    return input < BigInt(0) ? -input : input;
  },
};