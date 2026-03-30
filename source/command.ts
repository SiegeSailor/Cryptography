import chalk from "@/shared/chalk";
import { join } from "path";

import { format, inquire } from "@/shared/utilities";
import { CHOICES } from "@/shared/constants";
import { getInquirer } from "@/shared/inquirer";

async function main(message = "What do you want to do?") {
  try {
    const inquirer = await getInquirer();
    const { _: purpose } = await inquirer.prompt([
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

    switch (purpose) {
      case CHOICES.DEMONSTRATE:
        await inquire.procedure(
          join(__dirname, "key-encryption"),
          "Which cryptograph procedure do you want to demonstrate?",
          format.filename,
        );
        main();
        break;
      case CHOICES.EXECUTE:
        await inquire.procedure(
          join(__dirname, "algorithms"),
          "Which cryptograph algorithm do you want to execute?",
          format.foldername,
        );
        main();
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
    main("Unexpected result. Please restart your flow.");
  }
}

main();
