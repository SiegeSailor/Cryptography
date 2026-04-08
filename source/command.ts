import { join } from "path";

import chalk from "@/shared/cli/chalk";
import { getInquirer } from "@/shared/cli/inquirer";
import type { IPromptOptions } from "@/shared/cli/prompt";
import { format, inquire } from "@/shared/cli/utilities";
import { CHOICES } from "@/shared/constants";

type TCommandPurpose = (typeof CHOICES)[keyof typeof CHOICES];

interface ICommandOptions {
  message?: string;
  procedure?: number | string;
  promptOptions?: IPromptOptions;
  purpose?: TCommandPurpose;
  restartable?: boolean;
}

async function promptPurpose(message: string): Promise<TCommandPurpose> {
  const inquirer = await getInquirer();
  const { _: purpose } = await inquirer.prompt<{
    _: TCommandPurpose;
  }>([
    {
      type: "rawlist",
      name: "_",
      message,
      choices: [
        { name: CHOICES.DEMONSTRATE, value: CHOICES.DEMONSTRATE },
        { name: CHOICES.EXECUTE, value: CHOICES.EXECUTE },
        { name: CHOICES.EXIT, value: CHOICES.EXIT },
      ],
    },
  ]);

  return purpose;
}

function isAutomatedRun(options: ICommandOptions) {
  return (
    options.procedure !== undefined ||
    options.promptOptions !== undefined ||
    options.purpose !== undefined ||
    options.restartable !== undefined
  );
}

export async function runCLI(options: ICommandOptions = {}) {
  const message = options.message ?? "What do you want to do?";
  const isAutomated = isAutomatedRun(options);

  try {
    const purpose = options.purpose ?? (await promptPurpose(message));

    switch (purpose) {
      case CHOICES.DEMONSTRATE:
        await inquire.procedure(
          join(__dirname, "key-encryptions"),
          "Which cryptograph procedure do you want to demonstrate?",
          format.filename,
          {
            promptOptions: options.promptOptions,
            restartable: options.restartable,
            selection: options.procedure,
          },
        );
        if (!isAutomated) {
          await runCLI();
        }
        break;
      case CHOICES.EXECUTE:
        await inquire.procedure(
          join(__dirname, "algorithms"),
          "Which cryptograph algorithm do you want to execute?",
          format.foldername,
          {
            promptOptions: options.promptOptions,
            restartable: options.restartable,
            selection: options.procedure,
          },
        );
        if (!isAutomated) {
          await runCLI();
        }
        break;
      case CHOICES.EXIT:
        console.log(chalk.gray("Successfully terminated the program.\n"));
        break;
      default:
        throw new Error("Something wrong with the prompt flow.");
    }
  } catch (_) {
    const error: Error = _ as Error;
    console.error(`\t${chalk.red(error.message)}`);

    if (isAutomated) {
      throw error;
    }

    await runCLI({ message: "Unexpected result. Please restart your flow." });
  }
}

if (require.main === module) {
  void runCLI();
}
