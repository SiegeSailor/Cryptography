import chalk from "chalk";

import euclidean from "@/algorithms/euclidean";
import extendedEuclidean from "@/algorithms/extended-euclidean";
import fastModularExponentiation from "@/algorithms/fast-modular-exponentiation";
import pollardP1Factorization from "@/algorithms/pollard-p-1-factorization";
import { EActors } from "@/common/constants";
import { log, inquire, wrap } from "@/common/utilities";

export async function prompt() {
  try {
    console.log("There are three people in this RSA encryption process:");
    console.log(
      `\t${EActors.Alice} - Receiver\n\t${EActors.Bob} - Sender\n\t${EActors.Eve} - Eavesdropper`,
    );

    const [p, q, n, r] = await inquire.continue(
      `${EActors.Alice} is going to pick prime numbers P and Q, and then generate n with P * Q, r with (P - 1) * (Q - 1):`,
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
      `${EActors.Alice} selects the public exponent e and computes private exponent d from e * d % r = 1:`,
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
      `${EActors.Alice} sends e and n as the public key to ${EActors.Bob} and ${EActors.Eve}.`,
      () => {
        console.log(`\t${EActors.Alice} has the following numbers:`);
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
      `${EActors.Bob} encrypts the message and sends it back to ${EActors.Alice} (while ${EActors.Eve} is eavesdropping).`,
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
            EActors.Alice
          } can decrypt the message since she has the private key ${chalk.bold.bgCyan(
            "(d, n)",
          )}.\n\tDecrypted message: ${chalk.gray(messageDecrypted)}\n\t${
            EActors.Alice
          } verifies the message with ${EActors.Bob} privately.`,
        );

        return arrayOfEncryptedCode;
      },
    );

    await inquire.continue(
      `${EActors.Eve} is going to decrypt the secret message.`,
      () => {
        console.log(`\tNow ${EActors.Eve} has the following stuff:`);
        log.list([
          { name: "n", value: n },
          { name: "e", value: e },
          { name: "secret message", value: arrayOfEncryptedCode },
        ]);

        console.log(
          `\n\t${
            EActors.Eve
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
            EActors.Eve
          } verifies the message with ${EActors.Bob}.`,
        );
      },
    );
  } catch (error) {
    throw error;
  }
}
