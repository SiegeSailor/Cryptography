import chalk from "@/shared/chalk";
import { readdirSync } from "fs";
import { isAbsolute, join } from "path";

import millerRabinPrimarilyTest from "@/algorithms/miller-rabin-primarily-test";
import type { PromptHandler } from "@/shared/prompt";
import { randomBigIntBits } from "@/shared/random";
import Procedure from "@/shared/Procedure";
import { getInquirer } from "@/shared/inquirer";

export const math = {
  absolute: (input: bigint) => {
    return input < BigInt(0) ? -input : input;
  },
};

export const format = {
  foldername: (foldername: string) => {
    return foldername
      .split("-")
      .map((word) => {
        return word[0].toUpperCase() + word.slice(1);
      })
      .join(" ");
  },
  filename: (filename: string) => {
    return filename.split(".")[0];
  },
};

export const log = {
  highlight: (input: string) => {
    console.log("\n" + chalk.bold.cyan(input));
  },
  list: (listOfItem: { name: string; value: any }[]) => {
    listOfItem.forEach(({ name, value }) => {
      console.log(`\t${name}: ${chalk.gray(value)}`);
    });
  },
};

export const inquire = {
  continue: async <T>(title: string, callback: () => T): Promise<T> => {
    try {
      log.highlight(title);
      const inquirer = await getInquirer();
      await inquirer.prompt({
        type: "input",
        name: "_",
        message: "Press Enter to continue.",
      });

      return await callback();
    } catch (error) {
      throw error;
    }
  },
  procedure: async (
    procedurePath: string,
    message: string,
    fileFormatter: (input: string) => string,
  ) => {
    try {
      const inquirer = await getInquirer();
      const targetPath = isAbsolute(procedurePath)
        ? procedurePath
        : join(process.cwd(), procedurePath);
      const arrayOfFile = readdirSync(targetPath);
      const { _: index } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "_",
          message,
          choices: arrayOfFile.map((foldername, index) => {
            return {
              name: fileFormatter(foldername),
              value: index,
            };
          }),
          pageSize: Number.MAX_VALUE,
        },
      ]);

      const name = fileFormatter(arrayOfFile[index]);
      console.log(chalk.gray(name));
      const { prompt }: { prompt: PromptHandler } = await import(
        join(targetPath, arrayOfFile[index])
      );
      if (!prompt)
        throw new Error("The file is not ready for interactive commands.");

      const procedure = new Procedure(name, prompt);
      await procedure.run();
    } catch (error) {
      throw error;
    }
  },
};

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
      if (millerRabinPrimarilyTest(candidate, level)) {
        arrayOfPrime.push(candidate);
      }
    }

    return arrayOfPrime;
  },
  remain: (modulo: bigint, remainder: bigint) => {
    if (remainder >= modulo)
      throw new Error(
        "Desired remainder can't be equal to or larger than the given modulo.",
      );

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
