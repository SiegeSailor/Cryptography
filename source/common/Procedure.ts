import chalk from "@/common/chalk";

import { ESymbols } from "@/common/constants";
import { getInquirer } from "@/common/inquirer";

export default class Procedure {
  public run: () => Promise<void>;

  constructor(name: string, callback: () => Promise<void>) {
    const wrap = async () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      console.log(chalk.bold(`\tProcedure identifier: ${timestamp}`));
      console.time(chalk.bold(`\tTime consumed for ${timestamp}`));
      await callback();
      console.timeEnd(chalk.bold(`\tTime consumed for ${timestamp}`));
    };

    this.run = async function () {
      try {
        console.log(
          chalk.bgCyan.bold(`\n ${ESymbols.ArrowDownloadBottom} ${name} `),
        );
        await wrap();

        while (true) {
          const inquirer = await getInquirer();
          const { _: isRestart } = await inquirer.prompt([
            {
              type: "confirm",
              name: "_",
              message: "Do you want to restart this procedure?",
              default: false,
            },
          ]);
          if (isRestart) await wrap();
          else break;
        }
        console.log(
          chalk.bgCyan.bold(` ${ESymbols.ArrowDownloadTop} ${name} `),
        );
        console.log(chalk.gray("Going back to the previous menu.\n"));
      } catch (error) {
        throw error;
      }
    };
  }
}
