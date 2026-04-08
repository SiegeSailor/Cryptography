import euclidean from "@/algorithms/euclidean";
import extendedEuclidean from "@/algorithms/extended-euclidean";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import pollardP1Factorization from "@/algorithms/pollard-p-1-factorization";
import { wrap } from "@/shared/algorithm/wrap";
import chalk from "@/shared/cli/chalk";
import { inquire, log } from "@/shared/cli/utilities";
import { ACTORS } from "@/shared/constants";

export async function prompt() {
  try {
    console.log("There are three people in this RSA encryption process:");
    console.log(
      `\t${ACTORS.ALICE} - Receiver\n\t${ACTORS.BOB} - Sender\n\t${ACTORS.EVE} - Eavesdropper`,
    );

    const [p, q, n, r] = await inquire.continue(
      `${ACTORS.ALICE} is going to pick prime numbers P and Q, and then generate n with P * Q, r with (P - 1) * (Q - 1):`,
      () => {
        const [p, q] = wrap.randomize(16, 8, 2);

        const n = p * q;
        const r = (p - BigInt(1)) * (q - BigInt(1));
        log.list([
          { name: "P", value: p },
          { name: "Q", value: q },
          { name: "n", value: n },
          { name: "r ((P - 1) * (Q - 1))", value: r },
        ]);

        return [p, q, n, r];
      },
    );

    const [e, d] = await inquire.continue(
      `${ACTORS.ALICE} selects the public exponent e and computes private exponent d from e * d % r = 1:`,
      () => {
        const commonExponents = [65537n, 257n, 17n, 5n, 3n];
        const e = commonExponents.find((value) => euclidean(value, r) === 1n);

        if (!e) {
          throw new Error("Unable to select a valid public exponent e.");
        }

        const [gcd, coefficient] = extendedEuclidean(e, r);
        if (gcd !== 1n) {
          throw new Error("Unable to compute private key exponent d.");
        }

        const d = ((coefficient % r) + r) % r;
        log.list([
          { name: "e", value: e },
          { name: "d", value: d },
        ]);

        return [e, d];
      },
    );

    await inquire.continue(
      `${ACTORS.ALICE} sends e and n as the public key to ${ACTORS.BOB} and ${ACTORS.EVE}.`,
      () => {
        console.log(`\t${ACTORS.ALICE} has the following numbers:`);
        log.list([
          { name: "P", value: p },
          { name: "Q", value: q },
          { name: "n", value: n },
          { name: "r", value: r },
          { name: "e", value: e },
          { name: "d", value: d },
        ]);
      },
    );

    const message = "This is a hardcoded secret message.";
    const arrayOfEncryptedCode = await inquire.continue(
      `${ACTORS.BOB} encrypts the message and sends it back to ${ACTORS.ALICE} (while ${ACTORS.EVE} is eavesdropping).`,
      () => {
        const arrayOfEncryptedCode = wrap.encrypt(message, (code) => {
          return fastModularExponentiation(BigInt(code), e, n);
        });
        console.log(`\tEncrypted message: ${chalk.gray(arrayOfEncryptedCode)}`);

        const messageDecrypted = wrap.decrypt(
          arrayOfEncryptedCode,
          (codeEncrypted) => {
            return fastModularExponentiation(codeEncrypted, d, n);
          },
        );
        console.log(
          `\n\t${
            ACTORS.ALICE
          } can decrypt the message since she has the private key ${chalk.bold.bgCyan(
            "(d, n)",
          )}.\n\tDecrypted message: ${chalk.gray(messageDecrypted)}\n\t${
            ACTORS.ALICE
          } verifies the message with ${ACTORS.BOB} privately.`,
        );

        return arrayOfEncryptedCode;
      },
    );

    await inquire.continue(
      `${ACTORS.EVE} is going to decrypt the secret message.`,
      () => {
        console.log(`\tNow ${ACTORS.EVE} has the following stuff:`);
        log.list([
          { name: "n", value: n },
          { name: "e", value: e },
          { name: "secret message", value: arrayOfEncryptedCode },
        ]);

        console.log(
          `\n\t${
            ACTORS.EVE
          } is going to factor n and derive private key d from the public key ${chalk.bold.bgCyan(
            "(e, n)",
          )} and other information.`,
        );

        const factors = pollardP1Factorization(n);
        if (factors.length < 2) {
          throw new Error("Eve failed to factor n.");
        }
        const primeP = BigInt(factors[0]);
        const primeQ = n / primeP;
        const phi = (primeP - 1n) * (primeQ - 1n);
        const [gcd, coefficient] = extendedEuclidean(e, phi);
        if (gcd !== 1n) {
          throw new Error("Eve failed to derive d from factors.");
        }
        const dEavesdropped = ((coefficient % phi) + phi) % phi;
        console.log(
          `\tPrivate key ${chalk.bold.bgCyan("(d, n)")}: ${chalk.gray(
            `(${dEavesdropped}, ${n})`,
          )}`,
        );
        const messageEavesdropped = wrap.decrypt(
          arrayOfEncryptedCode,
          (codeEncrypted) => {
            return fastModularExponentiation(codeEncrypted, dEavesdropped, n);
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
