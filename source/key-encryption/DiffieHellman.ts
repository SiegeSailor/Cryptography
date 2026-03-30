import chalk from "@/shared/chalk";

import babyStepGiantStep from "@/algorithms/baby-step-giant-step";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import primitiveRootSearch from "@/algorithms/primitive-root-search";
import { ACTORS } from "@/shared/constants";
import { inquire, log, wrap } from "@/shared/utilities";
import { randomBigIntBetween } from "@/shared/random";

export async function prompt() {
  console.log(
    "There are three people in this Diffie-Hellman key exchange process:",
  );
  console.log(
    `\t${ACTORS.ALICE} - Party A\n\t${ACTORS.BOB} - Party B\n\t${ACTORS.EVE} - Eavesdropper`,
  );

  const [p, g, a, b, publicA, publicB] = await inquire.continue(
    `${ACTORS.ALICE} and ${ACTORS.BOB} select a public prime p and primitive root g, then choose private values a and b:`,
    () => {
      const [p] = wrap.randomize(8, 8, 1);
      const [, roots] = primitiveRootSearch(Number(p));
      const g = BigInt(roots[0]);
      const a = randomBigIntBetween(2n, p - 2n);
      const b = randomBigIntBetween(2n, p - 2n);
      const publicA = fastModularExponentiation(g, a, p);
      const publicB = fastModularExponentiation(g, b, p);

      log.list([
        { name: "p", value: p },
        { name: "g", value: g },
        { name: "a (private)", value: a },
        { name: "b (private)", value: b },
        { name: "A = g^a % p", value: publicA },
        { name: "B = g^b % p", value: publicB },
      ]);

      return [p, g, a, b, publicA, publicB];
    },
  );

  await inquire.continue(
    `${ACTORS.ALICE} and ${ACTORS.BOB} derive the same shared secret independently:`,
    () => {
      const secretAlice = fastModularExponentiation(publicB, a, p);
      const secretBob = fastModularExponentiation(publicA, b, p);

      log.list([
        { name: `${ACTORS.ALICE}'s secret`, value: secretAlice },
        { name: `${ACTORS.BOB}'s secret`, value: secretBob },
      ]);

      console.log(
        `\n\tShared secret agreement: ${chalk.gray(
          secretAlice === secretBob ? "success" : "failed",
        )}`,
      );
    },
  );

  await inquire.continue(
    `${ACTORS.EVE} can also recover the secret for small teaching parameters by solving the discrete log problem:`,
    () => {
      const aRecovered = babyStepGiantStep(g, publicA, p);
      const bRecovered = babyStepGiantStep(g, publicB, p);
      const secretEve = fastModularExponentiation(
        g,
        aRecovered * bRecovered,
        p,
      );

      log.list([
        { name: "Recovered a", value: aRecovered },
        { name: "Recovered b", value: bRecovered },
        { name: `${ACTORS.EVE}'s recovered shared secret`, value: secretEve },
      ]);
    },
  );
}
