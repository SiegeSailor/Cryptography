import babyStepGiantStep from "@/algorithms/baby-step-giant-step";
import euclidean from "@/algorithms/euclidean";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import primitiveRootSearch from "@/algorithms/primitive-root-search";
import { randomBigIntBetween } from "@/shared/algorithm/random";
import { wrap } from "@/shared/algorithm/wrap";
import chalk from "@/shared/cli/chalk";
import { inquire, log } from "@/shared/cli/utilities";
import { ACTORS } from "@/shared/constants";

export async function prompt() {
  try {
    console.log("There are three people in this ElGamal encryption process:");
    console.log(
      `\t${ACTORS.ALICE} - Receiver\n\t${ACTORS.BOB} - Sender\n\t${ACTORS.EVE} - Eavesdropper`,
    );

    const [p, g, r, x, y] = await inquire.continue(
      `${ACTORS.ALICE} is going to pick prime number P, generator g, and random numbers r and x:`,
      () => {
        const [p] = wrap.randomize(8, 8, 1);
        const [, roots] = primitiveRootSearch(Number(p));
        const g = BigInt(roots[0]);

        let r = randomBigIntBetween(2n, p - 2n);
        while (euclidean(r, p - 1n) !== 1n) {
          r = randomBigIntBetween(2n, p - 2n);
        }
        const x = randomBigIntBetween(2n, p - 2n);
        log.list([
          { name: "P", value: p },
          { name: "g", value: g },
          { name: "r", value: r },
          { name: "x", value: x },
        ]);

        console.log(`\n\t${ACTORS.ALICE} generates y:`);
        const y = fastModularExponentiation(g, x, p);
        console.log(`\ty: ${chalk.gray(y)}`);

        console.log(
          `\n\t${ACTORS.ALICE} sends ${chalk.bold.bgCyan(
            "(g, r, p, y)",
          )} as the public key to ${ACTORS.BOB} and ${ACTORS.EVE}.`,
        );

        return [p, g, r, x, y];
      },
    );

    const message = "This is a hardcoded secret message.";
    const [keyEncrypted, arrayOfEncryptedCode] = await inquire.continue(
      `${ACTORS.BOB} encrypts the message and sends it back to ${ACTORS.ALICE} (while ${ACTORS.EVE} is eavesdropping).`,
      () => {
        const keyEncrypted = fastModularExponentiation(g, r, p);
        const sharedSecret = fastModularExponentiation(y, r, p);
        const arrayOfEncryptedCode = wrap.encrypt(message, (code) => {
          return (BigInt(code) * sharedSecret) % p;
        });
        console.log(`\tEncrypted key: ${chalk.gray(keyEncrypted)}`);
        console.log(`\tEncrypted message: ${chalk.gray(arrayOfEncryptedCode)}`);

        const secret = fastModularExponentiation(keyEncrypted, x, p);
        const inverseSecret = fastModularExponentiation(secret, p - 2n, p);
        const messageDecrypted = wrap.decrypt(
          arrayOfEncryptedCode,
          (codeEncrypted) => {
            return (codeEncrypted * inverseSecret) % p;
          },
        );
        console.log(
          `\n\t${
            ACTORS.ALICE
          } can decrypt the message since she has the random number ${chalk.bold.bgCyan(
            "(x)",
          )}.\n\tDecrypted message: ${chalk.gray(messageDecrypted)}\n\t${
            ACTORS.ALICE
          } verifies the message with ${ACTORS.BOB} privately.`,
        );
        return [keyEncrypted, arrayOfEncryptedCode];
      },
    );

    await inquire.continue(
      `${ACTORS.EVE} is going to decrypt the secret message.`,
      () => {
        console.log(`\tNow ${ACTORS.EVE} has the following stuff:`);
        log.list([
          { name: "g", value: g },
          { name: "r", value: r },
          { name: "p", value: p },
          { name: "y", value: y },
          { name: "secret key", value: keyEncrypted },
          { name: "secret message", value: arrayOfEncryptedCode },
        ]);

        console.log(
          `\n\t${ACTORS.EVE} is going to figure out what the random number x is using Discrete Log with the information she has.`,
        );

        const xEavesdropped = babyStepGiantStep(g, y, p);
        console.log(
          `\tRandom number ${chalk.bold.bgCyan("(x)")}: ${chalk.gray(
            `(${xEavesdropped})`,
          )}`,
        );
        const secret = fastModularExponentiation(
          keyEncrypted,
          xEavesdropped,
          p,
        );
        const inverseSecret = fastModularExponentiation(secret, p - 2n, p);
        const messageEavesdropped = wrap.decrypt(
          arrayOfEncryptedCode,
          (codeEncrypted) => {
            return (codeEncrypted * inverseSecret) % p;
          },
        );
        console.log(
          `\tDecrypted message: ${chalk.gray(messageEavesdropped)}\n\t${
            ACTORS.EVE
          } verifies the message with ${ACTORS.BOB}.`,
        );
      },
    );
  } catch (error) {
    throw error;
  }
}
