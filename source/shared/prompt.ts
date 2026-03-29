import { getInquirer } from "@/shared/inquirer";

export type PromptOutputFormat = "text" | "json" | "none";
export type PromptErrorFormat = "throw" | "text" | "json";

export interface PromptOptions {
  answers?: Record<string, unknown>;
  interactive?: boolean;
  outputFormat?: PromptOutputFormat;
  errorFormat?: PromptErrorFormat;
  writer?: (message: string) => void;
}

type NormalizedPromptOptions = {
  answers: Record<string, unknown>;
  interactive: boolean;
  outputFormat: PromptOutputFormat;
  errorFormat: PromptErrorFormat;
  writer: (message: string) => void;
};

type PromptQuestion = {
  name?: string;
  [key: string]: unknown;
};

export interface PromptExecution<TResult = unknown> {
  algorithm: string;
  success: boolean;
  result?: TResult;
  error?: string;
  transcript: string[];
}

export interface PromptContext {
  options: Readonly<NormalizedPromptOptions>;
  ask<TAnswers extends Record<string, unknown>>(
    questions: PromptQuestion | PromptQuestion[],
  ): Promise<TAnswers>;
  writeLine(value: unknown): void;
}

export type PromptHandler<TResult = unknown> = (
  options?: PromptOptions,
) => Promise<PromptExecution<TResult>>;

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

function normalizeOptions(options: PromptOptions): NormalizedPromptOptions {
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
  execute: (context: PromptContext) => Promise<TResult> | TResult,
): PromptHandler<TResult> {
  return async (options: PromptOptions = {}) => {
    const normalizedOptions = normalizeOptions(options);
    const transcript: string[] = [];

    const writeLine = (value: unknown) => {
      const message = String(value);
      transcript.push(message);

      if (normalizedOptions.outputFormat === "text") {
        normalizedOptions.writer(message);
      }
    };

    const context: PromptContext = {
      options: normalizedOptions,
      async ask<TAnswers extends Record<string, unknown>>(
        questions: PromptQuestion | PromptQuestion[],
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
      const payload: PromptExecution<TResult> = {
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
      const payload: PromptExecution<TResult> = {
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
