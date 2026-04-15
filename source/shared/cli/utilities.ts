import { readdirSync } from "fs";
import { isAbsolute, join } from "path";

import chalk from "@/shared/cli/chalk";
import Procedure from "@/shared/cli/Procedure";
import { getInquirer } from "@/shared/cli/inquirer";
import type { IPromptOptions, TPromptHandler } from "@/shared/cli/prompt";

type TProcedureSelection = number | string;

interface IProcedureOptions {
  promptOptions?: IPromptOptions;
  restartable?: boolean;
  selection?: TProcedureSelection;
}

function resolveProcedureIndex(
  arrayOfFile: string[],
  fileFormatter: (input: string) => string,
  selection?: TProcedureSelection,
) {
  if (selection === undefined) {
    return null;
  }

  if (typeof selection === "number") {
    if (
      !Number.isInteger(selection) ||
      selection < 0 ||
      selection >= arrayOfFile.length
    ) {
      throw new Error(`Unknown procedure selection: ${selection}`);
    }

    return selection;
  }

  const normalizedSelection = selection.trim().toLowerCase();
  const index = arrayOfFile.findIndex((file) => {
    return (
      file.toLowerCase() === normalizedSelection ||
      fileFormatter(file).toLowerCase() === normalizedSelection
    );
  });

  if (index === -1) {
    throw new Error(`Unknown procedure selection: ${selection}`);
  }

  return index;
}

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
  list: (listOfItem: { name: string; value: unknown }[]) => {
    listOfItem.forEach(({ name, value }) => {
      console.log(`\t${name}: ${chalk.gray(value)}`);
    });
  },
};

export const inquire = {
  continue: async <T>(
    title: string,
    callback: () => T,
    promptOptions?: IPromptOptions,
  ): Promise<T> => {
    try {
      log.highlight(title);

      if (promptOptions?.interactive !== false) {
        const inquirer = await getInquirer();
        await inquirer.prompt({
          type: "input",
          name: "_",
          message: "Press Enter to continue.",
        });
      }

      return await callback();
    } catch (error) {
      throw error;
    }
  },
  procedure: async (
    procedurePath: string,
    message: string,
    fileFormatter: (input: string) => string,
    options: IProcedureOptions = {},
  ) => {
    try {
      const targetPath = isAbsolute(procedurePath)
        ? procedurePath
        : join(process.cwd(), procedurePath);
      const arrayOfFile = readdirSync(targetPath);

      let index = resolveProcedureIndex(
        arrayOfFile,
        fileFormatter,
        options.selection,
      );

      if (index === null) {
        const inquirer = await getInquirer();
        const answer = await inquirer.prompt<{
          _: number;
        }>([
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
        index = answer._;
      }

      const name = fileFormatter(arrayOfFile[index]);
      console.log(chalk.gray(name));
      const { prompt }: { prompt: TPromptHandler } = await import(
        join(targetPath, arrayOfFile[index])
      );
      if (!prompt) {
        throw new Error("The file is not ready for interactive commands.");
      }

      const procedure = new Procedure(
        name,
        () => prompt(options.promptOptions),
        { restartable: options.restartable },
      );
      await procedure.run();
    } catch (error) {
      throw error;
    }
  },
};
