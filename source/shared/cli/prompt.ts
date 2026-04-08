import { getInquirer } from "@/shared/cli/inquirer";

export type TPromptOutputFormat = "text" | "json" | "none";
export type TPromptErrorFormat = "throw" | "text" | "json";

export interface IPromptOptions {
  answers?: Record<string, unknown>;
  interactive?: boolean;
  outputFormat?: TPromptOutputFormat;
  errorFormat?: TPromptErrorFormat;
  writer?: (message: string) => void;
}

type TNormalizedPromptOptions = {
  answers: Record<string, unknown>;
  interactive: boolean;
  outputFormat: TPromptOutputFormat;
  errorFormat: TPromptErrorFormat;
  writer: (message: string) => void;
};

type TPromptQuestion = {
  name?: string;
  [key: string]: unknown;
};

export interface IPromptExecution<TResult = unknown> {
  algorithm: string;
  success: boolean;
  result?: TResult;
  error?: string;
  transcript: string[];
}

export interface IPromptContext {
  options: Readonly<TNormalizedPromptOptions>;
  ask<TAnswers extends Record<string, unknown>>(
    questions: TPromptQuestion | TPromptQuestion[],
  ): Promise<TAnswers>;
  writeLine(value: unknown): void;
}

export type TPromptHandler<TResult = unknown> = (
  options?: IPromptOptions,
) => Promise<IPromptExecution<TResult>>;

function serialize(value: unknown) {
  return JSON.stringify(value, (_, currentValue) => {
    if (typeof currentValue === "bigint") {
      return currentValue.toString();
    }

    if (currentValue instanceof Error) {
      return {
        name: currentValue.name,
        message: currentValue.message,
      };
    }

    return currentValue;
  });
}

function normalizeOptions(options: IPromptOptions): TNormalizedPromptOptions {
  return {
    answers: options.answers ?? {},
    interactive: options.interactive ?? true,
    outputFormat: options.outputFormat ?? "text",
    errorFormat: options.errorFormat ?? "throw",
    writer: options.writer ?? ((message) => console.log(message)),
  };
}

export function createAlgorithmPrompt<TResult>(
  algorithm: string,
  execute: (context: IPromptContext) => Promise<TResult> | TResult,
): TPromptHandler<TResult> {
  return async (options: IPromptOptions = {}) => {
    const normalizedOptions = normalizeOptions(options);
    const transcript: string[] = [];

    const writeLine = (value: unknown) => {
      const message = String(value);
      transcript.push(message);

      if (normalizedOptions.outputFormat === "text") {
        normalizedOptions.writer(message);
      }
    };

    const context: IPromptContext = {
      options: normalizedOptions,
      async ask<TAnswers extends Record<string, unknown>>(
        questions: TPromptQuestion | TPromptQuestion[],
      ) {
        const normalizedQuestions = Array.isArray(questions)
          ? questions
          : [questions];
        const presetAnswers = { ...normalizedOptions.answers };
        const pendingQuestions = normalizedQuestions.filter((question) => {
          return question.name && !(question.name in presetAnswers);
        });

        if (pendingQuestions.length === 0) {
          return presetAnswers as TAnswers;
        }

        if (!normalizedOptions.interactive) {
          throw new Error(
            `Missing prompt answers: ${pendingQuestions
              .map((question) => String(question.name))
              .join(", ")}.`,
          );
        }

        const inquirer = await getInquirer();
        const answers = await inquirer.prompt<TAnswers>(pendingQuestions);
        return {
          ...presetAnswers,
          ...answers,
        };
      },
      writeLine,
    };

    try {
      const result = await execute(context);
      const payload: IPromptExecution<TResult> = {
        algorithm,
        success: true,
        result,
        transcript,
      };

      if (normalizedOptions.outputFormat === "json") {
        normalizedOptions.writer(serialize(payload));
      }

      return payload;
    } catch (error) {
      const payload: IPromptExecution<TResult> = {
        algorithm,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        transcript,
      };

      if (normalizedOptions.errorFormat === "json") {
        normalizedOptions.writer(serialize(payload));
        return payload;
      }

      if (normalizedOptions.errorFormat === "text") {
        normalizedOptions.writer(payload.error ?? "Unknown prompt error.");
        return payload;
      }

      throw error;
    }
  };
}