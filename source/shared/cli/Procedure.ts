import chalk from "@/shared/cli/chalk";
import { SYMBOLS } from "@/shared/constants";
import { getInquirer } from "@/shared/cli/inquirer";

interface IProcedureOptions {
  restartable?: boolean;
}

export default class Procedure {
  public run: () => Promise<void>;

  constructor(
    name: string,
    callback: () => Promise<unknown>,
    options: IProcedureOptions = {},
  ) {
    const isRestartable = options.restartable ?? true;

    const runProcedure = async () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      console.log(chalk.bold(`\tProcedure identifier: ${timestamp}`));
      console.time(chalk.bold(`\tTime consumed for ${timestamp}`));
      await callback();
      console.timeEnd(chalk.bold(`\tTime consumed for ${timestamp}`));
    };

    this.run = async function () {
      try {
        console.log(
          chalk.bgCyan.bold(`\n ${SYMBOLS.ARROW_DOWNLOAD_BOTTOM} ${name} `),
        );
        await runProcedure();

        if (isRestartable) {
          while (true) {
            const inquirer = await getInquirer();
            const { _: isRestart } = await inquirer.prompt<{
              _: boolean;
            }>([
              {
                type: "confirm",
                name: "_",
                message: "Do you want to restart this procedure?",
                default: false,
              },
            ]);
            if (isRestart) await runProcedure();
            else break;
          }
        }

        console.log(
          chalk.bgCyan.bold(` ${SYMBOLS.ARROW_DOWNLOAD_TOP} ${name} `),
        );
        console.log(chalk.gray("Going back to the previous menu.\n"));
      } catch (error) {
        throw error;
      }
    };
  }
}