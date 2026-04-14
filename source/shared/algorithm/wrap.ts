import millerRabinPrimalityTest from "@/algorithms/miller-rabin-primality-test";
import { randomBigIntBits } from "@/shared/algorithm/random";

export const wrap = {
  randomize: (bits: number, level: number, count: number) => {
    if (!Number.isInteger(bits) || bits < 8) {
      throw new Error("bits must be an integer and at least 8.");
    }

    const randomOdd = () => {
      let candidate = randomBigIntBits(bits);
      if ((candidate & 1n) === 0n) {
        candidate += 1n;
      }
      return candidate;
    };

    const arrayOfPrime: bigint[] = [];
    while (arrayOfPrime.length !== count) {
      const candidate = randomOdd();
      if (millerRabinPrimalityTest(candidate, level)) {
        arrayOfPrime.push(candidate);
      }
    }

    return arrayOfPrime;
  },
  remain: (modulo: bigint, remainder: bigint) => {
    if (remainder >= modulo) {
      throw new Error(
        "Desired remainder can't be equal to or larger than the given modulo.",
      );
    }

    const arrayOfResult: bigint[] = [];

    let cache = modulo + remainder;
    for (let i = 0; i < 10; i++) {
      arrayOfResult.push(cache);
      cache = cache + modulo;
    }
    return arrayOfResult;
  },
  encrypt: (message: string, callback: (code: number) => bigint) => {
    return message.split("").map((character) => {
      const code = character.charCodeAt(0);
      return callback(code);
    });
  },
  decrypt: (
    arrayOfEncryptedCode: bigint[],
    callback: (codeEncrypted: bigint) => bigint,
  ) => {
    return arrayOfEncryptedCode
      .map((codeEncrypted) => {
        const code = callback(codeEncrypted);
        return String.fromCharCode(Number(code));
      })
      .join("");
  },
};
