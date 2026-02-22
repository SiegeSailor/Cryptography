// import chalk from "chalk";
// import inquirer from "inquirer";

// import { _ as millerRabinPrimarilyTest } from "../miller-rabin-primarily-test";
// import { _ as pollardRho } from "../pollard-rho";

// export function _(seed: number, bits: number) {
//   if (seed <= 0 || bits <= 0)
//     throw new Error("Given parameters must be higher than 0.");

//   const p = generatePrime(bits, 3, 4, bits * 1000);
//   const q = generatePrime(bits, 3, 4, bits * 1000);
//   const product = p * q;
//   let x = BigInt(seed) % product;

//   function generatePrime(
//     bits: number,
//     congruent: number,
//     modular: number,
//     maxIterations: number
//   ): bigint {
//     let iterations = 0;
//     while (iterations < maxIterations) {
//       const candidate = randomOddNumber(bits);
//       if (
//         millerRabinPrimarilyTest(candidate, bits) &&
//         candidate % BigInt(modular) === BigInt(congruent)
//       ) {
//         return candidate;
//       }
//       const factor = pollardRho(candidate);
//       if (factor !== candidate && factor !== 1n) {
//         const z = factor;
//         const a = candidate / z;
//         if (z < a) {
//           return a;
//         } else {
//           return z;
//         }
//       }
//       iterations++;
//     }
//     throw new Error(
//       `Failed to generate prime after ${maxIterations} iterations.`
//     );
//   }

//   function randomOddNumber(bits: number): bigint {
//     const min = 2n ** BigInt(bits - 1) + 1n;
//     const max = 2n ** BigInt(bits) - 1n;
//     const range = max - min;
//     const random = BigInt(Math.floor(Math.random() * Number(range)));
//     return min + random;
//   }

//   return () => {
//     x = (x * x) % product;
//     return x / product;
//   };
// }

// export async function prompt() {
//   console.log(`\tgenerate a 8-bit pseudo-random number x. x = result`);
//   console.log(
//     chalk.gray(`\tx is smaller or equal to ${Math.pow(2, 8) * Math.pow(2, 8)}`)
//   );

//   const { bits } = await inquirer.prompt([
//     {
//       type: "number",
//       name: "bits",
//       message: `Enter ${chalk.italic("bits")}:`,
//       default: 1,
//     },
//   ]);

//   const x = _(1, bits)();
//   console.log(`\t${bits}-bit x = ${x}`);
// }

import chalk from "chalk";
import inquirer from "inquirer";

import { _ as euclidean } from "../euclidean";
import { _ as millerRabinPrimarilyTest } from "../miller-rabin-primarily-test";
import { randomBigIntBits, randomBigIntBetween } from "../../common/random";

export function _(bits: number) {
  if (!Number.isInteger(bits) || bits < 8) {
    throw new Error("Given bits must be an integer and at least 8.");
  }

  const certainty = Math.max(5, Math.ceil(Math.log2(bits)));

  const randomOddWithBits = (size: number) => {
    let candidate = randomBigIntBits(size);
    if ((candidate & 1n) === 0n) candidate += 1n;
    return candidate;
  };

  const generateBlumPrime = (size: number) => {
    while (true) {
      let candidate = randomOddWithBits(size);
      if (candidate % 4n !== 3n) {
        candidate += (3n - (candidate % 4n) + 4n) % 4n;
      }
      if (millerRabinPrimarilyTest(candidate, certainty)) {
        return candidate;
      }
    }
  };

  const p = generateBlumPrime(bits);
  let q = generateBlumPrime(bits);
  while (q === p) {
    q = generateBlumPrime(bits);
  }

  const m = p * q;

  let seed = randomBigIntBetween(2n, m - 2n);
  while (euclidean(seed, m) !== 1n) {
    seed = randomBigIntBetween(2n, m - 2n);
  }

  let result = (seed * seed) % m;

  return () => {
    result = (result * result) % m;
    return result;
  };
}

export async function prompt() {
  console.log(`\tgenerate a 8-bit pseudo-random number x. x = result`);
  console.log(
    chalk.gray(`\tx is smaller or equal to ${Math.pow(2, 8) * Math.pow(2, 8)}`),
  );

  const { bits } = await inquirer.prompt([
    {
      type: "number",
      name: "bits",
      message: `Enter ${chalk.italic("bits")}:`,
      default: 1,
    },
  ]);

  const x = _(bits)();
  console.log(`\t${bits}-bit x = ${x}`);
}
